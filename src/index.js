import * as React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
// Dashboard
import App from "./App";
import Login from './dashboard/pages/Login';
import PortalHome from './dashboard/pages/PortalHome';
import PortalUser from './dashboard/pages/PortalKunden';
import PortalService from './dashboard/pages/PortalService';
import Company from './dashboard/pages/PortalCompany';
import PortalEmployee from './dashboard/pages/PortalEmployee';
import UpdateKunde from './dashboard/components/UpdateKunde';
import PrivateRoute from './dashboard/util/PrivateRoute';
import PortalStatistik from './dashboard/pages/PortalStatistik'
import PortalSettings from './dashboard/pages/PortalSettings';

// widget
import SalonPage from './widget/pages/SalonPage';
import CoiffeurPage from './widget/pages/CoiffeurPage';
import BookingPage from './widget/pages/BookingPage';
import CustomerInfoPage from './widget/pages/CustomerInfoPage';
import ConfirmationPage from './widget/pages/ConfirmationPage';
import { BookingProvider } from './widget/context/BookingContext';
import { SalonProvider } from './widget/context/SalonContext';
import { BusinessProvider } from './widget/context/BusinessContext';
import ImageUpload from "./dashboard/components/ImageUpload";
import Register from "./dashboard/pages/Register";

const root = ReactDOM.createRoot(document.getElementById('root'));
//const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BookingProvider>
        <BusinessProvider>
          <SalonProvider>
            <Router>
              <Routes>

                
                {/* Erste Gruppe von Routen */}
                <Route path="/upload-image" element={<ImageUpload />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                
                {/* Geschützte Routen mit PrivateRoute */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<App />}>
                    <Route index element={<PortalHome />} />
                    <Route path="user" element={<PortalUser />} />
                    <Route path="statistik" element={<PortalStatistik />} />
                    <Route path="employee" element={<PortalEmployee />} />
                    <Route path="company" element={<Company />} />
                    <Route path="service" element={<PortalService />} />
                    <Route path="settings" element={<PortalSettings />} />
                    <Route path="updateUser" element={<UpdateKunde />} />
                    <Route path="dashboard" element={<PortalHome />} />
                  </Route>
                </Route>

                {/* Widget-Routen */}
                <Route path="/salon/:companyId" element={<SalonPage />} />
                <Route path="/coiffeur" element={<CoiffeurPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/customer-info" element={<CustomerInfoPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
              </Routes>
            </Router>
          </SalonProvider>
        </BusinessProvider>
      </BookingProvider>
  </React.StrictMode>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*   <Route path="termine" element={<PortalTermine />} /> */