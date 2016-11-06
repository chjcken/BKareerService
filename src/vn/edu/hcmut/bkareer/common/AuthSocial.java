
package vn.edu.hcmut.bkareer.common;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.simple.JSONObject;

/**
 *
 * @author trananhgien
 */
public class AuthSocial {

	public JSONObject fbLogin(String accessToken) {
		try {
			
			String profileUrl = "https://graph.facebook.com/v2.8/me?fields=name,email,picture";
			StringBuilder str = new StringBuilder(profileUrl);
			str.append("&access_token=");
			str.append(accessToken);
			
			ClientRequest getReq = new ClientRequest();
			
			JSONObject getRes = (JSONObject)getReq.get(str.toString(), true);
			
			return getRes;
		} catch (Exception ex) {
			Logger.getLogger(AuthSocial.class.getName()).log(Level.SEVERE, null, ex);
		}
		
		return null;
	}
	
	public JSONObject googleLogin(String clientToken) {
		try {
			String url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + clientToken;
			ClientRequest getReq = new ClientRequest();
			
			JSONObject getRes = (JSONObject)getReq.get(url, true);
			System.out.println("--google login-->" + getRes.toJSONString());
			return getRes;
		} catch (Exception e) {
			Logger.getLogger(AuthSocial.class.getName()).log(Level.SEVERE, null, e);
		}
		
		return null;
	}

}
