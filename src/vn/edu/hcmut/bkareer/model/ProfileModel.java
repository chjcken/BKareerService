/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.Agency;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.Upload;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author zen
 */
public class ProfileModel extends BaseModel {
	
	public static final ProfileModel Instance  = new ProfileModel();


	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();

		if (token != null) {
			String q = getStringParam(req, "q");
			switch (q) {
				case "updateprofile":
					ret = updateProfile(req, token);
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

	private JSONObject updateProfile(HttpServletRequest req, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		int profileId = -1;

		try {
			
			if (!Upload.isUploadFileRequest(req)) {
				throw new Exception(String.valueOf(ErrorCode.INVALID_PARAMETER.getValue()));
			}
			
			if (token.getRole().equals(Role.AGENCY)) {
				profileId = token.getProfileId();
			}
			
			HashMap<String, Part> mapPart = new HashMap<>();
			Iterator<Part> iterator = req.getParts().iterator();
			while (iterator.hasNext()) {
				Part part = iterator.next();
				if (part.getSize() > AppConfig.MAX_UPLOAD_FILE_SIZE) {
					throw new Exception(String.valueOf(ErrorCode.INVALID_PARAMETER.getValue()));
				}
				
				mapPart.put(part.getName(), part);
			}
			
			if (token.getRole().equals(Role.ADMIN)) {
				// admin update agency profile
				String agencyId = getParamFromBody(mapPart.get("agencyid").getInputStream());
				profileId = (int)Noise64.denoise(Long.parseLong(agencyId));
				
			}
			
			Agency currAgency = DatabaseModel.Instance.getAgency(profileId);

			String[] mainParams = {"name", "location", "company_size", "company_type", "brief_desc"};
			
			for (String param : mainParams) {
				if (!mapPart.containsKey(param)) {
					ret.put(RetCode.success, ErrorCode.INVALID_PARAMETER.getValue());
					return ret;
				}
			}
			
			
			String name = getParamFromBody(mapPart.get("name").getInputStream());
			String briefDesc = getParamFromBody(mapPart.get("brief_desc").getInputStream());
			String location = getParamFromBody(mapPart.get("location").getInputStream());
			String companySize = getParamFromBody(mapPart.get("company_size").getInputStream());
			String companyType = getParamFromBody(mapPart.get("company_type").getInputStream());
			String fullDesc = getParamFromBody(mapPart.get("full_desc").getInputStream());
			String techStack = getParamFromBody(mapPart.get("tech_stack").getInputStream());
			String logoMeta = currAgency.getUrLogo();
			JSONArray imgsMeta = new JSONArray();
			JSONArray thumbsMeta = new JSONArray();
			String identifier = Noise64.noise(profileId) + "";
			
			if (!techStack.isEmpty()) {
				JSONArray techStacks = getJsonArray(techStack);
				if (techStacks != null) {
					List<Integer> addTags = DatabaseModel.Instance.addTags(techStacks);
					if (addTags == null || addTags.isEmpty()) {
						throw new Exception(String.valueOf(ErrorCode.INVALID_PARAMETER.getValue()));
					}
				}
				
			}			
			
			// save upload file
			if (mapPart.containsKey("file_logo") && mapPart.get("file_logo") != null) {
				// delete old file
				logoMeta = Upload.saveUploadFile(mapPart.get("file_logo"), identifier, null);
				Upload.deleteFile(currAgency.getUrLogo());
			}
			
			if (mapPart.containsKey("url_imgs_delete")) {
				
				JSONArray listImgDelete = getJsonArray(getParamFromBody(mapPart.get("url_imgs_delete").getInputStream()));
				if (listImgDelete != null) {
					deleteFiles(listImgDelete);
				}
				
			}
			
			for (int i = 1; i <= 6; i++) {
				String fileParam = "file" + i;
				if (mapPart.containsKey(fileParam)) {
					String fileImg = Upload.saveUploadFile(mapPart.get(fileParam), identifier, AppConfig.IMAGES_DIR + "/" + identifier);
					String fileThumb = Upload.createThumbnail(fileImg, identifier, AppConfig.IMAGES_DIR + "/" + identifier);
					imgsMeta.add(fileImg);
					thumbsMeta.add(fileThumb);
				}
			}
			
			String urlImgs = imgsMeta.isEmpty() ? "" : imgsMeta.toString();
			String urlThumbs = thumbsMeta.isEmpty() ? "" : thumbsMeta.toString();
			
			Agency agency = new Agency(profileId, logoMeta, urlImgs, name, briefDesc, fullDesc, location, techStack, -1);
			agency.setCompanySize(companySize)
					.setCompanyType(companyType)
					.setUrlThumb(urlThumbs);
			
			ErrorCode result = DatabaseModel.Instance.updateAgency(agency);
			
			ret.put(RetCode.success, result.getValue());

		} catch (Exception e) {
			ret.put(RetCode.success, Integer.parseInt(e.getMessage()));

			Logger.getLogger(ProfileModel.class.getName()).log(Level.SEVERE, null, e);
		}
		
		return ret;
	}
	
	
	private void deleteFiles(List list) {
		for (Object fname : list) {
			String fileName = (String)fname;
			Upload.deleteFile(fileName);
		}
	}
		
}
