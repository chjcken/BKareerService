/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppliedJobStatus;
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
public class ChangeApplyRequestStatus extends BaseModel {

	public static final ChangeApplyRequestStatus Instance = new ChangeApplyRequestStatus();

	private ChangeApplyRequestStatus() {

	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		if (token != null) {
			int success;
			if (token.getRole() != Role.AGENCY) {
				success = ErrorCode.ACCESS_DENIED.getValue();
			} else {
				long noiseJobId = getLongParam(req, "jobid", -1);
				int jobId = (int) Noise64.denoise(noiseJobId);
				int studentId = (int) Noise64.denoise(getLongParam(req, "studentid", -1));
				String q = getStringParam(req, "q");
				if (jobId < 1 || studentId < 1) {
					success = ErrorCode.INVALID_PARAMETER.getValue();
				} else {
					switch (q) {
						case "approvejob":
							success = approveJobApplyRequest(jobId, token.getProfileId(), studentId);
							if (success == ErrorCode.SUCCESS.getValue()) {
								int studentUserId = DatabaseModel.Instance.getStudentUserId(studentId);
								if (studentUserId > 0) {
									JSONObject notiData = new JSONObject();
									notiData.put(RetCode.job_id, noiseJobId);
									NotificationModel.Instance.addNotification(studentUserId, NotificationType.APPROVED_APPLY.getValue(), notiData);
								}
							}
							break;
						case "denyjob":
							success = denyJobApplyRequest(jobId, token.getProfileId(), studentId);
							if (success == ErrorCode.SUCCESS.getValue()) {
								int studentUserId = DatabaseModel.Instance.getStudentUserId(studentId);
								if (studentUserId > 0) {
									JSONObject notiData = new JSONObject();
									notiData.put(RetCode.job_id, noiseJobId);
									NotificationModel.Instance.addNotification(studentUserId, NotificationType.DENIED_APPLY.getValue(), notiData);
								}
							}
							break;
						default:
							success = ErrorCode.INVALID_PARAMETER.getValue();
					}
				}
			}
			ret.put(RetCode.success, success);
			if (token.isNewToken()) {
				setAuthTokenToCookie(resp, token.getToken());
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
		}
		response(req, resp, ret);
	}

	private int approveJobApplyRequest(int jobId, int agencyId, int studentId) {
		ErrorCode errCode = DatabaseModel.Instance.changeApplyJobRequestStatus(jobId, agencyId, studentId, AppliedJobStatus.APPROVED);
		if (errCode == null) {
			return ErrorCode.FAIL.getValue();
		}
		return errCode.getValue();
	}

	private int denyJobApplyRequest(int jobId, int agencyId, int studentId) {
		ErrorCode errCode = DatabaseModel.Instance.changeApplyJobRequestStatus(jobId, agencyId, studentId, AppliedJobStatus.DENIED);
		if (errCode == null) {
			return ErrorCode.FAIL.getValue();
		}
		return errCode.getValue();
	}
}
