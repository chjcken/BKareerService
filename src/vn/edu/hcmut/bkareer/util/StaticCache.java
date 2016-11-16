/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 *
 * @author Kiss
 */
public class StaticCache {

	private final ConcurrentMap<String, byte[]> cache;

	public StaticCache() {
		this.cache = new ConcurrentHashMap<>();
	}

	public Object getCache(String key) {
		try {
			byte[] get = cache.get(key);
			if (get == null) {
				return null;
			}

			Object val;
			try (ByteArrayInputStream bais = new ByteArrayInputStream(get)) {
				val = new ObjectInputStream(bais).readObject();
			}
			return val;
		} catch (Exception e) {
			return null;
		}

		//return null;
	}

	public boolean setCache(String key, Object value) {
		try {
			if (key != null && value != null && (value instanceof Serializable)) {
				byte[] byteData;
				try (ByteArrayOutputStream bos = new ByteArrayOutputStream(); ObjectOutputStream oos = new ObjectOutputStream(bos)) {
					oos.writeObject(value);
					oos.flush();
					byteData = bos.toByteArray();
				}

				cache.put(key, byteData);
				return true;
			}
		} catch (Exception e) {
		}

		return false;
	}

	public void clearCache(String key) {
		cache.remove(key);
	}
}
