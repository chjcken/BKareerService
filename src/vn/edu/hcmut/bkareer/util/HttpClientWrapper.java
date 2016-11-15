package vn.edu.hcmut.bkareer.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
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
import vn.edu.hcmut.bkareer.model.LoginModel;

/**
 *
 * @author trananhgien
 */
public class HttpClientWrapper {

	private static final String USER_AGENT = "Mozilla/5.0";
	private final Map<String, String> headers;
	
	private final ObjectPool<HttpClient> httpClientPool = new ObjectPool<>(100);

	private HttpClient borrowHttpClient() {
		HttpClient borrow = httpClientPool.borrow();
		if (borrow == null) {
			borrow = HttpClientBuilder.create().build();
		}
		return borrow;
	}

	private void returnHttpClient(HttpClient client) {
		if (client != null) {
			httpClientPool.returnObject(client);
		}
	}

	public HttpClientWrapper(Map<String, String> headers) {
		this.headers = headers;
	}

	public HttpClientWrapper() {
		this.headers = new HashMap<>();
	}

	private HttpRequest addHeader(HttpRequest request) {
		request.addHeader("User-Agent", USER_AGENT);
		Iterator<Map.Entry<String, String>> it = this.headers.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, String> pair = it.next();
			request.addHeader(pair.getKey(), pair.getValue());
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
		HttpClient client = null;
		try {
			client = borrowHttpClient();
			HttpGet request = new HttpGet(url);

			// add request header
			this.addHeader(request);

			HttpResponse response = client.execute(request);

			BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

			StringBuilder result = new StringBuilder();
			String line;
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}

			return toJson ? (JSONObject) LoginModel.Instance.getJson(result.toString()) : result.toString();
		} catch (IOException ex) {
			return null;
		} finally {
			returnHttpClient(client);
		}
	}

	public Object post(String url, HashMap body, boolean toJson) {
		HttpClient client = null;
		try {
			client = borrowHttpClient();
			HttpPost post = new HttpPost(url);

			// add header
			this.addHeader(post);
			List<NameValuePair> urlParameters = new ArrayList<>();
			Iterator it = body.entrySet().iterator();
			while (it.hasNext()) {
				Map.Entry pair = (Map.Entry) it.next();
				System.out.println(pair.getKey() + " = " + pair.getValue());
				urlParameters.add(new BasicNameValuePair((String) pair.getKey(), (String) pair.getValue()));
				it.remove(); // avoids a ConcurrentModificationException
			}

			post.setEntity(new UrlEncodedFormEntity(urlParameters));

			HttpResponse response = client.execute(post);

			BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

			StringBuilder result = new StringBuilder();
			String line;
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}

			return toJson ? (JSONObject) LoginModel.Instance.getJson(result.toString()) : result.toString();
		} catch (IOException | UnsupportedOperationException e) {
			return null;
		} finally {
			returnHttpClient(client);
		}
	}
}
