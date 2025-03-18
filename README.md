# eCommerce API

This is a RESTful API for an eCommerce platform. It provides functionality for **Admins**, **Vendors**, and **Users** to manage products, orders, carts, and more.

---

## Features

### Admin
- **Authentication**: Admin login.
- **User Management**: View all users, block/unblock users.
- **Vendor Management**: Create, update, delete, and retrieve vendors.
- **Product Management**: View and delete products.
- **Order Management**: View all orders and order details.
- **Analytics**: View total sales and sales by vendor.

### Vendor
- **Authentication**: Vendor login.
- **Product Management**: Add, update, delete, and retrieve products.
- **Order Management**: View orders for vendor's products and update order status.
- **Analytics**: View revenue, total orders, and top-selling products.

### User
- **Authentication**: User registration and login.
- **Profile Management**: View, update, and delete user profiles.
- **Address Management**: Add, update, delete, and retrieve addresses.
- **Cart Management**: Add, remove, and clear items in the cart.
- **Order Management**: Place orders and view order history.
- **Product Feed**: View products and product details.

---
## Project Structure

```
.
├── .env
├── index.js
├── package.json
├── config/
│   ├── db.js
│   └── seed.Admin.js
├── controllers/
│   ├── admin/
│   ├── user/
│   └── vendor/
├── helper/
│   └── verifytoken.js
├── middleware/
│   ├── isAdmin.js
│   ├── isUser.js
│   ├── isVendor.js
│   ├── multer.js
│   └── validate.js
├── models/
│   ├── admin.model.js
│   ├── cart.model.js
│   ├── category.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── user.model.js
│   ├── userAddress.model.js
│   └── vendor.model.js
├── routes/
│   ├── admin/
│   ├── user/
│   └── vendor/
├── uploads/
│   └── (Uploaded images)
└── validation/
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/ecommerce-api.git
   cd ecommerce-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerceapi
   ADMIN_EMAIL=admin@test.com
   ADMIN_PASSWORD=admin1234
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

## API Endpoints

### Admin Routes
| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| POST   | `/api/admin/login`        | Admin login                      |
| GET    | `/api/admin/users`        | Get all users                    |
| PUT    | `/api/admin/block/:id`    | Block/unblock a user             |
| POST   | `/api/admin/create`       | Create a vendor                  |
| GET    | `/api/admin/all`          | Get all vendors                  |
| GET    | `/api/admin/:vendorId`    | Get vendor by ID                 |
| PUT    | `/api/admin/update/:vendorId` | Update vendor details         |
| DELETE | `/api/admin/delete/:vendorId` | Delete a vendor               |
| GET    | `/api/admin/products`     | Get all products                 |
| GET    | `/api/admin/orders`       | Get all orders                   |
| GET    | `/api/admin/orders/:id`   | Get order by ID                  |
| GET    | `/api/admin/analytic/sales` | Get total sales and sales by vendor |

### Vendor Routes
| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| POST   | `/api/vendor/login`       | Vendor login                     |
| GET    | `/api/vendor/profile`     | Get vendor profile               |
| POST   | `/api/vendor/add`         | Add a product                    |
| GET    | `/api/vendor/all`         | Get all products                 |
| PUT    | `/api/vendor/update/:id`  | Update a product                 |
| DELETE | `/api/vendor/delete/:id`  | Delete a product                 |
| GET    | `/api/vendor/order/getorder` | Get vendor orders             |
| PUT    | `/api/vendor/order/updateorder/:id` | Update order status       |
| GET    | `/api/vendor/order/analytics` | Get vendor analytics         |

### User Routes
| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| POST   | `/api/users/register`     | User registration                |
| POST   | `/api/users/login`        | User login                       |
| GET    | `/api/users/getprofile`   | Get user profile                 |
| PUT    | `/api/users/updateprofile`| Update user profile              |
| DELETE | `/api/users/deleteprofile`| Delete user profile              |
| POST   | `/api/users/addaddress`   | Add an address                   |
| GET    | `/api/users/getaddress`   | Get all addresses                |
| PUT    | `/api/users/updateaddress/:id` | Update an address            |
| DELETE | `/api/users/deleteaddress/:id` | Delete an address            |
| GET    | `/api/users/getorder`     | Get user orders                  |
| GET    | `/api/users/feed`         | Get product feed                 |
| GET    | `/api/users/productdetail/:id` | Get product details          |

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Uploads**: Multer
- **Environment Variables**: dotenv

---

## Development

### Run in Development Mode
```bash
npm start
```

### Seed Admin User
The admin user is automatically seeded when the server starts in development mode. The credentials are taken from the `.env` file.

---