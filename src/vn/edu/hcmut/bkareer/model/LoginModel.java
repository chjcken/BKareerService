/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ConfigHelper;
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.common.UserSession;

/**
 *
 * @author Kiss
 */
public class LoginModel extends BaseModel{
    public static enum Role {
		UNKNOWN(-1),
        STUDENT(0),
        AGENCY(1),
        MANAGER(2);
		
		private final int value;
		
		private Role(int value) {
			this.value = value;
        }
		public static Role fromInteger(int value){
			switch (value) {
				case 0:
					return STUDENT;
				case 1:
					return AGENCY;
				case 2:
					return MANAGER;
				default:
					return UNKNOWN;
			}
		}
    }
    
    
    public static final LoginModel Instance = new LoginModel();
    
    private final ConcurrentHashMap<String, UserSession> _mapSessions;
    private final long _sessionExpire;
    private LoginModel(){
		_mapSessions = new ConcurrentHashMap<>();
		_sessionExpire = ConfigHelper.Instance.getInt("session_expire", 604800);// default: 7 days
    }
    
    private UserSession _createSession(String userName) {
        UserSession session = new UserSession(userName);
        _mapSessions.put(session.sid, session);
        return session;
    }
    
    public void deleteSession(String sid){
        _mapSessions.remove(sid);
    }

    public UserSession getSession(String sid) {
        UserSession userSession = _mapSessions.get(sid);
        if (userSession == null) {
            return null;
        }

        if (System.currentTimeMillis() - userSession.time > _sessionExpire * 1000) {
            // session is expired
            deleteSession(sid);
            return null;
        }
        return userSession;
    }

    public UserSession getSession(HttpServletRequest req) {
        String session = getParam(req, "bksession");
        return getSession(session);
    }
    
    public String doLogin(HttpServletRequest req){
		JSONObject body = getJsonFromBody(req);
		
        String id = getJsonValue(body, "id");
        String pass = getJsonValue(body, "password");
		
        JSONObject res = new JSONObject();  
		
		int resCode = DBConnector.Instance.checkPassword(id, pass);
        if (resCode >= 0){
            UserSession session = _createSession(id);
            res.put(BaseModel.RetCode.success.toString(), true);
            res.put(BaseModel.RetCode.sid.toString(), session.sid);
            res.put(BaseModel.RetCode.role.toString(), Role.fromInteger(resCode).toString());
        } else {
            res.put(BaseModel.RetCode.success.toString(), false);
        }
        return res.toJSONString();
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {

    }
    
}
