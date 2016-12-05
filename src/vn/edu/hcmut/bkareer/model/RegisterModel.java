/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.common.UserStatus;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.JwtHelper;

/**
 *
 * @author Kiss
 */
public class RegisterModel extends BaseModel {

	private static final Logger _Logger = Logger.getLogger(RegisterModel.class);

	public static final RegisterModel Instance = new RegisterModel();

	private RegisterModel() {

	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		String q = getStringParam(req, "q");
		Result result;
		switch (q) {
			case "candidatesignup":
				result = candidateSignUp(req, resp);
				break;
			case "changepassword":
				result = changePassword(req, token);
				break;
			default:
				result = null;
				break;
		}
		if (result != null) {
			if (result.getErrorCode() == ErrorCode.SUCCESS && result.getData() != null) {
				ret.put(RetCode.data, result.getData());
			}
			ret.put(RetCode.success, result.getErrorCode().getValue());
		} else {
			ret.put(RetCode.success, ErrorCode.FAIL.getValue());
		}
		
		response(req, resp, ret);
	}

	private Result candidateSignUp(HttpServletRequest req, HttpServletResponse resp) {
		String email = getStringParam(req, "email");
		String password = getStringParam(req, "password");
		String name = getStringParam(req, "name");

		JSONObject ret = new JSONObject();

		if (email.isEmpty() || password.isEmpty() || name.isEmpty()) {
			return Result.RESULT_INVALID_PARAM;
		}

		User newUser = DatabaseModel.Instance.candidateSignUp(email, password, name);
		if (newUser == null) {
			return Result.RESULT_DATABASE_ERROR;
		}

		String jwt = JwtHelper.Instance.generateToken(newUser);
		setAuthTokenToCookie(resp, jwt);
		
		SendMailModel.Instance.sendVerifyAccountEmail(email, name, zenActiveAccountUrl(jwt));
		
		ret.put(RetCode.role, Role.STUDENT.toString());

		return new Result(ErrorCode.SUCCESS, ret);
	}
	
	private String zenActiveAccountUrl(String token) {
		return String.format("%s/account-activate?tok=%s", AppConfig.BKAREER_DOMAIN, token);
	}
	
	public void checkActivateAccount(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		VerifiedToken logginToken = verifyUserToken(req);
		if (logginToken == null) {
			resp.sendRedirect("/#/active-error");
			return;
		}
		if (logginToken.getUserStatus() != UserStatus.CREATED.getValue()) {
			resp.sendRedirect("/");
			return;
		}
		String tok = getStringParam(req, "tok");
		VerifiedToken activeToken = JwtHelper.Instance.verifyToken(tok);
		if (activeToken == null) {
			resp.sendRedirect("/#/active-error");
			return;
		}
		if (activeToken.getUserId() != logginToken.getUserId()) {
			resp.sendRedirect("/#/active-error");
			return;
		}
		ErrorCode err = DatabaseModel.Instance.candidateActiveAccount(activeToken.getUserId());
		if (err != ErrorCode.SUCCESS) {
			resp.sendRedirect("/#/active-error");
		} else {
			resp.sendRedirect("/#/active-account");
		}		
	}
	
	private Result changePassword(HttpServletRequest req, VerifiedToken token) {
		String oldPass = getStringParam(req, "old");
		String newPass = getStringParam(req, "new");
		if (oldPass.isEmpty() || newPass.isEmpty()) {
			return Result.RESULT_INVALID_PARAM;
		}
		ErrorCode err = DatabaseModel.Instance.changePassword(token.getUserId(), oldPass, newPass);
		return new Result(err);
	}
}
