/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.projections.site;

import com.bloomberglp.blpapi.CorrelationID;
import com.bloomberglp.blpapi.Element;
import com.bloomberglp.blpapi.Event;
import com.bloomberglp.blpapi.Message;
import com.bloomberglp.blpapi.MessageIterator;
import com.bloomberglp.blpapi.Request;
import com.bloomberglp.blpapi.Service;
import com.bloomberglp.blpapi.Session;
import com.bloomberglp.blpapi.SessionOptions;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author simplyianm
 */
public class Bloomberg {

    private Session session = null;

    public static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    public Session connect() {
        if (session != null) {
            throw new IllegalStateException("Already connected.");
        }

        String serverHost = "10.8.8.1";
        int serverPort = 8194;

        SessionOptions sessionOptions = new SessionOptions();
        sessionOptions.setServerHost(serverHost);
        sessionOptions.setServerPort(serverPort);

        session = new Session(sessionOptions);

        System.out.println("Connecting to " + serverHost + ":" + serverPort);
        try {
            if (!session.start()) {
                System.err.println("Failed to start session.");
            }
        } catch (IOException ex) {
            Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InterruptedException ex) {
            Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
        }

        try {
            if (!session.openService("//blp/refdata")) {
                System.err.println("Failed to open //blp/refdata");
                return session;
            }
        } catch (InterruptedException ex) {
            Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
        }

        System.out.println("Connected successfully.");

        return session;
    }

    public List<Map<String, Object>> getStockData() {
        List<Map<String, Object>> ret = new ArrayList<>();

        Service refDataService = session.getService("//blp/refdata");
        Request request = refDataService.createRequest("ReferenceDataRequest");

        Element securities = request.getElement("securities");
        for (String security : SP500.sp500) {
            securities.appendValue(security + " US Equity");
        }

        Element fields = request.getElement("fields");
        fields.appendValue("LONG_COMPANY_NAME_REALTIME");
        fields.appendValue("LOCAL_EXCHANGE_SYMBOL_REALTIME");
        fields.appendValue("PX_LAST");
        fields.appendValue("PX_HIGH");
        fields.appendValue("PX_LOW");
        fields.appendValue("PX_CLOSE");
        fields.appendValue("NEWS_SENTIMENT");
        fields.appendValue("TWITTER_SENTIMENT_REALTIME");
        fields.appendValue("VWAP_STANDARD_DEV_RT");
        fields.appendValue("EQY_REC_CONS");

        CorrelationID theCid;
        try {
            theCid = session.sendRequest(request, null);
        } catch (IOException ex) {
            Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
            return ret;
        }

        for (;;) {
            Event event;
            try {
                event = session.nextEvent();
            } catch (InterruptedException ex) {
                Logger.getLogger(Bloomberg.class.getName()).log(Level.SEVERE, null, ex);
                continue;
            }

            MessageIterator msgIter = event.messageIterator();
            while (msgIter.hasNext()) {
                Message msg = msgIter.next();
                if (msg.correlationID() != theCid) {
                    continue;
                }

                // Processing
                System.out.println(msg);
                Element securityDataArray = msg.getElement("securityData");

                for (int i = 0; i < securityDataArray.numValues(); i++) {

                    Element securityData = securityDataArray.getValueAsElement(i);
                    Element fieldData = securityData.getElement("fieldData");

                    try {
                        String name = securityData.getElementAsString("security");

                        Map<String, Object> data = new HashMap<>();
                        data.put("name", fieldData.getElementAsString("LONG_COMPANY_NAME_REALTIME"));
                        data.put("symbol", fieldData.getElementAsString("LOCAL_EXCHANGE_SYMBOL_REALTIME"));
                        data.put("last", fieldData.getElementAsFloat64("PX_LAST"));
                        data.put("high", fieldData.getElementAsFloat64("PX_HIGH"));
                        data.put("low", fieldData.getElementAsFloat64("PX_LOW"));
                        data.put("close", fieldData.getElementAsFloat64("PX_CLOSE"));
                        data.put("newsSentiment", fieldData.getElementAsFloat64("NEWS_SENTIMENT"));
                        data.put("twitterSentiment", fieldData.getElementAsFloat64("TWITTER_SENTIMENT_REALTIME"));
                        data.put("vwapStdDev", fieldData.getElementAsFloat64("VWAP_STANDARD_DEV_RT"));
                        data.put("eqyRecCons", fieldData.getElementAsFloat64("EQY_REC_CONS"));

                        ret.add(data);
                    } catch (Exception e) {
                        continue;
                    }
                }

            }
            if (event.eventType() == Event.EventType.RESPONSE) {
                return ret;
            }
        }
    }
}
