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
        String _id = getParam(req, "id");
        String _pass = getParam(req, "password");
        JSONObject res = new JSONObject();  

        if (_checkLogin(_id, _pass)){
            UserSession session = new UserSession(_id);
            _mapSessions.put(_id, session);
            res.put(RetCode.success.toString(), true);
            res.put(RetCode.sid.toString(), session.sid);
            res.put(RetCode.role.toString(), Role.AGENCY.toString());
        } else {
            res.put(RetCode.success.toString(), false);
        }
        return res.toJSONString();
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {

    }
    
}
