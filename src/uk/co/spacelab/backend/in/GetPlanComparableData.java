package uk.co.spacelab.backend.in;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.InternalException;
import uk.co.spacelab.backend.SplabSessionListener;
import uk.co.spacelab.backend.Util;
import uk.co.spacelab.backend.Database.COL;
import uk.co.spacelab.backend.Database.TABLE;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.dxf.DXFReader;
import uk.co.spacelab.fileio.FileIO;

/**
 * Servlet implementation class GetPlanComparableData
 */
@WebServlet("/GetPlanComparableData")
public class GetPlanComparableData extends FlowUpload {
	private static final long serialVersionUID = 1L;
	private static final String accIdentifier = "-ACC";
	private static final String teamIdentifier = "-TEAM";
	private static final String inputDataType = "plan";
	private static final String inputFileType = "dxf";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetPlanComparableData() {
		super();
		// TODO Auto-generated constructor stub
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		get(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

		Subject currentUser = SecurityUtils.getSubject();
		Session session = currentUser.getSession();

		String UPLOAD_DIR = null, PLANS_DIR = null;
		try {
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

		if (request.getCharacterEncoding() == null) {

			if (!Util.validParam(request.getParameterMap(), "flowIdentifier"))
				return;
			int studyID = Integer.parseInt(request.getParameter("studyid"));

			String filePath = post(request, response);
			// String filePath = get(request, response,
			// Database.getUploadDirectory());
			if (filePath != null) {

				String fileID = null;
				File temp = null;
				if (!validParam(request.getParameterMap(), "fileid")) {
					temp =
							FileHandler.createTempFile(inputDataType,
									"." + inputFileType);
					fileID =
							temp.getName().substring(inputDataType.length(),
									temp.getName().length()
											- ("." + inputFileType).length());
				} else {
					fileID = request.getParameter("fileid");
					temp =
							FileHandler.getTempFile(inputDataType, fileID,
									inputFileType);
				}
				if (!temp.exists()) {
					sendInterfaceError(response,
							"File has expired, restart the process");
					return;
				}
				SplabSessionListener.cleanTempFilesOfType(session,
						inputDataType, temp.length());
				new File(filePath).renameTo(temp);
				filePath = temp.getAbsolutePath();
				SplabSessionListener.getTempFiles(session).add(temp.getName());

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
										DXFReader.generalIdentifier.length())
										.split("\\(")[0].trim();
						if (alias.toUpperCase().endsWith(accIdentifier)) {
							alias =
									alias.substring(0, alias.length()
											- accIdentifier.length());
							o.put("name", alias);
							o.put("alias", alias);
							accSpaces.put(o);
						} else
							if (alias.toUpperCase().endsWith(teamIdentifier)) {
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
					if (layers == null) layers = dxf.breakDXFEntities(dxf.layr);
					for (String [] ent : layers) {
						if (ent[0].equals("LAYER")) {
							if (ent[2].toUpperCase().startsWith(
									DXFReader.generalIdentifier + "ACC-")) {
								accLayerSet.add(ent[2].substring(
										DXFReader.generalIdentifier.length()
												+ "ACC-".length()));
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
								Database.selectAllFromTable("polygon_types");
						for (JSONObject type : accLayers) {
							for (int i = 0; i < accLayersInDB.length(); i++) {
								String dbAlias =
										accLayersInDB.getJSONObject(i)
												.getString(
														Database.COL.POLYGON_TYPES_ALIAS
																.toString());
								if (dbAlias.equalsIgnoreCase(
										type.getString("alias"))) {
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
					if (layers == null) layers = dxf.breakDXFEntities(dxf.layr);
					for (String [] ent : layers) {
						if (ent[0].equals("LAYER")) {
							if (ent[2].toUpperCase().startsWith(
									DXFReader.generalIdentifier + "TEAM-")) {
								teamLayers.add(ent[2].substring(
										DXFReader.generalIdentifier.length()
												+ "TEAM-".length()));
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
									spacesInDB.getJSONObject(i)
											.getString(Database.COL.SPACES_ALIAS
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
									accSpacesInDB.getJSONObject(i)
											.getString("space_alias");
							for (int j = 0; j < accSpaces.length(); j++) {
								JSONObject space = accSpaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(
										alias + accIdentifier)) {
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
									teamSpacesInDB.getJSONObject(i)
											.getString("space_alias");
							for (int j = 0; j < teamSpaces.length(); j++) {
								JSONObject space = teamSpaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(
										alias + accIdentifier)) {
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
				// final File file = new File(filePath);
				// filePath = UUID.randomUUID().toString();
				// FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
				// file.renameTo(new File());
				result.put("fileid", fileID);
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
				// result.put("expire", new Date(
				// new Date().getTime() + minutesToExpire * 60 * 1000));

				response.setContentType("application/json; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.print(result.toString());
			}
		}
	}
}
