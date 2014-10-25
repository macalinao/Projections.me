/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.easybacktest.backend;

import java.util.Arrays;
import java.util.List;
import static spark.Spark.*;

/**
 *
 * @author simplyianm
 */
public class EasyBacktest {

    public static void main(String[] args) {
        staticFileLocation("/public");

        post("/strategy_test", "application/json", (request, response) -> {
            try {
                String stock = request.queryParams("stock");
                int initial = Integer.parseInt(request.queryParams("initial"));
                List<String> strategyData = Arrays.asList(request.queryParams("strategy").split(";"));
                return BLPIntegration.testStrategy(stock, initial, strategyData);
            } catch (Exception e) {
                e.printStackTrace();
                return "omg";
            }
        });
    }
}
