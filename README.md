# CV Portfolio Application

A full-stack web application for creating and managing CV/portfolio content with role-based access control.

## Features

- **Public Content Viewing**: Anyone can view all published content
- **Role-Based Access Control**: 
  - **Master Admin**: Can manage all content and admins
  - **General Admin**: Can only manage their own content
- **Content Management**: Create, edit, and delete pages, sections, and cards
- **File Upload**: Support for images and documents
- **Rich Text Editing**: WYSIWYG editor for content creation
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/amohooo/cv-app.git
cd cv-app
```

### 2. Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE cv_portfolio;
   CREATE USER 'cv_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON cv_portfolio.* TO 'cv_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Configure Database Connection**:
   Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=cv_user
   DB_PASSWORD=your_password
   DB_NAME=cv_portfolio
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5001
   ```

### 3. Backend Setup

```bash
cd server
npm install
```

### 4. Frontend Setup

```bash
cd ../client
npm install
```

### 5. Initialize Database

```bash
cd ../server
npm run init-db
```

This will create the necessary tables and set up the initial master admin account.

### 6. Create Master Admin

```bash
npm run setup-master-admin
```

Follow the prompts to create your master admin account.

## Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd server
   npm start
   ```
   The server will run on http://localhost:5001

2. **Start the Frontend** (in a new terminal):
   ```bash
   cd client
   npm start
   ```
   The frontend will run on http://localhost:3000

### Production Mode

1. **Build the Frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Start the Backend**:
   ```bash
   cd server
   npm start
   ```

## Usage

### Accessing the Application

- **Public View**: http://localhost:3000 (or your domain)
- **Admin Dashboard**: http://localhost:3000/admin

### User Roles

#### Master Admin
- Can view and manage all content (pages, sections, cards)
- Can create, edit, and delete any content
- Can manage other admin accounts
- Can register new general admins

#### General Admin
- Can view all content
- Can only create, edit, and delete their own content
- Can register themselves (public registration)

#### Public Users
- Can view all published content
- No editing capabilities

### Content Management

1. **Pages**: Top-level content containers
2. **Sections**: Content sections within pages
3. **Cards**: Individual content items within sections

Each level supports:
- Rich text content
- File uploads (images, documents)
- Ordering
- Ownership tracking

## File Structure

```
My_CV/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # React components
│   │   ├── src/
│   │   │   ├── context/        # React context providers
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── services/       # API services
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   └── README.md
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── scripts/            # Database scripts
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Public admin registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication status

### Content Management
- `GET /api/pages` - Get all pages
- `POST /api/pages` - Create page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

- `GET /api/sections/page/:pageId` - Get sections for page
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

- `GET /api/cards/section/:sectionId` - Get cards for section
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### File Upload
- `POST /api/upload` - Upload files

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**:
   - Change the port in `.env` file
   - Kill processes using the port

3. **File Upload Issues**:
   - Check upload directory permissions
   - Ensure upload directory exists

4. **Authentication Issues**:
   - Verify JWT_SECRET is set in `.env`
   - Check if admin account exists

### Logs

- **Backend logs**: Check server console output
- **Frontend logs**: Check browser developer console

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Sequelize ORM
- **XSS Protection**: Content sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 