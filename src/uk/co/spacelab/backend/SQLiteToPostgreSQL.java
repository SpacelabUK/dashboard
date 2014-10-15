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

public class SQLiteToPostgreSQL extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static String dbDriver = "org.sqlite.JDBC";

	public static void
			convert(int studyID, int observationID, String sqliteFile)
					throws ClassNotFoundException {

		// load the sqlite-JDBC driver using the current class loader

		Class.forName(dbDriver);
		Connection sqlite = null;
		try {
			// create a database connection
			sqlite = DriverManager.getConnection("jdbc:sqlite:" + sqliteFile);
			Statement statement = sqlite.createStatement();
			statement.setQueryTimeout(30); // set timeout to 30 sec.

			String columnString =
					"study_id,alias,name,floor,building,plan_offset,display_order";
			String valueString = "?,?,?,?,?,CAST(? AS point),?";

			Map<Integer, Integer> spaceMapper = new HashMap<Integer, Integer>();
			ResultSet rs = statement.executeQuery("SELECT * FROM spaces");
			Connection psql = Database.getConnection();
			 psql.setAutoCommit(false);
			while (rs.next()) {
				String offsetx = rs.getString("offsetx");
				String offsety = rs.getString("offsety");
				if (offsetx.trim().length() < 1) offsetx = "0";
				if (offsety.trim().length() < 1) offsety = "0";
				String point = "(" + offsetx + "," + offsety + ")";

				String [] args =
						new String [] {String.valueOf(studyID),
								rs.getString("alias"),
								rs.getString("spacename"),
								rs.getString("floorname"),
								rs.getString("buildingname"), point,
								rs.getString("displayorder")};
				Database.insertInto(psql, "spaces", columnString, valueString,
						args);
				spaceMapper.put(rs.getInt("_id"),
						Database.getSequenceCurrVal(psql, "spaces_id_seq")
								.getJSONObject(0).getInt("currval"));
			}

			// psql.commit();
			columnString =
					"observation_id,day_id,round_id,space_id,start_time,end_time";
			valueString =
					"?,?,?,?,CAST(? AS timestamp without time zone),CAST(? AS timestamp without time zone)";
			DateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
			Map<Integer, Integer> snapMapper = new HashMap<Integer, Integer>();
			rs = statement.executeQuery("SELECT * FROM snapshots");
			while (rs.next()) {
				Date start =
						new Date(
								(long) (rs.getLong("startunixtimestamp") * 1000));
				Date end =
						new Date((long) (rs.getLong("endunixtimestamp") * 1000));
				String [] args =
						new String [] {
								String.valueOf(observationID),
								rs.getString("dayid"),
								rs.getString("roundid"),
								String.valueOf(spaceMapper.get(rs
										.getInt("spaceid"))), df.format(start),
								df.format(end)};
				Database.insertInto(psql, "snapshots", columnString,
						valueString, args);
				snapMapper.put(rs.getInt("_id"),
						Database.getSequenceCurrVal(psql, "snapshots_id_seq")
								.getJSONObject(0).getInt("currval"));
			}
			// psql.commit();

			columnString =
					"observation_id,original_id,space_id,type,state,interaction,angle,position,system_comment";
			valueString = "?,?,?,?,?,?,?,CAST(? AS point),?";
			Map<Integer, Integer> idMapper = new HashMap<Integer, Integer>();
			rs = statement.executeQuery("SELECT * FROM predefined");
			while (rs.next()) {
				String xpos = rs.getString("xpos");
				String ypos = rs.getString("ypos");
				if (xpos.trim().length() < 1) xpos = "0";
				if (ypos.trim().length() < 1) ypos = "0";
				String point = "(" + xpos + "," + ypos + ")";
				String [] args =
						new String [] {
								String.valueOf(observationID),
								rs.getString("originalid"),
								String.valueOf(spaceMapper.get(rs
										.getInt("spaceid"))),
								rs.getString("type"), rs.getString("state"),
								rs.getString("interaction"),
								rs.getString("angle"), point,
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

			columnString =
					"type,state,flag_bit,interaction,angle,position,last_edit,user_comment,system_comment,snapshot_id,username,entity_id";
			valueString =
					"?,?,?,?,?,CAST(? AS point),CAST(? AS timestamp without time zone),?,?,?,?,?";

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

				Date lastedit =
						new Date((long) (rs.getLong("lasttimestamp") * 1000));
				String xpos = rs.getString("xpos");
				String ypos = rs.getString("ypos");
				if (xpos.trim().length() < 1) xpos = "0";
				if (ypos.trim().length() < 1) ypos = "0";
				String point = "(" + xpos + "," + ypos + ")";
				String [] args =
						new String [] {
								rs.getString("type"),
								rs.getString("state"),
								rs.getString("flagbit"),
								rs.getString("interaction"),
								rs.getString("angle"),
								point,
								df.format(lastedit),
								rs.getString("usercomment"),
								rs.getString("systemcomment"),
								String.valueOf(snapMapper.get(rs
										.getInt("snapshotid"))),
								rs.getString("username"), String.valueOf(newID)};
				Database.insertInto(psql, "occupancy", columnString,
						valueString, args);
				// idMapper.put(rs.getInt("_id"),
				// Database.getSequenceCurrVal(psql, "entity_seq")
				// .getJSONObject(0).getInt("currval"));
			}
			 psql.commit();
			 psql.setAutoCommit(true);
			psql.close();
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
				new File(sqliteFile).delete();
			} catch (SQLException e) {
				// connection close failed.
				System.err.println(e);
				new File(sqliteFile).delete();
			}
		}
	}
}
