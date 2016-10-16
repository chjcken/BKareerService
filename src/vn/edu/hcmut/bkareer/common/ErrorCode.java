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
public enum ErrorCode {
	SUCCESS(0),
	DATABASE_ERROR(-1),
	INVALID_PARAMETER(-2),
	ACCESS_DENIED(-3),
	EXIST(-4),
	NOT_EXIST(-5),
	FAIL(-6),
	SYSTEM_OVERLOAD(-7)
	;

	private final int value;

	private ErrorCode(int val) {
		this.value = val;
	}

	public int getValue() {
		return this.value;
	}
}
