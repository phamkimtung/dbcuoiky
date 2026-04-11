'use client';

import { useState } from 'react';
import {
  getLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
  getFaculties,
  type Lecturer,
  type Faculty,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface LecturersTabProps {
  onLoad?: () => void;
}

export function LecturersTab({ onLoad }: LecturersTabProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    faculty_id: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [lecturersData, facultiesData] = await Promise.all([
        getLecturers(),
        getFaculties(),
      ]);
      setLecturers(lecturersData.data);
      setFaculties(facultiesData.data);
      onLoad?.();
    } catch (error) {
      toast.error('Failed to load lecturers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.faculty_id) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await updateLecturer(editingId, {
          name: formData.name,
          email: formData.email,
          faculty_id: parseInt(formData.faculty_id),
        });
        toast.success('Lecturer updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new lecturers');
          return;
        }
        await createLecturer({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          faculty_id: parseInt(formData.faculty_id),
        });
        toast.success('Lecturer created successfully');
      }
      resetForm();
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save lecturer');
      console.error(error);
    }
  };

  const handleEdit = (lecturer: Lecturer) => {
    setEditingId(lecturer.id);
    setFormData({
      name: lecturer.name,
      email: lecturer.email,
      password: '',
      faculty_id: '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecturer?')) return;
    try {
      await deleteLecturer(id);
      toast.success('Lecturer deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete lecturer');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      faculty_id: '',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Lecturers</CardTitle>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">Refresh</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add Lecturer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Lecturer' : 'Add New Lecturer'}</DialogTitle>
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
                <Select value={formData.faculty_id} onValueChange={(value) => setFormData({ ...formData, faculty_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturers.map((lecturer) => (
                  <TableRow key={lecturer.id}>
                    <TableCell>{lecturer.name}</TableCell>
                    <TableCell>{lecturer.email}</TableCell>
                    <TableCell>{lecturer.faculty_name}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(lecturer)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(lecturer.id)}>
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
