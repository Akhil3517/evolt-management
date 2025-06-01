# EV Charging Station Management System

A full-stack application for managing electric vehicle charging stations, built with Node.js, Express, MongoDB, and Vue.js.

## Features

- User authentication and authorization (JWT)
- Charging station management (CRUD operations)
- Interactive map view (Leaflet + OpenStreetMap)
- Status tracking
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- RESTful API
- Swagger for API documentation

### Frontend
- Vue.js 3 with Composition API
- Vite for build tooling
- Pinia for state management
- Vue Router for navigation
- Tailwind CSS for styling
- Leaflet with OpenStreetMap for maps

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- MongoDB 4.x or later

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd evolt
   ```

2. Install dependencies for all packages:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both `backend` and `frontend` directories
   - Ensure the following variables are set in `backend/.env`:
     - `MONGODB_URI=<your-mongodb-uri>`
     - `JWT_SECRET=<your-jwt-secret>`
     - `PORT=3000` (optional, defaults to 3000)
   - The frontend may not require any special environment variables for development

4. Start the development servers (in two terminals):
   ```bash
   # Terminal 1
   cd backend
   npm start

   # Terminal 2
   cd frontend
   npm run dev
   ```

## Project Structure

```
evolt/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   └── package.json
├── frontend/         # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   └── App.vue
│   └── package.json
└── README.md
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server (Swagger UI).

### Main Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/stations` - Get all stations (supports filtering)
- `POST /api/stations` - Create a new station (JWT required)
- `PUT /api/stations/:id` - Update a station (JWT required)
- `DELETE /api/stations/:id` - Delete a station (JWT required)

> **Note:** Some endpoints require a JWT token in the `Authorization` header as `Bearer <token>`.

## Development

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- API is available at `http://localhost:3000/api`

## Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set up environment variables for production

3. Deploy the backend to your hosting service

4. Deploy the frontend build to your static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 