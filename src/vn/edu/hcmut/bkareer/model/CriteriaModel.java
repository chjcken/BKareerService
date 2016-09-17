/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class CriteriaModel extends BaseModel {
	
	public static final CriteriaModel Instance = new CriteriaModel();
	
	private CriteriaModel() {		
	}
	
	private JSONAware criteriaCache = null;

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {				
				case "getallcriteria":
					result = getAllCriteria();
					break;
				case "getstudentcriteria":
					result = getAllCriteriaOfStudent(token);
					break;
				case "addcriteria":
					result = addCriteria(token, req);
					break;
				default:
					result = null;
					break;
			}
			if (result != null) {
				if (result.getErrorCode() == ErrorCode.SUCCESS && result.getData() != null) {
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

	private Result getAllCriteria() {
		if (criteriaCache == null) {
			criteriaCache = DatabaseModel.Instance.getCriteriaValue();
			if (criteriaCache == null) {
				return Result.RESULT_DATABASE_ERROR;
			}
		}
		return new Result(ErrorCode.SUCCESS, criteriaCache);
	}
	
	private Result getAllCriteriaOfStudent(VerifiedToken token) {
		if (!Role.STUDENT.equals(token.getRole())) {
			return Result.RESULT_ACCESS_DENIED;
		}
		JSONArray detail = DatabaseModel.Instance.getCriteriaValueDetailOfStudent(token.getProfileId());
		if (detail == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		return new Result(ErrorCode.SUCCESS, detail);
	}
	
	private Result addCriteria(VerifiedToken token, HttpServletRequest req) {
		if (!Role.ADMIN.equals(token.getRole())) {
			return Result.RESULT_ACCESS_DENIED;
		}
		JSONArray jsonArray = getJsonArray(getStringParam(req, "data"));
		if (jsonArray == null) {
			return Result.RESULT_INVALID_PARAM;
		}
		criteriaCache = null;
		return new Result(DatabaseModel.Instance.addCriteria(jsonArray));
	}
}
