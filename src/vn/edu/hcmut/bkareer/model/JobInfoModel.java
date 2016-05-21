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
import vn.edu.hcmut.bkareer.common.AppliedJob;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class JobInfoModel extends BaseModel {

	public static final JobInfoModel Instance = new JobInfoModel();

	private JobInfoModel() {

	}

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Object data;
			switch (q) {
				case "getjobdetail":
					data = getJobDetail(req);
					break;
				case "searchjob":
					data = search(req);
					break;
				case "getjobhome":
					data = getJobForHome(req);
					break;
				case "gettags":
					data = getAllTags();
					break;					
				case "getappliedjob":
					data = getAppliedJobOfStudent(token.getUserId());
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

	private JSONObject getJobDetail(HttpServletRequest req) {
		JSONObject ret = new JSONObject();
		int jobId = (int) Noise64.denoise64(getLongParam(req, "id", -1));
		if (jobId > -1) {
			ret = DatabaseModel.Instance.getJobDetail(jobId);
			if (ret != null) {
				try {
					JSONArray tagsArr = (JSONArray) ret.get(RetCode.tags);
					String[] strArr = new String[]{};
					JSONArray job_similar = DatabaseModel.Instance.searchJob("", "", "", (String[]) tagsArr.toArray(strArr), null, -1, 5, Boolean.valueOf(ret.get(RetCode.is_internship).toString()));
					if (job_similar != null) {
						ret.put(RetCode.jobs_similar, job_similar);
					} else {
						ret = null;
					}
				} catch (Exception e) {
					ret = null;
				}
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
			ret = null;
		} else {
			Boolean internFilter = null;
			if (getStringParam(req, "jobtype").equals("1")) {
				internFilter = true;
			} else if (getStringParam(req, "jobtype").equals("2")) {
				internFilter = false;
			}
			ret = DatabaseModel.Instance.searchJob(district, city, text, tags, null, -1, 50, internFilter);
		}
		return ret;
	}

	private JSONArray getJobForHome(HttpServletRequest req) {
		Boolean internFilter = null;
		if (getStringParam(req, "jobtype").equals("1")) {
			internFilter = true;
		} else if (getStringParam(req, "jobtype").equals("2")) {
			internFilter = false;
		}
		JSONArray ret = DatabaseModel.Instance.searchJob(null, null, null, null, null, -1, 20, internFilter);
		return ret;
	}
	
	private JSONArray getAllTags() {
		JSONArray ret = DatabaseModel.Instance.getAllTags();
		return ret;
	}
	
	private JSONArray getAppliedJobOfStudent(int userId) {
		AppliedJob[] appliedJobOfUser = DatabaseModel.Instance.getAppliedJobOfUser(userId);
		JSONArray ret;
		if (appliedJobOfUser == null) {
			ret = null;
		} else if (appliedJobOfUser.length < 1) {
			ret = new JSONArray();
		} else {
			ret = DatabaseModel.Instance.searchJob("", "", "", null, appliedJobOfUser, -1, -1, null);
		}
		return ret;
	}	
}
