/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.Arrays;
import java.util.List;
import java.util.ListIterator;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppliedJob;
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
public class JobInfoModel extends BaseModel {
	
	private static final Logger _Logger = Logger.getLogger(JobInfoModel.class);

	public static final JobInfoModel Instance = new JobInfoModel();

	private JobInfoModel() {

	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {
				case "getjobdetail":
					result = getJobDetail(req, token);
					break;
				case "searchjob":
					result = search(req, token);
					break;
				case "getjobhome":
					result = getJobForHome(req);
					break;
				case "getappliedjobs":
					result = getAppliedJobOfStudent(req, token.getProfileId());
					break;
				case "getapplydetail":
					result = getApplyInfo(req, token);
					break;
				case "getagencyjob":
					result = getAllJobByAgency(req, token);
					break;
				case "getlistjob":
					result = getListJobById(req);
					break;
				default:
					result = null;
					break;
			}
			if (result != null) {
				if (result.getErrorCode() == ErrorCode.SUCCESS) {
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

	private Result getJobDetail(HttpServletRequest req, VerifiedToken token) {
		JSONObject ret;
		int jobId = (int) Noise64.denoise(getLongParam(req, "jobid", -1));
		if (jobId > 0) {
			ret = DatabaseModel.Instance.getJobDetail(jobId);
			if (ret != null) {
				if (Role.STUDENT.equals(token.getRole())) {
					AppliedJob userApplyJob = DatabaseModel.Instance.getApplyJob(token.getProfileId(), jobId);
					ret.put(RetCode.is_applied, userApplyJob != null);
					if (userApplyJob != null) {
						ret.put(RetCode.status, userApplyJob.getStatus().toString());
					}
				}
				if (Role.GUEST == token.getRole()) {
					//do nothing
				} else { // admin or agency
					List<AppliedJob> allAppliedJob = DatabaseModel.Instance.getAllAppliedJob(jobId, true);
					if (allAppliedJob == null) {
						return new Result(ErrorCode.DATABASE_ERROR);
					}
					JSONArray listStudent = new JSONArray();
					for (AppliedJob job : allAppliedJob) {
						JSONObject student = new JSONObject();
						student.put(RetCode.id, Noise64.noise(job.getStudentId()));
						student.put(RetCode.name, job.getStudentName());
						student.put(RetCode.status, job.getStatus().toString());
						listStudent.add(student);
					}
					ret.put(RetCode.applied_students, listStudent);
				}
				JSONArray tagsArr = (JSONArray) ret.get(RetCode.tags);
				JSONArray job_similar = DatabaseModel.Instance.searchJob("", "", "", tagsArr, null, null, -1, 5, Boolean.valueOf(ret.get(RetCode.is_internship).toString()), false, -1, -1, -1, -1);
				if (job_similar != null) {
					ret.put(RetCode.jobs_similar, job_similar);
				} else {
					ret = null;
				}
			}
		} else {
			return new Result(ErrorCode.INVALID_PARAMETER);
		}
		if (ret == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result search(HttpServletRequest req, VerifiedToken token) {
		String city = getStringParam(req, "city");
		String district = getStringParam(req, "district");
		String text = getStringParam(req, "text");
		List<String> tags = getParamArray(req, "tags[]");
		Long lastJobId = getLongParam(req, "lastJobId", -1);
		int limit = getIntParam(req, "limit", 30);
		if (lastJobId > 0) {
			lastJobId = Noise64.denoise(lastJobId);
		}
		JSONArray ret;
		if (city.isEmpty() && district.isEmpty() && text.isEmpty() && tags.isEmpty() && limit < 1) {
			return new Result(ErrorCode.INVALID_PARAMETER);
		} else {
			Boolean internFilter = null;
			if (getStringParam(req, "jobtype").equals("1")) {
				internFilter = true;
			} else if (getStringParam(req, "jobtype").equals("2")) {
				internFilter = false;
			}
			long fromExpire = -1, toExpire = -1, fromPost = -1, toPost = -1;
			boolean includeInactive = false;
			List<Integer> lsAgency = null;
			if (token.getRole() == Role.ADMIN) {
				fromExpire = getLongParam(req, "fromExpire", -1);
				toExpire = getLongParam(req, "toExpire", -1);
				fromPost = getLongParam(req, "fromPost", -1);
				toPost = getLongParam(req, "toPost", -1);
				includeInactive = "true".equalsIgnoreCase(getStringParam(req, "includeinactive"));
				
				String lsAgencyIdRaw = getStringParam(req, "listagency");
				JSONArray lsAgencyId = getJsonArray(lsAgencyIdRaw);
				if (lsAgencyId != null) {
					ListIterator lsJobIter = lsAgencyId.listIterator();
					while (lsJobIter.hasNext()) {
						Object o = lsJobIter.next();
						lsJobIter.set((int) Noise64.denoise((long) o));
					}
					lsAgency = lsAgencyId;
				}
			}
			ret = DatabaseModel.Instance.searchJob(district, city, text, tags, null, lsAgency, lastJobId.intValue(), limit, internFilter, includeInactive, fromExpire, toExpire, fromPost, toPost);
		}
		if (ret == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getJobForHome(HttpServletRequest req) {
		Boolean internFilter = null;
		if (getStringParam(req, "jobtype").equals("1")) {
			internFilter = true;
		} else if (getStringParam(req, "jobtype").equals("2")) {
			internFilter = false;
		}
		Long lastJobId = getLongParam(req, "lastJobId", -1);
		if (lastJobId > 0) {
			lastJobId = Noise64.denoise(lastJobId);
		}
		JSONArray ret = DatabaseModel.Instance.searchJob(null, null, null, null, null, null, lastJobId.intValue(), 20, internFilter, false, -1, -1, -1, -1);
		if (ret == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getAppliedJobOfStudent(HttpServletRequest req, int studentId) {
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
			Long lastJobId = getLongParam(req, "lastJobId", -1);
			if (lastJobId > 0) {
				lastJobId = Noise64.denoise(lastJobId);
			}
			ret = DatabaseModel.Instance.searchJob("", "", "", null, appliedJobs, null, lastJobId.intValue(), -1, internFilter, true, -1, -1, -1, -1);
		}
		if (ret == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getApplyInfo(HttpServletRequest req, VerifiedToken token) {
		int studentId;
		if (Role.STUDENT.equals(token.getRole())) {
			studentId = token.getProfileId();
		} else {
			studentId = (int) Noise64.denoise(getLongParam(req, "studentid", -1));
		}
		int jobId = (int) Noise64.denoise(getLongParam(req, "jobid", -1));
		if (studentId < 0 || jobId < 0) {
			return new Result(ErrorCode.INVALID_PARAMETER);
		}
		AppliedJob applyJob = DatabaseModel.Instance.getApplyJob(studentId, jobId);
		if (applyJob == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}

		JSONObject file = new JSONObject();
		file.put(RetCode.id, Noise64.noise(applyJob.getFileId()));
		file.put(RetCode.name, applyJob.getFileName());
		JSONObject student = new JSONObject();
		student.put(RetCode.id, Noise64.noise(applyJob.getStudentId()));
		student.put(RetCode.name, applyJob.getStudentName());
		JSONObject ret = new JSONObject();
		ret.put(RetCode.file, file);
		ret.put(RetCode.student, student);
		ret.put(RetCode.status, applyJob.getStatus().toString());
		ret.put(RetCode.note, applyJob.getNote());
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getAllJobByAgency(HttpServletRequest req, VerifiedToken token) {
		if (Role.AGENCY != token.getRole() && Role.ADMIN != token.getRole()) {
			return new Result(ErrorCode.ACCESS_DENIED);
		}
		Long lastJobId = getLongParam(req, "lastJobId", -1);
		if (lastJobId > 0) {
			lastJobId = Noise64.denoise(lastJobId);
		}
		JSONArray searchJob = DatabaseModel.Instance.searchJob("", "", "", null, null, Arrays.asList(token.getProfileId()), lastJobId.intValue(), -1, null, true, -1, -1, -1, -1);
		if (searchJob == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, searchJob);
	}

	private Result getListJobById(HttpServletRequest req) {
		try {
			String lsJobIdRaw = getStringParam(req, "data");
			JSONArray lsJobId = getJsonArray(lsJobIdRaw);
			ListIterator lsJobIter = lsJobId.listIterator();
			while (lsJobIter.hasNext()) {
				Object o = lsJobIter.next();
				lsJobIter.set((int) Noise64.denoise((long) o));
			}
//			List<Integer> lsJob = new ArrayList<>();
//			
//			for (Object o : lsJobId) {			
//				lsJob.add((int) Noise64.denoise((long) o));
//			}
			JSONArray listJobById = DatabaseModel.Instance.getListJobById(lsJobId);
			if (listJobById != null && !listJobById.isEmpty()) {
				return new Result(ErrorCode.SUCCESS, listJobById);
			}
			return Result.RESULT_DATABASE_ERROR;
		} catch (Exception e) {
			return Result.RESULT_INVALID_PARAM;
		}
	}
}
