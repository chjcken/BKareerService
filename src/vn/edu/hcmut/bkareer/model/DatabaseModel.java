/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import org.apache.commons.dbcp2.BasicDataSource;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import vn.edu.hcmut.bkareer.common.Agency;
import vn.edu.hcmut.bkareer.common.AppConfig;
import vn.edu.hcmut.bkareer.common.AppliedJob;
import vn.edu.hcmut.bkareer.common.AppliedJobStatus;
import vn.edu.hcmut.bkareer.common.ErrorCode;
import vn.edu.hcmut.bkareer.common.FileMeta;
import vn.edu.hcmut.bkareer.common.RetCode;
import vn.edu.hcmut.bkareer.common.Role;
import vn.edu.hcmut.bkareer.common.User;
import vn.edu.hcmut.bkareer.util.Noise64;

/**
 *
 * @author Kiss
 */
public class DatabaseModel {

	public static final DatabaseModel Instance = new DatabaseModel();

	private static final String SYSAD_ID = "sysadmin";
	private static final String SYSAD_PASSWORD = "224d658bc457adc3589096c95ee232c73dfb28ab";

	private final BasicDataSource _connectionPool;

	private DatabaseModel() {
		_connectionPool = new BasicDataSource();
		_connectionPool.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
		_connectionPool.setUrl("jdbc:sqlserver://" + AppConfig.DB_HOST + ";DatabaseName=" + AppConfig.DB_NAME + ";integratedSecurity=false");
		_connectionPool.setUsername("sa");
		_connectionPool.setPassword("123456");
	}

	private void closeConnection(Connection connection, PreparedStatement pstmt, ResultSet result) {
		if (result != null) {
			try {
				result.close();
			} catch (Exception e) {
			}
		}
		if (pstmt != null) {
			try {
				pstmt.close();
			} catch (Exception e) {
			}
		}
		if (connection != null) {
			try {
				if (!connection.getAutoCommit()) {
					connection.setAutoCommit(true);
				}
				connection.close();
			} catch (Exception e) {
			}
		}
	}

