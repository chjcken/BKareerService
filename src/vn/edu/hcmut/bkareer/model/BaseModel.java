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
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.UserStatus;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.ObjectPool;

/**
 *
 * @author Kiss
 */
public abstract class BaseModel {
	
	private final ObjectPool<JSONParser> jsonParserPool = new ObjectPool<>(100);
	
	private final List<String> unauthApiAllowed = Arrays.asList("/login", "/active", "/candidatesignup");
	
	public final JSONParser getJsonParser() {
		JSONParser parser = jsonParserPool.borrow();
		if (parser == null) {
			parser = new JSONParser();
		}
		return parser;
	}
	
	public void returnJsonParser(JSONParser parser) {
		if (parser != null) {
			jsonParserPool.returnObject(parser);
		}
	}
	
	public void authenAndProcess(HttpServletRequest req, HttpServletResponse resp) {
		VerifiedToken token = verifyUserToken(req);
		if (unauthApiAllowed.contains(req.getRequestURI())) { //allow unauth -- process anyway
			process(req, resp, token);
			return;
		}
		if (token == null) { //access denied
			JSONObject ret = new JSONObject();
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
			response(req, resp, ret);
			return;
		}
		if (token.getUserStatus() == UserStatus.CREATED.getValue()) { // account not verify email
			JSONObject ret = new JSONObject();
			ret.put(RetCode.success, ErrorCode.ACCOUNT_NOT_VERIFY_EMAIL.getValue());
			response(req, resp, ret);
			return;
		}
		if (token.getUserStatus() == UserStatus.BANNED.getValue()) { // account banned
			JSONObject ret = new JSONObject();
			ret.put(RetCode.success, ErrorCode.ACCOUNT_BANNED.getValue());
			response(req, resp, ret);
			return;
		}
		process(req, resp, token);
	}

	protected abstract void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token);

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
		try {
			String parameter = req.getParameter(key);
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
			return new ArrayList<>(Arrays.asList(params));
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
	
	public JSONArray getJsonArray(String json) {
		JSONParser parser = getJsonParser();
		JSONArray ret;
		try {
			ret = (JSONArray) parser.parse(json);
		} catch (ParseException e) {
			ret = null;
		} finally {
			returnJsonParser(parser);
		}
		return ret;
	}
	
	public Object getJson(String json) {
		JSONParser parser = getJsonParser();
		Object ret;
		try {
			ret = parser.parse(json);
		} catch (ParseException e) {
			ret = null;
		} finally {
			returnJsonParser(parser);
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
}
