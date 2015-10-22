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
	private static final String GET_METRIC_GROUP_SQL =
			"SELECT * FROM metric_group_metrics WHERE metric_group_id=?";
	private static final String GET_ROWS_IN_GROUP_WITH_ORDER_SQL =
			"SELECT * FROM metric_group_metrics WHERE metric_group_id=? "
					+ "AND metric_order=?";
	private static final String SWITCH_TO_FROM_ORDER_IN_METRIC_GROUP_SQL =
			"UPDATE metric_group_metrics SET metric_order=? "
					+ "WHERE metric_order=? AND metric_group_id=?";

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
		try (Connection psql = Database.getConnection()) {
			order1 = paramsJSON.getInt("order_1");
			order2 = paramsJSON.getInt("order_2");
			metricGroup = paramsJSON.getString("metric_group");
			psql.setAutoCommit(false);
			JSONArray result =
					Database.customQuery(psql, GET_METRIC_GROUP_SQL,
							metricGroup);
			if (order1 < 0 || order2 < 0 || order1 > result.length()
					|| order2 > result.length()) {
				sendInterfaceError(response, "Order out of range");
				return;
			}
			// check if metric with these orders exist
			result =
					Database.customQuery(psql, GET_ROWS_IN_GROUP_WITH_ORDER_SQL,
							metricGroup, order2);
			if (result.length() == 0) {
				sendInterfaceError(response, "No such switch!");
				return;
			}
			result =
					Database.customQuery(psql, GET_ROWS_IN_GROUP_WITH_ORDER_SQL,
							metricGroup, order1);
			if (result.length() == 0) {
				sendInterfaceError(response, "No such switch!");
				return;
			}
			// switch the order of the second one first to -1 so that we can
			// find it later. Otherwise the second query will return 2 rows
			Database.customQueryNoResult(psql,
					SWITCH_TO_FROM_ORDER_IN_METRIC_GROUP_SQL, -1, order2,
					metricGroup);
			Database.customQueryNoResult(psql,
					SWITCH_TO_FROM_ORDER_IN_METRIC_GROUP_SQL, order2, order1,
					metricGroup);
			Database.customQueryNoResult(psql,
					SWITCH_TO_FROM_ORDER_IN_METRIC_GROUP_SQL, order1, -1,
					metricGroup);
			psql.commit();
			psql.close();
		} catch (JSONException | SQLException | ParseException e) {
			sendInterfaceError(response, "Error! " + e.getLocalizedMessage());
			return;
		}
	}

}
