
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

/**
 *
 * @author trananhgien
 */
public class AuthSocial extends BaseModel {

	private final String USER_AGENT = "Mozilla/5.0";

	public static void main(String[] args) throws Exception {

		AuthSocial auth = new AuthSocial();
		
		System.out.println("" + auth.googleLogin("eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhNmJiMjk2MGQ1ZGE0YTIzY2U3OTMxNjhjNTVlYjk4ZjRhZjNjOGYifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNDc4Mzk4MDk2LCJleHAiOjE0Nzg0MDE2OTYsImF0X2hhc2giOiItOXEwQURZdlVnekU4MWVTRHVKZWF3IiwiYXVkIjoiMTczOTkxMDc3NTU5LTIzaTFyZzJoaWVicHQ1aTlhOW9yNXRqaGJvcmthc20zLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyMTEwNTc5MDcyMDc0NDI3MDY1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjE3Mzk5MTA3NzU1OS0yM2kxcmcyaGllYnB0NWk5YTlvcjV0amhib3JrYXNtMy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoiZ2llbmNudHRAZ21haWwuY29tIiwibmFtZSI6IkdpZW4gVHLhuqduIiwicGljdHVyZSI6Imh0dHBzOi8vbGg2Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tRnkwTEg2VHktVUEvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLLVQxcWRGTnRSc2I0NU5uVDBRQnhiaUhITkt0QS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiR2llbiIsImZhbWlseV9uYW1lIjoiVHLhuqduIiwibG9jYWxlIjoidmkifQ.pCPgNMm64VihebsiII2O-vqG08dA_TU1PFrln55c9K-ZZD3zlLmIT1E83rzD6k66b2QVrq7V8ztvdFXG10NiVDnWj79GiVF_cwCocf9-dTuYwwTSNwocO1O8GDnQLZs_iqD5vPKHv-wBgsMT8zDM6X6pQKZW-k-Ktib3BfR4JwMnIRZymH9x-hi1hDM-sgVVp-uXa319IkLqTMUoiAyvtZxqsx7oowEC7YXWxQjQ1XPfMjLvseXmheftN0ff5xm51-ePaBNKifSqBgKI88fQoC31-vlNgsBaJP-Z8py6v8I0DLcBa9itg8JaOe_shNzknGa7IEq3kHDULUsMzLXVhA").toJSONString());
		
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
