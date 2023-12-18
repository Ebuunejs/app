import * as React from "react";
//import ReactDOM from 'react-dom/client';
import {  BrowserRouter, Route, Routes,Navigate } from "react-router-dom";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';

// Dashboard
import App from "./App";
import PortalHome from './dashboard/pages/PortalHome';
import PortalUser from './dashboard/pages/PortalKunden';
import PortalService from './dashboard/pages/PortalService';
import Company from './dashboard/pages/PortalCompany';
import PortalEmployee from './dashboard/pages/PortalEmployee';
import PortalTermine from './dashboard/pages/PortalTermine';
import UpdateKunde from './dashboard/components/UpdateKunde';
import PrivateRoute from './dashboard/util/PrivateRoute';
import PortalStatistik from './dashboard/pages/PortalStatistik'
import Login from './dashboard/pages/Login';
// widget
import Reservation from './widget/pages/Reservation';
import Friseur from './widget/pages/Friseur';
import CompleteOrder from './widget/pages/CompleteOrder';
import BookingStepsContext from './widget/context/BookingStepsContext';
import ImageUpload from "./dashboard/components/ImageUpload";


//const root = ReactDOM.createRoot(document.getElementById('root'));
const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <BookingStepsContext>
    <Routes>
      <Route path="/upload-image" component={ <ImageUpload /> }/>
      <Route path="/auth/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<App />}>
          <Route index element={<PortalHome />} />
          <Route path="user" element={<PortalUser />} />
          <Route path="statistik" element={<PortalStatistik />} />
          <Route path="termine" element={<PortalTermine />} />
          <Route path="employee" element={<PortalEmployee />} />
          <Route path="company" element={<Company />} />
          <Route path="service" element={<PortalService />} />
          <Route path="updateUser" element={<UpdateKunde />} />
          <Route path="dashboard" element={<PortalHome />} />
        </Route>
      </Route>
      <Route path="/:bussines" element={<Reservation />} />
      <Route path="/:bussines/:friseur" element={<Friseur />} />
      <Route path="/:bussines/:friseur/complete-order" element={<CompleteOrder />} />
    </Routes>
    </BookingStepsContext>
  </BrowserRouter>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
