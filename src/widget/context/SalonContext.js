import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BookingContext } from './BookingContext';

// SalonContext erstellen
const SalonContext = createContext();

export const useSalonContext = () => useContext(SalonContext);

export const SalonProvider = ({ children }) => {
  const [salon, setSalon] = useState(null);
  const [selectedCoiffeur, setSelectedCoiffeur] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [appointment, setAppointment] = useState({ date: null, time: null });
  
  // BookingContext für die Synchronisierung
  const bookingContext = useContext(BookingContext);
  
  // Refs für die vorherigen Werte, um unnötige Updates zu vermeiden
  const prevSelectedServicesRef = useRef([]);
  const prevAppointmentRef = useRef({ date: null, time: null });

  // Hilfsfunktion zum Vergleichen von Services-Arrays
  const areServicesEqual = useCallback((servicesA, servicesB) => {
    if (!servicesA || !servicesB) return false;
    if (servicesA.length !== servicesB.length) return false;
    
    // Vergleiche die IDs der Services (statt der vollständigen Objekte)
    const idsA = new Set(servicesA.map(service => service.id));
    return servicesB.every(service => idsA.has(service.id));
  }, []);
  
  // Hilfsfunktion zur Formatierung des Datums ohne Zeitzonenprobleme
  const formatDateToYYYYMMDD = useCallback((date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Synchronisiere selectedServices mit dem BookingContext
  useEffect(() => {
    // Nur fortfahren, wenn alle notwendigen Werte vorhanden sind
    if (!bookingContext?.setBookingDetails || selectedServices.length === 0) return;
    
    // Hole die aktuellen Services aus dem BookingContext
    const currentServices = bookingContext.bookingDetails?.services || [];
    
    // Prüfe, ob sich die Services tatsächlich geändert haben
    if (!areServicesEqual(currentServices, selectedServices) && 
        !areServicesEqual(prevSelectedServicesRef.current, selectedServices)) {
      
      bookingContext.setBookingDetails(prev => ({
        ...prev,
        services: selectedServices
      }));
      
      // Aktualisiere die Referenz
      prevSelectedServicesRef.current = [...selectedServices];
    }
  }, [selectedServices, areServicesEqual]);  // bookingContext aus den Abhängigkeiten entfernt

  // Synchronisiere appointment mit dem BookingContext
  useEffect(() => {
    // Nur fortfahren, wenn alle notwendigen Werte vorhanden sind
    if (!bookingContext?.setBookingDetails || 
        (!appointment.date && !appointment.time)) return;
    
    // Prüfe, ob sich date oder time tatsächlich geändert haben
    const dateChanged = appointment.date !== prevAppointmentRef.current.date;
    const timeChanged = appointment.time !== prevAppointmentRef.current.time;
    
    if (!dateChanged && !timeChanged) return;
    
    let formattedDate = null;
    
    // Konvertiere das Datum ins Format YYYY-MM-DD mit Zeitzonenberücksichtigung
    if (appointment.date) {
      if (typeof appointment.date === 'object' && appointment.date instanceof Date) {
        // Verwende lokales Datum statt UTC
        formattedDate = formatDateToYYYYMMDD(appointment.date);
      } else if (typeof appointment.date === 'string') {
        formattedDate = appointment.date;
      }
    }
    
    // Aktualisiere den BookingContext mit dem Datum und der Uhrzeit
    const updates = {};
    if (formattedDate && formattedDate !== bookingContext.bookingDetails?.date) {
      updates.date = formattedDate;
    }
    
    // Uhrzeit synchronisieren, wenn vorhanden
    if (appointment.time && appointment.time !== bookingContext.bookingDetails?.startTime) {
      updates.startTime = appointment.time;
    }
    
    // Nur aktualisieren, wenn es tatsächlich Änderungen gibt
    if (Object.keys(updates).length > 0) {
      bookingContext.setBookingDetails(prev => ({
        ...prev,
        ...updates
      }));
      
      // Aktualisiere die Referenz
      prevAppointmentRef.current = { ...appointment };
    }
  }, [appointment.date, appointment.time, formatDateToYYYYMMDD]); // bookingContext aus den Abhängigkeiten entfernt

  // Funktion zum Zurücksetzen des Kontexts
  const resetContext = useCallback(() => {
    setSalon(null);
    setSelectedCoiffeur(null);
    setSelectedServices([]);
    setAppointment({ date: null, time: null });
    prevSelectedServicesRef.current = [];
    prevAppointmentRef.current = { date: null, time: null };
  }, []);

  return (
    <SalonContext.Provider
      value={{
        salon,
        setSalon,
        selectedCoiffeur,
        setSelectedCoiffeur,
        selectedServices,
        setSelectedServices,
        appointment,
        setAppointment,
        resetContext
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export default SalonContext;