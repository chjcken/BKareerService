/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.MultipartConfigElement;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import org.eclipse.jetty.server.Request;

/**
 *
 * @author zen
 */
public class Upload {
	private static final MultipartConfigElement MULTI_PART_CONFIG = new MultipartConfigElement(System.getProperty("java.io.tmpdir"));
	private static final String MULTIPART_FORMDATA_TYPE = "multipart/form-data";
	
	public static boolean isUploadFileRequest(HttpServletRequest req) {
		String contentType = req.getContentType();
		boolean valid = contentType != null && contentType.startsWith(MULTIPART_FORMDATA_TYPE);
		if (valid) {
			req.setAttribute(Request.__MULTIPART_CONFIG_ELEMENT, MULTI_PART_CONFIG);
		}
		return valid;
	}
	
	public static boolean deleteFile(String path) {
		File file = new File(path);
		return file.delete();
	}

	public static String saveUploadFile(Part file, String identifier, String dir) {
		try {
			if (dir == null) dir = AppConfig.IMAGES_DIR;
			
			InputStream inputStream = null;
			String filename = file.getSubmittedFileName();
			inputStream = file.getInputStream();
			mkDir(dir);
			String fileDir = dir + "/" + buildFileName(filename, identifier);
			saveFileToDisk(inputStream, fileDir);
			return fileDir;
		} catch (IOException ex) {
			Logger.getLogger(Upload.class.getName()).log(Level.SEVERE, null, ex);
		}
		
		return null;
	}
	
	public static void saveFileToDisk(InputStream is, String filename) throws IOException {
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
	
	public static void mkDir(String dir) {
		File newdir = new File(dir);
		if (!newdir.isDirectory()) {
			newdir.mkdir();
		}
	}
	
	public static String buildFileName(String originName, String identifier) {
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
		String ret = String.format("%s_%s_%s%s", fname, identifier, System.currentTimeMillis(), extname);
		return ret;
	}
}
