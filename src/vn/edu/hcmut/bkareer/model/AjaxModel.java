/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.http.HttpStatus;

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
			case "search":
			case "jobdetail":
			case "jobhome":
				JobModel.Instance.process(req, resp);
				break;
			case "apply":
				ApplyJobModel.Instance.process(req, resp);
				break;
			case "getfiles":
				GetFileMetaModel.Instance.process(req, resp);
				break;
			default:
				resp.setStatus(HttpStatus.BAD_REQUEST_400);
				break;
		}
	}
}
