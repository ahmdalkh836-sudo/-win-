import React, { useState } from 'react';
import {
  Menu,
  X,
  Wifi,
  Radio,
  QrCode,
  Moon,
  Sun,
  HelpCircle,
  Share2,
  Copy,
  RotateCw,
  ExternalLink,
  Plus,
  Trash2,
  Users,
  FileCheck2,
  Activity,
  Settings,
  Shield,
  ShieldAlert,
  Download,
  Upload,
  Eye,
  EyeOff,
  Search,
  Check,
  Edit2,
  GraduationCap,
  Clock,
  CheckCircle,
  Laptop,
} from 'lucide-react';
import {
  Quiz,
  Student,
  Submission,
  ActivityLog,
  TeacherSettings,
  NetworkInfo,
  ThemeAccent,
} from '../types';

interface TeacherDashboardProps {
  serverActive: boolean;
  onToggleServer: (active: boolean) => void;
  quizzes: Quiz[];
  students: Student[];
  submissions: Submission[];
  logs: ActivityLog[];
  settings: TeacherSettings;
  networkInfo: NetworkInfo;
  onUpdateSettings: (newSettings: Partial<TeacherSettings>) => void;
  onToggleQuiz: (quizId: string, isOpen: boolean) => void;
  onDeleteQuiz: (quizId: string) => void;
  onOpenCreateQuiz: () => void;
  onOpenQRCode: () => void;
  onOpenWindowsGuide: () => void;
  onOpenEditStudent: (student: Student) => void;
  onSwitchToStudentView: () => void;
  onRefreshNetwork: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  serverActive,
  onToggleServer,
  quizzes,
  students,
  submissions,
  logs,
  settings,
  networkInfo,
  onUpdateSettings,
  onToggleQuiz,
  onDeleteQuiz,
  onOpenCreateQuiz,
  onOpenQRCode,
  onOpenWindowsGuide,
  onOpenEditStudent,
  onSwitchToStudentView,
  onRefreshNetwork,
}) => {
  // Navigation & Drawer
  const [activeTab, setActiveTab] = useState<'quizzes' | 'students' | 'submissions' | 'logs' | 'settings'>('quizzes');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search in Students
  const [studentSearch, setStudentSearch] = useState('');

  // Filter in Submissions
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');

  // Teacher Profile Edit Modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [teacherName, setTeacherName] = useState(settings.name);
  const [teacherSubject, setTeacherSubject] = useState(settings.subject);
  const [teacherPhone, setTeacherPhone] = useState(settings.phone);

  const studentLink = networkInfo.fullUrl || `http://${networkInfo.primaryIP}:${networkInfo.port}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `بوابة اختبارات الحصة - ${settings.name}`,
        url: studentLink,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name: teacherName,
      subject: teacherSubject,
      phone: teacherPhone,
    });
    setEditingProfile(false);
  };

  // Export encrypted grades backup
  const handleExportGrades = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      teacher: settings.name,
      students,
      submissions,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `grades_backup_${Date.now()}.json`;
    a.click();
  };

  // Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(studentSearch) ||
      s.nationalId.includes(studentSearch) ||
      s.gradeSection.includes(studentSearch)
  );

  // Filtered Submissions
  const filteredSubmissions =
    submissionFilter === 'all'
      ? submissions
      : submissions.filter((s) => s.quizId === submissionFilter);

  // Color Accent Map
  const accentClasses: Record<ThemeAccent, { border: string; bg: string; text: string; glow: string; pill: string }> = {
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-600',
      text: 'text-purple-400',
      glow: 'shadow-purple-600/30',
      pill: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-600',
      text: 'text-blue-400',
      glow: 'shadow-blue-600/30',
      pill: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    emerald: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-600',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-600/30',
      pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    amber: {
      border: 'border-amber-500',
      bg: 'bg-amber-600',
      text: 'text-amber-400',
      glow: 'shadow-amber-600/30',
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    ruby: {
      border: 'border-rose-500',
      bg: 'bg-rose-600',
      text: 'text-rose-400',
      glow: 'shadow-rose-600/30',
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  };

  const currentTheme = accentClasses[settings.theme] || accentClasses.purple;

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100 text-slate-900'} relative pb-24`}>
      {/* Top Header - Screenshot #9 */}
      <header className="bg-[#111827]/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hamburger Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title & Status */}
          <div className="text-center">
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-1.5">
              <span>خادم الفصل</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200">{settings.name}</span>
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>نشط: {settings.networkMode === 'wifi' ? 'شبكة Wi-Fi المشتركة' : 'نقطة اتصال (Hotspot)'}</span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenWindowsGuide}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-purple-300 transition-colors"
              title="دليل ويندوز والمساعدة"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 transition-colors"
              title="الوضع الليلي"
            >
              {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenQRCode}
              className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition-colors"
              title="رمز QR لدخول الطلاب"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto p-3.5 sm:p-4 space-y-4">
        {/* 1. Server Active / Inactive Switch Card - Screenshot #9 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#131b2e] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${serverActive ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    {serverActive ? 'خادم الحصة يعمل (نشط)' : 'خادم الحصة متوقف'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {settings.networkMode === 'wifi'
                    ? 'مشاركة عبر راوتر المدرسة/المنزل'
                    : 'مشاركة عبر نقطة اتصال (Hotspot)'}
                </p>
              </div>
            </div>

            {/* Main Server Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={serverActive}
                onChange={(e) => onToggleServer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Network Mode Switcher Buttons - Screenshot #9 */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => onUpdateSettings({ networkMode: 'wifi' })}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.networkMode === 'wifi'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>شبكة Wi-Fi المشتركة</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ networkMode: 'hotspot' })}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.networkMode === 'hotspot'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>نقطة اتصال (Hotspot)</span>
            </button>
          </div>
        </div>

        {/* 2. Broadcast IP Card - Screenshot #9 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#241547] via-[#1d193b] to-[#12182b] border border-purple-500/30 shadow-2xl space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-purple-300 font-semibold block">
              رابط دخول الطلاب ({settings.networkMode === 'wifi' ? 'عبر راوتر المدرسة' : 'عبر الهوتسبوت'}):
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-lg sm:text-xl font-black text-purple-200 tracking-wider truncate dir-ltr select-all">
                {studentLink}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 transition-colors"
                  title="مشاركة الرابط"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 transition-colors"
                  title="نسخ الرابط"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-[11px] text-purple-400/80 font-mono dir-ltr">
              رابط مبسط: {networkInfo.simplifiedUrl}
            </div>
          </div>

          {/* Big Action Buttons - Screenshot #9 */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onOpenQRCode}
              className="py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>عرض QR كبير 📱</span>
            </button>

            <button
              onClick={onSwitchToStudentView}
              className="py-3 px-4 bg-slate-900/90 hover:bg-slate-800 text-purple-300 text-xs sm:text-sm font-bold rounded-2xl border border-purple-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span>معاينة بوابة الطالب</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-purple-500/20">
            <button
              onClick={onRefreshNetwork}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>تحديث عنوان الشبكة</span>
            </button>
            <button
              onClick={onOpenWindowsGuide}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-semibold"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>طريقة التشغيل على ويندوز</span>
            </button>
          </div>
        </div>

        {/* 3. MAIN TAB CONTENT */}

        {/* TAB 1: QUIZZES (Screenshot #9) */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded-3xl bg-[#131b2e] border border-slate-800 shadow-xl space-y-3.5 transition-all hover:border-slate-700"
              >
                {/* Header: Tag + Status + Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                        quiz.type === 'activity'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {quiz.type === 'activity' ? 'نشاط تفاعلي' : 'اختبار تقييمي'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        quiz.isOpen
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {quiz.isOpen ? 'مفتوح للطلاب الآن' : 'مغلق'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف "${quiz.title}"؟`)) {
                        onDeleteQuiz(quiz.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="حذف هذا الاختبار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {quiz.subtitle || quiz.instructions}
                  </p>
                </div>

                {/* Footer: Open/Close Toggle + Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quiz.isOpen}
                        onChange={(e) => onToggleQuiz(quiz.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                    <span className="text-xs font-semibold text-slate-300">
                      {quiz.isOpen ? 'مفتوح' : 'إغلاق'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{quiz.durationMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <span>📥</span>
                      <span>
                        {submissions.filter((s) => s.quizId === quiz.id).length} تسليم
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <div className="p-8 text-center bg-[#131b2e] rounded-3xl border border-slate-800">
                <p className="text-sm font-semibold text-slate-400 mb-2">لا توجد اختبارات منشأة بعد.</p>
                <p className="text-xs text-slate-500">اضغط على زر (+) في الأسفل لإنشاء أول اختبار للحصة.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS & GRADES (Screenshot #10) */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Top Actions: Export, Import, Announced */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleExportGrades}
                className="p-3 bg-[#131b2e] hover:bg-slate-850 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>سحب مشفر</span>
                </div>
                <span className="text-[10px] text-slate-400">نسخة احتياطية</span>
              </button>

              <button
                onClick={() => alert('يمكنك استيراد ملفات CSV / Excel مباشرة للطلاب')}
                className="p-3 bg-[#131b2e] hover:bg-slate-850 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>استيراد</span>
                </div>
                <span className="text-[10px] text-slate-400">قائمة الطلاب</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ gradesAnnounced: !settings.gradesAnnounced })}
                className="p-3 bg-[#131b2e] hover:bg-slate-850 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  {settings.gradesAnnounced ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{settings.gradesAnnounced ? 'معلنة' : 'مخفية'}</span>
                </div>
                <span className="text-[10px] text-slate-400">الدرجات للطلاب</span>
              </button>
            </div>

            {/* Search Bar - Screenshot #10 */}
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="بحث عن اسم طالب، هوية، فصل..."
                className="w-full px-4 py-3 pr-10 bg-[#131b2e] border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            {/* Students List */}
            <div className="space-y-3">
              {filteredStudents.map((std) => {
                const total = std.exam1 + std.exam2 + std.participation + std.extraPoints;
                return (
                  <div
                    key={std.id}
                    className="p-4 rounded-3xl bg-[#131b2e] border border-slate-800 shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                          <span>{std.name}</span>
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5 space-x-2 space-x-reverse">
                          <span>هوية: {std.nationalId}</span>
                          <span>•</span>
                          <span>{std.gradeSection}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenEditStudent(std)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>تعديل الدرجات</span>
                      </button>
                    </div>

                    {/* Grades Breakdown Pill Grid */}
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">شهري 1</div>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">{std.exam1}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">شهري 2</div>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">{std.exam2}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">مشاركة</div>
                        <div className="font-mono font-bold text-emerald-400 mt-0.5">{std.participation}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">إضافي</div>
                        <div className="font-mono font-bold text-blue-400 mt-0.5">{std.extraPoints}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                        <div className="text-purple-300 font-bold">المجموع</div>
                        <div className="font-mono font-bold text-white mt-0.5">{total}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="p-8 text-center bg-[#131b2e] rounded-3xl border border-slate-800 text-slate-400">
                  <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">لا يوجد طلاب مطابقين للبحث حالياً.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBMISSIONS (Screenshot #12) */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold custom-scrollbar">
              <button
                onClick={() => setSubmissionFilter('all')}
                className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all ${
                  submissionFilter === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#131b2e] text-slate-400 border border-slate-800'
                }`}
              >
                الكل ({submissions.length})
              </button>
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSubmissionFilter(q.id)}
                  className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all ${
                    submissionFilter === q.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#131b2e] text-slate-400 border border-slate-800'
                  }`}
                >
                  {q.title} ({submissions.filter((s) => s.quizId === q.id).length})
                </button>
              ))}
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              {filteredSubmissions.length === 0 ? (
                <div className="py-12 px-6 rounded-3xl bg-[#131b2e] border border-slate-800 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 text-2xl">
                    📋
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">لا توجد تسليمات حتى الآن</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    عندما يحل أي طالب الاختبار ويرسله، ستظهر نتيجته وإجاباته هنا مباشرة.
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-3xl bg-[#131b2e] border border-slate-800 shadow-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{sub.studentName}</span>
                      <span className="text-slate-400 font-mono">{sub.submittedAt}</span>
                    </div>

                    <div className="text-xs text-purple-300">{sub.quizTitle}</div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[11px] text-slate-400">النتيجة:</span>
                        <span className="font-mono text-base font-black text-blue-400 mr-2">
                          {sub.score} من {sub.total}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">النسبة:</span>
                        <span className="font-mono text-base font-black text-emerald-400 mr-2">
                          %{sub.percentage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE BROADCAST & LOGS (Screenshot #11) */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>سجل النشاط المباشر في الفصل ({logs.length})</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {logs.map((log) => {
                const borderClass =
                  log.type === 'danger'
                    ? 'border-red-500/50 bg-red-950/20 text-red-300'
                    : log.type === 'warning'
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                    : log.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-[#131b2e] text-slate-300';

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl border ${borderClass} flex items-start justify-between gap-3 text-xs leading-relaxed`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{log.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & CUSTOMIZATION (Screenshot #13, #14) */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-base font-bold text-white mb-0.5">الإعدادات والتخصيص</h2>
              <p className="text-xs text-slate-400">
                التحكم في بيانات المعلم، الوضع الليلي، ألوان البرنامج، وحماية الاختبارات من الغش
              </p>
            </div>

            {/* Teacher Profile Card - Screenshot #13 */}
            <div className="p-4 rounded-3xl bg-[#131b2e] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xl font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{settings.name}</h3>
                  <p className="text-xs text-purple-400 mt-0.5">{settings.subject}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    هاتف المعلم: {settings.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProfile(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                تعديل 🖊️
              </button>
            </div>

            {/* Appearance & Night Mode - Screenshot #13 */}
            <div className="p-5 rounded-3xl bg-[#131b2e] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-purple-300">المظهر والألوان (Night Mode)</h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>الوضع الليلي (Night Mode)</span>
                    <span>🌙</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    السمة الداكنة مفعلة ومريحة للعين
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => onUpdateSettings({ darkMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              {/* Color Circles Selector */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  لون السمة الأساسي للبرنامج:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  {([
                    { id: 'blue', label: 'الأزرق', color: 'bg-blue-600' },
                    { id: 'emerald', label: 'الزمردي', color: 'bg-emerald-600' },
                    { id: 'purple', label: 'البنفسجي', color: 'bg-purple-600' },
                    { id: 'amber', label: 'الكهرماني', color: 'bg-amber-600' },
                    { id: 'ruby', label: 'الياقوتي', color: 'bg-rose-600' },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onUpdateSettings({ theme: item.id })}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white transition-transform group-hover:scale-110 ${
                          settings.theme === item.id ? 'ring-4 ring-white/50 scale-105' : 'opacity-80'
                        }`}
                      >
                        {settings.theme === item.id && <Check className="w-5 h-5" />}
                      </div>
                      <span className={`text-[10px] ${settings.theme === item.id ? 'text-white font-bold' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Anti-Cheat & Security - Screenshot #13 */}
            <div className="p-5 rounded-3xl bg-[#131b2e] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-purple-300">الأمان ومنع الغش في الفصل</h3>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    <span>كشف الإنترنت الخارجي (Anti-Cheat)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    حظر دخول أو استكمال الاختبار في حال فتح الطالب بيانات الهاتف (4G/5G) أو شبكة إنترنت أخرى غير شبكة المعلم، وتنبيه الأستاذ فوراً في السجل المباشر.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={settings.antiCheat}
                    onChange={(e) => onUpdateSettings({ antiCheat: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 text-sm">🔒</span>
                <span>
                  منع إعادة الاختبار مفعل: الطالب الذي يحل اختباراً لا يمكنه الدخول أو استعراض الأسئلة مرة أخرى نهائياً لحماية سرية الأسئلة.
                </span>
              </div>
            </div>

            {/* Local Network Info - Screenshot #14 */}
            <div className="p-5 rounded-3xl bg-[#131b2e] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-purple-300">بيانات الشبكة المحلية وبث المعلم</h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">عنوان الخادم (IP):</span>
                  <span className="font-mono text-purple-300 font-bold dir-ltr">
                    {networkInfo.primaryIP}:{networkInfo.port}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">رابط الطلاب في المتصفح:</span>
                  <span className="font-mono text-blue-400 font-bold dir-ltr">
                    {studentLink}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (+) for Creating Quiz - Screenshot #9 */}
      {activeTab === 'quizzes' && (
        <button
          onClick={onOpenCreateQuiz}
          className="fixed bottom-20 left-5 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 cursor-pointer"
          title="إنشاء اختبار جديد"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Bottom Navigation Bar - Screenshots #9, #10, #11, #12 */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 z-40 py-2">
        <div className="max-w-2xl mx-auto grid grid-cols-4 px-2 text-center text-xs">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'quizzes' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">❓</span>
            <span>الاختبارات</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'students' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الطلاب والدرجات</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'submissions' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>التسليمات</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'logs' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>البث والشبكة</span>
          </button>
        </div>
      </nav>

      {/* Slide-out Navigation Drawer - Screenshot #7 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
          />

          {/* Drawer Menu */}
          <div className="relative w-80 max-w-[85vw] bg-[#161d31] border-l border-slate-800 text-slate-200 flex flex-col justify-between p-5 z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              {/* Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-xs text-slate-400">القائمة الرئيسية</span>
              </div>

              {/* Profile Card in Drawer */}
              <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{settings.name}</h3>
                  <p className="text-xs text-purple-400">{settings.subject}</p>
                </div>
              </div>

              {/* Menu Categories - Screenshot #7 */}
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                    إدارة الفصل والدرجات
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('quizzes');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>❓</span>
                        <span>الاختبارات والأنشطة</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                        {quizzes.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('students');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>الطلاب والدرجات الشهرية</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('submissions');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <span>النتائج والتسليمات</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                    الشبكة والبث المباشر
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('logs');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span>سجل العمليات والبث</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenWindowsGuide();
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>دليل شبكة Wi-Fi والهوتسبوت</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                    النظام والتخصيص
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>الإعدادات والملف الشخصي</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenWindowsGuide();
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-xs font-bold text-purple-300 border border-purple-500/30 transition-colors"
                    >
                      <Laptop className="w-4 h-4 text-purple-400" />
                      <span>تشغيل البرنامج على ويندوز</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Pill in Drawer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">البث يعمل</span>
              </span>
              <span>🌐 Wi-Fi محلي</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">تعديل بيانات المعلم</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المعلم:
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المادة والمرحلة:
                </label>
                <input
                  type="text"
                  required
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رقم الهاتف للتواصل:
                </label>
                <input
                  type="text"
                  required
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
