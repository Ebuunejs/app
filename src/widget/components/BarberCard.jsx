import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { FaUser, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import config from '../../dashboard/config';

// Base64-kodiertes Fallback-Bild als SVG
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkJpbGQgbmljaHQgdmVyZsO8Z2JhcjwvdGV4dD48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNzAiIHI9IjUwIiBmaWxsPSIjZjhmOGY4IiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE0MCIgcj0iMjUiIGZpbGw9IiM5OTkiLz48cGF0aCBkPSJNMTAwLDIzMCBDMTAwLDIwMCAxMjUsMTkwIDE1MCwxOTAgQzE3NSwxOTAgMjAwLDIwMCAyMDAsMjMwIEMyMDAsMjMwIDIwMCwyNTAgMTUwLDI1MCBDMTAwLDI1MCAxMDAsMjMwIDEwMCwyMzAiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';

const styles = {
  card: {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: '10px',
    overflow: 'hidden',
    height: '100%',
    boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    border: 'none',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  },
  cardImage: {
    height: '180px',
    objectFit: 'cover',
    objectPosition: 'center top',
    borderBottom: '1px solid #f0f0f0'
  },
  cardContent: {
    padding: '1.25rem',
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column'
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: '1.15rem',
    marginBottom: '0.5rem',
    wordWrap: 'break-word',
    hyphens: 'auto',
    width: '100%'
  },
  cardSubtitle: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    width: '100%',
    borderBottom: '1px dashed #eee',
    paddingBottom: '0.75rem'
  },
  contactInfoContainer: {
    marginTop: 'auto',
    paddingTop: '0.5rem'
  },
  contactInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    color: '#6c757d',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    wordBreak: 'break-word'
  },
  contactIcon: {
    marginRight: '10px',
    color: '#7DB561',
    minWidth: '16px',
    marginTop: '3px'
  },
  colorBar: {
    height: '5px',
    background: 'linear-gradient(to right, #7DB561, #60A8C1)',
    marginTop: 'auto'
  }
};

const BarberCard = ({ barber, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const imageLoadedRef = useRef(false);
  
  // Reset states when barber changes
  useEffect(() => {
    setUseFallback(false);
    imageLoadedRef.current = false;
  }, [barber]);
  
  // Sicherer Zugriff auf Barber-Eigenschaften
  const barberName = barber?.name || '';
  const barberSurname = barber?.surname || '';
  const fullName = `${barberName} ${barberSurname}`.trim() || 'Stylist';
  const position = barber?.position || 'Hairstylist';
  const email = barber?.email || '';
  const phone = barber?.phone || '';
  
  // Funktion zum sicheren Abrufen des Profilbilds
  const getProfileImage = () => {
    if (useFallback) return FALLBACK_IMAGE;

    if (!barber || !barber.photo) {
      return FALLBACK_IMAGE;
    }

    // Prüfe, ob es sich um einen vollständigen URL handelt
    if (barber.photo.startsWith('http://') || barber.photo.startsWith('https://')) {
      return barber.photo;
    }

    // Wenn es ein relativer Pfad ist, füge die Basis-URL hinzu
    return `http://127.0.0.1:8000/storage/images/employees/${barber.photo}`;
  };
  
  const handleImageError = () => {
    if (!imageLoadedRef.current) {
      setUseFallback(true);
    }
  };

  const handleImageLoad = () => {
    imageLoadedRef.current = true;
    setUseFallback(false);
  };
  
  return (
    <Card 
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card.Img 
        variant="top" 
        src={getProfileImage()}
        alt={fullName || 'Stylist'} 
        style={styles.cardImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <Card.Body style={styles.cardContent}>
        <Card.Title style={styles.cardTitle}>{fullName}</Card.Title>
        <Card.Subtitle style={styles.cardSubtitle}>{position}</Card.Subtitle>
        
        <div style={styles.contactInfoContainer}>
          {email && (
            <div style={styles.contactInfo}>
              <FaEnvelope style={styles.contactIcon} />
              <span title={email}>{email}</span>
            </div>
          )}
          
          {phone && (
            <div style={styles.contactInfo}>
              <FaPhoneAlt style={styles.contactIcon} />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </Card.Body>
      <div style={styles.colorBar}></div>
    </Card>
  );
};

export default BarberCard;