/*
 * BluePlate app: vanilla JavaScript, no React and no Node.js.
 * Stack is explicitly implemented for the Data Structures project.
 */
class Stack {
  constructor(items = []) { this.items = [...items]; }
  push(item) { this.items.push(item); return item; }
  pop() { return this.isEmpty() ? undefined : this.items.pop(); }
  peek() { return this.isEmpty() ? undefined : this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
  clear() { this.items = []; }
  getItems() { return [...this.items]; }
}

const initialPage = { name: "Home" };
const backStack = new Stack([initialPage]);
const forwardStack = new Stack();
let currentPage = initialPage;
let meals = [];
let cart = JSON.parse(sessionStorage.getItem("blueplate-cart") || "[]");

const main = document.getElementById("app-main");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function money(value) {
  return "GH₵ " + Number(value).toFixed(2);
}
function currentMeal() {
  return meals.find(m => Number(m.id) === Number(currentPage.mealId));
}
function updateNavUI() {
  backButton.disabled = backStack.size() <= 1;
  forwardButton.disabled = forwardStack.isEmpty();
  document.getElementById("current-page-label").textContent = currentPage.name;
  document.getElementById("cart-count").textContent = cart.reduce((n, i) => n + i.quantity, 0);
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === currentPage.name);
  });
}
function refresh() {
  updateNavUI();
  renderPage();
}
function navigate(page, pushBrowserState = true) {
  backStack.push(page);
  forwardStack.clear();
  currentPage = page;
  if (pushBrowserState) history.pushState({ blueplate: true }, "", "#"+encodeURIComponent(page.name.toLowerCase()));
  refresh();
}
function goBack(pushBrowserState = true) {
  if (backStack.size() <= 1) return;
  forwardStack.push(backStack.pop());
  currentPage = backStack.peek();
  if (pushBrowserState) history.pushState({ blueplate: true }, "", "#"+encodeURIComponent(currentPage.name.toLowerCase()));
  refresh();
}
function goForward(pushBrowserState = true) {
  if (forwardStack.isEmpty()) return;
  currentPage = forwardStack.pop();
  backStack.push(currentPage);
  if (pushBrowserState) history.pushState({ blueplate: true }, "", "#"+encodeURIComponent(currentPage.name.toLowerCase()));
  refresh();
}

