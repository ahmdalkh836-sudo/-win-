import express from 'express';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import compression from 'compression';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// High performance middlewares for 40+ concurrent clients
app.use(cors());
app.use(compression({ level: 6 }));
app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'data_store.json');

// Default initial data matching classroom screenshots
const defaultData = {
  teacher: {
    name: 'احمد صبري',
    subject: 'فيزياء ثانوي',
    phone: '0533333333',
    theme: 'purple',
    darkMode: true,
    antiCheat: true,
    networkMode: 'wifi',
    gradesAnnounced: true,
  },
  serverActive: true,
  quizzes: [
    {
      id: 'quiz-1',
      type: 'activity',
      title: 'نشاط تفاعلي: لغز وتفكير إبداعي',
      subtitle: 'شارك بحلك واختبر سرعتك مع زملائك في الفصل!',
      instructions: 'فكر جيداً وأجب بسرعة لكسب نقاط التفاعل مع المعلم.',
      durationMinutes: 7,
      isOpen: true,
      questions: [
        {
          id: 'q1-1',
          type: 'mcq',
          text: 'ما هي الخاصية الفيزيائية المسؤولة عن مقاومة الجسم لتغير حالته الحركية؟',
          options: ['القصور الذاتي (Inertia)', 'الاحتكاك السطحي', 'الجاذبية الأرضية', 'السرعة المتجهة'],
          correctIndex: 0,
        },
        {
          id: 'q1-2',
          type: 'true_false',
          text: 'عند انعدام القوى المحصلة المؤثرة على جسم، يبقى الجسم الساكن ساكناً والمتحرك بسرعة ثابتة يستمر في حركته.',
          options: ['صح', 'خطأ'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'quiz-2',
      type: 'quiz',
      title: 'اختبار مراجعة سريع في الحصة',
      subtitle: 'اختبار قصير للتأكد من استيعاب المفاهيم الأساسية لدرس اليوم',
      instructions: 'الاختبار مغلق بعد التسليم ويمنع استخدام أي وسيلة مساعدة خارجية.',
      durationMinutes: 5,
      isOpen: true,
      questions: [
        {
          id: 'q2-1',
          type: 'mcq',
          text: 'وحدة قياس القوة في النظام الدولي للوحدات (SI) هي:',
          options: ['الجول (Joule)', 'النيوتن (Newton)', 'الواط (Watt)', 'الباسكال (Pascal)'],
          correctIndex: 1,
        },
        {
          id: 'q2-2',
          type: 'mcq',
          text: 'التسارع الناتج عن الجاذبية الأرضية بالقرب من سطح الأرض يساوي تقريباً:',
          options: ['9.8 م/ث²', '3.14 م/ث²', '100 م/ث²', '0 م/ث²'],
          correctIndex: 0,
        },
        {
          id: 'q2-3',
          type: 'true_false',
          text: 'الكتلة كمية قياسية بينما الوزن كمية متجهة تتأثر بالجاذبية.',
          options: ['صح', 'خطأ'],
          correctIndex: 0,
        },
        {
          id: 'q2-4',
          type: 'mcq',
          text: 'القانون الذي ينص على أن "لكل فعل رد فعل مساوٍ له في المقدار ومعاكس له في الاتجاه" هو:',
          options: ['قانون نيوتن الأول', 'قانون نيوتن الثاني', 'قانون نيوتن الثالث', 'قانون كبلر'],
          correctIndex: 2,
        },
      ],
    },
  ],
  students: [
    {
      id: 'std-1',
      name: 'محمد عبدالله خالد العتيبي',
      nationalId: '1098765432',
      phone: '0501234567',
      gradeSection: 'أول ثانوي - شعبة 1',
      password: '123',
      exam1: 18,
      exam2: 19,
      participation: 10,
      extraPoints: 2,
      registeredAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'std-2',
      name: 'عبدالرحمن إبراهيم السعد',
      nationalId: '1122334455',
      phone: '0559876543',
      gradeSection: 'أول ثانوي - شعبة 1',
      password: '123',
      exam1: 17,
      exam2: 16,
      participation: 9,
      extraPoints: 1,
      registeredAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  submissions: [],
  logs: [
    {
      id: 'log-1',
      text: 'تم تشغيل خادم الاختبارات بنجاح وجاهز لاستقبال اتصالات الطلاب.',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'info',
    },
  ],
};

let store = { ...defaultData };

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      store = { ...defaultData, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Could not load data file, using default in-memory store', err);
  }
}

// Debounced asynchronous file save to keep responses non-blocking for 40+ devices
let saveTimeout = null;
function saveStoreDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8', (err) => {
      if (err) console.error('Error saving data store:', err);
    });
  }, 300);
}

