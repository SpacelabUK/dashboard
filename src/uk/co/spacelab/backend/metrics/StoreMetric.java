package uk.co.spacelab.backend.metrics;

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
@WebServlet("/StoreMetric")
public class StoreMetric extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreMetric() {
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
		// if (paramsJSON == null || paramsJSON.length() == 0
		// || !paramsJSON.has("spaces")) {
		// response.sendError(HttpServletResponse.SC_BAD_REQUEST,
		// "no data received -_-");
		// return;
		// }
		// System.out.println(paramsJSON);
		JSONObject metric = paramsJSON.getJSONObject("metric");
		String alias = (String) metric.keys().next();
		Map<String, String> knownProperties = new HashMap<String, String>();
		knownProperties.put("ilk", "text");
		knownProperties.put("datum_type", "text");
		knownProperties.put("datum", "text");
		knownProperties.put("title", "text");
		knownProperties.put("alias", "text");
		knownProperties.put("description", "text");
		knownProperties.put("units", "text");
		knownProperties.put("units_full", "text");
		knownProperties.put("no_of_decimals", "integer");

		metric = metric.getJSONObject(alias);
		String name = null;
		if (metric.has("title")) name = metric.getString("title");
		metric = metric.getJSONObject("measure");
		metric.put("alias", alias);
		if (null != name) metric.put("title", name);
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);
			int result = fetchMetric(psql, knownProperties, metric, 0);
			psql.commit();
			psql.close();
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			// e.printStackTrace();
			System.err.println(e.getLocalizedMessage());
		}

	}
			int fetchMetric(Connection psql, Map<String, String> knownProperties, JSONObject metric, int depth)
					throws ClassNotFoundException, SQLException, ParseException {
		depth++;
		if (depth > 100) return -1;
		String deepSpace = "";
		for (int i = 0; i < depth; i++) {
			deepSpace += " ";
		}

		String columnString = "";
		String valueString = "";
		List<Object> args = new ArrayList<Object>();
		int counter = 0;
		for (String k : knownProperties.keySet()) {
			if (!metric.has(k)) continue;
			if (counter != 0) {
				columnString += ",";
				valueString += ",";
			}
			columnString += k;
			valueString += "?";
			// if (knownProperties.get(k) == "text")
			// args.add(metric.getString(k));
			// else if (knownProperties.get(k) == "integer")
			// args.add(metric.getInt(k));
			// else
			args.add(metric.get(k));
			// System.out.println(deepSpace + k + " " + args.get(args.size() -
			// 1));
			counter++;
		}
		Database.insertInto(psql, Database.TABLE_METRICS, columnString, valueString, args.toArray());
		int id = Database.getSequenceCurrVal(psql, Database.SEQUENCE_METRICS).getJSONObject(0).getInt("currval");
		if (metric.has("inputs")) {
			JSONArray inputs = metric.getJSONArray("inputs");
			for (int i = 0; i < inputs.length(); i++) {
				JSONObject newMetric = inputs.getJSONObject(i);
				int inputID = fetchMetric(psql, knownProperties, newMetric, depth);
				if (inputID == -1) return -1;
				columnString = "metric_id,input_metric_id,input_order";
				valueString = "?,?,?";
				Database.insertInto(psql, Database.TABLE_METRICS_INPUTS, columnString, valueString,
						new Object [] {id, inputID, i});
			}
		}
		return id;
	}
}
