package uk.co.spacelab.controller;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
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

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.exception.InternalException;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.exception.MalformedDataException;
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.depthmap.DepthMap;
import uk.co.spacelab.depthmap.Raster;
import uk.co.spacelab.depthmap.DepthMap.DepthCell;
import uk.co.spacelab.depthmap.Raster.RasterBand;
import uk.co.spacelab.dxf.DXFReader;
import uk.co.spacelab.plan.GeometryLayer;

/**
 * Servlet implementation class StorePlans
 */
@SuppressWarnings("serial")
@WebServlet("/StoreDepthmap")
public class StoreDepthmap extends SplabHttpServlet {
	private static final String inputPlanDataType = "depthmapdxf";
	private static final String inputPlanFileType = "dxf";
	private static final String inputDepthDataType = "depthmapcsv";
	private static final String inputDepthFileType = "csv";
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}

	Map<String, Integer> processSpaces(JSONArray spacesIn, int studyID)
			throws SQLException, ParseException {
		Map<String, Integer> spaces = new HashMap<String, Integer>();
		Map<String, JSONObject> spacesJSON = new HashMap<String, JSONObject>();
		Map<String, String> spaceNames = new HashMap<String, String>();
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		for (int i = 0; i < spacesIn.length(); i++) {
			JSONObject q = spacesIn.getJSONObject(i);
			if (q.optString("match").equals("*")) {
				// is new
				System.out.println(q.getString("alias") + " is new");
				// do not accept new spaces, we need the plans first
				continue;
				// spaces.put(q.getString("alias").toUpperCase(), -1);

			} else if (q.optString("match").equals("-")) {
				// ignore this
				System.out.println(q.getString("alias") + " to be ingored");
				continue;
			} else if (q.has("match")) {
				String matchAlias = q.getJSONObject("match").getString("alias");
				if (matchAlias.trim().length() < 1)
					throw new MalformedDataException(
							"Matching space alias is empty");
				JSONArray results =
						Database.selectWhatFromTableWhere(psql, "spaces", "id",
								"study_id=? AND alias=?", studyID, matchAlias);
				if (results.length() == 0)
					throw new MalformedDataException(
							"No such space " + matchAlias + " found");
				spaces.put(q.getString("alias").toUpperCase(),
						results.getJSONObject(0).getInt("id"));
			}
			spacesJSON.put(q.getString("alias"), q);
			spaceNames.put(q.getString("alias").toUpperCase(),
					q.getString("alias"));
		}

		psql.commit();
		psql.setAutoCommit(true);

		return spaces;
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		PrintWriter out = response.getWriter();
		if (request.getCharacterEncoding() != null) {
			Integer studyID;
			System.out.println("analysis...");
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			File fileCSV, fileDXF;
			String type, name;
			Map<String, Integer> spaceMatch;
			try {
				name = paramsJSON.getString("name");
				studyID = paramsJSON.getInt("studyid");
				if (!paramsJSON.has("datain")
						|| !paramsJSON.getJSONObject("datain").has("spaces"))
					throw new MalformedDataException("No data");
				spaceMatch =
						processSpaces(paramsJSON.getJSONObject("datain")
								.getJSONArray("spaces"), studyID);
				fileCSV =
						FileHandler.getTempFile(inputDepthDataType,
								paramsJSON.getString("fileidCSV"),
								inputDepthFileType);
				fileDXF =
						FileHandler.getTempFile(inputPlanDataType,
								paramsJSON.getString("fileidDXF"),
								inputPlanFileType);
				type = paramsJSON.getString("type");
				if (!depthmapTypeValid(type)) {
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					out.print("Unknown type " + type);
					return;
					// throw new MalformedDataException(
					// "Malformed data buddy... -.- (unknown type " + type
					// + ")");
				}
			} catch (NullPointerException | JSONException | ParseException
					| SQLException e) {
				throw new MalformedDataException("Malformed data buddy... -.-");
			}
			if (spaceMatch.size() == 0) {
				sendInterfaceError(response, "No spaces selected");
				return;
			}
			if (!fileCSV.exists() || !fileDXF.exists()) {
				// look in SplabSessionListener
				sendInterfaceError(response,
						"Files have expired, restart the process");
				return;
			}
			float scaleFromInterface = 1000;
			float scale = 1f / scaleFromInterface;
			Map<String, GeometryLayer> blockz = null;

			String depthmapName = "Visibility";
			DXFReader dxf = new DXFReader();

			dxf.addData(IOUtils.readLines(FileUtils
					.openInputStream(new File(fileDXF.getAbsolutePath()))));
			DepthMap dpm =
					new DepthMap(
							depthmapName,
							IOUtils.readLines(FileUtils.openInputStream(
									new File(fileCSV.getAbsolutePath()))),
							dxf, 1.0f / scaleFromInterface);
			Map<String, double []> blockPositions = dpm.blockPositions;
			System.out.println(blockPositions);
			try {
				Connection psql = Database.getConnection();
				psql.setAutoCommit(false);
				JSONArray spaces;
				spaces =
						Database.selectWhatFromTableWhere(psql, "spaces",
								"id,alias,plan_min,plan_max", "study_id=?",
								studyID);
				for (String alias : blockPositions.keySet()) {
					JSONObject currSpace = null;
					for (int i = 0; i < spaces.length(); i++) {
						JSONObject space = spaces.getJSONObject(i);

						if (space.getInt("id") == spaceMatch
								.get(alias.split("\\(")[0].trim())) {
							currSpace = space;
							break;
						}
					}
					if (currSpace == null) {
						// sendInterfaceError(response,
						// "No such space " + alias + " found");
						// return;
						// as we are validating above this error is not
						// required, just...
						continue;
					}
					String plan_min = currSpace.getString("plan_min");
					plan_min = plan_min.substring(1, plan_min.length() - 1);
					String [] min = plan_min.split(",");
					String plan_max = currSpace.getString("plan_max");
					plan_max = plan_max.substring(1, plan_max.length() - 1);
					String [] max = plan_max.split(",");

					double [] limits =
							new double [] {Double.parseDouble(min[0]),
									Double.parseDouble(max[0]),
									Double.parseDouble(min[1]),
									Double.parseDouble(max[1])};
					for (double d : limits)
						System.out.println(d);
					DepthMap n =
							getDepthMapWithinLimits(dpm, alias,
									new double [] {0, 0}, limits);
					if (null == n) continue;
					// throw new InternalException(
					// "No cells found within limits");
					int currSpaceID = currSpace.getInt("id");
					Database.deleteFrom(psql, "depthmaps",
							"study_id=? AND space_id=? AND analysis_type=?::depthmap_types",
							studyID, currSpaceID, type);
					Raster r = n.getMeasuresMap();

					System.out.println(currSpaceID);
					int mapID =
							writeRaster(psql, studyID, currSpaceID, type, name,
									r);

					System.out.println(mapID);

					Map<String, RasterBand> bands = n.getMeasuresMap().bands;
					for (String band : bands.keySet()) {
						System.out.println("Populating band: " + band);
						populateBand(psql, mapID, band,
								n.getMeasuresMap().bands.get(band).fa);
					}
					System.out.println("Done");
				}
				writeBasePoints(psql, studyID, dpm.blockPositions);
				psql.commit();
				psql.setAutoCommit(true);

			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}

			fileCSV.delete();
			fileDXF.delete();
		}
		// }
	}
	private boolean depthmapTypeValid(String type)
			throws SQLException, ParseException {
		JSONArray result =
				Database.customQuery(
						"SELECT * FROM splab_get_depthmap_types() AS type");
		for (int i = 0; i < result.length(); i++)
			if (type.equalsIgnoreCase(
					result.getJSONObject(i).getString("type")))
				return true;
		return false;
	}
	public DepthMap getDepthMapWithinLimits(DepthMap dpm, String alias,
			double [] origin, double [] limits) {
		double [] depthMapOffset = dpm.blockPositions.get(alias);
		if (null == depthMapOffset) depthMapOffset = new double [] {0, 0};
		depthMapOffset[0] -= origin[0];
		depthMapOffset[1] -= origin[1];
		List<DepthCell> cellsWithin = new ArrayList<DepthCell>();
		System.out.println("Checking with space: " + alias + " "
				+ dpm.blockPositions.containsKey(alias) + " "
				+ depthMapOffset[0] + " " + depthMapOffset[1]);
		for (DepthCell c : dpm.cells) {
			if (isWithinLimits(c.x - depthMapOffset[0], c.y - depthMapOffset[1],
					limits)) {
				cellsWithin.add(c.copyAt(c.ref, -depthMapOffset[0],
						-depthMapOffset[1]));
			}
		}
		if (cellsWithin.size() < 1) return null;
		depthMapOffset[0] += origin[0];
		depthMapOffset[1] += origin[1];
		return new DepthMap(dpm, cellsWithin, alias, depthMapOffset);
	}
	public boolean isWithinLimits(double x, double y, double [] limits) {
		return limits[0] <= x && x <= limits[1] && limits[2] <= y
				&& y <= limits[3];
	}
	private int writeRaster(Connection psql, int studyID, int spaceID,
			String type, String mapName, Raster raster)
					throws ClassNotFoundException, SQLException,
					ParseException {
		String TABLE_MAP = "depthmaps";
		String TABLE_BAND_ALIASES = "band_info";
		Database.insertInto(psql, TABLE_MAP,
				"name,analysis_type,study_id,space_id,map",
				"?,?::depthmap_types,?,?,ST_MakeEmptyRaster( ?, ?, ?, ?, ?)",
				mapName, type, studyID, spaceID, raster.cellNumX,
				raster.cellNumY, raster.x,
				raster.y + raster.cellNumY * raster.cellW, raster.cellW);

		JSONArray result =
				Database.selectWhatFromTableWhere(psql, TABLE_MAP, "id",
						"study_id=? AND space_id=? AND name=?", studyID,
						spaceID, mapName);
		int mapID = result.getJSONObject(0).getInt("id");

		List<Integer> bandIds = new ArrayList<Integer>();

		for (String measure : raster.bands.keySet()) {
			RasterBand b = raster.bands.get(measure);
			Database.update(psql, TABLE_MAP,
					"map = ST_AddBand(map, ?::text,NULL::double precision,NULL )",
					"id=?", b.dataType, mapID);

			result =
					Database.customQuery(psql,
							"SELECT * FROM " + "ST_BandMetadata((SELECT "
									+ "map" + " FROM " + TABLE_MAP + " WHERE "
									+ "id" + "= ?),ARRAY[]::integer[]);",
							String.valueOf(mapID));

			for (int i = 0; i < result.length(); i++) {
				int newID = result.getJSONObject(i).getInt("bandnum");
				if (!bandIds.contains(newID)) {
					bandIds.add(newID);
					b.id = newID;
				}
			}
			Database.update(psql, TABLE_MAP,
					"map = ST_SetBandNoDataValue(map, ?,? )", "id=?", b.id, 0,
					mapID);

		}
		for (String measure : raster.bands.keySet()) {
			Database.deleteFrom(psql, TABLE_BAND_ALIASES,
					"map_id=? AND alias=?", mapID, measure);
			RasterBand b = raster.bands.get(measure);
			Database.insertInto(psql, TABLE_BAND_ALIASES,
					"band_id,alias,map_id,space_id", "?,?,?,?", b.id, measure,
					mapID, spaceID);
		}
		return mapID;
	}
	public void populateBand(Connection psql, int mapID, String bandAlias,
			Float [] [] fa) throws ParseException, ClassNotFoundException {
		String TABLE_BAND_ALIASES = "band_info";
		int patchSizeX = 20;
		int patchSizeY = fa.length;
		int m = 0;

		while (m < fa[0].length + patchSizeX) {
			int n = 0;
			while (n < fa.length + patchSizeY) {
				String patch = "ARRAY[";
				for (int i = m; i < m + patchSizeX && i < fa[0].length; i++) {
					if (i > m) patch += ",";
					patch += "[";
					for (int j = n; j < n + patchSizeY && j < fa.length; j++) {
						if (j > n) patch += ",";
						patch +=
								fa[j][fa[0].length - 1 - i] == null
										? "NULL"
										: fa[j][fa[0].length - 1 - i];
						// System.out.println(fa[j][fa[0].length - 1 - i]);
					}
					patch += "]";
				}
				patch += "]::double precision[][]";
				// System.out.println(patch);
				int startX = n + 1, startY = m + 1;
				try {
					JSONArray result =
							Database.selectWhatFromTableWhere(psql,
									TABLE_BAND_ALIASES, "band_id",
									"map_id=? AND alias=?",
									String.valueOf(mapID), bandAlias);
									// pstmt =
									// conn.prepareStatement("SELECT " +
									// ALIASES_ID
									// + " FROM " + TABLE_BAND_ALIASES + " WHERE
									// "
									// + ALIASES_MAPNAME + " = ? " + " AND "
									// + ALIASES_ALIAS + " = ?");
									// pstmt.setString(1, mapName);
									// pstmt.setString(2, bandAlias);
									// ResultSet rs = pstmt.executeQuery();

					// rs.next();
					int bandID = result.getJSONObject(0).getInt("band_id");
					Database.update(psql, "depthmaps",
							"map = ST_SetValues(map, ?, ?, ?," + patch + ")",
							"id = ?",
							new String [] {String.valueOf(bandID),
									String.valueOf(startX),
									String.valueOf(startY),
									String.valueOf(mapID)});

				} catch (SQLException e) {
					System.err.println("patch: " + patch);
					System.err.println("Could not populate band " + bandAlias);
					e.printStackTrace();
					return;
				}
				n += patchSizeY;
			}
			m += patchSizeX;
		}
	}
	public void writeBasePoints(Connection psql, int studyID,
			Map<String, double []> basePoints)
					throws ClassNotFoundException, ParseException {
		try {
			for (String spaceAlias : basePoints.keySet()) {
				String point =
						"(" + BigDecimal.valueOf(basePoints.get(spaceAlias)[0])
								.toPlainString()
								+ ","
								+ BigDecimal
										.valueOf(basePoints.get(spaceAlias)[1])
										.toPlainString()
								+ ")";
				Database.update(psql, "spaces",
						"depthmap_origin=CAST(? AS point)",
						"study_id=? AND alias=?", new String [] {point,
								String.valueOf(studyID), spaceAlias});
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
