package uk.co.spacelab.backend;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;

public class FileHandler {

	public static String path =
	        "/Users/petros/Dropbox/ktp2013/code/Eclipse/Database/data/upload/";

	private static String getFileName(final Part part) {
		final String partHeader = part.getHeader("content-disposition");
		System.out.println("Part Header = {0}" + partHeader);
		for (String content : part.getHeader("content-disposition")
		        .split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
				        .replace("\"", "");
			}
		}
		return null;
	}
	public static String uploadFileAndGetAlias(HttpServletRequest request,
	        String fileType,
	        long fileAliveTime /*
	                            * time in seconds for the file to be left alive
	                            */) throws IOException, ServletException {

		final Part filePart = request.getPart("file");
		final String fileName = getFileName(filePart);
		System.out.println(fileName);
		if (!fileName.endsWith("." + fileType)) {
			throw new MalformedDataException(
			        "file type not " + fileType + "... -_-");
		}
		OutputStream out = null;
		InputStream filecontent = null;
		String uuid = Long.toHexString(Double.doubleToLongBits(Math.random()));;
		try {
			out = new FileOutputStream(
			        new File(path + File.separator + uuid + "." + fileType));
			filecontent = filePart.getInputStream();
			int read = 0;
			final byte [] bytes = new byte [1024];
			while ((read = filecontent.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			return uuid;
		} catch (FileNotFoundException fne) {
			System.out.println(
			        "You either did not specify a file to upload or are "
			                + "trying to upload a file to a protected or nonexistent "
			                + "location.");
			System.err.println("Problems during file upload. Error: {0}"
			        + fne.getMessage());
		} finally {
			if (out != null) {
				out.close();
			}
			if (filecontent != null) {
				filecontent.close();
			}

		}
		return null;
	}
	public static String uploadTempFileAndGetAlias(HttpServletRequest request,
	        String tempFilePrefix, String fileType,
	        long fileAliveTime /*
	                            * time in seconds for the file to be left alive
	                            */) throws IOException, ServletException {

		final Part filePart = request.getPart("file");
		final String fileName = getFileName(filePart);
		if (!fileName.endsWith("." + fileType)) {
			throw new MalformedDataException(
			        "file type not " + fileType + "... -_-");
		}
		OutputStream out = null;
		InputStream filecontent = null;
		try {
			File f = File.createTempFile(tempFilePrefix, "." + fileType);
			out = new FileOutputStream(f);
			filecontent = filePart.getInputStream();
			int read = 0;
			final byte [] bytes = new byte [1024];
			while ((read = filecontent.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			String newFileName = f.getName();
			newFileName = newFileName.substring(0,
			        newFileName.length() - 1 - fileType.length());
			return newFileName;
		} catch (FileNotFoundException fne) {
			System.out.println(
			        "You either did not specify a file to upload or are "
			                + "trying to upload a file to a protected or nonexistent "
			                + "location.");
			System.err.println("Problems during file upload. Error: {0}"
			        + fne.getMessage());
		} finally {
			if (out != null) {
				out.close();
			}
			if (filecontent != null) {
				filecontent.close();
			}

		}
		return null;
	}
}