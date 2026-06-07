# DokanMate

DokanMate is a cross-platform mobile point-of-sale and shop management system built with Expo and React Native. It is designed for small retail shops and shopkeepers who need lightweight inventory, sales, dues, and expense tracking with offline persistence and optional cloud synchronization.

## Project Overview

DokanMate consists of two main parts:

- **Mobile client**: an Expo-based React Native application using `expo-router`, local SQLite persistence, and a tab-based user interface.
- **Backend API**: an Express.js and MongoDB server for authentication, secure synchronization, and data recovery.

## Key Features

- Inventory management with add/edit product support
- Sales module with cart, checkout, and success confirmation
- Customer dues tracking and payment recording
- Expense tracking and analytics
- Dashboard summaries for sales, expenses, and stock status
- Offline-first local storage using SQLite
- Background synchronization with secure backend APIs
- User registration, recovery, and PIN-based authentication

## Architecture

### Mobile application

- `app/`: Expo Router screens and layout structure
- `src/screens/`: feature-specific screens for Dashboard, Dues, Expenses, Inventory, and Sales
- `src/components/`: reusable UI components
- `src/database/`: local SQLite database initialization, migrations, and queries
- `src/services/syncService.js`: handles online synchronization operations
- `src/api/client.js`: Axios client configured for backend communication

### Backend API

- `dokanmate-server/server.js`: Express server entry point
- `dokanmate-server/routes/`: API route definitions for authentication and synchronization
- `dokanmate-server/controllers/`: business logic for register, recover, sync, and update operations
- `dokanmate-server/models/`: MongoDB data models for shops, products, customers, sales, transactions, and expenses
- `dokanmate-server/services/tokenService.js`: JWT generation and verification
- `dokanmate-server/middleware/auth.js`: JWT authentication middleware

## Installation

### Mobile client

Open the project root and install dependencies:

```bash
npm install
```

### Backend server

Navigate to the backend folder and install dependencies:

```bash
cd dokanmate-server
npm install
```

## Environment Setup

Create a `.env` file inside `dokanmate-server/` with the following values:

```env
MONGODB_URI=mongodb://localhost:27017/dokanmate
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=90d
PORT=5000
```

For production use, configure a secure `JWT_SECRET` value and a managed MongoDB instance.

## Running the Application

### Start the backend server

```bash
cd dokanmate-server
npm run dev
```

### Start the Expo mobile client

From the repository root:

```bash
npm start
```

Then open the application in an emulator or on a physical device using Expo.

## App Configuration

The mobile client reads the backend base URL from `src/constants/config.js`:

- `API_BASE_URL`: defaults to `http://localhost:5000/api`

If testing on a real Android device or emulator, update `API_BASE_URL` to the computer host or use `10.0.2.2` for Android emulator access.

## Backend API Endpoints

### Authentication

- `POST /api/auth/register`
  - Body: `{ shopId, phone, shopName, address, pin }`
  - Registers a shop and returns a JWT

- `POST /api/auth/recover`
  - Body: `{ phone, pin }`
  - Restores account data and returns a JWT

- `POST /api/auth/update-shop`
  - Authenticated
  - Body: `{ shopName, phone, address }`
  - Updates shop profile

- `POST /api/auth/change-pin`
  - Authenticated
  - Body: `{ phone, currentPin, newPin }`
  - Changes the shop PIN

### Sync

- `GET /api/sync/health`
  - Health check endpoint

- `POST /api/sync/products`
- `POST /api/sync/sales`
- `POST /api/sync/sale-items`
- `POST /api/sync/customers`
- `POST /api/sync/transactions`
- `POST /api/sync/expenses`

All sync routes require a valid `Authorization: Bearer <token>` header.

## Data Storage

### Mobile client

- Local data is stored in SQLite via `expo-sqlite`
- Queries and migrations are located in `src/database/queries`
- A sync queue ensures offline changes are uploaded when network connectivity returns

### Backend

- Uses MongoDB via `mongoose`
- Records are scoped by `shopId` to separate data between shops
- Authentication uses JWT tokens containing `shopId` and `phone`

## Project Structure

Root contents:

- `App.js`, `index.js`: Expo application bootstrap
- `app/`: expo-router folder structure
- `assets/`: application icons and splash assets
- `src/`: app source code including screens, components, services, hooks, and database logic
- `dokanmate-server/`: backend API and server code

Backend structure:

- `server.js`
- `config/`: MongoDB connection setup
- `controllers/`: request handlers
- `middleware/`: authentication and error handling
- `models/`: MongoDB schemas
- `routes/`: API route definitions
- `services/`: JWT helper functions
- `utils/`: logging and helper utilities

## Development Notes

- The mobile app is built with Expo SDK 54 and React Native 0.81
- The app uses `expo-router` for file-based navigation
- The backend uses Express 5 and middleware such as `helmet` and `cors`
- Authentication uses bcrypt-hashed PINs and JWT tokens
- Sync operations are designed to upsert records and keep shop data isolated by `shopId`

## Testing

- No automated tests are included
- The backend can be manually tested by starting `npm run dev` in `dokanmate-server`
- Mobile flows can be tested through Expo Dev Tools

## Contribution

To extend DokanMate, consider:

- adding test coverage for backend controllers and mobile screens
- improving sync conflict resolution
- adding analytics and export functionality
- supporting production-ready backend deployment

## License

This repository does not declare a license. Add one to clarify usage rights.
