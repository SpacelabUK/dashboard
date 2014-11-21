package uk.co.spacelab.backend;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.postgresql.util.PSQLException;

import uk.co.spacelab.common.MatrixMath;
import uk.co.spacelab.dxf.DXFReader;
import uk.co.spacelab.fileio.FileIO;
import uk.co.spacelab.plan.GeometryLayer;

/**
 * Servlet implementation class StorePlans
 */
@SuppressWarnings("serial")
@WebServlet("/StorePlans")
public class StorePlans extends FlowUpload {
	private static String accIdentifier = "-ACC";
	private static String teamIdentifier = "-TEAM";
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		get(request, response, Database.getUploadDirectory());
	}
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		System.out.println(this.getServletContext().getRealPath("/"));
		String UPLOAD_DIR = null, PLANS_DIR = null, FILES_PATH = null;
		try {
			FILES_PATH = Database.getProperty("files_path");
			UPLOAD_DIR = Database.getProperty("upload_dir");
			PLANS_DIR = Database.getProperty("plans_dir");
			File f = new File(UPLOAD_DIR + "temp.csv");
			if (!f.exists()) {
				f.mkdirs();
			}
			f = new File(PLANS_DIR + "temp.csv");
			if (!f.exists()) {
				f.mkdirs();
			}
		} catch (SQLException | ParseException e) {
			throw new InternalException("Error while getting properties");
		}
		UPLOAD_DIR = FILES_PATH + UPLOAD_DIR;
		PLANS_DIR = FILES_PATH + PLANS_DIR;
		if (request.getCharacterEncoding() == null) {
			if (!Util.validParam(request.getParameterMap(), "flowIdentifier"))
				return;
			int studyID = Integer.parseInt(request.getParameter("studyid"));
			String filePath = post(request, response, UPLOAD_DIR);
			if (filePath != null) {
				JSONObject result = new JSONObject();
				JSONArray spaces = new JSONArray();
				JSONArray accSpaces = new JSONArray();
				JSONArray teamSpaces = new JSONArray();
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
							if (alias.toUpperCase().endsWith(accIdentifier)) {
								alias =
										alias.substring(0, alias.length()
												- accIdentifier.length());
								o.put("name", alias);
								o.put("alias", alias);
								accSpaces.put(o);
							} else if (alias.toUpperCase().endsWith(
									teamIdentifier)) {
								alias =
										alias.substring(0, alias.length()
												- teamIdentifier.length());
								o.put("name", alias);
								o.put("alias", alias);
								teamSpaces.put(o);
							} else {
								o.put("name", alias);
								o.put("alias", alias);
								spaces.put(o);
							}
						}
				}
				result.put("spaces", spaces);
				result.put("accSpaces", accSpaces);
				List<String []> layers = null;
				if (accSpaces.length() > 0) {
					Set<String> accLayerSet = new HashSet<String>();
					if (layers == null)
						layers = dxf.breakDXFEntities(dxf.layr);
					for (String [] ent : layers) {
						if (ent[0].equals("LAYER")) {
							if (ent[2].toUpperCase().startsWith(
									DXFReader.generalIdentifier + "ACC-")) {
								accLayerSet.add(ent[2]
										.substring(DXFReader.generalIdentifier
												.length() + "ACC-".length()));
							}
						}
					}
					List<JSONObject> accLayers = new ArrayList<JSONObject>();
					for (String s : accLayerSet) {
						JSONObject type = new JSONObject();
						type.put("alias", s);
						accLayers.add(type);
					}
					try {
						JSONArray accLayersInDB =
								Database.selectAllFromTable("spatial_functions");
						for (JSONObject type : accLayers) {
							for (int i = 0; i < accLayersInDB.length(); i++) {
								String dbAlias =
										accLayersInDB
												.getJSONObject(i)
												.getString(
														Database.COL.SPATIAL_FUNCTIONS_ALIAS
																.toString());
								if (dbAlias.equalsIgnoreCase(type
										.getString("alias"))) {
									type.put("match", dbAlias);
									break;
								}
							}
						}

					} catch (ClassNotFoundException | SQLException
							| ParseException e) {
						e.printStackTrace();
					}
					result.put("accLayers", new JSONArray(accLayers));
				}
				result.put("teamSpaces", teamSpaces);
				if (accSpaces.length() > 0) {
					Set<String> teamLayers = new HashSet<String>();
					if (layers == null)
						layers = dxf.breakDXFEntities(dxf.layr);
					for (String [] ent : layers) {
						if (ent[0].equals("LAYER")) {
							if (ent[2].toUpperCase().startsWith(
									DXFReader.generalIdentifier + "TEAM-")) {
								teamLayers.add(ent[2]
										.substring(DXFReader.generalIdentifier
												.length() + "TEAM-".length()));
							}
						}
					}
					result.put("accLayers", new JSONArray(teamLayers));
				}
				try {
					if (spaces.length() > 0) {
						JSONArray spacesInDB =
								Database.selectWhatFromTableWhere(
										Database.TABLE.SPACES.toString(),
										Database.COL.SPACES_ALIAS.toString(),
										Database.COL.SPACES_STUDY_ID + "=?",
										String.valueOf(studyID));
						result.put("spacesInDB", spacesInDB);
						for (int i = 0; i < spacesInDB.length(); i++) {
							String aliasInDB =
									spacesInDB.getJSONObject(i).getString(
											Database.COL.SPACES_ALIAS
													.toString());
							for (int j = 0; j < spaces.length(); j++) {
								JSONObject space = spaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(alias)) {
									space.put("prematch", aliasInDB);
									break;
								}
							}
						}
					}
					if (accSpaces.length() > 0) {
						JSONArray accSpacesInDB =
								Database.customQuery(
										"SELECT space_alias,sum(polygon_count) "
												+ "FROM splab_polygons_per_space_type "
												+ "WHERE study_id=? AND functeam=? "
												+ "GROUP BY space_alias "
												+ "ORDER BY space_alias",
										String.valueOf(studyID), "func");
						result.put("accSpacesInDB", accSpacesInDB);
						for (int i = 0; i < accSpacesInDB.length(); i++) {
							String aliasInDB =
									accSpacesInDB.getJSONObject(i).getString(
											"space_alias");
							for (int j = 0; j < accSpaces.length(); j++) {
								JSONObject space = accSpaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(alias
										+ accIdentifier)) {
									space.put("prematch", aliasInDB);
									break;
								}
							}
						}
					}
					if (teamSpaces.length() > 0) {
						JSONArray teamSpacesInDB =
								Database.customQuery(
										"SELECT space_alias,sum(polygon_count) "
												+ "FROM splab_polygons_per_space_type "
												+ "WHERE study_id=? AND functeam=? "
												+ "GROUP BY space_alias "
												+ "ORDER BY space_alias",
										String.valueOf(studyID), "team");
						result.put("teamSpacesInDB", teamSpacesInDB);
						for (int i = 0; i < teamSpacesInDB.length(); i++) {
							String aliasInDB =
									teamSpacesInDB.getJSONObject(i).getString(
											"space_alias");
							for (int j = 0; j < teamSpaces.length(); j++) {
								JSONObject space = teamSpaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(alias
										+ accIdentifier)) {
									space.put("prematch", aliasInDB);
									break;
								}
							}
						}
					}
				} catch (SQLException | ParseException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				final File file = new File(filePath);
				filePath = UUID.randomUUID().toString();
				FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
				// file.renameTo(new File());
				result.put("fileid", filePath);
				result.put("studyid", studyID);
				int minutesToExpire = 1;

				// final ScheduledExecutorService worker =
				// Executors.newSingleThreadScheduledExecutor();
				// Runnable task = new Runnable() {
				// public void run() {
				// file.delete();
				// }
				// };
				// worker.schedule(task, minutesToExpire, TimeUnit.MINUTES);
				result.put("expire", new Date(new Date().getTime()
						+ minutesToExpire * 60 * 1000));

				response.setContentType("application/json; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.print(result.toString());
			}
		} else {
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			String fileName;
			Integer studyID;
			boolean allNew = true;
			try {
				fileName = UPLOAD_DIR + "/" + paramsJSON.getString("fileid");
				studyID = paramsJSON.getInt("studyid");
			} catch (NullPointerException | JSONException e) {
				throw new MalformedDataException("Malformed data buddy... -.-");
			}
			float scaleFromInterface = 1000;
			float scale = 1f / scaleFromInterface;
			Map<String, GeometryLayer> blockz = null;
			if (paramsJSON.has("spaces")) {
				JSONArray spaces = paramsJSON.getJSONArray("spaces");
				Map<String, String> selectedSpaces =
						new HashMap<String, String>(spaces.length());
				for (int i = 0; i < spaces.length(); i++) {
					JSONObject space = spaces.getJSONObject(i);
					if (allNew) {
						selectedSpaces.put(space.getString("alias"), "*");
					} else selectedSpaces.put(space.getString("alias"),
							space.getString("match"));
				}
				DXFReader dxf = new DXFReader();
				dxf.addData(FileIO.loadStrings(fileName));
				List<String []> entities = dxf.breakDXFEntities(dxf.ent);
				Map<String, String> spaceMap = new HashMap<String, String>();
				for (String [] ent : entities) {
					if (ent[0].equals("INSERT"))
						if (ent[2].startsWith(DXFReader.generalIdentifier)) {
							String alias =
									ent[2].substring(
											DXFReader.generalIdentifier
													.length()).split("\\(")[0]
											.trim();
							if (selectedSpaces.containsKey(alias))
								spaceMap.put(alias, selectedSpaces.get(alias));
						}
				}
				blockz =
						getBlocks(dxf.breakDXFEntities(dxf.blk),
								MatrixMath.getIdentity(), scale);
				for (String key : blockz.keySet()) {

					String alias =
							key.substring(DXFReader.generalIdentifier.length())
									.split("\\(")[0].trim();
					if (spaceMap.containsKey(alias)) {
						GeometryLayer block = blockz.get(key);
						// minX, maxX, minY, maxY, minZ, maxZ;
						double [] limits = block.getLimits();

						String minPoint =
								"("
										+ BigDecimal.valueOf(limits[0])
												.toPlainString()
										+ ","
										+ BigDecimal.valueOf(limits[2])
												.toPlainString() + ")";
						String maxPoint =
								"("
										+ BigDecimal.valueOf(limits[1])
												.toPlainString()
										+ ","
										+ BigDecimal.valueOf(limits[3])
												.toPlainString() + ")";
						try {
							String aliasToMatch = spaceMap.get(alias);
							JSONArray foundSpaces =
									Database.selectAllFromTableWhere("spaces",
											"study_id=? AND alias=?",
											String.valueOf(studyID),
											aliasToMatch);
							String newFileName = studyID + "_" + alias + ".csv";
							FileIO.saveStrings(PLANS_DIR + newFileName,
									block.getAsCSV());
							// BufferedImage img = block.getImage(1280, 1024);
							BufferedImage img = block.getImage(1280);
							File outputfile =
									new File(PLANS_DIR + studyID + "_" + alias
											+ ".png");
							ImageIO.write(img, "png", outputfile);

							Connection psql = Database.getConnection();
							if (aliasToMatch.equals("*")) {
								// alias is new
								if (foundSpaces.length() != 0)
									throw new MalformedDataException("Space "
											+ aliasToMatch + " already exists");
								// TODO: CHECK WHAT DO TO FOR OVERWRITES
								Database.insertInto(
										psql,
										"spaces",
										"study_id,alias,plan_path,"
												+ "plan_min,plan_max",
										"?,?,?,CAST(? AS point),CAST(? AS point)",
										String.valueOf(studyID), alias,
										newFileName, minPoint, maxPoint);
							} else {
								if (foundSpaces.length() != 1)
									throw new MalformedDataException("Space "
											+ aliasToMatch + " does not exist");
								Database.update(
										"spaces",
										"plan_min=CAST(? AS point), "
												+ "plan_max=CAST(? AS point), "
												+ "plan_path=?",
										"study_id=? AND alias=?",
										new String [] {minPoint, maxPoint,
												newFileName,
												String.valueOf(studyID),
												aliasToMatch});
							}
						} catch (ClassNotFoundException | SQLException
								| ParseException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				}
			}
			if (paramsJSON.has("accSpaces")) {
				JSONArray accSpaces = paramsJSON.getJSONArray("accSpaces");
				if (blockz == null) {
					Map<String, String> selectedSpaces =
							new HashMap<String, String>(accSpaces.length());
					for (int i = 0; i < accSpaces.length(); i++) {
						JSONObject space = accSpaces.getJSONObject(i);
						selectedSpaces.put(space.getString("alias"),
								space.getString("match"));
					}
					DXFReader dxf = new DXFReader();
					dxf.addData(FileIO.loadStrings(fileName));
					List<String []> entities = dxf.breakDXFEntities(dxf.ent);
					Map<String, String> spaceMap =
							new HashMap<String, String>();
					for (String [] ent : entities) {
						if (ent[0].equals("INSERT"))
							if (ent[2].startsWith(DXFReader.generalIdentifier)) {
								String alias =
										ent[2].substring(
												DXFReader.generalIdentifier
														.length()).split("\\(")[0]
												.trim();
								if (selectedSpaces.containsKey(alias))
									spaceMap.put(alias,
											selectedSpaces.get(alias));
							}
					}
					blockz =
							getBlocks(dxf.breakDXFEntities(dxf.blk),
									MatrixMath.getIdentity(), scale);
				}
				Connection psql;
				try {
					Map<String, Integer> typeIDMap =
							new HashMap<String, Integer>();

					psql = Database.getConnection();
					psql.setAutoCommit(false);
					boolean append = false;
					boolean appendTypes = true;
					for (String s : blockz.keySet()) {
						if (!s.startsWith(DXFReader.generalIdentifier))
							continue;
						GeometryLayer block = blockz.get(s);
						String cleanName =
								s.substring(
										DXFReader.generalIdentifier.length())
										.split("\\(")[0];
						int lastDashIndex = cleanName.lastIndexOf("-");
						if (lastDashIndex == -1) continue;
						String alias =
								cleanName.substring(0, lastDashIndex).trim();

						JSONArray result = null;
						result =
								Database.selectAllFromTableWhere(
										psql,
										"spaces",
										"study_id = ? AND LOWER(alias) = LOWER(?)",
										String.valueOf(studyID), alias);

						if (result.length() != 1)
							throw new JSONException("no such space (" + alias
									+ ") found");
						int spaceID = result.getJSONObject(0).getInt("id");

						String functeam =
								cleanName.substring(lastDashIndex + 1).trim();
						if (!functeam.equalsIgnoreCase("ACC")) continue;
						if (!append) {
							Database.deleteFrom(psql, "polygons",
									"space_id=? AND functeam=?",
									String.valueOf(spaceID), "func");
						}
						GeometryLayer.Polyline [] allPolys = block.plines;
						Map<String, List<GeometryLayer.Polyline>> typeMap =
								new HashMap<String, List<GeometryLayer.Polyline>>();
						for (GeometryLayer.Polyline p : allPolys) {
							if (p.layer.toUpperCase().startsWith(
									DXFReader.generalIdentifier + "ACC-")) {
								String type =
										p.layer.substring(DXFReader.generalIdentifier
												.length() + "ACC-".length());
								if (!typeMap.containsKey(type))
									typeMap.put(
											type,
											new ArrayList<GeometryLayer.Polyline>());
								typeMap.get(type).add(p);
							}
						}
						for (String type : typeMap.keySet()) {
							Integer typeID;
							if (typeIDMap.containsKey(type)) {
								typeID = typeIDMap.get(type);
							} else {
								result =
										Database.selectAllFromTableWhere(psql,
												"spatial_functions",
												"LOWER(alias) = LOWER(?)", type);

								if (result.length() != 1) {
									if (appendTypes) {
										int nextVal =
												Database.getSequenceNextVal(
														"spatial_functions_id_seq")
														.getJSONObject(0)
														.getInt("nextval");
										System.out.println(type
												+ " not found. Appending as "
												+ nextVal);
										Database.insertInto(
												psql,
												"spatial_functions",
												"id,alias,name",
												"?,?,?",
												new String [] {
														String.valueOf(nextVal),
														type, type});
										typeID = nextVal;
									} else throw new MalformedDataException(
											"no such type (" + type + ") found");
								} else typeID =
										result.getJSONObject(0).getInt("id");
							}
							List<GeometryLayer.Polyline> polys =
									typeMap.get(type);
							for (int k = 0; k < polys.size(); k++) {
								double [] points = polys.get(k).vF;
								String polyString = "POLYGON((";
								for (int n = 0; n < points.length; n += 3) {
									double x = points[n];
									double y = points[n + 1];
									if (n != 0) polyString += ",";
									polyString += x + " " + y;
								}
								polyString += ",";
								polyString += points[0] + " " + points[1];
								polyString += "))";
								// System.out.println(polyString);
								Database.insertInto(psql, "polygons",
										"polygon,space_id,functeam,type_id",
										"ST_GeomFromText(?),?,?,?", polyString,
										String.valueOf(spaceID), "func",
										String.valueOf(typeID));
							}
						}
					}
					if (psql.isClosed())
						throw new InternalException(
								"Connection is already closed");
					psql.commit();
					psql.setAutoCommit(true);
					psql.close();
				} catch (SQLException | ParseException e) {
					e.printStackTrace();
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				}
			}

			if (paramsJSON.has("teamSpaces")) {
				JSONArray teamSpaces = paramsJSON.getJSONArray("teamSpaces");

				if (blockz == null) {
					Map<String, String> selectedSpaces =
							new HashMap<String, String>(teamSpaces.length());
					for (int i = 0; i < teamSpaces.length(); i++) {
						JSONObject space = teamSpaces.getJSONObject(i);
						selectedSpaces.put(space.getString("alias"),
								space.getString("match"));
					}
					DXFReader dxf = new DXFReader();
					dxf.addData(FileIO.loadStrings(fileName));
					List<String []> entities = dxf.breakDXFEntities(dxf.ent);
					Map<String, String> spaceMap =
							new HashMap<String, String>();
					for (String [] ent : entities) {
						if (ent[0].equals("INSERT"))
							if (ent[2].startsWith(DXFReader.generalIdentifier)) {
								String alias =
										ent[2].substring(
												DXFReader.generalIdentifier
														.length()).split("\\(")[0]
												.trim();
								if (selectedSpaces.containsKey(alias))
									spaceMap.put(alias,
											selectedSpaces.get(alias));
							}
					}
					blockz =
							getBlocks(dxf.breakDXFEntities(dxf.blk),
									MatrixMath.getIdentity(), scale);
				}

				Connection psql;
				try {
					Map<String, Integer> typeIDMap =
							new HashMap<String, Integer>();

					psql = Database.getConnection();
					psql.setAutoCommit(false);
					boolean append = true;
					for (String s : blockz.keySet()) {
						if (!s.startsWith(DXFReader.generalIdentifier))
							continue;
						GeometryLayer block = blockz.get(s);
						String cleanName =
								s.substring(
										DXFReader.generalIdentifier.length())
										.split("\\(")[0];
						int lastDashIndex = cleanName.lastIndexOf("-");
						if (lastDashIndex == -1) continue;
						String alias =
								cleanName.substring(0, lastDashIndex).trim();

						JSONArray result = null;
						result =
								Database.selectAllFromTableWhere(
										psql,
										"spaces",
										"study_id = ? AND LOWER(alias) = LOWER(?)",
										String.valueOf(studyID), alias);

						if (result.length() != 1)
							throw new JSONException("no such space (" + alias
									+ ") found");
						int spaceID = result.getJSONObject(0).getInt("id");
						String functeam =
								cleanName.substring(lastDashIndex + 1).trim();
						if (!functeam.equalsIgnoreCase("TEAM")) continue;

						if (!append) {
							Database.deleteFrom(psql, "polygons",
									"space_id=? AND functeam=?",
									String.valueOf(spaceID), "team");
						}

						GeometryLayer.Polyline [] allPolys = block.plines;
						Map<String, List<GeometryLayer.Polyline>> typeMap =
								new HashMap<String, List<GeometryLayer.Polyline>>();
						for (GeometryLayer.Polyline p : allPolys) {
							if (p.layer.toUpperCase().startsWith(
									DXFReader.generalIdentifier + "TEAM-")) {
								String type =
										p.layer.substring(DXFReader.generalIdentifier
												.length() + "TEAM-".length());
								if (!typeMap.containsKey(type))
									typeMap.put(
											type,
											new ArrayList<GeometryLayer.Polyline>());
								typeMap.get(type).add(p);
							}
						}
						for (String type : typeMap.keySet()) {
							boolean allowNew = true;
							Integer typeID;
							if (typeIDMap.containsKey(type)) {
								typeID = typeIDMap.get(type);
							} else {
								result =
										Database.selectAllFromTableWhere(
												psql,
												"teams",
												"study_id=? AND LOWER(alias) = LOWER(?)",
												String.valueOf(studyID), type);

								if (result.length() != 1) {
									if (allowNew) {
										int nextVal =
												Database.getSequenceNextVal(
														psql, "teams_id_seq")
														.getJSONObject(0)
														.getInt("nextval");
										Database.insertInto(psql, "teams",
												"id,study_id,alias", "?,?,?",
												String.valueOf(nextVal),
												String.valueOf(studyID), type);
										typeID = nextVal;
										typeIDMap.put(type, typeID);
									} else {
										throw new MalformedDataException(
												"no such type (" + type
														+ ") found");
									}
								} else typeID =
										result.getJSONObject(0).getInt("id");
							}
							List<GeometryLayer.Polyline> polys =
									typeMap.get(type);
							for (int k = 0; k < polys.size(); k++) {
								double [] points = polys.get(k).vF;
								String polyString = "POLYGON((";
								for (int n = 0; n < points.length; n += 3) {
									double x = points[n];
									double y = points[n + 1];
									if (n != 0) polyString += ",";
									polyString += x + " " + y;
								}
								polyString += ",";
								polyString += points[0] + " " + points[1];
								polyString += "))";
								Database.insertInto(psql, "polygons",
										"polygon,space_id,functeam,type_id",
										"ST_GeomFromText(?),?,?,?", polyString,
										String.valueOf(spaceID), "team",
										String.valueOf(typeID));
							}
						}
					}
					psql.commit();
					psql.setAutoCommit(true);
					psql.close();
				} catch (SQLException | ParseException e1) {
					e1.printStackTrace();
					return;
				} catch (ClassNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}
	public Map<String, GeometryLayer> getBlocks(List<String []> blockData,
			double [] transform, float scale) {
		Map<String, GeometryLayer> blockz =
				new HashMap<String, GeometryLayer>();
		GeometryLayer newBlock = null;
		List<String []> entityList = new ArrayList<String []>();
		// List<String> blockNames = new ArrayList<String>();
		System.out.println("Seperating blocks");
		for (String [] entry : blockData) {
			if (entry[0].equalsIgnoreCase("BLOCK")) {
				newBlock = new GeometryLayer(entry, scale);
				// blockNames.add(entry[1]);
			}
			if (newBlock != null) {
				if (entry[0].equalsIgnoreCase("ENDBLK")) {
					entityList.add(entry);
					newBlock.addObjects(entityList, transform);
					newBlock.resetLimits(newBlock.limits);
					newBlock.blockz = blockz;
					blockz.put(newBlock.name, newBlock);
					entityList.clear();
					newBlock = null;
				} else {
					entityList.add(entry);
				}
			}
		}

		for (GeometryLayer block : blockz.values())
			block.getOwnLimits();

		return blockz;
	}
}
