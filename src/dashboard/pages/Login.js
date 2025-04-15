import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel, Row, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import config from '../config';

const BASE_URL = config.backendUrl;

const Login = () => {
    const image = require('../images/logo.png');
    const navigate = useNavigate();
    
    const [step, setStep] = useState('company');
    const [companyId, setCompanyId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationInfo, setValidationInfo] = useState(null);

    useEffect(() => {
        const tempCompanyId = localStorage.getItem('temp-company-id');
        if (tempCompanyId) {
            setCompanyId(tempCompanyId);
            setStep('user');
        }
    }, []);


    const checkCompanyStatus = async (companyId) => {
        try {
            const response = await axios.get(`${BASE_URL}/business/status/${companyId}`);
            console.log("Company Status", response.data);            
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Prüft, ob ein Benutzer mit dieser E-Mail zum angegebenen Unternehmen gehört
    const checkUserCompanyConnection = async (email, companyId) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/verify-company-connection`, {
                email,
                company_id: companyId
            });
            return response.data;
        } catch (error) {
            // Wenn der Endpunkt nicht existiert, gehen wir davon aus, dass die Prüfung 
            // später im Login-Prozess stattfindet
            if (error.response?.status === 404) {
                console.warn('Verify-company-connection endpoint not found, relying on login validation');
                return { status: true, message: 'Endpunkt nicht gefunden, Prüfung wird beim Login durchgeführt' };
            }
            throw error;
        }
    };

    const handleCompanyValidation = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const statusResponse = await checkCompanyStatus(companyId);
            
            if (statusResponse.data && !statusResponse.data.is_active) {
                setError('Dieses Unternehmen ist nicht aktiv. Bitte kontaktieren Sie den Support.');
                return;
            }

            // Speichere die Informationen über das Unternehmen für die spätere Prüfung
            setValidationInfo({
                company_id: statusResponse.data.id || companyId,
                company_name: statusResponse.data.name || 'Unternehmen'
            });

            localStorage.setItem('temp-company-id', companyId);
            setStep('user');
        } catch (error) {
            if (error.response?.status === 404) {
                setError('Unternehmen nicht gefunden.');
            } else {
                setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserLogin = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        const btnPointer = document.querySelector('#login-btn');

        try {
            // Optional: Vorprüfung der Verbindung zwischen Benutzer und Unternehmen
            try {
                const connectionCheck = await checkUserCompanyConnection(email, companyId);
                if (connectionCheck && !connectionCheck.status) {
                    setError('Sie haben keine Zugangsberechtigung für dieses Unternehmen.');
                    setIsLoading(false);
                    return;
                }
            } catch (connectionError) {
                console.warn('Verbindungsprüfung fehlgeschlagen:', connectionError);
                // Wir unterbrechen den Login-Prozess nicht, falls die Vorprüfung fehlschlägt
            }

            // Hauptlogin-Anfrage mit allen bekannten ID-Varianten für das Backend
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password,
                company_id: companyId,    // Alternative ID
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("User Login", response.data);

            const { token, user, business } = response.data;
            
            console.log("User Login", token, user, business);

            if (!token) {
                setError('Anmeldung nicht möglich. Bitte versuchen Sie es später erneut.');
                return;
            }

            // Überprüfung der Unternehmenszugehörigkeit nach dem Login
            if (business) {
                // Überprüfe, ob die zurückgegebene Business-ID mit der eingegebenen ID übereinstimmt
                const businessIdMatches = 
                    String(business.id) === String(companyId) || 
                    String(business.company_id) === String(companyId);
                
                // Überprüfe Benutzerfeld für Unternehmenszugehörigkeit
                const userBelongsToBusiness = 
                    (user.businesses_id && String(user.businesses_id) === String(companyId)) ||
                    (user.company_id && String(user.company_id) === String(companyId));
                
                if (!businessIdMatches && !userBelongsToBusiness) {
                    setError('Sie haben keine Berechtigung für dieses Unternehmen. Die Benutzer- und Unternehmensdaten stimmen nicht überein.');
                    return;
                }
            } else if (validationInfo) {
                // Fallback-Prüfung, wenn keine Business-Daten zurückgegeben wurden
                const userBelongsToBusiness = 
                    (user.businesses_id && String(user.businesses_id) === String(companyId)) ||
                    (user.company_id && String(user.company_id) === String(companyId)) ;
                
                if (!userBelongsToBusiness) {
                    setError('Benutzer gehört nicht zu diesem Unternehmen. Bitte kontaktieren Sie Ihren Administrator.');
                    return;
                }
            }

            localStorage.setItem('user-token', token);
            localStorage.setItem('user-id', user.id);
            localStorage.setItem('user-role', user.roles ? user.roles[0] : user.role);
            const userName = " Hallo "+user.name + " " + user.surname + " ";
            localStorage.setItem('user-name', userName);
            
            if (business) {
                localStorage.setItem('company-id', business.id);
                localStorage.setItem('company-name', business.name);
            } else {
                console.warn('Business-Daten fehlen in der Antwort');
            }
            
            localStorage.removeItem('temp-company-id');

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (error) {
            console.error('Login Error:', error.response || error);
            if (error.response?.status === 401) {
                setError('Ungültige Anmeldedaten.');
            } else if (error.response?.status === 403) {
                setError('Sie haben keine Berechtigung für dieses Unternehmen.');
            } else if (error.response?.status === 404) {
                setError('Unternehmen nicht gefunden.');
            } else if (error.response?.status === 402) {
                setError('Unternehmen ist nicht aktiv oder Zahlung ausstehend.');
            } else if (error.response?.status === 400) {
                setError(error.response.data.message || 'Ungültige Anfrage.');
            } else {
                setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        } finally {
            setIsLoading(false);
            btnPointer.innerHTML = 'Anmelden';
            btnPointer.removeAttribute('disabled');
        }
    };

    return (
        <Container className="my-5">
            <img
                className="fw-normal mb-5"
                src={image}
                alt="Your Company"
            />
            <Row>
                <Col md={{ span: 6 }}>
                    {step === 'company' ? (
                        <Form onSubmit={handleCompanyValidation}>
                            <h3>Unternehmens-Login</h3>
                            <FormGroup className="mb-3">
                                <FormLabel>Unternehmens-ID</FormLabel>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    placeholder="Geben Sie Ihre Unternehmens-ID ein"
                                    required
                                />
                            </FormGroup>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Button 
                                type="submit" 
                                className="btn-success mt-2" 
                                disabled={isLoading}
                                style={{backgroundColor:"#7DB561", border:"none"}}
                            >
                                {isLoading ? 'Bitte warten...' : 'Weiter'}
                            </Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleUserLogin}>
                            <h3>Benutzer-Login</h3>
                            <FormGroup className="mb-3">
                                <FormLabel>E-Mail</FormLabel>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel>Passwort</FormLabel>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <FormGroup style={{display:"flex", alignItems:"center", gap:"40px"}}>
                                <Button 
                                    type="submit" 
                                    className="btn-success mt-2" 
                                    id="login-btn"
                                    disabled={isLoading}
                                    style={{backgroundColor:"#7DB561", border:"none"}}
                                >
                                    {isLoading ? 'Bitte warten...' : 'Anmelden'}
                                </Button>
                                <Link style={{color:"blue"}} to={`/auth/register`}>
                                    Nicht registriert, hier registrieren!
                                </Link>
                            </FormGroup>
                        </Form>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Login;