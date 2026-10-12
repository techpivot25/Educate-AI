import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  KeyRound,
  Eye,
  X,
  Plus,
  Check,
  AlertTriangle,
  Lock,
  Mail,
  User,
  SlidersHorizontal,
  BookOpen,
  Video,
  Award,
  ArrowRight,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const {
    usersList,
    addUser,
    updateUser,
    deleteUser,
    setCurrentRole,
    activeGrades,
    toggleGradeFilter,
    activeCategories,
    toggleCategoryFilter,
    setAdminNav,
    curriculumList,
    setIsCurriculumModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // New User Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formPassword, setFormPassword] = useState('tempPass123!');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Dynamic Fields: Student
  const [studentGrade, setStudentGrade] = useState('8th Grade');
  const [studentCourses, setStudentCourses] = useState('Physics, Biology, Mathematics');

  // Dynamic Fields: Teacher
  const [teacherDepartment, setTeacherDepartment] = useState('Science & Mathematics');
  const [teacherSubjects, setTeacherSubjects] = useState('Physics, STEM');
  const [teacherCohorts, setTeacherCohorts] = useState('Class 8A, Class 8C');

  // Dynamic Fields: Admin
  const [adminPermission, setAdminPermission] = useState<'Super Admin' | 'Proctor Manager' | 'Content Admin'>('Super Admin');

  // Filtered Users
  const filteredUsers = usersList.filter((user) => {
    // Tab filter
    if (activeTab !== 'all' && user.role !== activeTab) return false;
    // Status filter
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchRole = user.role.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  // Counts for Tabs
  const counts = {
    all: usersList.length,
    student: usersList.filter((u) => u.role === 'student').length,
    teacher: usersList.filter((u) => u.role === 'teacher').length,
    admin: usersList.filter((u) => u.role === 'admin').length,
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const newUserPayload: Omit<AppUser, 'id' | 'createdAt'> = {
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
      ...(formRole === 'student' && {
        grade: studentGrade,
        enrolledCourses: studentCourses.split(',').map((s) => s.trim()),
        overallProgress: 70,
        physicsProgress: 65,
        biologyProgress: 75,
        mathProgress: 80,
        attendance: 95,
        gpa: 3.5,
        enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }),
      ...(formRole === 'teacher' && {
        department: teacherDepartment,
        assignedSubjects: teacherSubjects.split(',').map((s) => s.trim()),
        assignedCohorts: teacherCohorts.split(',').map((s) => s.trim()),
        createdLessonPlansCount: 0,
        activeStudentsCount: 30,
      }),
      ...(formRole === 'admin' && {
        permissionLevel: adminPermission,
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            action: `Admin account provisioned with ${adminPermission} rights.`,
          },
        ],
      }),
    };

    addUser(newUserPayload);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      name: formName,
      email: formEmail,
      status: formStatus,
      ...(editingUser.role === 'student' && {
        grade: studentGrade,
      }),
      ...(editingUser.role === 'teacher' && {
        department: teacherDepartment,
      }),
      ...(editingUser.role === 'admin' && {
        permissionLevel: adminPermission,
      }),
    });
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('student');
    setFormPassword('tempPass123!');
    setFormStatus('Active');
    setStudentGrade('8th Grade');
    setStudentCourses('Physics, Biology, Mathematics');
    setTeacherDepartment('Science & Mathematics');
    setTeacherSubjects('Physics, STEM');
    setTeacherCohorts('Class 8A, Class 8C');
    setAdminPermission('Super Admin');
  };

  const openEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    if (user.grade) setStudentGrade(user.grade);
    if (user.department) setTeacherDepartment(user.department);
    if (user.permissionLevel) setAdminPermission(user.permissionLevel);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Add User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131d33] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-100/70 dark:bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-200/50 dark:border-cyan-800/50">
              Administrative Control
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              &bull; Comprehensive User Directory
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            User Management Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, edit, inspect, and manage accounts for all students, educators, and system administrators.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="bg-white dark:bg-[#131d33] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        {/* Clickable Tabs: [All Users], [Students], [Teachers], [Admins] */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Users</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 dark:bg-black/20">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Students</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 dark:bg-black/20">
              {counts.student}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Teachers</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 dark:bg-black/20">
              {counts.teacher}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admins</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 dark:bg-black/20">
              {counts.admin}
            </span>
          </button>
        </div>

        {/* CENTRAL CURRICULUM AND GRADE RANGE CONTROL (matching user request & uploaded image) */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 space-y-3.5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Curriculum and Grade Range Control
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Global Curriculum and Subject Context Filter — applies context authority across all modules and users.
              </p>
            </div>
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All {curriculumList.length} Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Grades Multi-Select */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Active Grades: [{activeGrades.join(', ')}]
              </span>
              <span className="text-[10px] text-slate-400">Click to toggle grades (6-12)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[6, 7, 8, 9, 10, 11, 12].map((g) => {
                const isActive = activeGrades.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGradeFilter(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Grade {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Subject Categories Multi-Select */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Active Subjects: [{activeCategories.join(', ')}]
              </span>
              <span className="text-[10px] text-slate-400">Click to toggle subject domains</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'].map((cat) => {
                const isActive = activeCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, institutional email, or role..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>
          </div>
        </div>

        {/* User Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Scope / Specialization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No users match your criteria. Try adjusting the search or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isStudent = user.role === 'student';
                  const isTeacher = user.role === 'teacher';
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs overflow-hidden ${
                              isStudent
                                ? 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                                : isTeacher
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                                : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                            }`}
                          >
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-4">
                        {isStudent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <GraduationCap className="w-3 h-3" />
                            Student
                          </span>
                        )}
                        {isTeacher && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Briefcase className="w-3 h-3" />
                            Teacher
                          </span>
                        )}
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </td>

                      {/* Scope / Specialization */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {isStudent && (
                          <div>
                            <span className="font-semibold">{user.grade || '8th Grade'}</span>
                            <span className="text-[10px] text-slate-400 block">
                              GPA: {user.gpa || '3.5'} &bull; Prog: {user.overallProgress || 80}%
                            </span>
                          </div>
                        )}
                        {isTeacher && (
                          <div>
                            <span className="font-semibold">{user.department || 'Science'}</span>
                            <span className="text-[10px] text-slate-400 block">
                              Cohorts: {user.assignedCohorts?.join(', ') || 'Class 7B'}
                            </span>
                          </div>
                        )}
                        {isAdmin && (
                          <div>
                            <span className="font-semibold">{user.permissionLevel || 'Super Admin'}</span>
                            <span className="text-[10px] text-slate-400 block">
                              Global Oversight & Proctor
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {user.createdAt || '2025-09-01'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Connected modules: Live Monitoring & Certificates (matching Ref Image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                Live Monitoring
              </span>
              <p className="text-xs text-slate-300">
                Connects into real-time WebRTC neural proctoring grid and anomaly audit.
              </p>
            </div>
            <button
              onClick={() => setAdminNav('dashboard')}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ml-3"
            >
              Open Video Feeds &rarr;
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Certificates
              </span>
              <p className="text-xs text-slate-300">
                Cryptographic digital credential verification & instant issuance ledger.
              </p>
            </div>
            <button
              onClick={() => setAdminNav('certificates')}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ml-3"
            >
              Manage Certificates &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* CREATE NEW USER MODAL (With dynamic fields based on selected role) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 transition-colors">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Provision New User Account</h3>
                  <p className="text-xs text-white/80">Configure identity, role permissions, and initial cohort.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Standard Fields: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. maya.l@educateai.org"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* ROLE SELECTION DROPDOWN (Mandatory requirement) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Role Dropdown *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="student">🎓 Student (Personal AI Tutor & Doubt Solver)</option>
                  <option value="teacher">💼 Teacher (Curriculum & Dynamic Quiz Studio)</option>
                  <option value="admin">🛡️ Administrator (Proctoring & Global Management)</option>
                </select>
              </div>

              {/* Temporary Password & Account Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC ROLE FIELDS */}

              {/* 1. If Student: Grade & Course enrollments */}
              {formRole === 'student' && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 block uppercase tracking-wider text-[10px]">
                    Student Specific Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Class / Grade Level
                      </label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      >
                        <option value="7th Grade">7th Grade</option>
                        <option value="8th Grade">8th Grade</option>
                        <option value="9th Grade">9th Grade</option>
                        <option value="10th Grade">10th Grade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Default Enrolled Courses
                      </label>
                      <input
                        type="text"
                        value={studentCourses}
                        onChange={(e) => setStudentCourses(e.target.value)}
                        placeholder="Comma separated"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. If Teacher: Subject, Department, Cohorts */}
              {formRole === 'teacher' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block uppercase tracking-wider text-[10px]">
                    Educator Faculty Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={teacherDepartment}
                        onChange={(e) => setTeacherDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Subject(s)
                      </label>
                      <input
                        type="text"
                        value={teacherSubjects}
                        onChange={(e) => setTeacherSubjects(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Cohorts
                      </label>
                      <input
                        type="text"
                        value={teacherCohorts}
                        onChange={(e) => setTeacherCohorts(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. If Admin: Permission level */}
              {formRole === 'admin' && (
                <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60 space-y-3">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 block uppercase tracking-wider text-[10px]">
                    Administrative Security Level
                  </span>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      System Permissions Level
                    </label>
                    <select
                      value={adminPermission}
                      onChange={(e) => setAdminPermission(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="Super Admin">Super Admin (All modules + User CRUD + Proctoring)</option>
                      <option value="Proctor Manager">Proctor Manager (Video Monitoring & Cheating Anomaly Control)</option>
                      <option value="Content Admin">Content Admin (Lesson Plans & Certificate Auditing)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-600" />
                <span>Edit User: {editingUser.name}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {editingUser.role === 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                  <input
                    type="text"
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              {editingUser.role === 'teacher' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={teacherDepartment}
                    onChange={(e) => setTeacherDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              {editingUser.role === 'admin' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Permission Level</label>
                  <select
                    value={adminPermission}
                    onChange={(e) => setAdminPermission(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Proctor Manager">Proctor Manager</option>
                    <option value="Content Admin">Content Admin</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently remove <strong>{userToDelete.name}</strong> from the institutional directory?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
