package uk.co.spacelab.backend.metrics;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
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
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;

/**
 * Servlet implementation class Metrics
 */
@WebServlet("/Metrics")
public class Metrics extends HttpServlet {
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
		response.getWriter().append("ohai!");
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
		JSONArray wantedMetrics = paramsJSON.getJSONArray("wanted_metrics");
		JSONObject metrics = new JSONObject();
		Set<String> requiredFunctions = new HashSet<String>();
		Queue<Integer> metricsToFetch = new LinkedList<Integer>();
		try (Connection psql = Database.getConnection()) {

			for (int i = 0; i < wantedMetrics.length(); i++) {

				String metricAlias = wantedMetrics.getString(i);
				JSONArray data = Database.selectWhatFromTableWhere(psql,
						Database.TABLE_METRICS, "id", "alias=?", metricAlias);
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
				// sample string :
				// {"required_metrics":null,"metric_description":{"parent_id":null,"id":575,"alias":"project\"_name","value":null,"type":null,"description":null,"name":null,"units":null,"units_full":null,"no_of_decimals":null,"value_type":null,"depth":0,"inputs":[
				// ]}}

				// Matcher m =
				// Pattern.compile("(\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\"):null(\\s*?),").matcher(metricData);
				// while (m.find()) {
				// System.err.println(m.group());
				// }
				// System.out.println(metricData.replaceAll("(\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\"):null(\\s*?),",""));
				// System.out.println(metricData.replaceAll(",(\\s*?)(\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\"):null",""));
				// System.out.println(metricData.replaceAll("\"(.*?)\":null,",""));
				counter++;
				// break;
			}
			JSONObject fetchedFunctions = new JSONObject();
			String [] funcs = requiredFunctions
					.toArray(new String [requiredFunctions.size()]);
			JSONArray data = Database.customQuery(psql,
					"SELECT * FROM splabin_get_metric_functions(?)",
					psql.createArrayOf("text", funcs));
			if (data.length() == 1) {
				String f = removeJSONNulls(data.getJSONObject(0)
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
			 * Rebuilding the inputs as the db can not reliably give us
			 * hierarchical json
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
		// // removes unnecessary key-values (created by the database in
		// // the process of extracting)
		// for (String key : removeKeys) {
		// // followed by comma
		// metricData = metricData.replaceAll("\"" + key + "\":([^\\}]*?),",
		// "");
		// // following comma and followed by object closure
		// metricData = metricData.replaceAll(",\"" + key + "\":(.*?)(\\})",
		// "}");
		// // followed by object closure
		// metricData = metricData.replaceAll("\"" + key + "\":(.*?)(\\})",
		// "}");
		// // System.out.println(metricData);
		// }
	}
			JSONObject fetchMetric(Connection psql, int id)
					throws SQLException, ParseException {
		JSONArray data = Database.customQuery(psql,
				"SELECT * FROM splabin_get_metric(?)", id);
		if (data.length() == 0) return null;
		String metricData =
				data.getJSONObject(0).getString("splabin_get_metric");
		// System.out.println(metricData);

		metricData = removeJSONNulls(metricData);

		return new JSONObject(metricData);
	}
			String removeJSONNulls(String in) {

		// removes null valued properties followed with a comma i.e.
		// "parent_id":null,
		// complex version: (catches escaped quotes in keys)
		// metricData =
		// metricData.replaceAll("(\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\"):(null|\\[\\])(\\s*?),",
		// "");
		// simple version:
		// metricData =
		// metricData.replaceAll("\"(?:(?!\").)*\"(\\s*?):(\\s*?)(null|\\[(\\s*?)\\])(\\s*?),",
		// "");
		// paranoid version (escaped quotes and spaces)
		// metricData =
		// metricData.replaceAll("(\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\")(\\s*?):(\\s*?)(null|\\[(\\s*?)\\])(\\s*?),",
		// "");
		// simple version:
		in = in.replaceAll("\"(?:(?!\").)*\":(null|\\[\\]),", "");

		// removes null valued properties following a comma i.e.
		in = in.replaceAll(",\"(?:(?!\").)*\":(null|\\[\\])", "");
		// System.out.println(metricData);
		return in;
	}
}
