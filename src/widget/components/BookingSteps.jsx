import React, { useContext, useState, useEffect } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import { StepsContext } from '../context/BookingStepsContext';
import { BookingContext } from '../context/BookingContext';
import { useSalonContext } from '../context/SalonContext';
import { Icon } from '@iconify/react';

const BookingSteps = ({ next }) => {
  const stepsContext = useContext(StepsContext) || { steps: [], setSteps: () => {} };
  const { steps, setSteps } = stepsContext;
  
  const bookingContext = useContext(BookingContext);
  const bookingDetails = bookingContext?.bookingDetails || {
    business: null,
    barber: null,
    services: [],
    date: null
  };

  // Direct access to SalonContext
  const { selectedServices } = useSalonContext();

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Berechne Gesamtpreis und -dauer aus dem SalonContext und dem BookingContext
  useEffect(() => {
    // Verwende selectedServices aus SalonContext, falls verfügbar
    const services = selectedServices?.length > 0 
      ? selectedServices 
      : (bookingDetails.services && bookingDetails.services.length > 0 
        ? bookingDetails.services 
        : []);

    if (services.length > 0) {
      const price = services.reduce((sum, service) => sum + parseFloat(service.price), 0);
      const duration = services.reduce((sum, service) => sum + parseInt(service.duration), 0);
      
      // Nur aktualisieren, wenn sich die Werte tatsächlich geändert haben
      if (price !== totalPrice) {
        setTotalPrice(price);
      }
      if (duration !== totalDuration) {
        setTotalDuration(duration);
      }
    } else if (totalPrice !== 0 || totalDuration !== 0) {
      setTotalPrice(0);
      setTotalDuration(0);
    }
  }, [selectedServices, bookingDetails.services, totalPrice, totalDuration]);

  return (
    <ListGroup id="booking-steps">
      <h4>
        <Icon icon="mdi:calendar-check" style={{ marginRight: '8px' }} />
        Ihre Buchung
      </h4>
      
      {/* Gewählte Dienstleistungen */}
      <ListGroup.Item className="services-summary">
        <h5>
          <Icon icon="mdi:content-cut" style={{ marginRight: '8px' }} />
          Gewählte Dienstleistungen
        </h5>
        {selectedServices && selectedServices.length > 0 ? (
          <div className="selected-services">
            <div className="services-list-container">
              {selectedServices.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-name">{service.name}</span>
                  <div className="service-details">
                    <span className="service-price">{service.price} CHF</span>
                    <span className="service-duration">
                      <Icon icon="mdi:clock-outline" style={{ marginRight: '4px', fontSize: '14px' }} />
                      {service.duration} Min.
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="services-total">
              <div className="total-line">
                <strong>Gesamtdauer:</strong>
                <span>
                  <Icon icon="mdi:clock-outline" style={{ marginRight: '4px' }} />
                  {totalDuration} Min.
                </span>
              </div>
              <div className="total-line">
                <strong>Gesamtpreis:</strong>
                <span>{totalPrice.toFixed(2)} CHF</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-services-message">
            <Icon icon="mdi:information-outline" style={{ marginRight: '8px', fontSize: '18px' }} />
            Noch keine Dienstleistungen ausgewählt
          </p>
        )}
      </ListGroup.Item>

      {/* Buchungsschritte */}
      {Array.isArray(steps) && steps.length > 0 && (
        <ListGroup.Item className="booking-progress">
          <h5>
            <Icon icon="mdi:steps" style={{ marginRight: '8px' }} />
            Buchungsfortschritt
          </h5>
          <div className="steps-container">
            {steps.map((step, i) => (
              <div key={step.id} className="booking-step">
                <span className="step-number">{i + 1}</span>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </ListGroup.Item>
      )}
    </ListGroup>
  );
};

export default BookingSteps;
