import React, {  } from "react";
import {Container} from "react-bootstrap";
import ClientTable from "../components/ClientTable";
import { Button } from "react-bootstrap";
//import {useState} from "react";
// get our fontawesome imports
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

function PortalKunden() {  
    const navigate = useNavigate();

    function addCustom(){
        try {
            navigate('/updateUser', { state: { id: null, status: "add"} });
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <React.Fragment>
            <Container className='py-5'>
                <h3 className='fw-normal'>Kunden</h3>
                <div className="d-flex flex-row-reverse">
                    <Button style={{backgroundColor:"#60A8C1",border:"none"}} onClick={addCustom}><FontAwesomeIcon icon={faPlus} /> addCustomer</Button>
                </div>
                <hr/>
                <ClientTable/>

            </Container>
        </React.Fragment>
        );
  };

export default PortalKunden

/*
 {state === 1 
                    ? <AddKunde />
                    : <ClientTable />}
*/