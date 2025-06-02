# EVolt Management System

A comprehensive charging station management system for electric vehicle charging infrastructure.

## Features

### Authentication & User Management
- User registration and login
- Role-based access control (User and Admin roles)
- Secure JWT-based authentication
- Protected routes and API endpoints

### Station Management
- View all charging stations
- Create new charging stations
- Edit and delete stations (with permission)
- Filter stations by status, connector type, and power output
- Interactive map view for station locations

### Access Control
- **View Access**: All authenticated users can view all stations
- **Modification Access**: 
  - Users can only modify stations they created
  - Admins can modify all stations
  - Other users can view but not modify stations they didn't create

## User Roles & Permissions

### Regular Users
- Can view all stations
- Can create new stations
- Can modify only their own stations
- Can delete only their own stations

### Admin Users
- Can view all stations
- Can create new stations
- Can modify any station
- Can delete any station

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Stations
- `GET /api/stations` - Get all stations (with filters)
- `GET /api/stations/:id` - Get single station
- `POST /api/stations` - Create new station
- `PUT /api/stations/:id` - Update station (requires permission)
- `DELETE /api/stations/:id` - Delete station (requires permission)

## Technology Stack

### Frontend
- Vue.js 3
- Pinia for state management
- Tailwind CSS for styling
- Leaflet for maps
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```env
   # Frontend (.env)
   VITE_API_URL=your_api_url

   # Backend (.env)
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   npm run dev
   ```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Protected API endpoints
- CORS configuration
- Error handling middleware

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 