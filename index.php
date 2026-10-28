<?php
require_once __DIR__ . '/config.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="BluePlate restaurant menu and online ordering.">
  <title>BluePlate Restaurant & Grill</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<div class="app-shell">
  <header class="site-header">
    <button class="brand" data-page="Home" aria-label="BluePlate home">
      <span class="brand-mark">B</span>
      <span>BluePlate<small>RESTAURANT &amp; GRILL</small></span>
    </button>
    <nav class="main-nav" aria-label="Main navigation">
      <button data-page="Home" class="nav-link active">Home</button>
      <button data-page="Menu" class="nav-link">Menu</button>
      <button data-page="History" class="nav-link">History</button>
    </nav>
    <button class="cart-button" data-page="Cart">🛒 Cart <span id="cart-count">0</span></button>
  </header>

  <div class="navigation-toolbar">
    <div class="back-forward">
      <button id="back-button" disabled>← Back</button>
      <button id="forward-button" disabled>Forward →</button>
    </div>
    <span class="current-location">Current page: <strong id="current-page-label">Home</strong></span>
  </div>

  <main id="app-main" class="main-content" aria-live="polite">
    <section class="hero">
      <span class="eyebrow">GOOD FOOD. GOOD MOOD.</span>
      <h1>Welcome to BluePlate.</h1>
      <p>Delicious meals, refreshing drinks and a better way to order your favourites.</p>
      <button class="primary-button" data-page="Menu">Explore our menu →</button>
      <div class="hero-note"><span>🍽️</span><div><strong>Made for your cravings</strong><p>Discover something delicious today.</p></div></div>
    </section>
  </main>

  <footer class="site-footer">
    <strong>BluePlate Restaurant</strong>
    <span>Good food, thoughtfully served.</span>
    <a href="admin/">Admin dashboard</a>
    <span>Browsing history powered by a JavaScript stack.</span>
  </footer>
</div>
<script src="assets/app.js" defer></script>
</body>
</html>
