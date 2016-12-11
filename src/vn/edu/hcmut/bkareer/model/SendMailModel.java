/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.model;

import hapax.Template;
import hapax.TemplateDataDictionary;
import hapax.TemplateDictionary;
import hapax.TemplateLoader;
import hapax.TemplateResourceLoader;
import java.util.Date;
import java.util.Properties;
import javax.mail.Authenticator;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import vn.edu.hcmut.bkareer.common.VerifiedToken;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import vn.edu.hcmut.bkareer.common.AppConfig;

/**
 *
 * @author Kiss
 */
public class SendMailModel extends BaseModel {

	private static final Logger _Logger = Logger.getLogger(SendMailModel.class);

	public static final SendMailModel Instance = new SendMailModel();

	protected final TemplateLoader tmplLoader = TemplateResourceLoader.create("vn/edu/hcmut/bkareer/mailtemplate/");

	private final String VERIFY_ACCOUNT_TITLE = "Activate BKareer account";
	
	private final Properties mailAuthenProp;

	private SendMailModel() {
		mailAuthenProp = new Properties();
		mailAuthenProp.put("mail.smtp.host", "smtp.gmail.com");
		mailAuthenProp.put("mail.smtp.port", 587);
		mailAuthenProp.put("mail.smtp.auth", "true");
		mailAuthenProp.put("mail.smtp.starttls.enable", "true");
	}

	@Override
	protected void process(HttpServletRequest req, HttpServletResponse resp, VerifiedToken token) {

	}

	public void sendVerifyAccountEmail(String userEmail, String userName, String verifyUrl) {
		try {
			Template template = tmplLoader.getTemplate("verify-account");
			TemplateDataDictionary dic = TemplateDictionary.create();
			dic.setVariable("ACTIVATE_URL", verifyUrl);
			dic.setVariable("NAME", userName);
			sendHtmlEmail(userEmail, VERIFY_ACCOUNT_TITLE, template.renderToString(dic));
			_Logger.info("Verify account mail has been sent to: " + userEmail + " - Verify Url: " + verifyUrl);
		} catch (Exception e) {
			_Logger.error(e);
		}
	}
	
	public void sendAgencyAccountInfo(String userEmail, String comparyName, String pwd, String activeUrl) {
		try {
			Template template = tmplLoader.getTemplate("agency-account-info");
			TemplateDataDictionary dic = TemplateDictionary.create();
			dic.setVariable("ACTIVATE_URL", activeUrl);
			dic.setVariable("NAME", comparyName);
			dic.setVariable("USERNAME", userEmail);
			dic.setVariable("PWD", pwd);
			sendHtmlEmail(userEmail, VERIFY_ACCOUNT_TITLE, template.renderToString(dic));
			_Logger.info("Agency account info mail has been sent to: " + userEmail);
		} catch (Exception e) {
			_Logger.error(e);
		}
	}

	private void sendHtmlEmail(String toAddress, String subject, String message) throws AddressException, MessagingException {

		// sets SMTP server properties
		Properties properties = new Properties();
		properties.put("mail.smtp.host", "smtp.gmail.com");
		properties.put("mail.smtp.port", 587);
		properties.put("mail.smtp.auth", "true");
		properties.put("mail.smtp.starttls.enable", "true");

		// creates a new session with an authenticator
		Authenticator auth = new Authenticator() {
			@Override
			public PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(AppConfig.ADMIN_EMAIL, AppConfig.ADMIN_EMAIL_PWD);
			}
		};
		Session session = Session.getDefaultInstance(mailAuthenProp, auth);

		// creates a new e-mail message
		Message msg = new MimeMessage(session);

		msg.setFrom(new InternetAddress(AppConfig.ADMIN_EMAIL));
		InternetAddress[] toAddresses = {new InternetAddress(toAddress)};
		msg.setRecipients(Message.RecipientType.TO, toAddresses);
		msg.setSubject(subject);
		msg.setSentDate(new Date());
		msg.setContent(message, "text/html");

		Transport.send(msg);
	}

}
