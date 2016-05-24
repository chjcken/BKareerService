/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.RetCode;
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
		JSONObject ret = doLogout(req, resp);
		response(req, resp, ret);
    }
    
    private JSONObject doLogout(HttpServletRequest req, HttpServletResponse resp){
		VerifiedToken verifyUserToken = verifyUserToken(req);
        JSONObject res = new JSONObject();
        if (verifyUserToken != null){
			invalidateCookie(req, resp);
            res.put(RetCode.success.toString(), ErrorCode.SUCCESS.getValue());
        } else {
			res.put(RetCode.unauth, true);
            res.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
        }
        return res;
    }    
}
