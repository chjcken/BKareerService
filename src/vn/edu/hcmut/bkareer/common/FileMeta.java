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
public class FileMeta {
	private final int id;
	private final String name;
	private final String url;
	private final long uploadDate;

	public FileMeta(int id, String name, String url , long uploadDate) {
		this.id = id;
		this.name = name;
		this.url = url;
		this.uploadDate = uploadDate;
	}

	public String getName() {
		return name;
	}

	public String getUrl() {
		return url;
	}	

	public long getUploadDate() {
		return uploadDate;
	}	

	public int getId() {
		return id;
	}	
}
