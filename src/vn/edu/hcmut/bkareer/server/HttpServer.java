/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.server;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletHandler;
import org.eclipse.jetty.util.resource.Resource;
import vn.edu.hcmut.bkareer.handler.AjaxHandler;
import vn.edu.hcmut.bkareer.handler.MainPageHandler;

/**
 *
 * @author Kiss
 */
public class HttpServer {
    private final Server _server;
    public HttpServer(){
        _server = new Server(8080);
        
        ServletHandler handler = new ServletHandler();
        handler.addServletWithMapping(MainPageHandler.class, "/");
        handler.addServletWithMapping(AjaxHandler.class, "/ajax");

        ContextHandler context = new ContextHandler("/");
        ResourceHandler rh = new ResourceHandler();
        rh.setBaseResource(Resource.newResource(this.getClass().getClassLoader().getResource("template")));
        context.setHandler(rh);

        HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[] {context, handler, new DefaultHandler()});

        _server.setHandler(handlers);
    }
    
    public boolean startHServer(){
        try {
            _server.start();
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
    
    public Server getServer(){
        return _server;
    }
    
}
