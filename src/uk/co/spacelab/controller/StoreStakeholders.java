package uk.co.spacelab.controller;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.json.JSONObject;

import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.SplabHttpServlet;
import uk.co.spacelab.backend.in.StakeholderReader;

/**
 * Servlet implementation class StoreStakeholders
 */
@WebServlet("/StoreStakeholders")
public class StoreStakeholders extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String inputDataType = "stakeholders";
	private static final String inputFileType = "xlsx";
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

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}

	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		Subject currentUser = SecurityUtils.getSubject();
		Session session = currentUser.getSession();
		response.setContentType("text/json;charset=UTF-8");
		if (request.getCharacterEncoding() != null) {
			JSONObject paramsJSON = JSONHelper.decodeRequest(request);
			int studyID = paramsJSON.getInt("studyid");
			File file =
					FileHandler.getTempFile(inputDataType,
							paramsJSON.getString("fileid"), inputFileType);
			if (!file.exists()) {
				// look in SplabSessionListener
				sendInterfaceError(response,
						"File has expired, restart the process");
				return;
			}
			JSONObject datain = paramsJSON.getJSONObject("datain");
			try {
				new StakeholderReader().convert(file, studyID, datain);
			} catch (ClassNotFoundException | SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				file.delete();
			}
		}
	}

}
