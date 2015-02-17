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
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashSet;
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
	enum TABLE {
		SPACES("spaces");
		String tableName;
		TABLE(String tableName) {
			this.tableName = tableName;
		}
		@Override
		public String toString() {
			return tableName;
		}
	}
	enum COL {
		SPACES_STUDY_ID("study_id"), //
		SPACES_ID("id"), //
		SPACES_ALIAS("alias"),
		SPATIAL_FUNCTIONS_ALIAS("alias");
		String columnName;
		COL(String columnName) {
			this.columnName = columnName;
		}
		@Override
		public String toString() {
			return columnName;
		}
	}
	static Connection getConnection() throws ClassNotFoundException,
			SQLException {

		Class.forName(dbDriver);
		return DriverManager.getConnection(dbName, user, pass);
	}
	protected static JSONArray selectAllFromTableWhere(Connection con,
			String table, String where, String... args) throws SQLException,
			ParseException {
		return selectWhatFromTableWhere(con, table, "*", where, args);
	}
	protected static JSONArray selectAllFromTableWhere(String table,
			String where, String... args) throws SQLException, ParseException {
		return selectWhatFromTableWhere(table, "*", where, args);
	}
	protected static JSONArray selectWhatFromTableWhere(String table,
			String what, String where, String... args) throws SQLException,
			ParseException {
		try {
			Connection con = getConnection();
			String sql =
					"SELECT " + what + " FROM " + table + " WHERE " + where
							+ ";";
			ResultSet rs = execPrepared(con, sql, args);
			con.close();
			return expandResultSet(rs);
		} catch (ClassNotFoundException e) {
			throw new InternalException("JDBC Driver class not found");
		}
	}
	protected static JSONArray selectWhatFromTableWhere(Connection con,
			String table, String what, String where, Object... args)
			throws SQLException, ParseException {
		String sql =
				"SELECT " + what + " FROM " + table + " WHERE " + where + ";";
		ResultSet rs = execPrepared(con, sql, args);
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
			Object... args) throws SQLException, PSQLException, ParseException {
		PreparedStatement prep = con.prepareStatement(sql);
		for (int i = 0; i < args.length; i++) {
			// TODO: PROPER WAY TO DO IS HERE, REPLACE THIS
			// if (Integer.class.isInstance(args[i])) {
			// prep.setInt(i + 1, (int) args[i]);
			// } else if (Integer.class.isInstance(args[i])) {
			// prep.setFloat(i + 1, (float) args[i]);
			// } else if (String.class.isInstance(args[i])) {
			// prep.setString(i + 1, String.valueOf(args[i]));
			// } else {
			// prep.setNull(i + 1, 0);
			// }
			try {
				prep.setInt(i + 1, Integer.parseInt(String.valueOf(args[i])));
			} catch (NumberFormatException ie) {
				try {
					prep.setFloat(i + 1,
							Float.parseFloat(String.valueOf(args[i])));
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
					prep.setString(i + 1, String.valueOf(args[i]));
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
	protected static JSONArray deleteFrom(Connection psql, String table,
			String whereString, Object... args) throws ClassNotFoundException,
			SQLException, ParseException {

		String sql = "DELETE FROM " + table + " WHERE " + whereString + ";";
		try {
			ResultSet rs = execPrepared(psql, sql, args);
			return expandResultSet(rs);
		} catch (PSQLException e) {
			if (!e.getLocalizedMessage().startsWith("No results"))
				e.printStackTrace();
			return new JSONArray("[{result:success}]");
		}
	}
	protected static JSONArray insertInto(Connection psql, String table,
			String columnString, String valueString, Object... args)
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
	protected static Map.Entry<String, String []> reconstructValueMap(
			Map<String, String> toSet) {

		String [] args = new String [toSet.size()];
		String toSetString = "";
		int counter = 0;
		for (String key : toSet.keySet()) {
			String val = toSet.get(key);
			if (counter != 0) toSetString += ",";
			toSetString += key + "=?";
			args[counter] = val;
			counter++;
		}
		return new AbstractMap.SimpleImmutableEntry<String, String []>(
				toSetString, args);
	}
	protected static JSONArray update(String table, Map<String, String> toSet,
			String where, Object [] whereArgs) throws ClassNotFoundException,
			SQLException, ParseException {

		Object [] args = new Object [toSet.size() + whereArgs.length];
		String toSetString = "";
		int counter = 0;
		for (String key : toSet.keySet()) {
			String val = toSet.get(key);
			if (counter != 0) toSetString += ",";
			toSetString += key + "=?";
			args[counter] = val;
			counter++;
		}
		for (Object arg : whereArgs) {
			args[counter] = arg;
			counter++;
		}
		return update(table, toSetString, where, args);
	}

	protected static JSONArray update(String table, String toSetString,
			String where, Object [] args) throws ClassNotFoundException,
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
	protected static JSONArray update(Connection psql, String table,
			String toSetString, String where, Object... args)
			throws ClassNotFoundException, SQLException, ParseException {
		String sql =
				"UPDATE " + table + " SET " + toSetString + " WHERE " + where;
		try {
			ResultSet rs = execPrepared(psql, sql, args);
			return expandResultSet(rs);
		} catch (PSQLException e) {
			if (!e.getLocalizedMessage().startsWith("No results"))
				e.printStackTrace();
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
	public static JSONArray customQuery(String sql, Object... args)
			throws PSQLException, SQLException, ParseException {
		try {
			Connection psql = getConnection();
			ResultSet rs = execPrepared(psql, sql, args);
			JSONArray result = expandResultSet(rs);
			psql.close();
			return result;
		} catch (ClassNotFoundException e) {
			throw new InternalException("JDBC Driver class not found");
		}
	}
	public static JSONArray customQuery(Connection psql, String sql,
			Object... args) throws PSQLException, SQLException, ParseException {
		ResultSet rs = execPrepared(psql, sql, args);
		JSONArray result = expandResultSet(rs);
		return result;
	}
	/**
	 * Recursive function to extract boolean string and list of values
	 * 
	 * @param json
	 *            JSON data i.e: <br>
	 *            <p style="font-weight:bold">
	 *            {"OR":[{"AND":[{">":["observation_id",15]},{"=":["space_id"
	 *            ,6]}]},{">":["lel",1]}]}
	 *            </p>
	 * @return Map.Entry with <br>
	 *         <p>
	 *         String key:
	 *         </p>
	 *         <p style="font-weight:bold">
	 *         ((observation_id > ? AND space_id = ?) OR lel > ?)
	 *         </p>
	 *         <p>
	 *         and Map.Entry{@literal <}List{@literal <}String{@literal >}, List
	 *         {@literal <}String{@literal >}{@literal >} value:
	 *         </p>
	 *         <p style="font-weight:bold">
	 *         [observation_id, space_id, lel]=[15, 6, 1]
	 *         </p>
	 */
	protected static Map.Entry<String, Map.Entry<Set<String>, List<String>>>
			constructBooleanString(JSONObject json) {
		String result = "";
		Set<String> cols = new HashSet<String>();
		List<String> args = new ArrayList<String>();
		String operation = (String) json.keys().next();
		JSONArray values = json.getJSONArray(operation);
		if (json.keySet().size() > 1 || values.length() < 2)
			throw new MalformedDataException("Malformed data guy... -.-");
		switch (operation) {
			case "AND" :
			case "OR" :
				result += "(";
				for (int i = 0; i < values.length(); i++) {
					if (i != 0) result += " " + operation + " ";
					Map.Entry<String, Map.Entry<Set<String>, List<String>>> childResult =
							constructBooleanString(values.getJSONObject(i));
					result += childResult.getKey();
					cols.addAll(childResult.getValue().getKey());
					args.addAll(childResult.getValue().getValue());
				}
				result += ")";
				break;
			case "<" :
			case ">" :
			case "<=" :
			case ">=" :
			case "<>" :
			case "=" :
				result += values.getString(0) + " " + operation + " ?";
				cols.add(String.valueOf(values.get(0)));
				args.add(String.valueOf(values.get(1)));
				break;
		}
		return new AbstractMap.SimpleImmutableEntry<String, Map.Entry<Set<String>, List<String>>>(
				result,
				new AbstractMap.SimpleImmutableEntry<Set<String>, List<String>>(
						cols, args));
	}
	public static String getProperty(String property) throws SQLException,
			ParseException {
		JSONArray result =
				selectAllFromTableWhere("properties", "property=?",
						new String [] {property});
		if (result.length() < 1) return null;
		return result.getJSONObject(0).getString("value");
	}
	public static void setProperty(String property, String value)
			throws PSQLException, ClassNotFoundException, SQLException,
			ParseException {
		customQuery("splab_set_property(?,?)", property, value);
	}
	public static String getUploadDirectory() {
		try {
			return getProperty("files_path") + getProperty("upload_dir");
		} catch (SQLException | ParseException e) {
			e.printStackTrace();
		}
		return null;
	}
	public static String getFilesPath() {
		try {
			return getProperty("files_path");
		} catch (SQLException | ParseException e) {
			e.printStackTrace();
		}
		return null;
	}
	// UNSAFE DON'T USE
	// protected static String constructBooleanString(JSONObject o) {
	// String result = "";
	// String operation = (String) o.keys().next();
	// JSONArray values = o.getJSONArray(operation);
	// if (values.length() < 2)
	// throw new MalformedDataException("Malformed dataz... -.-");
	// switch (operation) {
	// case "AND" :
	// case "OR" :
	// result += "(";
	// for (int i = 0; i < values.length(); i++) {
	// if (i != 0) result += " " + operation + " ";
	// result += constructBooleanString(values.getJSONObject(i));
	// }
	// result += ")";
	// break;
	// case "<" :
	// case ">" :
	// case "<=" :
	// case ">=" :
	// case "<>" :
	// case "=" :
	// for (int i = 0; i < values.length() - 1; i++) {
	// if (i != 0) result += " AND ";
	// result +=
	// values.get(i) + " " + operation + " "
	// + values.get(i + 1);
	// }
	// break;
	// }
	// return result;
	// }
}
