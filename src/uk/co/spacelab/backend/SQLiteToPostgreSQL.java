package uk.co.spacelab.backend;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;

import org.json.JSONArray;
import org.json.JSONObject;

public class SQLiteToPostgreSQL extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String dbDriver = "org.sqlite.JDBC";

	public static JSONObject getSpaces(int observationID, String sqliteFile)
			throws ClassNotFoundException {

		// load the sqlite-JDBC driver using the current class loader

		Class.forName(dbDriver);
		Connection sqlite = null;
		JSONObject result = null;
		try {
			// create a database connection
			sqlite = DriverManager.getConnection("jdbc:sqlite:" + sqliteFile);
			Statement statement = sqlite.createStatement();
			statement.setQueryTimeout(30); // set timeout to 30 sec.

			Map<Integer, Integer> spaceMapper = new HashMap<Integer, Integer>();
			ResultSet rs = statement.executeQuery("SELECT * FROM spaces");
			int studyID =
					Database.customQuery(
							"SELECT study_id FROM observations WHERE id=?",
							String.valueOf(observationID)).getJSONObject(0)
							.getInt("study_id");
			// Connection psql = Database.getConnection();
			//
			// psql.setAutoCommit(false);
			result = new JSONObject();
			JSONArray spaces = new JSONArray();
			while (rs.next()) {
				String offsetx = rs.getString("offsetx");
				String offsety = rs.getString("offsety");
				if (offsetx == null || offsetx.trim().length() < 1)
					offsetx = "0";
				if (offsety == null || offsety.trim().length() < 1)
					offsety = "0";
				String point = "(" + offsetx + "," + offsety + ")";
				JSONObject o = new JSONObject();
				o.put("alias", rs.getString("alias"));
				o.put("spacename", rs.getString("spacename"));
				o.put("floorname", rs.getString("floorname"));
				o.put("buildingname", rs.getString("buildingname"));
				o.put("offsetx", rs.getString("offsetx"));
				o.put("offsety", rs.getString("offsety"));
				o.put("displayorder", rs.getInt("displayorder"));
				spaces.put(o);
				// spaceMapper.put(rs.getInt("_id"),
				// Database.getSequenceCurrVal(psql, "spaces_id_seq")
				// .getJSONObject(0).getInt("currval"));
			}
			JSONArray spacesInDB =
					Database.selectWhatFromTableWhere("spaces",
							Database.COL.SPACES_ALIAS.toString(),
							Database.COL.SPACES_STUDY_ID + "=?",
							String.valueOf(studyID));
			for (int i = 0; i < spacesInDB.length(); i++) {
				String aliasInDB =
						spacesInDB.getJSONObject(i).getString(
								Database.COL.SPACES_ALIAS.toString());
				for (int j = 0; j < spaces.length(); j++) {
					JSONObject space = spaces.getJSONObject(j);
					String alias = space.getString("alias");
					if (aliasInDB.equalsIgnoreCase(alias)) {
						space.put("prematch", aliasInDB);
						break;
					}
				}
			}
			result.put("spaces", spaces);
			result.put("spacesInDB", spacesInDB);

		} catch (SQLException e) {
			// if the error message is "out of memory",
			// it probably means no database file is found
			System.err.println(e.getMessage());
		} catch (ParseException e) {
			// connection close failed.
			System.err.println(e);

		} finally {
			try {
				if (sqlite != null) sqlite.close();
				// new File(sqliteFile).delete();
			} catch (SQLException e) {
				// connection close failed.
				System.err.println(e);
				// new File(sqliteFile).delete();
			}
		}
		return result;
	}
	public static void convert(int observationID, String sqliteFile)
			throws ClassNotFoundException {

		// load the sqlite-JDBC driver using the current class loader

		Class.forName(dbDriver);
		Connection sqlite = null;
		boolean append = false;
		try {
			// create a database connection
			sqlite = DriverManager.getConnection("jdbc:sqlite:" + sqliteFile);
			Statement statement = sqlite.createStatement();
			statement.setQueryTimeout(30); // set timeout to 30 sec.

			String columnString =
					"study_id,alias,name,floor,building,observation_offset,display_order";
			String valueString = "?,?,?,?,?,CAST(? AS point),?";
			String updateString =
					"study_id=?,alias=?,name=?,floor=?,building=?,"
							+ "observation_offset=CAST(? AS point),display_order=?";

			Map<Integer, Integer> spaceMapper = new HashMap<Integer, Integer>();
			Map<Integer, double []> spaceOffsetMap =
					new HashMap<Integer, double []>();
			ResultSet rs = statement.executeQuery("SELECT * FROM spaces");
			int studyID =
					Database.customQuery(
							"SELECT study_id FROM observations WHERE id=?",
							String.valueOf(observationID)).getJSONObject(0)
							.getInt("study_id");
			Connection psql = Database.getConnection();

			System.out.println("Spaces");
			psql.setAutoCommit(false);
			while (rs.next()) {
				String offsetx = rs.getString("offsetx");
				String offsety = rs.getString("offsety");
				if (offsetx == null || offsetx.trim().length() < 1)
					offsetx = "0";
				if (offsety == null || offsety.trim().length() < 1)
					offsety = "0";
				String point = "(" + offsetx + "," + offsety + ")";
				String alias = rs.getString("alias");
				Object [] args =
						new Object [] {String.valueOf(studyID), alias,
								rs.getString("spacename"),
								rs.getString("floorname"),
								rs.getString("buildingname"), point,
								rs.getInt("displayorder")};
				JSONArray spacesInDB =
						Database.selectWhatFromTableWhere(psql, "spaces",
								Database.COL.SPACES_ID.toString(),
								"study_id=? AND LOWER(alias)=LOWER(?)",
								String.valueOf(studyID), alias);
				if (spacesInDB.length() != 0) {
					int spaceID =
							spacesInDB.getJSONObject(0).getInt(
									Database.COL.SPACES_ID.toString());
					Database.update(
							"spaces",
							"observation_offset=CAST(? AS point),display_order=?",
							"id=?",
							new Object [] {point, rs.getInt("displayorder"),
									String.valueOf(spaceID)});
					int inSpaceID = rs.getInt("_id");
					spaceMapper.put(inSpaceID, spaceID);
					spaceOffsetMap.put(
							inSpaceID,
							new double [] {rs.getDouble("offsetx"),
									rs.getDouble("offsety")});
				} else {
					Database.insertInto(psql, "spaces", columnString,
							valueString, args);
					spaceMapper.put(rs.getInt("_id"), Database
							.getSequenceCurrVal(psql, "spaces_id_seq")
							.getJSONObject(0).getInt("currval"));
				}
			}

			System.out.println("Snapshots");
			if (!append) {
				JSONArray snaps =
						Database.selectAllFromTableWhere("snapshots",
								"observation_id=?",
								String.valueOf(observationID));
				for (int i = 0; i < snaps.length(); i++)
					Database.deleteFrom(psql, "occupancy", "snapshot_id=?",
							String.valueOf(snaps.getJSONObject(i).getInt("id")));
				Database.deleteFrom(psql, "snapshots", "observation_id=?",
						String.valueOf(observationID));
			}
			columnString =
					"observation_id,day_id,round_id,space_id,start_time,end_time";
			valueString =
					"?,?,?,?,CAST(? AS timestamp without time zone),CAST(? AS timestamp without time zone)";
			DateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
			Map<Integer, Integer> snapMapper = new HashMap<Integer, Integer>();
			Map<Integer, Integer> snapSpaceMapper =
					new HashMap<Integer, Integer>();
			rs = statement.executeQuery("SELECT * FROM snapshots");
			while (rs.next()) {
				int inSpaceID = rs.getInt("spaceid");
				Date start =
						new Date(
								(long) (rs.getLong("startunixtimestamp") * 1000));
				Date end =
						new Date((long) (rs.getLong("endunixtimestamp") * 1000));
				Object [] args =
						new Object [] {observationID, rs.getInt("dayid"),
								rs.getInt("roundid"),
								spaceMapper.get(inSpaceID), df.format(start),
								df.format(end)};
				Database.insertInto(psql, "snapshots", columnString,
						valueString, args);
				int newVal =
						Database.getSequenceCurrVal(psql, "snapshots_id_seq")
								.getJSONObject(0).getInt("currval");
				int inSnapID = rs.getInt("_id");
				snapMapper.put(inSnapID, newVal);
				snapSpaceMapper.put(inSnapID, inSpaceID);
			}
			// psql.commit();

			System.out.println("Predefined");
			if (!append) {
				Database.deleteFrom(psql, "predefined", "observation_id=?",
						String.valueOf(observationID));
			}
			columnString =
					"observation_id,original_id,space_id,type,state,interaction,angle,position,system_comment";
			valueString = "?,?,?,?,?,?,?,ST_Point(?,?),?";
			Map<Integer, Integer> idMapper = new HashMap<Integer, Integer>();
			rs = statement.executeQuery("SELECT * FROM predefined");
			while (rs.next()) {
				int inSpaceID = rs.getInt("spaceid");
				double xpos = rs.getDouble("xpos");
				double ypos = rs.getDouble("ypos");
				if (spaceOffsetMap.containsKey(inSpaceID)) {
					xpos += spaceOffsetMap.get(inSpaceID)[0];
					ypos += spaceOffsetMap.get(inSpaceID)[1];
				}
				// String point = "(" + xpos + "," + ypos + ")";
				Object [] args =
						new Object [] {observationID,
								rs.getString("originalid"),
								spaceMapper.get(inSpaceID),
								rs.getString("type"), rs.getString("state"),
								rs.getString("interaction"),
								rs.getString("angle"), xpos, ypos,
								rs.getString("systemcomment")};
				Database.insertInto(psql, "predefined", columnString,
						valueString, args);
				int newVal =
						Database.getSequenceCurrVal(psql, "entity_seq")
								.getJSONObject(0).getInt("currval");
				// System.out.println("putting " + newVal + " into "
				// + rs.getInt("_id"));
				idMapper.put(rs.getInt("_id"), newVal);
			}
			// psql.commit();
			System.out.println("Occupancy");
			columnString =
					"type,state,flag_bit,interaction,angle,position,last_edit,user_comment,system_comment,snapshot_id,username,entity_id";
			valueString =
					"?,?,?,?,?,ST_Point(?,?),CAST(? AS timestamp without time zone),?,?,?,?,?";
			Map<Integer, Integer> interactions =
					new HashMap<Integer, Integer>();
			rs = statement.executeQuery("SELECT * FROM occupancy");
			while (rs.next()) {

				int id = rs.getInt("_id");
				int newID;
				// if (id < 100)
				// System.out
				// .println("Searching for "
				// + id
				// + " "
				// + idMapper.containsKey(id)
				// + " "
				// + (idMapper.containsKey(id) ? idMapper
				// .get(id) : ""));
				if (idMapper.containsKey(id))
					newID = idMapper.get(id);
				else {
					newID =
							Database.getSequenceNextVal(psql, "entity_seq")
									.getJSONObject(0).getInt("nextval");
					idMapper.put(id, newID);
				}

				int snapshotID = snapMapper.get(rs.getInt("snapshotid"));
				double [] spaceOffset =
						spaceOffsetMap.get(snapSpaceMapper.get(snapshotID));
				Date lastedit =
						new Date((long) (rs.getLong("lasttimestamp") * 1000));

				double xpos = rs.getDouble("xpos");
				double ypos = rs.getDouble("ypos");
				if (spaceOffset != null) {
					xpos += rs.getDouble("xpos") + spaceOffset[0];
					ypos += rs.getDouble("ypos") + spaceOffset[1];
				}
				// String point = "(" + xpos + "," + ypos + ")";
				int interaction = rs.getInt("interaction");
				if (-1 != interaction) {
					if (interactions.containsKey(interaction))
						interaction = interactions.get(interaction);
					else {
						int i =
								Database.getSequenceNextVal(psql,
										"entity_interaction_seq")
										.getJSONObject(0).getInt("nextval");
						interactions.put(interaction, i);
						interaction = i;
					}
				}
				Object [] args =
						new Object [] {rs.getString("type"),
								rs.getString("state"), rs.getString("flagbit"),
								interaction, rs.getString("angle"), xpos, ypos,
								df.format(lastedit),
								rs.getString("usercomment"),
								rs.getString("systemcomment"), snapshotID,
								rs.getString("username"), newID};

				Database.insertInto(psql, "occupancy", columnString,
						valueString, args);
				// idMapper.put(rs.getInt("_id"),
				// Database.getSequenceCurrVal(psql, "entity_seq")
				// .getJSONObject(0).getInt("currval"));
			}
			System.out.println("Commiting..");
			psql.commit();
			System.out.println("Done");
			psql.setAutoCommit(true);
			psql.close();
		} catch (SQLException e) {
			// if the error message is "out of memory",
			// it probably means no database file is found
			System.err.println(e.getMessage());
			return;
		} catch (ParseException e) {
			// connection close failed.
			System.err.println(e);
			return;

		} finally {
			try {
				if (sqlite != null) sqlite.close();
				// new File(sqliteFile).delete();
			} catch (SQLException e) {
				// connection close failed.
				System.err.println(e);
				return;
				// new File(sqliteFile).delete();
			}
		}
	}
}
