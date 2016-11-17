/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.User;
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
		ret.put(RetCode.role, Role.STUDENT.getValue());

		return new Result(ErrorCode.SUCCESS, ret);
	}
}
