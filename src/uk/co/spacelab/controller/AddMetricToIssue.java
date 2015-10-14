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
 * Servlet implementation class AddMetricToIssue
 */
@WebServlet("/AddMetricToIssue")
public class AddMetricToIssue extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String GET_MAX_METRIC_GROUP_ORDER_SQL =
			"SELECT max(metric_order) AS max_metric_order FROM metric_group_metrics WHERE metric_group_id=?";
	private static final String INSERT_METRIC_TO_GROUP_SQL =
			"INSERT INTO metric_group_metrics (metric_id,metric_group_id,metric_order) VALUES (?,?,?)";
	private static final String GET_INSERTED_METRIC_DETAILS_SQL =
			"SELECT id,alias,title,units,description FROM metrics WHERE id=?";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public AddMetricToIssue() {
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
		response.setContentType("application/json; charset=UTF-8");
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
		PrintWriter out = response.getWriter();
		try (Connection psql = Database.getConnection()) {
			id = paramsJSON.getInt("metric_id");
			group = paramsJSON.getString("metric_group");
			psql.setAutoCommit(false);
			JSONArray result =
					Database.customQuery(psql, GET_MAX_METRIC_GROUP_ORDER_SQL,
							group);

			Integer order = 0;
			if (result.length() > 0)
				order = result.getJSONObject(0).getInt("max_metric_order") + 1;
			Database.customQueryNoResult(psql, INSERT_METRIC_TO_GROUP_SQL, id,
					group, order);
			result =
					Database.customQuery(psql, GET_INSERTED_METRIC_DETAILS_SQL,
							id);
			result.getJSONObject(0).put("metric_order", order);

			psql.commit();
			psql.close();

			// print after successful database commit
			out.println(result.getJSONObject(0));
		} catch (JSONException | SQLException | ParseException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}

	}

}
