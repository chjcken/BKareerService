/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.AuthProvider;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.common.UserStatus;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.HttpClientWrapper;

/**
 *
 * @author Kiss
 */
public class LoginModel extends BaseModel {

	public static final LoginModel Instance = new LoginModel();
	
	private final HttpClientWrapper httpClient;

	private LoginModel() {
		httpClient = new HttpClientWrapper();
	}	

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret;
		int provider = getIntParam(req, "provider", 0);
		if (provider == AuthProvider.SELF.getValue()) {
			ret = doLogin(req, resp);
		} else {
			ret = doSocialLogin(req, resp);
		}

		response(req, resp, ret);
	}

	private JSONObject doLogin(HttpServletRequest req, HttpServletResponse resp) {
		String id = getStringParam(req, "username");
		String pass = getStringParam(req, "password");

		JSONObject res = new JSONObject();
		User userLogin = DatabaseModel.Instance.checkPassword(id, pass);
		if (userLogin == null || userLogin.getUserName() == null || !userLogin.getUserName().equals(id)) {			
			res.put(RetCode.unauth, true);
			res.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
		} else {			
			String jwt = JwtHelper.Instance.generateToken(userLogin);
			res.put(RetCode.success, ErrorCode.SUCCESS.getValue());
			res.put(RetCode.role, userLogin.getRole());
			res.put(RetCode.status, userLogin.getStatus());
			setAuthTokenToCookie(resp, jwt);
		}		
		return res;
	}

	private JSONObject doSocialLogin(HttpServletRequest req, HttpServletResponse resp) {
		String token;
		int provider;
		token = getStringParam(req, "token");
		provider = getIntParam(req, "provider", 0);
		
		JSONObject result = new JSONObject();
		String email = "";
		String pictureUrl = "";
		String uid = "";
		String name = "";
		
		JSONObject authResp = null;
		if (provider == AuthProvider.FACEBOOK.getValue()) {
			authResp = facebookAuthen(token);
			if (authResp != null) {
				name = (String) authResp.get("name");
				email = (String) authResp.get("email");
				uid = (String) authResp.get("id");
				pictureUrl = (String) ((JSONObject) ((JSONObject) authResp.get("picture")).get("data")).get("url");
			}
		} else if (provider == AuthProvider.GOOGLE.getValue()) {
			authResp = googleAuthen(token);
			if (authResp != null) {
				name = (String) authResp.get("name");
				email = (String) authResp.get("email");
				uid = (String) authResp.get("sub");
				pictureUrl = (String) authResp.get("picture");
			}
		}
		
		if (authResp == null) {
			result.put(RetCode.success, ErrorCode.FAIL.getValue());
			return result;
		}			

		User user = DatabaseModel.Instance.checkOAuthUser(uid, provider, name, email, pictureUrl);
		if (user == null) {
			result.put(RetCode.success, ErrorCode.DATABASE_ERROR.getValue());
		} else {
			String jwt = JwtHelper.Instance.generateToken(user);
			result.put(RetCode.success, ErrorCode.SUCCESS.getValue());
			result.put(RetCode.role, user.getRole().toString());
			result.put(RetCode.status, user.getStatus());
			setAuthTokenToCookie(resp, jwt);
		}

		return result;
	}

	private JSONObject facebookAuthen(String token) {
		String authenUrl = AppConfig.FACEBOOK_AUTHEN_URL + token;
		try {
			JSONObject resp = (JSONObject) httpClient.get(authenUrl, true);
			return resp;
		} catch (Exception e) {
			return null;
		}
	}
	
	private JSONObject googleAuthen(String token) {
		String authenUrl = AppConfig.GOOGLE_AUTHEN_URL + token;
		try {
			JSONObject resp = (JSONObject) httpClient.get(authenUrl, true);
			return resp;
		} catch (Exception e) {
			return null;
		}
	}
}
