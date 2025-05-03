# Zeitslot-Buchungs-Algorithmus

Um das Problem der Zeitslot-Überlappung und der optimalen Auslastung zu lösen, wird im Backend ein spezieller Algorithmus implementiert. Dieser stellt sicher, dass Termine mit unterschiedlichen Dauern korrekt gebucht werden und keine Lücken im Terminkalender entstehen.

## Problem-Beschreibung

Bei einem Coiffeur-Salon können Dienstleistungen unterschiedliche Dauern haben, z.B.:
- Haarschnitt: 30 Minuten
- Färben: 90 Minuten
- Styling: 45 Minuten

Das System verwendet jedoch fixe Zeitslots (z.B. 30 Minuten). Wenn ein Kunde mehrere Dienstleistungen bucht oder eine Dienstleistung länger als ein Slot dauert, müssen mehrere aufeinanderfolgende Slots reserviert werden.

Probleme:
1. Überlappung: Wenn mehrere Slots benötigt werden, müssen sie aufeinanderfolgend und verfügbar sein
2. Zeitverschwendung: Wenn die Gesamtdauer nicht genau auf Slot-Grenzen passt (z.B. 45 Minuten bei 30-Minuten-Slots)
3. Lücken im Kalender: Kurze Lücken zwischen Terminen, die praktisch nicht buchbar sind

## Lösungsansatz

Der Algorithmus für das Backend (Laravel) funktioniert wie folgt:

