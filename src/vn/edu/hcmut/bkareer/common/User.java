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
public class User {

    private final String userName;
	private final int userId;
	private final Role role;
	private final int profileId;
	private final int status;
	
	public static final User GUEST = new User("@guest", 0, Role.GUEST, 0, UserStatus.ACTIVE.getValue());

	public User(String userName, int userId, Role role, int profileId, int status) {
		this.userName = userName;
		this.userId = userId;
		this.role = role;
		this.profileId = profileId;
		this.status = status;
	}

	public String getUserName() {
		return userName;
	}

	public int getUserId() {
		return userId;
	}

	public Role getRole() {
		return role;
	}

	public int getProfileId() {
		return profileId;
	}

	public int getStatus() {
		return status;
	}	
}
