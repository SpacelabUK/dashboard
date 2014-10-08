package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class getDevices
 */
@WebServlet("/GetAll")
public class GetAll extends HttpServlet {
	private static final long serialVersionUID = 1L;

	public GetAll() {
		super();
	}
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Map<String, String []> params = request.getParameterMap();
		if (params == null || !params.containsKey("t")
				|| params.get("t") == null && params.get("t").length != 1) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"type undefined");
			return;
		}
		String type = params.get("t")[0];
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		try {
			if (type.equals("devices") || type.equals("projects")
					|| type.equals("spatial_functions")) {
				out.println(Database.getAllFromTable(type));
			} else if (type.equals("openstudies")) {
				out.println(Database.getAllFromTableWhere("studies",
						"status='open'"));
			} else if (type.equals("study_parts")
					&& params.containsKey("studyid")
					&& params.get("studyid") != null) {
				if (Database.getAllFromTableWhere("studies", "id=?",
						params.get("studyid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such study exists");
				out.println(Database.getAllFromTableWhere("observations",
						"study_id=?", params.get("studyid")));
			} else if (type.equals("studies")
					&& params.containsKey("projectid")
					&& params.get("projectid") != null) {
				if (Database.getAllFromTableWhere("projects", "id=?",
						params.get("projectid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such study exists");
				out.println(Database.getAllFromTableWhere("studies",
						"project_id=?", params.get("projectid")));
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"unknown request");
			}
		} catch (ClassNotFoundException | SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}
