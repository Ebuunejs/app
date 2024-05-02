import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const BarberCard = (curEmployee) => {

  return (
    <Card className='card' as={Link} to={`${curEmployee.curEmployee.name}-${curEmployee.curEmployee.surname}`}>
        {   
          <>
            <Card.Img variant="top" src={`http://127.0.0.1:8000/api/images/employees/${curEmployee.curEmployee.photo}` } className='card-image' />
            <Card.Body>
                <Card.Text>
                  <b>Name: </b>{curEmployee.curEmployee.name}<br></br>
                  <b>Vorname:</b> {curEmployee.curEmployee.surname}<br></br>
                </Card.Text>
            </Card.Body>
          </>
        }
    </Card>
  )
}

export default BarberCard