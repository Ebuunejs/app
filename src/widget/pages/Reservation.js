import '../../App.css';
import React, { useEffect, useState, useContext } from 'react'
import { Container} from "react-bootstrap";
import { BookingContext } from '../context/BookingContext';  // Der Context für die Buchungsdaten
import BarberCard from '../components/BarberCard';
import axios from 'axios';
import config from '../../dashboard/config';
import { useNavigate } from 'react-router-dom';  // Importiere useNavigate für die Navigation
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const Reservation = () => {
    const [employees, setEmployees] = useState([]);  // Zustand für die Liste der Barbiers
    const { bookingDetails, setBookingDetails } = useContext(BookingContext);  // Nutzung des Buchungs-Contex
    const navigate = useNavigate();  // Verwende useNavigate für die Navigation
  
    // Funktion zum Abrufen der Friseur-Daten
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/getEmployees`);  // Backend-Aufruf
        if (res.status === 200) {
          setEmployees(res.data.data);  // Setzt die empfangenen Daten in den Zustand
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Mitarbeiter:', error);
      }
    };

    useEffect(() => {
      fetchEmployees();
    }, [])

  const handleBarberSelection = (barber) => {
    // Speichert die Auswahl im globalen Zustand
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      barber: {
        id: barber.id,           // ID des Friseurs
        surname: barber.surname,    // Nachname des Friseurs
        name: barber.name,        // Vollständiger Name (falls vorhanden)
      }
    }));
    // Navigiere zur Friseur-Seite und übergebe die Friseur-ID in der URL
    navigate(`/friseur`);
  };

  return (
    <React.Fragment>
       <Container className='py-5'>
            <h4 className='header'>{}</h4>

            {/* <TimeSlotCalendar /> */}
          <h2 className="d-flex justify-content-center">Wähle einen Coiffeure:</h2>
            <div className='barbers'>
                  {  employees.map((barber) => (
                    <BarberCard
                      key={barber.id}
                      barber={barber}
                      onClick={() => handleBarberSelection(barber)}  // Auswahl eines Friseurs
                    />
                  ))}
            </div>
        </Container>
    </React.Fragment>
  )
}

export default Reservation

/*
<div className='container'>
        <h4 className='header'>{bussines}</h4>

        {}
        <h2>Wähle einen Coiffeure:</h2>
        <div className='barbers'>
               {  employees &&
                  employees.map((curEmployee) => {
                      return (
                        <>
                        <BarberCard curEmployee={curEmployee}/>
                        </>
                      )
                  })
                }
        </div>
    </div>
*/