```php
<?php

namespace App\Services;

use App\Models\Timeslots;
use App\Models\Business;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SlotBookingService
{
    /**
     * Berechnet die optimale Slot-Anzahl für eine Buchung
     * 
     * @param array $services Array der gebuchten Dienstleistungen
     * @param int $slotDuration Dauer eines Standard-Slots in Minuten
     * @return array Informationen über benötigte Slots
     */
    public function calculateRequiredSlots(array $services, int $slotDuration = 30)
    {
        // Gesamtdauer der Dienstleistungen berechnen
        $totalDuration = 0;
        foreach ($services as $service) {
            $totalDuration += $service['duration'];
        }
        
        // Anzahl der benötigten Slots berechnen
        $requiredSlots = ceil($totalDuration / $slotDuration);
        
        // Überschusszeit berechnen
        $surplusTime = ($requiredSlots * $slotDuration) - $totalDuration;
        
        return [
            'totalDuration' => $totalDuration,
            'requiredSlots' => $requiredSlots,
            'surplusTime' => $surplusTime,
            'slotDuration' => $slotDuration
        ];
    }
    
    /**
     * Prüft, ob genügend aufeinanderfolgende Slots verfügbar sind
     * 
     * @param string $date Datum (YYYY-MM-DD)
     * @param string $startTime Startzeit (HH:MM)
     * @param int $requiredSlots Anzahl benötigter Slots
     * @param int $employeeId ID des Mitarbeiters
     * @param int $businessId ID des Unternehmens
     * @return bool|array False wenn nicht verfügbar, sonst Array mit verfügbaren Slots
     */
    public function checkSlotAvailability($date, $startTime, $requiredSlots, $employeeId, $businessId)
    {
        // Startzeit als Carbon Objekt für Berechnungen
        $startTimeObj = Carbon::createFromFormat('Y-m-d H:i', "$date $startTime");
        
        $availableSlots = [];
        
        // Schleife durch benötigte Anzahl an Slots
        for ($i = 0; $i < $requiredSlots; $i++) {
            // Berechne Zeit für aktuellen Slot
            $currentSlotTime = (clone $startTimeObj)->addMinutes($i * 30)->format('H:i');
            
            // Prüfe, ob dieser Slot verfügbar ist
            $isAvailable = Timeslots::where('date', $date)
                ->where('time', $currentSlotTime)
                ->where('employee_id', $employeeId)
                ->where('businesses_id', $businessId)
                ->where('is_available', true)
                ->doesntExist(); // True wenn kein Slot gefunden (also frei)
            
            if (!$isAvailable) {
                return false; // Nicht alle benötigten Slots sind verfügbar
            }
            
            $availableSlots[] = [
                'date' => $date,
                'time' => $currentSlotTime,
                'slot_index' => $i
            ];
        }
        
        return $availableSlots;
    }
    
    /**
     * Bucht eine Reihe von Slots für einen Termin
     * 
     * @param array $availableSlots Array verfügbarer Slots
     * @param array $bookingData Daten für die Buchung
     * @param array $services Dienstleistungen für die Buchung
     * @return array Erstellte Buchung + Slots
     */
    public function bookSlots($availableSlots, $bookingData, $services)
    {
        // Transaktion starten, um sicherzustellen, dass alle Operationen erfolgreich sind
        return DB::transaction(function () use ($availableSlots, $bookingData, $services) {
            // Buchung erstellen
            $booking = Booking::create([
                'businesses_id' => $bookingData['businesses_id'],
                'client_id' => $bookingData['client_id'],
                'employee_id' => $bookingData['employee_id'],
                'date' => $bookingData['date'],
                'time' => $bookingData['time'],
                'end_time' => end($availableSlots)['time'],
                'total_time' => $bookingData['total_time'],
                'status' => 'confirmed',
                'notes' => $bookingData['notes'] ?? '',
            ]);
            
            // Erstelle Zeitslots für die Buchung
            $createdSlots = [];
            foreach ($availableSlots as $slot) {
                $createdSlot = Timeslots::create([
                    'date' => $slot['date'],
                    'time' => $slot['time'],
                    'businesses_id' => $bookingData['businesses_id'],
                    'employee_id' => $bookingData['employee_id'],
                    'bookings_id' => $booking->id,
                    'is_available' => false,
                    'types' => 'termin',
                ]);
                
                $createdSlots[] = $createdSlot;
            }
            
            // Verknüpfe Dienstleistungen mit der Buchung
            // Wenn mehrere Dienstleistungen gebucht wurden, wird der erste Slot mit dem Gesamtpreis verknüpft
            $totalPrice = 0;
            foreach ($services as $service) {
                $totalPrice += $service['price'];
                
                DB::table('bookings_services')->insert([
                    'bookings_id' => $booking->id,
                    'services_id' => $service['id'],
                    'price' => $service['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            // Aktualisiere die Buchung mit dem Gesamtpreis
            $booking->update(['total_price' => $totalPrice]);
            
            return [
                'booking' => $booking,
                'slots' => $createdSlots,
            ];
        });
    }
    
    /**
     * Hauptmethode zum Verarbeiten einer Buchung
     * 
     * @param array $bookingData Daten für die Buchung
     * @param array $services Dienstleistungen für die Buchung
     * @return array|null Erstellte Buchung oder null bei Fehler
     */
    public function processBooking($bookingData, $services)
    {
        try {
            // Business-Konfiguration laden
            $business = Business::findOrFail($bookingData['businesses_id']);
            $slotDuration = $business->settings->slot_duration ?? 30;
            
            // Berechne benötigte Slots
            $slotInfo = $this->calculateRequiredSlots($services, $slotDuration);
            $requiredSlots = $slotInfo['requiredSlots'];
            
            // Prüfe Verfügbarkeit der Slots
            $availableSlots = $this->checkSlotAvailability(
                $bookingData['date'],
                $bookingData['time'],
                $requiredSlots,
                $bookingData['employee_id'],
                $bookingData['businesses_id']
            );
            
            if (!$availableSlots) {
                return [
                    'success' => false,
                    'message' => 'Die gewählten Zeitslots sind nicht verfügbar.'
                ];
            }
            
            // Slots buchen
            $result = $this->bookSlots($availableSlots, $bookingData, $services);
            
            return [
                'success' => true,
                'booking' => $result['booking'],
                'slots' => $result['slots'],
                'message' => 'Buchung erfolgreich erstellt.'
            ];
        } catch (\Exception $e) {
            \Log::error('Fehler bei der Buchungsverarbeitung: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Ein Fehler ist aufgetreten: ' . $e->getMessage()
            ];
        }
    }
}
```

