import '../../App.css';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BarberCard from '../components/BarberCard';
import axios from 'axios';
import config from '../../dashboard/config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const Reservation = () => {
    const [employees, setEmployees] = useState();
    const { bussines } = useParams();

    const fetchEmployee = async() =>{
      try{
        const res=await axios.get(`${BASE_URL}/employees`);
        if (res.status === 200) {
          setEmployees(res.data.data);
        }
      }catch (e) {
        console.error(e);
    }
        
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
  )
}

export default Reservation