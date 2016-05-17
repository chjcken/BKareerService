/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.common.FileMeta;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class DownloadFileModel extends BaseModel {
	public static final DownloadFileModel Instance = new DownloadFileModel();
	
	private DownloadFileModel(){
		
	}
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		VerifiedToken verifyUserToken = verifyUserToken(req);
		if (verifyUserToken == null) {
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
		} else {
			int fileId = getIntParam(req, "fileid", -1);
			if (fileId < 0) {
				resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
			} else {
				FileMeta fileMeta = DBConnector.Instance.getFileMeta(fileId);
				if (fileMeta == null) {
					resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
				} else {
					responseFileData(resp, fileMeta);
				}
			}
		}
	}
	
	private void responseFileData(HttpServletResponse resp, FileMeta fileMeta) {
		FileInputStream fis = null;
		OutputStream outputStream = null;
		try {
			fis = new FileInputStream(fileMeta.getUrl());
			outputStream = resp.getOutputStream();
			resp.setContentType("application/x-download");
			resp.setHeader("Content-Disposition", "attachment; filename=" + fileMeta.getName());
			byte[] buffer = new byte[524288];
			int byteRead = fis.read(buffer);
			while (byteRead > -1) {
				outputStream.write(buffer, 0, byteRead);
				byteRead = fis.read(buffer);
			}
			resp.setStatus(HttpServletResponse.SC_OK);
		} catch (Exception e) {
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
		} finally {
			if (fis != null) {
				try {
					fis.close();
				} catch (Exception e) {}
			}
			if (outputStream != null) {
				try {
					outputStream.flush();
					outputStream.close();
				} catch (Exception e) {}
			}
		}
	}
	
}
