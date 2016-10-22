/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.util;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 *
 * @author Kiss
 * @param <E>
 */
public class ObjectPool<E extends Object> {
	
	private final BlockingQueue<E> pool;
	
	public ObjectPool(int size){
		pool = new LinkedBlockingQueue<>(size);		
	}
	
	public E borrow() {
		E obj = pool.poll();
		return obj;
	}
	
	public void returnObject(E obj) {
		pool.offer(obj);
	}
	
	public int getSize() {
		return this.pool.size();
	}	
}
