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
public enum NotificationType {
	LIST_CANDIDATE_FOUND(0),
	LIST_JOB_FOUND(1),
	APPROVED_APPLY(2),
	DENIED_APPLY(3),
	JOB_APPLY_REQUEST(4)	
	;
	
	private final int value;
	private NotificationType(int val) {
		this.value = val;
	}
	
	public int getValue() {
		return value;
	}
}
	

