
package authsocial;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.CloseableHttpClient; 
import org.apache.http.impl.client.HttpClientBuilder; 
import java.io.IOException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.codec.binary.StringUtils;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.message.BasicNameValuePair;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.model.BaseModel;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.Upload;

/**
 *
 * @author trananhgien
 */
public class AuthSocial {

	private final String USER_AGENT = "Mozilla/5.0";

	public static void main(String[] args) throws Exception {
			
	}

	public void process(HttpServletRequest req, HttpServletResponse res) {
		
	}
	
	// client_id=173991077559-23i1rg2hiebpt5i9a9or5tjhborkasm3.apps.googleusercontent.com
	// app_secret = cc927c95d234bde3921134d5c5df8fec
	public JSONObject fbLogin(String accessToken) {
		try {
			
			String inspectTokenUrl = "https://graph.facebook.com/v2.8/me?fields=name,email,picture";
			StringBuilder str = new StringBuilder(inspectTokenUrl);
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
