import React,{useState,useEffect} from "react";
import axios from "axios";
import { Button, Modal, Form, Col,Image} from "react-bootstrap";
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const initialState={
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    path: ""
}

const AddEmployee = ({show, setShow,changed,setChanged,index,update,setUpdate}) => {
    const [state , setState] = useState(initialState);
    const {name, surname,email,phone,password,role,path} = state;
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const token=localStorage.getItem('user-token');

    const addEmployee = async (e) => {
        e.preventDefault();
        try {
            if(update){ // update Employee
                console.log("update")
                
                // Erstelle ein FormData-Objekt
                const formData = prepareForm();
                
                // Füge ein Flag hinzu, das angibt, ob das Bild aktualisiert werden soll
                formData.append("should_update_image", file !== null);
                
                // Füge ein zusätzliches Flag für den Umgang mit unlink-Berechtigungsproblemen hinzu
                formData.append("skip_unlink", true);
                
                console.log("FormData erstellt, führe API-Aufruf durch...");
                
                const response = await axios.post(`${BASE_URL}/employee/${index}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });  
                console.log("Response",response)
                if (response.status === 201) {
                    console.log("update finish")
                    setState(response.data);
                    setChanged(!changed);
                }
                resetFields();
            }else{ // add new Employee
                const response = await axios.post(`${BASE_URL}/employee`,prepareForm(),{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data',
                    },
                  });
                if (response.status === 200) {
                    setChanged(!changed);
                } else if(response.status === 201){
                    console.log("Employee not added succesfully");
                }
            }
            setShow(!show);
            setUpdate(!update);
            console.log("Proces over");
        } catch (e) {
            console.error("Fehler beim Hinzufügen/Aktualisieren des Mitarbeiters:", e);
            // Zeige einen Fehler an, falls der Server einen zurückgibt
            if (e.response && e.response.data && e.response.data.message) {
                setError(e.response.data.message);
            } else {
                setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
            }
        }
    }

    function prepareForm(){
        const fd = new FormData();
        // Nur hinzufügen, wenn ein File ausgewählt wurde
        if (file) {
            fd.append("image", file);
        }
        fd.append("name", name);
        fd.append("surname", surname);
        fd.append("email", email);
        fd.append("phone", phone);
        // Nur Passwort senden, wenn es nicht leer ist
        if (password && password.trim() !== '') {
            fd.append("password", password);
        }
        return fd;
    }
    
    function handleClose(){
        try {
            setShow(!show);
            setUpdate(!update);
            resetFields();
        } catch (e) {
            console.error(e)
        }
    }

    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setState({ ...state, [name]: value});
    }

    const resetFields = (e) =>{
        setState({
            name: "",
            surname: "",
            email: "",
            password: "",
            phone: "",
            path: ""
        });
    }

    const updateFields = async(e) =>{
        if(!!index) {
            console.log("Update Index: ",index)
            const response = await axios.get(`${BASE_URL}/employee/${index}`,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
              });
            setState(response.data);
            console.log("Response Update: ",response.data)
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
/*
      unten onChange={e => setFile(URL.createObjectURL(e.target?.files[0]))}
*/

    useEffect(() => {
        updateFields();
    }, [update, index])

  return (
    <Modal show={show} >
            <Modal.Header>
                <Modal.Title>Mitarbeiter hinzufügen: </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
            
            <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                <Form.Control placeholder="Name" type="file"  name="photo" id="profile_img" onChange={handlePicInput}/>
            </Form.Group>

            <Col xs={6} md={4}>
                <Image src={file ? URL.createObjectURL(file) : null} style={{border:"none", borderRadius:"50%",height:"50px"}}  alt="Photo" type="file"/>
                <label name="error" placeholder="File Ok!">{error}</label>
            </Col>

            <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                <Form.Control placeholder="Name" name="name" onChange={handleInputChange} value={name}/>
                <Form.Control placeholder="Vorname" name="surname"  onChange={handleInputChange} value={surname}/>
            </Form.Group>
            
            <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                <Form.Control placeholder="Email" name="email" onChange={handleInputChange} value={email}/>
                <Form.Control placeholder="Telefon" name="phone" onChange={handleInputChange} value={phone}/>
            </Form.Group>
            <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                <Form.Control type="password" placeholder="Password" name="password" onChange={handleInputChange} value={password}/>
                <Form.Control type="password" placeholder="Password bestätigen" name="password2"/>
            </Form.Group>
            </Modal.Body>
                    
            <Modal.Footer>
                <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleClose}>Close</Button>
                <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={addEmployee}>Save</Button>
            </Modal.Footer>
            
        </Modal>
  )
}

export default AddEmployee