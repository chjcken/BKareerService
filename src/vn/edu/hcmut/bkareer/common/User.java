/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import org.apache.commons.codec.digest.DigestUtils;

/**
 *
 * @author Kiss
 */
public class User {

    private final String userName;
	private final int userId;
	private final int role;

	public User(String userName, int userId, int role) {
		this.userName = userName;
		this.userId = userId;
		this.role = role;
	}

	public String getUserName() {
		return userName;
	}

	public int getUserId() {
		return userId;
	}

	public int getRole() {
		return role;
	}    
}
