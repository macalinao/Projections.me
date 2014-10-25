/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.easybacktest.backend;

import java.util.Date;

/**
 *
 * @author simplyianm
 */
public class DayInfoTruncated {

    private final String date;

    private final double open;

    private double shares;

    private double cash;

    private double value;

    public DayInfoTruncated(String date, double open, double shares, double cash, double value) {
        this.date = date;
        this.open = open;
        this.shares = shares;
        this.cash = cash;
        this.value = value;
    }

    public double getOpen() {
        return open;
    }

}
