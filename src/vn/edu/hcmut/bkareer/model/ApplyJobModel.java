/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.server.Request;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class ApplyJobModel extends BaseModel {
	public static final ApplyJobModel Instance = new ApplyJobModel();
	
	private static final MultipartConfigElement MULTI_PART_CONFIG = new MultipartConfigElement(System.getProperty("java.io.tmpdir"));
	private ApplyJobModel(){
		
	}
	
	private final String MULTIPART_FORMDATA_TYPE = "multipart/form-data";
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken verifyUserToken = verifyUserToken(req);
		if (verifyUserToken == null) {
			ret.put(RetCode.success, false);
			ret.put(RetCode.token, "");
		} else {
			if (verifyUserToken.isNewToken()) {
				ret.put(RetCode.token, verifyUserToken.getToken());
			}
			int jobId = getIntParam(req, "jobid", -1);
			String note = getStringParam(req, "note");
			int fileId = getIntParam(req, "fileid", -1);
			if (fileId < 0) {
				fileId = saveUploadFile(req, "upload", verifyUserToken);
			}
			if (jobId > 0 && fileId > 0) {				
				boolean applyStatus = DBConnector.Instance.applyJob(jobId, fileId, note, 0);
				ret.put(RetCode.success, applyStatus);
			} else {
				ret.put(RetCode.success, false);
			}			
		}
		response(req, resp, ret);
	}
	
	private boolean isUploadFileRequest(HttpServletRequest req) {
		String contentType = req.getContentType();
		boolean valid =  contentType != null && contentType.startsWith(MULTIPART_FORMDATA_TYPE);
		if (valid) {
			req.setAttribute(Request.__MULTIPART_CONFIG_ELEMENT, MULTI_PART_CONFIG);
		}
		return valid;
	}
	
	private int saveUploadFile(HttpServletRequest req, String fileKey, VerifiedToken token) {
		int fileId = -1;
		if (isUploadFileRequest(req)) {
			Part file = null;
			InputStream inputStream  = null;
			try {
				file = req.getPart(fileKey);
				if (file.getSize() > AppConfig.MAX_UPLOAD_FILE_SIZE) {
					throw new Exception("File too big");
				}
				String filename = file.getSubmittedFileName();
				inputStream = file.getInputStream();
				String fileDir = AppConfig.UPLOAD_DIR + "/" + buildFileName(filename, token.getUsername());
				saveFileToDisk(inputStream, fileDir);
				fileId = DBConnector.Instance.writeFileMetaToDB(filename, fileDir, token.getUserId());
			} catch (Exception e) {
				fileId = -1;
			} finally {
				if (file != null) {
					try {
						file.delete();
					} catch (Exception e) {}
				}
				if (inputStream != null) {
					try {
						inputStream.close();
					} catch (Exception e) {}
				}
			}
		}
		return fileId;
	}
	
	private void saveFileToDisk(InputStream is, String filename) throws IOException {
		try (FileOutputStream fos = new FileOutputStream(filename)){
			byte[] buffer = new byte[524288];
			int byteRead = is.read(buffer);
			while (byteRead > -1) {
				fos.write(buffer, 0, byteRead);
				byteRead = is.read(buffer);
			}
			fos.flush();
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
		String ret = String.format("%s_%s_%s.%s", fname, userName, System.currentTimeMillis(), extname);
		return ret;
	}
}
