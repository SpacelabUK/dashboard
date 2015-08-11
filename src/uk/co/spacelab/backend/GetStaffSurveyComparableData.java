package uk.co.spacelab.backend;

import java.io.File;
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

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.json.JSONObject;

/**
 * Servlet implementation class GetStaffSurveyComparableData
 */
@WebServlet("/GetStaffSurveyComparableData")
@MultipartConfig(
        location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/Database/data/upload/temp",
        fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
        maxRequestSize = 1024 * 1024 * 5 * 5)
public class GetStaffSurveyComparableData extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputFileType = "vna";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetStaffSurveyComparableData() {
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
		response.getWriter().append("Served at: ")
		        .append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
	        HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		if (request.getCharacterEncoding() == null) {
			response.setContentType("text/html;charset=UTF-8");
			Subject currentUser = SecurityUtils.getSubject();
			Session session = currentUser.getSession();
			System.out.println(request.getParameterMap());
			if (!validParam(request.getParameterMap(), "studyid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
				        "malformed data... -_-");
				return;
			}
			response.setContentType("text/json;charset=UTF-8");
			String fileName = null;
			if (!validParam(request.getParameterMap(), "fileid")) {

				fileName = FileHandler.uploadTempFileAndGetAlias(request,
				        "staff", inputFileType, 3600);
				SplabSessionListener.getTempFiles(session)
				        .add(fileName + "." + inputFileType);
			} else fileName = request.getParameter("fileid");
			// JSONObject dataIn = null;
			if (!validParam(request.getParameterMap(), "datain")) {
				getDataToValidate(request, response,
				        System.getProperty("java.io.tmpdir") + fileName + "."
				                + inputFileType,
				        fileName);
				return;

			}
		}
	}

	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
		        && params.get(param).length == 1;
	}

	private void getDataToValidate(HttpServletRequest request,
	        HttpServletResponse response, String filePath, String fileid)
	                throws IOException, ServletException {

		int studyID = Integer.parseInt(request.getParameter("studyid"));
		try {
			JSONObject out = new StaffSurveyReader()
			        .getStaticData(new File(filePath), fileid, studyID);
			if (null == out) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			PrintWriter pw = response.getWriter();
			pw.print(out.toString());
			// } catch (ClassNotFoundException e) {
			// e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
