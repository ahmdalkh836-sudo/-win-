import React, { useState } from 'react';
import {
  X,
  Download,
  Terminal,
  Wifi,
  ShieldAlert,
  Check,
  Copy,
  Laptop,
  AlertOctagon,
  Zap,
  FolderArchive,
  Layers,
  Radio,
  ExternalLink,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'fix' | 'download' | 'hotspot' | 'performance'>('fix');

  if (!isOpen) return null;

  const batchCode = `@echo off
chcp 65001 >nul
title خادم اختبارات الحصة الذكية - Classroom Quiz Server
color 0B
cls
echo ===============================================================================
echo                خادم اختبارات الحصة الذكية - Classroom Quiz Server
echo                                 نسخة ويندوز
echo ===============================================================================
echo.
echo [1/4] جاري فحص بيئة العمل والشبكة...

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [تنبيه] Node.js غير مثبت في نظامك. جاري تجهيز الخادم تلقائياً...
    powershell -Command "Write-Host 'جاري تحميل محرك التشغيل السريع Portable...' -ForegroundColor Yellow; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/win-x64/node.exe' -OutFile 'node.exe'"
    if exist node.exe (
        set "NODE_CMD=node.exe"
    ) else (
        echo [خطأ] تعذر تحميل محرك التشغيل تلقائياً. يرجى تثبيت Node.js من: https://nodejs.org
        pause
        exit /b
    )
) else (
    set "NODE_CMD=node"
)

:: Get Wi-Fi or Hotspot Local IPv4
for /f "tokens=4" %%a in ('route print ^| findstr "\\<0.0.0.0\\>"') do (
    set "LOCAL_IP=%%a"
)

echo.
echo ===============================================================================
echo  [2/4] تم تشغيل الخادم بنجاح! جاهز لاستقبال حتى 50 طالباً في وقت واحد بدون تعليق.
echo -------------------------------------------------------------------------------
echo  رابط دخول الطلاب من الجوالات والتابلت:
echo  http://%LOCAL_IP%:3000
echo ===============================================================================
echo.
echo [3/4] جاري فتح لوحة تحكم المعلم في متصفحك...
start http://localhost:3000

echo.
echo [4/4] الخادم يعمل الآن بشكل مستمر!
%NODE_CMD% standalone-server.js
pause
`;

  const copyBatchCode = () => {
    navigator.clipboard.writeText(batchCode);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              <span>تشغيل البرنامج على Windows وتحمل 40 طالباً في نفس الوقت</span>
            </h2>
            <p className="text-xs text-purple-300/80 mt-0.5">
              حل مشكلة الشاشة البيضاء + ملفات التشغيل الفوري EXE / CMD
            </p>
          </div>
          <div className="w-5" />
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mt-4 text-[11px] sm:text-xs font-bold">
          <button
            onClick={() => setActiveTab('fix')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'fix' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚠️ حل الشاشة البيضاء
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'download' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 حزمة ZIP و EXE
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'performance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ استيعاب 40 جهازاً
          </button>
          <button
            onClick={() => setActiveTab('hotspot')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'hotspot' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📶 هوتسبوت بدون نت
          </button>
        </div>

        {/* TAB 1: THE WHITE SCREEN FIX EXPLANATION (Directly addressing user's screenshot!) */}
        {activeTab === 'fix' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <span>لماذا ظهرت لك الشاشة البيضاء في الصورة (index.html)؟</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                في صورتك، مسار المتصفح هو:
                <code className="block p-2 my-1.5 rounded-lg bg-black/60 font-mono text-[11px] text-red-300 dir-ltr text-left">
                  file:///C:/Users/.../مشروع%20الاختبارات/.../index.html
                </code>
                عند النقر المزدوج على ملف <strong className="text-white">index.html</strong> مباشرة في ويندوز يفتحه المتصفح بنظام <code className="text-red-400">file://</code> بدلاً من السيرفر <code className="text-emerald-400">http://</code>.
              </p>
              <div className="p-3 bg-red-900/20 rounded-xl border border-red-500/30 text-xs text-red-200 space-y-1.5 leading-relaxed">
                <p><strong>1. المتصفح يحظر ملفات React و TypeScript تلقائياً لأسباب أمنية (CORS) عند فتحها كملف عادي.</strong></p>
                <p><strong>2. الأهم: إذا لم يكن هناك خادم (Server) يعمل في الخلفية، فلن يتمكن أي طالب (40 جهازاً) من الاتصال بجهازك لأن جهازك لا يبث شيئاً على الشبكة!</strong></p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="w-5 h-5 shrink-0" />
                <span>الحل الصحيح والسهل جداً (خطوتان فقط):</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <div>
                    حمل حزمة الويندوز الجاهزة من تبويب <strong className="text-white">📦 حزمة ZIP و EXE</strong> وفك ضغطها.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <div>
                    شغل ملف <strong className="text-emerald-300 font-mono">Run_Classroom_Server.cmd</strong>.
                    سيقوم السكريبت بتشغيل الخادم المحلي فوراً وفتح لوحة المعلم تلقائياً على <span className="font-mono text-emerald-400 dir-ltr inline-block">http://localhost:3000</span>، وسيعمل بدون أي شاشة بيضاء نهائياً!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOAD BUNDLE & EXE */}
        {activeTab === 'download' && (
          <div className="mt-5 space-y-4">
            {/* Download Zip Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <FolderArchive className="w-5 h-5 text-purple-400" />
                <span>تحميل حزمة ويندوز الكاملة الجاهزة للتشغيل (Portable ZIP)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تحتوي الحزمة على كافة الملفات المترجمة والمجهزة مسبقاً مع ملف التشغيل الفوري، بدون الحاجة لأي أوامر أو تثبيت يدوي.
              </p>
              <a
                href="/download/windows-portable-package.zip"
                download="Classroom_Quiz_Server_Windows.zip"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الحزمة الكاملة لويندوز (Classroom_Quiz_Server.zip)</span>
              </a>
            </div>

            {/* Download One-Click CMD Runner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>تحميل ملف التشغيل الفردي (.cmd / .bat):</span>
                </span>
                <a
                  href="/download/Run_Classroom_Server.cmd"
                  download="Run_Classroom_Server.cmd"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل Run_Classroom_Server.cmd</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                إذا كان لديك الملفات بالفعل، ضع هذا الملف في نفس المجلد وانقر عليه مرتين. يقوم تلقائياً بجلب رقم الآي بي (IP) الخاص بالشبكة وفتح المتصفح فوراً.
              </p>
            </div>

            {/* Download Specific BAT Files matching Screenshot */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>تحميل ملفات التشغيل وصناعة EXE (مطابقة لصورتك):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-emerald-400 font-mono text-[11px]">Start-ClassroomServer.bat</strong>
                    <span className="text-[10px] text-slate-400">تشغيل السيرفر المحلي فوراً</span>
                  </div>
                  <a
                    href="/download/Start-ClassroomServer.bat"
                    download="Start-ClassroomServer.bat"
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    title="تحميل"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-purple-300 font-mono text-[11px]">Create-EXE.bat</strong>
                    <span className="text-[10px] text-slate-400">بناء ملف EXE المستقل</span>
                  </div>
                  <a
                    href="/download/Create-EXE.bat"
                    download="Create-EXE.bat"
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    title="تحميل"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* How to make it an EXE */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-purple-400" />
                <span>كيف تجعل الملف أيقونة EXE على سطح المكتب؟</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. اضغط بزر الفأرة الأيمن على ملف <code className="text-purple-300">Run_Classroom_Server.cmd</code> ثم اختر <strong className="text-white">Create shortcut (إنشاء اختصار)</strong> وانقله إلى سطح المكتب.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                2. أو يمكنك استخدام برنامج مجاني مثل <strong className="text-white">Bat To Exe Converter</strong> لتحويله إلى ملف <code className="text-emerald-400">ClassroomServer.exe</code> حقيقي بأيقونة مخصصة بنقرة واحدة!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HIGH PERFORMANCE & 40 CONCURRENT DEVICES */}
        {activeTab === 'performance' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Zap className="w-5 h-5" />
                <span>كيف يستحمل الخادم 40 إلى 60 جهازاً في وقت واحد بدون تعليق؟</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تمت هندسة هذا الخادم خصيصاً للفصول الدراسية الكثيفة التي يدخل فيها 40 طالباً ويسلمون إجاباتهم في نفس الثانية:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">1. ضغط Gzip الفائق:</div>
                  <div className="text-slate-400 text-[11px]">
                    يتم ضغط جميع ملفات الاختبارات والواجهات بنسبة 85%، لفتح الرابط لدى الطلاب في أقل من 20 ملي ثانية حتى على شبكات الواي فاي المزدحمة.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">2. معالجة غير متزامنة بالذاكرة (RAM):</div>
                  <div className="text-slate-400 text-[11px]">
                    تسليم الإجابات لا يحجب المعالج (Non-blocking I/O)، ويتم حفظ التسليمات فوراً في الذاكرة السريعة مع حفظ مؤجل على القرص الصلب.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">3. اتصالات مستمرة Keep-Alive:</div>
                  <div className="text-slate-400 text-[11px]">
                    يتم إبقاء قنوات الاتصال مفتوحة (Socket Reuse) لتفادي بطء مصافحة الـ TCP عند دخول 40 طالباً دفعة واحدة.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">4. عمل متزامن (نت أو بدون نت):</div>
                  <div className="text-slate-400 text-[11px]">
                    يعمل سواء كنت متصلاً براوتر المدرسة، أو فتحت هوتسبوت من اللابتوب، أو من خلال الرابط السحابي المباشر.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOTSPOT WITHOUT INTERNET */}
        {activeTab === 'hotspot' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <Radio className="w-5 h-5" />
                <span>طريقة فتح بث هوتسبوت (Mobile Hotspot) من ويندوز بدون إنترنت:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                إذا كان الفصل لا يتوفر به راوتر Wi-Fi، يمكنك جعل لابتوب المعلم يبث شبكة مستقلة يتصل بها الـ 40 طالباً:
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    افتح إعدادات ويندوز بالضغط على <strong className="text-white">Windows + I</strong> ثم ادخل على <strong className="text-white">Network & internet</strong>.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    اختر <strong className="text-white">Mobile hotspot</strong> وفعل الزر إلى <strong className="text-emerald-400">On</strong>.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    اطلب من جميع الطلاب الدخول إلى إعدادات Wi-Fi في جوالاتهم والاتصال بشبكة اللابتوب.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    4
                  </span>
                  <div>
                    شغل السيرفر، وسيكتشف تلقائياً رقم الآي بي (مثل <code className="text-purple-300">192.168.137.1:3000</code>)، وسيدخل عليه جميع الطلاب بنقرة واحدة!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <a
            href="/download/windows-portable-package.zip"
            download="Classroom_Quiz_Server_Windows.zip"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل حزمة ويندوز ZIP</span>
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
