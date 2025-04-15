import React, { useState,useEffect } from 'react'
import { Button} from "react-bootstrap";
import moment from 'moment';
import '../../App.css';

const TimeSlot = () => {

  let inTime = "08:00 Am"
  let outTime = "05:00 Pm"
  const timSlotDuration = 30;

  const [slots, setSlots] = useState([]);
  const [disabledSlots, setDisabledSlots] = useState(["09:00 am", "01:00 pm"]); // Beispiel für deaktivierte Slots

  function intervals(startString, endString,timSlotDuration) {
    var start = moment(startString, 'hh:mm a');
    var end = moment(endString, 'hh:mm a');
    start.minutes(Math.ceil(start.minutes() / timSlotDuration) * timSlotDuration);

    var current = moment(start);

    while (current <= end) {
      if (!slots.includes(current.format('hh:mm a'))) {
        slots.push(current.format('hh:mm a'));
      }
      current.add(timSlotDuration, 'minutes');
    }

    return slots;
  }
  
  useEffect(() => {
    setSlots(intervals(inTime, outTime,timSlotDuration));
  }, []);

  function checkTimeSlot(time, index){
    if (disabledSlots.includes(time)) {
      return; // Verhindert weitere Ausführung, wenn der Slot deaktiviert ist
    }
  }

  return (
    <div>
      <h1>Wähle einen Termin:</h1>
      <div className='slots'>
        {
          slots && slots.length > 0 ? slots.map((time, index) => {
            return (
              <div key={index}>
               <button 
                    onClick={() => !disabledSlots.includes(time) && checkTimeSlot(time, index)}
                    disabled={disabledSlots.includes(time)}
                    >
                    {time}
                </button>
              </div>
            )
          }) : null
        }
      </div>
    </div>
  )
}

export default TimeSlot;