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
public class MainPageModel extends BaseModel{
    public static final MainPageModel Instance = new MainPageModel();
    
    private MainPageModel(){
        
    }

    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
        //example code
        prepareHeaderHtml(resp);
        response(req, resp, "hello world");
    }
    
}
