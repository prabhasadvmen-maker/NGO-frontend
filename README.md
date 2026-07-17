# SAVITRAM FOUNDATION Management System - Frontend

Industrial-grade NGO Management System with Super Admin Dashboard built with React.js and Tailwind CSS using Neomorphism design.

## 🎨 Design System

- **Primary Color**: Deep Green (#1B5E20)
- **Design Pattern**: Neomorphism
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Responsive**: Mobile-first approach

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   └── common/
│   │       ├── StatsCard.jsx
│   │       ├── Table.jsx
│   │       └── Toast.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── dashboard/
│   │   │   └── Overview.jsx
│   │   └── settings/
│   │       └── Settings.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── constants/
│   │   └── colors.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── NGO logo.jpeg
├── package.json
└── vite.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Setup**
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000/api
```

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📋 Features Implemented

### Phase 1 - Super Admin Portal

#### 1. **Login Page**
- Email + Password authentication
- JWT token management
- Form validation with error states
- Loading spinner on submit
- Redirect to dashboard on success
- Token stored in localStorage
- Neomorphism design

#### 2. **Dashboard Overview**
- Sidebar with NGO logo and navigation
- Top navbar with admin name
- Stats cards showing:
  - Total NGOs
  - Total Users
  - Total Donations
  - Active Volunteers
- Recent registrations table
- Fully responsive layout
- Collapsible sidebar on mobile

#### 3. **Settings Page**
- **General Settings Tab**
  - App name configuration
  - Logo upload
  - Contact email
  
- **Security Tab**
  - Change password
  - Session timeout configuration
  
- **Notification Tab**
  - Email/SMS toggles
  - Donation alerts
  - Volunteer alerts

- Save button with success toast messages

## 🔐 Authentication Flow

1. User enters credentials on Login page
2. Form validation checks email format and password length
3. API call to backend `/api/auth/login`
4. JWT token received and stored in localStorage
5. User data stored in AuthContext
6. Redirect to Dashboard
7. Protected routes check for valid token
8. Logout clears token and user data

## 🎯 Component Architecture

### AuthContext
- Manages user authentication state
- Stores JWT token
- Provides login/logout functions
- Persists authentication across page refreshes

### ProtectedRoute
- Wraps protected pages
- Redirects to login if no token
- Shows loading spinner while checking auth

### Neomorphism Design
- Soft shadows for depth
- Light background (#F5F5F5)
- Inset shadows for input fields
- Smooth transitions and hover effects

## 🛠️ API Integration

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - Super admin login
  - Request: `{ email, password }`
  - Response: `{ user, token }`

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-registrations` - Get recent registrations

### Settings
- `PUT /api/settings/general` - Update general settings
- `PUT /api/settings/security` - Update security settings
- `PUT /api/settings/notifications` - Update notification settings

## 📱 Responsive Breakpoints

- Mobile: < 768px (Sidebar collapses)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Color Palette

```javascript
Primary: #1B5E20 (Deep Green)
Primary Light: #2E7D32
Primary Dark: #0D3817
Secondary: #4CAF50
Accent: #81C784
Light Background: #F5F5F5
Text Primary: #1B1B1B
Text Secondary: #666666
Text Light: #999999
```

## 📦 Dependencies

- **react**: ^19.2.7
- **react-dom**: ^19.2.7
- **react-router-dom**: ^6.20.0
- **tailwindcss**: ^4.3.2
- **lucide-react**: ^0.263.1
- **axios**: ^1.6.2

## 🔄 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Code Standards

- Functional components only
- Custom hooks for reusable logic
- PropTypes or JSDoc comments
- No hardcoded values (use constants)
- Reusable components
- Clean and readable code
- Consistent naming conventions

## 🚨 Error Handling

- Form validation with user-friendly messages
- API error handling with toast notifications
- Loading states for async operations
- Protected routes with auth checks

## 🔮 Future Enhancements

- NGO Management
- User Management
- Donation Tracking
- Volunteer Management
- Reports & Analytics
- Advanced Filtering
- Data Export
- Multi-language Support

## 📞 Support

For issues or questions, contact: admin@savitram.org

---

**Built with ❤️ for SAVITRAM FOUNDATION**
