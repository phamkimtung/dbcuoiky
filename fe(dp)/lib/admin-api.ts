const API_BASE_URL = 'http://localhost:3000';

// Helper function to get token
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'API Error');
  }

  return response.json();
}

// ==================== REPORTS ====================
export interface ReportData {
  total_students: string;
  total_courses: string;
  total_revenue: number;
}

export async function getReports(): Promise<ReportData> {
  return apiCall<ReportData>('/admin/reports');
}

// ==================== USERS ====================
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role: string;
}

export async function getUsers(): Promise<User[]> {
  return apiCall<User[]>('/admin/users');
}

export async function createUser(data: { name: string; email: string; password: string; role: string }): Promise<User> {
  return apiCall<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: { name: string; email: string; is_active: boolean }): Promise<User> {
  return apiCall<User>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return apiCall<void>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

// ==================== STUDENTS ====================
export interface Student {
  id: number;
  student_code: string;
  admission_year: number;
  name: string;
  email: string;
  major_name: string;
  faculty_name: string;
}

export interface StudentsResponse {
  data: Student[];
  total: number;
}

export async function getStudents(): Promise<StudentsResponse> {
  return apiCall<StudentsResponse>('/admin/students');
}

export async function searchStudents(name: string): Promise<Student[]> {
  return apiCall<Student[]>(`/admin/students/search?name=${encodeURIComponent(name)}`);
}

// ==================== LECTURERS ====================
export interface Lecturer {
  id: number;
  name: string;
  email: string;
  faculty_name: string;
}

export interface LecturersResponse {
  data: Lecturer[];
  total: number;
}

export async function getLecturers(): Promise<LecturersResponse> {
  return apiCall<LecturersResponse>('/admin/lecturers');
}

// ==================== FACULTIES ====================
export interface Faculty {
  id: number;
  code: string;
  name: string;
}

export async function getFaculties(): Promise<Faculty[]> {
  return apiCall<Faculty[]>('/admin/faculties');
}

export async function createFaculty(data: { code: string; name: string }): Promise<Faculty> {
  return apiCall<Faculty>('/admin/faculties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== MAJORS ====================
export interface Major {
  id: number;
  faculty_id: number;
  code: string;
  name: string;
}

export async function createMajor(data: { faculty_id: number; code: string; name: string }): Promise<Major> {
  return apiCall<Major>('/admin/majors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== COURSES ====================
export interface Course {
  id: number;
  course_code: string;
  name: string;
  credits: number;
  credit_price: number;
}

export interface CoursesResponse {
  data: Course[];
  total: number;
}

export async function getCourses(): Promise<CoursesResponse> {
  return apiCall<CoursesResponse>('/admin/courses');
}

export async function createCourse(data: { course_code: string; name: string; credits: number; credit_price: number }): Promise<Course> {
  return apiCall<Course>('/admin/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== CLASSES ====================
export interface Class {
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

export interface ClassesResponse {
  data: Class[];
  total: number;
}

export async function getClasses(semesterId?: number, status?: string): Promise<ClassesResponse> {
  const params = new URLSearchParams();
  if (semesterId) params.append('semester_id', semesterId.toString());
  if (status) params.append('status', status);
  const queryString = params.toString();
  const url = queryString ? `/admin/classes/full?${queryString}` : '/admin/classes/full';
  return apiCall<ClassesResponse>(url);
}

export async function createClass(data: { course_id: number; lecturer_id: number; semester_id: number; max_students: number }): Promise<Class> {
  return apiCall<Class>('/admin/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== SCHEDULES ====================
export interface Schedule {
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

export interface SchedulesResponse {
  data: Schedule[];
  total: number;
}

export async function getSchedules(semesterId?: number): Promise<SchedulesResponse> {
  const url = semesterId ? `/admin/schedules/full?semester_id=${semesterId}` : '/admin/schedules/full';
  return apiCall<SchedulesResponse>(url);
}

export async function createSchedule(data: { class_id: number; day_of_week: string; start_time: string; end_time: string; room: string }): Promise<Schedule> {
  return apiCall<Schedule>('/admin/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== SEMESTERS ====================
export interface Semester {
  id: number;
  code: string;
  year: number;
  start_date: string;
  end_date: string;
  reg_start_time: string;
  reg_end_time: string;
}

export async function createSemester(data: { code: string; year: number; start_date: string; end_date: string; reg_start_time: string; reg_end_time: string }): Promise<Semester> {
  return apiCall<Semester>('/admin/semesters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== ENROLLMENTS ====================
export interface Enrollment {
  id: number;
  student_name: string;
  course_name: string;
  status: string;
}

export interface EnrollmentsResponse {
  data: Enrollment[];
  total: number;
}

export async function getEnrollments(): Promise<EnrollmentsResponse> {
  return apiCall<EnrollmentsResponse>('/admin/enrollments');
}

// ==================== TUITION ====================
export interface Tuition {
  id: number;
  student_name: string;
  semester: string;
  total_amount: number;
  paid_amount: number;
  status: string;
}

export interface TuitionResponse {
  data: Tuition[];
  total: number;
}

export async function getTuition(): Promise<TuitionResponse> {
  return apiCall<TuitionResponse>('/admin/tuition/full');
}

export async function payTuition(id: number, paid_amount: number): Promise<Tuition> {
  return apiCall<Tuition>(`/admin/tuition/${id}/pay`, {
    method: 'PUT',
    body: JSON.stringify({ paid_amount }),
  });
}

// ==================== AUDIT LOGS ====================
export interface AuditLog {
  id: number;
  user_id: number;
  name: string;
  action: string;
  table_name: string;
  record_id: number;
  created_at: string;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return apiCall<AuditLog[]>('/admin/logs');
}
