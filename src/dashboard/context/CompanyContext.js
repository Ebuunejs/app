import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const BASE_URL = config.backendUrl;

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const validateCompany = async (companyId) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/company/validate/${companyId}`);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Fehler bei der Unternehmensvalidierung');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getCompanyDetails = async (companyId) => {
        try {
            const token = localStorage.getItem('user-token');
            const response = await axios.get(`${BASE_URL}/company/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCompany(response.data);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Fehler beim Abrufen der Unternehmensdetails');
            throw error;
        }
    };

    const checkCompanyStatus = async (companyId) => {
        try {
            const response = await axios.get(`${BASE_URL}/company/status/${companyId}`);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Fehler bei der Statusprüfung');
            throw error;
        }
    };

    useEffect(() => {
        const companyId = localStorage.getItem('company-id');
        if (companyId) {
            getCompanyDetails(companyId);
        }
    }, []);

    return (
        <CompanyContext.Provider value={{
            company,
            isLoading,
            error,
            validateCompany,
            getCompanyDetails,
            checkCompanyStatus
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany muss innerhalb eines CompanyProviders verwendet werden');
    }
    return context;
}; 