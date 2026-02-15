# TUATH COIR - API DOCUMENTATION

Base URL: `https://tuath-coir-api.YOUR-ACCOUNT.workers.dev`

## Endpoints

### GET /
Returns the landing page (HTML)

**Response:** HTML page with Tuath Coir branding

---

### GET /api/products
List all products with optional filtering

**Query Parameters:**
- `category` (optional) - Filter by category name

**Example:**
```
GET /api/products
GET /api/products?category=Irish%20Apparel
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "products": [
    {
      "id": 1,
      "sku": "TC-TSHIRT-001",
      "name": "Celtic Clover T-Shirt",
      "description": "Premium Bella+Canvas...",
      "category": "Irish Apparel",
      "price": 29.99,
      "cost_price": 12.95,
      "supplier": "Printful",
      "images": ["..."],
      "inventory_quantity": 999,
      "profit_margin": "56.9%"
    }
  ]
}
```

---

### GET /api/products/:id
Get single product details

**Example:**
```
GET /api/products/1
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Celtic Clover T-Shirt",
    ...
  }
}
```

---

### GET /api/categories
List all product categories

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Irish Apparel",
      "slug": "irish-apparel",
      "description": "Celtic-inspired clothing",
      "product_count": 5
    }
  ]
}
```

---

### GET /api/search
Search products by name or description

**Query Parameters:**
- `q` (required) - Search term

**Example:**
```
GET /api/search?q=Clover
```

**Response:**
```json
{
  "success": true,
  "query": "Clover",
  "count": 2,
  "products": [...]
}
```

---

### POST /api/orders
Create a new order

**Body:**
```json
{
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "customer_phone": "555-0123",
  "shipping_address": {
    "line1": "123 Main St",
    "city": "Dublin",
    "state": "CA",
    "postal_code": "94568",
    "country": "US"
  },
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "order_number": "TC1234567890ABCD",
  "total": "65.97",
  "profit": "32.41",
  "message": "Order created successfully. Proceed to payment."
}
```

---

### GET /api/orders/:order_number
Track an existing order

**Response:**
```json
{
  "success": true,
  "order": {
    "order_number": "TC1234567890ABCD",
    "status": "pending_payment",
    "payment_status": "unpaid",
    ...
  }
}
```

---

### POST /api/payment/create-intent
Create a Stripe Payment Intent for an order

**Body:**
```json
{
  "order_number": "TC1234567890ABCD",
  "amount": "65.97"
}
```

---

### GET /initiation
Returns the initiation page (HTML)

**Response:** HTML page where users take the oath to join the Tuath Coir tribe.

---

### POST /api/initiation
Process a new tribal initiation (member registration)

**Body:**
```json
{
  "name": "Alias or Name",
  "email": "messenger@example.com",
  "territory": "Highlands | Urban Core | Coastlands | Midlands",
  "signature": "E-Signature"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Initiation complete. Welcome to the Urban Core Territory, Alias.",
  "tribe": "Tuath Coir"
}
```

---

### GET /admin
Admin Dashboard (requires Basic Auth via `ADMIN_PASSWORD_HASH`)

---

### GET /health
System health check

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "products": 12
  },
  "environment": "production",
  "version": "2.0.0-phase2"
}
```
