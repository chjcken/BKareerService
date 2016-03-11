/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Kiss
 */
public class AjaxModel extends BaseModel{
    public static final AjaxModel Instance = new AjaxModel();
    
    private AjaxModel(){
        
    }

    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
        //return ajax content such as json
        prepareHeaderJs(resp);
        response(req, resp, "some json here");
    }
}
