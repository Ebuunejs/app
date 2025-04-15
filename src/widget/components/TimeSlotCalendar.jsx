import React, { useContext, useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import DatePicker from 'react-date-picker';
import { StepsContext } from '../context/BookingStepsContext';
import { BookingContext } from '../context/BookingContext';
import { useSalonContext } from "../context/SalonContext";
import { Link, useNavigate } from 'react-router-dom';
import TimeSlot from './TimeSlot';

const TimeSlotCalendar = () => {
    const stepsContext = useContext(StepsContext) || { steps: [], setSteps: () => {} };
    const { steps, setSteps } = stepsContext;
    const { bookingDetails, setBookingDetails } = useContext(BookingContext) || { bookingDetails: {}, setBookingDetails: () => {} };
    const { setAppointment } = useSalonContext();
    
    const [ date, setDate ] = useState(new Date());
    const [ dropdownOpen, setDropdownOpen ] = useState(false);

    const [ timeSlots, setTimeSlots ] = useState([
        {
            "time": "10:00 - 10:30",
            "slot_id": 1
        },
        {
            "time": "10:30 - 11:00",
            "slot_id": 2
        },
        {
            "time": "11:00 - 11:30",
            "slot_id": 3
        },
        {
            "time": "11:30 - 12:00",
            "slot_id": 4
        },
        {
            "time": "12:00 - 12:30",
            "slot_id": 5
        },
        {
            "time": "12:30 - 01:00",
            "slot_id": 6
        },
        {
            "time": "01:00 - 01:30",
            "slot_id": 7
        },
        {
            "time": "01:30 - 02:00",
            "slot_id": 8
        },
        {
            "time": "02:00 - 02:30",
            "slot_id": 9
        },
        {
            "time": "02:30 - 03:00",
            "slot_id": 10
        },
        {
            "time": "03:00 - 03:30",
            "slot_id": 11
        },
        {
            "time": "03:30 - 04:00",
            "slot_id": 12
        },
        {
            "time": "04:00 - 04:30",
            "slot_id": 13
        },
        {
            "time": "04:30 - 05:00",
            "slot_id": 14
        }
    ]
    );
    const [ terminSlots, setTerminSlots ] = useState([]);

    const unavailable_ts = [
        {
            time: "10:00 - 10:30",
            slot_id: 1,
            _day: 27
        },
        {
            time: "11:00 - 11:30",
            slot_id: 3,
            _day: 27
        },
        {
            time: "11:30 - 12:00",
            slot_id: 4,
            _day: 26
        },
        {
            time: "1:00 - 1:30",
            slot_id: 7,
            _day: 29
        },
        {
            time: "2:30 - 3:00",
            slot_id: 10,
            _day: 26
        },
    ]

    const sortTimeSlots = () => {
        const arr = [];
        for(let i = 0; i < unavailable_ts.length; i++) {
            arr.push(unavailable_ts[i].slot_id);
        }

        const validTimeSlots = timeSlots.filter(timeslot => !arr.includes(timeslot.slot_id)) 
        setTerminSlots(validTimeSlots);
    }

    const pickDate = (timeslot) => {
        // Bereite Datums- und Zeitinformationen vor - mit Zeitzonenkorrektur
        const formattedDate = formatDateToYYYYMMDD(date);
        
        // Extrahiere nur die Startzeit, handle verschiedene Zeitformate
        let timeString = timeslot.time;
        
        // Wenn es ein Zeitbereich ist (z.B. "10:00 - 10:30"), nehme nur die Startzeit
        if (timeString.includes(' - ')) {
            timeString = timeString.split(' - ')[0];
        }
        
        // Entferne führende Nullen und normalisiere das Format für die Datenbank
        // Beispiel: "9:00" -> "09:00", "01:30" bleibt "01:30"
        const [hours, minutes] = timeString.split(':');
        const normalizedTime = `${hours.length === 1 ? '0' + hours : hours}:${minutes}`;
        
        // Aktualisiere den StepsContext
        const dateString = {id: 42, title: `Date: ${date.toString().slice(0, 16)} at ${normalizedTime}`};
        const newArr = steps.filter(step => step.id != 42);
        const idInSteps = steps.filter(step => step.id == 42);
        
        // Update Steps Context
        idInSteps.length > 0 ? setSteps([...newArr, dateString]) : setSteps([...steps, dateString]);
        
        // Update BookingContext
        setBookingDetails(prev => ({
            ...prev,
            date: formattedDate,
            startTime: normalizedTime // Speichere die Zeit auch direkt im BookingContext
        }));
        
        // Update SalonContext
        setAppointment({
            date: date,
            time: normalizedTime
        });
    }
    
    // Hilfsfunktion zur Formatierung des Datums, die Zeitzonenprobleme vermeidet
    const formatDateToYYYYMMDD = (date) => {
        // Manuelle Formatierung im YYYY-MM-DD Format unter Berücksichtigung der lokalen Zeitzone
        const year = date.getFullYear();
        // getMonth() gibt 0-11 zurück, daher +1
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        sortTimeSlots();
    }, [date])

  return (
    <div >
        <form style={{display: 'flex', height: "30vh", alignItems: "center", gap: "30px"}}>
            <DatePicker 
            onChange={setDate} 
            value={date}
            minDate={new Date()}
            required="true"
            excludeDates="Sat Aug 26 2023 02:14:04 GMT-0700 (Pacific Daylight Time)"
            isOpen={true}
            />
            
            <DropdownButton 
                id="dropdown-item-button" 
                title="Wähle einen Termin"
                onClick={() => setDropdownOpen(true)}
            >
                {
                terminSlots.map(timeslot => {
                    return <Dropdown.ItemText as={Link} to='complete-order'  key={timeslot.id} onClick={() => pickDate(timeslot)} className='time-slot'>{timeslot.time}</Dropdown.ItemText>
                })
                }            
            </DropdownButton>
           
        </form>
        <TimeSlot/>
    </div>
  )
}

export default TimeSlotCalendar