import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form, Col, Table, Row, Container, Card, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faSearch, faCalendarAlt, faClock, faUser } from "@fortawesome/free-solid-svg-icons";
import AddClient from "../components/AddClient";
import config from '../config';

// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const initialState = {
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
    path: ""
}

const initialTimeSlot = {
    date: '',
    time: '',
    bookings_id: '',
    all_day: '',
    types: ''
}

const timeSlotsArray = [
    { id: "0", time: "00:00" },
    { id: "1", time: "01:00" },
    { id: "2", time: "02:00" },
    { id: "3", time: "03:00" },
    { id: "4", time: "04:00" },
    { id: "5", time: "05:00" },
    { id: "6", time: "06:00" },
    { id: "7", time: "07:00" },
    { id: "8", time: "08:00" },
    { id: "9", time: "09:00" },
    { id: "10", time: "10:00" },
    { id: "11", time: "11:00" },
    { id: "12", time: "12:00" },
    { id: "13", time: "13:00" },
    { id: "14", time: "14:00" },
    { id: "15", time: "15:00" },
    { id: "16", time: "16:00" },
    { id: "17", time: "17:00" },
    { id: "18", time: "18:00" },
    { id: "19", time: "19:00" },
    { id: "20", time: "20:00" },
    { id: "21", time: "21:00" },
    { id: "22", time: "22:00" },
    { id: "23", time: "23:00" },
]

const AddTermin = ({ show, setShow, changed, setChanged, client, setClient, booking, setBooking }) => {
    const [state, setState] = useState(initialState);
    const { searchName, name, surname, email, phone, password, role, path } = state;
    const [showAddClient, setAddClient] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(true);
    const [select, setSelect] = useState(false);
    const [timeSlot, setTimeSlot] = useState(initialTimeSlot);
    const [time, setTime] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    function handleClose() {
        try {
            if (!search) {
                setSearch(true);
            }
            if (select) {
                setSelect(false);
            }
            setShow(false);
            resetFields();
            setError("");
            setSuccessMessage("");
        } catch (e) {
            console.error(e);
        }
    }

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        setState({ ...state, [name]: value });
        if (name === "searchName" && value === "") {
            setClient([]);
        }
    }

    const resetFields = () => {
        setState(initialState);
        setTimeSlot(initialTimeSlot);
        setTime("");
        setDate(new Date().toISOString().split('T')[0]);
    }

    const updateFields = async () => {
        // Future implementation
    }

    const searchClient = async () => {
        try {
            if (!state.searchName || state.searchName.trim() === "") {
                setError("Bitte geben Sie einen Suchbegriff ein");
                return;
            }

            setIsLoading(true);
            setError("");
            const token = localStorage.getItem('user-token');
            const query = state.searchName;

            const response = await axios.get(`${BASE_URL}/search-client/${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setClient(response.data);
                if (response.data.length === 0) {
                    setError("Keine Kunden gefunden. Bitte versuchen Sie einen anderen Suchbegriff oder erstellen Sie einen neuen Kunden.");
                }
            }
        } catch (e) {
            console.error(e);
            setError("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    }

    const addClient = () => {
        try {
            setAddClient(!showAddClient);
        } catch (e) {
            console.error(e);
        }
    }

    const saveTermin = async () => {
        try {
            if (!client || client.length === 0) {
                setError("Bitte wählen Sie einen Kunden aus");
                return;
            }

            if (!date) {
                setError("Bitte wählen Sie ein Datum aus");
                return;
            }

            if (!time) {
                setError("Bitte wählen Sie eine Uhrzeit aus");
                return;
            }

            setIsLoading(true);
            setError("");

            if (!search) {
                setSearch(true);
            }

            const token = localStorage.getItem('user-token');

            booking.businesses_id = 1;
            booking.clients_id = client[0]['id'];
            booking.date = date;
            booking.startTime = time;
            booking.total_time = 20;
            booking.total_price = 25;
            booking.state = "pending";

            const responseBooking = await axios.post(`${BASE_URL}/bookings`, booking, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            timeSlot.date = date;
            timeSlot.bookings_id = responseBooking.data['id'];
            timeSlot.time = time;
            timeSlot.all_day = 0;
            timeSlot.types = "termin";

            await axios.post(`${BASE_URL}/timeslots`, timeSlot, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccessMessage("Termin erfolgreich gespeichert!");
            setTimeout(() => {
                if (select) {
                    setSelect(false);
                }
                setShow(false);
                setChanged(!changed);
                resetFields();
            }, 1500);
        } catch (e) {
            console.error(e);
            setError("Fehler beim Speichern des Termins. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    }

    const getClient = (index) => {
        setSearch(false);
        setSelect(true);
    }

    useEffect(() => {
        updateFields();
    }, []);

    return (
        <Modal show={show} size="lg" centered>
            <Modal.Header className="bg-light">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    Neuen Termin anlegen
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light">
                        <h5 className="mb-0">Kundensuche</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="align-items-end">
                            <Col md={9}>
                                <Form.Group className="mb-0">
                                    <Form.Label>Kundennamen eingeben</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                        <Form.Control 
                                            placeholder="Name oder Telefonnummer" 
                                            type="text" 
                                            name="searchName" 
                                            onChange={handleInputChange} 
                                            value={searchName}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex gap-2">
                                <Button 
                                    variant="primary" 
                                    className="d-flex align-items-center justify-content-center w-100" 
                                    onClick={searchClient}
                                    disabled={isLoading}
                                >
                                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                                    Suchen
                                </Button>
                                <Button 
                                    variant="success" 
                                    className="d-flex align-items-center justify-content-center" 
                                    onClick={addClient}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <AddClient show={showAddClient} setShow={setAddClient} title={"Neuer Kunde"} />

                {search && client && client.length > 0 ? (
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Suchergebnisse</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Vorname</th>
                                        <th>Telefon</th>
                                        <th>Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {client.map((curUser, idx) => (
                                        <tr key={idx}>
                                            <td>{curUser.name}</td>
                                            <td>{curUser.surname}</td>
                                            <td>{curUser.phone}</td>
                                            <td> 
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    onClick={() => getClient(curUser.id)}
                                                >
                                                    <FontAwesomeIcon icon={faPencil} className="me-1" /> Auswählen
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                ) : null}

                {select && (
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Termindetails</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Datum auswählen
                                        </Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            value={date} 
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                            Uhrzeit auswählen
                                        </Form.Label>
                                        <Form.Select 
                                            value={time} 
                                            onChange={(e) => setTime(e.target.value)}
                                        >
                                            <option value="">Bitte wählen</option>
                                            {timeSlotsArray.map(timeSlt => (
                                                <option key={timeSlt.id} value={timeSlt.time}>
                                                    {timeSlt.time}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-light">
                <Button 
                    variant="secondary" 
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Abbrechen
                </Button>
                <Button 
                    variant="success" 
                    onClick={saveTermin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Wird gespeichert...' : 'Termin speichern'}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddTermin
