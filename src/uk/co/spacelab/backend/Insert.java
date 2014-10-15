package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet implementation class Insert
 */
@WebServlet("/Insert")
public class Insert extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Insert() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Map<String, String []> params = request.getParameterMap();
		if (params == null || !params.containsKey("t")
				|| params.get("t") == null && params.get("t").length != 1) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"type undefined");
			return;
		}
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		if (paramsJSON == null || paramsJSON.length() == 0) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no data received");
			return;
		}
		String type = params.get("t")[0];
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		try {
			if (type.equals("device")) {
				out.println(postForTable(request, response, "devices",
						paramsJSON));
			} else if (type.equals("project")) {
				out.println(postForTable(request, response, "projects",
						paramsJSON));
			} else if (type.equals("study")) {
				out.println(postForTable(request, response, "studies",
						paramsJSON));
			} else if (type.equals("studypart")) {
				out.println(postForTable(request, response, "observations",
						paramsJSON));
			} else if (type.equals("spatial_function")) {
				out.println(postForTable(request, response,
						"spatial_functions", paramsJSON));
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"unknown request");
			}
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			out.println("[{result:fail-JBM}]");
		} catch (SQLException e) {
			e.printStackTrace();
			out.println("[{result:fail-SQLException}]");
		} catch (ParseException e) {
			e.printStackTrace();
			out.println("[{result:fail-ParseException}]");
		}

	}
	private JSONArray postForTable(HttpServletRequest request,
			HttpServletResponse response, String table, JSONObject params)
			throws IOException, ClassNotFoundException, SQLException,
			ParseException {

		String columnString = "";
		Set<String> keys = params.keySet();
		String [] values = new String [keys.size()];
		int counter = 0;
		for (Object o : keys) {
			String key = (String) o;
			columnString += (counter == 0 ? "" : ",") + key;
			values[counter] = params.getString(key);
			counter++;
		}
		System.out.println(Database.insertInto(table, columnString, values));
		return new JSONArray("[{result:success}]");
	}
}
