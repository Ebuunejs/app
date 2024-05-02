import React,{useState,useEffect} from "react";
import axios from "axios";
import { Button, Modal, Form, Col,Table} from "react-bootstrap";
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
// get our fontawesome imports
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

const timeSlotsArray=[
    {
        id:"0",
        time:"00:00"
    },
    {
        id:"1",
        time:"01:00"
    },
    {
        id:"2",
        time:"02:00"
    },
    {
        id:"3",
        time:"03:00"
    },
]

const AddTermin = ({show, setShow,changed,setChanged,guest,setGuest}) => {
    const [state , setState] = useState(initialState);
    const {name, surname,email,phone,password,role,path} = state;
    const [clients, setClients] = useState([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(true);
    const [select, setSelect] = useState(false);
    const [time, setTime] = useState();
    const [date, setDate] = useState(new Date());

    function handleClose(){
        try {
            if(!search){
                setSearch(!search);
            }
            if(select){
                setSelect(!select);
            }
            setShow(!show);
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

    }

    const updateFields = async(e) =>{
        /*if(!!index) {
            const res = await axios.get(`${BASE_URL}/employees/${index}`);
            setState(res.data);
        }*/
    }

 

      const searchClient = async(e) =>{
        try {
            
            const query = state.name;
            const response = await axios.get(`${BASE_URL}/search-customer/${query}`);
            if (response.status === 200) {
                console.log(response)
                setClients(response.data);
                
            }
        } catch (e) {
            console.error(e)
        }
      }

      const saveTermin = async(e) =>{
        if(!search){
            setSearch(!search);
        }
        if(select){
            setSelect(!select);
        }
        setShow(!show);
        resetFields();
      }

      const getClient = async(index) =>{
        setSearch(!search);
        setSelect(!select);
        console.log(index,select)
      }
      
      
    useEffect(() => {
        updateFields();
    }, [])

  return (
    <Modal show={show} >
            <Modal.Header>
                <Modal.Title>Kunde buchen: </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
            
                <Form.Group as={Col} md="12" style={{display:"flex", gap:"20px"}}>
                    <Form.Control placeholder="Name" type="text" name="name" onChange={handleInputChange} value={name}/>
                    <Button style={{backgroundColor:"#60A8C1",border:"none"}}  onClick={searchClient}>Search</Button>
                </Form.Group>

                <Form.Group as={Col} md="20" style={{display:"flex", gap:"20px"}}>
                
                {search && clients && name ? 
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Vorname</th>
                                <th>Telefon</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                clients.map((curUser,idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{curUser.name}</td>
                                            <td>{curUser.surname}</td>
                                            <td>{curUser.phone}</td>
                                            <td> 
                                                <div className="d-flex justify-content-between">
                                                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}}  onClick={()=>getClient(curUser.id)}><FontAwesomeIcon icon={faPencil} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                :
                select  ? 
                <>
                 <Form.Group as={Col} md="8" style={{display:"flex", gap:"20px"}}>
                        <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)}/>{/*(e) => setDate(e.target.value) */}
                            <DropdownButton 
                                title={time ? time : "leer"} 
                                style={{backgroundColor:"#60A8C1 !important", borderRadius:"4px"}}
                             >
                                         {timeSlotsArray &&
                                        timeSlotsArray.map(timeSlt => {
                                          return(      
                                                <DropdownItem key = {timeSlt.id}  onClick={(e) => setDate(timeSlt.time)}>
                                                    {timeSlt.time ? timeSlt.time:"leer"}
                                                </DropdownItem>)
                                        })
                                    }
                                    </DropdownButton>
                                </Form.Group>
                </>
                :null}
                </Form.Group>
            </Modal.Body>
                    
            <Modal.Footer>
                <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleClose}>Close</Button>
                <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={saveTermin}>Save</Button>
            </Modal.Footer>
            
        </Modal>
  )
}

export default AddTermin