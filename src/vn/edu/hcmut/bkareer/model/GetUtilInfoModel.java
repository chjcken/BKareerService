/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class GetUtilInfoModel extends BaseModel {

	public static final GetUtilInfoModel Instance = new GetUtilInfoModel();
	
	private GetUtilInfoModel() {
		
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Object data;
			switch (q) {
				case "getlocations":
					data = getAllLocations();
					break;
				case "getfiles":
					data = getFilesOfUser(token);
					break;
				case "gettags":
					data = getAllTags();
					break;
				default:
					data = null;
					break;
			}
			if (data != null) {
				ret.put(RetCode.success, true);
				ret.put(RetCode.data, data);
			} else {
				ret.put(RetCode.success, false);
			}
			if (token.isNewToken()) {
				setAuthTokenToCookie(resp, token.getToken());
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, false);
		}
		response(req, resp, ret);
	}
	
	private JSONArray getAllLocations() {
		return DatabaseModel.Instance.getAllLocations();
	}
	
	private JSONArray getFilesOfUser(VerifiedToken token) {
		if (Role.STUDENT.equals(token.getRole()) || token.getUserId() < 0) {
			return null;
		} else {
			JSONArray ret = DatabaseModel.Instance.getFilesOfUser(token.getUserId());
			return ret;
		}
	}
	
	private JSONArray getAllTags() {
		JSONArray ret = DatabaseModel.Instance.getAllTags();
		return ret;
	}
}
