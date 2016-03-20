/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.common;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.apache.commons.dbcp2.BasicDataSource;

/**
 *
 * @author Kiss
 */
public class DBConnector {
    public static final DBConnector Instance = new DBConnector();
    
	private final BasicDataSource _connectionPool;
    private DBConnector(){
        _connectionPool = new BasicDataSource();
		_connectionPool.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        _connectionPool.setUrl("jdbc:sqlserver://10.0.0.90;DatabaseName=BKareerDB;integratedSecurity=false");
        _connectionPool.setUsername("sa");
        _connectionPool.setPassword("123456");
    }
    
    public int checkPassword(String username, String password){    
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {			
			String sql = "select * from \"user\" where username=? and password=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setString(1, username);
			pstmt.setString(2, password);
			result = pstmt.executeQuery();
			if (result.next()){
				return result.getInt(4);
			} else {
				return -1;
			}
			
		} catch (SQLException ex) {
			ex.printStackTrace();
			return -2;
		} finally {
			if (result != null){
				try {
					result.close();
				} catch (Exception e){}
			}
			if (pstmt != null){
				try {
					pstmt.close();
				} catch (Exception e){}
			}
			if (connection != null){
				try {
					connection.close();
				} catch (Exception e){}
			}
		}
    }
	
	
	
	public static void main(String[] args) throws SQLException, ClassNotFoundException {
		String connectionUrl = "jdbc:sqlserver://127.0.0.1/BKareerDB";
		String username = "root";
		String password = "123456";

		Connection con = null;
		Statement stmt = null;
		ResultSet rs = null;
		PreparedStatement stmt2 = null;
		// Establish the connection.
		Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
		con = DriverManager.getConnection("jdbc:sqlserver://10.0.0.90;DatabaseName=BKareerDB;integratedSecurity=false", "sa", "123456");
		//String sql = "CREATE TABLE \"user\" ( id int IDENTITY(1,1) NOT NULL, username varchar(30) NOT NULL , password varchar(30) NOT NULL , role int NOT NULL , PRIMARY KEY (id));";
		
		String sql = "INSERT INTO \"user\" (username, password, role) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 0)";
		sql = "SELECT * FROM \"user\" where username='admin' and password='qweqwe'";
		//sql = "ALTER TABLE \"user\" ALTER COLUMN password varchar(100);";
		String sql2 = "SELECT * FROM \"user\" where username=? and password=?";
		stmt2 = con.prepareStatement(sql2);
		stmt2.setString(1, "admin");
		stmt2.setString(2, "d033e22ae348aeb5660fc2140aec35850c4da997");


		rs = stmt2.executeQuery();
		//System.err.println(rs.isBeforeFirst());
		if (rs.next()){
			System.out.println(String.format("%d - %s - %s - %d", rs.getInt(1), rs.getString(2), rs.getString(3), rs.getInt(4)));
		}
//		 while (rs.next()) {
//            System.out.println(String.format("%d - %s - %s - %d", rs.getInt(1), rs.getString(2), rs.getString(3), rs.getInt(4)));
//       }
		
		
	}
	
}
