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
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.SplabHttpServlet;

/**
 * DO NOT REALEASE WITH THIS CLASS ACTIVE IT HAS NO PROPER DATA VALIDATION
 * 
 * This class is meant to be the mediator for storing metrics to the database.
 * It requires the metric validation system to be ported to Java (from the
 * Javasript client in study.js) to properly validate the feasibility of storing
 * the metric
 */
@WebServlet("/StoreMetric")
public class StoreMetric extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Subject subject = SecurityUtils.getSubject();
		if (!subject.hasRole("admin")) {
			sendInterfaceError(response, "Not authorised");
			return;
		}
		// do not remove the below line as it helps keep the unicode characters
		// in the transfer
		response.setContentType("application/json; charset=UTF-8");
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		// if (paramsJSON == null || paramsJSON.length() == 0
		// || !paramsJSON.has("spaces")) {
		// response.sendError(HttpServletResponse.SC_BAD_REQUEST,
		// "no data received -_-");
		// return;
		// }
		// System.out.println(paramsJSON);
		JSONObject metric = paramsJSON.getJSONObject("metric");
		Integer metricID = null;

		if (metric.has("id")) metricID = metric.getInt("id");

		// if the metricID is not null then we are editing an existing metric.
		// Currently we only allow editing the following properties for the
		// metrics
		Map<String, String> knownProperties = new HashMap<String, String>();
		knownProperties.put("title", "text");
		knownProperties.put("description", "text");
		knownProperties.put("units", "text");
		knownProperties.put("units_full", "text");
		knownProperties.put("no_of_decimals", "integer");
		if (null == metricID) {
			knownProperties.put("ilk", "text");
			knownProperties.put("datum_type", "text");
			knownProperties.put("datum", "text");
			knownProperties.put("alias", "text");

			String alias = (String) metric.keys().next();
			metric = metric.getJSONObject(alias);
			String name = null;
			if (metric.has("title")) name = metric.getString("title");
			metric = metric.getJSONObject("measure");
			metric.put("alias", alias);
			if (null != name) metric.put("title", name);
		}
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);
			if (null == metricID)
				fetchMetric(psql, knownProperties, metric, 0);
			else {
				// TODO: DO NOT DELETE (SEE ABOVE TODO)
				updateMetric(psql, knownProperties, metric, metricID);
				response.getWriter().println(metric);
			}

			psql.commit();
			psql.close();
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			e.printStackTrace();
			sendInterfaceError(response, e.getLocalizedMessage());
			return;
			// System.err.println(e.getLocalizedMessage());
		}

	}
	void updateMetric(Connection psql, Map<String, String> knownProperties,
			JSONObject metric, Integer metricID) throws ClassNotFoundException,
					SQLException, ParseException {
		String sql = "";
		int counter = 0;
		List<Object> args = new ArrayList<Object>();
		for (String k : knownProperties.keySet()) {
			if (!metric.has(k)) continue;
			if (counter != 0) {
				sql += ",";
			}
			sql += k + "=?::" + knownProperties.get(k);
			args.add(metric.get(k));
			counter++;
		}
		args.add(metricID);
		Database.update(psql, "metrics", sql, "id=?", args.toArray());
	}
	int fetchMetric(Connection psql, Map<String, String> knownProperties,
			JSONObject metric, int depth) throws ClassNotFoundException,
					SQLException, ParseException {
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
		Database.insertInto(psql, Database.TABLE_METRICS, columnString,
				valueString, args.toArray());
		int id =
				Database.getSequenceCurrVal(psql, Database.SEQUENCE_METRICS)
						.getJSONObject(0).getInt("currval");
		if (metric.has("inputs")) {
			JSONArray inputs = metric.getJSONArray("inputs");
			for (int i = 0; i < inputs.length(); i++) {
				JSONObject newMetric = inputs.getJSONObject(i);
				int inputID =
						fetchMetric(psql, knownProperties, newMetric, depth);
				if (inputID == -1) return -1;
				columnString = "metric_id,input_metric_id,input_order";
				valueString = "?,?,?";
				Database.insertInto(psql, Database.TABLE_METRICS_INPUTS,
						columnString, valueString,
						new Object [] {id, inputID, i});
			}
		}
		return id;
	}
}
