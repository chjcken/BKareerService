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
			Object data;
			switch (q) {
				case "getlocations":
					data = getAllLocations();
					break;
				case "getfiles":
					data = getFilesOfStudent(token);
					break;
				case "gettags":
					data = getAllTags();
					break;
				case "getagency":
					data = getAgencyInfo(req, token);
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
	
	private JSONArray getAllLocations() {
		return DatabaseModel.Instance.getAllLocations();
	}
	
	private JSONArray getFilesOfStudent(VerifiedToken token) {
		if (!Role.STUDENT.equals(token.getRole())) {
			return null;
		} else {
			JSONArray ret = DatabaseModel.Instance.getFilesOfStudent(token.getProfileId());
			return ret;
		}
	}
	
	private JSONArray getAllTags() {
		JSONArray ret = DatabaseModel.Instance.getAllTags();
		return ret;
	}
	
	private JSONObject getAgencyInfo(HttpServletRequest req, VerifiedToken token) {
		int agencyId = (int) Noise64.denoise(getLongParam(req, "agencyid", -1));
		Agency agency;
		if (agencyId < 0) {
			if (!Role.AGENCY.equals(token.getRole())) {
				return null;
			} else {
				agency = DatabaseModel.Instance.getAgency(token.getProfileId());
			}
		} else {
			agency = DatabaseModel.Instance.getAgency(agencyId);
		}
		if (agency == null) {
			return null;
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
		return ret;
	}
}
