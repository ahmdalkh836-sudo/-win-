import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Palette, Check, Sparkles } from 'lucide-react';
import { TeacherSettings, ThemeAccent } from '../types';

interface TeacherSetupModalProps {
  isOpen: boolean;
  initialSettings: TeacherSettings;
  onSave: (settings: Partial<TeacherSettings>) => void;
  onClose?: () => void;
}

export const TeacherSetupModal: React.FC<TeacherSetupModalProps> = ({
  isOpen,
  initialSettings,
  onSave,
  onClose,
}) => {
  const [username, setUsername] = useState(initialSettings.username || 'teacher_admin');
  const [name, setName] = useState(initialSettings.name || 'أ. أحمد صبري');
  const [subject, setSubject] = useState(initialSettings.subject || 'فيزياء ثانوي');
  const [phone, setPhone] = useState(initialSettings.phone || '0533333333');
  const [password, setPassword] = useState(initialSettings.password || 'admin123');
  const [theme, setTheme] = useState<ThemeAccent>(initialSettings.theme || 'purple');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) {
      alert('يرجى ملء اسم الأستاذ والمادة التي يدرسها');
      return;
    }

    onSave({
      username: username.trim(),
      name: name.trim(),
      subject: subject.trim(),
      phone: phone.trim(),
      password: password.trim(),
      theme,
      isConfigured: true,
    });

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl">
        {/* Top Header Badge */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-white">إعداد خادم المعلم والحصة</h2>
          <p className="text-xs text-slate-400 mt-1">
            يرجى إدخال بيانات الأستاذ والمادة لتخصيص الخادم للطلاب في الفصل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم الأستاذ الكامل: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أ. أحمد صبري"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم المستخدم (Login User):
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="teacher_admin"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                المادة التي يدرسها: *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: فيزياء - المرحلة الثانوية"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                كلمة مرور حماية لوحة التحكم:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة مرور المعلم"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رقم هاتف المعلم للتواصل:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 0533333333"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Theme Accent Color Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>اختر لون السمة المفضل للبرنامج:</span>
            </label>
            <div className="grid grid-cols-5 gap-2 text-center">
              {([
                { id: 'purple', label: 'بنفسجي', bg: 'bg-purple-600' },
                { id: 'blue', label: 'أزرق', bg: 'bg-blue-600' },
                { id: 'emerald', label: 'زمردي', bg: 'bg-emerald-600' },
                { id: 'amber', label: 'كهرماني', bg: 'bg-amber-600' },
                { id: 'ruby', label: 'ياقوتي', bg: 'bg-rose-600' },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    theme === item.id
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center text-white`}>
                    {theme === item.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>حفظ الإعدادات وبدء تشغيل الخادم في الفصل ←</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
