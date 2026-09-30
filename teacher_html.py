# -*- coding: utf-8 -*-
"""
واجهة خادم المعلم - Classroom Quiz Server
مضمنة بالكامل وتعمل 100% بدون أي ملفات خارجية أو إنترنت
"""

TEACHER_TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>خادم الفصل • Classroom Quiz Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <style>
    :root {
      --primary: #8b5cf6;
      --primary-hover: #7c3aed;
      --primary-light: rgba(139, 92, 246, 0.15);
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --header-bg: #111827;
      --border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    body.light-theme {
      --bg: #f1f5f9;
      --card-bg: #ffffff;
      --header-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Cairo', sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding-bottom: 80px;
      transition: background-color 0.2s, color 0.2s;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      padding: 12px;
    }
    header {
      background: var(--header-bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 40;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header-title {
      text-align: center;
    }
    .header-title h1 {
      font-size: 15px;
      font-weight: 800;
    }
    .status-badge {
      font-size: 11px;
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 2px;
    }
    .dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      display: inline-block;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
      100% { opacity: 1; transform: scale(1); }
    }
    .icon-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 10px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 18px;
      margin-bottom: 16px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);
    }
    .broadcast-card {
      background: linear-gradient(135deg, #241547 0%, #1a1638 50%, #12182b 100%);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: white;
    }
    .ip-display {
      font-family: monospace;
      font-size: 20px;
      font-weight: 900;
      color: #e9d5ff;
      letter-spacing: 0.5px;
      direction: ltr;
      text-align: left;
      margin: 6px 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .btn-primary:hover {
      background: var(--primary-hover);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--border);
      color: var(--text);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--header-bg);
      border-top: 1px solid var(--border);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 8px 4px;
      z-index: 50;
      box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.1);
    }
    .nav-item {
      background: transparent;
      border: none;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 0;
    }
    .nav-item.active {
      color: var(--primary);
    }
    .fab {
      position: fixed;
      bottom: 75px;
      left: 20px;
      width: 52px;
      height: 52px;
      border-radius: 18px;
      background: #2563eb;
      color: white;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
      border: none;
      cursor: pointer;
      z-index: 45;
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 24px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      color: var(--text);
    }
    .form-group {
      margin-bottom: 14px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 6px;
      color: var(--text-muted);
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-size: 13px;
      outline: none;
    }
    .color-dot {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      display: inline-block;
      margin: 0 4px;
    }
    .color-dot.active {
      border-color: white;
      transform: scale(1.1);
    }
    .qr-container {
      background: white;
      padding: 16px;
      border-radius: 16px;
      display: inline-block;
      margin: 12px auto;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <button class="icon-btn" onclick="openTeacherSetup()">☰ القائمة</button>
    <div class="header-title">
      <h1 id="teacher-header-name">خادم الفصل • أ. أحمد صبري</h1>
      <div class="status-badge">
        <span class="dot"></span>
        <span id="network-badge-text">نشط: شبكة Wi-Fi المشتركة</span>
      </div>
    </div>
    <div style="display: flex; gap: 6px;">
      <button class="icon-btn" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #f87171;" onclick="openAdminPrompt()" title="لوحة المدير العام">🛡️</button>
      <button class="icon-btn" onclick="toggleTheme()" title="الوضع الليلي / النهاري">🌙</button>
      <button class="icon-btn" style="background: var(--primary); color: white;" onclick="openQRModal()" title="رمز QR">📱 QR</button>
    </div>
  </header>

  <div class="container">
    <!-- Server Switch Card -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 12px; border-radius: 16px; font-size: 20px;">📶</div>
          <div>
            <h2 style="font-size: 15px; font-weight: 800;" id="server-status-text">خادم الحصة يعمل (نشط)</h2>
            <p style="font-size: 11px; color: var(--text-muted);" id="server-network-desc">مشاركة عبر راوتر المدرسة/المنزل</p>
          </div>
        </div>
        <input type="checkbox" id="server-toggle" checked style="width: 22px; height: 22px; accent-color: #10b981;" onchange="toggleServerActive(this.checked)">
      </div>

      <div class="grid-2" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border);">
        <button class="btn btn-primary" id="btn-mode-wifi" onclick="setNetworkMode('wifi')">📶 شبكة Wi-Fi</button>
        <button class="btn btn-secondary" id="btn-mode-hotspot" onclick="setNetworkMode('hotspot')">📡 هوتسبوت</button>
      </div>
    </div>

    <!-- Broadcast Card -->
    <div class="card broadcast-card">
      <div style="font-size: 12px; opacity: 0.9;">رابط دخول الطلاب (انسخه أو شاركه للطلاب):</div>
      <div class="ip-display" id="student-url-display">http://__LOCAL_IP__:__PORT__/student</div>
      <div style="font-size: 11px; opacity: 0.7; direction: ltr; text-align: left;">رابط مباشر: http://school.local:__PORT__/student</div>

      <div class="grid-2" style="margin-top: 14px;">
        <button class="btn btn-primary" onclick="openQRModal()">📱 عرض QR كبير</button>
        <button class="btn btn-secondary" style="background: rgba(0,0,0,0.3); color: white;" onclick="window.open('/student', '_blank')">👨‍🎓 معاينة بوابة الطالب</button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px;">
        <span onclick="copyStudentLink()" style="cursor: pointer;">📋 نسخ الرابط</span>
        <span onclick="openEncryptedTransfer()" style="cursor: pointer; color: #a78bfa; font-weight: bold;">🔐 نقل بيانات الطلاب مشفر</span>
      </div>
    </div>

    <!-- VIEW 1: QUIZZES TAB -->
    <div id="tab-quizzes">
      <div id="quizzes-container"></div>
    </div>

    <!-- VIEW 2: STUDENTS TAB -->
    <div id="tab-students" style="display: none;">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 14px; font-weight: 800;">قائمة الطلاب المسجلين والدرجات</h3>
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="openEncryptedTransfer()">🔐 كود النقل المشفر</button>
        </div>
        <input type="text" id="student-search" placeholder="بحث عن اسم طالب، فصل..." oninput="renderStudents()" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; color: var(--text); font-size: 12px; margin-bottom: 12px;">
        <div id="students-list"></div>
      </div>
    </div>

    <!-- VIEW 3: SUBMISSIONS TAB -->
    <div id="tab-submissions" style="display: none;">
      <div class="card">
        <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 12px;">سجل تسليمات الاختبارات</h3>
        <div id="submissions-list"></div>
      </div>
    </div>

    <!-- VIEW 4: LIVE LOGS TAB -->
    <div id="tab-logs" style="display: none;">
      <div class="card">
        <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 12px;">🟢 سجل النشاط المباشر في الفصل</h3>
        <div id="logs-list"></div>
      </div>
    </div>
  </div>

  <!-- FAB (+) Button to create quiz -->
  <button class="fab" onclick="openCreateQuizModal()" title="إنشاء اختبار جديد">+</button>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <button class="nav-item active" id="nav-btn-quizzes" onclick="switchTab('quizzes')">
      <span>❓</span>
      <span>الاختبارات</span>
    </button>
    <button class="nav-item" id="nav-btn-students" onclick="switchTab('students')">
      <span>👥</span>
      <span>الطلاب</span>
    </button>
    <button class="nav-item" id="nav-btn-submissions" onclick="switchTab('submissions')">
      <span>📋</span>
      <span>التسليمات</span>
    </button>
    <button class="nav-item" id="nav-btn-logs" onclick="switchTab('logs')">
      <span>📶</span>
      <span>البث والشبكة</span>
    </button>
  </nav>

  <!-- QR Code Modal -->
  <div class="modal-overlay" id="qr-modal">
    <div class="modal" style="text-align: center;">
      <h3 style="font-size: 16px; font-weight: 800;">امسح رمز الـ QR للدخول للاختبار</h3>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">وجه كاميرا الجوال للرمز للاتصال فوراً بخادم المعلم</p>
      
      <div class="qr-container">
        <div id="qrcode-box"></div>
      </div>

      <div class="ip-display" id="qr-url-text" style="font-size: 14px; text-align: center; color: var(--primary);"></div>

      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-primary" style="flex: 1;" onclick="copyStudentLink()">نسخ الرابط 📋</button>
        <button class="btn btn-secondary" onclick="closeModal('qr-modal')">إغلاق</button>
      </div>
    </div>
  </div>

  <!-- Encrypted Transfer Modal -->
  <div class="modal-overlay" id="transfer-modal">
    <div class="modal">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 6px;">🔐 سحب ونقل بيانات الطلاب المشفر</h3>
      <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px;">مشاركة بيانات الفصل مع معلم آخر مع حماية خصوصية الهويات الوطنية للمدير فقط.</p>

      <div style="margin-bottom: 12px;">
        <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">كود النقل المشفر (انسخه وشاركه مع الأستاذ الآخر):</label>
        <textarea id="transfer-export-code" readonly rows="3" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; font-family: monospace; font-size: 11px; color: #a78bfa; direction: ltr;"></textarea>
        <button class="btn btn-primary" style="width: 100%; margin-top: 6px;" onclick="copyTransferCode()">نسخ كود الطلاب بالكامل 📋</button>
      </div>

      <div style="border-top: 1px solid var(--border); padding-top: 12px; margin-top: 14px;">
        <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">استيراد طلاب من أستاذ آخر (الصق الكود هنا):</label>
        <textarea id="transfer-import-code" rows="2" placeholder="الصق الكود المشفر هنا..." style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; font-family: monospace; font-size: 11px; color: white; direction: ltr;"></textarea>
        <button class="btn btn-secondary" style="width: 100%; margin-top: 6px; background: #059669; color: white;" onclick="importTransferCode()">استيراد وحفظ في فصلي 📥</button>
      </div>

      <button class="btn btn-secondary" style="width: 100%; margin-top: 12px;" onclick="closeModal('transfer-modal')">إغلاق النافذة</button>
    </div>
  </div>

  <!-- Teacher Setup Modal -->
  <div class="modal-overlay" id="teacher-setup-modal">
    <div class="modal">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">إعدادات خادم المعلم</h3>
      <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">التحكم في بيانات الأستاذ والمظهر ولون السمة</p>
      
      <form onsubmit="saveTeacherSettings(event)">
        <div class="form-group">
          <label>اسم الأستاذ الكامل: *</label>
          <input type="text" id="setup-teacher-name" required placeholder="مثال: أ. أحمد صبري">
        </div>
        <div class="form-group">
          <label>المادة التي يدرسها: *</label>
          <input type="text" id="setup-teacher-subject" required placeholder="مثال: فيزياء ثانوي">
        </div>
        <div class="form-group">
          <label>رقم هاتف المعلم للتواصل:</label>
          <input type="text" id="setup-teacher-phone" placeholder="مثال: 0533333333">
        </div>

        <div class="form-group">
          <label>لون السمة الأساسي:</label>
          <div style="text-align: center; margin-top: 6px;">
            <span class="color-dot" style="background: #8b5cf6;" onclick="setThemeAccent('purple')"></span>
            <span class="color-dot" style="background: #3b82f6;" onclick="setThemeAccent('blue')"></span>
            <span class="color-dot" style="background: #10b981;" onclick="setThemeAccent('emerald')"></span>
            <span class="color-dot" style="background: #f59e0b;" onclick="setThemeAccent('amber')"></span>
            <span class="color-dot" style="background: #f43f5e;" onclick="setThemeAccent('ruby')"></span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 18px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">حفظ التعديلات</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('teacher-setup-modal')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Create Quiz Modal -->
  <div class="modal-overlay" id="create-quiz-modal">
    <div class="modal">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">إنشاء اختبار جديد للحصة</h3>
      <form onsubmit="saveNewQuiz(event)">
        <div class="form-group">
          <label>عنوان الاختبار أو النشاط: *</label>
          <input type="text" id="new-quiz-title" required placeholder="مثال: اختبار فيزياء قصير - قوانين الحركة">
        </div>
        <div class="form-group">
          <label>نوع الاختبار:</label>
          <select id="new-quiz-type">
            <option value="quiz">اختبار تقييمي 📝</option>
            <option value="activity">نشاط تفاعلي / لغز 💡</option>
          </select>
        </div>
        <div class="form-group">
          <label>المدة بالدقائق:</label>
          <input type="number" id="new-quiz-duration" value="10" min="1" max="120">
        </div>
        <div class="form-group">
          <label>السؤال الأول: *</label>
          <input type="text" id="new-q1-text" required placeholder="اكتب نص السؤال هنا...">
        </div>
        <div class="form-group">
          <label>الخيارات (حدد الخيار الصحيح برقم الخيار):</label>
          <input type="text" id="new-q1-opt0" placeholder="الخيار A (الصحيح)" style="margin-bottom: 4px;" required>
          <input type="text" id="new-q1-opt1" placeholder="الخيار B" style="margin-bottom: 4px;" required>
          <input type="text" id="new-q1-opt2" placeholder="الخيار C" style="margin-bottom: 4px;">
          <input type="text" id="new-q1-opt3" placeholder="الخيار D">
        </div>

        <div style="display: flex; gap: 8px; margin-top: 18px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">نشر الاختبار للطلاب</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('create-quiz-modal')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let appState = {
      teacher: { name: 'أ. أحمد صبري', subject: 'فيزياء ثانوي', phone: '0533333333', theme: 'purple', darkMode: true },
      quizzes: [],
      students: [],
      submissions: [],
      logs: []
    };

    let currentIP = "__LOCAL_IP__";
    let currentPort = "__PORT__";
    let studentURL = "http://" + currentIP + ":" + currentPort + "/student";
    let isAdminUnlocked = false;

    async function loadState() {
      try {
        let res = await fetch('/api/state');
        if (res.ok) {
          appState = await res.json();
          renderAll();
        }
      } catch (err) {
        console.error("Load state error:", err);
      }
    }

    function renderAll() {
      if (appState.teacher && appState.teacher.name) {
        document.getElementById('teacher-header-name').innerText = "خادم الفصل • " + appState.teacher.name;
      }
      document.getElementById('student-url-display').innerText = studentURL;
      document.getElementById('qr-url-text').innerText = studentURL;
      renderQuizzes();
      renderStudents();
      renderSubmissions();
      renderLogs();
    }

    function renderQuizzes() {
      let box = document.getElementById('quizzes-container');
      if (!appState.quizzes || appState.quizzes.length === 0) {
        box.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted);">لا توجد اختبارات منشأة بعد. اضغط (+) لإضافة اختبار.</div>';
        return;
      }
      box.innerHTML = appState.quizzes.map(function(q) {
        return '<div class="card">' +
          '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">' +
            '<span style="font-size: 11px; padding: 4px 10px; border-radius: 8px; background: rgba(139, 92, 246, 0.2); color: var(--primary); font-weight: 700;">' +
              (q.type === 'activity' ? 'نشاط تفاعلي 💡' : 'اختبار تقييمي 📝') +
            '</span>' +
            '<span style="font-size: 11px; color: ' + (q.isOpen ? '#10b981' : '#ef4444') + ';">' + (q.isOpen ? 'مفتوح للطلاب 🟢' : 'مغلق 🔒') + '</span>' +
          '</div>' +
          '<h3 style="font-size: 15px; font-weight: 800; margin-bottom: 4px;">' + q.title + '</h3>' +
          '<p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">' + (q.subtitle || q.instructions || '') + '</p>' +
          '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 10px; font-size: 12px;">' +
            '<button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;" onclick="toggleQuizOpen(\'' + q.id + '\', ' + (!q.isOpen) + ')">' +
              (q.isOpen ? 'إغلاق الاختبار 🔒' : 'فتح الاختبار 🟢') +
            '</button>' +
            '<span style="color: var(--text-muted);">⏱️ ' + q.durationMinutes + ' دقيقة | ❓ ' + (q.questions ? q.questions.length : 0) + ' أسئلة</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderStudents() {
      let q = document.getElementById('student-search').value.trim().toLowerCase();
      let box = document.getElementById('students-list');
      let filtered = (appState.students || []).filter(function(s) {
        return s.name.toLowerCase().includes(q) || (s.nationalId && s.nationalId.includes(q));
      });
      if (filtered.length === 0) {
        box.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px;">لا يوجد طلاب مطابقين للبحث.</p>';
        return;
      }
      box.innerHTML = filtered.map(function(s) {
        let displayId = (isAdminUnlocked)
          ? s.nationalId
          : (s.nationalId && s.nationalId.length >= 6 ? s.nationalId.slice(0, 3) + '****' + s.nationalId.slice(-2) : '••••••••••');
        let total = (s.exam1 || 0) + (s.exam2 || 0) + (s.participation || 0) + (s.extraPoints || 0);

        return '<div style="padding: 12px; border-radius: 14px; background: rgba(0,0,0,0.15); border: 1px solid var(--border); margin-bottom: 8px;">' +
          '<div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px;">' +
            '<span>' + s.name + '</span>' +
            '<span style="color: var(--primary); font-family: monospace;">هوية: ' + displayId + (isAdminUnlocked ? ' 🔓' : ' 🔒') + '</span>' +
          '</div>' +
          '<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">' + (s.gradeSection || 'أول ثانوي - شعبة 1') + ' • جوال: ' + (s.phone || 'غير مسجل') + '</div>' +
          '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; text-align: center; font-size: 10px;">' +
            '<div style="background: rgba(255,255,255,0.04); padding: 4px; border-radius: 6px;">شهري 1: ' + (s.exam1 || 0) + '</div>' +
            '<div style="background: rgba(255,255,255,0.04); padding: 4px; border-radius: 6px;">شهري 2: ' + (s.exam2 || 0) + '</div>' +
            '<div style="background: rgba(255,255,255,0.04); padding: 4px; border-radius: 6px;">مشاركة: ' + (s.participation || 0) + '</div>' +
            '<div style="background: rgba(139, 92, 246, 0.2); padding: 4px; border-radius: 6px; color: var(--primary); font-weight: 800;">المجموع: ' + total + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderSubmissions() {
      let box = document.getElementById('submissions-list');
      if (!appState.submissions || appState.submissions.length === 0) {
        box.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px;">لا توجد تسليمات حتى الآن.</p>';
        return;
      }
      box.innerHTML = appState.submissions.map(function(sub) {
        return '<div style="padding: 12px; border-radius: 12px; background: rgba(0,0,0,0.15); border: 1px solid var(--border); margin-bottom: 8px;">' +
          '<div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px;">' +
            '<span>' + sub.studentName + '</span>' +
            '<span style="color: #10b981;">%' + sub.percentage + ' (' + sub.score + '/' + sub.total + ')</span>' +
          '</div>' +
          '<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">' + sub.quizTitle + ' • ' + sub.submittedAt + '</div>' +
        '</div>';
      }).join('');
    }

    function renderLogs() {
      let box = document.getElementById('logs-list');
      if (!appState.logs || appState.logs.length === 0) {
        box.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px;">لا توجد سجلات نشاط بعد.</p>';
        return;
      }
      box.innerHTML = appState.logs.map(function(l) {
        return '<div style="padding: 8px 12px; border-radius: 10px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between;">' +
          '<span>' + l.text + '</span>' +
          '<span style="color: var(--text-muted); direction: ltr;">' + l.timestamp + '</span>' +
        '</div>';
      }).join('');
    }

    function setNetworkMode(mode) {
      if (mode === 'hotspot') {
        currentIP = "192.168.137.1";
        studentURL = "http://" + currentIP + ":" + currentPort + "/student";
        document.getElementById('student-url-display').innerText = studentURL;
        document.getElementById('qr-url-text').innerText = studentURL;
        document.getElementById('network-badge-text').innerText = "نشط: نقطة اتصال (Hotspot)";
        document.getElementById('server-network-desc').innerText = "مشاركة عبر نقطة اتصال Hotspot ويندوز (192.168.137.1)";
        document.getElementById('btn-mode-hotspot').className = 'btn btn-primary';
        document.getElementById('btn-mode-wifi').className = 'btn btn-secondary';
        alert("📡 تم تفعيل نمط نقطة الاتصال (Hotspot) بنجاح!\nالرابط للطلاب: " + studentURL);
      } else {
        currentIP = "__LOCAL_IP__";
        studentURL = "http://" + currentIP + ":" + currentPort + "/student";
        document.getElementById('student-url-display').innerText = studentURL;
        document.getElementById('qr-url-text').innerText = studentURL;
        document.getElementById('network-badge-text').innerText = "نشط: شبكة Wi-Fi المشتركة";
        document.getElementById('server-network-desc').innerText = "مشاركة عبر راوتر المدرسة/المنزل";
        document.getElementById('btn-mode-wifi').className = 'btn btn-primary';
        document.getElementById('btn-mode-hotspot').className = 'btn btn-secondary';
      }
      fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkMode: mode })
      });
    }

    function toggleServerActive(active) {
      document.getElementById('server-status-text').innerText = active ? "خادم الحصة يعمل (نشط)" : "خادم الحصة متوقف";
      fetch('/api/server/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: active })
      });
    }

    function switchTab(tabId) {
      ['quizzes', 'students', 'submissions', 'logs'].forEach(function(t) {
        document.getElementById('tab-' + t).style.display = (t === tabId) ? 'block' : 'none';
        document.getElementById('nav-btn-' + t).classList.toggle('active', t === tabId);
      });
    }

    function toggleTheme() {
      document.body.classList.toggle('light-theme');
    }

    function setThemeAccent(color) {
      const map = {
        purple: '#8b5cf6',
        blue: '#3b82f6',
        emerald: '#10b981',
        amber: '#f59e0b',
        ruby: '#f43f5e'
      };
      document.documentElement.style.setProperty('--primary', map[color] || map.purple);
    }

    let qrCodeObj = null;
    function openQRModal() {
      document.getElementById('qr-modal').classList.add('active');
      let box = document.getElementById('qrcode-box');
      box.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        qrCodeObj = new QRCode(box, {
          text: studentURL,
          width: 250,
          height: 250,
          colorDark: "#000000",
          colorLight: "#ffffff"
        });
      }
    }

    function openAdminPrompt() {
      let u = prompt("اسم مستخدم المدير (Super Admin):");
      if (!u) return;
      let p = prompt("كلمة مرور المدير (Password):");
      if (u === 'admin' && p === 'Ahmed1ggr') {
        isAdminUnlocked = true;
        alert("✓ مرحباً بك يا مدير النظام (Admin)! تم كشف الهويات الوطنية الكاملة بنجاح.");
        renderStudents();
      } else {
        alert("بيانات المدير غير صحيحة!");
      }
    }

    function openEncryptedTransfer() {
      let payload = {
        version: "2.0",
        students: appState.students || []
      };
      let code = "QUIZ-SYNC-ENC-v2::" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      document.getElementById('transfer-export-code').value = code;
      document.getElementById('transfer-modal').classList.add('active');
    }

    function copyTransferCode() {
      let el = document.getElementById('transfer-export-code');
      el.select();
      navigator.clipboard.writeText(el.value);
      alert("تم نسخ كود الطلاب المشفر بنجاح! 📋");
    }

    async function importTransferCode() {
      let raw = document.getElementById('transfer-import-code').value.trim();
      if (!raw) {
        alert("يرجى لصق الكود أولاً");
        return;
      }
      try {
        let b64 = raw.includes('::') ? raw.split('::')[1] : raw;
        let parsed = JSON.parse(decodeURIComponent(escape(atob(b64))));
        let stds = parsed.students || [];
        await fetch('/api/students/import-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: stds })
        });
        alert("✓ تم استيراد بيانات (" + stds.length + ") طالباً بنجاح!");
        closeModal('transfer-modal');
        loadState();
      } catch (err) {
        alert("الكود غير صحيح أو تالف!");
      }
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('active');
    }

    function copyStudentLink() {
      navigator.clipboard.writeText(studentURL);
      alert("تم نسخ رابط دخول الطلاب بنجاح:\\n" + studentURL);
    }

    function openTeacherSetup() {
      document.getElementById('setup-teacher-name').value = (appState.teacher && appState.teacher.name) || '';
      document.getElementById('setup-teacher-subject').value = (appState.teacher && appState.teacher.subject) || '';
      document.getElementById('setup-teacher-phone').value = (appState.teacher && appState.teacher.phone) || '';
      document.getElementById('teacher-setup-modal').classList.add('active');
    }

    function openCreateQuizModal() {
      document.getElementById('create-quiz-modal').classList.add('active');
    }

    async function saveTeacherSettings(e) {
      e.preventDefault();
      let name = document.getElementById('setup-teacher-name').value.trim();
      let subject = document.getElementById('setup-teacher-subject').value.trim();
      let phone = document.getElementById('setup-teacher-phone').value.trim();
      await fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, subject: subject, phone: phone })
      });
      closeModal('teacher-setup-modal');
      loadState();
    }

    async function saveNewQuiz(e) {
      e.preventDefault();
      let title = document.getElementById('new-quiz-title').value.trim();
      let type = document.getElementById('new-quiz-type').value;
      let duration = Number(document.getElementById('new-quiz-duration').value) || 10;
      let qText = document.getElementById('new-q1-text').value.trim();
      let opts = [
        document.getElementById('new-q1-opt0').value.trim(),
        document.getElementById('new-q1-opt1').value.trim(),
        document.getElementById('new-q1-opt2').value.trim(),
        document.getElementById('new-q1-opt3').value.trim()
      ].filter(Boolean);

      let newQ = {
        title: title,
        type: type,
        durationMinutes: duration,
        questions: [{
          id: 'q-' + Date.now(),
          type: 'mcq',
          text: qText,
          options: opts,
          correctIndex: 0
        }]
      };

      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });

      closeModal('create-quiz-modal');
      loadState();
    }

    async function toggleQuizOpen(id, isOpen) {
      await fetch('/api/quizzes/' + id + '/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: isOpen })
      });
      loadState();
    }

    // Initial load and periodic sync every 3 seconds
    loadState();
    setInterval(loadState, 3000);
  </script>
</body>
</html>"""

def get_teacher_html(local_ip, port):
    return TEACHER_TEMPLATE.replace('__LOCAL_IP__', str(local_ip)).replace('__PORT__', str(port))
