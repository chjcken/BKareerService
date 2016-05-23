/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.zip.GZIPOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public abstract class BaseModel {

	public abstract void process(HttpServletRequest req, HttpServletResponse resp);

	protected VerifiedToken verifyUserToken(HttpServletRequest req) {
		String reqTok = getCookie(req, "Authorization");
		return JwtHelper.Instance.verifyToken(reqTok);
	}

	protected void invalidateCookie(HttpServletRequest req, HttpServletResponse resp) {
		Cookie[] cookies = req.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				cookie.setValue("");
				cookie.setPath("/");
				cookie.setMaxAge(0);
				resp.addCookie(cookie);
			}
		}
	}
	
	protected void setAuthTokenToCookie(HttpServletResponse resp, String token) {
		Cookie c = new Cookie("Authorization", token);
		c.setHttpOnly(true);
		c.setMaxAge(AppConfig.SESSION_EXPIRE);
		resp.addCookie(c);
	}

	protected void response(HttpServletRequest req, HttpServletResponse resp, Object content) {
		try (PrintWriter out = getResponseWriter(req, resp)) {
			out.print(content);
		} catch (Exception ex) {
			System.err.println(ex.getMessage() + " while processing URI \"" + req.getRequestURI() + "?" + req.getQueryString() + "\"");
		}
	}
	
	protected PrintWriter getResponseWriter(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		PrintWriter writer;
		String acceptEncoding = getHeader(req, "Accept-Encoding");
		if (acceptEncoding.contains("gzip")) {
			resp.addHeader("Content-Encoding", "gzip");
			writer = new PrintWriter(new GZIPOutputStream(resp.getOutputStream()));
		} else {
			writer = resp.getWriter();
		}
		return writer;
	}

	protected void prepareHeaderHtml(HttpServletResponse resp) {
		resp.setCharacterEncoding("utf-8");
		resp.setContentType("text/html; charset=UTF-8");
	}

	protected void prepareHeaderJs(HttpServletResponse resp) {
		resp.setCharacterEncoding("utf-8");
		resp.setContentType("text/javascript; charset=UTF-8");
	}

	protected void prepareHeaderJson(HttpServletResponse resp) {
		resp.setCharacterEncoding("utf-8");
		resp.setContentType("application/json");
	}

	protected String getStringParam(HttpServletRequest req, String key) {
		String parameter = req.getParameter(key);
		if (parameter == null) {
			return "";
		} else {
			return parameter;
		}
	}

	protected int getIntParam(HttpServletRequest req, String key, int defaultVal) {
		String parameter = req.getParameter(key);
		try {
			return Integer.parseInt(parameter);
		} catch (Exception e) {
			return defaultVal;
		}
	}
	
	protected long getLongParam(HttpServletRequest req, String key, long defaultVal) {
		String parameter = req.getParameter(key);
		try {
			return Long.parseLong(parameter);
		} catch (Exception e) {
			return defaultVal;
		}
	}

	protected List<String> getParamArray(HttpServletRequest req, String key) {
		String[] params = req.getParameterValues(key);
		if (params == null) {
			return new ArrayList<>();
		} else {
			return Arrays.asList(params);
		}
	}

	protected String getCookie(HttpServletRequest req, String key) {
		Cookie[] cookies = req.getCookies();
		if (cookies != null && cookies.length > 0) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals(key)) {
					return cookie.getValue();
				}
			}
		}
		return "";
	}

	protected String getHeader(HttpServletRequest req, String key) {
		String parameter = req.getHeader(key);
		if (parameter == null) {
			return "";
		} else {
			return parameter;
		}
	}

	protected JSONObject getJsonFromBody(HttpServletRequest req) {
		JSONParser parser = new JSONParser();
		JSONObject ret;
		try {
			BufferedReader reader = req.getReader();
			ret = (JSONObject) parser.parse(reader);
		} catch (IOException | ParseException e) {
			ret = new JSONObject();
		}
		return ret;
	}

	protected String getJsonValue(JSONObject obj, String key) {
		Object get = obj.get(key);
		if (get == null) {
			return "";
		} else {
			return String.valueOf(get);
		}
	}

	protected String[] toStringArray(JSONArray arr) {
		ArrayList<String> arrStr = new ArrayList<>();
		for (Object o : arr) {
			arrStr.add((String) o);
		}
		return arrStr.toArray(new String[arrStr.size()]);
	}

	protected String getParamFromBody(InputStream is) {
		if (is == null) {
			return "";
		}
		try (BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();
			while (line != null) {
				sb.append(line);
				line = br.readLine();
			}
			return sb.toString();
		} catch (Exception e) {
			return "";
		}
	}
	
	public enum Role {
		UNKNOWN(-1),
		MANAGER(0),
		AGENCY(1),
		STUDENT(2),
		SYSAD(3);

		private final int value;

		private Role(int value) {
			this.value = value;
		}

		public int getValue() {
			return value;
		}
		
		public boolean equals(int val) {
			return this.value == val;
		}

		public static Role fromInteger(int value) {
			switch (value) {
				case 0:
					return MANAGER;
				case 1:
					return AGENCY;
				case 2:
					return STUDENT;
				default:
					return UNKNOWN;
			}
		}
	}
	
	public enum AppliedJobStatus {
		UNKNOWN(-1),
		PENDING(0),
		DENIED(1),
		APPROVED(2);

		private final int value;

		private AppliedJobStatus(int value) {
			this.value = value;
		}

		public int getValue() {
			return value;
		}
		
		public boolean equals(int val) {
			return this.value == val;
		}

		public static AppliedJobStatus fromInteger(int value) {
			switch (value) {
				case 0:
					return PENDING;
				case 1:
					return DENIED;
				case 2:
					return APPROVED;
				default:
					return UNKNOWN;
			}
		}
	}
	
	public enum RetCode {
		success,
		role,
		data,
		token,
		unauth,
		id,
		name,
		upload_date,
		tags,
		agency,
		url_imgs,
		url_logo,
		post_date,
		expire_date,
		requirement,
		benifits,
		full_desc,
		brief_desc,
		is_internship,
		is_close,
		location,
		address,
		district,
		city,
		title,
		salary,
		jobs_similar,
		apply_num,
		status,
		is_applied,
		districts,
		tech_stack,
		applied_students
	}
}
