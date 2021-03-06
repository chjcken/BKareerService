/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.compression.CompressionCodecs;
import java.util.Date;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.common.VerifiedToken;

/**
 *
 * @author Kiss
 */
public class JwtHelper {

	public static JwtHelper Instance = new JwtHelper();

	private final String _tokenSubject = "BkareerSession";
	private final String _tokenIssuer = "BKareerService";

	private JwtHelper() {

	}

	public String generateToken(User user) {
		String jwt = Jwts.builder()
				.setSubject(_tokenSubject)
				.setIssuer(_tokenIssuer)
				.setAudience(user.getUserName())
				.setExpiration(new Date(System.currentTimeMillis() + AppConfig.SESSION_EXPIRE * 1000))
				.claim("id", Noise64.noise(user.getUserId()))
				.claim("role", user.getRole().getValue())
				.claim("profile", Noise64.noise(user.getProfileId()))
				.claim("status", user.getStatus())
				.claim("displayname", user.getDisplayName())
				.claim("provider", user.getProvider())
				.compressWith(CompressionCodecs.GZIP)
				.signWith(SignatureAlgorithm.HS512, AppConfig.SECRET_TOKEN_KEY)
				.compact();
		return jwt;
	}
	
	public VerifiedToken verifyToken(String token) {
		VerifiedToken vtoken = _verifyToken(token);
//		if (vtoken == null) {
//			vtoken = VerifiedToken.GUEST_TOKEN;
//		}
		return vtoken;
	}

	public VerifiedToken _verifyToken(String token) {
		try {
			Claims jwtClaims = Jwts.parser()
					.requireSubject(_tokenSubject)
					.requireIssuer(_tokenIssuer)
					.setSigningKey(AppConfig.SECRET_TOKEN_KEY)
					.parseClaimsJws(token).getBody();
			if (jwtClaims.getExpiration().getTime() < System.currentTimeMillis()) {
				return null;
			}
			String username = jwtClaims.getAudience();
			if (username.isEmpty()) {
				return null;
			}
			Integer userId = (int) Noise64.denoise(Long.parseLong(jwtClaims.get("id").toString()));
			if (userId < 0) {
				return null;
			}
			Integer profileId = (int) Noise64.denoise(Long.parseLong(jwtClaims.get("profile").toString()));
//			if (profileId < 0) {
//				return null;
//			}
			Integer role = (Integer) jwtClaims.get("role");
			if (role < 0) {
				return null;
			}
			Integer status = (Integer) jwtClaims.get("status");
			if (status < 0) {
				return null;
			}
			String displayName = (String) jwtClaims.get("displayname");
			if (displayName == null || displayName.isEmpty()) {
				return null;
			}
			Integer provider = (Integer) jwtClaims.get("provider");
			if (provider < 0) {
				return null;
			}
			boolean isNewToken = false;
			if (System.currentTimeMillis() + AppConfig.SESSION_EXPIRE * 1000 - jwtClaims.getExpiration().getTime() > AppConfig.RENEW_TOKEN_INTERVAL * 1000) {
				isNewToken = true;
				jwtClaims.setExpiration(new Date(System.currentTimeMillis() + AppConfig.SESSION_EXPIRE * 1000));
				token = Jwts.builder()
						.setClaims(jwtClaims)
						.compressWith(CompressionCodecs.GZIP)
						.signWith(SignatureAlgorithm.HS512, AppConfig.SECRET_TOKEN_KEY)
						.compact();
			}
			return new VerifiedToken(token, new User(username, displayName, userId, Role.fromInteger(role), profileId, status, provider), isNewToken);
		} catch (Exception e) {
			return null;
		}
	}
}
