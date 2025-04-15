import '../../App.css';
import React, { useContext, useEffect,useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs';
import HairStyleCard from '../components/HairStyleCard';
import TimeSlotCalendar from '../components/TimeSlotCalendar';
import BookingSteps from '../components/BookingSteps';
import { StepsContext } from '../context/BookingStepsContext';
import TimeSlot from '../components/TimeSlot';
import { BookingContext } from '../context/BookingContext';
import axios from 'axios';
import config from '../../dashboard/config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const Friseur = () => {
    const { bookingDetails, setBookingDetails } = useContext(BookingContext);
    const { barberId } = useParams();  // Holt die Friseur-ID aus der URL
    const [services, setServices] = useState([]);

    const [ steps, setSteps ] = useContext(StepsContext);
    const { bussines, friseur } = useParams();
    //const [services, setServices]= useState();
    const [idS, setIDS]= useState();
  
       // Hier kannst du entweder die gespeicherten Friseur-Details aus dem Context verwenden
        // oder die Friseur-Details basierend auf der ID erneut vom Backend abrufen.
        const fetchBarberDetails = async () => {
            try {
              const res = await axios.get(`${BASE_URL}/getServices`);
              // console.log("Response: Services: ",res.data.data);
              if (res.status === 200) {
                setBookingDetails((prevDetails) => ({
                  ...prevDetails,
                  barberDetails: res.data.data,
                }));
                setServices(res.data.data);
              }
            } catch (error) {
              console.error('Fehler beim Abrufen der Friseur-Details:', error);
            }
        };

      useEffect(() => {
        // console.log("Services: ",bookingDetails.barberDetails);
        if (!bookingDetails.barberDetails) {
          fetchBarberDetails();
        }
      }, [barberId]);

    const handleServiceSelection = (service) => {
        // Füge die ausgewählte Dienstleistung zum Array hinzu
        setBookingDetails((prevDetails) => ({
            ...prevDetails,
            services: [...prevDetails.services, {
                id: service.id,
                name: service.name,
                price: service.price
            }]
        }));
    };


    return (
        <div className='friseur'>
            <Breadcrumbs/>
            <h2 className='friseur-headline'>{bookingDetails.barber?.surname} {bookingDetails.barber?.name}</h2>
            <div className='services'>
                <div className='hairstyles'>
                    {services &&
                    services.map((service) => (
                      
                        <HairStyleCard image={`http://127.0.0.1:8000/storage/images/services/${service.image_path}`}    />
                     
                    ))

                    }
                </div>
                
                <BookingSteps />
            </div>
            <div className='calendar'>
                <h3>Wähle das Datum</h3>
               
               
            </div>
            <Link to='complete-order'>NEXT</Link>
        </div>
    )
}

export default Friseur
/*  
  <TimeSlotCalendar />
  <div key={service.id} onClick={() => handleServiceSelection(service)}>
                        {service.name} - {service.price}
                    </div>
  
*/