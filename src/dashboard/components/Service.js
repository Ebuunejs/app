import React from 'react';
import {Button, Image,Container,Table} from 'react-bootstrap';
import {useEffect, useState} from "react";
import axios from "axios";
// get our fontawesome imports
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddService from './AddService';
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
//const imageURL = require('../images/employee-1.png');

const Service = ({changed,setChanged,service,setService}) => {
    const [show, setShow] = useState(false);
    const [index, setIndex] = useState();
    const [update, setUpdate] = useState(false);
    const [imageURL, setImageURL] = useState();

    const fetchServices = async () => {
        try {
            console.log("fetch Services")
            const response = await axios.get(`${BASE_URL}/services`);
            console.log(response)
            if (response.status === 200) {
                for(let i=0;i < response.data.length;i++){
                    let index= response.data[i].images_id;
                    if(index != null){
                        console.log("nicht null");
                        axios
                        .get(`${BASE_URL}/image/${index}`)
                        .then((response2) => {
                          if (response2.status === 200) {
                            setImageURL(response2.data.path);
                            response.data[i].images_id=response2.data.path;
                          }
                        })
                        .catch((error) => {
                          console.error(error);
                        });
                        
                    }
                }
                console.log(response.data);
                setService(response.data);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const deleteService = async (index)=>{
        try {
            if(window.confirm("Wollen Sie sicher den Serivce löschen")){
                const API_URL =  `${BASE_URL}/services/${index}`;
                const response = await axios.delete(API_URL);
                console.log(response)
                if (response.status === 200) {
                    
                    console.log("jetzt löschen");
                }
                fetchServices(BASE_URL);
                console.log("jetzt update");
            }         
        } catch (e) {
            console.error(e)
        }
    }

    const updateService = (index)=>{
        try {
            console.log("update: ",update,"show: ",show)
            setIndex(index);
            setUpdate(true);
            setShow(true);
            console.log("updated: index",index," service: ",service," update: ",update,"show: ",show);
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchServices();
    }, [changed])
//style={{display:"flex",flexDirection:"column",justifyContent:"space between" }}
    return (
        <React.Fragment>
            <Container>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Diensteistung</th>
                        <th>Beschreibung</th>
                        <th>Preis</th>
                        <th>Zeit</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody  >
                        {service && 
                                service.map((curUser,idx) => {
                                    return (
                                        <tr key={idx} >
                                            <td><Image src={`http://localhost:8000/api/${curUser.images_id}`} style={{border:"none", borderRadius:"50%",height:"40px" }} alt="Image"/></td>
                                            <td>{curUser.name}</td>
                                            <td>{curUser.description}</td>
                                            <td>{curUser.price}</td>
                                            <td>{curUser.duration}</td>
                                            <td> 
                                                <div className="d-flex justify-content-between">
                                                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}}  onClick={()=>updateService(curUser.id)}><FontAwesomeIcon icon={faPencil}/></Button>
                                                    <Button style={{backgroundColor:"#BD5450",borderRadius:"50%",border:"none"}} onClick={()=>deleteService(curUser.id)}><FontAwesomeIcon icon={faTrash} /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
            </Table>    
            </Container>
            <AddService show={show} setShow={setShow} changed={changed} setChanged={setChanged} service={service} index = {index} update={update} 
                        setUpdate={setUpdate}/>
        </React.Fragment>
    )
}
export default Service;