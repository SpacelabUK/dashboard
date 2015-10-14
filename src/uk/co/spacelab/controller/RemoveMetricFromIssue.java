package uk.co.spacelab.controller;

import java.io.IOException;
import java.io.PrintWriter;
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
 * Servlet implementation class RemoveMetricFromIssue
 */
@WebServlet("/RemoveMetricFromIssue")
public class RemoveMetricFromIssue extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String GET_METRIC_GROUP_ORDER_SQL =
			"SELECT metric_order FROM metric_group_metrics WHERE metric_id = ? AND metric_group_id =?;";
	private static final String DELETE_METRIC_FROM_GROUP_SQL =
			"DELETE FROM metric_group_metrics WHERE metric_id = ? AND metric_group_id = ?;";
	private static final String UPDATE_METRICS_WITH_HIGHER_ORDER_SQL =
			"UPDATE metric_group_metrics SET metric_order=(metric_order-1) WHERE metric_order>?";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public RemoveMetricFromIssue() {
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
		response.getWriter().append("Oi! -.-'");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		if (!paramsJSON.has("metric_id")) {
			sendInterfaceError(response, "metric id missing");
			return;
		}
		if (!paramsJSON.has("metric_group")) {
			sendInterfaceError(response, "issue missing");
			return;
		}
		Integer id = null;
		String group = null;
		try (Connection psql = Database.getConnection()) {
			id = paramsJSON.getInt("metric_id");
			group = paramsJSON.getString("metric_group");
			psql.setAutoCommit(false);
			JSONArray result =
					Database.customQuery(psql, GET_METRIC_GROUP_ORDER_SQL, id,
							group);

			Integer order = 0;
			if (result.length() == 0) {
				sendInterfaceError(response, "Metric not found");
				return;
			}
			order = result.getJSONObject(0).getInt("metric_order");
			Database.customQueryNoResult(psql, DELETE_METRIC_FROM_GROUP_SQL, id,
					group);
			Database.customQueryNoResult(psql,
					UPDATE_METRICS_WITH_HIGHER_ORDER_SQL, order);
			psql.commit();
			psql.close();
		} catch (JSONException | SQLException | ParseException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}
	}

}
