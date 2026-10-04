# 🏠 RentEase

## Rental Property Management System

RentEase is a full-stack web-based Rental Property Management System designed to simplify the complete rental management process for Tenants, Property Owners, and Administrators.

The platform provides role-based access and helps manage properties, rental units, applications, contracts, rent payments, maintenance requests, complaints, reviews, notifications, reports, and administrative activities.

---

## 🌐 Live Demo

### Frontend

https://rent-ease-chi-tawny.vercel.app/

### Backend API

https://rent-ease-dlr7.vercel.app/

---

## 💻 GitHub Repository

https://github.com/saifulislamsshakib/RentEase

---

# 🎯 Project Overview

RentEase is designed to provide a centralized platform for rental property management.

The system connects three main types of users:

- 👤 Tenant
- 🏠 Property Owner
- 🛡️ Administrator

Each user role has different permissions and access to relevant features.

The platform allows tenants to search and apply for rental properties, property owners to manage properties and tenants, and administrators to monitor and manage the overall platform.

---

# 👥 User Roles

## 👤 Tenant

Tenants can:

- Create an account
- Login securely
- Manage their profile
- Search rental properties
- Filter properties
- View property details
- Check unit availability
- Submit rental applications
- Track application status
- View rental contracts
- View rent information
- View payment history
- Submit maintenance requests
- Track maintenance requests
- Submit complaints
- Provide ratings and reviews
- Receive notifications

---

## 🏠 Property Owner

Property Owners can:

- Create an account
- Login securely
- Manage their profile
- Add properties
- Update properties
- Manage multiple rental properties
- Add rental units
- Manage apartment/flat/room information
- Set rental prices
- Manage unit availability
- Review rental applications
- Approve or reject applications
- Manage tenants
- Create rental contracts
- Track rent payments
- Monitor pending rent
- Manage maintenance requests
- Manage complaints
- View property statistics
- View rental reports
- Receive notifications

---

## 🛡️ Administrator

Administrators can:

- Manage user accounts
- Monitor properties
- Review rental activities
- Monitor complaints
- Handle reported issues
- Review invalid information
- Monitor reviews
- Manage platform statistics
- View reports
- Maintain overall system control

---

# 🔄 Main Rental Workflow

```text
Tenant
   │
   ├── Search Property
   │
   ├── View Property Details
   │
   ├── Check Unit Availability
   │
   └── Submit Rental Application
                │
                ↓
        Property Owner
                │
                ├── Review Application
                │
                ├── Approve / Reject
                │
                ↓
        Approved Application
                │
                ↓
        Unit Reservation
                │
                ↓
        Rental Contract
                │
                ↓
          Active Tenant
                │
        ┌───────┼────────┐
        ↓       ↓        ↓
      Rent   Maintenance Complaint
      Payment   Request
        │       │        │
        └───────┼────────┘
                ↓
       Rental Management









### Demo Accounts

**Tenant**
Email: saifulislamsshakib@gmail.com
Password: 123456

**Property Owner**
Email: aminridx@gmail.com
Password: 123456

**Administrator**
Email: *********
Password:

### Recommended Demo

**Tenant**
- Browse properties
- View property details
- Submit rental application
- Check application status
-Submit Complaint
-  Submit Maintainance application


**Property Owner**
- Manage properties
- Manage rental units
- Review applications
- Manage tenants
- Manage payments
- Handle maintenance requests
- Handle complaint requests

**Administrator**
- Manage users
- Monitor properties
- Review complaints
- View reports and statistics
```
