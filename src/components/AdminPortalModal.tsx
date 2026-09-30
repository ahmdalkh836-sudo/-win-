import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  X,
  Smartphone,
  Wifi,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  UserX,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Student, TeacherSettings, ConnectedDevice } from '../types';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  settings: TeacherSettings;
  onUpdateSettings: (newSettings: Partial<TeacherSettings>) => void;
  onDeleteStudent: (studentId: string) => void;
  onResetSubmissions: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  students,
  settings,
  onUpdateSettings,
  onDeleteStudent,
  onResetSubmissions,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'devices' | 'security' | 'server'>('students');
  const [showNationalIds, setShowNationalIds] = useState(true);

  // Mock / live connected devices state for demonstration and management
  const [devices, setDevices] = useState<ConnectedDevice[]>([
    {
      id: 'dev-1',
      studentName: 'محمد عبدالله العتيبي',
      ip: '192.168.137.45',
      deviceType: 'iPhone / Safari',
      status: 'in_quiz',
      lastSeen: 'الآن',
      violationsCount: 0,
    },
    {
      id: 'dev-2',
      studentName: 'عبدالرحمن إبراهيم السعد',
      ip: '192.168.137.82',
      deviceType: 'Samsung Galaxy / Chrome',
      status: 'online',
      lastSeen: 'منذ دقيقة',
      violationsCount: 1,
    },
    {
      id: 'dev-3',
      studentName: 'فيصل ناصر الدوسري',
      ip: '192.168.137.99',
      deviceType: 'Xiaomi / Brave',
      status: 'in_quiz',
      lastSeen: 'الآن',
      violationsCount: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'Ahmed1ggr') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة! يرجى إدخال اسم المستخدم وكلمة مرور المدير المعتمدة.');
    }
  };

  const handleKickDevice = (id: string, name: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    alert(`تم طرد جهاز الطالب (${name}) من الشبكة بنجاح.`);
  };

  const handleToggleBlockDevice = (id: string) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === id ? { ...d, status: d.status === 'blocked' ? 'online' : 'blocked' } : d
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <span>لوحة تحكم المدير العام (Master Super Admin)</span>
            </h2>
            <p className="text-xs text-red-300/80 mt-0.5 font-mono">
              صلاحيات كاملة للتحكم في الأجهزة والبيانات الحساسة
            </p>
          </div>

          <div className="w-5" />
        </div>

        {/* AUTH SCREEN IF NOT LOGGED IN */}
        {!isAuthenticated ? (
          <div className="py-8 max-w-sm mx-auto text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">تسجيل دخول المدير الخاص</h3>
              <p className="text-xs text-slate-400 mt-1">
                هذه اللوحة مخصصة للمدير العام فقط ولا يمكن لأي طالب أو معلم الوصول إليها.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم مستخدم المدير (Username):
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  كلمة المرور السرية (Password):
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                تأكيد الدخول بصلاحيات المدير الكاملة ←
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="mt-5 space-y-5">
            {/* Tabs Bar */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'students' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                👥 هويات الطلاب
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={`py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'devices' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📶 إدارة الأجهزة ({devices.length})
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'security' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🛡️ منظومة الأمان
              </button>
              <button
                onClick={() => setActiveTab('server')}
                className={`py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'server' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ تحكم السيرفر
              </button>
            </div>

            {/* TAB 1: SENSITIVE STUDENT NATIONAL IDS & DATA */}
            {activeTab === 'students' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-300">
                    قائمة الطلاب مع <strong className="text-emerald-400 font-bold">أرقام الهويات الوطنية والإقامات الكاملة (غير المحجوبة)</strong>:
                  </div>
                  <button
                    onClick={() => setShowNationalIds(!showNationalIds)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    {showNationalIds ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showNationalIds ? 'إخفاء الهويات' : 'إظهار الهويات'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((std) => (
                    <div
                      key={std.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{std.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30">
                            {std.gradeSection}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="font-mono text-emerald-400">
                            رقم الهوية: {showNationalIds ? std.nationalId : '••••••••••'}
                          </span>
                          <span className="font-mono">الجوال: {std.phone || 'غير مسجل'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الطالب (${std.name}) نهائياً؟`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-500/30"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CONNECTED NETWORK DEVICES */}
            {activeTab === 'devices' && (
              <div className="space-y-3">
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center justify-between">
                  <span>الأجهزة المتصلة على شبكة الفصل حالياً:</span>
                  <span className="font-mono font-bold text-emerald-400">{devices.length} جهاز نشط</span>
                </div>

                <div className="space-y-2">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{device.studentName}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                device.status === 'in_quiz'
                                  ? 'bg-blue-900/60 text-blue-300'
                                  : device.status === 'blocked'
                                  ? 'bg-red-900/60 text-red-300'
                                  : 'bg-emerald-900/60 text-emerald-300'
                              }`}
                            >
                              {device.status === 'in_quiz'
                                ? 'يؤدي الاختبار 📝'
                                : device.status === 'blocked'
                                ? 'محظور 🚫'
                                : 'متصل 🟢'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            IP: {device.ip} | {device.deviceType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBlockDevice(device.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            device.status === 'blocked'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          {device.status === 'blocked' ? 'إلغاء الحظر' : 'حظر من الاختبار'}
                        </button>

                        <button
                          onClick={() => handleKickDevice(device.id, device.studentName)}
                          className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-500/30"
                          title="طرد الجهاز من الشبكة"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MASTER SECURITY CONTROLS */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">منع تبديل التطبيقات والتبويبات (Anti-Blur):</div>
                      <div className="text-[11px] text-slate-400">حظر خروج الطالب من متصفح الاختبار أو فتح تطبيقات أخرى</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security?.blockAppSwitch ?? true}
                      onChange={(e) =>
                        onUpdateSettings({
                          security: {
                            ...settings.security,
                            blockAppSwitch: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 accent-red-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <div>
                      <div className="text-xs font-bold text-white">منع النسخ واللصق والنقر الأيمن:</div>
                      <div className="text-[11px] text-slate-400">تعطيل تحديد النصوص ومشاركتها في الاختبار</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security?.blockCopyPaste ?? true}
                      onChange={(e) =>
                        onUpdateSettings({
                          security: {
                            ...settings.security,
                            blockCopyPaste: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 accent-red-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <div>
                      <div className="text-xs font-bold text-white">حظر اتصال الإنترنت الخارجي (Strict Local Offline):</div>
                      <div className="text-[11px] text-slate-400">إلزام الأجهزة بالاتصال بشبكة الفصل الداخلية فقط وقفل الاختبار عند فتح 4G/5G</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security?.blockExternalNet ?? true}
                      onChange={(e) =>
                        onUpdateSettings({
                          security: {
                            ...settings.security,
                            blockExternalNet: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 accent-red-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MASTER SERVER CONTROLS */}
            {activeTab === 'server' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>إجراءات الطوارئ للمدير العام:</span>
                  </h4>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من إعادة فتح محاولات الاختبار لجميع الطلاب المسجلين؟')) {
                        onResetSubmissions();
                        alert('تمت إعادة ضبط التسليمات بنجاح!');
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-colors text-right flex items-center justify-between"
                  >
                    <span>إعادة السماح لجميع الطلاب بالاختبار مجدداً (Reset Attempts)</span>
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onUpdateSettings({ networkMode: 'hotspot' });
                      alert('تم تفعيل وضع الهوتسبوت الإجباري (192.168.137.1) بنجاح!');
                    }}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors text-right flex items-center justify-between"
                  >
                    <span>تفعيل نمط نقطة الاتصال الإجباري (Windows Hotspot Mode)</span>
                    <Radio className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
