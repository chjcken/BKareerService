/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.continuation.Continuation;
import org.eclipse.jetty.continuation.ContinuationSupport;
import org.json.simple.JSONArray;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class NotificationModel extends BaseModel {
	
	public static final NotificationModel Instance = new NotificationModel();
	
	
	private NotificationModel() {
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {
				case "getallnoti":
					result = getAllNotification(token);
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
			if (token.isNewToken()) {
				setAuthTokenToCookie(resp, token.getToken());
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
		}
		response(req, resp, ret);
	}
	
	private Result getAllNotification(VerifiedToken token) {
		JSONArray allNotification = DatabaseModel.Instance.getAllNotification(token.getUserId());
		if (allNotification == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		return new Result(ErrorCode.SUCCESS, allNotification);
	}
	
	private Result seenNotification(HttpServletRequest req) {
		long notiId = getLongParam(req, "notiId", -1);
		if (notiId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		ErrorCode err = DatabaseModel.Instance.setNotiSeen((int) Noise64.denoise(notiId));
		return new Result(err);
	}
	
	public int addNotification(int ownerid, int type, JSONAware detail) {
		int addNotification = DatabaseModel.Instance.addNotification(type, ownerid, detail.toJSONString());
		LongPollingModel.Instance.pushResponse(ownerid, type, detail);
		return addNotification;
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
			continuation.setTimeout(300000);
			continuation.suspend();
			LongPollingModel.Instance.addRequest(token.getUserId(), continuation);
			return;
		}
		if (continuation.isResumed()) {
			Object data = continuation.getAttribute("data");
			Object type = continuation.getAttribute("type");
			ret.put(RetCode.success, ErrorCode.SUCCESS.getValue());
			ret.put(RetCode.type, type);
			ret.put(RetCode.data, data);
			response(req, resp, ret);
			return;
		}
		
		resp.setStatus(HttpServletResponse.SC_REQUEST_TIMEOUT);
	}
}
