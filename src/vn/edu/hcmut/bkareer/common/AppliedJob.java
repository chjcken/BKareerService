/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import vn.edu.hcmut.bkareer.model.BaseModel;

/**
 *
 * @author Kiss
 */
public class AppliedJob {
	private final int id;
	private final int jobId;
	private final int fileId;
	private final String note;
	private final int userId;
	private final BaseModel.AppliedJobStatus status;

	public AppliedJob(int id, int jobId, int fileId, String note, int userId, BaseModel.AppliedJobStatus status) {
		this.id = id;
		this.jobId = jobId;
		this.fileId = fileId;
		this.note = note;
		this.userId = userId;
		this.status = status;
	}

	public int getId() {
		return id;
	}

	public int getJobId() {
		return jobId;
	}

	public int getFileId() {
		return fileId;
	}

	public String getNote() {
		return note;
	}

	public int getUserId() {
		return userId;
	}

	public BaseModel.AppliedJobStatus getStatus() {
		return status;
	}
}
