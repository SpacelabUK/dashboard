package uk.co.spacelab.backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

//import org.apache.tomcat.jdbc.pool.DataSource;
import org.json.JSONArray;
import org.json.JSONObject;
import uk.co.spacelab.exception.MalformedDataException;

public class Database {

	private static String dbName = "jdbc:postgresql://localhost/spacelab";
	private static String dbDriver = "org.postgresql.Driver";
	private static String dbDataSource =
			"org.postgresql.ds.PGPoolingDataSource";
	private static String user = "petrox";
	private static String pass = "x";
	public static final String TABLE_OBSERVATION_ROUNDS = "observation_rounds",
			TABLE_OBSERVATION_SNAPSHOTS = "observation_snapshots",
			TABLE_METRICS = "metrics", //
			SEQUENCE_METRICS = "metrics_id_seq",
			SEQUENCE_SPACES = "spaces_id_seq",
			TABLE_METRICS_INPUTS = "metrics_inputs",
			TABLE_METRIC_FUNCTIONS = "metric_functions",
			TABLE_METRIC_FUNCTIONS_INPUTS = "metric_functions_inputs",
			TABLE_METRIC_GROUPS = "metric_groups",
			TABLE_METRIC_GROUP_METRICS = "metric_group_metrics";
	public enum TABLE {
		SPACES("spaces");
		// OBSERVATION_ROUNDS("observation_rounds"),
		// OBSERVATION_SNAPSHOTS("observation_snapshots");
		String tableName;
		COL [] columns;
		TABLE(String tableName, COL... columns) {
			this.tableName = tableName;
			this.columns = columns;
		}
		@Override
		public String toString() {
			return tableName;
		}
	}
	enum COL_TYPE {
		SERIAL, BIGSERIAL, INTEGER, INTEGER_ARRAY, TEXT, TEXT_ARRAY, POINT
	}
	public enum COL {
		SPACES_STUDY_ID("study_id", COL_TYPE.INTEGER), //
		SPACES_ID("id", COL_TYPE.INTEGER), //
		SPACES_ALIAS("alias", COL_TYPE.TEXT),
		SPACES_PLAN_MIN("plan_min", COL_TYPE.POINT),
		SPACES_PLAN_MAX("plan_max", COL_TYPE.POINT),
		POLYGON_TYPES_ALIAS("alias", COL_TYPE.TEXT),
		OBSERVATION_SNAPSHOTS_ID("id", COL_TYPE.INTEGER) //
		; //
		String columnName, sequence;
		COL_TYPE columnType;
		COL(String columnName, COL_TYPE columnType) {
			this.columnName = columnName;
			this.columnType = columnType;
		}
		COL(String columnName, COL_TYPE columnType, String sequence) {
			this.columnName = columnName;
			this.columnType = columnType;
			this.sequence = sequence;
		}
		@Override
		public String toString() {
			return columnName;
		}
	}

	private static DataSource datasource = null;
	// public void init() throws ServletException {
	// }

	/**
	 * Dole out the connections here.
	 */
	public static synchronized Connection getConnection() throws SQLException {

		if (datasource == null) {
			try {
				InitialContext initialContext = new InitialContext();
				if (initialContext == null) {
					String message =
							"There was no InitialContext in DBBroker. We're about to have some problems.";
					System.err.println("*** " + message);
					throw new RuntimeException(message);
				}

				// actual jndi name is "jdbc/postgres"
				datasource =
						(DataSource) initialContext
								.lookup("java:/comp/env/jdbc/postgres");

				if (datasource == null) {
					String message =
							"Could not find our DataSource in DBBroker. We're about to have problems.";
					System.err.println("*** " + message);
					throw new RuntimeException(message);
				}
				// }
			} catch (NamingException e) {
				e.printStackTrace();
			}
		}
		Connection con = null;
		try {
			Future<Connection> future =
					((org.apache.tomcat.jdbc.pool.DataSource) datasource)
							.getConnectionAsync();
			while (!future.isDone()) {
				System.out.println(
						"Connection is not yet available. Do some background work");
				try {
					Thread.sleep(100); // simulate work
				} catch (InterruptedException x) {
					Thread.currentThread().interrupt();
				}
			}
			con = future.get();
		} catch (InterruptedException | ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} // should return instantly

		return con;
	}

