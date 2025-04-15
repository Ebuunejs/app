import  { React, useState} from "react";
import {Container} from "react-bootstrap";
import ClientTable from "../components/ClientTable";
import AddClient from "../components/AddClient";
import { Button } from "react-bootstrap";
//import {useState} from "react";
// get our fontawesome imports
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { useNavigate } from "react-router-dom";


function PortalKunden() {  
    //const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [update, setUpdate] = useState(false);
    const [title, setTitle] = useState("Kunde einfügen:");
    const [index, setIndex] = useState();

    function addCustom(){
        /*
        try {
            navigate('/updateUser', { state: { id: null, status: "add"} });
        } catch (e) {
            console.error(e)
        }*/
        try {
            setShow(!show);
            
        } catch (e) {
            console.error(e)
        }
    }

    return (
        
            <Container className='py-5'>
                <h2 class="fs-5">Kunden:</h2>
               
                <div className="d-flex flex-row-reverse">
                    <Button style={{backgroundColor:"#60A8C1",borderRadius:"50%",border:"none"}} onClick={addCustom}><FontAwesomeIcon icon={faPlus} /></Button>
                </div>
                <hr/>

                <ClientTable show={show} setShow={setShow} update={update} setUpdate={setUpdate} title={title} setTitle={setTitle} index = {index} setIndex={setIndex}/>
                <AddClient show={show} setShow={setShow} update={update} setUpdate={setUpdate} title={title} setTitle={setTitle} index = {index} setIndex={setIndex}/>
            </Container>
   
        );
  };

export default PortalKunden

/*




 {state === 1 
                    ? <AddKunde />
                    : <ClientTable />}
*/