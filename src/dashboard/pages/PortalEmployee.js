
import React,{useState} from "react";
import { Container, Button} from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Employee from '../components/Employee';
import AddEmployee from "../components/AddEmployee";

function PortalEmployee() {
    const [show, setShow] = useState(false);
    const [changed, setChanged] = useState(false);
    const [employee, setEmployee] = useState([]);

    function addEmployeeList(){
        try {
            setShow(!show);
            
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <React.Fragment>
           <Container className='py-5'>
                <h3 className='fw-normal'>Mitarbeiter</h3>
                <div className="d-flex flex-row-reverse">
                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}} onClick={addEmployeeList}><FontAwesomeIcon icon={faPlus} /> </Button>
                </div>
                <hr/>
                <Employee changed={changed} setChanged={setChanged}  employee={employee} setEmployee={setEmployee}/>
            </Container>
            <AddEmployee show={show} setShow={setShow} changed={changed} setChanged={setChanged} employee={employee}/>
        </React.Fragment>
        );
      };

  export default PortalEmployee

