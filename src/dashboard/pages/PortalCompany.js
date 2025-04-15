import React, { useState, useEffect } from "react";
import { Container, Button, Form, Col, Row, Card, Table, Badge, Modal } from "react-bootstrap";
import { faPlus, faEdit, faTrash, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const initialState = {
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    role: "employee",
    country: "",
    city: "",
    street: "",
    plz: "",
};

// Mock-Daten für Mitarbeiter
const initialEmployees = [
    { id: 1, name: "Max", surname: "Mustermann", email: "max@example.com", position: "Friseur" },
    { id: 2, name: "Anna", surname: "Schmidt", email: "anna@example.com", position: "Kosmetikerin" }
];

function PortalCompany() {
    const [data, setData] = useState(initialState);
    const { name, surname, email, password, phone, country, city, street, plz } = data;
    
    // Zustand für Öffnungszeiten mit mehreren Zeitslots
    const [openingHours, setOpeningHours] = useState([
        { id: 1, day: "Montag", slots: [{ start: "08:00", end: "12:00", type: "work" }, { start: "12:00", end: "13:00", type: "pause" }, { start: "13:00", end: "18:00", type: "work" }] },
        { id: 2, day: "Dienstag", slots: [{ start: "08:00", end: "12:00", type: "work" }, { start: "12:00", end: "13:00", type: "pause" }, { start: "13:00", end: "18:00", type: "work" }] },
        { id: 3, day: "Mittwoch", slots: [{ start: "08:00", end: "12:00", type: "work" }, { start: "12:00", end: "13:00", type: "pause" }, { start: "13:00", end: "18:00", type: "work" }] },
        { id: 4, day: "Donnerstag", slots: [{ start: "08:00", end: "12:00", type: "work" }, { start: "12:00", end: "13:00", type: "pause" }, { start: "13:00", end: "18:00", type: "work" }] },
        { id: 5, day: "Freitag", slots: [{ start: "08:00", end: "12:00", type: "work" }, { start: "12:00", end: "13:00", type: "pause" }, { start: "13:00", end: "18:00", type: "work" }] },
        { id: 6, day: "Samstag", slots: [{ start: "08:00", end: "14:00", type: "work" }] },
        { id: 7, day: "Sonntag", slots: [] }
    ]);

    // Betriebsferien
    const [companyHolidays, setCompanyHolidays] = useState([
        { id: 1, start: "2023-12-24", end: "2023-12-26", description: "Weihnachten" },
        { id: 2, start: "2023-12-31", end: "2024-01-02", description: "Neujahr" }
    ]);
    const [newHoliday, setNewHoliday] = useState({ start: "", end: "", description: "" });

    // Mitarbeiter-Urlaubszeiten
    const [employees, setEmployees] = useState(initialEmployees);
    const [employeeVacations, setEmployeeVacations] = useState([
        { id: 1, employeeId: 1, start: "2023-10-15", end: "2023-10-28", description: "Sommerurlaub" },
        { id: 2, employeeId: 2, start: "2023-11-20", end: "2023-11-24", description: "Familienurlaub" }
    ]);
    const [newVacation, setNewVacation] = useState({ employeeId: "", start: "", end: "", description: "" });

    // Modals
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [showVacationModal, setShowVacationModal] = useState(false);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [currentDay, setCurrentDay] = useState(null);
    const [currentTimeSlot, setCurrentTimeSlot] = useState({ start: "", end: "", type: "work" });
    const [editingSlotIndex, setEditingSlotIndex] = useState(-1);

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    // Handling für Betriebsferien
    const handleHolidayChange = (e) => {
        const { name, value } = e.target;
        setNewHoliday({ ...newHoliday, [name]: value });
    };

    const addHoliday = () => {
        if (newHoliday.start && newHoliday.end) {
            const holiday = {
                id: companyHolidays.length + 1,
                ...newHoliday
            };
            setCompanyHolidays([...companyHolidays, holiday]);
            setNewHoliday({ start: "", end: "", description: "" });
            setShowHolidayModal(false);
        }
    };

    const deleteHoliday = (id) => {
        setCompanyHolidays(companyHolidays.filter(holiday => holiday.id !== id));
    };

    // Handling für Mitarbeiter-Urlaub
    const handleVacationChange = (e) => {
        const { name, value } = e.target;
        setNewVacation({ ...newVacation, [name]: value });
    };

    const addVacation = () => {
        if (newVacation.employeeId && newVacation.start && newVacation.end) {
            const vacation = {
                id: employeeVacations.length + 1,
                ...newVacation
            };
            setEmployeeVacations([...employeeVacations, vacation]);
            setNewVacation({ employeeId: "", start: "", end: "", description: "" });
            setShowVacationModal(false);
        }
    };

    const deleteVacation = (id) => {
        setEmployeeVacations(employeeVacations.filter(vacation => vacation.id !== id));
    };

    // Handling für Zeitslots
    const openTimeSlotModal = (dayId, slotIndex = -1) => {
        const day = openingHours.find(d => d.id === dayId);
        setCurrentDay(day);
        
        if (slotIndex >= 0 && day.slots[slotIndex]) {
            setCurrentTimeSlot(day.slots[slotIndex]);
            setEditingSlotIndex(slotIndex);
        } else {
            setCurrentTimeSlot({ start: "", end: "", type: "work" });
            setEditingSlotIndex(-1);
        }
        
        setShowTimeSlotModal(true);
    };

    const handleTimeSlotChange = (e) => {
        const { name, value } = e.target;
        setCurrentTimeSlot({ ...currentTimeSlot, [name]: value });
    };

    const saveTimeSlot = () => {
        if (currentDay && currentTimeSlot.start && currentTimeSlot.end) {
            const updatedHours = openingHours.map(day => {
                if (day.id === currentDay.id) {
                    if (editingSlotIndex >= 0) {
                        // Bearbeitung eines bestehenden Slots
                        const updatedSlots = [...day.slots];
                        updatedSlots[editingSlotIndex] = currentTimeSlot;
                        return { ...day, slots: updatedSlots };
                    } else {
                        // Hinzufügen eines neuen Slots
                        return { ...day, slots: [...day.slots, currentTimeSlot] };
                    }
                }
                return day;
            });
            
            setOpeningHours(updatedHours);
            setShowTimeSlotModal(false);
        }
    };

    const deleteTimeSlot = (dayId, slotIndex) => {
        const updatedHours = openingHours.map(day => {
            if (day.id === dayId) {
                const updatedSlots = day.slots.filter((_, index) => index !== slotIndex);
                return { ...day, slots: updatedSlots };
            }
            return day;
        });
        
        setOpeningHours(updatedHours);
    };

    // Hilfsfunktion zum Finden des Mitarbeiternamens nach ID
    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === parseInt(employeeId));
        return employee ? `${employee.name} ${employee.surname}` : "Unbekannt";
    };

    return (
        <React.Fragment>
           <Container className='py-5'>
                <h3 className='fw-normal'>Firmendaten</h3>
                <hr/>

                {/* Öffnungszeiten */}
                <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                        <h4 className='mb-0'>Öffnungszeiten mit Pausen</h4>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>Zeitslots</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {openingHours.map(day => (
                                    <tr key={day.id}>
                                        <td>{day.day}</td>
                                        <td>
                                            {day.slots.length === 0 ? (
                                                <Badge bg="secondary">Geschlossen</Badge>
                                            ) : (
                                                day.slots.map((slot, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        bg={slot.type === "work" ? "success" : "warning"}
                                                        className="me-2 mb-1"
                                                    >
                                                        {slot.start} - {slot.end}
                                                        {slot.type === "pause" && " (Pause)"}
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="p-0 ms-1" 
                                                            onClick={() => openTimeSlotModal(day.id, index)}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="text-white" />
                                                        </Button>
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="p-0 ms-1" 
                                                            onClick={() => deleteTimeSlot(day.id, index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-white" />
                                                        </Button>
                                                    </Badge>
                                                ))
                                            )}
                                        </td>
                                        <td>
                                            <Button 
                                                size="sm" 
                                                variant="outline-primary" 
                                                onClick={() => openTimeSlotModal(day.id)}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Zeitslot
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Betriebsferien */}
                <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                        <h4 className='mb-0'>Betriebsferien</h4>
                        <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => setShowHolidayModal(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Neue Ferien
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Von</th>
                                    <th>Bis</th>
                                    <th>Beschreibung</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companyHolidays.map(holiday => (
                                    <tr key={holiday.id}>
                                        <td>{holiday.start}</td>
                                        <td>{holiday.end}</td>
                                        <td>{holiday.description}</td>
                                        <td>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                onClick={() => deleteHoliday(holiday.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Mitarbeiter-Urlaub */}
                <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                        <h4 className='mb-0'>Mitarbeiter-Urlaub</h4>
                        <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => setShowVacationModal(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Neuer Urlaub
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Mitarbeiter</th>
                                    <th>Von</th>
                                    <th>Bis</th>
                                    <th>Beschreibung</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeVacations.map(vacation => (
                                    <tr key={vacation.id}>
                                        <td>{getEmployeeName(vacation.employeeId)}</td>
                                        <td>{vacation.start}</td>
                                        <td>{vacation.end}</td>
                                        <td>{vacation.description}</td>
                                        <td>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                onClick={() => deleteVacation(vacation.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>

            {/* Modal für Betriebsferien */}
            <Modal show={showHolidayModal} onHide={() => setShowHolidayModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Betriebsferien hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Von</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="start" 
                                value={newHoliday.start} 
                                onChange={handleHolidayChange}
                                required
                            />
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bis</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="end" 
                                value={newHoliday.end} 
                                onChange={handleHolidayChange}
                                required
                            />
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Beschreibung</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="description" 
                                value={newHoliday.description} 
                                onChange={handleHolidayChange}
                                placeholder="z.B. Weihnachtsferien"
                            />
                                </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHolidayModal(false)}>
                        <FontAwesomeIcon icon={faTimes} /> Abbrechen
                    </Button>
                    <Button variant="success" onClick={addHoliday}>
                        <FontAwesomeIcon icon={faSave} /> Speichern
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal für Mitarbeiter-Urlaub */}
            <Modal show={showVacationModal} onHide={() => setShowVacationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mitarbeiter-Urlaub hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Mitarbeiter</Form.Label>
                            <Form.Select 
                                name="employeeId" 
                                value={newVacation.employeeId} 
                                onChange={handleVacationChange}
                                required
                            >
                                <option value="">Bitte wählen...</option>
                                {employees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.name} {employee.surname} ({employee.position})
                                    </option>
                                ))}
                            </Form.Select>
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Von</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="start" 
                                value={newVacation.start} 
                                onChange={handleVacationChange}
                                required
                            />
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bis</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="end" 
                                value={newVacation.end} 
                                onChange={handleVacationChange}
                                required
                            />
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Beschreibung</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="description" 
                                value={newVacation.description} 
                                onChange={handleVacationChange}
                                placeholder="z.B. Sommerurlaub"
                            />
                                </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVacationModal(false)}>
                        <FontAwesomeIcon icon={faTimes} /> Abbrechen
                    </Button>
                    <Button variant="success" onClick={addVacation}>
                        <FontAwesomeIcon icon={faSave} /> Speichern
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal für Zeitslots */}
            <Modal show={showTimeSlotModal} onHide={() => setShowTimeSlotModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingSlotIndex >= 0 ? "Zeitslot bearbeiten" : "Zeitslot hinzufügen"}
                        {currentDay && ` für ${currentDay.day}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Start</Form.Label>
                            <Form.Control 
                                type="time" 
                                name="start" 
                                value={currentTimeSlot.start} 
                                onChange={handleTimeSlotChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ende</Form.Label>
                            <Form.Control 
                                type="time" 
                                name="end" 
                                value={currentTimeSlot.end} 
                                onChange={handleTimeSlotChange}
                                required
                            />
                                </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Typ</Form.Label>
                            <Form.Select 
                                name="type" 
                                value={currentTimeSlot.type} 
                                onChange={handleTimeSlotChange}
                            >
                                <option value="work">Arbeitszeit</option>
                                <option value="pause">Pause</option>
                            </Form.Select>
                                </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTimeSlotModal(false)}>
                        <FontAwesomeIcon icon={faTimes} /> Abbrechen
                    </Button>
                    <Button variant="success" onClick={saveTimeSlot}>
                        <FontAwesomeIcon icon={faSave} /> Speichern
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
        );
}

export default PortalCompany;

