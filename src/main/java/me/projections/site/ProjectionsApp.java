/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.projections.site;

import static spark.Spark.*;

/**
 *
 * @author simplyianm
 */
public class ProjectionsApp {

    public static void main(String[] args) {
        Bloomberg b = new Bloomberg();
        b.connect();

        staticFileLocation("/public");

        get("/api/all", "application/json", (request, response) -> {
            try {
                return QuickJson.toJson(b.getStockData());
            } catch (Exception e) {
                e.printStackTrace();
                return "omg";
            }
        });
    }
}
