/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.List;
import java.util.ListIterator;
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
import vn.edu.hcmut.bkareer.common.User;
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
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
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
				case "getallagency":
					result = getAllAgency(token);
					break;
				case "getlistcandidate":
					result = getListCandidateById(req, token);
					break;
				case "getcandidateinfo":
					result = getCandidateInfo(req, token);
					break;
				case "searchcandidate":
					result = searchCandidate(req, token);
					break;
				case "searchagency":
					result = searchAgency(req, token);
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
		if (allLocations == null) {
			return new Result(ErrorCode.DATABASE_ERROR);
		}
		return new Result(ErrorCode.SUCCESS, allLocations);
	}

	private Result getFilesOfStudent(VerifiedToken token) {
		if (!Role.STUDENT.equals(token.getRole()) && Role.ADMIN != token.getRole()) {
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
		User user;
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
			return Result.RESULT_NOT_EXIST;
		}
		JSONObject ret = new JSONObject();
		ret.put(RetCode.id, Noise64.noise(agency.getId()));
		ret.put(RetCode.name, agency.getName());
		ret.put(RetCode.location, agency.getLocation());
		ret.put(RetCode.full_desc, agency.getFullDesc());
		ret.put(RetCode.brief_desc, agency.getBriefDesc());
		ret.put(RetCode.tech_stack, agency.getTeckStack());
		ret.put(RetCode.url_logo, agency.getUrLogo());
		ret.put(RetCode.company_size, agency.getCompanySize());
		ret.put(RetCode.company_type, agency.getCompanyType());
		JSONArray urlImgArr, urlThumbsArr;
		try {
			JSONParser parser = new JSONParser();
			urlImgArr = (JSONArray) parser.parse(agency.getUrlImgArr());
			urlThumbsArr = (JSONArray) parser.parse(agency.getUrlThumb());
		} catch (ParseException e) {
			urlImgArr = new JSONArray();
			urlThumbsArr = new JSONArray();
		}
		ret.put(RetCode.url_imgs, urlImgArr);
		ret.put(RetCode.url_thumbs, urlThumbsArr);

		if (agencyId < 0) {
			user = DatabaseModel.Instance.getUser(agency.getUserId());
			JSONObject acc = new JSONObject();
			acc.put(RetCode.id, user.getUserId());
			acc.put(RetCode.user_name, user.getUserName());
			acc.put(RetCode.role, user.getRole().getValue());
			acc.put(RetCode.provider, user.getProvider());
			acc.put(RetCode.status, user.getStatus());
			ret.put(RetCode.account, acc);
		}

		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getAllAgency(VerifiedToken token) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		List<Agency> allAgency = DatabaseModel.Instance.getAllAgency();
		if (allAgency == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		JSONArray ret = new JSONArray();
		for (Agency agency : allAgency) {
			JSONObject a = new JSONObject();
			a.put(RetCode.name, agency.getName());
			a.put(RetCode.id, Noise64.noise(agency.getId()));

			ret.add(a);
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getListCandidateById(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole() != Role.ADMIN && token.getRole() != Role.AGENCY) {
			return Result.RESULT_ACCESS_DENIED;
		}
		try {
			String lsStudentIdRaw = getStringParam(req, "data");
			JSONArray lsStudentId = getJsonArray(lsStudentIdRaw);

			ListIterator lsCandidateIter = lsStudentId.listIterator();
			while (lsCandidateIter.hasNext()) {
				Object o = lsCandidateIter.next();
				lsCandidateIter.set((int) Noise64.denoise((long) o));
			}

			JSONArray listStudentInfoById = DatabaseModel.Instance.getListStudentInfoById(lsStudentId);
			if (listStudentInfoById == null || listStudentInfoById.isEmpty()) {
				return Result.RESULT_DATABASE_ERROR;
			}
			return new Result(ErrorCode.SUCCESS, listStudentInfoById);
		} catch (Exception e) {
			return Result.RESULT_INVALID_PARAM;
		}
	}

	private Result getCandidateInfo(HttpServletRequest req, VerifiedToken token) {
		int candidateId;
		if (token.getRole() == Role.STUDENT) {
			candidateId = token.getProfileId();
		} else {
			candidateId = (int) Noise64.denoise(getLongParam(req, "id", -1));
		}
		if (candidateId < 1) {
			return Result.RESULT_INVALID_PARAM;
		}
		JSONObject candidateInfo = DatabaseModel.Instance.getCandidateInfo(candidateId);
		if (candidateInfo == null) {
			return Result.RESULT_NOT_EXIST;
		}
		if (token.getRole() == Role.STUDENT) {
			candidateInfo.put(RetCode.user_name, token.getUsername());
			candidateInfo.put(RetCode.provider, token.getProvider());
		}
		return new Result(ErrorCode.SUCCESS, candidateInfo);
	}

	private Result searchCandidate(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		String name = getStringParam(req, "name");
		if (name.isEmpty()) {
			return Result.RESULT_INVALID_PARAM;
		}
		int lastId = (int) Noise64.denoise(getLongParam(req, "lastId", -1));
		JSONObject res = DatabaseModel.Instance.getCandidateInfoByName(name, lastId);
		if (res == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		return new Result(ErrorCode.SUCCESS, res);
	}

	private Result searchAgency(HttpServletRequest req, VerifiedToken token) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		String name = getStringParam(req, "name");
		if (name.isEmpty()) {
			return Result.RESULT_INVALID_PARAM;
		}
		int lastId = (int) Noise64.denoise(getLongParam(req, "lastId", -1));
		List<Agency> lsAgency = DatabaseModel.Instance.getAgencyByName(name, lastId);
		if (lsAgency == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		JSONArray listAgency = new JSONArray();
		int currentId = -1;

		JSONParser parser = getJsonParser();
		try {
			for (Agency agency : lsAgency) {
				JSONObject agen = new JSONObject();
				agen.put(RetCode.id, Noise64.noise(agency.getId()));
				agen.put(RetCode.name, agency.getName());
				agen.put(RetCode.location, agency.getLocation());
				agen.put(RetCode.full_desc, agency.getFullDesc());
				agen.put(RetCode.brief_desc, agency.getBriefDesc());
				agen.put(RetCode.tech_stack, agency.getTeckStack());
				agen.put(RetCode.url_logo, agency.getUrLogo());
				agen.put(RetCode.company_size, agency.getCompanySize());
				agen.put(RetCode.company_type, agency.getCompanyType());
				JSONArray urlImgArr, urlThumbsArr;

				try {
					urlImgArr = (JSONArray) parser.parse(agency.getUrlImgArr());
					urlThumbsArr = (JSONArray) parser.parse(agency.getUrlThumb());
				} catch (ParseException e) {
					urlImgArr = new JSONArray();
					urlThumbsArr = new JSONArray();
				}
				agen.put(RetCode.url_imgs, urlImgArr);
				agen.put(RetCode.url_thumbs, urlThumbsArr);
				
				listAgency.add(agen);
				currentId = agency.getId();
			}
			JSONObject ret = new JSONObject();
			ret.put(RetCode.last_id, Noise64.noise(currentId));
			ret.put(RetCode.data, listAgency);
			
			return new Result(ErrorCode.SUCCESS, ret);
		} finally {
			returnJsonParser(parser);
		}
	}
}
