import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalonContext } from '../context/SalonContext';
import { useBusinessContext } from '../context/BusinessContext';
import { BookingContext } from '../context/BookingContext';
import BusinessHeader from '../components/BusinessHeader';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaCut } from 'react-icons/fa';

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

function ConfirmationPage() {
    const navigate = useNavigate();
    const { business } = useBusinessContext();
    const { selectedCoiffeur } = useSalonContext();
    const { bookingDetails, resetBookingDetails, totalDuration, totalPrice, updateReservationStatus } = useContext(BookingContext);
    
    // Add a ref to track if the status has been updated
    const statusUpdatedRef = useRef(false);
    
    // Services berechnen
    const services = bookingDetails.services || [];
    
    // Ensure we have booking details
    useEffect(() => {
        if (!bookingDetails.booking_id || !bookingDetails.customer) {
            // Wenn keine Buchungsdetails vorhanden sind, zurück zur Startseite
            navigate('/');
            return;
        }
        
        // Update reservation status to "completed" on confirmation page only once
        if (!statusUpdatedRef.current && bookingDetails.reservation_status !== 'completed') {
            updateReservationStatus('completed');
            statusUpdatedRef.current = true;
            
            // Hier könnten wir noch einen API-Aufruf machen, um den Status in der Datenbank zu aktualisieren
            // z.B. axios.put(`${BASE_URL}/bookings/${bookingDetails.booking_id}/status`, { status: 'completed' })
            // Das wäre optional, je nach API-Design
        }
    }, [bookingDetails, navigate, updateReservationStatus]);
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Fehler beim Formatieren des Datums:', error);
            return dateString;
        }
    };
    
    // Reset booking on "Neue Buchung" button click
    const handleNewBooking = () => {
        // Reset booking context
        resetBookingDetails();
        
        // Navigate to home page
        navigate('/');
    };
    
    return (
        <div className="confirmation-page">
            <BusinessHeader />
            
            <Container className="my-5">
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <div className="text-center mb-4">
                            <FaCheckCircle className="confirmation-icon" size={60} color="#28a745" />
                            <h1 className="mt-3">Buchung bestätigt!</h1>
                            <p className="lead">
                                Vielen Dank für Ihre Buchung. Die Bestätigung wurde an Ihre E-Mail-Adresse gesendet.
                            </p>
                        </div>
                        
                        <Card style={styles.summaryCard} className="mb-4">
                            <Card.Header style={styles.cardHeader}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="m-0">Buchungsdetails</h3>
                                    {bookingDetails.reservation_status && (
                                        <span className={`badge ${getStatusBadgeVariant(bookingDetails.reservation_status)}`} style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}>
                                            {getStatusLabel(bookingDetails.reservation_status)}
                                        </span>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body style={styles.cardBody}>
                                <div className="booking-details">
                                    <div className="booking-header mb-4">
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            color: '#333',
                                            marginBottom: '0.5rem'
                                        }}>Buchungsnummer</h4>
                                        <p style={{
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            color: '#7DB561',
                                            margin: 0
                                        }}>{bookingDetails.booking_id || '431'}</p>
                                    </div>

                                    <Row className="mb-4">
                                        <Col lg={4}>
                                            <div className="detail-item">
                                                <h5 style={{
                                                    fontSize: '1rem',
                                                    color: '#666',
                                                    marginBottom: '0.5rem'
                                                }}>Salon</h5>
                                                <p style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    margin: 0
                                                }}>{business?.name || 'Barbar Shop'}</p>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="detail-item">
                                                <h5 style={{
                                                    fontSize: '1rem',
                                                    color: '#666',
                                                    marginBottom: '0.5rem'
                                                }}>Stylist</h5>
                                                <p style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    margin: 0
                                                }}>{bookingDetails.barber?.name || selectedCoiffeur || 'Peter'}</p>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="detail-item">
                                                <h5 style={{
                                                    fontSize: '1rem',
                                                    color: '#666',
                                                    marginBottom: '0.5rem'
                                                }}>Datum</h5>
                                                <p style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    margin: 0
                                                }}>
                                                    {formatDate(bookingDetails.date)} <br />
                                                    {bookingDetails.time ? `${bookingDetails.time} Uhr` : '08:30 Uhr'}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div style={styles.summaryItem}>
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            color: '#333',
                                            marginBottom: '1rem'
                                        }}>Gebuchte Dienstleistungen</h4>
                                        {services && services.length > 0 ? (
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
                                    
                                    <div style={styles.summaryItem}>
                                        <h4 style={styles.summaryTitle}>Kundeninformationen</h4>
                                        {bookingDetails.customer ? (
                                            <div>
                                                <p>
                                                    <strong>Name:</strong> {bookingDetails.customer.firstName} {bookingDetails.customer.lastName}
                                                </p>
                                                <p>
                                                    <strong>E-Mail:</strong> {bookingDetails.customer.email}
                                                </p>
                                                <p>
                                                    <strong>Telefon:</strong> {bookingDetails.customer.phone}
                                                </p>
                                                {bookingDetails.customer.notes && (
                                                    <p>
                                                        <strong>Anmerkungen:</strong> {bookingDetails.customer.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p>Keine Kundeninformationen verfügbar</p>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        <Alert variant="info">
                            <p className="mb-0">
                                <strong>Hinweis:</strong> Sie können Ihren Termin bis zu 24 Stunden vorher kostenfrei stornieren oder verschieben. Bitte kontaktieren Sie uns dazu telefonisch oder per E-Mail.
                            </p>
                        </Alert>
                        
                        <div className="text-center mt-4">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleNewBooking}
                            >
                                Neue Buchung
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

export default ConfirmationPage; 