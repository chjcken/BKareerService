/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.DBConnector;
import vn.edu.hcmut.bkareer.util.JwtHelper;
import vn.edu.hcmut.bkareer.common.User;

/**
 *
 * @author Kiss
 */
public class LoginModel extends BaseModel{    
    
    public static final LoginModel Instance = new LoginModel();
    
    private LoginModel(){
    } 
    
    private String doLogin(HttpServletRequest req, HttpServletResponse resp){
		JSONObject body = getJsonFromBody(req);
		
        String id = getJsonValue(body, "username");
        String pass = getJsonValue(body, "password");
		
        JSONObject res = new JSONObject();  
		User userLogin = DBConnector.Instance.checkPassword(id, pass);
		int role;
		if (userLogin == null || userLogin.getUserName() == null || !userLogin.getUserName().equals(id)) {
			role = -1;
		} else {
			role = userLogin.getRole();
		}
        if (role >= 0){
			String jwt = JwtHelper.Instance.generateToken(userLogin);
            res.put(RetCode.success.toString(), true);
            res.put(RetCode.token.toString(), jwt);
            res.put(RetCode.role.toString(), Role.fromInteger(role).toString());
			setAuthTokenToCookie(resp, jwt);
        } else {
			res.put(RetCode.unauth, true);
            res.put(RetCode.success.toString(), false);
        }
        return res.toJSONString();
    }
    
    @Override
    public void process(HttpServletRequest req, HttpServletResponse resp) {
		String ret = doLogin(req, resp);
		response(req, resp, ret);
    }
	
	public static void main(String[] args) {
		String jwtString = Jwts.builder()
				.setSubject("Fuck")
				.setExpiration(new Date(System.currentTimeMillis()))
				.claim("user", "abc")
				.signWith(SignatureAlgorithm.HS256, "abc")
				.compact();
		
		System.err.println(jwtString);
	}
    
}
