/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.common.User;

/**
 *
 * @author Kiss
 */
public class LoginModel extends BaseModel{    
    
    public static final LoginModel Instance = new LoginModel();
    
    private LoginModel(){
    } 
    
    private JSONObject doLogin(HttpServletRequest req, HttpServletResponse resp){		
        String id = getStringParam(req, "username");
        String pass = getStringParam(req, "password");
		
        JSONObject res = new JSONObject();  
		User userLogin = DatabaseModel.Instance.checkPassword(id, pass);
		Role role;
		if (userLogin == null || userLogin.getUserName() == null || !userLogin.getUserName().equals(id)) {
			role = Role.UNKNOWN;
		} else {
			role = userLogin.getRole();
		}
        if (role.getValue() >= 0){
			String jwt = JwtHelper.Instance.generateToken(userLogin);
            res.put(RetCode.success.toString(), true);
            res.put(RetCode.role.toString(), role.toString());
			setAuthTokenToCookie(resp, jwt);
        } else {
			res.put(RetCode.unauth, true);
            res.put(RetCode.success.toString(), false);
        }
        return res;
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = doLogin(req, resp);
		response(req, resp, ret);
    }    
}
