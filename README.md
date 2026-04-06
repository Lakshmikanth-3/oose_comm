# Community Tool Support System - Setup Guide

## Project Structure
```
comm/
├── server/
│   ├── app.js                 # Express app entry point
│   ├── db.js                  # MySQL connection pool
│   ├── database.sql           # Database schema & sample data
│   └── routes/
│       ├── users.js           # User endpoints
│       ├── tools.js           # Tool endpoints
│       └── usage.js           # Borrow/return endpoints
├── public/
│   ├── index.html             # Main HTML page
│   ├── css/
│   │   └── style.css          # Styling
│   └── js/
│       └── script.js          # Frontend logic
├── package.json               # Dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## Features

### 1. **Inventory Management**
- Display all tools with availability status
- Add new tools to the system
- Edit tool details
- Track quantity available for each tool

### 2. **Availability Calendar**
- View tool-specific usage history
- Check current availability
- See borrowing dates and return dates
- Track tool status (borrowed, returned, overdue)

### 3. **Borrow/Return Tracking**
- Borrow tools with date selection
- Track all active borrowings
- Return tools with ratings and reviews
- Automatic quantity updates

### 4. **User Ratings & Reviews**
- Rate tools after returning them (1-5 stars)
- Write detailed reviews
- View all ratings and reviews for tools
- Filter by tool

## Database Schema

### users table
```sql
- user_id (PRIMARY KEY)
- name
- email (UNIQUE)
- phone
- created_at
```

### tools table
```sql
- tool_id (PRIMARY KEY)
- name
- description
- category
- quantity_available
- location
- created_at
```

### usage table
```sql
- usage_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- tool_id (FOREIGN KEY)
- borrow_date
- expected_return_date
- return_date
- status (borrowed/returned/overdue)
- rating (1-5)
- review
- created_at
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create MySQL Database
```bash
# Open MySQL command line or MySQL Workbench
mysql -u root -p

# Then run the SQL file:
source server/database.sql
```

Or import [server/database.sql](server/database.sql) directly into your MySQL client.

### 3. Configure Environment Variables
Edit `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=community_tools
PORT=3000
```

### 4. Start the Server
```bash
npm start
```

The server will run at `http://localhost:3000`

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Tools
- `GET /api/tools` - Get all tools
- `GET /api/tools/:id` - Get tool by ID
- `POST /api/tools` - Create new tool
- `PUT /api/tools/:id` - Update tool
- `GET /api/tools/:id/availability` - Get tool availability info

### Usage (Borrow/Return)
- `GET /api/usage` - Get all usage records
- `POST /api/usage/borrow` - Borrow a tool
- `PUT /api/usage/return/:usage_id` - Return a tool
- `GET /api/usage/user/:user_id` - Get user's borrowing history
- `GET /api/usage/tool/:tool_id/ratings` - Get tool ratings

## CORS Configuration
The server is configured with CORS enabled for:
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: Enabled
- Allowed origins: http://localhost:3000, http://localhost:5000, http://127.0.0.1:3000

To modify CORS settings, edit the CORS configuration in `server/app.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

## Sample Data

### Default Users
- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- Bob Johnson (bob@example.com)

### Default Tools
- Drill (3 available)
- Hammer (5 available)
- Saw (2 available)
- Ladder (1 available)
- Screwdriver Set (4 available)

## Troubleshooting

### Cannot connect to MySQL
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database exists: `SHOW DATABASES;`

### Port already in use
- Change PORT in .env to different port (e.g., 3001)
- Or kill the process using port 3000

### CORS errors in browser console
- Ensure API_BASE in script.js matches your server URL
- Check CORS configuration in server/app.js

### Tools not showing in dropdown
- Make sure you've added tools through the "Add Tool" button
- Check that database has tools table with data

## Future Enhancements
- User authentication and login
- Email notifications for overdue returns
- Advanced calendar view with better visualization
- Tool damage/maintenance tracking
- Waiting list for unavailable tools
- Tool categories and advanced filtering
- API key authentication
- Admin dashboard

## License
MIT License
