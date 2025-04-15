import React from 'react';
import { useBusinessContext } from '../context/BusinessContext';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BusinessHeader = () => {
  const { business, isLoading, error, isBusinessActive } = useBusinessContext();

  // Wenn die Geschäftsdaten geladen werden
  if (isLoading) {
    return (
      <div className="business-header business-header-loading py-3">
        <Container className="text-center">
          <Spinner animation="border" variant="primary" size="sm" className="me-2" />
          <span>Salon wird geladen...</span>
        </Container>
      </div>
    );
  }

  // Wenn ein Fehler aufgetreten ist
  if (error) {
    return (
      <div className="business-header business-header-error py-2">
        <Container>
          <Alert variant="danger" className="mb-0">
            <strong>Fehler:</strong> {error}
          </Alert>
        </Container>
      </div>
    );
  }

  // Wenn keine Geschäftsdaten vorhanden sind
  if (!business) {
    return (
      <div className="business-header business-header-missing py-2">
        <Container>
          <Alert variant="warning" className="mb-0">
            <strong>Hinweis:</strong> Keine Salon-Informationen verfügbar
          </Alert>
        </Container>
      </div>
    );
  }

  // Primäre Farbe des Salons für das Styling verwenden (mit Fallback)
  const primaryColor = business.primary_color || '#7DB561';
  const textColor = business.text_color || '#ffffff';
  
  // Status des Salons (aktiv/inaktiv)
  const isActive = isBusinessActive();

  return (
    <div 
      className="business-header py-3" 
      style={{ backgroundColor: primaryColor, color: textColor }}
    >
      <Container className="d-flex align-items-center justify-content-between">
        <div className="business-branding d-flex align-items-center">
          {business.logo && (
            <img 
              src={business.logo} 
              alt={business.name} 
              className="business-logo me-3" 
              style={{ maxHeight: '40px', maxWidth: '100px' }}
            />
          )}
          <h2 className="business-name mb-0" style={{ color: textColor }}>
            <Link to={`/salon/${business.company_id}`} style={{ color: textColor, textDecoration: 'none' }}>
              {business.name}
            </Link>
          </h2>
        </div>
        
        {!isActive && (
          <div className="business-status ms-3">
            <Alert variant="warning" className="py-1 px-2 mb-0">
              <small>Dieser Salon ist aktuell nicht verfügbar</small>
            </Alert>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BusinessHeader; 