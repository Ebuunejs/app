import {useEffect, useState} from "react";
import { Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
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

const ClientTable = () => {
    const navigate = useNavigate();
    //const BASE_URL = "http://4pixels.ch/friseur/api"; 
    const [users, setUsers] = useState([]);
    const [info, setInfo] = useState(null)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(info?.last_page);

    const fetchUsers = async (url) => {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                setInfo(response.data);
                setTotalPages(response.data.last_page);
    
                if (response.data.data.length > 0) {
                    const clientArray = [];

                    for (let i = 0; i < response.data.data.length; i++) {
                        const userData = response.data.data[i];
                        const index = userData['addresses_id'];
    
                        if (index != null) {
                            const response2 = await axios.get(`${BASE_URL}/addresses/${index}`);
                            const userObject = {
                                id: userData['id'],
                                name: userData['name'],
                                surname: userData['surname'],
                                country: response2.data['country'],
                                street: response2.data['street'],
                                city: response2.data['city'],
                                plz: response2.data['plz'],
                                email: userData['email'],
                                phone: userData['phone']
                            };
                            clientArray.push(userObject);
                        }
                    }
                    setUsers(clientArray);
                    console.log("Array: ", clientArray," page ", page);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };
    

    
    const deleteCustomer = async (index)=>{
        try {
            if(window.confirm("Wollen Sie sicher den Kunden löschen")){
                const API_URL =  `${BASE_URL}/users/${index}`;
                const response = await axios.delete(API_URL);
                console.log(response)
                if (response.status === 200) {
                    //setData(response);
                    console.log("jetzt löschen");
                }
                fetchUsers(BASE_URL);
                //navigate('/kunden');
                console.log("jetzt update");
            }         
        } catch (e) {
            console.error(e)
        }
    }

    const updateUser = async (index)=>{
        try {
            navigate('/updateUser', { state: { id: index, status: "update"} });
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchUsers(`${BASE_URL}/users?page=${page}`);
    }, [page])
    
    function handlePagination(){
        fetchUsers(`${BASE_URL}/users?page=${page}`);
    }

    return <>
    <Table responsive>
        <thead>
            <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Vorname</th>
                <th>Land</th>
                <th>Strasse</th>
                <th>Ort</th>
                <th>plz</th>
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
                            <td>{curUser.country}</td>
                            <td>{curUser.street}</td>
                            <td>{curUser.city}</td>
                            <td>{curUser.plz}</td>
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