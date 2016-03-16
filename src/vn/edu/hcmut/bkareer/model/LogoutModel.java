/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.UserSession;

/**
 *
 * @author Kiss
 */
public class LogoutModel extends BaseModel{
    public static final LogoutModel Instance = new LogoutModel();
    
    private LogoutModel(){
        
    }

    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
    }
    
    public String doLogout(HttpServletRequest req){
        JSONObject res = new JSONObject();
        String sid = getParam(req, "bksession");
        UserSession session = LoginModel.Instance.getSession(sid);
        
        if (session != null){
            LoginModel.Instance.deleteSession(sid);
            res.put(RetCode.success.toString(), true);
            res.put(RetCode.sid, sid);            
        } else {
            res.put(RetCode.success, false);
        } 
        
        return res.toJSONString();
    }
    
}
