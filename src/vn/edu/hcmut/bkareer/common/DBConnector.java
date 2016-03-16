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
public class DBConnector {
    public static final DBConnector Instance = new DBConnector();
    
    private DBConnector(){
        
    }
    
    public boolean checkPassword(String id, String password){        
        String _id = "admin";
        String _pass = "d033e22ae348aeb5660fc2140aec35850c4da997";
        return id.equals(_id) && _pass.equals(password);
    }
}
