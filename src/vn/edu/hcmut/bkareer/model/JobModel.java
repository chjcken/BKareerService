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
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class JobModel extends BaseModel {
	public static final JobModel Instance = new JobModel();
	
	private JobModel() {
		
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken verifyUserToken = verifyUserToken(req);
		if (verifyUserToken == null) {
			ret.put(RetCode.success, false);
			ret.put(RetCode.token, "");
		} else {
			ret.put(RetCode.success, true);
			ret.put(RetCode.data, getJobDetail(req));
			if (verifyUserToken.isNewToken()) {
				ret.put(RetCode.token, verifyUserToken.getToken());
			}
			String q = getStringParam(req, "q");
			switch (q) {
				case "search":
					ret.put(RetCode.data, getJobDetail(req));
					break;
				case "jobdetail":
					ret.put(RetCode.data, search(req));
					break;
				case "jobhome":
					ret.put(RetCode.data, getJobForHome(req));
					break;
				default:
					ret.put(RetCode.success, false);
					ret.put(RetCode.token, "");
					break;
			}
			
		}
	}
	
	private JSONObject getJobDetail(HttpServletRequest req){
		JSONObject ret = new JSONObject();
		int jobId = getIntParam(req, "jobid", -1);
		if (jobId > -1) {
			ret = DBConnector.Instance.getJobDetail(jobId);
			if (ret != null) {
				try {
					JSONArray tagsArr = (JSONArray) ret.get("tags");
					JSONArray job_similar = DBConnector.Instance.search("", "", "", (String[]) tagsArr.toArray(), 5, true);
					ret.put("jobs_similar", job_similar);
				} catch (Exception e) {

				}
			} else {
				ret = new JSONObject();
			}
		} 
		return ret;
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
			ret = DBConnector.Instance.search(district, city, text, tags, 50, true);
			if (ret == null) {
				ret = new JSONArray();
			}
		}		
		return ret;
	}
	
	private JSONArray getJobForHome(HttpServletRequest req) {
		JSONArray ret = DBConnector.Instance.search(null, null, null, null, 20, true);
		if (ret == null) {
			ret = new JSONArray();
		}
		return ret;
	}
	
}
