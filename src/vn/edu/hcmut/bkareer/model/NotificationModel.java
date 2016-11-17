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

	private static final Logger _Logger = Logger.getLogger(NotificationModel.class);
	public static final NotificationModel Instance = new NotificationModel();

	private NotificationModel() {
	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {
				case "getallnoti":
					result = getAllNotification(token);
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
			response(req, resp, ret);

			_Logger.info("long polling resp: " + token.getUserId() + " - " + ret);
			return;
		}

		resp.setStatus(HttpServletResponse.SC_REQUEST_TIMEOUT);
	}
}
