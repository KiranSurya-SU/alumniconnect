# Alumni Association Platform

A full-stack web application for alumni networking, mentoring, and event management. The platform facilitates communication between alumni through real-time chat, forum discussions, job postings, and event organization.

## Features

- Real-time chat messaging
- User authentication and authorization
- Forum discussions
- Event management
- Job board
- Mentoring sessions
- User profiles

## Tech Stack

### Frontend
- React.js with Vite
- Redux for state management
- Real-time communication with Socket.IO client
- Modern UI/UX design

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- Socket.IO for real-time features
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone [repository-url]
cd APP_ALUMNI
```

### 2. Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the server directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumni_db
JWT_SECRET=your_jwt_secret_key
```

4. Start the server:
```bash
npm start
```

### 3. Client Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Access the application at `http://localhost:5173` (or the port shown in your terminal)
2. Register a new account or login with existing credentials
3. Explore features like:
   - Chat with other alumni
   - Create or join forum discussions
   - Post or search for job opportunities
   - Create and manage events
   - Schedule mentoring sessions

## Development

- Server runs on port 5000 by default
- Client development server runs on port 5173 by default
- Real-time features are handled through Socket.IO
- API endpoints are prefixed with `/api`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details