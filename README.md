# BluePlate Restaurant Web App (PHP + MySQL, no React or Node.js)

A responsive restaurant ordering website with:
- Restaurant homepage and menu
- Meal details
- Shopping cart
- Explicit JavaScript stack for Back/Forward navigation
- Browsing history screen showing stack contents
- Order submission to MySQL
- Admin login and order status management
- Menu administration starter screen
- Session-based cart and server-side validation

## Requirements
- PHP 8.0+ with PDO MySQL enabled
- MySQL 5.7+ or MariaDB
- Local: XAMPP / WAMP / MAMP, or a PHP/MySQL web host
- No React and no Node.js required

## Local setup with XAMPP
1. Install XAMPP and start **Apache** and **MySQL**.
2. Copy the `blueplate_restaurant_webapp` folder into `C:\xampp\htdocs\`.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`.
4. Import `database.sql`.
5. Open `config.php` and set database credentials if needed. XAMPP defaults are commonly user `root`, blank password.
6. Visit `http://localhost/blueplate_restaurant_webapp/`.

## First admin account
1. Open `http://localhost/blueplate_restaurant_webapp/setup_admin.php`.
2. Create an admin username and a strong password.
3. Delete `setup_admin.php` from the server immediately after creating the account.
4. Admin login: `http://localhost/blueplate_restaurant_webapp/admin/`

## Hosting
Upload the files to a PHP-capable host, create a MySQL database and database user in the hosting control panel, import `database.sql`, then update `config.php` with the hosted database details. Use HTTPS. Do not use a static-only host (such as a plain static-site deployment) for this PHP/MySQL version.

## Stack assignment notes
`assets/app.js` defines a `Stack` class with `push`, `pop`, `peek`, `isEmpty`, `size`, `clear`, and `getItems`.
The app uses explicit back and forward stacks for in-app navigation. It also listens for browser `popstate` events. Browsing history is session/client navigation state, not a permanent analytics record.

## Important
- Change the admin password after setup and delete `setup_admin.php`.
- Configure a real transactional email/payment provider separately before using in production.
- This is a student project starter; review and harden security before real commercial use.
