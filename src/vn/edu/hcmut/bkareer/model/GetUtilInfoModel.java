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
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import vn.edu.hcmut.bkareer.common.Agency;
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
public class GetUtilInfoModel extends BaseModel {

	public static final GetUtilInfoModel Instance = new GetUtilInfoModel();
	
	private GetUtilInfoModel() {
		
	}
	
	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {
				case "getlocations":
					result = getAllLocations();
					break;
				case "getfiles":
					result = getFilesOfStudent(token);
					break;
				case "gettags":
					result = getAllTags();
					break;
				case "getagency":
					result = getAgencyInfo(req, token);
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
	
	private Result getAllLocations() {
		JSONArray allLocations = DatabaseModel.Instance.getAllLocations();
		if (allLocations == null){
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, allLocations);
	}
	
	private Result getFilesOfStudent(VerifiedToken token) {
		if (!Role.STUDENT.equals(token.getRole())) {
			return new Result(ErrorCode.ACCESS_DENIED);
		} else {
			JSONArray ret = DatabaseModel.Instance.getFilesOfStudent(token.getProfileId());
			if (ret == null) {
				return new Result(ErrorCode.DATABASE_ERROR);
			}
			return new Result(ErrorCode.SUCCESS, ret);
		}
	}
	
	private Result getAllTags() {
		JSONArray ret = DatabaseModel.Instance.getAllTags();
		if (ret == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}
	
	private Result getAgencyInfo(HttpServletRequest req, VerifiedToken token) {
		int agencyId = (int) Noise64.denoise(getLongParam(req, "agencyid", -1));
		Agency agency;
		if (agencyId < 0) {
			if (!Role.AGENCY.equals(token.getRole())) {
				return new Result(ErrorCode.INVALID_PARAMETER);
			} else {
				agency = DatabaseModel.Instance.getAgency(token.getProfileId());
			}
		} else {
			agency = DatabaseModel.Instance.getAgency(agencyId);
		}
		if (agency == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		JSONObject ret = new JSONObject();
		ret.put(RetCode.id, Noise64.noise(agency.getId()));
		ret.put(RetCode.name, agency.getName());
		ret.put(RetCode.location, agency.getLocation());
		ret.put(RetCode.full_desc, agency.getFullDesc());
		ret.put(RetCode.brief_desc, agency.getBriefDesc());
		ret.put(RetCode.tech_stack, agency.getTeckStack());
		ret.put(RetCode.url_logo, agency.getUrLogo());
		JSONArray urlImgArr;
		try {
			urlImgArr = (JSONArray) new JSONParser().parse(agency.getUrlImgArr());
		} catch (ParseException e) {
			urlImgArr = new JSONArray();
		}
		ret.put(RetCode.url_imgs, urlImgArr);
		return new Result(ErrorCode.SUCCESS, ret);
	}
}
