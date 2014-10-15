package uk.co.spacelab.backend;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.postgresql.util.PSQLException;

public class Database {

	private static String dbName = "jdbc:postgresql://localhost/postgres";
	private static String dbDriver = "org.postgresql.Driver";
	private static String user = "petrox";
	private static String pass = "x";
	static Connection getConnection() throws ClassNotFoundException,
			SQLException {

		Class.forName(dbDriver);
		return DriverManager.getConnection(dbName, user, pass);
	}
	protected static JSONArray selectAllFromTableWhere(String table,
			String where, String... args) throws ClassNotFoundException,
			SQLException, ParseException {
		Connection con = getConnection();
		String sql = "SELECT * FROM " + table + " WHERE " + where + ";";
		ResultSet rs = execPrepared(con, sql, args);
		con.close();
		return expandResultSet(rs);
	}
	public static JSONArray countAllFromTableWhere(String table, String where,
			String... args) throws ClassNotFoundException, SQLException,
			ParseException {
		Connection con = getConnection();
		String sql = "SELECT COUNT(*) FROM " + table + " WHERE " + where + ";";
		ResultSet rs = execPrepared(con, sql, args);
		con.close();
		return expandResultSet(rs);
	}
	private static ResultSet execPrepared(Connection con, String sql,
			String... args) throws SQLException, PSQLException, ParseException {
		PreparedStatement prep = con.prepareStatement(sql);
		for (int i = 0; i < args.length; i++) {
			try {
				prep.setInt(i + 1, Integer.parseInt(args[i]));
			} catch (NumberFormatException ie) {
				try {
					prep.setFloat(i + 1, Float.parseFloat(args[i]));
				} catch (NumberFormatException fe) {
					// String arg = args[i];
					// if (arg.startsWith("date::"))
					// prep.setDate(
					// i + 1,
					// new java.sql.Date(new SimpleDateFormat(
					// "dd/mm/yyyy").parse(
					// arg.substring("date::".length()))
					// .getTime()));
					// else if (arg.startsWith("interval::"))
					// prep.setObject(
					// i + 1,
					// new org.postgresql.util.PGInterval(arg
					// .substring("interval::".length())));
					// else if (arg.startsWith("interval::"))
					// prep.setObject(
					// i + 1,(arg
					// .substring("interval::".length())));

					// else
					prep.setString(i + 1, args[i]);
				} catch (NullPointerException e) {
					prep.setNull(i + 1, 0);
				}
			}
		}
		return prep.executeQuery();

	}
	// private static void execPreparedNoResults(Connection con, String sql,
	// String... args) throws SQLException, PSQLException {
	// PreparedStatement prep = con.prepareStatement(sql);
	// for (int i = 0; i < args.length; i++) {
	// try {
	// prep.setInt(i + 1, Integer.parseInt(args[i]));
	// } catch (NumberFormatException ie) {
	// try {
	// prep.setFloat(i + 1, Float.parseFloat(args[i]));
	// } catch (NumberFormatException fe) {
	// prep.setString(i + 1, args[i]);
	// }
	// }
	// }
	//
	// }
	protected static JSONArray selectAllFromTable(String table)
			throws ClassNotFoundException, SQLException, ParseException {
		Connection con = getConnection();
		String sql = "SELECT * FROM " + table + ";";
		ResultSet rs = execPrepared(con, sql);
		con.close();
		return expandResultSet(rs);
	}
	protected static JSONArray expandResultSet(ResultSet rs)
			throws SQLException {
		ResultSetMetaData rsmd = rs.getMetaData();
		JSONArray result = new JSONArray();
		while (rs.next()) {
			JSONObject o = new JSONObject();
			for (int i = 1; i <= rsmd.getColumnCount(); i++)
				o.put(rsmd.getColumnName(i),
						rs.getString(rsmd.getColumnName(i)));
			result.put(o);
		}
		return result;
	}
	protected static JSONArray insertInto(Connection psql, String table,
			String columnString, String valueString, String [] args)
			throws ClassNotFoundException, SQLException, ParseException {

		String sql =
				"INSERT INTO " + table + " (" + columnString + ") VALUES ("
						+ valueString + ");";
		try {
			ResultSet rs = execPrepared(psql, sql, args);
			return expandResultSet(rs);
		} catch (PSQLException e) {
			if (!e.getLocalizedMessage().startsWith("No results"))
				e.printStackTrace();
			return new JSONArray("[{result:success}]");
		}
	}
	protected static JSONArray insertInto(String table, String columnString,
			String [] args) throws ClassNotFoundException, SQLException,
			ParseException {
		String valueString = "";
		for (int i = 0; i < args.length; i++)
			valueString += (i == 0 ? "" : ",") + "?";
		Connection psql = getConnection();
		JSONArray result =
				insertInto(psql, table, columnString, valueString, args);
		psql.close();
		return result;
	}
	protected static JSONArray update(String table, Map<String, String> toSet,
			String where, String [] whereArgs) throws ClassNotFoundException,
			SQLException, ParseException {

		String [] args = new String [toSet.size() + whereArgs.length];
		String toSetString = "";
		int counter = 0;
		for (String key : toSet.keySet()) {
			String val = toSet.get(key);
			if (counter != 0) toSetString += ",";
			toSetString += key + "=?";
			args[counter] = val;
			counter++;
		}
		for (String arg : whereArgs) {
			args[counter] = arg;
			counter++;
		}
		return update(table, toSetString, where, args);
	}

	protected static JSONArray update(String table, String toSetString,
			String where, String [] args) throws ClassNotFoundException,
			SQLException, ParseException {
		Connection con = getConnection();
		String sql =
				"UPDATE " + table + " SET " + toSetString + " WHERE " + where;

		try {
			ResultSet rs = execPrepared(con, sql, args);
			con.close();
			return expandResultSet(rs);
		} catch (PSQLException e) {
			if (!e.getLocalizedMessage().startsWith("No results"))
				e.printStackTrace();
			con.close();
			return new JSONArray("[{result:success}]");
		}
	}
	protected static JSONArray getSequenceNextVal(Connection psql, String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		String sql = "SELECT nextval('" + seq + "');";
		ResultSet rs = execPrepared(psql, sql);
		return expandResultSet(rs);
	}
	protected static JSONArray getSequenceNextVal(String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		Connection con = getConnection();
		JSONArray result = getSequenceNextVal(con, seq);
		con.close();
		return result;
	}
	protected static JSONArray getSequenceCurrVal(Connection psql, String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		String sql = "SELECT currval('" + seq + "');";
		ResultSet rs = execPrepared(psql, sql);
		return expandResultSet(rs);
	}
	protected static JSONArray getSequenceCurrVal(String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		Connection con = getConnection();
		JSONArray result = getSequenceCurrVal(con, seq);
		con.close();
		return result;
	}
	public static JSONArray customQuery(String sql, String... args)
			throws PSQLException, SQLException, ParseException,
			ClassNotFoundException {
		Connection psql = getConnection();
		ResultSet rs = execPrepared(psql, sql, args);
		JSONArray result = expandResultSet(rs);
		psql.close();
		return result;

	}
}
