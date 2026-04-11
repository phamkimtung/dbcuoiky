'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  getReports,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getLecturers,
  getFaculties,
  createFaculty,
  getCourses,
  createCourse,
  getClasses,
  getSchedules,
  getEnrollments,
  getTuition,
  payTuition,
  getAuditLogs,
  type ReportData,
  type User as AdminUser,
  type Student,
  type Lecturer,
  type Faculty,
  type Course,
  type Class,
  type Schedule,
  type Enrollment,
  type Tuition,
  type AuditLog,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // State for reports
  const [reports, setReports] = useState<ReportData | null>(null);

  // State for each management section
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [newFaculty, setNewFaculty] = useState({ code: '', name: '' });
  const [newCourse, setNewCourse] = useState({ course_code: '', name: '', credits: 0, credit_price: 0 });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data.data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLecturers = async () => {
    setLoading(true);
    try {
      const data = await getLecturers();
      setLecturers(data.data);
    } catch (error) {
      console.error('Failed to load lecturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    setLoading(true);
    try {
      const data = await getFaculties();
      setFaculties(data);
    } catch (error) {
      console.error('Failed to load faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data.data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data.data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getEnrollments();
      setEnrollments(data.data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTuitions = async () => {
    setLoading(true);
    try {
      const data = await getTuition();
      setTuitions(data.data);
    } catch (error) {
      console.error('Failed to load tuitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      setIsUserDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Ban co chac muon xoa nguoi dung nay?')) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userItem: AdminUser) => {
    try {
      await updateUser(userItem.id, {
        name: userItem.name,
        email: userItem.email,
        is_active: !userItem.is_active,
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCreateFaculty = async () => {
    try {
      await createFaculty(newFaculty);
      setIsFacultyDialogOpen(false);
      setNewFaculty({ code: '', name: '' });
      loadFaculties();
    } catch (error) {
      console.error('Failed to create faculty:', error);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await createCourse(newCourse);
      setIsCourseDialogOpen(false);
      setNewCourse({ course_code: '', name: '', credits: 0, credit_price: 0 });
      loadCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handlePayTuition = async (id: number, amount: number) => {
    const newAmount = prompt('Nhap so tien thanh toan:', amount.toString());
    if (newAmount) {
      try {
        await payTuition(id, parseFloat(newAmount));
        loadTuitions();
      } catch (error) {
        console.error('Failed to pay tuition:', error);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Quan Tri Vien</h1>
              <p className="text-slate-600 text-sm">Xin chao, {user?.name}</p>
            </div>
            <Button onClick={handleLogout} variant="destructive">
              Dang Xuat
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tong Sinh Vien</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{reports?.total_students || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tong Mon Hoc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{reports?.total_courses || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tong Doanh Thu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reports?.total_revenue || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-4">
              <TabsTrigger value="users" onClick={loadUsers}>Nguoi Dung</TabsTrigger>
              <TabsTrigger value="students" onClick={loadStudents}>Sinh Vien</TabsTrigger>
              <TabsTrigger value="lecturers" onClick={loadLecturers}>Giang Vien</TabsTrigger>
              <TabsTrigger value="faculties" onClick={loadFaculties}>Khoa</TabsTrigger>
              <TabsTrigger value="courses" onClick={loadCourses}>Mon Hoc</TabsTrigger>
              <TabsTrigger value="classes" onClick={loadClasses}>Lop Hoc</TabsTrigger>
              <TabsTrigger value="schedules" onClick={loadSchedules}>Lich Hoc</TabsTrigger>
              <TabsTrigger value="enrollments" onClick={loadEnrollments}>Dang Ky</TabsTrigger>
              <TabsTrigger value="tuition" onClick={loadTuitions}>Hoc Phi</TabsTrigger>
              <TabsTrigger value="logs" onClick={loadAuditLogs}>Nhat Ky</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Quan Ly Nguoi Dung</CardTitle>
                  <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Them Nguoi Dung</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Them Nguoi Dung Moi</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Ho va Ten"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <Input
                          placeholder="Mat Khau"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chon vai tro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Sinh Vien</SelectItem>
                            <SelectItem value="lecturer">Giang Vien</SelectItem>
                            <SelectItem value="admin">Quan Tri Vien</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleCreateUser} className="w-full">Tao Nguoi Dung</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ten</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vai Tro</TableHead>
                          <TableHead>Trang Thai</TableHead>
                          <TableHead>Hanh Dong</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.id}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'lecturer' ? 'default' : 'secondary'}>
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.is_active ? 'default' : 'outline'}>
                                {u.is_active ? 'Hoat Dong' : 'Vo Hieu'}
                              </Badge>
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleToggleUserStatus(u)}>
                                {u.is_active ? 'Vo Hieu' : 'Kich Hoat'}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                                Xoa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sach Sinh Vien</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ma SV</TableHead>
                          <TableHead>Ho Ten</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Nganh</TableHead>
                          <TableHead>Khoa</TableHead>
                          <TableHead>Nam Nhap Hoc</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.student_code}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.email}</TableCell>
                            <TableCell>{s.major_name}</TableCell>
                            <TableCell>{s.faculty_name}</TableCell>
                            <TableCell>{s.admission_year}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lecturers Tab */}
            <TabsContent value="lecturers">
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sach Giang Vien</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ho Ten</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Khoa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lecturers.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.id}</TableCell>
                            <TableCell>{l.name}</TableCell>
                            <TableCell>{l.email}</TableCell>
                            <TableCell>{l.faculty_name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Faculties Tab */}
            <TabsContent value="faculties">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Quan Ly Khoa</CardTitle>
                  <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Them Khoa</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Them Khoa Moi</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Ma Khoa"
                          value={newFaculty.code}
                          onChange={(e) => setNewFaculty({ ...newFaculty, code: e.target.value })}
                        />
                        <Input
                          placeholder="Ten Khoa"
                          value={newFaculty.name}
                          onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                        />
                        <Button onClick={handleCreateFaculty} className="w-full">Tao Khoa</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ma Khoa</TableHead>
                          <TableHead>Ten Khoa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {faculties.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell>{f.id}</TableCell>
                            <TableCell>{f.code}</TableCell>
                            <TableCell>{f.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Quan Ly Mon Hoc</CardTitle>
                  <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Them Mon Hoc</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Them Mon Hoc Moi</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Ma Mon Hoc"
                          value={newCourse.course_code}
                          onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                        />
                        <Input
                          placeholder="Ten Mon Hoc"
                          value={newCourse.name}
                          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        />
                        <Input
                          placeholder="So Tin Chi"
                          type="number"
                          value={newCourse.credits}
                          onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          placeholder="Gia Tin Chi"
                          type="number"
                          value={newCourse.credit_price}
                          onChange={(e) => setNewCourse({ ...newCourse, credit_price: parseInt(e.target.value) || 0 })}
                        />
                        <Button onClick={handleCreateCourse} className="w-full">Tao Mon Hoc</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ma Mon</TableHead>
                          <TableHead>Ten Mon</TableHead>
                          <TableHead>Tin Chi</TableHead>
                          <TableHead>Gia Tin Chi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.id}</TableCell>
                            <TableCell>{c.course_code}</TableCell>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.credits}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.credit_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes">
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sach Lop Hoc</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ma Mon</TableHead>
                          <TableHead>Ten Mon Hoc</TableHead>
                          <TableHead>Tin Chi</TableHead>
                          <TableHead>Giang Vien</TableHead>
                          <TableHead>Hoc Ky</TableHead>
                          <TableHead>Dang Ky</TableHead>
                          <TableHead>Con Trong</TableHead>
                          <TableHead>Trang Thai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.id}</TableCell>
                            <TableCell className="font-medium">{c.course_code}</TableCell>
                            <TableCell>{c.course_name}</TableCell>
                            <TableCell>{c.credits}</TableCell>
                            <TableCell>{c.lecturer_name}</TableCell>
                            <TableCell>{c.semester_code}</TableCell>
                            <TableCell>{c.current_students}/{c.max_students}</TableCell>
                            <TableCell>
                              <Badge variant={c.available_slots > 0 ? 'outline' : 'destructive'}>
                                {c.available_slots}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                                {c.status === 'active' ? 'Dang mo' : c.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules">
              <Card>
                <CardHeader>
                  <CardTitle>Lich Hoc</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ma Mon</TableHead>
                          <TableHead>Ten Mon Hoc</TableHead>
                          <TableHead>Giang Vien</TableHead>
                          <TableHead>Thu</TableHead>
                          <TableHead>Gio Bat Dau</TableHead>
                          <TableHead>Gio Ket Thuc</TableHead>
                          <TableHead>Phong</TableHead>
                          <TableHead>Hoc Ky</TableHead>
                          <TableHead>Trang Thai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules.map((s) => {
                          const dayNames = ['', 'Thu 2', 'Thu 3', 'Thu 4', 'Thu 5', 'Thu 6', 'Thu 7', 'CN'];
                          return (
                            <TableRow key={s.id}>
                              <TableCell>{s.id}</TableCell>
                              <TableCell className="font-medium">{s.course_code}</TableCell>
                              <TableCell>{s.course_name}</TableCell>
                              <TableCell>{s.lecturer_name}</TableCell>
                              <TableCell>{dayNames[s.day_of_week] || s.day_of_week}</TableCell>
                              <TableCell>{s.start_time}</TableCell>
                              <TableCell>{s.end_time}</TableCell>
                              <TableCell>{s.room}</TableCell>
                              <TableCell>{s.semester_code}</TableCell>
                              <TableCell>
                                <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                                  {s.status === 'active' ? 'Dang mo' : s.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments">
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sach Dang Ky</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Sinh Vien</TableHead>
                          <TableHead>Mon Hoc</TableHead>
                          <TableHead>Trang Thai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell>{e.id}</TableCell>
                            <TableCell>{e.student_name}</TableCell>
                            <TableCell>{e.course_name}</TableCell>
                            <TableCell>
                              <Badge variant={e.status === 'enrolled' ? 'default' : 'secondary'}>
                                {e.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tuition Tab */}
            <TabsContent value="tuition">
              <Card>
                <CardHeader>
                  <CardTitle>Quan Ly Hoc Phi</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Sinh Vien</TableHead>
                          <TableHead>Hoc Ky</TableHead>
                          <TableHead>Tong Tien</TableHead>
                          <TableHead>Da Dong</TableHead>
                          <TableHead>Trang Thai</TableHead>
                          <TableHead>Hanh Dong</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tuitions.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell>{t.student_name}</TableCell>
                            <TableCell>{t.semester}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.total_amount)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.paid_amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.status === 'paid' ? 'default' : t.status === 'partial' ? 'secondary' : 'destructive'}>
                                {t.status === 'paid' ? 'Da Dong' : t.status === 'partial' ? 'Dong 1 Phan' : 'Chua Dong'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handlePayTuition(t.id, t.paid_amount)}>
                                Cap Nhat
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Nhat Ky Hoat Dong</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nguoi Dung</TableHead>
                          <TableHead>Hanh Dong</TableHead>
                          <TableHead>Bang</TableHead>
                          <TableHead>Record ID</TableHead>
                          <TableHead>Thoi Gian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.name}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.table_name}</TableCell>
                            <TableCell>{log.record_id}</TableCell>
                            <TableCell>{new Date(log.created_at).toLocaleString('vi-VN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </ProtectedRoute>
  );
}
