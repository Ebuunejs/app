import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React, {useEffect, useState, useMemo} from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Container, Button, Alert } from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddTermin from '../components/AddTermin';
//import ReactTimeslotCalendar from 'react-timeslot-calendar';
import moment from 'moment';
//  import events from "./events";
import axios from "axios";

//const BASE_URL = "http://4pixels.ch/friseur/api"; 
//import DnDResource from '../../stories/demos/exampleCode/dndresource';
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

// Setze die Locale für Moment auf Deutsch
moment.locale('de');
const localizer = momentLocalizer(moment);

// Erstelle die DnD-Version des Kalenders
const DnDCalendar = withDragAndDrop(Calendar);

const initialBooking={
    businesses_id:0,
    employees_id:0,
    clients_id:0,
    date:null,
    startTime:0,
    total_time:0,
    total_price:0,
    state:"pending"
}

// Füge eine Funktion zur Generierung von Farben basierend auf Kunden-ID hinzu
const generateColorForClient = (clientId) => {
    // Vordefinierte Farben für bessere Lesbarkeit und Ästhetik
    const colors = [
        '#FF5733', // Rot-Orange
        '#33FF57', // Hellgrün
        '#3357FF', // Blau
        '#FF33A8', // Pink
        '#33FFF5', // Türkis
        '#F5FF33', // Gelb
        '#A833FF', // Lila
        '#FF8C33', // Orange
        '#33FFAA', // Mint
        '#AA33FF', // Violett
        '#3396FF', // Hellblau
        '#FF338C'  // Rosa
    ];
    
    // Nutze die ClientId als Index für die Farbauswahl, mit Modulo um im Array zu bleiben
    if (!clientId) return '#C0C0C0'; // Fallback-Grau für unbekannte Kunden
    return colors[clientId % colors.length];
};

