/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.util;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 *
 * @author Kiss
 */
public class StaticCache {
	private final ConcurrentMap<String, Object> cache;

	public StaticCache() {
		this.cache = new ConcurrentHashMap<>();
	}
	
	public Object getCache(String key) {
		return cache.get(key);
	}
	
	public boolean setCache(String key, Object value) {
		if (value != null) {
			cache.put(key, value);
			return true;
		}
		return false;
	}
	
	public void clearCache(String key) {
		cache.remove(key);
	}
}
