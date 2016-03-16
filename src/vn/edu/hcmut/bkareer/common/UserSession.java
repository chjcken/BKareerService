/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import org.apache.commons.codec.digest.DigestUtils;

/**
 *
 * @author Kiss
 */
public class UserSession {

    public final String sid;
    public final String userName;
    public final long time;
    

    public UserSession(String userName) {
        this.userName = userName;
        this.time = System.currentTimeMillis();
        this.sid = _generateSession();
    }

    private String _generateSession() {
        try {
            String strBase = String.format("%s%d", userName, time);
            return String.format("%s.%d", DigestUtils.md5Hex(strBase), time);
        } catch (Exception ex) {
            return "";
        }
    }
}
