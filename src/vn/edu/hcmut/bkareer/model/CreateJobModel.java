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
			if (!Role.AGENCY.equals(token.getRole())) {
				ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
			} else {
				int jobId = createJob(req, token);
				if (jobId > 0) {
					ret.put(RetCode.success, ErrorCode.SUCCESS.getValue());
					ret.put(RetCode.id, Noise64.noise(jobId));
				} else {					
					ret.put(RetCode.success, jobId);
				}
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
			return -2;
		}

		List<Integer> addTags = DatabaseModel.Instance.addTags(tags);
		if (addTags == null || addTags.isEmpty()) {
			return -1;
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
			return -1;
		}
		boolean addTagOfJob = DatabaseModel.Instance.addTagOfJob(addTags, jobId);
		
		return addTagOfJob? jobId : -1;
	}

}
