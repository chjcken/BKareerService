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
			JSONArray filesOfUser = getFilesOfUser(token.getUserId());
			if (filesOfUser != null) {
				ret.put(RetCode.success, true);
				ret.put(RetCode.data, filesOfUser);
			} else {
				ret.put(RetCode.success, false);
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, false);
		}
		response(req, resp, ret);
	}

	private JSONArray getFilesOfUser(int userId) {
		if (userId < 0) {
			return null;
		} else {
			JSONArray ret = DatabaseModel.Instance.getFilesOfUser(userId);
			return ret;
		}
	}

}
