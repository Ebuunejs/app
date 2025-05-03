import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSalonContext } from "../context/SalonContext";
import { BookingContext } from "../context/BookingContext";
import { useBusinessContext } from "../context/BusinessContext";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from 'axios';
import config from '../../dashboard/config';
import BarberCard from '../components/BarberCard';
import BusinessHeader from '../components/BusinessHeader';

// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

function SalonPage() {
    const { companyId } = useParams(); // Lesen des URL-Parameters
    const { setSalon, setSelectedCoiffeur } = useSalonContext();
    const bookingContext = useContext(BookingContext);
    const { fetchBusiness, business, isBusinessActive } = useBusinessContext();
    
    const [employee, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Refs zum Tracking, ob bereits geladen wurde
    const hasLoadedBusinessRef = useRef(false);
    const hasLoadedEmployeesRef = useRef(false);
    const currentBusinessIdRef = useRef(null);
    
    // Lade die Salon-Daten, wenn die Komponente initialisiert wird
    useEffect(() => {
        // Wenn keine companyId vorhanden ist, abbrechen
        if (!companyId) {
            setError('Keine Salon-ID in der URL gefunden.');
            setLoading(false);
            return;
        }
        
        // Wenn das Business bereits mit dieser ID geladen wurde, nicht erneut laden
        if (hasLoadedBusinessRef.current && currentBusinessIdRef.current === companyId) {
            return;
        }
        
        console.log("Lade Business-Daten für ID:", companyId);
        
        // Salon-Daten über den BusinessContext laden
        const loadBusiness = async () => {
            try {
                setLoading(true);
                const businessData = await fetchBusiness(companyId);
                
                if (businessData) {
                    // Business erfolgreich geladen
                    hasLoadedBusinessRef.current = true;
                    currentBusinessIdRef.current = companyId;
                    
                    // Setze den Salon-Namen im Salon-Kontext
                    setSalon(businessData.name);
                    
                    // Speichere die Business-Daten im BookingContext
                    // Verwende eine Callback-Form, um Closures zu vermeiden
                    if (bookingContext && bookingContext.setBookingDetails) {
                        // Stelle sicher, dass businessData das key-Feld anstelle von company_id verwendet
                        const businessWithKey = { ...businessData };
                        if (!businessWithKey.key && businessWithKey.company_id) {
                            businessWithKey.key = businessWithKey.company_id;
                            delete businessWithKey.company_id;
                        } else if (!businessWithKey.key) {
                            businessWithKey.key = companyId;
                        }
                        
                        bookingContext.setBookingDetails(prev => ({
                            ...prev,
                            business: businessWithKey
                        }));
                    }
                    
                    // Lade die Mitarbeiter nur, wenn sie noch nicht geladen wurden
                    if (!hasLoadedEmployeesRef.current) {
                        await fetchEmployees(businessData.id);
                    }
                    
                    setLoading(false);
                }
            } catch (error) {
                console.error('Fehler beim Laden der Salon-Daten:', error);
                setError('Salon konnte nicht geladen werden.');
                setLoading(false);
            }
        };
        
        loadBusiness();
        
        // Cleanup-Funktion
        return () => {
            // Behalte den Ladestatus, aber lösche den Fehler beim Unmounten
            setError(null);
        };
    }, [companyId, fetchBusiness]); // Entferne setSalon und bookingContext aus den Abhängigkeiten

    // Funktion zum Abrufen der Friseur-Daten
    const fetchEmployees = async (businessId) => {
        // Wenn bereits Mitarbeiter geladen wurden und die Business-ID gleich ist, nicht neu laden
        if (hasLoadedEmployeesRef.current && employee.length > 0 && businessId === currentBusinessIdRef.current) {
            return;
        }
        
        console.log("Lade Mitarbeiter für Business-ID:", businessId || companyId);
        
        setLoading(true);
        try {
            // Verwende die getEmployees API
            const res = await axios.get(`${BASE_URL}/getAllEmployees/${companyId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            if (res.status === 200 && res.data) {
                // Stelle sicher, dass alle Mitarbeiter eine ID haben
                const dataArray = Array.isArray(res.data.employees) ? res.data.employees : (res.data.employees || []);
                
                const employeesWithIds = dataArray.map((emp, index) => {
                    // Wenn keine ID vorhanden ist, erstelle eine temporäre ID
                    if (!emp.id && !emp.employees_id) {
                        return { ...emp, id: `temp-${index}` };
                    }
                    // Wenn nur employees_id vorhanden ist, kopiere sie nach id
                    if (!emp.id && emp.employees_id) {
                        return { ...emp, id: emp.employees_id };
                    }
                    // Stelle sicher, dass der Mitarbeiter der richtigen Business-ID zugeordnet ist
                    return { 
                        ...emp, 
                        business_id: businessId || emp.business_id || emp.businesses_id
                    };
                });
                
                // Filtere Mitarbeiter nach der Business-ID, falls nötig
                const filteredEmployees = businessId 
                    ? employeesWithIds.filter(emp => 
                        emp.business_id == businessId || 
                        emp.businesses_id == businessId)
                    : employeesWithIds;
                
                setEmployees(filteredEmployees);
                
                // Markiere, dass Mitarbeiter erfolgreich geladen wurden
                hasLoadedEmployeesRef.current = true;
            } else {
                throw new Error('Ungültige Antwort vom Server');
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Mitarbeiter:', error);
            setError('Es gab ein Problem beim Laden der Mitarbeiter. Bitte versuchen Sie es später erneut.');
        } finally {
            setLoading(false);
        }
    };

    const handleBarberSelection = (barber) => {
        if (!barber) {
            return;
        }
        
        // Prüfe, ob der Salon aktiv ist
        const activeStatus = isBusinessActive();
        
        if (!activeStatus) {
            setError('Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.');
            return;
        }
        
        try {
            // Speichert die Auswahl im SalonContext
            const barberName = `${barber.name || ''} ${barber.surname || ''}`.trim();
            setSelectedCoiffeur(barberName || 'Ausgewählter Stylist');
            
            // Stelle sicher, dass wir eine ID für den Barber haben
            const barberWithId = { ...barber };
            if (!barberWithId.id && barberWithId.employees_id) {
                barberWithId.id = barberWithId.employees_id;
            }
            
            // Stelle sicher, dass der Barber die richtige Business-ID hat
            if (business && !barberWithId.business_id) {
                barberWithId.business_id = business.id;
                barberWithId.businesses_id = business.id;
            }
            
            // Speichert das vollständige Barber-Objekt im BookingContext
            if (bookingContext && bookingContext.setBookingDetails) {
                bookingContext.setBookingDetails(prev => ({
                    ...prev,
                    barber: barberWithId
                }));
                
                // Navigiere zur Friseur-Seite
                navigate(`/coiffeur`);
            } else {
                navigate(`/coiffeur`);
            }
        } catch (err) {
            navigate(`/coiffeur`);
        }
    };

    return (   
        <div className="salon-page">
            {/* Business Header für Saloninformationen */}
            <BusinessHeader />
            
            {/* Salon-spezifischer Inhalt */}
            {!isBusinessActive() && business && (
                <Container className="mt-3">
                    <Alert variant="warning">
                        <strong>Hinweis:</strong> Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.
                        <div><small>Status-Wert: {JSON.stringify(business.is_active)} (Typ: {typeof business.is_active})</small></div>
                    </Alert>
                </Container>
            )}
            
            <div className="salon-hero py-4" style={{
                backgroundColor: '#f8f9fa',
                marginBottom: '2rem',
                borderBottom: '1px solid #eee'
            }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md={10} lg={8} className="text-center">
                            <h1 className="salon-title" style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                color: '#333'
                            }}>{business?.name || 'Unser Salon'}</h1>
                            <p className="salon-subtitle" style={{
                                fontSize: '1.1rem',
                                color: '#666',
                                maxWidth: '800px',
                                margin: '0 auto'
                            }}>Wählen Sie einen unserer professionellen Stylisten für Ihren nächsten Termin</p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="salon-content mb-5">
                <Row className="justify-content-center mb-4">
                    <Col md={10} lg={8} className="text-center">
                        <h2 className="section-title" style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            color: '#444'
                        }}>Unsere Stylisten</h2>
                        <p className="section-description" style={{
                            fontSize: '1rem',
                            color: '#666',
                            maxWidth: '700px',
                            margin: '0 auto 1.5rem'
                        }}>
                            Jeder unserer Stylisten bringt einzigartige Fähigkeiten und Expertise mit. 
                            Wählen Sie einen Stylisten, um verfügbare Services und Termine zu sehen.
                        </p>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Laden...</span>
                        </div>
                        <p className="mt-3">Mitarbeiter werden geladen...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center" role="alert">
                        {error}
                    </div>
                ) : (
                    <div className="barber-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        {Array.isArray(employee) && employee.length > 0 ? (
                            employee.map((coiffeur, index) => (
                                <div key={coiffeur.id || coiffeur.employees_id || `emp-${index}`} className="barber-item" style={{
                                    height: '100%'
                                }}>
                                    <BarberCard
                                        barber={coiffeur}
                                        onClick={() => handleBarberSelection(coiffeur)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5" style={{ gridColumn: '1 / -1' }}>
                                <p className="no-results" style={{
                                    fontSize: '1.1rem',
                                    color: '#666',
                                    marginBottom: '1rem'
                                }}>Keine Stylisten verfügbar.</p>
                                <button 
                                    className="btn btn-outline-primary mt-2"
                                    onClick={() => fetchEmployees(business?.id)}
                                >
                                    Erneut versuchen
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default SalonPage;

      {/* <TimeSlotCalendar /> */}
      //py-5 d-flex justify-content-center
      /*

      <li key={coiffeur}>
                        <button onClick={() => navigate("/coiffeur", { state: { coiffeur } })}>
                        {coiffeur}
                        </button>
                    </li>


    */