# ACME Salary Management System
**Product Requirements Document (PRD)**

**Version:** 1.0  
**Product:** Employee Salary Management System  
**Target User:** HR Manager

## 1. Problem Statement
ACME currently manages salary information for 10,000 employees across multiple countries using spreadsheets. This creates challenges in maintaining accurate records, updating salaries, finding employee information and generating compensation insights.

The goal is to build a centralized web application to simplify employee salary management and provide meaningful organizational salary insights.

## 2. Goals
- Centralize employee and salary information.
- Simplify employee search and salary updates.
- Provide accurate salary analytics.
- Support 10,000 employee records efficiently.
- Maintain salary change history.

## 3. Functional Requirements

### A. Dashboard
- Display total employees, average salary and payroll metrics.
- Show employee distribution by country and department.
- Display salary distribution by department and country.

### B. Employee Management
- View employee directory with pagination.
- Search by employee name or ID.
- Filter by country, department and employment status.
- Sort by name, joining date and salary.
- View individual employee details.

### C. Salary Management
- Add and update employee salary records.
- Support multiple currencies.
- Validate salary amounts and required fields.
- Maintain salary revision history with effective dates.

### D. Salary Insights
- Average salary by country and department.
- Highest and lowest salaries.
- Department-wise payroll distribution.
- Currency-aware reporting to avoid incorrect cross-country comparisons.

## 4. Non-Functional Requirements
- Support 10,000 employee records.
- Use server-side pagination, filtering and sorting.
- Validate inputs on both frontend and backend.
- Implement authentication and role-based authorization.
- Handle API failures gracefully.
- Maintain data consistency and protect sensitive salary information.
- Provide automated tests for core business logic.

## 5. Out of Scope
- Payroll processing and bank transfers.
- Country-specific tax calculations.
- Attendance and leave management.
- Employee self-service portal.
- Multi-level salary approval workflows.
- Live currency conversion.

These features are excluded to keep the initial release focused on employee salary management.

## 6. Assumptions & Technical Decisions
- HR Manager is the primary application user.
- Each employee has one current salary record.
- Salary records retain their original currency.
- Previous salary revisions are preserved.
- Seed data will contain 10,000 fictional employees.
- Salary analytics will be currency-aware.
- The initial implementation will use React, Node.js, Express, SQLite and Prisma.

## 7. Success Criteria
- HR managers can view, search and filter employees.
- HR managers can create and update salary records.
- Salary history is maintained correctly.
- Dashboard metrics reflect actual database records.
- Application handles 10,000 seeded employees efficiently.
- Core functionality is covered by automated tests.
- Application is deployed with a working demo video.
