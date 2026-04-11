# Admin Dashboard - Complete CRUD Implementation

## Overview
This admin dashboard provides comprehensive management of all academic resources with full CRUD (Create, Read, Update, Delete) functionality for:

- **Students** - Student records with enrollment info
- **Lecturers** - Faculty members and their profiles
- **Users** - System user management
- **Courses** - Course catalog and credits
- **Classes** - Class sections and enrollment capacity
- **Schedules** - Class timetables and room assignments
- **Faculties & Majors** - Academic organizational structure
- **Enrollments** - Student course registrations
- **Tuition** - Student payment tracking
- **Audit Logs** - System activity history

## Features

### Complete CRUD Operations
Each management section includes:
- **Create**: Add new records via dialog forms
- **Read**: View all records in organized tables with pagination
- **Update**: Edit existing records with validation
- **Delete**: Remove records with confirmation dialogs

### Dashboard Statistics
The main dashboard displays:
- Total Students
- Total Courses
- Total Revenue

### Component Architecture
The admin interface uses modular components:

#### Core Components
- `StudentsTab` - Full student management
- `LecturersTab` - Faculty member management
- `CoursesTab` - Course catalog management
- `ClassesTab` - Class section management
- `SchedulesTab` - Timetable management
- `FacultiesMajorsTab` - Academic structure management

### API Integration
All components use the centralized API layer (`lib/admin-api.ts`) which includes:

#### Students
- `getStudents()` - List all students with details
- `createStudent(data)` - Create new student
- `updateStudent(id, data)` - Update student info
- `deleteStudent(id)` - Remove student

#### Lecturers
- `getLecturers()` - List all lecturers
- `createLecturer(data)` - Create new lecturer
- `updateLecturer(id, data)` - Update lecturer info
- `deleteLecturer(id)` - Remove lecturer

#### Courses
- `getCourses()` - List all courses
- `createCourse(data)` - Create new course
- `updateCourse(id, data)` - Update course info
- `deleteCourse(id)` - Remove course

#### Classes
- `getClasses(semesterId, status)` - List classes with filters
- `createClass(data)` - Create new class
- `updateClass(id, data)` - Update class info
- `deleteClass(id)` - Remove class

#### Schedules
- `getSchedules(semesterId)` - List schedules
- `createSchedule(data)` - Create new schedule
- `updateSchedule(id, data)` - Update schedule
- `deleteSchedule(id)` - Remove schedule

#### Faculties & Majors
- `getFaculties()` - List all faculties
- `createFaculty(data)` - Create new faculty
- `updateFaculty(id, data)` - Update faculty
- `deleteFaculty(id)` - Remove faculty
- `getMajors()` - List all majors
- `createMajor(data)` - Create new major

#### Semesters
- `getSemesters()` - List all semesters
- `createSemester(data)` - Create new semester
- `updateSemester(id, data)` - Update semester
- `deleteSemester(id)` - Remove semester

#### Other Operations
- `getUsers()` - List system users
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Remove user
- `getEnrollments()` - List enrollments
- `getTuition()` - List tuition records
- `payTuition(id, amount)` - Record tuition payment
- `getAuditLogs()` - View system activity logs

## Data Models

### Student
```typescript
{
  id: number;
  student_code: string;
  admission_year: number;
  name: string;
  email: string;
  major_name: string;
  faculty_name: string;
}
```

### Lecturer
```typescript
{
  id: number;
  name: string;
  email: string;
  faculty_name: string;
}
```

### Course
```typescript
{
  id: number;
  course_code: string;
  name: string;
  credits: number;
  credit_price: number;
}
```

### Class
```typescript
{
  id: number;
  status: string;
  max_students: number;
  current_students: number;
  available_slots: number;
  course_name: string;
  course_code: string;
  credits: number;
  lecturer_name: string;
  semester_code: string;
  semester_id: number;
}
```

### Schedule
```typescript
{
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  class_id: number;
  status: string;
  course_name: string;
  course_code: string;
  lecturer_name: string;
  semester_code: string;
  semester_id: number;
}
```

## Usage

### Accessing the Admin Dashboard
Navigate to: `/dashboard/admin`

### Creating a Record
1. Click "Add [Resource]" button in the tab header
2. Fill in the form fields
3. Click "Create" button
4. Record is automatically added and table refreshes

### Updating a Record
1. Click "Edit" button on the table row
2. Form fields are pre-populated
3. Modify the fields as needed
4. Click "Update" button
5. Changes are saved and table refreshes

### Deleting a Record
1. Click "Delete" button on the table row
2. Confirm the deletion in the dialog
3. Record is removed from the database
4. Table refreshes automatically

### Refreshing Data
Click the "Refresh" button in any tab header to reload the data from the server.

## Error Handling
- All API calls include try-catch blocks
- User-friendly toast notifications for success/error messages
- Confirmation dialogs for destructive operations
- Form validation before submission
- Loading spinners while fetching data

## Responsive Design
- Mobile-first design approach
- Responsive tables with horizontal scrolling on small screens
- Dialog forms scale appropriately
- Tab navigation adapts to screen size

## Technology Stack
- **Framework**: Next.js 16 with TypeScript
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API
- **Notifications**: Sonner toast library
- **Styling**: Tailwind CSS

## Environment Configuration
The API connects to: `http://localhost:3000`

Update the `API_BASE_URL` in `/lib/admin-api.ts` if your backend runs on a different port/host.

## File Structure
```
/app/dashboard/admin/page.tsx          # Main admin dashboard page
/components/admin/
  ├── students-tab.tsx                  # Student management
  ├── lecturers-tab.tsx                 # Lecturer management
  ├── courses-tab.tsx                   # Course management
  ├── classes-tab.tsx                   # Class management
  ├── schedules-tab.tsx                 # Schedule management
  └── faculties-majors-tab.tsx          # Faculty & major management
/lib/admin-api.ts                       # Centralized API layer
```

## Future Enhancements
- Advanced filtering and search capabilities
- Bulk operations (import/export)
- Role-based access control (RBAC)
- Activity audit logs with filtering
- Scheduled reports generation
- Integration with email notifications
- Student performance analytics
- Automated semester management
