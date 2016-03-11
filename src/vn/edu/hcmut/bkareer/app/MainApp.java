/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.app;

import vn.edu.hcmut.bkareer.server.HttpServer;

/**
 *
 * @author Kiss
 */
public class MainApp {
    public static void main(String[] args) {
        HttpServer hserver = new HttpServer();
        if (!hserver.startHServer()){
            System.err.println("Cannot start http server!");
            System.exit(1);
        }
    }
}
