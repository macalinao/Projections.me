/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.easybacktest.backend.parser;

import com.easybacktest.backend.DayInfo;

/**
 *
 * @author simplyianm
 */
public class PortfolioEvent {

    private final boolean buy;

    private final int shares;

    private final DayInfo info;

    public PortfolioEvent(boolean buy, int shares, DayInfo info) {
        this.buy = buy;
        this.shares = shares;
        this.info = info;
    }

    public boolean isBuy() {
        return buy;
    }

    public boolean isSell() {
        return !buy;
    }

    public int getShares() {
        return shares;
    }

    public DayInfo getInfo() {
        return info;
    }

}
