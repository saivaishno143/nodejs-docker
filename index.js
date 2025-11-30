const express = require('express');
const app = express();
const port = 3000;

// ==========================================
// 1. MIDDLEWARE & CONFIGURATION
// ==========================================
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data

// Custom Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 2. "DATABASE" (In-Memory Data Models)
// ==========================================
const db = {
  menu: [
    { id: 1, category: 'Coffee', name: 'Signature Espresso', price: 3.50, desc: 'Rich, dark roast with notes of chocolate.' },
    { id: 2, category: 'Coffee', name: 'Hazelnut Latte', price: 4.75, desc: 'Steamed milk, espresso, and roasted hazelnut syrup.' },
    { id: 3, category: 'Coffee', name: 'Cold Brew Nitro', price: 5.00, desc: 'Velvety smooth cold brew infused with nitrogen.' },
    { id: 4, category: 'Breakfast', name: 'Avocado Smash', price: 9.50, desc: 'Sourdough, poached egg, chili flakes, and avocado.' },
    { id: 5, category: 'Breakfast', name: 'Berry Acai Bowl', price: 10.00, desc: 'Organic acai, granola, honey, and seasonal berries.' },
    { id: 6, category: 'Pastry', name: 'Almond Croissant', price: 4.25, desc: 'Buttery layers filled with sweet almond paste.' },
    { id: 7, category: 'Pastry', name: 'Lemon Poppy Muffin', price: 3.75, desc: 'Zesty lemon glaze with organic poppy seeds.' },
  ],
  reservations: [],
  reviews: [
    { user: "Alice", rating: 5, comment: "Best coffee in town!" },
    { user: "Bob", rating: 4, comment: "Great atmosphere, but crowded." }
  ]
};

