/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.Result;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class MappingModel extends BaseModel {

	public static final MappingModel Instance = new MappingModel();

	private final BlockingQueue<Runnable> taskQueue;
	
	private final ExecutorService workerPool;

	private MappingModel() {
		taskQueue = new ArrayBlockingQueue<>(AppConfig.JOB_QUEUE_MAX_SIZE);
		workerPool = Executors.newFixedThreadPool(AppConfig.MAPPING_WORKERS);
		new Thread(new Runnable() {
			@Override
			public void run() {
				grabAndDispatchTask();
			}
		}).start();

	}

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) {
		JSONObject ret = new JSONObject();
		VerifiedToken token = verifyUserToken(req);
		if (token != null) {
			String q = getStringParam(req, "q");
			Result result;
			switch (q) {
				case "getsuitablejob":
					result = getSuitableJob(req, token);
					break;
				case "getsuitablecandidate":
					result = getSuitableStudent(req, token);
					break;
				default:
					result = null;
					break;
			}
			if (result != null) {
				if (result.getErrorCode() == ErrorCode.SUCCESS && result.getData() != null) {
					ret.put(RetCode.data, result.getData());
				}
				ret.put(RetCode.success, result.getErrorCode().getValue());
			} else {
				ret.put(RetCode.success, ErrorCode.FAIL.getValue());
			}
			if (token.isNewToken()) {
				setAuthTokenToCookie(resp, token.getToken());
			}
		} else {
			ret.put(RetCode.unauth, true);
			ret.put(RetCode.success, ErrorCode.ACCESS_DENIED.getValue());
		}
		response(req, resp, ret);
	}

	private void grabAndDispatchTask() {
		while (true) {
			try {
				Runnable task = taskQueue.poll(10000, TimeUnit.MILLISECONDS);
				if (task == null) {
					continue;
				}
				workerPool.execute(task);
			} catch (Exception e) {

			}
		}
	}
	
	private boolean addFindingStudentTask(final int jobId, final int taskOwner) {
		Runnable task = new Runnable() {
			@Override
			public void run() {
				List<Long> listStudent = DatabaseModel.Instance.findStudentForJob(jobId);
				StringBuilder detail = new StringBuilder();
				if (listStudent == null || listStudent.isEmpty()) {
					detail.append("No candidate suits with your job: ").append(Noise64.noise(jobId));
				} else {
					detail.append("List candidates suit with your job: ").append(Noise64.noise(jobId)).append("\n[");
					for (long studentId : listStudent) {
						detail.append(studentId).append(",");
					}
					detail.setCharAt(detail.length()-1, ']');
				}
				NotificationModel.Instance.addNotification(taskOwner, 0, detail.toString());
			}
		};
		boolean success = taskQueue.offer(task);
		return success;
	}
	
	private boolean addFindingJobTask(final int studentId, final int taskOwner) {
		Runnable task;
		task = new Runnable() {
			@Override
			public void run() {
				List<Long> listJob = DatabaseModel.Instance.findJobForStudent(studentId);
				StringBuilder detail = new StringBuilder();
				if (listJob == null || listJob.isEmpty()) {
					detail.append("No job suits with your profile");
				} else {
					detail.append("List jobs suit with your profile\n[");
					for (long jobId : listJob) {
						detail.append(jobId).append(",");
					}
					detail.setCharAt(detail.length()-1, ']');
				}
				NotificationModel.Instance.addNotification(taskOwner, 1, detail.toString());
			}
		};
		boolean success = taskQueue.offer(task);
		return success;
	}

	private Result getSuitableJob(HttpServletRequest req, VerifiedToken token) {
		boolean success = addFindingJobTask(token.getProfileId(), token.getUserId());
		if (success) {
			return new Result(ErrorCode.SUCCESS);
		} else {
			return new Result(ErrorCode.SYSTEM_OVERLOAD);
		}
	}
	
	private Result getSuitableStudent(HttpServletRequest req, VerifiedToken token) {
		long jobId = getLongParam(req, "jobId", -1);
		if (jobId < 0) {
			return new Result(ErrorCode.INVALID_PARAMETER);
		}
		boolean success = addFindingStudentTask((int) Noise64.denoise(jobId), token.getUserId());
		if (success) {
			return new Result(ErrorCode.SUCCESS);
		} else {
			return new Result(ErrorCode.SYSTEM_OVERLOAD);
		}		
	}
	
}
