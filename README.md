# Smart Campus Operations Hub - IT3030 PAF 2026

A full-stack web application developed for the IT3030 Programming Applications and Frameworks assignment. The system supports university facility and asset management, booking workflows, maintenance incident handling, notifications, and role-based authentication.

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Java, Spring Boot REST API |
| Frontend | React + Vite |
| Database | PostgreSQL / Neon PostgreSQL |
| Authentication | JWT-based authentication with Google OAuth 2.0 configuration support |
| Version Control | Git and GitHub |

## Main Modules

### Module A - Facilities and Assets Catalogue

The system supports management of bookable university resources such as lecture halls, laboratories, meeting rooms, and equipment.

Main features:

- Add, view, update, and delete facilities/resources
- Store resource details such as type, capacity, location, availability, and status
- Search and filter resources by type, capacity, location, and status
- Admin-controlled facility/resource management

### Module B - Booking Management

The system allows users to request bookings for available campus resources.

Main features:

- Users can create booking requests with date, time range, purpose, and attendee details
- Booking workflow: `PENDING -> APPROVED / REJECTED -> CANCELLED`
- Admin users can approve or reject bookings with a reason
- Users can view their own bookings
- Admin users can view all bookings with filters
- Overlapping booking prevention for the same resource
- QR code support for approved bookings and check-in

### Module C - Maintenance and Incident Ticketing

The system supports incident reporting and maintenance ticket management.

Main features:

- Users can create tickets for resource or location issues
- Tickets include category, description, priority, contact details, and related resource information
- Ticket workflow: `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`
- Admin can reject tickets with a reason
- Admin can assign technicians to tickets
- Technicians can update status and add resolution notes
- Users and staff can add comments
- Comment edit/delete ownership rules are implemented
- Up to 3 ticket attachments are supported

### Module D - Notifications

The system includes a notification center for important booking and ticket events.

Main features:

- Notification bell with unread count
- Notifications for booking approval/rejection and cancellation
- Notifications for ticket status updates and new comments
- Technician notifications for assigned tickets
- Mark single notification as read
- Mark all notifications as read

### Module E - Authentication and Authorization

The system includes secure role-based access control for users, admins, and technicians.

Main features:

- JWT-based login and API access
- Google OAuth 2.0 configuration support
- Role-based backend endpoint protection
- Role-based frontend route protection
- Supported roles: `USER`, `ADMIN`, `TECHNICIAN`
- Register and login validation for SLIIT student accounts
- User profile and avatar support

## User Roles

| Role | Main Permissions |
|---|---|
| USER | Register/login, view resources, create bookings, view own bookings, create tickets, comment on own tickets, view notifications |
| ADMIN | Manage resources/facilities, view all bookings, approve/reject bookings, view all tickets, assign technicians, update ticket status, review attachments |
| TECHNICIAN | View assigned tickets, update ticket progress, add resolution notes, comment on tickets, view notifications |

## Authentication Validation

The registration and login forms include frontend and backend validation.

Register validation:

- First name and last name are required
- IT number must follow the format `IT` + 8 digits, for example `IT23817180`
- Email must follow the SLIIT student email format, for example `it23817180@my.sliit.lk`
- The IT number and email number must match
- Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
- Confirm password must match the password

Login validation:

- Email is required
- Email must use the SLIIT student email format
- Password is required

## Demo Accounts

The following demo accounts are available through seed data when the database has no existing users.

| Role | Email | Password |
|---|---|---|
| Admin | `it00000001@my.sliit.lk` | `Admin@123` |
| Technician | `it00000002@my.sliit.lk` | `Tech@123` |
| User | `it00000003@my.sliit.lk` | `User@123` |

## Project Structure

```text
backend/              Spring Boot backend application
frontend/             React + Vite frontend application
postman/              Postman collection/support files
RUN_STEPS_SINHALA.md  Local run guide in Sinhala
README.md             Project overview and setup guide
```

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a `.env` file inside the `backend/` folder using the following structure:

```properties
DB_URL=jdbc:postgresql://YOUR_DB_HOST/YOUR_DB_NAME?sslmode=require
DB_USERNAME=YOUR_DB_USERNAME
DB_PASSWORD=YOUR_DB_PASSWORD
JWT_SECRET=replace-with-a-long-random-secret-value
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=./uploads
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Run the backend:

```bash
mvn clean spring-boot:run
```

Backend base URL:

```text
http://localhost:8080
```

## Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Main API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/dev-login
GET  /api/auth/me
POST /api/auth/logout
GET  /api/auth/oauth-info
GET  /api/auth/technicians
```

### Facilities and Resources

```text
GET    /api/resources/active
GET    /api/resources
GET    /api/resources/{id}
POST   /api/resources
PUT    /api/resources/{id}
DELETE /api/resources/{id}

GET  /api/facilities
GET  /api/facilities/{id}
POST /api/facilities
PUT  /api/facilities/{id}
```

### Bookings

```text
POST  /api/bookings
GET   /api/bookings
GET   /api/bookings/mine
PATCH /api/bookings/{id}/decision
PATCH /api/bookings/{id}/cancel
GET   /api/bookings/{id}/qr
POST  /api/bookings/check-in
```

### Tickets

```text
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/mine
GET    /api/tickets/{id}
PATCH  /api/tickets/{id}/assign-technician
PATCH  /api/tickets/{id}/status
POST   /api/tickets/{id}/attachments
GET    /api/tickets/attachments/{attachmentId}/download
POST   /api/tickets/{id}/comments
PUT    /api/comments/{commentId}
DELETE /api/comments/{commentId}
```

### Notifications

```text
GET   /api/notifications
GET   /api/notifications/summary
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
```

## Team Contribution Summary

Replace the names and IT numbers with the actual group member details before submission.

| Member | Responsibility | Main Areas |
|---|---|---|
| Member 1 - Name / IT No | Module A - Facilities and Assets Catalogue | Resource and facility management |
| Member 2 - Name / IT No | Module B - Booking Management | Booking workflow, approval/rejection, conflict checking, QR check-in |
| Member 3 - Name / IT No | Module C - Maintenance and Incident Ticketing | Ticket creation, ticket workflow, comments, attachments, technician updates |
| Member 4 - Name / IT No | Module D and Module E | Notifications, JWT authentication, role-based authorization, OAuth configuration, login/register validation |

## Testing Checklist

The following workflows should be tested before final demonstration:

1. Register a valid SLIIT student account.
2. Login and verify the authenticated user profile.
3. Admin creates and updates a resource or facility.
4. User creates a booking request.
5. Admin approves or rejects the booking.
6. User receives a booking notification.
7. Approved booking QR code is generated and check-in works.
8. User creates an incident ticket with optional attachments.
9. Admin assigns a technician.
10. Technician updates ticket status and resolution notes.
11. User/staff comments work correctly.
12. Notification unread count and mark-read features work correctly.

## Security Notes

- `.env` files must not be committed to GitHub.
- Database credentials, JWT secret, and Google OAuth secrets must be kept private.
- User input is validated on both frontend and backend.
- Role-based access control is applied to protect restricted routes and endpoints.
- File upload limits are applied for ticket attachments.

## Innovation Features

- QR code generation and check-in for approved bookings
- Notification center with unread count
- Dashboard widgets and booking filters
- Profile avatar support
- SLIIT IT number and student email validation

## AI Assistance Disclosure

AI-assisted tools were used for guidance, code review, documentation support, and validation improvements. The final implementation, testing