# Admin Dashboard Setup Guide

## Quick Start

The admin dashboard is now fully integrated with complete CRUD functionality for all entities.

### Access the Admin Dashboard

1. **Start your frontend** (Next.js app):
   ```bash
   npm run dev
   ```

2. **Navigate to**: `http://localhost:3000/dashboard/admin`

3. **Login** with your admin account (you must have `role = 'admin'` in the database)

## What's Implemented

### Complete CRUD for All Entities

✅ **Students**
- View all students with complete details
- Create new students (with automatic user account creation)
- Update student information
- Delete students (removes student and user records)

✅ **Lecturers**
- View all lecturers
- Create new lecturers (with automatic user account creation)
- Update lecturer information
- Delete lecturers

✅ **Users**
- View all system users with roles
- Create new users (student/lecturer/admin)
- Update user information (name, email, status)
- Deactivate/activate users
- Delete users

✅ **Courses**
- View all courses
- Create courses (code, name, credits, price per credit)
- Update course information
- Delete courses

✅ **Classes**
- View all class sections with real-time enrollment data
- Create classes (assign course, lecturer, semester, max students)
- Update class information and status
- Delete classes
- See available slots and current enrollment

✅ **Schedules**
- View all class schedules with full details
- Create schedules (assign to class, day, time, room)
- Update schedule information
- Delete schedules

✅ **Faculties & Majors**
- Manage academic faculties (code, name)
- Manage academic majors (code, name, faculty)
- Create and update faculties
- Create majors
- Delete faculties

✅ **Additional Features**
- View enrollments (student registrations)
- View tuition records with payment status
- View audit logs of system activities

## Database Integration

Your backend APIs at `http://localhost:3000` should support these endpoints:

### Student Management
```
GET    /admin/students                 - Get all students
POST   /admin/students                 - Create student
PUT    /admin/students/:id             - Update student
DELETE /admin/students/:id             - Delete student
GET    /admin/students/search?name=... - Search students
```

### Lecturer Management
```
GET    /admin/lecturers                - Get all lecturers
POST   /admin/lecturers                - Create lecturer
PUT    /admin/lecturers/:id            - Update lecturer
DELETE /admin/lecturers/:id            - Delete lecturer
```

### User Management
```
GET    /admin/users                    - Get all users
POST   /admin/users                    - Create user
PUT    /admin/users/:id                - Update user
DELETE /admin/users/:id                - Delete user
```

### Course Management
```
GET    /admin/courses                  - Get all courses
POST   /admin/courses                  - Create course
PUT    /admin/courses/:id              - Update course
DELETE /admin/courses/:id              - Delete course
```

### Class Management
```
GET    /admin/classes/full             - Get all classes with details
POST   /admin/classes                  - Create class
PUT    /admin/classes/:id              - Update class
DELETE /admin/classes/:id              - Delete class
```

### Schedule Management
```
GET    /admin/schedules/full           - Get all schedules with details
POST   /admin/schedules                - Create schedule
PUT    /admin/schedules/:id            - Update schedule
DELETE /admin/schedules/:id            - Delete schedule
```

### Faculty & Major Management
```
GET    /admin/faculties                - Get all faculties
POST   /admin/faculties                - Create faculty
PUT    /admin/faculties/:id            - Update faculty
DELETE /admin/faculties/:id            - Delete faculty
GET    /admin/majors                   - Get all majors
POST   /admin/majors                   - Create major
```

### Semester Management
```
GET    /admin/semesters                - Get all semesters
POST   /admin/semesters                - Create semester
PUT    /admin/semesters/:id            - Update semester
DELETE /admin/semesters/:id            - Delete semester
```

### Other Endpoints
```
GET    /admin/enrollments              - Get all enrollments
GET    /admin/tuition/full             - Get all tuition records
PUT    /admin/tuition/:id/pay          - Record tuition payment
GET    /admin/logs                     - Get audit logs
GET    /admin/reports                  - Get dashboard statistics
```

## Component Files Structure

```
components/admin/
├── students-tab.tsx          # Student management (270 lines)
├── lecturers-tab.tsx         # Lecturer management (240 lines)
├── courses-tab.tsx           # Course management (210 lines)
├── classes-tab.tsx           # Class management (290 lines)
├── schedules-tab.tsx         # Schedule management (270 lines)
└── faculties-majors-tab.tsx  # Faculty & major management (330 lines)

lib/
└── admin-api.ts              # Centralized API layer (450+ lines with all CRUD)

app/dashboard/admin/
└── page.tsx                  # Main admin dashboard page
```

## Features by Tab

### Students Tab
- Full student roster with admission year and major
- Create: Full name, email, password, student code, major, admission year
- Edit: All fields except password
- Delete: Student and associated user account

### Lecturers Tab
- Faculty roster with assigned faculty
- Create: Full name, email, password, faculty assignment
- Edit: All fields except password
- Delete: Lecturer and associated user account

### Users Tab
- System user management
- Create: Name, email, password, role (student/lecturer/admin)
- Edit: Name, email, active status
- Delete: Entire user account

### Courses Tab
- Course catalog with credit pricing
- Create: Course code, name, credits, price per credit
- Edit: All course information
- Delete: Course from system

### Classes Tab
- All class sections with real-time enrollment
- Shows: Course name, lecturer, semester, current/max students, available slots
- Create: Select course, lecturer, semester, max capacity
- Edit: Class information and status
- Delete: Remove class section

### Schedules Tab
- Complete timetable with room assignments
- Shows: Course, lecturer, day, time, room, semester
- Create: Assign to class, day of week, start/end time, room
- Edit: All schedule details
- Delete: Remove from schedule

### Faculties & Majors Tab
- Academic organizational structure
- Create/Edit/Delete faculties (code, name)
- Create/Delete majors (code, name, faculty)

### Additional Tabs
- **Enrollments**: View student course registrations
- **Tuition**: View and update student payment records
- **Logs**: View system activity audit trail

## Error Handling

All operations include:
- Input validation before submission
- Success/error toast notifications
- Confirmation dialogs for destructive operations
- Loading states with spinners
- Proper error messages from API

## Next Steps

1. **Verify Backend APIs** - Ensure all endpoints listed above are working
2. **Test CRUD Operations** - Try creating, updating, and deleting records
3. **Check Data Consistency** - Verify cascading deletes work properly
4. **Monitor Error Logs** - Check browser console and server logs
5. **Customize Styling** - Modify Tailwind CSS classes as needed

## Troubleshooting

### "Failed to load [resource]" errors
- Check if backend server is running on port 3000
- Verify API endpoints are implemented
- Check CORS settings on backend

### Form validation errors
- Ensure all required fields are filled
- Check input formats (emails, numbers, etc.)
- Verify data types match API expectations

### Dialog not closing after creation
- Check browser console for API errors
- Verify the API response includes required fields
- Check if `onLoad` callback is being triggered

## Support

For detailed API documentation, check the Express backend file you provided with all endpoint definitions.