function renderPage() {
  if (currentPage.name === "Home") {
    main.innerHTML = `
      <section class="hero">
        <span class="eyebrow">GOOD FOOD. GOOD MOOD.</span>
        <h1>Welcome to BluePlate.</h1>
        <p>Delicious meals, refreshing drinks and a better way to order your favourites.</p>
        <button class="primary-button" data-page="Menu">Explore our menu →</button>
        <div class="hero-note"><span>🍽️</span><div><strong>Made for your cravings</strong><p>Discover something delicious today.</p></div></div>
      </section>`;
  } else if (currentPage.name === "Menu") {
    main.innerHTML = `<section><div class="section-heading"><div><span class="eyebrow">OUR MENU</span><h1>Find your favourite.</h1></div><span class="muted">${meals.length} meals and drinks</span></div>
      <div class="meal-grid">${meals.map(meal => `<article class="meal-card">
        <div class="meal-art">${escapeHTML(meal.emoji)}</div><div class="meal-content">
        <span class="category">${escapeHTML(meal.category)}</span><h3>${escapeHTML(meal.name)}</h3>
        <p>${escapeHTML(meal.description)}</p><div class="meal-footer"><strong>${money(meal.price)}</strong>
        <button class="small-button" data-meal="${Number(meal.id)}">View meal</button></div></div></article>`).join("")}</div></section>`;
  } else if (currentPage.name === "Details") {
    const meal = currentMeal();
    if (!meal) {
      main.innerHTML = `<section class="empty-state"><h2>Meal not found</h2><button class="primary-button" data-page="Menu">Return to menu</button></section>`;
      return;
    }
    main.innerHTML = `<section class="details-card"><div class="details-art">${escapeHTML(meal.emoji)}</div><div class="details-content">
      <span class="eyebrow">${escapeHTML(meal.category)}</span><h1>${escapeHTML(meal.name)}</h1><p>${escapeHTML(meal.description)}</p>
      <h2>${money(meal.price)}</h2><button class="primary-button" data-add="${Number(meal.id)}">Add to cart</button>
      <p class="muted">Adding an item does not leave this page.</p></div></section>`;
  } else if (currentPage.name === "Cart") {
    if (!cart.length) {
      main.innerHTML = `<section><span class="eyebrow">YOUR ORDER</span><h1>Shopping cart</h1><div class="empty-state"><span class="big-emoji">🛒</span><h2>Your cart is empty</h2><p>Explore the menu and add something tasty.</p><button class="primary-button" data-page="Menu">Browse menu</button></div></section>`;
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    main.innerHTML = `<section><span class="eyebrow">YOUR ORDER</span><h1>Shopping cart</h1>
      <div class="cart-list">${cart.map(item => `<article class="cart-row"><span class="cart-emoji">${escapeHTML(item.emoji)}</span>
      <div class="cart-description"><strong>${escapeHTML(item.name)}</strong><span class="muted">${money(item.price)} each</span></div>
      <div class="quantity-controls"><button data-qty="${item.id}" data-change="-1" aria-label="Remove one">−</button><span>${item.quantity}</span><button data-qty="${item.id}" data-change="1" aria-label="Add one">+</button></div>
      <strong>${money(item.price * item.quantity)}</strong></article>`).join("")}
      <div class="cart-total"><span>Total</span><strong>${money(total)}</strong></div>
      <h2>Delivery details</h2><form id="checkout-form" class="checkout-form">
      <label>Full name<input name="customer_name" maxlength="120" required></label>
      <label>Phone number<input name="phone" maxlength="40" required></label>
      <label>Delivery address<textarea name="delivery_address" maxlength="255" required></textarea></label>
      <label>Order notes (optional)<textarea name="notes" maxlength="1000"></textarea></label>
      <button class="primary-button" type="submit">Place order</button><p id="checkout-message" class="muted"></p>
      </form></div></section>`;
  } else if (currentPage.name === "History") {
    const backItems = backStack.getItems();
    const forwardItems = forwardStack.getItems().slice().reverse();
    const label = page => page.name === "Details" ? (meals.find(m => Number(m.id) === Number(page.mealId))?.name || "Meal Details") : page.name;
    main.innerHTML = `<section><span class="eyebrow">DATA STRUCTURES DEMO</span><h1>Browsing history</h1>
      <p class="muted">The current navigation path is stored in the explicit back stack, from bottom to top.</p>
      <div class="stack-panel"><div class="stack-panel-heading"><strong>Back stack</strong><span>${backItems.length} entries</span></div>
      ${backItems.map((page, i) => `<div class="stack-entry ${i === backItems.length-1 ? "stack-top" : ""}"><span>${i+1}</span><strong>${escapeHTML(label(page))}</strong>${i === backItems.length-1 ? '<span class="top-label">TOP</span>' : ""}</div>`).join("")}</div>
      <div class="stack-panel"><div class="stack-panel-heading"><strong>Forward stack</strong><span>${forwardItems.length} entries</span></div>
      ${forwardItems.length ? forwardItems.map((page, i) => `<div class="stack-entry"><span>${i+1}</span><strong>${escapeHTML(label(page))}</strong></div>`).join("") : '<p class="muted">No forward pages available.</p>'}</div>
      <p class="muted">Back uses pop() on the back stack and push() on the forward stack. Forward performs the reverse.</p></section>`;
  }
}

function saveCart() {
  sessionStorage.setItem("blueplate-cart", JSON.stringify(cart));
  updateNavUI();
}
function addToCart(meal) {
  const found = cart.find(item => Number(item.id) === Number(meal.id));
  if (found) found.quantity += 1;
  else cart.push({ id: Number(meal.id), name: meal.name, price: Number(meal.price), emoji: meal.emoji, quantity: 1 });
  saveCart();
  renderPage();
}
function changeQuantity(id, amount) {
  const item = cart.find(i => Number(i.id) === Number(id));
  if (item) item.quantity += amount;
  cart = cart.filter(i => i.quantity > 0);
  saveCart();
  renderPage();
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    navigate({ name: pageButton.dataset.page });
    return;
  }
  const mealButton = event.target.closest("[data-meal]");
  if (mealButton) {
    navigate({ name: "Details", mealId: Number(mealButton.dataset.meal) });
    return;
  }
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const meal = meals.find(m => Number(m.id) === Number(addButton.dataset.add));
    if (meal) addToCart(meal);
    return;
  }
  const qtyButton = event.target.closest("[data-qty]");
  if (qtyButton) changeQuantity(Number(qtyButton.dataset.qty), Number(qtyButton.dataset.change));
});

