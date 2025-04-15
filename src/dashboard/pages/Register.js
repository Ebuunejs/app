import axios from "axios";
import React from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const image = require('../images/logo.png');
    const loginAPI = 'http://127.0.0.1:8000/api/auth/login';
    const navigate = useNavigate();
    const submitRegForm = (event) => {
        event.preventDefault();
        const formElement = document.querySelector('#loginForm');
        const formData = new FormData(formElement);
        const formDataJSON = Object.fromEntries(formData);
        const btnPointer = document.querySelector('#login-btn');
        btnPointer.innerHTML = 'Please wait..';
        btnPointer.setAttribute('disabled', true);
        console.log("Formdata ",formDataJSON);
        axios.get(loginAPI, formDataJSON).then((response) => {
            btnPointer.innerHTML = 'Login';
            btnPointer.removeAttribute('disabled');
            console.log("Loginresponse: ",response);
            const data = response.data;
            const token = data.token;
            if (!token) {
                alert('Unable to login. Please try after some time.');
                return;
            }
            localStorage.clear();
            localStorage.setItem('user-token', token);
            setTimeout(() => {
                navigate('/');
            }, 500);
    }).catch((error) => {
            btnPointer.innerHTML = 'Login';
            btnPointer.removeAttribute('disabled');
            alert("Ooops! Some error occured.");
        });
    }
    return (
        <React.Fragment>
            <Container className="my-5" >
                <img
                    className="fw-normal mb-5" 
                    src={image}
                    alt="Your Company"
                />
                <Row>
                    <Col md={{span: 6}}>
                        <Form id="loginForm" onSubmit={submitRegForm}>
                            <h2>Bitte registrieren:</h2>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'login-username'}>Username</FormLabel>
                                <input type={'text'} className="form-control" id={'login-username'} name="email" required />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'login-password'}>Password</FormLabel>
                                <input type={'password'} className="form-control" id={'login-password'} name="password" required />
                                <FormLabel htmlFor={'login-password'}>Password bestätigen</FormLabel>
                                <input type={'password'} className="form-control" id={'login-password'} name="password" required />
                            </FormGroup>
                            <FormGroup style={{display:"flex", alignItems:"center", gap:"40px"}}>
                                <Button type="submit" className="btn-success mt-2" id="login-btn" style={{backgroundColor:"#7DB561",border:"none"}}>registrieren</Button>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}
export default Register;