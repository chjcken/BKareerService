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
public enum Role {
	UNKNOWN(-1),
	ADMIN(0),
	AGENCY(1),
	STUDENT(2),
	SYSAD(3);

	private final int value;

	private Role(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}

	public boolean equals(int val) {
		return this.value == val;
	}

	public static Role fromInteger(int value) {
		switch (value) {
			case 0:
				return ADMIN;
			case 1:
				return AGENCY;
			case 2:
				return STUDENT;
			default:
				return UNKNOWN;
		}
	}
}
