'use client';

import { useState } from 'react';
import {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getMajors,
  createMajor,
  updateMajor,
  deleteMajor,
  type Faculty,
  type Major,
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
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface FacultiesMajorsTabProps {
  onLoad?: () => void;
}

export function FacultiesMajorsTab({ onLoad }: FacultiesMajorsTabProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Faculty dialog state
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<number | null>(null);
  const [facultyFormData, setFacultyFormData] = useState({ code: '', name: '' });

  // Major dialog state
  const [isMajorDialogOpen, setIsMajorDialogOpen] = useState(false);
  const [editingMajorId, setEditingMajorId] = useState<number | null>(null);
  const [majorFormData, setMajorFormData] = useState({ faculty_id: '', code: '', name: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [facultiesData, majorsData] = await Promise.all([
        getFaculties(),
        getMajors(),
      ]);
      setFaculties(facultiesData.data);
      setMajors(majorsData.data);
      onLoad?.();
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Faculty handlers
  const handleSaveFaculty = async () => {
    if (!facultyFormData.code || !facultyFormData.name) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingFacultyId) {
        await updateFaculty(editingFacultyId, facultyFormData);
        toast.success('Faculty updated successfully');
      } else {
        await createFaculty(facultyFormData);
        toast.success('Faculty created successfully');
      }
      resetFacultyForm();
      setIsFacultyDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save faculty');
      console.error(error);
    }
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFacultyId(faculty.id);
    setFacultyFormData({ code: faculty.code, name: faculty.name });
    setIsFacultyDialogOpen(true);
  };

  const handleDeleteFaculty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;
    try {
      await deleteFaculty(id);
      toast.success('Faculty deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete faculty');
      console.error(error);
    }
  };

  const resetFacultyForm = () => {
    setEditingFacultyId(null);
    setFacultyFormData({ code: '', name: '' });
  };

  // Major handlers
  const handleSaveMajor = async () => {
    if (!majorFormData.faculty_id || !majorFormData.code || !majorFormData.name) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingMajorId) {
        await updateMajor(editingMajorId, {
          faculty_id: parseInt(majorFormData.faculty_id),
          code: majorFormData.code,
          name: majorFormData.name,
        });
        toast.success('Major updated successfully');
      } else {
        await createMajor({
          faculty_id: parseInt(majorFormData.faculty_id),
          code: majorFormData.code,
          name: majorFormData.name,
        });
        toast.success('Major created successfully');
      }
      resetMajorForm();
      setIsMajorDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save major');
      console.error(error);
    }
  };

  const handleEditMajor = (major: Major) => {
    setEditingMajorId(major.id);
    setMajorFormData({
      faculty_id: major.faculty_id.toString(),
      code: major.code,
      name: major.name,
    });
    setIsMajorDialogOpen(true);
  };

  const handleDeleteMajor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this major?')) return;
    try {
      await deleteMajor(id);
      toast.success('Major deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete major');
      console.error(error);
    }
  };

  const resetMajorForm = () => {
    setEditingMajorId(null);
    setMajorFormData({ faculty_id: '', code: '', name: '' });
  };

  const getFacultyName = (facultyId: number) => {
    return faculties.find(f => f.id === facultyId)?.name || 'Unknown';
  };

  return (
    <Tabs defaultValue="faculties" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="faculties" onClick={loadData}>Faculties</TabsTrigger>
        <TabsTrigger value="majors" onClick={loadData}>Majors</TabsTrigger>
      </TabsList>

      {/* Faculties Tab */}
      <TabsContent value="faculties">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Faculties</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline">Refresh</Button>
              <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetFacultyForm}>Add Faculty</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingFacultyId ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Faculty Code"
                      value={facultyFormData.code}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, code: e.target.value })}
                    />
                    <Input
                      placeholder="Faculty Name"
                      value={facultyFormData.name}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                    />
                    <Button onClick={handleSaveFaculty} className="w-full">
                      {editingFacultyId ? 'Update' : 'Create'}
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
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculties.map((faculty) => (
                      <TableRow key={faculty.id}>
                        <TableCell className="font-mono">{faculty.code}</TableCell>
                        <TableCell>{faculty.name}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditFaculty(faculty)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteFaculty(faculty.id)}>
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
      </TabsContent>

      {/* Majors Tab */}
      <TabsContent value="majors">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Majors</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline">Refresh</Button>
              <Dialog open={isMajorDialogOpen} onOpenChange={setIsMajorDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetMajorForm}>Add Major</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingMajorId ? 'Edit Major' : 'Add New Major'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Select value={majorFormData.faculty_id} onValueChange={(value) => setMajorFormData({ ...majorFormData, faculty_id: value })}>
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
                    <Input
                      placeholder="Major Code"
                      value={majorFormData.code}
                      onChange={(e) => setMajorFormData({ ...majorFormData, code: e.target.value })}
                    />
                    <Input
                      placeholder="Major Name"
                      value={majorFormData.name}
                      onChange={(e) => setMajorFormData({ ...majorFormData, name: e.target.value })}
                    />
                    <Button onClick={handleSaveMajor} className="w-full">
                      {editingMajorId ? 'Update' : 'Create'}
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
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {majors.map((major) => (
                      <TableRow key={major.id}>
                        <TableCell className="font-mono">{major.code}</TableCell>
                        <TableCell>{major.name}</TableCell>
                        <TableCell>{major.faculty_name || getFacultyName(major.faculty_id)}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditMajor(major)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMajor(major.id)}>
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
      </TabsContent>
    </Tabs>
  );
}
