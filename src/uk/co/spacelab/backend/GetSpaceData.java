package uk.co.spacelab.backend;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet implementation class GetSpaceData
 */
@WebServlet("/GetSpaceData")
public class GetSpaceData extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		int spaceID = Integer.parseInt(request.getParameter("spaceid"));
		String functeam = request.getParameter("functeam");
		if (!functeam.equals("team") && !functeam.equals("func"))
			throw new MalformedDataException("unknown value " + functeam
					+ " for functeam");
		try {
			JSONObject result = new JSONObject();
			JSONArray polys =
					Database.selectWhatFromTableWhere(
							"polygons",
							"id,ST_AsText((ST_Dump(polygon)).geom) AS geometry,type_id",
							"space_id=? AND functeam=?",
							String.valueOf(spaceID), functeam);
			JSONObject spaceLimits =
					Database.selectWhatFromTableWhere(
							"spaces",
							"plan_min[0] AS min_x,plan_min[1] AS min_y,"
									+ "plan_max[0] AS max_x,plan_max[1] AS max_y",
							"id=?", String.valueOf(spaceID)).getJSONObject(0);
			double minX = Double.MAX_VALUE, maxX = -Double.MAX_VALUE, minY =
					Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
			for (int i = 0; i < polys.length(); i++) {
				JSONObject poly = polys.getJSONObject(i);
				String geometry = poly.getString("geometry");
				geometry =
						geometry.substring("POLYGON((".length(),
								geometry.length() - 2).replace(")(", " ");
				String [] pointString = geometry.split(",");
				JSONArray points = new JSONArray();
				for (String point : pointString) {
					String [] coords = point.split(" ");
					JSONObject p = new JSONObject();
					double x = Double.parseDouble(coords[0]);
					double y = Double.parseDouble(coords[1]);
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
					p.put("x", coords[0]);
					p.put("y", coords[1]);
					points.put(p);
				}
				poly.remove("geometry");
				poly.put("points", points);
				poly.put("colour", "#0000ff");
				// // JSONArray rings =
				// // Database.selectWhatFromTableWhere("polygons",
				// // "St_DumpRings(polygon)", "id=?",
				// // String.valueOf(poly.getInt("id")));
				// int no_of_points =
				// Database.selectWhatFromTableWhere("polygons",
				// "ST_NPOINTS(polygon) AS no_of_points", "id=?",
				// String.valueOf(poly.getInt("id")))
				// .getJSONObject(0).getInt("no_of_points");
				// JSONArray points = new JSONArray();
				// for (int j = 0; j < no_of_points; j++) {
				// JSONObject point =
				// Database.selectWhatFromTableWhere(
				// "polygons",
				// "ST_DUMPPOINTS(polygon)[0],ST_DUMPPOINTS(polygon)[1]",
				// "id=?", String.valueOf(poly.getInt("id")))
				// .getJSONObject(0);
				// points.put(point);
				// }
				// poly.put("points", points);
			}
			JSONObject c = new JSONObject();
			c.put("x", (maxX + minX) * 0.5);
			c.put("y", (maxY + minY) * 0.5);
			result.put("centre", c);
			result.put("polys", polys);
			result.put("spaceLimits", spaceLimits);
			response.setContentType("application/json; charset=UTF-8");
			response.getWriter().print(result);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
