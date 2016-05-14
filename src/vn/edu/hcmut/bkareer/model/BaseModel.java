/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import vn.edu.hcmut.bkareer.common.JwtHelper;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public abstract class BaseModel {
    
    protected enum RetCode {
        success,
        role,
		data,
		token
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
		
		public int getValue(){
			return value;
		}
		
		public static Role fromInteger(int value){
			switch (value) {
				case 0:
					return MANAGER;
				case 1:
					return AGENCY;
				case 2:
					return STUDENT;
				case 3:
					return SYSAD;
				default:
					return UNKNOWN;
			}
		}
    }

    public abstract void process(HttpServletRequest req, HttpServletResponse resp);
	
	protected VerifiedToken verifyUserToken(HttpServletRequest req) {
		String reqTok = getHeader(req, "Authorization");
		return JwtHelper.Instance.verifyToken(reqTok);		
	}

    protected void response(HttpServletRequest req, HttpServletResponse resp, Object content) {
        try (PrintWriter out = resp.getWriter()) {
            out.print(content);
        } catch (Exception ex) {
            System.err.println(ex.getMessage() + " while processing URI \"" + req.getRequestURI() + "?" + req.getQueryString() + "\"");
        }
    }
    
    protected void prepareHeaderHtml(HttpServletResponse resp) {
        resp.setCharacterEncoding("utf-8");
        resp.setContentType("text/html; charset=UTF-8");
    }
    
    protected void prepareHeaderJs(HttpServletResponse resp) {
        resp.setCharacterEncoding("utf-8");
        resp.setContentType("text/javascript; charset=UTF-8");
    }
	
	protected void prepareHeaderJson(HttpServletResponse resp){
		resp.setCharacterEncoding("utf-8");
        resp.setContentType("application/json");		
	}
    
    protected String getStringParam(HttpServletRequest req, String key){
        String parameter = req.getParameter(key);
        if (parameter == null){
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
	
	protected String[] getParamArray(HttpServletRequest req, String key){
		String[] params = req.getParameterValues(key);
		if (params == null){
			return new String[]{};
		} else {
			return params;
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
        if (parameter == null){
            return "";            
        } else {
            return parameter;
        }
	}
	
	protected JSONObject getJsonFromBody(HttpServletRequest req){
		JSONParser parser = new JSONParser();
		JSONObject ret;
		try {
			BufferedReader reader = req.getReader();
			ret = (JSONObject) parser.parse(reader);
		} catch (IOException | ParseException e){
			ret = new JSONObject();
		}
		return ret;
	}
	
	protected String getJsonValue(JSONObject obj, String key){
		Object get = obj.get(key);
		if (get == null){
			return "";
		} else {
			return String.valueOf(get);
		}
	}

    //other util for model here
}
