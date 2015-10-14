package uk.co.spacelab.controller;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.SplabHttpServlet;

/**
 * Servlet implementation class SwitchIssueMetricOrder
 */
@WebServlet("/SwitchIssueMetricOrder")
public class SwitchIssueMetricOrder extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SwitchIssueMetricOrder() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Oi! -.-");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		if (!paramsJSON.has("order_1")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"order 1 missing");
			return;
		}
		if (!paramsJSON.has("order_2")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"order 2 missing");
			return;
		}
		if (!paramsJSON.has("metric_group")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"metric group missing");
			return;
		}
		Integer order1 = null;
		Integer order2 = null;
		String metricGroup = null;
		try {
			order1 = paramsJSON.getInt("order_1");
			order2 = paramsJSON.getInt("order_2");
			metricGroup = paramsJSON.getString("metric_group");
		} catch (JSONException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);
			JSONArray result =
					Database.customQuery(psql,
							"SELECT * FROM metric_group_metrics "
									+ "WHERE metric_group_id=?",
							metricGroup);
			if (order1 < 0 || order2 < 0 || order1 > result.length()
					|| order2 > result.length()) {
				sendInterfaceError(response, "Order out of range");
				return;
			}

			result =
					Database.customQuery(psql,
							"SELECT * FROM metric_group_metrics "
									+ "WHERE metric_group_id=? "
									+ "AND metric_order=?",
							metricGroup, order2);
			if (result.length() == 0) {
				sendInterfaceError(response, "No such switch!");
				return;
			}
			result =
					Database.customQuery(psql,
							"SELECT * FROM metric_group_metrics "
									+ "WHERE metric_group_id=? "
									+ "AND metric_order=?",
							metricGroup, order1);
			if (result.length() == 0) {
				sendInterfaceError(response, "No such switch!");
				return;
			}
			Database.customQueryNoResult(psql,
					"UPDATE metric_group_metrics SET metric_order=? "
							+ "WHERE metric_group_id=? AND metric_order=?",
					-1, metricGroup, order2);
			Database.customQueryNoResult(psql,
					"UPDATE metric_group_metrics SET metric_order=? "
							+ "WHERE metric_group_id=? AND metric_order=?",
					order2, metricGroup, order1);
			Database.customQueryNoResult(psql,
					"UPDATE metric_group_metrics SET metric_order=? "
							+ "WHERE metric_group_id=? AND metric_order=?",
					order1, metricGroup, -1);
			psql.commit();
			psql.close();
		} catch (SQLException | ParseException e) {
			sendInterfaceError(response, "Error! " + e.getLocalizedMessage());
			return;
		}
	}

}