function PortalDashboard() {  
    const [timeSlot, setTimeSlots] = useState([]);
    const [show, setShow] = useState(false);
    const [changed, setChanged] = useState(false);
    const [client, setClient] = useState();
    const [booking , setBooking] = useState(initialBooking);
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState(initialBooking);
    const [initialState, setInitialState] = useState(initialBooking);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertVariant, setAlertVariant] = useState('success');
    // Speichere die Client-Farben-Zuordnung
    const [clientColors, setClientColors] = useState({});

    const getTimeSlots = async () => {
        const token=localStorage.getItem('user-token');
        const userID=localStorage.getItem('user-id');
        const businessID=localStorage.getItem('company-id');
        const timeSlots = [];
        const newClientColors = {...clientColors};

        try {
            // Erstelle das Booking-Objekt im Format, das die API erwartet
            const bookingData = {
                businesses_id: businessID,
                employees_id: userID
            };
            console.log("BookingData: ",bookingData)

            const response = await axios.post(`${BASE_URL}/employee-timeslots`, bookingData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Timeslots1:', response.data);
            for(let i=0; i < response.data.length;i++){
                const date= response.data[i]['date'];
                const time=response.data[i]['startTime'];
                let startDate=`${date} ${time}`;
                startDate= new Date(startDate);
                let endDate = new Date(new Date(startDate).setMinutes(response.data[i]['total_time']));
                //console.log("Time: ",startDate)
                //console.log("EndTime:",endDate)
                console.log("Client: ",response.data[i].client !=null)
                
                if(response.data[i].client !=null){
                    const clientId = response.data[i].client.id;
                    
                    // Generiere eine Farbe für diesen Kunden, wenn noch keine vorhanden ist
                    if (!newClientColors[clientId]) {
                        newClientColors[clientId] = generateColorForClient(clientId);
                    }
                    
                    timeSlots[i]={  
                        id:     response.data[i].id,
                        title:  response.data[i].client.name + " "+response.data[i].client.surname,
                        start:  startDate,
                        end:    endDate,
                        desc:   response.data[i].client.phone,
                        resource: response.data[i],  // Speichere die gesamten Termindaten für die Bearbeitung
                        backgroundColor: newClientColors[clientId], // Farbe basierend auf Kunden-ID
                        borderColor: newClientColors[clientId]      // Passende Randfarbe
                    }
                }else{
                    timeSlots[i]={  
                        id:     response.data[i].id,
                        title:  'No Name',
                        start:  startDate,
                        end:    endDate,
                        desc:   'No Description',
                        backgroundColor: '#C0C0C0', // Grau für nicht zugeordnete Termine
                        borderColor: '#A9A9A9'      // Dunkleres Grau für den Rand
                    }
                }
            }
            setTimeSlots(timeSlots);
            setClientColors(newClientColors); // Speichere die aktualisierte Farben-Zuordnung
            console.log('Timeslots2:', timeSlots);
        } catch (error) {
            console.error('There was an error!', error);
            showNotification('Fehler beim Laden der Termine', 'danger');
        }
    }

    function addTermin(){
        try {
            setShow(!show);
        } catch (e) {
            console.error(e)
        }
    }

    const showNotification = (message, variant = 'success') => {
        setAlertMessage(message);
        setAlertVariant(variant);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000); // Ausblenden nach 5 Sekunden
    };

    const handleEventDrop = async ({ event, start, end }) => {
        const token = localStorage.getItem('user-token');
        
        // Format dates for the API
        const formattedDate = moment(start).format('YYYY-MM-DD');
        const formattedTime = moment(start).format('HH:mm:ss');
        
        try {
            // Berechne die neue Gesamtdauer in Minuten
            const durationInMinutes = moment(end).diff(moment(start), 'minutes');
            
            // Aktualisiere den Termin in der API
            await axios.put(`${BASE_URL}/bookings/${event.id}`, {
                date: formattedDate,
                startTime: formattedTime,
                total_time: durationInMinutes
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Aktualisiere den lokalen State
            const updatedEvents = timeSlot.map(item => {
                if (item.id === event.id) {
                    return { ...item, start, end };
                }
                return item;
            });
            
            setTimeSlots(updatedEvents);
            showNotification('Termin erfolgreich verschoben');
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Termins:', error);
            showNotification('Fehler beim Verschieben des Termins', 'danger');
        }
    };
    
    const handleEventResize = async ({ event, start, end }) => {
        const token = localStorage.getItem('user-token');
        
        // Format dates for the API
        const formattedDate = moment(start).format('YYYY-MM-DD');
        const formattedTime = moment(start).format('HH:mm:ss');
        
        try {
            // Berechne die neue Gesamtdauer in Minuten
            const durationInMinutes = moment(end).diff(moment(start), 'minutes');
            
            // Aktualisiere den Termin in der API
            await axios.put(`${BASE_URL}/bookings/${event.id}`, {
                date: formattedDate,
                startTime: formattedTime,
                total_time: durationInMinutes
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Aktualisiere den lokalen State
            const updatedEvents = timeSlot.map(item => {
                if (item.id === event.id) {
                    return { ...item, start, end };
                }
                return item;
            });
            
            setTimeSlots(updatedEvents);
            showNotification('Termindauer erfolgreich geändert');
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Termindauer:', error);
            showNotification('Fehler beim Ändern der Termindauer', 'danger');
        }
    };

    // Füge ein Event durch Klicken auf ein freies Zeitfenster hinzu
    const handleSelectSlot = ({ start, end }) => {
        setBooking({
            ...booking,
            date: moment(start).format('YYYY-MM-DD'),
            startTime: moment(start).format('HH:mm:ss'),
            total_time: moment(end).diff(moment(start), 'minutes')
        });
        setShow(true);
    };

    // Event-Klick-Handler
    const handleSelectEvent = (event) => {
        // Hier könntest du eine Detailansicht oder Bearbeitungsansicht öffnen
        console.log('Event clicked:', event);
        alert(`${event.title}\nTelefon: ${event.desc}`);
    };

    // Lokalisiere die Kalenderbeschriftungen
    const { messages } = useMemo(() => ({
        messages: {
            week: 'Woche',
            work_week: 'Arbeitswoche',
            day: 'Tag',
            month: 'Monat',
            previous: 'Zurück',
            next: 'Weiter',
            today: 'Heute',
            agenda: 'Agenda',
            showMore: total => `+ ${total} weitere`
        }
    }), []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('user-token');
            const userId = localStorage.getItem('user-id');
            const userRole = localStorage.getItem('user-role');

            if (!token || !userId) {
                console.error('Keine Authentifizierungsdaten gefunden');
                return;
            }

            // Setze den Authorization Header für die Anfrage
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Hole die Buchungen basierend auf der Benutzerrolle
            const response = await axios.get(
                `${BASE_URL}/employee-timeslots/${userId}`,
                config
            );

            if (response.data) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Buchungen:', error);
            if (error.response?.status === 403) {
                showNotification('Sie haben keine Berechtigung, die Buchungen anzuzeigen.', 'danger');
            } else {
                showNotification('Ein Fehler ist beim Laden der Buchungen aufgetreten.', 'danger');
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('user-token');
            const userId = localStorage.getItem('user-id');

            if (!token || !userId) {
                showNotification('Bitte melden Sie sich erneut an.', 'warning');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.post(
                `${BASE_URL}/employee-timeslots`,
                {
                    ...formData,
                    employees_id: userId
                },
                config
            );

            if (response.status === 201) {
                showNotification('Zeitslot erfolgreich gespeichert!');
                setFormData(initialState);
                fetchBookings(); // Aktualisiere die Liste
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Zeitslots:', error);
            if (error.response?.status === 403) {
                showNotification('Sie haben keine Berechtigung, Zeitslots zu erstellen.', 'danger');
            } else {
                showNotification('Ein Fehler ist beim Speichern des Zeitslots aufgetreten.', 'danger');
            }
        }
    };

    useEffect(() => {
        getTimeSlots();
    }, [show, changed]);

    return (
        <React.Fragment>
            <Container className='py-5'>
                <h1>Dashboard</h1>
                {showAlert && (
                    <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                        {alertMessage}
                    </Alert>
                )}
                <div className="d-flex flex-row-reverse mb-3">
                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}} onClick={addTermin}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
                <DnDCalendar
                    localizer={localizer}
                    events={timeSlot}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 650 }}
                    messages={messages}
                    defaultView='week'
                    resizable
                    selectable
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    draggableAccessor={() => true}
                    popup
                    step={15}
                    timeslots={4}
                    eventPropGetter={(event) => {
                        // Verwende die vordefinierten Farben für die Termine
                        return {
                            style: {
                                backgroundColor: event.backgroundColor || '#3174ad', // Verwende die Farbe oder Standard-Blau
                                borderColor: event.borderColor || '#2a6395',        // Randfarbe
                                color: '#fff',                                      // Textfarbe immer weiß für gute Lesbarkeit
                                borderRadius: '4px',
                                border: '1px solid',
                                display: 'block'
                            }
                        }
                    }}
                />   
            </Container>
            <AddTermin show={show} setShow={setShow} changed={changed} setChanged={setChanged} client={client} setClient={setClient} booking={booking} setBooking={setBooking}/>
        </React.Fragment>
        );
      };

  export default PortalDashboard