## Implementierung im Frontend

Im Frontend (React) wird der Buchungsprozess wie folgt angepasst:

```jsx
// In der BookingPage-Komponente

// Step 1: Dienstleistungen auswählen und Gesamtdauer berechnen
const handleServiceSelection = (service) => {
    // Aktuelle Auswahl aktualisieren
    const updatedSelection = [...selectedServices];
    
    // Service zur Auswahl hinzufügen oder entfernen
    const existingIndex = updatedSelection.findIndex(s => s.id === service.id);
    if (existingIndex >= 0) {
        updatedSelection.splice(existingIndex, 1);
    } else {
        updatedSelection.push(service);
    }
    
    // Gesamtdauer und Preis berechnen
    const totalDuration = updatedSelection.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = updatedSelection.reduce((sum, s) => sum + parseFloat(s.price), 0);
    
    // Berechne die benötigten Slots (basierend auf 30-Minuten-Slots)
    const requiredSlots = Math.ceil(totalDuration / 30);
    
    // Speichere die Werte im Context
    setBookingDetails(prev => ({
        ...prev,
        services: updatedSelection,
        totalDuration,
        totalPrice,
        requiredSlots
    }));
    
    // Update im Kontext
    setSelectedServices(updatedSelection);
};

// Step 2: Verfügbare Zeitslots laden, basierend auf der benötigten Dauer
const loadAvailableSlots = async (date) => {
    try {
        // Aktuellen Mitarbeiter und erforderliche Slots aus dem Context holen
        const { barber, requiredSlots } = bookingDetails;
        
        if (!barber || !requiredSlots) {
            return;
        }
        
        // Verfügbare Slots vom Server laden
        const response = await axios.get(`${BASE_URL}/timeslots/available`, {
            params: {
                date: date,
                employee_id: barber.id,
                required_slots: requiredSlots,
                business_id: business.id
            }
        });
        
        // Verfügbare Slots im State speichern
        setAvailableSlots(response.data);
        
    } catch (error) {
        console.error("Fehler beim Laden der verfügbaren Zeitslots:", error);
        setError("Zeitslots konnten nicht geladen werden");
    }
};

// Step 3: Zeitslot auswählen und zur Bestätigung weiterleiten
const handleTimeSlotSelection = (slot) => {
    // Ausgewählten Slot im Context speichern
    setBookingDetails(prev => ({
        ...prev,
        date: selectedDate,
        time: slot.time,
        reservation_status: 'pending'
    }));
    
    // Zur nächsten Seite navigieren
    navigate('/customer-info');
};
```

## Verbesserungen und Optimierungen

1. **Zeitslot-Konfiguration**: Das System erlaubt es dem Salon-Besitzer, die Dauer der Standard-Zeitslots im Dashboard einzustellen.

2. **Smarter Slot-Matching-Algorithmus**: Für Termine, die nicht perfekt auf Slot-Grenzen passen, kann der Algorithmus die Aufteilung optimieren, um Lücken zu minimieren.

3. **Blockierung von Zeitslots**: Wenn ein Mitarbeiter Pause macht oder andere Aktivitäten eingeplant sind, können auch diese Zeiten in den Zeitslot-Kalender eingetragen werden.

4. **Flexible Ende-zu-Ende-Buchungen**: Anstatt strikt an Slot-Grenzen zu arbeiten, könnte der Algorithmus die Buchung an beliebigen Zeiten starten und enden lassen.

## Fazit

Dieser Algorithmus stellt sicher, dass Termine optimal im Terminkalender platziert werden, keine ungültigen Überlappungen auftreten und die Zeit der Mitarbeiter effizient genutzt wird. Die Implementierung berücksichtigt sowohl die technischen Anforderungen als auch die praktischen Bedürfnisse eines Coiffeur-Salons. 