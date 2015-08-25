package uk.co.spacelab.backend.in;

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

import uk.co.spacelab.backend.Constants;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.backend.SplabSessionListener;

/**
 * Servlet implementation class GetStaffSurveyComparableData
 */
@WebServlet("/GetStaffSurveyComparableData")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class GetStaffSurveyComparableData extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputDataType = "staff";
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
			String fileID = null;
			if (!validParam(request.getParameterMap(), "fileid")) {

				fileID =
						FileHandler
								.uploadTempFileAndGetAlias(request,
										inputDataType, inputFileType, 3600)
								.substring(inputDataType.length());
			} else fileID = request.getParameter("fileid");
			File temp =
					FileHandler.getTempFile(inputDataType, fileID,
							inputFileType);
			if (!temp.exists()) {
				sendInterfaceError(response,
						"File has expired, restart the process");
				return;
			}
			SplabSessionListener.cleanTempFilesOfType(session, inputDataType,
					temp.length());
			SplabSessionListener.getTempFiles(session).add(temp.getName());
			if (!validParam(request.getParameterMap(), "datain")) {
				getDataToValidate(request, response, temp, fileID);
				return;

			}
		}
	}

	private void getDataToValidate(HttpServletRequest request,
			HttpServletResponse response, File file, String fileid)
					throws IOException, ServletException {

		int studyID = Integer.parseInt(request.getParameter("studyid"));
		try {
			JSONObject out =
					new StaffSurveyReader().getStaticData(file, studyID);
			if (null == out) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			out.put("fileid", fileid);
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
