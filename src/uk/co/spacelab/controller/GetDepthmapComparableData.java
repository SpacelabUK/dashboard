package uk.co.spacelab.controller;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.SplabSessionListener;
import uk.co.spacelab.backend.Util;
import uk.co.spacelab.backend.in.FlowUpload;
import uk.co.spacelab.dxf.DXFReader;

/**
 * Servlet implementation class GetDeptghmapComparableData
 */
@WebServlet("/GetDepthmapComparableData")
public class GetDepthmapComparableData extends FlowUpload {
	private static final long serialVersionUID = 1L;
	private static final String inputPlanDataType = "depthmapdxf";
	private static final String inputPlanFileType = "dxf";
	private static final String inputDepthDataType = "depthmapcsv";
	private static final String inputDepthFileType = "csv";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetDepthmapComparableData() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		get(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Subject currentUser = SecurityUtils.getSubject();
		Session session = currentUser.getSession();
		if (request.getCharacterEncoding() == null) {
			if (!Util.validParam(request.getParameterMap(), "flowIdentifier"))
				return;
			int studyID = Integer.parseInt(request.getParameter("studyid"));
			String filePath = post(request, response);
			if (filePath != null) {
				JSONObject result = new JSONObject();
				if (filePath.toUpperCase().endsWith(".DXF")) {

					String fileID = null;
					File temp = null;
					if (!validParam(request.getParameterMap(), "fileid")) {
						temp =
								FileHandler.createTempFile(inputPlanDataType,
										"." + inputPlanFileType);
						fileID =
								temp.getName().substring(
										inputPlanDataType.length(),
										temp.getName().length()
												- ("." + inputPlanFileType)
														.length());
					} else {
						fileID = request.getParameter("fileid");
						temp =
								FileHandler.getTempFile(inputPlanDataType,
										fileID, inputPlanFileType);
					}
					if (!temp.exists()) {
						sendInterfaceError(response,
								"File has expired, restart the process");
						return;
					}
					SplabSessionListener.cleanTempFilesOfType(session,
							inputPlanDataType, temp.length());
					new File(filePath).renameTo(temp);
					filePath = temp.getAbsolutePath();
					SplabSessionListener.getTempFiles(session)
							.add(temp.getName());

					JSONArray spaces = new JSONArray();
					DXFReader dxf = new DXFReader();
					dxf.addData(IOUtils.readLines(
							FileUtils.openInputStream(new File(filePath))));
					List<String []> entities = dxf.breakDXFEntities(dxf.ent);
					for (String [] ent : entities) {
						if (ent[0].equals("INSERT"))
							if (ent[2]
									.startsWith(DXFReader.generalIdentifier)) {
							JSONObject o = new JSONObject();
							String alias =
									ent[2].substring(DXFReader.generalIdentifier
											.length()).split("\\(")[0].trim();
							o.put("name", alias);
							o.put("alias", alias);
							spaces.put(o);
						}
					}
					JSONArray spacesInDB = new JSONArray();
					try {
						spacesInDB =
								Database.selectWhatFromTableWhere("spaces",
										Database.COL.SPACES_ALIAS.toString()
												+ ","
												+ Database.COL.SPACES_PLAN_MIN
														.toString()
												+ ","
												+ Database.COL.SPACES_PLAN_MAX
														.toString()
														// + ","
														// +
														// Database.COL.SPACES_ID
														// .toString()
						, Database.COL.SPACES_STUDY_ID + "=?",
										String.valueOf(studyID));
						for (int i = 0; i < spacesInDB.length(); i++) {
							JSONObject spaceDB = spacesInDB.getJSONObject(i);
							String aliasInDB =
									spaceDB.getString(Database.COL.SPACES_ALIAS
											.toString());
							if (!spaceDB.has(
									Database.COL.SPACES_PLAN_MIN.toString())
									|| !spaceDB.has(Database.COL.SPACES_PLAN_MAX
											.toString())) {
								// space does not have plan (maybe just function
								// polys, or staff data)
								spacesInDB.remove(i);
								continue;
							}
							spaceDB.remove(
									Database.COL.SPACES_PLAN_MIN.toString());
							spaceDB.remove(
									Database.COL.SPACES_PLAN_MAX.toString());
							for (int j = 0; j < spaces.length(); j++) {
								JSONObject space = spaces.getJSONObject(j);
								String alias = space.getString("alias");
								if (aliasInDB.equalsIgnoreCase(alias)) {

									space.put("prematch", aliasInDB);
									break;
								}
							}
						}
					} catch (SQLException | ParseException e) {
						e.printStackTrace();
					}
					System.out.println(spacesInDB);
					if (spacesInDB.length() == 0) {
						sendInterfaceError(response,
								"No spaces found to match, make sure the plans are imported first");
						return;
					}
					result.put("SPACES_FILE", spaces);
					result.put("SPACES_DATABASE", spacesInDB);
					// final File file = new File(filePath);
					// filePath = UUID.randomUUID().toString();
					// FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
					result.put("fileid", fileID);
					result.put("studyid", studyID);
				} else if (filePath.toUpperCase().endsWith(".CSV")) {
					String fileID = null;
					File temp = null;
					if (!validParam(request.getParameterMap(), "fileid")) {
						temp =
								FileHandler.createTempFile(inputDepthDataType,
										"." + inputDepthFileType);
						fileID =
								temp.getName().substring(
										inputDepthDataType.length(),
										temp.getName().length()
												- ("." + inputDepthFileType)
														.length());
					} else {
						fileID = request.getParameter("fileid");
						temp =
								FileHandler.getTempFile(inputDepthDataType,
										fileID, inputDepthFileType);
					}
					if (!temp.exists()) {
						// look in SplabSessionListener
						sendInterfaceError(response,
								"File has expired, restart the process");
						return;
					}
					SplabSessionListener.cleanTempFilesOfType(session,
							inputDepthDataType, temp.length());
					new File(filePath).renameTo(temp);
					filePath = temp.getAbsolutePath();
					SplabSessionListener.getTempFiles(session)
							.add(temp.getName());

					JSONArray measures = new JSONArray();
					result.put("measures", measures);
					// final File file = new File(filePath);
					// filePath = UUID.randomUUID().toString();
					// FileIO.copyFile(file, UPLOAD_DIR + "/" + filePath);
					result.put("fileid", fileID);
					result.put("studyid", studyID);
				}
				int minutesToExpire = 1;
				result.put("expire", new Date(
						new Date().getTime() + minutesToExpire * 60 * 1000));

				response.setContentType("application/json; charset=UTF-8");

				response.getWriter().print(result.toString());
			}
		}
	}

}
