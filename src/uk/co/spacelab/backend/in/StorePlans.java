package uk.co.spacelab.backend.in;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.AbstractMap.SimpleEntry;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.InternalException;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.MalformedDataException;
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.common.MatrixMath;
import uk.co.spacelab.dxf.DXFReader;
import uk.co.spacelab.fileio.FileIO;
import uk.co.spacelab.plan.GeometryLayer;

/**
 * Servlet implementation class StorePlans
 */
@SuppressWarnings("serial")
@WebServlet("/StorePlans")
public class StorePlans extends SplabHttpServlet {
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

	}
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// System.err.println(this.getServletContext().getRealPath("/"));
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
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);
		String fileID;
		Integer studyID;
		boolean allNew = true;
		try {
			fileID = paramsJSON.getString("fileid");
			studyID = paramsJSON.getInt("studyid");
		} catch (NullPointerException | JSONException e) {
			throw new MalformedDataException("Malformed data buddy... -.-");
		}
		String filePath =
				FileHandler.getTempFile("plan", fileID, "dxf")
						.getAbsolutePath();
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
				} else
					selectedSpaces.put(space.getString("alias"),
							space.getString("match"));
			}
			DXFReader dxf = new DXFReader();
			dxf.addData(FileIO.loadStrings(filePath));
			List<String []> entities = dxf.breakDXFEntities(dxf.ent);
			Map<String, String> spaceMap = new HashMap<String, String>();
			for (String [] ent : entities) {
				if (ent[0].equals("INSERT"))
					if (ent[2].startsWith(DXFReader.generalIdentifier)) {
					String alias =
							ent[2].substring(
									DXFReader.generalIdentifier.length())
									.split("\\(")[0].trim();
					if (selectedSpaces.containsKey(alias))
						spaceMap.put(alias, selectedSpaces.get(alias));
				}
			}
			blockz =
					getBlocks(dxf.breakDXFEntities(dxf.blk),
							MatrixMath.getIdentity(), scale);
			for (String key : blockz.keySet()) {
				if (!key.startsWith(DXFReader.generalIdentifier)) continue;
				String alias =
						key.substring(DXFReader.generalIdentifier.length())
								.split("\\(")[0].trim();
				if (spaceMap.containsKey(alias)) {
					GeometryLayer block = blockz.get(key);
					// minX, maxX, minY, maxY, minZ, maxZ;
					double [] limits = block.getLimits();

					String minPoint =
							"(" + BigDecimal.valueOf(limits[0]).toPlainString()
									+ "," + BigDecimal.valueOf(limits[2])
											.toPlainString()
									+ ")";
					String maxPoint =
							"(" + BigDecimal.valueOf(limits[1]).toPlainString()
									+ "," + BigDecimal.valueOf(limits[3])
											.toPlainString()
									+ ")";
					try {
						String aliasToMatch = spaceMap.get(alias);
						System.out.println(studyID);
						System.out.println(aliasToMatch);
						JSONArray foundSpaces =
								Database.selectAllFromTableWhere("spaces",
										"study_id=? AND alias=?", studyID,
										alias);
						String newFileName = studyID + "_" + alias + ".csv";
						FileIO.saveStrings(PLANS_DIR + newFileName,
								block.getAsCSV());
						// BufferedImage img = block.getImage(1280, 1024);
						BufferedImage img = block.getImage(1280);
						File outputfile =
								new File(
										PLANS_DIR + studyID + "_" + alias
												+ ".png");
//						ImageIO.write(img, "png", outputfile);

						Connection psql = Database.getConnection();
						if (aliasToMatch.equals("*")) {
							// alias is new
							if (foundSpaces.length() != 0)
								Database.update("spaces",
										"plan_min=CAST(? AS point), "
												+ "plan_max=CAST(? AS point), "
												+ "plan_path=?",
										"study_id=? AND alias=?",
										new Object [] {minPoint, maxPoint,
												newFileName, studyID, alias});
							// throw new MalformedDataException("Space "
							// + aliasToMatch + " already exists");
							// TODO: CHECK WHAT DO TO FOR OVERWRITES
							else
								Database.insertInto(psql, "spaces",
										"study_id,alias,plan_path,"
												+ "plan_min,plan_max",
										"?,?,?,CAST(? AS point),CAST(? AS point)",
										studyID, alias, newFileName, minPoint,
										maxPoint);
						} else {
							if (foundSpaces.length() != 1)
								throw new MalformedDataException(
										"Space " + aliasToMatch
												+ " does not exist");
							Database.update("spaces",
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
		JSONArray accSpaces = new JSONArray();
		if (paramsJSON.has("accSpaces")) {
			JSONArray acsp = paramsJSON.getJSONArray("accSpaces");
			for (int i = 0; i < acsp.length(); i++) {
				accSpaces.put(acsp.get(i));
			}
		}
		if (paramsJSON.has("teamSpaces")) {
			JSONArray acsp = paramsJSON.getJSONArray("teamSpaces");
			for (int i = 0; i < acsp.length(); i++) {
				accSpaces.put(acsp.get(i));
			}
		}

		if (accSpaces.length() > 0) {
			if (blockz == null) {
				Map<String, String> selectedSpaces =
						new HashMap<String, String>(accSpaces.length());
				for (int i = 0; i < accSpaces.length(); i++) {
					JSONObject space = accSpaces.getJSONObject(i);
					selectedSpaces.put(space.getString("alias"),
							space.getString("match"));
				}
				DXFReader dxf = new DXFReader();
				dxf.addData(FileIO.loadStrings(filePath));
				List<String []> entities = dxf.breakDXFEntities(dxf.ent);
				Map<String, String> spaceMap = new HashMap<String, String>();
				for (String [] ent : entities) {
					if (ent[0].equals("INSERT"))
						if (ent[2].startsWith(DXFReader.generalIdentifier)) {
						String alias =
								ent[2].substring(
										DXFReader.generalIdentifier.length())
										.split("\\(")[0].trim();
						if (selectedSpaces.containsKey(alias))
							spaceMap.put(alias, selectedSpaces.get(alias));
					}
				}
				blockz =
						getBlocks(dxf.breakDXFEntities(dxf.blk),
								MatrixMath.getIdentity(), scale);
			}
			try (Connection psql = Database.getConnection()) {
				Map<String, Integer> typeIDMap = new HashMap<String, Integer>();

				psql.setAutoCommit(false);
				boolean append = false;
				boolean appendTypes = true;
				for (String s : blockz.keySet()) {
					if (!s.startsWith(DXFReader.generalIdentifier)) continue;
					GeometryLayer block = blockz.get(s);
					String cleanName =
							s.substring(DXFReader.generalIdentifier.length())
									.split("\\(")[0];
					int lastDashIndex = cleanName.lastIndexOf("-");
					if (lastDashIndex == -1) continue;
					String alias = cleanName.substring(0, lastDashIndex).trim();

					JSONArray result = null;
					result =
							Database.selectAllFromTableWhere(psql, "spaces",
									"study_id = ? AND LOWER(alias) = LOWER(?)",
									String.valueOf(studyID), alias);

					if (result.length() != 1) {
						sendInterfaceError(response,
								"no such space (" + alias + ") found");
						return;
					}
					int spaceID = result.getJSONObject(0).getInt("id");

					String functeam =
							cleanName.substring(lastDashIndex + 1).trim()
									.toLowerCase();
					// System.out.println("functeam: " + functeam);
					if (!functeam.equals("acc") && !functeam.equals("team"))
						continue;
					if (functeam.equals("acc")) functeam = "func";

					if (!append) {
						Database.deleteFrom(psql, "polygons",
								"space_id=? AND functeam=?", spaceID, functeam);
					}
					GeometryLayer.Polyline [] allPolys = block.plines;
					Map<String, List<GeometryLayer.Polyline>> typeMap =
							new HashMap<String, List<GeometryLayer.Polyline>>();
					for (GeometryLayer.Polyline p : allPolys) {
						if (p.layer.toUpperCase().startsWith(
								DXFReader.generalIdentifier + "ACC-")) {
							String type =
									p.layer.substring(
											DXFReader.generalIdentifier.length()
													+ "ACC-".length());
							if (!typeMap.containsKey(type))
								typeMap.put(type,
										new ArrayList<GeometryLayer.Polyline>());
							typeMap.get(type).add(p);
						} else
							if (p.layer.toUpperCase().startsWith(
									DXFReader.generalIdentifier + "TEAM-")) {
							String type =
									p.layer.substring(
											DXFReader.generalIdentifier.length()
													+ "TEAM-".length());
							if (!typeMap.containsKey(type))
								typeMap.put(type,
										new ArrayList<GeometryLayer.Polyline>());
							typeMap.get(type).add(p);
						}
					}
					for (String type : typeMap.keySet()) {
						Integer typeID;
						System.out.println("type: " + type);
						if (typeIDMap.containsKey(type)) {
							typeID = typeIDMap.get(type);
						} else {
							result =
									Database.selectAllFromTableWhere(psql,
											"polygon_types",
											"LOWER(alias) = LOWER(?)", type);
							if (result.length() != 1) {
								if (appendTypes) {
									int nextVal =
											Database.getSequenceNextVal(
													"polygon_types_id_seq")
													.getJSONObject(0)
													.getInt("nextval");
									System.out.println(
											type + " not found. Appending as "
													+ nextVal);
									Database.insertInto(psql, "polygon_types",
											"id,alias,name,type_group",
											"?,?,?,?", nextVal, type, type,
											functeam);
									typeID = nextVal;
								} else
									throw new MalformedDataException(
											"no such type (" + type
													+ ") found");
							} else
								typeID = result.getJSONObject(0).getInt("id");
						}
						List<GeometryLayer.Polyline> polys = typeMap.get(type);
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
							// Database.insertInto(psql, "polygons",
							// "polygon,space_id,functeam,type_id",
							// "ST_GeomFromText(?),?,?,?", polyString,
							// spaceID, "func", typeID);

							Database.insertInto(psql, "polygons",
									"polygon,space_id,functeam,type_id",
									"(ST_Dump(ST_CollectionExtract("
											+ "ST_MakeValid(ST_GeomFromText(?))"
											+ ",3))).geom,?,?,?",
									polyString, spaceID, functeam, typeID);
						}
						puncturePolys(psql, spaceID, typeID, functeam);
					}
				}
				if (psql.isClosed())
					throw new InternalException("Connection is already closed");
				psql.commit();
				psql.setAutoCommit(true);
				psql.close();
				System.out.println("Done importing polygon types");
				if (psql.isClosed()) System.out.println("Connection closed");
			} catch (SQLException | ParseException e) {
				e.printStackTrace();
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			}
		}

		System.out.println("Done importing");
		new File(filePath).delete();
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

	class Tree {
		Integer id;
		Tree parent;
		Set<Tree> children;
		Tree(Integer id, Tree parent) {
			this.id = id;
			this.parent = parent;
			children = new HashSet<Tree>();
		}
	}
	void printTree(Tree tree, int depth) {
		for (int i = 0; i < depth; i++)
			System.out.print(" ");
		System.out.println(tree.id);
		depth++;
		for (Tree t : tree.children) {
			printTree(t, depth);
		}
	}
	/**
	 * Tree of polygons needs to be flattened, first depth layer is fill, second
	 * is hole of first, third is fill, fourth is hole of third. So we bring up
	 * odd numbers to first depth layer
	 * 
	 * @param base
	 *            The base trunk where the odd depth children will go
	 * @param tree
	 *            The currently examined tree
	 * @param depth
	 *            The current depth
	 */
	void flattenTree(Tree base, Tree tree, int depth) {
		depth++;
		for (Tree t : tree.children) {
			if (depth % 2 == 1) {
				base.children.add(t);
				t.parent = base;
			}
			flattenTree(base, t, depth);
		}
	}
	void puncturePolys(Connection psql, int spaceID, int typeID,
			String functeam) {
		Tree trunk = new Tree(null, null);
		Map<Integer, Tree> polymap = new HashMap<Integer, Tree>();
		List<SimpleEntry<Integer, Integer>> contains =
				new ArrayList<SimpleEntry<Integer, Integer>>();
		JSONArray result;
		try {
			result =
					Database.customQuery(psql,
							"SELECT id FROM polygons WHERE space_id=? AND type_id=? AND functeam=?",
							spaceID, typeID, functeam);
			for (int i = 0; i < result.length(); i++) {
				int id = result.getJSONObject(i).getInt("id");
				Tree t = new Tree(id, trunk);
				trunk.children.add(t);
				polymap.put(id, t);
			}
			if (polymap.size() == 0) {
				System.out.println("No polys found");
				return;
			}
			List<Integer> polyIDs = new ArrayList<Integer>(polymap.keySet());
			for (int i = 0; i < polyIDs.size() - 1; i++) {
				int id1 = polyIDs.get(i);
				for (int j = i + 1; j < polyIDs.size(); j++) {
					int id2 = polyIDs.get(j);
					// if (Database
					// .customQuery(
					// psql,
					// "SELECT splab_poly_contains_not_equals(?,?) AS contains",
					// String.valueOf(id1), String.valueOf(id2))
					// .getJSONObject(0).getString("contains")
					// .equalsIgnoreCase("t")) {
					// contains.add(new SimpleEntry<Integer, Integer>(id1,
					// id2));
					// } else if (Database
					// .customQuery(
					// psql,
					// "SELECT splab_poly_contains_not_equals(?,?) AS contains",
					// String.valueOf(id2), String.valueOf(id1))
					// .getJSONObject(0).getString("contains")
					// .equalsIgnoreCase("t")) {
					// contains.add(new SimpleEntry<Integer, Integer>(id2,
					// id1));
					// }
					String containsCheck =
							Database.customQuery(psql,
									"SELECT splab_poly_contains_or_equals(?,?) AS contains",
									String.valueOf(id1), String.valueOf(id2))
									.getJSONObject(0).getString("contains");
					if (containsCheck.equalsIgnoreCase("e")) {
						Database.deleteFrom(psql, "polygons", "id=?", id2);
					} else if (containsCheck.equalsIgnoreCase("c1")) {
						contains.add(
								new SimpleEntry<Integer, Integer>(id1, id2));
					} else if (containsCheck.equalsIgnoreCase("c2")) {
						contains.add(
								new SimpleEntry<Integer, Integer>(id2, id1));
					}
				}
			}
			for (SimpleEntry<Integer, Integer> entry : contains) {
				Tree container = polymap.get(entry.getKey());
				Tree contained = polymap.get(entry.getValue());
				contained.parent.children.remove(contained);
				container.children.add(contained);
				contained.parent = container;
			}
			// printTree(trunk, 0);
			flattenTree(trunk, trunk, 0);
			// System.out.println(typeID);
			// printTree(trunk, 0);
			for (Tree tree : trunk.children) {
				if (tree.children.size() == 0) continue;
				String idArray = "{";
				int i = 0;
				for (Tree hole : tree.children) {
					if (i != 0) idArray += ",";
					idArray += String.valueOf(hole.id);
					i++;
				}
				idArray += "}";
				Database.customQuery(psql,
						"SELECT splab_puncture_poly(?,?::integer[])",
						String.valueOf(tree.id), idArray);
			}
		} catch (SQLException | ParseException | ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
