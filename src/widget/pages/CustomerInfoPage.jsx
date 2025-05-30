import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSalonContext } from "../context/SalonContext";
import { useBusinessContext } from "../context/BusinessContext";
import { BookingContext } from "../context/BookingContext";
import BusinessHeader from "../components/BusinessHeader";
import { Container, Row, Col, Form, Button, Alert, Card, Badge, Tabs, Tab } from "react-bootstrap";
import { FaClock, FaCut, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import config from "../../dashboard/config";

const BASE_URL = config.backendUrl;

// Inline-Stile für die konsistente Darstellung
const styles = {
  cardHeader: {
    backgroundImage: 'linear-gradient(to right, #7DB561, #60A8C1)',
    color: 'white',
    padding: '0.8rem 1.2rem',
    fontWeight: 'bold'
  },
  summaryCard: {
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    height: 'auto',
    marginBottom: '1rem',
    width: '100%'
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
  },
  priceTag: {
    backgroundColor: '#7DB561',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    display: 'inline-block',
    margin: '0 0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '1.1rem'
  }
};

// Hilfsfunktion zum Normalisieren der Zeitformate
function normalizeTimeFormat(timeString) {
    if (!timeString) return null;
    
    // Wenn es bereits im HH:MM Format ist
    if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    // Wenn es eine einfache Zahl ist (z.B. "20" oder "9")
    const hours = parseInt(timeString, 10);
    if (!isNaN(hours) && hours >= 0 && hours < 24) {
        return `${String(hours).padStart(2, '0')}:00`;
    }
    
    // Falls kein gültiges Format erkannt wurde
    console.warn(`Ungültiges Zeitformat: ${timeString}`);
    return null;
}

function CustomerInfoPage() {
    const navigate = useNavigate();
    const { selectedCoiffeur, selectedServices, selectedDate, selectedTime } = useSalonContext();
    const { business, isBusinessActive } = useBusinessContext();
    const { bookingDetails, setBookingDetails, updateReservationStatus, totalDuration, totalPrice } = useContext(BookingContext);
    
    // Tab state
    const [activeTab, setActiveTab] = useState('login');
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        notes: ""
    });
    
    // Login form state
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    
    const [validated, setValidated] = useState(false);
    const [loginValidated, setLoginValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Service calculation directly from bookingContext
    const services = bookingDetails.services || [];
    
    useEffect(() => {
        // Check if we have the necessary data to proceed
        if (!bookingDetails.barber || services.length === 0 || !bookingDetails.date || !bookingDetails.time) {
            // Redirect back if missing data
            navigate(`/booking`);
            return;
        }
        
        // Check if business is active
        if (business && !isBusinessActive()) {
            setError('Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.');
            return;
        }
        
        // Load existing customer info from bookingContext if available
        if (bookingDetails.customer) {
            setFormData({
                firstName: bookingDetails.customer.firstName || "",
                lastName: bookingDetails.customer.lastName || "",
                email: bookingDetails.customer.email || "",
                phone: bookingDetails.customer.phone || "",
                password: "",
                confirmPassword: "",
                notes: bookingDetails.customer.notes || ""
            });
            
            setLoginData({
                email: bookingDetails.customer.email || "",
                password: ""
            });
        }
    }, [business, bookingDetails, services, navigate, isBusinessActive]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        });
    };
       
    const handleLogin = async (e) => {
        e.preventDefault();
        
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setLoginValidated(true);
            return;
        }
        
        setLoginValidated(true);
        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Login-Anfrage - Authentifizierung
            const companyId = String(bookingDetails.business?.key || business?.key || "7");
            console.log('Verwende key für Login:', bookingDetails);
            
            // Login-Anfrage ausführen
            const authResponse = await axios.post(
                `${BASE_URL}/auth/login`,
                {
                    email: loginData.email,
                    password: loginData.password,
                    key: companyId
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Login-Antwort:', authResponse.data);
            
            // Prüfen, ob die Authentifizierung erfolgreich war
            if (!authResponse.data || !authResponse.data.status) {
                setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.');
                setLoading(false);
                return;
            }
            
            // Step 2: Benutzerinformationen und Token extrahieren
            const user = authResponse.data.user || {};
            const token = authResponse.data.token || authResponse.data.access_token;
            
            if (!token) {
                setError('Authentifizierungsfehler: Kein Token erhalten.');
                setLoading(false);
                return;
            }
            
            // Token im localStorage speichern für zukünftige Anfragen
            localStorage.setItem('auth_token', token);
            
            // Update reservation status
            updateReservationStatus('pending');
            
            // Kundeninformationen aus der Antwort erstellen
            const customerInfo = {
                firstName: user.first_name || user.firstName || "Angemeldeter",
                lastName: user.last_name || user.lastName || "Kunde",
                email: user.email || loginData.email,
                phone: user.phone || "",
                notes: ""
            };
            
            // Speichere Kundeninformationen im BookingContext
            if (setBookingDetails) {
                setBookingDetails((prev) => ({
                    ...prev,
                    customer: customerInfo
                }));
            }
            
            // Step 3: Berechne die erforderlichen Zeitslots
            const totalDurationMinutes = bookingDetails.totalDuration || totalDuration;
            const requiredSlots = Math.ceil(totalDurationMinutes / 30);
            console.log(`Erforderliche Slots für ${totalDurationMinutes} Minuten: ${requiredSlots}`);
            
            // Berechne die Zeiten für jeden Slot
            const slotTimes = [];
            // Extrahiere die Startzeit und normalisiere sie
            let startTime = bookingDetails.time;
            startTime = normalizeTimeFormat(startTime);
            console.log("Normalisierte Startzeit:", startTime);
            
            if (!startTime) {
                throw new Error('Ungültiges Zeitformat für die Buchung');
            }
            
            // Stelle sicher, dass die Startzeit im Format HH:MM ist
            let [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
            
            // Log zur Fehlersuche
            console.log("Startzeit-Komponenten:", { hours, minutes });
            
            for (let i = 0; i < requiredSlots; i++) {
                // Aktuelle Zeit als Slot hinzufügen
                const currentHours = hours + Math.floor((minutes + (i * 30)) / 60);
                const currentMinutes = (minutes + (i * 30)) % 60;
                
                const slotTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
                slotTimes.push(slotTime);
                console.log(`Slot ${i+1} Zeit: ${slotTime}`);
            }
            
            console.log("Berechnete Slot-Zeiten:", slotTimes);
            
            // Step 4: Erstelle eine einzige Buchung mit allen Zeitslots
            const totalPrice = services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
            
            // Erstelle das Booking-Objekt mit der Gesamtdauer
            const bookingData = {
                businesses_id: bookingDetails.business?.id || business?.id,
                employees_id: bookingDetails.barber?.id,
                client_id: user.id,
                date: bookingDetails.date,
                startTime: startTime, // Verwende die normalisierte Startzeit
                end_time: requiredSlots > 1 ? slotTimes[requiredSlots - 1] : "", // Endzeit des letzten Slots
                total_time: totalDurationMinutes,
                total_price: totalPrice
            };
            
            // Erstelle einen Service-Eintrag für jeden Slot und die Timeslots
            const slotServices = [];
            const timeslots = [];

            for (let i = 0; i < requiredSlots; i++) {
                // Service für jeden Slot
                slotServices.push({
                    id: services[0].id,
                    name: i === 0 ? `Kombinierte Dienstleistungen (${services.length})` : `Slot ${i+1}/${requiredSlots}`,
                    price: i === 0 ? totalPrice : 0, // Nur der erste Slot erhält den Gesamtpreis
                    duration: 30,
                    time: slotTimes[i] // Zeit für jeden Service
                });
                
                // Timeslot für jeden Slot
                timeslots.push({
                    date: bookingDetails.date,
                    time: slotTimes[i], // Verwende die korrekte Zeit für diesen Slot
                    barber_id: bookingDetails.barber?.id,
                    slot_index: i
                });
            }

            console.log("Berechnete Zeitslots:", timeslots);
            console.log("Berechnete Serviceslots:", slotServices);

            // Payload für einen einzigen API-Aufruf mit allen Informationen
            const payload = {
                booking: bookingData,
                updatedResList: slotServices, // Services für jeden Slot
                timeslots: timeslots, // Alle Zeitslots mit korrekten Zeiten
                multipleSlots: requiredSlots > 1,
                totalSlots: requiredSlots,
                createSingleBooking: true // Hinweis für das Backend, nur eine Buchung zu erstellen
            };
            
            console.log("Sende Buchungsanfrage mit allen Slots:", payload);
            
            // Standardheader mit Authentifizierungstoken
            const authHeaders = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            
            // Ein einziger API-Aufruf mit allen Slots
            const response = await axios.post(
                `${BASE_URL}/addBooking`,
                payload,
                { headers: authHeaders }
            );
            
            console.log('Buchung Antwort:', response.data);
            
            if (response.data) {
                setSuccess(true);
                updateReservationStatus('confirmed');
                
                // Booking-ID für die Bestätigungsseite
                const bookingId = response.data.id || Math.floor(Math.random() * 1000) + 1;
                
                if (setBookingDetails) {
                    setBookingDetails((prev) => ({
                        ...prev,
                        booking_id: bookingId
                    }));
                }
                
                // Zur Bestätigungsseite navigieren
                navigate('/confirmation');
            } else {
                setError('Die Buchung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
            }
        } catch (error) {
            console.error('Fehler beim Login oder der Buchung:', error);
            
            // Detaillierte Fehlermeldung je nach Fehlertyp
            if (error.response) {
                if (error.response.status === 401) {
                    setError('Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.');
                } else if (error.response.data && error.response.data.message) {
                    setError(`Fehler: ${error.response.data.message}`);
                } else {
                    setError(`Fehler bei der Anmeldung (${error.response.status}). Bitte versuchen Sie es später erneut.`);
                }
            } else if (error.request) {
                setError('Keine Antwort vom Server erhalten. Bitte überprüfen Sie Ihre Internetverbindung.');
            } else {
                setError('Die Anmeldung konnte nicht abgeschlossen werden. Bitte überprüfen Sie Ihre Daten und versuchen Sie es erneut.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    function extractTime(str) {
        const timePattern = /\b(\d{1,2}:\d{2})\b/;
        const match = str.match(timePattern);
        if (match) {
            return match[0]; // Gibt das erste gefundene Zeitformat zurück
        } else {
            return "Keine Zeit gefunden";
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validierung des Formulars
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Die Passwörter stimmen nicht überein');
            }

            // Überprüfen, ob business und barber vorhanden sind
            if (!bookingDetails.business?.id && !business?.id) {
                throw new Error('Kein Salon ausgewählt');
            }

            if (!bookingDetails.barber?.id) {
                throw new Error('Kein Friseur ausgewählt');
            }

            // Debug-Logging für die IDs
            console.log('Business ID:', bookingDetails.business?.id || business?.id);
            console.log('Barber ID:', bookingDetails.barber?.id);

            // Step 1: Registrierung durchführen
            const registrationData = {
                name: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                signature: formData.notes || 'Keine Anmerkungen',
                password: formData.password,
                password_confirmation: formData.confirmPassword,
                photo: 'default.jpg',
                addresses_id: '',
                role: 'client',
                businesses_id: String(bookingDetails.business?.id || business?.id),
                employees_id: String(bookingDetails.barber?.id)
            };

            console.log('Registrierungsdaten:', registrationData);

            // API-Aufruf zur Registrierung
            const response = await axios.post(`${BASE_URL}/auth/register`, registrationData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Registrierung Antwort:', response.data);

            if (response.data.status) {
                setSuccess(true);
                
                // Step 2: Benutzerinformationen und Token extrahieren
                const user = response.data.user || {};
                const token = response.data.token || response.data.access_token;
                
                if (!token && user.id) {
                    console.warn('Kein Token in der Registrierungsantwort, aber Benutzer-ID vorhanden.');
                }
                
                // Token speichern, falls vorhanden
                if (token) {
                    localStorage.setItem('auth_token', token);
                }
                
                // Step 3: Berechne die erforderlichen Zeitslots
                const totalDurationMinutes = bookingDetails.totalDuration || totalDuration;
                const requiredSlots = Math.ceil(totalDurationMinutes / 30);
                console.log(`Erforderliche Slots für ${totalDurationMinutes} Minuten: ${requiredSlots}`);
                
                // Berechne die Zeiten für jeden Slot
                const slotTimes = [];
                // Extrahiere die Startzeit und normalisiere sie
                let startTime = bookingDetails.time;
                startTime = normalizeTimeFormat(startTime);
                console.log("Normalisierte Startzeit (Registrierung):", startTime);
                
                if (!startTime) {
                    throw new Error('Ungültiges Zeitformat für die Buchung');
                }
                
                // Stelle sicher, dass die Startzeit im Format HH:MM ist
                let [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
                
                // Log zur Fehlersuche
                console.log("Startzeit-Komponenten (Registrierung):", { hours, minutes });
                
                for (let i = 0; i < requiredSlots; i++) {
                    // Aktuelle Zeit als Slot hinzufügen - Berechnung direkt basierend auf der Startzeit
                    const currentHours = hours + Math.floor((minutes + (i * 30)) / 60);
                    const currentMinutes = (minutes + (i * 30)) % 60;
                    
                    const slotTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
                    slotTimes.push(slotTime);
                    console.log(`Slot ${i+1} Zeit (Registrierung): ${slotTime}`);
                }
                
                console.log("Berechnete Slot-Zeiten (Registrierung):", slotTimes);
                
                // Step 4: Erstelle eine einzige Buchung mit allen Zeitslots
                const totalPrice = services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
                
                // Erstelle das Booking-Objekt mit der Gesamtdauer
                const bookingData = {
                    businesses_id: bookingDetails.business?.id || business?.id,
                    employees_id: bookingDetails.barber?.id,
                    client_id: user.id,
                    date: bookingDetails.date,
                    startTime: startTime, // Verwende die normalisierte Startzeit
                    end_time: requiredSlots > 1 ? slotTimes[requiredSlots - 1] : "", // Endzeit des letzten Slots
                    total_time: totalDurationMinutes,
                    total_price: totalPrice
                };
                
                // Erstelle einen Service-Eintrag für jeden Slot
                const slotServices = [];
                const timeslots = [];

                for (let i = 0; i < requiredSlots; i++) {
                    // Service für jeden Slot
                    slotServices.push({
                        id: services[0].id,
                        name: i === 0 ? `Kombinierte Dienstleistungen (${services.length})` : `Slot ${i+1}/${requiredSlots}`,
                        price: i === 0 ? totalPrice : 0, // Nur der erste Slot erhält den Gesamtpreis
                        duration: 30,
                        time: slotTimes[i] // Zeit für jeden Service
                    });
                    
                    // Timeslot für jeden Slot
                    timeslots.push({
                        date: bookingDetails.date,
                        time: slotTimes[i], // Verwende die korrekte Zeit für diesen Slot
                        barber_id: bookingDetails.barber?.id,
                        slot_index: i
                    });
                }

                console.log("Berechnete Zeitslots (Registrierung):", timeslots);
                console.log("Berechnete Serviceslots (Registrierung):", slotServices);

                // Payload für einen einzigen API-Aufruf mit allen Informationen
                const payload = {
                    booking: bookingData,
                    updatedResList: slotServices, // Services für jeden Slot
                    timeslots: timeslots, // Alle Zeitslots mit korrekten Zeiten
                    multipleSlots: requiredSlots > 1,
                    totalSlots: requiredSlots,
                    createSingleBooking: true // Hinweis für das Backend, nur eine Buchung zu erstellen
                };
                
                console.log("Sende Buchungsanfrage mit allen Slots (Registrierung):", payload);
                
                // Standardheader mit Authentifizierungstoken
                const authHeaders = token ? {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                } : {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
                
                // Ein einziger API-Aufruf mit allen Slots
                const bookingResponse = await axios.post(
                    `${BASE_URL}/addBooking`,
                    payload,
                    { headers: authHeaders }
                );
                
                console.log('Buchung Antwort (Registrierung):', bookingResponse.data);
                
                if (bookingResponse.data) {
                    updateReservationStatus('confirmed');
                    navigate('/confirmation');
                } else {
                    setError('Die Buchung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
                }
            } else {
                throw new Error(response.data.message || 'Registrierung fehlgeschlagen');
            }
        } catch (error) {
            console.error('Fehler bei der Registrierung:', error);
            setError(error.message || 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="customer-info-page">
            <BusinessHeader />
            
            {/* Error message for inactive business */}
            {business && !isBusinessActive() && (
                <Container className="mt-3">
                    <Alert variant="warning">
                        <strong>Hinweis:</strong> Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.
                    </Alert>
                </Container>
            )}
            
            <Container className="my-5">
                <Row>
                    <Col lg={5} className="mb-4">
                        <Card style={styles.summaryCard}>
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
                            <Card.Body style={{...styles.cardBody, height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column'}}>
                                {/* Erste Zeile mit Salon, Stylist und Termin */}
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
                                                {bookingDetails.date 
                                                    ? `${formatDate(bookingDetails.date)} um ${bookingDetails.time} Uhr` 
                                                    : 'Nicht ausgewählt'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Zweite Zeile mit Dienstleistungen */}
                                <div style={styles.summaryItem} className="flex-grow-1">
                                    <h4 style={styles.summaryTitle}>Dienstleistungen</h4>
                                    {services.length > 0 ? (
                                        <div className="selected-services-list mt-2" style={{height: 'calc(100% - 30px)', overflowY: 'scroll', paddingRight: '5px'}}>
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
                                                        <tr key={index} style={{
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
                                                                {totalDuration} Min.
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
                                                                {totalPrice.toFixed(2)} Fr
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
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={7} className="mb-4">
                        <Card style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                            <Card.Header style={styles.cardHeader}>
                                <h3 className="m-0">Deine Daten</h3>
                            </Card.Header>
                            
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="px-3 pt-3"
                            >
                                <Tab eventKey="login" title="Anmelden" />
                                <Tab eventKey="register" title="Neuer Kunde" />
                            </Tabs>
                            
                            <Card.Body style={{flex: 1, overflowY: 'auto', padding: '0.8rem 1.2rem'}}>
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}
                                
                                {success && (
                                    <Alert variant="success" className="mb-4">
                                        Ihre Buchung wurde erfolgreich übermittelt!
                                    </Alert>
                                )}
                                
                                {activeTab === 'login' && (
                                    <Form noValidate validated={loginValidated} onSubmit={handleLogin} className="py-4" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                        <div>
                                            <div className="text-center mb-4">
                                                <h4 className="mb-3" style={{fontSize: '1.4rem', fontWeight: 'bold'}}>Mit Ihrem Konto anmelden</h4>
                                                <p className="text-muted" style={{fontSize: '1rem'}}>Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein, um fortzufahren</p>
                                            </div>
                                            
                                            <Form.Group className="mb-4">
                                                <Form.Label style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>E-Mail</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={loginData.email}
                                                    onChange={handleLoginInputChange}
                                                    required
                                                    disabled={loading || success || (business && !isBusinessActive())}
                                                    size="lg"
                                                    className="py-2"
                                                    style={{fontSize: '1.1rem'}}
                                                    placeholder="ihre.email@beispiel.de"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Bitte geben Sie eine gültige E-Mail-Adresse ein.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-4">
                                                <Form.Label style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Passwort</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    value={loginData.password}
                                                    onChange={handleLoginInputChange}
                                                    required
                                                    disabled={loading || success || (business && !isBusinessActive())}
                                                    size="lg"
                                                    className="py-2"
                                                    style={{fontSize: '1.1rem'}}
                                                    placeholder="••••••••"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Bitte geben Sie Ihr Passwort ein.
                                                </Form.Control.Feedback>
                                                <div className="d-flex justify-content-end mt-2">
                                                    <a href="#" className="text-decoration-none" style={{fontSize: '1rem'}} onClick={(e) => e.preventDefault()}>
                                                        Passwort vergessen?
                                                    </a>
                                                </div>
                                            </Form.Group>
                                        </div>
                                        
                                        <div className="text-center my-3" style={{flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <p className="mb-0" style={{fontSize: '1rem'}}>Noch kein Konto? <a href="#" className="text-decoration-none" onClick={(e) => {e.preventDefault(); setActiveTab('register')}}>Jetzt registrieren</a></p>
                                        </div>
                                        
                                        <div className="mt-auto">
                                            <div className="d-grid gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    type="submit"
                                                    size="lg"
                                                    className="py-2"
                                                    style={{fontSize: '1.2rem'}}
                                                    disabled={loading || success || (business && !isBusinessActive())}
                                                >
                                                    {loading ? 'Wird angemeldet...' : 'Anmelden und Buchung abschließen'}
                                                </Button>
                                                
                                                <Button 
                                                    variant="outline-secondary" 
                                                    onClick={() => navigate('/booking')}
                                                    disabled={loading}
                                                    className="mt-2 py-2"
                                                    style={{fontSize: '1rem'}}
                                                >
                                                    Zurück
                                                </Button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                                
                                {activeTab === 'register' && (
                                    <Form noValidate validated={validated} onSubmit={handleSubmit} style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                        <div>
                                            <div className="text-center mb-4">
                                                <h4 className="mb-3" style={{fontSize: '1.4rem', fontWeight: 'bold'}}>Als neuer Kunde registrieren</h4>
                                                <p className="text-muted" style={{fontSize: '1rem'}}>Erstellen Sie ein Konto für schnellere Buchungen</p>
                                            </div>
                                            
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Vorname</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte geben Sie Ihren Vornamen ein.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nachname</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte geben Sie Ihren Nachnamen ein.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>E-Mail</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte geben Sie eine gültige E-Mail-Adresse ein.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Telefon</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte geben Sie Ihre Telefonnummer ein.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Passwort</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte geben Sie ein Passwort ein.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Passwort bestätigen</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={loading || success || (business && !isBusinessActive())}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Bitte bestätigen Sie Ihr Passwort.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Anmerkungen (optional)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    disabled={loading || success || (business && !isBusinessActive())}
                                                />
                                            </Form.Group>
                                        </div>
                                        
                                        <div className="mt-auto">
                                            <div className="d-grid gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    type="submit"
                                                    size="lg"
                                                    className="py-2"
                                                    style={{fontSize: '1.2rem'}}
                                                    disabled={loading || success || (business && !isBusinessActive())}
                                                >
                                                    {loading ? 'Wird gesendet...' : 'Registrieren und Buchung abschließen'}
                                                </Button>
                                                
                                                <Button 
                                                    variant="outline-secondary" 
                                                    onClick={() => navigate('/booking')}
                                                    disabled={loading}
                                                    className="mt-2 py-2"
                                                    style={{fontSize: '1rem'}}
                                                >
                                                    Zurück
                                                </Button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

// Hilfsfunktion zum Formatieren des Datums
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export default CustomerInfoPage; 