import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const BarberCard = () => {
  return (
    <Card className='card' as={Link} to='example'>
        <Card.Img variant="top" src="https://media.istockphoto.com/id/1485546774/photo/bald-man-smiling-at-camera-standing-with-arms-crossed.jpg?s=1024x1024&w=is&k=20&c=zvw6qDmYHmIvvCbEn2ZUF0tdSbKPnEWRsVAzd9g4hCM=" className='card-image' />
        <Card.Body>
            <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
            </Card.Text>
        </Card.Body>
    </Card>
  )
}

export default BarberCard