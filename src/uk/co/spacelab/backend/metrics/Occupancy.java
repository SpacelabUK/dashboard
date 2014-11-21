package uk.co.spacelab.backend.metrics;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.Util;

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

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		Map<String, String []> params = request.getParameterMap();
		if (params == null || !Util.validParam(params, "t")
				|| !Util.validParam(params, "obsid")) {
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
				// } else if (type.equals("net_occupancy")) {
				// JSONObject result =
				// Database.customQuery(
				// "SELECT COUNT(*) FROM splab_net_occupancy(?)",
				// obsID).getJSONObject(0);
				// out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("max_occupancy")) {
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_max_occupancy(?)", obsID)
								.getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("min_occupancy")) {
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_min_occupancy(?)", obsID)
								.getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("total_occ_per_round")) {
				JSONArray result =
						Database.customQuery(
								"SELECT day_id,round_id,count FROM splab_total_occupancy_per_round"
										+ " WHERE " + "observation_id=?", obsID);
				// out.println(result.getInt((String) result.keys().next()));
				out.println(result);
			} else if (type.equals("occ_per_space_and_round_prc")) {

				JSONArray spaces =
						Database.customQuery(
								"SELECT spaces.id AS space_id,spaces.alias AS space_alias,"
										+ " spaces.study_id AS study_id,"
										+ " coalesce(desks_per_space.count,0) AS desks"
										+ " FROM spaces JOIN observations"
										+ " ON observations.study_id=spaces.study_id"
										+ " FULL OUTER JOIN splab_desks_per_space"
										+ " AS desks_per_space"
										+ " ON observations.id=desks_per_space.observation_id"
										+ " AND spaces.id=desks_per_space.space_id WHERE"
										+ " observations.id=?", obsID);
				// JSONArray rounds = Database.
				JSONArray aggregate =
						Database.customQuery(
								"SELECT space_id,snapshot_id,day_id,round_id,occupied_desks"
										+ " FROM splab_space_desk_occ_per_round"
										+ " WHERE " + "observation_id=?", obsID);
				// JSONObject total =
				// Database.customQuery(
				// // "SELECT COUNT(*) FROM splab_removed_desks(?)",
				// // obsID));
				// "SELECT (SELECT COUNT(*) FROM splab_added_desks(?))"
				// + "+ (SELECT COUNT(*) FROM splab_predefined_desks(?))"
				// + "- (SELECT COUNT(*) FROM splab_removed_desks(?))",
				// obsID, obsID, obsID).getJSONObject(0);
				// int totalDesks = total.getInt((String) total.keys().next());

				Map<Integer, JSONObject> spaceMap =
						new HashMap<Integer, JSONObject>();
				for (int i = 0; i < spaces.length(); i++) {
					JSONObject row = spaces.getJSONObject(i);
					int spaceID = row.getInt("space_id");
					String spaceAlias = row.getString("space_alias");
					String img =
							row.getString("study_id") + "_" + spaceAlias
									+ ".png";
					// if (!spaceMap.containsKey(spaceID))
					spaceMap.put(
							spaceID,
							new JSONObject().put("id", spaceID)
									.put("alias", spaceAlias)
									.put("snapshots", new JSONArray())
									.put("desks", row.getInt("desks"))
									.put("img", img));
				}
				for (int i = 0; i < aggregate.length(); i++) {
					JSONObject row = aggregate.getJSONObject(i);
					int spaceID = row.getInt("space_id");
					row.remove("space_id");
					int desks = spaceMap.get(spaceID).getInt("desks");
					// System.out.println(spaceID + " "
					// + row.getInt("occupied_desks"));
					if (desks == 0)
						row.put("occupancy", 0);
					else row.put("occupancy", row.getInt("occupied_desks")
							/ (float) (desks));
					row.remove("occupied_desks");
					spaceMap.get(spaceID).getJSONArray("snapshots").put(row);
				}
				JSONArray result = new JSONArray();
				for (Integer i : spaceMap.keySet())
					result.put(spaceMap.get(i));

				out.println(result);
			} else if (type.equals("desk_occ_frequency")) {
				JSONArray result =
						Database.customQuery(
								"SELECT times_found,frequency FROM splab_desk_occupancy_frequency"
										+ " WHERE " + "observation_id=?", obsID);
				// out.println(result.getInt((String) result.keys().next()));
				out.println(result);
			} else if (type.equals("get_quotes")) {
				JSONArray result =
						Database.customQuery(
								"SELECT quote FROM survey_quotes WHERE study_id=?",
								obsID);
				Map<String, Integer> map = new HashMap<String, Integer>();
				for (int i = 0; i < result.length(); i++) {
					String quote = result.getJSONObject(i).getString("quote");
					String [] words =
							quote.replaceAll("[^a-zA-Z ]", "").toLowerCase()
									.split("\\s+");
					for (String word : words) {
						if (!map.containsKey(word)) map.put(word, 0);
						map.put(word, map.get(word) + 1);
					}
				}
				List<Integer> sizes = new ArrayList<Integer>();
				JSONArray collated = new JSONArray();
				for (String word : map.keySet()) {
					int sz = map.get(word);
					if (!sizes.contains(sz)) sizes.add(sz);
				}
				Collections.sort(sizes);
				if (sizes.size() > 5)
					sizes = sizes.subList(sizes.size() - 5, sizes.size());
				for (String word : map.keySet()) {
					int key = map.get(word);
					if (sizes.contains(key)) {
						JSONObject o = new JSONObject();
						o.put("text", word);
						o.put("size", key);

						collated.put(o);
					}
				}
				// out.println(result.getInt((String) result.keys().next()));
				out.println(collated);
			} else if (type.equals("no_of_rounds")) {
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_no_of_rounds(?)",
								obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("no_of_buildings")) {
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_buildings(?)",
								obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("project_name")) {
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_project_name(?)", obsID)
								.getJSONObject(0);
				// System.out.println(result);
				out.print(result.getString((String) result.keys().next()));
			} else if (type.equals("no_of_staff")) {
				// TODO FIX THIS IT IS WRONG:::
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_all_staff(?)",
								obsID).getJSONObject(0);
				// System.out.println(result);
				out.print(result.getString((String) result.keys().next()));
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
		} catch (SQLException | ParseException e) {
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
