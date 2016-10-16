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
public class CriteriaDetail {
	public final int id;
	public final int criteriaValueId;
	public final String value;

	public CriteriaDetail(int id, int criteriaValueId, String value) {
		this.id = id;
		this.criteriaValueId = criteriaValueId;
		this.value = value;
	}	
}
