import React,{useState,useEffect} from "react";
import axios from "axios";
import { Button, Modal, Form, Col, Image} from "react-bootstrap";
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
const imageURL = require('../images/employee-2.png');

const initialState={
    path: "",
    name: "",
    description: "",
    price: "",
    duration: ""
}

const AddService = ({show, setShow,changed,setChanged,service,index,update,setUpdate}) => {
    const [state , setState] = useState(initialState);
    const {images_id, name,description,price,duration} = state;
    const [file, setFile] = useState()
    const [uploadedFileURL, setUploadedFileURL] = useState(null)

    function handlePicInput  (event) {
        let images = event.target.files[0];
        setFile(images);
        const imageUrl = URL.createObjectURL(images);
        setUploadedFileURL(imageUrl);
        console.log("Image geladen");
    }

    const handleSubmit = async () =>{
        try {
            let fd = new FormData();
            fd.append("images", file);
            const response = await axios.post(`${BASE_URL}/image`,fd);
            state.images_id=response.data;
            addService();
        } catch (error) {
            console.log(error);
        }
    }

    const addService = async () => {
        try {
            console.log("updateState: ",update)
            if(update){
                const response = await axios.put(`${BASE_URL}/services/${index}`,state);
                console.log(response)
                if (response.status === 201) {
                    console.log("UpdateService")
                    setState(response.data);
                    setUpdate(false);
                    setChanged(!changed);
                }

                setState({
                    images_id: "",
                    name: "",
                    description: "",
                    price: "",
                    duration: ""
                });
            }else{
                console.log(state)
                const response = await axios.post(`${BASE_URL}/services`,state);
                if (response.status === 201) {
                    console.log("Service added succesfully");
                    //setUpdate(false)
                    setChanged(!changed);
                } 
            }
            setShow(!show);
        } catch (e) {
            console.error(e)
        }

    }

    function handleClose(){
        try {
            setShow(!show);
            setState({
                images_id: "",
                name: "",
                description: "",
                price: "",
                duration: ""
            });

        } catch (e) {
            console.error(e)
        }
    }

    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setState({ ...state, [name]: value});
    }

    const updateFields = async(e) =>{
        console.log("index",index)
        if(!!index) {
            const res = await axios.get(`${BASE_URL}/services/${index}`);
            const data = res.data;
            console.log(data)
            setState(data);
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
                <Form.Control placeholder="Name" type="file" name="path" onChange={handlePicInput}/>
            </Form.Group>
            <Col xs={6} md={4}>
                
                <Image src={uploadedFileURL} style={{border:"none", borderRadius:"50%",height:"50px"}}  />
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
                <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={handleSubmit}>Save</Button>
            </Modal.Footer>
            
        </Modal>
  )
}

export default AddService

/*

{uploadedFileURL && <img src={uploadedFileURL} alt="Uploaded content"/>}

*/