	package uk.co.spacelab.backend;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class StorePolygons
 */
@WebServlet("/StorePolygons")
public class StorePolygons extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StorePolygons() {
		super();
		// TODO Auto-generated constructor stub
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// System.out.println(request.getContentLength());
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		if (paramsJSON == null || paramsJSON.length() == 0
				|| !paramsJSON.has("spaces")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no data received -_-");
			return;
		}
		Map<String, Integer> typeIDMap = new HashMap<String, Integer>();
		try {
			JSONArray spaces = paramsJSON.getJSONArray("spaces");
			String studyid = paramsJSON.getString("studyid");
			for (int i = 0; i < spaces.length(); i++) {

				JSONObject space = spaces.getJSONObject(i);
				String [] nameType = space.getString("name").split("-");
				String alias = nameType[0];

				JSONArray result =
						Database.selectAllFromTableWhere("spaces",
								"study_id = ? AND LOWER(alias) = LOWER(?)",
								studyid, alias);

				if (result.length() != 1)
					throw new JSONException("no such space (" + alias
							+ ") found");
				int spaceID = result.getJSONObject(0).getInt("id");
				String functeam = nameType[1];
				if (functeam.equalsIgnoreCase("team")) continue;
				// String buildingSpace = alias.split
				JSONObject types = space.getJSONObject("f");
				Set<String> typeNames = types.keySet();
				for (String type : typeNames) {
					System.out.println(type);
					Integer typeID;
					if (typeIDMap.containsKey(type)) {
						typeID = typeIDMap.get(type);
					} else {
						result =
								Database.selectAllFromTableWhere(
										"spatial_functions",
										"LOWER(alias) = LOWER(?)", type);

						if (result.length() != 1)
							throw new JSONException("no such type (" + type
									+ ") found");
						typeID = result.getJSONObject(0).getInt("id");
					}
					System.out.println(functeam + " " + type + " " + typeID);
					String sql =
							"INSERT INTO polygons (polygon,space_id,functeam,type_id) VALUES ("
							// ST_GeomFromText('POLYGON((-71.1776585052917
							// 42.3902909739571,-71.1776820268866
							// 42.3903701743239,
							// -71.1776063012595
							// 42.3903825660754,-71.1775826583081
							// 42.3903033653531,-71.1776585052917
							// 42.3902909739571))');
									+ spaceID + functeam + typeID + ");";
					sql =
							"INSERT INTO polygons "
									+ "(polygon,space_id,functeam,type_id)"
									+ " VALUES (" + "ST_GeomFromText(?),?,?,?"
									+ ");";
					JSONArray polys =
							types.getJSONObject(type).getJSONArray("polys");
					for (int k = 0; k < polys.length(); k++) {
						JSONArray points = polys.getJSONArray(k);
						String polyString = "POLYGON((";
						for (int n = 0; n < points.length(); n++) {
							JSONObject coords = points.getJSONObject(n);
							double x = coords.getDouble("x");
							double y = coords.getDouble("y");
							if (n != 0) polyString += ",";
							polyString += x + " " + y;
						}
						polyString += "))";
						System.out.println(polyString);
					}
				}
				// System.out.println(spaceID);
			}
		} catch (JSONException | ArrayIndexOutOfBoundsException | SQLException
				| ParseException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"ohai.. malformed data...");
		}
		// System.out.println(spaces.length());
	}
}