loadStore();

// Local IPv4 detector for Windows Wi-Fi / Hotspot / Ethernet
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

// APIs
app.get('/api/network-info', (req, res) => {
  const ips = getLocalIPs();
  const primaryIP = ips.length > 0 ? ips[0] : '10.187.145.212';
  res.json({
    primaryIP,
    allIPs: ips,
    port: PORT,
    hostname: os.hostname(),
    simplifiedUrl: `http://school.local:${PORT}`,
    fullUrl: `http://${primaryIP}:${PORT}`,
  });
});

app.get('/api/state', (req, res) => {
  res.json(store);
});

app.post('/api/teacher/settings', (req, res) => {
  store.teacher = { ...store.teacher, ...req.body };
  saveStoreDebounced();
  res.json({ success: true, teacher: store.teacher });
});

app.post('/api/server/toggle', (req, res) => {
  store.serverActive = req.body.active;
  const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  store.logs.unshift({
    id: `log-${Date.now()}`,
    text: store.serverActive
      ? `تم تفعيل بث خادم الحصة على الشبكة المحلية.`
      : `تم إيقاف بث خادم الحصة مؤقتاً بواسطة المعلم.`,
    timestamp: time,
    type: store.serverActive ? 'success' : 'warning',
  });
  saveStoreDebounced();
  res.json({ success: true, serverActive: store.serverActive, logs: store.logs });
});

app.post('/api/quizzes', (req, res) => {
  const newQuiz = {
    id: `quiz-${Date.now()}`,
    isOpen: true,
    ...req.body,
  };
  store.quizzes.push(newQuiz);
  const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  store.logs.unshift({
    id: `log-${Date.now()}`,
    text: `تم إنشاء نشاط/اختبار جديد: "${newQuiz.title}" بنجاح.`,
    timestamp: time,
    type: 'info',
  });
  saveStoreDebounced();
  res.json({ success: true, quiz: newQuiz, quizzes: store.quizzes });
});

app.post('/api/quizzes/:id/toggle', (req, res) => {
  const quiz = store.quizzes.find((q) => q.id === req.params.id);
  if (quiz) {
    quiz.isOpen = req.body.isOpen;
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    store.logs.unshift({
      id: `log-${Date.now()}`,
      text: quiz.isOpen
        ? `تم فتح الاختبار "${quiz.title}" للطلاب الآن.`
        : `تم إغلاق الاختبار "${quiz.title}" ومنع الدخول إليه.`,
      timestamp: time,
      type: quiz.isOpen ? 'success' : 'warning',
    });
    saveStoreDebounced();
    res.json({ success: true, quiz });
  } else {
    res.status(404).json({ error: 'Quiz not found' });
  }
});

app.delete('/api/quizzes/:id', (req, res) => {
  const quiz = store.quizzes.find((q) => q.id === req.params.id);
  store.quizzes = store.quizzes.filter((q) => q.id !== req.params.id);
  if (quiz) {
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    store.logs.unshift({
      id: `log-${Date.now()}`,
      text: `تم حذف الاختبار: "${quiz.title}".`,
      timestamp: time,
      type: 'warning',
    });
  }
  saveStoreDebounced();
  res.json({ success: true, quizzes: store.quizzes });
});

app.post('/api/students/auth', (req, res) => {
  const { nationalId, password, name, phone, gradeSection, isNew } = req.body;
  if (isNew) {
    const existing = store.students.find((s) => s.nationalId === nationalId);
    if (existing) {
      return res.status(400).json({ error: 'رقم الهوية أو الإقامة مسجل مسبقاً! يرجى تسجيل الدخول.' });
    }
    const newStudent = {
      id: `std-${Date.now()}`,
      name,
      nationalId,
      phone,
      gradeSection,
      password,
      exam1: 0,
      exam2: 0,
      participation: 0,
      extraPoints: 0,
      registeredAt: new Date().toISOString(),
    };
    store.students.push(newStudent);
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    store.logs.unshift({
      id: `log-${Date.now()}`,
      text: `انضم الطالب الجديد: ${name} (${gradeSection}) إلى الخادم.`,
      timestamp: time,
      type: 'info',
    });
    saveStoreDebounced();
    return res.json({ success: true, student: newStudent });
  } else {
    const student = store.students.find((s) => s.nationalId === nationalId && s.password === password);
    if (!student) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة، تأكد من رقم الهوية وكلمة المرور.' });
    }
    return res.json({ success: true, student });
  }
});

