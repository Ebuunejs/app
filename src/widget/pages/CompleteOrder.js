import '../../App.css';
import React, { useState, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import BookingSteps from '../components/BookingSteps';


const CompleteOrder = () => {
  return (
    <div className='order-page'>
        <h4 style={{marginTop: "60px"}}>Customer Account</h4>
        <div className='order-ep'>
            <Form id='complete-order-ep'>
                <Icon icon="mdi:account" height={50} width={220} style={{margin: "17px 0 0 15px"}}/>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Button variant='success' id="complete-order-button">Submit</Button>
                <div style={{width: "65%", margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "center", flexDirection: "column"}}>
                    <Form.Text as={Link} to='/forgot-password'>Forgot password?</Form.Text>
                </div>
            </Form>
           <BookingSteps />
        </div>

        <div className='guest-order'>
            <Form>
                <h4>Your Data</h4>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control placeholder="Enter Name" />
                    </Form.Group>

                    <Form.Group as={Col}>
                    <Form.Label>Surname</Form.Label>
                    <Form.Control placeholder="Enter Surname" />
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridAddress1">
                    <Form.Label>Address</Form.Label>
                    <Form.Control placeholder="1234 Main St" />
                </Form.Group>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridState">
                    <Form.Label>State</Form.Label>
                    <Form.Select defaultValue="Choose...">
                        <option>Choose...</option>
                        <option>...</option>
                    </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control />
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" id="formGridCheckbox">
                    <Form.Check type="checkbox" label="Check me out" />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    </div>
  )
}

export default CompleteOrder