package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
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
@WebServlet("/SpacesValid")
public class SpacesValid extends HttpServlet {
	private static final long serialVersionUID = 1L;

	public SpacesValid() {
		super();
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		if (paramsJSON == null || paramsJSON.length() == 0
				|| !paramsJSON.has("spaces") || !paramsJSON.has("studyid")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no data received -_-");
			return;
		}
		response.setContentType("application/json; charset=UTF-8");
		final PrintWriter out = response.getWriter();
		JSONArray result = new JSONArray();
		// System.out.print("{'valid':["b);
		try {
			JSONArray spaces = paramsJSON.getJSONArray("spaces");
			int studyid = paramsJSON.getInt("studyid");
			int counter = 0;
			for (int i = 0; i < spaces.length(); i++) {
				String alias = spaces.getJSONObject(i).getString("alias");
				JSONArray dbresult =
						Database.selectAllFromTableWhere("spaces",
								"study_id = ? AND LOWER(alias) = LOWER(?)",
								String.valueOf(studyid), alias);

				if (dbresult.length() == 1) {
					if (counter != 0) out.println(",");
					result.put(alias);
					counter++;
				}
			}
		} catch (JSONException | ArrayIndexOutOfBoundsException | SQLException
				| ParseException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"ohai.. malformed data...");
		}
		out.println(result);
	}

}
