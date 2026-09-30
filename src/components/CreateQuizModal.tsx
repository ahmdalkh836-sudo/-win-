import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import { Quiz, Question } from '../types';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Omit<Quiz, 'id' | 'isOpen'>) => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<'quiz' | 'activity'>('quiz');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      type: 'mcq',
      text: '',
      options: ['الخيار (A)', 'الخيار (B)', 'الخيار (C)', 'الخيار (D)'],
      correctIndex: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        type: 'mcq',
        text: '',
        options: ['الخيار (A)', 'الخيار (B)', 'الخيار (C)', 'الخيار (D)'],
        correctIndex: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTypeChange = (idx: number, newType: 'mcq' | 'true_false' | 'essay') => {
    const updated = [...questions];
    updated[idx].type = newType;
    if (newType === 'true_false') {
      updated[idx].options = ['صح', 'خطأ'];
      updated[idx].correctIndex = 0;
    } else if (newType === 'mcq' && updated[idx].options.length < 2) {
      updated[idx].options = ['الخيار (A)', 'الخيار (B)', 'الخيار (C)', 'الخيار (D)'];
      updated[idx].correctIndex = 0;
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة عنوان الاختبار أو النشاط');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        alert(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
    }

    onSave({
      type,
      title: title.trim(),
      subtitle: type === 'activity' ? 'شارك بحلك واختبر سرعتك مع زملائك في الفصل!' : 'اختبار قصير للتأكد من استيعاب المفاهيم الأساسية',
      instructions: instructions.trim(),
      durationMinutes: Number(durationMinutes) || 10,
      questions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">إنشاء اختبار جديد للحصة</h2>
          <div className="w-5" />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('quiz')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'quiz'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>اختبار / تقييم</span>
              <span>📝</span>
            </button>
            <button
              type="button"
              onClick={() => setType('activity')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'activity'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>نشاط / مشاركة</span>
              <span>💡</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              عنوان الاختبار أو النشاط *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: اختبار فيزياء - قوانين نيوتن للحركة"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              تعليمات للطلاب (اختياري)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="مثال: يرجى التركيز وعدم مغادرة شاشة الاختبار نهائياً"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مدة الاختبار (بالدقائق)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
            />
          </div>

          {/* Questions Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-purple-300">
                الأسئلة ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سؤال</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-950/90 border border-slate-800/80 rounded-2xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">
                      سؤال رقم {qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="حذف هذا السؤال"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Question Type selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handleQuestionTypeChange(qIdx, 'mcq')}
                      className={`py-1.5 rounded-lg transition-all ${
                        q.type === 'mcq'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      اختيار من متعدد
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuestionTypeChange(qIdx, 'true_false')}
                      className={`py-1.5 rounded-lg transition-all ${
                        q.type === 'true_false'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      صح أم خطأ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuestionTypeChange(qIdx, 'essay')}
                      className={`py-1.5 rounded-lg transition-all ${
                        q.type === 'essay'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      سؤال مقالي / نشاط
                    </button>
                  </div>

                  {/* Question Text */}
                  <div>
                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].text = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="نص السؤال *"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Options */}
                  {q.type !== 'essay' && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>الخيارات (حدد الخيار الصحيح بالدائرة):</span>
                      </div>
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            q.correctIndex === optIdx
                              ? 'bg-purple-900/20 border-purple-500/60'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => {
                              const updated = [...questions];
                              updated[qIdx].correctIndex = optIdx;
                              setQuestions(updated);
                            }}
                            className="w-4 h-4 text-purple-600 accent-purple-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt}
                            disabled={q.type === 'true_false'}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`الخيار (${String.fromCharCode(65 + optIdx)})`}
                            className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none"
                          />
                          {q.correctIndex === optIdx && (
                            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              حفظ الاختبار ونشره في الفصل ←
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-2xl transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
