/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

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
		String ret = doLogout(req, resp);
		response(req, resp, ret);
    }
    
    private String doLogout(HttpServletRequest req, HttpServletResponse resp){
		VerifiedToken verifyUserToken = verifyUserToken(req);
        JSONObject res = new JSONObject();
        if (verifyUserToken != null){
			invalidateCookie(req, resp);
            res.put(RetCode.success.toString(), true);
        } else {
			res.put(RetCode.unauth, true);
            res.put(RetCode.success, false);
        }
        return res.toJSONString();
    }    
}
