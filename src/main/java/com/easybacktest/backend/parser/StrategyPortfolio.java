/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.easybacktest.backend.parser;

import com.easybacktest.backend.DayInfo;
import com.easybacktest.backend.DayInfoTruncated;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author simplyianm
 */
public class StrategyPortfolio {

    private int shares;

    private double cash;

    private List<PortfolioEvent> events = new ArrayList<>();

    private List<DayInfoTruncated> dailyData;

    private double value;

    private List<DayInfoTruncated> benchmark;

    public StrategyPortfolio(double cash) {
        shares = 0;
        this.cash = cash;
    }

    public double getShares() {
        return shares;
    }

    public double getCash() {
        return cash;
    }

    public List<PortfolioEvent> getEvents() {
        return events;
    }

    public double getValue() {
        return value;
    }

    public int allInBuy(DayInfo day, double magnitude) {
        double cost = day.getOpen();
        if (cost == 0) {
            return 0;
        }
        int amt = (int) (cash / cost);
        amt *= magnitude;

        shares += amt;
        cash -= amt * cost;
        PortfolioEvent e = new PortfolioEvent(true, amt, day);
        events.add(e);
        return amt;
    }

    public int allInSell(DayInfo day, double magnitude) {
        int amt = shares;
        amt *= magnitude;

        double money = amt * day.getOpen();
        shares -= amt;
        cash += money; // CASH$Money
        PortfolioEvent e = new PortfolioEvent(false, amt, day);
        events.add(e);
        return amt;
    }

    public void done(List<DayInfo> dataLong, List<DayInfo> benchmarkLong) {
        this.dailyData = new ArrayList<>();
        for (DayInfo day : dataLong) {
            this.dailyData.add(day.truncate());
        }
        this.value = getCash() + getShares() * dailyData.get(dailyData.size() - 1).getOpen();

        this.benchmark = new ArrayList<>();
        for (DayInfo day : benchmarkLong) {
            this.benchmark.add(day.truncate());
        }
    }

}
