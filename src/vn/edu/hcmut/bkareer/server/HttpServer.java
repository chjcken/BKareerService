/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.server;

import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.rewrite.handler.RewriteRegexRule;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletHandler;
import org.eclipse.jetty.servlets.gzip.GzipHandler;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;
import org.eclipse.jetty.util.resource.Resource;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.handler.AjaxHandler;
import vn.edu.hcmut.bkareer.handler.DownloadFileHandler;

/**
 *
 * @author Kiss
 */
public class HttpServer {

    private final Server _server;
    private final int _port;

    public HttpServer() {          
        _turnOffJettyLog();            
        _port = AppConfig.SERVER_PORT;
        _server = new Server(_port);

        ServletHandler handler = new ServletHandler();
        handler.addServletWithMapping(AjaxHandler.class, "/api");
		handler.addServletWithMapping(DownloadFileHandler.class, "/dl");

        ContextHandler context = new ContextHandler("/");
        ResourceHandler rh = new ResourceHandler();
        rh.setBaseResource(Resource.newResource(this.getClass().getClassLoader().getResource("template")));
        //rh.setResourceBase("src/template");
		
		GzipHandler gzipResource = new GzipHandler();
		gzipResource.setMimeTypes("text/html,text/plain,text/xml,text/css,application/javascript,text/javascript,application/x-javascript");
        gzipResource.setHandler(rh);
        context.setHandler(gzipResource);
		
		RewriteHandler rewriteFileUrl = new RewriteHandler();
		rewriteFileUrl.setRewriteRequestURI(true);
		rewriteFileUrl.setRewritePathInfo(false);
		rewriteFileUrl.setOriginalPathAttribute("requestedPath");		

		RewriteRegexRule reverse = new RewriteRegexRule();
		reverse.setRegex("/dl/(\\d+)/([^/]+)");
		reverse.setReplacement("/dl?fileid=$1&filename=$2");
		rewriteFileUrl.addRule(reverse);
		rewriteFileUrl.setHandler(handler);

        HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[]{context, rewriteFileUrl});

        _server.setHandler(handlers);        
  
    }

    public boolean startHServer() {
        try {
            _server.start();
            System.out.println("Http server starts listening at port " + _port + "...");
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public Server getServer() {
        return _server;
    }
    
    private void _turnOffJettyLog(){
        Log.setLog(new NoLogging());
    }

    private static class NoLogging implements Logger {

        @Override
        public String getName() {
            return "no";
        }

        @Override
        public void warn(String msg, Object... args) {
        }

        @Override
        public void warn(Throwable thrown) {
        }

        @Override
        public void warn(String msg, Throwable thrown) {
        }

        @Override
        public void info(String msg, Object... args) {
        }

        @Override
        public void info(Throwable thrown) {
        }

        @Override
        public void info(String msg, Throwable thrown) {
        }

        @Override
        public boolean isDebugEnabled() {
            return false;
        }

        @Override
        public void setDebugEnabled(boolean enabled) {
        }

        @Override
        public void debug(String msg, Object... args) {
        }

        @Override
        public void debug(Throwable thrown) {
        }

        @Override
        public void debug(String msg, Throwable thrown) {
        }

        @Override
        public Logger getLogger(String name) {
            return this;
        }

        @Override
        public void ignore(Throwable ignored) {
        }

        @Override
        public void debug(String string, long l) {            
        }
    }

}
