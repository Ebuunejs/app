import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../../dashboard/config';

const BASE_URL = config.backendUrl;

// BusinessContext erstellen
const BusinessContext = createContext();

export const useBusinessContext = () => useContext(BusinessContext);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Lade Geschäftsdaten aus dem localStorage, falls vorhanden
  useEffect(() => {
    try {
      const savedBusiness = localStorage.getItem('current-business');
      if (savedBusiness) {
        setBusiness(JSON.parse(savedBusiness));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Geschäftsdaten aus localStorage:', error);
    }
  }, []);
  
  // Funktion zum Abrufen der Salon-Daten anhand der ID
  const fetchBusiness = useCallback(async (companyId) => {
    if (!companyId) {
      setError('Keine Salon-ID angegeben');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API-Endpunkt für die Salon-Statusprüfung
      const response = await axios.get(`${BASE_URL}/business/status/${companyId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Prüfe, ob die Anfrage erfolgreich war
      if (response.data && response.data.status) {
        const businessData = response.data.data;
        
        // Normalisiere den is_active Wert, um verschiedene Formate zu unterstützen
        if ('is_active' in businessData) {
          const rawValue = businessData.is_active;
          
          // Konvertiere verschiedene Formate zu boolean
          if (typeof rawValue === 'string') {
            // String zu boolean konvertieren
            businessData.is_active = rawValue.toLowerCase() === 'true' || rawValue === '1';
          } else if (typeof rawValue === 'number') {
            // Nummer zu boolean konvertieren
            businessData.is_active = rawValue === 1;
          }
          // Boolean-Werte bleiben unverändert
          
          console.log("Normalisierter is_active Wert:", businessData.is_active);
        }
        
        // Speichere die Daten im State
        setBusiness(businessData);
        
        // Speichere die Daten im localStorage für Persistenz
        localStorage.setItem('current-business', JSON.stringify(businessData));
        
        return businessData;
      } else {
        const errorMsg = response.data?.message || 'Salon nicht verfügbar';
        setError(errorMsg);
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Salon-Daten:', error);
      setError(error.response?.data?.message || 'Fehler beim Laden des Salons');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Funktion zum Zurücksetzen des Business-Kontexts
  const resetBusinessContext = useCallback(() => {
    setBusiness(null);
    localStorage.removeItem('current-business');
  }, []);
  
  // Funktion zum Prüfen, ob der Salon aktiv ist
  const isBusinessActive = useCallback(() => {
    if (!business) return false;
    
    // Prüfe verschiedene Formate des aktiven Status
    const isActive = 
      // Boolean true
      business.is_active === true || 
      // Number 1
      business.is_active === 1 ||
      // String "1"
      business.is_active === "1" ||
      // String "true"
      business.is_active === "true" ||
      // Status ist "aktiv"
      business.status === 'aktiv' ||
      // Status ist "active"
      business.status === 'active';
    
    return isActive;
  }, [business]);

  return (
    <BusinessContext.Provider 
      value={{ 
        business, 
        isLoading, 
        error, 
        fetchBusiness, 
        resetBusinessContext,
        isBusinessActive
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext; 