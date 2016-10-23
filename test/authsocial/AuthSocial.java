
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
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.message.BasicNameValuePair;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.model.BaseModel;
import vn.edu.hcmut.bkareer.common.AppConfig;

/**
 *
 * @author trananhgien
 */
public class AuthSocial extends BaseModel {

	private final String USER_AGENT = "Mozilla/5.0";

	public static void main(String[] args) throws Exception {

		AuthSocial http = new AuthSocial();

		System.out.println("Testing 1 - Send Http GET request");
		ClientRequest req = new ClientRequest();
		JSONObject result = (JSONObject)req.get("https://jsonplaceholder.typicode.com/posts/1", true);
		System.out.println("result --->" + result.toJSONString());

		System.out.println("\nTesting 2 - Send Http POST request");
		HashMap body = new HashMap();
		body.put("title", "Gien test");
		body.put("body", "Lorem asipas sdfl sdg");
		body.put("userId", "1");
		
		result = (JSONObject)req.post("https://jsonplaceholder.typicode.com/posts", body, true);
		System.out.println(result.toJSONString());
	}

	public void process(HttpServletRequest req, HttpServletResponse res) {
		
	}
	
	protected void googleLogin(HttpServletRequest req) {
		try {
			String accessTokenUrl = "https://accounts.google.com/o/oauth2/token";
			String peopleApiUrl = "https://www.googleapis.com/plus/v1/people/me/openIdConnect";
			
			ClientRequest postReq = new ClientRequest();
			HashMap postBody = new HashMap();
			postBody.put("code", getStringParam(req, "code"));
			postBody.put("client_id", getStringParam(req, "clientId"));
//			postBody.put("client_secret", AppConfig.GOOGLE_SECRET);
			postBody.put("redirect_uri", getStringParam(req, "redirectUri"));
			postBody.put("grant_type", "authorization_code");
			
			JSONObject postRes = (JSONObject)postReq.post(accessTokenUrl, postBody, true);
			
//			return postRes;
		} catch (Exception ex) {
			Logger.getLogger(AuthSocial.class.getName()).log(Level.SEVERE, null, ex);
		}
	}

}
