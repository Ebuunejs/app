import React from 'react';
import {Button, Image,Container,Table} from 'react-bootstrap';
import {useEffect, useState} from "react";
import axios from "axios";
// get our fontawesome imports
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddEmployee from './AddEmployee';
import ClientTablePagination from './ClientTablePagination';
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
const imageURL = require('../images/employee-1.png');

const Employee = ({changed,setChanged,employee,setEmployee}) => {
    const [show, setShow] = useState(false);
    const [index, setIndex] = useState();
    const [update, setUpdate] = useState(false);
    const [info, setInfo] = useState(null)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(info?.last_page);

    const  fetchEmployees = (url)=>{
        try {
            if(url){
                axios.get(url)
                .then((response) => {
                    setEmployee(response.data.data);
                    setInfo(response.data);
                    setTotalPages(response.data.last_page);
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const deleteEmployee = async (index)=>{
        try {
            if(window.confirm("Wollen Sie sicher den Kunden löschen")){
                const API_URL =  `${BASE_URL}/employees/${index}`;
                const response = await axios.delete(API_URL);
                console.log(response)
                if (response.status === 200) { 
                    console.log("jetzt löschen");
                }
                fetchEmployees(BASE_URL);
                console.log("jetzt update");
            }         
        } catch (e) {
            console.error(e)
        }
    }

    const updateEmployee = (index)=>{
        try {
            setIndex(index);
            setUpdate(!update);
            setShow(!show);
            console.log("updated: index",index," employee: ",employee," update: ",update,"show: ",show);
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchEmployees(`${BASE_URL}/employees?page=${page}`);
    }, [changed,index,page])

    function handlePagination(){
        fetchEmployees(`${BASE_URL}/employees?page=${page}`);
    }

//style={{display:"flex",flexDirection:"column",justifyContent:"space between" }}
    return (
        <React.Fragment>
            <Container>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Name</th>
                        <th>Vorname</th>
                        <th>Email</th>
                        <th>Telefon</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody  >
                        {employee && 
                                employee.map((curUser,idx) => {
                                    return (
                                        <tr key={idx} >
                                            <td><Image src={`http://127.0.0.1:8000/api/images/employees/${curUser.photo}`  || imageURL } style={{border:"none", borderRadius:"50%",height:"50px"}} alt="Fotoname" /></td>
                                            <td>{curUser.name}</td>
                                            <td>{curUser.surname}</td>
                                            <td>{curUser.email}</td>
                                            <td>{curUser.phone}</td>
                                            <td> 
                                                <div className="d-flex justify-content-between">
                                                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}}  onClick={()=>updateEmployee(curUser.id)}><FontAwesomeIcon icon={faPencil}/></Button>
                                                    <Button style={{backgroundColor:"#BD5450",borderRadius:"50%",border:"none"}} onClick={()=>deleteEmployee(curUser.id)}><FontAwesomeIcon icon={faTrash} /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
            </Table>    
            </Container>
            <AddEmployee show={show} setShow={setShow} changed={changed} setChanged={setChanged} index = {index} update={update} 
                        setUpdate={setUpdate}/>
              <div className="d-flex justify-content-center">
                    <ClientTablePagination  info={info} call={handlePagination} page={page} setPage={setPage} totalPages={totalPages}/> 
             </div>
        </React.Fragment>
    )
}
export default Employee;