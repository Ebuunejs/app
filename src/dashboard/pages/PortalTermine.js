import Modal from 'react-bootstrap/Modal';
import { Container } from 'react-bootstrap';
import React,{ useState }  from 'react';
import { Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import axios from "axios";
// get our fontawesome imports
import { faPlus,faEye ,faTrash,faPenToSquare} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import Time from 'react-time';
//import ReactTimeslotCalendar from '../../timeslot/js/react-timeslot-calendar';
import moment from 'moment';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
//const BASE_URL = "http://4pixels.ch/friseur/api"; 

const initialState={
    name: "", 
}

const initialTimeSlot={
    bookings_id:'',
    date:'',
    time:'',
    types_id:''
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

const PortalTermine = () => {
    const [show, setShow] = useState(false);
    const [showView, setshowView]=useState(false);
    const [showAdd, setshowAdd]=useState(false);
    const [state , setState] = useState(initialState);
    const {name} = state;
    const [timeSlot , setTimeSlot] = useState(initialTimeSlot);
    const [timeSlots, setTimeSlots] = useState([]);
    const [time, setTime] = useState();
    const [date, setDate] = useState(new Date());
    
    const [users, setUsers] = useState([]);
    const [index, setIndex] = useState();

    const addTermin = async (index)=>{
        try {
            console.log("addTermin ", index);
            setIndex(index);
            //setShow(true);
            setshowAdd(true);
            
        } catch (e) {
            console.error(e)
        }
    }

    const handleClose =  ()=>{
        try {
            setShow(false);
            setshowView(false);
            setshowAdd(false);
        } catch (e) {
            console.error(e)
        }
    }

    const viewTermin = async (index) => {
        try {
            console.log("showTermin ", index);
            setIndex(index);
            const response = await axios.get(`${BASE_URL}/timeslots`);
            setTimeSlots(response.data);
            setshowView(true);
        } catch (e) {
            console.error(e)
        }
    }

    const getDateWithTimezoneOffset = (date) => {
        date = new Date(date);
        var userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset);
    }

    const addTerminSlot = async ()=>{
        try {
            console.log(timeSlot)
            timeSlot.date=date;
            timeSlot.time=time;
            //timeSlot.bookings_id=0;
            timeSlot.types_id=1;
            
            const response = await axios.post(`${BASE_URL}/timeslots`,timeSlot);
            if (response.status === 201) {
            }
        } catch (e) {
            console.error(e)
        }
    }

    const searchClient = async ()=>{
        try {
            const query = state.name;
            const response = await axios.get(`${BASE_URL}/search-customer/${query}`);
            if (response.status === 200) {
                setUsers(response.data);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleTimeSlot = (startDate,endDate) =>{
        timeSlot.kunde_id=index;
        timeSlot.startSlot=getDateWithTimezoneOffset(startDate);
        console.log(timeSlot.startSlot);
        timeSlot.endSlot=getDateWithTimezoneOffset(endDate);
    }

    const handleInputChange = (e) =>{
        let {name, value} = e.target;
        setState({ ...state, [name]: value});
    }

    const handleSave= (e) =>{
        console.log("Date: ",date," Time: ",time);
        addTerminSlot();
        setshowAdd(false);
        handleClose();
     }

     const handleViewSave=(e) =>{
        handleClose();
     }

    return (
        <React.Fragment>
            <Container className='py-5'>
                <h3 className='fw-normal'>Termin</h3>
                <div>
                     {/*<p>Today is <Time value={now} format="YYYY/MM/DD" /></p>
                    <p>This was <Time value={wasDate} titleFormat="YYYY/MM/DD HH:mm" relative /></p>*/}
                </div>

               <div  className="d-flex flex-row-reverse">
                    <Row >
                            <Form.Group as={Col} md="8">
                                <Form.Control placeholder="Name" onChange={handleInputChange} name="name" value={name}/>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Button style={{backgroundColor:"#60A8C1",border:"none"}}  onClick={searchClient}>Search</Button>
                            </Form.Group>
                    </Row>
               </div>
               <hr style={{color:"#60A8C1", border:"1px solid"}}/>   
                 

                <Table responsive>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Vorname</th>
                            <th>email</th>
                            <th>phone</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                            users.map((curUser,idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{curUser.id}</td>
                                        <td>{curUser.name}</td>
                                        <td>{curUser.vorname}</td>
                                        <td>{curUser.email}</td>
                                        <td>{curUser.phone}</td>
                                        <td> 
                                            <div style={{display:"flex", gap:"8px"}}>
                                                <Button style={{backgroundColor:"#60A8C1",borderRadius:"50%",border:"none",height:"40px"}}  onClick={()=>viewTermin(curUser.id)}><FontAwesomeIcon icon={faEye} />
                                                </Button>
                                                <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none",height:"40px"}}  onClick={()=>addTermin(curUser.id)}><FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>

                <Modal show={showAdd} >
                    <Modal.Header>
                        <Modal.Title>Neuer Termin für Kunde: </Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
                                <Form.Group as={Col} md="8" style={{display:"flex", gap:"20px"}}>

                                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                                    <DropdownButton 
                                        title={time ? time : "leer"} 
                                        style={{backgroundColor:"#60A8C1!important", borderRadius:"4px"}}
                                        
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
                            
                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={handleSave}>Add</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showView} onHide={handleClose}>
                    <Modal.Header>
                        <Modal.Title>Termine für Kunde: </Modal.Title>
                        <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={handleClose}><FontAwesomeIcon icon={faPlus} /></Button>
                    </Modal.Header>
                    
                    <Modal.Body style={{display:"flex", gap:"20px",flexDirection:"column"}}>
                                <Form.Group as={Col} md="11" style={{display:"flex", gap:"20px"}}>

                                { timeSlots &&   timeSlots.map(timeSlot => {
                                          return(   
                                        <>
                                    <Form.Control type="date" value={timeSlot.date} onChange={(e) => setDate(e.target.value)}/>
                                    <DropdownButton 
                                        title={timeSlot.time} 
                                        style={{backgroundColor:"#60A8C1!important", borderRadius:"4px"}}
                                    >
                                                <DropdownItem key = {timeSlot.id}  onClick={(e) => setTime(timeSlot.time)}>
                                                    {timeSlot.time}
                                                </DropdownItem>
                                    </DropdownButton>

                                    <Button style={{backgroundColor:"#60A8C1",border:"none"}}  onClick={handleViewSave}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                                    <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleViewSave}><FontAwesomeIcon icon={faTrash} /></Button>
                                    </> )})
                                }
                                    </Form.Group>

                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button style={{backgroundColor:"#7E7E7E",border:"none"}}  onClick={handleClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
                {/*}
                <Modal show={show} onHide={handleClose} size ="xl">
                    <Modal.Header>
                        <Modal.Title>Termin für Kunden</Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body >
                        <Form>                          
                            <ReactTimeslotCalendar
                                    initialDate={moment().format()}
                                    renderDays = {{
                                    'saturdays' : false,
                                    'sundays' : false,
                                    }}
                                    timeslotProps ={{
                                        format: 'h:mm', // Each element in the timeslot array is an Hour
                                        showFormat: 'h:mm A', // They will be displayed as Hour:Minutes AM/PM
                                    }}
                                    timeslots={[
                                            ["1:00", "1:30"], // 1:00 AM - 2:00 AM
                                            ["2:00", "3:00"], // 2:00 AM - 3:00 AM
                                            ["14:00", "14:30"], // 4:00 AM - 6:00 AM
                                            ["14:35", "14:40"], // 4:00 AM - 6:00 AM
                                            ["14:30", "15:00"], // 4:00 AM - 6:00 AM
                                            ["15:00", "15:30"], // 5:00 AM
                                    ]}
                                    onSelectTimeslot = { (timeslot, lastSelected) => {
                                    //console.log('All Timeslots:');
                                    //console.log(timeslots[0].endDate._d);

                                    {   if(lastSelected.endDate instanceof moment){
                                            console.log('Last selected timeslot:');
                                            console.log("Start: ",lastSelected.startDate._d);
                                            console.log("Ende: ",lastSelected.endDate._d);
                                            handleTimeSlot(lastSelected.startDate._d,lastSelected.endDate._d);
                                        }   
                                        else {
                                            console.log("Not pressed")
                                        }

                                    }
                                    } }
                                    disabledTimeslots = {[
                                        {
                                            startDate: 'August 30th 2023, 1:00:00 AM',
                                            endDate: 'August 30th 2023, 11:00:00 PM',
                                            format: 'MMMM Do YYYY, h:mm:ss A',
                                        }
                                       
                                    ]}
                                />
                                <hr
                                        style={{
                                        background: 'lime',
                                        color: 'lime',
                                        borderColor: 'lime',
                                        height: '3px',
                                        }}
                                />

                            <Form.Group
                                className="d-flex justify-content-between"
                                controlId="exampleForm.ControlTextarea1"
                                > 
                                <Form.Label>Notizen:</Form.Label>
                                <Form.Control as="textarea" rows={3} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button style={{backgroundColor:"#BD5450",border:"none"}}  onClick={handleClose}>
                            Close
                        </Button>
                        <Button style={{backgroundColor:"#7DB561",border:"none"}}  onClick={handleSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
 {*/}
            </Container>
        </React.Fragment>
    )
}
export default PortalTermine;