package uk.co.spacelab.backend;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.postgis.PGgeometry;

import uk.co.spacelab.Converter.PGSQLWriter;
import uk.co.spacelab.depthmap.DepthMap;
import uk.co.spacelab.depthmap.Raster;
import uk.co.spacelab.depthmap.DepthMap.DepthCell;
import uk.co.spacelab.depthmap.Raster.RasterBand;
import uk.co.spacelab.dxf.DXFReader;
import uk.co.spacelab.fileio.FileIO;
import uk.co.spacelab.plan.GeometryLayer;

/**
 * Servlet implementation class StorePlans
 */
@SuppressWarnings("serial")
@WebServlet("/StoreDepthmap")
public class StoreDepthmap extends FlowUpload {
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		get(request, response, Database.getUploadDirectory());
	}
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String UPLOAD_DIR = null, FILES_PATH = null;
		try {
			FILES_PATH = Database.getProperty("files_path");
			UPLOAD_DIR = Database.getProperty("upload_dir");
		} catch (SQLException | ParseException e) {
			throw new InternalException("Error while getting properties");
		}
		UPLOAD_DIR = FILES_PATH + UPLOAD_DIR;
		if (request.getCharacterEncoding() == null) {
			if (!Util.validParam(request.getParameterMap(), "flowIdentifier"))
				return;
			int studyID = Integer.parseInt(request.getParameter("studyid"));
			String filePath = post(request, response, UPLOAD_DIR);
			if (filePath != null) {
				JSONObject result = new JSONObject();
				if (filePath.toUpperCase().endsWith(".DXF")) {
					JSONArray spaces = new JSONArray();
					DXFReader dxf = new DXFReader();
					dxf.addData(FileIO.loadStrings(filePath));
					List<String []> entities = dxf.breakDXFEntities(dxf.ent);
					for (String [] ent : entities) {
						if (ent[0].equals("INSERT"))
							if (ent[2].startsWith(DXFReader.generalIdentifier)) {
								JSONObject o = new JSONObject();
								String alias =
										ent[2].substring(
												DXFReader.generalIdentifier
														.length()).split("\\(")[0]
												.trim();
								o.put("name", alias);
								o.put("alias", alias);
								spaces.put(o);
							}
					}
					result.put("spaces", spaces);
					final File file = new File(filePath);
					filePath = UUID.randomUUID().toString();
					FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
					result.put("fileid", filePath);
					result.put("studyid", studyID);
				} else if (filePath.toUpperCase().endsWith(".CSV")) {
					JSONArray measures = new JSONArray();
					result.put("measures", measures);
					final File file = new File(filePath);
					filePath = UUID.randomUUID().toString();
					FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
					result.put("fileid", filePath);
					result.put("studyid", studyID);
				}
				int minutesToExpire = 1;
				result.put("expire", new Date(new Date().getTime()
						+ minutesToExpire * 60 * 1000));

				response.setContentType("application/json; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.print(result.toString());
			}
		} else {
			boolean append = false;
			System.out.println("analysis...");
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			String fileCSV, fileDXF, type, name;
			Integer studyID;
			boolean allNew = true;
			try {
				fileCSV = UPLOAD_DIR + "/" + paramsJSON.getString("fileidCSV");
				fileDXF = UPLOAD_DIR + "/" + paramsJSON.getString("fileidDXF");
				type = paramsJSON.getString("type");
				if (!depthmapTypeValid(type))
					throw new MalformedDataException(
							"Malformed data buddy... -.- (unknown type " + type
									+ ")");
				name = paramsJSON.getString("name");
				studyID = paramsJSON.getInt("studyid");
			} catch (NullPointerException | JSONException | ParseException
					| SQLException e) {
				throw new MalformedDataException("Malformed data buddy... -.-");
			}
			float scaleFromInterface = 1000;
			float scale = 1f / scaleFromInterface;
			Map<String, GeometryLayer> blockz = null;

			String depthmapName = "Visibility";
			DXFReader dxf = new DXFReader();
			dxf.addData(FileIO.loadStrings(fileDXF));
			DepthMap dpm =
					new DepthMap(depthmapName, FileIO.loadStrings(fileCSV),
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

						if (space.getString("alias").equals(
								alias.split("\\(")[0].trim())) {
							currSpace = space;
							break;
						}
					}
					if (currSpace == null)
						throw new MalformedDataException("No such space "
								+ alias + " found");
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
							getDepthMapWithinLimits(dpm, alias, new double [] {
									0, 0}, limits);
					if (null == n) continue;
					// throw new InternalException(
					// "No cells found within limits");
					int currSpaceID = currSpace.getInt("id");
					Database.deleteFrom(
							psql,
							"depthmaps",
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

			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}
			// Raster r = dpm.getMeasuresMap();
			catch (ClassNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}

			// // for (String s : spaces.keySet()) {
			// // DepthMapBranch n = new
			// // DepthMapBranch(dpth.getDepthMapWithinSpace(s));
			// // if (null != n) s.trunk.addChild("-" + dpth.dpm.name, n);
			// // }

			// if (paramsJSON.has("accSpaces")) {

			// JSONArray accSpaces = paramsJSON.getJSONArray("accSpaces");
			// if (blockz == null) {
			// Map<String, String> selectedSpaces =
			// new HashMap<String, String>(accSpaces.length());
			// for (int i = 0; i < accSpaces.length(); i++) {
			// JSONObject space = accSpaces.getJSONObject(i);
			// selectedSpaces.put(space.getString("alias"),
			// space.getString("match"));
			// }
			// DXFReader dxf = new DXFReader();
			// dxf.addData(FileIO.loadStrings(fileName));
			// List<String []> entities = dxf.breakDXFEntities(dxf.ent);
			// Map<String, String> spaceMap =
			// new HashMap<String, String>();
			// for (String [] ent : entities) {
			// if (ent[0].equals("INSERT"))
			// if (ent[2].startsWith(DXFReader.generalIdentifier)) {
			// String alias =
			// ent[2].substring(
			// DXFReader.generalIdentifier
			// .length()).split("\\(")[0]
			// .trim();
			// if (selectedSpaces.containsKey(alias))
			// spaceMap.put(alias,
			// selectedSpaces.get(alias));
			// }
			// }
			// blockz =
			// getBlocks(dxf.breakDXFEntities(dxf.blk),
			// MatrixMath.getIdentity(), scale);
			// }
			// try {
			// Map<String, Integer> typeIDMap = new HashMap<String, Integer>();
			//
			// psql = Database.getConnection();
			// psql.setAutoCommit(false);
			// boolean append = false;
			// boolean appendTypes = true;
			// for (String s : blockz.keySet()) {
			// if (!s.startsWith(DXFReader.generalIdentifier)) continue;
			// GeometryLayer block = blockz.get(s);
			// String cleanName =
			// s.substring(DXFReader.generalIdentifier.length())
			// .split("\\(")[0];
			// int lastDashIndex = cleanName.lastIndexOf("-");
			// if (lastDashIndex == -1) continue;
			// String alias = cleanName.substring(0, lastDashIndex).trim();
			//
			// JSONArray result = null;
			// result =
			// Database.selectAllFromTableWhere(psql, "spaces",
			// "study_id = ? AND LOWER(alias) = LOWER(?)",
			// String.valueOf(studyID), alias);
			//
			// if (result.length() != 1)
			// throw new JSONException("no such space (" + alias
			// + ") found");
			// int spaceID = result.getJSONObject(0).getInt("id");
			//
			// String functeam =
			// cleanName.substring(lastDashIndex + 1).trim();
			// if (!functeam.equalsIgnoreCase("ACC")) continue;
			// if (!append) {
			// Database.deleteFrom(psql, "polygons",
			// "space_id=? AND functeam=?",
			// String.valueOf(spaceID), "func");
			// }
			// }
			// if (psql.isClosed())
			// throw new InternalException("Connection is already closed");
			// psql.commit();
			// psql.setAutoCommit(true);
			// psql.close();
			// } catch (SQLException | ParseException e) {
			// e.printStackTrace();
			// } catch (ClassNotFoundException e) {
			// e.printStackTrace();
			// }
		}
		// }
	}
	private boolean depthmapTypeValid(String type) throws SQLException,
			ParseException {
		JSONArray result =
				Database.customQuery("SELECT * FROM splab_get_depthmap_types() AS type");
		for (int i = 0; i < result.length(); i++)
			if (type.equalsIgnoreCase(result.getJSONObject(i).getString("type")))
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
			if (isWithinLimits(c.x - depthMapOffset[0],
					c.y - depthMapOffset[1], limits)) {
				cellsWithin.add(c
						.copyAt(-depthMapOffset[0], -depthMapOffset[1]));
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
			throws ClassNotFoundException, SQLException, ParseException {
		String TABLE_MAP = "depthmaps";
		String TABLE_BAND_ALIASES = "band_info";
		Database.insertInto(psql, TABLE_MAP,
				"name,analysis_type,study_id,space_id,map",
				"?,?::depthmap_types,?,?,ST_MakeEmptyRaster( ?, ?, ?, ?, ?)",
				mapName, type, String.valueOf(studyID),
				String.valueOf(spaceID), String.valueOf(raster.cellNumX),
				String.valueOf(raster.cellNumY), String.valueOf(raster.x),
				String.valueOf(raster.y + raster.cellNumY * raster.cellW),
				String.valueOf(raster.cellW));

		JSONArray result =
				Database.selectWhatFromTableWhere(psql, TABLE_MAP, "id",
						"study_id=? AND space_id=? AND name=?",
						String.valueOf(studyID), String.valueOf(spaceID),
						mapName);
		int mapID = result.getJSONObject(0).getInt("id");

		List<Integer> bandIds = new ArrayList<Integer>();

		for (String measure : raster.bands.keySet()) {
			RasterBand b = raster.bands.get(measure);
			Database.update(
					psql,
					TABLE_MAP,
					"map = ST_AddBand(map, ?::text,NULL::double precision,NULL )",
					"id=?", b.dataType, mapID);

			result =
					Database.customQuery(psql, "SELECT * FROM "
							+ "ST_BandMetadata((SELECT " + "map" + " FROM "
							+ TABLE_MAP + " WHERE " + "id"
							+ "= ?),ARRAY[]::integer[]);",
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
			Float [][] fa) throws ParseException, ClassNotFoundException {
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
					// conn.prepareStatement("SELECT " + ALIASES_ID
					// + " FROM " + TABLE_BAND_ALIASES + " WHERE "
					// + ALIASES_MAPNAME + " = ? " + " AND "
					// + ALIASES_ALIAS + " = ?");
					// pstmt.setString(1, mapName);
					// pstmt.setString(2, bandAlias);
					// ResultSet rs = pstmt.executeQuery();

					// rs.next();
					int bandID = result.getJSONObject(0).getInt("band_id");
					Database.update(
							psql,
							"depthmaps",
							"map = ST_SetValues(map, ?, ?, ?," + patch + ")",
							"id = ?",
							new String [] {String.valueOf(bandID),
									String.valueOf(startX),
									String.valueOf(startY),
									String.valueOf(mapID)});
					// pstmt.close();
					// pstmt =
					// conn.prepareStatement();
					// pstmt.setInt(1, );
					// pstmt.setInt(2, );
					// pstmt.setInt(3, startY);
					// pstmt.setString(4, mapName);
					// pstmt.executeUpdate();
					// pstmt.close();
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
			Map<String, double []> basePoints) throws ClassNotFoundException,
			ParseException {
		try {
			for (String spaceAlias : basePoints.keySet()) {
				String point =
						"("
								+ BigDecimal.valueOf(
										basePoints.get(spaceAlias)[0])
										.toPlainString()
								+ ","
								+ BigDecimal.valueOf(
										basePoints.get(spaceAlias)[1])
										.toPlainString() + ")";
				Database.update(psql, "spaces",
						"depthmap_origin=CAST(? AS point)",
						"study_id=? AND alias=?",
						new String [] {point, String.valueOf(studyID),
								spaceAlias});
				// PreparedStatement pstmt;
				// pstmt =
				// conn.prepareStatement("INSERT INTO "
				// + TABLE_SPACE_BASEPOINTS + "("
				// + BASEPOINTS_SPACE_ALIAS + ", "
				// + BASEPOINTS_POSITION_X + ","
				// + BASEPOINTS_POSITION_Y + ") VALUES (?,?,?);");
				// pstmt.setString(1, spaceAlias);
				// pstmt.setDouble(2, );
				// pstmt.setDouble(3, );
				// pstmt.executeUpdate();
				// pstmt.close();
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
