package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

/**
 * Servlet implementation class StoreStakeholders
 */
@WebServlet("/StoreStakeholders")
@MultipartConfig(
		location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/SpLab-BackEnd/data/upload/temp",
		fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class StoreStakeholders extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreStakeholders() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}

	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		if (request.getCharacterEncoding() == null) {
			System.out.println(request.getParameterMap());
			if (!validParam(request.getParameterMap(), "studyid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"malformed data... -_-");
				return;
			}
			response.setContentType("text/json;charset=UTF-8");
			String fileName = null;
			if (!validParam(request.getParameterMap(), "fileid"))
				fileName =
						FileHandler
								.uploadFileAndGetAlias(request, "xlsx", 3600);
			else fileName = request.getParameter("fileid");
			JSONObject dataIn = null;
			if (!validParam(request.getParameterMap(), "datain")) {
				getDataToValidate(request, response, FileHandler.path
						+ fileName + ".xlsx", fileName);
				return;

			}
		} else {
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			int studyID = paramsJSON.getInt("studyid");
			String fileName = paramsJSON.getString("fileid");
			JSONObject datain = paramsJSON.getJSONObject("datain");
			try {
				new StakeholderReader().convert(FileHandler.path + fileName
						+ ".xlsx", studyID, datain);
			} catch (ClassNotFoundException | SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	private void getDataToValidate(HttpServletRequest request,
			HttpServletResponse response, String filePath, String fileid)
			throws IOException, ServletException {

		int studyID = Integer.parseInt(request.getParameter("studyid"));
		try {
			JSONObject out =
					new StakeholderReader().getStaticData(filePath, fileid,
							studyID);
			PrintWriter pw = response.getWriter();
			pw.print(out.toString());
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
