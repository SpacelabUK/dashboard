package uk.co.spacelab.controller;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;

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

import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.MalformedDataException;
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.backend.SplabSessionListener;
import uk.co.spacelab.backend.in.StakeholderReader;

/**
 * Servlet implementation class GetStakeholderComparableData
 */
@WebServlet("/GetStakeholderComparableData")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class GetStakeholderComparableData extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputDataType = "stakeholders";
	private static final String inputFileType = "xlsx";
	public GetStakeholderComparableData() {
		super();
	}
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		Subject currentUser = SecurityUtils.getSubject();
		Session session = currentUser.getSession();
		response.setContentType("text/json;charset=UTF-8");
		if (request.getCharacterEncoding() == null) {
			System.out.println(request.getParameterMap());
			if (!validParam(request.getParameterMap(), "studyid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"malformed data... -_-");
				return;
			}
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
			SplabSessionListener.cleanTempFilesOfType(session, inputDataType,
					temp.length());
			SplabSessionListener.getTempFiles(session)
					.add(inputDataType + fileID + "." + inputFileType);
			JSONObject dataIn = null;
			if (!validParam(request.getParameterMap(), "datain")) {
				try {
					getDataToValidate(request, response, temp, fileID);
				} catch (MalformedDataException e) {
					sendInterfaceError(response, e.getLocalizedMessage());
				}
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
					new StakeholderReader().getStaticData(file, studyID);
			out.put("fileid", fileid);
			PrintWriter pw = response.getWriter();
			pw.print(out.toString());
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
}
