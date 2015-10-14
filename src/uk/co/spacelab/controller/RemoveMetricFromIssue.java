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
		try {
			id = paramsJSON.getInt("metric_id");
			group = paramsJSON.getString("metric_group");
		} catch (JSONException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);
			String sql =
					"SELECT metric_order FROM metric_group_metrics WHERE metric_id = ? AND metric_group_id =?;";
			JSONArray result = Database.customQuery(psql, sql, id, group);

			Integer order = 0;
			if (result.length() == 0) {
				sendInterfaceError(response, "Metric not found");
				return;
			}
			order = result.getJSONObject(0).getInt("metric_order");
			sql =
					"DELETE FROM metric_group_metrics WHERE metric_id = ? AND metric_group_id = ?;";
			Database.customQueryNoResult(psql, sql, id, group);

			sql =
					"UPDATE metric_group_metrics SET metric_order=(metric_order-1) WHERE metric_order=?";
			Database.customQueryNoResult(psql, sql, order);
			psql.commit();
			psql.close();
		} catch (SQLException | ParseException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}
	}

}
