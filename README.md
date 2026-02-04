# Dexsini Hub - Secure Employee Gateway

Dexsini Hub is a modern, comprehensive Admin Portal for employee management, leave tracking, and overtime claims. Built with a focus on "Abyssal Glass" aesthetics and robust functionality.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Framer Motion, Axios, Lucide React.
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, JWT Auth.
- **Database**: PostgreSQL (or SQLite for dev).

## ✨ Features

### 1. Authentication
- Secure Login with JWT.
- Role-based Access Control (Admin, Manager, Employee).

### 2. Dashboard (`/admin/dashboard`)
- Real-time statistics (Total Employees, Pending Leaves/OT).
- "Who's Out Today" widget.

### 3. Employee Management (`/admin/employees`)
- **List View**: Searchable table of all employees.
- **CRUD**: Add, Edit, and Delete employees.
- **Rich Profiles**: Track DOB, Phone, Join Date, Role, and Designation.

### 4. Leave Management (`/admin/leaves`)
- **Apply**: Simple modal to request leave.
- **Approval**: Admins can Approve/Reject requests.
- **Tracking**: Status indicators (Pending/Approved/Rejected).

### 5. Overtime Management (`/admin/overtime`)
- **Claims**: Log overtime hours with automatic duration calculation.
- **Workflow**: Manager approval process for payouts.

### 6. Master Calendar (`/admin/calendar`)
- **Visual Grid**: See the entire month at a glance.
- **Events**: Holidays (🎉) and Approved Leaves (🤒) displayed on dates.
- **Management**: Add new Holidays directly from the calendar.

## 🛠️ How to Run

### Backend
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run Server
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
# Install dependencies
npm install
# Run Dev Server
npm run dev
```

## 🗄️ Database
- The backend uses SQLAlchemy.
- `schema.sql` contains the raw structure reference.
- Run `python initial_data.py` to seed the admin user if resetting.

---
*Built for Dexsini.*
