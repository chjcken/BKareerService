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
public enum JobStatus {
	CREATED(-1),
	ACTIVE(0),
	CLOSE(1)
	;

	private final int value;

	private JobStatus(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}

	public boolean equals(int val) {
		return this.value == val;
	}
}
