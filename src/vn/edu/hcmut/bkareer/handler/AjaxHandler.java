/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.handler;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.http.HttpStatus;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.model.AjaxModel;

/**
 *
 * @author Kiss
 */
public class AjaxHandler extends HttpServlet{

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		if (AppConfig.GET_METHOD_ENABLE) {
			doProcess(req, resp);
		} else {
			resp.setStatus(HttpStatus.METHOD_NOT_ALLOWED_405);
		}
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doProcess(req, resp);
    }
    
    private void doProcess(HttpServletRequest req, HttpServletResponse resp){
        AjaxModel.Instance.process(req, resp);
    }
}
