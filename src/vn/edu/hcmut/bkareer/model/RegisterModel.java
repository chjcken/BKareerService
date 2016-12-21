/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.io.IOException;
import java.security.SecureRandom;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.NotificationType;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.common.UserStatus;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class RegisterModel extends BaseModel {

	private static final Logger _Logger = Logger.getLogger(RegisterModel.class);

	public static final RegisterModel Instance = new RegisterModel();
	
	private final String CHAR_STRING = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	
	private final SecureRandom random = new SecureRandom();

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
			case "addagency":
				result = addAgencyAccount(req, token);
				break;
			case "banaccount":
				result = banAccount(req, token);
				break;
			case "reactiveaccount":
				result = reActiveAccount(req, token);
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
			resp.sendRedirect("/#/error/active");
			return;
		}
		if (logginToken.getUserStatus() != UserStatus.CREATED.getValue()) {
			resp.sendRedirect("/");
			return;
		}
		String tok = getStringParam(req, "tok");
		VerifiedToken activeToken = JwtHelper.Instance.verifyToken(tok);
		if (activeToken == null) {
			resp.sendRedirect("/#/error/active");
			return;
		}
		if (activeToken.getUserId() != logginToken.getUserId()) {
			resp.sendRedirect("/#/error/active");
			return;
		}
		ErrorCode err = DatabaseModel.Instance.changeAccountStatus(activeToken.getUserId(), UserStatus.ACTIVE);
		if (err != ErrorCode.SUCCESS) {			
			resp.sendRedirect("/#/error/active");
		} else {
			logginToken.setUserStatus(UserStatus.ACTIVE);
			setAuthTokenToCookie(resp, logginToken.getToken());
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
	
	private Result addAgencyAccount(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole()  != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		String email = getStringParam(req, "email");		
		String companyName = getStringParam(req, "companyName");
		if (email.isEmpty() || companyName.isEmpty()) {
			return Result.RESULT_INVALID_PARAM;
		}
		String pwd = randomString(10);
		String hashPwd = DigestUtils.sha1Hex(pwd);
		User agency = DatabaseModel.Instance.addAgencyAccount(email, hashPwd, companyName);
		if (agency == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		SendMailModel.Instance.sendAgencyAccountInfo(email, companyName, pwd, zenActiveAccountUrl(JwtHelper.Instance.generateToken(agency)));
		JSONObject ret = new JSONObject();
		ret.put(RetCode.id, Noise64.noise(agency.getProfileId()));
		return new Result(ErrorCode.SUCCESS, ret);
	}
	
	private String randomString(int length) {
		if (length < 1) {
			throw new IllegalArgumentException("Length is negative.");
		}
		
		StringBuilder ret = new StringBuilder(length);
		for (int i = 0; i < length; i++) {
			int rand = random.nextInt();
			ret.append(CHAR_STRING.charAt(Math.abs(rand) % CHAR_STRING.length()));
		}
		return ret.toString();
	}
	
	private Result banAccount(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		int profileId = (int) Noise64.denoise(getLongParam(req, "id", -1));
		if (profileId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		int role = getIntParam(req, "role", -1);
		int userId = DatabaseModel.Instance.getUserIdByProfileId(profileId, role);
		if (userId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		ErrorCode err = DatabaseModel.Instance.changeAccountStatus(userId, UserStatus.BANNED);
		if (err == ErrorCode.SUCCESS) {
			JSONObject noti = new JSONObject();
			noti.put(RetCode.date, System.currentTimeMillis());
			NotificationModel.Instance.addNotification(userId, NotificationType.ACCOUNT_BANNED.getValue(), noti);
		}
		return new Result(err);
	}
	
	private Result reActiveAccount(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		int profileId = (int) Noise64.denoise(getLongParam(req, "id", -1));
		if (profileId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		int role = getIntParam(req, "role", -1);
		int userId = DatabaseModel.Instance.getUserIdByProfileId(profileId, role);
		if (userId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		ErrorCode err = DatabaseModel.Instance.changeAccountStatus(userId, UserStatus.ACTIVE);
		if (err == ErrorCode.SUCCESS) {
			JSONObject noti = new JSONObject();
			noti.put(RetCode.date, System.currentTimeMillis());
			NotificationModel.Instance.addNotification(userId, NotificationType.ACCOUNT_REACTIVE.getValue(), noti);
		}
		return new Result(err);
	}
}
