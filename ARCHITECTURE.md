# Store Admin System - Architecture

## System Architecture

**Architecture Pattern**: REST API Backend + SPA Frontend

### Technology Stack

#### Server (Backend API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Architecture**: REST API (JSON responses)

#### Client (Frontend SPA)
- **Language**: Vanilla TypeScript (no framework)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite (for TS compilation and dev server)
- **HTTP Client**: Fetch API

---

## Project Structure

```
store-admin/
├── server/                          # Backend REST API
│   ├── src/
│   │   ├── entities/                # TypeORM entities
│   │   │   ├── Customer.ts
│   │   │   ├── Product.ts
│   │   │   ├── ProductStock.ts
│   │   │   ├── Purchase.ts
│   │   │   ├── PurchaseItem.ts
│   │   │   └── PurchaseCancellation.ts
│   │   ├── controllers/             # Request handlers
│   │   │   ├── customerController.ts
│   │   │   ├── productController.ts
│   │   │   └── purchaseController.ts
│   │   ├── services/                # Business logic
│   │   │   ├── customerService.ts
│   │   │   ├── productService.ts
│   │   │   └── purchaseService.ts
│   │   ├── routes/                  # API routes
│   │   │   └── index.ts
│   │   ├── config/                  # Configuration
│   │   │   └── database.ts
│   │   └── index.ts                 # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── client/                          # Frontend SPA
    ├── src/
    │   ├── api/                     # API client layer
    │   │   ├── client.ts            # Base HTTP client
    │   │   ├── customers.ts
    │   │   ├── products.ts
    │   │   └── purchases.ts
    │   ├── components/              # UI components
    │   │   ├── CustomerForm.ts
    │   │   ├── ProductSelector.ts
    │   │   └── PurchaseList.ts
    │   ├── pages/                   # Page controllers
    │   │   ├── NewPurchase.ts
    │   │   └── PurchaseHistory.ts
    │   ├── types/                   # TypeScript interfaces
    │   │   └── index.ts
    │   ├── utils/                   # Utility functions
    │   │   └── dom.ts
    │   └── main.ts                  # App entry point
    ├── public/
    │   └── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Database Schema

### Tables

#### customers
```sql
id (PK, serial)
name (varchar)
email (varchar, unique)
phone (varchar, nullable)
address (text, nullable)
city (varchar, nullable)
state (varchar, nullable)
zip_code (varchar, nullable)
country (varchar, nullable)
created_at (timestamp)
updated_at (timestamp)
```

#### products
```sql
id (PK, serial)
sku (varchar, unique)
name (varchar)
description (text)
price (decimal)
created_at (timestamp)
updated_at (timestamp)
```

#### product_stocks
```sql
id (PK, serial)
product_id (FK -> products.id)
quantity (integer)
created_at (timestamp)
updated_at (timestamp)
```

#### purchases
```sql
id (PK, serial)
customer_id (FK -> customers.id)
total_amount (decimal)
status (enum: pending, completed, cancelled)
created_at (timestamp)
updated_at (timestamp)
```

#### purchase_items
```sql
id (PK, serial)
purchase_id (FK -> purchases.id)
product_id (FK -> products.id)
quantity (integer)
price_at_purchase (decimal)
created_at (timestamp)
```

#### purchase_cancellations
```sql
id (PK, serial)
purchase_id (FK -> purchases.id)
customer_id (FK -> customers.id)
reason (text, nullable)
cancelled_at (timestamp)
```

---

## API Endpoints

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - List all products with stock
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Purchases
- `GET /api/purchases` - List all purchases with details
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create new purchase
- `POST /api/purchases/:id/cancel` - Cancel purchase with reason

---

## Data Flow

### Create Purchase Flow

1. **Client** → Sends POST to `/api/purchases` with:
   ```json
   {
     "customerId": 1,
     "items": [
       { "productId": 1, "quantity": 2 },
       { "productId": 2, "quantity": 1 }
     ]
   }
   ```

2. **Server** → Transaction begins:
   - Validate stock availability
   - Deduct stock quantities
   - Calculate total amount
   - Create purchase record
   - Create purchase items
   - Commit transaction

3. **Response** → Returns created purchase:
   ```json
   {
     "id": 123,
     "customerId": 1,
     "totalAmount": 150.00,
     "status": "completed",
     "createdAt": "2025-11-24T12:00:00Z",
     "items": [...]
   }
   ```

### Cancel Purchase Flow

1. **Client** → Sends POST to `/api/purchases/:id/cancel` with:
   ```json
   {
     "reason": "Customer requested refund"
   }
   ```

2. **Server** → Transaction begins:
   - Load purchase with items
   - Restore stock quantities
   - Update purchase status to 'cancelled'
   - Create cancellation record
   - Commit transaction

3. **Response** → Returns updated purchase

---

## Client-Side Architecture

### Component Pattern
- Each component is a TypeScript class
- Manages its own DOM manipulation
- Emits events for parent communication
- No framework dependencies

### State Management
- Simple reactive state pattern
- Event-driven updates
- No external state library

### API Layer
- Centralized HTTP client
- Type-safe request/response
- Error handling middleware

---

## Security Considerations

- Input validation on both client and server
- SQL injection prevention via TypeORM parameterization
- CORS configuration for client-server communication
- Environment variables for sensitive config
- Transaction isolation for data consistency

---

## Development Workflow

1. **Database Setup**: Create PostgreSQL database and run migrations
2. **Server Development**: Start with `npm run dev` in server/
3. **Client Development**: Start with `npm run dev` in client/
4. **Testing**: Test each API endpoint independently
5. **Integration**: Connect client to server API

---

## Next Steps (Implementation Order)

1. Set up server project structure and dependencies
2. Define TypeORM entities
3. Implement service layer (business logic)
4. Create REST API controllers and routes
5. Test API endpoints with Postman/curl
6. Set up client project structure
7. Implement API client layer
8. Build UI components
9. Wire up pages and routing
10. End-to-end testing
