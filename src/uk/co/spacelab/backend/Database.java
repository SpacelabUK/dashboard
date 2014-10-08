package uk.co.spacelab.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

import org.json.JSONArray;
import org.json.JSONObject;

public class Database {

	private static String dbName = "jdbc:postgresql://localhost/postgres";
	private static String dbDriver = "org.postgresql.Driver";
	private static String user = "petrox";
	private static String pass = "x";
	private static Connection getConnection() throws ClassNotFoundException,
			SQLException {

		Class.forName(dbDriver);
		return DriverManager.getConnection(dbName, user, pass);
	}
	protected static JSONArray getAllFromTableWhere(String table, String where,
			String... args) throws ClassNotFoundException, SQLException {
		Connection con = getConnection();
		String sql = "SELECT * FROM " + table + " WHERE " + where + ";";
		PreparedStatement prep = con.prepareStatement(sql);
		for (int i = 0; i < args.length; i++) {
			try {
				prep.setInt(i + 1, Integer.parseInt(args[i]));
			} catch (NumberFormatException ie) {
				try {
					prep.setFloat(i + 1, Float.parseFloat(args[i]));
				} catch (NumberFormatException fe) {
					prep.setString(i + 1, args[i]);
				}
			}
		}
		ResultSet rs = prep.executeQuery();
		return expandResultSet(rs);
	}
	protected static JSONArray getAllFromTable(String table)
			throws ClassNotFoundException, SQLException {
		Connection con = getConnection();
		String sql = "SELECT * FROM " + table + ";";
		PreparedStatement prep = con.prepareStatement(sql);
		ResultSet rs = prep.executeQuery();
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
}