// ==========================================
// 3. VIEW ENGINE (HTML Templates)
// ==========================================
const renderPage = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | The Grand Café</title>
  <style>
    /* Global Styles */
    :root { --primary: #2c3e50; --accent: #e67e22; --light: #ecf0f1; --dark: #34495e; }
    body { font-family: 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: var(--light); color: var(--dark); display: flex; flex-direction: column; min-height: 100vh; }
    
    /* Navigation */
    nav { background: var(--primary); padding: 1rem; text-align: center; }
    nav a { color: white; text-decoration: none; margin: 0 15px; font-weight: bold; font-size: 1.1rem; }
    nav a:hover { color: var(--accent); }

    /* Layout */
    main { flex: 1; max-width: 900px; margin: 2rem auto; padding: 0 20px; width: 100%; box-sizing: border-box; }
    header.hero { background: linear-gradient(135deg, var(--primary), var(--dark)); color: white; padding: 4rem 2rem; text-align: center; border-radius: 0 0 20px 20px; margin-bottom: 2rem; }
    h1 { margin: 0; font-size: 2.5rem; }
    h2 { color: var(--primary); border-bottom: 2px solid var(--accent); padding-bottom: 10px; margin-top: 2rem; }

    /* Components */
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; transition: transform 0.2s; }
    .card:hover { transform: translateY(-3px); }
    .price { float: right; font-weight: bold; color: var(--accent); font-size: 1.2rem; }
    .badge { background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
    
    /* Forms */
    form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    input, select, textarea { width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 4px; box-sizing: border-box; }
    button { background: var(--accent); color: white; border: none; padding: 12px 24px; font-size: 1rem; border-radius: 4px; cursor: pointer; width: 100%; }
    button:hover { background: #d35400; }

    /* Footer */
    footer { background: var(--dark); color: #bdc3c7; text-align: center; padding: 2rem; margin-top: auto; }
  </style>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/menu">Menu</a>
    <a href="/reservations">Reservations</a>
    <a href="/admin">Staff Portal</a>
  </nav>
  ${content}
  <footer>
    <p>&copy; 2025 The Grand Café Systems. <br> Powered by Node.js & Express.</p>
  </footer>
</body>
</html>
`;

// ==========================================
// 4. CONTROLLERS & ROUTES
// ==========================================

// --- Home Route ---
app.get('/', (req, res) => {
  const content = `
    <header class="hero">
      <h1>The Grand Café</h1>
      <p>Experience the perfect blend of technology and taste.</p>
    </header>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div class="card">
        <h3>Today's Special</h3>
        <p>Try our new <strong>Cold Brew Nitro</strong> for 50% off this weekend!</p>
      </div>
      <div class="card">
        <h3>Community Favorites</h3>
        <p>Rated 5/5 by ${db.reviews.length} local critics.</p>
      </div>
    </div>
    <h2>Latest Reviews</h2>
    ${db.reviews.map(r => `
      <div class="card">
        <strong>${r.user}</strong> rated it ${r.rating}/5 stars
        <p>"${r.comment}"</p>
      </div>
    `).join('')}
  `;
  res.send(renderPage('Home', content));
});

// --- Menu Route ---
app.get('/menu', (req, res) => {
  // Group items by category
  const categories = [...new Set(db.menu.map(item => item.category))];
  
  let menuHtml = '';
  categories.forEach(cat => {
    const items = db.menu.filter(i => i.category === cat);
    menuHtml += `<h3>${cat}</h3><div style="display:grid; gap:15px;">`;
    items.forEach(item => {
      menuHtml += `
        <div class="card">
          <span class="price">$${item.price.toFixed(2)}</span>
          <h4>${item.name}</h4>
          <p>${item.desc}</p>
          <form action="/api/order" method="POST" style="padding:0; box-shadow:none; margin-top:10px;">
            <input type="hidden" name="itemId" value="${item.id}">
            <button type="button" onclick="alert('Item added to cart (Simulation)')" style="width:auto; padding: 5px 15px; font-size: 0.8rem;">Add to Order</button>
          </form>
        </div>
      `;
    });
    menuHtml += `</div>`;
  });

  res.send(renderPage('Menu', menuHtml));
});

// --- Reservation Routes ---
app.get('/reservations', (req, res) => {
  const content = `
    <header class="hero" style="padding: 2rem;">
      <h1>Book a Table</h1>
    </header>
    <form action="/reservations" method="POST">
      <div class="form-group">
        <label>Name</label>
        <input type="text" name="name" required placeholder="John Doe">
      </div>
      <div class="form-group">
        <label>Date & Time</label>
        <input type="datetime-local" name="time" required>
      </div>
      <div class="form-group">
        <label>Guests</label>
        <select name="guests">
          <option>1 Person</option>
          <option>2 People</option>
          <option>3-5 People</option>
          <option>6+ (Large Group)</option>
        </select>
      </div>
      <button type="submit">Confirm Booking</button>
    </form>
  `;
  res.send(renderPage('Reservations', content));
});

app.post('/reservations', (req, res) => {
  const { name, time, guests } = req.body;
  const newReservation = {
    id: db.reservations.length + 1,
    name,
    time,
    guests,
    status: 'Confirmed'
  };
  db.reservations.push(newReservation);
  
  const successContent = `
    <div class="card" style="text-align:center; padding: 40px;">
      <h2 style="border:none; color: green;">Success!</h2>
      <p>Thank you, <strong>${name}</strong>.</p>
      <p>Your table for ${guests} at ${time} has been reserved.</p>
      <a href="/" class="btn">Return Home</a>
    </div>
  `;
  res.send(renderPage('Booking Confirmed', successContent));
});

// --- Admin Dashboard (Staff Portal) ---
app.get('/admin', (req, res) => {
  const content = `
    <h2>Staff Dashboard</h2>
    <div class="card">
      <h3>Current Reservations (${db.reservations.length})</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background:#ecf0f1; text-align:left;">
          <th style="padding:10px;">ID</th>
          <th style="padding:10px;">Guest Name</th>
          <th style="padding:10px;">Time</th>
          <th style="padding:10px;">Party Size</th>
        </tr>
        ${db.reservations.length === 0 ? '<tr><td colspan="4" style="padding:10px;">No reservations yet.</td></tr>' : ''}
        ${db.reservations.map(r => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding:10px;">#${r.id}</td>
            <td style="padding:10px;">${r.name}</td>
            <td style="padding:10px;">${r.time}</td>
            <td style="padding:10px;">${r.guests}</td>
          </tr>
        `).join('')}
      </table>
    </div>
    <div class="card">
      <h3>Quick Actions</h3>
      <button onclick="alert('Kitchen notified!')">Ping Kitchen</button>
      <div style="margin-top:10px;"></div>
      <button style="background:var(--primary);" onclick="location.reload()">Refresh Data</button>
    </div>
  `;
  res.send(renderPage('Staff Portal', content));
});

// ==========================================
// 5. API ROUTES (For Mobile/External use)
// ==========================================
app.get('/api/menu', (req, res) => {
  res.json(db.menu);
});

app.get('/api/reservations', (req, res) => {
  res.json(db.reservations);
});

// ==========================================
// 6. SERVER START
// ==========================================
app.listen(port, () => {
  console.log(`
  ################################################
  #    THE GRAND CAFE SYSTEM IS LIVE             #
  #    Server running on: http://localhost:${port}  #
  ################################################
  `);
});
