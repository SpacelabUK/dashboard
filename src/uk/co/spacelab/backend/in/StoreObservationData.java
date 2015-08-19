package uk.co.spacelab.backend.in;

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

import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.MalformedDataException;

/**
 * Servlet implementation class UploadGatheredData
 */
@WebServlet("/StoreObservationData")
@MultipartConfig(
		location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/Database/data/upload/temp",
		fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class StoreObservationData extends HttpServlet {
	private static final long serialVersionUID = 1L;

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
		// TODO Auto-generated method stub
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
			if (!validParam(request.getParameterMap(), "observationid")) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"observationid undefined");
				return;
			}
			processRequest(request, response);
		} else {
			try {
				updateDatabase(request, response);
			} catch (ClassNotFoundException | SQLException | ParseException e) {
				e.printStackTrace();
			}
		}
	}
	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");

		int studyID = Integer.parseInt(request.getParameter("studyid"));
		int observationID =
				Integer.parseInt(request.getParameter("observationid"));
		// Create path components to save the file
		// final String path =
		// "/Users/petros/Dropbox/ktp2013/code/Eclipse/Database/data/upload/";

		String UPLOAD_DIR = Database.getUploadDirectory();
		// request.getParameter("destination");
		// System.out.println(path);
		final Part filePart = request.getPart("file");
		final String fileName = getFileName(filePart);

		OutputStream out = null;
		InputStream filecontent = null;
		final PrintWriter writer = response.getWriter();

		try {
			out = new FileOutputStream(new File(UPLOAD_DIR + fileName));
			filecontent = filePart.getInputStream();

			int read = 0;
			final byte [] bytes = new byte [1024];

			while ((read = filecontent.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			// writer.println("New file " + fileName + " created at " + path);

			// System.out.println(UPLOAD_DIR + fileName + " exists: "
			// + new File(UPLOAD_DIR + fileName).exists());
			JSONObject result =
					SQLiteToPostgreSQL.getSpaces(observationID,
							UPLOAD_DIR + fileName);
			// System.out.println(UPLOAD_DIR + fileName + " exists: "
			// + new File(UPLOAD_DIR + fileName).exists());
			String newFileName = UUID.randomUUID().toString();
			new File(UPLOAD_DIR + fileName)
					.renameTo(new File(UPLOAD_DIR + newFileName + ".db"));
			result.put("fileid", newFileName);
			response.setContentType("application/json; charset=UTF-8");
			response.getWriter().print(result.toString());

			System.out.println("File{0}being uploaded to {1}" + fileName + " "
					+ UPLOAD_DIR);
		} catch (FileNotFoundException fne) {
			writer.println("You either did not specify a file to upload or are "
					+ "trying to upload a file to a protected or nonexistent "
					+ "location.");
			// writer.println("<br/> ERROR: ");

			System.err.println("Problems during file upload. Error: {0}"
					+ fne.getMessage());
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			if (out != null) {
				out.close();
			}
			if (filecontent != null) {
				filecontent.close();
			}
			if (writer != null) {
				writer.close();
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
		Integer observationID;
		JSONArray spaces;
		try {
			fileName = paramsJSON.getString("fileid");
			observationID = paramsJSON.getInt("observationid");
			spaces = paramsJSON.getJSONArray("spaces");
		} catch (NullPointerException e) {
			throw new MalformedDataException("Malformed data buddy... -.-");
		}
		String UPLOAD_DIR = Database.getUploadDirectory();
		System.out.println(
				UPLOAD_DIR + " exists: " + new File(UPLOAD_DIR).exists());
		SQLiteToPostgreSQL.convert(observationID,
				UPLOAD_DIR + fileName + ".db");
	}
}
