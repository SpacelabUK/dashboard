package uk.co.spacelab.backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet implementation class GetObservationData
 */
@WebServlet("/GetObservationData")
public class GetObservationData extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetObservationData() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getParameterMap());
		System.out.println(request.getParameter("snapshotid"));
		int snapshotID = Integer.parseInt(request.getParameter("snapshotid"));
		try {
			JSONArray entities =
					Database.selectWhatFromTableWhere(
							"occupancy",
							"entity_id,type,state,flag_bit,interaction,"
									+ "ST_X(position) AS cx,ST_Y(position) AS cy,angle,user_comment",
							"snapshot_id=?", String.valueOf(snapshotID));
			int spaceID =
					Database.selectWhatFromTableWhere("snapshots", "space_id",
							"id=?", String.valueOf(snapshotID))
							.getJSONObject(0).getInt("space_id");
			JSONObject spaceLimits =
					Database.selectWhatFromTableWhere(
							"spaces",
							"plan_min[0] AS min_x,plan_min[1] AS min_y,"
									+ "plan_max[0] AS max_x,plan_max[1] AS max_y",
							"id=?", String.valueOf(spaceID)).getJSONObject(0);
			JSONObject result = new JSONObject();
			result.put("spaceLimits", spaceLimits);
			result.put("entities", entities);
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			out.print(result);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
