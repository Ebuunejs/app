
import React,{useState,useEffect} from "react";
import { Container, Button, Form, Col, Row} from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const initialState={
    name: "",
    surname: "",
    email: "",
    password:"",
    phone: "",
    role:"employee",
    country:"",
    city:"",
    street:"",
    plz:"",
}


function PortalCompany() {
    const [data, setData] = useState(initialState);
    const {name, surname,email,password,phone,country, city,street,plz} = data;

    const addTimeSlot = (initialTimeSlot) => {
        //setTimeSlots([...timeSlot, initialTimeSlot]);
        //setTimeSlots(initialTimeSlot);
    }
    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setData({ ...data, [name]: value});
    }

    useEffect(() => {
        addTimeSlot();
    }, [])

    return (
        <React.Fragment>
           <Container className='py-5'>
                <h3 className='fw-normal'>Firmendaten</h3>
                <div className="d-flex flex-row-reverse">
                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}} onClick={addTimeSlot}><FontAwesomeIcon icon={faPlus} /> </Button>
                </div>
                <hr/>
                <div className="d-flex flex-row">
                <Form style={{border:"solid"}} name="test" >
                    <h4 className='fw-normal'>Öffnungszeiten:</h4>
                        <Row className="mb-3" >
                            <Form.Label>Vormittag:</Form.Label>
                                <Form.Group as={Col} md="4">
                                        <Form.Control type="text" placeholder="08:00" onChange={handleInputChange} name="name" value={name}/>
                                </Form.Group>
                                <Form.Group as={Col} md="4" >
                                        <Form.Control type="text" placeholder="12:00"  onChange={handleInputChange} name="surname" value={surname}/>
                                </Form.Group>
                        </Row>
                        <Row className="mb-3" >
                            <Form.Label>Mittagspause:</Form.Label>
                                <Form.Group as={Col} md="4">
                                        <Form.Control type="text" placeholder="12:00" onChange={handleInputChange} name="name" value={name}/>
                                </Form.Group>
                                <Form.Group as={Col} md="4" >
                                        <Form.Control type="text" placeholder="13:00"  onChange={handleInputChange} name="surname" value={surname}/>
                                </Form.Group>
                        </Row>
                        <Row className="mb-3" >
                            <Form.Label>Nachmittag:</Form.Label>
                                <Form.Group as={Col} md="4">
                                        <Form.Control type="text" placeholder="13:00" onChange={handleInputChange} name="name" value={name}/>
                                </Form.Group>
                                <Form.Group as={Col} md="4">
                                        <Form.Control type="text" placeholder="18:00"  onChange={handleInputChange} name="surname" value={surname}/>
                                </Form.Group>
                                <Form.Group as={Col} md="2">
                                <Button style={{backgroundColor:"#7DB561",border:"none"}} onClick={addTimeSlot}>Update</Button>
                                </Form.Group>
                        </Row>
                </Form>
                   
                    <Form style={{border:"solid"}} name="test" >
                    <h4 className='fw-normal'>Betriebsferien:</h4>
                        <Row className="mb-3" >
                                <Form.Label>von:</Form.Label>
                                <Form.Group as={Col} md="6">
                                    <Form.Control type="date" value={data} onChange={(e) => setData(e.target.value)}/>
                                </Form.Group>
                                <Form.Label>bis:</Form.Label>
                                <Form.Group as={Col} md="6">
                                    <Form.Control type="date" onChange={(e) => setData(e.target.value)}/>
                                </Form.Group>
                        </Row>
                    </Form>
                </div>
            </Container>
        </React.Fragment>
        );
      };

  export default PortalCompany

