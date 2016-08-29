/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vn.edu.hcmut.bkareer.util;

/**
 *
 * @author Kiss
 */
public class Noise64 {
	
	private static final int MAGIC_NUMBER = 25678;
	
	public static final long NOISE_0 = noise(0);
	
	public static long noise(long num) {
		if (num < 0) {
			return num;
		}
		long sum = num + MAGIC_NUMBER;
		return sum * (sum + 1) / 2 + MAGIC_NUMBER;
	}
	
	public static long denoise(long num) {
		if (num < 0) {
			return num;
		}
		double  w = (Math.sqrt(8l * num + 1) - 1) / 2;
		return (long) w - MAGIC_NUMBER;
	}
}
