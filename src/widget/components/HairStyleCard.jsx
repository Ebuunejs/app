import Card from 'react-bootstrap/Card';
import { Icon } from '@iconify/react';
import React, { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';


function HairStyleCard({image, title, steps, setSteps, id, idS}) {
  const { bookingDetails } = useContext(BookingContext);
  
  const isInSteps = steps !== null && steps.filter(step => step.id == id);

  const addNremoveSteps = () => {

    if(isInSteps.length == 0) {
        setSteps([...steps, {title, id, idS}])
    } else {
      const newSteps = steps.filter(step => step.id !== id);
      setSteps([...newSteps]);
    }
  }

  return (
    <Card className='hairstyle-card' onClick={addNremoveSteps}>
      <Card.Img variant="top" src={image} style={{width: "17.2  rem", height: "192px", objectFit: "cover"}}/>
      <Card.Body className='card-body'>
        <Card.Title style={{fontWeight: "600", fontSize: "20px", marginRight: "20px"}}>{title}</Card.Title>
        {
          isInSteps.length !== 0 
          ?
            <Icon icon="octicon:verified-16" height={25} width={25}/>
          :
            null
        }
      </Card.Body>
    </Card>
  );
}

export default HairStyleCard;