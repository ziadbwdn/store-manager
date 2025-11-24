# Store Admin System

A modern, full-stack store administration system for managing customers, products, inventory, and purchases with advanced features like stock management and purchase cancellation tracking.

**Live:** Frontend at `http://localhost:5173` | Backend API at `http://localhost:3000/api`

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js (REST API)
- TypeORM (PostgreSQL ORM)
- PostgreSQL (Database)
- Swagger/OpenAPI documentation

**Frontend:**
- Vanilla TypeScript (No frameworks)
- Vite (Build tool & Dev server)
- Tailwind CSS (Styling)
- Fetch API (HTTP client)

---

## 📁 Project Structure

```
store-admin/
├── server/                      # Backend REST API
│   ├── src/
│   │   ├── entities/           # TypeORM entities (6 models)
│   │   ├── controllers/        # Request handlers (3 controllers)
│   │   ├── services/           # Business logic (3 services)
│   │   ├── routes/             # API routes
│   │   ├── config/             # Database & Swagger config
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── SETUP.md               # Server setup guide
│
├── client/                      # Frontend SPA
│   ├── src/
│   │   ├── api/               # API client layer
│   │   ├── pages/             # Page controllers (3 pages)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # DOM utilities
│   │   ├── main.ts            # App entry point
│   │   └── main.css           # Global styles
│   ├── index.html             # HTML entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── ARCHITECTURE.md            # Detailed architecture documentation
├── PROJECT_STATUS.md          # Implementation progress tracker
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb store_db

# Configure server environment
cd server
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend API (port 3000)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev
```

### 4. Access Application

- **Frontend:** `http://localhost:5173`
- **API Docs:** `http://localhost:3000/docs` (Swagger UI)
- **Health Check:** `http://localhost:3000/health`

---

## 💼 Features

### Customer Management
- Add customers via modal popup (inline with purchase creation)
- View customer list
- Store detailed customer information (address, phone, city, state, zip, country)
- Automatic customer selection after creation

### Product Management
- View all products with stock levels
- Automatic stock tracking
- Product details: SKU, name, description, price

### Purchase System
- **Create Purchases:**
  - Select customer (or add new via modal)
  - Select multiple products with quantities
  - Dynamic order total calculation
  - Real-time stock validation
  - Transaction-based creation for consistency

- **Purchase History:**
  - View all purchases with status
  - See purchase details (items, totals, dates)
  - Cancel completed purchases
  - Automatic stock restoration on cancellation
  - Cancellation reason tracking

### Advanced Features
- **Transaction Consistency:** All purchase operations are atomic
- **Stock Management:** Automatic deduction on purchase, restoration on cancellation
- **Audit Trail:** Dedicated cancellation tracking with reasons
- **Modal-based Customer Addition:** Add customers without leaving the purchase page
- **Real-time Notifications:** Success and error messages
- **Type Safety:** Full TypeScript implementation on both frontend and backend

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Customers
- `GET /customers` - List all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Products
- `GET /products` - List all products with stock
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Purchases
- `GET /purchases` - List all purchases
- `GET /purchases/:id` - Get purchase by ID
- `POST /purchases` - Create purchase (with stock deduction)
- `POST /purchases/:id/cancel` - Cancel purchase (with stock restoration)

**Full API documentation available at:** `http://localhost:3000/docs`

---

## 📊 Database Schema

### Entities
- **customers:** User information with addresses
- **products:** Product catalog with SKUs and prices
- **product_stocks:** Inventory tracking per product
- **purchases:** Order records with status tracking
- **purchase_items:** Individual items within purchases
- **purchase_cancellations:** Cancellation audit trail

### Key Relationships
- Purchases → Customers (Many-to-One, RESTRICT on delete)
- Purchases → Purchase Items (One-to-Many, CASCADE on delete)
- Purchase Items → Products (Many-to-One)
- Product Stocks → Products (One-to-One, CASCADE on delete)
- Purchase Cancellations → Purchases (Many-to-One, CASCADE on delete)
- Purchase Cancellations → Customers (Many-to-One, RESTRICT on delete)

---

## 🎨 UI Components

### Pages
1. **New Purchase** (Default)
   - Customer selection with inline "Add Customer" button
   - Customer modal popup form
   - Product selection with dynamic quantities
   - Real-time order total calculation
   - Submit purchase button

2. **Purchase History**
   - Purchase table with details
   - Status badges (Completed, Cancelled, Pending)
   - Cancel button for active purchases
   - Refresh functionality

### Notifications
- Toast-style success messages (auto-dismiss after 3s)
- Toast-style error messages (auto-dismiss after 5s)
- Form validation feedback

---

## 🔐 Security Features

- Input validation on both client and server
- SQL injection prevention via TypeORM parameterization
- CORS enabled for client-server communication
- Environment variables for sensitive configuration
- Transaction isolation for data consistency

---

## 📝 Environment Configuration

### Server (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=store_db
PORT=3000
NODE_ENV=development
```

### Client (Vite config)
- Automatically proxies `/api` requests to `http://localhost:3000`
- Development server on port 5173

---

## 🛠️ Development

### Build

**Backend:**
```bash
cd server
npm run build
```

**Frontend:**
```bash
cd client
npm run build
```

### Production Start

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run preview
```

---

## 📚 Documentation Files

- **ARCHITECTURE.md** - Detailed system architecture, API design, data flow
- **PROJECT_STATUS.md** - Implementation checklist and progress tracking
- **server/SETUP.md** - Server-specific setup and testing guide
- **IMPLEMENTATION_SPEC.md** - Legacy specification (outdated, for reference)

---

## ✨ Key Highlights

✅ **Complete REST API** with transaction support
✅ **Type-safe** implementation (TypeScript throughout)
✅ **Modal-based UX** for customer creation
✅ **Stock management** with automatic deduction/restoration
✅ **Audit trail** for cancellations
✅ **Swagger documentation** for API exploration
✅ **Real-time notifications** for user feedback
✅ **Responsive design** with Tailwind CSS
✅ **Zero external dependencies** for frontend logic (Vanilla TS)

---

## 🚦 Running Tests

### Manual API Testing

```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"PROD001","name":"Widget","description":"A widget","price":29.99,"quantity":100}'

# Create purchase
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":5}]}'

# Cancel purchase
curl -X POST http://localhost:3000/api/purchases/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason":"Customer requested"}'
```

Or use Swagger UI at `http://localhost:3000/docs` for interactive testing.

---

## 📋 Project Status

**Completion:** 100% ✅

- ✅ Backend API fully implemented and tested
- ✅ Frontend SPA fully functional
- ✅ Database schema and ORM configured
- ✅ Modal-based customer creation
- ✅ Purchase creation with stock management
- ✅ Purchase cancellation with stock restoration
- ✅ API documentation (Swagger)
- ✅ Error handling and validation
- ✅ Real-time notifications

---

## 🤝 Contributing

This is a demonstration project. For modifications:

1. Follow the existing code structure
2. Maintain TypeScript type safety
3. Test API endpoints after changes
4. Update documentation as needed

---

## 📄 License

ISC

---

## 🎯 Future Enhancements

Potential additions (not currently implemented):
- User authentication and authorization
- Product images and categories
- Advanced search and filtering
- Bulk operations
- Payment gateway integration
- Shipping and delivery tracking
- Reporting and analytics
- Mobile application

---

**Questions?** Refer to the detailed documentation files or check the Swagger API docs at `http://localhost:3000/docs`
