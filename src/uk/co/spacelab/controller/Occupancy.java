package uk.co.spacelab.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.ParseException;
import java.util.HashMap;
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

import java.sql.*;

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

	/**
	 * Setup our connection pool when this servlet is started. Note that this
	 * servlet must be started before any other servlet that tries to use our
	 * database connections.
	 */

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
				new HashMap<>();
		knownFunctions
				.put("activity_in_polygon_types",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_in_polygon_types_per_type",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_interacting_in_polygon_types_per_activity",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_in_polygon_types_per_activity",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_in_poly_types_per_round",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_max_in_polygon_types_per_type",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions
				.put("activity_min_in_polygon_types_per_type",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits"});
		knownFunctions.put("avg_question_mark",
				new String [] {"study_id", "question_id"});

		knownFunctions.put("avg_ties_in_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_ties_outside_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_possible_ties_in_team",
				new String [] {"study_id"});
		knownFunctions.put("avg_possible_ties_outside_team",
				new String [] {"study_id"});

		knownFunctions.put("total_ties_in_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("total_ties_outside_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_possible_ties_in_team",
				new String [] {"study_id"});
		knownFunctions.put("avg_possible_ties_outside_team",
				new String [] {"study_id"});

		knownFunctions.put("avg_ties_in_floor",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_ties_outside_floor",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_possible_ties_in_floor",
				new String [] {"study_id"});
		knownFunctions.put("avg_possible_ties_outside_floor",
				new String [] {"study_id"});

		knownFunctions.put("avg_ties_in_building",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_ties_outside_building",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("avg_possible_ties_in_building",
				new String [] {"study_id"});
		knownFunctions.put("avg_possible_ties_outside_building",
				new String [] {"study_id"});

		knownFunctions.put("avg_depthmap_value_of_poly_type",
				new String [] {"type_ids", "depthmap_ids", "band_alias"});
		knownFunctions.put("avg_depthmap_value_per_poly_type",
				new String [] {"type_ids", "depthmap_ids", "band_alias"});
		knownFunctions.put("avg_depthmap_value",
				new String [] {"depthmap_ids", "band_alias"});
		knownFunctions.put("max_depthmap_value",
				new String [] {"depthmap_ids", "band_alias"});
		knownFunctions.put("min_depthmap_value",
				new String [] {"depthmap_ids", "band_alias"});
		knownFunctions.put("avg_depthmap_value_per_building",
				new String [] {"depthmap_ids", "band_alias"});
		knownFunctions.put("all_team_ids", new String [] {"study_id"});
		knownFunctions.put("get_observation_ids", new String [] {"study_id"});
		knownFunctions.put("get_project_name", new String [] {"study_id"});
		knownFunctions.put("gross_occupancy", new String [] {"study_id"});

		knownFunctions
				.put("groups_of_people_in_poly_types_sum",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits", "groups::text []"});
		knownFunctions
				.put("groups_of_people_in_poly_types_avg",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits", "groups::text []"});
		knownFunctions
				.put("groups_of_people_in_poly_types_max",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits", "groups::text []"});
		knownFunctions
				.put("groups_of_people_in_poly_types_min",
						new String [] {"study_id", "polygon_type_ids",
								"entity_states", "entity_types",
								"entity_flag_bits", "groups::text []"});

		knownFunctions.put("id_of_poly_types",
				new String [] {"type_group", "type_alias"});
		knownFunctions.put("id_of_interview_question",
				new String [] {"parent_alias", "question_alias"});
		knownFunctions.put("id_of_interview_issue",
				new String [] {"issue_alias"});
		knownFunctions.put("id_of_flag", new String [] {"flag_name"});
		knownFunctions.put("id_of_staff_question",
				new String [] {"question_alias"});
		knownFunctions.put("id_of_staff_questions",
				new String [] {"question_aliases"});
		knownFunctions.put("id_of_depthmaps",
				new String [] {"study_id", "depthmap_type"});
		knownFunctions.put("ids_of_questions_in_group",
				new String [] {"question_group"});
		knownFunctions.put("max_desk_occupancy", new String [] {"study_id"});
		knownFunctions.put("min_desk_occupancy", new String [] {"study_id"});
		knownFunctions.put("nia_of_poly_type_group",
				new String [] {"study_id", "poly_type_group"});
		knownFunctions.put("nia_of_poly_type_group_per_building",
				new String [] {"study_id", "poly_type_group"});
		knownFunctions.put("nia_of_poly_type_group_per_space",
				new String [] {"study_id", "poly_type_group"});
		knownFunctions.put("nia_of_poly_types",
				new String [] {"type_ids", "study_id"});
		knownFunctions.put("nia_per_poly_type",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("nia_of_poly_types_per_building",
				new String [] {"type_ids", "study_id"});
		knownFunctions.put("nia_of_poly_types_per_space",
				new String [] {"type_ids", "study_id"});
		knownFunctions.put("no_of_staff_ties_outside_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_responders_with_ties_outside_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_rounds", new String [] {"study_id"});
		knownFunctions.put("no_of_buildings", new String [] {"study_id"});
		knownFunctions.put("no_of_desks", new String [] {"study_id"});
		knownFunctions.put("no_of_desks_per_building",
				new String [] {"study_id"});
		knownFunctions.put("no_of_desks_per_space", new String [] {"study_id"});
		knownFunctions.put("no_of_desks_not_empty", new String [] {"study_id"});
		{
			// to be removed
			knownFunctions.put("no_of_desks_in_poly_type",
					new String [] {"type_group", "type_alias", "study_id"});
		}
		knownFunctions.put("no_of_desks_in_poly_types",
				new String [] {"type_ids", "study_id"});
		knownFunctions.put("no_of_desks_in_poly_types_per_building",
				new String [] {"type_ids", "study_id"});
		knownFunctions.put("no_of_desks_per_polygon_type",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("no_of_people_activity",
				new String [] {"study_id", "states", "types", "flag_bits"});
		knownFunctions.put("no_of_people_activity_breakdown",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_per_round",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_per_building",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_per_space",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_interacting",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_interacting_per_activity",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_interacting_per_building",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_people_activity_interacting_per_space",
				new String [] {"study_id", "activity_ids"});
		knownFunctions.put("no_of_polys_in_func",
				new String [] {"func_alias", "study_id"});
		knownFunctions.put("no_of_polys_in_poly_types",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("no_of_staff_ties_per_question",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_responders_per_tie_question",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_responders_for_choice_question_and_choices",
				new String [] {"study_id", "question_id",
						"choice_ids::text []"});
		knownFunctions.put("no_of_unique_contacts_per_question",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff", new String [] {"study_id"});
		knownFunctions.put("no_of_staff_per_building",
				new String [] {"study_id"});
		knownFunctions.put("no_of_staff_replies_per_choice",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_replies_within_marks", new String [] {
				"study_id", "question_id", "mark_over", "mark_under"});
		knownFunctions.put("no_of_staff_quotes_per_tag",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_replies_per_choice_multi_q",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_interview_ties_directional_team_to_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_ties_directional_team_to_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_ties_directional_team_to_team_scored",
				new String [] {"study_id", "question_id", "score_over",
						"score_under"});

		knownFunctions.put(
				"no_of_unique_undir_staff_ties_outside_team_of_score",
				new String [] {"study_id", "question_id", "lower_limit",
						"upper_limit"});
		knownFunctions.put("no_of_unique_undir_staff_ties_within_team_of_score",
				new String [] {"study_id", "question_id", "lower_limit",
						"upper_limit"});
		knownFunctions.put("no_of_possible_staff_ties_outside_team",
				new String [] {"study_id"});
		knownFunctions.put("no_of_possible_staff_ties_within_team",
				new String [] {"study_id"});

		knownFunctions.put("no_of_staff_ties_of_question_and_scores",
				new String [] {"study_id", "question_id", "scores"});
		knownFunctions.put("no_of_staff_ties_of_question_per_score",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_ties_of_questions_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_outside_team_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_within_team_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_outside_floor_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_within_floor_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_outside_building_per_score",
				new String [] {"study_id", "question_ids"});
		knownFunctions.put("no_of_staff_ties_within_building_per_score",
				new String [] {"study_id", "question_ids"});

		knownFunctions.put("no_of_staff_ties_outside_team_per_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_staff_ties_within_team_per_team",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("no_of_possible_staff_ties_outside_team_per_team",
				new String [] {"study_id"});
		knownFunctions.put("no_of_possible_staff_ties_within_team_per_team",
				new String [] {"study_id"});

		knownFunctions.put("occupancy_of_poly_types",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("occupancy_of_poly_types_per_round",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("occupancy_frequency_grouped",
				new String [] {"study_id", "groups::text []"});
		knownFunctions.put("poly_types_names", new String [] {"poly_type_ids"});
		knownFunctions.put("possible_choices_in_question",
				new String [] {"question_id"});
		knownFunctions.put("possible_choices_in_questions",
				new String [] {"question_ids"});
		knownFunctions.put("question_names", new String [] {"question_ids"});
		knownFunctions.put("quotes_under_issue",
				new String [] {"study_id", "issue_id"});
		knownFunctions.put("quotes_under_issue_flagged",
				new String [] {"study_id", "issue_id"});
		knownFunctions.put("sum_of_interview_choice_scores",
				new String [] {"study_id", "question_id"});
		knownFunctions.put("team_names", new String [] {"team_ids"});
		// utilisation measures can be achieved with "activity_in_poly_types"
		knownFunctions.put("utilisation_of_poly_types",
				new String [] {"study_id", "type_ids"});
		knownFunctions.put("utilisation_activity_of_poly_types",
				new String [] {"study_id", "type_ids", "states"});
		knownFunctions.put("no_of_people_per_round",
				new String [] {"study_id", "states"});
		knownFunctions
				.put("no_of_people_in_poly_types_per_round",
						new String [] {"study_id", "entity_types",
								"entity_states", "entity_flags",
								"polygon_types"});
		knownFunctions.put("round_times", new String [] {"study_id"});

		try (Connection con = Database.getConnection()) {
			if (type.equals("devices") || type.equals("projects")
					|| type.equals("polygon_types")) {
			} else if (knownFunctions.containsKey(type)) {
				String [] requestArgs = knownFunctions.get(type);
				Object [] args = new Object [requestArgs.length];
				String prefix = "splabmf_";
				String qmString = "";

				for (int i = 0; i < requestArgs.length; i++) {
					String argType = null;
					String [] st = requestArgs[i].split("::");
					if (st.length > 1) {
						requestArgs[i] = st[0];
						argType = st[1];
					}
					if (params == null
							|| !Util.validParam(params, requestArgs[i])) {
						response.sendError(HttpServletResponse.SC_BAD_REQUEST,
								"missing data from request... -_-");
						return;
					}
					if (i != 0) qmString += ",";
					args[i] = request.getParameter(requestArgs[i]);
					if (args[i] instanceof String
							&& ((String) args[i]).startsWith("[")
							&& ((String) args[i]).endsWith("]")) {
						qmString += requestArgs[i] + " := ? ";
						String ns =
								((String) args[i]).split("\\[")[1]
										.split("\\]")[0].trim();
						args[i] = getAsJDBCArray(con, ns.split(","), argType);

					} else qmString += requestArgs[i] + " := ? ";
				}
				String sql =
						"SELECT * FROM " + prefix + type + "(" + qmString + ")";
				JSONArray result = Database.customQuery(con, sql, args);
				con.close();
				JSONArray resultOut = new JSONArray();
				if (result.length() == 0 || (result.length() == 1
						&& result.getJSONObject(0).keySet().size() == 0)) {
					JSONObject errorObj = new JSONObject();
					errorObj.put("error", "no data");
					response.setStatus(201);
					resultOut.put(errorObj);
				} else {

					for (int i = 0; i < result.length(); i++) {

						JSONObject in = result.getJSONObject(i);
						if (in.keySet().size() != 0)
							resultOut.put(in.get((String) in.keys().next()));
					}
				}
				out.println(resultOut);
			} else if (type.equals("occ_per_space_and_round_prc")) {
				int studyID = Integer.parseInt(params.get("studyid")[0]);
				JSONArray spaces =
						Database.customQuery(
								"SELECT space_id,alias as space_alias, spaces.study_id,count AS desks "
										+ "FROM splab_desks_per_space AS desks_per_space "
										+ "JOIN spaces ON spaces.id=desks_per_space.space_id "
										+ "WHERE spaces.study_id=?",
								studyID);
				// JSONArray rounds = Database.
				JSONArray aggregate =
						Database.customQuery(
								"SELECT space_id,snapshot_id,day_id,round_id,occupied_desks"
										+ " FROM splab_space_desk_occ_per_round"
										+ " WHERE " + "study_id=?",
								studyID);
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
						new HashMap<>();
				for (int i = 0; i < spaces.length(); i++) {
					JSONObject row = spaces.getJSONObject(i);
					int spaceID = row.getInt("space_id");
					String spaceAlias = row.getString("space_alias");
					String img =
							row.getString("study_id") + "_" + spaceAlias
									+ ".png";
					// if (!spaceMap.containsKey(spaceID))
					spaceMap.put(spaceID, new JSONObject().put("id", spaceID)
							.put("alias", spaceAlias)
							.put("snapshots", new JSONArray())
							.put("desks", row.getInt("desks")).put("img", img));
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
					else
						row.put("occupancy",
								row.getInt("occupied_desks") / (float) (desks));
					row.remove("occupied_desks");
					spaceMap.get(spaceID).getJSONArray("snapshots").put(row);
				}
				JSONArray result = new JSONArray();
				for (Integer i : spaceMap.keySet())
					result.put(spaceMap.get(i));

				out.println(result);

			} else {

				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"unknown request");
			}
		} catch (SQLException | ParseException e) {
			e.printStackTrace();
		} catch (NumberFormatException nfe) {
			System.out.println(
					"Yo dawg, that ain't no number...! Go fetch the developer");
		} catch (ClassNotFoundException e) {
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
	public static java.sql.Array getAsJDBCArray(Connection psql, String [] args,
			String argType) throws ClassNotFoundException, SQLException {
		int type = 4; // 0 : string
		if (argType != null) {
			if (argType.replace(" ", "").equalsIgnoreCase("text[]")) type = 0;
		} else for (String arg : args) {
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
		return psql.createArrayOf(typeIn, args);
	}
}
