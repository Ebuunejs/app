import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PortalHome from './pages/PortalHome';
import PortalCompany from './pages/PortalCompany';
import PortalNavbar from './layout/PortalNavbar';
import PortalEmployee from './pages/PortalEmployee';
import PortalClient from './pages/PortalClient';
import PortalService from './pages/PortalService';
import PortalBooking from './pages/PortalBooking';
import PortalSettings from './pages/PortalSettings';
import PortalProfile from './pages/PortalProfile';
import PortalCalendar from './pages/PortalCalendar';
import PortalInvoice from './pages/PortalInvoice';
import PortalPayment from './pages/PortalPayment';
import PortalNotification from './pages/PortalNotification';
import PortalHelp from './pages/PortalHelp';
import PortalLogout from './pages/PortalLogout';

function App() {
    return (
        <Router>
            <CompanyProvider>
                <div className="app-container">
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/auth/login" element={<Login />} />
                        <Route path="/auth/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <>
                                <PortalNavbar />
                                <PortalHome />
                            </>
                        } />
                        <Route path="/company" element={
                            <>
                                <PortalNavbar />
                                <PortalCompany />
                            </>
                        } />
                        <Route path="/employee" element={
                            <>
                                <PortalNavbar />
                                <PortalEmployee />
                            </>
                        } />
                        <Route path="/client" element={
                            <>
                                <PortalNavbar />
                                <PortalClient />
                            </>
                        } />
                        <Route path="/service" element={
                            <>
                                <PortalNavbar />
                                <PortalService />
                            </>
                        } />
                        <Route path="/booking" element={
                            <>
                                <PortalNavbar />
                                <PortalBooking />
                            </>
                        } />
                        <Route path="/settings" element={
                            <>
                                <PortalNavbar />
                                <PortalSettings />
                            </>
                        } />
                        <Route path="/profile" element={
                            <>
                                <PortalNavbar />
                                <PortalProfile />
                            </>
                        } />
                        <Route path="/calendar" element={
                            <>
                                <PortalNavbar />
                                <PortalCalendar />
                            </>
                        } />
                        <Route path="/invoice" element={
                            <>
                                <PortalNavbar />
                                <PortalInvoice />
                            </>
                        } />
                        <Route path="/payment" element={
                            <>
                                <PortalNavbar />
                                <PortalPayment />
                            </>
                        } />
                        <Route path="/notification" element={
                            <>
                                <PortalNavbar />
                                <PortalNotification />
                            </>
                        } />
                        <Route path="/help" element={
                            <>
                                <PortalNavbar />
                                <PortalHelp />
                            </>
                        } />
                        <Route path="/logout" element={<PortalLogout />} />
                    </Routes>
                </div>
            </CompanyProvider>
        </Router>
    );
}

export default App; 