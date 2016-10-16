/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import vn.edu.hcmut.bkareer.util.ConfigHelper;

/**
 *
 * @author Kiss
 */
public class AppConfig {
	public static final int SESSION_EXPIRE;
	public static final String SECRET_TOKEN_KEY;
	public static final int RENEW_TOKEN_INTERVAL;
	public static final boolean GET_METHOD_ENABLE;
	public static final int SERVER_PORT;
	public static final String DB_HOST;
	public static final String DB_NAME;
	public static final String UPLOAD_DIR;
	public static final int MAX_UPLOAD_FILE_SIZE;
	public static final boolean DEV_MODE;
	
	public static final int JOB_QUEUE_MAX_SIZE;
	public static final int MAPPING_WORKERS;
	
	static {
		SESSION_EXPIRE = ConfigHelper.Instance.getInt("session_expire", 604800);// default: 7 days
		RENEW_TOKEN_INTERVAL = ConfigHelper.Instance.getInt("renew_token_interval", 84600);
		SECRET_TOKEN_KEY = ConfigHelper.Instance.getString("token_key", "BK@R33R_token_key");
		GET_METHOD_ENABLE = ConfigHelper.Instance.getBoolean("get_method_enable", false);
		SERVER_PORT = ConfigHelper.Instance.getInt("server_port", 8080);
		DB_HOST = ConfigHelper.Instance.getString("db_host", "localhost");
		UPLOAD_DIR = ConfigHelper.Instance.getString("upload_dir", "upload");
		MAX_UPLOAD_FILE_SIZE = ConfigHelper.Instance.getInt("upload_size", 2097152);
		DB_NAME = ConfigHelper.Instance.getString("db_name", "BKareerDB");
		DEV_MODE = ConfigHelper.Instance.getBoolean("dev_mode", false);
		JOB_QUEUE_MAX_SIZE = ConfigHelper.Instance.getInt("job_queue_size", 1000000);
		MAPPING_WORKERS = ConfigHelper.Instance.getInt("mapping_workers", 4);
	}
}
