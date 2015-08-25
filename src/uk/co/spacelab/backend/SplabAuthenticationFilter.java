package uk.co.spacelab.backend;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.apache.shiro.web.util.SavedRequest;

public class SplabAuthenticationFilter extends FormAuthenticationFilter {
	@Override
	protected boolean onLoginSuccess(AuthenticationToken token, Subject subject,
			ServletRequest request, ServletResponse response) throws Exception {

		/**
		 * if after login the page is not part of the angular app (#) delete the
		 * saved request to send the user to the homepage. TODO needs better
		 * execution. Maybe split the backend so it's easy to find whether the
		 * request was an ajax one. In that case it would also be good to find
		 * the user's location before the saved request to redirect them there
		 * (not at the ajax call's location)
		 **/

		SavedRequest rq =
				(SavedRequest) subject.getSession()
						.getAttribute("shiroSavedRequest");
		if (null != rq && !rq.getRequestUrl().contains("#"))
			subject.getSession().removeAttribute("shiroSavedRequest");
		return super.onLoginSuccess(token, subject, request, response);
	}
}
