package uk.co.spacelab.backend.metrics;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.math.NumberUtils;
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
		// if (params == null || !Util.validParam(params, "t")
		// || !Util.validParam(params, "obsid")) {
		// response.sendError(HttpServletResponse.SC_BAD_REQUEST,
		// "missing data from request... -_-");
		// return;
		// }
		String type = params.get("t")[0];
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		Map<String, String []> knownFunctions =
				new HashMap<String, String []>();
		knownFunctions.put("no_of_rounds", new String [] {"observation_id"});
		knownFunctions.put("no_of_desks", new String [] {"observation_id"});
		knownFunctions.put("no_of_staff", new String [] {"study_id"});
		knownFunctions.put("no_of_desks_not_empty",
				new String [] {"observation_id"});
		knownFunctions.put("no_of_polys_in_func", new String [] {"func_alias",
				"study_id"});
		knownFunctions.put("no_of_desks_in_poly_type", new String [] {
				"type_group", "type_alias", "observation_id"});
		knownFunctions.put("id_of_poly_types", new String [] {"type_group",
				"type_alias"});
		knownFunctions.put("no_of_desks_in_poly_types", new String [] {
				"type_ids", "observation_id"});
		knownFunctions.put("get_observation_ids", new String [] {"study_id"});
		knownFunctions.put("get_project_name", new String [] {"study_id"});
		try {
			if (type.equals("devices") || type.equals("projects")
					|| type.equals("polygon_types")) {
				// out.println(Database.selectAllFromTable(type));
			} else if (type.equals("gross_occupancy")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_max_occupancy(?)", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("min_occupancy")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_min_occupancy(?)", obsID)
								.getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("total_occ_per_round")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONArray result =
						Database.customQuery(
								"SELECT day_id,round_id,count FROM splab_total_occupancy_per_round"
										+ " WHERE " + "observation_id=?", obsID);
				// out.println(result.getInt((String) result.keys().next()));
				out.println(result);
			} else if (type.equals("occ_per_space_and_round_prc")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONArray result =
						Database.customQuery(
								"SELECT times_found,frequency FROM splab_desk_occupancy_frequency"
										+ " WHERE " + "observation_id=?", obsID);
				// out.println(result.getInt((String) result.keys().next()));
				out.println(result);
			} else if (type.equals("get_quotes")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
			} else if (knownFunctions.containsKey(type)) {
				String [] requestArgs = knownFunctions.get(type);
				Object [] args = new Object [requestArgs.length];
				String prefix = "splab_";
				String qmString = "";
				for (int i = 0; i < requestArgs.length; i++) {
					// System.out.println(requestArgs[i]);
					if (params == null
							|| !Util.validParam(params, requestArgs[i])) {
						response.sendError(HttpServletResponse.SC_BAD_REQUEST,
								"missing data from request... -_-");
						return;
					}
					if (i != 0) qmString += ",";
					args[i] = request.getParameter(requestArgs[i]);
					// System.out.println("args[i]: " + args[i]);
					if (args[i] instanceof String
							&& ((String) args[i]).startsWith("[")
							&& ((String) args[i]).endsWith("]")) {
						qmString += requestArgs[i] + " := ? ";

						// NumberUtils.isNumber(arg0)
						String ns =
								((String) args[i]).split("\\[")[1].split("\\]")[0]
										.trim();

						// System.out.println(ns);
						// System.out.println(((String) args[i]).length() - 2);
						// System.out.println(((String) args[i]).substring(1));
						args[i] = getAsJDBCArray(ns);

					} else qmString += requestArgs[i] + " := ? ";
					// System.out.println(args[i]);
				}
				// System.out.println(qmString);
				JSONArray result =
						Database.customQuery("SELECT * FROM " + prefix + type
								+ "(" + qmString + ")", args);
				// if (result.length() == 1)
				// out.println(result.getJSONObject(0).getInt(
				// (String) result.getJSONObject(0).keys().next()));
				// else {
				JSONArray resultOut = new JSONArray();
				for (int i = 0; i < result.length(); i++) {

					JSONObject in = result.getJSONObject(i);
					// JSONObject ou = new JSONObject();
					// Iterator<?> keys = in.keys();
					// while (keys.hasNext()) {
					// String key = (String) in.keys().next();
					// if (key.toLowerCase().startsWith(prefix))
					// ou.put(key.substring(prefix.length()),
					// in.get(key));
					// else
					// ou.put(key, in.get(key));
					// }
					resultOut.put(in.get((String) in.keys().next()));
				}
				out.println(resultOut);
				// }
				// } else if (type.equals("no_of_rounds")) {
				// JSONObject result =
				// Database.customQuery(
				// "SELECT COUNT(*) FROM splab_no_of_rounds(?)",
				// obsID).getJSONObject(0);
				// out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("no_of_meeting_rooms")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int typeID = 2;
				String functeam = "func";
				Integer studyID = obsID;
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(polygons.id) FROM polygons "
										+ "LEFT JOIN spaces ON polygons.space_id=spaces.id "
										+ "WHERE functeam=? AND type_id=? AND study_id=?;",
								functeam, typeID, studyID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("no_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				Integer studyID = obsID;
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types "
										+ "WHERE UPPER(left(alias,length(?)))=?) SELECT "
										+ "COUNT(polygons.id) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND study_id=?;", typeStartString,
								typeStartString, studyID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("occupancy_of_meeting_rooms")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM (SELECT DISTINCT polygon_id,snapshot_id "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id=2 AND observation_id=?) AS temp;",
								obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("max_occupancy_of_meeting_rooms")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT MAX(count) FROM (SELECT day_id,round_id,COUNT(polygon_id) "
										+ "FROM (SELECT DISTINCT ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id=2 AND observation_id=?) AS temp "
										+ "GROUP BY day_id,round_id) AS temp2;",
								obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("utilisation_of_meeting_rooms")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id=2 AND observation_id=?;",
								obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("min_occupancy_of_meeting_rooms")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT MIN(count) FROM (SELECT day_id,round_id,COUNT(polygon_id) "
										+ "FROM (SELECT DISTINCT ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id=2 AND observation_id=?) AS temp "
										+ "GROUP BY day_id,round_id) AS temp2;",
								obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("occupancy_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT SUM(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString,
								typeStartString, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("max_occupancy_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT MAX(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString,
								typeStartString, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("min_occupancy_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT MIN(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString,
								typeStartString, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("utilisation_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?;",
								typeStartString, typeStartString, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("max_utilisation_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT MAX(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id "
										+ "FROM all_of_type) AND observation_id=? GROUP BY "
										+ "day_id,round_id) AS t2;",
								typeStartString, typeStartString, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("min_utilisation_of_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT MIN(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id "
										+ "FROM all_of_type) AND observation_id=? GROUP BY "
										+ "day_id,round_id) AS t2;",
								typeStartString1, typeStartString1,
								typeStartString2, typeStartString2,
								typeStartString3, typeStartString3, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("occupancy_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT SUM(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString1,
								typeStartString1, typeStartString2,
								typeStartString2, typeStartString3,
								typeStartString3, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("max_occupancy_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT MAX(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString1,
								typeStartString1, typeStartString2,
								typeStartString2, typeStartString3,
								typeStartString3, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("min_occupancy_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT MIN(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(polygon_id) FROM (SELECT DISTINCT ON "
										+ "(polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?) AS temp GROUP BY day_id,round_id) "
										+ "AS temp2;", typeStartString1,
								typeStartString1, typeStartString2,
								typeStartString2, typeStartString3,
								typeStartString3, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("utilisation_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND observation_id=?;",
								typeStartString1, typeStartString1,
								typeStartString2, typeStartString2,
								typeStartString3, typeStartString3, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("max_utilisation_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT MAX(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id "
										+ "FROM all_of_type) AND observation_id=? GROUP BY "
										+ "day_id,round_id) AS t2;",
								typeStartString1, typeStartString1,
								typeStartString2, typeStartString2,
								typeStartString3, typeStartString3, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("min_utilisation_of_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT MIN(count) FROM (SELECT day_id,round_id,"
										+ "COUNT(entity_id) FROM splab_polygon_occupancy "
										+ "WHERE functeam='func' AND type_id IN (SELECT id "
										+ "FROM all_of_type) AND observation_id=? GROUP BY "
										+ "day_id,round_id) AS t2;",
								typeStartString1, typeStartString1,
								typeStartString2, typeStartString2,
								typeStartString3, typeStartString3, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out
						.println(result.getInt((String) result.keys().next()));

			} else if (type.equals("no_of_buildings")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_buildings(?)",
								obsID).getJSONObject(0);
				out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("project_name")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT * FROM splab_project_name(?)", obsID)
								.getJSONObject(0);
				// System.out.println(result);
				out.print(result.getString((String) result.keys().next()));
			} else if (type.equals("no_of_staff")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(*) FROM splab_all_staff(?)",
								obsID).getJSONObject(0);
				// System.out.println(result);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
				// } else if (type.equals("no_of_desks")) {
				// int obsID = Integer.parseInt(params.get("obsid")[0]);
				// JSONObject result =
				// Database.customQuery(
				// // "SELECT COUNT(*) FROM splab_removed_desks(?)",
				// // obsID));
				// "SELECT (SELECT COUNT(*) FROM splab_added_desks(?))"
				// + "+ (SELECT COUNT(*) FROM splab_predefined_desks(?))"
				// + "- (SELECT COUNT(*) FROM splab_removed_desks(?))",
				// obsID, obsID, obsID).getJSONObject(0);
				// out.println(result.getInt((String) result.keys().next()));
				// } else if (type.equals("no_of_desks_not_empty")) {
				// int obsID = Integer.parseInt(params.get("obsid")[0]);
				// JSONObject result =
				// Database.customQuery(
				// // "SELECT COUNT(*) FROM splab_removed_desks(?)",
				// // obsID));
				// "SELECT COUNT(*) FROM splab_per_desk_total_occupancy WHERE"
				// + " observation_id=? AND times_found >0;",
				// obsID).getJSONObject(0);
				// out.println(result.getInt((String) result.keys().next()));
			} else if (type.equals("activities_split")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("avg_moving_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("movement_density_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONArray result =
						Database.customQuery(
								" SELECT type_id,ST_Clip(map,ST_Union(polygon)) "
										+ "FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "WHERE depthmaps.space_id = ? AND functeam='func' "
										+ "GROUP BY map,polygons.type_id;",
								obsID, obsID);
				out.println(result);
			} else if (type.equals("no_of_desks_open_plan")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								" SELECT COUNT(desks.entity_id) FROM (SELECT DISTINCT ON (occupancy.entity_id) occupancy.entity_id,"
										+ "occupancy.position, snapshots.space_id FROM occupancy "
										+ "LEFT JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 AND splab_removed_desks IS NULL "
										+ "AND snapshots.observation_id=?) AS desks JOIN polygons "
										+ "ON polygons.space_id=desks.space_id WHERE functeam='func' AND type_id=? "
										+ "AND ST_Contains(polygons.polygon,desks.position);",
								obsID, obsID, 58).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getInt("count"));
				// } else if (type.equals("no_of_desks_cellular")) {
				// int obsID = Integer.parseInt(params.get("obsid")[0]);
				// int typeID = 7;
				// JSONObject result =
				// Database.customQuery(
				// " SELECT COUNT(desks.entity_id) FROM (SELECT DISTINCT ON (occupancy.entity_id) occupancy.entity_id,"
				// + "occupancy.position, snapshots.space_id FROM occupancy "
				// +
				// "LEFT JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
				// +
				// "LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id "
				// +
				// "LEFT OUTER JOIN splab_removed_desks(?) ON occupancy.entity_id = splab_removed_desks "
				// + "WHERE occupancy.type=1 AND splab_removed_desks IS NULL "
				// + "AND snapshots.observation_id=?) AS desks JOIN polygons "
				// +
				// "ON polygons.space_id=desks.space_id WHERE functeam='func' AND type_id=? "
				// + "AND ST_Contains(polygons.polygon,desks.position);",
				// obsID, obsID, typeID).getJSONObject(0);
				// if (result.length() < 1) {
				// response.setStatus(HttpServletResponse.SC_CREATED);
				// out.println("No data present");
				// } else out.println(result.getInt("count"));
			} else if (type.equals("max_cellular_workspace_nia_per_desk")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int typeID = 7;
				JSONObject result =
						Database.customQuery(
								" SELECT MAX(workspace_per_desk) FROM "
										+ "(SELECT polygons.id,ST_Area(polygon)/COUNT(entity_id) "
										+ "AS workspace_per_desk FROM "
										+ "(SELECT DISTINCT ON (occupancy.entity_id) "
										+ "occupancy.entity_id,occupancy.position, snapshots.space_id "
										+ "FROM occupancy LEFT JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined "
										+ "ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) "
										+ "ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 AND splab_removed_desks "
										+ "IS NULL AND snapshots.observation_id=?) AS desks "
										+ "JOIN polygons ON polygons.space_id=desks.space_id "
										+ "WHERE functeam='func' AND type_id=? "
										+ "AND ST_Contains(polygons.polygon,desks.position) "
										+ "GROUP BY  polygons.id) AS t1;",
								obsID, obsID, typeID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("min_cellular_workspace_nia_per_desk")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int typeID = 7;
				JSONObject result =
						Database.customQuery(
								" SELECT MIN(workspace_per_desk) FROM "
										+ "(SELECT polygons.id,ST_Area(polygon)/COUNT(entity_id) "
										+ "AS workspace_per_desk FROM "
										+ "(SELECT DISTINCT ON (occupancy.entity_id) "
										+ "occupancy.entity_id,occupancy.position, snapshots.space_id "
										+ "FROM occupancy LEFT JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined "
										+ "ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) "
										+ "ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 AND splab_removed_desks "
										+ "IS NULL AND snapshots.observation_id=?) AS desks "
										+ "JOIN polygons ON polygons.space_id=desks.space_id "
										+ "WHERE functeam='func' AND type_id=? "
										+ "AND ST_Contains(polygons.polygon,desks.position) "
										+ "GROUP BY  polygons.id) AS t1;",
								obsID, obsID, typeID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("printer_accessibility_mean_depth")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("teapoint_accessibility_mean_depth")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
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
				out.println(result.getDouble("mean"));
			} else if (type.equals("study_accessibility_mean")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String bandName = "Visual Integration [HH]";
				JSONObject result =
						Database.customQuery(
								"SELECT (SUM(sum)/SUM(count))::real AS mean FROM (SELECT (ST_SummaryStats(map,"
										+ "(SELECT band_id FROM band_info WHERE map_id=id AND alias=?))).* "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE AND analysis_type=?::depthmap_types) AS t2;",
								// "SELECT SUM((mapstats.stats).sum)"
								// +
								// "/(SUM((mapstats.stats).count))::real AS mean "
								// +
								// "FROM (SELECT ST_SummaryStats(map,?) AS stats "
								// + "FROM depthmaps WHERE study_id=?  "
								// + "AND analysis_type=?) AS mapstats;",
								bandName, studyID, "Accessibility")
								.getJSONObject(0);

				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("study_visibility_mean")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String bandName = "Visual Integration [HH]";
				JSONObject result =
						Database.customQuery(
								"SELECT (SUM(sum)/SUM(count))::real AS mean FROM (SELECT (ST_SummaryStats(map,"
										+ "(SELECT band_id FROM band_info WHERE map_id=id AND alias=?))).* "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE AND analysis_type=?::depthmap_types) AS t2;",
								// "SELECT SUM((mapstats.stats).sum)"
								// +
								// "/(SUM((mapstats.stats).count))::real AS mean "
								// +
								// "FROM (SELECT ST_SummaryStats(map,?) AS stats "
								// +
								// "FROM depthmaps WHERE study_id=? AND def=TRUE "
								// +
								// "AND analysis_type=?::depthmap_types) AS mapstats;",
								bandName, studyID, "Visibility").getJSONObject(
								0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("study_essence_mean")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String bandName = "Visual Integration [HH]";
				JSONObject result =
						Database.customQuery(
								"SELECT (SUM(sum)/SUM(count))::real AS mean FROM (SELECT (ST_SummaryStats(map,"
										+ "(SELECT band_id FROM band_info WHERE map_id=id AND alias=?))).* "
										+ "FROM depthmaps WHERE study_id=? AND def=TRUE AND analysis_type=?::depthmap_types) AS t2;",
								// "SELECT SUM((mapstats.stats).sum)"
								// +
								// "/(SUM((mapstats.stats).count))::real AS mean "
								// +
								// "FROM (SELECT ST_SummaryStats(map,?) AS stats "
								// +
								// "FROM depthmaps WHERE study_id=? AND def=TRUE "
								// +
								// "AND analysis_type=?::depthmap_types) AS mapstats;",
								bandName, studyID, "Essence").getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_total")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND study_id=?;", studyID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_prim_circ")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 14;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id =? AND study_id=?;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_alternative_spaces")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND study_id=?;", typeStartString,
								typeStartString, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_shared_facilities")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String typeStartString1 = "MTG";
				String typeStartString2 = "ALT";
				String typeStartString3 = "OTHFCL";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=? OR UPPER(left(alias,length(?)))=? "
										+ "OR UPPER(left(alias,length(?)))=?) "
										+ "SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND study_id=?;", typeStartString1,
								typeStartString1, typeStartString2,
								typeStartString2, typeStartString3,
								typeStartString3, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_storage")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String typeStartString = "OTHFCL-STO";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types WHERE "
										+ "UPPER(left(alias,length(?)))=?) "
										+ "SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND study_id=?;", typeStartString,
								typeStartString, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_meeting_room_bkb")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 2;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id =? AND study_id=?;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_wrksp_open")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 58;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id = ? AND study_id=?;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("nia_wrksp_cel")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 7;
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id = ? AND study_id=?;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_on_the_phone_total")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and flag_bit=1"
										+ "AND type IN (0,1);", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_observed")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state IN (1,2,3)"
										+ "AND type IN (0,1);", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_walking")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state=3"
										+ "AND type=0;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_standing")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state=2"
										+ "AND type=0;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_sitting")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state=1"
										+ "AND type IN (0,1);", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_sitting_own_desk")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state=1"
										+ "AND type=1;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("no_of_people_sitting_not_own_desk")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT COUNT(occupancy.id) FROM occupancy JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "WHERE snapshots.observation_id=? and state=1"
										+ "AND type=0;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_no_of_desks_wrksp_per_space")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID1 = 7;
				int typeID2 = 58;
				JSONArray result =
						Database.customQuery(
								"SELECT polygons.space_id,COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (occupancy.entity_id) "
										+ "occupancy.entity_id,occupancy.position, snapshots.space_id "
										+ "FROM occupancy LEFT JOIN snapshots "
										+ "ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) "
										+ "ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 AND splab_removed_desks IS NULL "
										+ "AND snapshots.observation_id=?) AS desks "
										+ "JOIN polygons ON polygons.space_id=desks.space_id "
										+ "WHERE functeam='func' AND type_id IN (?,?) "
										+ "AND ST_Contains(polygons.polygon,desks.position) "
										+ "GROUP BY polygons.space_id;",
								studyID, studyID, typeID1, typeID2);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_wrksp_per_space")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID1 = 7;
				int typeID2 = 58;
				JSONArray result =
						Database.customQuery(
								"SELECT spaces.alias,SUM(ST_Area(polygon)) FROM polygons "
										+ "JOIN spaces on polygons.space_id=spaces.id "
										+ "WHERE study_id=? AND type_id IN (?,?) "
										+ "AND functeam='func' GROUP BY spaces.alias;",
								studyID, typeID1, typeID2);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_no_of_desks_wrksp_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int typeID1 = 7;
				int typeID2 = 58;
				JSONArray result =
						Database.customQuery(
								"SELECT spaces.building"
										// + ",SUM(ST_Area(polygon)) "
										+ ",COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (occupancy.entity_id) occupancy.entity_id,"
										+ "occupancy.position, snapshots.space_id FROM occupancy "
										+ "LEFT JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 "
										+ "AND splab_removed_desks IS NULL "
										+ "AND snapshots.observation_id=?) AS desks "
										+ "JOIN polygons ON polygons.space_id=desks.space_id "
										+ "JOIN spaces ON polygons.space_id=spaces.id "
										+ "WHERE functeam='func' AND type_id IN (?,?) "
										+ "AND ST_Contains(polygons.polygon,desks.position) "
										+ "GROUP BY spaces.building;", obsID,
								obsID, typeID1, typeID2);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_wrksp_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID1 = 7;
				int typeID2 = 58;
				JSONArray result =
						Database.customQuery(
								"SELECT building,SUM(ST_Area(polygon)) FROM polygons "
										+ "JOIN spaces on polygons.space_id=spaces.id "
										+ "WHERE study_id=? AND type_id IN (?,?) "
										+ "AND functeam='func' GROUP BY building;",
								studyID, typeID1, typeID2);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_no_of_desks_wrksp_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				JSONArray result =
						Database.customQuery(
								"SELECT teams.alias,COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (occupancy.entity_id) occupancy.entity_id,"
										+ "occupancy.position, snapshots.space_id FROM occupancy "
										+ "LEFT JOIN snapshots ON occupancy.snapshot_id=snapshots.id "
										+ "LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id "
										+ "LEFT OUTER JOIN splab_removed_desks(?) ON occupancy.entity_id = splab_removed_desks "
										+ "WHERE occupancy.type=1 "
										+ "AND splab_removed_desks IS NULL "
										+ "AND snapshots.observation_id=?) AS desks "
										+ "JOIN polygons ON polygons.space_id=desks.space_id "
										+ "JOIN teams On polygons.type_id=teams.id "
										+ "WHERE functeam='team' "
										+ "AND ST_Contains(polygons.polygon,desks.position) "
										+ "GROUP BY teams.alias;", studyID,
								studyID);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_wrksp_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				JSONArray result =
						Database.customQuery(
								"SELECT teams.alias,SUM(ST_Area(polygon)) FROM polygons "
										+ "LEFT JOIN teams ON polygons.type_id= teams.id "
										+ "WHERE study_id=? AND functeam='team' "
										+ "GROUP BY teams.alias;", studyID);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_prim_circ_per_floor")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 14;
				JSONObject result =
						Database.customQuery(
								"SELECT spaces.alias,SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id =? AND study_id=? GROUP BY spaces.alias;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_avg_mean_depth_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 14;
				JSONObject result =
						Database.customQuery(
								"WITH spaces_in_study AS (SELECT id FROM spaces WHERE study_id=?) "
										+ "SELECT alias,SUM((stats).mean*(stats).count)"
										+ "/(SUM((stats).count))::real AS mean "
										+ "FROM (SELECT depthmaps.space_id,teams.alias,"
										+ "ST_SummaryStats(ST_Clip(map,ST_Union(polygon)),"
										+ "(SELECT band_id FROM band_info WHERE map_id=depthmaps.id "
										+ "AND alias='Visual Integration [HH]')) "
										+ "AS stats FROM depthmaps JOIN polygons "
										+ "ON depthmaps.space_id=polygons.space_id "
										+ "LEFT JOIN teams ON polygons.type_id=teams.id "
										+ "WHERE depthmaps.space_id "
										+ "IN (SELECT * FROM spaces_in_study) "
										+ "AND functeam='team' "
										+ "AND depthmaps.def=TRUE "
										+ "AND depthmaps.analysis_type='Visibility'::depthmap_types "
										+ "GROUP BY depthmaps.id,map,teams.alias) "
										+ "AS clipped GROUP BY alias;", studyID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_prim_circ_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				int typeID = 14;
				JSONObject result =
						Database.customQuery(
								"SELECT spaces.building,SUM(ST_Area(polygon)) FROM polygons JOIN spaces "
										+ "ON polygons.space_id=spaces.id WHERE functeam='func' "
										+ "AND type_id =? AND study_id=? GROUP BY spaces.building;",
								typeID, studyID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result);
			} else if (type.equals("tbl_nia_alternative_spaces_per_type")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				int studyID = obsID;
				String typeStartString = "ALT";
				JSONObject result =
						Database.customQuery(
								"WITH all_of_type AS (SELECT id FROM polygon_types "
										+ "WHERE UPPER(left(alias,length(?)))=?) "
										+ "SELECT polygon_types.alias,SUM(ST_Area(polygon)) "
										+ "FROM polygons JOIN spaces ON polygons.space_id=spaces.id "
										+ "LEFT JOIN polygon_types ON polygons.type_id=polygon_types.id "
										+ "WHERE functeam='func' AND type_id IN (SELECT id FROM all_of_type) "
										+ "AND study_id=? GROUP BY polygon_types.alias;",
								typeStartString, typeStartString, studyID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_avg_util_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,AVG(count) FROM (SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=?) AS temp JOIN teams "
										+ "ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) AS temp2 "
										+ "GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_no_of_people_on_the_phone_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,SUM(count) FROM ("
										+ "SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=15 AND entity_flag_bit=1) "
										+ "AS temp JOIN teams ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) "
										+ "AS temp2 GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_no_of_people_walking_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,SUM(count) FROM ("
										+ "SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=15 AND entity_state=3) "
										+ "AS temp JOIN teams ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) "
										+ "AS temp2 GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_no_of_people_standing_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,SUM(count) FROM ("
										+ "SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=15 AND entity_state=2) "
										+ "AS temp JOIN teams ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) "
										+ "AS temp2 GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_max_util_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,MAX(count) FROM (SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=?) AS temp JOIN teams "
										+ "ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) AS temp2 "
										+ "GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_min_util_per_team")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT alias,MIN(count) FROM (SELECT day_id,round_id,teams.alias,"
										+ "COUNT(entity_id) FROM (SELECT DISTINCT "
										+ "ON (polygon_id,day_id,round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='team' "
										+ "AND observation_id=?) AS temp JOIN teams "
										+ "ON type_id=teams.id "
										+ "GROUP BY day_id,round_id,teams.alias) AS temp2 "
										+ "GROUP BY alias;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_avg_util_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT building,AVG(count) FROM (SELECT building,day_id,round_id,"
										+ "COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (space_id,polygon_id,day_id,"
										+ "round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (7,58) AND observation_id=?) AS temp "
										+ "JOIN spaces ON spaces.id=space_id"
										+ "GROUP BY building,day_id,round_id) AS temp2"
										+ "GROUP BY building;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_max_util_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT building,MAX(count) FROM (SELECT building,day_id,round_id,"
										+ "COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (space_id,polygon_id,day_id,"
										+ "round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (7,58) AND observation_id=?) AS temp "
										+ "JOIN spaces ON spaces.id=space_id"
										+ "GROUP BY building,day_id,round_id) AS temp2"
										+ "GROUP BY building;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
			} else if (type.equals("tbl_min_util_per_building")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				JSONObject result =
						Database.customQuery(
								"SELECT building,MIN(count) FROM (SELECT building,day_id,round_id,"
										+ "COUNT(entity_id) "
										+ "FROM (SELECT DISTINCT ON (space_id,polygon_id,day_id,"
										+ "round_id) * "
										+ "FROM splab_polygon_occupancy WHERE functeam='func' "
										+ "AND type_id IN (7,58) AND observation_id=?) AS temp "
										+ "JOIN spaces ON spaces.id=space_id"
										+ "GROUP BY building,day_id,round_id) AS temp2"
										+ "GROUP BY building;", obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.println(result.getDouble((String) result.keys()
						.next()));
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
			} else if (type.equals("q_avg_mark_hoursofworking")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String question = "HoursOfWorking";
				JSONObject result =
						Database.customQuery(
								"SELECT AVG(mark) FROM survey_scores LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?;",
								question, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
			} else if (type.equals("q_avg_mark_workfromhome")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String question = "WorkFromHome";
				JSONObject result =
						Database.customQuery(
								"SELECT AVG(mark) FROM survey_scores LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?;",
								question, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
			} else if (type.equals("q_avg_mark_workatoffice")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String question1 = "HoursOfWorking";
				String question2 = "WorkFromHome";
				JSONObject result =
						Database.customQuery(
								"SELECT AVG(hours_working.mark - work_from_home.mark) "
										+ "AS avg_hours_in_office "
										+ "FROM (SELECT * FROM survey_scores "
										+ "LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?) AS hours_working "
										+ "LEFT JOIN (SELECT * FROM survey_scores "
										+ "LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?) "
										+ "AS work_from_home "
										+ "ON hours_working.person_id=work_from_home.person_id;",
								question1, obsID, question2, obsID)
								.getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
			} else if (type.equals("q_avg_mark_like2workfromhome")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String question = "Like2WorkFromHome";
				JSONObject result =
						Database.customQuery(
								"SELECT AVG(mark) FROM survey_scores LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?;",
								question, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
			} else if (type.equals("q_mark_over_3_imp2workatdesk")) {
				int obsID = Integer.parseInt(params.get("obsid")[0]);
				String question = "Imp2WorkAtDesk";
				JSONObject result =
						Database.customQuery(
								"SELECT SUM(CASE WHEN mark > 3 THEN 1 ELSE 0 END) "
										+ "FROM survey_scores LEFT JOIN survey_questions "
										+ "ON survey_scores.question_id=survey_questions.id "
										+ "WHERE survey_questions.alias=? "
										+ "AND survey_scores.study_id=?;",
								question, obsID).getJSONObject(0);
				if (result.length() < 1) {
					response.setStatus(HttpServletResponse.SC_CREATED);
					out.println("No data present");
				} else out.print(result
						.getString((String) result.keys().next()));
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
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	private java.sql.Array getAsJDBCArray(String arr)
			throws ClassNotFoundException, SQLException {
		// System.out.println("aaa");
		// System.out.println(arr);
		String [] args = arr.split(",");
		int type = 4; // 0 : string
		for (String arg : args) {
			// System.out.println(arg);
			// System.out.println(NumberUtils.isNumber(arg.trim()));
			if (!NumberUtils.isNumber(arg.trim())) {
				type = 0;
				break;
			} else {
				Number n = NumberUtils.createNumber(arg.trim());
				// System.out.println(n.getClass() + " "
				// + (n instanceof Integer || n instanceof Long));
				if (n instanceof Double && type > 1) {
					type = 1;
					break;
				} else if (n instanceof Float && type > 2) {
					type = 2;
					break;
				} else if (n instanceof Long && type > 3) {
					type = 3;
					break;
				} else {
					type = 4;
					break;
				}
			}
		}
		// Database.getConnection().getMetaData().getColumns(null, schema,
		// tableName, "%");
		String typeIn = "text";
		switch (type) {
			case 1 :
				typeIn = "float8";
				break;
			case 2 :
				typeIn = "float4";
				break;
			case 3 :
				typeIn = "int8";
				break;
			case 4 :
				typeIn = "int4";
				break;
		}
		return Database.getConnection().createArrayOf(typeIn, args);
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
