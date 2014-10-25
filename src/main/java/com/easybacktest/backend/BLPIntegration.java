/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.easybacktest.backend;

import com.bloomberglp.blpapi.CorrelationID;
import com.bloomberglp.blpapi.Element;
import com.bloomberglp.blpapi.Event;
import com.bloomberglp.blpapi.Message;
import com.bloomberglp.blpapi.MessageIterator;
import com.bloomberglp.blpapi.Request;
import com.bloomberglp.blpapi.Service;
import com.bloomberglp.blpapi.Session;
import com.bloomberglp.blpapi.SessionOptions;
import com.easybacktest.backend.parser.PortfolioEvent;
import com.easybacktest.backend.parser.Strategy;
import com.easybacktest.backend.parser.StrategyPortfolio;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author simplyianm
 */
public class BLPIntegration {

    public static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    public static void main(String[] args) {
        System.out.println(testStrategy("SPX Index", 10000,
                Arrays.asList("buy when it drops 10%", "sell 50% when it rises 50%")));
    }

    public static String testStrategy(String stock, int initialCapital, List<String> strategy) {
        return QuickJson.toJson((new Strategy(strategy)).execute(stock, initialCapital));
    }

    public static List<DayInfo> getDailyData(String security) {
        List<DayInfo> ret = new ArrayList<>();

        String serverHost = "10.8.8.1";
        int serverPort = 8194;

        SessionOptions sessionOptions = new SessionOptions();
        sessionOptions.setServerHost(serverHost);
        sessionOptions.setServerPort(serverPort);

        Session session = new Session(sessionOptions);

        System.out.println("Connecting to " + serverHost + ":" + serverPort);
        try {
            if (!session.start()) {
                System.err.println("Failed to start session.");
                return ret;
            }
        } catch (IOException ex) {
            Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        } catch (InterruptedException ex) {
            Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        }
        System.out.println("Connected successfully.");

        try {
            if (!session.openService("//blp/refdata")) {
                System.err.println("Failed to open //blp/refdata");
                return ret;
            }
        } catch (InterruptedException ex) {
            Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        } catch (IOException ex) {
            Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        }

        Service refDataService = session.getService("//blp/refdata");
        Request request
                = refDataService.createRequest("HistoricalDataRequest");
        request.append("securities", security);
        request.append("fields", "PX_LAST");
        request.append("fields", "OPEN");
        request.set("startDate", "19700101");
        request.set("endDate", (new SimpleDateFormat("yyyyMMdd")).format(new Date()));
        request.set("periodicitySelection", "DAILY");

        CorrelationID theCid;
        try {
            theCid = session.sendRequest(request, null);
        } catch (IOException ex) {
            Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        }

        for (;;) {
            Event event;
            try {
                event = session.nextEvent();
            } catch (InterruptedException ex) {
                Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
                return ret;
            }

            MessageIterator msgIter = event.messageIterator();
            while (msgIter.hasNext()) {
                Message msg = msgIter.next();
                if (msg.correlationID() != theCid) {
                    continue;
                }

                // Processing
                Element securityData = msg.getElement("securityData");
                Element fieldDataArray = securityData.getElement("fieldData");
                for (int j = 0; j < fieldDataArray.numValues(); ++j) {
                    Element fieldData = fieldDataArray.getValueAsElement(j);

                    Date date = null;
                    double open = 0;
                    double last = 0;

                    for (int k = 0; k < fieldData.numElements(); ++k) {
                        Element field = fieldData.getElement(k);
                        String fn = field.name().toString();

                        if (fn.equals("date")) {
                            try {
                                date = DATE_FORMAT.parse(field.getValueAsString());
                            } catch (ParseException ex) {
                                Logger.getLogger(BLPIntegration.class.getName()).log(Level.SEVERE, null, ex);
                                return ret;
                            }
                        } else if (fn.equals("OPEN")) {
                            open = Double.parseDouble(field.getValueAsString());
                        } else if (fn.equals("PX_LAST")) {
                            last = Double.parseDouble(field.getValueAsString());
                        }
                    }

                    DayInfo di = new DayInfo(date, open, last);
                    ret.add(di);
                }

            }
            if (event.eventType() == Event.EventType.RESPONSE) {
                return ret;
            }
        }
    }
}
