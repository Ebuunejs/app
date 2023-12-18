import '../../App.css';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import BarberCard from '../components/BarberCard';
import axios from 'axios';
const API_URL = 'http://127.0.0.1:8000/api/';

const Reservation = () => {

    const { bussines } = useParams();

    const fetchEmployee = async() =>{
        const res=await axios.get(`${API_URL}${bussines}/employees`);
        console.log(res);
    }

    useEffect(() => {
      fetchEmployee();
  }, [bussines])

  return (
    <div className='container'>
        <h4 className='header'>{bussines}</h4>

        {/* <TimeSlotCalendar /> */}
      <h2>Wähle einen Coiffeure:</h2>
        <div className='barbers'>
            <BarberCard />
            <BarberCard />
            <BarberCard />
        </div>
    </div>
  )
}

export default Reservation