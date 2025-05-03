# Authentifizierung mit Subdomain-Erkennung

Um die Anforderungen umzusetzen, dass Benutzer zu mehreren Unternehmen gehören können und Unternehmen über Subdomains erreichbar sind, werden folgende Anpassungen an der Authentifizierung vorgenommen:

## 1. Änderungen in der Laravel API

### Subdomain-Erkennung

Die `DomainMiddleware` wird dem API-Routing hinzugefügt, um Anfragen basierend auf Subdomains zu verwalten:

```php
// In app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        // ...
        \App\Http\Middleware\DomainMiddleware::class,
    ],
    'api' => [
        // ...
        \App\Http\Middleware\DomainMiddleware::class,
    ],
];
```

### Anpassung des Route Service Providers

```php
// In app/Providers/RouteServiceProvider.php
public function boot()
{
    Route::pattern('domain', '[a-z0-9.\-]+');
    
    $this->configureRateLimiting();

    $this->routes(function () {
        Route::domain('{domain}.4pixels.ch')->middleware('api')->group(function () {
            // Alle Routen, die über Subdomains erreichbar sein sollen
            Route::namespace($this->namespace)->group(base_path('routes/api_subdomain.php'));
        });
        
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    });
}
```

### Neuer Auth Controller für Multi-Business-Authentifizierung

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Business;
use App\Models\Domain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class MultiBusinessAuthController extends Controller
{
    public function checkCompany(Request $request)
    {
        $request->validate([
            'company_id' => 'required|string',
        ]);
        
        $companyId = $request->input('company_id');
        
        // Überprüfen, ob das Unternehmen existiert
        $business = Business::where('id', $companyId)
            ->orWhere('company_id', $companyId)
            ->first();
        
        if (!$business) {
            return response()->json([
                'status' => false,
                'message' => 'Unternehmen nicht gefunden',
            ], 404);
        }
        
        if (!$business->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Dieses Unternehmen ist derzeit nicht aktiv',
            ], 403);
        }
        
        return response()->json([
            'status' => true,
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'logo' => $business->logo,
                'company_id' => $business->company_id,
            ]
        ]);
    }
    
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'company_id' => 'required|string',
        ]);
        
        // Finde den Benutzer
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Ungültige Anmeldeinformationen',
            ], 401);
        }
        
        // Finde das Business
        $business = Business::where('id', $request->company_id)
            ->orWhere('company_id', $request->company_id)
            ->first();
        
        if (!$business) {
            return response()->json([
                'status' => false,
                'message' => 'Unternehmen nicht gefunden',
            ], 404);
        }
        
        if (!$business->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Dieses Unternehmen ist derzeit nicht aktiv',
            ], 403);
        }
        
        // Überprüfe, ob der Benutzer zum Unternehmen gehört
        $hasAccess = false;
        
        // Systemadmin hat immer Zugriff
        if ($user->is_system_admin) {
            $hasAccess = true;
        } else {
            // Prüfe die businesses_users Tabelle
            $businessUser = DB::table('businesses_users')
                ->where('users_id', $user->id)
                ->where('businesses_id', $business->id)
                ->first();
                
            if ($businessUser) {
                $hasAccess = true;
            } else {
                // Prüfe das direkte businesses_id Feld im User-Modell für Abwärtskompatibilität
                if ($user->businesses_id == $business->id) {
                    $hasAccess = true;
                }
            }
        }
        
        if (!$hasAccess) {
            return response()->json([
                'status' => false,
                'message' => 'Keine Berechtigung für dieses Unternehmen',
            ], 403);
        }
        
        // Token erstellen und zurückgeben
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'status' => true,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'business' => $business,
        ]);
    }
}
```

## 2. Anpassungen im Frontend (React-App)

### Business Context für Subdomain-Erkennung

```jsx
// src/widget/context/BusinessContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../dashboard/config';

