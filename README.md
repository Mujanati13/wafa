# WAFA User Management System

This project includes a comprehensive user management system with separate views for free and paying users.

## Features

### Backend API Endpoints

The backend provides the following user management endpoints:

- `GET /api/v1/users` - Get all users with pagination
- `GET /api/v1/users/free` - Get free users (plan: "Free")
- `GET /api/v1/users/paying` - Get paying users (plan: not "Free")
- `GET /api/v1/users/stats` - Get user statistics
- `PATCH /api/v1/users/:userId/plan` - Update user plan
- `PATCH /api/v1/users/:userId/status` - Toggle user active status

### Frontend Components

#### UsersWithTabs Component
- **Tab 1: Free Users** - Displays all users with "Free" plan
- **Tab 2: Paying Users** - Displays all users with Premium, Enterprise, or Student Discount plans
- **Real-time Statistics** - Shows total users, free users, paying users, and active users
- **Search & Filter** - Search users by name, username, or email
- **Pagination** - Navigate through large user lists
- **Responsive Design** - Works on all device sizes

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd wafa-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   MONGO_URL=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd wafa-frentend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

### Admin Routes

- `/admin/users` - Main user management page with tabs
- `/admin/usersFree` - Direct access to free users tab
- `/admin/usersPaying` - Direct access to paying users tab

### User Plans

The system supports the following user plans:
- **Free** - Basic access
- **Premium** - Enhanced features
- **Enterprise** - Full access
- **Student Discount** - Discounted premium access

### User Status

Users can have the following statuses:
- **Active** - User account is active
- **Inactive** - User account is deactivated

## API Response Format

All API endpoints return data in the following format:

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Database Schema

The User model includes:
- `username` - Unique username
- `name` - Full name
- `email` - Unique email address
- `password` - Hashed password
- `isAactive` - Account status
- `isAdmin` - Admin privileges
- `plan` - Subscription plan
- `semester` - Academic semester
- `resetCode` - Password reset code
- `timestamps` - Created/updated dates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
