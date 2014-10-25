package me.projections.site;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;


public class QuickJson {
	private static final Gson gson = new GsonBuilder().create();
	public static String toJson(Object o){
		return gson.toJson(o);
	}
}
