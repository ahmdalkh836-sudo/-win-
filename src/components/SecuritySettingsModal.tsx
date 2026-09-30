import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  WifiOff,
  Copy,
  Maximize2,
  AlertTriangle,
  X,
  Sliders,
  Check,
} from 'lucide-react';
import { TeacherSettings, SecuritySettings } from '../types';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onUpdateSettings: (newSettings: Partial<TeacherSettings>) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const sec = settings.security || {
    enabled: true,
    blockAppSwitch: true,
    blockCopyPaste: true,
    enforceFullscreen: true,
    maxViolations: 2,
    blockExternalNet: true,
  };

  const updateSec = (patch: Partial<SecuritySettings>) => {
    onUpdateSettings({
      antiCheat: patch.enabled !== undefined ? patch.enabled : settings.antiCheat,
      security: {
        ...sec,
        ...patch,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl">
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
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>إعدادات منظومة الحماية ومكافحة الغش</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              التحكم في قيود الاختبارات ومنع الإنترنت الخارجي
            </p>
          </div>

          <div className="w-5" />
        </div>

        <div className="mt-5 space-y-4">
          {/* Master Switch */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">المفتاح الرئيسي للحماية</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {sec.enabled ? 'الحماية نشطة ومطبقة على جميع الطلاب' : 'الحماية متوقفة حالياً'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sec.enabled}
                onChange={(e) => updateSec({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Sub Controls */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
            {/* Rule 1: Strict Offline */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4 text-purple-400" />
                  <span>منع اتصال الإنترنت الخارجي (Strict Local):</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  إلزام الاتصال بشبكة الفصل الداخلية وقفل الاختبار فوراً إذا فتح الطالب بيانات 4G/5G
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!sec.enabled}
                checked={sec.blockExternalNet}
                onChange={(e) => updateSec({ blockExternalNet: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Rule 2: App Switch */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>منع تبديل التطبيقات والتبويبات:</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  رصد الخروج من شاشة الاختبار أو فتح واتساب/المتصفح وقفل الصفحة
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!sec.enabled}
                checked={sec.blockAppSwitch}
                onChange={(e) => updateSec({ blockAppSwitch: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Rule 3: Copy Paste */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-blue-400" />
                  <span>منع النسخ واللصق وتحديد النص:</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  تعطيل تحديد الأسئلة أو نسخها للبحث عنها
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!sec.enabled}
                checked={sec.blockCopyPaste}
                onChange={(e) => updateSec({ blockCopyPaste: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Rule 4: Max Violations Strikes */}
            <div className="pt-3 border-t border-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">الحد الأقصى للمخالفات قبل قفل الاختبار نهائياً:</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {sec.maxViolations} إنذارات
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={!sec.enabled}
                    onClick={() => updateSec({ maxViolations: num })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      sec.maxViolations === num
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {num === 1 ? 'إنذار واحد (صارم)' : `${num} إنذارات`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs transition-colors cursor-pointer"
          >
            حفظ وإغلاق نافذة الحماية
          </button>
        </div>
      </div>
    </div>
  );
};
