import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React,{useEffect, useState} from "react";
import {Container} from "react-bootstrap";
import { Calendar, momentLocalizer }from 'react-big-calendar';
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
const localizer = momentLocalizer(moment);


function PortalDashboard() {  
    const [timeSlot, setTimeSlots] = useState([]);

    const getTimeSlots = async () => {
        try {
            const timeSlots = [];
            const response = await axios.get(`${BASE_URL}/timeslots`);
            console.log("TimeSlots: ",response);
            if (response.status === 200) {
                for(let i=0; i < response.data.length;i++){
                    const id= response.data[i]['bookings_id'];
                    console.log(id)
                    const responseBooking=await axios.get(`${BASE_URL}/bookings/${id}`);
                    console.log("Response: ",responseBooking)
                    const user=responseBooking.data['users_id'];
                    console.log("user",user)
                    const responseUser = await axios.get(`${BASE_URL}/users/${user}`);

                    const date= response.data[i]['date'];
                    const time=response.data[i]['time'];
                    let startDate=`${date} ${time}`;
                    startDate= new Date(startDate);
                    let endDate = new Date(new Date(startDate).setMinutes(30));
                  
                    console.log("Time: ",startDate)
                    console.log("EndTime:",endDate)
                    timeSlots[i]={  id:     response.data[i]['id'],
                                    title:  responseUser.data[0]['name'] + " "+responseUser.data[0]['surname'],
                                    start:  startDate,
                                    end:    endDate,
                                    desc:   responseBooking.data.phone
                                }
                }
                addTimeSlot(timeSlots);  
                console.log("Timeslot: ",timeSlots);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const addTimeSlot = (initialTimeSlot) => {
        //setTimeSlots([...timeSlot, initialTimeSlot]);
        setTimeSlots(initialTimeSlot);
    }

    useEffect(() => {
        getTimeSlots();
    }, [])

    return (
        <React.Fragment>
            <Container className='py-5'>
                <h3 className='fw-normal'>Dashboard</h3>
                <Calendar
                    localizer={localizer}
                    events={timeSlot}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                />   
            </Container>
        </React.Fragment>
        );
      };

  export default PortalDashboard