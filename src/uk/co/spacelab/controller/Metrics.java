package uk.co.spacelab.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;

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
 * Servlet implementation class Metrics
 */
@WebServlet("/Metrics")
public class Metrics extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private final String [] removeKeys = {"depth", "id", "parent_id"};
	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Metrics() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out = response.getWriter();
		// do not remove the below line as it helps keep the unicode characters
		// in the transfer
		response.setContentType("application/json; charset=UTF-8");
		String filter = request.getParameter("filter");
		try (Connection psql = Database.getConnection()) {
			String sql = "SELECT * FROM splab_get_external_metrics()";
			if (null != filter) {
				List<String> knownColumns =
						Arrays.asList("title", "id", "alias",
								"description", "in_groups", "type");

				String [] filters = filter.split(",");
				filter = "";
				boolean hasGroups = false;
				for (String f : filters) {
					if (knownColumns.contains(f.toLowerCase().trim())) {
						if (filter.length() != 0) filter += ',';
						if (f.equals("in_groups")) {
							filter += "to_json(array_agg(metric_groups.id))";
							hasGroups = true;
						} else {
							if (f.equals("type"))
								filter += "datum_type";
							else filter += "metrics." + f.toLowerCase().trim();

						}
					}
				}
				if (hasGroups)
					filter +=
							"          FROM metric_groups "
									+ "          JOIN metric_group_metrics "
									+ "            ON metric_groups.id=metric_group_metrics.metric_group_id "
									+ "     FULL JOIN metrics "
									+ "            ON metrics.id=metric_id ";
				else filter += "     FROM metrics ";
				if (filter.length() == 0) {
					out.println("[]");
					return;
				}
				sql =
						"SELECT to_json(array_agg(x)) AS splab_get_external_metrics "
								+ "  FROM (SELECT " + filter
								+ "         WHERE metrics.alias IS NOT NULL "
								+ "         GROUP BY metrics.id) AS x; ";
			}
			JSONArray result = Database.customQuery(psql, sql);
			psql.close();
			if (result.length() < 1) {
				sendInterfaceError(response, "No metrics found");
				return;
			}
			String data =
					result.getJSONObject(0)
							.getString("splab_get_external_metrics");
			out.print(data);
		} catch (SQLException | ParseException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		if (!paramsJSON.has("wanted_metrics"))
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"wanted metrics missing");
		JSONArray wantedMetrics = null;
		try {
			wantedMetrics = paramsJSON.getJSONArray("wanted_metrics");
		} catch (JSONException e) {
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
		}
		JSONArray wantedFunctions = null;
		try {
			wantedFunctions = paramsJSON.getJSONArray("wanted_functions");
		} catch (JSONException e) {
			// wanted_functions is optional
		}
		JSONObject metrics = new JSONObject();
		Set<String> requiredFunctions = new HashSet<String>();
		Queue<Integer> metricsToFetch = new LinkedList<Integer>();
		try (Connection psql = Database.getConnection()) {
			if (null != wantedFunctions) {
				for (int i = 0; i < wantedFunctions.length(); i++) {

					String functionAlias = wantedFunctions.getString(i);
					JSONArray data =
							Database.selectWhatFromTableWhere(psql,
									Database.TABLE_METRIC_FUNCTIONS, "*",
									"alias=?", functionAlias);
					if (data.length() == 0) {
						sendInterfaceError(response, "Function " + functionAlias
								+ " requested but not known");
						return;
					}
					requiredFunctions.add(functionAlias);
				}
			}
			for (int i = 0; i < wantedMetrics.length(); i++) {

				String metricAlias = wantedMetrics.getString(i);
				JSONArray data =
						Database.selectWhatFromTableWhere(psql,
								Database.TABLE_METRICS, "id", "alias=?",
								metricAlias);
				if (data.length() == 0) continue;
				int id = data.getJSONObject(0).getInt("id");
				metricsToFetch.add(id);
			}
			Set<Integer> fetchedMetrics = new HashSet<Integer>();
			int breakPoint = 1000;
			int counter = 0;
			while (!metricsToFetch.isEmpty() && counter < breakPoint) {
				int id = metricsToFetch.remove();
				if (fetchedMetrics.contains(id)) continue;
				JSONObject o = fetchMetric(psql, id);
				if (null == o) continue;
				fetchedMetrics.add(id);
				if (o.has("metric_description")) {
					// JSONObject md = o.getJSONObject("metric_description");
					JSONObject md =
							buildMetric(o.getJSONObject("metric_description")
									.getJSONArray("data"));
					if (md.has("alias")) {
						JSONObject metric = new JSONObject();
						metric.put("measure", md);
						if (md.has("title"))
							metric.put("title", md.getString("title"));
						metrics.put(md.getString("alias"), metric);
						// System.out.println(md.getString("alias"));
					}
					if (o.has("required_metrics")) {
						JSONArray rm = o.getJSONArray("required_metrics");
						for (int j = 0; j < rm.length(); j++)
							metricsToFetch.add(rm.getInt(j));
					}
				}
				// System.out.println(o);
				if (o.has("required_functions")) {
					JSONArray funcs = o.getJSONArray("required_functions");
					for (int i = 0; i < funcs.length(); i++)
						requiredFunctions.add(funcs.getString(i));
				}
				counter++;

			}
			JSONObject fetchedFunctions = new JSONObject();
			String [] funcs =
					requiredFunctions
							.toArray(new String [requiredFunctions.size()]);
			JSONArray data =
					Database.customQuery(psql,
							"SELECT * FROM splabin_get_metric_functions(?)",
							psql.createArrayOf("text", funcs));
			if (data.length() == 1) {
				String f =
						removeJSONNulls(data.getJSONObject(0)
								.getString("splabin_get_metric_functions"));
				JSONArray dt = new JSONArray(f);
				for (int i = 0; i < dt.length(); i++) {
					JSONObject o = dt.getJSONObject(i);
					if (!o.has("alias")) continue;
					String alias = o.getString("alias");
					o.remove("alias");
					if (o.has("inputs")) {
						JSONArray inputs = o.getJSONArray("inputs");
						for (int j = 0; j < inputs.length(); j++) {
							JSONObject in = inputs.getJSONObject(j);
							if (in.has("function_alias"))
								in.remove("function_alias");
							if (in.has("input_order")) in.remove("input_order");
						}
					}
					fetchedFunctions.put(alias, o);
				}
			}
			JSONObject result = new JSONObject();
			result.put("metrics", metrics);
			result.put("functions", fetchedFunctions);
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			out.print(result);
			psql.close();
		} catch (SQLException | ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/**
	 * Rebuilding the inputs as the db can not reliably give us hierarchical
	 * json
	 * 
	 * @param metricDescription
	 * @return
	 */
	JSONObject buildMetric(JSONArray metricDescription) {
		Map<Integer, JSONObject> through = new HashMap<Integer, JSONObject>();
		// metric is sorted by depth
		JSONObject metric = metricDescription.getJSONObject(0);
		through.put(metric.getInt("id"), metric);
		for (int i = 1; i < metricDescription.length(); i++) {
			JSONObject in = metricDescription.getJSONObject(i);
			int id = in.getInt("id");
			int parentID = in.getInt("parent_id");
			JSONObject parent = through.get(parentID);
			if (!parent.has("inputs")) parent.put("inputs", new JSONArray());
			parent.getJSONArray("inputs").put(in);
			through.put(id, in);
		}
		for (Integer id : through.keySet()) {
			JSONObject o = through.get(id);
			for (String key : removeKeys)
				if (o.has(key)) o.remove(key);
		}
		return metric;
	}
	JSONObject fetchMetric(Connection psql, int id)
			throws SQLException, ParseException {
		JSONArray data =
				Database.customQuery(psql,
						"SELECT * FROM splabin_get_metric(?)", id);
		if (data.length() == 0) return null;
		String metricData =
				data.getJSONObject(0).getString("splabin_get_metric");
		// System.out.println(metricData);

		metricData = removeJSONNulls(metricData);

		return new JSONObject(metricData);
	}
	String removeJSONNulls(String in) {

		in = in.replaceAll("\"(?:(?!\").)*\":(null|\\[\\]),", "");

		// removes null valued properties following a comma i.e.
		in = in.replaceAll(",\"(?:(?!\").)*\":(null|\\[\\])", "");
		// System.out.println(metricData);
		return in;
	}
}