backButton.addEventListener("click", () => goBack());
forwardButton.addEventListener("click", () => goForward());

window.addEventListener("popstate", () => {
  // Browser Back/Forward changes the browser history. Keep the explicit
  // application stacks synchronized with the navigation state where possible.
  const hashPage = decodeURIComponent(location.hash.replace(/^#/, ""));
  const known = ["home", "menu", "details", "cart", "history"];
  if (!hashPage || !known.includes(hashPage)) return;
  const target = hashPage[0].toUpperCase() + hashPage.slice(1);
  if (target === currentPage.name) return;
  if (backStack.size() > 1 && backStack.getItems().slice(0, -1).some(p => p.name.toLowerCase() === target.toLowerCase())) {
    while (backStack.size() > 1 && backStack.peek().name.toLowerCase() !== target.toLowerCase()) {
      forwardStack.push(backStack.pop());
    }
    currentPage = backStack.peek();
  } else {
    backStack.push({ name: target });
    forwardStack.clear();
    currentPage = backStack.peek();
  }
  refresh();
});

main.addEventListener("submit", async event => {
  if (event.target.id !== "checkout-form") return;
  event.preventDefault();
  const form = event.target;
  const message = document.getElementById("checkout-message");
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  message.textContent = "Submitting order...";
  try {
    const response = await fetch("api/order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Could not submit order.");
    cart = [];
    saveCart();
    main.innerHTML = `<section class="empty-state"><span class="big-emoji">✅</span><h1>Order received!</h1><p>Your order number is <strong>#${Number(result.order_id)}</strong>.</p><p>Total: <strong>${money(result.total)}</strong></p><p>The restaurant can review your order in the admin dashboard.</p><button class="primary-button" data-page="Menu">Continue browsing</button></section>`;
  } catch (error) {
    message.textContent = error.message + " Make sure PHP and MySQL are configured.";
    submit.disabled = false;
  }
});

async function startApp() {
  try {
    const response = await fetch("api/menu.php");
    if (!response.ok) throw new Error("Menu API unavailable");
    meals = await response.json();
    if (!Array.isArray(meals)) throw new Error("Invalid menu response");
  } catch (error) {
    meals = [
      {id:1,name:"Classic Beef Burger",category:"Burgers",description:"Juicy beef patty with lettuce, tomato and house sauce.",price:65,emoji:"🍔"},
      {id:2,name:"Margherita Pizza",category:"Pizza",description:"Pizza topped with cheese, tomato and fresh herbs.",price:90,emoji:"🍕"},
      {id:3,name:"Crispy Fried Chicken",category:"Chicken",description:"Crispy fried chicken with house seasoning.",price:75,emoji:"🍗"},
      {id:4,name:"Fresh Orange Juice",category:"Drinks",description:"Refreshing orange juice served chilled.",price:20,emoji:"🥤"},
      {id:5,name:"Jollof Rice with Chicken",category:"Local Favourites",description:"Ghana-style jollof rice served with seasoned chicken.",price:80,emoji:"🍛"},
      {id:6,name:"Chocolate Cake",category:"Desserts",description:"Rich chocolate cake for a sweet finish.",price:35,emoji:"🍰"}
    ];
    console.warn("Using demo menu. Run the app through PHP and configure MySQL for ordering.", error);
  }
  refresh();
}
startApp();
