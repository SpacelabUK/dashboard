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
@WebServlet("/StoreFunction")
public class StoreFunction extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreFunction() {
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
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		// if (paramsJSON == null || paramsJSON.length() == 0
		// || !paramsJSON.has("spaces")) {
		// response.sendError(HttpServletResponse.SC_BAD_REQUEST,
		// "no data received -_-");
		// return;
		// }
		// System.out.println(paramsJSON);
		JSONObject func = paramsJSON.getJSONObject("func");
		String alias = (String) func.keys().next();
		Map<String, String> knownProperties = new HashMap<String, String>();
		knownProperties.put("ilk", "text");
		knownProperties.put("datum_type", "text");
		knownProperties.put("title", "text");
		knownProperties.put("alias", "text");
		knownProperties.put("description", "text");
		knownProperties.put("units", "text");
		knownProperties.put("units_full", "text");
		knownProperties.put("key_data", "text");
		knownProperties.put("key_data_match", "text");
		knownProperties.put("property_data", "text");
		knownProperties.put("property_data_match", "text");
		knownProperties.put("units_full", "text");

		func = func.getJSONObject(alias);
		String name = null;
		if (func.has("title")) name = func.getString("title");
		func.put("alias", alias);
		if (null != name) func.put("title", name);
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);

			String columnString = "";
			String valueString = "";
			List<Object> args = new ArrayList<Object>();
			int counter = 0;
			for (String k : knownProperties.keySet()) {
				if (!func.has(k)) continue;
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
				args.add(func.get(k));
				// System.out.println(deepSpace + k + " " + args.get(args.size()
				// -
				// 1));
				counter++;
			}
			Database.insertInto(psql, Database.TABLE_METRIC_FUNCTIONS,
					columnString, valueString, args.toArray());
			if (func.has("inputs")) {
				JSONArray inputs = func.getJSONArray("inputs");
				for (int i = 0; i < inputs.length(); i++) {
					JSONObject newMetric = inputs.getJSONObject(i);
					columnString = "function_alias,alias,proc,input_order";
					valueString = "?,?,?::boolean,?";
					Database.insertInto(psql,
							Database.TABLE_METRIC_FUNCTIONS_INPUTS,
							columnString, valueString,
							new Object [] {alias, newMetric.getString("alias"),
									newMetric.getBoolean("proc"), i});
				}
			}

			psql.commit();
			psql.close();
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			// e.printStackTrace();
			System.err.println(e.getLocalizedMessage());
		}

	}
}
