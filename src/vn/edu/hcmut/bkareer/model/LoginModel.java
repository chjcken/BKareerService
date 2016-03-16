/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.common.UserSession;

/**
 *
 * @author Kiss
 */
public class LoginModel extends BaseModel{
    public enum Role {
        STUDENT,
        AGENCY,
        MANAGER
    }
    
    
    public static final LoginModel Instance = new LoginModel();
    
    private static final ConcurrentHashMap<String, UserSession> _mapSessions = new ConcurrentHashMap<>();
    private static final long _sessionExpire = 604800;// 7 days
    private LoginModel(){
    }
    
    private boolean _checkLogin(String id, String password){
        return DBConnector.Instance.checkPassword(id, password);
    }
    
    private UserSession _createSession(String userName) {
        UserSession session = new UserSession(userName);
        _mapSessions.put(session.sid, session);
        return session;
    }

    public UserSession getSession(String sid) {
        UserSession userSession = _mapSessions.get(sid);
        if (userSession == null) {
            return null;
        }

        if (System.currentTimeMillis() - userSession.time > _sessionExpire * 1000) {
            // session is expired
            return null;
        }
        return userSession;
    }

    public UserSession getSession(HttpServletRequest req) {
        String session = getCookie(req, "bksession");
        return getSession(session);
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String id = "admin";
            String pass = "d033e22ae348aeb5660fc2140aec35850c4da997";
            String _id = getParam(req, "id");
            String _pass = getParam(req, "password");
            JSONObject res = new JSONObject();

            UserSession session = getSession(req);
            String q = getParam(req, "q");
            if (q.equals("logout") && session != null){
                //logout request - redirect to welcome page
                
                _mapSessions.remove(session.userName);
               res.put("success", true);
            }
            
            if (session != null){
                
            }
            
            
        } catch (Exception e) {
            prepareHeaderHtml(resp);
            response(req, resp, "Exception: " + e);
        }
    }
    
}
