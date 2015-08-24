package uk.co.spacelab.backend;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;

public class SplabHttpServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8187114929610908294L;
	protected void sendInterfaceError(HttpServletResponse response, String errorMessage)
			throws IOException {
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		response.getWriter().print(errorMessage);
	}
}
