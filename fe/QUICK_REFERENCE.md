# Admin Dashboard - Quick Reference

## 🚀 Getting Started

1. **Start Backend**: Ensure your Express server runs on `http://localhost:3000`
2. **Start Frontend**: `npm run dev`
3. **Access Dashboard**: Navigate to `http://localhost:3000/dashboard/admin`
4. **Login**: Use an account with `role = 'admin'`

## 📋 All CRUD Operations Available

### ✅ Full CRUD (Create, Read, Update, Delete)
- [x] Students
- [x] Lecturers  
- [x] Users
- [x] Courses
- [x] Classes
- [x] Schedules
- [x] Faculties
- [x] Semesters

### ✅ Create & Read Only
- [x] Majors (create only)
- [x] Enrollments (read only)
- [x] Tuition (read + update payment)
- [x] Audit Logs (read only)

## 🎯 Main Actions by Tab

| Tab | Create | Read | Update | Delete | Notes |
|-----|--------|------|--------|--------|-------|
| Users | ✓ | ✓ | ✓ | ✓ | Can activate/deactivate |
| Students | ✓ | ✓ | ✓ | ✓ | Auto-creates user account |
| Lecturers | ✓ | ✓ | ✓ | ✓ | Auto-creates user account |
| Faculties | ✓ | ✓ | ✓ | ✓ | - |
| Courses | ✓ | ✓ | ✓ | ✓ | Shows credit pricing |
| Classes | ✓ | ✓ | ✓ | ✓ | Real-time enrollment |
| Schedules | ✓ | ✓ | ✓ | ✓ | 7 days of week |
| Enrollments | - | ✓ | - | - | View only |
| Tuition | - | ✓ | ✓ | - | Payment updates |
| Logs | - | ✓ | - | - | View only |

## 📁 New Files Created

```
components/admin/
├── students-tab.tsx (270 lines) - Student CRUD
├── lecturers-tab.tsx (240 lines) - Lecturer CRUD
├── courses-tab.tsx (210 lines) - Course CRUD
├── classes-tab.tsx (290 lines) - Class CRUD
├── schedules-tab.tsx (270 lines) - Schedule CRUD
└── faculties-majors-tab.tsx (330 lines) - Faculty/Major CRUD

lib/
└── admin-api.ts (+150 lines) - New CRUD API functions

Documentation/
├── ADMIN_DASHBOARD_README.md - Feature overview
├── ADMIN_SETUP.md - Setup guide
├── IMPLEMENTATION_SUMMARY.md - Technical details
├── DASHBOARD_GUIDE.md - Visual guide
└── QUICK_REFERENCE.md - This file
```

## 🔗 API Endpoints Summary

### Students
```
GET    /admin/students              List all
POST   /admin/students              Create
PUT    /admin/students/:id          Update
DELETE /admin/students/:id          Delete
GET    /admin/students/search?name  Search
```

### Lecturers
```
GET    /admin/lecturers             List all
POST   /admin/lecturers             Create
PUT    /admin/lecturers/:id         Update
DELETE /admin/lecturers/:id         Delete
```

### Users
```
GET    /admin/users                 List all
POST   /admin/users                 Create
PUT    /admin/users/:id             Update
DELETE /admin/users/:id             Delete
```

### Courses
```
GET    /admin/courses               List all
POST   /admin/courses               Create
PUT    /admin/courses/:id           Update
DELETE /admin/courses/:id           Delete
```

### Classes
```
GET    /admin/classes/full          List with details
POST   /admin/classes               Create
PUT    /admin/classes/:id           Update
DELETE /admin/classes/:id           Delete
```

### Schedules
```
GET    /admin/schedules/full        List with details
POST   /admin/schedules             Create
PUT    /admin/schedules/:id         Update
DELETE /admin/schedules/:id         Delete
```

### Faculties
```
GET    /admin/faculties             List all
POST   /admin/faculties             Create
PUT    /admin/faculties/:id         Update
DELETE /admin/faculties/:id         Delete
```

### Majors
```
GET    /admin/majors                List all
POST   /admin/majors                Create
```

### Semesters
```
GET    /admin/semesters             List all
POST   /admin/semesters             Create
PUT    /admin/semesters/:id         Update
DELETE /admin/semesters/:id         Delete
```

