import React from 'react';
import {Button, Image,Container,Table} from 'react-bootstrap';
import {useEffect, useState} from "react";
import axios from "axios";
// get our fontawesome imports
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddService from './AddService';
import ClientTablePagination from './ClientTablePagination';
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
    const [info, setInfo] = useState(null)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(info?.last_page);

    const fetchServices = async (url) => {
        try {
            console.log("fetch Services")
            const response = await axios.get(url);
            console.log(response.data)
            if (response.status === 200) {
                console.log("OK")
                for(let i=0;i < response.data.data.length;i++){
                    setInfo(response.data);
                    setTotalPages(response.data.last_page);
                    let index= response.data.data[i].images_id;
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
                console.log("SetService ",response.data);
                setService(response.data.data);
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
            setShow(!show);
            setUpdate(!update);
            console.log("updated: index",index," service: ",service," update: ",update,"show: ",show);
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchServices(`${BASE_URL}/services?page=${page}`);
    }, [changed,page])

    function handlePagination(){
        fetchServices(`${BASE_URL}/services?page=${page}`);
    }

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
                                            <td><Image src={`http://127.0.0.1:8000/api/images/services/${curUser.image_path}`  || imageURL } style={{border:"none", borderRadius:"50%",height:"40px" }} alt="Image"/></td>
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
             <div className="d-flex justify-content-center">
                    <ClientTablePagination  info={info} call={handlePagination} page={page} setPage={setPage} totalPages={totalPages}/> 
             </div>            
        </React.Fragment>
    )
}
export default Service;