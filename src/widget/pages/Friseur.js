import '../../App.css';
import React, { useContext, useEffect,useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs';
import HairStyleCard from '../components/HairStyleCard';
import TimeSlotCalendar from '../components/TimeSlotCalendar';
import BookingSteps from '../components/BookingSteps';
import { StepsContext } from '../context/BookingStepsContext';
import axios from 'axios';
import config from '../../dashboard/config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const Friseur = () => {
    const [ steps, setSteps ] = useContext(StepsContext);
    const { bussines, friseur } = useParams();
    const [services, setServices]= useState();

    const fetchEmployee = async() =>{
        try{
          const res=await axios.get(`${BASE_URL}/services`);
          if (res.status === 200) {
            console.log(res.data.data);
            setServices(res.data.data);
          }
        }catch (e) {
          console.error(e);
        }
      }
  
      useEffect(() => {
        fetchEmployee();
    }, [bussines,friseur])

    return (
        <div className='friseur'>
            <Breadcrumbs bussines={bussines} friseur={friseur} />
            <h2 className='friseur-headline'>{friseur}</h2>
            <div className='services'>
                <div className='hairstyles'>
                    {  services &&
                        services.map((curService,idx) => {
                            return (
                            <>
                                <HairStyleCard steps={steps} id={idx} setSteps={setSteps} image={`http://127.0.0.1:8000/api/images/services/${curService.image_path}`} title={curService.name}/>
                            </>
                            )
                        })
                    }
                </div>

                <BookingSteps />
            </div>
            <div className='calendar'>
                <h3>Wähle einen Termin</h3>
                <TimeSlotCalendar />
            </div>
            <Link to='complete-order'>CC</Link>
        </div>
    )
}

export default Friseur