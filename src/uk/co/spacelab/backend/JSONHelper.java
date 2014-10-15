package uk.co.spacelab.backend;

import java.io.BufferedReader;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class JSONHelper {
	public static JSONObject decodeRequest(HttpServletRequest request)
			throws IOException {
		StringBuffer jb = new StringBuffer();
		String line = null;
		JSONObject jsonObject;
		BufferedReader reader = request.getReader();
		while ((line = reader.readLine()) != null)
			jb.append(line);
		try {
			jsonObject = new JSONObject(jb.toString());
		} catch (JSONException e) {
			e.printStackTrace();
			throw new IOException("Error parsing JSON request string");
		}
		return jsonObject;
	}
}
