import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { de } from 'date-fns/locale';
import { useBusinessContext } from '../context/BusinessContext';

export const BookingCalendar = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const { business } = useBusinessContext();
    
    // Berechne das früheste mögliche Datum (heute)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Berechne das späteste mögliche Datum (3 Monate in die Zukunft)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    // Funktion zum Filtern von Dates (z.B. keine Wochenenden, wenn der Salon geschlossen ist)
    const filterDates = (date) => {
        // Standardeinstellung: Montag bis Samstag (keine Sonntage)
        const day = date.getDay();
        
        // Grundsätzlich: Sonntag (0) ist geschlossen
        if (day === 0) return false;
        
        // Wenn Business-Daten vorhanden sind, prüfe die Öffnungszeiten
        if (business && business.working_hours) {
            try {
                // Beispiel für working_hours: {"0":false,"1":true,"2":true,"3":true,"4":true,"5":true,"6":true}
                // Wobei 0 = Sonntag, 1 = Montag, ... 6 = Samstag
                
                // Parse working_hours als JSON, falls es als String vorliegt
                const workingHours = typeof business.working_hours === 'string' 
                    ? JSON.parse(business.working_hours) 
                    : business.working_hours;
                
                // Prüfe, ob der Salon an diesem Wochentag geöffnet ist
                return workingHours[day] === true;
            } catch (error) {
                console.error('Fehler beim Parsen der Öffnungszeiten:', error);
                // Fallback: Standard-Filter (keine Sonntage)
                return day !== 0;
            }
        }
        
        // Fallback: nur Sonntag ausschließen
        return day !== 0;
    };
    
    // Handler für Datumauswahl
    const handleDateChange = (date) => {
        setSelectedDate(date);
        
        if (date && onDateSelect) {
            onDateSelect(date);
        }
    };
    
    return (
        <div className="booking-calendar">
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                minDate={today}
                maxDate={maxDate}
                filterDate={filterDates}
                locale={de}
                dateFormat="dd.MM.yyyy"
                todayButton="Heute"
                placeholderText="Datum auswählen"
                className="form-control"
            />
        </div>
    );
};

export default BookingCalendar; 