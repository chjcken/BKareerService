/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.eclipse.jetty.continuation.Continuation;
import org.eclipse.jetty.continuation.ContinuationSupport;
import org.json.simple.JSONArray;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.NotificationType;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.UserStatus;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class NotificationModel extends BaseModel {

	private static final Logger _Logger = Logger.getLogger(NotificationModel.class);
	public static final NotificationModel Instance = new NotificationModel();

	private NotificationModel() {
	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();

		String q = getStringParam(req, "q");
		Result result;
		switch (q) {
			case "getallnoti":
				result = getAllNotification(resp, token);
				break;
			case "getnotibyid":
				result = getNotiById(req);
				break;
			case "seennoti":
				result = seenNotification(req);
				break;
			case "getnoti":
				pushNotification(req, resp, token);
				return;
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

	private Result getAllNotification(HttpServletResponse resp, VerifiedToken token) {
		JSONArray allNotification = DatabaseModel.Instance.getAllNotification(token.getUserId());
		if (allNotification == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		int userStatus = 0;
		for (Object o : allNotification) {
			JSONObject noti = (JSONObject) o;
			if (noti.get(RetCode.type).equals(UserStatus.ACTIVE.getValue())) {
				userStatus++;
			} else if (noti.get(RetCode.type).equals(UserStatus.BANNED.getValue())) {
				userStatus--;
			}
		}
		if (userStatus > 0) { //account is reactive
			token.setUserStatus(UserStatus.ACTIVE);
			setAuthTokenToCookie(resp, token.getToken());
		} else if (userStatus < 0) { //account is banned
			token.setUserStatus(UserStatus.BANNED);
			setAuthTokenToCookie(resp, token.getToken());
		}
		return new Result(ErrorCode.SUCCESS, allNotification);
	}

	private Result getNotiById(HttpServletRequest req) {
		long notiId = getLongParam(req, "notiId", -1);
		if (notiId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		JSONObject noti = DatabaseModel.Instance.getNotiById((int) Noise64.denoise(notiId));
		if (noti == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		if (!noti.containsKey(RetCode.id)) {
			return Result.RESULT_NOT_EXIST;
		}
		return new Result(ErrorCode.SUCCESS, noti);
	}

	private Result seenNotification(HttpServletRequest req) {
		long notiId = getLongParam(req, "notiId", -1);
		if (notiId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		ErrorCode err = DatabaseModel.Instance.setNotiSeen((int) Noise64.denoise(notiId));
		return new Result(err);
	}

	public int addNotification(int ownerId, int type, JSONAware detail) {
		int notiId = DatabaseModel.Instance.addNotification(type, ownerId, detail.toJSONString());
		if (notiId > 0) {
			LongPollingModel.Instance.pushResponse(ownerId, notiId, type, detail);
		}
		return notiId;
	}

	private void pushNotification(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		if (token.getRole() == Role.GUEST || token.getRole() == Role.UNKNOWN) {
			ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
			response(req, resp, ret);
			return;
		}
		Continuation continuation = ContinuationSupport.getContinuation(req);
		if (continuation.isInitial()) {
			continuation.suspend();
			LongPollingModel.Instance.addRequest(token.getUserId(), continuation);
			return;
		}
		if (continuation.isResumed()) {
			Object data = continuation.getAttribute("data");
			Object type = continuation.getAttribute("type");
			Object id = continuation.getAttribute("id");
			JSONObject _data = new JSONObject();
			_data.put(RetCode.id, id);
			_data.put(RetCode.type, type);
			_data.put(RetCode.data, data);

			ret.put(RetCode.success, ErrorCode.SUCCESS.getValue());
			ret.put(RetCode.data, _data);
			
			if (type.equals(NotificationType.ACCOUNT_BANNED.getValue())) {
				token.setUserStatus(UserStatus.BANNED);
				setAuthTokenToCookie(resp, token.getToken());
			} else if (type.equals(NotificationType.ACCOUNT_REACTIVE.getValue())) {
				token.setUserStatus(UserStatus.ACTIVE);
				setAuthTokenToCookie(resp, token.getToken());
			}
			
			response(req, resp, ret);

			_Logger.info("long polling resp: " + token.getUserId() + " - " + ret);
			return;
		}

		resp.setStatus(HttpServletResponse.SC_REQUEST_TIMEOUT);
	}
}
