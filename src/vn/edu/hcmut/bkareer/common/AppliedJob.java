/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

/**
 *
 * @author Kiss
 */
public class AppliedJob {
	private final int id;
	private final int jobId;
	private final int fileId;
	private final String fileName;
	private final String note;
	private final int studentId;
	private final String studentName;
	private final AppliedJobStatus status;

	public AppliedJob(int id, int jobId, int fileId, String fileName, String note, int studentId, String studentName, AppliedJobStatus status) {
		this.id = id;
		this.jobId = jobId;
		this.fileId = fileId;
		this.fileName = fileName;
		this.note = note;
		this.studentId = studentId;
		this.studentName = studentName;
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

	public int getStudentId() {
		return studentId;
	}

	public AppliedJobStatus getStatus() {
		return status;
	}

	public String getFileName() {
		return fileName;
	}

	public String getStudentName() {
		return studentName;
	}
}