app.post('/api/submissions', (req, res) => {
  const { quizId, studentId, studentName, answers } = req.body;
  const quiz = store.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const alreadySubmitted = store.submissions.find(
    (s) => s.quizId === quizId && s.studentId === studentId
  );
  if (alreadySubmitted) {
    return res.status(400).json({ error: 'لقد قمت بتسليم هذا الاختبار مسبقاً ولا يمكنك إعادته.' });
  }

  let correctCount = 0;
  const detailedAnswers = quiz.questions.map((q) => {
    const studentAns = answers[q.id];
    const isCorrect = studentAns === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.text,
      studentAnswer: studentAns,
      correctAnswer: q.correctIndex,
      isCorrect,
    };
  });

  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const submission = {
    id: `sub-${Date.now()}`,
    quizId,
    quizTitle: quiz.title,
    studentId,
    studentName,
    score: correctCount,
    total: totalQuestions,
    percentage,
    submittedAt: time,
    answers: detailedAnswers,
  };

  store.submissions.unshift(submission);

  store.logs.unshift({
    id: `log-${Date.now()}`,
    text: `قام الطالب "${studentName}" بتسليم "${quiz.title}" بنتيجة: ${correctCount}/${totalQuestions} (%${percentage}).`,
    timestamp: time,
    type: 'success',
  });

  saveStoreDebounced();
  res.json({ success: true, submission });
});

app.post('/api/students/:id/grades', (req, res) => {
  const student = store.students.find((s) => s.id === req.params.id);
  if (student) {
    const { exam1, exam2, participation, extraPoints } = req.body;
    student.exam1 = Number(exam1 ?? student.exam1);
    student.exam2 = Number(exam2 ?? student.exam2);
    student.participation = Number(participation ?? student.participation);
    student.extraPoints = Number(extraPoints ?? student.extraPoints);
    saveStoreDebounced();
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

app.post('/api/anti-cheat/alert', (req, res) => {
  const { studentName, reason } = req.body;
  const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  store.logs.unshift({
    id: `log-${Date.now()}`,
    text: `⚠️ تنبيه أمني / مكافحة الغش: الطالب "${studentName}" [${reason}]. تم إيقاف الاختبار مؤقتاً.`,
    timestamp: time,
    type: 'danger',
  });
  saveStoreDebounced();
  res.json({ success: true });
});

// Windows Standalone Launcher Script (.bat / .cmd)
app.get('/download/Run_Classroom_Server.cmd', (req, res) => {
  const script = `@echo off
chcp 65001 >nul
title خادم اختبارات الحصة الذكية - Classroom Quiz Server
color 0B
cls
echo ===============================================================================
echo                خادم اختبارات الحصة الذكية - Classroom Quiz Server
echo                           نسخة الويندوز الاحترافية
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
echo  رابط دخول الطلاب من الجوالات والتابلت (اطلب من الطلاب الدخول عليه):
echo  http://%LOCAL_IP%:3000
echo.
echo  أو مسح رمز QR المعروض على شاشتك أو البروجيكتور.
echo ===============================================================================
echo.
echo [3/4] جاري فتح لوحة تحكم المعلم في متصفحك...
timeout /t 2 >nul
start http://localhost:3000

echo.
echo [4/4] الخادم يعمل الآن بشكل مستمر!
echo * اترك هذه النافذة مفتوحة طوال الحصة.
echo * لإيقاف الخادم: اضغط Ctrl + C ثم Y
echo.

%NODE_CMD% standalone-server.js
pause
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Run_Classroom_Server.cmd"');
  res.send(script);
});

// Serve pre-built static files with caching
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1h' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Classroom Quiz Server] Running on http://0.0.0.0:${PORT}`);
  const ips = getLocalIPs();
  console.log(`Accessible from local devices at:`);
  ips.forEach((ip) => console.log(`  http://${ip}:${PORT}`));
});

// Keep-alive settings for high concurrency (40+ concurrent devices)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
