import React, { useState, useEffect } from 'react';
import {
  Quiz,
  Student,
  Submission,
  ActivityLog,
  TeacherSettings,
  NetworkInfo,
} from './types';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { QRCodeModal } from './components/QRCodeModal';
import { CreateQuizModal } from './components/CreateQuizModal';
import { WindowsGuideModal } from './components/WindowsGuideModal';
import { EditGradesModal } from './components/EditGradesModal';
import { TeacherSetupModal } from './components/TeacherSetupModal';
import { Laptop, Smartphone, HelpCircle, UserCog } from 'lucide-react';

export default function App() {
  // Current View: 'teacher' | 'student'
  const [activeRole, setActiveRole] = useState<'teacher' | 'student'>('teacher');

  // Server state
  const [serverActive, setServerActive] = useState<boolean>(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<TeacherSettings>({
    username: 'ahmed_teacher',
    name: 'أ. أحمد صبري',
    subject: 'فيزياء ثانوي',
    phone: '0533333333',
    password: '123',
    isConfigured: true,
    theme: 'purple',
    darkMode: true,
    antiCheat: true,
    networkMode: 'wifi',
    gradesAnnounced: true,
  });

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    primaryIP: '10.187.145.212',
    allIPs: ['10.187.145.212'],
    port: 8080,
    hostname: 'school-pc',
    simplifiedUrl: 'http://school.local:8080',
    fullUrl: 'http://10.187.145.212:8080',
  });

  // Current logged in student in student view
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Modals
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isWindowsGuideOpen, setIsWindowsGuideOpen] = useState(false);
  const [isTeacherSetupOpen, setIsTeacherSetupOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Initial load & URL check
  useEffect(() => {
    // Check if URL has ?role=student or /student
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('role') === 'student' || window.location.pathname.startsWith('/student')) {
      setActiveRole('student');
    }

    fetchInitialState();
    fetchNetworkInfo();

    // Periodic sync every 4 seconds to catch new student submissions
    const interval = setInterval(() => {
      fetchInitialState(true);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchInitialState = async (silent = false) => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setStudents(data.students || []);
        setSubmissions(data.submissions || []);
        setLogs(data.logs || []);
        setServerActive(data.serverActive ?? true);
        if (data.teacher) {
          setSettings(data.teacher);
        }
      }
    } catch (err) {
      if (!silent) console.error('Failed to fetch state from backend:', err);
    }
  };

  const fetchNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const data = await res.json();
        setNetworkInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch network info:', err);
    }
  };

  const handleToggleServer = async (active: boolean) => {
    setServerActive(active);
    try {
      await fetch('/api/server/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      fetchInitialState(true);
    } catch (err) {
      console.error('Failed to toggle server:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<TeacherSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleToggleQuiz = async (quizId: string, isOpen: boolean) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, isOpen } : q))
    );
    try {
      await fetch(`/api/quizzes/${quizId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen }),
      });
      fetchInitialState(true);
    } catch (err) {
      console.error('Failed to toggle quiz:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    try {
      await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      fetchInitialState(true);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const handleSaveNewQuiz = async (newQuiz: Omit<Quiz, 'id' | 'isOpen'>) => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });
      if (res.ok) {
        fetchInitialState(true);
      }
    } catch (err) {
      console.error('Failed to save quiz:', err);
    }
  };

  const handleSaveStudentGrades = async (
    studentId: string,
    updatedGrades: { exam1: number; exam2: number; participation: number; extraPoints: number }
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updatedGrades } : s))
    );
    try {
      await fetch(`/api/students/${studentId}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGrades),
      });
      fetchInitialState(true);
    } catch (err) {
      console.error('Failed to save student grades:', err);
    }
  };

  const handleSubmitQuiz = async (quizId: string, answers: Record<string, any>): Promise<Submission> => {
    if (!currentStudent) throw new Error('يرجى تسجيل الدخول أولاً');
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        answers,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل تسليم الاختبار');
    }

    setSubmissions((prev) => [data.submission, ...prev]);
    fetchInitialState(true);
    return data.submission;
  };

  const handleReportCheat = async (reason: string) => {
    if (!currentStudent) return;
    try {
      await fetch('/api/anti-cheat/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentStudent.name,
          reason,
        }),
      });
      fetchInitialState(true);
    } catch (err) {
      console.error('Failed to report anti-cheat alert:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-['Cairo',sans-serif] text-slate-100">
      {/* Top Floating Role & Test Switcher Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            وضع المعاينة والتبديل السريع:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveRole('teacher')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeRole === 'teacher'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🏫 لوحة المعلم (خادم الفصل)
            </button>
            <button
              onClick={() => setActiveRole('student')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeRole === 'student'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🎓 بوابة الطالب (الجوال)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWindowsGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold transition-colors"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تشغيل البرنامج على</span>
            <span>Windows</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO ROLE */}
      {activeRole === 'teacher' ? (
        <TeacherDashboard
          serverActive={serverActive}
          onToggleServer={handleToggleServer}
          quizzes={quizzes}
          students={students}
          submissions={submissions}
          logs={logs}
          settings={settings}
          networkInfo={networkInfo}
          onUpdateSettings={handleUpdateSettings}
          onToggleQuiz={handleToggleQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onOpenCreateQuiz={() => setIsCreateQuizOpen(true)}
          onOpenQRCode={() => setIsQRCodeOpen(true)}
          onOpenWindowsGuide={() => setIsWindowsGuideOpen(true)}
          onOpenEditStudent={(std) => setEditingStudent(std)}
          onOpenTeacherSetup={() => setIsTeacherSetupOpen(true)}
          onSwitchToStudentView={() => setActiveRole('student')}
          onRefreshNetwork={fetchNetworkInfo}
        />
      ) : (
        <StudentPortal
          quizzes={quizzes}
          students={students}
          submissions={submissions}
          teacherSettings={settings}
          currentStudent={currentStudent}
          onLogin={(std) => setCurrentStudent(std)}
          onLogout={() => setCurrentStudent(null)}
          onSubmitQuiz={handleSubmitQuiz}
          onReportCheat={handleReportCheat}
          onSwitchToTeacher={() => setActiveRole('teacher')}
        />
      )}

      {/* MODALS */}
      <TeacherSetupModal
        isOpen={isTeacherSetupOpen || !settings.isConfigured}
        initialSettings={settings}
        onSave={(updated) => {
          handleUpdateSettings(updated);
          setIsTeacherSetupOpen(false);
        }}
        onClose={() => setIsTeacherSetupOpen(false)}
      />

      <QRCodeModal
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
        url={networkInfo.fullUrl}
        networkMode={settings.networkMode}
        teacherName={settings.name}
      />

      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        onSave={handleSaveNewQuiz}
      />

      <WindowsGuideModal
        isOpen={isWindowsGuideOpen}
        onClose={() => setIsWindowsGuideOpen(false)}
        currentIP={networkInfo.primaryIP}
        port={networkInfo.port}
      />

      <EditGradesModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSaveStudentGrades}
      />
    </div>
  );
}
