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
import vn.edu.hcmut.bkareer.common.Agency;
import vn.edu.hcmut.bkareer.common.ErrorCode;
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
	
	private CreateJobModel() {
		
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
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
		if (Role.AGENCY != token.getRole()) {
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
		boolean addTagOfJob = DatabaseModel.Instance.addTagOfJob(addTags, jobId);
		
		return addTagOfJob? jobId : ErrorCode.DATABASE_ERROR.getValue();
	}
	
	private ErrorCode updateJob(HttpServletRequest req, VerifiedToken token) {
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
		long jobId = getLongParam(req, "jobId", -1);
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
		boolean addTagOfJob = DatabaseModel.Instance.addTagOfJob(addTags, denoiseJobId);
		
		return addTagOfJob? ErrorCode.SUCCESS : ErrorCode.DATABASE_ERROR;
	}

}
