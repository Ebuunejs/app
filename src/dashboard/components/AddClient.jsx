import {React,useEffect, useState} from "react";
import { Button, Modal, Form, Col,Image} from "react-bootstrap";
import Row from 'react-bootstrap/Row';
import axios from "axios";

// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
const token=localStorage.getItem('user-token');

const initialState={
    photo: "",
    name: "",
    surname: "",
    country:"",
    city:"",
    plz:"",
    street:"",
    phone: "",
    email: "",
    password:"",
    password2:"",
    birth:"",
}

const AddClient = ({show, setShow,update,setUpdate,title,setTitle,index,setIndex}) => {
    const [data, setData] = useState(initialState);
    const {photo,name, surname,country, city,plz,street,phone,email,password,password2,birth} = data;
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [date, setDate] = useState(new Date());


    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setData({ ...data, [name]: value});
    }

    function handleClose(){
        try {
            setUpdate(!update);
            setShow(!show);
            resetFields();
        } catch (e) {
            console.error(e)
        }
    }

    const addClient = async(e) =>{
        e.preventDefault();
        try{
            const fd = prepareForm();
            console.log("FD ",fd)
            // Überprüfe, ob FormData erfolgreich befüllt wurde
            if (fd.entries().next().value) {
                if(!!index){// update Client
                    console.log("update");
                    const response = await axios.post(`${BASE_URL}/client/${index}`, fd, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });  
                    console.log("Response",response)
                    if (response.status === 201) {
                        console.log("update finish");
                        //setState(response.data);
                        //setChanged(!changed);
                        setData(response.data);
                        setUpdate(!update);
                        updateFields(response);
                    }
                    
                }else{
                    // add new Client
                    console.log("add");
                    var response = await axios.post(`${BASE_URL}/client`, fd, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    console.log("Add Client finished")
                    if (response.status === 201) {
                        console.log("Add finish");
                        setData(response.data);
                        updateFields(response);
                        //setChanged(!changed);
                        //setUpdate(!update);
                    }
                }
                
            }else {
                console.error("FormData is empty");
            }
            handleClose();
            console.log(response);
        }catch (e) {
            console.error(e)
        }
    }

    function handlePicInput  (event) {
        const file = event.target.files ? event.target.files[0] : null;
        let validation =  validateFile(file);
        console.log("validation: ", validation);
        if(validation != 0){
            let images = event.target.files[0];
            setFile(images);
        }else{
            console.log("File ist not valid")
        }
    }
    
    function validateFile (file) {
        console.log(file.size)
        if (file) {
          if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return 0;
          } else if (file.size > 1000000) {
            setError("File size is too large");
            return 0;
          } else {
            setFile(file);
            setError("");
            return 1;
          }
        }
      }

    function prepareForm(){
        const fd = new FormData();
        // Sicherstellen, dass die Variablen korrekt initialisiert sind
        /*const file = document.querySelector('input[name="photo"]').files[0];
        const name = document.querySelector('input[name="name"]').value;
        const surname = document.querySelector('input[name="surname"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const phone = document.querySelector('input[name="phone"]').value;
        const password = document.querySelector('input[name="password"]').value;
        const date = document.querySelector('input[name="birth"]').value;
        const country = document.querySelector('input[name="country"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const plz = document.querySelector('input[name="plz"]').value;
        const street = document.querySelector('input[name="street"]').value;*/
        // Überprüfen, ob die Variablen Werte enthalten
        if (!name || !surname || !email || !phone || !date) {
            console.error("Some fields are missing values");
            return fd;
        }

        fd.append("image", file);
        fd.append("name", name);
        fd.append("surname", surname);
        fd.append("email", email);
        fd.append("phone", phone);
        fd.append("password", password);
        fd.append("birth", date);
        fd.append("signature", name);
        fd.append("country", country);
        fd.append("city", city);
        fd.append("plz", plz);
        fd.append("street", street);
        fd.append("businesses_id", 1);
        fd.append("employees_id", 2);
        console.log("DataSend: ", Array.from(fd.entries()));
        return fd;
    }

    const resetFields = (e) =>{
        setIndex(null);
        setData({
            photo: "",
            name: "",
            surname: "",
            country:"",
            city:"",
            plz:"",
            street:"",
            phone: "",
            email: "",
            password:"",
            password2:"",
            birth:"",
        });
    }

    const getActClient = async(e) =>{
        console.log("index ",index)
        if(index) {
            console.log("Update Index: ",index)
            const response = await axios.get(`${BASE_URL}/client/${index}`,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            //resetFields();
            //setData(response.data);
            updateFields(response.data);
            console.log("Response Update: ",response.data)
        }
    }

    const updateFields= async(response)=>{
        console.log("updateFields(): ",response);
        if(Array.isArray(response)) {
            setData({
                name: response[0].name,
                surname: response[0].surname,
                email: response[0].email,
                phone: response[0].phone,
                password:response[0].password,
                birth:response[0].date,

                country:response[1].country,
                city:response[1].city,
                street:response[1].street,
                plz:response[1].plz,
            });
        }
    }

    useEffect(() => {
        console.log("UseEffect");
        getActClient();
    }, [update,index])

    return (
        <Modal show={show} >
        <Modal.Header>
            <Modal.Title>{title} </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
                    <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                        <Form.Control placeholder="Name" type="file"  name="photo" id="profile_img" onChange={handlePicInput}/>
                    </Form.Group>

                    <Col xs={6} md={4}>
                        <Image src={file ? URL.createObjectURL(file) : null} style={{border:"none", borderRadius:"50%",height:"50px"}}  alt="Photo" type="file"/>
                        <label name="error" placeholder="File Ok!">{error}</label>
                    </Col>

                    <Row>
                        <Form.Group as={Col} md="6">
                            <Form.Label>Geburtstag:</Form.Label>
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                            <Form.Control type="date" name="birth" value={date} onChange={(e) => setDate(e.target.value)}/>{/*(e) => setDate(e.target.value) */}
                        </Form.Group>
                    </Row>
                 
                    <Row>
                        <Form.Group as={Col} md="6">
                                <Form.Control placeholder="Nachname" onChange={handleInputChange} name="name" value={name}/>
                        </Form.Group>
                        <Form.Group as={Col} md="6" >
                                <Form.Control placeholder="Vorname"  onChange={handleInputChange} name="surname" value={surname}/>
                        </Form.Group>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md="6">
                                <Form.Control placeholder="Land" onChange={handleInputChange} name="country" value={country}/>
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                                <Form.Control placeholder="Ort" onChange={handleInputChange} name="city" value={city}/>
                        </Form.Group>
                    </Row>

                    <Row >
                        <Form.Group as={Col} md="6">
                                <Form.Control placeholder="PLZ" onChange={handleInputChange} name="plz" value={plz}/>
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="place">
                                <Form.Control placeholder="Strasse" onChange={handleInputChange} name="street" value={street}/>
                        </Form.Group>
                        
                    </Row>

                    <Row>
                        <Form.Group as={Col} md="6" >
                                <Form.Control placeholder="Telefonnummer" onChange={handleInputChange} name="phone" value={phone}/>
                        </Form.Group>
                        <Form.Group as={Col} md="6" >
                                <Form.Control placeholder="Email" onChange={handleInputChange} name="email" value={email}/>
                        </Form.Group>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md="6">
                                <Form.Control type="password" placeholder="Password" onChange={handleInputChange} name="password" value={password}/>
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                                <Form.Control type="password" placeholder="Password bestätigen" onChange={handleInputChange} name="password2" value={password2}/>
                        </Form.Group>
                    </Row>
            
        </Modal.Body>
                
        <Modal.Footer>
            <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleClose}>Close</Button>
            <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={addClient}>Save</Button>
        </Modal.Footer>
        
    </Modal>
)
  }

export default AddClient