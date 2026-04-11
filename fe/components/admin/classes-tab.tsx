'use client';

import { useState, useEffect } from 'react';
import {
  getClasses,
  getClassDetail,
  createClass,
  updateClass,
  deleteClass,
  getCourses,
  getLecturers,
  getSemesters,
  type Class,
  type Course,
  type Lecturer,
  type Semester,
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
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface ClassesTabProps {
  onLoad?: () => void;
}

export function ClassesTab({ onLoad }: ClassesTabProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    course_id: '',
    lecturer_id: '',
    semester_id: '',
    max_students: 0,
    status: 'active',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesData, coursesData, lecturersData, semestersData] = await Promise.all([
        getClasses(),
        getCourses(),
        getLecturers(),
        getSemesters(),
      ]);
      setClasses(classesData.data);
      setCourses(coursesData.data);
      setLecturers(lecturersData.data);
      setSemesters(semestersData);
      onLoad?.();
    } catch (error) {
      toast.error('Failed to load classes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formData.course_id || !formData.lecturer_id || !formData.semester_id || formData.max_students <= 0) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    try {
      const data = {
        course_id: parseInt(formData.course_id),
        lecturer_id: parseInt(formData.lecturer_id),
        semester_id: parseInt(formData.semester_id),
        max_students: formData.max_students,
        ...(editingId && { status: formData.status }),
      };

      if (editingId) {
        await updateClass(editingId, data);
        toast.success('Class updated successfully');
      } else {
        await createClass(data);
        toast.success('Class created successfully');
      }
      resetForm();
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save class');
      console.error(error);
    }
  };

  const handleEdit = async (cls: Class) => {
    try {
      const classDetail = await getClassDetail(cls.id);
      setEditingId(classDetail.id);
      setFormData({
        course_id: classDetail.course_id.toString(),
        lecturer_id: classDetail.lecturer_id.toString(),
        semester_id: classDetail.semester_id.toString(),
        max_students: classDetail.max_students,
        status: classDetail.status,
      });
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load class details');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await deleteClass(id);
      toast.success('Class deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete class');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      course_id: '',
      lecturer_id: '',
      semester_id: '',
      max_students: 0,
      status: 'active',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Classes</CardTitle>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">Refresh</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add Class</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Class' : 'Add New Class'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.course_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.lecturer_id} onValueChange={(value) => setFormData({ ...formData, lecturer_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.id} value={lecturer.id.toString()}>
                        {lecturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.semester_id} onValueChange={(value) => setFormData({ ...formData, semester_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {semester.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Max Students"
                  min="1"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 0 })}
                />
                {editingId && (
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <TableHead>Course</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{cls.course_name}</div>
                        <div className="text-xs text-gray-500">{cls.course_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{cls.lecturer_name}</TableCell>
                    <TableCell>{cls.semester}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {cls.max_students} max
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.status === 'active' ? 'default' : 'outline'}>
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(cls)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cls.id)}>
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
