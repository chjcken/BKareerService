/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.NotificationType;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class CreateJobModel extends BaseModel {
	
	public static final CreateJobModel Instance  = new CreateJobModel();
	
	private final int ADMIN_USERID = 1;
	
	private CreateJobModel() {
		
	}
	
	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		if (token != null) {
			String q = getStringParam(req, "q");
			switch (q) {
				case "createjob":
					int jobId = createJob(req, token);
					if (jobId > 0) {
						ret.put(RetCode.success, ErrorCode.SUCCESS.getValue());
						JSONObject data = new JSONObject();
						data.put(RetCode.id, Noise64.noise(jobId));
						ret.put(RetCode.data, data);
					} else {					
						ret.put(RetCode.success, jobId);
					}
					break;
				case "updatejob":
					ErrorCode updateJob = updateJob(req, token);
					ret.put(RetCode.success, updateJob.getValue());
					break;
				case "activejob":
					ErrorCode active = activeJob(req, token);
					ret.put(RetCode.success, active.getValue());
					break;
				default:
					ret.put(RetCode.success, ErrorCode.INVALID_PARAMETER.getValue());
					break;
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
	
	private int createJob(HttpServletRequest req, VerifiedToken token) {
		if (Role.AGENCY != token.getRole() && Role.ADMIN != token.getRole()) {
			return ErrorCode.ACCESS_DENIED.getValue();
		}
		String title = getStringParam(req, "title");
		String salary = getStringParam(req, "salary");
		String addr = getStringParam(req, "address");
		long cityId = getLongParam(req, "cityid", -1);
		long districtId = getLongParam(req, "districtid", -1);
		long expireDate = getLongParam(req, "expiredate", -1);
		String desc = getStringParam(req, "desc");
		String requirement = getStringParam(req, "requirement");
		String benifits = getStringParam(req, "benifits");
		boolean isIntern = getStringParam(req, "isinternship").equals("true");
		List<String> tags = getParamArray(req, "tags[]");
		if (title.isEmpty() || salary.isEmpty() || addr.isEmpty() || desc.isEmpty() || requirement.isEmpty() || benifits.isEmpty() || cityId < 0 || districtId < 0 || expireDate < System.currentTimeMillis() || tags.isEmpty()) {
			return ErrorCode.INVALID_PARAMETER.getValue();
		}

		List<Integer> addTags = DatabaseModel.Instance.addTags(tags);
		if (addTags == null || addTags.isEmpty()) {
			return ErrorCode.DATABASE_ERROR.getValue();
		}
		int jobId = DatabaseModel.Instance.createNewJob(
				title,
				salary,
				addr,
				(int) Noise64.denoise(cityId),
				(int) Noise64.denoise(districtId),
				expireDate,
				desc,
				requirement,
				benifits,
				token.getProfileId(), 
				isIntern);
		if (jobId < 0) {
			return ErrorCode.DATABASE_ERROR.getValue();
		}
		boolean success = DatabaseModel.Instance.addTagOfJob(addTags, jobId);
		
		if (success) {
			JSONObject noti = new JSONObject();
			noti.put(RetCode.job_id, Noise64.noise(jobId));
			NotificationModel.Instance.addNotification(ADMIN_USERID, NotificationType.NEW_JOB_TO_VERIFY.getValue(), noti);
		}
		
		return success? jobId : ErrorCode.DATABASE_ERROR.getValue();
	}
	
	private ErrorCode updateJob(HttpServletRequest req, VerifiedToken token) {
		if (Role.AGENCY != token.getRole() && Role.ADMIN != token.getRole()) {
			return ErrorCode.ACCESS_DENIED;
		}
		String title = getStringParam(req, "title");
		String salary = getStringParam(req, "salary");
		String addr = getStringParam(req, "address");
		long cityId = getLongParam(req, "cityid", -1);
		long districtId = getLongParam(req, "districtid", -1);
		long expireDate = getLongParam(req, "expiredate", -1);
		String desc = getStringParam(req, "desc");
		String requirement = getStringParam(req, "requirement");
		String benifits = getStringParam(req, "benifits");
		boolean isIntern = getStringParam(req, "isinternship").equals("true");
		boolean isClose = getStringParam(req, "isclose").equals("true");
		long jobId = getLongParam(req, "jobid", -1);
		List<String> tags = getParamArray(req, "tags[]");
		if (title.isEmpty() || salary.isEmpty() || addr.isEmpty() || desc.isEmpty() || requirement.isEmpty() || benifits.isEmpty() || cityId < 0 || districtId < 0 || expireDate < System.currentTimeMillis() || tags.isEmpty() || jobId < 0) {
			return ErrorCode.INVALID_PARAMETER;
		}

		List<Integer> addTags = DatabaseModel.Instance.addTags(tags);
		if (addTags == null || addTags.isEmpty()) {
			return ErrorCode.DATABASE_ERROR;
		}
		int denoiseJobId = (int) Noise64.denoise(jobId);
		ErrorCode updateJobDetail = DatabaseModel.Instance.updateJobDetail(
				denoiseJobId,
				title,
				salary,
				addr, 
				(int) Noise64.denoise(cityId),
				(int) Noise64.denoise(districtId),
				expireDate,
				desc,
				requirement,
				benifits,
				isIntern, 
				isClose);
		if (updateJobDetail != ErrorCode.SUCCESS) {
			return updateJobDetail;
		}
		boolean success = DatabaseModel.Instance.addTagOfJob(addTags, denoiseJobId);
		
		if (success) { 
			JSONObject noti = new JSONObject();
			noti.put(RetCode.job_id, jobId);
			int notiOwner;
			if (token.getRole() == Role.ADMIN) { //admin edit job -- noti to job owner					
				notiOwner = DatabaseModel.Instance.getAgencyUserIdByJobId(denoiseJobId);
				String msgFromAdmin = getStringParam(req, "msg");
				noti.put(RetCode.msg, msgFromAdmin);
			} else { //agency edit job -- noti to admin
				notiOwner = ADMIN_USERID;
			}			
			NotificationModel.Instance.addNotification(notiOwner, NotificationType.JOB_EDITED.getValue(), noti);
		}
		
		return success? ErrorCode.SUCCESS : ErrorCode.DATABASE_ERROR;
	}
	
	private ErrorCode activeJob(HttpServletRequest req, VerifiedToken token) {
		if (Role.AGENCY != token.getRole() && Role.ADMIN != token.getRole()) {
			return ErrorCode.ACCESS_DENIED;
		}
		long jobId = getLongParam(req, "jobid", -1);
		if (jobId < 1) {
			return ErrorCode.INVALID_PARAMETER;
		}
		
		return DatabaseModel.Instance.activeJob((int) Noise64.denoise(jobId));		
	}

}
