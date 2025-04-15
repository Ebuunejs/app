import React,{useState,useEffect} from "react";
import axios from "axios";
import { Button, Modal, Form, Col, Image} from "react-bootstrap";
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
const imageURL = require('../images/employee-2.png');

const initialState={
    name: "",
    description: "",
    price: "",
    duration: ""
}

const AddService = ({show, setShow,changed,setChanged,service,index,update,setUpdate}) => {
    const [state , setState] = useState(initialState);
    const {image_path, name,description,price,duration} = state;
    const [file, setFile] = useState()
    const [error, setError] = useState("");
    const token=localStorage.getItem('user-token');

    const addService = async () => {
        try {
            console.log("updateState: ",update)
            console.log("Data to update: ",state)
            if(update){// update Service
                const response = await axios.post(`${BASE_URL}/services/${index}`, prepareForm(), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });  
                console.log("update: ",response)
                if (response.status === 201) {
                    console.log("update finish")
                    setState(response.data);
                    setChanged(!changed);
                }
                
            }   else{// add new Employee
                    const response = await axios.post(`${BASE_URL}/services`,prepareForm(),{
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                    console.log(response);
                    if (response.status === 201) {
                        setChanged(!changed);
                    } else if(response.status === 200){
                        console.log("Employee not added succesfully");
                    }
                }
                setShow(!show);
                setUpdate(!update);
                resetFields();
                console.log("Proces over");
            } catch (e) {
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
          } else if (file.size > 3000000) {
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
        const formData = new FormData();
        formData.append('name', state.name);
        formData.append('description', state.description);
        formData.append('price', state.price);
        formData.append('duration', state.duration);
        if (file) {  // Stelle sicher, dass `file` hier korrekt verwendet wird
            formData.append('image', file);
        }
        return formData;
    }

    const resetFields = (e) =>{
        setState({
            name: "",
            description: "",
            price: "",
            duration: ""
        });
    }

    function handleClose(){
        try {
            setShow(!show);
            setChanged(!changed);
        
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

    const updateFields = async(e) =>{
        console.log("index",index);
        if(!!index) {

            const response = await axios.get(`${BASE_URL}/services/${index}`,{
            headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
            setState(response.data);
        }
    }

    useEffect(() => {
        updateFields();
    }, [update, index])

  return (
    <Modal show={show} >
            <Modal.Header>
                <Modal.Title>Dienstleistung hinzufügen: </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
                <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                    <Form.Control placeholder="Name" type="file" name="image_path" onChange={handlePicInput}/>
                </Form.Group>
                
                <Col xs={6} md={4}>
                    <Image src={file ? URL.createObjectURL(file) : null} style={{border:"none", borderRadius:"50%",height:"50px"}}  />
                    <label name="error" placeholder="File Ok!">{error}</label>
                </Col>

                <Form.Control type="text" placeholder="Dienstleistungen" name="name" onChange={handleInputChange} value={name}/>
                
                <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                    <Form.Control placeholder="Beschreibung" 
                    as="textarea"
                    style={{ height: '100px' }}
                    name="description" 
                    onChange={handleInputChange} 
                    value={description}/>
                </Form.Group>
            
                <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                    <Form.Control type="text" placeholder="Preis" name="price" onChange={handleInputChange} value={price}/>
                    <Form.Control type="text" placeholder="Dauer" name="duration" onChange={handleInputChange} value={duration}/>
                </Form.Group>
            </Modal.Body>
                    
            <Modal.Footer>  
                <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleClose}>Close</Button>
                <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={addService}>Save</Button>
            </Modal.Footer>
            
        </Modal>
  )
}

export default AddService

/*

{uploadedFileURL && <img src={uploadedFileURL} alt="Uploaded content"/>}

*/