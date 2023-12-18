import React, { useContext, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import { StepsContext } from '../context/BookingStepsContext';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const BookingSteps = ({ next }) => {
  const [ steps, setSteps ] = useContext(StepsContext);

  return (
    <ListGroup id="booking-steps">
        <h4>Your Booking</h4>
        {steps && steps.map((step, i) => {
            return <ListGroup.Item key={step.id}><span>{i + 1}</span> {step.title}</ListGroup.Item>
        })}
        {next && 
        <ListGroup.Item>
          <Button as={Link} to='complete-order' variant='primary'>Next</Button>
        </ListGroup.Item>
        }
    </ListGroup>
  )
}

export default BookingSteps