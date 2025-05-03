# Migrations-Plan für Datenbank-Anpassungen

Basierend auf der Analyse des bestehenden Codes und der Laravel-API müssen folgende Anpassungen am Datenbank-Schema vorgenommen werden:

## 1. Neue Migration: `create_domains_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDomainsTable extends Migration
{
    public function up()
    {
        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('businesses_id')->constrained()->onDelete('cascade');
            $table->string('subdomain')->unique();
            $table->string('custom_domain')->nullable()->unique();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_primary')->default(false);
            $table->string('verification_token')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('domains');
    }
}
```

## 2. Neue Migration: `create_businesses_users_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessesUsersTable extends Migration
{
    public function up()
    {
        Schema::create('businesses_users', function (Blueprint $table) {
            $table->foreignId('businesses_id')->constrained()->onDelete('cascade');
            $table->foreignId('users_id')->constrained()->onDelete('cascade');
            $table->foreignId('roles_id')->constrained('roles')->onDelete('cascade');
            $table->primary(['businesses_id', 'users_id', 'roles_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('businesses_users');
    }
}
```

## 3. Aktualisierung der bestehenden Permission-Tabellen

Die Berechtigungstabellen scheinen bereits mit dem Spatie Laravel-Permission Package erstellt worden zu sein. Es ist nicht nötig, diese zu ändern, da sie bereits gut strukturiert sind und die folgenden Tabellen enthalten:

- `permissions`: Speichert Berechtigungen
- `roles`: Speichert Rollen
- `role_has_permissions`: Verknüpft Rollen mit Berechtigungen
- `model_has_roles`: Verknüpft Modelle (z.B. Benutzer) mit Rollen
- `model_has_permissions`: Verknüpft Modelle direkt mit Berechtigungen

## 4. Domain-Middleware für Subdomain-Erkennung

Neue Middleware in `app/Http/Middleware/DomainMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Domain;
use Illuminate\Http\Request;

class DomainMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        
        // Prüfe auf localhost/Entwicklungsumgebung
        if ($host === 'localhost' || $host === '127.0.0.1' || str_starts_with($host, '192.168.')) {
            // In Entwicklungsumgebung einen Standard-Business festlegen oder prüfen
            return $next($request);
        }
        
        // Subdomain extrahieren
        $subdomain = $this->extractSubdomain($host);
        
        if (empty($subdomain)) {
            // Main domain - keine Business-spezifische Logik
            return $next($request);
        }
        
        // Suche nach der Domain in der Datenbank
        $domain = Domain::where('subdomain', $subdomain)
            ->orWhere('custom_domain', $host)
            ->first();
        
        if (!$domain) {
            // Domain nicht gefunden
            abort(404, 'Domain nicht gefunden');
        }
        
        $business = $domain->business;
        
        if (!$business->is_active) {
            // Business inaktiv
            abort(403, 'Dieses Unternehmen ist derzeit nicht aktiv');
        }
        
        // Business an die Request anhängen
        $request->merge(['current_business' => $business]);
        
        return $next($request);
    }
    
    protected function extractSubdomain($host)
    {
        // Basisdomains, von denen Subdomains extrahiert werden sollen
        $baseDomains = ['4pixels.ch', 'test.com'];
        
        foreach ($baseDomains as $baseDomain) {
            if (str_ends_with($host, $baseDomain) && $host !== $baseDomain) {
                return rtrim(substr($host, 0, strpos($host, $baseDomain)), '.');
            }
        }
        
        return null;
    }
}
```

## 5. Model-Anpassungen

### Domain Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'businesses_id',
        'subdomain',
        'custom_domain',
        'is_verified',
        'is_primary',
        'verification_token',
    ];
    
    protected $casts = [
        'is_verified' => 'boolean',
        'is_primary' => 'boolean',
    ];
    
    public function business()
    {
        return $this->belongsTo(Business::class, 'businesses_id');
    }
}
```

### Business Model (Anpassung)

Füge die folgenden Beziehungen zum bestehenden Business-Modell hinzu:

```php
// In der Business-Klasse...

public function domains()
{
    return $this->hasMany(Domain::class, 'businesses_id');
}

public function userRoles()
{
    return $this->hasMany(BusinessUser::class, 'businesses_id');
}
```

### User Model (Anpassung)

Füge die folgenden Beziehungen zum bestehenden User-Modell hinzu:

```php
// In der User-Klasse...

public function businessRoles()
{
    return $this->hasMany(BusinessUser::class, 'users_id');
}

public function businesses()
{
    return $this->belongsToMany(Business::class, 'businesses_users', 'users_id', 'businesses_id')
                ->withPivot('roles_id')
                ->withTimestamps();
}
```

## 6. Seed-Daten

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use App\Models\User;
use App\Models\Domain;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run()
    {
        // Standardberechtigungen erstellen
        $permissions = [
            ['name' => 'manage_employees', 'description' => 'Mitarbeiter verwalten'],
            ['name' => 'manage_services', 'description' => 'Dienstleistungen verwalten'],
            ['name' => 'manage_bookings', 'description' => 'Termine verwalten'],
            ['name' => 'view_calendar', 'description' => 'Kalender anzeigen'],
            ['name' => 'edit_calendar', 'description' => 'Kalendereinträge bearbeiten'],
            ['name' => 'manage_settings', 'description' => 'Einstellungen verwalten'],
            ['name' => 'manage_clients', 'description' => 'Kunden verwalten'],
        ];
        
        foreach ($permissions as $permData) {
            Permission::create([
                'name' => $permData['name'],
                'guard_name' => 'web',
                'description' => $permData['description'],
            ]);
        }
        
        // Standard-Rollen erstellen
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $employeeRole = Role::create(['name' => 'mitarbeiter', 'guard_name' => 'web']);
        $clientRole = Role::create(['name' => 'kunde', 'guard_name' => 'web']);
        
        // Berechtigungen zu Rollen zuweisen
        $adminRole->givePermissionTo(Permission::all());
        $employeeRole->givePermissionTo(['view_calendar', 'edit_calendar', 'manage_clients', 'manage_bookings']);
        $clientRole->givePermissionTo(['view_calendar']);
        
        // 4pixels GmbH Unternehmen erstellen
        $business = Business::create([
            'name' => '4pixels GmbH',
            'email' => 'info@4pixels.ch',
            'phone' => '+41 123 456 789',
            'domain' => '4pixels.ch',
            'is_active' => true,
            'description' => 'Software-Entwicklung und IT-Dienstleistungen',
        ]);
        
        // Domain für 4pixels erstellen
        Domain::create([
            'businesses_id' => $business->id,
            'subdomain' => '4pixels',
            'is_verified' => true,
            'is_primary' => true,
        ]);
        
        // Admin-Benutzer für 4pixels erstellen
        $admin = User::create([
            'name' => 'Fadil',
            'surname' => 'Ibrahimi',
            'email' => 'fadil@4pixels.ch',
            'password' => Hash::make('password'),
            'businesses_id' => $business->id,
            'is_system_admin' => true,
        ]);
        
        // Rolle als Admin für das Unternehmen zuweisen
        $admin->assignRole($adminRole);
        
        // Business-User Verknüpfung herstellen
        $businessUser = DB::table('businesses_users')->insert([
            'businesses_id' => $business->id,
            'users_id' => $admin->id,
            'roles_id' => $adminRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
} 