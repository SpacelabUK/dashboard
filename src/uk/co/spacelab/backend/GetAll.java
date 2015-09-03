package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Map;

import javax.security.auth.Subject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet implementation class getDevices
 */
@WebServlet("/GetAll")
public class GetAll extends SplabHttpServlet {
	private static final long serialVersionUID = 1L;

	public GetAll() {
		super();
	}
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// System.out.println(SecurityUtils.getSubject());
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
			if (type.equals("devices") || type.equals("projects")) {
				out.println(Database.selectAllFromTable(type));
			} else if (type.equals("spatial_functions")) {
				out.println(Database.selectAllFromTableWhere("polygon_types",
						"type_group='func'"));
			} else if (type.equals("allstudies")) {
				JSONArray result =
						Database.customQuery(
								"SELECT * FROM splab_get_studies()");
				if (result.length() < 1) {
					sendInterfaceError(response, "Not found");
					return;
				}
				String data =
						result.getJSONObject(0).getString("splab_get_studies");
				out.println(new JSONArray(data));
			} else if (type.equals("openstudies")) {
				out.println(Database.selectAllFromTableWhere("studies",
						"status='open'"));
			} else
				if (type.equals("study_parts") && params.containsKey("studyid")
						&& params.get("studyid") != null) {
				if (Database.selectAllFromTableWhere("studies", "id=?",
						params.get("studyid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such study exists");
				out.println(Database.selectAllFromTableWhere("observations",
						"study_id=?", params.get("studyid")));
			} else
					if (type.equals("studies")
							&& params.containsKey("projectid")
							&& params.get("projectid") != null) {
				if (Database.selectAllFromTableWhere("projects", "id=?",
						params.get("projectid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such project exists");
				out.println(Database.selectAllFromTableWhere("studies",
						"project_id=?", params.get("projectid")));
			} else
						if (type.equals("spaces")
								&& params.containsKey("studyid")
								&& params.get("studyid") != null) {
				if (Database.selectAllFromTableWhere("studies", "id=?",
						params.get("studyid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such study exists");
				out.println(Database.selectAllFromTableWhere("spaces",
						"study_id=?", params.get("studyid")));
			} else
							if (type.equals("round_model")
									&& params.containsKey("observationid")
									&& params.get("observationid") != null) {
				if (Database.selectAllFromTableWhere("observations", "id=?",
						params.get("observationid")).length() < 1)
					response.sendError(HttpServletResponse.SC_BAD_REQUEST,
							"no such observation exists");
				out.println(Database.selectAllFromTableWhere(
						"date_round_matrices", "observation_id=?",
						params.get("observationid")));
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"unknown request");
			}
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}
