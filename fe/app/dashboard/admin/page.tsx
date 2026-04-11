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
  getEnrollments,
  getTuition,
  payTuition,
  getAuditLogs,
  type ReportData,
  type User as AdminUser,
  type Enrollment,
  type Tuition,
  type AuditLog,
} from '@/lib/admin-api';
import { StudentsTab } from '@/components/admin/students-tab';
import { LecturersTab } from '@/components/admin/lecturers-tab';
import { CoursesTab } from '@/components/admin/courses-tab';
import { ClassesTab } from '@/components/admin/classes-tab';
import { SchedulesTab } from '@/components/admin/schedules-tab';
import { FacultiesMajorsTab } from '@/components/admin/faculties-majors-tab';
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
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // State for reports
  const [reports, setReports] = useState<ReportData | null>(null);

  // State for users, enrollments, tuitions, and audit logs
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });

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
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 mb-4">
              <TabsTrigger value="users" onClick={loadUsers}>Users</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
              <TabsTrigger value="faculties-majors">Facilities</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="enrollments" onClick={loadEnrollments}>Enrollments</TabsTrigger>
              <TabsTrigger value="tuition" onClick={loadTuitions}>Tuition</TabsTrigger>
              <TabsTrigger value="logs" onClick={loadAuditLogs}>Logs</TabsTrigger>
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
              <StudentsTab onLoad={loadReports} />
            </TabsContent>

            {/* Lecturers Tab */}
            <TabsContent value="lecturers">
              <LecturersTab onLoad={loadReports} />
            </TabsContent>

            {/* Faculties & Majors Tab */}
            <TabsContent value="faculties-majors">
              <FacultiesMajorsTab onLoad={loadReports} />
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <CoursesTab onLoad={loadReports} />
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes">
              <ClassesTab onLoad={loadReports} />
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules">
              <SchedulesTab onLoad={loadReports} />
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
