import '../../App.css';

import axios from "axios";
import React, { useEffect, useState, useContext, useMemo, useCallback, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import BookingSteps from '../components/BookingSteps';
import { StepsContext } from '../context/BookingStepsContext';
import { BookingContext } from '../context/BookingContext';
import { useSalonContext } from '../context/SalonContext';
// In anderen Dateien
import config from '../../dashboard/config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const initialBooking = {
    businesses_id: 1,
    employees_id: 1,
    client_id: 1,
    date: null,
    startTime: null,
    total_time: 20,
    total_price: 25,
    state: "pending"
}

const CompleteOrder = () => {
    // Kontext für Buchungsdetails
    const bookingContext = useContext(BookingContext);
    const bookingDetails = useMemo(() => {
        return bookingContext?.bookingDetails || {
            business: null,
            barber: null,
            services: [],
            date: null
        };
    }, [bookingContext]);

    // Kontext für die Buchungsschritte
    const stepsContext = useContext(StepsContext) || { steps: [], setSteps: () => {} };
    const { steps } = stepsContext;

    // Salon-Kontext für ausgewählte Services
    const { selectedServices } = useSalonContext();

    const navigate = useNavigate();
    const [booking, setBooking] = useState(initialBooking);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Lokale Kopie der Schritte für den Fall, dass steps aus dem Kontext nicht verfügbar ist
    const [localSteps, setLocalSteps] = useState([]);
    // Lokale Kopie des Mitarbeiters
    const [localBarber, setLocalBarber] = useState({ id: 2, name: "Standard", surname: "Mitarbeiter" });
    
    // Refs für die vorherigen Werte, um unnötige Updates zu vermeiden
    const prevBookingDetailsRef = useRef(null);
    const prevSelectedServicesRef = useRef(null);
    const prevStepsRef = useRef(null);
    const prevTotalPriceRef = useRef(0);
    const prevTotalTimeRef = useRef(0);
    
    // Hilfsfunktion zum tiefen Vergleich von Objekten
    const isEqual = useCallback((obj1, obj2) => {
        if (obj1 === obj2) return true;
        if (!obj1 || !obj2) return false;
        
        // Für Arrays
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            return obj1.every((item, index) => isEqual(item, obj2[index]));
        }
        
        // Für Objekte
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            return keys1.every(key => isEqual(obj1[key], obj2[key]));
        }
        
        return obj1 === obj2;
    }, []);

    // 1. useEffect für die Initialisierung des localBarber, wenn kein Barber in bookingDetails vorhanden ist
    useEffect(() => {
        if (bookingContext && bookingContext.setBookingDetails && 
            !bookingDetails.barber && 
            !isEqual(prevBookingDetailsRef.current?.barber, localBarber)) {
            
            // console.log("Kein Barber in bookingDetails gefunden, setze Standard-Barber");
            bookingContext.setBookingDetails(prev => ({
                ...prev,
                barber: localBarber
            }));
            
            // Aktualisiere die Referenz
            prevBookingDetailsRef.current = { ...bookingDetails, barber: localBarber };
        }
    }, [bookingContext, bookingDetails.barber, localBarber, isEqual]);

    // 2. useEffect für die Aktualisierung von localBarber, wenn sich bookingDetails.barber ändert
    useEffect(() => {
        if (bookingDetails.barber && !isEqual(bookingDetails.barber, localBarber)) {
            setLocalBarber(bookingDetails.barber);
            // Aktualisiere die Referenz
            prevBookingDetailsRef.current = { ...bookingDetails };
        }
    }, [bookingDetails.barber, localBarber, isEqual]);

    // 3. useEffect für die Aktualisierung von localSteps, wenn sich steps ändert
    useEffect(() => {
        if (steps && Array.isArray(steps) && steps.length > 0 && 
            !isEqual(steps, prevStepsRef.current)) {
            setLocalSteps(steps);
            // Aktualisiere die Referenz
            prevStepsRef.current = [...steps];
        }
    }, [steps, isEqual]);

    // 4. useEffect für die Aktualisierung von booking mit Preis und Dauer
    useEffect(() => {
        if (selectedServices && selectedServices.length > 0) {
            const totalPrice = selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
            const totalDuration = selectedServices.reduce((sum, service) => sum + parseInt(service.duration || 0), 0);
            
            // Nur aktualisieren, wenn sich die Werte tatsächlich geändert haben
            if (totalPrice !== prevTotalPriceRef.current || totalDuration !== prevTotalTimeRef.current) {
                setBooking(prev => ({
                    ...prev,
                    total_price: totalPrice,
                    total_time: totalDuration
                }));
                
                // Aktualisiere die Referenzen
                prevTotalPriceRef.current = totalPrice;
                prevTotalTimeRef.current = totalDuration;
                prevSelectedServicesRef.current = [...selectedServices];
            }
        }
    }, [selectedServices]);

    const submitLoginForm = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        
        const formElement = event.target;
        const formData = new FormData(formElement);
        const formDataJSON = Object.fromEntries(formData);
        const btnPointer = document.querySelector('#complete-order-button');
        btnPointer.innerHTML = 'Bitte warten..';
        btnPointer.setAttribute('disabled', true);
        
        // console.log("Formdata ", formDataJSON);

        try {
            // Unternehmensdaten hinzufügen
            const businessId = bookingDetails.business?.id || 1;
            const companyId = bookingDetails.business?.company_id || localStorage.getItem('company-id');
            
            // Aktualisiertes formDataJSON mit allen möglichen IDs für die Backend-Kompatibilität
            const loginPayload = {
                ...formDataJSON,
                company_id: companyId,
                businesses_id: businessId,
            };

            // API-Endpunkt auf loginWithoutToken ändern
            const response = await axios.post(`${BASE_URL}/confirmLogin`, loginPayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // console.log("Response ", response.data);
            if (response.data.status) {
                const clientId = response.data.user?.id;
                if (!clientId) {
                    throw new Error('Benutzer-ID fehlt in der Antwort');
                }
                await handleBookingSubmission(clientId);
                navigate('/booking-confirmation');
            } else {
                setError(response.data.message || 'Ungültige Anmeldedaten');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        } finally {
            btnPointer.innerHTML = 'Anmelden';
            btnPointer.removeAttribute('disabled');
            setIsLoading(false);
        }
    }

    const handleBookingSubmission = async (e) => {
        e.preventDefault();
        try {
            // Extract date and time from the booking context
            let appointmentDate = bookingDetails.date;
            let appointmentTime = bookingDetails.time;
            
            console.log("Originale Buchungsdetails:", bookingDetails);
            
            // Überprüfe, ob Datum und Zeit vorhanden sind
            if (!appointmentDate || !appointmentTime) {
                console.error("Datum oder Zeit fehlen in den Buchungsdetails", bookingDetails);
                if (bookingDetails.selectedSlot) {
                    appointmentDate = bookingDetails.selectedSlot.date;
                    appointmentTime = bookingDetails.selectedSlot.start_time || bookingDetails.selectedSlot.time;
                }
                
                console.log("Fallback zu Buchungsdetails:", { date: appointmentDate, time: appointmentTime });
            }
            
            // Stelle sicher, dass die Zeit im Format HH:MM vorliegt
            if (appointmentTime) {
                // Wenn es nur eine Zahl ist (z.B. "20" oder "10")
                if (!appointmentTime.includes(':')) {
                    const timeValue = parseInt(appointmentTime, 10);
                    if (!isNaN(timeValue)) {
                        console.log("Einfacher Zahlenwert erkannt:", timeValue);
                        
                        // Wenn der Wert < 24 ist, interpretiere ihn als Stunde
                        if (timeValue < 24) {
                            appointmentTime = `${String(timeValue).padStart(2, '0')}:00`;
                        } else {
                            // Für den unwahrscheinlichen Fall, dass der Wert > 24 ist
                            appointmentTime = `09:${String(timeValue % 60).padStart(2, '0')}`;
                        }
                        console.log("Korrigiert zu HH:MM Format:", appointmentTime);
                    }
                } else {
                    // Stelle sicher, dass das Format korrekt ist (HH:MM)
                    const [hours, minutes] = appointmentTime.split(':');
                    appointmentTime = `${String(parseInt(hours, 10)).padStart(2, '0')}:${String(parseInt(minutes, 10)).padStart(2, '0')}`;
                }
            } else {
                console.error("Keine Zeit für die Buchung gefunden!");
                return;
            }
            
            // Erstelle die Liste der Services
            const updatedResList = selectedServices.map(service => {
                return {
                    reservation_id: 0, // wird später vom Server gesetzt
                    service_id: service.id
                };
            });
            
            // Create booking data object
            const bookingData = {
                businesses_id: bookingDetails.business?.id || 1,
                employees_id: bookingDetails.barber?.id || 2,
                client_id: e.target.client_id.value,
                date: appointmentDate,
                startTime: appointmentTime, // Verwende die korrigierte Startzeit
                reservation_status: 'pending'
            };
            
            console.log("Endgültige Buchungsdaten:", bookingData);
            
            // Create the payload
            const payload = {
                booking: bookingData,
                updatedResList: updatedResList,
                timeslot: {
                    date: appointmentDate,
                    time: appointmentTime
                },
                date: appointmentDate,
                time: appointmentTime
            };
            
            console.log("Sende Payload zum Server:", payload);

            // Send to server
            const response = await axios.post(`${BASE_URL}/addBooking`, payload);
            
            console.log('Antwort vom Server:', response.data);
            
            // Update states based on response
            if (response.data.success) {
                console.log('Buchung erfolgreich abgeschlossen!');
                navigate('/booking-confirmation');
            }
        } catch (error) {
            console.error('Fehler beim Abschließen der Buchung:', error);
        }
    };

    const handleGuestSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData(event.target);
        const guestData = Object.fromEntries(formData);

        try {
            // Validierung
            if (guestData.password !== guestData.passwordConfirm) {
                throw new Error('Passwörter stimmen nicht überein');
            }

            const response = await axios.post(`${BASE_URL}/register-guest`, guestData);
            if (response.data.success) {
                await handleBookingSubmission(response.data.clientId);
                navigate('/booking-confirmation');
            } else {
                throw new Error(response.data.message || 'Registrierung fehlgeschlagen');
            }
        } catch (error) {
            console.error('Guest registration error:', error);
            setError(error.message || 'Registrierung fehlgeschlagen');
        } finally {
            setIsLoading(false);
        }
    }

    function extractTime(str) {
        // Verbesserte Zeit-Extraktion für verschiedene Formate
        // console.log("String zur Zeitextraktion:", str);
        
        // Versuche zuerst, die Zeit nach "at" zu extrahieren
        let timePart = str.split("at ")[1];
        if (timePart) {
            // Extrahiere den Zeitwert aus dem gefundenen Text nach "at"
            const timePattern = /\b(\d{1,2}:\d{2})\b/;
            const match = timePart.match(timePattern);
            if (match) {
                // console.log("Extrahierter Zeitwert (Methode 1):", match[0]);
                return match[0];
            }
        }
        
        // Fallback: Suche direkt nach einem Zeitformat im gesamten String
        const timePattern = /\b(\d{1,2}:\d{2})\b/;
        const match = str.match(timePattern);
        if (match) {
            // console.log("Extrahierter Zeitwert (Methode 2):", match[0]);
            return match[0];
        }
        
        // console.log("Keine Zeit gefunden, verwende Standard-Zeit");
        return "09:00"; // Standardwert, falls keine Zeit gefunden wird
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Buchung abschließen</h1>
            
            <div className="order-header">
                <div className="order-header-content">
                    <Icon icon="mdi:calendar-check" className="order-main-icon" />
                    <h2 className="order-main-title">Fast geschafft!</h2>
                    <p className="order-main-subtitle">Bitte wählen Sie eine der folgenden Optionen, um Ihre Buchung abzuschließen.</p>
                </div>
            </div>
            
            <div className="services">
                <div className="order-content">
                    {error && (
                        <div className="alert alert-danger mb-4" role="alert">
                            {error}
                        </div>
                    )}
                    
                    <div className="complete-order-forms">
                        <div className="order-ep">
                            <Form id='complete-order-ep' onSubmit={submitLoginForm}>
                                <div className="login-header">
                                    <Icon icon="mdi:account" className="header-icon" />
                                    <h4>Anmelden</h4>
                                    <p className="form-subtitle">Melden Sie sich mit Ihrem Konto an</p>
                                </div>
                                
                                <div className="login-form-container">
                                    <div className="login-form-fields">
                                        <Form.Group className="mb-4">
                                            <Form.Label className="form-label">Email</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                placeholder="Email eingeben" 
                                                name="email" 
                                                required
                                                className="login-input"
                                                size="lg"
                                            />
                                        </Form.Group>
                                        
                                        <Form.Group className="mb-4">
                                            <Form.Label className="form-label">Passwort</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                placeholder="Passwort" 
                                                name="password" 
                                                required
                                                className="login-input"
                                                size="lg"
                                            />
                                        </Form.Group>
                                    
                                        <div className="login-links mb-4">
                                            <Form.Text as={Link} to='/forgot-password'>Passwort vergessen?</Form.Text>
                                        </div>
                                    </div>
                                
                                    <div className="navigation-buttons">
                                        <Button 
                                            type="button"
                                            className="nav-button back-button"
                                            onClick={() => navigate(-1)}
                                        >
                                            <Icon icon="mdi:arrow-left" /> Zurück
                                        </Button>
                                        <Button 
                                            id="complete-order-button"
                                            type="submit"
                                            className="nav-button next-button"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Wird verarbeitet...' : 'Anmelden'}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>

                        <div className="guest-order">
                            <Form onSubmit={handleGuestSubmit}>
                                <div className="login-header">
                                    <Icon icon="mdi:account-plus" className="header-icon" />
                                    <h4>Als Gast fortfahren</h4>
                                    <p className="form-subtitle">Erstellen Sie ein neues Konto</p>
                                </div>
                                
                                <div className="guest-form-container">
                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Vorname</Form.Label>
                                            <Form.Control name="firstName" placeholder="Vorname" required className="login-input" />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Nachname</Form.Label>
                                            <Form.Control name="lastName" placeholder="Nachname" required className="login-input" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Telefon</Form.Label>
                                            <Form.Control name="phone" placeholder="Telefon" required className="login-input" />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control name="email" type="email" placeholder="Email" required className="login-input" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Passwort</Form.Label>
                                            <Form.Control name="password" type="password" required className="login-input" />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Passwort wiederholen</Form.Label>
                                            <Form.Control name="passwordConfirm" type="password" required className="login-input" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Strasse</Form.Label>
                                            <Form.Control name="street" placeholder="Strasse" required className="login-input" />
                                        </Form.Group>

                                        <Form.Group as={Col} md={4}>
                                            <Form.Label>PLZ</Form.Label>
                                            <Form.Control name="zip" placeholder="PLZ" required className="login-input" />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Stadt</Form.Label>
                                            <Form.Control name="city" placeholder="Stadt" required className="login-input" />
                                        </Form.Group>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Ich akzeptiere die AGB" 
                                            name="terms"
                                            required
                                            id="terms-checkbox"
                                        />
                                    </Form.Group>

                                    <div className="navigation-buttons">
                                        <Button 
                                            type="button"
                                            className="nav-button back-button"
                                            onClick={() => navigate(-1)}
                                        >
                                            <Icon icon="mdi:arrow-left" /> Zurück
                                        </Button>
                                        <Button 
                                            type="submit"
                                            className="nav-button next-button"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Wird verarbeitet...' : 'Registrieren'}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>

                <BookingSteps />
            </div>
        </div>
    )
}

export default CompleteOrder

/*
<input type={'text'} className="form-control" id={'login-username'} name="email" required />

  <Form.Control type="email" placeholder="Enter email" className="form-control" id={'login-username'} name="email" required/>

 <Form.Group as={Col} controlId="formGridState">
                    <Form.Label>Kanton</Form.Label>
                    <Form.Select defaultValue="Choose...">
                        <option>wählen...</option>
                        <option>...</option>
                    </Form.Select>
                    </Form.Group>

*/