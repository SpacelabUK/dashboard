package uk.co.spacelab.controller;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import uk.co.spacelab.backend.Database;

/**
 * Servlet implementation class QueryDeskOccupancy
 */
@WebServlet("/QueryDeskOccupancy")
public class QueryDeskOccupancy extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public QueryDeskOccupancy() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		JSONObject input =
				new JSONObject(
						"{"
								+ "\"columns\":[\"space_id\", \"entity_id\"]," //
								+ "\"groupBy\":[\"observation_id\", \"space_id\", \"entity_id\"]," //
								+ "\"orderBy\":[\"entity_id\"]," //
								+ "\"limitBy\":{\"OR\":[{\"AND\":" //
								+ "[" //
								+ "{\">\":[observation_id,15]}" //
								+ "," //
								+ "{\"=\":[space_id,6]}" //
								+ "]" //
								// +
								// "},{\">\":[lel,1]}],\"lal\":[\"haha\",\"kkk\"]}";
								+ "},{\"=\":[observation_id,10]}]}}"//
								+ "}");
		
		JSONArray columns = input.getJSONArray("columns");
		JSONArray groupBy = input.getJSONArray("groupBy");
		JSONArray orderBy = input.getJSONArray("orderBy");
		
		String columnsString = input.getJSONArray("columns").toString();
		columnsString = columnsString.substring(1, columnsString.length() - 1);
		String groupByString = input.getJSONArray("groupBy").toString();
		groupByString = groupByString.substring(1, groupByString.length() - 1);
		String orderByString = input.getJSONArray("orderBy").toString();
		orderByString = orderByString.substring(1, orderByString.length() - 1);
		
		// String [] groupBy = new String [] {};
		// String [] orderBy = new String [] {};
		// String limiter = "{\"=\",[observation_id,15]}";
		// String limiter = "{\"=\",[space_id,6]}";
		
		JSONObject limitBy = input.getJSONObject("limitBy");
		Map.Entry<String, Map.Entry<Set<String>, List<String>>> limits =
				Database.constructBooleanString(limitBy);
		// TODO: protect with permissions? check whether column exists is the
		// minimum:
		Set<String> limitColumns = limits.getValue().getKey();
		for (int i = 0; i < columns.length(); i++)
			limitColumns.add(columns.getString(i));
		for (int i = 0; i < groupBy.length(); i++)
			limitColumns.add(groupBy.getString(i));
		for (int i = 0; i < orderBy.length(); i++)
			limitColumns.add(orderBy.getString(i));

		List<String> arguments = limits.getValue().getValue();
		String sql =
				"SELECT " + columnsString
						+ " FROM splab_desk_occ_and_space_per_round"
						+ " GROUP BY " + groupByString + " HAVING "
						+ limits.getKey() + " ORDER BY " + orderByString + ";";
		System.out.println(sql);
		try {
			System.out.println(Database.customQuery(sql,
					arguments.toArray(new String [arguments.size()])));
		} catch ( SQLException | ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	String buildString(String [] args) {
		return org.apache.commons.lang3.StringUtils.join(args, ",");
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
