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
public enum UserStatus {
	CREATED(0),
	ACTIVE(1),
	BANNED(2)
	;

	private final int value;

	private UserStatus(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}

	public boolean equals(int val) {
		return this.value == val;
	}
}
