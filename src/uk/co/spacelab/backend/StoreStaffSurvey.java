package uk.co.spacelab.backend;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Collection;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.json.JSONObject;

/**
 * Servlet implementation class StoreStaffSurvey
 */
@WebServlet("/StoreStaffSurvey")
@MultipartConfig(
		location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/Database/data/upload/temp",
		fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class StoreStaffSurvey extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputFileType = "vna";
	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreStaffSurvey() {
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
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		response.setContentType("text/html;charset=UTF-8");
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
						FileHandler.uploadFileAndGetAlias(request,
								inputFileType, 3600);
			else fileName = request.getParameter("fileid");
			JSONObject dataIn = null;
			if (!validParam(request.getParameterMap(), "datain")) {
				getDataToValidate(request, response, FileHandler.path
						+ fileName + "." + inputFileType, fileName);
				return;

			}
		} else {
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			int studyID = paramsJSON.getInt("studyid");
			String fileName = paramsJSON.getString("fileid");
			JSONObject datain = paramsJSON.getJSONObject("datain");
			System.out.println(datain);
			final PrintWriter writer = response.getWriter();

			try {
				new StaffSurveyReader().convert(FileHandler.path + fileName
						+ "." + inputFileType, studyID, datain);
				System.out.println("Done");
			} catch (ClassNotFoundException | SQLException | ParseException e) {
				e.printStackTrace();
			} finally {
				if (writer != null) {
					writer.close();
				}
			}

		}

	}
	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
	private String getFileName(final Part part) {
		final String partHeader = part.getHeader("content-disposition");
		System.out.println("Part Header = {0}" + partHeader);
		for (String content : part.getHeader("content-disposition").split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
						.replace("\"", "");
			}
		}
		return null;
	}

	private void getDataToValidate(HttpServletRequest request,
			HttpServletResponse response, String filePath, String fileid)
			throws IOException, ServletException {

		int studyID = Integer.parseInt(request.getParameter("studyid"));
		try {
			JSONObject out =
					new StaffSurveyReader().getStaticData(filePath, fileid,
							studyID);
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
