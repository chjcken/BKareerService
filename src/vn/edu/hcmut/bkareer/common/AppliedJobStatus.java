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
public enum AppliedJobStatus {
	UNKNOWN(-1),
	PENDING(0),
	DENIED(1),
	APPROVED(2);

	private final int value;

	private AppliedJobStatus(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}

	public boolean equals(int val) {
		return this.value == val;
	}

	public static AppliedJobStatus fromInteger(int value) {
		switch (value) {
			case 0:
				return PENDING;
			case 1:
				return DENIED;
			case 2:
				return APPROVED;
			default:
				return UNKNOWN;
		}
	}
}
