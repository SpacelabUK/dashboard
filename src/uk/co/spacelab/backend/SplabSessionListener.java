package uk.co.spacelab.backend;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListener;

public class SplabSessionListener implements SessionListener {
	@Override
	public void onExpiration(Session s) {
		onStop(s);

	}

	@Override
	public void onStart(Session s) {

	}

	@Override
	public void onStop(Session s) {
		// uploaded file cleanup
		@SuppressWarnings("unchecked")
		List<String> tempFiles = (List<String>) s.getAttribute("tempFiles");
		if (null != tempFiles) for (String f : tempFiles) {
			File file = new File(System.getProperty("java.io.tmpdir") + f);
			if (file.exists()) {
				file.delete();
			}
		}

	}
	public static List<String> getTempFiles(Session session) {
		@SuppressWarnings("unchecked")
		List<String> tempFiles =
		        (List<String>) session.getAttribute("tempFiles");
		if (null == tempFiles) {
			tempFiles = new ArrayList<String>();
			session.setAttribute("tempFiles", tempFiles);
		}
		return tempFiles;
	}

}