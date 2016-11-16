/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import java.io.Serializable;

/**
 *
 * @author Kiss
 */
public class Agency implements Serializable {
	private final int id;
	private final String urLogo;
	private final String urlImgArr;
	private final String name;
	private final String briefDesc;
	private final String fullDesc;
	private final String location;
	private final String teckStack;
	private final int userId;

	public Agency(int id, String urLogo, String urlImgArr, String name, String briefDesc, String fullDesc, String location, String teckStack, int userId) {
		this.id = id;
		this.urLogo = urLogo;
		this.urlImgArr = urlImgArr;
		this.name = name;
		this.briefDesc = briefDesc;
		this.fullDesc = fullDesc;
		this.location = location;
		this.teckStack = teckStack;
		this.userId = userId;
	}

	public int getId() {
		return id;
	}

	public String getUrLogo() {
		return urLogo;
	}

	public String getUrlImgArr() {
		return urlImgArr;
	}

	public String getName() {
		return name;
	}

	public String getBriefDesc() {
		return briefDesc;
	}

	public String getFullDesc() {
		return fullDesc;
	}

	public String getLocation() {
		return location;
	}

	public String getTeckStack() {
		return teckStack;
	}

	public int getUserId() {
		return userId;
	}
}
