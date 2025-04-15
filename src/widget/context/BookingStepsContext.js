import React, { createContext, useState, useEffect } from 'react'

export const StepsContext = createContext();

const BookingStepsContext = ({ children }) => {
    // Lade Schritte aus dem localStorage, falls vorhanden
    const loadSteps = () => {
        try {
            const savedSteps = localStorage.getItem('bookingSteps');
            return savedSteps ? JSON.parse(savedSteps) : [];
        } catch (error) {
            console.error('Fehler beim Laden der Schritte aus localStorage:', error);
            return [];
        }
    };

    const [ steps, setSteps ] = useState(loadSteps);

    // Speichere Änderungen im localStorage mit Verzögerung
    useEffect(() => {
        // Verwende ein Timeout, um zu verhindern, dass zu viele Updates hintereinander erfolgen
        const debounceTimer = setTimeout(() => {
            try {
                const storedValue = localStorage.getItem('bookingSteps');
                const currentValue = JSON.stringify(steps);
                
                // Nur speichern, wenn sich der Wert tatsächlich geändert hat
                if (storedValue !== currentValue) {
                    localStorage.setItem('bookingSteps', currentValue);
                    // console.log('Schritte in localStorage gespeichert:', steps);
                }
            } catch (error) {
                console.error('Fehler beim Speichern der Schritte im localStorage:', error);
            }
        }, 300); // 300ms Verzögerung
        
        // Cleanup-Funktion
        return () => clearTimeout(debounceTimer);
    }, [steps]);

    // Wrapper für setSteps, um sicherzustellen, dass alle Änderungen korrekt gespeichert werden
    const updateSteps = (newSteps) => {
        if (typeof newSteps === 'function') {
            setSteps(prev => newSteps(prev));
        } else {
            setSteps(newSteps);
        }
    };

    return (
        <StepsContext.Provider value={{ steps, setSteps: updateSteps }}>
            {children}
        </StepsContext.Provider>
    )
}

export default BookingStepsContext