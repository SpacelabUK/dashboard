package uk.co.spacelab.backend.metrics;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import uk.co.spacelab.backend.Database;

/**
 * Servlet implementation class Occupancy
 */
@WebServlet("/Occupancy")
public class Occupancy extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Occupancy() {
		super();
		// TODO Auto-generated constructor stub
	}

	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		Map<String, String []> params = request.getParameterMap();
		if (params == null || !validParam(params, "t")
				|| !validParam(params, "obsid")) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"missing data from request... -_-");
			return;
		}
		String type = params.get("t")[0];
		String obsID = params.get("obsid")[0];
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		try {
			if (type.equals("devices") || type.equals("projects")
					|| type.equals("spatial_functions")) {
				// out.println(Database.selectAllFromTable(type));
			} else if (type.equals("gross_occupancy")) {
				JSONObject result =
						Database.customQuery(
								// "SELECT COUNT(*) FROM splab_removed_desks(?)",
								// obsID));
								// "SELECT COUNT(*) FROM splab_added_desks(?)",
								// obsID));
								"SELECT COUNT(*) FROM splab_gross_occupancy(?)",
								obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
//			} else if (type.equals("net_occupancy")) {
//				JSONObject result =
//						Database.customQuery(
//								"SELECT COUNT(*) FROM splab_net_occupancy(?)",
//								obsID).getJSONObject(0);
//				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("no_of_rounds")) {
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_no_of_rounds(?)",
								obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("no_of_desks")) {
				JSONObject result =
						Database.customQuery(
								// "SELECT COUNT(*) FROM splab_removed_desks(?)",
								// obsID));
								"SELECT (SELECT COUNT(*) FROM splab_added_desks(?))"
										+ "+ (SELECT COUNT(*) FROM splab_predefined_desks(?))"
										+ "- (SELECT COUNT(*) FROM splab_removed_desks(?))",
								obsID, obsID, obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("study_parts")
					&& params.containsKey("studyid")
					&& params.get("studyid") != null) {
				// if (Database.selectAllFromTableWhere("studies", "id=?",
				// params.get("studyid")).length() < 1)
				// response.sendError(HttpServletResponse.SC_BAD_REQUEST,
				// "no such study exists");
				// out.println(Database.selectAllFromTableWhere("observations",
				// "study_id=?", params.get("studyid")));
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"unknown request");
			}
		} catch (ClassNotFoundException | SQLException | ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
