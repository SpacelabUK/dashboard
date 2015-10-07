package uk.co.spacelab.controller;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;

/**
 * Servlet implementation class StoreMetric
 */
@WebServlet("/StoreIssue")
public class StoreIssue extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreIssue() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		System.out.println(paramsJSON);
		JSONObject issue = paramsJSON.getJSONObject("issue");
		if (!issue.has("id")) response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Issue ID is required");
		String id = issue.getString("id");
		Map<String, String> knownProperties = new HashMap<String, String>();
		knownProperties.put("id", "text");
		knownProperties.put("title", "text");
		Connection psql = null;
		try {
			String columnString = "";
			String valueString = "";
			List<Object> args = new ArrayList<Object>();
			int counter = 0;
			for (String k : knownProperties.keySet()) {
				if (!issue.has(k)) continue;
				if (counter != 0) {
					columnString += ",";
					valueString += ",";
				}
				columnString += k;
				valueString += "?";
				args.add(issue.get(k));
				counter++;
			}
			if (args.size() < 1) {
				System.out.println("Metric known properties not found");
				return;
			}
			System.out.println(columnString);
			System.out.println(valueString);
			psql = Database.getConnection();
			psql.setAutoCommit(false);
			Database.insertInto(psql, Database.TABLE_METRIC_GROUPS, columnString, valueString, args.toArray());

			if (issue.has("metrics")) {
				JSONArray metrics = issue.getJSONArray("metrics");
				for (int i = 0; i < metrics.length(); i++) {
					String metricAlias = metrics.getString(i);
					System.out.println(metricAlias);
					JSONArray data = Database.selectWhatFromTableWhere(psql, Database.TABLE_METRICS, "id", "alias=?",
							metricAlias);
					if (data.length() != 1) {
						System.out.println("Metric " + metricAlias + " does not exist in the database");
						continue;
					}
					int metricID = data.getJSONObject(0).getInt("id");
					columnString = "metric_group_id,metric_id,metric_order";
					valueString = "?,?,?";
					Database.insertInto(psql, Database.TABLE_METRIC_GROUP_METRICS, columnString, valueString,
							id, metricID, i);
				}
			}
			psql.commit();
			psql.close();
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			e.printStackTrace();
			try {
				if (null != psql && !psql.isClosed()) psql.close();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			return;
		}
	}
}
