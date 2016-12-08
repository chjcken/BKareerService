/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.sql.Date;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class StatModel extends BaseModel {

	private static final Logger _Logger = Logger.getLogger(StatModel.class);

	public static final StatModel Instance = new StatModel();

	private final ConcurrentMap<String, AtomicInteger> mapTagStat = new ConcurrentHashMap<>();
	private final ConcurrentMap<String, AtomicInteger> mapApplyTagStat = new ConcurrentHashMap<>();
	private final AtomicInteger jobViewLoggedInStat = new AtomicInteger();
	private final AtomicInteger jobViewGuestStat = new AtomicInteger();
	private final AtomicInteger newJobStat = new AtomicInteger();
	private final AtomicInteger applyJobStat = new AtomicInteger();

	private final int MAX_TAG_NUM = 10;

	private StatModel() {
		Calendar midNight = Calendar.getInstance();
		midNight.set(Calendar.HOUR_OF_DAY, 0);
		midNight.set(Calendar.MINUTE, 5);
		midNight.set(Calendar.SECOND, 0);
		Timer statCollectTask = new Timer();
		statCollectTask.schedule(new TimerTask() {
			@Override
			public void run() {
				collectStatAndWriteDB();
			}
		}, midNight.getTime(), TimeUnit.MILLISECONDS.convert(1, TimeUnit.DAYS));
	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {
		JSONObject ret = new JSONObject();
		String q = getStringParam(req, "q");
		Result result;
		switch (q) {
			case "logjobview":
				result = new Result(logJobView(req, token));
				break;
			case "logapplyjob":
				result = new Result(logApplyJob(req));
				break;
			case "lognewjob":
				result = new Result(logNewJob());
				break;
			case "getjobviewstat":
				result = getJobView(req, token, false);
				break;
			case "getjobviewstatrt":
				result = getJobView(req, token, true);
				break;
			case "getnewjobstat":
				result = getNewJobStat(req, token, false);
				break;
			case "getnewjobstatrt":
				result = getNewJobStat(req, token, true);
				break;
			case "getapplyjobstat":
				result = getApplyJobStat(req, token, false);
				break;
			case "getapplyjobstatrt":
				result = getApplyJobStat(req, token, true);
				break;
			case "getpopulartagstat":
				result = getPopularTagStat(req, token, false);
				break;
			case "getpopulartagstatrt":
				result = getPopularTagStat(req, token, true);
				break;
			case "getpopularapplytagstat":
				result = getPopularApplyTagStat(req, token, false);
				break;
			case "getpopularapplytagstatrt":
				result = getPopularApplyTagStat(req, token, true);
				break;
			case "getpopulartag":
				result = getPopularTag();
				break;
			default:
				result = null;
				break;
		}
		if (result != null) {
			if (result.getErrorCode() == ErrorCode.SUCCESS) {
				ret.put(RetCode.data, result.getData());
			}
			ret.put(RetCode.success, result.getErrorCode().getValue());
		} else {
			ret.put(RetCode.success, ErrorCode.FAIL.getValue());
		}
		response(req, resp, ret);
	}

	private ErrorCode logJobView(HttpServletRequest req, VerifiedToken token) {
		String lsTagRaw = getStringParam(req, "listtag");
		JSONArray lsTag = getJsonArray(lsTagRaw);
		if (lsTag == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		if (token.getRole() == Role.GUEST) {
			jobViewGuestStat.incrementAndGet();
		} else {
			jobViewLoggedInStat.incrementAndGet();
		}
		for (Object o : lsTag) {
			if (o instanceof String) {
				AtomicInteger stat = mapTagStat.get(o);
				if (stat == null) {
					stat = new AtomicInteger(1);
					mapTagStat.put((String) o, stat);
				} else {
					stat.incrementAndGet();
				}
			}
		}
		return ErrorCode.SUCCESS;
	}

	private ErrorCode logApplyJob(HttpServletRequest req) {
		String lsTagRaw = getStringParam(req, "listtag");
		JSONArray lsTag = getJsonArray(lsTagRaw);
		if (lsTag == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		applyJobStat.incrementAndGet();
		for (Object o : lsTag) {
			if (o instanceof String) {
				AtomicInteger stat = mapApplyTagStat.get(o);
				if (stat == null) {
					stat = new AtomicInteger(1);
					mapApplyTagStat.put((String) o, stat);
				} else {
					stat.incrementAndGet();
				}
			}
		}
		return ErrorCode.SUCCESS;
	}

	private ErrorCode logNewJob() {
		newJobStat.incrementAndGet();
		return ErrorCode.SUCCESS;
	}

	private void collectStatAndWriteDB() {
		//collect stat
		Object[] tagArr = mapTagStat.entrySet().toArray();
		Arrays.sort(tagArr, new Comparator<Object>() {
			@Override
			public int compare(Object o1, Object o2) {
				int x = ((Map.Entry<String, AtomicInteger>) o1).getValue().get();
				int y = ((Map.Entry<String, AtomicInteger>) o2).getValue().get();
				return (x < y) ? -1 : ((x == y) ? 0 : 1);
			}
		});

		JSONArray tag = new JSONArray();
		int tagNum = tagArr.length > MAX_TAG_NUM ? MAX_TAG_NUM : tagArr.length;
		for (int i = 0; i < tagNum; i++) {
			JSONObject t = new JSONObject();
			Map.Entry<Integer, Integer> o = ((Map.Entry<Integer, Integer>) tagArr[i]);
			t.put(RetCode.name, o.getKey());
			t.put(RetCode.data, o.getValue());

			tag.add(t);
		}

		Object[] applyTagArr = mapApplyTagStat.entrySet().toArray();
		Arrays.sort(applyTagArr, new Comparator<Object>() {
			@Override
			public int compare(Object o1, Object o2) {
				int x = ((Map.Entry<String, AtomicInteger>) o1).getValue().get();
				int y = ((Map.Entry<String, AtomicInteger>) o2).getValue().get();
				return (x < y) ? -1 : ((x == y) ? 0 : 1);
			}
		});

		JSONArray applyTag = new JSONArray();
		tagNum = applyTagArr.length > MAX_TAG_NUM ? MAX_TAG_NUM : applyTagArr.length;
		for (int i = 0; i < tagNum; i++) {
			JSONObject t = new JSONObject();
			Map.Entry<Integer, Integer> o = ((Map.Entry<Integer, Integer>) applyTagArr[i]);
			t.put(RetCode.name, o.getKey());
			t.put(RetCode.data, o.getValue());

			applyTag.add(t);
		}

		int jobViewLoggedIn = jobViewLoggedInStat.get();
		int jobViewGuest = jobViewGuestStat.get();
		int newJob = newJobStat.get();
		int applyJob = applyJobStat.get();

		//clear for new session-stat
		mapApplyTagStat.clear();
		mapTagStat.clear();
		jobViewGuestStat.set(0);
		jobViewLoggedInStat.set(0);
		newJobStat.set(0);
		applyJobStat.set(0);

		// write stat to db
		Calendar yesterday = Calendar.getInstance();
		yesterday.set(Calendar.DATE, -1);
		DatabaseModel.Instance.writeStat(yesterday.getTime().getTime(), newJob, applyJob, jobViewLoggedIn, jobViewGuest, tag.toJSONString(), applyTag.toJSONString());
	}

	private Result getJobView(HttpServletRequest req, VerifiedToken token, boolean getRealTime) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}
		JSONAware ret;
		if (getRealTime) {
			JSONObject jobView = new JSONObject();
			jobView.put(RetCode.guest, jobViewGuestStat.get());
			jobView.put(RetCode.logged_in, jobViewLoggedInStat.get());
			ret = jobView;
		} else {
			long fromDate = getLongParam(req, "fromDate", -1);
			long toDate = getLongParam(req, "toDate", -1);
			String period = getStringParam(req, "period");
			
			if (fromDate < 1 || toDate < 1 || toDate < fromDate || period.isEmpty()) {
				return Result.RESULT_INVALID_PARAM;
			}
			JSONArray result = DatabaseModel.Instance.getJobViewStat(fromDate, toDate);
			if (result == null) {
				return Result.RESULT_DATABASE_ERROR;
			}
			
			ret = this.groupTagByTime(period, result, "jobview");
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getNewJobStat(HttpServletRequest req, VerifiedToken token, boolean getRealTime) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}

		JSONAware ret;

		if (getRealTime) {
			JSONObject stat = new JSONObject();
			stat.put(RetCode.data, newJobStat.get());
			ret = stat;
		} else {
			long fromDate = getLongParam(req, "fromDate", -1);
			long toDate = getLongParam(req, "toDate", -1);
			String period = getStringParam(req, "period");

			if (fromDate < 1 || toDate < 1 || toDate < fromDate || period.isEmpty()) {
				return Result.RESULT_INVALID_PARAM;
			}
			JSONArray result = DatabaseModel.Instance.getNewJobStat(fromDate, toDate);
			if (result == null) {
				return Result.RESULT_DATABASE_ERROR;
			}
			
			ret = this.groupTagByTime(period, result, "newjob");

		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getApplyJobStat(HttpServletRequest req, VerifiedToken token, boolean getRealTime) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}

		JSONAware ret;

		if (getRealTime) {
			JSONObject stat = new JSONObject();
			stat.put(RetCode.data, newJobStat.get());
			ret = stat;
		} else {
			long fromDate = getLongParam(req, "fromDate", -1);
			long toDate = getLongParam(req, "toDate", -1);
			String period = getStringParam(req, "period");
			
			if (fromDate < 1 || toDate < 1 || toDate < fromDate || period.isEmpty()) {
				return Result.RESULT_INVALID_PARAM;
			}
			JSONArray result = DatabaseModel.Instance.getApplyJobStat(fromDate, toDate);
			if (result == null) {
				return Result.RESULT_DATABASE_ERROR;
			}
			
			ret = this.groupTagByTime(period, result, "applyjob");
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getPopularTagStat(HttpServletRequest req, VerifiedToken token, boolean getRealTime) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}

		JSONArray ret;

		if (getRealTime) {
			Object[] tagArr = mapTagStat.entrySet().toArray();
			Arrays.sort(tagArr, new Comparator<Object>() {
				@Override
				public int compare(Object o1, Object o2) {
					int x = ((Map.Entry<String, AtomicInteger>) o1).getValue().get();
					int y = ((Map.Entry<String, AtomicInteger>) o2).getValue().get();
					return (x < y) ? -1 : ((x == y) ? 0 : 1);
				}
			});

			JSONArray tag = new JSONArray();
			int tagNum = tagArr.length > MAX_TAG_NUM ? MAX_TAG_NUM : tagArr.length;
			for (int i = 0; i < tagNum; i++) {
				JSONObject t = new JSONObject();
				Map.Entry<Integer, Integer> o = ((Map.Entry<Integer, Integer>) tagArr[i]);
				t.put(RetCode.name, o.getKey());
				t.put(RetCode.data, o.getValue());

				tag.add(t);
			}
			ret = tag;
		} else {
			long fromDate = getLongParam(req, "fromDate", -1);
			long toDate = getLongParam(req, "toDate", -1);
			String period = getStringParam(req, "period");
			
			if (fromDate < 1 || toDate < 1 || toDate < fromDate || period.isEmpty()) {
				return Result.RESULT_INVALID_PARAM;
			}
			ret = DatabaseModel.Instance.getPopularTagStat(fromDate, toDate);
			if (ret == null) {
				return Result.RESULT_DATABASE_ERROR;
			}

			ret = this.groupTagByTime(period, ret, "tag");
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getPopularApplyTagStat(HttpServletRequest req, VerifiedToken token, boolean getRealTime) {
		if (token.getRole() != Role.ADMIN) {
			return Result.RESULT_ACCESS_DENIED;
		}

		JSONArray ret;

		if (getRealTime) {
			Object[] applyTagArr = mapApplyTagStat.entrySet().toArray();
			Arrays.sort(applyTagArr, new Comparator<Object>() {
				@Override
				public int compare(Object o1, Object o2) {
					int x = ((Map.Entry<String, AtomicInteger>) o1).getValue().get();
					int y = ((Map.Entry<String, AtomicInteger>) o2).getValue().get();
					return (x < y) ? -1 : ((x == y) ? 0 : 1);
				}
			});

			JSONArray applyTag = new JSONArray();
			int tagNum = applyTagArr.length > MAX_TAG_NUM ? MAX_TAG_NUM : applyTagArr.length;
			for (int i = 0; i < tagNum; i++) {
				JSONObject t = new JSONObject();
				Map.Entry<Integer, Integer> o = ((Map.Entry<Integer, Integer>) applyTagArr[i]);
				t.put(RetCode.name, o.getKey());
				t.put(RetCode.data, o.getValue());

				applyTag.add(t);
			}
			ret = applyTag;
		} else {
			long fromDate = getLongParam(req, "fromDate", -1);
			long toDate = getLongParam(req, "toDate", -1);
			String period = getStringParam(req, "period");
			
			if (fromDate < 1 || toDate < 1 || toDate < fromDate || period.isEmpty()) {
				return Result.RESULT_INVALID_PARAM;
			}
			ret = DatabaseModel.Instance.getPopularApplyTagStat(fromDate, toDate);
			if (ret == null) {
				return Result.RESULT_DATABASE_ERROR;
			}

			ret = this.groupTagByTime(period, ret, "tag");
		}
		return new Result(ErrorCode.SUCCESS, ret);
	}

	private Result getPopularTag() {
		JSONArray popularTag = DatabaseModel.Instance.getPopularTag();
		if (popularTag == null) {
			return Result.RESULT_DATABASE_ERROR;
		}
		return new Result(ErrorCode.SUCCESS, popularTag);
	}

	/*
	* @params time "month" or "year"
	 */
	private JSONArray groupTagByTime(String time, JSONArray data, String stat) {
		if (time.equals("date")) return data;
		
		Long date;
		Calendar cal = Calendar.getInstance();
		JSONObject jObj, res;
		res = new JSONObject();
		int period = 0;
		String pos = "";

		if (time.equals("month")) {
			period = Calendar.MONTH;
		} else if (time.equals("year")) {
			period = Calendar.YEAR;
		}

		for (Object obj : data) {
			jObj = (JSONObject) obj;
			date = (Long) jObj.get(RetCode.date);
			cal.setTimeInMillis(date);
//			int mm = cal.get(period);
//			mm++;
			if (time.equals("year")) {
				cal.set(Calendar.MONTH, Calendar.JANUARY);
			}
			
			cal.set(Calendar.DAY_OF_MONTH, 1);
			Long tt = cal.getTimeInMillis();
			
//			if (period == Calendar.MONTH) {
//				pos = "/" + cal.get(Calendar.YEAR);
//			}

			JSONObject hash = (JSONObject) res.get(tt);

			if (hash == null) {
				hash = new JSONObject();
				res.put(tt, hash);
			}

			if (stat.equals("tag")) {
				JSONArray currArr = (JSONArray) jObj.get(RetCode.data);

				for (Object curr : currArr) {
					JSONObject tag = (JSONObject) curr;
					String name = (String) tag.get("name");
					Long numTag = (Long) tag.get("data");

					if (!hash.containsKey(name)) {
						hash.put(name, numTag);
						continue;
					}

					Long num = (Long) hash.get(name);
					hash.put(name, num + numTag);
				}
			} else if (stat.equals("jobview")) {
				Integer loggedIn = (Integer) jObj.get(RetCode.logged_in);
				Integer guest = (Integer) jObj.get(RetCode.guest);
				
				if (hash.isEmpty()) {
					hash.put(RetCode.logged_in, loggedIn);
					hash.put(RetCode.guest, guest);
					continue;
				}
								
				hash.put(RetCode.logged_in, loggedIn + (Integer)hash.get(RetCode.logged_in));
				hash.put(RetCode.guest, loggedIn + (Integer) hash.get(RetCode.guest));
			} else if (stat.equals("newjob") || stat.equals("applyjob")) {
				Integer count = (Integer) jObj.get(RetCode.data);
				if (hash.isEmpty()) {
					hash.put(RetCode.data, count);
					continue;
				}
				
				hash.put(RetCode.data, count + (Integer)hash.get(RetCode.data));
			}

		}

		return normalize(res, stat, time);
	}

	private JSONArray normalize(JSONObject obj, String stat, String period) {
		JSONArray res = new JSONArray();
		Calendar cal = Calendar.getInstance();
		Iterator iter = obj.keySet().iterator();
		ArrayList<Long> arr = new ArrayList<Long>();
		
		while(iter.hasNext()) {
			arr.add((Long)iter.next());
		}
		
		Collections.sort(arr);
		

		for (Long tt: arr) {
			cal.setTimeInMillis(tt);
			String time = cal.get(Calendar.YEAR) + "";
			if (period.equals("month")) {
				time = (cal.get(Calendar.MONTH) + 1) + "-" + time;
			}
			
			System.out.print(time);
			JSONObject hash = (JSONObject) obj.get(tt);
			Iterator hashIter = hash.keySet().iterator();
			JSONObject item = new JSONObject();
			item.put(RetCode.date, time);
			
			if (stat.equals("tag")){
				JSONArray rowArr = new JSONArray();
			
				while (hashIter.hasNext()) {
					JSONObject jsonObject = new JSONObject();
					Object tagName = hashIter.next();
					jsonObject.put(RetCode.name, tagName);
					jsonObject.put(RetCode.data, hash.get(tagName));
					rowArr.add(jsonObject);
				}

				
				item.put(RetCode.data, rowArr);
			} else if (stat.equals("jobview")) {
				item.put(RetCode.logged_in, hash.get(RetCode.logged_in));
				item.put(RetCode.guest, hash.get(RetCode.guest));
			} else if (stat.equals("newjob") || stat.equals("applyjob")) {
				item.put(RetCode.data, hash.get(RetCode.data));
			}
			
			res.add(item);
			
		}

		return res;
	}
}
