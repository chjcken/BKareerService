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
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class GetFileMetaModel extends BaseModel {

	public static final GetFileMetaModel Instance = new GetFileMetaModel();

	private GetFileMetaModel() {

	}

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			ret.put(RetCode.success, true);
			ret.put(RetCode.data, getFilesOfUser(token.getUserId()));
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, false);
		}
		response(req, resp, ret);
	}

	private JSONArray getFilesOfUser(int userId) {
		if (userId < 0) {
			return new JSONArray();
		} else {
			JSONArray ret = DatabaseModel.Instance.getFilesOfUser(userId);
			if (ret == null) {
				ret = new JSONArray();
			}
			return ret;
		}
	}

}
