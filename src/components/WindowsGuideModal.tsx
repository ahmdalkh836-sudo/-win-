import React, { useState } from 'react';
import { X, Download, Terminal, Wifi, ShieldAlert, Check, Copy, Laptop, HelpCircle } from 'lucide-react';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIP: string;
  port: string | number;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({
  isOpen,
  onClose,
  currentIP,
  port,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'hotspot' | 'firewall'>('quick');

  if (!isOpen) return null;

  const batchCode = `@echo off
chcp 65001 >nul
title خادم اختبارات الحصة الذكية - Classroom Quiz Server
cls
echo ======================================================================
echo           خادم اختبارات الحصة الذكية - Classroom Quiz Server
echo ======================================================================
echo.
echo [1/3] جاري فحص الشبكة وتشغيل الخادم المحلي...

:: تشغيل الخادم
start http://localhost:${port}
npm run dev

pause
`;

  const copyBatchCode = () => {
    navigator.clipboard.writeText(batchCode);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const handleDownloadBat = () => {
    const blob = new Blob([batchCode], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Run_Quiz_Server.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              <span>دليل تشغيل البرنامج على نظام Windows</span>
            </h2>
            <p className="text-xs text-slate-400">
              كيف تجعل أي جوال في الفصل يتصل بجهاز الكمبيوتر بدون إنترنت
            </p>
          </div>
          <div className="w-5" />
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'quick' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ التشغيل السريع بملف BAT
          </button>
          <button
            onClick={() => setActiveTab('hotspot')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'hotspot' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📶 هوتسبوت ويندوز (بدون نت)
          </button>
          <button
            onClick={() => setActiveTab('firewall')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'firewall' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ جدار حماية ويندوز
          </button>
        </div>

        {/* Tab 1: Quick */}
        {activeTab === 'quick' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl">
              <h3 className="text-sm font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                <span>تحميل ملف التشغيل الفوري لنظام ويندوز</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                اضغط على الزر أدناه لتحميل ملف <span className="font-mono text-purple-300">Run_Quiz_Server.bat</span>.
                بمجرد النقر عليه مرتين في ويندوز، سيقوم بتشغيل الخادم المحلي وفتح لوحة المعلم فوراً.
              </p>
              <button
                onClick={handleDownloadBat}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف Run_Quiz_Server.bat (تشغيل بنقرة واحدة)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>محتوى ملف التشغيل:</span>
                </span>
                <button
                  onClick={copyBatchCode}
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                >
                  {copiedBatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBatch ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto text-left dir-ltr">
                {batchCode}
              </pre>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-white mb-2">كيف يتصل الطلاب من هواتفهم؟</h4>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                <li>يتصل الطالب بنفس شبكة الواي فاي أو الهوتسبوت الخاص باللابتوب.</li>
                <li>يفتح متصفح الإنترنت في جواله (Safari أو Chrome أو Brave).</li>
                <li>
                  يكتب الرابط المعروض على شاشتك:
                  <span className="font-mono text-purple-300 font-bold mx-1 dir-ltr inline-block">
                    http://{currentIP}:{port}
                  </span>
                  أو يقوم بمسح كود الـ QR المعروض على شاشتك أو البروجيكتور.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Hotspot */}
        {activeTab === 'hotspot' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>تشغيل نقطة اتصال (Mobile Hotspot) من ويندوز بدون إنترنت:</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                إذا كنت في فصل دراسي ولا يوجد راوتر Wi-Fi، يمكنك جعل لابتوب ويندوز يبث شبكة خاصة يتصل بها كل طلاب الفصل:
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    افتح <strong className="text-white">إعدادات ويندوز (Settings)</strong> ثم اختر{' '}
                    <strong className="text-white">Network & internet</strong>.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    انقر على <strong className="text-white">Mobile hotspot</strong> وفعل الزر إلى{' '}
                    <strong className="text-emerald-400">On</strong>.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    اضبط اسم الشبكة وكلمة المرور (مثل: <code className="text-purple-300">QuizClass</code> وكلمة مرور سهلة).
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    4
                  </span>
                  <div>
                    اطلب من جميع الطلاب الاتصال بشبكة الهوتسبوت هذه من إعدادات الواي فاي في جوالاتهم.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Firewall */}
        {activeTab === 'firewall' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>السماح للخادم في جدار حماية ويندوز (Windows Defender Firewall)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                إذا لم يتمكن الطلاب من فتح الرابط رغم أنهم على نفس الشبكة، فالسبب هو أن جدار حماية ويندوز يحجب المنفذ (Port {port}).
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="font-semibold text-white">طريقة السماح في خطوة واحدة عبر موجه الأوامر (CMD كمسؤول):</p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 text-left dir-ltr">
                  netsh advfirewall firewall add rule name="ClassroomQuizServer" dir=in action=allow protocol=TCP localport={port}
                </div>
                <p className="text-slate-400 text-[11px]">
                  أو عند تشغيل البرنامج لأول مرة وظهور نافذة "Windows Security Alert"، تأكد من وضع علامة صح على{' '}
                  <strong className="text-white">Private networks</strong> واضغط <strong className="text-white">Allow access</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
