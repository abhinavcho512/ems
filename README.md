# Employee Management System

A full-stack web application built with **Spring Boot** (backend) and **React** (frontend).

## Features
- JWT Authentication (Login / Register)
- Employee CRUD with pagination, search, filter, sort
- Department management
- Dashboard with charts
- Export to CSV and PDF
- Dockerized, deployed on Railway

## Tech Stack
**Backend:** Java 21, Spring Boot 3, Spring Security, JWT, JPA, MySQL  
**Frontend:** React 18, Vite, Axios, Recharts, React Hook Form

## Run Locally

### Backend
```bash
cd backend
# Set env vars or update application.properties with your local MySQL
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API Docs
After running backend, visit: http://localhost:8080/swagger-ui.html