	public User checkPassword(String username, String password) {
		if (SYSAD_ID.equals(username) && SYSAD_PASSWORD.equals(password)) {
			return new User(SYSAD_ID, 0, Role.ADMIN, -1);
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT * FROM \"user\" WHERE username=? and password=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setString(1, username);
			pstmt.setString(2, password);
			result = pstmt.executeQuery();
			if (result.next()) {
				int userId = result.getInt("id");
				Role role = Role.fromInteger(result.getInt("role"));
				int profileId = -1;
				if (Role.STUDENT.equals(role) || Role.AGENCY.equals(role)) {
					String profileTable;
					if (Role.STUDENT.equals(role)) {
						profileTable = "student";
					} else {
						profileTable = "agency";
					}
					sql = "SELECT id FROM \"" + profileTable + "\" where user_id=" + userId;
					pstmt = connection.prepareStatement(sql);
					result = pstmt.executeQuery();
					if (result.next()) {
						profileId = result.getInt(1);
					} else {
						return null;
					}
				}
				return new User(username, userId, role, profileId);
			} else {
				return null;
			}

		} catch (SQLException ex) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONArray searchJob(String district, String city, String text, List<String> tags, List<AppliedJob> appliedJob, int agency_id, int lastJobId, int limit, Boolean getInternJob, boolean includeInactive) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			List<String> arraySQLParam = new ArrayList<>();
			//sql param start from 1 -- 0 is not used
			arraySQLParam.add("");
			String limitRec = "";
			if (limit > 0) {
				limitRec = " TOP " + limit;
			}
			String internJobFilter = "";
			if (getInternJob != null) {
				if (getInternJob) {
					internJobFilter = "job.is_internship=1";
				} else {
					internJobFilter = "job.is_internship=0";
				}
			}
			String timeAndTypeFilter;
			if (internJobFilter.isEmpty() && includeInactive) {
				timeAndTypeFilter = "";
			} else if (!includeInactive && !internJobFilter.isEmpty()) {
				timeAndTypeFilter = String.format("WHERE (job.is_close = 0 AND job.expire_date >= CAST(CURRENT_TIMESTAMP AS DATE) AND %s) ", internJobFilter);
			} else if (!internJobFilter.isEmpty()) {
				timeAndTypeFilter = String.format("WHERE %s ", internJobFilter);
			} else {
				timeAndTypeFilter = "WHERE (job.is_close = 0 AND job.expire_date >= CAST(CURRENT_TIMESTAMP AS DATE)) ";
			}
			
			//paging filter
			if (lastJobId > 0) {
				timeAndTypeFilter = (timeAndTypeFilter.isEmpty()? "WHERE " : " AND") + " job.id<? ";
				arraySQLParam.add(String.valueOf(lastJobId));
			}

			StringBuilder sqlBuilder = new StringBuilder();
			String baseSql = "SELECT" + limitRec + " job.*, tag.name as tagname, city.name as cityname, city.id as cityid, district.name as districtname, district.id as districtid, agency.id as agencyid, agency.url_logo as agencylogo, agency.name as agencyname FROM \"job\" "
					+ "LEFT JOIN tagofjob ON tagofjob.job_id = job.id "
					+ "LEFT JOIN tag ON tagofjob.tag_id = tag.id "
					+ "LEFT JOIN city ON city.id = job.city_id "
					+ "LEFT JOIN district ON district.id = job.district_id "
					+ "LEFT JOIN agency ON agency.id = job.agency_id "
					+ timeAndTypeFilter //+ "WHERE (job.is_close = 0 AND job.expire_date >= CAST(CURRENT_TIMESTAMP AS DATE)" + internJobFilter + ") "
					;
			sqlBuilder.append(baseSql);
			boolean getAllRecord = false;
			if (district == null || city == null || text == null) {
				getAllRecord = true;
			} else if (district.equals("") && city.equals("") && text.equals("") && (tags == null || tags.isEmpty()) && (appliedJob == null || appliedJob.isEmpty()) && agency_id < 0) {
				getAllRecord = true;
			}
			if (!getAllRecord) {
				if (timeAndTypeFilter.isEmpty()) {
					sqlBuilder.append("WHERE ");
				} else {
					sqlBuilder.append("AND ");
				}
				if (!district.isEmpty()) {
					sqlBuilder.append("job.district_id IN (SELECT id FROM \"district\" WHERE name=?) ");
					arraySQLParam.add(district);
				}
				if (!city.isEmpty()) {
					if (arraySQLParam.size() > 1) {
						sqlBuilder.append("AND ");
					}
					sqlBuilder.append("job.city_id IN (SELECT id FROM \"city\" WHERE name=?) ");
					arraySQLParam.add(city);
				}
				if (!text.isEmpty()) {
					if (arraySQLParam.size() > 1) {
						sqlBuilder.append("AND ");
					}
					sqlBuilder.append("(job.title LIKE ? OR job.agency_id IN (SELECT id from \"agency\" WHERE name LIKE ?)) ");
					arraySQLParam.add(String.format("%%%s%%", text));
					arraySQLParam.add(String.format("%%%s%%", text));
				}
				if (tags != null && !tags.isEmpty()) {
					if (arraySQLParam.size() > 1) {
						sqlBuilder.append("AND ");
					}
					StringBuilder subSql = new StringBuilder();
					for (int i = 0; i < tags.size(); ++i) {
						if (i > 0) {
							subSql.append(" OR ");
						}
						subSql.append("name=?");
						arraySQLParam.add(tags.get(i));
					}
					sqlBuilder.append(String.format("job.id in (SELECT job_id from \"tagofjob\" WHERE tag_id in (SELECT id from \"tag\" WHERE %s)) ", subSql.toString()));
				}
				if (appliedJob != null && !appliedJob.isEmpty()) {
					if (arraySQLParam.size() > 1) {
						sqlBuilder.append("AND ");
					}
					StringBuilder subSql = new StringBuilder();
					for (int i = 0; i < appliedJob.size(); i++) {
						if (i > 0) {
							subSql.append(",");
						}
						subSql.append("?");
						arraySQLParam.add(String.valueOf(appliedJob.get(i).getJobId()));
					}
					sqlBuilder.append(String.format("job.id in (%s) ", subSql));
				}

				if (agency_id > 0) {
					if (arraySQLParam.size() > 1) {
						sqlBuilder.append("AND ");
					}
					sqlBuilder.append("job.agency_id=? ");
					arraySQLParam.add(String.valueOf(agency_id));
				}
			}
			sqlBuilder.append(" ORDER BY job.id DESC");
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sqlBuilder.toString());
			for (int i = 1; i < arraySQLParam.size(); i++) {
				String strParam = arraySQLParam.get(i);
				try {
					int intParam = Integer.parseInt(strParam);
					pstmt.setInt(i, intParam);
				} catch (NumberFormatException e) {
					pstmt.setString(i, arraySQLParam.get(i));
				}
			}
			result = pstmt.executeQuery();
			JSONObject mapRes = new JSONObject();
			while (result.next()) {
				String id = result.getString("id");
				String tagName = result.getString("tagname");
				if (!mapRes.containsKey(id)) {
					String title = result.getString("title");
					String salary = result.getString("salary");
					String addr = result.getString("address");
					String isIntern = result.getString("is_internship");
					String fullDesc = result.getString("full_desc");
					Date postDate = result.getDate("post_date");
					Date expireDate = result.getDate("expire_date");
					boolean isClose = result.getBoolean("is_close");

					String cityName = result.getString("cityname");
					String cityId = result.getString("cityid");
					String districtName = result.getString("districtname");
					String districtId = result.getString("districtid");
					String agencyId = result.getString("agencyid");
					String agencyName = result.getString("agencyname");
					String agencyLogo = result.getString("agencylogo");

					JSONObject jobObj = new JSONObject();
					jobObj.put(RetCode.id, Noise64.noise(Integer.parseInt(id)));
					jobObj.put(RetCode.title, title);
					jobObj.put(RetCode.salary, salary);
					JSONObject location = new JSONObject();
					location.put(RetCode.address, addr);
					JSONObject cityObject = new JSONObject();
					cityObject.put(RetCode.name, cityName);
					cityObject.put(RetCode.id, Noise64.noise(Integer.parseInt(cityId)));
					location.put(RetCode.city, cityObject);
					JSONObject districtObject = new JSONObject();
					districtObject.put(RetCode.name, districtName);
					districtObject.put(RetCode.id, Noise64.noise(Integer.parseInt(districtId)));
					location.put(RetCode.district, districtObject);

					jobObj.put(RetCode.post_date, postDate.getTime());
					jobObj.put(RetCode.expire_date, expireDate.getTime());
					jobObj.put(RetCode.is_close, isClose);
					jobObj.put(RetCode.is_internship, isIntern);
					jobObj.put(RetCode.location, location);
					jobObj.put(RetCode.full_desc, fullDesc);
					JSONObject agency = new JSONObject();
					agency.put(RetCode.id, Noise64.noise(Integer.parseInt(agencyId)));
					agency.put(RetCode.url_logo, agencyLogo);
					agency.put(RetCode.name, agencyName);
					jobObj.put(RetCode.agency, agency);
					JSONArray tagArr = new JSONArray();
					tagArr.add(tagName);
					jobObj.put(RetCode.tags, tagArr);

					mapRes.put(id, jobObj);
				} else {
					JSONObject jobObj = (JSONObject) mapRes.get(id);
					JSONArray tagArr = (JSONArray) jobObj.get(RetCode.tags);
					tagArr.add(tagName);
				}
			}
			if (appliedJob != null) {
				for (AppliedJob job : appliedJob) {
					if (mapRes.containsKey(String.valueOf(job.getJobId()))) {
						Object get = mapRes.get(String.valueOf(job.getJobId()));
						if (get instanceof JSONObject) {
							((JSONObject) get).put(RetCode.status, job.getStatus().toString());
						}
					}
				}
			}
			JSONObject numberOfStudentApplyJob = getNumberOfStudentApplyJob(-1);
			JSONArray ret = new JSONArray();
			Iterator<?> keys = mapRes.keySet().iterator();
			while (keys.hasNext()) {
				String key = (String) keys.next();
				Object job = mapRes.get(key);
				if (job instanceof JSONObject) {
					if (numberOfStudentApplyJob.containsKey(key)) {
						((JSONObject) job).put(RetCode.apply_num, numberOfStudentApplyJob.get(key));
					} else {
						((JSONObject) job).put(RetCode.apply_num, 0);
					}
					ret.add(job);
				}
			}
			return ret;
		} catch (SQLException ex) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONObject getJobDetail(int jobId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT job.*, tag.name as tagname, city.name as cityname, city.id as cityid, district.name as districtname, district.id as districtid, agency.id as agencyid, agency.url_logo as agencylogo, agency.name as agencyname, agency.url_imgs as agencyimgs, agency.brief_desc as agencybrief "
					+ "FROM \"job\" "
					+ "LEFT JOIN tagofjob ON tagofjob.job_id = job.id "
					+ "LEFT JOIN tag ON tagofjob.tag_id = tag.id "
					+ "LEFT JOIN city ON city.id = job.city_id "
					+ "LEFT JOIN district ON district.id = job.district_id "
					+ "LEFT JOIN agency ON agency.id = job.agency_id "
					+ "WHERE job.id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
			result = pstmt.executeQuery();
			JSONObject jobObj = new JSONObject();
			while (result.next()) {
				String tagName = result.getString("tagname");
				if (jobObj.containsKey(RetCode.tags)) {
					JSONArray tagsArr = (JSONArray) jobObj.get(RetCode.tags);
					tagsArr.add(tagName);
				} else {
					String title = result.getString("title");
					String salary = result.getString("salary");
					String addr = result.getString("address");
					String cityId = result.getString("cityid");
					String cityName = result.getString("cityname");
					String districtId = result.getString("districtid");
					String districtName = result.getString("districtname");
					String agencyId = result.getString("agencyid");
					String agencyName = result.getString("agencyname");
					String agencyLogo = result.getString("agencylogo");
					String agencyImgs = result.getString("agencyimgs");
					String postDate = result.getString("post_date");
					String expireDate = result.getString("expire_date");
					String require = result.getString("requirement");
					String benifit = result.getString("benifits");
					String isIntern = result.getString("is_internship");
					String fullDesc = result.getString("full_desc");
					boolean isClose = result.getBoolean("is_close");

					jobObj.put(RetCode.id, Noise64.noise(jobId));
					jobObj.put(RetCode.title, title);
					jobObj.put(RetCode.salary, salary);

					JSONObject location = new JSONObject();
					location.put(RetCode.address, addr);
					JSONObject city = new JSONObject();
					city.put(RetCode.id, Noise64.noise(Integer.parseInt(cityId)));
					city.put(RetCode.name, cityName);
					location.put(RetCode.city, city);
					JSONObject district = new JSONObject();
					district.put(RetCode.name, districtName);
					district.put(RetCode.id, Noise64.noise(Integer.parseInt(districtId)));
					location.put(RetCode.district, district);
					jobObj.put(RetCode.location, location);

					jobObj.put(RetCode.post_date, postDate);
					jobObj.put(RetCode.expire_date, expireDate);
					jobObj.put(RetCode.requirement, require);
					jobObj.put(RetCode.benifits, benifit);
					jobObj.put(RetCode.full_desc, fullDesc);
					jobObj.put(RetCode.is_internship, isIntern);
					jobObj.put(RetCode.is_close, isClose);

					JSONObject agency = new JSONObject();
					agency.put(RetCode.id, Noise64.noise(Integer.parseInt(agencyId)));
					agency.put(RetCode.url_logo, agencyLogo);
					agency.put(RetCode.name, agencyName);
					JSONArray agencyImgArr;
					try {
						agencyImgArr = (JSONArray) new JSONParser().parse(agencyImgs);
					} catch (Exception e) {
						agencyImgArr = new JSONArray();
					}
					agency.put(RetCode.url_imgs, agencyImgArr);
					jobObj.put(RetCode.agency, agency);

					JSONArray tagArr = new JSONArray();
					tagArr.add(tagName);
					jobObj.put(RetCode.tags, tagArr);
				}
			}
			JSONObject numberOfStudentApplyJob = getNumberOfStudentApplyJob(jobId);
			if (numberOfStudentApplyJob.containsKey(jobId)) {
				jobObj.put(RetCode.apply_num, numberOfStudentApplyJob.get(jobId));
			} else {
				jobObj.put(RetCode.apply_num, 0);
			}
			return jobObj;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public List<AppliedJob> getAllAppliedJob(int id, boolean isJobId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String idStr = "student_id";
			if (isJobId) {
				idStr = "job_id";
			}
			String sql = "SELECT applyjob.*, [file].name as file_name, student.name as student_name FROM \"applyjob\" "
					+ "JOIN [file] ON applyjob.file_id=[file].id "
					+ "JOIN student ON applyjob.student_id=student.id "
					+ "WHERE applyjob." + idStr + "=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, id);
			result = pstmt.executeQuery();
			List<AppliedJob> ret = new ArrayList<>();
			while (result.next()) {
				AppliedJob job = new AppliedJob(result.getInt("id"), result.getInt("job_id"), result.getInt("file_id"), result.getString("file_name"), result.getString("note"), result.getInt("student_id"), result.getString("student_name"), AppliedJobStatus.fromInteger(result.getInt("status")));
				ret.add(job);
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONObject getNumberOfStudentApplyJob(int jobId) throws SQLException {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			JSONObject ret = new JSONObject();
			if (connection != null) {
				String cond = "";
				if (jobId > 0) {
					cond = " WHERE job_id=" + jobId;
				}
				String sql = "SELECT job_id, COUNT(job_id) FROM \"applyjob\"" + cond + " GROUP BY job_id";
				pstmt = connection.prepareStatement(sql);
				result = pstmt.executeQuery();
				while (result.next()) {
					ret.put(result.getString(1), result.getInt(2));
				}
			}
			return ret;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public int writeFileMetaToDB(String name, String url, int userId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "INSERT INTO \"file\" (name, url, student_id, upload_date) values (?, ?, ?, ?)";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			pstmt.setString(1, name);
			pstmt.setString(2, url);
			pstmt.setInt(3, userId);
			pstmt.setDate(4, new Date(System.currentTimeMillis()));
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				return -1;
			}
			result = pstmt.getGeneratedKeys();
			if (result.next()) {
				return result.getInt(1);
			} else {
				return -1;
			}
		} catch (Exception e) {
			return -1;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public int applyJob(int jobId, int fileId, int studentId, String note, int status) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "INSERT INTO \"applyjob\" (job_id, file_id, note, status, student_id) values (?, ?, ?, ?, ?)";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			pstmt.setInt(1, jobId);
			pstmt.setInt(2, fileId);
			pstmt.setString(3, note);
			pstmt.setInt(4, status);
			pstmt.setInt(5, studentId);
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				return -1;
			}
			result = pstmt.getGeneratedKeys();
			if (result.next()) {
				return result.getInt(1);
			} else {
				return -1;
			}
		} catch (Exception e) {
			return -1;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public AppliedJob getApplyJob(int studentId, int jobId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT applyjob.*, [file].name as file_name, student.name as student_name FROM \"applyjob\" "
					+ "JOIN [file] ON applyjob.file_id=[file].id "
					+ "JOIN student ON applyjob.student_id=student.id "
					+ "WHERE applyjob.job_id=? and applyjob.student_id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
			pstmt.setInt(2, studentId);
			result = pstmt.executeQuery();
			if (result.next()) {
				return new AppliedJob(result.getInt("id"), jobId, result.getInt("file_id"), result.getString("file_name"), result.getString("note"), studentId, result.getString("student_name"), AppliedJobStatus.fromInteger(result.getInt("status")));
			} else {
				return null;
			}

		} catch (SQLException ex) {
			ex.printStackTrace();
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public FileMeta getFileMeta(int fileId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT * FROM \"file\" WHERE id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, fileId);
			result = pstmt.executeQuery();
			if (result.next()) {
				return new FileMeta(result.getInt("id"), result.getString("name"), result.getString("url"), result.getDate("upload_date").getTime());
			} else {
				return null;
			}
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONArray getFilesOfStudent(int studentId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT * FROM \"file\" WHERE student_id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, studentId);
			result = pstmt.executeQuery();
			JSONArray ret = new JSONArray();
			while (result.next()) {
				JSONObject file = new JSONObject();
				int id = (int) Noise64.noise(result.getInt("id"));
				String name = result.getString("name");
				long date = result.getDate("upload_date").getTime();
				file.put(RetCode.id, id);
				file.put(RetCode.name, name);
				file.put(RetCode.upload_date, date);

				ret.add(file);
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONArray getAllTags() {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT name FROM \"tag\"";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			result = pstmt.executeQuery();
			JSONArray ret = new JSONArray();
			while (result.next()) {
				ret.add(result.getString(1));
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONArray getAllLocations() {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT city.*, district.id as did, district.name as dname FROM \"city\" "
					+ "LEFT JOIN \"district\" ON city.id=district.city_id";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			result = pstmt.executeQuery();
			JSONObject mapRes = new JSONObject();
			while (result.next()) {
				String cityId = result.getString("id");
				if (!mapRes.containsKey(cityId)) {
					JSONObject city = new JSONObject();
					JSONObject district = new JSONObject();
					district.put(RetCode.id, Noise64.noise(result.getInt("did")));
					district.put(RetCode.name, result.getString("dname"));
					JSONArray districtArr = new JSONArray();
					districtArr.add(district);
					city.put(RetCode.id, Noise64.noise(Integer.parseInt(cityId)));
					city.put(RetCode.name, result.getString("name"));
					city.put(RetCode.districts, districtArr);

					mapRes.put(cityId, city);
				} else {
					JSONObject city = (JSONObject) mapRes.get(cityId);
					JSONArray districtArr = (JSONArray) city.get(RetCode.districts);
					JSONObject district = new JSONObject();
					district.put(RetCode.id, Noise64.noise(result.getInt("did")));
					district.put(RetCode.name, result.getString("dname"));
					districtArr.add(district);
				}
			}

			JSONArray ret = new JSONArray();
			Iterator<?> keys = mapRes.keySet().iterator();
			while (keys.hasNext()) {
				String key = (String) keys.next();
				Object job = mapRes.get(key);
				ret.add(job);
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public int createNewJob(String title, String salary, String addr, int cityId, int districtId, long expireDate, String desc, String requirement, String benifits, int agencyId, boolean isIntern) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "INSERT INTO \"job\" (title, salary, address, city_id, district_id, post_date, expire_date, full_desc, requirement, benifits, agency_id, is_internship, is_close) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			pstmt.setString(1, title);
			pstmt.setString(2, salary);
			pstmt.setString(3, addr);
			pstmt.setInt(4, cityId);
			pstmt.setInt(5, districtId);
			pstmt.setDate(6, new Date(System.currentTimeMillis()));
			pstmt.setDate(7, new Date(expireDate));
			pstmt.setString(8, desc);
			pstmt.setString(9, requirement);
			pstmt.setString(10, benifits);
			pstmt.setInt(11, agencyId);
			pstmt.setBoolean(12, isIntern);
			pstmt.setBoolean(13, false);
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				return -1;
			}
			result = pstmt.getGeneratedKeys();
			if (result.next()) {
				return result.getInt(1);
			} else {
				return -1;
			}
		} catch (Exception e) {
			return -1;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}
	
	public ErrorCode updateJobDetail(int jobId, String title, String salary, String addr, int cityId, int districtId, long expireDate, String desc, String requirement, String benifits, boolean isIntern, boolean isClose) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "UPDATE \"job\" SET title=?,salary=?,address=?,city_id=?,district_id=?,expire_date=?,full_desc=?,requirement=?,benifits=?,is_internship=?,is_close=? WHERE id=? ";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setString(1, title);
			pstmt.setString(2, salary);
			pstmt.setString(3, addr);
			pstmt.setInt(4, cityId);
			pstmt.setInt(5, districtId);
			pstmt.setDate(6, new Date(expireDate));
			pstmt.setString(7, desc);
			pstmt.setString(8, requirement);
			pstmt.setString(9, benifits);
			pstmt.setBoolean(10, isIntern);
			pstmt.setBoolean(11, isClose);
			pstmt.setInt(12, jobId);
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				return ErrorCode.DATABASE_ERROR;
			}
			return ErrorCode.SUCCESS;
		} catch (Exception e) {
			return ErrorCode.DATABASE_ERROR;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public List<Integer> addTags(List<String> tags) {
		if (tags == null || tags.isEmpty()) {
			return null;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			StringBuilder subsql = new StringBuilder();
			for (int i = 0; i < tags.size(); i++) {
				if (i > 0) {
					subsql.append(",");
				}
				subsql.append("?");
			}
			String sql = "SELECT * FROM \"tag\" WHERE name IN (" + subsql.toString() + ")";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			for (int i = 0; i < tags.size(); i++) {
				pstmt.setString(i + 1, tags.get(i));
			}
			result = pstmt.executeQuery();
			List<Integer> tagsId = new ArrayList<>();
			while (result.next()) {
				tagsId.add(result.getInt("id"));
				tags.remove(result.getString("name"));
			}
			if (!tags.isEmpty()) {
				sql = "INSERT INTO \"tag\" (name) VALUES (?)";
				pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
				for (String tagName : tags) {
					pstmt.setString(1, tagName);
					if (pstmt.executeUpdate() > 0) {
						result = pstmt.getGeneratedKeys();
						if (result.next()) {
							tagsId.add(result.getInt(1));
						} else {
							return null;
						}
					} else {
						return null;
					}
				}
			}
			return tagsId;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}	

	public boolean addTagOfJob(List<Integer> tagsId, int jobId) {
		if (tagsId == null || tagsId.isEmpty() || jobId < 0) {
			return false;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			String sql = "DELETE FROM \"tagofjob\" WHERE job_id=?";
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
				
			pstmt.executeUpdate();
			
			sql = "INSERT INTO \"tagofjob\" (tag_id, job_id) VALUES (?, ?)";
			pstmt = connection.prepareStatement(sql);
			for (Integer tagId : tagsId) {
				pstmt.setInt(1, tagId);
				pstmt.setInt(2, jobId);
				pstmt.addBatch();
			}
			int[] executeBatch = pstmt.executeBatch();
			return executeBatch != null;
		} catch (Exception e) {
			return false;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public Agency getAgency(int agencyId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT * FROM \"agency\" WHERE id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, agencyId);
			result = pstmt.executeQuery();
			if (result.next()) {
				return new Agency(result.getInt(("id")), result.getString("url_logo"), result.getString("url_imgs"), result.getString("name"), result.getString("brief_desc"), result.getString("full_desc"), result.getString("location"), result.getString("tech_stack"), result.getInt("user_id"));
			} else {
				return null;
			}
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public ErrorCode changeApplyJobRequestStatus(int jobId, int agencyId, int studentId, AppliedJobStatus status) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			String sql = "SELECT id FROM \"job\" WHERE id=? AND agency_id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
			pstmt.setInt(2, agencyId);
			result = pstmt.executeQuery();
			if (!result.next()) {
				return ErrorCode.ACCESS_DENIED;
			}
			sql = "SELECT status FROM \"applyjob\" WHERE job_id=? AND student_id=?";
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
			pstmt.setInt(2, studentId);
			result = pstmt.executeQuery();
			if (!result.next()) {
				return ErrorCode.NOT_EXIST;
			} else {
				int currentStatus = result.getInt(1);
				if (currentStatus != AppliedJobStatus.PENDING.getValue() || currentStatus == status.getValue()) {
					return ErrorCode.EXIST;
				}
			}
			sql = "UPDATE \"applyjob\" SET status=? WHERE job_id=? AND student_id=?";
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, status.getValue());
			pstmt.setInt(2, jobId);
			pstmt.setInt(3, studentId);
			int affectedRow = pstmt.executeUpdate();
			if (affectedRow < 1) {
				return ErrorCode.DATABASE_ERROR;
			}
			return ErrorCode.SUCCESS;
		} catch (Exception e) {
			return ErrorCode.DATABASE_ERROR;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	private JSONObject getAllCriteria() {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			JSONObject ret = new JSONObject(new LinkedHashMap());
			String sql = "SELECT * FROM \"criteria\"";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			result = pstmt.executeQuery();
			int order = 0;
			while (result.next()) {
				long id = Noise64.noise(result.getInt("id"));
				String name = result.getString("name");
				long parent_id = Noise64.noise(result.getInt("parent_id"));
				boolean status = result.getBoolean("status");

				JSONObject obj = new JSONObject();
				obj.put(RetCode.id, id);
				obj.put(RetCode.name, name);
				obj.put(RetCode.parent_id, parent_id);
				obj.put(RetCode.is_last, status);
				obj.put(RetCode.order, order++);
				ret.put(id, obj);
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	private JSONObject getAllCriteriaValue() {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			JSONObject ret = new JSONObject(new LinkedHashMap());
			String sql = "SELECT * FROM \"criteriavalue\"";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			result = pstmt.executeQuery();
			int order = 0;
			while (result.next()) {
				long id = Noise64.noise(result.getInt("id"));
				String name = result.getString("name");
				long criteriaId = Noise64.noise(result.getInt("criteria_id"));
				int valueType = result.getInt("value_type");
				int weight = result.getInt("weight");

				JSONObject obj = new JSONObject();
				obj.put(RetCode.id, id);
				obj.put(RetCode.name, name);
				obj.put(RetCode.criteria_id, criteriaId);
				obj.put(RetCode.value_type, valueType);
				obj.put(RetCode.weight, weight);
				obj.put(RetCode.order, order++);
				ret.put(id, obj);
			}
			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public JSONArray getCriteriaValue() {
		JSONArray ret = new JSONArray();

		JSONObject criteria = getAllCriteria();
		JSONObject criteriaValue = getAllCriteriaValue();

		if (criteria == null || criteriaValue == null) {
			return null;
		}

		Collection values = criteria.values();
		for (Object value : values) {
			JSONObject val = (JSONObject) value;
			Long parentId = (Long) val.get(RetCode.parent_id);
			if (parentId == null || parentId == Noise64.NOISE_0) {
				if (!val.containsKey(RetCode.data)) {
					val.put(RetCode.data, new JSONArray());
				}
				ret.add(val);
			} else {
				JSONObject parent = (JSONObject) criteria.get(parentId);
				JSONArray parentData = (JSONArray) parent.get(RetCode.data);
				if (parentData == null) {
					parentData = new JSONArray();
					parent.put(RetCode.data, parentData);
				}
				parentData.add(value);
			}
		}

		Collection valuesCriteriaValue = criteriaValue.values();
		for (Object object : valuesCriteriaValue) {
			JSONObject val = (JSONObject) object;
			Long criteriaId = (Long) val.get(RetCode.criteria_id);
			JSONObject criteriaObj = (JSONObject) criteria.get(criteriaId);
			JSONArray data = (JSONArray) criteriaObj.get(RetCode.data);
			if (data == null) {
				data = new JSONArray();
				criteriaObj.put(RetCode.data, data);
			}
			data.add(object);
		}
		return ret;
	}

	public JSONArray getCriteriaValueDetailOfStudent(int studentId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			JSONArray ret = new JSONArray();

			JSONObject criteria = getAllCriteria();
			JSONObject criteriaValue = getAllCriteriaValue();

			if (criteria == null || criteriaValue == null) {
				return null;
			}

			Collection values = criteria.values();
			for (Object value : values) {
				JSONObject val = (JSONObject) value;
				Long parentId = (Long) val.get(RetCode.parent_id);
				if (parentId == null || parentId == Noise64.NOISE_0) {
					if (!val.containsKey(RetCode.data)) {
						val.put(RetCode.data, new JSONArray());
					}
					ret.add(val);
				} else {
					JSONObject parent = (JSONObject) criteria.get(parentId);
					JSONArray parentData = (JSONArray) parent.get(RetCode.data);
					if (parentData == null) {
						parentData = new JSONArray();
						parent.put(RetCode.data, parentData);
					}
					parentData.add(value);
				}
			}

			Collection valuesCriteriaValue = criteriaValue.values();
			for (Object object : valuesCriteriaValue) {
				JSONObject val = (JSONObject) object;
				Long criteriaId = (Long) val.get(RetCode.criteria_id);
				JSONObject criteriaObj = (JSONObject) criteria.get(criteriaId);
				JSONArray data = (JSONArray) criteriaObj.get(RetCode.data);
				if (data == null) {
					data = new JSONArray();
					criteriaObj.put(RetCode.data, data);
				}
				data.add(object);
			}

			//get value detail
			String sql = "SELECT * FROM \"criteriadetail\" WHERE student_id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, studentId);
			result = pstmt.executeQuery();
			while (result.next()) {
				long id = Noise64.noise(result.getInt("id"));
				long criteriaValueId = Noise64.noise(result.getInt("criteriavalue_id"));
				String value = result.getString("value");

				JSONObject criteriaValueObj = (JSONObject) criteriaValue.get(criteriaValueId);
				if (criteriaValueObj == null) {
					continue;
				}

				JSONObject obj = new JSONObject();
				obj.put(RetCode.id, id);
				obj.put(RetCode.data, value);

				criteriaValueObj.put(RetCode.data, obj);
			}

			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}
	
	public JSONArray getCriteriaValueDetailOfJob(int jobId) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			JSONArray ret = new JSONArray();

			JSONObject criteria = getAllCriteria();
			JSONObject criteriaValue = getAllCriteriaValue();

			if (criteria == null || criteriaValue == null) {
				return null;
			}

			Collection values = criteria.values();
			for (Object value : values) {
				JSONObject val = (JSONObject) value;
				Long parentId = (Long) val.get(RetCode.parent_id);
				if (parentId == null || parentId == Noise64.NOISE_0) {
					if (!val.containsKey(RetCode.data)) {
						val.put(RetCode.data, new JSONArray());
					}
					ret.add(val);
				} else {
					JSONObject parent = (JSONObject) criteria.get(parentId);
					JSONArray parentData = (JSONArray) parent.get(RetCode.data);
					if (parentData == null) {
						parentData = new JSONArray();
						parent.put(RetCode.data, parentData);
					}
					parentData.add(value);
				}
			}

			Collection valuesCriteriaValue = criteriaValue.values();
			for (Object object : valuesCriteriaValue) {
				JSONObject val = (JSONObject) object;
				Long criteriaId = (Long) val.get(RetCode.criteria_id);
				JSONObject criteriaObj = (JSONObject) criteria.get(criteriaId);
				JSONArray data = (JSONArray) criteriaObj.get(RetCode.data);
				if (data == null) {
					data = new JSONArray();
					criteriaObj.put(RetCode.data, data);
				}
				data.add(object);
			}

			//get value detail
			String sql = "SELECT * FROM \"criteriajobdetail\" WHERE job_id=?";
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1, jobId);
			result = pstmt.executeQuery();
			while (result.next()) {
				long id = Noise64.noise(result.getInt("id"));
				long criteriaValueId = Noise64.noise(result.getInt("criteriavalue_id"));
				String value = result.getString("value");

				JSONObject criteriaValueObj = (JSONObject) criteriaValue.get(criteriaValueId);
				if (criteriaValueObj == null) {
					continue;
				}

				JSONObject obj = new JSONObject();
				obj.put(RetCode.id, id);
				obj.put(RetCode.data, value);

				criteriaValueObj.put(RetCode.data, obj);
			}

			return ret;
		} catch (Exception e) {
			return null;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public ErrorCode addCriteria(JSONArray criterias) {
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			ErrorCode addCriteria = addCriteria(criterias, 0, connection, pstmt, result);

			return addCriteria;
		} catch (SQLException e) {
			e.printStackTrace();
			return ErrorCode.DATABASE_ERROR;
		} catch (Exception e) {
			e.printStackTrace();
			return ErrorCode.INVALID_PARAMETER;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public ErrorCode addCriteria(JSONArray criterias, int parentId, Connection connection, PreparedStatement pstmt, ResultSet result) throws Exception {
		if (criterias == null || parentId < 0) {
			throw new Exception("invalid param");
		}
		
		try {
			pstmt.close();
		} catch (Exception e) {			
		}

		String sqlInsert = "INSERT INTO \"criteria\" (name, parent_id, status) VALUES (?,?,?)";
		String sqlUpdate = "UPDATE \"criteria\" SET name=? WHERE id=?";
		
		for (Object o : criterias) {
			JSONObject crit = (JSONObject) o;
			String name = (String) crit.get("name");
			Long idObject = (Long) crit.get("id");
			int currentId = -1;
			
			JSONArray childData = (JSONArray) crit.get("data");
			if (name == null || childData == null) {
				throw new Exception("invalid param");
			}
			boolean isLast = Boolean.TRUE.equals(crit.get("is_last"));
			
			if (idObject == null) {
				pstmt = connection.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS);
				pstmt.setString(1, name);
				pstmt.setInt(2, parentId);
				pstmt.setBoolean(3, isLast);
			} else {
				currentId = idObject.intValue();
				currentId = (int) Noise64.denoise(currentId);
				
				pstmt = connection.prepareStatement(sqlUpdate);
				pstmt.setString(1, name);
				pstmt.setInt(2, currentId);
			}
			
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				throw new SQLException("db error");
			}
			
			if (idObject == null) {
				result = pstmt.getGeneratedKeys();
				if (result.next())
					currentId = result.getInt(1);
			}
			
			if (isLast) {
				ErrorCode addCriteriaValue = addCriteriaValue(childData, currentId, connection, pstmt, result);
				if (addCriteriaValue != ErrorCode.SUCCESS) {
					return addCriteriaValue;
				}
			} else {
				ErrorCode addCriteria = addCriteria(childData, currentId, connection, pstmt, result);
				if (addCriteria != ErrorCode.SUCCESS) {
					return addCriteria;
				}
			}
			
		}

		return ErrorCode.SUCCESS;
	}

	public ErrorCode addCriteriaValue(JSONArray criteriaValues, int criteriaId, Connection connection, PreparedStatement pstmt, ResultSet result) throws Exception {
		if (criteriaValues == null || criteriaId < 1) {
			throw new Exception("invalid param");
		}
		
		try {
			pstmt.close();
		} catch (Exception e) {			
		}
		
		String sqlInsert = "INSERT INTO \"criteriavalue\" (name, criteria_id, value_type, weight) VALUES (?,?,?,?)";
		String sqlUpdate = "UPDATE \"criteriavalue\" SET name=?, value_type=?, weight=? WHERE id=?";
		for (Object o : criteriaValues) {
			JSONObject criteriaValue = (JSONObject) o;
			String name = (String) criteriaValue.get("name");
			Long valueType = (Long) criteriaValue.get("value_type");
			Long weight = (Long) criteriaValue.get("weight");
			Long idObject = (Long) criteriaValue.get("id");
			
			if (name == null || valueType == null) {
				throw new Exception("invalid param");
			}
			if (weight == null || weight < 1 || weight > 10) {
				weight = 1l;
			}
			
			if (idObject == null) {
				pstmt = connection.prepareStatement(sqlInsert);
				pstmt.setString(1, name);
				pstmt.setInt(2, criteriaId);
				pstmt.setInt(3, valueType.intValue());
				pstmt.setInt(4, weight.intValue());
			} else {
				int id = (int) Noise64.denoise(idObject.intValue());
				pstmt = connection.prepareStatement(sqlUpdate);
				pstmt.setString(1, name);
				pstmt.setInt(2, valueType.intValue());
				pstmt.setInt(3, weight.intValue());
				pstmt.setInt(4, id);
			}
			
			int affectedRows = pstmt.executeUpdate();
			if (affectedRows < 1) {
				throw new SQLException("db error");
			}
		}
		return ErrorCode.SUCCESS;
	}
	
	public ErrorCode addStudentCriteriaDetail(int studentId, JSONArray criteriaDetails) {
		if (studentId < 1 || criteriaDetails == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			String sql = "INSERT INTO \"criteriadetail\" (student_id, criteriavalue_id, value) VALUES (?,?,?)";
			pstmt = connection.prepareStatement(sql);
			connection.setAutoCommit(false);
			for (Object o : criteriaDetails) {
				JSONObject critDetail = (JSONObject) o;
				Long criteriaValueId = (Long) critDetail.get("id");
				String value = (String) critDetail.get("data");
				if (criteriaValueId == null || value == null) {
					return ErrorCode.INVALID_PARAMETER;
				}
				pstmt.setInt(1, studentId);
				pstmt.setInt(2, (int) Noise64.denoise(criteriaValueId));
				pstmt.setString(3, value);
				
				pstmt.addBatch();
			}
			int[] executeBatch = pstmt.executeBatch();
			for (int i : executeBatch) {
				if (i < 1) {
					connection.rollback();
					connection.setAutoCommit(true);
					return ErrorCode.DATABASE_ERROR;
				}
			}
			connection.setAutoCommit(true);
			return ErrorCode.SUCCESS;
		} catch (SQLException e) {
			return ErrorCode.DATABASE_ERROR;
		} catch (Exception e) {
			return ErrorCode.INVALID_PARAMETER;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}
	
	public ErrorCode updateStudentCriteriaDetail(JSONArray criteriaDetails) {
		if (criteriaDetails == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			String sql = "UPDATE \"criteriadetail\" SET value=? WHERE id=?";
			pstmt = connection.prepareStatement(sql);
			connection.setAutoCommit(false);
			for (Object o : criteriaDetails) {
				JSONObject critDetail = (JSONObject) o;
				Long id = (Long) critDetail.get("id");
				String value = (String) critDetail.get("data");
				if (id == null || value == null || id < 0) {
					return ErrorCode.INVALID_PARAMETER;
				}
				pstmt.setString(1, value);
				pstmt.setInt(2, (int) Noise64.denoise(id));

				pstmt.addBatch();
			}
			int[] executeBatch = pstmt.executeBatch();
			for (int i : executeBatch) {
				if (i < 1) {
					connection.rollback();
					return ErrorCode.DATABASE_ERROR;
				}
			}
			return ErrorCode.SUCCESS;
		} catch (SQLException e) {
			return ErrorCode.DATABASE_ERROR;
		} catch (Exception e) {
			return ErrorCode.INVALID_PARAMETER;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public ErrorCode addJobCriteriaDetail(int jobId, JSONArray criteriaDetails) {
		if (jobId < 1 || criteriaDetails == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			String sql = "INSERT INTO \"criteriajobdetail\" (job_id, criteriavalue_id, value) VALUES (?,?,?)";
			pstmt = connection.prepareStatement(sql);
			connection.setAutoCommit(false);
			for (Object o : criteriaDetails) {
				JSONObject critDetail = (JSONObject) o;
				Long criteriaValueId = (Long) critDetail.get("id");
				String value = (String) critDetail.get("data");
				if (criteriaValueId == null || value == null) {
					return ErrorCode.INVALID_PARAMETER;
				}
				pstmt.setInt(1, jobId);
				pstmt.setInt(2, (int) Noise64.denoise(criteriaValueId));
				pstmt.setString(3, value);

				pstmt.addBatch();
			}
			int[] executeBatch = pstmt.executeBatch();
			for (int i : executeBatch) {
				if (i < 1) {
					connection.rollback();
					connection.setAutoCommit(true);
					return ErrorCode.DATABASE_ERROR;
				}
			}
			connection.setAutoCommit(true);
			return ErrorCode.SUCCESS;
		} catch (SQLException e) {
			return ErrorCode.DATABASE_ERROR;
		} catch (Exception e) {
			return ErrorCode.INVALID_PARAMETER;
		} finally {
			closeConnection(connection, pstmt, result);
		}
	}

	public ErrorCode updateJobCriteriaDetail(JSONArray criteriaDetails) {
		if (criteriaDetails == null) {
			return ErrorCode.INVALID_PARAMETER;
		}
		Connection connection = null;
		PreparedStatement pstmt = null;
		ResultSet result = null;
		try {
			connection = _connectionPool.getConnection();
			String sql = "UPDATE \"criteriajobdetail\" SET value=? WHERE id=?";
			pstmt = connection.prepareStatement(sql);
			connection.setAutoCommit(false);
			for (Object o : criteriaDetails) {
				JSONObject critDetail = (JSONObject) o;
				Long id = (Long) critDetail.get("id");
				String value = (String) critDetail.get("data");
				if (id == null || value == null) {
					return ErrorCode.INVALID_PARAMETER;
				}
				pstmt.setString(1, value);
				pstmt.setInt(2, (int) Noise64.denoise(id));

				pstmt.addBatch();
			}
			int[] executeBatch = pstmt.executeBatch();
			for (int i : executeBatch) {
				if (i < 1) {
					connection.rollback();
					connection.setAutoCommit(true);
					return ErrorCode.DATABASE_ERROR;
				}
			}
			connection.setAutoCommit(true);
			return ErrorCode.SUCCESS;
		} catch (SQLException e) {
			return ErrorCode.DATABASE_ERROR;
		} catch (Exception e) {
			return ErrorCode.INVALID_PARAMETER;
		} finally {
			closeConnection(connection, pstmt, result);
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
		stmt = con.createStatement();
		String sql = "INSERT INTO \"user\" (username, password, role) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 0)";
		sql = "SELECT * FROM \"user\" where username='admin' and password='qweqwe'";
		//sql = "ALTER TABLE \"user\" ALTER COLUMN password varchar(100);";
		String sql2 = "SELECT * FROM \"agency\"";
//		stmt2 = con.prepareStatement(sql2);
//		stmt2.setString(1, "admin");
//		stmt2.setString(2, "d033e22ae348aeb5660fc2140aec35850c4da997");

		sql = "CREATE TABLE \"agency\" (id int IDENTITY(1,1) NOT NULL, url_logo ntext, url_imgs ntext, name ntext, brief_desc ntext, full_desc ntext, location ntext, tech_stack ntext, PRIMARY KEY (id));";

		sql = "INSERT INTO \"agency\" (url_logo, url_imgs, name, brief_desc, full_desc, location, tech_stack) VALUES (?, ?, ?, ?, ?, ?, ?)";

		String logo = "https://itviec.com/system/production/employers/logos/941/vmodev-ha-n-i-logo-170-151.jpg?1454113812";
		String url_imgs = "[\"https://itviec.com/system/production/assets/images/4526/vmodev-ha-n-i-thumbnail.jpg\", \"https://itviec.com/system/production/assets/images/4527/vmodev-ha-n-i-thumbnail.jpg\",\"https://itviec.com/system/production/assets/images/4528/vmodev-ha-n-i-thumbnail.jpg\"]";
		String name = "Vmodev Hà Nội";
		String bdesc = "Công ty hoạt động trong lĩnh vực phần mềm, game cho di động";
		String fdesc = "VMODEV Technology Group được thành lập năm 2012, với khao khát trở thành 1 công ty hàng đầu Việt Nam trong lĩnh vực phần mềm, game cho di động. Với đội ngũ nhân viên trẻ, năng động và sự đa dạng về công việc từ những thị trường khác nhau(Mỹ, Châu Âu, Nhật, Ấn Độ...) sẽ là môi trường tốt để làm viêc, trau dồi kinh nghiệm, gắn bó và cùng phát triển.";
		String loc = "19 Duy Tan, Cau Giay, Ha Noi";
		String ts = "[\"Java\", \".Net\", \"iOS\", \"Android\", \"Objective C\"]";

		logo = "https://itviec.com/system/production/employers/logos/301/nextop-co-ltd-logo-170-151.jpg?1454112881";
		url_imgs = "[\"https://itviec.com/system/production/assets/images/1138/nextop-co-ltd-thumbnail.jpg\", \"https://itviec.com/system/production/assets/images/1137/nextop-co-ltd-thumbnail.jpg\",\"https://itviec.com/system/production/assets/images/1139/nextop-co-ltd-thumbnail.jpg\"]";
		name = "NEXTOP CO.,LTD";
		bdesc = "NEXTOP Co., Ltd is a Japanese company";
		fdesc = "<div>NEXTOP Co., Ltd is a Japanese company whose headquarters is located in Tokyo.&nbsp;</div><div>We are focusing on system development relates to finance, web services, outsourcing services, server operation monitoring, and website building.&nbsp;</div><div>We are targeting at worldwide customers with a vision to become the most dynamic one in system service industry.</div><div><br></div><div>In Vietnam, we are expanding very fast at the moment and therefore, we are in short of the talented people who can work with us to materialize our said vision.</div><div><br></div><div>We are all aware that online companies must run at full speed to compete in every moment everyday. As a matter of fact, we must run at full speed ourselves to take our chances.</div><div><br></div><div>We are waiting for those who can run at full speed from the heart.</div>";
		loc = "Keangnam Hanoi, Landmark Tower, Cau Giay, Ha Noi";
		ts = "[\"Java\", \".Net\", \"iOS\", \"Business Analyst\", \"OOP\", \"Project Manager\"]";

		logo = "https://itviec.com/system/production/employers/logos/295/structis-vietnam-logo-170-151.jpg?1454112993";
		url_imgs = "[\"https://itviec.com/system/production/assets/images/1138/nextop-co-ltd-thumbnail.jpg\", \"https://itviec.com/system/production/assets/images/1137/nextop-co-ltd-thumbnail.jpg\",\"https://itviec.com/system/production/assets/images/1139/nextop-co-ltd-thumbnail.jpg\"]";
		name = "Structis Vietnam";
		bdesc = "Structis Vietnam";
		fdesc = "<div><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Structis is the IT branch of Bouygues Construction, a global player in the building sector.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">As part of Bouygues Construction, the mission of Structis is to provide the members of Bouygues Construction with IT services of high quality fitting with their businesses and to deploy solutions to improve communication and people collaboration through worldwide network. Structis has offices in France, Morocco and Vietnam.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">We are looking forward to cooperating with talented and motivated people</span><br></li></ul></div>";
		loc = "364 Cong Hoa, Tan Binh, Ho Chi Minh";
		ts = "[\"Java\", \".Net\", \"iOS\", \"Business Analyst\", \"OOP\"]";

//		stmt2 = con.prepareStatement(sql);
//		stmt2.setString(1, logo);
//		stmt2.setString(2, url_imgs);
//		stmt2.setString(3, name);
//		stmt2.setString(4, bdesc);
//		stmt2.setString(5, fdesc);
//		stmt2.setString(6, loc);
//		stmt2.setString(7, ts);		
//		Object execute = stmt2.executeUpdate();
//		System.err.println(execute);
//		rs = stmt.executeQuery(sql2);
//		 while (rs.next()) {
//            System.out.println(String.format("%d - %s - %s - %s - %s - %s - %s - %s", rs.getInt(1), rs.getString(2), rs.getString(3),  rs.getString(4), rs.getString(5),  rs.getString(6), rs.getString(7),  rs.getString(8)));
//       }
		String title, tags, salary, location, post_date, expire_date, full_desc, requirement, benifits, agency_id;

		title = "05 Game Designers";
		tags = "Designers,Unity,Game";

		sql = "CREATE TABLE \"tag\" (id int IDENTITY(1,1) NOT NULL, name varchar(10) NOT NULL UNIQUE, PRIMARY KEY (id));";
		//sql = "CREATE TABLE \"tagofjob\" (id int IDENTITY(1,1) NOT NULL, tag_id int NOT NULL, job_id int NOT NULL, PRIMARY KEY (id));";
		String[] taag = new String[]{"Designers", "Unity", "Games", "CSS", "UI/UX", "Java", "PHP", "NodeJs", "MySQL", "Database", "Linux", "Network", "Javascript", "HTML5", "Mobile"};
		sql = "INSERT INTO \"tag\" (name) VALUES (?)";
//		stmt2 = con.prepareStatement(sql);
//		for (String string : taag) {
//			stmt2.setString(1, string);
//			stmt2.addBatch();
//		}

//		stmt2.setString(1, logo);
//		stmt2.setString(2, url_imgs);
//		stmt2.setString(3, name);
//		stmt2.setString(4, bdesc);
//		stmt2.setString(5, fdesc);
//		stmt2.setString(6, loc);
//		stmt2.setString(7, ts);				
//		Object execute = stmt2.executeUpdate();
//		Object execute = stmt2.executeBatch();
//		System.err.println(execute);	
//		sql = "select * from \"tag\"";
//		stmt2 = con.prepareStatement(sql);
//		rs = stmt2.executeQuery();
//		while(rs.next()){
//			System.err.println(String.format("%d - %s", rs.getInt(1), rs.getString(2)));
//		}
//		String tit[] = new String[]{"5 Game Designers", "05 Mobile/Web Graphic Designers", "Back end Developer (Java)", "Senior Java Developer ($1,000 ~ $1,200)", "Senior Network & System Engineer", "Mobile Analyst Developer"};
//		String sal[] = new String[]{"Compatitive & Negotiable", "Up to 1000 USD", "Up to 1000 USD", "$1,000 ~ $1,200", "Compatitive", "Attractive"};
//		String addr[] = new String[]{"19 Duy Tân", "19 Duy Tân", "19 Duy Tân", "Keangnam Hanoi, Landmark Tower", "364 Cong Hoa", "Keangnam Hanoi, Landmark Tower"};
//		Integer dist[] = new Integer[]{1, 1, 1, 1, 3, 1};
//		Integer cit[] = new Integer[]{1, 1, 1, 1, 2, 1};
//		Date dat[] = new Date[]{new Date(2016, 4, 10), new Date(2016, 3, 1), new Date(2016, 3, 1), new Date(2016, 3, 15), new Date(2016, 3, 12), new Date(2016, 3, 9)};
//		Date exdat[] = new Date[]{new Date(2016, 4, 12), new Date(2016, 3, 28), new Date(2016, 4, 7), new Date(2016, 4, 26), new Date(2016, 4, 25), new Date(2016, 3, 25)};
//		String des[] = new String[]{"<div><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Chịu trách nhiệm xây dựng và thiết kế nội dung, kịch bản cho game đảm bảo nội dung game hấp dẫn, nhiều người chơi.</span></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Nghiên cứu thông tin thị trường nhằm nắm bắt kịp xu thế thị trường và hiểu biết về sản phẩm, khách hàng.</span></li></ul></div>", "<ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Thiết kế đồ họa cho web và các ứng dụng di động.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Tư vấn cho khách hàng màu sắc, xu hướng và phong cách thiết kế.</span></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Export, slice, support coder trong quá trình làm UI.</span></li></ul>", "<p></p><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Có kinh nghiệm làm việc ít nhất một ngôn ngữ: Java, NodeJS, Ruby on Rails, PHP...</span><br></li><li>Có kinh nghiệm HTML5, CSS3, Javascript, AJAX, jQuery, JSON.</li><li>Tùy từng ngôn ngữ, yêu cầu tối thiểu biết 1 framework, CMS.</li></ul><div><ol><li>JAVA: Spring(mvc, security…), Hibernate…</li><li>PHP: nuke, joomla, CI, magento….</li><li>Nodejs express, total.js, geddy, locomotive, koa…</li></ol><div><ul><li>Có kinh nghiệm với Web server: Tomcat , Apache hoặc IIS</li><li>Có kinh nghiệm với database Mysql hoặc MSSQL(hiểu biết về NoSQL sẽ là lợi thế)</li></ul></div></div><p></p>", "<div>We are searching for 02 Senior Java Developer. The job will perform following tasks:</div><div>- Participates in the design, development and implementation of complex applications, often using new technologies;</div><div>- May provide technical direction and system architecture for individual initiatives;</div><div>- Develop high-volume, low-latency applications for financial system, delivering high-availability and performance;</div><div>- Code, optimize performance, and run UT according to technical design from Business Analyst team;</div><div>- Ensure the best performance, quality and responsiveness of the applications;&nbsp;</div><div>- Prepare and produce releases of software components;</div><div>- Support continuous improvement by researching new alternatives and technologies and presenting these for architectural review;</div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">We are searching for 01 Senior Java Web Developer. The job will perform following tasks:</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Participates in the design, development and implementation of complex applications, often using new technologies;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- May provide technical direction and system architecture for individual initiatives;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Involve in designing and developing, implementing, and maintaining Java web based applications/modules for Japanese customers;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Create detailed design, documents if needed;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Code, Optimize performance, and run UT according to technical design from Business Analyst team;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Define site objectives by analyzing user requirements; envisioning system features and functionality;</span></font></div>", "<div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Maintain and develop mobile applications based on AngularJS, HTML, CSS, Bootstrap, Cordova and Ionic.</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Analyze client requirements, master development framework, perform design and coding tasks</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Make plans and control the work progress as scheduled</span><br></li></ul></div>"};
//		String req[] = new String[]{"<div><b>Yêu cầu:</b></div><div><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Có đam mê và yêu thích game.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Am hiểu về các ý tố khi thiết kế game như Fun factors, User motivation, core loop, progression,…</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Kỹ năng giao tiết tốt, bao gồm: viết và trình bày</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Có khả năng sáng tạo</span><br></li></ul></div><div><br></div><div><b>Ưu tiên những ứng viên:</b></div><div><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Có kiến thức về văn hóa, xã hội, lịch sử</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Có kiến thức về tâm lý học hành vi</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Đã từng tham gia thiết kế hoặc đánh giá game.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Sử dụng tốt ngoại ngữ (đọc &amp; viết)</span><br></li></ul></div>", "<ul style=\"margin: 1em 0px; padding: 0px 0px 0px 40px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\"><li>Có kinh nghiệm làm việc là một lợi thế</li><li>Tiêng Anh: đọc và hiểu tài liệu</li><li>Có kiển thức cơ bản về OOAD</li><li>Nhiệt tình, luôn khao khát học hỏi công nghệ mới</li><li>Cộng tác tốt với đồng nghiệp và có khả năng đáp ứng được với áp lực công việc</li></ul>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Job Requirements:</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- At least 4 years of application programming experience;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Hands on experience in designing and developing applications using Java EE platforms;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Object-oriented analysis and design using common design patterns;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Profound insight of Java and JEE internals (class-loading, memory management, transaction management, etc)</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good knowledge of Relational Database (MySQL);</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Proficient understanding of code versioning tools such as SVN, etc</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Familiarity with build tools such as Ant, Maven;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Familiarity with Memcache, Redis;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good experience with Spring eco-system such as: Spring Batch, etc;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ability to multi-tasks and switch context to changing priorities in highly dynamic environment;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Experience in Websocket, ActiveMQ shall be an advantage;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good experience with Linux/ Unix OS;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Should be strong in communication skills;&nbsp;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Personality Requirements</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Hard working, responsible, strong interpersonal and communication skills;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ability of working independent and teamwork, can work under high pressure;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ready to work overtime;</span></font></div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Job Requirements:</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- At least 3-4 year experience in software and software package development, especially in Java;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Strong experience in OOP programming;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Have good knowledge about UML;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Expert with Spring framework, Hibernate, Strut2;&nbsp;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good experience in SQL, have knowledge in MySQL;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Experience in Web socket, SVN, Maven shall be an advantage;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good knowledge about JS OOP, Java script framework (Angular,Backbone..);</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Experience with caching solution;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Should be strong in communication skills;&nbsp;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Personality Requirements</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Hard working, responsible, strong interpersonal and communication skills;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ability of working independent and teamwork, can work under high pressure;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ready to work overtime;</span></font></div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Job Requirements</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- At least 2 year experience in Network &amp; System Engineer position;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Bachelor of IT, network;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Excellent in Unix/ Linux skills;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Good knowledge about Apache, Nginx, Tomcat, MySQL, high availability, system, troubleshooting and performance optimizer;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Having experience in Load Balancing (Big IP,Haproxy, Nginx, Apache-http, …) is advantage;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Strong with Network skills: configure firewall such as Cisco PIX, ASA, Juniper SSG, …;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Have experience in design / implement network is required. HA pattern is big advantage;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Having at least one of certificate: LPI 2, OCA, CCNP + is advantage;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Strong in communication in English (writing, reading, speaking);</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Should be strong in communication skills;</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">* Personality Requirements</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Hard working, responsible, strong interpersonal and communication skills.</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ability of working independent and teamwork, can work under high pressure.</span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">- Ready to work overtime.</span></font></div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><b>Job Requirements:</b></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">More than 2 years’ experience of programming in Mobile application based on AngularJS, HTML, CSS, Bootstrap, Cordova and Ionic.</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Strong experience with HTML, CSS, JavaScript, jQuery and AJAX</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Strong experience with Angular JS</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Hands-on experience in software testing</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Good analytical skills</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Knowledge with Web services (SOAP, REST)</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Good at logical thinking and problem solving</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Good understanding of software development process</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">French is a must (4 skills: listening, speaking, reading, writing) to work with French client</span><br></li></ul></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><b>Good to have</b></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Knowledge of PHP programing language</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Knowledge in Design Pattern</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Ability to communicate, read, write and understand specifications in English</span><br></li></ul></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><b>General Skills</b></span></font></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\"><br></span></font></div><div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Good communication</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Well organized</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Can-do attitude</span><br></li></ul></div>"};
//		String ben[] = new String[]{"<div><ul><li><span style=\"font-family: inherit; line-height: 1.42857;\">Lương, thưởng cạnh tranh trên thị trường và công bằng trong nội bộ.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Được hưởng chính sách phúc lợi đầy đủ và sẽ ngày càng tăng.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Được làm việc trong môi trường năng động, trẻ trung, đầy nhiệt huyết. Không gò bó, không cấp bậc.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Được tham gia các hoạt động team buidling và sự kiện lớn trong năm độc đáo, hấp dẫn.</span><br></li><li><span style=\"font-family: inherit; line-height: 1.42857;\">Được trang bị kỹ năng mềm, kỹ năng chuyên môn qua các hoạt động đào tạo của công ty.</span><br></li></ul></div>", "<div><b>Mức lương:</b></div><div>- Đến 1000$</div><div><br></div><div><b>Chính sách và phúc lợi:</b></div><div>- Được làm việc với môi trường cởi mở, thân thiện giữa các thành viên</div><div>- Cơ hội được học hỏi, làm việc với nhưng công nghệ mới</div><div>- Cơ hội làm việc và học hỏi với các đồng nghiệp nước ngoài</div><div>- Lương thỏa thuận + thưởng theo dự án xứng đáng với khả năng</div><div>- Xet tăng lương 6 tháng/lần</div><div>- Thưởng tháng 13 và holiday hàng năm.</div><div>- Ngày phép và BHXH theo luật Lao Động</div>", "<b>Mức lương:</b><div><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\">Thử việc từ 1 đến 2 tháng, lương thử việc bằng 70% lương chính thức.</span><b><br></b></div><div><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\"><br></span></div><div><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\"><b>Chính sách và phúc lợi:</b></span></div><div><ul style=\"margin: 1em 0px; padding: 0px 0px 0px 40px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\"><li>Được làm việc với môi trường cởi mở, thân thiện giữa các thành viên</li><li>Cơ hội được học hỏi, làm việc với nhưng công nghệ mới</li><li>Cơ hội làm việc và học hỏi với các đồng nghiệp nước ngoài</li><li>Lương thỏa thuận + thưởng theo dự án xứng đáng với khả năng</li><li>Xet tăng lương 6 tháng/lần</li><li>Thưởng tháng 13 và holiday hàng năm.</li><li>Ngày phép và BHXH theo luật Lao Động</li></ul></div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">*Remuneration&nbsp;</span></font></div><div><ul><li><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\">Salary: Competitive with lucrative add-ons (based on skills and experience);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Working hours: 9:00 ~ 17:00 (5 days per week);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Excellent Overtime compensation policy;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Bonus : Twice a year (equivalent to 2 months salary);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Insurance package as regulated by Labor Law;</span></li><li><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\">Salary Review: 2 times/year based on employee\\'s performance and contribution;</span></li>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">*Remuneration&nbsp;</span></font></div><div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Salary: Competitive with lucrative add-ons (based on skills and experience);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Working hours: 9:00 ~ 17:00 (5 days per week);</span><br></li><li><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\">Excellent Overtime compensation policy;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Bonus : Twice a year (equivalent to 2 months salary);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Insurance package as regulated by Labor Law;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Salary Review: 2 times/year based on employee\\'s performance and contribution;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Other benefits as per stated in Vietnamese Labor Law;</span></li></ul></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">We would accept application/CV in English only.&nbsp;</span></font></div>", "<div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">*Remuneration&nbsp;</span></font></div><div><ul><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Salary: Competitive with lucrative add-ons (based on skills and experience);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Working hours: 9:00 ~ 17:00 (5 days per week);</span><br></li><li><span style=\"color: rgb(58, 58, 58); font-family: Roboto, sans-serif; font-size: 15px; line-height: 24px;\">Excellent Overtime compensation policy;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Bonus : Twice a year (equivalent to 2 months salary);</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Insurance package as regulated by Labor Law;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Salary Review: 2 times/year based on employee\\'s performance and contribution;</span><br></li><li><span style=\"font-size: 15px; line-height: 24px; color: rgb(58, 58, 58); font-family: Roboto, sans-serif;\">Other benefits as per stated in Vietnamese Labor Law;</span></li></ul></div><div><font color=\"#3a3a3a\" face=\"Roboto, sans-serif\"><span style=\"font-size: 15px; line-height: 24px;\">We would accept application/CV in English only.&nbsp;</span></font></div>"};
//		Integer agenid[] = new Integer[]{1, 1, 2, 2, 3, 3};
//		Boolean isinter[] = new Boolean[]{true, false, false, true, true, false};
//		sql = "INSERT INTO \"job\" (title, salary, address, city_id, district_id, post_date, expire_date, full_desc, requirement, benifits, agency_id, is_internship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//		stmt2 = con.prepareStatement(sql);
//		for (int i = 0; i < 6; i++) {
//			stmt2.setString(1, tit[i]);
//			stmt2.setString(2, sal[i]);
//			stmt2.setString(3, addr[i]);
//			stmt2.setInt(4, cit[i]);
//			stmt2.setInt(5, dist[i]);
//			stmt2.setDate(6, dat[i]);
//			stmt2.setDate(7, exdat[i]);
//			stmt2.setString(8, des[i]);
//			stmt2.setString(9, req[i]);		
//			stmt2.setString(10, ben[i]);
//			stmt2.setInt(11, agenid[i]);
//			stmt2.setBoolean(12, isinter[i]);
//			stmt2.addBatch();
//		}
//		Object execute = stmt2.executeBatch();
//		System.err.println(execute);
//		
//		sql = "select * from \"job\"";
//		stmt2 = con.prepareStatement(sql);
//		rs = stmt2.executeQuery();
//		while(rs.next()){
//			System.err.println(String.format("%d - %s", rs.getInt(1), rs.getString(2)));
//		}
//		sql = "insert into \"tagofjob\" (tag_id, job_id) values (?, ?)";
//		Integer jid[] = new Integer[]{1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6};
//		Integer tid[] = new Integer[]{1, 2, 3, 4, 5, 1, 6 ,7, 8, 6, 9, 10, 9 , 11, 12, 13, 14, 15};
//		stmt2 = con.prepareStatement(sql);
//		for (int i = 0; i< jid.length; i++){
//			stmt2.setInt(1, tid[i]);
//			stmt2.setInt(2, jid[i]);
//			stmt2.addBatch();
//		}
//		Object execute = stmt2.executeBatch();
//		System.err.println(execute);
//		sql = "select * from \"tagofjob\" where tagofjob.id=3";
//		stmt2 = con.prepareStatement(sql);
//		rs = stmt2.executeQuery();
//		while(rs.next()){
//			System.err.println(String.format("%d - %d - %d", rs.getInt(1), rs.getInt(2), rs.getInt(3)));
//		}
//		sql = "CREATE TABLE \"job\" (id int IDENTITY(1,1) NOT NULL, title ntext, salary ntext, address ntext, city_id int, district_id int, post_date date, expire_date date, full_desc ntext, requirement ntext, benifits ntext, agency_id int NOT NULL, is_internship bit, PRIMARY KEY (id));";
//		sql = "drop table \"district\"";
//		sql = "CREATE TABLE \"district\" (id int IDENTITY(1,1) NOT NULL, name varchar(50) NOT NULL UNIQUE, PRIMARY KEY (id));";
//		sql = "insert into \"district\" (name) values (?)";
//		stmt2 = con.prepareStatement(sql);
//		stmt2.setString(1, "Cau Giay");
//		System.err.println(stmt2.executeUpdate());
//		stmt2.setString(1, "Hoan Kiem");
//		System.err.println(stmt2.executeUpdate());
//		stmt2.setString(1, "Tan Binh");
//		System.err.println(stmt2.executeUpdate());
//		stmt2.setString(1, "1");
//		System.err.println(stmt2.executeUpdate());
//		Object execute = stmt2.executeBatch();
//		System.err.println(execute);
//		sql = "SELECT district.id, district.name FROM \"district\""
//			//+ ""
//			;
//		stmt2 = con.prepareStatement(sql);
//		//stmt2.setString(1, "Cau Giay");
//		
//		rs = stmt2.executeQuery();
//		while(rs.next()){
//			System.err.println(String.format("%d - %s", rs.getInt(1), rs.getString(2)));
//		}
		sql = "SELECT job.*, tag.name as tagname, city.name as cityname FROM \"job\" "
				+ "LEFT JOIN tagofjob ON tagofjob.job_id = job.id "
				+ "LEFT JOIN tag ON tagofjob.tag_id = tag.id "
				+ "LEFT JOIN city ON city.id = job.city_id "
				+ "WHERE "
				+ "district_id IN (SELECT id FROM \"district\" WHERE name=?) "
				+ "AND job.title LIKE ? ";
//		stmt2 = con.prepareStatement(sql);
//		stmt2.setString(1, "Cau Giay");
//		stmt2.setString(2, "%Game Designer%");
//		
//		rs = stmt2.executeQuery();

//		sql = "create table \"file\" (id int IDENTITY(1,1) NOT NULL, name ntext NOT NULL, url varchar(100) NOT NULL, user_id int NOT NULL, PRIMARY KEY (id))";
//		stmt2 = con.prepareStatement(sql);
//		System.err.println(stmt2.executeUpdate());
		sql = "create table \"applyjob\" (id int IDENTITY(1,1) NOT NULL, job_id int NOT NULL, file_id int NOT NULL, note ntext, status int NOT NULL, PRIMARY KEY (id))";
		stmt2 = con.prepareStatement(sql);
		System.err.println(stmt2.executeUpdate());

//		sql = "insert into \"file\" (name, url, user_id) values (?, ?, ?)";
//		stmt2 = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
//		stmt2.setString(1, "abcd.doc");
//		stmt2.setString(2, "upload/url-abcd.doc");
//		stmt2.setInt(3, 1);
//		stmt2.executeUpdate();
//		rs = stmt2.getGeneratedKeys();
//
//		Instance.printResultSet(rs);
//		while(rs.next())
//		System.err.println(rs.getString("id"));
		//System.err.println(con.prepareStatement("CREATE TABLE \"district\" (id int IDENTITY(1,1) NOT NULL, name varchar(50) NOT NULL UNIQUE, PRIMARY KEY (id));").executeUpdate());
	}

	private void printResultSet(ResultSet rs) throws SQLException {
		if (rs == null) {
			System.err.println("null");
			return;
		}
		ResultSetMetaData rsmd = rs.getMetaData();
		int columnsNumber = rsmd.getColumnCount();
		while (rs.next()) {
			for (int i = 1; i <= columnsNumber; i++) {
				if (i > 1) {
					System.out.print(",  ");
				}
				String columnValue = rs.getString(i);
				System.out.print(columnValue + " [" + rsmd.getColumnName(i) + "]");
			}
			System.out.println("");
		}

	}
	
	// for testing
	public ErrorCode truncateTable(String table) {
		try {
			String sql = "TRUNCATE TABLE \"" + table + "\"";
			Connection connection = null;
			PreparedStatement pstmt = null;
			ResultSet result = null;
			connection = _connectionPool.getConnection();
			pstmt = connection.prepareStatement(sql);
			return (pstmt.execute() ? ErrorCode.SUCCESS : ErrorCode.DATABASE_ERROR);
			
		} catch (SQLException ex) {
//			Logger.getLogger(DatabaseModel.class.getName()).log(Level.SEVERE, null, ex);
		}
		
		return ErrorCode.FAIL;
	}

}
