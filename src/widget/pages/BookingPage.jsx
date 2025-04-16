import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSalonContext } from "../context/SalonContext";
import { useBusinessContext } from "../context/BusinessContext";
import { BookingContext } from "../context/BookingContext";
import { BookingCalendar } from "../components/BookingCalendar";
import BusinessHeader from "../components/BusinessHeader";
import { Container, Row, Col, Alert, Card, Button, Spinner, Badge } from "react-bootstrap";
import { FaClock, FaCalendarAlt, FaCheck, FaArrowRight, FaArrowLeft, FaCut } from "react-icons/fa";
import axios from "axios";
import config from "../../dashboard/config";

// Fallback-URL hinzufügen falls die Umgebungsvariable nicht gesetzt ist
const BASE_URL = config.backendUrl || "http://127.0.0.1:8000";

// Inline-Stile für besseres Design
const styles = {
  header: {
    backgroundImage: 'linear-gradient(to right, #7DB561, #60A8C1)',
    color: 'white',
    padding: '3rem 0',
    marginBottom: '2rem',
    borderRadius: '0 0 15px 15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  heroText: {
    textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
  },
  primaryButton: {
    backgroundColor: '#7DB561',
    borderColor: '#7DB561',
    padding: '0.8rem 2rem',
    fontSize: '1.1rem',
    borderRadius: '30px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  },
  loadingSpinner: {
    height: '50vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  summaryCard: {
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    height: 'auto',
    marginBottom: '1rem',
    width: '100%'
  },
  cardHeader: {
    backgroundImage: 'linear-gradient(to right, #7DB561, #60A8C1)',
    color: 'white',
    padding: '0.8rem 1.2rem',
    fontWeight: 'bold'
  },
  cardBody: {
    padding: '1.2rem'
  },
  summaryItem: {
    marginBottom: '1rem'
  },
  summaryTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '0.3rem'
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#60A8C1'
  },
  totalSection: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
    marginTop: '0.5rem'
  },
  priceTag: {
    backgroundColor: '#7DB561',
    color: 'white',
    padding: '0.3rem 0.6rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    display: 'inline-block',
    margin: '0 0.3rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '0.9rem'
  },
  durationBadge: {
    backgroundColor: '#f0f0f0',
    color: '#555',
    padding: '0.3rem 0.5rem',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '0.3rem',
    fontSize: '0.8rem'
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1.2rem',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#444',
    position: 'relative',
    paddingBottom: '0.8rem'
  },
  sectionTitleUnderline: {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '50px',
    height: '3px',
    background: 'linear-gradient(to right, #7DB561, #60A8C1)',
    borderRadius: '3px'
  },
  timeSlotCard: {
    padding: '0.8rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
    minHeight: '50px'
  },
  selectedTimeSlot: {
    backgroundColor: '#e8f9e8',
    borderColor: '#7DB561',
    borderWidth: '2px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  },
  availableTimeSlot: {
    backgroundColor: '#f0f7f0',
    borderColor: '#7DB561',
    color: '#2a602a',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e8f9e8',
      borderColor: '#7DB561',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  },
  unavailableTimeSlot: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe0e0',
    color: '#d36b6b',
    cursor: 'not-allowed',
    opacity: 0.8
  },
  blockedTimeSlot: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe0e0',
    color: '#d36b6b',
    cursor: 'not-allowed',
    opacity: 0.8
  },
  tentativeTimeSlot: {
    backgroundColor: '#fffde7',
    borderColor: '#fff9c4',
    color: '#ffa000',
    cursor: 'not-allowed'
  },
  pastTimeSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    color: '#9e9e9e',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  timeSlotTime: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  timeSlotStatus: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    display: 'inline-block',
    marginLeft: '0.5rem'
  },
  serviceListItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '0.5rem 0.6rem',
    marginBottom: '0.3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  serviceTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  servicePrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#7DB561',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '0.3rem 0.6rem',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  iconWrapper: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: '10px',
    color: '#60A8C1'
  },
  navButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem'
  },
  cardIcon: {
    backgroundColor: '#f8f9fa',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    color: '#7DB561',
    fontSize: '0.9rem'
  }
};

