import {useEffect, useState} from "react";
import { Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import AddClient from "../components/AddClient";
import ClientTablePagination from '../components/ClientTablePagination';
import axios from "axios";

// get our fontawesome imports
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
// In anderen Dateien
import config from '../config';
// Verwendung der backendUrl
const BASE_URL = config.backendUrl;
const token=localStorage.getItem('user-token');
const user=JSON.parse(localStorage.getItem('user'));
const userID = localStorage.getItem('user-id');
const userRole = localStorage.getItem('user-role');
const businessID = localStorage.getItem('company-id');

const ClientTable = ({show, setShow,update,setUpdate,title,setTitle,index,setIndex}) => {
    //const navigate = useNavigate();
    //const BASE_URL = "http://4pixels.ch/friseur/api"; 
    const [users, setUsers] = useState([]);
    const [info, setInfo] = useState(null)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(info?.last_page);

    const fetchUsers = async (url) => {
        try {

            const employeeData = {
                businesses_id: businessID,
                employees_id: userID,
                role: userRole
            };

            const response = await axios.get(url,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            //console.log("response ",response.data.data)
            if (response.status === 200) {
                setInfo(response.data);
                setTotalPages(response.data.last_page);
    
                if (response.data.data.length > 0) {
                    const clientArray = [];

                    for (let i = 0; i < response.data.data.length; i++) {
                        const userData = response.data.data[i];                        //console.log("USerData: ",userData)
                        const index = userData['addresses_id'];
                        //const response2 = await axios.get(`${BASE_URL}/addresses/${index}`);
                        const userObject = {
                                id: userData['id'],
                                name: userData['name'],
                                surname: userData['surname'],
                                email: userData['email'],
                                phone: userData['phone']
                        };
                        clientArray.push(userObject);
                    }
                    setUsers(clientArray);
                    //setUpdate(!update);
                    //console.log("Array: ", clientArray," page ", page);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteCustomer = async (index)=>{
        try {
            setIndex(index);
            if(window.confirm("Wollen Sie sicher den Kunden löschen")){
                const API_URL =  `${BASE_URL}/client/${index}`;
            
                const response = await axios.delete(API_URL,{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                console.log(response)
                if (response.status === 200) {
                    //setData(response);
                    console.log("jetzt löschen");
                }
                fetchUsers(`${BASE_URL}/client?page=${page}`);
                //navigate('/kunden');
                console.log("jetzt update");
                setIndex(null);
            }         
        } catch (e) {
            console.error(e)
        }
    }

    const updateUser = async (index)=>{
        try {
            setIndex(index);
            setUpdate(!update);
            setTitle("Kunde bearbeiten");
            setShow(!show);
            console.log("update Client: ",index)
            //navigate('/updateUser', { state: { id: index, status: "update"} });
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchUsers(`${BASE_URL}/client?page=${page}`);
    }, [page, update])
    
    function handlePagination(){
        fetchUsers(`${BASE_URL}/client?page=${page}`);
    }

    return <>
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
        {   users.length > 0 &&
                users.map((curUser,idx) => {
                    return (
                        <tr key={idx}>
                            <td>{curUser.id}</td>
                            <td>{curUser.name}</td>
                            <td>{curUser.surname}</td>
                            <td>{curUser.email}</td>
                            <td>{curUser.phone}</td>
                            <td> 
                                <div className="d-flex justify-content-between">
                                    <Button style={{backgroundColor:"#7DB561",borderRadius:"50%",border:"none"}}  onClick={()=>updateUser(curUser.id)}><FontAwesomeIcon icon={faPencil} /></Button>
                                    <Button style={{backgroundColor:"#BD5450",borderRadius:"50%",border:"none"}} onClick={()=>deleteCustomer(curUser.id)}><FontAwesomeIcon icon={faTrash} /></Button>
                                </div>
                            </td>
                        </tr>
                    )
                })
        }
        </tbody>
    </Table>
     
        <div className="d-flex justify-content-center">
            <ClientTablePagination  info={info} call={handlePagination} page={page} setPage={setPage} totalPages={totalPages}/> 
        </div>

    </>
}
export default ClientTable;