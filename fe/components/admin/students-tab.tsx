'use client';

import { useState, useEffect } from 'react';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface StudentsTabProps {
  onLoad?: () => void;
}

export function StudentsTab({ onLoad }: StudentsTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_code: '',
    major_id: '',
    admission_year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentsData = await getStudents();
      // API returns { data: Student[], total: number }
      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.data || []);
      onLoad?.();
    } catch (error) {
      toast.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.student_code || !formData.major_id) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await updateStudent(editingId, {
          name: formData.name,
          email: formData.email,
          student_code: formData.student_code,
          major_id: parseInt(formData.major_id),
          admission_year: formData.admission_year,
        });
        toast.success('Student updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new students');
          return;
        }
        await createStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          student_code: formData.student_code,
          major_id: parseInt(formData.major_id),
          admission_year: formData.admission_year,
        });
        toast.success('Student created successfully');
      }
      resetForm();
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save student');
      console.error(error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      password: '',
      student_code: student.student_code,
      major_id: '',
      admission_year: student.admission_year,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete student');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      student_code: '',
      major_id: '',
      admission_year: new Date().getFullYear(),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Students</CardTitle>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">Refresh</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {!editingId && (
                  <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                )}
                <Input
                  placeholder="Student Code"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                />
                {!editingId && (
                  <>
                    <Input
                      type="number"
                      placeholder="Major ID"
                      value={formData.major_id}
                      onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Admission Year"
                      value={formData.admission_year}
                      onChange={(e) => setFormData({ ...formData, admission_year: parseInt(e.target.value) })}
                    />
                  </>
                )}
                <Button onClick={handleSave} className="w-full">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Major</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.student_code}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.major_name}</TableCell>
                    <TableCell>{student.admission_year}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(student.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
