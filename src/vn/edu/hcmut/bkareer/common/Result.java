/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import org.json.simple.JSONAware;

/**
 *
 * @author Kiss
 */
public class Result {
	private final ErrorCode errCode;
	private final JSONAware data;

	public Result(ErrorCode errCode, JSONAware data) {
		this.errCode = errCode;
		this.data = data;
	}

	public Result(ErrorCode errorCode) throws RuntimeException{
		if (errorCode == null) {
			throw new RuntimeException("null");
		}
		this.errCode = errorCode;
		this.data = null;
	}

	public JSONAware getData() {
		return data;
	}

	public ErrorCode getErrorCode() {
		return errCode;
	}
}