	public static JSONArray selectAllFromTableWhere(Connection con,
			String table, String where, Object... args)
					throws SQLException, ParseException {
		return selectWhatFromTableWhere(con, table, "*", where, args);
	}
	public static JSONArray selectAllFromTableWhere(String table, String where,
			Object... args) throws SQLException, ParseException {
		return selectWhatFromTableWhere(table, "*", where, args);
	}
	public static JSONArray selectWhatFromTableWhere(String table, String what,
			String where, Object... args) throws SQLException, ParseException {
		// try {
		Connection con = getConnection();
		String sql =
				"SELECT " + what + " FROM " + table + " WHERE " + where + ";";
		try (ResultSet rs = execPrepared(con, sql, args)) {
			JSONArray result = expandAndCloseResultSet(rs);
			con.close();
			return result;
		}
	}
	public static JSONArray selectWhatFromTableWhere(Connection con,
			String table, String what, String where, Object... args)
					throws SQLException, ParseException {
		String sql =
				"SELECT " + what + " FROM " + table + " WHERE " + where + ";";
		try (ResultSet rs = execPrepared(con, sql, args)) {
			return expandAndCloseResultSet(rs);
		}
	}
	private static ResultSet execPrepared(Connection con, String sql,
			Object... args) throws SQLException, ParseException {
		PreparedStatement pst = prepare(con, sql, args);
		// pst.closeOnCompletion();
		return pst.executeQuery();

	}
	private static void execPreparedNoResults(Connection con, String sql,
			Object... args) throws SQLException, ParseException {
		PreparedStatement pst = prepare(con, sql, args);
		pst.execute();
		pst.close();
	}
	private static PreparedStatement prepare(Connection con, String sql,
			Object... args) throws SQLException, ParseException {
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
			// System.out.println(args[i].getClass());
			if (args[i] instanceof java.sql.Array) {
				prep.setArray(i + 1, (java.sql.Array) args[i]);
				continue;
			}
			try {
				prep.setInt(i + 1, Integer.parseInt(String.valueOf(args[i])));
			} catch (NumberFormatException ie) {
				try {
					prep.setFloat(i + 1,
							Float.parseFloat(String.valueOf(args[i])));
				} catch (NumberFormatException fe) {

					prep.setString(i + 1, String.valueOf(args[i]));
				} catch (NullPointerException e) {
					prep.setNull(i + 1, 0);
				}
			}
		}
		return prep;
	}

	public static JSONArray selectAllFromTable(Connection con, String table)
			throws ClassNotFoundException, SQLException, ParseException {
		String sql = "SELECT * FROM " + table + ";";
		try (ResultSet rs = execPrepared(con, sql)) {
			return expandAndCloseResultSet(rs);
		}
	}
	public static JSONArray selectAllFromTable(String table)
			throws ClassNotFoundException, SQLException, ParseException {
		Connection con = getConnection();
		String sql = "SELECT * FROM " + table + ";";
		try (ResultSet rs = execPrepared(con, sql)) {
			JSONArray result = expandAndCloseResultSet(rs);
			con.close();
			return result;
		}
	}
	protected static JSONArray expandAndCloseResultSet(ResultSet rs)
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
		rs.getStatement().close();
		rs.close();
		return result;
	}
	public static void deleteFrom(Connection psql, String table,
			String whereString, Object... args) throws ClassNotFoundException,
					SQLException, ParseException {

		String sql = "DELETE FROM " + table + " WHERE " + whereString + ";";

		execPreparedNoResults(psql, sql, args);

	}
	public static void insertInto(Connection psql, String table,
			String columnString, String valueString, Object... args)
					throws ClassNotFoundException, SQLException,
					ParseException {

		String sql =
				"INSERT INTO " + table + " (" + columnString + ") VALUES ("
						+ valueString + ");";
		execPreparedNoResults(psql, sql, args);

	}
	public static void insertInto(String table, String columnString,
			Object [] args) throws ClassNotFoundException, SQLException,
					ParseException {
		String valueString = "";
		for (int i = 0; i < args.length; i++)
			valueString += (i == 0 ? "" : ",") + "?";
		try (Connection psql = getConnection()) {
			// JSONArray result =
			insertInto(psql, table, columnString, valueString, args);
			psql.close();
			// return result;
		}
	}
	public static void update(String table, Map<String, String> toSet,
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
		update(table, toSetString, where, args);
	}

	public static void update(String table, String toSetString, String where,
			Object [] args) throws ClassNotFoundException, SQLException,
					ParseException {
		Connection con = getConnection();
		String sql =
				"UPDATE " + table + " SET " + toSetString + " WHERE " + where;

		// try {
		execPreparedNoResults(con, sql, args);
		con.close();
	}
	public static void update(Connection psql, String table, String toSetString,
			String where, Object... args) throws ClassNotFoundException,
					SQLException, ParseException {
		String sql =
				"UPDATE " + table + " SET " + toSetString + " WHERE " + where;
		// try {
		execPreparedNoResults(psql, sql, args);

	}
	public static JSONArray getSequenceNextVal(Connection psql, String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		String sql = "SELECT nextval('" + seq + "');";
		try (ResultSet rs = execPrepared(psql, sql)) {
			return expandAndCloseResultSet(rs);
		}
	}
	public static JSONArray getSequenceNextVal(String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		Connection con = getConnection();
		JSONArray result = getSequenceNextVal(con, seq);
		con.close();
		return result;
	}
	public static JSONArray getSequenceCurrVal(Connection psql, String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		String sql = "SELECT currval('" + seq + "');";
		try (ResultSet rs = execPrepared(psql, sql)) {
			return expandAndCloseResultSet(rs);
		}
	}
	protected static JSONArray getSequenceCurrVal(String seq)
			throws SQLException, ClassNotFoundException, ParseException {
		Connection con = getConnection();
		JSONArray result = getSequenceCurrVal(con, seq);
		con.close();
		return result;
	}
	public static void customQueryNoResult(String sql, Object... args)
			throws SQLException, ParseException {
		try (Connection psql = getConnection()) {
			execPreparedNoResults(psql, sql, args);
			psql.close();
		}
	}
	public static JSONArray customQuery(String sql, Object... args)
			throws SQLException, ParseException {
		// try {
		try (Connection psql = getConnection();
				ResultSet rs = execPrepared(psql, sql, args)) {
			JSONArray result = expandAndCloseResultSet(rs);

			psql.close();
			// System.out.println(psql.isClosed());
			return result;
		}

	}
	public static void customQueryNoResult(Connection psql, String sql,
			Object... args) throws SQLException, ParseException {
		execPreparedNoResults(psql, sql, args);
	}
	public static JSONArray customQuery(Connection psql, String sql,
			Object... args) throws SQLException, ParseException {
		try (ResultSet rs = execPrepared(psql, sql, args)) {
			JSONArray result = expandAndCloseResultSet(rs);
			return result;
		}
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
	public static Map.Entry<String, Map.Entry<Set<String>, List<String>>> constructBooleanString(
			JSONObject json) {
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
	public static String getProperty(String property)
			throws SQLException, ParseException {
		JSONArray result =
				selectAllFromTableWhere("app_settings", "property=?",
						new String [] {property});
		if (result.length() < 1) return null;
		return result.getJSONObject(0).getString("value");
	}
	public static void setProperty(String property, String value)
			throws ClassNotFoundException, SQLException, ParseException {
		customQuery("splabin_app_setting_set(?,?)", property, value);
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

}
