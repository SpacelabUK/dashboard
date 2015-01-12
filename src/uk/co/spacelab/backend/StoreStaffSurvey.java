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

/**
 * Servlet implementation class StoreStaffSurvey
 */
@WebServlet("/StoreStaffSurvey")
@MultipartConfig(
		location = "/Users/petros/Dropbox/ktp2013/code/Eclipse/SpLab-BackEnd/data/upload/temp",
		fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5,
		maxRequestSize = 1024 * 1024 * 5 * 5)
public class StoreStaffSurvey extends HttpServlet {
	private static final long serialVersionUID = 1L;

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
		processRequest(request, response);
	}
	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		if (!validParam(request.getParameterMap(), "studyid")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"malformed data... -_-");
			return;
		}
		int studyID = Integer.parseInt(request.getParameter("studyid"));
		response.setContentType("text/html;charset=UTF-8");

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
			new StaffSurveyReader().convert(path + fileName, studyID);
			// Database.insertInto("asdadsa", "asdf", new String [] {"asdf"});
			// BufferedReader reader = null;
			//
			// try {
			// File file = new File(path + fileName);
			// file.deleteOnExit();
			// reader = new BufferedReader(new FileReader(file));
			//
			// String line;
			// while ((line = reader.readLine()) != null) {
			// System.out.println(line);
			// }
			//
			// } catch (IOException e) {
			// e.printStackTrace();
			// } finally {
			// try {
			// reader.close();
			// } catch (IOException e) {
			// e.printStackTrace();
			// }
			// }
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
			// } catch (SQLException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
			// } catch (ParseException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
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
		for (String content : part.getHeader("content-disposition").split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
						.replace("\"", "");
			}
		}
		return null;
	}

}
