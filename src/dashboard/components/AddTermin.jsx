import React,{useState,useEffect} from "react";
import axios from "axios";
import { Button, Modal, Form, Col,Table} from "react-bootstrap";
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import AddClient from "../components/AddClient";
// get our fontawesome imports
import { faPencil,faPlus } from "@fortawesome/free-solid-svg-icons";
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

const initialTimeSlot={
    date:'',
    time:'',
    bookings_id:'',
    all_day:'',
    types:''
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

const AddTermin = ({show, setShow,changed,setChanged,client,setClient, booking, setBooking}) => {
    const [state , setState] = useState(initialState);
    //const [booking , setBooking] = useState(initialBooking);
    const {searchName,name, surname,email,phone,password,role,path} = state;
    const [showAddClient, setAddClient]=useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(true);
    const [select, setSelect] = useState(false);
    const [timeSlot , setTimeSlot] = useState(initialTimeSlot);
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
            const token=localStorage.getItem('user-token');
            const query = state.searchName;

            const response = await axios.get(`${BASE_URL}/search-client/${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log(response)
                setClient(response.data);
                
            }
        } catch (e) {
            console.error(e)
            setError(e);
            state.name="Kunde nicht gefunden";
        }
    }
    const addClient = async(e) =>{
        try{
            setAddClient(!showAddClient);
            const token=localStorage.getItem('user-token');

        }catch (e) {
            console.error(e)
        }
    }
      const saveTermin = async(e) =>{
        if(!search){
            setSearch(!search);
            const token=localStorage.getItem('user-token');

            booking.businesses_id=1;
            //booking.employees_id=1;
            console.log("ID Client: ", client[0]['id']);
            booking.clients_id=client[0]['id'];
            //booking.timeslots_id=response.data['id'];
            booking.date=date;
            booking.startTime=time;
            booking.total_time=20;
            booking.total_price=25;
            booking.state="pending";
            console.log("booking: ",booking);
            const responseBooking = await axios.post(`${BASE_URL}/bookings`,booking, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("ResponseBooking: ", responseBooking);

            timeSlot.date=date;
            timeSlot.bookings_id=responseBooking.data['id'];
            timeSlot.time=time;
            timeSlot.all_day=0;
            timeSlot.types="termin";

            //console.log("Client Name ", client[0].name);

            console.log("Timeslot: ",timeSlot);

            const response = await axios.post(`${BASE_URL}/timeslots`,timeSlot, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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
                    <Form.Control placeholder="Name" type="text" name="searchName" onChange={handleInputChange} value={searchName}/>
                    <Button style={{backgroundColor:"#60A8C1",border:"none"}}  onClick={searchClient}>Search</Button>
                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}} onClick={addClient}><FontAwesomeIcon icon={faPlus} /> </Button>
                </Form.Group>
                <AddClient show={showAddClient} setShow={setAddClient} title={"neuer Kunde"} />

                <Form.Group as={Col} md="20" style={{display:"flex", gap:"20px"}}>
                
                {search && client && searchName ? 
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
                                client.map((curUser,idx) => {
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
                                                <DropdownItem key = {timeSlt.id}  onClick={(e) => setTime(timeSlt.time)}>
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
