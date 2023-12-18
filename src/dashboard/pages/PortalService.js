import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Service from "../components/Service";
import AddService from "../components/AddService";

const PortalService = (props) => {
    const [show, setShow] = useState(false);
    const [changed, setChanged] = useState(false);
    const [service, setService] = useState([]);

    function addService(){
        try {
            setShow(!show);
        } catch (e) {
            console.error(e)
        }
    }
    
    useEffect(() => {
            ;
        }, []);
    return (
        <React.Fragment>
            <Container className='py-5'>
                <h3 className='fw-normal'>Dienstleistungen:</h3>
                <div className="d-flex flex-row-reverse">
                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}} onClick={addService}><FontAwesomeIcon icon={faPlus} /> </Button>
                </div>
                <hr/>
                <Service changed={changed} setChanged={setChanged}  service={service} setService={setService}/>
            </Container>
            <AddService show={show} setShow={setShow} changed={changed} setChanged={setChanged} service={service}/>
    </React.Fragment>
    );
}
export default PortalService;