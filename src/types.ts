export type ThemeAccent = 'purple' | 'blue' | 'emerald' | 'amber' | 'ruby';

export interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'essay';
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  type: 'activity' | 'quiz';
  title: string;
  subtitle?: string;
  instructions?: string;
  durationMinutes: number;
  isOpen: boolean;
  questions: Question[];
}

export interface Student {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  gradeLevel: 'first' | 'second' | 'third'; // أول ثانوي | ثاني ثانوي | ثالث ثانوي
  section: '1' | '2' | '3' | '4'; // شعبة 1 إلى 4
  gradeSection: string;
  password?: string;
  exam1: number;
  exam2: number;
  participation: number;
  extraPoints: number;
  registeredAt: string;
}

export interface DetailedAnswer {
  questionId: string;
  questionText: string;
  studentAnswer: number | string;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface Submission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
  answers: DetailedAnswer[];
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface SecuritySettings {
  enabled: boolean;
  blockAppSwitch: boolean;
  blockCopyPaste: boolean;
  enforceFullscreen: boolean;
  maxViolations: number;
  blockExternalNet: boolean;
}

export interface ConnectedDevice {
  id: string;
  studentId?: string;
  studentName: string;
  ip: string;
  deviceType: string;
  status: 'online' | 'in_quiz' | 'blocked';
  lastSeen: string;
  violationsCount: number;
}

export interface TeacherSettings {
  username: string;
  name: string;
  subject: string;
  phone: string;
  password?: string;
  isConfigured: boolean;
  theme: ThemeAccent;
  darkMode: boolean;
  antiCheat: boolean;
  security: SecuritySettings;
  networkMode: 'wifi' | 'hotspot';
  hotspotIP?: string;
  gradesAnnounced: boolean;
}

export interface NetworkInfo {
  primaryIP: string;
  allIPs: string[];
  port: number | string;
  hostname: string;
  simplifiedUrl: string;
  fullUrl: string;
}
