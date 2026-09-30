#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
 خادم اختبارات الحصة الذكية - Classroom Quiz Server
 نسخة ويندوز المستقلة فائقة الأداء (تتحمل أكثر من 50 جهازا في نفس الوقت)
 لا تحتاج أي تثبيتات خارجية (Zero Dependencies - Pure Python Standard Library)
==============================================================================
"""

import http.server
import socketserver
import sqlite3
import json
import os
import sys
import socket
import webbrowser
import threading
import urllib.parse
from datetime import datetime

try:
    from teacher_html import get_teacher_html
    from student_html import get_student_html
except ImportError:
    # Fallback inline if separate files not imported
    get_teacher_html = None
    get_student_html = None

PORT = 3000
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'classroom_data.db')
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

# ==============================================================================
# Database Setup (SQLite for high-concurrency ACID persistence)
# ==============================================================================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Settings
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            username TEXT,
            name TEXT,
            subject TEXT,
            phone TEXT,
            password TEXT,
            is_configured INTEGER,
            theme TEXT,
            dark_mode INTEGER,
            anti_cheat INTEGER,
            network_mode TEXT,
            grades_announced INTEGER
        )
    ''')
    
    # Quizzes
    c.execute('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            type TEXT,
            title TEXT,
            subtitle TEXT,
            instructions TEXT,
            duration_minutes INTEGER,
            is_open INTEGER,
            questions_json TEXT
        )
    ''')
    
    # Students
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT,
            national_id TEXT UNIQUE,
            phone TEXT,
            grade_level TEXT,
            section TEXT,
            grade_section TEXT,
            password TEXT,
            exam1 REAL,
            exam2 REAL,
            participation REAL,
            extra_points REAL,
            registered_at TEXT
        )
    ''')
    
    # Submissions
    c.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            quiz_id TEXT,
            quiz_title TEXT,
            student_id TEXT,
            student_name TEXT,
            score REAL,
            total REAL,
            percentage REAL,
            submitted_at TEXT,
            answers_json TEXT
        )
    ''')
    
    # Logs
    c.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY,
            text TEXT,
            timestamp TEXT,
            type TEXT
        )
    ''')

    # Seed default teacher if empty
    c.execute('SELECT COUNT(*) FROM settings')
    if c.fetchone()[0] == 0:
        c.execute('''
            INSERT INTO settings (id, username, name, subject, phone, password, is_configured, theme, dark_mode, anti_cheat, network_mode, grades_announced)
            VALUES (1, 'ahmed_teacher', 'أ. أحمد صبري', 'فيزياء ثانوي', '0533333333', '123456', 1, 'purple', 1, 1, 'wifi', 1)
        ''')

    # Seed initial sample quizzes if empty
    c.execute('SELECT COUNT(*) FROM quizzes')
    if c.fetchone()[0] == 0:
        sample_q1 = json.dumps([
            {
                "id": "q1-1",
                "type": "mcq",
                "text": "ما هي الخاصية الفيزيائية المسؤولة عن مقاومة الجسم لتغير حالته الحركية؟",
                "options": ["القصور الذاتي (Inertia)", "الاحتكاك السطحي", "الجاذبية الأرضية", "السرعة المتجهة"],
                "correctIndex": 0
            },
            {
                "id": "q1-2",
                "type": "true_false",
                "text": "عند انعدام القوى المحصلة المؤثرة على جسم، يبقى الجسم الساكن ساكناً والمتحرك بسرعة ثابتة يستمر في حركته.",
                "options": ["صح", "خطأ"],
                "correctIndex": 0
            }
        ], ensure_ascii=False)

        c.execute('''
            INSERT INTO quizzes (id, type, title, subtitle, instructions, duration_minutes, is_open, questions_json)
            VALUES ('quiz-1', 'activity', 'نشاط تفاعلي: لغز وتفكير إبداعي', 'شارك بحلك واختبر سرعتك مع زملائك في الفصل!', 'أجب بسرعة للحصول على درجات إضافية', 7, 1, ?)
        ''', (sample_q1,))

        sample_q2 = json.dumps([
            {
                "id": "q2-1",
                "type": "mcq",
                "text": "وحدة قياس القوة في النظام الدولي للوحدات (SI) هي:",
                "options": ["الجول (Joule)", "النيوتن (Newton)", "الواط (Watt)", "الباسكال (Pascal)"],
                "correctIndex": 1
            },
            {
                "id": "q2-2",
                "type": "mcq",
                "text": "التسارع الناتج عن الجاذبية الأرضية بالقرب من سطح الأرض يساوي تقريباً:",
                "options": ["9.8 م/ث²", "3.14 م/ث²", "100 م/ث²", "0 م/ث²"],
                "correctIndex": 0
            }
        ], ensure_ascii=False)

        c.execute('''
            INSERT INTO quizzes (id, type, title, subtitle, instructions, duration_minutes, is_open, questions_json)
            VALUES ('quiz-2', 'quiz', 'اختبار مراجعة سريع في الحصة', 'اختبار قصير للتأكد من استيعاب المفاهيم الأساسية', 'مغلق بعد التسليم', 5, 1, ?)
        ''', (sample_q2,))

    # Seed initial logs
    c.execute('SELECT COUNT(*) FROM logs')
    if c.fetchone()[0] == 0:
        c.execute('''
            INSERT INTO logs (id, text, timestamp, type)
            VALUES ('log-init', 'تم تشغيل خادم الاختبارات بنجاح وجاهز لاستقبال اتصالات الطلاب.', datetime('now', 'localtime'), 'info')
        ''')

    conn.commit()
    conn.close()

# ==============================================================================
# Helper to detect local IP on Windows / Linux
# ==============================================================================
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = '127.0.0.1'
    finally:
        s.close()
    return ip

# ==============================================================================
# HTTP Request Handler
# ==============================================================================
class ClassroomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for student devices and Gzip-compatible headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/network-info':
            local_ip = get_local_ip()
            self.send_json({
                "primaryIP": local_ip,
                "allIPs": [local_ip],
                "port": PORT,
                "hostname": socket.gethostname(),
                "simplifiedUrl": f"http://school.local:{PORT}",
                "fullUrl": f"http://{local_ip}:{PORT}"
            })
            return

        elif path == '/api/state':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            
            c.execute('SELECT username, name, subject, phone, password, is_configured, theme, dark_mode, anti_cheat, network_mode, grades_announced FROM settings WHERE id=1')
            s_row = c.fetchone()
            teacher = {
                "username": s_row[0] if s_row else "teacher_admin",
                "name": s_row[1] if s_row else "أ. أحمد صبري",
                "subject": s_row[2] if s_row else "فيزياء ثانوي",
                "phone": s_row[3] if s_row else "0533333333",
                "password": s_row[4] if s_row else "123",
                "isConfigured": bool(s_row[5]) if s_row else True,
                "theme": s_row[6] if s_row else "purple",
                "darkMode": bool(s_row[7]) if s_row else True,
                "antiCheat": bool(s_row[8]) if s_row else True,
                "networkMode": s_row[9] if s_row else "wifi",
                "gradesAnnounced": bool(s_row[10]) if s_row else True
            }

            # Quizzes
            c.execute('SELECT id, type, title, subtitle, instructions, duration_minutes, is_open, questions_json FROM quizzes')
            quizzes = []
            for q in c.fetchall():
                quizzes.append({
                    "id": q[0],
                    "type": q[1],
                    "title": q[2],
                    "subtitle": q[3],
                    "instructions": q[4],
                    "durationMinutes": q[5],
                    "isOpen": bool(q[6]),
                    "questions": json.loads(q[7])
                })

            # Students
            c.execute('SELECT id, name, national_id, phone, grade_level, section, grade_section, password, exam1, exam2, participation, extra_points, registered_at FROM students')
            students = []
            for st in c.fetchall():
                students.append({
                    "id": st[0],
                    "name": st[1],
                    "nationalId": st[2],
                    "phone": st[3],
                    "gradeLevel": st[4],
                    "section": st[5],
                    "gradeSection": st[6],
                    "password": st[7],
                    "exam1": st[8],
                    "exam2": st[9],
                    "participation": st[10],
                    "extraPoints": st[11],
                    "registeredAt": st[12]
                })

            # Submissions
            c.execute('SELECT id, quiz_id, quiz_title, student_id, student_name, score, total, percentage, submitted_at, answers_json FROM submissions')
            submissions = []
            for sub in c.fetchall():
                submissions.append({
                    "id": sub[0],
                    "quizId": sub[1],
                    "quizTitle": sub[2],
                    "studentId": sub[3],
                    "studentName": sub[4],
                    "score": sub[5],
                    "total": sub[6],
                    "percentage": sub[7],
                    "submittedAt": sub[8],
                    "answers": json.loads(sub[9])
                })

            # Logs
            c.execute('SELECT id, text, timestamp, type FROM logs ORDER BY id DESC LIMIT 50')
            logs = []
            for l in c.fetchall():
                logs.append({
                    "id": l[0],
                    "text": l[1],
                    "timestamp": l[2],
                    "type": l[3]
                })

            conn.close()
            self.send_json({
                "teacher": teacher,
                "serverActive": True,
                "quizzes": quizzes,
                "students": students,
                "submissions": submissions,
                "logs": logs
            })
            return

        local_ip = get_local_ip()

        # Student portal route
        if path.startswith('/student'):
            if get_student_html:
                content = get_student_html(local_ip, PORT).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        # Main route / Teacher dashboard
        if path in ['/', '/teacher', '/index.html']:
            if get_teacher_html:
                content = get_teacher_html(local_ip, PORT).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        # Static files fallback from dist directory (if present)
        if os.path.exists(DIST_DIR):
            file_path = os.path.join(DIST_DIR, path.lstrip('/'))
            if os.path.isfile(file_path):
                self.serve_static_file(file_path)
                return
            # SPA fallback: return dist/index.html
            index_path = os.path.join(DIST_DIR, 'index.html')
            if os.path.isfile(index_path):
                self.serve_static_file(index_path)
                return

        # Absolute fallback if anything else requested: return teacher dashboard
        if get_teacher_html:
            content = get_teacher_html(local_ip, PORT).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self.send_error(404, "File not found")

    def serve_static_file(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        content_type = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
        }.get(ext, 'application/octet-stream')

        with open(file_path, 'rb') as f:
            content = f.read()

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'max-age=3600')
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(length)
        data = json.loads(post_data.decode('utf-8')) if post_data else {}
        path = urllib.parse.urlparse(self.path).path

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        if path == '/api/teacher/settings':
            # Update teacher settings
            for key, val in data.items():
                if key == 'username':
                    c.execute('UPDATE settings SET username=? WHERE id=1', (val,))
                elif key == 'name':
                    c.execute('UPDATE settings SET name=? WHERE id=1', (val,))
                elif key == 'subject':
                    c.execute('UPDATE settings SET subject=? WHERE id=1', (val,))
                elif key == 'phone':
                    c.execute('UPDATE settings SET phone=? WHERE id=1', (val,))
                elif key == 'password':
                    c.execute('UPDATE settings SET password=? WHERE id=1', (val,))
                elif key == 'isConfigured':
                    c.execute('UPDATE settings SET is_configured=? WHERE id=1', (int(val),))
                elif key == 'theme':
                    c.execute('UPDATE settings SET theme=? WHERE id=1', (val,))
                elif key == 'darkMode':
                    c.execute('UPDATE settings SET dark_mode=? WHERE id=1', (int(val),))
                elif key == 'antiCheat':
                    c.execute('UPDATE settings SET anti_cheat=? WHERE id=1', (int(val),))
                elif key == 'networkMode':
                    c.execute('UPDATE settings SET network_mode=? WHERE id=1', (val,))
                elif key == 'gradesAnnounced':
                    c.execute('UPDATE settings SET grades_announced=? WHERE id=1', (int(val),))
            conn.commit()
            conn.close()
            self.send_json({"success": True})
            return

        elif path == '/api/students/auth':
            is_new = data.get('isNew', False)
            nat_id = data.get('nationalId')
            pwd = data.get('password')

            if is_new:
                c.execute('SELECT COUNT(*) FROM students WHERE national_id=?', (nat_id,))
                if c.fetchone()[0] > 0:
                    conn.close()
                    self.send_json({"error": "رقم الهوية أو الإقامة مسجل مسبقاً! يرجى تسجيل الدخول."}, 400)
                    return
                std_id = f"std-{int(datetime.now().timestamp()*1000)}"
                c.execute('''
                    INSERT INTO students (id, name, national_id, phone, grade_level, section, grade_section, password, exam1, exam2, participation, extra_points, registered_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, datetime('now', 'localtime'))
                ''', (
                    std_id,
                    data.get('name'),
                    nat_id,
                    data.get('phone', ''),
                    data.get('gradeLevel', 'first'),
                    data.get('section', '1'),
                    data.get('gradeSection', 'أول ثانوي - شعبة 1'),
                    pwd
                ))
                # Add log
                c.execute('''
                    INSERT INTO logs (id, text, timestamp, type)
                    VALUES (?, ?, datetime('now', 'localtime'), 'info')
                ''', (f"log-{int(datetime.now().timestamp()*1000)}", f"انضم الطالب الجديد: {data.get('name')} ({data.get('gradeSection')}) إلى الخادم."))

                conn.commit()
                conn.close()
                self.send_json({
                    "success": True,
                    "student": {
                        "id": std_id,
                        "name": data.get('name'),
                        "nationalId": nat_id,
                        "phone": data.get('phone', ''),
                        "gradeLevel": data.get('gradeLevel', 'first'),
                        "section": data.get('section', '1'),
                        "gradeSection": data.get('gradeSection', 'أول ثانوي - شعبة 1'),
                        "exam1": 0, "exam2": 0, "participation": 0, "extraPoints": 0
                    }
                })
                return
            else:
                c.execute('SELECT id, name, national_id, phone, grade_level, section, grade_section, password, exam1, exam2, participation, extra_points FROM students WHERE national_id=? AND password=?', (nat_id, pwd))
                row = c.fetchone()
                if not row:
                    conn.close()
                    self.send_json({"error": "بيانات الدخول غير صحيحة، تأكد من رقم الهوية وكلمة المرور."}, 401)
                    return
                conn.close()
                self.send_json({
                    "success": True,
                    "student": {
                        "id": row[0], "name": row[1], "nationalId": row[2], "phone": row[3],
                        "gradeLevel": row[4], "section": row[5], "gradeSection": row[6],
                        "exam1": row[8], "exam2": row[9], "participation": row[10], "extraPoints": row[11]
                    }
                })
                return

        elif path == '/api/submissions':
            quiz_id = data.get('quizId')
            student_id = data.get('studentId')
            student_name = data.get('studentName')
            answers = data.get('answers', {})

            c.execute('SELECT title, questions_json FROM quizzes WHERE id=?', (quiz_id,))
            q_row = c.fetchone()
            if not q_row:
                conn.close()
                self.send_json({"error": "Quiz not found"}, 404)
                return

            quiz_title = q_row[0]
            questions = json.loads(q_row[1])

            # check multiple submission
            c.execute('SELECT COUNT(*) FROM submissions WHERE quiz_id=? AND student_id=?', (quiz_id, student_id))
            if c.fetchone()[0] > 0:
                conn.close()
                self.send_json({"error": "لقد قمت بتسليم هذا الاختبار مسبقاً ولا يمكنك إعادته."}, 400)
                return

            correct_count = 0
            detailed = []
            for q in questions:
                ans = answers.get(q['id'])
                is_correct = (ans == q.get('correctIndex'))
                if is_correct:
                    correct_count += 1
                detailed.append({
                    "questionId": q['id'],
                    "questionText": q['text'],
                    "studentAnswer": ans,
                    "correctAnswer": q.get('correctIndex'),
                    "isCorrect": is_correct
                })

            total = len(questions)
            percentage = round((correct_count / total) * 100) if total > 0 else 0
            sub_id = f"sub-{int(datetime.now().timestamp()*1000)}"
            now_time = datetime.now().strftime("%I:%M:%S %p")

            c.execute('''
                INSERT INTO submissions (id, quiz_id, quiz_title, student_id, student_name, score, total, percentage, submitted_at, answers_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (sub_id, quiz_id, quiz_title, student_id, student_name, correct_count, total, percentage, now_time, json.dumps(detailed, ensure_ascii=False)))

            c.execute('''
                INSERT INTO logs (id, text, timestamp, type)
                VALUES (?, ?, datetime('now', 'localtime'), 'success')
            ''', (f"log-{int(datetime.now().timestamp()*1000)}", f"قام الطالب \"{student_name}\" بتسليم \"{quiz_title}\" بنتيجة: {correct_count}/{total} (%{percentage})."))

            conn.commit()
            conn.close()

            self.send_json({
                "success": True,
                "submission": {
                    "id": sub_id,
                    "quizId": quiz_id,
                    "quizTitle": quiz_title,
                    "studentId": student_id,
                    "studentName": student_name,
                    "score": correct_count,
                    "total": total,
                    "percentage": percentage,
                    "submittedAt": now_time,
                    "answers": detailed
                }
            })
            return

        elif path == '/api/anti-cheat/alert':
            std_name = data.get('studentName', 'طالب')
            reason = data.get('reason', '')
            c.execute('''
                INSERT INTO logs (id, text, timestamp, type)
                VALUES (?, ?, datetime('now', 'localtime'), 'danger')
            ''', (f"log-{int(datetime.now().timestamp()*1000)}", f"⚠️ تنبيه غش/أمني: الطالب \"{std_name}\" [{reason}]."))
            conn.commit()
            conn.close()
            self.send_json({"success": True})
            return

        conn.close()
        self.send_json({"success": True})

# Multi-threaded server for handling 50+ concurrent classroom devices
class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    init_db()
    local_ip = get_local_ip()

    print("=" * 70)
    print("      خادم اختبارات الحصة الذكية - Classroom Quiz Server")
    print("                (يعمل على الشبكة المحلية بدون إنترنت)")
    print("=" * 70)
    print(f" [✓] الخادم يعمل الآن بكامل طاقته على المنفذ: {PORT}")
    print(f" [✓] عنوان دخول الطلاب من الجوالات والتابلت:")
    print(f"     👉 http://{local_ip}:{PORT}")
    print(f"     👉 http://localhost:{PORT}")
    print("=" * 70)
    print(" [✓] جاري فتح لوحة المعلم في المتصفح تلقائياً...")
    
    # Open teacher dashboard in default browser
    threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    server = ThreadedHTTPServer(('0.0.0.0', PORT), ClassroomHTTPHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nتم إيقاف الخادم بنجاح.")
        sys.exit(0)

if __name__ == '__main__':
    main()
