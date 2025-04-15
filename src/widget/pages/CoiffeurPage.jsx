import React, { useEffect, useState, useContext, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { useSalonContext } from "../context/SalonContext";
import { useBusinessContext } from "../context/BusinessContext";
import { StepsContext } from "../context/BookingStepsContext";
import { BookingContext } from "../context/BookingContext";
import axios from 'axios';
import config from '../../dashboard/config';
import { Icon } from '@iconify/react';
import BookingSteps from '../components/BookingSteps';
import { Container, Row, Col, Card, Alert, Badge, Button, Spinner } from "react-bootstrap";
import BusinessHeader from '../components/BusinessHeader';
import { FaCut, FaClock, FaCheck, FaArrowRight } from 'react-icons/fa';

// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

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
  serviceCard: {
    transition: 'all 0.3s ease',
    borderRadius: '10px',
    overflow: 'hidden',
    height: '100%',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer'
  },
  selectedCard: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
    borderColor: '#7DB561',
    borderWidth: '2px'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0',
    flex: '1'
  },
  cardBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  servicePrice: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#7DB561',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginLeft: 'auto'
  },
  durationBadge: {
    backgroundColor: '#f0f0f0',
    color: '#555',
    fontWeight: 'normal',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center'
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
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    color: '#7DB561',
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '1.5rem',
    background: 'white',
    borderRadius: '50%',
    padding: '3px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  cardIcon: {
    backgroundColor: '#f8f9fa',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    color: '#7DB561',
    flexShrink: '0'
  },
  selectionIndicator: {
    height: '6px',
    background: 'linear-gradient(to right, #7DB561, #60A8C1)',
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  },
  activeSelectionIndicator: {
    opacity: '1'
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
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#60A8C1',
  },
};

