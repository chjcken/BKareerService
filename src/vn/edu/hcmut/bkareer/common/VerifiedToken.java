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
public class VerifiedToken {
	private final String _token;
	private final User _user;
	private final boolean _isNewToken;
	
	public static final VerifiedToken GUEST_TOKEN = new VerifiedToken("token@guest", User.GUEST, false);

	public VerifiedToken(String _token, User user, boolean _isNewToken) {
		this._token = _token;
		this._isNewToken = _isNewToken;
		this._user = user;
	}

	public Role getRole() {
		return _user.getRole();
	}

	public String getToken() {
		return _token;
	}

	public boolean isNewToken() {
		return _isNewToken;
	}

	public String getUsername() {
		return _user.getUserName();
	}

	public int getUserId() {
		return _user.getUserId();
	}
	
	public int getProfileId() {
		return _user.getProfileId();
	}
}
