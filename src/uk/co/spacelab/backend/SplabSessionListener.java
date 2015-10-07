package uk.co.spacelab.backend;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListener;
import uk.co.spacelab.Constants;

public class SplabSessionListener implements SessionListener {
	private static int EXPIRATION_SECONDS = 10 * 60;
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
		List<String> tempFiles =
				(List<String>) s
						.getAttribute(Constants.SESSION_TEMP_FILES_ATTR);
		if (null != tempFiles) for (String f : tempFiles) {
			File file = new File(FileHandler.getTempDir(), f);
			System.out.println(file.getAbsolutePath());
			if (file.exists()) {
				System.out.println("deleting...");
				file.delete();
			}
		}

	}
	public static void cleanTempFilesOfType(Session session, String type,
			Long newFileLength) {
		List<String> tempFiles = getTempFiles(session);
		for (String tempFile : tempFiles)
			if (tempFile.startsWith(type)) {
				File f = new File(FileHandler.getTempDir(), tempFile);
				if (null != newFileLength && f.length() == newFileLength) {
					System.out.println("File " + f.toString()
							+ " same size as new. Deleting...");
					f.delete();
				} else
					if (f.lastModified()
							+ EXPIRATION_SECONDS * 1000 < new Date()
									.getTime()) {
					System.out.println(
							"File " + f.toString() + " too old. Deleting...");
					f.delete();
				}
			}
	}
	public static List<String> getTempFiles(Session session) {
		@SuppressWarnings("unchecked")
		List<String> tempFiles =
				(List<String>) session
						.getAttribute(Constants.SESSION_TEMP_FILES_ATTR);
		if (null == tempFiles) {
			tempFiles = new ArrayList<String>();
			session.setAttribute(Constants.SESSION_TEMP_FILES_ATTR, tempFiles);
		}
		return tempFiles;
	}

}