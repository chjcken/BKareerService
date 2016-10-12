/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.http.HttpStatus;
import vn.edu.hcmut.bkareer.common.AppConfig;
/**
 *
 * @author Kiss
 */
public class AjaxModel extends BaseModel {

	public static final AjaxModel Instance = new AjaxModel();

	private AjaxModel() {

	}

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		//return ajax content as json
		prepareHeaderJson(resp);
		String q = getStringParam(req, "q");
		switch (q) {
			case "login":
				LoginModel.Instance.process(req, resp);
				break;
			case "logout":
				LogoutModel.Instance.process(req, resp);
				break;
			case "searchjob":
			case "getjobdetail":
			case "getjobhome":
			case "getappliedjobs":
			case "getapplydetail":
			case "getagencyjob":
				JobInfoModel.Instance.process(req, resp);
				break;
			case "applyjob":
				ApplyJobModel.Instance.process(req, resp);
				break;
			case "createjob":
			case "updatejob":
				CreateJobModel.Instance.process(req, resp);
				break;
			case "getfiles":
			case "gettags":
			case "getlocations":
			case "getagency":
				GetUtilInfoModel.Instance.process(req, resp);
				break;
			case "approvejob":
			case "denyjob":
				ChangeApplyRequestStatus.Instance.process(req, resp);
				break;
			case "addcriteria":
			case "getallcriteria":
			case "getstudentcriteria":
			case "getjobcriteria":					
			case "addstudentcriteria":
			case "updatestudentcriteria":
			case "addjobcriteria":
			case "updatejobcriteria":
				CriteriaModel.Instance.process(req, resp);
				break;				
			case "getsuitablejob":
			case "getsuitablecandidate":
				MappingModel.Instance.process(req, resp);
				break;
			case "getallnoti":
			case "seennoti":
				NotificationModel.Instance.process(req, resp);
				break;
				
			// for testing
			case "truncatetable":
				if (AppConfig.DEV_MODE) {
					CriteriaModel.Instance.process(req, resp);
					break;
				}
				
			default:
				resp.setStatus(HttpStatus.BAD_REQUEST_400);
				break;
		}
	}
}
