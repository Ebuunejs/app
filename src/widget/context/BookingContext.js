import React, { createContext, useState, useEffect, useContext } from 'react';

// Erstelle den Context
export const BookingContext = createContext();

// Hook für einfacheren Zugriff auf den BookingContext
export const useBookingContext = () => useContext(BookingContext);

// Provider-Komponente, die den globalen Zustand verwaltet
export const BookingProvider = ({ children }) => {
    // Versuche, gespeicherte Buchungsdetails aus dem localStorage zu laden
    const loadBookingDetails = () => {
        // Versuche, gespeicherte Buchungsdetails aus dem localStorage zu laden
        const savedDetails = localStorage.getItem('bookingDetails');
        
        if (savedDetails) {
            try {
                const parsedDetails = JSON.parse(savedDetails);
                
                // Sicherstellen, dass alle erwarteten Felder vorhanden sind
                // und Ersetzen von company_id durch key in business
                if (parsedDetails.business && parsedDetails.business.company_id && !parsedDetails.business.key) {
                    parsedDetails.business.key = parsedDetails.business.company_id;
                    delete parsedDetails.business.company_id;
                }
                
                return parsedDetails;
            } catch (error) {
                console.error('Fehler beim Parsen der gespeicherten Buchungsdetails:', error);
            }
        }
        
        // Standardwerte zurückgeben, wenn keine gespeicherten Details verfügbar sind
        return {
            business: null,
            barber: null,
            services: [],
            date: null,
            time: null,
            totalDuration: 0,
            totalPrice: 0,
            customer: null,
            reservation_status: 'pending'
        };
    };
    
    const [bookingDetails, setBookingDetails] = useState(loadBookingDetails);

    // Speichere Änderungen im localStorage mit Verzögerung
    useEffect(() => {
        // Verwende ein Timeout, um zu verhindern, dass zu viele Updates hintereinander erfolgen
        const debounceTimer = setTimeout(() => {
            try {
                const storedValue = localStorage.getItem('bookingDetails');
                const currentValue = JSON.stringify(bookingDetails);
                
                // Nur speichern, wenn sich der Wert tatsächlich geändert hat
                if (storedValue !== currentValue) {
                    localStorage.setItem('bookingDetails', currentValue);
                }
            } catch (error) {
                console.error('Fehler beim Speichern der Buchungsdetails im localStorage:', error);
            }
        }, 300); // 300ms Verzögerung
        
        // Cleanup-Funktion
        return () => clearTimeout(debounceTimer);
    }, [bookingDetails]);

    // Wrapper für setBookingDetails, um sicherzustellen, dass alle Änderungen korrekt gespeichert werden
    const updateBookingDetails = (updater) => {
        if (typeof updater === 'function') {
            setBookingDetails(prev => {
                const newState = updater(prev);
                return newState;
            });
        } else {
            setBookingDetails(updater);
        }
    };

    // Funktion zum Zurücksetzen der Buchungsdetails
    const resetBookingDetails = () => {
        setBookingDetails({
            business: null,
            barber: null,
            services: [],
            date: null,
            time: null,
            totalDuration: 0,
            totalPrice: 0,
            customer: null,
            reservation_status: 'pending'
        });
        localStorage.removeItem('bookingDetails');
    };

    // Funktion zum Aktualisieren des Reservierungsstatus
    const updateReservationStatus = (newStatus) => {
        if (['pending', 'confirmed', 'completed', 'cancelled'].includes(newStatus)) {
            updateBookingDetails(prev => ({
                ...prev,
                reservation_status: newStatus
            }));
        } else {
            console.error('Ungültiger Reservierungsstatus:', newStatus);
        }
    };

    // Hinzufügen oder Entfernen eines Services
    const toggleService = (service) => {
        updateBookingDetails(prev => {
            const existingServiceIndex = prev.services.findIndex(s => s.id === service.id);
            
            if (existingServiceIndex >= 0) {
                // Service entfernen
                const updatedServices = [...prev.services];
                updatedServices.splice(existingServiceIndex, 1);
                return {
                    ...prev,
                    services: updatedServices
                };
            } else {
                // Service hinzufügen
                return {
                    ...prev,
                    services: [...prev.services, service]
                };
            }
        });
    };

    // Berechnete Werte aus den Buchungsdetails
    const totalDuration = bookingDetails.services?.reduce(
        (sum, service) => sum + Number(service.duration || 0), 0
    ) || 0;
    
    const totalPrice = bookingDetails.services?.reduce(
        (sum, service) => sum + Number(service.price || 0), 0
    ) || 0;

    return (
        <BookingContext.Provider value={{ 
            bookingDetails, 
            setBookingDetails: updateBookingDetails,
            resetBookingDetails,
            updateReservationStatus,
            toggleService,
            totalDuration,
            totalPrice
        }}>
            {children}
        </BookingContext.Provider>
    );
};