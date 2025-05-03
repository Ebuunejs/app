# Datenbankschema für Coiffeur-Salon-System

## Tabellen

### 1. `users` (bestehend)
- `id` - int, primary key, auto_increment
- `name` - string
- `surname` - string
- `email` - string, unique
- `phone` - string
- `password` - string (verschlüsselt)
- `photo` - string (Dateipfad)
- `is_system_admin` - boolean (gibt an, ob der Benutzer ein Systemadministrator ist)
- `created_at` - timestamp
- `updated_at` - timestamp

### 2. `businesses` (bestehend)
- `id` - int, primary key, auto_increment
- `name` - string
- `logo` - string (Dateipfad)
- `email` - string
- `phone` - string
- `website` - string
- `address` - string
- `description` - text
- `is_active` - boolean
- `opening_hours` - json
- `holidays` - json
- `created_at` - timestamp
- `updated_at` - timestamp

### 3. `roles` (neu)
- `id` - int, primary key, auto_increment
- `name` - string (z.B. 'admin', 'mitarbeiter', 'kunde')
- `description` - text
- `created_at` - timestamp
- `updated_at` - timestamp

### 4. `permissions` (neu)
- `id` - int, primary key, auto_increment
- `name` - string (z.B. 'create_user', 'edit_business')
- `description` - text
- `created_at` - timestamp
- `updated_at` - timestamp

### 5. `businesses_users` (neu - Pivottabelle)
- `businesses_id` - int, foreign key zu businesses.id
- `users_id` - int, foreign key zu users.id
- `roles_id` - int, foreign key zu roles.id
- `created_at` - timestamp
- `updated_at` - timestamp

### 6. `roles_permissions` (neu - Pivottabelle)
- `roles_id` - int, foreign key zu roles.id
- `permissions_id` - int, foreign key zu permissions.id
- `created_at` - timestamp
- `updated_at` - timestamp

### 7. `domains` (neu)
- `id` - int, primary key, auto_increment
- `businesses_id` - int, foreign key zu businesses.id
- `subdomain` - string
- `custom_domain` - string, nullable
- `is_verified` - boolean
- `is_primary` - boolean
- `verification_token` - string, nullable
- `created_at` - timestamp
- `updated_at` - timestamp

### 8. `services` (bestehend)
- `id` - int, primary key, auto_increment
- `businesses_id` - int, foreign key zu businesses.id
- `name` - string
- `description` - text
- `price` - decimal
- `duration` - int (in Minuten)
- `created_at` - timestamp
- `updated_at` - timestamp

### 9. `employee_services` (neu - Pivottabelle)
- `employee_id` - int, foreign key zu users.id 
- `service_id` - int, foreign key zu services.id
- `created_at` - timestamp
- `updated_at` - timestamp

### 10. `time_slots` (bestehend)
- `id` - int, primary key, auto_increment
- `businesses_id` - int, foreign key zu businesses.id
- `employee_id` - int, foreign key zu users.id
- `date` - date
- `time` - time
- `end_time` - time, nullable
- `is_available` - boolean
- `all_day` - boolean
- `types` - string (z.B. 'termin', 'vacation')
- `created_at` - timestamp
- `updated_at` - timestamp

### 11. `bookings` (bestehend)
- `id` - int, primary key, auto_increment
- `businesses_id` - int, foreign key zu businesses.id
- `client_id` - int, foreign key zu users.id
- `employee_id` - int, foreign key zu users.id
- `date` - date
- `time` - time
- `end_time` - time
- `total_time` - int (in Minuten)
- `status` - string (z.B. 'confirmed', 'cancelled', 'completed')
- `notes` - text
- `created_at` - timestamp
- `updated_at` - timestamp

## Seed-Daten

### 1. Standard-Rollen
- `admin` (kann alles verwalten)
- `mitarbeiter` (kann Termine sehen, bearbeiten, Kunden hinzufügen)
- `kunde` (kann nur eigene Termine sehen und buchen)

### 2. Standard-Berechtigungen
- `manage_employees` - Mitarbeiter verwalten
- `manage_services` - Dienstleistungen verwalten
- `manage_bookings` - Termine verwalten
- `view_calendar` - Kalender anzeigen
- `edit_calendar` - Kalendereinträge bearbeiten
- `manage_settings` - Einstellungen verwalten
- `manage_clients` - Kunden verwalten

### 3. Administrator-Benutzer
- 4pixels GmbH als Unternehmen
- Fadil Ibrahimi als Administrator

## Beziehungen

1. Ein `User` kann mehreren `Businesses` angehören (durch `businesses_users`).
2. Ein `Business` kann mehrere `Users` haben (durch `businesses_users`).
3. Ein `User` hat eine oder mehrere `Roles` in einem `Business` (durch `businesses_users`).
4. Eine `Role` hat mehrere `Permissions` (durch `roles_permissions`).
5. Ein `Business` kann mehrere `Domains` haben.
6. Ein `Employee` (User) kann mehrere `Services` anbieten (durch `employee_services`).
7. Ein `Service` kann von mehreren `Employees` angeboten werden (durch `employee_services`).
8. Ein `Booking` gehört zu einem `Business`, einem `Client` und einem `Employee`. 