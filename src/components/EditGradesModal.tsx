import React, { useState } from 'react';
import { X, Save, User, Award } from 'lucide-react';
import { Student } from '../types';

interface EditGradesModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, updatedGrades: { exam1: number; exam2: number; participation: number; extraPoints: number }) => void;
}

export const EditGradesModal: React.FC<EditGradesModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !student) return null;

  const [exam1, setExam1] = useState(student.exam1);
  const [exam2, setExam2] = useState(student.exam2);
  const [participation, setParticipation] = useState(student.participation);
  const [extraPoints, setExtraPoints] = useState(student.extraPoints);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, {
      exam1: Number(exam1),
      exam2: Number(exam2),
      participation: Number(participation),
      extraPoints: Number(extraPoints),
    });
    onClose();
  };

  const total = Number(exam1) + Number(exam2) + Number(participation) + Number(extraPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h3 className="text-sm font-bold text-white">تعديل درجات الطالب</h3>
            <p className="text-xs text-purple-400 font-semibold">{student.name}</p>
          </div>
          <div className="w-5" />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الاختبار الشهري الأول (من 20)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={exam1}
              onChange={(e) => setExam1(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الاختبار الشهري الثاني (من 20)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={exam2}
              onChange={(e) => setExam2(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              درجات المشاركة والتفاعل (من 10)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={participation}
              onChange={(e) => setParticipation(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              نقاط إضافية / خصم
            </label>
            <input
              type="number"
              min="-20"
              max="50"
              value={extraPoints}
              onChange={(e) => setExtraPoints(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          {/* Cumulative preview */}
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">المجموع التراكمي الجديد:</span>
            <span className="text-lg font-black font-mono text-white">{total}</span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
            >
              حفظ الدرجات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
