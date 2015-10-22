package uk.co.spacelab.controller;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;

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
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.backend.SplabSessionListener;
import uk.co.spacelab.backend.in.SQLiteToPostgreSQL;

/**
 * Servlet implementation class GetObservationComparableData
 */
@WebServlet("/GetObservationComparableData")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class GetObservationComparableData extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputDataType = "observation";
	private static final String inputFileType = "db";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetObservationComparableData() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		if (request.getCharacterEncoding() == null) {
			if (!validParam(request.getParameterMap(), "studyid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"studyid undefined");
				return;
			}
			response.setContentType("text/html;charset=UTF-8");

			int studyID = Integer.parseInt(request.getParameter("studyid"));
			response.setContentType("text/html;charset=UTF-8");
			Subject currentUser = SecurityUtils.getSubject();
			Session session = currentUser.getSession();
			System.out.println(request.getParameterMap());
			if (!validParam(request.getParameterMap(), "studyid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"malformed data... -_-");
				return;
			}
			final PrintWriter writer = response.getWriter();

			try {
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
				SplabSessionListener.cleanTempFilesOfType(session,
						inputDataType, temp.length());
				SplabSessionListener.getTempFiles(session)
						.add(inputDataType + fileID + "." + inputFileType);
				JSONObject result =
						SQLiteToPostgreSQL.getSpaces(studyID,
								temp.getAbsolutePath());
				System.out.println(fileID);
				System.out.println(result);
				result.put("fileid", fileID);
				response.setContentType("application/json; charset=UTF-8");
				response.getWriter().print(result.toString());
			} catch (FileNotFoundException fne) {
				writer.println(
						"You either did not specify a file to upload or are "
								+ "trying to upload a file to a protected or nonexistent "
								+ "location.");
				System.err.println("Problems during file upload. Error: {0}"
						+ fne.getMessage());
			} catch (ClassNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				if (writer != null) {
					writer.close();
				}
			}
		}
	}
}