function CoiffeurPage() {
  const { salon, selectedCoiffeur, setSelectedServices } = useSalonContext();
  const { business, isBusinessActive } = useBusinessContext();
  const stepsContext = useContext(StepsContext) || { steps: [], setSteps: () => {} };
  const { steps, setSteps } = stepsContext;
  
  const bookingContext = useContext(BookingContext);
  const { bookingDetails, setBookingDetails } = bookingContext || { 
    bookingDetails: {}, 
    setBookingDetails: () => {} 
  };
  
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination-Status
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });

  // Refs zum Tracking, ob bereits geladen wurde
  const hasLoadedServicesRef = useRef(false);
  const currentBarberIdRef = useRef(null);
  const currentBusinessIdRef = useRef(null);

  // Überprüfen, ob der Barber im BookingContext existiert
  useEffect(() => {
    // Debug-Ausgabe für BookingContext
    // console.log("BookingContext in CoiffeurPage:", bookingDetails);
    
    // Wenn kein Barber im BookingContext ist, aber selectedCoiffeur im SalonContext
    if (!bookingDetails.barber && selectedCoiffeur) {
      console.warn("Kein Barber im BookingContext gefunden, aber selectedCoiffeur im SalonContext");
    }
  }, [bookingDetails, selectedCoiffeur]);
  
  // Log für Geschäftsstatus
  useEffect(() => {
    if (business) {
      // console.log("CoiffeurPage - Business aktiv?", isBusinessActive());
      // console.log("CoiffeurPage - Business is_active Wert:", business.is_active, "Typ:", typeof business.is_active);
    }
  }, [business, isBusinessActive]);

  // Die ausgewählten Services in den BookingContext übertragen
  useEffect(() => {
    if (setBookingDetails && typeof setBookingDetails === 'function') {
      // Prüfe, ob die Services im BookingContext bereits aktuell sind
      const currentServices = bookingDetails?.services || [];
      
      // Wir müssen vollständige Service-Objekte statt nur IDs speichern
      const selectedServicesObjects = selectedServiceIds.map(id => 
        services.find(service => service.id === id)
      ).filter(Boolean); // Entferne undefined-Werte
      
      // Nur aktualisieren, wenn sich die Services wirklich geändert haben
      if (!areServicesEqual(currentServices, selectedServicesObjects)) {
        setBookingDetails(prev => ({
          ...prev,
          services: selectedServicesObjects || []
        }));
      }
    }
  }, [selectedServiceIds, services, setBookingDetails, bookingDetails]);
  
  // Hilfsfunktion zum Vergleichen von Services-Arrays
  const areServicesEqual = (servicesA, servicesB) => {
    if (!servicesA || !servicesB) return false;
    if (servicesA.length !== servicesB.length) return false;
    
    // Vergleiche die IDs der Services
    const idsA = new Set(servicesA.map(service => service.id));
    const idsB = new Set(servicesB.map(service => service.id));
    
    // Beide Sets müssen dieselbe Größe haben und alle IDs aus A müssen in B sein
    return idsA.size === idsB.size && 
      [...idsA].every(id => idsB.has(id));
  };

  // Aktualisiere die Steps wenn sich die ausgewählten Services ändern
  useEffect(() => {
    if (!Array.isArray(steps)) return;
    
    if (selectedServiceIds && selectedServiceIds.length > 0) {
      const totalPrice = selectedServiceIds.reduce((sum, id) => sum + Number(services.find(service => service.id === id)?.price), 0);
      const totalDuration = selectedServiceIds.reduce((sum, id) => sum + Number(services.find(service => service.id === id)?.duration), 0);
      
      // Hole die Namen aller ausgewählten Dienstleistungen
      const selectedServiceNames = selectedServiceIds.map(id => {
        const service = services.find(service => service.id === id);
        return service ? service.name : 'Unbekannte Dienstleistung';
      });
      
      const servicesStep = {
        id: 'services',
        idS: 'services',
        title: `Dienstleistungen (${totalPrice.toFixed(2)} Fr, ${totalDuration} Min.)`,
        description: selectedServiceNames.join(', ')
      };

      // Prüfe, ob ein Service-Step bereits existiert und ob sich der Inhalt wirklich geändert hat
      const existingServiceStepIndex = steps.findIndex(step => step.id === 'services');
      
      if (existingServiceStepIndex !== -1) {
        // Nur aktualisieren, wenn sich der Titel oder die Beschreibung tatsächlich geändert hat
        const existingStep = steps[existingServiceStepIndex];
        if (existingStep.title !== servicesStep.title || existingStep.description !== servicesStep.description) {
          const newSteps = [...steps];
          newSteps[existingServiceStepIndex] = servicesStep;
          setSteps(newSteps);
        }
      } else {
        // Nur einen neuen Step hinzufügen, wenn noch keiner existiert
        setSteps(prev => [...prev, servicesStep]);
      }
    } else if (steps.some(step => step.id === 'services')) {
      // Nur filtern, wenn ein services-Step existiert
      setSteps(prev => prev.filter(step => step.id !== 'services'));
    }
  }, [selectedServiceIds, setSteps, services]);

  const isServiceSelected = (service) => {
    return selectedServiceIds.some(id => id === service.id);
  };

  const toggleService = (service) => {
    setSelectedServiceIds(prev => {
      const isSelected = prev.some(id => id === service.id);
      if (isSelected) {
        return prev.filter(id => id !== service.id);
      } else {
        return [...prev, service.id];
      }
    });
  };

  const fetchServices = async (page = 1) => {
    // Hole die IDs außerhalb der try-catch-Blöcke
    const barber = bookingDetails.barber || {};
    const barberId = barber.id;
    const businessData = bookingDetails.business || business || {};
    const businessId = businessData.id;
    
    // Wenn Services bereits für diesen Barber geladen wurden, nicht erneut laden
    if (hasLoadedServicesRef.current && 
        currentBarberIdRef.current === barberId && 
        currentBusinessIdRef.current === businessId &&
        services.length > 0) {
      // console.log("Services bereits geladen, kein erneutes Laden notwendig");
      setLoading(false);
      return;
    }
    
    // Speichere die aktuelle IDs für spätere Vergleiche
    currentBarberIdRef.current = barberId;
    currentBusinessIdRef.current = businessId;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!barberId || !businessId) {
        throw new Error('Barber oder Business ID fehlt');
      }
      
      // console.log(`Suche Dienstleistungen für Business ${businessId} und Mitarbeiter ${barberId}`);
      
      // Verwende den existierenden getServices-Endpunkt
      const response = await axios.get(`${BASE_URL}/getServices`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          business_id: businessId,
          employee_id: barberId,
          page: page
        }
      });
      
      // console.log("Services Antwort:", response.data);
      
      // Extrahiere die Daten aus der Antwort
      const servicesData = response.data.data || response.data;
      
      if (servicesData && Array.isArray(servicesData)) {
        setServices(servicesData);
        // Speichere Paginierungs-Informationen
        if (response.data.current_page !== undefined) {
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total
          });
          setCurrentPage(response.data.current_page);
        }
        
        // Markiere, dass Services erfolgreich geladen wurden
        hasLoadedServicesRef.current = true;
      } else {
        setServices([]);
        setError('Keine Dienstleistungen gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dienstleistungen:', error);
      setError('Die Dienstleistungen konnten nicht geladen werden.');
      
      // Fallback: Versuche alle Services zu laden und manuell zu filtern
      try {
        // console.log("Versuche Fallback: Lade alle Services und filtere manuell");
        const fallbackResponse = await axios.get(`${BASE_URL}/getServices`);
        
        const allServices = fallbackResponse.data.data || fallbackResponse.data;
        
        if (allServices && Array.isArray(allServices)) {
          // Filtere manuell
          const filteredServices = allServices.filter(service => 
            (service.business_id == businessId || service.businesses_id == businessId) &&
            (!service.employee_id || service.employee_id == barberId)
          );
          
          // console.log(`Gefilterte Services (${filteredServices.length}):`, filteredServices);
          
          if (filteredServices.length > 0) {
            setServices(filteredServices);
            setError(null); // Lösche den Fehler
            
            // Markiere, dass Services erfolgreich geladen wurden
            hasLoadedServicesRef.current = true;
          } else {
            setServices([]);
            setError('Keine Dienstleistungen für diesen Stylisten gefunden.');
          }
        }
      } catch (fallbackError) {
        console.error("Auch Fallback fehlgeschlagen:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Lade Services einmalig beim Laden der Seite und bei Änderung der Seite
  useEffect(() => {
    // Wenn noch keine Barber- oder Businessdaten vorliegen, nicht laden
    if (!bookingDetails.barber || !bookingDetails.business) {
      // console.log("Warte auf Barber- und Business-Daten, bevor Services geladen werden");
      return;
    }
    
    // Lade Services nur, wenn sie noch nicht geladen wurden oder die Seite sich geändert hat
    if (!hasLoadedServicesRef.current || currentPage !== pagination.currentPage) {
      fetchServices(currentPage);
    }
  }, [currentPage, bookingDetails.barber, bookingDetails.business]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (selectedServiceIds.length > 0) {
      navigate("/booking");
    } else {
      alert("Bitte wählen Sie mindestens eine Dienstleistung aus.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.lastPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Berechnungen für die Gesamtzeit und den Gesamtpreis
  const calculateTotals = () => {
    if (!selectedServiceIds.length) return { totalDuration: 0, totalPrice: 0 };
    
    const totalDuration = selectedServiceIds.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service ? Number(service.duration || 0) : 0);
    }, 0);
    
    const totalPrice = selectedServiceIds.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service ? Number(service.price || 0) : 0);
    }, 0);
    
    return { totalDuration, totalPrice };
  };

  if (loading) {
    return (
      <div style={styles.loadingSpinner}>
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
        <p className="mt-4 text-center">Dienstleistungen werden geladen...</p>
      </div>
    );
  }
  
  if (error && !services.length) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger" className="d-inline-block">
          <Icon icon="mdi:alert-circle" className="me-2" />
          {error}
        </Alert>
        <div className="mt-4">
          <Button variant="outline-primary" onClick={() => fetchServices()}>
            <Icon icon="mdi:refresh" className="me-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  // console.log("Selected services:", selectedServiceIds);
  // console.log("Booking details:", bookingDetails);

  return (
    <div className="coiffeur-page">
      {/* Business Header for consistent branding */}
      <BusinessHeader />
      
      {/* Error message for inactive business */}
      {business && !isBusinessActive() && (
        <Container className="mt-3">
          <Alert variant="warning">
            <strong>Hinweis:</strong> Dieser Salon ist derzeit nicht aktiv. Buchungen sind nicht möglich.
            <div><small>Status-Wert: {JSON.stringify(business.is_active)} (Typ: {typeof business.is_active})</small></div>
          </Alert>
        </Container>
      )}
      
      <div style={styles.header}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <h1 style={styles.heroText} className="display-5 mb-2">
                {selectedCoiffeur || 'Stylist'}
              </h1>
              <p className="lead mb-0">
                {salon || business?.name || 'Salon'}
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container>
        <Row className="justify-content-center mb-4">
          <Col md={10} className="text-center">
            <h2 className="h3 mb-3">Wählen Sie Ihre Dienstleistungen</h2>
            <p className="text-muted">
              Entdecken Sie unsere Angebote und wählen Sie die gewünschten Dienstleistungen für Ihren Besuch
            </p>
          </Col>
        </Row>
        
        {error && services.length > 0 && (
          <Alert variant="info" className="mb-4">
            <Icon icon="mdi:information-outline" className="me-2" />
            {error}
          </Alert>
        )}
        
        {services.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ color: '#999' }}>
              <Icon icon="mdi:hair-dryer-outline" style={{ fontSize: '3rem' }} />
            </div>
            <p className="mt-3 mb-4">Keine Dienstleistungen verfügbar.</p>
            <Button 
              variant="outline-primary"
              onClick={fetchServices}
            >
              <Icon icon="mdi:refresh" className="me-2" />
              Erneut versuchen
            </Button>
          </div>
        ) : (
          <>
            <Row className="mb-5">
              {services.map(service => (
                <Col key={service.id} md={6} lg={6} xl={4} className="mb-4">
                  <Card 
                    style={{
                      ...styles.serviceCard,
                      ...(selectedServiceIds.includes(service.id) ? styles.selectedCard : {})
                    }}
                    onClick={() => toggleService(service)}
                  >
                    {selectedServiceIds.includes(service.id) && (
                      <FaCheck style={styles.checkmark} />
                    )}
                    
                    <Card.Body style={styles.cardBody}>
                      <div className="d-flex align-items-center">
                        <div style={styles.cardIcon}>
                          <FaCut />
                        </div>
                        <h3 style={styles.cardTitle}>{service.name}</h3>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            marginBottom: '0.25rem'
                          }}>Dauer:</span>
                          <span style={styles.durationBadge}>
                            <FaClock className="me-2 text-muted" />
                            {service.duration} Min.
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end'
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            marginBottom: '0.25rem'
                          }}>Preis:</span>
                          <div style={styles.servicePrice}>
                            {service.price} <span style={{marginLeft: '4px', fontSize: '0.8rem'}}>Fr</span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                    
                    <div style={{
                      ...styles.selectionIndicator,
                      ...(selectedServiceIds.includes(service.id) ? styles.activeSelectionIndicator : {})
                    }}></div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {selectedServiceIds.length > 0 && (
              <div className="mb-5">
                <Alert variant="light" className="border">
                  <div className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="mb-0">Ihre Auswahl</h4>
                      <Badge bg="primary" className="me-2">{selectedServiceIds.length} Dienstleistungen</Badge>
                    </div>
                    
                    <div className="selected-services-list mt-3 mb-3">
                      {selectedServiceIds.map(id => {
                        const service = services.find(s => s.id === id);
                        return service ? (
                          <div key={id} className="d-flex justify-content-between align-items-center p-2 mb-2" style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            <div className="d-flex align-items-center">
                              <div style={{...styles.cardIcon, width: '30px', height: '30px', fontSize: '0.9rem'}}>
                                <FaCut />
                              </div>
                              <span className="fw-bold">{service.name}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <Badge bg="light" text="dark" className="me-2">
                                <FaClock className="me-1" size="0.8em" />
                                {service.duration} Min.
                              </Badge>
                              <span style={{
                                ...styles.servicePrice,
                                fontSize: '1rem',
                                padding: '0.3rem 0.6rem'
                              }}>
                                {service.price} <span style={{marginLeft: '2px', fontSize: '0.7rem'}}>Fr</span>
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center pt-2" style={{
                      borderTop: '1px solid #eee',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      backgroundColor: '#f7fbf5',
                      borderRadius: '8px',
                      padding: '0.8rem'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          display: 'block',
                          marginBottom: '0.3rem'
                        }}>Gesamtdauer:</span>
                        <span style={{
                          ...styles.summaryValue,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <FaClock style={{marginRight: '0.5rem', color: '#60A8C1'}} />
                          {calculateTotals().totalDuration} Min.
                        </span>
                      </div>
                      <div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          display: 'block',
                          marginBottom: '0.3rem',
                          textAlign: 'right'
                        }}>Gesamtpreis:</span>
                        <span style={styles.priceTag}>
                          {calculateTotals().totalPrice.toFixed(2)} Fr
                        </span>
                      </div>
                    </div>
                  </div>
                </Alert>
              </div>
            )}
            
            <div className="d-flex justify-content-between mb-5">
              <Button 
                variant="outline-secondary"
                onClick={handleBack}
              >
                Zurück
              </Button>
              
              <Button 
                style={styles.primaryButton}
                disabled={selectedServiceIds.length === 0 || (business && !isBusinessActive())}
                onClick={handleNext}
              >
                Weiter zur Terminauswahl <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default CoiffeurPage;