/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.compression.CompressionCodecs;
import java.util.Date;

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
				.claim("id", user.getUserId())
				.claim("role", user.getRole())
				.compressWith(CompressionCodecs.GZIP)
				.signWith(SignatureAlgorithm.HS512, AppConfig.SECRET_TOKEN_KEY)
				.compact();
		return jwt;
	}
	
	public VerifiedToken verifyToken(String token) {
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
			if (username == null || username.equals("")) {
				return null;
			}
			Integer userId = jwtClaims.get("id", Integer.TYPE);
			if (userId == null || userId < 0) {
				return null;
			}
			Integer role = jwtClaims.get("role", Integer.TYPE);
			if (role == null || role < 0) {
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
			return new VerifiedToken(token, new User(username, userId, role), isNewToken);
		} catch (Exception e) {
			return null;
		}
	}
}
