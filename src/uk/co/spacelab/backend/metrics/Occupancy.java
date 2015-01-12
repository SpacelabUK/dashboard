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
		int obsID = Integer.parseInt(params.get("obsid")[0]);
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
								"SELECT space_id,alias as space_alias, study_id,count AS desks "
										+ "FROM splab_desks_per_space AS desks_per_space "
										+ "JOIN spaces ON spaces.id=desks_per_space.space_id "
										+ "WHERE observation_id=?", obsID);
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
			} else if (type.equals("activities_split")) {
				JSONObject result =
						Database.customQuery(
								// "SELECT COUNT(*) FROM splab_removed_desks(?)",
								// obsID));
								"SELECT walking,standing,sitting,count FROM"
										+ " (SELECT SUM(case when state=1 then 1 else 0 end) "
										+ "AS sitting, SUM(case when state=2 then 1 else 0 end) "
										+ "AS standing, SUM(case when state=3 then 1 else 0 end) "
										+ "AS walking,"
										+ "COUNT(occupancy.entity_id) FROM occupancy "
										+ "JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE observation_id=?) AS walking_prc;",
								obsID).getJSONObject(0);
				out.println(result);
			} else if (type.equals("avg_moving_total")) {
				JSONObject result =
						Database.customQuery(
								// "SELECT COUNT(*) FROM splab_removed_desks(?)",
								// obsID));
								"SELECT walking/count::float AS prc_walking FROM"
										+ " (SELECT SUM(case when state=3 then 1 else 0 end) "
										+ "AS walking,"
										+ "COUNT(occupancy.entity_id) FROM occupancy "
										+ "JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE observation_id=?) AS walking_prc;",
								obsID).getJSONObject(0);
				out.println(result.getDouble((String) result.keys().next()));
			} else if (type.equals("avg_moving_spaces")) {
				JSONArray result =
						Database.customQuery(
						// "SELECT COUNT(*) FROM splab_removed_desks(?)",
						// obsID));
								"SELECT space_id,walking/count::float AS prc_walking FROM"
										+ " (SELECT space_id,"
										+ "SUM(case when state=3 then 1 else 0 end) AS walking,"
										+ "COUNT(occupancy.entity_id) FROM occupancy "
										+ "JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE observation_id=? GROUP BY snapshots.space_id) "
										+ "AS walking_prc;", obsID);
				out.println(result);
			} else if (type.equals("movement_density_total")) {
				JSONObject result =
						Database.customQuery(
								"SELECT "
										+ "(SELECT COUNT(occupancy.entity_id) FROM occupancy "
										+ "JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE observation_id=? AND state=3) "
										+ "/"
										+ " ( SELECT SUM(st_area) FROM splab_polygons_areas "
										+ "WHERE observation_id=?"
										+ " AND functeam='func' AND type_alias='CIRC-PRI')"
										+ "::float "
										+ "AS walkin_per_circ_sqm;", obsID,
								obsID).getJSONObject(0);
				out.println(result.getDouble((String) result.keys().next()));
			} else if (type.equals("movement_density_spaces")) {
				JSONArray result =
						Database.customQuery(
								" SELECT splab_polygons_areas.space_id,walking/st_area::float "
										+ "AS sqm_per_walker FROM splab_polygons_areas JOIN "
										+ "(SELECT space_id,COUNT(occupancy.entity_id) AS walking "
										+ "FROM occupancy "
										+ "JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE observation_id=? AND state=3 "
										+ "GROUP BY snapshots.space_id) "
										+ "AS walkers "
										+ "ON walkers.space_id=splab_polygons_areas.space_id "
										+ "WHERE observation_id=? AND functeam='func' "
										+ "AND type_alias='CIRC-PRI'", obsID,
								obsID);
				out.println(result);
			} else if (type.equals("depthmap_stats_polygon")) {
				JSONArray result =
						Database.customQuery(
								" SELECT polygons.id,type_id,ST_Clip(map,ST_Union(polygon)) "
										+ "FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "WHERE depthmaps.space_id = 259 AND functeam='func' "
										+ "GROUP BY map,polygons.type_id,polygons.id;",
								obsID, obsID);
				out.println(result);
			} else if (type.equals("depthmap_stats_type")) {
				JSONArray result =
						Database.customQuery(
								" SELECT type_id,ST_Clip(map,ST_Union(polygon)) "
										+ "FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "WHERE depthmaps.space_id = ? AND functeam='func' "
										+ "GROUP BY map,polygons.type_id;",
								obsID, obsID);
				out.println(result);
			} else if (type.equals("printer_accessibility_mean_depth")) {
				int studyID = obsID, bandid = 9, typeID = 33;
				JSONObject result =
						Database.customQuery(
								" SELECT SUM((stats).mean*(stats).count)"
										+ "/(SUM((stats).count))::real AS mean "
										+ "FROM (SELECT ST_SummaryStats("
										+ "ST_Clip(map,ST_Union(polygon))"
										+ ",?) "
										+ "AS stats FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "WHERE depthmaps.space_id "
										+ "IN ((SELECT id FROM spaces WHERE study_id=?)) "
										+ "AND functeam='func' AND polygons.type_id=? "
										+ "AND depthmaps.def=TRUE "
										+ "AND depthmaps.analysis_type=?::depthmap_types "
										+ "GROUP BY map,polygons.type_id) AS clipped;",
								bandid, studyID, typeID, "Accessibility")
								.getJSONObject(0);
				System.out.println(obsID);
				out.println(result.getDouble("mean"));
			} else if (type.equals("teapoint_accessibility_mean_depth")) {
				int studyID = obsID, bandid = 9, typeID = 43;
				JSONObject result =
						Database.customQuery(
								" SELECT SUM((stats).mean*(stats).count)"
										+ "/(SUM((stats).count))::real AS mean "
										+ "FROM (SELECT ST_SummaryStats("
										+ "ST_Clip(map,ST_Union(polygon))"
										+ ",?) "
										+ "AS stats FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "WHERE depthmaps.space_id "
										+ "IN ((SELECT id FROM spaces WHERE study_id=?)) "
										+ "AND functeam='func' AND polygons.type_id=? "
										+ "AND depthmaps.def=TRUE "
										+ "AND depthmaps.analysis_type=?::depthmap_types "
										+ "GROUP BY map,polygons.type_id) AS clipped;",
								bandid, studyID, typeID, "Accessibility")
								.getJSONObject(0);
				System.out.println(obsID);
				out.println(result.getDouble("mean"));
			} else if (type.equals("study_accessibility_mean")) {
				int studyID = obsID, bandid = 9;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM((mapstats.stats).mean*(mapstats.stats).count)"
										+ "/(SUM((mapstats.stats).count))::real AS mean "
										+ "FROM (SELECT ST_SummaryStats(map,?) AS stats "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE "
										+ "AND analysis_type=?::depthmap_types) AS mapstats;",
								bandid, studyID, "Accessibility")
								.getJSONObject(0);
				System.out.println(result);
				out.println(result.getDouble((String) result.keys().next()));
			} else if (type.equals("study_visibility_mean")) {
				int studyID = obsID, bandid = 9;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM((mapstats.stats).mean*(mapstats.stats).count)"
										+ "/(SUM((mapstats.stats).count))::real AS mean "
										+ "FROM (SELECT ST_SummaryStats(map,?) AS stats "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE "
										+ "AND analysis_type=?::depthmap_types) AS mapstats;",
								bandid, studyID, "Visibility").getJSONObject(0);
				out.println(result.getDouble((String) result.keys().next()));
			} else if (type.equals("study_essence_mean")) {
				int studyID = obsID, bandid = 9;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM((mapstats.stats).mean*(mapstats.stats).count)"
										+ "/(SUM((mapstats.stats).count))::real AS mean "
										+ "FROM (SELECT ST_SummaryStats(map,?) AS stats "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE "
										+ "AND analysis_type=?::depthmap_types) AS mapstats;",
								bandid, studyID, "Essence").getJSONObject(0);
				out.println(result.getDouble((String) result.keys().next()));
			} else if (type.equals("depthmap_types")) {
				JSONArray result =
						Database.customQuery("SELECT * FROM splab_get_depthmap_types() AS type");
				out.println(result);
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
		} catch (NumberFormatException nfe) {
			System.out
					.println("Yo dawg, that ain't no number...! Go fetch the developer");
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
