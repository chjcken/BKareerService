/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
/**
 *
 * @author Kiss
 */
public class AjaxModel extends BaseModel {
	
	private static final Logger _Logger = Logger.getLogger(AjaxModel.class);

	public static final AjaxModel Instance = new AjaxModel();

	private AjaxModel() {

	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		//return ajax content as json
		prepareHeaderJson(resp);
		String q = getStringParam(req, "q");
		_Logger.info(String.format("User [%s] requests api [%s]", token.getUserDisplayName(), q));
		switch (q) {
			case "login":
				LoginModel.Instance.process(req, resp, token);
				break;
			case "logout":
				LogoutModel.Instance.process(req, resp, token);
				break;
			case "searchjob":
			case "getjobdetail":
			case "getjobhome":
			case "getappliedjobs":
			case "getapplydetail":
			case "getagencyjob":
			case "getlistjob":
				JobInfoModel.Instance.process(req, resp, token);
				break;
			case "applyjob":
				ApplyJobModel.Instance.process(req, resp, token);
				break;
			case "createjob":
			case "updatejob":
			case "activejob":
				CreateJobModel.Instance.process(req, resp, token);
				break;
			case "getfiles":
			case "gettags":
			case "getlocations":
			case "getagency":
			case "getallagency":
			case "getlistcandidate":
			case "getcandidateinfo":
				GetUtilInfoModel.Instance.process(req, resp, token);
				break;
			case "approvejob":
			case "denyjob":
				ChangeApplyRequestStatus.Instance.process(req, resp, token);
				break;
			case "addcriteria":
			case "getallcriteria":
			case "getstudentcriteria":
			case "getjobcriteria":					
			case "addstudentcriteria":
			case "updatestudentcriteria":
			case "addjobcriteria":
			case "updatejobcriteria":
			case "deletecriteria":
				CriteriaModel.Instance.process(req, resp, token);
				break;				
			case "getsuitablejob":
			case "getsuitablecandidate":
				MappingModel.Instance.process(req, resp, token);
				break;
			case "getallnoti":
			case "getnotibyid":
			case "seennoti":
			case "getnoti":
				NotificationModel.Instance.process(req, resp, token);
				break;
			case "candidatesignup":
				RegisterModel.Instance.process(req, resp, token);
				break;
				
			case "logjobview":
			case "logapplyjob":
			case "lognewjob":
			case "getjobviewstat":
			case "getjobviewstatrt":
			case "getnewjobstat":
			case "getnewjobstatrt":
			case "getapplyjobstat":
			case "getapplyjobstatrt":
			case "getpopulartagstat":
			case "getpopulartagstatrt":
			case "getpopularapplytagstat":
			case "getpopularapplytagstatrt":
				StatModel.Instance.process(req, resp, token);
				break;
				
			// for testing
			case "truncatetable":
				if (AppConfig.DEV_MODE) {
					CriteriaModel.Instance.process(req, resp, token);
					break;
				}
				
			default:
				resp.setStatus(HttpStatus.BAD_REQUEST_400);
				break;
		}
	}
}
