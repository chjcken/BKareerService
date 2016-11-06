
package vn.edu.hcmut.bkareer.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import vn.edu.hcmut.bkareer.util.ObjectPool;

/**
 *
 * @author trananhgien
 */
public class ClientRequest {
	private final String USER_AGENT = "Mozilla/5.0";
	private final ObjectPool<JSONParser> jsonParserPool = new ObjectPool<>(100);
	private HashMap headers = new HashMap();
	
	public ClientRequest(HashMap headers) {
		this.headers = headers;
	}
	
	public ClientRequest() {
	}
	
	protected final JSONParser getJsonParser() {
		JSONParser parser = jsonParserPool.borrow();
		if (parser == null) {
			parser = new JSONParser();
		}
		return parser;
	}
	
	protected final void returnJsonParser(JSONParser parser) {
		if (parser != null) {
			jsonParserPool.returnObject(parser);
		}
	}
	
	protected Object getJson(String json) {
		JSONParser parser = getJsonParser();
		Object ret;
		try {
			ret = parser.parse(json);
		} catch (ParseException e) {
			ret = null;
		} finally {
			returnJsonParser(parser);
		}
		return ret;
	}
	
	private HttpRequest addHeader(HttpRequest request) {
		request.addHeader("User-Agent", USER_AGENT);
		Iterator it = this.headers.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			request.addHeader((String)pair.getKey(), (String)pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}
		
		return request;
	}
	
	/**
	 *
	 * @param url
	 * @param toJson
	 * @return
	 */
	public Object get(String url, boolean toJson) {
		try {
			HttpClient client = HttpClientBuilder.create().build();
			HttpGet request = new HttpGet(url);
			
			// add request header
			this.addHeader(request);
			
			HttpResponse response = client.execute(request);
			
			System.out.println("\nSending 'GET' request to URL : " + url);
			System.out.println("Response Code : " +
					response.getStatusLine().getStatusCode());
			
			BufferedReader rd = new BufferedReader(
					new InputStreamReader(response.getEntity().getContent()));
			
			StringBuilder result = new StringBuilder();
			String line = "";
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}
						
			return toJson ? (JSONObject)getJson(result.toString()) : result.toString();
		} catch (IOException ex) {
			
		}
		
		return null;
	}
	
	public Object post(String url,HashMap body, boolean toJson) throws Exception {

		HttpClient client = HttpClientBuilder.create().build();
		HttpPost post = new HttpPost(url);

		// add header
		this.addHeader(post);
		List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
		Iterator it = body.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			System.out.println(pair.getKey() + " = " + pair.getValue());
			urlParameters.add(new BasicNameValuePair((String)pair.getKey(), (String)pair.getValue()));
			it.remove(); // avoids a ConcurrentModificationException
		}

		post.setEntity(new UrlEncodedFormEntity(urlParameters));

		HttpResponse response = client.execute(post);
		System.out.println("\nSending 'POST' request to URL : " + url);
		System.out.println("Post parameters : " + post.getEntity());
		System.out.println("Response Code : " +
                                    response.getStatusLine().getStatusCode());

		BufferedReader rd = new BufferedReader(
                        new InputStreamReader(response.getEntity().getContent()));

		StringBuilder result = new StringBuilder();
		String line = "";
		while ((line = rd.readLine()) != null) {
			result.append(line);
		}

		System.out.println(result.toString());
		return toJson ? (JSONObject)getJson(result.toString()) : result.toString();
	}
}
