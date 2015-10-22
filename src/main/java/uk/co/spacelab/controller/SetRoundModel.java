package uk.co.spacelab.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.JSONHelper;

/**
 * Servlet implementation class SetRoundModel
 */
@WebServlet("/SetRoundModel")
public class SetRoundModel extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SetRoundModel() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		JSONObject paramsJSON = JSONHelper.decodeRequest(request);

		if (paramsJSON == null || paramsJSON.length() == 0) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no data received");
			return;
		}

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		// $parentID = $params ['observationid'];
		String type = paramsJSON.getString("type");

		if (!type.equals("date_round_matrices"))
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"unrecognized type: " + type);
		if (!paramsJSON.has("observationid"))
			response.sendError(HttpServletResponse.SC_BAD_REQUEST,
					"no observation id defined");
		String observationid = paramsJSON.getString("observationid");

		JSONObject model = paramsJSON.getJSONObject("model");
		String startdate = model.getString("startdate");
		String enddate = model.getString("enddate");
		// String startdate = model.getString("startdate");
		// String enddate = model.getString("enddate");
		String roundduration = model.getString("duration");
		JSONArray rounds = model.getJSONArray("rounds");
		String roundString = "{";
		for (int i = 0; i < rounds.length(); i++)
			roundString += (i == 0 ? "" : ",") + rounds.get(i);
		roundString += "}";
		// $rounds = $model ['rounds'];
		try {
			JSONArray results =
					Database.selectAllFromTableWhere("observations", "id=?",
							paramsJSON.getString("observationid"));
			if (results.length() != 1)
				response.sendError(HttpServletResponse.SC_BAD_REQUEST,
						"no such observationid");

			// $query = "SELECT * FROM observations WHERE id=;";
			// $results = $db->prepare ( $query );
			// $results->bindParam ( ':observationid', $parentID, PDO::PARAM_INT
			// );
			// $results->execute ();

			// if ($results->rowCount () < 1)
			// die ( '{"eror":"no such observationid(' . $observationid . ')
			// found"}' );

			// $row = $results->fetch ();
			String modeltable =
					results.getJSONObject(0).getString("time_model_table");
			// $modelid = $row ['timemodelid'];

			String columnString =
					"observation_id,start_date,end_date,round_duration,round_times";
			String valueString =
					"?,CAST(? AS date),CAST(? AS date),CAST(? AS interval),CAST(? AS time without time zone[])";
			String [] values =
					new String [] {observationid, startdate, enddate,
							roundduration, roundString};
			if (modeltable != null) {
				// create new row in time model table
				// String sql = "INSERT INTO date_round_matrices (" + keyString
				// +
				// ") VALUES (" + valueString + ");";
				// $results = $db->prepare ( $query );
				// // $results->bindParam ( ':table', $type, PDO::PARAM_STR );
				// $results->bindParam ( ':observationid', $parentID,
				// PDO::PARAM_INT
				// );
				// $results->bindParam ( ':startdate', $startdate,
				// PDO::PARAM_STR );
				// $results->bindParam ( ':enddate', $enddate, PDO::PARAM_STR );
				// $results->bindParam ( ':roundduration', $roundduration,
				// PDO::PARAM_STR );
				// $results->bindParam ( ':roundtimes', $rounds, PDO::PARAM_STR
				// );
				// $results->execute ();
				Connection psql = Database.getConnection();
				Database.insertInto(psql, "date_round_matrices", columnString,
						valueString, values);
				psql.close();
				// echo print_r ( $results->fetch () );
				// $row = $results->fetch ();
				// $modelid = $row ['id'];
				Map<String, String> toSet = new HashMap<String, String>();
				toSet.put("time_model_table", type);
				Database.update("observations", toSet, "id=?",
						new String [] {observationid});
				// $query = 'UPDATE observations SET
				// time_model_table=:modeltable
				// WHERE observation_id=:observationid;';
				// $results = $db->prepare ( $query );
				// $results->bindParam ( ':modeltable', $type, PDO::PARAM_STR );
				// $results->bindParam ( ':observationid', $parentID,
				// PDO::PARAM_INT
				// );
				//
				// $results->execute ();
			}
		} catch (ClassNotFoundException | SQLException | JSONException
				| ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// System.out.println(Database.insertInto(table, columnString, values));

	}
}
