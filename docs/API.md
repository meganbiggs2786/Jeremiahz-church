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

### GET /health
System health check

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "products": 25
  },
  "environment": "production",
  "version": "1.0.0-phase1"
}
```
