/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AuthSocial;
import vn.edu.hcmut.bkareer.common.ErrorCode;
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
		String socialProvider = getStringParam(req, "provider");
		
		if (socialProvider != null) {
			return this.doAuthSocial(req, resp);
		}
		
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
            res.put(RetCode.success.toString(), ErrorCode.SUCCESS.getValue());
            res.put(RetCode.role.toString(), role.toString());
			setAuthTokenToCookie(resp, jwt);
        } else {
			res.put(RetCode.unauth, true);
            res.put(RetCode.success.toString(), ErrorCode.ACCESS_DENIED.getValue());
        }
        return res;
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = doLogin(req, resp);
		response(req, resp, ret);
    }    

	private JSONObject doAuthSocial(HttpServletRequest req, HttpServletResponse resp) {
		AuthSocial authSocial = new AuthSocial();
		String token = getStringParam(req, "token");
		String provider = getStringParam(req, "provier");
		JSONObject result = new JSONObject();
		String email = "";
		String pictureUrl = "";
		String uid = "";
		String name = "";
		
		switch (provider) {
			case "facebook": {
				JSONObject res = authSocial.fbLogin(token);
				if (res == null) {
					result.put(RetCode.success.toString(), ErrorCode.FAIL);
					return result;
				}
				
				// id, email, name
				name = (String) res.get("name");
				email = (String) res.get("email");
				uid = (String) res.get("id");
				pictureUrl = (String) ((JSONObject)res.get("picture")).get("url");
			}
				break;
			
			case "google": {
				JSONObject res = authSocial.googleLogin(token);
				if (res == null) {
					result.put(RetCode.success.toString(), ErrorCode.FAIL);
					return result;
				}
				
				// id, email, name
				name = (String) res.get("name");
				email = (String) res.get("email");
				uid = (String) res.get("sub");
				pictureUrl = (String) res.get("picture");
			}
				break;
				
			default: 
				result.put(RetCode.success.toString(), ErrorCode.INVALID_PARAMETER);
				return result;
		}
		
		/*
		* - get user with uid and provider
		* - if not add this credential to db
		* - else return success
		*/

		JSONObject user = DatabaseModel.Instance.getStudentUser(Long.parseLong(uid), provider);
		if (user == null) {
			//TODO: create user
		} else {
			//TODO: generate token
		}
		
		return result;
	}
}