const BASE_URL = config.backendUrl;

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const detectBusiness = async () => {
            try {
                const hostname = window.location.hostname;
                
                // Lokale Entwicklungsumgebung
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    // Lade Standard-Business für Entwicklung
                    const response = await axios.get(`${BASE_URL}/business/default`);
                    setBusiness(response.data);
                    setLoading(false);
                    return;
                }
                
                // Extrahiere Subdomain
                const subdomain = extractSubdomain(hostname);
                
                if (!subdomain) {
                    // Keine Subdomain erkannt
                    setLoading(false);
                    return;
                }
                
                // Lade Business basierend auf Subdomain
                const response = await axios.get(`${BASE_URL}/business/by-domain/${subdomain}`);
                setBusiness(response.data);
                
                setLoading(false);
            } catch (err) {
                console.error('Fehler beim Erkennen des Unternehmens:', err);
                setError('Unternehmen konnte nicht geladen werden');
                setLoading(false);
            }
        };
        
        detectBusiness();
    }, []);
    
    // Prüfen, ob das Business aktiv ist
    const isBusinessActive = () => {
        return business && business.is_active === true;
    };
    
    return (
        <BusinessContext.Provider
            value={{
                business,
                loading,
                error,
                isBusinessActive,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
};

// Helper-Funktion zum Extrahieren der Subdomain
function extractSubdomain(hostname) {
    const baseDomains = ['4pixels.ch', 'test.com'];
    
    for (const baseDomain of baseDomains) {
        if (hostname.endsWith(baseDomain) && hostname !== baseDomain) {
            return hostname.substring(0, hostname.indexOf(baseDomain) - 1);
        }
    }
    
    return null;
}

export const useBusinessContext = () => useContext(BusinessContext);

export default BusinessContext;
```

### Login-Komponente anpassen

Die bestehende Login-Komponente muss angepasst werden, um die Unternehmensauswahl und die Authentifizierung für mehrere Unternehmen zu unterstützen:

```jsx
// src/dashboard/pages/Login.js
// Füge diese Funktionen zur bestehenden Login-Komponente hinzu

const handleUserLogin = async (event) => {
    // Existierender Code...
    
    try {
        // API-Anfrage zur Authentifizierung mit company_id
        const authResponse = await axios.post(
            `${BASE_URL}/auth/login`,
            {
                email: email,
                password: password,
                company_id: companyId
            }
        );
        
        // Prüfe, ob die Authentifizierung erfolgreich war
        if (!authResponse.data || !authResponse.data.status) {
            setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.');
            setIsLoading(false);
            return;
        }
        
        // Extrahiere Daten
        const user = authResponse.data.user || {};
        const token = authResponse.data.access_token;
        const business = authResponse.data.business;
        
        // Speichere Daten im localStorage
        localStorage.setItem('user-token', token);
        localStorage.setItem('user-id', user.id);
        localStorage.setItem('user-business-id', business.id);
        localStorage.setItem('user-role', user.roles ? user.roles[0] : 'unknown');
        
        // Redirect zum Dashboard
        navigate('/');
    } catch (error) {
        // Fehlerbehandlung
    }
};
```

## 3. API-Endpunkte für Multi-Business-Unterstützung

Die folgenden neuen API-Routen müssen in `routes/api.php` hinzugefügt werden:

```php
// Business- und Domain-bezogene Routen
Route::get('/business/default', [BusinessController::class, 'getDefaultBusiness']);
Route::get('/business/by-domain/{subdomain}', [BusinessController::class, 'getBusinessByDomain']);
Route::get('/business/status/{id}', [BusinessController::class, 'checkStatus']);

// Authentifizierungsrouten
Route::post('/auth/check-company', [MultiBusinessAuthController::class, 'checkCompany']);
Route::post('/auth/login', [MultiBusinessAuthController::class, 'login']);
```

Die `api_subdomain.php` Datei sollte folgende Routen enthalten:

```php
<?php

use App\Http\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;

// Rufe automatisch den Business-Controller mit der erkannten Subdomain auf
Route::get('/', [BusinessController::class, 'getBySubdomain']);

// Weitere API-Routen für subdomain-spezifische Anfragen
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/employees', [EmployeeController::class, 'index']);
Route::get('/timeslots', [TimeslotController::class, 'index']);
```

Durch diese Änderungen wird das System so angepasst, dass es mehrere Unternehmen unterstützt, wobei jedes Unternehmen über seine eigene Subdomain erreichbar ist. 