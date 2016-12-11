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
	private final String displayName;
	private final int userId;
	private final Role role;
	private final int profileId;
	private int status;
	private final int provider;
	
	public static final User GUEST = new User("@guest", "Guest", 0, Role.GUEST, 0, UserStatus.ACTIVE.getValue(), AuthProvider.SELF.getValue());

	public User(String userName, String displayName, int userId, Role role, int profileId, int status, int provider) {
		this.userName = userName;
		this.userId = userId;
		this.role = role;
		this.profileId = profileId;
		this.status = status;
		this.displayName = displayName;
		this.provider = provider;
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

	public String getDisplayName() {
		return displayName;
	}
	
	public int getProvider() {
		return provider;
	}

	public void setStatus(UserStatus status) {
		this.status = status.getValue();
	}
}
