package uk.co.spacelab.backend;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class ValidateDepthmap
 */
@WebServlet("/ValidateDepthmap")
@MultipartConfig(
		location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/SpLab-BackEnd/data/upload/temp",
		fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class ValidateDepthmap extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public ValidateDepthmap() {
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
		processRequest(request, response);
	}

	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		if (request == null || request.getParameterMap().size() == 0
				|| !request.getParameterMap().containsKey("spaces")
				|| !request.getParameterMap().containsKey("studyid")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no data received -_-");
			return;
		}
		response.setContentType("text/json;charset=UTF-8");

		int studyID = Integer.parseInt(request.getParameter("studyid"));

		try {
			JSONArray spaces = new JSONArray(request.getParameter("spaces"));
			for (int i = 0; i < spaces.length(); i++) {
				String alias = spaces.getJSONObject(i).getString("alias");
				JSONArray dbresult =
						Database.selectAllFromTableWhere("spaces",
								"study_id = ? AND LOWER(alias) = LOWER(?)",
								String.valueOf(studyID), alias);

				if (dbresult.length() != 1) {
					spaces.remove(i);
				}
			}
		} catch (JSONException | ArrayIndexOutOfBoundsException | SQLException
				| ParseException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"ohai.. malformed data...");
		}
		// Create path components to save the file
		final String path =
				"/Users/petros/Dropbox/ktp2013/code/Eclipse/SpLab-BackEnd/data/upload/";
		// request.getParameter("destination");
		// System.out.println(path);
		final Part filePart = request.getPart("file");
		final String fileName = getFileName(filePart);

		OutputStream out = null;
		InputStream filecontent = null;
		final PrintWriter writer = response.getWriter();
		writer.println(studyID);

		try {
			out =
					new FileOutputStream(new File(path + File.separator
							+ fileName));
			filecontent = filePart.getInputStream();

			int read = 0;
			final byte [] bytes = new byte [1024];

			while ((read = filecontent.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			// SQLiteToPostgreSQL.convert(studyID, path + fileName);
			String uuid =
					Long.toHexString(Double.doubleToLongBits(Math.random()));
			writer.println(uuid);
			// writer.println("New file " + fileName + " created at " + path);
			System.out.println("File{0}being uploaded to {1}" + fileName + " "
					+ path);
		} catch (FileNotFoundException fne) {
			writer.println("You either did not specify a file to upload or are "
					+ "trying to upload a file to a protected or nonexistent "
					+ "location.");
			// writer.println("<br/> ERROR: ");

			System.err.println("Problems during file upload. Error: {0}"
					+ fne.getMessage());
			// } catch (ClassNotFoundException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
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
		for (String content : part.getHeader("content-disposition").split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
						.replace("\"", "");
			}
		}
		return null;
	}

}
