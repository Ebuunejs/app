import React, { useState, useRef } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Tab, 
  Tabs,
  Badge,
  InputGroup,
  Alert,
  Image
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSave, 
  faUpload, 
  faTrash, 
  faBuilding, 
  faPalette, 
  faImage, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faGlobe,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

const PortalSettings = () => {
  // Beispiel-Zustandsdaten für die Einstellungen
  const [companyInfo, setCompanyInfo] = useState({
    name: "Friseursalon Beispiel",
    street: "Musterstraße 123",
    city: "Musterstadt",
    postalCode: "12345",
    country: "Deutschland",
    phone: "+49 123 456789",
    email: "info@beispiel-salon.de",
    website: "www.beispiel-salon.de",
    vatNumber: "DE123456789",
    description: "Ihr Friseursalon für modernes Haarstyling in Musterstadt"
  });
  
  // Zustand für Design-Einstellungen
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#60A8C1",
    secondaryColor: "#7DB561",
    accentColor: "#FFA62B",
    buttonRadius: "8",
    fontFamily: "Poppins"
  });
  
  // Zustand für Nachrichten-Einstellungen
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    smsNotification: false,
    reminderTime: "24",
    confirmationMessage: "Vielen Dank für Ihre Buchung. Wir freuen uns auf Ihren Besuch!",
    cancellationMessage: "Ihre Buchung wurde storniert. Wir hoffen, Sie bald wieder bei uns zu sehen."
  });
  
  // Zustand für Logo und Bilder
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  // Zustand für Erfolgsmeldungen und Fehler
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs für Datei-Uploads
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  // Handler für Firmeninformations-Änderungen
  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler für Design-Einstellungen-Änderungen
  const handleDesignChange = (e) => {
    const { name, value } = e.target;
    setDesignSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Live-Vorschau durch Aktualisierung der CSS-Variablen
    if (name === 'primaryColor') {
      document.documentElement.style.setProperty('--primary-color', value);
      document.documentElement.style.setProperty('--primary-dark', adjustColor(value, -20));
    } else if (name === 'secondaryColor') {
      document.documentElement.style.setProperty('--secondary-color', value);
    } else if (name === 'accentColor') {
      document.documentElement.style.setProperty('--accent-color', value);
    }
  };
  
  // Handler für Benachrichtigungseinstellungen-Änderungen
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Helper-Funktion zum Anpassen der Farbe (Aufhellung/Abdunklung)
  const adjustColor = (hex, percent) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  // Logo-Upload-Handler
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Banner-Upload-Handler
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Speicher-Handler
  const handleSave = () => {
    try {
      // Hier würde normalerweise der API-Call zum Speichern stattfinden
      console.log("Speichere Einstellungen:", {
        companyInfo,
        designSettings,
        notificationSettings,
        logo,
        bannerImage
      });
      
      // Erfolgsmeldung anzeigen
      setSaveSuccess(true);
      setError(null);
      
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.");
      setSaveSuccess(false);
    }
  };
  
  // Löschen der Bilder
  const handleDeleteLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };
  
  const handleDeleteBanner = () => {
    setBannerImage(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };
  
  // Farbvorschau-Komponente
  const ColorPreview = ({ color, label }) => (
    <div className="d-flex align-items-center">
      <div 
        style={{ 
          backgroundColor: color, 
          width: '24px', 
          height: '24px', 
          borderRadius: '4px',
          marginRight: '8px',
          border: '1px solid #dee2e6'
        }} 
      />
      <span>{label}</span>
    </div>
  );
  
  // Button-Vorschau-Komponente basierend auf den aktuellen Designeinstellungen
  const ButtonPreview = () => (
    <div className="mt-4 mb-2">
      <p className="mb-2 fw-bold">Button-Vorschau:</p>
      <Button 
        style={{ 
          backgroundColor: designSettings.primaryColor,
          borderColor: designSettings.primaryColor,
          borderRadius: `${designSettings.buttonRadius}px`,
          fontFamily: designSettings.fontFamily,
          margin: '0 10px 10px 0'
        }}
      >
        Primär
      </Button>
      <Button 
        variant="outline-primary"
        style={{ 
          color: designSettings.primaryColor,
          borderColor: designSettings.primaryColor,
          borderRadius: `${designSettings.buttonRadius}px`,
          fontFamily: designSettings.fontFamily,
          margin: '0 10px 10px 0'
        }}
      >
        Outline
      </Button>
      <Button 
        style={{ 
          backgroundColor: designSettings.secondaryColor,
          borderColor: designSettings.secondaryColor,
          borderRadius: `${designSettings.buttonRadius}px`,
          fontFamily: designSettings.fontFamily,
          margin: '0 10px 10px 0'
        }}
      >
        Sekundär
      </Button>
      <Button 
        style={{ 
          backgroundColor: designSettings.accentColor,
          borderColor: designSettings.accentColor,
          borderRadius: `${designSettings.buttonRadius}px`,
          fontFamily: designSettings.fontFamily,
          margin: '0 10px 10px 0'
        }}
      >
        Akzent
      </Button>
    </div>
  );
  
  return (
    <Container className="py-5">
      <h3 className="fw-normal mb-4">Einstellungen</h3>
      
      {saveSuccess && (
        <Alert variant="success" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          Einstellungen wurden erfolgreich gespeichert!
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}
      
      <Tabs defaultActiveKey="company" id="settings-tabs" className="mb-4">
        {/* Firmendaten Tab */}
        <Tab eventKey="company" title={<span><FontAwesomeIcon icon={faBuilding} className="me-2" />Firmendaten</span>}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Firmenname</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name"
                      value={companyInfo.name}
                      onChange={handleCompanyInfoChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>USt-ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="vatNumber"
                      value={companyInfo.vatNumber}
                      onChange={handleCompanyInfoChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Straße</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="street"
                      value={companyInfo.street}
                      onChange={handleCompanyInfoChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>PLZ</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="postalCode"
                          value={companyInfo.postalCode}
                          onChange={handleCompanyInfoChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Stadt</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="city"
                          value={companyInfo.city}
                          onChange={handleCompanyInfoChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Land</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="country"
                      value={companyInfo.country}
                      onChange={handleCompanyInfoChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefon</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faPhone} />
                      </InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        name="phone"
                        value={companyInfo.phone}
                        onChange={handleCompanyInfoChange}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-Mail</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={companyInfo.email}
                        onChange={handleCompanyInfoChange}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faGlobe} />
                      </InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        name="website"
                        value={companyInfo.website}
                        onChange={handleCompanyInfoChange}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Firmenbeschreibung</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="description"
                  value={companyInfo.description}
                  onChange={handleCompanyInfoChange}
                />
                <Form.Text className="text-muted">
                  Kurze Beschreibung Ihres Unternehmens für Kunden.
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Design-Einstellungen Tab */}
        <Tab eventKey="design" title={<span><FontAwesomeIcon icon={faPalette} className="me-2" />Design</span>}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Primärfarbe</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control 
                        type="color" 
                        name="primaryColor"
                        value={designSettings.primaryColor}
                        onChange={handleDesignChange}
                        style={{ width: '60px', height: '40px' }}
                      />
                      <Form.Control 
                        type="text" 
                        name="primaryColor"
                        value={designSettings.primaryColor}
                        onChange={handleDesignChange}
                        className="ms-2"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Hauptfarbe für Buttons, Header und wichtige Elemente.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Sekundärfarbe</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control 
                        type="color" 
                        name="secondaryColor"
                        value={designSettings.secondaryColor}
                        onChange={handleDesignChange}
                        style={{ width: '60px', height: '40px' }}
                      />
                      <Form.Control 
                        type="text" 
                        name="secondaryColor"
                        value={designSettings.secondaryColor}
                        onChange={handleDesignChange}
                        className="ms-2"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Ergänzende Farbe für Hintergründe und sekundäre Elemente.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Akzentfarbe</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control 
                        type="color" 
                        name="accentColor"
                        value={designSettings.accentColor}
                        onChange={handleDesignChange}
                        style={{ width: '60px', height: '40px' }}
                      />
                      <Form.Control 
                        type="text" 
                        name="accentColor"
                        value={designSettings.accentColor}
                        onChange={handleDesignChange}
                        className="ms-2"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Kontrastreiche Farbe für Hervorhebungen und Call-to-Action-Elemente.
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Button-Rundung (px)</Form.Label>
                    <Form.Control 
                      type="range" 
                      min="0" 
                      max="25" 
                      step="1"
                      name="buttonRadius"
                      value={designSettings.buttonRadius}
                      onChange={handleDesignChange}
                      className="mb-2"
                    />
                    <div className="d-flex justify-content-between">
                      <span>0 px</span>
                      <span>25 px</span>
                    </div>
                    <Form.Text className="text-muted">
                      Aktueller Wert: {designSettings.buttonRadius} px
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Schriftart</Form.Label>
                    <Form.Select 
                      name="fontFamily"
                      value={designSettings.fontFamily}
                      onChange={handleDesignChange}
                    >
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Raleway">Raleway</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="mt-4 p-3 border rounded">
                    <h5>Farbpalette</h5>
                    <div className="mb-2">
                      <ColorPreview color={designSettings.primaryColor} label="Primärfarbe" />
                    </div>
                    <div className="mb-2">
                      <ColorPreview color={designSettings.secondaryColor} label="Sekundärfarbe" />
                    </div>
                    <div className="mb-2">
                      <ColorPreview color={designSettings.accentColor} label="Akzentfarbe" />
                    </div>
                    <div className="mb-2">
                      <ColorPreview color={adjustColor(designSettings.primaryColor, -20)} label="Primärfarbe (dunkler)" />
                    </div>
                  </div>
                </Col>
              </Row>
              
              <ButtonPreview />
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Bilder und Medien Tab */}
        <Tab eventKey="media" title={<span><FontAwesomeIcon icon={faImage} className="me-2" />Bilder & Medien</span>}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Logo</h5>
                  
                  <div className="mb-4 d-flex align-items-center">
                    <div 
                      className="border rounded p-3 me-3 text-center" 
                      style={{ width: "120px", height: "120px", position: "relative" }}
                    >
                      {logoPreview ? (
                        <Image 
                          src={logoPreview} 
                          alt="Firmenlogo" 
                          style={{ maxWidth: "100%", maxHeight: "100%" }} 
                          fluid 
                        />
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                          <div>
                            <FontAwesomeIcon icon={faImage} size="2x" />
                            <p className="mt-2 mb-0 small">Kein Logo</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Form.Group controlId="logoFile" className="mb-3">
                        <Form.Label>Logo hochladen</Form.Label>
                        <Form.Control 
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                        />
                        <Form.Text className="text-muted">
                          Empfohlene Größe: 200x200 px, max. 2 MB
                        </Form.Text>
                      </Form.Group>
                      
                      {logoPreview && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={handleDeleteLogo}
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-1" /> Logo entfernen
                        </Button>
                      )}
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <h5 className="mb-3">Banner-Bild</h5>
                  
                  <div className="mb-4">
                    <div 
                      className="border rounded p-2 mb-3" 
                      style={{ height: "150px", position: "relative" }}
                    >
                      {bannerPreview ? (
                        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                          <Image 
                            src={bannerPreview} 
                            alt="Banner-Bild" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        </div>
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                          <div className="text-center">
                            <FontAwesomeIcon icon={faImage} size="2x" />
                            <p className="mt-2 mb-0">Kein Banner-Bild</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Form.Group controlId="bannerFile" className="mb-3">
                      <Form.Label>Banner-Bild hochladen</Form.Label>
                      <Form.Control 
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleBannerUpload}
                        accept="image/*"
                      />
                      <Form.Text className="text-muted">
                        Empfohlene Größe: 1200x400 px, max. 5 MB
                      </Form.Text>
                    </Form.Group>
                    
                    {bannerPreview && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={handleDeleteBanner}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Banner entfernen
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Benachrichtigungen Tab */}
        <Tab eventKey="notifications" title={<span><FontAwesomeIcon icon={faEnvelope} className="me-2" />Benachrichtigungen</span>}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      id="emailNotification"
                      label="E-Mail-Benachrichtigungen aktivieren"
                      name="emailNotification"
                      checked={notificationSettings.emailNotification}
                      onChange={handleNotificationChange}
                    />
                    <Form.Text className="text-muted">
                      Kunden und Mitarbeiter erhalten E-Mail-Benachrichtigungen.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      id="smsNotification"
                      label="SMS-Benachrichtigungen aktivieren"
                      name="smsNotification"
                      checked={notificationSettings.smsNotification}
                      onChange={handleNotificationChange}
                    />
                    <Form.Text className="text-muted">
                      Kunden und Mitarbeiter erhalten SMS-Benachrichtigungen.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Erinnerungszeit vor Termin (Stunden)</Form.Label>
                    <Form.Select
                      name="reminderTime"
                      value={notificationSettings.reminderTime}
                      onChange={handleNotificationChange}
                    >
                      <option value="1">1 Stunde</option>
                      <option value="2">2 Stunden</option>
                      <option value="3">3 Stunden</option>
                      <option value="6">6 Stunden</option>
                      <option value="12">12 Stunden</option>
                      <option value="24">24 Stunden (1 Tag)</option>
                      <option value="48">48 Stunden (2 Tage)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Buchungsbestätigungs-Nachricht</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="confirmationMessage"
                      value={notificationSettings.confirmationMessage}
                      onChange={handleNotificationChange}
                    />
                    <Form.Text className="text-muted">
                      Diese Nachricht wird bei Terminbestätigungen versendet.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Stornierungsnachricht</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="cancellationMessage"
                      value={notificationSettings.cancellationMessage}
                      onChange={handleNotificationChange}
                    />
                    <Form.Text className="text-muted">
                      Diese Nachricht wird bei Stornierungen versendet.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="mt-3 p-3 border rounded bg-light">
                <h6>Verfügbare Platzhalter:</h6>
                <Row>
                  <Col sm={6}>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{NAME}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{DATUM}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{UHRZEIT}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{SALON}}"}</Badge>
                  </Col>
                  <Col sm={6}>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{MITARBEITER}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{DIENSTLEISTUNG}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{PREIS}}"}</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">{"{{DAUER}}"}</Badge>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <div className="d-flex justify-content-end mt-4">
        <Button variant="outline-secondary" className="me-2">
          Zurücksetzen
        </Button>
        <Button 
          variant="success" 
          onClick={handleSave}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          Einstellungen speichern
        </Button>
      </div>
    </Container>
  );
};

export default PortalSettings;
