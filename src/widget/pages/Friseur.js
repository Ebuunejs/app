import '../../App.css';
import React, { useContext, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs';
import HairStyleCard from '../components/HairStyleCard';
import TimeSlotCalendar from '../components/TimeSlotCalendar';
import BookingSteps from '../components/BookingSteps';
import { StepsContext } from '../context/BookingStepsContext';


const Friseur = () => {

    const [ steps, setSteps ] = useContext(StepsContext);

    const { bussines, friseur } = useParams();
  
  return (
    <div className='friseur'>
        <Breadcrumbs bussines={bussines} friseur={friseur} />
        <h2 className='friseur-headline'>{friseur}</h2>
        <div className='services'>
            <div className='hairstyles'>
                <HairStyleCard steps={steps} id={1} setSteps={setSteps} image={require("../images/hair-cuttin.jpg")} title="Hair Cutting"/>
                <HairStyleCard steps={steps} id={2} setSteps={setSteps} image="https://i.ytimg.com/vi/MP6CFGUVcyU/maxresdefault.jpg" title="Beard Trimming/Shaving"/>
                <HairStyleCard steps={steps} id={3} setSteps={setSteps} image={require("../images/hair-cuttin.jpg")} title="Hair Washing"/>
            </div>

            <BookingSteps />
        </div>
        <div className='calendar'>
            <h3>Pick a Date</h3>
            <TimeSlotCalendar />
        </div>
        <Link to='complete-order'>CC</Link>
    </div>
  )
}

export default Friseur