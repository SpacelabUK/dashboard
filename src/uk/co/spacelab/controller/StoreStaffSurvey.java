package uk.co.spacelab.controller;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.text.ParseException;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.json.JSONObject;

import uk.co.spacelab.backend.Constants;
import uk.co.spacelab.backend.Database;
import uk.co.spacelab.backend.FileHandler;
import uk.co.spacelab.backend.JSONHelper;
import uk.co.spacelab.backend.in.StaffSurveyReader;

//@WebServlet("/StoreStaffSurvey")
@WebServlet(urlPatterns = {"/StoreStaffSurvey"}, asyncSupported = true)
public class StoreStaffSurvey extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String sessionAtt = "currentOperation";
	private static final String inputDataType = "staff";
	private static final String inputFileType = "vna";
	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StoreStaffSurvey() {
		super();
	}
	/*
	 * Use to obtain a status report of the post request. Valid status reports
	 * have status = 202 and are not errors
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Session session = SecurityUtils.getSubject().getSession();
		JSONObject op = (JSONObject) session.getAttribute(sessionAtt);
		System.out.println(op);
		if (null != op) {
			response.setStatus(202);
			if (op.has("progress"))
				op.put("progress",
						Math.floor(op.getDouble("progress") * 100) / 100);
			response.getWriter().print(op);
		} else response.sendError(HttpServletResponse.SC_NOT_FOUND);

	}
	/*
	 * Stores the staff survey data
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		final Subject s = SecurityUtils.getSubject();
		request.setAttribute("org.apache.catalina.ASYNC_SUPPORTED", true);
		AsyncContext ac = request.startAsync();
		// This operation takes quite some time thus it's timeout is set to 5
		// minutes
		ac.setTimeout(5 * 60 * 1000);
		ac.addListener(new AsyncListener() {
			@Override
			public void onComplete(AsyncEvent event) throws IOException {
				System.out.println("Async complete");
				s.getSession().removeAttribute(sessionAtt);
			}
			@Override
			public void onTimeout(AsyncEvent event) throws IOException {
				System.out.println("Timed out...");
				s.getSession().removeAttribute(sessionAtt);
			}
			@Override
			public void onError(AsyncEvent event) throws IOException {
				System.out.println("Error...");
				s.getSession().removeAttribute(sessionAtt);
			}
			@Override
			public void onStartAsync(AsyncEvent event) throws IOException {
				System.out.println("Starting async...");
			}
		});
		// Runnable r = s.associateWith(
		// new StaffSurveyStoreProcess(JSONHelper.decodeRequest(request)));
		// ExecutorService executor = (ExecutorService) getServletContext()
		// .getAttribute("SERVLET_EXECUTOR");
		// executor.submit(r);
		Runnable r = s.associateWith(new StaffSurveyStoreProcess(ac));
		ac.start(r);

	}
	boolean validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
	class StaffSurveyStoreProcess implements Runnable {
		AsyncContext ac;
		StaffSurveyStoreProcess(AsyncContext ac) {
			this.ac = ac;
		}
		// JSONObject paramsJSON;
		// StaffSurveyStoreProcess(JSONObject paramsJSON) {
		// this.paramsJSON = paramsJSON;
		// }
		@Override
		public void run() {
			Subject s = SecurityUtils.getSubject();
			Session session = s.getSession();
			JSONObject progress = new JSONObject();
			progress.put("text", "Starting...");
			session.setAttribute(sessionAtt, progress);
			try {
				HttpServletRequest request =
						(HttpServletRequest) ac.getRequest();
				HttpServletResponse response =
						(HttpServletResponse) ac.getResponse();
				PrintWriter out = response.getWriter();
				out.print("spl");
				response.setContentType("text/html;charset=UTF-8");
				JSONObject paramsJSON = JSONHelper.decodeRequest(request);
				int studyID = paramsJSON.getInt("studyid");
				String fileName = paramsJSON.getString("fileid");
				JSONObject datain = paramsJSON.getJSONObject("datain");
				File file =
						FileHandler.getTempFile(inputDataType, fileName,
								inputFileType);
				try (Connection psql = Database.getConnection();) {
					psql.setAutoCommit(false);
					new StaffSurveyReader().convert(psql, session, sessionAtt,
							file, studyID, datain);
					psql.commit();
					psql.close();
					System.out.println("Done");
					file.delete();
				} catch (ClassNotFoundException | SQLException
						| ParseException e) {
					e.printStackTrace();
				} finally {
					if (out != null) {
						out.close();
					}
					FileUtils.forceDelete(file);
				}

			} catch (IOException e) {
				// log("Problem processing task", e);
			}
			ac.complete();
		}
	}
}
