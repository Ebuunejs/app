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
    role:"employee",
    path: ""
}

const AddEmployee = ({show, setShow,changed,setChanged,employee,index,update,setUpdate}) => {
    const [state , setState] = useState(initialState);
    const {name, surname,email,phone,password,role,path} = state;
    const [file, setFile] = useState();

    const addEmployee = async (e) => {
        e.preventDefault();
        try {
            console.log("updateState: ",update)
            if(update){
                const response = await axios.put(`${BASE_URL}/employees/${index}`,state);
                console.log(response)
                if (response.status === 201) {
                    console.log("UpdateContact")
                    setState(response.data);
                    setUpdate(false);
                    setChanged(!changed);
                }

                setState({
                    name: "",
                    surname: "",
                    email: "",
                    password: "",
                    phone: "",
                    path: ""
                });
            }else{
                const fd = new FormData()
                fd.append("images", e.target.file?.files[0]);
                
                fd.append("name", name);
                fd.append("surname", surname);
                fd.append("email", email);
                fd.append("phone", phone);
                fd.append("password", password);
                fd.append("role", role);
                //fd.append("path", path);
                
                /*console.log(file)
                console.log(state);
                console.log(fd);*/
                const response = await axios.post(`${BASE_URL}/employees`,fd, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  })
                /*{
                            params: {
                                state,
                                fd,
                            },
                            })*/
                console.log(response);
                if (response.status === 200) {
                    console.log("Employee added succesfully");
                    //setUpdate(false)
                    setChanged(!changed);
                } else 
                console.log("Employee not added succesfully");
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
                name: "",
                surname: "",
                email: "",
                password: "",
                phone: "",
                path: ""
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
        if(!!index) {
            const res = await axios.get(`${BASE_URL}/employees/${index}`);
            const data = res.data;
            setState(data);
        }
    }

    function handlePicInput  (event) {
        //const file = event.target.files ? event.target.files[0] : null;
        //validateFile(file);
        let images = event.target.files[0];
        console.log("path: ", images.name);
        //path=images.name;
        //path= URL.createObjectURL(images);
        setFile(URL.createObjectURL(images));
        console.log("Image geladen",URL.createObjectURL(images));
    }
    /*
    const validateFile = (file: File | null) => {
        if (file) {
          if (!file.type.startsWith('image/')) {
            //setError('Please select an image file');
          } else if (file.size > 1000000) {
           // setError('File size is too large');
          } else {
            setFile(file);
            //setError('');
          }
        }
      }
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
                <Form.Control placeholder="Name" type="file" name="file" onChange={handlePicInput}/>
            </Form.Group>

            <Col xs={6} md={4}>
                <Image src={file} style={{border:"none", borderRadius:"50%",height:"50px"}}  alt={"Photo"}/>
            </Col>

            <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                <Form.Control placeholder="Name" type="text" name="name" onChange={handleInputChange} value={name}/>
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