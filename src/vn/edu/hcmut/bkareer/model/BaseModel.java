/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.PrintWriter;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Kiss
 */
public abstract class BaseModel {

    public abstract void process(HttpServletRequest req, HttpServletResponse resp);

    protected void response(HttpServletRequest req, HttpServletResponse resp, Object content) {
        PrintWriter out = null;
        try {
            out = resp.getWriter();
            out.print(content);
        } catch (Exception ex) {
            System.err.println(ex.getMessage() + " while processing URI \"" + req.getRequestURI() + "?" + req.getQueryString() + "\"");
        } finally {
            if (out != null) {
                out.close();
            }
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
    
    protected String getParam(HttpServletRequest req, String key){
        String parameter = req.getParameter(key);
        if (parameter == null){
            return "";            
        } else {
            return parameter;
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
    
    //other util for model here
}
