/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.eclipse.jetty.continuation.Continuation;
import org.json.simple.JSONAware;

/**
 *
 * @author Kiss
 */
public class LongPollingModel {
	public static final LongPollingModel Instance = new LongPollingModel();
	
	private ConcurrentMap<Integer, List<Continuation>> reqHolder;
	
	private LongPollingModel() {
		reqHolder = new ConcurrentHashMap<>();
	}
	
	public void addRequest(int ownerId, Continuation req) {
		if (!reqHolder.containsKey(ownerId)) {
			List<Continuation> listReq = new LinkedList<>();
			listReq.add(req);
			reqHolder.put(ownerId, listReq);
		} else {
			List<Continuation> listReq = reqHolder.get(ownerId);
			synchronized (listReq) {
				for (Iterator<Continuation> iter = listReq.iterator(); iter.hasNext();) {
					Continuation existReq = iter.next();
					if (existReq == null || !existReq.isInitial()) {
						iter.remove();
					}
				}
				listReq.add(req);
			}
		}
	}
	
	public void pushResponse(int ownerId, int type, JSONAware respData) {
		if (!reqHolder.containsKey(ownerId)) {
			//do nothing
			return;
		}
		List<Continuation> listReq = reqHolder.get(ownerId);
		synchronized (listReq) {
			for (Iterator<Continuation> iter = listReq.iterator(); iter.hasNext();) {
				Continuation req = iter.next();
				if (req != null && req.isInitial()) {
					req.setAttribute("type", type);
					req.setAttribute("data", respData);
					req.resume();
				}
				iter.remove();
			}
		}
	}
}
