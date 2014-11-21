package uk.co.spacelab.backend;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import flow.js.upload.FlowInfo;
import flow.js.upload.FlowInfoStorage;
import flow.js.upload.HttpUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;

public class FlowUpload extends HttpServlet {

	protected String post(HttpServletRequest request,
			HttpServletResponse response, String UPLOAD_DIR)
			throws ServletException, IOException {
		int flowChunkNumber = getFlowChunkNumber(request);

		FlowInfo info = getFlowInfo(request, UPLOAD_DIR);

		RandomAccessFile raf = new RandomAccessFile(info.flowFilePath, "rw");

		// Seek to position
		raf.seek((flowChunkNumber - 1) * info.flowChunkSize);

		// Save to file
		InputStream is = request.getInputStream();
		long readed = 0;
		long content_length = request.getContentLength();
		byte [] bytes = new byte [1024 * 100];
		while (readed < content_length) {
			int r = is.read(bytes);
			if (r < 0) {
				break;
			}
			raf.write(bytes, 0, r);
			readed += r;
		}
		raf.close();

		// Mark as uploaded.
		info.uploadedChunks.add(new FlowInfo.FlowChunkNumber(flowChunkNumber));
		File result = info.checkIfUploadFinished();
		if (result != null) { // Check if all chunks uploaded, and
								// change filename
			FlowInfoStorage.getInstance().remove(info);
			// response.getWriter().print("All finished.");
			return result.getAbsolutePath().substring(0,
					result.getAbsolutePath().length() - ".temp".length());
		} else response.getWriter().print("Upload");
		return null;

	}

	protected void get(HttpServletRequest request,
			HttpServletResponse response, String UPLOAD_DIR)
			throws ServletException, IOException {
		int flowChunkNumber = getFlowChunkNumber(request);

		FlowInfo info = getFlowInfo(request, UPLOAD_DIR);

		if (info.uploadedChunks.contains(new FlowInfo.FlowChunkNumber(
				flowChunkNumber))) {
			response.getWriter().print("Uploaded."); // This Chunk has been
														// Uploaded.
		} else {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
		}
	}

	private int getFlowChunkNumber(HttpServletRequest request) {
		return HttpUtils.toInt(request.getParameter("flowChunkNumber"), -1);
	}

	private FlowInfo getFlowInfo(HttpServletRequest request, String UPLOAD_DIR)
			throws ServletException {
		String base_dir = UPLOAD_DIR;

		int flowChunkSize =
				HttpUtils.toInt(request.getParameter("flowChunkSize"), -1);
		long flowTotalSize =
				HttpUtils.toLong(request.getParameter("flowTotalSize"), -1);
		String flowIdentifier = request.getParameter("flowIdentifier");
		String flowFilename = request.getParameter("flowFilename");
		String flowRelativePath = request.getParameter("flowRelativePath");
		// Here we add a ".temp" to every upload file to indicate NON-FINISHED
		String flowFilePath =
				new File(base_dir, flowFilename).getAbsolutePath() + ".temp";

		FlowInfoStorage storage = FlowInfoStorage.getInstance();

		FlowInfo info =
				storage.get(flowChunkSize, flowTotalSize, flowIdentifier,
						flowFilename, flowRelativePath, flowFilePath);
		if (!info.vaild()) {
			storage.remove(info);
			throw new ServletException("Invalid request params.");
		}
		return info;
	}
}
