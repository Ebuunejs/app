import React,{useEffect, useState} from "react";
import { useNavigate ,useLocation} from "react-router-dom";
import {Container} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import axios from "axios";
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
//const BASE_URL = "http://4pixels.ch/friseur/api"; 

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

function UpdateKunde() {  
    const navigate = useNavigate();
    const [data, setData] = useState(initialState);
    const {name, surname,email,password,phone,country, city,street,plz} = data;
    const idx = useLocation();

    const fetchUsers = async () => {
        try {
            const status = idx.state.status;
            console.log("status: ",status, " index: ",idx.state.id);
            switch (status) {
            case 'update':
                const response = await axios.get(`${BASE_URL}/users/${idx.state.id}`);
                if (response.status === 200) {
                    setData(response.data);
                    updateFields(response);
                }
                break;
            case 'add':
                console.log('add');
                break;
            default:
                console.log(`Sorry, we are out of ${status}.`);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const updateFields= async(response)=>{
        console.log("update: ",response);
        data.name=response.data[0].name;
        data.surname=response.data[0].surname;
        data.email=response.data[0].email;
        data.phone=response.data[0].phone;
        data.password=response.data[0].password;

        data.country=response.data[1].country;
        data.city=response.data[1].city;
        data.street=response.data[1].street;
        data.plz=response.data[1].plz;
    }
    
    const addContact = async (data)=>{
        try {
            console.log(data)
            const response = await axios.post(`${BASE_URL}/users`,data);
            if (response.status === 201) {
                console.log("AddContact")
                setData(response.data);
                navigate('/user');
            }
        } catch (e) {
            console.error(e)
        }
    }

    const updateContact = async (data)=>{
        try {
            const date= new Date(new Date().setHours(new Date().getHours() + 1));
            console.log("Datum: ",date)
            console.log(data);
            const response = await axios.put(`${BASE_URL}/users/${idx.state.id}`,data);
            console.log(response)
            if (response.status === 201) {
                console.log("UpdateContact")
                setData(response.data);
                navigate('/user');
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log(
            "name: ",name,
            "surname: ",surname,
            "email: ",email,
            "password: ",password,
            "plz: ",plz,
            "phone: ",phone
        );
        if(!name || !surname || !email || !password || !plz || !phone){
            console.log("Bitte alle Felder ausfüllen!")
        }else{
            const status = idx.state.status;
            console.log("status: ",status);
            if(status === "add"){
                addContact(data);
                console.log("add");
            }else if(status === "update"){
                console.log("update");
                updateContact(data);
            }
            console.log("aussen");
        }
       
    }

    useEffect(() => {
        console.log("Start update")
        fetchUsers();
    }, [])

    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setData({ ...data, [name]: value});
    }

    const cancelProcess = (e) =>{
        console.log("abgebrochen");
        navigate('/user');
    }

    return (
        <React.Fragment>
            <Container className='py-5'>
            <h3 className='fw-normal'>neuen Kunden hinzufügen</h3>
                <Form>
                    <Row className="mb-3" >
                        <Form.Group as={Col} md="4">
                                <Form.Control type="text" placeholder="Nachname" onChange={handleInputChange} name="name" value={name}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4" >
                                <Form.Control type="text" placeholder="Vorname"  onChange={handleInputChange} name="surname" value={surname}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4">
                                <Form.Control type="text" placeholder="Land" onChange={handleInputChange} name="country" value={country}/>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3" >
                        <Form.Group as={Col} md="4">
                                <Form.Control type="text" placeholder="Ort" onChange={handleInputChange} name="city" value={city}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="place">
                                <Form.Control type="text" placeholder="Strasse" onChange={handleInputChange} name="street" value={street}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4">
                                <Form.Control type="text" placeholder="PLZ" onChange={handleInputChange} name="plz" value={plz}/>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3" >
                        <Form.Group as={Col} md="4" >
                                <Form.Control type="text" placeholder="Telefonnummer" onChange={handleInputChange} name="phone" value={phone}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4" >
                                <Form.Control type="text" placeholder="Email" onChange={handleInputChange} name="email" value={email}/>
                        </Form.Group>
                        <Form.Group as={Col} md="4">
                                <Form.Control type="password" placeholder="Password" onChange={handleInputChange} name="password" value={password}/>
                        </Form.Group>
                    </Row>
                    
                    <Row className="d-flex justify-content-center" >
                        <Form.Group as={Col} md="5" className="d-flex justify-content-center gap-3"  >
                            <Button variant="primary"onClick={handleSubmit}>sichern</Button>
                            <Button variant="danger" onClick={cancelProcess}>abbrechen</Button>
                        </Form.Group>
                    </Row>
                </Form>
            </Container>
        </React.Fragment>
        );
  };

export default UpdateKunde
