# Smart Campus Operations Hub - Modules C, D and E

This zip contains a clean starter implementation for the PAF assignment using:
- **Backend:** Spring Boot REST API
- **Frontend:** React + Vite

Covered modules:
- **Module C - Maintenance & Incident Ticketing**
- **Module D - Notifications**
- **Module E - Authentication & Authorization**

## What is included
- Role-based auth with **JWT**
- **Google OAuth 2.0 ready** flow for assignment alignment
- **Local demo login** accounts for quick development and viva practice
- Ticket creation, comment flow, technician assignment, status updates
- Notification center with unread count and mark-read actions
- Attachment upload support for tickets (up to 3)
- Clear backend structure with entities, repositories, services and controllers
- Clear frontend structure with pages, layout, protected routes and API services

## Demo accounts
- Admin: `admin@smartcampus.local` / `Admin@123`
- Technician: `tech@smartcampus.local` / `Tech@123`
- User: `user@smartcampus.local` / `User@123`

## Folder structure
- `backend/` - Spring Boot application
- `frontend/` - React client
- `postman/` - sample collection placeholder
- `RUN_STEPS_SINHALA.md` - simple run steps in Sinhala

## Notes for your teammates
- **Dulmi** can connect Module A and B later using `relatedResourceId` and `resourceName` fields already placed in the ticket model.
- Notifications are already implemented for ticket assignment, status changes and comments. Dulmi can later reuse the same notification service for booking notifications.
- If you want full rubric-level Google login, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend before running.
# Sandeep-19999-it3030-paf-2026-smart-campus-group36