### Other
```
GET    /admin/enrollments           List enrollments
GET    /admin/tuition/full          List tuition records
PUT    /admin/tuition/:id/pay       Record payment
GET    /admin/logs                  View audit logs
GET    /admin/reports               Dashboard statistics
```

## 🎨 Features Checklist

### Functionality
- [x] Create new records with validation
- [x] Read/list all records in tables
- [x] Update existing records
- [x] Delete with confirmation dialogs
- [x] Real-time enrollment in classes
- [x] Search functionality (students)
- [x] Dropdown selection (majors, faculties, etc)
- [x] Form validation before submission
- [x] Error handling and notifications

### User Experience
- [x] Toast notifications for success/error
- [x] Loading spinners during API calls
- [x] Confirmation dialogs for deletions
- [x] Form auto-fill on edit
- [x] Dialog auto-close after successful operation
- [x] Table auto-refresh after changes
- [x] Responsive design (mobile, tablet, desktop)
- [x] Proper ARIA labels for accessibility

### Data Display
- [x] Status badges with color coding
- [x] Formatted currency (Vietnamese Dong)
- [x] Date/time formatting
- [x] Enrollment capacity indicators
- [x] Role-based badges
- [x] Faculty/major associations

## 🔒 Security

- [x] Role-based access (requires admin role)
- [x] Protected routes
- [x] Token authentication in headers
- [x] Confirmation for destructive operations
- [x] Input validation

## 📊 Dashboard Statistics

- Total Students (count)
- Total Courses (count)
- Total Revenue (sum of tuition)

Updated in real-time as records are created/deleted.

## 🐛 Troubleshooting

### "Failed to load [resource]"
- ✓ Check backend server is running
- ✓ Verify API endpoints are implemented
- ✓ Check browser console for errors
- ✓ Check network tab in DevTools

### Form won't submit
- ✓ Verify all required fields are filled
- ✓ Check email format if applicable
- ✓ Check number formats for prices/credits
- ✓ Look for validation error messages

### Dialog won't close
- ✓ Check browser console for API errors
- ✓ Verify API response has expected fields
- ✓ Try refreshing the page

### No data showing in tables
- ✓ Click "Refresh" button in tab header
- ✓ Check backend is returning data
- ✓ Check API endpoint is correct
- ✓ Verify authentication token

## 💡 Pro Tips

1. **Keyboard Navigation**: Use Tab key to move between form fields
2. **Bulk Actions**: Future enhancement for import/export
3. **Search**: Use search functionality in Students tab for quick lookup
4. **Refresh**: Use refresh button before important operations to ensure fresh data
5. **Confirmation**: Always confirm deletions carefully
6. **Status Changes**: Look for status dropdowns in edit forms
7. **Enrollment**: Real-time capacity shown in classes table
8. **Time Format**: Schedules use 24-hour format (e.g., 08:00, 14:30)

## 📱 Mobile Usage

The dashboard is fully responsive:
- **Desktop**: All tabs visible, full-width tables
- **Tablet**: Tab wrapping, horizontal scroll tables
- **Mobile**: Stacked layout, vertical scrolling

## 🚨 Important Notes

1. **Cascading Deletes**: Deleting a student also deletes their user account
2. **Auto-creation**: Creating a student/lecturer auto-creates a user account
3. **Password**: Password is only shown on creation, not on edit
4. **Semester Assignment**: Classes and schedules must be assigned to semesters
5. **Faculty Assignment**: Lecturers must be assigned to a faculty
6. **Major Assignment**: Students must be assigned to a major

## 📞 Support Resources

- **Full Documentation**: `ADMIN_DASHBOARD_README.md`
- **Setup Guide**: `ADMIN_SETUP.md`
- **Visual Guide**: `DASHBOARD_GUIDE.md`
- **Technical Details**: `IMPLEMENTATION_SUMMARY.md`

## ✨ What You Can Do Right Now

1. ✅ Manage complete student database
2. ✅ Manage lecturer records
3. ✅ Create and organize courses
4. ✅ Set up class sections with proper enrollment limits
5. ✅ Build class schedules and timetables
6. ✅ Organize academic structure (faculties & majors)
7. ✅ Track student enrollments
8. ✅ Monitor tuition payments
9. ✅ Audit system activities

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✓

For detailed information about any feature, refer to the full documentation files.