function BookingPage() {
  const navigate = useNavigate();
    const { selectedCoiffeur, selectedServices, setAppointment } = useSalonContext();
    const { business, isBusinessActive } = useBusinessContext();
    const { bookingDetails, setBookingDetails, totalDuration, totalPrice } = useContext(BookingContext);
    
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(bookingDetails.selectedSlot);
    const [selectedDate, setSelectedDate] = useState(null);
    
    // Funktion zum Aktualisieren des Reservierungsstatus
    const updateReservationStatus = (status) => {
        if (setBookingDetails) {
            setBookingDetails(prev => ({
                ...prev,
                reservation_status: status
            }));
            console.log(`Reservierungsstatus aktualisiert auf: ${status}`);
        }
    };
    
    // Service berechnung direkt aus dem BookingContext
    const services = bookingDetails.services || [];
    
    // Berechne Gesamtzeit und Gesamtpreis
    const calculateTotals = () => {
        if (!services.length) return { totalDuration: 0, totalPrice: 0 };
        
        const totalDuration = services.reduce((sum, service) => 
            sum + (service ? Number(service.duration || 0) : 0), 0);
        
        const totalPrice = services.reduce((sum, service) => 
            sum + (service ? Number(service.price || 0) : 0), 0);
        
        return { totalDuration, totalPrice };
    };
    
    const { totalDuration: calculatedTotalDuration, totalPrice: calculatedTotalPrice } = calculateTotals();
    
    // Bei Initialisierung selectedSlot aus dem BookingContext laden
  useEffect(() => {
        if (bookingDetails.selectedSlot && !selectedSlot) {
            setSelectedSlot(bookingDetails.selectedSlot);
        }
    }, [bookingDetails.selectedSlot, selectedSlot]);
    
  useEffect(() => {
        // Check if we have the necessary data to proceed
        if (!bookingDetails.barber || services.length === 0) {
            // Redirect back if missing data
            navigate(`/coiffeur`);
            return;
        }
        
        // Check if business is active
        if (business && !isBusinessActive()) {
            setError('Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.');
            return;
        }
        
        // Wenn bereits ein Datum ausgewählt ist, die verfügbaren Slots dafür laden
        if (bookingDetails.date && !availableSlots.length) {
            const savedDate = new Date(bookingDetails.date);
            setSelectedDate(savedDate);
            fetchAvailableSlots(bookingDetails.date, true); // Alle Slots anzeigen
        } else if (!bookingDetails.date && !availableSlots.length) {
            // Wenn kein Datum ausgewählt ist, das aktuelle Datum verwenden
            const today = new Date();
            setSelectedDate(today);
            
            // Format the date as YYYY-MM-DD
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            // Speichere das Datum im BookingContext
            if (setBookingDetails) {
                setBookingDetails(prev => ({
                    ...prev,
                    date: formattedDate
                }));
            }
            
            // Lade Slots für heute
            fetchAvailableSlots(formattedDate, true);
        }
    }, [business, bookingDetails, services, navigate, isBusinessActive, availableSlots.length]);
    
    const handleDateSelect = (date) => {
        // Speichere das Datum im Zustand
        setSelectedDate(date);
        
        // Format the date as YYYY-MM-DD but preserve the local date (without timezone issues)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Aktualisiere das Datum im BookingContext
        if (setBookingDetails) {
            setBookingDetails(prev => ({
                ...prev,
                date: formattedDate
            }));
        }
        
        // Versuche zuerst, alle Zeitslots abzurufen
        fetchAvailableSlots(formattedDate, true); // true bedeutet "show all slots"
    };
    
    const fetchAvailableSlots = async (date, showAll = false) => {
        setLoading(true);
        setError(null);
        setAvailableSlots([]);
        
        // Füge diese Debug-Funktion hinzu, um die empfangenen Daten zu prüfen
        const logSlotData = (slots) => {
            console.log('Empfangene Slots:', slots);
        };
        
        // Deduplizierungsfunktion für Slots
        const deduplicateSlots = (slots) => {
            console.log("Dedupliziere Slots, vorher:", slots.length);
            
            // Gruppiere Slots nach start_time
            const timeMap = {};
            
            slots.forEach(slot => {
                if (slot.start_time) {
                    const timeKey = slot.start_time;
                    
                    // Wenn dieser Zeitpunkt bereits existiert
                    if (timeMap[timeKey]) {
                        // Wenn der vorhandene Slot gebucht ist, aber der neue nicht, behalte den gebuchten
                        if (timeMap[timeKey].status === 'booked' && slot.status !== 'booked') {
                            // Behalte den bereits vorhandenen
                        } 
                        // Wenn der neue gebucht ist, aber der vorhandene nicht, ersetze ihn
                        else if (timeMap[timeKey].status !== 'booked' && slot.status === 'booked') {
                            timeMap[timeKey] = slot;
                        }
                        // Sonst behalte den mit der niedrigeren ID (wahrscheinlich älter)
                        else if (Number(slot.id) < Number(timeMap[timeKey].id)) {
                            timeMap[timeKey] = slot;
                        }
                    } else {
                        // Speichere den ersten Slot für diese Zeit
                        timeMap[timeKey] = slot;
                    }
                }
            });
            
            // Konvertiere zurück in Array
            const deduplicated = Object.values(timeMap);
            console.log("Nach Deduplizierung:", deduplicated.length);
            
            return deduplicated;
        };
        
        try {
            const barberId = bookingDetails.barber?.id;
            const businessId = bookingDetails.business?.id || business?.id;
            
            if (!barberId || !businessId) {
                throw new Error('Barber oder Business ID fehlt');
            }
            
            // Calculate the total duration of selected services
            const duration = services.reduce((total, service) => total + parseInt(service.duration || 0, 10), 0);
            
            if (!duration) {
                throw new Error('Dienstleistungsdauer fehlt');
            }
            
            // Prüfe, ob das Datum in der Zukunft liegt
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isDateInFuture = selectedDate >= today;
            
            // Für zukünftige Daten in mehr als 7 Tagen, generiere immer Standard-Slots
            const oneWeekFromNow = new Date(today);
            oneWeekFromNow.setDate(today.getDate() + 7);
            
            if (isDateInFuture && selectedDate > oneWeekFromNow) {
                console.log('Datum liegt mehr als 7 Tage in der Zukunft, generiere Standard-Slots');
                const defaultSlots = generateDefaultTimeSlots(date);
                setAvailableSlots(defaultSlots);
                setSelectedSlot(null);
                return;
            }
            
            // Vollständige URL mit allen erforderlichen Parametern
            // Wenn showAll=true, rufen wir alle Slots ab, sonst nur verfügbare
            
            const endpoint = showAll ? 'timeslots' : 'timeslots/available';
            const apiUrl = `${BASE_URL}/${endpoint}?date=${date}&barber_id=${barberId}&business_id=${businessId}&duration=${duration}`;
            
            // Standard-Headers ohne die Parameter
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            // Falls ein Token vorhanden ist, füge es hinzu
            const token = localStorage.getItem('user-token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            try {
                // Direkte Anfrage mit URL-Parametern statt Header-Parametern
                const response = await axios.get(apiUrl, { headers });
                
                // Überarbeite die Verarbeitung der Daten, die von der API kommen
                let slots = [];
                
                // Füge Debug-Informationen hinzu
                console.log('API-Antwort:', response.data);
                
                if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
                    slots = response.data.data.data;
                } else if (Array.isArray(response.data)) {
                    slots = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // API gibt ein Objekt zurück
                    if (Array.isArray(response.data.data)) {
                        slots = response.data.data;
                    } else if (response.data.timeslots && Array.isArray(response.data.timeslots)) {
                        slots = response.data.timeslots;
                    } else if (response.data.slots && Array.isArray(response.data.slots)) {
                        slots = response.data.slots;
                    } else if (response.data.available && Array.isArray(response.data.available)) {
                        slots = response.data.available;
                    } else {
                        // Durchsuche das Objekt nach dem ersten Array
                        for (const key in response.data) {
                            if (Array.isArray(response.data[key])) {
                                slots = response.data[key];
                                break;
                            }
                        }
                    }
                }
                
                // Log für Debug-Zwecke
                logSlotData(slots);
                
                // Filtere die Slots, um nur die des ausgewählten Datums anzuzeigen
                const filteredSlots = slots.filter(slot => slot.date === date);
                console.log('Gefilterte Slots für das ausgewählte Datum:', filteredSlots);
                
                // Prüfen, ob die vorhandenen Slots gültige Zeitangaben haben
                const hasValidTimeSlots = filteredSlots.length > 0 && filteredSlots.some(slot => {
                    const startTimeValid = slot.time || slot.start_time;
                    
                    // Detaillierte Debug-Ausgaben für jeden Slot
                    console.log("Slot Zeit-Details:", {
                        slotId: slot.id,
                        timeValue: startTimeValid, 
                        type: typeof startTimeValid,
                        hasColon: startTimeValid ? startTimeValid.toString().includes(':') : false
                    });
                    
                    // Verbesserte Validierung, die auch Zahlen und andere Formate akzeptiert
                    if (typeof startTimeValid === 'number') {
                        // Wenn es eine Zahl ist, als Stunde interpretieren
                        console.log("Zeit als Zahl erkannt:", startTimeValid);
                        return true;
                    }
                    
                    if (!startTimeValid) return false;
                    
                    // Wenn es ein String ist, prüfen ob HH:MM Format oder konvertierbar
                    const timeStr = startTimeValid.toString();
                    
                    // Entweder bereits HH:MM Format
                    if (timeStr.includes(':') && 
                        timeStr.split(':').length === 2 &&
                        !isNaN(Number(timeStr.split(':')[0])) &&
                        !isNaN(Number(timeStr.split(':')[1]))) {
                        return true;
                    }
                    
                    // Oder eine einfache Zahl, die als Stunde interpretiert werden kann
                    if (!isNaN(Number(timeStr)) && Number(timeStr) >= 0 && Number(timeStr) < 24) {
                        console.log("Zeit als String-Zahl erkannt:", timeStr);
                        return true;
                    }
                    
                    return false;
                });
                
                console.log('Hat gültige Zeitslots:', hasValidTimeSlots);
                console.log('Gefilterte Slots Rohdaten:', JSON.stringify(filteredSlots, null, 2));
                
                // Wenn keine Slots vorhanden sind oder keine gültigen Zeitslots und das Datum in der Zukunft liegt,
                // generiere immer Standard-Slots für diesen Tag
                if (isDateInFuture) {
                    // Generiere immer Standard-Zeitslots für das Datum in der Zukunft
                    console.log('Generiere Standard-Zeitslots für das Datum:', date);
                    const defaultSlots = generateDefaultTimeSlots(date);
                    
                    // Wenn es Slots aus der API gibt, kombiniere sie mit den Standard-Slots
                    if (filteredSlots.length > 0) {
                        console.log('Kombiniere API-Slots mit Standard-Slots für zukünftiges Datum');
                        
                        // Verarbeite die API-Slots
                        const normalizedApiSlots = filteredSlots.map(slot => {
                            // Validiere und normalisiere die Zeit
                            const slotTime = slot.time || slot.start_time || '';
                            let normalizedTime = '';
                            
                            console.log("Verarbeite API-Slot:", slot);
                            
                            if (typeof slotTime === 'number' || !isNaN(Number(slotTime))) {
                                // Konvertiere Zahl zu HH:MM
                                const timeValue = Number(slotTime);
                                if (timeValue >= 0 && timeValue < 24) {
                                    normalizedTime = `${String(timeValue).padStart(2, '0')}:00`;
                                }
                            } else if (typeof slotTime === 'string' && slotTime.includes(':')) {
                                // Bereits im HH:MM Format
                                const [hours, minutes] = slotTime.split(':').map(Number);
                                if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                                    normalizedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                }
                            }
                            
                            if (!normalizedTime) {
                                console.log(`Ungültiges Zeitformat für Slot ${slot.id}, wird übersprungen`);
                                return null;
                            }
                            
                            // Berechne die Endzeit (30 Minuten später)
                            const [hours, minutes] = normalizedTime.split(':').map(Number);
                            let endHours = hours;
                            let endMinutes = minutes + 30;
                            
                            if (endMinutes >= 60) {
                                endHours = (endHours + 1) % 24;
                                endMinutes -= 60;
                            }
                            
                            const normalizedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                            
                            // Status bestimmen - WICHTIG: Die Reihenfolge der Prüfungen definiert die Priorität!
                            let status = 'available';
                            let is_selectable = true;
                            
                            // 1. HÖCHSTE PRIORITÄT: Überprüfe die Booking-ID
                            // Wenn eine Buchungs-ID vorhanden ist, ist der Slot IMMER gebucht, unabhängig vom Status
                            if (slot.bookings_id !== null && slot.bookings_id !== undefined) {
                                console.log(`Slot ${slot.id} hat eine Buchungs-ID: ${slot.bookings_id} -> immer als gebucht markieren`);
                                status = 'booked';
                                is_selectable = false;
                            } 
                            // 2. Überprüfe den Typ (Termin, Krank, usw.)
                            else if (slot.type || slot.types) {
                                const typeValue = slot.type || slot.types;
                                console.log(`Slot ${slot.id} hat einen Typ: ${typeValue}`);
                                if (typeValue && ['termin', 'krank', 'ferien', 'pause'].includes(typeValue.toLowerCase())) {
                                    status = 'blocked';
                                    is_selectable = false;
                                }
                            }
                            // 3. NIEDRIGSTE PRIORITÄT: Wenn im Status explizit markiert und keine höhere Priorität greift
                            else if (slot.status) {
                                console.log(`Slot ${slot.id} hat einen Status: ${slot.status}`);
                                status = slot.status.toLowerCase();
                                is_selectable = status === 'available';
                            }
                            
                            // Debug-Ausgabe für alle Slots
                            console.log(`Slot nach Verarbeitung: ${normalizedTime}, Status: ${status}, Wählbar: ${is_selectable}`);
                            
                            // Erstelle den normalisierten Slot
                            return {
                                id: slot.id || `api-${Math.random().toString(36).substr(2, 9)}`,
                                date: slot.date || date,
                                start_time: normalizedTime,
                                end_time: normalizedEndTime,
                                status: status,
                                is_selectable: is_selectable,
                                display: `${normalizedTime}-${normalizedEndTime}`,
                                barber_id: slot.barber_id || barberId,
                                bookings_id: slot.bookings_id,
                                all_day: slot.all_day || false,
                                type: slot.type || slot.types || null,
                                source: 'api'
                            };
                        }).filter(slot => slot !== null);
                        
                        // Erstelle eine Map der belegten Zeiten
                        const bookedTimesMap = {};
                        normalizedApiSlots.forEach(slot => {
                            console.log(`Speichere Slot in Map: ${slot.start_time}, Status: ${slot.status}`);
                            bookedTimesMap[slot.start_time] = slot;
                        });
                        
                        // Aktualisiere die Standard-Slots basierend auf den API-Daten
                        const updatedDefaultSlots = defaultSlots.map(slot => {
                            // Wenn dieser Zeitslot in den gebuchten/blockierten Zeiten ist
                            if (bookedTimesMap[slot.start_time]) {
                                console.log(`Slot ${slot.start_time} ist in der Map mit Status: ${bookedTimesMap[slot.start_time].status}`);
                                return bookedTimesMap[slot.start_time];
                            }
                            
                            // Ansonsten ist es ein verfügbarer Standard-Slot
                            return {
                                ...slot,
                                source: 'default',
                                status: 'available',
                                is_selectable: true
                            };
                        });
                        
                        console.log("Aktualisierte Slots:", updatedDefaultSlots.length);
                        setAvailableSlots(updatedDefaultSlots);
                        setSelectedSlot(null);
                    } else {
                        // Keine API-Slots, verwende einfach die Standard-Slots
                        setAvailableSlots(defaultSlots);
                        setSelectedSlot(null);
                    }
                } else if (filteredSlots.length > 0 && hasValidTimeSlots) {
                    // Wenn Slots gefunden wurden und gültige Zeiten haben, verarbeite diese
                    
                    // Verbesserte Fehlerbehandlung bei der Verarbeitung der Slots
                    const processedSlots = filteredSlots.map(slot => {
                        console.log('Verarbeite Slot:', slot);
                        
                        // Sicherstellungsfunktion für valide Zeitangaben
                        const validateTimeFormat = (timeStr) => {
                            if (!timeStr) return '';
                            
                            // Wenn es eine Zahl ist (als Number oder String)
                            if (typeof timeStr === 'number' || (!isNaN(Number(timeStr)) && !timeStr.includes(':'))) {
                                const timeValue = Number(timeStr);
                                // Interpretiere als Stunde, wenn < 24
                                if (timeValue >= 0 && timeValue < 24) {
                                    return `${String(timeValue).padStart(2, '0')}:00`;
                                }
                                // Falls > 24, interpretiere als Minuten seit Mitternacht
                                else if (timeValue >= 0) {
                                    const hours = Math.floor(timeValue / 60);
                                    const mins = timeValue % 60;
                                    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                                }
                            }
                            
                            // Wenn bereits im HH:MM Format
                            if (typeof timeStr === 'string' && timeStr.includes(':')) {
                                const timeParts = timeStr.split(':');
                                if (timeParts.length !== 2) return '';
                                
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                
                                if (isNaN(hours) || isNaN(minutes)) return '';
                                if (hours < 0 || hours > 23 || minutes < 0 || minutes >= 60) return '';
                                
                                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                            }
                            
                            return '';
                        };
                        
                        // Validierte Start- und Endzeiten
                        const validStartTime = validateTimeFormat(slot.time || slot.start_time);
                        
                        console.log(`Zeit nach Validierung: "${slot.time || slot.start_time}" -> "${validStartTime}"`);
                        
                        let validEndTime = validateTimeFormat(slot.end_time);
                        
                        // Berechne Endzeit nur, wenn eine gültige Startzeit vorhanden ist
                        if (validStartTime && !validEndTime) {
                            try {
                                const [hours, minutes] = validStartTime.split(':').map(Number);
                                let endHours = hours;
                                let endMinutes = minutes + 30;
                                
                                if (endMinutes >= 60) {
                                    endHours += 1;
                                    endMinutes -= 60;
                                }
                                
                                if (endHours < 24) { // Stelle sicher, dass die Stunde gültig ist
                                    validEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                                }
                            } catch (e) {
                                console.error('Fehler bei der Berechnung der Endzeit:', e);
                                validEndTime = '';
                            }
                        }
                        
                        // Prüfe, ob es gebuchte Slots für dieses Datum gibt
                        const hasBookedSlots = filteredSlots.some(slot => 
                            slot.bookings_id !== null || 
                            slot.status === 'booked' || 
                            (slot.type && ['termin'].includes(slot.type.toLowerCase()))
                        );
                        
                        // Bestimme detaillierten Status basierend auf allen verfügbaren Informationen
                        let status = 'available';
                        let is_selectable = true;
                        
                        // Wenn das Datum in der Zukunft liegt und es keine gebuchten Slots gibt,
                        // setze alle Slots auf verfügbar
                        if (isDateInFuture && !hasBookedSlots) {
                            status = 'available';
                            is_selectable = true;
                        } else {
                            // Standardlogik für die Statusbestimmung
                            
                            // Wenn bookings_id vorhanden ist, ist der Slot gebucht
                            if (slot.bookings_id !== null) {
                                status = 'booked';
                                is_selectable = false;
                            }
                            
                            // Wenn ein expliziter Status in der API-Antwort vorhanden ist, verwende diesen
                            if (slot.status) {
                                status = slot.status.toLowerCase();
                                is_selectable = status === 'available';
                            }
                            
                            // Prüfe, ob der Slot in der Vergangenheit liegt
                            const currentDate = new Date();
                            const slotDate = new Date(`${slot.date}T${validStartTime || slot.time || slot.start_time}`);
                            const isPast = slotDate < currentDate;
                            
                            if (isPast) {
                                status = 'past';
                                is_selectable = false;
                            }
                            
                            // Prüfe, ob der Typ "pause", "krank", "termin" oder "ferien" ist
                            if (slot.type && ['pause', 'krank', 'termin', 'ferien'].includes(slot.type.toLowerCase())) {
                                status = 'blocked';
                                is_selectable = false;
                            }
                        }
                        
                        // Erstelle ein standardisiertes Slot-Objekt mit sicheren Fallback-Werten
                        const processedSlot = {
                            id: slot.id || `slot-${Math.random().toString(36).substr(2, 9)}`,
                            date: slot.date || date,
                            start_time: validStartTime || '',
                            end_time: validEndTime || '',
                            status: status,
                            barber_id: slot.barber_id || barberId,
                            bookings_id: slot.bookings_id,
                            all_day: slot.all_day || false,
                            is_selectable: is_selectable,
                            type: slot.type || null
                        };
                        
                        // Zusätzliche Formatierungsprüfung für falsch formatierte Zeiteinträge (nur Minuten)
                        if (!processedSlot.start_time && slot.time) {
                            // Prüfen, ob es sich nur um eine Zahl handelt (Minuten ohne Stunden)
                            const timeValue = parseInt(slot.time, 10);
                            if (!isNaN(timeValue) && timeValue >= 0 && timeValue < 60) {
                                console.log('Erkannt: Nur Minuten-Wert in der Zeit:', timeValue);
                                // Nehme an, dass es sich um einen Stundenwert von 0-23 handelt, Standard: 9 Uhr
                                const defaultHour = timeValue >= 24 ? 9 : timeValue;
                                const minutes = timeValue >= 24 ? timeValue % 60 : 0;
                                processedSlot.start_time = `${String(defaultHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                
                                // Berechne die Endzeit (30 Minuten später)
                                let endHour = defaultHour;
                                let endMinutes = minutes + 30;
                                
                                if (endMinutes >= 60) {
                                    endHour += 1;
                                    endMinutes -= 60;
                                }
                                
                                processedSlot.end_time = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                                console.log('Korrigierter Zeit-Wert:', processedSlot.start_time, '-', processedSlot.end_time);
                            }
                        }
                        
                        // Generiere eine leserliche Anzeige für die UI
                        // Prüfe erst, ob start_time und end_time gültige Werte haben
                        if (processedSlot.start_time && processedSlot.end_time) {
                            // Validiere die Zeitformate, um NaN-Werte zu vermeiden
                            const startTimeParts = processedSlot.start_time.split(':');
                            const endTimeParts = processedSlot.end_time.split(':');
                            
                            // Prüfe, ob die Zeitteile gültige Zahlen sind
                            if (startTimeParts.length === 2 && 
                                !isNaN(Number(startTimeParts[0])) && 
                                !isNaN(Number(startTimeParts[1])) &&
                                endTimeParts.length === 2 && 
                                !isNaN(Number(endTimeParts[0])) && 
                                !isNaN(Number(endTimeParts[1]))) {
                                
                                processedSlot.display = `${processedSlot.start_time}-${processedSlot.end_time}`;
                            } else {
                                // Fallback für ungültige Zeitformate
                                processedSlot.display = slot.display || 'Ungültige Zeit';
                            }
                        } else {
                            processedSlot.display = slot.display || processedSlot.start_time || 'Ungültige Zeit';
                        }
                        
                        // Übernehme alle anderen Felder vom originalen Slot
                        return {
                            ...slot,
                            ...processedSlot
                        };
                    });
                    
                    // Dedupliziere Slots mit gleichen Zeiten
                    const uniqueSlots = deduplicateSlots(processedSlots);
                    setAvailableSlots(uniqueSlots);
                    setSelectedSlot(null);
                } else {
                    // Wenn keine Slots gefunden wurden und das Datum nicht in der Zukunft liegt
                    setAvailableSlots([]);
                }
            } catch (apiError) {
                // Detailliertere Fehlerinformationen
                if (apiError.response) {
                    // Bei 401, 404, 500 oder anderen Fehlern verwenden wir Mock-Daten
                    const usesMockData = [401, 404, 500].includes(apiError.response.status);
                    
                    if (usesMockData) {
                        // Bei Unautorisiert (401), Nicht gefunden (404) oder Server-Fehler (500) verwenden wir Mock-Daten
                        const mockTimeSlots = generateMockTimeSlots(date);
                        setAvailableSlots(mockTimeSlots);
                        
                        // Informiere den Nutzer über die Verwendung von Mock-Daten (kleine Info-Meldung)
                        setError(`API nicht verfügbar (Status ${apiError.response.status}) - verwende Demo-Daten zur Anzeige. Im Live-System würden hier echte Verfügbarkeiten angezeigt.`);
                    } else {
                        setError(`Die verfügbaren Zeitfenster konnten nicht geladen werden. (Status: ${apiError.response.status})`);
                    }
                } else if (apiError.request) {
                    // Wenn keine Antwort erhalten wurde (z.B. CORS-Fehler oder keine Netzwerkverbindung)
                    const mockTimeSlots = generateMockTimeSlots(date);
                    setAvailableSlots(mockTimeSlots);
                    setError("Keine Verbindung zum Server möglich - verwende Demo-Daten.");
                } else {
                    // Wenn ein allgemeiner Netzwerkfehler oder ein anderer unbekannter Fehler vorliegt
                    const mockTimeSlots = generateMockTimeSlots(date);
                    setAvailableSlots(mockTimeSlots);
                    setError(`Verbindungsproblem: ${apiError.message || 'Unbekannter Fehler'} - verwende Demo-Daten.`);
                }
            }
        } catch (error) {
            setError(error.message || 'Ein unerwarteter Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };
    
    // Hilfsfunktion zum Generieren von Mock-Daten für Zeitfenster, wenn die API nicht verfügbar ist
    const generateMockTimeSlots = (date) => {
        const slots = [];
        
        // Validiere das Datum
        if (!date) {
            return [];
        }
        
        // Stelle sicher, dass das Datum das richtige Format hat
        const slotDate = date;
        
        // Generiere Zeitslots von 9:00 bis 17:00 Uhr in 30-Minuten-Intervallen
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const startHour = `${hour}`.padStart(2, '0');
                const startMinute = `${minute}`.padStart(2, '0');
                const endHour = minute === 30 ? `${hour + 1}`.padStart(2, '0') : startHour;
                const endMinute = minute === 30 ? '00' : '30';
                
                // Stelle sicher, dass die Zeiten korrekt formatiert sind
                const startTime = `${startHour}:${startMinute}`;
                const endTime = `${endHour}:${endMinute}`;
                const displayTime = `${startTime}-${endTime}`;
                
                // Bestimme zufällig den Status des Slots für Demo-Zwecke
                // Damit werden verschiedene Status-Typen generiert, nicht nur 'available'
                const statuses = ['available', 'booked', 'blocked', 'tentative', 'past'];
                const randomStatus = statuses[Math.floor(Math.random() * (statuses.length))]; 
                
                slots.push({
                    id: `${slotDate}-${startHour}${startMinute}`,
                    date: slotDate,
                    start_time: startTime,
                    end_time: endTime,
                    status: randomStatus,
                    is_selectable: randomStatus === 'available',
                    display: displayTime,
                    bookings_id: randomStatus === 'booked' ? Math.floor(Math.random() * 1000) : null
                });
            }
        }
        return slots;
    };
    
    // Hilfsfunktion zum Generieren von Standard-Zeitslots für einen Tag
    const generateDefaultTimeSlots = (date) => {
        const slots = [];
        
        console.log('Generiere Standard-Slots für Datum:', date);
        
        // Generiere Zeitslots von 9:00 bis 17:00 Uhr in 30-Minuten-Intervallen
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const startHour = `${hour}`.padStart(2, '0');
                const startMinute = `${minute}`.padStart(2, '0');
                const endHour = minute === 30 ? `${hour + 1}`.padStart(2, '0') : startHour;
                const endMinute = minute === 30 ? '00' : '30';
                
                // Stelle sicher, dass die Zeiten korrekt formatiert sind
                const startTime = `${startHour}:${startMinute}`;
                const endTime = `${endHour}:${endMinute}`;
                const displayTime = `${startTime}-${endTime}`;
                
                // Erstelle eine eindeutige ID für jeden Slot
                const slotId = `default-${date}-${startHour}${startMinute}`;
                
                slots.push({
                    id: slotId,
                    date: date,
                    start_time: startTime,
                    end_time: endTime,
                    status: 'available',
                    is_selectable: true,
                    display: displayTime,
                    bookings_id: null,
                    barber_id: bookingDetails.barber?.id
                });
            }
        }
        
        console.log('Generierte Standard-Slots:', slots);
        return slots;
    };
    
    const handleTimeSelect = (slot) => {
        setSelectedSlot(slot);
        
        // Extract date and time from the slot object
        const date = slot.date;
        
        // Stelle sicher, dass die Zeit im Format HH:MM vorliegt
        let startTime = slot.start_time;
        
        // Debug-Ausgabe
        console.log("Ursprüngliche Slot-Daten:", slot);
        
        // Validiere und korrigiere das Zeitformat
        if (startTime) {
            // Wenn es nur eine Zahl ist (z.B. "20" oder "10")
            if (!startTime.includes(':')) {
                const timeValue = parseInt(startTime, 10);
                if (!isNaN(timeValue)) {
                    console.log("Einfacher Zahlenwert erkannt:", timeValue);
                    
                    // Wenn der Wert < 24 ist, interpretiere ihn als Stunde
                    if (timeValue < 24) {
                        startTime = `${String(timeValue).padStart(2, '0')}:00`;
                    } else {
                        // Für den unwahrscheinlichen Fall, dass der Wert > 24 ist
                        startTime = `09:${String(timeValue % 60).padStart(2, '0')}`;
                    }
                    console.log("Korrigiert zu HH:MM Format:", startTime);
                }
            } else {
                // Stelle sicher, dass das Format korrekt ist (HH:MM)
                const [hours, minutes] = startTime.split(':');
                startTime = `${String(parseInt(hours, 10)).padStart(2, '0')}:${String(parseInt(minutes, 10)).padStart(2, '0')}`;
            }
        } else if (slot.time) {
            // Fallback, wenn start_time nicht existiert, aber time verfügbar ist
            startTime = slot.time;
            
            // Auch hier gleiche Prüfungen durchführen
            if (!startTime.includes(':')) {
                const timeValue = parseInt(startTime, 10);
                if (!isNaN(timeValue)) {
                    console.log("Zeit aus 'time' korrigiert:", timeValue);
                    
                    if (timeValue < 24) {
                        startTime = `${String(timeValue).padStart(2, '0')}:00`;
                    } else {
                        startTime = `09:${String(timeValue % 60).padStart(2, '0')}`;
                    }
                }
            } else {
                const [hours, minutes] = startTime.split(':');
                startTime = `${String(parseInt(hours, 10)).padStart(2, '0')}:${String(parseInt(minutes, 10)).padStart(2, '0')}`;
            }
        }
        
        console.log("Ausgewählter Slot:", slot);
        console.log("Korrigierte Startzeit:", startTime);
        
        // Save to SalonContext - Verwende setAppointment
        if (setAppointment) {
            setAppointment({
                date: date,
                time: startTime // Verwende die korrigierte Startzeit
            });
        }
        
        // Save to BookingContext with the corrected time format
        if (setBookingDetails) {
            setBookingDetails(prev => ({
                ...prev,
                date: date,
                time: startTime,  // Verwende die korrigierte Startzeit
                selectedSlot: slot
            }));
        }
        
        // Update Context daten für den nächsten Schritt
        updateReservationStatus('pending');
    };
    
    const handleProceedToCustomerInfo = () => {
        if (selectedSlot) {
            navigate('/customer-info');
        } else {
            setError('Bitte wählen Sie einen Termin aus.');
        }
    };

  const handleBack = () => {
    navigate(-1);
  };

    return (
        <div className="booking-page">
            <BusinessHeader />
            
            {/* Error message for inactive business */}
            {business && !isBusinessActive() && (
                <Container className="mt-3">
                    <Alert variant="warning">
                        <strong>Hinweis:</strong> Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.
                    </Alert>
                </Container>
            )}
            
            <div style={styles.header}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col md={8}>
                            <h1 style={styles.heroText} className="display-5 mb-2">
                                Terminbuchung
                            </h1>
                            <p className="lead mb-0">
                                Wählen Sie einen passenden Termin für Ihren Besuch
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>
            
            <Container className="my-3" fluid style={{maxWidth: '1400px'}}>
                <Row className="justify-content-center">
                    <Col xl={12} lg={12}>
                        {/* Buchungszusammenfassung mit Reservierungsstatus */}
                        <Card style={styles.summaryCard} className="mb-4">
                            <Card.Header style={styles.cardHeader}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="m-0">Ihre Buchung</h3>
                                    {bookingDetails.reservation_status && (
                                        <span className={`badge ${getStatusBadgeVariant(bookingDetails.reservation_status)}`} style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}>
                                            {getStatusLabel(bookingDetails.reservation_status)}
                                        </span>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body style={styles.cardBody}>
                                {/* Erste Zeile mit drei gleichen Spalten */}
                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                    <div style={{flex: '1 1 33.33%', minWidth: '200px', padding: '0 10px 10px 0'}}>
                                        <div style={styles.summaryItem}>
                                            <h4 style={styles.summaryTitle}>Salon</h4>
                                            <p style={styles.summaryValue}>{business?.name || 'Nicht ausgewählt'}</p>
                                        </div>
                                    </div>
                                    <div style={{flex: '1 1 33.33%', minWidth: '200px', padding: '0 10px 10px 0'}}>
                                        <div style={styles.summaryItem}>
                                            <h4 style={styles.summaryTitle}>Stylist</h4>
                                            <p style={styles.summaryValue}>{bookingDetails.barber?.name || selectedCoiffeur || 'Nicht ausgewählt'}</p>
                                        </div>
                                    </div>
                                    <div style={{flex: '1 1 33.33%', minWidth: '200px', padding: '0 0 10px 0'}}>
                                        <div style={styles.summaryItem}>
                                            <h4 style={styles.summaryTitle}>Termin</h4>
                                            <p style={styles.summaryValue}>
                                                {bookingDetails.date && bookingDetails.time ? 
                                                    `${formatDate(bookingDetails.date)} um ${bookingDetails.time} Uhr` : 
                                                    'Nicht ausgewählt'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Zweite Zeile mit Dienstleistungen */}
                                <div>
                                    <div style={styles.summaryItem}>
                                        <h4 style={styles.summaryTitle}>Dienstleistungen</h4>
                                        {services.length > 0 ? (
                                            <div className="selected-services-list mt-2" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '5px'}}>
                                                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px'}}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666'}}>Dienstleistung</th>
                                                            <th style={{textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666'}}>Dauer</th>
                                                            <th style={{textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666'}}>Preis</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {services.map((service, index) => (
                                                            <tr key={service.id || index} style={{
                                                                backgroundColor: '#f8f9fa',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                            }}>
                                                                <td style={{padding: '10px', borderRadius: '8px 0 0 8px'}}>
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={styles.cardIcon}>
                                                                            <FaCut />
                                                                        </div>
                                                                        <span className="fw-bold" style={{fontSize: '0.9rem'}}>{service.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{padding: '10px', textAlign: 'center'}}>
                                                                    <span style={{
                                                                        backgroundColor: '#f0f0f0',
                                                                        color: '#555',
                                                                        padding: '0.4rem 0.8rem',
                                                                        borderRadius: '20px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        fontWeight: 'normal'
                                                                    }}>
                                                                        <FaClock className="me-2 text-muted" />
                                                                        {service.duration} Min.
                                                                    </span>
                                                                </td>
                                                                <td style={{padding: '10px', textAlign: 'right', borderRadius: '0 8px 8px 0', fontWeight: 'bold'}}>
                                                                    <span style={{
                                                                        fontSize: '1.3rem',
                                                                        fontWeight: 'bold',
                                                                        color: '#7DB561',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#f8f9fa',
                                                                        padding: '0.4rem 0.8rem',
                                                                        borderRadius: '20px',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {service.price} <span style={{marginLeft: '4px', fontSize: '0.8rem'}}>Fr</span>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan="3" style={{padding: '15px 0 5px', borderTop: '1px solid #eee'}}></td>
                                                        </tr>
                                                        <tr style={{backgroundColor: '#f0f7f0', borderRadius: '8px', fontSize: '1.1rem'}}>
                                                            <td style={{textAlign: 'left', fontWeight: 'bold', padding: '12px', borderRadius: '8px 0 0 8px'}}>Gesamt:</td>
                                                            <td style={{textAlign: 'center', padding: '12px'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    color: '#60A8C1',
                                                                    fontSize: '1.1rem'
                                                                }}>
                                                                    {calculatedTotalDuration} Min.
                                                                </span>
                                                            </td>
                                                            <td style={{textAlign: 'right', padding: '12px', borderRadius: '0 8px 8px 0'}}>
                                                                <span style={{
                                                                    backgroundColor: '#7DB561',
                                                                    color: 'white',
                                                                    padding: '0.4rem 0.8rem',
                                                                    borderRadius: '20px',
                                                                    fontWeight: 'bold',
                                                                    display: 'inline-block',
                                                                    margin: '0 0.5rem',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    fontSize: '1.1rem'
                                                                }}>
                                                                    {calculatedTotalPrice.toFixed(2)} Fr
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        ) : (
                                            <p>Keine Dienstleistungen ausgewählt</p>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        {/* Terminauswahl */}
                        <Row>
                            <Col lg={12}>
                                <div style={{position: 'relative', marginBottom: '1rem'}}>
                                    <h2 style={{...styles.sectionTitle, fontSize: '1.3rem', marginBottom: '1rem'}}>
                                        {selectedDate ? 
                                            `Termin auswählen für ${selectedDate.toLocaleDateString('de-DE')}` : 
                                            'Termin auswählen'}
                                    </h2>
                                    <div style={styles.sectionTitleUnderline}></div>
                                </div>
                                
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col lg={5} md={12}>
                                <div style={styles.calendarContainer}>
                                    <div className="d-flex align-items-center mb-3">
                                        <div style={styles.iconWrapper}>
                                            <FaCalendarAlt />
                                        </div>
                                        <h3 className="mb-0" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Datum wählen</h3>
                                    </div>
                                    <div className="calendar-container">
                                        <BookingCalendar onDateSelect={handleDateSelect} />
                                    </div>
                                </div>
                            </Col>
                            
                            <Col lg={7} md={12}>
                                <div className="time-slots-container h-100" style={{
                                    ...styles.calendarContainer,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <div style={styles.iconWrapper}>
                                            <FaClock />
                                        </div>
                                        <h3 className="mb-0" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Verfügbare Zeiten</h3>
                                    </div>
                                    
                                    <div className="flex-grow-1">
                                        {loading ? (
                                            <div style={styles.loadingSpinner}>
                                                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                                                <p className="mt-3">Verfügbare Zeiten werden geladen...</p>
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <Row className="g-2">
                                                {availableSlots.map((slot, index) => {
                                                    // Status bestimmen (verwende is_selectable aus der API, wenn verfügbar)
                                                    const isSelectable = slot.is_selectable !== undefined ? slot.is_selectable : slot.status === 'available';
                                                    
                                                    // Prüfe, ob der Slot in der Vergangenheit liegt
                                                    const currentDate = new Date();
                                                    const slotDate = new Date(`${slot.date}T${slot.start_time}`);
                                                    const isPast = slotDate < currentDate;
                                                    
                                                    // Vereinfachte Status-Variablen - nur prüfen ob verfügbar oder nicht
                                                    const isAvailable = isSelectable && !isPast;
                                                    
                                                    // Vereinfachte Stile - nur zwei Varianten: verfügbar (grün) oder nicht verfügbar (rot)
                                                    let slotStyle = {
                                                        ...styles.timeSlotCard,
                                                        ...(isAvailable ? styles.availableTimeSlot : styles.unavailableTimeSlot),
                                                        ...(selectedSlot && selectedSlot.id === slot.id ? styles.selectedTimeSlot : {})
                                                    };
                                                    
                                                    // Bestimme das Status-Badge
                                                    let statusBadge = null;
                                                    
                                                    // Zeige nur für nicht verfügbare Slots ein Badge an
                                                    if (!isAvailable) {
                                                        let badgeText = "Nicht verfügbar";
                                                        let badgeVariant = "danger";
                                                        
                                                        // Spezifische Status-Texte basierend auf dem Status
                                                        if (slot.status === 'booked') {
                                                            badgeText = "Gebucht";
                                                        } else if (slot.status === 'blocked') {
                                                            badgeText = "Blockiert";
                                                            
                                                            // Spezifische Anzeige für verschiedene Typen
                                                            if (slot.type) {
                                                                switch(slot.type.toLowerCase()) {
                                                                    case 'pause':
                                                                        badgeText = "Pause";
                                                                        break;
                                                                    case 'krank':
                                                                        badgeText = "Krank";
                                                                        break;
                                                                    case 'termin':
                                                                        badgeText = "Termin";
                                                                        break;
                                                                    case 'ferien':
                                                                        badgeText = "Ferien";
                                                                        break;
                                                                }
                                                            }
                                                        } else if (slot.status === 'tentative') {
                                                            badgeText = "Reserviert";
                                                            badgeVariant = "warning";
                                                        } else if (isPast) {
                                                            badgeText = "Vergangen";
                                                            badgeVariant = "dark";
                                                        }
                                                        
                                                        statusBadge = <Badge bg={badgeVariant} pill>{badgeText}</Badge>;
                                                    }

  return (
                                                        <Col key={index} xs={6} md={4} xl={3} className="mb-2">
                                                            <div 
                                                                className={`time-slot ${!isAvailable ? 'disabled' : ''} ${selectedSlot && selectedSlot.id === slot.id ? 'selected' : ''}`}
                                                                style={slotStyle}
                                                                onClick={isAvailable ? () => handleTimeSelect(slot) : undefined}
                                                            >
                                                                <div className="time-slot-content">
                                                                    <span className="time-display">
                                                                        {slot.display || `${slot.start_time}-${slot.end_time}`}
                                                                    </span>
                                                                    
                                                                    {statusBadge && (
                                                                        <div className="status-badge mt-1">
                                                                            {statusBadge}
              </div>
                                                                    )}
                                                                    
                                                                    {selectedSlot && selectedSlot.id === slot.id && (
                                                                        <div className="selected-indicator">
                                                                            <FaCheck style={{color: '#7DB561'}} />
                </div>
                                                                    )}
              </div>
                                                            </div>
                                                        </Col>
                                                    );
                                                })}
                                            </Row>
                                        ) : (
                                            <Alert variant="info">
                                                {!selectedDate ? 
                                                    'Bitte wählen Sie ein Datum aus, um verfügbare Zeiten zu sehen.' : 
                                                    'Für diesen Tag sind keine Termine verfügbar. Bitte wählen Sie ein anderes Datum.'
                                                }
                                            </Alert>
                                        )}
            </div>
          </div>
                            </Col>
                        </Row>
                        
                        <div style={{...styles.navButtons, marginTop: '2rem', marginBottom: '1rem'}}>
                            <Button 
                                variant="outline-secondary"
              onClick={handleBack}
            >
                                <FaArrowLeft className="me-2" />
                                Zurück
                            </Button>
                            
                            <Button 
                                style={styles.primaryButton}
                                disabled={!selectedSlot || (business && !isBusinessActive())}
                                onClick={handleProceedToCustomerInfo}
                            >
                                Weiter zu Ihren Daten <FaArrowRight className="ms-2" />
                            </Button>
          </div>
                    </Col>
                </Row>
            </Container>
    </div>
  );
}

// Helper-Funktionen für die Statusanzeige
function getStatusBadgeVariant(status) {
    switch (status) {
        case 'pending':
            return 'bg-warning text-dark';
        case 'confirmed':
            return 'bg-success';
        case 'completed':
            return 'bg-info';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'pending':
            return 'Ausstehend';
        case 'confirmed':
            return 'Bestätigt';
        case 'completed':
            return 'Abgeschlossen';
        case 'cancelled':
            return 'Storniert';
        default:
            return 'Unbekannt';
    }
}

// Hilfsfunktion zum Formatieren des Datums
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default BookingPage;