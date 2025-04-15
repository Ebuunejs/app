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

    const handleBookingSubmission = async (clientId) => {
        try {
            // Debug: Ausgabe des Barber-Objekts
            // console.log("Barber-Objekt im Context:", bookingDetails.barber);
            // console.log("Barber-Objekt lokal:", localBarber);
            // console.log("BookingDetails vollständig:", bookingDetails);
            
            // Verwende entweder steps aus dem Kontext oder localSteps
            const currentSteps = (steps && Array.isArray(steps) && steps.length > 0) ? steps : localSteps;
            
            // Variablen für die Buchung
            let datePart = null;
            let timePart = null;
            
            // Priorität 1: Datum/Zeit aus dem StepsContext
            const dateStep = currentSteps.find(step => step.title && step.title.includes('Date:'));
            if (dateStep) {
                const stepTitle = dateStep.title;
                datePart = stepTitle.split(" at ")[0].replace("Date: ", "");
                timePart = extractTime(stepTitle);
            } 
            // Priorität 2: Datum aus dem BookingContext
            else if (bookingDetails && bookingDetails.date) {
                datePart = bookingDetails.date;
                
                // Verwende die startTime aus dem BookingContext, wenn verfügbar
                if (bookingDetails.startTime) {
                    timePart = bookingDetails.startTime;
                } else {
                    timePart = "09:00"; // Standard-Uhrzeit, nur als letzter Fallback
                }
            } 
            // Priorität 3: Aktuelles Datum als Fallback
            else {
                // console.log('Versuche alternative Buchung ohne Schritte oder BookingContext...');
                const today = new Date();
                datePart = today.toISOString().split('T')[0]; // YYYY-MM-DD
                timePart = '09:00'; // Standardzeit als Fallback
            }

            // Finde die business_id und employees_id
            // Für business_id
            let businessId = 1; // Standardwert
            if (bookingDetails.business && bookingDetails.business.id) {
                businessId = bookingDetails.business.id;
            }

            // Für employees_id - Verwende prioritär Barber aus BookingContext, dann lokalen Barber
            let employeeId = 2; // Standardwert
            
            // Prüfe verschiedene Quellen für die Barber-ID
            if (bookingDetails.barber && bookingDetails.barber.id) {
                employeeId = bookingDetails.barber.id;
                // console.log("Verwende Barber-ID aus BookingContext:", employeeId);
            } else if (localBarber && localBarber.id) {
                employeeId = localBarber.id;
                // console.log("Verwende Barber-ID aus lokalem State:", employeeId);
            }
            
            // console.log("Verwendete Business-ID:", businessId);
            // console.log("Verwendete Mitarbeiter-ID:", employeeId);

            // Aktualisiere das Buchungsobjekt
            const updatedBooking = {
                ...booking,
                businesses_id: businessId,
                employees_id: employeeId,
                client_id: clientId,
                date: datePart,
                startTime: timePart,
                total_price: booking.total_price,
                total_time: booking.total_time
            };

            // Sammle die Service-IDs für das Backend
            const serviceIds = selectedServices.map(service => {
                return { id: service.id };
            });

            // Füge die Daten für Timeslots hinzu
            const timeslotsData = {
                date: datePart, // Stellt sicher, dass das Datum für Timeslots korrekt übermittelt wird
                time: timePart
            };

            // console.log("Sende Buchung:", updatedBooking);
            // console.log("Mit Services:", serviceIds);

            const payload = {
                booking: updatedBooking,
                updatedResList: serviceIds,
                timeslot: timeslotsData, // Neue Eigenschaft für Timeslot-Daten
                date: datePart, // Datum direkt im Hauptobjekt
                time: timePart // Zeit direkt im Hauptobjekt
            };

            const response = await axios.post(`${BASE_URL}/addBooking`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Prüfe den Antwortstatus
            if (response.status !== 200) {
                throw new Error('Buchung konnte nicht erstellt werden');
            }
        } catch (error) {
            console.error('Booking error:', error);
            setError('Fehler bei der Buchung. Bitte versuchen Sie es später erneut.');
            throw error;
        }
    }

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