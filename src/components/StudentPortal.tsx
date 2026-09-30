import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Moon,
  Sun,
  LogOut,
  Clock,
  HelpCircle,
  Trophy,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  RotateCw,
  Lock,
  Sparkles,
  BarChart2,
  FileText,
} from 'lucide-react';
import { Quiz, Student, Submission, TeacherSettings } from '../types';

interface StudentPortalProps {
  quizzes: Quiz[];
  students: Student[];
  submissions: Submission[];
  teacherSettings: TeacherSettings;
  currentStudent: Student | null;
  onLogin: (student: Student) => void;
  onLogout: () => void;
  onSubmitQuiz: (quizId: string, answers: Record<string, any>) => Promise<Submission>;
  onReportCheat: (reason: string) => void;
  onSwitchToTeacher?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  quizzes,
  submissions,
  teacherSettings,
  currentStudent,
  onLogin,
  onLogout,
  onSubmitQuiz,
  onReportCheat,
  onSwitchToTeacher,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results' | 'grades'>('quizzes');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeSection, setGradeSection] = useState('أول ثانوي - شعبة 1');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-Cheat Warning Modal State
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);

  // Setup countdown timer
  useEffect(() => {
    let interval: any = null;
    if (activeQuiz && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, timeLeftSeconds]);

  // Anti-Cheat listeners: tab visibility & blur
  useEffect(() => {
    if (!activeQuiz || !teacherSettings.antiCheat) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowAntiCheatModal(true);
        onReportCheat('مغادرة صفحة الاختبار أو فتح تطبيق آخر في الجوال');
      }
    };

    const handleWindowBlur = () => {
      setShowAntiCheatModal(true);
      onReportCheat('فقدان تركيز النافذة / محاولة الخروج');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeQuiz, teacherSettings.antiCheat]);

  const handleStartQuiz = (quiz: Quiz) => {
    // Check if already submitted
    const hasSubmitted = submissions.some(
      (s) => s.quizId === quiz.id && s.studentId === currentStudent?.id
    );
    if (hasSubmitted) {
      alert('لقد قمت بحل هذا الاختبار مسبقاً ولا يمكن إعادته حفاظاً على سرية الأسئلة.');
      return;
    }

    setActiveQuiz(quiz);
    setUserAnswers({});
    setTimeLeftSeconds(quiz.durationMinutes * 60);
    setLastSubmission(null);
  };

  const handleAutoSubmit = async () => {
    if (!activeQuiz || !currentStudent) return;
    try {
      setIsSubmitting(true);
      const res = await onSubmitQuiz(activeQuiz.id, userAnswers);
      setLastSubmission(res);
      setActiveQuiz(null);
    } catch (err: any) {
      alert(err.message || 'فشل تسليم الاختبار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!activeQuiz || !currentStudent) return;
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = activeQuiz.questions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `أجبت على ${answeredCount} من أصل ${totalCount} أسئلة فقط. هل أنت متأكد من تسليم الإجابات الآن؟`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmitQuiz(activeQuiz.id, userAnswers);
      setLastSubmission(res);
      setActiveQuiz(null);
    } catch (err: any) {
      alert(err.message || 'فشل تسليم الاختبار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/students/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isNew: authMode === 'register',
          name,
          nationalId,
          phone,
          gradeSection,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'حدث خطأ في التسجيل');
        return;
      }

      onLogin(data.student);
    } catch (err: any) {
      setAuthError('تعذر الاتصال بخادم المعلم المحلي.');
    }
  };

  // Student specific submissions
  const studentSubmissions = submissions.filter((s) => s.studentId === currentStudent?.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      {/* Top Header - Matching screenshots */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Right: Title & Local Broadcast Pill */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg">
              <span className="text-xl">📚</span>
              <span>بوابة اختبارات الحصة الذكية</span>
            </div>
            <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-[11px] text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>بث محلي آمن بدون إنترنت</span>
            </div>
          </div>

          {/* Left: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-xs font-semibold text-blue-100 transition-colors"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
              <span>{darkMode ? 'نهاري' : 'ليلي'}</span>
            </button>

            {currentStudent ? (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl border border-white/40 hover:bg-white/10 text-xs font-bold text-white transition-colors"
              >
                خروج
              </button>
            ) : onSwitchToTeacher ? (
              <button
                onClick={onSwitchToTeacher}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors shadow"
              >
                لوحة المعلم 👨‍🏫
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 pb-20">
        {/* VIEW 1: REGISTRATION / LOGIN (Screenshot #5) */}
        {!currentStudent ? (
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                تسجيل طالب جديد (لأول مرة)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                تسجيل الدخول لحسابي
              </button>
            </div>

            {/* Instruction Callout (Screenshot #5) */}
            <div className="p-3.5 mb-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-r-4 border-blue-600 text-xs leading-relaxed text-blue-900 dark:text-blue-200">
              <strong className="block mb-1 font-bold text-blue-800 dark:text-blue-300">
                ✋ {authMode === 'register' ? 'التسجيل لأول مرة:' : 'تسجيل الدخول:'}
              </strong>
              يرجى إدخال بياناتك الرسمية بدقة لتوثيق حضورك واختباراتك وحفظها لدى جهاز المعلم ({teacherSettings.name}).
            </div>

            {authError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleRegisterOrLogin} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    الاسم الرباعي الصريح للطالب: *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: محمد عبدالله خالد العتيبي"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  رقم الهوية أو الإقامة: *
                </label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="أرقام رقم الهوية أو الإقامة (10 أرقام)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      رقم الهاتف / الجوال: *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 05xxxxxxxx"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      الصف والشعبة: *
                    </label>
                    <input
                      type="text"
                      required
                      value={gradeSection}
                      onChange={(e) => setGradeSection(e.target.value)}
                      placeholder="مثال: أول ثانوي - شعبة 1"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {authMode === 'register' ? 'اختر كلمة مرور خاصة بحسابك: *' : 'كلمة المرور: *'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة مرور تتذكرها للدخول مستقبلاً"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{authMode === 'register' ? 'حفظ البيانات وتسجيل الدخول للدروس' : 'تسجيل الدخول'}</span>
                <span>←</span>
              </button>
            </form>
          </div>
        ) : lastSubmission ? (
          /* VIEW 2: SUBMISSION RESULT SCREEN (Screenshot #1) */
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-6 rounded-3xl border-2 border-emerald-500/80 text-center shadow-xl ${darkMode ? 'bg-slate-900' : 'bg-emerald-50/70'}`}>
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                تم تسليم إجاباتك بنجاح!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
                تم إرسال نتيجتك وحفظها فوراً في سجل درجات المعلم ({teacherSettings.name}).
              </p>

              <div className="py-4">
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                  {lastSubmission.score} من {lastSubmission.total}
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  النسبة المئوية: {lastSubmission.percentage}%
                </div>
              </div>
            </div>

            {/* Lock Notice */}
            <div className={`p-4 rounded-2xl border text-center text-xs leading-relaxed ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-200/60 border-slate-300 text-slate-700'}`}>
              <span className="inline-block mr-1">🔒</span>
              تم إغلاق الاختبار لك، ولا يمكن إعادة الدخول للحفاظ على سرية الأسئلة.
            </div>

            {/* Back Button */}
            <button
              onClick={() => {
                setLastSubmission(null);
                setActiveTab('results');
              }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>←</span>
              <span>العودة إلى لوحة الاختبارات الرئيسية</span>
            </button>
          </div>
        ) : activeQuiz ? (
          /* VIEW 3: ACTIVE QUIZ TEST SCREEN */
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Timer & Quiz Header */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeQuiz.title}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  الطالب: {currentStudent.name}
                </p>
              </div>

              {/* Countdown Pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                timeLeftSeconds < 60
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {activeQuiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      السؤال {idx + 1} من {activeQuiz.questions.length}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                    {q.text}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setUserAnswers({ ...userAnswers, [q.id]: optIdx })
                          }
                          className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : darkMode
                              ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected
                                ? 'border-white bg-white text-blue-600 font-bold'
                                : 'border-slate-400 text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓' : String.fromCharCode(65 + optIdx)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Bar */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleManualSubmit}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>تسليم الإجابات وإنهاء الاختبار</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 4: STUDENT TABS (Screenshot #2, #3, #4) */
          <div className="space-y-4">
            {/* Top Student Tab Header (Screenshot #2, #3, #4) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'quizzes'
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>📋 الاختبارات</span>
                <span className="font-mono">({quizzes.filter((q) => q.isOpen).length})</span>
              </button>

              <button
                onClick={() => setActiveTab('results')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'results'
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🏆 نتائج الحل</span>
                <span className="font-mono">({studentSubmissions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('grades')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'grades'
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>📊 درجاتي</span>
                <span>وتقييمي</span>
              </button>
            </div>

            {/* TAB CONTENT: QUIZZES (Screenshot #4) */}
            {activeTab === 'quizzes' && (
              <div className="space-y-4 animate-in fade-in">
                {quizzes
                  .filter((q) => q.isOpen)
                  .map((quiz) => {
                    const hasSubmitted = studentSubmissions.some((s) => s.quizId === quiz.id);
                    return (
                      <div
                        key={quiz.id}
                        className={`p-5 rounded-3xl border shadow-md transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                              quiz.type === 'activity'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}
                          >
                            {quiz.type === 'activity' ? 'نشاط تفاعلي' : 'اختبار تقييمي'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                          {quiz.subtitle || quiz.instructions}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mb-4 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>المدة: {quiz.durationMinutes} دقيقة</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold">❓</span>
                            <span>عدد الأسئلة: {quiz.questions.length}</span>
                          </div>
                        </div>

                        {hasSubmitted ? (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>تم حل هذا الاختبار وتسليمه مسبقاً بنجاح</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartQuiz(quiz)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>بدء الاختبار الآن</span>
                            <span>←</span>
                          </button>
                        )}
                      </div>
                    );
                  })}

                {quizzes.filter((q) => q.isOpen).length === 0 && (
                  <div className="text-center py-12 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-500">لا توجد اختبارات مفتوحة حالياً من المعلم.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: RESULTS (Screenshot #3) */}
            {activeTab === 'results' && (
              <div className="space-y-4 animate-in fade-in">
                {studentSubmissions.length === 0 ? (
                  <div className={`py-12 px-6 rounded-3xl border text-center shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
                      📊
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                      لم تنجز أي اختبارات بعد
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      ستظهر هنا جميع درجاتك ونتائجك بعد تسليم أي اختبار للمعلم.
                    </p>
                  </div>
                ) : (
                  studentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-5 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">
                          {sub.submittedAt}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                          تم التسليم ✓
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                        {sub.quizTitle}
                      </h3>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                        <div>
                          <div className="text-xs text-slate-500">الدرجة المحققة:</div>
                          <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                            {sub.score} من {sub.total}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">النسبة المئوية:</div>
                          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            %{sub.percentage}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: MONTHLY REPORT CARD (Screenshot #2) */}
            {activeTab === 'grades' && (
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 animate-in fade-in ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>معتمدة</span>
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📊</span>
                    <span>بطاقة التقييم والدرجات الشهرية</span>
                  </h3>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs text-slate-500 mb-1">الاختبار الشهري الأول</div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {currentStudent.exam1}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs text-slate-500 mb-1">الاختبار الشهري الثاني</div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {currentStudent.exam2}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs text-slate-500 mb-1">درجات المشاركة والتفاعل</div>
                    <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {currentStudent.participation}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs text-slate-500 mb-1">نقاط إضافية / خصم</div>
                    <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                      {currentStudent.extraPoints}
                    </div>
                  </div>
                </div>

                {/* Cumulative Total */}
                <div className="p-4 rounded-2xl border-2 border-blue-500/50 bg-blue-50 dark:bg-blue-950/40 text-center">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                    المجموع التراكمي للدرجات
                  </div>
                  <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {currentStudent.exam1 +
                      currentStudent.exam2 +
                      currentStudent.participation +
                      currentStudent.extraPoints}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ANTI-CHEAT MODAL - EXACT REPLICA OF SCREENSHOT #6 */}
      {showAntiCheatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-slate-900 shadow-2xl text-center border-2 border-red-500">
            {/* Big Red Block Icon */}
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-14 h-14" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-black text-red-600 mb-2">
              تنبيه أمني: اتصال إنترنت خارجي!
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              تم رصد اتصال هاتفك بالإنترنت الخارجي (بيانات الهاتف 4G/5G أو شبكة أخرى) أو مغادرة نافذة الاختبار.
            </p>

            {/* Warning Box */}
            <div className="p-3 mb-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed text-right">
              <strong className="block mb-1 font-bold text-red-700 flex items-center gap-1">
                <span>⚠️</span>
                <span>قواعد الاختبار العادل:</span>
              </strong>
              هذا الاختبار محمي ويتطلب الاتصال الحصري بشبكة بث المعلم بدون إنترنت خارجي لمنع البحث أو تسريب الأسئلة.
            </div>

            <p className="text-[11px] text-slate-500 mb-5">
              يرجى إيقاف بيانات الهاتف (بيانات الجوال) والبقاء داخل الاختبار فوراً وسيعود الاختبار للعمل تلقائياً.
            </p>

            {/* Button */}
            <button
              onClick={() => setShowAntiCheatModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>🔄</span>
              <span>فحص الاتصال مجدداً</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
