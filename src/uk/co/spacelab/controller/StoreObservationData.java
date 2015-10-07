package uk.co.spacelab.controller;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.MalformedDataException;
import uk.co.spacelab.backend.SplabSessionListener;
import uk.co.spacelab.backend.in.SQLiteToPostgreSQL;

/**
 * Servlet implementation class UploadGatheredData
 */
@WebServlet("/StoreObservationData")
public class StoreObservationData extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputDataType = "observation";
	private static final String inputFileType = "db";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreObservationData() {
		super();
		// TODO Auto-generated constructor stub
	}

	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
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
		if (request.getCharacterEncoding() != null)  {
			try {
				updateDatabase(request, response);
			} catch (ClassNotFoundException | SQLException | ParseException e) {
				e.printStackTrace();
			}
		}
	}

	private String getFileName(final Part part) {
		final String partHeader = part.getHeader("content-disposition");
		System.out.println("Part Header = {0}" + partHeader);
		for (String content : part.getHeader("content-disposition")
				.split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
						.replace("\"", "");
			}
		}
		return null;
	}
	private void updateDatabase(HttpServletRequest request,
			HttpServletResponse response) throws ClassNotFoundException,
					IOException, SQLException, ParseException {
		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		String fileName;
		// Integer observationID;
		Integer studyID;
		JSONArray spaces;
		try {
			fileName = paramsJSON.getString("fileid");
			// observationID = paramsJSON.getInt("observationid");
			studyID = paramsJSON.getInt("studyid");
			spaces = paramsJSON.getJSONArray("spaces");
		} catch (NullPointerException e) {
			throw new MalformedDataException("Malformed data buddy... -.-");
		}
		String UPLOAD_DIR = Database.getUploadDirectory();
		System.out.println(
				UPLOAD_DIR + " exists: " + new File(UPLOAD_DIR).exists());
		SQLiteToPostgreSQL.convert(studyID,
				FileHandler.getTempFile(inputDataType, fileName, inputFileType)
						.getAbsolutePath());
	}
}
