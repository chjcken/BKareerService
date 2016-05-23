/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.List;
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
					data = getJobDetail(req, token);
					break;
				case "searchjob":
					data = search(req);
					break;
				case "getjobhome":
					data = getJobForHome(req);
					break;
				case "getappliedjob":
					data = getAppliedJobOfStudent(req, token.getUserId());
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

	private JSONObject getJobDetail(HttpServletRequest req, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		int jobId = (int) Noise64.denoise64(getLongParam(req, "id", -1));
		if (jobId > 0) {
			ret = DatabaseModel.Instance.getJobDetail(jobId);
			if (ret != null) {
				try {
					if (Role.STUDENT.equals(token.getRole())) {
						AppliedJob userApplyJob = DatabaseModel.Instance.getApplyJob(token.getProfileId(), jobId);
						ret.put(RetCode.is_applied, userApplyJob != null);
						if (userApplyJob != null) {
							ret.put(RetCode.status, userApplyJob.getStatus().toString());
						}
					} else if (Role.AGENCY.equals(token.getRole())) {
						List<AppliedJob> allAppliedJob = DatabaseModel.Instance.getAllAppliedJob(jobId, true);
						if (allAppliedJob == null) {
							return null;
						}
						JSONArray listStudent = new JSONArray();
						for (AppliedJob job : allAppliedJob) {
							listStudent.add(job.getStudentName());
						}
						ret.put(RetCode.applied_students, listStudent);
					}
					JSONArray tagsArr = (JSONArray) ret.get(RetCode.tags);
					JSONArray job_similar = DatabaseModel.Instance.searchJob("", "", "", tagsArr, null, -1, 5, Boolean.valueOf(ret.get(RetCode.is_internship).toString()), false);
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
		List<String> tags = getParamArray(req, "tags");
		JSONArray ret;
		if (city.isEmpty() && district.isEmpty() && text.isEmpty() && tags.isEmpty()) {
			ret = null;
		} else {
			Boolean internFilter = null;
			if (getStringParam(req, "jobtype").equals("1")) {
				internFilter = true;
			} else if (getStringParam(req, "jobtype").equals("2")) {
				internFilter = false;
			}
			ret = DatabaseModel.Instance.searchJob(district, city, text, tags, null, -1, 50, internFilter, false);
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
		JSONArray ret = DatabaseModel.Instance.searchJob(null, null, null, null, null, -1, 20, internFilter, false);
		return ret;
	}	
	
	private JSONArray getAppliedJobOfStudent(HttpServletRequest req, int studentId) {
		List<AppliedJob> appliedJobs = DatabaseModel.Instance.getAllAppliedJob(studentId, false);
		JSONArray ret;
		if (appliedJobs == null) {
			ret = null;
		} else if (appliedJobs.isEmpty()) {
			ret = new JSONArray();
		} else {
			Boolean internFilter = null;
			if (getStringParam(req, "jobtype").equals("1")) {
				internFilter = true;
			} else if (getStringParam(req, "jobtype").equals("2")) {
				internFilter = false;
			}
			ret = DatabaseModel.Instance.searchJob("", "", "", null, appliedJobs, -1, -1, internFilter, true);
		}
		return ret;
	}
}
