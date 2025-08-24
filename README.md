# Vitacoin - Admin Dashboard MVP

A full-stack coin management system with real-time simulation capabilities.

## Features

- **User Management**: Create and manage users with coin balances
- **Transaction System**: Process rewards and penalties with automatic balance updates
- **Dynamic Configuration**: Set reward/penalty values for different activities
- **Live Demo Simulation**: Real-time activity and purchase simulation
- **Admin Dashboard**: Complete administrative interface

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Axios
- **Database**: MongoDB
- **Styling**: CSS

## Quick Start

### Backend Setup
```
cd vitacoin-backend
npm install
npm start
```

### Frontend Setup
```
cd vitacoin-frontend
npm install
node server.js
```

### Environment Setup
Create a `.env` file in the vitacoin-backend folder with:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

## Demo

- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/reward-configs` - Get reward configurations
- `PUT /api/reward-configs/:activityType` - Update reward config
- `POST /api/demo/initialize` - Initialize demo data
- `POST /api/demo/simulate-activity` - Simulate user activity
- `POST /api/demo/simulate-purchase` - Simulate purchase

## Project Structure

```
vitacoin/
├── vitacoin-backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Main server file
│   └── package.json
├── vitacoin-frontend/
│   ├── src/
│   │   ├── Dashboard.js # Main dashboard component
│   │   ├── Dashboard.css
│   │   └── App.js
│   └── package.json
├── .gitignore
└── README.md
```

## Built for Coursevita Hiring Hackathon (Aug 2025)

This project demonstrates a complete coin credit system with administrative controls and real-world simulation capabilities, built in 9+ hours during a hackathon.




