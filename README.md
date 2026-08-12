# 🚀 Real-Time Chat Platform

A modern **full-stack real-time chat application** built using the **MERN Stack**, **Socket.IO**, **JWT Authentication**, **MongoDB Atlas**, **Docker**, and **Cloudinary**. The application enables secure one-to-one and group messaging with real-time updates, file sharing, notifications, online presence, and a responsive user interface.

---

# 📸 Project Preview

> *(Add screenshots or GIFs here after deployment.)*

| Login          | Chat Dashboard |
| -------------- | -------------- |
| *(Screenshot)* | *(Screenshot)* |

---

# 🌐 Live Demo

Frontend: **Coming Soon**

Backend API: **Coming Soon**

AWS Deployment: **Coming Soon**

---

# 📌 Features

## 🔐 Authentication

* User Registration
* User Login
* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes
* Persistent User Sessions
* Logout Functionality

---

## 💬 Real-Time Messaging

* One-to-One Chat
* Group Chat
* Instant Messaging using Socket.IO
* Typing Indicator
* Online / Offline Status
* Auto Scroll to Latest Messages
* Message Timestamps
* Unread Message Badge
* Last Message Preview

---

## 👥 Group Management

* Create Group Chat
* Rename Group
* Add Members
* Remove Members
* Leave Group
* Group Admin Controls

---

## 🔍 User Search

* Search Registered Users
* Start Conversation Instantly
* Search Drawer

---

## 🔔 Notifications

* Real-Time Notifications
* Unread Notification Counter
* Notification Dropdown
* Auto Navigation to Conversation

---

## 📂 File Sharing

* Upload Images
* Upload Documents
* Cloudinary Integration
* Download Attachments
* File Preview Support

---

## 👤 User Profile

* View Profile
* Update Profile
* Avatar Support

---

## 🎨 User Interface

* Responsive Design
* Chakra UI
* Mobile Friendly
* Clean Chat Interface
* Smooth User Experience

---

# 🏗️ Tech Stack

## Frontend

* React 17
* Chakra UI
* Context API
* Axios
* React Router DOM
* Socket.IO Client

---

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* bcrypt.js
* Multer

---

## Database

* MongoDB Atlas
* Mongoose

---

## Cloud Services

* Cloudinary
* Docker
* Docker Compose
* AWS EC2 *(Deployment)*

---

# 📂 Project Structure

```text
real-time-chat-platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── Pages/
│   │   ├── config/
│   │   └── App.js
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/real-time-chat-platform.git

cd real-time-chat-platform
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file.

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME

CLOUDINARY_API_KEY=YOUR_API_KEY

CLOUDINARY_API_SECRET=YOUR_API_SECRET

NODE_ENV=development
```

Run backend

```bash
npm start
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend runs on

```
http://localhost:3000
```

Backend runs on

```
http://localhost:5000
```

---

# 🐳 Docker Deployment

Build the application

```bash
docker compose build
```

Start containers

```bash
docker compose up -d
```

Stop containers

```bash
docker compose down
```

View logs

```bash
docker compose logs
```

---

# ☁️ AWS Deployment

The application is containerized using Docker and deployed on an Ubuntu AWS EC2 instance.

Deployment includes:

* Ubuntu EC2
* Docker
* Docker Compose
* MongoDB Atlas
* Cloudinary
* Socket.IO
* Nginx *(planned)*
* HTTPS *(planned)*

---

# 📡 API Overview

## Authentication

```
POST /api/user
POST /api/user/login
```

---

## Users

```
GET /api/user
```

---

## Chats

```
POST /api/chat
GET /api/chat
PUT /api/chat/grouprename
PUT /api/chat/groupadd
PUT /api/chat/groupremove
```

---

## Messages

```
POST /api/message
GET /api/message/:chatId
```

---

# 🔄 Socket.IO Events

### Client Events

* setup
* join chat
* typing
* stop typing
* new message

### Server Events

* connected
* typing
* stop typing
* message received

---

# 📖 What I Learned

Through this project I gained practical experience in:

* Building scalable MERN applications
* Designing REST APIs
* Implementing JWT Authentication
* Real-Time Communication using Socket.IO
* MongoDB Data Modeling
* React Context API
* Docker Containerization
* Cloudinary File Upload
* Git & GitHub Workflow
* Deploying applications to AWS EC2

---

# 🚀 Future Improvements

* Read Receipts
* Voice Messages
* Video Calling
* Message Reactions
* Emoji Picker
* Push Notifications
* End-to-End Encryption
* AI Chat Assistant
* Progressive Web App (PWA)

---

# 📚 Skills Demonstrated

* MERN Stack Development
* REST API Development
* Authentication & Authorization
* Real-Time Systems
* Database Design
* Responsive UI Development
* Docker
* Cloud Deployment
* Git Version Control
* Full Stack Application Development

---

# 👨‍💻 Author

**Shreyansh Shah**

GitHub: https://github.com/YOUR_USERNAME

LinkedIn: https://linkedin.com/in/YOUR_PROFILE

Email: YOUR_EMAIL

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub. It helps others discover the project and supports my work.

---





  
