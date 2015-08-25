package uk.co.spacelab.backend;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

public class SplabHttpServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8187114929610908294L;
	protected void sendInterfaceError(HttpServletResponse response,
			String errorMessage) throws IOException {
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		response.getWriter().print(errorMessage);
	}

	final protected boolean validParam(Map<String, String []> params,
			String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
}
