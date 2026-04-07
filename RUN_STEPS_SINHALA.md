# Run Karana Hati - Sinhala Guide

## 1. Project eka unzip karanna
`smart-campus-modules-cde.zip` unzip karala folder eka open karanna.

## 2. Backend run karanna
1. VS Code open karanna.
2. `backend` folder eka terminal eke open karanna.
3. me command eka run karanna:
   ```bash
   mvn spring-boot:run
   ```
4. Backend eka `http://localhost:8080` walin run wenawa.
5. H2 database console eka balanna one nam:
   `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:file:./data/smart-campus-db;AUTO_SERVER=TRUE`
   - username: `sa`
   - password: leave empty

## 3. Frontend run karanna
1. aluth terminal ekak open karanna.
2. `frontend` folder ekata yanna.
3. packages install karanna:
   ```bash
   npm install
   ```
4. frontend run karanna:
   ```bash
   npm run dev
   ```
5. Browser eke `http://localhost:5173` open karanna.

## 4. Login wenna
Login page eke tiyena demo accounts use karanna:
- Admin - `admin@smartcampus.local` / `Admin@123`
- Technician - `tech@smartcampus.local` / `Tech@123`
- User - `user@smartcampus.local` / `User@123`

## 5. Google OAuth on karanna one nam
Backend run karanna kalin env values set karanna:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- optional: `FRONTEND_URL=http://localhost:5173`

Example Mac/Linux:
```bash
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
export FRONTEND_URL=http://localhost:5173
mvn spring-boot:run
```

Windows PowerShell:
```powershell
$env:GOOGLE_CLIENT_ID="your_google_client_id"
$env:GOOGLE_CLIENT_SECRET="your_google_client_secret"
$env:FRONTEND_URL="http://localhost:5173"
mvn spring-boot:run
```

## 6. VS Code Extensions (optional but useful)
- Extension Pack for Java
- Spring Boot Extension Pack
- ES7 React snippets

## 7. Common issues
### Maven not found
Java 17 and Maven install karala PATH ekata add karanna.

### Frontend not opening
`npm install` hariyata una da kiyala balanna.

### Google login wadakaranne nathi nam
Google credentials dapu nadda kiyala balanna. Demo local login nam OAuth nathuwa run wenawa.

## 8. Teammates integrate karana hati
- Dulmi ge booking/resource module walin `resourceName` saha `relatedResourceId` ticket ekata link karanna puluwan.
- Notification service eka reuse karala booking approval/rejection notifications add karanna puluwan.
