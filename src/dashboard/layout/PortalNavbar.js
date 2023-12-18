import React from "react";
import {Button, Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
const image = require('../images/logo.png');

function PortalNavbar() {
    const navigate = useNavigate();
    
    const logout = () => {
        localStorage.clear();
        navigate('/auth/login');
    }
    return (
        <Navbar bg="light" expand="lg">
            <Container >
                <a href="https://www.4pixels.ch">
                        <img    height="50"
                                className="fw-normal mb-1" 
                                src={image}
                                alt="Your Company"
                        />
                </a>
                <Navbar.Brand href="">Dashboard</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{ maxHeight: '100px' }}
                        navbarScroll
                    >
                        <Nav.Link href="dashboard">Home</Nav.Link>
                        <Nav.Link href="user">Kunden</Nav.Link>
                        <Nav.Link href="statistik">Statistik</Nav.Link>
                        <Nav.Link href="termine">Termine</Nav.Link>
                        
                        <NavDropdown title="Geschäft" id="navbarScrollingDropdown">
                            <NavDropdown.Item href="employee">Mitarbeiter</NavDropdown.Item>
                            <NavDropdown.Item href="company">Firma-Öffnungszeiten</NavDropdown.Item>
                            <NavDropdown.Item href="service">Dienstleistungen</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#">Einstellungen</NavDropdown.Item>
                        </NavDropdown>

                    </Nav>
                    {/*
                    
                    <Form className="d-flex">
                        <Form.Control
                        type="search"
                        placeholder="Search"
                        className="me-2"
                        aria-label="Search"
                        />
                        <Button variant="outline-success">Search</Button>
                    </Form>
                    */}
                    <Nav.Link>
                        <Button style={{backgroundColor:"#BD5450",border:"none"}} onClick={logout}>Logout</Button>
                    </Nav.Link>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default PortalNavbar;