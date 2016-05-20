/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import javax.servlet.MultipartConfigElement;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.eclipse.jetty.server.Request;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class ApplyJobModel extends BaseModel {

	public static final ApplyJobModel Instance = new ApplyJobModel();

	private static final MultipartConfigElement MULTI_PART_CONFIG = new MultipartConfigElement(System.getProperty("java.io.tmpdir"));

	private ApplyJobModel() {

	}

	private final String MULTIPART_FORMDATA_TYPE = "multipart/form-data";

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null && Role.STUDENT.equals(token.getRole()) && isUploadFileRequest(req)) {
			try {
				HashMap<String, Part> mapPart = new HashMap<>();
				Iterator<Part> iterator = req.getParts().iterator();
				while (iterator.hasNext()) {
					Part part = iterator.next();					
					if (part.getSize() > AppConfig.MAX_UPLOAD_FILE_SIZE) {
						throw new Exception("File too big");
					}
					mapPart.put(part.getName(), part);
				}
				int jobId, fileId;
				String note = "";
				if (!mapPart.containsKey("jobid")) {
					throw new Exception();
				} else {
					String jobIdStr = getParamFromBody(mapPart.get("jobid").getInputStream());
					jobId = (int) Noise64.denoise64(Long.parseLong(jobIdStr));
				}
				if (DatabaseModel.Instance.isUserApplyJob(token.getUserId(), jobId)) {
					throw new Exception();
				}
				if (mapPart.containsKey("note")) {
					note = getParamFromBody(mapPart.get("note").getInputStream());
				}
				if (mapPart.containsKey("fileid")) {
					String fileIdStr = getParamFromBody(mapPart.get("fileid").getInputStream());
					fileId = (int) Noise64.denoise64(Long.parseLong(fileIdStr));
				} else if (mapPart.containsKey("upload")) {
					fileId = saveUploadFile(mapPart.get("upload"), token);
				} else {
					throw new Exception();
				}
				if (jobId > 0 && fileId > 0) {
					boolean applyStatus = DatabaseModel.Instance.applyJob(jobId, fileId, token.getUserId(), note, 0);
					ret.put(RetCode.success, applyStatus);
				} else {
					ret.put(RetCode.success, false);
				}
				if (token.isNewToken()) {
					setAuthTokenToCookie(resp, token.getToken());
				}
			} catch (Exception e) {
				ret.put(RetCode.success, false);
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, false);
		}
		response(req, resp, ret);
	}

	private boolean isUploadFileRequest(HttpServletRequest req) {
		String contentType = req.getContentType();
		boolean valid = contentType != null && contentType.startsWith(MULTIPART_FORMDATA_TYPE);
		if (valid) {
			req.setAttribute(Request.__MULTIPART_CONFIG_ELEMENT, MULTI_PART_CONFIG);
		}
		return valid;
	}

	private int saveUploadFile(Part file, VerifiedToken token) {
		int fileId = -1;

		InputStream inputStream = null;
		try {
			String filename = file.getSubmittedFileName();
			inputStream = file.getInputStream();
			mkDir(AppConfig.UPLOAD_DIR);
			String fileDir = AppConfig.UPLOAD_DIR + "/" + buildFileName(filename, token.getUsername());
			saveFileToDisk(inputStream, fileDir);
			fileId = DatabaseModel.Instance.writeFileMetaToDB(filename, fileDir, token.getUserId());
		} catch (Exception e) {
			fileId = -1;
		} finally {
			if (file != null) {
				try {
					file.delete();
				} catch (Exception e) {
				}
			}
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (Exception e) {
				}
			}
		}

		return fileId;
	}

	private void saveFileToDisk(InputStream is, String filename) throws IOException {
		try (FileOutputStream fos = new FileOutputStream(filename)) {
			byte[] buffer = new byte[524288];
			int byteRead = is.read(buffer);
			while (byteRead > -1) {
				fos.write(buffer, 0, byteRead);
				byteRead = is.read(buffer);
			}
			fos.flush();
		}
	}
	
	private void mkDir(String dir) {
		File newdir = new File(dir);
		if (!newdir.isDirectory()) {
			newdir.mkdir();
		}
	}

	private String buildFileName(String originName, String userName) {
		int lastIndexOf = originName.lastIndexOf(".");
		String fname;
		String extname;
		if (lastIndexOf < 0) {
			fname = originName;
			extname = "";
		} else {
			fname = originName.substring(0, lastIndexOf);
			extname = originName.substring(lastIndexOf);
		}
		String ret = String.format("%s_%s_%s%s", fname, userName, System.currentTimeMillis(), extname);
		return ret;
	}
}
