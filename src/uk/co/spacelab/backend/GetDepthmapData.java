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
import org.json.JSONObject;

/**
 * Servlet implementation class GetDepthmapData
 */
@WebServlet("/GetDepthmapData")
public class GetDepthmapData extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetDepthmapData() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		if (!Util.validParam(request.getParameterMap(), "spaceid")) return;
		if (!Util.validParam(request.getParameterMap(), "measure")) return;
		if (!Util.validParam(request.getParameterMap(), "analysis_type"))
			return;
		int spaceID = Integer.parseInt(request.getParameter("spaceid"));
		int bandID = Integer.parseInt(request.getParameter("measure"));
		String analysis_type = request.getParameter("analysis_type");
		// String measure = request.getParameter("measure");
		try {
			// int bandID =
			// Database.selectWhatFromTableWhere("band_info", "band_id",
			// "space_id=? AND alias=?", String.valueOf(spaceID),
			// measure).getJSONObject(0).getInt("band_id");
			// System.out.println("Band: " + bandID);
			// int mapID = 49;

			JSONObject result = new JSONObject();
			String bandName =
					Database.selectWhatFromTableWhere("band_info", "alias",
							"space_id=? AND band_id=?", String.valueOf(spaceID),
							String.valueOf(bandID)).getJSONObject(0)
							.getString("alias");
			result.put("band", bandName);
			// String analysis_type = "Essence";
			JSONObject data =
					Database.customQuery(
							"SELECT ST_MetaData(st_band),ST_AsGDALRaster(st_band,'XYZ')"
									+ ",ST_Count(st_band) FROM "
									+ "ST_Band((SELECT map FROM depthmaps WHERE space_id=? "
									+ "AND analysis_type=?::depthmap_types),"
									+ "?);",
							spaceID, analysis_type, bandID).getJSONObject(0);
			// System.out.println(data.getInt("st_count"));
			String [] tileData =
					new String(
							hexStringToByteArray(
									data.getString("st_asgdalraster")))
											.split("\n");
			double maxV = -Double.MAX_VALUE, minV = Double.MAX_VALUE;
			JSONArray tiles = new JSONArray();
			for (int i = 0; i < tileData.length; i++) {
				JSONObject tile = new JSONObject();
				String s = tileData[i];
				double v = Double.parseDouble(s.split(" ")[2]);
				if (v < 0.000000001) continue;
				tile.put("i", i);
				if (v > maxV) maxV = v;
				if (v < minV) minV = v;
				tile.put("v", v);
				tiles.put(tile);
			}
			result.put("tiles", tiles);
			String [] knownMetadata =
					new String [] {"upperleftx", "upperlefty", "width",
							"height", "scalex", "scaley", "skewx", "skewy",
							"srid", "numbands"};
			JSONObject metadata = new JSONObject();
			String metadataString = data.getString("st_metadata");
			metadataString =
					metadataString.substring(1, metadataString.length() - 1);
			String [] hakunamatata = metadataString.split(",");
			for (int i = 0; i < hakunamatata.length; i++)
				metadata.put(knownMetadata[i], hakunamatata[i]);
			metadata.put("maxv", maxV);
			metadata.put("minv", minV);
			result.put("metadata", metadata);
			JSONObject spaceLimits =
					Database.selectWhatFromTableWhere("spaces",
							"plan_min[0] AS min_x,plan_min[1] AS min_y,"
									+ "plan_max[0] AS max_x,plan_max[1] AS max_y",
							"id=?", String.valueOf(spaceID)).getJSONObject(0);
			result.put("spaceLimits", spaceLimits);
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			out.print(result);
			// System.out.println(tileData.length + " " + counter);
			// "SELECT * FROM ST_AsBinary(ST_Band((SELECT map FROM depthmaps
			// WHERE id=49),"
			// + bandID + " ));")
			// .getJSONObject(0).getString("st_asbinary")));
			// "SELECT * FROM spaces;"));

			// } catch (PSQLException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
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
	public static byte [] hexStringToByteArray(String s) {
		int len = s.length();
		byte [] data = new byte [len / 2];
		for (int i = 0; i < len; i += 2) {
			data[i / 2] =
					(byte) ((Character.digit(s.charAt(i), 16) << 4)
							+ Character.digit(s.charAt(i + 1), 16));
		}
		return data;
	}
}
