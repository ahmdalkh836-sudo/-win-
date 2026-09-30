# -*- coding: utf-8 -*-
"""
واجهة بوابة الطالب - Smart Classroom Student Portal
مضمنة بالكامل وتعمل 100% بدون أي ملفات خارجية أو إنترنت
"""

def get_student_html(local_ip, port):
    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>بوابة اختبارات الحصة الذكية</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
    }}
    body.dark-theme {{
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Cairo', sans-serif;
    }}
    body {{
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding-bottom: 70px;
      transition: background-color 0.2s, color 0.2s;
    }}
    header {{
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #4338ca 100%);
      color: white;
      padding: 14px 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 40;
    }}
    .header-content {{
      max-width: 550px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .container {{
      max-width: 550px;
      margin: 0 auto;
      padding: 16px;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 18px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      width: 100%;
      transition: all 0.15s;
    }}
    .btn-primary {{
      background: #2563eb;
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }}
    .form-group {{
      margin-bottom: 14px;
    }}
    .form-group label {{
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 6px;
      color: var(--text-muted);
    }}
    .form-group input {{
      width: 100%;
      padding: 11px 14px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-size: 13px;
      outline: none;
    }}
    .selector-grid {{
      display: grid;
      gap: 8px;
    }}
    .selector-btn {{
      padding: 8px 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }}
    .selector-btn.selected {{
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }}
    .tabs-nav {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 16px;
      margin-bottom: 16px;
    }}
    .tab-btn {{
      padding: 10px 4px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }}
    .tab-btn.active {{
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.2);
    }}
    .anti-cheat-modal {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }}
    .anti-cheat-modal.active {{
      display: flex;
    }}
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="header-content">
      <div>
        <div style="font-weight: 800; font-size: 16px;">بوابة اختبارات الحصة الذكية 📚</div>
        <div style="font-size: 10px; opacity: 0.9; margin-top: 2px;">🟢 بث محلي آمن بدون إنترنت</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button onclick="toggleTheme()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer;">
          <span id="theme-btn-text">ليلي 🌙</span>
        </button>
        <button id="logout-btn" onclick="logoutStudent()" style="display: none; background: transparent; border: 1px solid rgba(255,255,255,0.4); color: white; padding: 6px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
          خروج
        </button>
      </div>
    </div>
  </header>

  <div class="container">
    <!-- VIEW 1: REGISTRATION / LOGIN -->
    <div id="auth-view">
      <div class="card">
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <button id="btn-mode-reg" class="selector-btn selected" style="flex: 1;" onclick="setAuthMode('reg')">تسجيل جديد</button>
          <button id="btn-mode-login" class="selector-btn" style="flex: 1;" onclick="setAuthMode('login')">دخول بحسابي</button>
        </div>

        <div style="background: rgba(37, 99, 235, 0.08); border-right: 4px solid #2563eb; padding: 12px; border-radius: 12px; font-size: 11px; line-height: 1.6; margin-bottom: 16px; color: #1e40af;">
          <strong>✋ تنبيه الحصة:</strong> يرجى إدخال بياناتك الرسمية بدقة لتوثيق حضورك واختباراتك لدى الأستاذ في الفصل.
        </div>

        <form onsubmit="handleAuthSubmit(event)">
          <div id="field-name" class="form-group">
            <label>الاسم الرباعي الصريح للطالب: *</label>
            <input type="text" id="reg-name" required placeholder="مثال: محمد عبدالله خالد العتيبي">
          </div>

          <div class="form-group">
            <label>رقم الهوية أو الإقامة (10 أرقام): *</label>
            <input type="text" id="reg-national-id" required placeholder="أدخل رقم الهوية أو الإقامة" style="direction: ltr; text-align: right;">
          </div>

          <div id="field-phone" class="form-group">
            <label>رقم الهاتف / الجوال: *</label>
            <input type="text" id="reg-phone" placeholder="مثال: 05xxxxxxxx" style="direction: ltr; text-align: right;">
          </div>

          <!-- Grade Level -->
          <div id="field-grade" class="form-group">
            <label>الصف الدراسي: *</label>
            <div class="selector-grid" style="grid-template-columns: repeat(3, 1fr);">
              <button type="button" class="selector-btn selected" id="btn-grade-first" onclick="selectGrade('first')">أول ثانوي</button>
              <button type="button" class="selector-btn" id="btn-grade-second" onclick="selectGrade('second')">ثاني ثانوي</button>
              <button type="button" class="selector-btn" id="btn-grade-third" onclick="selectGrade('third')">ثالث ثانوي</button>
            </div>
          </div>

          <!-- Section -->
          <div id="field-section" class="form-group">
            <label>الشعبة (من 1 إلى 4): *</label>
            <div class="selector-grid" style="grid-template-columns: repeat(4, 1fr);">
              <button type="button" class="selector-btn selected" id="btn-sec-1" onclick="selectSection('1')">شعبة 1</button>
              <button type="button" class="selector-btn" id="btn-sec-2" onclick="selectSection('2')">شعبة 2</button>
              <button type="button" class="selector-btn" id="btn-sec-3" onclick="selectSection('3')">شعبة 3</button>
              <button type="button" class="selector-btn" id="btn-sec-4" onclick="selectSection('4')">شعبة 4</button>
            </div>
          </div>

          <div class="form-group">
            <label>اختر كلمة مرور خاصة بحسابك: *</label>
            <input type="password" id="reg-password" required placeholder="كلمة مرور تتذكرها">
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
            <span id="auth-submit-text">حفظ البيانات وتسجيل الدخول للدروس ←</span>
          </button>
        </form>
      </div>
    </div>

    <!-- VIEW 2: STUDENT DASHBOARD -->
    <div id="dashboard-view" style="display: none;">
      <!-- Student Profile Greeting -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px;">
        <div>
          <h2 style="font-size: 14px; font-weight: 800;" id="student-name-display">محمد العتيبي</h2>
          <div style="font-size: 11px; color: var(--text-muted);" id="student-grade-display">أول ثانوي - شعبة 1</div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button class="tab-btn active" id="tab-btn-quizzes" onclick="switchStudentTab('quizzes')">
          <div>📋 الاختبارات</div>
        </button>
        <button class="tab-btn" id="tab-btn-results" onclick="switchStudentTab('results')">
          <div>🏆 نتائج الحل</div>
        </button>
        <button class="tab-btn" id="tab-btn-report" onclick="switchStudentTab('report')">
          <div>📊 درجاتي وتقييمي</div>
        </button>
      </div>

      <!-- Tab: Quizzes -->
      <div id="student-tab-quizzes">
        <div id="available-quizzes-list"></div>
      </div>

      <!-- Tab: Results -->
      <div id="student-tab-results" style="display: none;">
        <div id="student-results-list"></div>
      </div>

      <!-- Tab: Report Card -->
      <div id="student-tab-report" style="display: none;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">✓ معتمدة</span>
            <h3 style="font-size: 14px; font-weight: 800;">📊 بطاقة التقييم والدرجات الشهرية</h3>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; text-align: center;">
            <div style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 14px; border: 1px solid var(--border);">
              <div style="font-size: 11px; color: var(--text-muted);">الاختبار الشهري الأول</div>
              <div style="font-size: 20px; font-weight: 900; margin-top: 4px;" id="report-exam1">0</div>
            </div>
            <div style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 14px; border: 1px solid var(--border);">
              <div style="font-size: 11px; color: var(--text-muted);">الاختبار الشهري الثاني</div>
              <div style="font-size: 20px; font-weight: 900; margin-top: 4px;" id="report-exam2">0</div>
            </div>
            <div style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 14px; border: 1px solid var(--border);">
              <div style="font-size: 11px; color: var(--text-muted);">درجات المشاركة والتفاعل</div>
              <div style="font-size: 20px; font-weight: 900; color: #10b981; margin-top: 4px;" id="report-part">0</div>
            </div>
            <div style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 14px; border: 1px solid var(--border);">
              <div style="font-size: 11px; color: var(--text-muted);">نقاط إضافية / خصم</div>
              <div style="font-size: 20px; font-weight: 900; color: #2563eb; margin-top: 4px;" id="report-extra">0</div>
            </div>
          </div>

          <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.3); padding: 16px; border-radius: 16px; text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #2563eb;">المجموع التراكمي للدرجات</div>
            <div style="font-size: 28px; font-weight: 900; color: #2563eb; margin-top: 4px;" id="report-total">0</div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 3: ACTIVE QUIZ TEST -->
    <div id="test-view" style="display: none;">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 15px; font-weight: 800;" id="active-quiz-title">اختبار الحصة</h2>
            <div style="font-size: 11px; color: var(--text-muted);">يرجى التركيز وعدم مغادرة الصفحة</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 6px 12px; border-radius: 10px; font-size: 13px; font-weight: 800; font-family: monospace;" id="timer-display">
            05:00
          </div>
        </div>

        <div id="test-questions-box"></div>

        <button class="btn btn-primary" style="margin-top: 16px; background: #10b981;" onclick="submitActiveQuiz()">
          تسليم الإجابات وإنهاء الاختبار ✓
        </button>
      </div>
    </div>

    <!-- VIEW 4: SUBMISSION SUCCESS SCREEN (Screenshot #1) -->
    <div id="success-view" style="display: none;">
      <div class="card" style="text-align: center; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.05);">
        <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
        <h2 style="color: #10b981; font-size: 18px; font-weight: 900; margin-bottom: 6px;">تم تسليم إجاباتك بنجاح!</h2>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">تم إرسال نتيجتك وحفظها فوراً في سجل درجات المعلم.</p>

        <div style="font-size: 44px; font-weight: 900; color: #2563eb; font-family: monospace;" id="success-score">0 من 5</div>
        <div style="font-size: 14px; font-weight: 800; color: #10b981; margin-top: 6px;" id="success-percent">النسبة المئوية: %0</div>

        <div style="background: rgba(0,0,0,0.06); padding: 12px; border-radius: 12px; font-size: 11px; margin: 20px 0; color: var(--text-muted);">
          🔒 تم إغلاق الاختبار لك، ولا يمكن إعادة الدخول للحفاظ على سرية الأسئلة.
        </div>

        <button class="btn btn-primary" onclick="backToDashboard()">
          العودة إلى لوحة الاختبارات الرئيسية ←
        </button>
      </div>
    </div>
  </div>

  <!-- ANTI-CHEAT MODAL (Screenshot #6) -->
  <div class="anti-cheat-modal" id="anti-cheat-modal">
    <div class="card" style="max-width: 400px; text-align: center; border: 2px solid #ef4444;">
      <div style="font-size: 48px; color: #ef4444; margin-bottom: 8px;">🚫</div>
      <h3 style="color: #ef4444; font-size: 17px; font-weight: 900; margin-bottom: 8px;">تنبيه أمني: اتصال إنترنت خارجي!</h3>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.6;">
        تم رصد اتصال هاتفك بالإنترنت الخارجي (بيانات الهاتف 4G/5G) أو مغادرة نافذة الاختبار.
      </p>

      <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: 12px; font-size: 11px; text-align: right; color: #991b1b; margin-bottom: 16px;">
        <strong>⚠️ قواعد الاختبار العادل:</strong> هذا الاختبار محمي ويتطلب الاتصال الحصري بشبكة بث المعلم بدون إنترنت خارجي لمنع البحث أو تسريب الأسئلة.
      </div>

      <button class="btn btn-primary" style="background: #ef4444;" onclick="closeAntiCheatModal()">
        فحص الاتصال مجدداً 🔄
      </button>
    </div>
  </div>

  <script>
    let currentStudent = null;
    let selectedGrade = 'first';
    let selectedSection = '1';
    let authMode = 'reg';
    let allQuizzes = [];
    let studentAnswers = {{}};
    let activeQuizObj = null;
    let timerInterval = null;

    function selectGrade(val) {{
      selectedGrade = val;
      ['first', 'second', 'third'].forEach(g => {{
        document.getElementById('btn-grade-' + g).classList.toggle('selected', g === val);
      }});
    }}

    function selectSection(val) {{
      selectedSection = val;
      ['1', '2', '3', '4'].forEach(s => {{
        document.getElementById('btn-sec-' + s).classList.toggle('selected', s === val);
      }});
    }}

    function setAuthMode(mode) {{
      authMode = mode;
      document.getElementById('btn-mode-reg').classList.toggle('selected', mode === 'reg');
      document.getElementById('btn-mode-login').classList.toggle('selected', mode === 'login');
      document.getElementById('field-name').style.display = (mode === 'reg') ? 'block' : 'none';
      document.getElementById('field-phone').style.display = (mode === 'reg') ? 'block' : 'none';
      document.getElementById('field-grade').style.display = (mode === 'reg') ? 'block' : 'none';
      document.getElementById('field-section').style.display = (mode === 'reg') ? 'block' : 'none';
      document.getElementById('auth-submit-text').innerText = (mode === 'reg') ? 'حفظ البيانات وتسجيل الدخول للدروس ←' : 'تسجيل الدخول لحسابي ←';
    }}

    async function handleAuthSubmit(e) {{
      e.preventDefault();
      let natId = document.getElementById('reg-national-id').value.trim();
      let pwd = document.getElementById('reg-password').value.trim();
      let name = document.getElementById('reg-name').value.trim();
      let phone = document.getElementById('reg-phone').value.trim();

      let gradeLabel = selectedGrade === 'first' ? 'أول ثانوي' : selectedGrade === 'second' ? 'ثاني ثانوي' : 'ثالث ثانوي';
      let gradeSection = gradeLabel + ' - شعبة ' + selectedSection;

      let res = await fetch('/api/students/auth', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{
          isNew: (authMode === 'reg'),
          nationalId: natId,
          password: pwd,
          name: name,
          phone: phone,
          gradeLevel: selectedGrade,
          section: selectedSection,
          gradeSection: gradeSection
        }})
      }});

      let data = await res.json();
      if (!res.ok) {{
        alert(data.error || "خطأ في تسجيل الدخول");
        return;
      }}

      currentStudent = data.student;
      document.getElementById('student-name-display').innerText = currentStudent.name;
      document.getElementById('student-grade-display').innerText = currentStudent.gradeSection;
      document.getElementById('auth-view').style.display = 'none';
      document.getElementById('dashboard-view').style.display = 'block';
      document.getElementById('logout-btn').style.display = 'inline-block';
      loadStudentData();
    }}

    async function loadStudentData() {{
      let res = await fetch('/api/state');
      if (res.ok) {{
        let state = await res.json();
        allQuizzes = state.quizzes || [];
        renderStudentQuizzes();
        renderStudentSubmissions(state.submissions || []);
        if (state.students && currentStudent) {{
          let me = state.students.find(s => s.id === currentStudent.id);
          if (me) {{
            document.getElementById('report-exam1').innerText = me.exam1 || 0;
            document.getElementById('report-exam2').innerText = me.exam2 || 0;
            document.getElementById('report-part').innerText = me.participation || 0;
            document.getElementById('report-extra').innerText = me.extraPoints || 0;
            document.getElementById('report-total').innerText = (me.exam1||0)+(me.exam2||0)+(me.participation||0)+(me.extraPoints||0);
          }}
        }}
      }}
    }}

    function renderStudentQuizzes() {{
      let box = document.getElementById('available-quizzes-list');
      let openQ = allQuizzes.filter(q => q.isOpen);
      if (openQ.length === 0) {{
        box.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted);">لا توجد اختبارات مفتوحة حالياً من المعلم.</div>';
        return;
      }}
      box.innerHTML = openQ.map(q => `
        <div class="card">
          <span style="font-size: 11px; padding: 4px 8px; border-radius: 8px; background: rgba(37, 99, 235, 0.15); color: #2563eb; font-weight: 700;">
            ${{q.type === 'activity' ? 'نشاط تفاعلي' : 'اختبار تقييمي'}}
          </span>
          <h3 style="font-size: 15px; font-weight: 800; margin: 8px 0 4px;">${{q.title}}</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">${{q.subtitle || q.instructions || ''}}</p>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">⏱️ المدة: ${{q.durationMinutes}} دقيقة | ❓ ${{q.questions.length}} أسئلة</div>
          <button class="btn btn-primary" onclick="startQuiz('${{q.id}}')">بدء الاختبار الآن ←</button>
        </div>
      `).join('');
    }}

    function renderStudentSubmissions(subs) {{
      let mySubs = subs.filter(s => currentStudent && s.studentId === currentStudent.id);
      let box = document.getElementById('student-results-list');
      if (mySubs.length === 0) {{
        box.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted);">لم تنجز أي اختبارات بعد. ستظهر هنا نتائجك بعد تسليم أي اختبار.</div>';
        return;
      }}
      box.innerHTML = mySubs.map(s => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; font-weight: 800;">
            <span>${{s.quizTitle}}</span>
            <span style="color: #10b981;">%${{s.percentage}} (${{s.score}}/${{s.total}})</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">تم التسليم: ${{s.submittedAt}}</div>
        </div>
      `).join('');
    }}

    function startQuiz(id) {{
      activeQuizObj = allQuizzes.find(q => q.id === id);
      if (!activeQuizObj) return;

      studentAnswers = {{}};
      document.getElementById('active-quiz-title').innerText = activeQuizObj.title;
      let qBox = document.getElementById('test-questions-box');
      qBox.innerHTML = activeQuizObj.questions.map((q, idx) => `
        <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
          <div style="font-size: 13px; font-weight: 800; margin-bottom: 8px;">${{idx + 1}}. ${{q.text}}</div>
          ${{q.options.map((opt, optIdx) => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;" onclick="recordAnswer('${{q.id}}', ${{optIdx}})">
              <input type="radio" name="q_${{q.id}}" id="opt_${{q.id}}_${{optIdx}}" value="${{optIdx}}">
              <label for="opt_${{q.id}}_${{optIdx}}" style="font-size: 12px; cursor: pointer;">${{opt}}</label>
            </div>
          `).join('')}}
        </div>
      `).join('');

      document.getElementById('dashboard-view').style.display = 'none';
      document.getElementById('test-view').style.display = 'block';

      // Setup countdown
      let remaining = activeQuizObj.durationMinutes * 60;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {{
        remaining--;
        let m = Math.floor(remaining / 60);
        let s = remaining % 60;
        document.getElementById('timer-display').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (remaining <= 0) {{
          clearInterval(timerInterval);
          submitActiveQuiz();
        }}
      }}, 1000);
    }}

    function recordAnswer(qId, optIdx) {{
      studentAnswers[qId] = optIdx;
      let radio = document.getElementById(`opt_${{qId}}_${{optIdx}}`);
      if (radio) radio.checked = true;
    }}

    async function submitActiveQuiz() {{
      if (timerInterval) clearInterval(timerInterval);
      let res = await fetch('/api/submissions', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{
          quizId: activeQuizObj.id,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          answers: studentAnswers
        }})
      }});

      let data = await res.json();
      if (!res.ok) {{
        alert(data.error || "خطأ في تسليم الاختبار");
        return;
      }}

      document.getElementById('test-view').style.display = 'none';
      document.getElementById('success-view').style.display = 'block';
      document.getElementById('success-score').innerText = data.submission.score + " من " + data.submission.total;
      document.getElementById('success-percent').innerText = "النسبة المئوية: %" + data.submission.percentage;
    }}

    function backToDashboard() {{
      document.getElementById('success-view').style.display = 'none';
      document.getElementById('dashboard-view').style.display = 'block';
      loadStudentData();
    }}

    function switchStudentTab(tab) {{
      ['quizzes', 'results', 'report'].forEach(t => {{
        document.getElementById('student-tab-' + t).style.display = (t === tab) ? 'block' : 'none';
        document.getElementById('tab-btn-' + t).classList.toggle('active', t === tab);
      }});
    }}

    function toggleTheme() {{
      document.body.classList.toggle('dark-theme');
      let isDark = document.body.classList.contains('dark-theme');
      document.getElementById('theme-btn-text').innerText = isDark ? 'نهاري ☀️' : 'ليلي 🌙';
    }}

    function logoutStudent() {{
      currentStudent = null;
      document.getElementById('dashboard-view').style.display = 'none';
      document.getElementById('test-view').style.display = 'none';
      document.getElementById('success-view').style.display = 'none';
      document.getElementById('auth-view').style.display = 'block';
      document.getElementById('logout-btn').style.display = 'none';
    }}

    // Anti-cheat detector: fires if student leaves screen during test
    window.addEventListener('blur', () => {{
      if (document.getElementById('test-view').style.display === 'block') {{
        document.getElementById('anti-cheat-modal').classList.add('active');
        fetch('/api/anti-cheat/alert', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{ studentName: currentStudent ? currentStudent.name : 'طالب', reason: 'مغادرة شاشة الاختبار' }})
        }}).catch(() => {{}});
      }}
    }});

    function closeAntiCheatModal() {{
      document.getElementById('anti-cheat-modal').classList.remove('active');
    }}
  </script>
</body>
</html>"""
