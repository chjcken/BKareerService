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
public class SearchModel extends BaseModel{
	
	public static final SearchModel Instance = new SearchModel();
	
	private SearchModel() {
		
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		String ret = doSearch(req);
		response(req, resp, ret);
	}
	
	private String doSearch(HttpServletRequest req) {		
		JSONObject ret = new JSONObject();
		VerifiedToken verifyUserToken = verifyUserToken(req);
		if (verifyUserToken == null) {
			ret.put(RetCode.success, false);
			ret.put(RetCode.token, "");
		} else {
			ret.put(RetCode.success, true);
			ret.put(RetCode.data, search(req));
			if (verifyUserToken.isNewToken()) {
				ret.put(RetCode.token, verifyUserToken.getToken());
			}
		}
		return ret.toJSONString();
	}
	
	private JSONArray search(HttpServletRequest req) {
		String city = getStringParam(req, "city");
		String district = getStringParam(req, "district");
		String text = getStringParam(req, "text");
		String[] tags = getParamArray(req, "tags");
		JSONArray ret;
		if (city.isEmpty() && district.isEmpty() && text.isEmpty() && tags.length == 0) {
			ret = new JSONArray();
		} else {
			ret = DatabaseModel.Instance.search(district, city, text, tags, 50);
			if (ret == null) {
				ret = new JSONArray();
			}
		}		
		return ret;
	}
}
