'use client';

import { useState } from 'react';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getClasses,
  type Schedule,
  type Class,
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

interface SchedulesTabProps {
  onLoad?: () => void;
}

const DAYS_OF_WEEK = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '7', label: 'Sunday' },
];

export function SchedulesTab({ onLoad }: SchedulesTabProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    class_id: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    room: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesData, classesData] = await Promise.all([
        getSchedules(),
        getClasses(),
      ]);
      setSchedules(schedulesData.data);
      setClasses(classesData.data);
      onLoad?.();
    } catch (error) {
      toast.error('Failed to load schedules');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.class_id || !formData.day_of_week || !formData.start_time || !formData.end_time || !formData.room) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const data = {
        class_id: parseInt(formData.class_id),
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room,
      };

      if (editingId) {
        await updateSchedule(editingId, data);
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule(data);
        toast.success('Schedule created successfully');
      }
      resetForm();
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save schedule');
      console.error(error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      class_id: schedule.class_id.toString(),
      day_of_week: schedule.day_of_week.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete schedule');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      class_id: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      room: '',
    });
  };

  const getDayLabel = (dayNum: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayNum.toString())?.label || `Day ${dayNum}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Schedules</CardTitle>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">Refresh</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add Schedule</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.course_name} ({cls.semester_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.day_of_week} onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
                <Input
                  placeholder="Room (e.g., A101)"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
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
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{schedule.course_name}</div>
                        <div className="text-xs text-gray-500">{schedule.course_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{schedule.lecturer_name}</TableCell>
                    <TableCell>{getDayLabel(schedule.day_of_week)}</TableCell>
                    <TableCell className="font-mono">
                      {schedule.start_time} - {schedule.end_time}
                    </TableCell>
                    <TableCell className="font-mono">{schedule.room}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.id)}>
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
