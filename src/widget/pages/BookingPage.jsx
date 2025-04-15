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
                
                // Extrahiere Slots aus der API-Antwort, unabhängig von der Struktur
                let slots = [];
                
                // Spezifisch für die Struktur: response.data.data.data
                if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
                    slots = response.data.data.data;
                } else if (Array.isArray(response.data)) {
                    // API gibt direkt ein Array zurück
                    slots = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // API gibt ein Objekt zurück
                    if (Array.isArray(response.data.data)) {
                        // Standard Laravel Resource-Format: { data: [...] }
                        slots = response.data.data;
                    } else if (response.data.timeslots && Array.isArray(response.data.timeslots)) {
                        // Format: { timeslots: [...] }
                        slots = response.data.timeslots;
                    } else if (response.data.slots && Array.isArray(response.data.slots)) {
                        // Format: { slots: [...] }
                        slots = response.data.slots;
                    } else if (response.data.available && Array.isArray(response.data.available)) {
                        // Format: { available: [...] }
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
                
                // Stelle sicher, dass jeder Slot die erforderlichen Felder hat
                if (slots.length > 0) {
                    // Filtere die Slots, um nur die des ausgewählten Datums anzuzeigen
                    const filteredSlots = slots.filter(slot => slot.date === date);
                    
                    const processedSlots = filteredSlots.map(slot => {
                        // Ermittle Ende-Zeit basierend auf der Start-Zeit (mit 30 Minuten Unterschied)
                        let endTime = '';
                        if (slot.time) {
                            const [hours, minutes] = slot.time.split(':').map(Number);
                            let endHours = hours;
                            let endMinutes = minutes + 30;
                            
                            if (endMinutes >= 60) {
                                endHours += 1;
                                endMinutes -= 60;
                            }
                            
                            endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                        }
                        
                        // Bestimme detaillierten Status basierend auf allen verfügbaren Informationen
                        let status = 'available';
                        
                        // Wenn bookings_id vorhanden ist, ist der Slot gebucht
                        if (slot.bookings_id !== null) {
                            status = 'booked';
                        }
                        
                        // Wenn ein expliziter Status in der API-Antwort vorhanden ist, verwende diesen
                        if (slot.status) {
                            status = slot.status.toLowerCase();
                        }
                        
                        // Prüfe, ob der Slot in der Vergangenheit liegt
                        const currentDate = new Date();
                        const slotDate = new Date(`${slot.date}T${slot.time || slot.start_time}`);
                        const isPast = slotDate < currentDate;
                        
                        if (isPast) {
                            status = 'past';
                        }
                        
                        // Erstelle ein standardisiertes Slot-Objekt mit sicheren Fallback-Werten
                        const processedSlot = {
                            id: slot.id || `slot-${Math.random().toString(36).substr(2, 9)}`,
                            date: slot.date || date,
                            start_time: slot.time || slot.start_time || '',
                            end_time: endTime || slot.end_time || '',
                            status: status,
                            barber_id: slot.barber_id || barberId,
                            bookings_id: slot.bookings_id,
                            all_day: slot.all_day || false
                        };
                        
                        // Generiere eine leserliche Anzeige für die UI
                        processedSlot.display = 
                            (processedSlot.start_time && processedSlot.end_time) 
                                ? `${processedSlot.start_time}-${processedSlot.end_time}`
                                : slot.display || processedSlot.start_time || '';
                        
                        // Übernehme alle anderen Felder vom originalen Slot
                        return {
                            ...slot,
                            ...processedSlot
                        };
                    });
                    
                    setAvailableSlots(processedSlots);
                    setSelectedSlot(null); // Zurücksetzen der aktuellen Auswahl
                } else {
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
                
                // Bestimme zufällig den Status des Slots für Demo-Zwecke
                // Damit werden verschiedene Status-Typen generiert, nicht nur 'available'
                const statuses = ['available', 'booked', 'blocked', 'tentative', 'past'];
                const randomStatus = statuses[Math.floor(Math.random() * (statuses.length))]; 
                
                slots.push({
                    id: `${slotDate}-${startHour}${startMinute}`,
                    date: slotDate,
                    start_time: `${startHour}:${startMinute}`,
                    end_time: `${endHour}:${endMinute}`,
                    status: randomStatus,
                    is_selectable: randomStatus === 'available',
                    display: `${startHour}:${startMinute}-${endHour}:${endMinute}`,
                    bookings_id: randomStatus === 'booked' ? Math.floor(Math.random() * 1000) : null
                });
            }
        }
        return slots;
    };
    
    const handleTimeSelect = (slot) => {
        setSelectedSlot(slot);
        
        // Extract date and time from the slot object
        const date = slot.date;
        const startTime = slot.start_time;
        
        // Save to SalonContext - Verwende setAppointment
        if (setAppointment) {
            setAppointment({
                date: date,
                time: startTime
            });
        }
        
        // Save to BookingContext - now with selectedSlot
        if (setBookingDetails) {
            setBookingDetails((prev) => ({
                ...prev,
                date: date,
                time: startTime,
                selectedSlot: slot,
                reservation_status: 'pending'
            }));
        }
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
                                                    const isAvailable = slot.status === 'available' && !isPast;
                                                    
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
                                                {availableSlots.length === 0 && !loading ? 
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