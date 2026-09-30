import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, ExternalLink, Check, Wifi, Smartphone, Radio } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  networkMode: 'wifi' | 'hotspot';
  teacherName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  networkMode,
  teacherName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-slate-100 shadow-2xl overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            {networkMode === 'wifi' ? <Wifi className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span>{networkMode === 'wifi' ? 'بث شبكة Wi-Fi المشتركة' : 'بث نقطة الاتصال (Hotspot)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">امسح الرمز للدخول للاختبار</h2>
          <p className="text-xs text-slate-400">
            اطلب من الطلاب فتح كاميرا الجوال ومسح الرمز للاتصال مباشرة بخادم المعلم ({teacherName})
          </p>
        </div>

        {/* QR Canvas Box */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-inner max-w-xs mx-auto">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>يعمل بدون إنترنت على نفس الشبكة</span>
          </div>
        </div>

        {/* URL Pill & Actions */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-800/90 border border-slate-700 rounded-xl">
            <div className="text-left font-mono text-sm text-purple-300 font-bold tracking-wide truncate dir-ltr">
              {url}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span>فتح بوابة الطالب في تبويب جديد</span>
            </a>
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
