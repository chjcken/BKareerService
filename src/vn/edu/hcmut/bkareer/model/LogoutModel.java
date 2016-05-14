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
		String ret = doLogout(req);
		response(req, resp, ret);
    }
    
    private String doLogout(HttpServletRequest req){
		VerifiedToken verifyUserToken = verifyUserToken(req);
        JSONObject res = new JSONObject();
        if (verifyUserToken != null){
            res.put(RetCode.success.toString(), true);
        } else {
            res.put(RetCode.success, false);
        }
        res.put(RetCode.token, "");            
        return res.toJSONString();
    }    
}
