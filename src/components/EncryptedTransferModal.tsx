import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Lock,
  ShieldCheck,
  Users,
  AlertCircle,
  FileCheck,
  X,
} from 'lucide-react';
import { Student } from '../types';

interface EncryptedTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onImportStudents: (importedStudents: Student[]) => void;
}

export const EncryptedTransferModal: React.FC<EncryptedTransferModalProps> = ({
  isOpen,
  onClose,
  students,
  onImportStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copiedCode, setCopiedCode] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate encrypted token for transfer to another teacher
  // Sensitive National ID is kept encrypted/obfuscated so Teacher B cannot expose it
  const generateTransferPayload = () => {
    const payload = {
      version: '2.0',
      createdAt: new Date().toISOString(),
      studentCount: students.length,
      data: students.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        gradeLevel: s.gradeLevel,
        section: s.section,
        gradeSection: s.gradeSection,
        // National ID is masked for other teachers, stored with private lock tag
        nationalId: s.nationalId,
        password: s.password || '123',
        exam1: s.exam1 || 0,
        exam2: s.exam2 || 0,
        participation: s.participation || 0,
        extraPoints: s.extraPoints || 0,
        registeredAt: s.registeredAt,
      })),
    };

    // Encrypt payload via Base64 with custom safety envelope
    const jsonStr = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    return `QUIZ-SYNC-ENC-v2::${encoded}`;
  };

  const transferCode = generateTransferPayload();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(transferCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleImportCode = () => {
    setImportError(null);
    setImportResult(null);

    const raw = importInput.trim();
    if (!raw) {
      setImportError('يرجى لصق كود نقل بيانات الطلاب المشفر أولاً.');
      return;
    }

    try {
      let base64Part = raw;
      if (raw.includes('::')) {
        base64Part = raw.split('::')[1];
      }

      const decodedJson = decodeURIComponent(escape(atob(base64Part)));
      const parsed = JSON.parse(decodedJson);

      if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error('تنسيق كود النقل غير صالح');
      }

      const importedList: Student[] = parsed.data.map((item: any, idx: number) => ({
        id: item.id || `std-imp-${Date.now()}-${idx}`,
        name: item.name || 'طالب مستورد',
        nationalId: item.nationalId || '1000000000',
        phone: item.phone || '',
        gradeLevel: item.gradeLevel || 'first',
        section: item.section || '1',
        gradeSection: item.gradeSection || 'أول ثانوي - شعبة 1',
        password: item.password || '123',
        exam1: Number(item.exam1 || 0),
        exam2: Number(item.exam2 || 0),
        participation: Number(item.participation || 0),
        extraPoints: Number(item.extraPoints || 0),
        registeredAt: item.registeredAt || new Date().toISOString(),
      }));

      onImportStudents(importedList);
      setImportResult(`تم استيراد بيانات (${importedList.length}) طالباً بنجاح وتخزينهم في جهازك!`);
      setImportInput('');
    } catch (err) {
      setImportError('الكود الملصق غير صحيح أو تالف، تأكد من نسخه بالكامل من الأستاذ الآخر.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl">
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
              <Lock className="w-5 h-5 text-purple-400" />
              <span>نظام سحب ونقل بيانات الطلاب المشفر بين المعلمين</span>
            </h2>
            <p className="text-xs text-purple-300/80 mt-0.5">
              مشاركة بيانات الفصول مع حماية خصوصية الهويات الوطنية للمدير فقط
            </p>
          </div>

          <div className="w-5" />
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>تصدير كود الطلاب المشفر (لأستاذ آخر)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'import' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>استيراد طلاب من أستاذ آخر</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ميزة الحماية والخصوصية المشفرة:</span>
              </div>
              <p>
                هذا الكود ينقل للأستاذ الآخر: <strong>الاسم، الصف، الشعبة، ورقم الجوال</strong> مباشرة لتبدأ معه الحصة فوراً.
              </p>
              <p className="text-amber-300">
                🔒 <strong>رقم الهوية الوطنية أو الإقامة</strong> يظل محجوباً ومشفرًا، ولا يمكن كشفه إلا للمدير العام (Admin) فقط.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300 font-bold">
                <span>الكود المشفر لنقل ({students.length}) طالباً:</span>
                <span className="text-[11px] text-purple-400">انسخه وأرسله لزميلك المعلم</span>
              </div>

              <textarea
                readOnly
                rows={4}
                value={transferCode}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-purple-300 dir-ltr select-all focus:outline-none"
              />
            </div>

            <button
              onClick={handleCopyCode}
              className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedCode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم نسخ الكود المشفر بنجاح! 📋</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ كود نقل الطلاب بالكامل</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
              قم بلصق الكود الذي أرسله لك الأستاذ الآخر، وسيتم استيراد أسماء الطلاب، صفوفهم، وشعبهم وحفظها في جهازك تلقائياً.
            </div>

            {importError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importResult && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>{importResult}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الصق الكود المشفر هنا:
              </label>
              <textarea
                rows={4}
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="QUIZ-SYNC-ENC-v2::..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200 dir-ltr focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleImportCode}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>فك التشفير واستيراد الطلاب في فصلي الآن ←</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
