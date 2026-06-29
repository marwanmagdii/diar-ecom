import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStoreConfig } from './StoreConfigContext';

const CustomerTrackingContext = createContext();

export const useCustomerTracking = () => useContext(CustomerTrackingContext);

export const CustomerTrackingProvider = ({ children }) => {
  const { config } = useStoreConfig();
  const [sessionId, setSessionId] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let currentSessionId = localStorage.getItem('diar_session_id');
    if (!currentSessionId) {
      currentSessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('diar_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Initialize or retrieve permanent device ID
    let currentDeviceId = localStorage.getItem('diar_device_id');
    if (!currentDeviceId) {
      currentDeviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('diar_device_id', currentDeviceId);
    }
    setDeviceId(currentDeviceId);

    // Retrieve previous events for this session if they exist
    const savedEvents = localStorage.getItem(`diar_events_${currentSessionId}`);
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Error parsing saved events");
      }
    }
  }, []);

  const trackEvent = (eventType, details = {}) => {
    if (config?.loggingSettings && config.loggingSettings.Customers === false) return;
    if (!sessionId) return;

    const newEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      type: eventType,
      timestamp: new Date().toISOString(),
      details
    };

    setEvents(prev => {
      const updatedEvents = [...prev, newEvent];
      localStorage.setItem(`diar_events_${sessionId}`, JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  const getTrackingData = () => {
    return {
      deviceId,
      sessionId,
      events
    };
  };

  const clearTrackingData = () => {
    if (sessionId) {
      localStorage.removeItem(`diar_events_${sessionId}`);
      // Generate a new session for future actions
      const newSessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('diar_session_id', newSessionId);
      setSessionId(newSessionId);
      setEvents([]);
    }
  };

  return (
    <CustomerTrackingContext.Provider value={{
      sessionId,
      events,
      trackEvent,
      getTrackingData,
      clearTrackingData
    }}>
      {children}
    </CustomerTrackingContext.Provider>
  );
};
