/**
 * ==========================================================================
 * VARKARI STUDENT MANAGEMENT SYSTEM — CORE APPLICATION LOGIC
 * ==========================================================================
 */

// ==========================================
// 1. BILINGUAL DICTIONARY & LOCALIZATION
// ==========================================
const translations = {
    'en': {
        // Auth Page
        'lbl-username': 'Username',
        'lbl-password': 'Password',
        'lbl-remember': 'Remember me',
        'lbl-forgot': 'Forgot Password?',
        'btn-login': 'Sign In',
        'auth-footer-text': 'Administrator: ankush',
        'forgot-title': 'Reset Password',
        'forgot-desc': 'Enter your registered email or phone number. We will send you a simulated OTP.',
        'lbl-email-phone': 'Email or Phone Number',
        'lbl-otp': 'Enter OTP (Simulated: 123456)',
        'lbl-new-password': 'New Password',
        'btn-cancel': 'Cancel',
        'btn-send-otp': 'Send OTP',
        'btn-reset-pass': 'Reset Password',
        'lbl-blessing': '',
        'lbl-or-sign-in-with': 'Or Sign In With',
        'btn-login-finger': 'Fingerprint',
        'btn-login-face': 'Face ID',
        'lbl-dont-have-account': "Don't have an account? Sign Up with:",
        
        // Sidebar Menu
        'menu-dashboard': 'Dashboard',
        'menu-students': 'Students Directory',
        'menu-import': 'Bulk Import',
        'menu-backup': 'Backup & Sync',
        'menu-pwa': 'Install App',
        'btn-logout': 'Logout',
        
        // Dashboard
        'lbl-total-students': 'Total Students',
        'lbl-avg-attendance': 'Attendance Today',
        'lbl-fees-collected': 'Fees Collected',
        'lbl-pending-issues': 'Active Alerts',
        'lbl-performance-chart': 'Academic Rating Distribution',
        'tag-good': 'Good',
        'tag-average': 'Average',
        'tag-weak': 'Weak',
        'lbl-majority': 'Majority',
        'lbl-good-students': 'Excellent Performers',
        'lbl-average-students': 'Average Performers',
        'lbl-weak-students': 'Needs Improvement',
        'lbl-attention-required': 'Attention Required',
        
        // Directory
        'placeholder-search': 'Search by name, roll no, phone...',
        'opt-all-classes': 'All Classes',
        'opt-all-sections': 'All Sections',
        'btn-add-new': 'Add Student',
        'th-photo': 'Photo / Roll',
        'th-name': 'Full Name',
        'th-roll': 'Roll No',
        'th-class': 'Class',
        'th-phone': 'Phone Number',
        'th-parent': 'Parent Name',
        'th-fees': 'Fees',
        'mnav-dashboard': 'Home',
        'mnav-students': 'Students',
        'mnav-attendance': 'Attendance',
        'mnav-bot': 'AI Bot',
        'menu-bot': 'AI Bot',
        'mnav-backup': 'Backup',
        'th-actions': 'Actions',
        'lbl-no-results': 'No students found',
        'lbl-no-results-sub': 'Try adjusting filters or search term.',
        
        // Student Profile Header & Actions
        'btn-back': 'Back to Directory',
        'btn-send-alert': 'Send Alert',
        'btn-export-pdf': 'Print Report',
        'btn-delete': 'Delete Student',
        'lbl-roll': 'Roll',
        'lbl-class': 'Class',
        'lbl-phone': 'Phone',
        'lbl-parent-name': 'Parent / Guardian',
        'lbl-emergency-contact': 'Emergency Phone',
        'title-admin-profile': 'Edit Admin Profile',
        'btn-change-photo': 'Change Photo',
        'lbl-email': 'Email Address',
        'lbl-student-photo': 'Student Photo',
        'tab-settings-personal': 'Personal Details',
        'tab-settings-password': 'Change Password',
        'tab-settings-biometrics': 'Biometric Security',
        'lbl-biometrics-desc': 'Configure fingerprint or facial recognition templates to enable fast biometric login bypass from the login screen.',
        'lbl-finger-lock': 'Fingerprint Login',
        'lbl-face-lock': 'Face ID Unlock',
        'lbl-status-not-configured': 'Not Configured',
        'lbl-status-configured': 'Configured / Active',
        'btn-configure': 'Configure',
        'btn-remove': 'Remove',
        'lbl-scanner-title': 'Fingerprint Scanner',
        'lbl-scanner-instructions': 'Touch and hold the sensor to register fingerprint',
        'lbl-face-scanner-title': 'Face ID Scanner',
        'lbl-face-instructions': 'Position your face in the camera frame',
        'lbl-current-password': 'Current Password',
        'lbl-confirm-password': 'Confirm New Password',
        'btn-save-password': 'Update Password',
        
        // Profile Tabs
        'tab-progress': 'Progress Report',
        'tab-complaints': 'Complaints & Health',
        'tab-fees': 'Fees Report',
        'tab-documents': 'Documents',
        
        // Tab 1: Progress Report
        'lbl-attendance-summary': 'Attendance Summary',
        'lbl-attendance-desc': 'Calendar view of student presence for current month:',
        'lbl-present': 'Present',
        'lbl-absent': 'Absent',
        'lbl-marks-history': 'Exam Marks History',
        'term-unit1': 'Unit 1',
        'term-mid': 'Midterm',
        'term-unit2': 'Unit 2',
        'term-final': 'Annual',
        'lbl-average-trend': 'Performance growth trend across key examination terms.',
        'lbl-subject-performance': 'Subject Performance',
        'lbl-teacher-remarks': 'Remarks & Timeline',
        'lbl-homework-completed': 'Homework Completed Today',
        'btn-post-remark': 'Post Remark',
        
        // Tab 2: Complaints & Health
        'lbl-medical-record': 'Medical Profile',
        'lbl-blood-group': 'Blood Group',
        'lbl-allergies': 'Allergies',
        'lbl-past-illness': 'Past Illness',
        'lbl-doctor-notes': 'Doctor Notes',
        'lbl-complaint-log': 'Discipline & Complaint Log',
        'btn-add-complaint': 'Log Incident',
        'btn-edit': 'Edit',
        
        // Tab 3: Fees
        'lbl-total-fees': 'Total Fees',
        'lbl-fees-paid': 'Paid Amount',
        'lbl-fees-pending': 'Pending Balance',
        'lbl-payment-history': 'Payment Ledger',
        'th-date': 'Date',
        'th-amount': 'Amount',
        'th-mode': 'Payment Mode',
        'th-receipt': 'Receipt No',
        'lbl-record-payment': 'Record New Payment',
        'lbl-pay-amount': 'Amount Received (₹)',
        'lbl-pay-mode': 'Payment Mode',
        'opt-cash': 'Cash',
        'opt-upi': 'UPI / Online',
        'opt-bank-transfer': 'Bank Transfer',
        'btn-save-transaction': 'Save Transaction',
        
        // Tab 4: Documents
        'lbl-uploaded-documents': 'Uploaded Documents',
        'btn-upload': 'Upload Document',
        
        // Bulk Import
        'import-title': 'Excel / CSV Bulk Import',
        'import-desc': 'Easily import student rosters by copy-pasting spreadsheet rows or pasting raw CSV code. Column order should match: Full Name, Roll No, Class, Section, Phone, Parent Name',
        'lbl-csv-data': 'CSV Data (Comma-separated values, one student per line)',
        'btn-import-students': 'Process & Import',
        
        // Backup
        'lbl-backup-data': 'Local Data Backup',
        'lbl-backup-desc': 'Export the entire local database containing all student files, attendance histories, medical reports, and fee transaction logs as a single JSON file.',
        'btn-download-backup': 'Download JSON Backup',
        'lbl-restore-data': 'Restore Data',
        'lbl-restore-desc': 'Restore or sync data from a previously downloaded JSON backup file. WARNING: This will overwrite any current local database records.',
        'btn-upload-restore': 'Upload JSON Backup',
        
        // Modals Add Student
        'title-add-student': 'Add New Student',
        'lbl-full-name': 'Full Name',
        'lbl-roll-no': 'Roll Number',
        'lbl-class-select': 'Class Standard',
        'lbl-section-select': 'Section',
        'lbl-phone-num': 'Parent Phone',
        'btn-save': 'Save Details',
        
        // Modals Medical Edit
        'title-edit-medical': 'Update Medical Record',
        
        // Modals Incident Log
        'title-log-incident': 'Log Discipline / Complaint Incident',
        'lbl-incident-type': 'Incident / Complaint Type',
        'opt-incident-attendance': 'Attendance Issues',
        'opt-incident-homework': 'Homework Incomplete',
        'opt-incident-discipline': 'Disciplinary Incident',
        'opt-incident-health': 'Health Concern',
        'lbl-action-taken': 'Action Taken / Notes',
        
        // Modals SMS alert
        'sms-title': 'WhatsApp / SMS Alert Simulator',
        'sms-desc': "Draft alerts to send to student's parent/guardian. In production, this connects to WhatsApp/SMS APIs.",
        'lbl-sms-template': 'Select Preset Template',
        'sms-opt-absent': 'Absent Today Notification',
        'sms-opt-fee': 'Fee Due Reminder',
        'sms-opt-remark': 'General Remark Alert',
        'lbl-message-body': 'Message Body',
        'btn-send-now': 'Send Simulated Alert',
        'btn-mark-attendance': 'Mark Attendance',
        'title-mark-attendance': 'Mark Daily Attendance',
        'lbl-mark-attendance-desc': 'Mark attendance for students of the selected class/section for today.',
        'lbl-attendance-status': 'Attendance Status'
    },
    'mr': {
        // Auth Page
        'lbl-username': 'वापरकर्ता नाव',
        'lbl-password': 'पासवर्ड',
        'lbl-remember': 'लक्षात ठेवा',
        'lbl-forgot': 'पासवर्ड विसरलात?',
        'btn-login': 'प्रवेश करा',
        'auth-footer-text': 'प्रशासक खाते: ankush',
        'forgot-title': 'पासवर्ड रीसेट करा',
        'forgot-desc': 'तुमचा नोंदणीकृत ईमेल किंवा फोन नंबर प्रविष्ट करा. आम्ही तुम्हाला एक सिम्युलेटेड OTP पाठवू.',
        'lbl-email-phone': 'ईमेल किंवा फोन नंबर',
        'lbl-otp': 'OTP प्रविष्ट करा (सिम्युलेटेड: 123456)',
        'lbl-new-password': 'नवीन पासवर्ड',
        'btn-cancel': 'रद्द करा',
        'btn-send-otp': 'OTP पाठवा',
        'btn-reset-pass': 'पासवर्ड रीसेट करा',
        'lbl-blessing': '',
        'lbl-or-sign-in-with': 'किंवा याद्वारे लॉग इन करा',
        'btn-login-finger': 'फिंगरप्रिंट',
        'btn-login-face': 'फेस आयडी',
        'lbl-dont-have-account': 'खाते नाही? याद्वारे नोंदणी करा:',
        
        // Sidebar Menu
        'menu-dashboard': 'डॅशबोर्ड',
        'menu-students': 'विद्यार्थी सूची',
        'menu-import': 'एकत्रित डेटा आयात',
        'menu-backup': 'बॅकअप आणि सिंक',
        'menu-pwa': 'ॲप इन्स्टॉल करा',
        'btn-logout': 'लॉगआउट',
        
        // Dashboard
        'lbl-total-students': 'एकूण विद्यार्थी',
        'lbl-avg-attendance': 'आजची उपस्थिती',
        'lbl-fees-collected': 'जमा फी',
        'lbl-pending-issues': 'सक्रिय सूचना',
        'lbl-performance-chart': 'शैक्षणिक गुणवत्ता वितरण',
        'tag-good': 'उत्कृष्ट',
        'tag-average': 'मध्यम',
        'tag-weak': 'कमकुवत',
        'lbl-majority': 'बहुसंख्य',
        'lbl-good-students': 'उत्कृष्ट विद्यार्थी',
        'lbl-average-students': 'मध्यम विद्यार्थी',
        'lbl-weak-students': 'सुधारणा आवश्यक',
        'lbl-attention-required': 'लक्ष देणे आवश्यक',
        
        // Directory
        'placeholder-search': 'नाव, रोल नंबर, फोनने शोधा...',
        'opt-all-classes': 'सर्व इयत्ता',
        'opt-all-sections': 'सर्व तुकड्या',
        'btn-add-new': 'नवीन विद्यार्थी जोडा',
        'th-photo': 'फोटो / रोल नं.',
        'th-name': 'पूर्ण नाव',
        'th-roll': 'हजेरी क्रमांक',
        'th-class': 'इयत्ता',
        'th-phone': 'फोन नंबर',
        'th-parent': 'पालकांचे नाव',
        'th-fees': 'फी',
        'mnav-dashboard': 'मुख्यपृष्ठ',
        'mnav-students': 'विद्यार्थी',
        'mnav-attendance': 'हजेरी',
        'mnav-bot': 'AI बॉट',
        'menu-bot': 'AI बॉट',
        'mnav-backup': 'बॅकअप',
        'th-actions': 'कृती',
        'lbl-no-results': 'विद्यार्थी सापडले नाहीत',
        'lbl-no-results-sub': 'कृपया फिल्टर किंवा शोध पर्याय बदला.',
        
        // Student Profile Header & Actions
        'btn-back': 'सूचीकडे परत',
        'btn-send-alert': 'पालकांना अलर्ट पाठवा',
        'btn-export-pdf': 'रिपोर्ट प्रिंट करा',
        'btn-delete': 'डेटा हटवा',
        'lbl-roll': 'क्रमांक',
        'lbl-class': 'इयत्ता',
        'lbl-phone': 'फोन',
        'lbl-parent-name': 'पालक / पालक',
        'lbl-emergency-contact': 'अणीबाणीचा फोन',
        'title-admin-profile': 'अ‍ॅडमिन प्रोफाइल संपादित करा',
        'btn-change-photo': 'फोटो बदला',
        'lbl-email': 'ईमेल पत्ता',
        'lbl-student-photo': 'विद्यार्थ्यांचा फोटो',
        'tab-settings-personal': 'वैयक्तिक तपशील',
        'tab-settings-password': 'पासवर्ड बदला',
        'tab-settings-biometrics': 'बायोमेट्रिक सुरक्षा',
        'lbl-biometrics-desc': 'लॉगिन स्क्रीनवरून जलद बायोमेट्रिक लॉगिन बायपास सक्षम करण्यासाठी फिंगरप्रिंट किंवा चेहऱ्याची ओळख टेम्पलेट्स कॉन्फिगर करा.',
        'lbl-finger-lock': 'फिंगरप्रिंट लॉगिन',
        'lbl-face-lock': 'फेस आयडी अनलॉक',
        'lbl-status-not-configured': 'कॉन्फिगर केलेले नाही',
        'lbl-status-configured': 'सक्रिय / कॉन्फिगर केलेले',
        'btn-configure': 'कॉन्फिगर करा',
        'btn-remove': 'हटवा',
        'lbl-scanner-title': 'फिंगरप्रिंट स्कॅनर',
        'lbl-scanner-instructions': 'फिंगरप्रिंट नोंदणी करण्यासाठी सेन्सरला स्पर्श करा आणि धरून ठेवा',
        'lbl-face-scanner-title': 'फेस आयडी स्कॅनर',
        'lbl-face-instructions': 'तुमचा चेहरा कॅमेरा फ्रेममध्ये ठेवा',
        'lbl-current-password': 'चालू पासवर्ड',
        'lbl-confirm-password': 'नवीन पासवर्डची पुष्टी करा',
        'btn-save-password': 'पासवर्ड अपडेट करा',
        
        // Profile Tabs
        'tab-progress': 'प्रगती अहवाल',
        'tab-complaints': 'तक्रार व आरोग्य',
        'tab-fees': 'फी अहवाल',
        'tab-documents': 'कागदपत्रे',
        
        // Tab 1: Progress Report
        'lbl-attendance-summary': 'उपस्थितीचा सारांश',
        'lbl-attendance-desc': 'चालू महिन्यातील विद्यार्थ्याची उपस्थिती दिनदर्शिका:',
        'lbl-present': 'हजर',
        'lbl-absent': 'गैरहजर',
        'lbl-marks-history': 'परीक्षेचे गुण इतिहास',
        'term-unit1': 'घटक चाचणी १',
        'term-mid': 'सत्र परीक्षा',
        'term-unit2': 'घटक चाचणी २',
        'term-final': 'वार्षिक परीक्षा',
        'lbl-average-trend': 'मुख्य परीक्षा सत्रांमधील कामगिरी वाढीचा कल.',
        'lbl-subject-performance': 'विषयानुसार कामगिरी',
        'lbl-teacher-remarks': 'शिक्षकांचे अभिप्राय आणि इतिहास',
        'lbl-homework-completed': 'गृहपाठ आज पूर्ण केला',
        'btn-post-remark': 'अभिप्राय नोंदवा',
        
        // Tab 2: Complaints & Health
        'lbl-medical-record': 'वैद्यकीय माहिती',
        'lbl-blood-group': 'रक्तगट',
        'lbl-allergies': 'अ‍ॅलर्जी',
        'lbl-past-illness': 'मागील आजार',
        'lbl-doctor-notes': 'डॉक्टरांचे मत',
        'lbl-complaint-log': 'शिस्त आणि तक्रार नोंद',
        'btn-add-complaint': 'घटना नोंदवा',
        'btn-edit': 'संपादन करा',
        
        // Tab 3: Fees
        'lbl-total-fees': 'एकूण फी',
        'lbl-fees-paid': 'भरलेली फी',
        'lbl-fees-pending': 'उर्वरित फी',
        'lbl-payment-history': 'पेमेंट इतिहास',
        'th-date': 'तारीख',
        'th-amount': 'रक्कम',
        'th-mode': 'पेमेंट प्रकार',
        'th-receipt': 'पावती क्र.',
        'lbl-record-payment': 'नवीन फी जमा करा',
        'lbl-pay-amount': 'जमा केलेली रक्कम (₹)',
        'lbl-pay-mode': 'पेमेंट प्रकार',
        'opt-cash': 'रोख (Cash)',
        'opt-upi': 'UPI / ऑनलाईन',
        'opt-bank-transfer': 'बँक ट्रान्सफर',
        'btn-save-transaction': 'व्यवहार जतन करा',
        
        // Tab 4: Documents
        'lbl-uploaded-documents': 'अपलोड केलेली कागदपत्रे',
        'btn-upload': 'कागदपत्र अपलोड करा',
        
        // Bulk Import
        'import-title': 'एक्सेल / CSV बल्क आयात',
        'import-desc': 'स्प्रेडशीट ओळी कॉपी-पेस्ट करून किंवा रॉ CSV पेस्ट करून विद्यार्थी यादी सहज आयात करा. कॉलम क्रम: पूर्ण नाव, रोल नंबर, इयत्ता, तुकडी, फोन, पालकांचे नाव',
        'lbl-csv-data': 'CSV डेटा (स्वल्पविराम-विभाजित मूल्ये, प्रति ओळ एक विद्यार्थी)',
        'btn-import-students': 'प्रक्रिया करा आणि आयात करा',
        
        // Backup
        'lbl-backup-data': 'स्थानिक डेटा बॅकअप',
        'lbl-backup-desc': 'सर्व विद्यार्थ्यांच्या फाइल्स, उपस्थिती इतिहास, वैद्यकीय अहवाल आणि फी व्यवहाराच्या नोंदी असलेली संपूर्ण स्थानिक डेटाबेस एकाच JSON फाइल म्हणून निर्यात करा.',
        'btn-download-backup': 'JSON बॅकअप डाउनलोड करा',
        'lbl-restore-data': 'डेटा पुनर्संचयित करा',
        'lbl-restore-desc': 'पूर्वी डाउनलोड केलेल्या JSON बॅकअप फाइलमधून डेटा पुनर्संचयित किंवा समक्रमित करा. चेतावणी: हे चालू स्थानिक डेटाबेस नोंदी ओव्हरराईट करेल.',
        'btn-upload-restore': 'JSON बॅकअप अपलोड करा',
        
        // Modals Add Student
        'title-add-student': 'नवीन विद्यार्थी जोडा',
        'lbl-full-name': 'पूर्ण नाव',
        'lbl-roll-no': 'हजेरी क्रमांक',
        'lbl-class-select': 'इयत्ता निवडा',
        'lbl-section-select': 'तुकडी निवडा',
        'lbl-phone-num': 'पालकांचा फोन',
        'btn-save': 'माहिती जतन करा',
        
        // Modals Medical Edit
        'title-edit-medical': 'वैद्यकीय माहिती अद्यतनित करा',
        
        // Modals Incident Log
        'title-log-incident': 'शिस्त किंवा तक्रार नोंदवा',
        'lbl-incident-type': 'घटनेचा प्रकार',
        'opt-incident-attendance': 'उपस्थिती समस्या',
        'opt-incident-homework': 'गृहपाठ अपूर्ण',
        'opt-incident-discipline': 'शिस्तभंग घटना',
        'opt-incident-health': 'आरोग्य चिंता',
        'lbl-action-taken': 'केलेली कारवाई / टिपा',
        
        // Modals SMS alert
        'sms-title': 'WhatsApp / SMS अलर्ट सिम्युलेटर',
        'sms-desc': 'पालकांना पाठवण्यासाठी संदेश मसुदा करा. खऱ्या प्रणालीत हे WhatsApp/SMS API ला जोडले जाते.',
        'lbl-sms-template': 'पूर्वनिर्धारित टेम्पलेट निवडा',
        'sms-opt-absent': 'गैरहजेरीची सूचना',
        'sms-opt-fee': 'फी थकीत आठवण',
        'sms-opt-remark': 'सामान्य शिक्षक अभिप्राय',
        'lbl-message-body': 'संदेशाचा मजकूर',
        'btn-send-now': 'सिम्युलेटेड अलर्ट पाठवा',
        'btn-mark-attendance': 'उपस्थिती नोंदवा',
        'title-mark-attendance': 'दैनिक उपस्थिती नोंदवा',
        'lbl-mark-attendance-desc': 'आजसाठी निवडलेल्या इयत्ता/तुकडीच्या विद्यार्थ्यांची उपस्थिती नोंदवा.',
        'lbl-attendance-status': 'उपस्थिती स्थिती'
    }
};

// ==========================================
// 2. MOCK STUDENT DATABASE INITIALIZER
// ==========================================

const initialMockStudents = [
    {
        "id": "stud-101",
        "name": {
            "en": "Avadhut Suryavanshi",
            "mr": "अवधूत सूर्यवंशी"
        },
        "rollNo": 1,
        "standard": "5",
        "section": "",
        "phone": "8788708865",
        "parentName": "",
        "address": "",
        "emergencyContact": "8788708865",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-101"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-102",
        "name": {
            "en": "Yash Mali",
            "mr": "यश माळी"
        },
        "rollNo": 2,
        "standard": "5",
        "section": "",
        "phone": "9022388015",
        "parentName": "",
        "address": "",
        "emergencyContact": "9022388015",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-103",
        "name": {
            "en": "Swapnil Vaidya",
            "mr": "स्वप्नील वैद्य"
        },
        "rollNo": 3,
        "standard": "5",
        "section": "",
        "phone": "9370531117",
        "parentName": "",
        "address": "",
        "emergencyContact": "9370531117",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-103"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-104",
        "name": {
            "en": "Rudraksh Jadhav",
            "mr": "रुद्राक्ष जाधव"
        },
        "rollNo": 4,
        "standard": "6",
        "section": "",
        "phone": "9764129791",
        "parentName": "",
        "address": "",
        "emergencyContact": "9764129791",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-104"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-105",
        "name": {
            "en": "Shyam Shingare",
            "mr": "श्याम शिनगारे"
        },
        "rollNo": 5,
        "standard": "6",
        "section": "",
        "phone": "9370728229",
        "parentName": "",
        "address": "",
        "emergencyContact": "9370728229",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-106",
        "name": {
            "en": "Dnyaneshwar Doifode",
            "mr": "ज्ञानेश्वर डोईफोडे"
        },
        "rollNo": 6,
        "standard": "6",
        "section": "",
        "phone": "9923629163",
        "parentName": "",
        "address": "",
        "emergencyContact": "9923629163",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-106"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-107",
        "name": {
            "en": "Kartik Kangulkar",
            "mr": "कार्तिक कानगुळकर"
        },
        "rollNo": 7,
        "standard": "7",
        "section": "",
        "phone": "9637209286",
        "parentName": "",
        "address": "",
        "emergencyContact": "9637209286",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-108",
        "name": {
            "en": "Rudraksh Powale",
            "mr": "रुद्राक्ष पोवळे"
        },
        "rollNo": 8,
        "standard": "7",
        "section": "",
        "phone": "8446812069",
        "parentName": "",
        "address": "",
        "emergencyContact": "8446812069",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 20000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 20000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-108"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-109",
        "name": {
            "en": "Kunal Linge",
            "mr": "कुणाल लिंगे"
        },
        "rollNo": 9,
        "standard": "8",
        "section": "",
        "phone": "8308500905",
        "parentName": "",
        "address": "",
        "emergencyContact": "8308500905",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 20000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 20000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-109"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-110",
        "name": {
            "en": "Tanmay Sawant",
            "mr": "तन्मय सावंत"
        },
        "rollNo": 10,
        "standard": "8",
        "section": "",
        "phone": "9890976430",
        "parentName": "",
        "address": "",
        "emergencyContact": "9890976430",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-111",
        "name": {
            "en": "Sangam Todkar",
            "mr": "संगम तोडकर"
        },
        "rollNo": 11,
        "standard": "8",
        "section": "",
        "phone": "9763579266",
        "parentName": "",
        "address": "",
        "emergencyContact": "9763579266",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-112",
        "name": {
            "en": "Akshay Thokal",
            "mr": "अक्षय ठोकळ"
        },
        "rollNo": 12,
        "standard": "9",
        "section": "",
        "phone": "9822815378",
        "parentName": "",
        "address": "",
        "emergencyContact": "9822815378",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 25000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 25000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-112"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-113",
        "name": {
            "en": "Ganesh Auti",
            "mr": "गणेश औटी"
        },
        "rollNo": 13,
        "standard": "9",
        "section": "",
        "phone": "8080298221",
        "parentName": "",
        "address": "",
        "emergencyContact": "8080298221",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 14000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 14000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-113"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-114",
        "name": {
            "en": "Sanket Masule",
            "mr": "संकेत मासुळे"
        },
        "rollNo": 14,
        "standard": "9",
        "section": "",
        "phone": "9922260339",
        "parentName": "",
        "address": "",
        "emergencyContact": "9922260339",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-115",
        "name": {
            "en": "Lucky Baghul",
            "mr": "लक्की बाघुल"
        },
        "rollNo": 15,
        "standard": "5",
        "section": "",
        "phone": "9822015610",
        "parentName": "",
        "address": "",
        "emergencyContact": "9822015610",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-115"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-116",
        "name": {
            "en": "Ishwar Rahane",
            "mr": "ईश्वर राहणे"
        },
        "rollNo": 16,
        "standard": "9",
        "section": "",
        "phone": "9699479539",
        "parentName": "",
        "address": "",
        "emergencyContact": "9699479539",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-117",
        "name": {
            "en": "Vedant Ubre",
            "mr": "वेदांत उब्रे"
        },
        "rollNo": 17,
        "standard": "9",
        "section": "",
        "phone": "8308547841",
        "parentName": "",
        "address": "",
        "emergencyContact": "8308547841",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-118",
        "name": {
            "en": "Ankush Kolpe",
            "mr": "अंकुश कोळपे"
        },
        "rollNo": 18,
        "standard": "9",
        "section": "",
        "phone": "8007095027",
        "parentName": "",
        "address": "",
        "emergencyContact": "8007095027",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-118"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-119",
        "name": {
            "en": "Omkar Gawali",
            "mr": "ओमकार गवळी"
        },
        "rollNo": 19,
        "standard": "9",
        "section": "",
        "phone": "9860190121",
        "parentName": "",
        "address": "",
        "emergencyContact": "9860190121",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 20000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 20000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-119"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-120",
        "name": {
            "en": "Piyush Jagtap",
            "mr": "पियुष जगताप"
        },
        "rollNo": 20,
        "standard": "9",
        "section": "",
        "phone": "7775843122",
        "parentName": "",
        "address": "",
        "emergencyContact": "7775843122",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-120"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-121",
        "name": {
            "en": "Dinanath Koli",
            "mr": "दिनानाथ कोळी"
        },
        "rollNo": 21,
        "standard": "9",
        "section": "",
        "phone": "9604157102",
        "parentName": "",
        "address": "",
        "emergencyContact": "9604157102",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-121"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-122",
        "name": {
            "en": "Yash Shinde",
            "mr": "यश शिंदे"
        },
        "rollNo": 22,
        "standard": "9",
        "section": "",
        "phone": "9623730171",
        "parentName": "",
        "address": "",
        "emergencyContact": "9623730171",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-123",
        "name": {
            "en": "Bhavesh Jogdand",
            "mr": "भावेश जोगदंड"
        },
        "rollNo": 23,
        "standard": "10",
        "section": "",
        "phone": "7218736404",
        "parentName": "",
        "address": "",
        "emergencyContact": "7218736404",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-123"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-124",
        "name": {
            "en": "Ram Shingare",
            "mr": "राम शिनगारे"
        },
        "rollNo": 24,
        "standard": "10",
        "section": "",
        "phone": "9370172829",
        "parentName": "",
        "address": "",
        "emergencyContact": "9370172829",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-125",
        "name": {
            "en": "Parth More",
            "mr": "पार्थ मोरे"
        },
        "rollNo": 25,
        "standard": "10",
        "section": "",
        "phone": "9767242663",
        "parentName": "",
        "address": "",
        "emergencyContact": "9767242663",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 20000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 20000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-125"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-126",
        "name": {
            "en": "Aryan Ugale",
            "mr": "आर्यन उगले"
        },
        "rollNo": 26,
        "standard": "10",
        "section": "",
        "phone": "8830721852",
        "parentName": "",
        "address": "",
        "emergencyContact": "8830721852",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-127",
        "name": {
            "en": "Krishna Shrikhande",
            "mr": "कृष्णा श्रीखंडे"
        },
        "rollNo": 27,
        "standard": "9",
        "section": "",
        "phone": "7378975076",
        "parentName": "",
        "address": "",
        "emergencyContact": "7378975076",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-127"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-128",
        "name": {
            "en": "Vinayak Chugurwad",
            "mr": "विनायक चुगुरवाड"
        },
        "rollNo": 28,
        "standard": "5",
        "section": "",
        "phone": "8446217931",
        "parentName": "",
        "address": "",
        "emergencyContact": "8446217931",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-129",
        "name": {
            "en": "Samarth Digambar",
            "mr": "समर्थ दिगंबर"
        },
        "rollNo": 29,
        "standard": "6",
        "section": "",
        "phone": "9699489388",
        "parentName": "",
        "address": "",
        "emergencyContact": "9699489388",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-130",
        "name": {
            "en": "Vaibhav Kale",
            "mr": "वैभव काळे"
        },
        "rollNo": 30,
        "standard": "8",
        "section": "",
        "phone": "9920927243",
        "parentName": "",
        "address": "",
        "emergencyContact": "9920927243",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-130"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-131",
        "name": {
            "en": "Krishna Chatarkar",
            "mr": "कृष्णा चतरकर"
        },
        "rollNo": 31,
        "standard": "",
        "section": "",
        "phone": "9604890325",
        "parentName": "",
        "address": "",
        "emergencyContact": "9604890325",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-131"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-132",
        "name": {
            "en": "Yash Chatarkar",
            "mr": "यश चतरकर"
        },
        "rollNo": 32,
        "standard": "",
        "section": "",
        "phone": "7567531712",
        "parentName": "",
        "address": "",
        "emergencyContact": "7567531712",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-132"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-133",
        "name": {
            "en": "Yuvraj Bajad",
            "mr": "युवराज बाजड"
        },
        "rollNo": 33,
        "standard": "",
        "section": "",
        "phone": "7517360458",
        "parentName": "",
        "address": "",
        "emergencyContact": "7517360458",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-133"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-134",
        "name": {
            "en": "Dharmet Patil",
            "mr": "धर्मेत पाटील"
        },
        "rollNo": 34,
        "standard": "5",
        "section": "",
        "phone": "9764090546",
        "parentName": "",
        "address": "",
        "emergencyContact": "9764090546",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-134"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-135",
        "name": {
            "en": "Vedant Gavhane",
            "mr": "वेदांत गव्हाणे"
        },
        "rollNo": 35,
        "standard": "7",
        "section": "",
        "phone": "9922186245",
        "parentName": "",
        "address": "",
        "emergencyContact": "9922186245",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-135"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-136",
        "name": {
            "en": "Sandip Waghmare",
            "mr": "संदिप वाघमारे"
        },
        "rollNo": 36,
        "standard": "7",
        "section": "",
        "phone": "9309743447",
        "parentName": "",
        "address": "",
        "emergencyContact": "9309743447",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-137",
        "name": {
            "en": "Atharv Waghmare",
            "mr": "अथर्व वाघमारे"
        },
        "rollNo": 37,
        "standard": "10",
        "section": "",
        "phone": "9309743447",
        "parentName": "",
        "address": "",
        "emergencyContact": "9309743447",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-138",
        "name": {
            "en": "Shivam Thorat",
            "mr": "शिवम थोरात"
        },
        "rollNo": 38,
        "standard": "9",
        "section": "",
        "phone": "9309743447",
        "parentName": "",
        "address": "",
        "emergencyContact": "9309743447",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-138"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-139",
        "name": {
            "en": "Saurav Kale",
            "mr": "सौरव काळे"
        },
        "rollNo": 39,
        "standard": "11",
        "section": "",
        "phone": "9130902058",
        "parentName": "",
        "address": "",
        "emergencyContact": "9130902058",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 25000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 25000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-139"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-140",
        "name": {
            "en": "Siddheshwar Waghmare",
            "mr": "सिद्धेश्वर वाघमारे"
        },
        "rollNo": 40,
        "standard": "7",
        "section": "",
        "phone": "9834126040",
        "parentName": "",
        "address": "",
        "emergencyContact": "9834126040",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-141",
        "name": {
            "en": "Dayanand Jadhav",
            "mr": "दयानंद जाधव"
        },
        "rollNo": 41,
        "standard": "10",
        "section": "",
        "phone": "9421231173",
        "parentName": "",
        "address": "",
        "emergencyContact": "9421231173",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-141"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-142",
        "name": {
            "en": "Santosh Sadar",
            "mr": "संतोष सदार"
        },
        "rollNo": 42,
        "standard": "9",
        "section": "",
        "phone": "9699788421",
        "parentName": "",
        "address": "",
        "emergencyContact": "9699788421",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-142"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-143",
        "name": {
            "en": "Malhari Chittapale",
            "mr": "मल्हारी चीत्तापले"
        },
        "rollNo": 43,
        "standard": "5",
        "section": "",
        "phone": "7057512323",
        "parentName": "",
        "address": "",
        "emergencyContact": "7057512323",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-144",
        "name": {
            "en": "Krishna Pawar",
            "mr": "कृष्णा पवार"
        },
        "rollNo": 44,
        "standard": "",
        "section": "",
        "phone": "9890370425",
        "parentName": "",
        "address": "",
        "emergencyContact": "9890370425",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-145",
        "name": {
            "en": "Avinash Pawar",
            "mr": "अविनाश पवार"
        },
        "rollNo": 45,
        "standard": "8",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-145"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-146",
        "name": {
            "en": "Jayesh Khedkar",
            "mr": "जयेश खेडकर"
        },
        "rollNo": 46,
        "standard": "",
        "section": "",
        "phone": "7083411817",
        "parentName": "",
        "address": "",
        "emergencyContact": "7083411817",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-146"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-147",
        "name": {
            "en": "Pranav Khedkar",
            "mr": "प्रणव खेडकर"
        },
        "rollNo": 47,
        "standard": "",
        "section": "",
        "phone": "8160159094",
        "parentName": "",
        "address": "",
        "emergencyContact": "8160159094",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-148",
        "name": {
            "en": "Sumit Marathe",
            "mr": "सुमित मराठे"
        },
        "rollNo": 48,
        "standard": "4",
        "section": "",
        "phone": "8160159084",
        "parentName": "",
        "address": "",
        "emergencyContact": "8160159084",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-148"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-149",
        "name": {
            "en": "Sarthak Suryavanshi",
            "mr": "सार्थक सूर्यवंशी"
        },
        "rollNo": 49,
        "standard": "10",
        "section": "",
        "phone": "8530310647",
        "parentName": "",
        "address": "",
        "emergencyContact": "8530310647",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-150",
        "name": {
            "en": "Gangadhar Panchal",
            "mr": "गंगाधर पांचाळ"
        },
        "rollNo": 50,
        "standard": "10",
        "section": "",
        "phone": "8766453901",
        "parentName": "",
        "address": "",
        "emergencyContact": "8766453901",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 15000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 15000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-150"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-151",
        "name": {
            "en": "Dnyaneshwar Panchal",
            "mr": "ज्ञानेश्वर पांचाळ"
        },
        "rollNo": 51,
        "standard": "8",
        "section": "",
        "phone": "9890417432",
        "parentName": "",
        "address": "",
        "emergencyContact": "9890417432",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-152",
        "name": {
            "en": "Ayush Bhandare",
            "mr": "आयुष भंडारे"
        },
        "rollNo": 52,
        "standard": "8",
        "section": "",
        "phone": "9922354512",
        "parentName": "",
        "address": "",
        "emergencyContact": "9922354512",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-152"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-153",
        "name": {
            "en": "Siddharth Kadam",
            "mr": "सिद्धार्थ कदम"
        },
        "rollNo": 53,
        "standard": "9",
        "section": "",
        "phone": "9763098702",
        "parentName": "",
        "address": "",
        "emergencyContact": "9763098702",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 8000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 8000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-153"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-154",
        "name": {
            "en": "Anukalp Yewale",
            "mr": "अनुकल्प येवले"
        },
        "rollNo": 54,
        "standard": "8",
        "section": "",
        "phone": "9075125458",
        "parentName": "",
        "address": "",
        "emergencyContact": "9075125458",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-155",
        "name": {
            "en": "Shreyas Dhamale",
            "mr": "श्रेयस ढमाले"
        },
        "rollNo": 55,
        "standard": "7",
        "section": "",
        "phone": "9158342334",
        "parentName": "",
        "address": "",
        "emergencyContact": "9158342334",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-156",
        "name": {
            "en": "Samarth Bajad",
            "mr": "समर्थ बाजड"
        },
        "rollNo": 56,
        "standard": "9",
        "section": "",
        "phone": "9322575840",
        "parentName": "",
        "address": "",
        "emergencyContact": "9322575840",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-157",
        "name": {
            "en": "Hariom Kangule",
            "mr": "हरिओम कानगुळे"
        },
        "rollNo": 57,
        "standard": "8",
        "section": "",
        "phone": "9011839547",
        "parentName": "",
        "address": "",
        "emergencyContact": "9011839547",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-157"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-158",
        "name": {
            "en": "Narayan Panchal",
            "mr": "नारायण पांचाळ"
        },
        "rollNo": 58,
        "standard": "6",
        "section": "",
        "phone": "8767997543",
        "parentName": "",
        "address": "",
        "emergencyContact": "8767997543",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-158"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-159",
        "name": {
            "en": "Bhavesh Khadse",
            "mr": "भावेश खडसे"
        },
        "rollNo": 59,
        "standard": "9",
        "section": "",
        "phone": "9604312185",
        "parentName": "",
        "address": "",
        "emergencyContact": "9604312185",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-160",
        "name": {
            "en": "Pratap Khedkar",
            "mr": "प्रताप खेडकर"
        },
        "rollNo": 60,
        "standard": "9",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 33000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 33000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-160"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-161",
        "name": {
            "en": "Shahaji Jadhav",
            "mr": "शहाजी जाधव"
        },
        "rollNo": 61,
        "standard": "8",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 5000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 5000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-161"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-162",
        "name": {
            "en": "Vitthal Bajad",
            "mr": "विठ्ठल बाजड"
        },
        "rollNo": 62,
        "standard": "11",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 12000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 12000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-162"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-163",
        "name": {
            "en": "Pratap Jadhav",
            "mr": "प्रताप जाधव"
        },
        "rollNo": 63,
        "standard": "11",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-163"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-164",
        "name": {
            "en": "Gaurav Jadhav",
            "mr": "गौरव जाधव"
        },
        "rollNo": 64,
        "standard": "11",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-165",
        "name": {
            "en": "Om Sadar",
            "mr": "ओम सदार"
        },
        "rollNo": 65,
        "standard": "12",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-166",
        "name": {
            "en": "Rupesh Mohite",
            "mr": "रूपेश मोहिते"
        },
        "rollNo": 66,
        "standard": "12",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-167",
        "name": {
            "en": "Gajanan Jadhav",
            "mr": "गजानन जाधव"
        },
        "rollNo": 67,
        "standard": "12",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 10000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 10000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-167"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-168",
        "name": {
            "en": "Yash Bajad",
            "mr": "यश बाजड"
        },
        "rollNo": 68,
        "standard": "10",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-169",
        "name": {
            "en": "Rudra Jadhav",
            "mr": "रुद्र जाधव"
        },
        "rollNo": 69,
        "standard": "10",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 8500.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 8500.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-169"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-170",
        "name": {
            "en": "Kartik Bajad",
            "mr": "कार्तिक बाजड"
        },
        "rollNo": 70,
        "standard": "10",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-171",
        "name": {
            "en": "Sagar Ambhore",
            "mr": "सागर अंभोरे"
        },
        "rollNo": 71,
        "standard": "11",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 0,
            "ledger": []
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    },
    {
        "id": "stud-172",
        "name": {
            "en": "Aryan Sontakke",
            "mr": "आर्यन सोनटक्के"
        },
        "rollNo": 72,
        "standard": "11",
        "section": "",
        "phone": "",
        "parentName": "",
        "address": "",
        "emergencyContact": "",
        "attendance": [],
        "sessionAttendance": {},
        "subjects": {
            "Marathi": "",
            "Hindi": "",
            "English": "",
            "Maths": "",
            "Science": ""
        },
        "examHistory": [],
        "remarks": [],
        "complaints": [],
        "medical": {
            "bloodGroup": "",
            "allergies": "",
            "illness": "",
            "doctorNotes": ""
        },
        "fees": {
            "total": 35000.0,
            "paid": 35000.0,
            "ledger": [
                {
                    "date": "",
                    "amount": 35000.0,
                    "mode": "Cash",
                    "receipt": "REC-2026-172"
                }
            ]
        },
        "documents": [
            {
                "name": "Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "School Leaving Certificate",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Marksheet",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Student Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            },
            {
                "name": "Father Aadhaar Card",
                "status": "Pending",
                "size": "",
                "type": "PDF"
            },
            {
                "name": "Father Photo",
                "status": "Pending",
                "size": "",
                "type": "Image"
            }
        ]
    }
];

// ==========================================
// 3. APPLICATION STATE GLOBALS
// ==========================================
let currentLanguage = 'en';
let currentUser = null;
let currentActivePanel = 'panel-dashboard';
let studentsDatabase = [];
let selectedStudent = null;
let sortDirection = 'asc'; // 'asc' or 'desc'
let activeProfileSession = 'current';
let activeStudentData = null;

// ==========================================
// 3.1 SECURITY AND VALIDATION HELPERS
// ==========================================

// Generates a random salt (hex string)
function generateSalt() {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hashes a password with a salt using SHA-256 and returns a hex string
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Timing-safe constant-time comparison to prevent timing side-channel attacks
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) {
        let diff = 0;
        for (let i = 0; i < a.length; i++) {
            diff |= a.charCodeAt(i) ^ a.charCodeAt(i);
        }
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

// Regex-based HTML escape helper utility to prevent XSS
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return m;
        }
    });
}

// Input validation rules: alphanumeric, standard lengths
function validateInput(value, type) {
    if (typeof value !== 'string') return false;
    if (type === 'username') {
        const usernameRegex = /^[a-zA-Z0-9]{4,15}$/;
        return usernameRegex.test(value);
    }
    if (type === 'password') {
        const passwordRegex = /^[ -~]{3,30}$/; // min 3, max 30 chars
        return passwordRegex.test(value);
    }
    if (type === 'name') {
        const nameRegex = /^[a-zA-Z0-9\s\u0900-\u097F]{2,50}$/;
        return nameRegex.test(value);
    }
    return true;
}

// Seed default administrator credentials (swapnil / swapnil) securely.
async function seedDefaultAdmin() {
    const existingHash = localStorage.getItem('vss_admin_password_hash');
    const plainTextPassword = localStorage.getItem('vss_admin_password');
    
    if (!existingHash && !plainTextPassword) {
        const defaultPassword = 'swapnil';
        const salt = generateSalt();
        const hash = await hashPassword(defaultPassword, salt);
        localStorage.setItem('vss_admin_password_hash', hash);
        localStorage.setItem('vss_admin_password_salt', salt);
        console.log("Default admin credentials seeded securely.");
    }
    // Apply the requested demo credential once, including for older installations.
    if (localStorage.getItem('vss_credentials_version') !== '4') {
        localStorage.removeItem('vss_pwd_ankush');
        localStorage.removeItem('vss_pwd_swapnil');
        const salt = generateSalt();
        localStorage.setItem('vss_admin_password_hash', await hashPassword('Ankush@1232', salt));
        localStorage.setItem('vss_admin_password_salt', salt);
        localStorage.setItem('vss_credentials_version', '4');
    }
}

function registerFailedLogin() {
    const attempts = Number(sessionStorage.getItem('vss_login_attempts') || 0) + 1;
    sessionStorage.setItem('vss_login_attempts', String(attempts));
    if (attempts >= 5) {
        sessionStorage.setItem('vss_login_locked_until', String(Date.now() + (5 * 60 * 1000)));
        sessionStorage.removeItem('vss_login_attempts');
    }
}

// Migrate plain-text admin password database to SHA-256 + salt configuration
async function migratePasswordDatabase() {
    const plainTextPassword = localStorage.getItem('vss_admin_password');
    const existingHash = localStorage.getItem('vss_admin_password_hash');
    
    if (plainTextPassword && !existingHash) {
        const salt = generateSalt();
        const hash = await hashPassword(plainTextPassword, salt);
        localStorage.setItem('vss_admin_password_hash', hash);
        localStorage.setItem('vss_admin_password_salt', salt);
        localStorage.removeItem('vss_admin_password');
        console.log("Plain-text admin credentials migrated to secure SHA-256 + salt hash.");
    }
}

// ==========================================
// 4. BOOTSTRAP EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Run secure migration and default seeds before starting listeners
    await seedDefaultAdmin();
    await migratePasswordDatabase();

    // 4.1 Initialize Local Storage Database (preserve cloud and user data)
    let stored = localStorage.getItem('vss_students');
    let parsed = null;
    try { parsed = JSON.parse(stored); } catch (_) { }

    if (Array.isArray(parsed) && parsed.length > 0) {
        studentsDatabase = parsed;
    } else {
        localStorage.setItem('vss_students', JSON.stringify(initialMockStudents));
        studentsDatabase = initialMockStudents;
    }
    window.studentsDatabase = studentsDatabase;

    window.vssReloadFromStorage = function () {
        try {
            const raw = localStorage.getItem('vss_students');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.length > 0) {
                    studentsDatabase = list;
                    window.studentsDatabase = list;
                    if (typeof renderStudentTable === 'function') renderStudentTable();
                    if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
                }
            }
        } catch (_) { }
    };
    
    // Shared school computers must always begin at the sign-in screen.
    currentUser = null;
    showLoginScreen();

    setupTranslationListeners();
    setupAuthListeners();
    setupNavigationListeners();
    setupStudentDirectoryListeners();
    setupProfileTabsListeners();
    setupRemarkFormListener();
    setupPaymentFormListener();
    setupMedicalEditListener();
    setupIncidentLogListener();
    setupDocumentUploadListener();
    setupBulkImportListener();
    setupBackupRestoreListeners();
    setupWhatsAppModalListeners();
    setupMarkAttendanceListeners();
    updateAdminUI();
    setupAdminProfileListener();
    updateLoginBiometricsUI();
});

// ==========================================
// 5. TRANSLATION ENGINE & HELPERS
// ==========================================
function getStudentName(stud) {
    if (!stud) return '';
    if (typeof stud.name === 'object') {
        return currentLanguage === 'mr' ? stud.name.mr : stud.name.en;
    }
    return stud.name;
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-key]').forEach(elem => {
        const key = elem.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            // Check if element has child HTML elements we want to preserve (like icon <i> tags)
            const iconElem = elem.querySelector('i');
            if (iconElem) {
                const iconHTML = iconElem.outerHTML;
                elem.innerHTML = iconHTML + ' ' + translations[lang][key];
            } else {
                elem.textContent = translations[lang][key];
            }
        }
    });

    document.querySelectorAll('[data-key-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-key-placeholder');
        if (translations[lang] && translations[lang][key]) {
            elem.setAttribute('placeholder', translations[lang][key]);
        }
    });

    // Toggle active state on language switcher buttons
    document.querySelectorAll('#lang-en, .lang-en-btn').forEach(btn => btn.classList.toggle('active', lang === 'en'));
    document.querySelectorAll('#lang-mr, .lang-mr-btn').forEach(btn => btn.classList.toggle('active', lang === 'mr'));
    
    // Refresh directory lists or profile dynamically if visible
    if (currentUser) {
        updatePageTitle();
        renderDashboardMetrics();
        renderStudentTable();
        if (selectedStudent) {
            renderStudentProfile(selectedStudent.id);
        }
    }
}

function setupTranslationListeners() {
    document.querySelectorAll('#lang-en, .lang-en-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('en');
        });
    });
    document.querySelectorAll('#lang-mr, .lang-mr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('mr');
        });
    });
    
    // Set default initial language
    setLanguage('en');
}

function updatePageTitle() {
    const pageTitleElem = document.getElementById('page-title');
    const targetKey = document.querySelector(`.sidebar-menu .menu-item[data-target="${currentActivePanel}"]`)?.getAttribute('data-target');
    
    let key = 'menu-dashboard';
    if (targetKey === 'panel-students') key = 'menu-students';
    if (targetKey === 'panel-import') key = 'menu-import';
    if (targetKey === 'panel-backup') key = 'menu-backup';
    if (currentActivePanel === 'panel-student-profile') key = 'tab-progress';

    if (translations[currentLanguage][key]) {
        pageTitleElem.textContent = translations[currentLanguage][key];
    }
}

// ==========================================
// 6. AUTHENTICATION CONTROLLERS
// ==========================================
function showLoginScreen() {
    document.getElementById('auth-container').classList.remove('d-none');
    document.getElementById('app-container').classList.add('d-none');
    document.getElementById('mobile-bottom-nav')?.classList.add('d-none');
    const fab = document.getElementById('ai-chat-fab');
    if (fab) { fab.classList.add('d-none'); fab.style.display = 'none'; }
    document.getElementById('ai-chat-panel')?.classList.add('d-none');
    updateLoginBiometricsUI();
}

function hideLoginScreen() {
    document.getElementById('auth-container').classList.add('d-none');
    document.getElementById('app-container').classList.remove('d-none');
    document.getElementById('mobile-bottom-nav')?.classList.remove('d-none');
    const fab = document.getElementById('ai-chat-fab');
    if (fab) { fab.classList.remove('d-none'); fab.style.display = ''; }
}

function launchApp() {
    hideLoginScreen();
    
    if (currentUser.role === 'admin') {
        const storedAdmin = localStorage.getItem('vss_admin_profile_' + currentUser.username);
        if (storedAdmin) {
            try {
                const p = JSON.parse(storedAdmin);
                if (p && p.name) currentUser.name = p.name;
            } catch (_) { /* ignore */ }
        }
    }

    
    // Update user badge in Sidebar & Header
    const userInitials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('sidebar-user-avatar').textContent = userInitials;
    document.getElementById('header-user-avatar').textContent = userInitials;
    document.getElementById('sidebar-user-name').textContent = currentUser.name;
    
    // Localize Role string
    const roleStr = currentUser.role === 'admin' ? 
        (currentLanguage === 'en' ? 'Administrator' : 'व्यवस्थापक (Admin)') : 
        (currentLanguage === 'en' ? `Class ${currentUser.assignedClass} Teacher` : `वर्ग ${currentUser.assignedClass} शिक्षक`);
    document.getElementById('sidebar-user-role').textContent = roleStr;

    if (currentUser.role === 'admin') {
        updateAdminUI();
    }

    // Apply role restrictions
    applyRoleBasedUI();

    // Trigger metrics update
    renderDashboardMetrics();
    renderStudentTable();
    populateNotificationCenter();
    
    // Default open panel
    switchPanel('panel-dashboard');
}

function applyRoleBasedUI() {
    const btnAddStudent = document.getElementById('btn-add-student');
    const cardAddPayment = document.getElementById('card-add-payment');
    const btnDeleteStudent = document.getElementById('btn-delete-student');
    const filterClass = document.getElementById('filter-class');

    if (currentUser.role === 'teacher') {
        // Hide add/delete students and record payments
        if (btnAddStudent) btnAddStudent.classList.add('d-none');
        if (cardAddPayment) cardAddPayment.classList.add('d-none');
        if (btnDeleteStudent) btnDeleteStudent.classList.add('d-none');
        
        // Force list filter to teacher's class standard and lock dropdown
        if (filterClass) {
            filterClass.value = currentUser.assignedClass;
            filterClass.disabled = true;
        }
    } else {
        // Admin access rules
        if (btnAddStudent) btnAddStudent.classList.remove('d-none');
        if (cardAddPayment) cardAddPayment.classList.remove('d-none');
        if (btnDeleteStudent) btnDeleteStudent.classList.remove('d-none');
        
        if (filterClass) {
            filterClass.disabled = false;
        }
    }
}

function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.getElementById('btn-login-submit');

    const handleLoginSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        
        const rawUsername = (document.getElementById('username')?.value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        const rawPassword = (document.getElementById('password')?.value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        const rememberMe = !!document.getElementById('remember')?.checked;

        if (!rawUsername || !rawPassword) {
            createToast(currentLanguage === 'en' ? 'Please enter username and password.' : 'कृपया वापरकर्तानाव आणि पासवर्ड प्रविष्ट करा.', 'warning');
            return;
        }

        // Credential check (case-insensitive username, case & space tolerant password)
        const ACCOUNTS = window.VSS_ACCOUNTS || (window.VSS_ACCOUNTS = {
            ankush: { password: 'Ankush@1232', name: 'Ankush Maharaj Kadam' },
            swapnil: { password: 'Swapnil@1232', name: 'Swapnil Vaidya' }
        });

        let uKey = rawUsername.toLowerCase();
        if (uKey === 'admin' || uKey.includes('ankush') || uKey.includes('kadam')) {
            uKey = 'ankush';
        } else if (uKey.includes('swapnil') || uKey.includes('vaidya')) {
            uKey = 'swapnil';
        }

        const account = ACCOUNTS[uKey];
        const storedPass = (localStorage.getItem('vss_pwd_' + uKey) || '').trim();
        const defaultPass = (account ? account.password : '').trim();

        const passMatches = Boolean(account) && (
            (rawPassword === defaultPass) ||
            (rawPassword.toLowerCase() === defaultPass.toLowerCase()) ||
            (storedPass && rawPassword === storedPass) ||
            (storedPass && rawPassword.toLowerCase() === storedPass.toLowerCase()) ||
            (uKey === 'ankush' && (rawPassword === 'Ankush@1232' || rawPassword.toLowerCase() === 'ankush@1232')) ||
            (uKey === 'swapnil' && (rawPassword === 'Swapnil@1232' || rawPassword.toLowerCase() === 'swapnil@1232'))
        );

        if (!passMatches) {
            const lockedUntil = Number(sessionStorage.getItem('vss_login_locked_until') || 0);
            if (Date.now() < lockedUntil) {
                createToast(`Too many attempts. Please wait ${Math.ceil((lockedUntil - Date.now()) / 60000)} minute(s).`, 'danger');
                return;
            }
            if (typeof registerFailedLogin === 'function') registerFailedLogin();
            createToast(currentLanguage === 'en' ? 'Invalid username or password!' : 'चुकीचे वापरकर्तानाव किंवा पासवर्ड!', 'danger');
            return;
        }

        // Correct password -> clear any stale lockouts
        sessionStorage.removeItem('vss_login_attempts');
        sessionStorage.removeItem('vss_login_locked_until');

        window.vssLoginAs(uKey, rememberMe);
        if (loginForm) loginForm.reset();
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            // Backup for mobile touch where form submit might not fire cleanly
            if (!loginForm) handleLoginSubmit(e);
        });
    }

    // Programmatic sign-in (used by password login + fingerprint login)
    window.vssLoginAs = function (uKey, rememberMe) {
        const ACCOUNTS = window.VSS_ACCOUNTS || {};
        const account = ACCOUNTS[uKey] || { name: uKey };
        let adminProfile = { name: account.name };
        try {
            const storedAdmin = localStorage.getItem('vss_admin_profile_' + uKey);
            if (storedAdmin) adminProfile = JSON.parse(storedAdmin);
        } catch (_) { /* ignore */ }
        currentUser = { username: uKey, name: adminProfile.name || account.name, role: 'admin' };
        window.currentUser = currentUser;
        updateAdminUI();
        sessionStorage.removeItem('vss_login_attempts');
        sessionStorage.removeItem('vss_login_locked_until');

        if (rememberMe) {
            localStorage.setItem('vss_session_user', JSON.stringify(currentUser));
        }

        createToast(currentLanguage === 'en' ? `Welcome back, ${currentUser.name}!` : `स्वागत आहे, ${currentUser.name}!`, 'success');
        launchApp();
    };


    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('vss_session_user');
        showLoginScreen();
        createToast(currentLanguage === 'en' ? 'Logged out successfully.' : 'यशस्वीरित्या लॉगआउट झाले.', 'info');
    });

    // Forgot password simulation dialog launcher
    const forgotModal = document.getElementById('forgot-password-modal');
    const closeForgotBtns = document.querySelectorAll('.btn-close-forgot');
    
    document.getElementById('btn-forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        forgotModal.classList.add('active');
        document.getElementById('otp-area').classList.add('d-none');
        document.getElementById('btn-send-otp').classList.remove('d-none');
        document.getElementById('btn-verify-otp').classList.add('d-none');
        document.getElementById('forgot-input').disabled = false;
        document.getElementById('forgot-input').value = '';
    });

    closeForgotBtns.forEach(btn => {
        btn.addEventListener('click', () => forgotModal.classList.remove('active'));
    });

    // Download App button on login page
    const btnDownloadApp = document.getElementById('btn-login-download-app');
    const downloadAppMsg = document.getElementById('download-app-message');
    if (btnDownloadApp) {
        btnDownloadApp.addEventListener('click', (e) => {
            e.preventDefault();
            if (downloadAppMsg) {
                downloadAppMsg.classList.remove('d-none');
                downloadAppMsg.style.display = 'block';
            }
            createToast('⏳ Wait 5 hours / ५ तासांनंतर प्रयत्न करा.', 'warning');
        });
    }

    // OTP workflow simulator
    document.getElementById('btn-send-otp').addEventListener('click', () => {
        const contactInput = document.getElementById('forgot-input').value.trim();
        if (!contactInput) {
            createToast(currentLanguage === 'en' ? 'Please enter email or phone!' : 'कृपया ईमेल किंवा फोन नंबर प्रविष्ट करा!', 'warning');
            return;
        }
        document.getElementById('forgot-input').disabled = true;
        document.getElementById('otp-area').classList.remove('d-none');
        document.getElementById('btn-send-otp').classList.add('d-none');
        document.getElementById('btn-verify-otp').classList.remove('d-none');
        createToast(currentLanguage === 'en' ? 'Simulated OTP code: 123456 sent!' : 'सिम्युलेटेड OTP कोड: 123456 पाठवला आहे!', 'success');
    });

    document.getElementById('btn-verify-otp').addEventListener('click', async () => {
        const code = document.getElementById('otp-input').value.trim();
        const newPass = document.getElementById('new-pass-input').value.trim();

        if (code !== '123456') {
            createToast(currentLanguage === 'en' ? 'Incorrect OTP code!' : 'चुकीचा OTP कोड!', 'danger');
            return;
        }
        if (!newPass) {
            createToast(currentLanguage === 'en' ? 'Please enter a new password!' : 'कृपया नवीन पासवर्ड प्रविष्ट करा!', 'warning');
            return;
        }

        // Input validation
        if (!validateInput(newPass, 'password')) {
            createToast(currentLanguage === 'en' ? 'Password must be at least 6 characters (ASCII only)!' : 'पासवर्ड किमान ६ अक्षरे लांब असावा (फक्त ASCII)!', 'danger');
            return;
        }

        // Hash and save securely
        const salt = generateSalt();
        const hash = await hashPassword(newPass, salt);
        localStorage.setItem('vss_admin_password_hash', hash);
        localStorage.setItem('vss_admin_password_salt', salt);

        createToast(currentLanguage === 'en' ? 'Password reset successfully! Log in now.' : 'पासवर्ड यशस्वीरित्या बदलला! आता लॉगिन करा.', 'success');
        forgotModal.classList.remove('active');
    });
}

// ==========================================
// 7. TOAST SYSTEM
// ==========================================
function createToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-circle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    // Play notification sound briefly
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.frequency.value = type === 'danger' ? 220 : 660; // low freq for err, high for success
        gain.gain.setValueAtTime(0.06, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.12);
    } catch(e) {}

    // Slide out after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 8. PANEL ROUTING AND NAVIGATION
// ==========================================
function switchPanel(panelId) {
    currentActivePanel = panelId;
    
    // Hide all panels
    document.querySelectorAll('.content-panel').forEach(p => p.classList.add('d-none'));
    
    // Show target panel
    const targetEl = document.getElementById(panelId);
    if (targetEl) targetEl.classList.remove('d-none');
    
    // If bot panel, initialize or focus
    if (panelId === 'panel-bot' && typeof window.vssRenderBotChat === 'function') {
        window.vssRenderBotChat();
    }
    
    // Sidebar Active Highlight sync
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        const isMatched = item.getAttribute('data-target') === panelId;
        item.classList.toggle('active', isMatched);
    });

    // Bottom nav active sync (mobile)
    document.querySelectorAll('.mobile-bottom-nav .mnav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === panelId);
    });

    // Close Mobile Drawer if active
    closeMobileDrawer();

    // Always start panels from the top on small screens
    const scroller = document.querySelector('.app-main-content');
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });

    // Update titles
    updatePageTitle();
}

function openMobileDrawer() {
    document.getElementById('app-sidebar').classList.add('active');
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.classList.add('active');
    document.body.classList.add('drawer-open');
}

function closeMobileDrawer() {
    document.getElementById('app-sidebar').classList.remove('active');
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.classList.remove('active');
    document.body.classList.remove('drawer-open');
}

function setupNavigationListeners() {
    // Menu items
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const panel = item.getAttribute('data-target');
            switchPanel(panel);
        });
    });

    // Mobile bottom navigation
    document.querySelectorAll('.mobile-bottom-nav .mnav-item').forEach(item => {
        item.addEventListener('click', () => {
            const panel = item.getAttribute('data-target');
            if (panel) {
                switchPanel(panel);
            } else if (item.id === 'mnav-attendance') {
                switchPanel('panel-students');
                document.getElementById('btn-mark-attendance')?.click();
            }
        });
    });

    // Mobile Hamburger drawer toggles
    document.getElementById('btn-mobile-menu').addEventListener('click', openMobileDrawer);
    document.getElementById('btn-sidebar-close').addEventListener('click', closeMobileDrawer);
    document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileDrawer(); });


    // Dropdown notification bell toggle (safeguarded if notification bell removed)
    const btnNotif = document.getElementById('btn-notifications');
    const notifDropdown = document.getElementById('notif-dropdown');
    
    if (btnNotif && notifDropdown) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('d-none');
        });
        
        document.addEventListener('click', () => {
            notifDropdown.classList.add('d-none');
        });

        const btnClear = document.getElementById('btn-clear-notif');
        if (btnClear) {
            btnClear.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const list = document.getElementById('notif-list');
                if (list) {
                    list.innerHTML = `
                        <div class="empty-state text-sm py-4">
                            <p>${currentLanguage === 'en' ? 'No notifications' : 'कोणत्याही सूचना नाहीत'}</p>
                        </div>
                    `;
                }
                const count = document.getElementById('notif-count');
                if (count) {
                    count.textContent = '0';
                    count.classList.add('d-none');
                }
            });
        }
    }
}

// ==========================================
// 9. DASHBOARD STATS COMPUTATION
// ==========================================
function renderDashboardMetrics() {
    // Total Students Count
    const records = getActiveStudents();
    document.getElementById('stat-total-students').textContent = records.length;

    // Today's Attendance calculation
    const todayISO = new Date().toISOString().slice(0, 10);
    let presentCount = 0;
    records.forEach(stud => {
        const daily = stud.dailyAttendance || {};
        if (daily[todayISO]) {
            const r = daily[todayISO];
            if (r.morning || r.evening || r.school || r.present) presentCount++;
        } else {
            const dates = Object.keys(daily);
            if (dates.length > 0) {
                const latest = dates.sort().reverse()[0];
                const r = daily[latest];
                if (r && (r.morning || r.evening || r.school || r.present)) presentCount++;
            } else if (Array.isArray(stud.attendance) && stud.attendance.length > 0) {
                if (stud.attendance[stud.attendance.length - 1]) presentCount++;
            }
        }
    });
    
    const attendancePct = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;
    document.getElementById('stat-attendance-rate').textContent = `${attendancePct}%`;

    // Fees Collected sum
    let totalCollected = 0;
    records.forEach(stud => {
        const ledger = (stud.fees && Array.isArray(stud.fees.ledger)) ? stud.fees.ledger : [];
        ledger.forEach(p => totalCollected += Number(p.amount || 0));
    });
    document.getElementById('stat-fees-collected').textContent = `₹${totalCollected.toLocaleString('en-IN')}`;

    // Issues count: pending complaints + late fee warnings
    let totalIssues = 0;
    const issuesHTML = [];
    const clearedAlerts = JSON.parse(localStorage.getItem('vss_cleared_alerts') || '{}');
    
    records.forEach(stud => {
        // 1. Pending fee check (warning if unpaid and last payment > 30 days or never paid)
        const totalFee = stud.fees.total;
        const paidFee = stud.fees.paid;
        if (totalFee > paidFee && !clearedAlerts[`${stud.id}:fee`]) {
            totalIssues++;
            issuesHTML.push(`
                <div class="issue-card warning" onclick="openStudentFromIssue(event, '${stud.id}', 'tab-fees')">
                    <i class="fa-solid fa-indian-rupee-sign issue-icon text-orange"></i>
                    <div class="issue-body" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                            <h4 style="margin: 0; color: var(--secondary-color); font-weight: 700;">${getStudentName(stud)}</h4>
                            <button type="button" class="issue-btn-clear" onclick="clearDashboardIssue(event, '${stud.id}', 'fee')" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background-color: var(--white); font-size: 0.7rem; display: flex; align-items: center; gap: 4px; transition: all 0.2s;"><i class="fa-solid fa-check"></i> ${currentLanguage === 'en' ? 'Clear Alert' : 'सूचना काढा'}</button>
                        </div>
                        <p style="margin: 4px 0 0 0;">${currentLanguage === 'en' ? 'Reason: Fees pending' : 'कारण: फी थकीत'}: <b>₹${(totalFee - paidFee).toLocaleString('en-IN')}</b></p>
                    </div>
                </div>
            `);
        }

        // 2. Active disciplinary complaint warning
        if (stud.complaints.length > 0 && !clearedAlerts[`${stud.id}:complaint`]) {
            totalIssues++;
            const lastComplaint = stud.complaints[stud.complaints.length - 1];
            issuesHTML.push(`
                <div class="issue-card" onclick="openStudentFromIssue(event, '${stud.id}', 'tab-complaints')">
                    <i class="fa-solid fa-triangle-exclamation issue-icon text-red"></i>
                    <div class="issue-body" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                            <h4 style="margin: 0; color: var(--secondary-color); font-weight: 700;">${getStudentName(stud)}</h4>
                            <button type="button" class="issue-btn-clear" onclick="clearDashboardIssue(event, '${stud.id}', 'complaint')" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background-color: var(--white); font-size: 0.7rem; display: flex; align-items: center; gap: 4px; transition: all 0.2s;"><i class="fa-solid fa-check"></i> ${currentLanguage === 'en' ? 'Clear Alert' : 'सूचना काढा'}</button>
                        </div>
                        <p style="margin: 4px 0 0 0;">${currentLanguage === 'en' ? 'Reason: Disciplinary issue' : 'कारण: शिस्तीचा मुद्दा'}: <b>${lastComplaint.type}</b> (${lastComplaint.action})</p>
                    </div>
                </div>
            `);
        }
    });

    const elPending = document.getElementById('stat-pending-issues');
    if (elPending) elPending.textContent = totalIssues;
    const elWarning = document.getElementById('lbl-warning-count');
    if (elWarning) elWarning.textContent = currentLanguage === 'en' ? `${totalIssues} Issues` : `${totalIssues} सूचना`;

    // Render attention checklist inside dashboard panel (if present)
    const issuesContainer = document.getElementById('dashboard-issues-list');
    if (issuesContainer) {
        if (issuesHTML.length > 0) {
            issuesContainer.innerHTML = issuesHTML.join('');
        } else {
            issuesContainer.innerHTML = `
                <div class="empty-state text-sm">
                    <i class="fa-solid fa-circle-check" style="color: var(--color-success); font-size: 2.2rem;"></i>
                    <p>${currentLanguage === 'en' ? 'All clear! No issues require action.' : 'सर्व काही व्यवस्थित! कोणतीही समस्या नाही.'}</p>
                </div>
            `;
        }
    }

    // Donut chart segments update (if chart present)
    const segGood = document.getElementById('chart-segment-good');
    const segAvg = document.getElementById('chart-segment-average');
    const segWeak = document.getElementById('chart-segment-weak');

    if (segGood && segAvg && segWeak) {
        let goodRating = 0;
        let avgRating = 0;
        let weakRating = 0;

        records.forEach(stud => {
            let goodCount = 0;
            let weakCount = 0;
            Object.values(stud.subjects || {}).forEach(rating => {
                if (rating === 'Good') goodCount++;
                if (rating === 'Weak') weakCount++;
            });

            if (goodCount >= 3) {
                goodRating++;
            } else if (weakCount >= 2) {
                weakRating++;
            } else {
                avgRating++;
            }
        });

        const sumRatings = goodRating + avgRating + weakRating;
        const goodPct = sumRatings > 0 ? Math.round((goodRating / sumRatings) * 100) : 0;
        const avgPct = sumRatings > 0 ? Math.round((avgRating / sumRatings) * 100) : 0;
        const weakPct = sumRatings > 0 ? Math.round((weakRating / sumRatings) * 100) : 0;

        segGood.setAttribute('stroke-dasharray', `${goodPct} ${100 - goodPct}`);
        segGood.setAttribute('stroke-dashoffset', '25');

        segAvg.setAttribute('stroke-dasharray', `${avgPct} ${100 - avgPct}`);
        segAvg.setAttribute('stroke-dashoffset', `${25 - goodPct}`);

        segWeak.setAttribute('stroke-dasharray', `${weakPct} ${100 - weakPct}`);
        segWeak.setAttribute('stroke-dashoffset', `${25 - goodPct - avgPct}`);

        const elGoodCount = document.getElementById('lbl-good-count');
        if (elGoodCount) elGoodCount.textContent = currentLanguage === 'en' ? `${goodRating} Students` : `${goodRating} विद्यार्थी`;
        const elAvgCount = document.getElementById('lbl-average-count');
        if (elAvgCount) elAvgCount.textContent = currentLanguage === 'en' ? `${avgRating} Students` : `${avgRating} विद्यार्थी`;
        const elWeakCount = document.getElementById('lbl-weak-count');
        if (elWeakCount) elWeakCount.textContent = currentLanguage === 'en' ? `${weakRating} Students` : `${weakRating} विद्यार्थी`;
        
        const centerTitle = document.getElementById('donut-center-text');
        if (centerTitle) {
            if (goodPct >= avgPct && goodPct >= weakPct) {
                centerTitle.textContent = currentLanguage === 'en' ? 'Excellent' : 'उत्कृष्ट';
            } else if (avgPct >= weakPct) {
                centerTitle.textContent = currentLanguage === 'en' ? 'Average' : 'मध्यम';
            } else {
                centerTitle.textContent = currentLanguage === 'en' ? 'Weak' : 'कमकुवत';
            }
        }
    }
}

// Global hook to jump from warning cards to student profile tabs
window.openStudentFromIssue = function(event, studentId, tabTarget) {
    if (event) event.preventDefault();
    renderStudentProfile(studentId);
    
    // Click matching tab button
    const matchingTabBtn = document.querySelector(`.profile-tab-btn[data-tab="${tabTarget}"]`);
    if (matchingTabBtn) matchingTabBtn.click();
};

window.clearDashboardIssue = function(event, studentId, issueType) {
    if (event) {
        event.preventDefault();
        event.stopPropagation(); // Stop card redirection click from firing!
    }
    const cleared = JSON.parse(localStorage.getItem('vss_cleared_alerts') || '{}');
    cleared[`${studentId}:${issueType}`] = Date.now();
    localStorage.setItem('vss_cleared_alerts', JSON.stringify(cleared));
    renderDashboardMetrics();
    createToast('Alert cleared. The student record remains unchanged.', 'success');
};

// ==========================================
// 10. NOTIFICATION TIMELINE
// ==========================================
function populateNotificationCenter() {
    const list = document.getElementById('notif-list');
    const count = document.getElementById('notif-count');
    
    const notifs = [
        { type: 'red', icon: 'fa-circle-exclamation', text: currentLanguage === 'en' ? 'Vitthal Phule missed class for 5 days due to fever.' : 'विठ्ठल फुले तापाने ५ दिवस गैरहजर होता.', time: '1 hr ago' },
        { type: 'orange', icon: 'fa-indian-rupee-sign', text: currentLanguage === 'en' ? 'Fee reminder triggered for 3 pending balances.' : 'थकीत फीचे संदेश पालकांना पाठवले.', time: '3 hrs ago' }
    ];

    list.innerHTML = notifs.map(n => `
        <div class="notif-item">
            <div class="notif-icon ${n.type}"><i class="fa-solid ${n.icon}"></i></div>
            <div class="notif-content">
                <p>${n.text}</p>
                <span>${n.time}</span>
            </div>
        </div>
    `).join('');
    
    count.textContent = notifs.length;
    count.classList.remove('d-none');
}

// ==========================================
// 11. STUDENT DIRECTORY SYSTEM
// ==========================================
function getActiveStudents() {
    // If teacher role: filter by assignedClass
    if (currentUser && currentUser.role === 'teacher') {
        return studentsDatabase.filter(s => s.standard === currentUser.assignedClass);
    }
    return studentsDatabase;
}

function renderStudentTable() {
    const records = getActiveStudents();
    const searchVal = document.getElementById('search-student').value.toLowerCase().trim();
    const classFilter = document.getElementById('filter-class').value;
    const sectionFilter = document.getElementById('filter-section').value;
    
    // Filter
    let filtered = records.filter(stud => {
        const nameMatch = typeof stud.name === 'object' ? 
            (stud.name.en.toLowerCase().includes(searchVal) || stud.name.mr.toLowerCase().includes(searchVal)) : 
            stud.name.toLowerCase().includes(searchVal);
        const matchesSearch = nameMatch || 
                              stud.rollNo.toString().includes(searchVal) || 
                              stud.phone.includes(searchVal) || 
                              stud.parentName.toLowerCase().includes(searchVal);
        
        const matchesClass = classFilter === "" ? true : stud.standard === classFilter;
        const matchesSection = sectionFilter === "" ? true : stud.section === sectionFilter;

        return matchesSearch && matchesClass && matchesSection;
    });

    // Sort
    filtered.sort((a, b) => {
        const nameA = getStudentName(a).toLowerCase();
        const nameB = getStudentName(b).toLowerCase();
        if (sortDirection === 'asc') {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });

    // Render
    const tbody = document.getElementById('students-table-body');
    const tableHeader = document.getElementById('students-table');
    const emptyState = document.getElementById('no-students-found');
    
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tableHeader.classList.add('d-none');
        emptyState.classList.remove('d-none');
        return;
    }

    tableHeader.classList.remove('d-none');
    emptyState.classList.add('d-none');

    const L = currentLanguage === 'mr'
        ? { roll: 'हजेरी क्र.', cls: 'वर्ग', phone: 'फोन', parent: 'पालक', due: 'बाकी फी', paid: 'फी भरली', view: 'माहिती पहा' }
        : { roll: 'Roll No', cls: 'Class', phone: 'Phone', parent: 'Parent', due: 'Fees Due', paid: 'Fees Paid', view: 'View Details' };

    filtered.forEach(stud => {
        // Student Photo only (no initials placeholder)
        const studentNameStr = getStudentName(stud);

        const avatarHTML = stud.photo ?
            `<img src="${stud.photo}" alt="${studentNameStr}">` :
            `<i class="fa-regular fa-user"></i>`;


        const classStr = (stud.standard || stud.section)
            ? `${stud.standard || ''}${stud.section ? '-' + stud.section : ''}`
            : '—';
        const phoneStr = stud.phone
            ? `<a href="tel:${stud.phone}" class="cell-phone-link">${stud.phone}</a>`
            : '—';
        const total = Number(stud.fees?.total || 0);
        const paid = Number(stud.fees?.paid || 0);
        const due = Math.max(total - paid, 0);
        const feeBadge = due > 0
            ? `<span class="fee-pill fee-pill-due">₹${due.toLocaleString('en-IN')} ${L.due}</span>`
            : `<span class="fee-pill fee-pill-ok"><i class="fa-solid fa-check"></i> ${L.paid}</span>`;

        // Render Row
        const tr = document.createElement('tr');
        tr.className = 'student-row';
        tr.setAttribute('role', 'button');
        tr.setAttribute('tabindex', '0');
        tr.setAttribute('data-roll', stud.rollNo);
        tr.onclick = () => renderStudentProfile(stud.id);
        tr.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renderStudentProfile(stud.id); } };
        tr.innerHTML = `
            <td class="cell-photo">
                <div class="table-avatar-col">
                    <div class="table-avatar-badge">${avatarHTML}</div>
                    <span class="avatar-roll-number">${stud.rollNo}</span>
                </div>
            </td>
            <td class="cell-name">
                <span class="table-student-name" title="${L.view}">${studentNameStr}</span>
            </td>
            <td data-label="${L.cls}" class="${(stud.standard || stud.section) ? '' : 'cell-empty'}">${classStr}</td>
            <td data-label="${L.phone}" class="${stud.phone ? '' : 'cell-empty'}">${phoneStr}</td>
            <td data-label="${L.parent}" class="${stud.parentName ? '' : 'cell-empty'}">${stud.parentName || '—'}</td>
            <td class="cell-fees">${feeBadge}</td>
            <td class="cell-actions">
                <div class="table-actions">
                    <button class="btn-table-action view" onclick="event.stopPropagation(); renderStudentProfile('${stud.id}')" title="${L.view}">
                        <i class="fa-solid fa-eye"></i> <span class="btn-action-text">${L.view}</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

    });
}

function setupStudentDirectoryListeners() {
    const exportExcelBtn = document.getElementById('btn-export-excel');
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportStudentsToExcel);

    // Search
    document.getElementById('search-student').addEventListener('input', renderStudentTable);

    // Filters
    document.getElementById('filter-class').addEventListener('change', renderStudentTable);
    document.getElementById('filter-section').addEventListener('change', renderStudentTable);

    // Sorting A-Z/Z-A toggle
    const btnSort = document.getElementById('btn-sort');
    const sortLabel = document.getElementById('sort-label');
    
    btnSort.addEventListener('click', () => {
        if (sortDirection === 'asc') {
            sortDirection = 'desc';
            sortLabel.textContent = 'Z-A';
            btnSort.querySelector('i').className = 'fa-solid fa-sort-alpha-up';
        } else {
            sortDirection = 'asc';
            sortLabel.textContent = 'A-Z';
            btnSort.querySelector('i').className = 'fa-solid fa-sort-alpha-down';
        }
        renderStudentTable();
    });

    // Add Student Modal Workflow
    const addModal = document.getElementById('add-student-modal');
    const btnAdd = document.getElementById('btn-add-student');
    const closeBtns = document.querySelectorAll('.btn-close-student');
    
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            document.getElementById('form-student-detail').reset();
            addModal.classList.add('active');
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => addModal.classList.remove('active'));
    });

    const studForm = document.getElementById('form-student-detail');
    studForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const photoFile = document.getElementById('stud-photo-upload').files[0];
        
        const saveStudent = (photoBase64 = null) => {
            const newStud = {
                id: `stud-${Date.now()}`,
                name: {
                    en: document.getElementById('stud-fullname').value.trim(),
                    mr: document.getElementById('stud-fullname').value.trim()
                },
                photo: photoBase64,
                rollNo: parseInt(document.getElementById('stud-roll').value, 10),
                standard: document.getElementById('stud-class').value,
                section: document.getElementById('stud-section').value,
                phone: document.getElementById('stud-phone').value.trim(),
                parentName: document.getElementById('stud-parentname').value.trim(),
                emergencyContact: document.getElementById('stud-phone').value.trim(),
                attendance: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, document.getElementById('stud-attendance-init').value === 'present'],
                subjects: {
                    "Marathi": "Average",
                    "Hindi": "Average",
                    "English": "Average",
                    "Maths": "Average",
                    "Science": "Average"
                },
                examHistory: [60, 60, 60, 60],
                remarks: [],
                complaints: [],
                medical: {
                    bloodGroup: document.getElementById('stud-blood').value.trim() || 'O+',
                    allergies: document.getElementById('stud-allergies').value.trim() || 'None',
                    illness: 'None',
                    doctorNotes: 'Healthy child.'
                },
                fees: {
                    total: 10000,
                    paid: 0,
                    ledger: []
                },
                documents: []
            };

            // Check if Roll No already exists in the same class and section
            const exists = studentsDatabase.some(s => s.standard === newStud.standard && s.section === newStud.section && s.rollNo === newStud.rollNo);
            if (exists) {
                createToast(currentLanguage === 'en' ? 'Roll Number already exists in this class!' : 'हजेरी क्रमांक या वर्गात आधीच अस्तित्वात आहे!', 'danger');
                return;
            }

            studentsDatabase.push(newStud);
            saveDatabase();
            
            createToast(currentLanguage === 'en' ? 'Student added successfully!' : 'विद्यार्थी यशस्वीरित्या जोडला गेला!', 'success');
            addModal.classList.remove('active');
            renderStudentTable();
            renderDashboardMetrics();
        };

        if (photoFile) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                saveStudent(evt.target.result);
            };
            reader.readAsDataURL(photoFile);
        } else {
            saveStudent(null);
        }
    });
}

function saveDatabase() {
    localStorage.setItem('vss_students', JSON.stringify(studentsDatabase));
}

function exportStudentsToExcel() {
    const search = document.getElementById('search-student').value.toLowerCase().trim();
    const standard = document.getElementById('filter-class').value;
    const section = document.getElementById('filter-section').value;
    const records = getActiveStudents().filter(student => {
        const name = getStudentName(student).toLowerCase();
        return (!search || name.includes(search) || String(student.rollNo).includes(search) || student.phone.includes(search) || student.parentName.toLowerCase().includes(search)) &&
            (!standard || student.standard === standard) && (!section || student.section === section);
    });
    const rows = records.map(student => `<tr><td>${escapeHTML(getStudentName(student))}</td><td>${escapeHTML(String(student.rollNo))}</td><td>${escapeHTML(student.standard)}</td><td>${escapeHTML(student.section)}</td><td>${escapeHTML(student.phone)}</td><td>${escapeHTML(student.parentName)}</td><td>${student.fees.total}</td><td>${student.fees.paid}</td><td>${student.fees.total - student.fees.paid}</td></tr>`).join('');
    const workbook = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Student Name</th><th>Roll No</th><th>Class</th><th>Section</th><th>Phone</th><th>Parent / Guardian</th><th>Total Fees</th><th>Paid Fees</th><th>Balance</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vss-students-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    createToast(`${records.length} student record(s) exported to Excel.`, 'success');
}

// ==========================================
// 12. INDIVIDUAL PROFILE CONTROLLER
// ==========================================
function resolveProfileData() {
    if (!selectedStudent) return;
    
    if (activeProfileSession === 'current') {
        activeStudentData = selectedStudent;
    } else if (activeProfileSession === 'past1') {
        const prevStd = parseInt(selectedStudent.standard) - 1;
        const mockStd = prevStd > 4 ? prevStd.toString() : '5';
        activeStudentData = {
            ...selectedStudent,
            standard: mockStd,
            attendance: [true, true, true, false, true, true, true, true, false, true, true, true, true, false, true], 
            examHistory: [70, 75, 72, 80],
            subjects: { "Marathi": "Excellent", "Hindi": "Average", "English": "Average", "Maths": "Average", "Science": "Excellent" },
            remarks: [
                { date: "2025-10-12", text: "Regularly active in devotional singing assemblies.", author: "Sopan Maharaj", homework: true },
                { date: "2026-02-15", text: "Demonstrated strong grasp of spiritual scriptural texts.", author: "Sopan Maharaj", homework: true }
            ],
            complaints: [],
            fees: {
                total: 9500,
                paid: 9500,
                ledger: [
                    { date: "2025-06-10", amount: 5000, mode: "UPI", receipt: "REC-2025-102" },
                    { date: "2025-11-15", amount: 4500, mode: "Cash", receipt: "REC-2025-481" }
                ]
            }
        };
    } else if (activeProfileSession === 'past2') {
        const prevStd = parseInt(selectedStudent.standard) - 2;
        const mockStd = prevStd > 4 ? prevStd.toString() : '5';
        activeStudentData = {
            ...selectedStudent,
            standard: mockStd,
            attendance: [true, true, true, true, true, true, true, true, true, true], 
            examHistory: [65, 70, 68, 75],
            subjects: { "Marathi": "Average", "Hindi": "Average", "English": "Average", "Maths": "Weak", "Science": "Average" },
            remarks: [
                { date: "2024-09-08", text: "Struggling with basic mathematical division, but making good effort.", author: "Dnyaneshwar Maharaj", homework: false }
            ],
            complaints: [
                { date: "2024-11-20", type: "Homework Incomplete", action: "Verbally warned about task submissions.", severity: "Low" }
            ],
            fees: {
                total: 9000,
                paid: 9000,
                ledger: [
                    { date: "2024-06-05", amount: 9000, mode: "Bank Transfer", receipt: "REC-2024-998" }
                ]
            }
        };
    }
}
window.renderStudentProfile = function(studentId) {
    selectedStudent = studentsDatabase.find(s => s.id === studentId);
    if (!selectedStudent) return;

    activeProfileSession = 'current';
    const sessionSelector = document.getElementById('select-academic-session');
    if (sessionSelector) sessionSelector.value = 'current';
    resolveProfileData();

    // Reset active tab visually
    document.querySelectorAll('#panel-student-profile .profile-tabs-card .profile-tab-btn').forEach(b => b.classList.remove('active'));
    const progressBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
    if (progressBtn) progressBtn.classList.add('active');

    document.querySelectorAll('.profile-tab-content .tab-panel').forEach(p => p.classList.remove('active'));
    const progressPanel = document.getElementById('tab-progress');
    if (progressPanel) progressPanel.classList.add('active');

    // Route view panel
    switchPanel('panel-student-profile');

    const studentNameStr = getStudentName(selectedStudent);
    
    // Student Photo only (no initials placeholder)
    if (selectedStudent.photo) {
        document.getElementById('prof-avatar').innerHTML = `<img src="${selectedStudent.photo}" alt="${studentNameStr}">`;
    } else {
        document.getElementById('prof-avatar').innerHTML = `<i class="fa-regular fa-user"></i>`;
    }


    // Header Bio Details
    document.getElementById('prof-name').textContent = studentNameStr;
    document.getElementById('prof-roll').textContent = activeStudentData.rollNo;
    document.getElementById('prof-class').textContent = `Class ${activeStudentData.standard}${activeStudentData.section ? "-" + activeStudentData.section : ""}`;
    document.getElementById('prof-phone').textContent = activeStudentData.phone;
    document.getElementById('prof-parent').textContent = activeStudentData.parentName;
    document.getElementById('prof-emergency').textContent = activeStudentData.emergencyContact;

    // TAB 1: Attendance Grid
    renderAttendanceGrid();

    // TAB 1: Marks History Chart
    renderAcademicsSVGChart();

    // TAB 1: Subject Ratings List
    renderSubjectsRatings();

    // TAB 1: Timeline Remarks
    renderRemarksTimeline();

    // TAB 2: Medical records
    renderMedicalTab();

    // TAB 2: Incident Logs
    renderIncidentLogs();

    // TAB 3: Fees Ledger details
    renderFeesTab();

    // TAB 4: Document Grid
    renderDocumentsGrid();
};

// TAB 1 — ATTENDANCE DRAWING
function renderAttendanceGrid() {
    const calendar = document.getElementById('attendance-calendar');
    calendar.innerHTML = '';

    // Day headers Sun-Sat
    const daysHeaders = currentLanguage === 'en' ? 
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : 
        ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनी'];

    daysHeaders.forEach(day => {
        const dDiv = document.createElement('div');
        dDiv.className = 'calendar-day-header';
        dDiv.textContent = day;
        calendar.appendChild(dDiv);
    });

    // Current month calendar
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const padDays = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < padDays; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'calendar-day-cell empty';
        calendar.appendChild(padCell);
    }

    // Draw days — only days with saved attendance get a colour
    let presentCount = 0;
    let markedCount = 0;
    const daily = (activeStudentData.dailyAttendance) || {};

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        cell.textContent = day;

        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const rec = daily[key];

        if (rec && Object.keys(rec).length) {
            markedCount++;
            const isPresent = !!(rec.morning || rec.evening || rec.school);
            cell.classList.add(isPresent ? 'present' : 'absent');
            if (isPresent) presentCount++;
        }

        calendar.appendChild(cell);
    }

    const pct = markedCount ? Math.round((presentCount / markedCount) * 100) : 0;
    document.getElementById('prof-attendance-pct').textContent = `${pct}%`;
}


// TAB 1 — ACADEMIC PERFORMANCE SVG DRAW
function renderAcademicsSVGChart() {
    const scores = activeStudentData.examHistory; // 4 entries: Unit 1, Midterm, Unit 2, Annual
    
    // Map scores (0-100) to SVG points Y values (170 min, 20 max height)
    const mapY = (score) => 170 - ((score / 100) * 150);

    const y1 = mapY(scores[0] || 60);
    const y2 = mapY(scores[1] || 60);
    const y3 = mapY(scores[2] || 60);
    const y4 = mapY(scores[3] || 60);

    // Apply paths
    const chartPath = document.getElementById('chart-line-path');
    chartPath.setAttribute('d', `M 50,${y1} L 160,${y2} L 270,${y3} L 370,${y4}`);

    // Relocate Nodes circles
    document.getElementById('chart-node-1').setAttribute('cy', y1);
    document.getElementById('chart-node-2').setAttribute('cy', y2);
    document.getElementById('chart-node-3').setAttribute('cy', y3);
    document.getElementById('chart-node-4').setAttribute('cy', y4);
}

// TAB 1 — SUBJECT CHIPS
function renderSubjectsRatings() {
    const list = document.getElementById('prof-subjects-list');
    list.innerHTML = '';

    const ratingsMap = {
        'Good': currentLanguage === 'en' ? 'Good' : 'उत्कृष्ट',
        'Average': currentLanguage === 'en' ? 'Average' : 'मध्यम',
        'Weak': currentLanguage === 'en' ? 'Weak' : 'कमकुवत'
    };

    Object.entries(activeStudentData.subjects).forEach(([subject, grade]) => {
        const li = document.createElement('li');
        
        // Translate subject labels
        const subLabel = currentLanguage === 'mr' && translations['mr'][subject] ? translations['mr'][subject] : subject;

        li.innerHTML = `
            <span class="subject-name">${subLabel}</span>
            <span class="subject-badge ${grade.toLowerCase()}">${ratingsMap[grade] || grade}</span>
        `;
        list.appendChild(li);
    });
}

// TAB 1 — REMARKS TIMELINE
function renderRemarksTimeline() {
    const timeline = document.getElementById('prof-remarks-timeline');
    timeline.innerHTML = '';

    if (activeStudentData.remarks.length === 0) {
        timeline.innerHTML = `<p class="text-muted text-sm">${currentLanguage === 'en' ? 'No remarks posted yet.' : 'अद्याप अभिप्राय नोंदवले नाहीत.'}</p>`;
        return;
    }

    activeStudentData.remarks.forEach(rem => {
        const item = document.createElement('div');
        item.className = 'remark-item';
        
        const hwText = rem.homework ? 
            (currentLanguage === 'en' ? 'Homework: Complete' : 'गृहपाठ: पूर्ण') : 
            (currentLanguage === 'en' ? 'Homework: Incomplete' : 'गृहपाठ: अपूर्ण');

        item.innerHTML = `
            <span class="remark-date">${rem.date} | <b class="text-orange">${hwText}</b></span>
            <p class="remark-text">"${rem.text}"</p>
            <span class="remark-author">— ${rem.author}</span>
        `;
        timeline.appendChild(item);
    });
}

function setupRemarkFormListener() {
    const form = document.getElementById('form-add-remark');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const remarkText = document.getElementById('new-remark-text').value.trim();
        const hwStatus = document.getElementById('homework-status-check').checked;

        const newRemark = {
            date: new Date().toISOString().split('T')[0],
            text: remarkText,
            author: currentUser ? currentUser.name : 'Teacher',
            homework: hwStatus
        };

        selectedStudent.remarks.push(newRemark);
        saveDatabase();
        createToast(currentLanguage === 'en' ? 'Remark posted successfully!' : 'अभिप्राय नोंदवला गेला!', 'success');
        
        resolveProfileData();
        renderRemarksTimeline();
        form.reset();
    });
}

// TAB 2 — MEDICAL PROFILE
function renderMedicalTab() {
    const m = activeStudentData.medical;
    document.getElementById('med-blood-group').textContent = m.bloodGroup;
    document.getElementById('med-allergies').textContent = m.allergies;
    document.getElementById('med-illness').textContent = m.illness;
    document.getElementById('med-doctor-notes').textContent = m.doctorNotes;
}

function setupMedicalEditListener() {
    // Edit Medical Details modal launch
    const medModal = document.getElementById('medical-edit-modal');
    const closeBtns = document.querySelectorAll('.btn-close-medical');
    
    document.getElementById('btn-edit-medical').addEventListener('click', () => {
        const m = selectedStudent.medical;
        document.getElementById('med-edit-blood').value = m.bloodGroup;
        document.getElementById('med-edit-allergies').value = m.allergies;
        document.getElementById('med-edit-illness').value = m.illness;
        document.getElementById('med-edit-notes').value = m.doctorNotes;
        
        medModal.classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => medModal.classList.remove('active'));
    });

    document.getElementById('form-medical-edit').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        selectedStudent.medical = {
            bloodGroup: document.getElementById('med-edit-blood').value.trim(),
            allergies: document.getElementById('med-edit-allergies').value.trim(),
            illness: document.getElementById('med-edit-illness').value.trim(),
            doctorNotes: document.getElementById('med-edit-notes').value.trim()
        };

        saveDatabase();
        createToast(currentLanguage === 'en' ? 'Medical logs updated!' : 'वैद्यकीय माहिती अद्यतनित केली!', 'success');
        medModal.classList.remove('active');
        
        resolveProfileData();
        renderMedicalTab();
    });
}

// TAB 2 — INCIDENT LOG
function renderIncidentLogs() {
    const list = document.getElementById('prof-complaints-list');
    list.innerHTML = '';

    if (activeStudentData.complaints.length === 0) {
        list.innerHTML = `<p class="text-muted text-sm">${currentLanguage === 'en' ? 'No incidents logged. Student behaves well.' : 'कोणतीही तक्रार नाही. विद्यार्थ्याचे वर्तन चांगले आहे.'}</p>`;
        return;
    }

    activeStudentData.complaints.forEach(c => {
        const div = document.createElement('div');
        // check incident warning class
        const isDiscipline = c.type.includes('Discipline') || c.type.includes('Homework');
        div.className = `timeline-item ${isDiscipline ? '' : 'warning'}`;
        if (c.type.includes('Health')) div.className = 'timeline-item health';

        // Translate types
        let translatedType = c.type;
        if (currentLanguage === 'mr') {
            if (c.type === 'Attendance Warning') translatedType = 'उपस्थिती चेतावणी';
            if (c.type === 'Homework Incomplete') translatedType = 'गृहपाठ अपूर्ण';
            if (c.type === 'Disciplinary Issue') translatedType = 'शिस्तभंग घटना';
            if (c.type === 'Health Report') translatedType = 'आरोग्य अहवाल';
        }

        div.innerHTML = `
            <span class="timeline-date">${c.date}</span>
            <h4 class="timeline-title">${translatedType}</h4>
            <p class="timeline-desc">${c.action}</p>
        `;
        list.appendChild(div);
    });
}


function setupProfileTabsListeners() {
    // Back to Directory
    document.getElementById('btn-profile-back').addEventListener('click', () => {
        selectedStudent = null;
        switchPanel('panel-students');
    });

    // Tab buttons trigger routing
    document.querySelectorAll('#panel-student-profile .profile-tabs-card .profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active on buttons
            document.querySelectorAll('#panel-student-profile .profile-tabs-card .profile-tab-btn').forEach(b => b.classList.remove('active'));
            // Set active on clicked
            btn.classList.add('active');

            // Hide panels
            document.querySelectorAll('#panel-student-profile .profile-tab-content .tab-panel').forEach(p => p.classList.remove('active'));
            // Show target panel
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Delete Student button action
    document.getElementById('btn-delete-student').addEventListener('click', () => {
        if (!selectedStudent) return;
        
        const confirmMsg = currentLanguage === 'en' ? 
            `Are you sure you want to delete ${getStudentName(selectedStudent)}?` : 
            `तुम्हाला खात्री आहे का की तुम्ही ${getStudentName(selectedStudent)} ला काढून टाकू इच्छिता?`;
            
        if (confirm(confirmMsg)) {
            studentsDatabase = studentsDatabase.filter(s => s.id !== selectedStudent.id);
            saveDatabase();
            createToast(currentLanguage === 'en' ? 'Student record deleted!' : 'विद्यार्थ्याचा रेकॉर्ड काढून टाकला!', 'danger');
            
            selectedStudent = null;
            renderStudentTable();
            renderDashboardMetrics();
            switchPanel('panel-students');
        }
    });

    // Print Profile
    document.getElementById('btn-export-pdf').addEventListener('click', () => {
        window.print();
    });

    // Session Switcher
    const sessionSelector = document.getElementById('select-academic-session');
    if (sessionSelector) {
        sessionSelector.addEventListener('change', (e) => {
            activeProfileSession = e.target.value;
            resolveProfileData();
            
            // Re-render all session dynamic values on profile
            const studentNameStr = getStudentName(selectedStudent);
            document.getElementById('prof-class').textContent = `Class ${activeStudentData.standard}${activeStudentData.section ? "-" + activeStudentData.section : ""}`;
            document.getElementById('prof-roll').textContent = activeStudentData.rollNo;
            document.getElementById('prof-phone').textContent = activeStudentData.phone;
            document.getElementById('prof-parent').textContent = activeStudentData.parentName;
            document.getElementById('prof-emergency').textContent = activeStudentData.emergencyContact;

            renderAttendanceGrid();
            renderAcademicsSVGChart();
            renderSubjectsRatings();
            renderRemarksTimeline();
            renderMedicalTab();
            renderIncidentLogs();
            renderFeesTab();
            renderDocumentsGrid();
        });
    }
}

function setupIncidentLogListener() {
    // Launch Modal
    const compModal = document.getElementById('complaint-modal');
    const closeBtns = document.querySelectorAll('.btn-close-complaint');

    document.getElementById('btn-add-complaint').addEventListener('click', () => {
        document.getElementById('form-complaint-log').reset();
        compModal.classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => compModal.classList.remove('active'));
    });

    document.getElementById('form-complaint-log').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const newIncident = {
            date: new Date().toISOString().split('T')[0],
            type: document.getElementById('comp-type').value,
            action: document.getElementById('comp-action').value.trim()
        };

        selectedStudent.complaints.push(newIncident);
        saveDatabase();
        
        createToast(currentLanguage === 'en' ? 'Incident logged successfully!' : 'घटना यशस्वीरित्या नोंदवली!', 'success');
        compModal.classList.remove('active');
        
        resolveProfileData();
        renderIncidentLogs();
        renderDashboardMetrics();
    });
}

// TAB 3 — FEES CARD SUMMARY
function renderFeesTab() {
    const f = activeStudentData.fees;
    const balance = f.total - f.paid;

    document.getElementById('fee-total').textContent = `₹${f.total.toLocaleString('en-IN')}`;
    document.getElementById('fee-paid').textContent = `₹${f.paid.toLocaleString('en-IN')}`;
    document.getElementById('fee-pending').textContent = `₹${balance.toLocaleString('en-IN')}`;

    // Ledgers table list
    const tbody = document.getElementById('payment-ledger-body');
    tbody.innerHTML = '';

    if (f.ledger.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">${currentLanguage === 'en' ? 'No transactions recorded.' : 'कोणतेही व्यवहार नोंदवले नाहीत.'}</td></tr>`;
        return;
    }

    f.ledger.forEach((l, idx) => {
        // Translate payment mode
        const translatedMode = currentLanguage === 'mr' && translations['mr'][`opt-${l.mode.toLowerCase().replace(' ', '-')}`] ? 
            translations['mr'][`opt-${l.mode.toLowerCase().replace(' ', '-')}`] : l.mode;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${l.date ? l.date : '<span class="text-muted">—</span>'}</td>
            <td><b class="text-green">₹${l.amount.toLocaleString('en-IN')}</b></td>
            <td>${translatedMode}</td>
            <td>
                <code>${l.receipt || '—'}</code>
                <button class="btn-table-action view" style="margin-left:8px" onclick="editPaymentEntry(${idx})" title="${currentLanguage === 'en' ? 'Edit' : 'संपादित करा'}">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editPaymentEntry = function (idx) {
    if (!selectedStudent) return;
    const l = selectedStudent.fees.ledger[idx];
    if (!l) return;
    const mr = currentLanguage !== 'en';
    const newDate = prompt(mr ? 'फी भरल्याची तारीख (YYYY-MM-DD):' : 'Payment date (YYYY-MM-DD):', l.date || '');
    if (newDate === null) return;
    const newAmt = prompt(mr ? 'रक्कम (₹):' : 'Amount (₹):', l.amount);
    if (newAmt === null) return;
    const newMode = prompt(mr ? 'भरण्याची पद्धत (Cash / UPI / Cheque / Bank Transfer):' : 'Payment mode (Cash / UPI / Cheque / Bank Transfer):', l.mode || 'Cash');
    if (newMode === null) return;

    const amt = Number(newAmt) || 0;
    const diff = amt - Number(l.amount || 0);
    l.date = newDate.trim();
    l.amount = amt;
    l.mode = newMode.trim() || l.mode;
    selectedStudent.fees.paid = Math.max(0, Number(selectedStudent.fees.paid || 0) + diff);

    saveDatabase();
    resolveProfileData();
    renderFeesTab();
    renderDashboardMetrics();
    createToast(mr ? 'पेमेंट अद्ययावत झाले!' : 'Payment updated!', 'success');
};



function setupPaymentFormListener() {
    const form = document.getElementById('form-add-payment');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const amt = parseInt(document.getElementById('pay-amount').value, 10);
        const mode = document.getElementById('pay-mode').value;
        const balance = selectedStudent.fees.total - selectedStudent.fees.paid;

        if (amt > balance) {
            createToast(currentLanguage === 'en' ? `Cannot pay more than pending balance (₹${balance})!` : `थकीत बाकीपेक्षा (₹${balance}) जास्त फी स्वीकारली जाऊ शकत नाही!`, 'danger');
            return;
        }

        const newPay = {
            date: new Date().toISOString().split('T')[0],
            amount: amt,
            mode: mode,
            receipt: `REC-2026-${Math.floor(Math.random() * 900 + 100)}`
        };

        selectedStudent.fees.ledger.push(newPay);
        selectedStudent.fees.paid += amt;
        
        saveDatabase();
        createToast(currentLanguage === 'en' ? 'Payment processed successfully!' : 'फी पेमेंट यशस्वीरित्या जमा झाले!', 'success');
        
        resolveProfileData();
        renderFeesTab();
        renderDashboardMetrics();
        form.reset();
    });
}

// TAB 4 — DOCUMENTS GRID
const DOC_TYPES = [
    { name: 'Student Aadhaar Card', en: 'Student Aadhaar Card', mr: 'विद्यार्थी आधार कार्ड' },
    { name: 'Student PAN Card', en: 'Student PAN Card', mr: 'विद्यार्थी पॅन कार्ड' },
    { name: 'School Leaving Certificate', en: 'School Leaving Certificate', mr: 'शाळा सोडल्याचा दाखला' },
    { name: 'Student Marksheet', en: 'Student Marksheet', mr: 'विद्यार्थी गुणपत्रक' },
    { name: 'Father Aadhaar Card', en: 'Father Aadhaar Card', mr: 'वडिलांचे आधार कार्ड' }
];
const docLabel = (name) => {
    const d = DOC_TYPES.find(x => x.name === name);
    return d ? (currentLanguage === 'en' ? d.en : d.mr) : name;
};

function renderDocumentsGrid() {
    const grid = document.getElementById('prof-documents-grid');
    grid.innerHTML = '';

    DOC_TYPES.forEach(def => {
        const match = (activeStudentData.documents || []).find(d => d.name === def.name && d.status === 'Uploaded');
        const label = docLabel(def.name);
        const card = document.createElement('div');
        card.className = `document-card ${match ? 'active' : ''}`;

        if (match) {
            card.innerHTML = `
                <i class="fa-solid fa-file-pdf doc-icon"></i>
                <span class="doc-title">${label}</span>
                <span class="doc-meta">${match.size || ''} ${match.size ? '|' : ''} ${match.type || ''}</span>
                <a href="#" class="btn-primary btn-sm w-full mt-2" onclick="simulateDocDownload(event, '${def.name}')">
                    <i class="fa-solid fa-download"></i> ${currentLanguage === 'en' ? 'Download' : 'डाउनलोड'}
                </a>
                <button class="btn-danger btn-sm w-full mt-2" onclick="deleteStudentDocument('${def.name}')">
                    <i class="fa-solid fa-trash"></i> ${currentLanguage === 'en' ? 'Delete' : 'हटवा'}
                </button>
            `;
        } else {
            card.innerHTML = `
                <i class="fa-solid fa-file-circle-question doc-icon" style="opacity: 0.3;"></i>
                <span class="doc-title" style="opacity: 0.5;">${label}</span>
                <span class="doc-meta text-red">${currentLanguage === 'en' ? 'Missing / Required' : 'अपूर्ण / आवश्यक'}</span>
                <button class="btn-secondary btn-sm w-full mt-2" onclick="triggerDocUpload('${def.name}')">
                    <i class="fa-solid fa-cloud-arrow-up"></i> ${currentLanguage === 'en' ? 'Upload' : 'अपलोड करा'}
                </button>
            `;
        }
        grid.appendChild(card);
    });
}

window.triggerDocUpload = function (docName) {
    const input = document.getElementById('file-doc-upload');
    if (!input) return;
    input.dataset.docType = docName;
    input.click();
};

window.deleteStudentDocument = function (docName) {
    if (!selectedStudent) return;
    const label = docLabel(docName);
    const run = () => {
        selectedStudent.documents = (selectedStudent.documents || []).filter(d => d.name !== docName);
        saveDatabase();
        resolveProfileData();
        renderDocumentsGrid();
        createToast(currentLanguage === 'en' ? `${label} deleted.` : `${label} हटवले.`, 'success');
    };
    if (typeof window.vssConfirm === 'function') {
        window.vssConfirm(currentLanguage === 'en'
            ? `${label} will be permanently deleted.`
            : `${label} कायमचे हटवले जाईल.`, run);
    } else if (confirm(currentLanguage === 'en' ? `Delete ${label}?` : `${label} हटवायचे?`)) {
        run();
    }
};

window.simulateDocDownload = function(e, docName) {
    e.preventDefault();
    createToast(currentLanguage === 'en' ? `Downloading ${docName} report...` : `${docName} डाउनलोड होत आहे...`, 'info');
};

function setupDocumentUploadListener() {
    const input = document.getElementById('file-doc-upload');
    input.addEventListener('change', () => {
        if (!selectedStudent || input.files.length === 0) return;

        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

        let chosenType = input.dataset.docType;
        if (!chosenType) {
            const list = DOC_TYPES.map((d, i) => `${i + 1}. ${currentLanguage === 'en' ? d.en : d.mr}`).join('\n');
            const ans = prompt((currentLanguage === 'en' ? 'Select document type:\n' : 'कागदपत्राचा प्रकार निवडा:\n') + list, '1');
            if (ans === null) { input.value = ''; return; }
            chosenType = (DOC_TYPES[(parseInt(ans, 10) || 1) - 1] || DOC_TYPES[0]).name;
        }
        input.dataset.docType = '';

        const newDoc = {
            name: chosenType,
            status: "Uploaded",
            size: `${fileSizeMB} MB`,
            type: file.type.includes('pdf') ? 'PDF' : 'Image'
        };

        selectedStudent.documents = (selectedStudent.documents || []).filter(d => d.name !== chosenType);
        selectedStudent.documents.push(newDoc);

        saveDatabase();
        resolveProfileData();
        createToast(currentLanguage === 'en' ? `${docLabel(chosenType)} uploaded successfully!` : `${docLabel(chosenType)} यशस्वीरित्या अपलोड झाले!`, 'success');

        renderDocumentsGrid();
        input.value = ''; // clear
    });
}


// ==========================================
// 13. EXCEL / CSV BULK IMPORT
// ==========================================
function setupBulkImportListener() {
    const importSubmitBtn = document.getElementById('btn-import-submit');
    if (!importSubmitBtn) return;
    importSubmitBtn.addEventListener('click', () => {
        const rawText = (document.getElementById('import-textarea')?.value || '').trim();
        if (!rawText) {
            createToast(currentLanguage === 'en' ? 'Please paste CSV data!' : 'कृपया CSV डेटा पेस्ट करा!', 'warning');
            return;
        }

        const lines = rawText.split('\n');
        let parsedCount = 0;
        let duplicateCount = 0;

        lines.forEach(line => {
            const cols = line.split(',');
            if (cols.length < 6) return; // skip corrupted line

            const roll = parseInt(cols[1].trim(), 10);
            
            // Check roll duplicates
            const exists = studentsDatabase.some(s => s.rollNo === roll);
            if (exists) {
                duplicateCount++;
                return;
            }

            const newStud = {
                id: `stud-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                name: {
                    en: cols[0].trim(),
                    mr: cols[0].trim()
                },
                rollNo: roll,
                standard: cols[2].trim(),
                section: cols[3].trim(),
                phone: cols[4].trim(),
                parentName: cols[5].trim(),
                emergencyContact: cols[4].trim(),
                attendance: [true, true, true, true, true, true, true, true, true, true],
                subjects: { "Marathi": "Average", "Hindi": "Average", "English": "Average", "Maths": "Average", "Science": "Average" },
                examHistory: [60, 60, 60, 60],
                remarks: [],
                complaints: [],
                medical: { bloodGroup: "O+", allergies: "None", illness: "None", doctorNotes: "General fit." },
                fees: { total: 10000, paid: 0, ledger: [] },
                documents: []
            };

            studentsDatabase.push(newStud);
            parsedCount++;
        });

        if (parsedCount > 0) {
            saveDatabase();
            renderStudentTable();
            renderDashboardMetrics();
            createToast(currentLanguage === 'en' ? `Successfully imported ${parsedCount} students!` : `यशस्वीरित्या ${parsedCount} विद्यार्थी आयात केले!`, 'success');
            const impBox = document.getElementById('import-textarea');
            if (impBox) impBox.value = '';
            switchPanel('panel-students');
        } else {
            createToast(currentLanguage === 'en' ? 'Import failed or all rows were duplicate roll numbers!' : 'आयात अयशस्वी किंवा सर्व रोल नंबर आधीच अस्तित्वात होते!', 'danger');
        }
    });
}

// ==========================================
// 14. LOCAL DATABASE BACKUP & RESTORE
// ==========================================
function setupBackupRestoreListeners() {
    // Export Download JSON
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studentsDatabase));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `varkari_student_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        createToast(currentLanguage === 'en' ? 'Backup file downloaded!' : 'बॅकअप फाइल डाउनलोड झाली!', 'success');
    });

    // Upload JSON Restore
    const fileInput = document.getElementById('file-restore-upload');
    if (!fileInput) return;
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length === 0) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].rollNo) {
                    studentsDatabase = parsed;
                    saveDatabase();
                    createToast(currentLanguage === 'en' ? 'Database restored successfully!' : 'डेटाबेस यशस्वीरित्या पुनर्संचयित झाला!', 'success');
                    
                    // Reload state
                    renderDashboardMetrics();
                    renderStudentTable();
                    switchPanel('panel-dashboard');
                } else {
                    throw new Error("Invalid format");
                }
            } catch (err) {
                createToast(currentLanguage === 'en' ? 'Invalid JSON backup format!' : 'चुकीचे बॅकअप फाइल फॉरमॅट!', 'danger');
            }
        };
        reader.readAsText(fileInput.files[0]);
        fileInput.value = ''; // clear
    });
}

// ==========================================
// 15. WHATSAPP/SMS ALERTS MODAL ACTIONS
// ==========================================
function setupWhatsAppModalListeners() {
    const modal = document.getElementById('sms-modal');
    const closeBtns = document.querySelectorAll('.btn-close-sms');
    const templateSelect = document.getElementById('sms-template-select');
    const bodyTextarea = document.getElementById('sms-body-textarea');

    const chkAtt = document.getElementById('sms-include-attendance');
    const chkFees = document.getElementById('sms-include-fees');
    const chkComp = document.getElementById('sms-include-complaints');

    document.getElementById('btn-trigger-sms').addEventListener('click', () => {
        if (!selectedStudent) return;
        
        // Reset defaults
        templateSelect.value = 'absent';
        chkAtt.checked = true;
        chkFees.checked = false;
        chkComp.checked = false;

        updateSMSTemplateText();
        modal.classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    templateSelect.addEventListener('change', () => {
        const temp = templateSelect.value;
        if (temp === 'absent') {
            chkAtt.checked = true;
            chkFees.checked = false;
            chkComp.checked = false;
        } else if (temp === 'fee') {
            chkAtt.checked = false;
            chkFees.checked = true;
            chkComp.checked = false;
        } else if (temp === 'remark') {
            chkAtt.checked = false;
            chkFees.checked = false;
            chkComp.checked = true;
        }
        updateSMSTemplateText();
    });

    [chkAtt, chkFees, chkComp].forEach(chk => {
        chk.addEventListener('change', () => {
            templateSelect.value = 'custom';
            updateSMSTemplateText();
        });
    });

    function updateSMSTemplateText() {
        if (!selectedStudent) return;
        const incAtt = chkAtt.checked;
        const incFees = chkFees.checked;
        const incComp = chkComp.checked;

        const nameEn = typeof selectedStudent.name === 'object' ? selectedStudent.name.en : selectedStudent.name;
        const nameMr = typeof selectedStudent.name === 'object' ? selectedStudent.name.mr : selectedStudent.name;
        const studentName = currentLanguage === 'mr' ? nameMr : nameEn;

        let parts = [];
        
        if (currentLanguage === 'en') {
            parts.push(`Dear ${selectedStudent.parentName}, this is an update regarding your child ${studentName} (Roll: ${selectedStudent.rollNo}) from Shantibrahm Gurukulam:`);
            
            if (incAtt) {
                const todayPresent = selectedStudent.attendance.length > 0 ? selectedStudent.attendance[selectedStudent.attendance.length - 1] : true;
                parts.push(`- Attendance: Today marked as ${todayPresent ? 'PRESENT' : 'ABSENT'}.`);
            }
            if (incFees) {
                const pending = selectedStudent.fees.total - selectedStudent.fees.paid;
                parts.push(`- Outstanding Dues: Pending balance is ₹${pending.toLocaleString('en-IN')}. Please clear it at your earliest convenience.`);
            }
            if (incComp) {
                const lastRemark = selectedStudent.remarks.length > 0 ? selectedStudent.remarks[selectedStudent.remarks.length - 1].text : "No recent warnings.";
                parts.push(`- Teacher Remark: "${lastRemark}"`);
            }
            parts.push(`Regards,\nShantibrahm Gurukulam\nVSS`);
        } else {
            parts.push(`प्रिय ${selectedStudent.parentName}, शांतिब्रह्म गुरुकुल कडून आपले पाल्या ${nameMr} (हजेरी क्र: ${selectedStudent.rollNo}) बद्दल खालील माहिती पाठवत आहोत:`);
            
            if (incAtt) {
                const todayPresent = selectedStudent.attendance.length > 0 ? selectedStudent.attendance[selectedStudent.attendance.length - 1] : true;
                parts.push(`- उपस्थिती: आजची हजेरी ${todayPresent ? 'हजर (PRESENT)' : 'गैरहजर (ABSENT)'} नोंदवली आहे.`);
            }
            if (incFees) {
                const pending = selectedStudent.fees.total - selectedStudent.fees.paid;
                parts.push(`- थकीत फी: थकीत रक्कम ₹${pending.toLocaleString('en-IN')} आहे. कृपया लवकर जमा करावी.`);
            }
            if (incComp) {
                const lastRemark = selectedStudent.remarks.length > 0 ? selectedStudent.remarks[selectedStudent.remarks.length - 1].text : "अभिप्राय नाही.";
                parts.push(`- शिक्षकांचा अभिप्राय: "${lastRemark}"`);
            }
            parts.push(`आपला नम्र,\nशांतिब्रह्म गुरुकुल\nवारकरी शिक्षण संस्था`);
        }

        bodyTextarea.value = parts.join('\n\n');
    }

    // PDF Alert Slip Generator
    document.getElementById('btn-generate-pdf-alert').addEventListener('click', () => {
        if (!selectedStudent) return;
        const nameEn = typeof selectedStudent.name === 'object' ? selectedStudent.name.en : selectedStudent.name;
        const nameMr = typeof selectedStudent.name === 'object' ? selectedStudent.name.mr : selectedStudent.name;
        const studentName = currentLanguage === 'mr' ? nameMr : nameEn;

        const printWindow = window.open('', '_blank');
        const slipHtml = `
            <html>
            <head>
                <title>Alert Slip - ${studentName}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .letterhead { text-align: center; border-bottom: 3px double #e25822; padding-bottom: 12px; margin-bottom: 24px; }
                    .letterhead h1 { color: #e25822; margin: 0; font-size: 1.8rem; text-transform: uppercase; }
                    .letterhead p { margin: 4px 0; font-size: 0.9rem; color: #666; font-style: italic; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 0.95rem; border: 1px solid #ddd; padding: 16px; border-radius: 8px; background-color: #fcfcfc; }
                    .details-grid div { margin-bottom: 6px; }
                    .msg-body { border: 1px solid #e25822; border-left: 6px solid #e25822; padding: 20px; font-size: 1rem; background-color: #fffbf9; border-radius: 6px; white-space: pre-wrap; font-style: italic; margin-bottom: 40px; }
                    .footer-sig { display: flex; justify-content: space-between; margin-top: 60px; font-size: 0.9rem; font-weight: 600; }
                    .footer-sig div { text-align: center; width: 180px; border-top: 1px solid #333; padding-top: 8px; }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="letterhead">
                    <h1>वारकरी शिक्षण संस्था</h1>
                    <p>Shantibrahm Gurukulam Student Alert Slip</p>
                    <p style="font-size: 0.8rem; font-weight: normal; color: #888;">Date: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="details-grid">
                    <div><strong>Student Name:</strong> ${nameEn} (${nameMr})</div>
                    <div><strong>Roll No:</strong> ${selectedStudent.rollNo}</div>
                    <div><strong>Class & Section:</strong> Class ${selectedStudent.standard}-${selectedStudent.section}</div>
                    <div><strong>Parent Name:</strong> ${selectedStudent.parentName}</div>
                    <div><strong>Parent Contact:</strong> ${selectedStudent.phone}</div>
                    <div><strong>Status:</strong> Alert Slip Issued</div>
                </div>
                <h3 style="color:#e25822; border-bottom:1px solid #eee; padding-bottom:6px;">Alert Notification Details:</h3>
                <div class="msg-body">${bodyTextarea.value}</div>
                <div class="footer-sig">
                    <div>Parent Signature</div>
                    <div>Class Teacher</div>
                    <div>Principal Seal</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(slipHtml);
        printWindow.document.close();
    });

    // WhatsApp Direct Redirect Link
    document.getElementById('btn-whatsapp-send-action').addEventListener('click', () => {
        if (!selectedStudent) return;
        let phone = selectedStudent.phone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;

        const bodyText = bodyTextarea.value;
        const link = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(bodyText)}`;
        window.open(link, '_blank');

        modal.classList.remove('active');
        createToast(currentLanguage === 'en' ? 'Redirecting to WhatsApp...' : 'व्हाट्सअ‍ॅपवर रीडायरेक्ट करत आहे...', 'success');
    });
}

// ==========================================
// 16. DAILY ATTENDANCE MARKING CONTROLLER
// ==========================================
function setupMarkAttendanceListeners() {
    const modal = document.getElementById('mark-attendance-modal');
    const closeBtns = document.querySelectorAll('.btn-close-attendance-modal');
    const form = document.getElementById('form-mark-attendance');
    const listBody = document.getElementById('attendance-mark-list-body');
    const btnMark = document.getElementById('btn-mark-attendance');

    if (btnMark) {
        btnMark.addEventListener('click', () => {
            // Get currently filtered class and section
            const filterClass = document.getElementById('filter-class').value;
            const filterSection = document.getElementById('filter-section').value;

            // Load students matching the filter
            const filtered = studentsDatabase.filter(stud => {
                // If teacher is logged in, their class is locked. Verify we restrict correctly.
                const matchesClass = filterClass === "" ? true : stud.standard === filterClass;
                const matchesSection = filterSection === "" ? true : stud.section === filterSection;
                return matchesClass && matchesSection;
            });

            // Sort by roll number
            filtered.sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));

            listBody.innerHTML = '';
            if (filtered.length === 0) {
                listBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted" style="padding: 20px;">${currentLanguage === 'en' ? 'No students found matching current filters.' : 'सध्याच्या फिल्टरनुसार कोणतेही विद्यार्थी सापडले नाहीत.'}</td></tr>`;
            } else {
                const todayISO = new Date().toISOString().slice(0, 10);
                filtered.forEach(stud => {
                    // Check if already marked present/absent today or last recorded
                    const daily = stud.dailyAttendance || {};
                    const todayRec = daily[todayISO];
                    let isPresent = true;
                    if (todayRec) {
                        isPresent = !(todayRec.morning === false || todayRec.evening === false || todayRec.school === false);
                    } else if (Array.isArray(stud.attendance) && stud.attendance.length > 0) {
                        isPresent = !!stud.attendance[stud.attendance.length - 1];
                    }
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><b>${stud.rollNo}</b></td>
                        <td>${getStudentName(stud)}</td>
                        <td style="text-align: center;">
                            <input type="checkbox" class="stud-att-check" data-id="${stud.id}" ${isPresent ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </td>
                    `;
                    listBody.appendChild(tr);
                });
            }

            modal.classList.add('active');
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get all checkbox elements
        const checks = form.querySelectorAll('.stud-att-check');
        if (checks.length === 0) {
            modal.classList.remove('active');
            return;
        }

        const todayISO = new Date().toISOString().slice(0, 10);
        checks.forEach(chk => {
            const id = chk.getAttribute('data-id');
            const stud = studentsDatabase.find(s => s.id === id);
            if (stud) {
                // Read checkbox state
                const isPresent = chk.checked;
                // Append or overwrite today's attendance (last element)
                if (stud.attendance.length > 0) {
                    stud.attendance[stud.attendance.length - 1] = isPresent;
                } else {
                    stud.attendance.push(isPresent);
                }
                // Also update dailyAttendance object
                stud.dailyAttendance = stud.dailyAttendance || {};
                stud.dailyAttendance[todayISO] = stud.dailyAttendance[todayISO] || {};
                stud.dailyAttendance[todayISO].morning = isPresent;
                stud.dailyAttendance[todayISO].evening = isPresent;
                stud.dailyAttendance[todayISO].school = isPresent;
            }
        });

        saveDatabase();
        createToast(currentLanguage === 'en' ? "Daily attendance marked successfully!" : "आजची उपस्थिती यशस्वीरित्या नोंदवली गेली!", "success");
        modal.classList.remove('active');
        
        // Refresh tables and charts
        renderStudentTable();
        renderDashboardMetrics();
    });
}

// ==========================================
// 17. ADMIN PROFILE EDIT CONTROLLERS
// ==========================================
function updateAdminUI() {
    let adminProfile = {
        name: "Ankush Maharaj Kadam",
        email: "ankush@varkari.org",
        phone: "9822334455",
        photo: null
    };
    const storedAdmin = localStorage.getItem('vss_admin_profile');
    if (storedAdmin) {
        adminProfile = JSON.parse(storedAdmin);
    }
    
    // Update sidebar admin card
    const avatarTxt = adminProfile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    if (sidebarAvatar) {
        if (adminProfile.photo) {
            sidebarAvatar.innerHTML = `<img src="${adminProfile.photo}" alt="${adminProfile.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            sidebarAvatar.innerHTML = avatarTxt;
        }
    }
    
    const sidebarName = document.getElementById('sidebar-user-name');
    if (sidebarName) sidebarName.textContent = adminProfile.name;
    
    // Update header avatar
    const headerAvatar = document.getElementById('header-user-avatar');
    if (headerAvatar) {
        if (adminProfile.photo) {
            headerAvatar.innerHTML = `<img src="${adminProfile.photo}" alt="${adminProfile.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            headerAvatar.innerHTML = avatarTxt;
        }
    }
}

function setupAdminProfileListener() {
    const trigger = document.getElementById('btn-admin-profile-trigger');
    const backBtn = document.getElementById('btn-admin-profile-back');

    if (trigger) {
        trigger.addEventListener('click', () => {
            if (currentUser && currentUser.role === 'admin') {
                loadAdminProfileData();
                switchPanel('panel-admin-profile');
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchPanel('panel-dashboard');
        });
    }

    // Settings panel internal tab togglers
    const settingsTabs = document.querySelectorAll('#admin-settings-tabs .profile-tab-btn');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active states
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Hide all tab panels
            document.querySelectorAll('#panel-admin-profile .tab-panel').forEach(panel => {
                panel.classList.add('d-none');
                panel.classList.remove('active');
            });

            // Show active panel
            const target = tab.getAttribute('data-settings-tab');
            const targetPanel = document.getElementById(target);
            if (targetPanel) {
                targetPanel.classList.remove('d-none');
                targetPanel.classList.add('active');
            }
        });
    });

    // Form 1: Edit Profile details
    const formProfile = document.getElementById('form-admin-profile');
    if (formProfile) {
        formProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            const photoFile = document.getElementById('admin-photo-upload').files[0];
            const saveProfile = (photoBase64 = null) => {
                let adminProfile = {
                    name: document.getElementById('admin-name').value.trim(),
                    email: document.getElementById('admin-email').value.trim(),
                    phone: document.getElementById('admin-phone').value.trim(),
                    photo: photoBase64 || (JSON.parse(localStorage.getItem('vss_admin_profile')) || {}).photo || null
                };
                localStorage.setItem('vss_admin_profile', JSON.stringify(adminProfile));
                if (currentUser && currentUser.role === 'admin') {
                    currentUser.name = adminProfile.name;
                }
                updateAdminUI();
                createToast(currentLanguage === 'en' ? 'Admin profile updated!' : 'अ‍ॅडमिन प्रोफाइल अद्यतनित केली!', 'success');
                switchPanel('panel-dashboard');
            };

            if (photoFile) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    saveProfile(evt.target.result);
                };
                reader.readAsDataURL(photoFile);
            } else {
                saveProfile(null);
            }
        });
    }

    // Form 2: Change Password
    const formPassword = document.getElementById('form-admin-password');
    if (formPassword) {
        formPassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPass = document.getElementById('admin-old-pass').value;
            const newPass = document.getElementById('admin-new-pass').value;
            const confirmPass = document.getElementById('admin-confirm-pass').value;

            // Input validation
            if (!validateInput(newPass, 'password')) {
                createToast(currentLanguage === 'en' ? 'Password must be at least 6 characters (ASCII only)!' : 'पासवर्ड किमान ६ अक्षरे लांब असावा (फक्त ASCII)!', 'danger');
                return;
            }

            const savedHash = localStorage.getItem('vss_admin_password_hash');
            const savedSalt = localStorage.getItem('vss_admin_password_salt');
            
            if (savedHash && savedSalt) {
                const computedOldHash = await hashPassword(oldPass, savedSalt);
                if (!timingSafeEqual(computedOldHash, savedHash)) {
                    createToast(currentLanguage === 'en' ? 'Current password does not match!' : 'सध्याचा पासवर्ड जुळत नाही!', 'danger');
                    return;
                }
            } else {
                createToast(currentLanguage === 'en' ? 'Credentials error! Please refresh browser.' : 'क्रेडेंशियल त्रुटी! कृपया ब्राउझर पुन्हा रिफ्रेश करा.', 'danger');
                return;
            }

            if (newPass !== confirmPass) {
                createToast(currentLanguage === 'en' ? 'New passwords do not match!' : 'नवीन पासवर्ड जुळत नाहीत!', 'danger');
                return;
            }

            // Generate new salt and hash new password
            const newSalt = generateSalt();
            const newHash = await hashPassword(newPass, newSalt);
            localStorage.setItem('vss_admin_password_hash', newHash);
            localStorage.setItem('vss_admin_password_salt', newSalt);
            
            createToast(currentLanguage === 'en' ? 'Password updated successfully!' : 'पासवर्ड यशस्वीरित्या अद्यतनित केला!', 'success');
            formPassword.reset();
            switchPanel('panel-dashboard');
        });
    }

    // Form 3: Setup Biometrics buttons
    const btnSetupFinger = document.getElementById('btn-setup-fingerprint');
    const btnSetupFace = document.getElementById('btn-setup-face');

    if (btnSetupFinger) {
        btnSetupFinger.addEventListener('click', () => {
            const isConfigured = localStorage.getItem('vss_admin_fingerprint') === 'true';
            if (isConfigured) {
                localStorage.removeItem('vss_admin_fingerprint');
                localStorage.removeItem('vss_webauthn_credential_id');
                createToast(currentLanguage === 'en' ? 'Fingerprint login removed!' : 'फिंगरप्रिंट लॉगिन काढले!', 'info');
                updateBiometricsUI();
                updateLoginBiometricsUI();
            } else {
                registerWebAuthnBiometrics('fingerprint');
            }
        });
    }

    if (btnSetupFace) {
        btnSetupFace.addEventListener('click', () => {
            const isConfigured = localStorage.getItem('vss_admin_face') === 'true';
            if (isConfigured) {
                localStorage.removeItem('vss_admin_face');
                localStorage.removeItem('vss_webauthn_credential_id');
                createToast(currentLanguage === 'en' ? 'Face ID login removed!' : 'फेस आयडी लॉगिन काढले!', 'info');
                updateBiometricsUI();
                updateLoginBiometricsUI();
            } else {
                registerWebAuthnBiometrics('face');
            }
        });
    }

    // Close biometrics modals
    document.querySelectorAll('.btn-close-biometrics').forEach(btn => {
        btn.addEventListener('click', () => {
            closeBiometricsModals();
        });
    });

    // Setup Hold-to-Scan listeners for Fingerprint button
    setupFingerprintScannerHoldListeners();

    // Initialize biometric configure tab statuses on load
    updateBiometricsUI();
}

// WebAuthn Real Biometrics Implementation with Simulator Fallback
function registerWebAuthnBiometrics(type) {
    if (!window.PublicKeyCredential) {
        createToast(currentLanguage === 'en' ? 'Biometrics WebAuthn API not supported by browser. Using Simulator.' : 'बायोमेट्रिक्स WebAuthn API ब्राउझरद्वारे समर्थित नाही. सिम्युलेटर वापरत आहे.', 'warning');
        if (type === 'fingerprint') openFingerprintScanner(false);
        else openFaceScanner(false);
        return;
    }

    // Build creation options
    const challenge = new Uint8Array(16);
    window.crypto.getRandomValues(challenge);
    
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyOptions = {
        challenge: challenge,
        rp: {
            name: "Varkari Shikshan Sanstha",
            id: window.location.hostname || "localhost"
        },
        user: {
            id: userId,
            name: "ankush",
            displayName: "Ankush Maharaj Kadam"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
        },
        timeout: 60000
    };

    createToast(currentLanguage === 'en' ? 'Follow device biometric prompt...' : 'तुमच्या डिव्हाइसच्या बायोमेट्रिक सूचनांचे अनुसरण करा...', 'info');

    navigator.credentials.create({ publicKey: publicKeyOptions })
        .then((newCredential) => {
            const rawId = new Uint8Array(newCredential.rawId);
            // Convert to base64
            const credentialIdBase64 = btoa(String.fromCharCode.apply(null, rawId));
            localStorage.setItem('vss_webauthn_credential_id', credentialIdBase64);
            
            if (type === 'fingerprint') {
                localStorage.setItem('vss_admin_fingerprint', 'true');
            } else {
                localStorage.setItem('vss_admin_face', 'true');
            }
            
            createToast(currentLanguage === 'en' ? `${type.charAt(0).toUpperCase() + type.slice(1)} registered successfully!` : `${type === 'fingerprint' ? 'फिंगरप्रिंट' : 'फेस आयडी'} यशस्वीरित्या नोंदणीकृत केले!`, 'success');
            updateBiometricsUI();
            updateLoginBiometricsUI();
        })
        .catch((err) => {
            console.warn("WebAuthn failed, falling back to simulated scanner overlay", err);
            // If the user cancelled or WebAuthn failed/blocked, fall back to our simulated scanner modal
            if (type === 'fingerprint') openFingerprintScanner(false);
            else openFaceScanner(false);
        });
}

function verifyWebAuthnBiometrics(type) {
    const credentialIdBase64 = localStorage.getItem('vss_webauthn_credential_id');
    
    // Login never falls back to a visual simulation: it would not be real authentication.
    if (!credentialIdBase64 || !window.PublicKeyCredential) {
        createToast('Biometric login is not configured on this device. Sign in with password first.', 'warning');
        return;
    }

    const rawIdCharCodes = atob(credentialIdBase64).split('').map(c => c.charCodeAt(0));
    const credentialId = new Uint8Array(rawIdCharCodes);

    const challenge = new Uint8Array(16);
    window.crypto.getRandomValues(challenge);

    const publicKeyOptions = {
        challenge: challenge,
        allowCredentials: [{
            id: credentialId,
            type: 'public-key'
        }],
        userVerification: "required",
        timeout: 60000
    };

    createToast(currentLanguage === 'en' ? 'Verifying biometrics...' : 'बायोमेट्रिक्स पडताळत आहे...', 'info');

    navigator.credentials.get({ publicKey: publicKeyOptions })
        .then((assertion) => {
            performBiometricLogin(type === 'fingerprint' ? 'Fingerprint' : 'Face ID');
        })
        .catch((err) => {
            console.warn("WebAuthn verification failed", err);
            createToast('Biometric verification was not completed. Please use your password.', 'danger');
        });
}

// Biometrics Scanning Simulator Helpers
let fingerprintHoldTimer = null;
let fingerprintProgress = 0;
let isScanningFingerprint = false;
let fingerprintVerificationMode = false; // true if login bypass

function openFingerprintScanner(isVerify = false) {
    fingerprintVerificationMode = isVerify;
    fingerprintProgress = 0;
    isScanningFingerprint = false;
window.openFingerprintScanner = openFingerprintScanner;
    
    document.getElementById('fingerprint-scan-status-text').textContent = '0%';
    document.getElementById('fingerprint-progress-circle').style.strokeDashoffset = 390;
    
    const instr = document.getElementById('fingerprint-modal-instructions');
    if (instr) {
        if (isVerify) {
            instr.textContent = currentLanguage === 'en' ? 'Touch and hold the sensor to login' : 'लॉगिन करण्यासाठी सेन्सरला स्पर्श करा आणि धरून ठेवा';
        } else {
            instr.textContent = currentLanguage === 'en' ? 'Touch and hold the sensor to register fingerprint' : 'फिंगरप्रिंट नोंदणी करण्यासाठी सेन्सरला स्पर्श करा आणि धरून ठेवा';
        }
    }
    
    document.getElementById('fingerprint-scan-modal').classList.add('active');
}

function openFaceScanner(isVerify = false) {
    document.getElementById('face-scan-status-text').textContent = '0%';
    document.getElementById('face-scan-modal').classList.add('active');
    
    const instr = document.getElementById('face-modal-instructions');
    if (instr) {
        if (isVerify) {
            instr.textContent = currentLanguage === 'en' ? 'Analyzing facial parameters to login...' : 'लॉगिन करण्यासाठी चेहऱ्याचे स्कॅनिंग करत आहे...';
        } else {
            instr.textContent = currentLanguage === 'en' ? 'Scanning face coordinates to register...' : 'नोंदणी करण्यासाठी चेहरा स्कॅन करत आहे...';
        }
    }
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        document.getElementById('face-scan-status-text').textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('face-scan-modal').classList.remove('active');
                if (isVerify) {
                    performBiometricLogin('Face ID');
                } else {
                    localStorage.setItem('vss_admin_face', 'true');
                    createToast(currentLanguage === 'en' ? 'Face ID configured successfully!' : 'फेस आयडी यशस्वीरित्या कॉन्फिगर केले!', 'success');
                    updateBiometricsUI();
                    updateLoginBiometricsUI();
                }
            }, 300);
        }
    }, 100);
}

function closeBiometricsModals() {
    document.getElementById('fingerprint-scan-modal').classList.remove('active');
    document.getElementById('face-scan-modal').classList.remove('active');
    resetFingerprintScanner();
}

function resetFingerprintScanner() {
    if (fingerprintHoldTimer) clearInterval(fingerprintHoldTimer);
    fingerprintProgress = 0;
    isScanningFingerprint = false;
    document.getElementById('fingerprint-sensor-button').classList.remove('scanning');
}

function setupFingerprintScannerHoldListeners() {
    const sensorBtn = document.getElementById('fingerprint-sensor-button');
    if (!sensorBtn) return;

    const startScan = (e) => {
        e.preventDefault();
        if (isScanningFingerprint) return;
        isScanningFingerprint = true;
        sensorBtn.classList.add('scanning');
        
        fingerprintHoldTimer = setInterval(() => {
            fingerprintProgress += 4;
            if (fingerprintProgress > 100) fingerprintProgress = 100;
            
            document.getElementById('fingerprint-scan-status-text').textContent = `${fingerprintProgress}%`;
            
            // strokeDasharray circle radius is 62 => circumference = 2 * PI * 62 ≈ 390
            const offset = 390 - (390 * fingerprintProgress / 100);
            document.getElementById('fingerprint-progress-circle').style.strokeDashoffset = offset;
            
            if (fingerprintProgress >= 100) {
                clearInterval(fingerprintHoldTimer);
                sensorBtn.classList.remove('scanning');
                
                setTimeout(() => {
                    document.getElementById('fingerprint-scan-modal').classList.remove('active');
                    if (fingerprintVerificationMode) {
                        performBiometricLogin('Fingerprint');
                    } else {
                        localStorage.setItem('vss_admin_fingerprint', 'true');
                        try {
                            const u = (typeof window.currentUser !== 'undefined' && window.currentUser && window.currentUser.username) || 'ankush';
                            localStorage.setItem('vss_fp_' + u, JSON.stringify({ user: u, id: 'simulated', at: Date.now() }));
                        } catch (_) {}
                        createToast(currentLanguage === 'en' ? 'Fingerprint configured successfully!' : 'फिंगरप्रिंट यशस्वीरित्या कॉन्फिगर केले!', 'success');
                        updateBiometricsUI();
                        updateLoginBiometricsUI();
                        if (typeof window.vssPaintSecuritySettings === 'function') window.vssPaintSecuritySettings();
                    }
                }, 300);
            }
        }, 80);
    };

    const stopScan = () => {
        if (!isScanningFingerprint) return;
        resetFingerprintScanner();
        document.getElementById('fingerprint-scan-status-text').textContent = 'Scan Interrupted (0%)';
        document.getElementById('fingerprint-progress-circle').style.strokeDashoffset = 390;
    };

    sensorBtn.addEventListener('mousedown', startScan);
    sensorBtn.addEventListener('touchstart', startScan);
    
    sensorBtn.addEventListener('mouseup', stopScan);
    sensorBtn.addEventListener('mouseleave', stopScan);
    sensorBtn.addEventListener('touchend', stopScan);
}

function performBiometricLogin(type) {
    let adminProfile = { name: "Ankush Maharaj Kadam" };
    const storedAdmin = localStorage.getItem('vss_admin_profile');
    if (storedAdmin) {
        adminProfile = JSON.parse(storedAdmin);
    }
    
    currentUser = {
        username: 'ankush',
        name: adminProfile.name,
        role: 'admin'
    };
    
    createToast(currentLanguage === 'en' ? `Logged in via ${type}! Welcome, ${currentUser.name}` : `${type} द्वारे लॉग इन केले! आपले स्वागत आहे, ${currentUser.name}`, 'success');
    launchApp();
}

// Add shortcut hooks inside sign in screen
document.addEventListener('DOMContentLoaded', () => {
    const btnShortcutFinger = document.getElementById('btn-login-biometric-fingerprint');
    const btnShortcutFace = document.getElementById('btn-login-biometric-face');
    
    if (btnShortcutFinger) {
        btnShortcutFinger.addEventListener('click', () => {
            verifyWebAuthnBiometrics('fingerprint');
        });
    }
    
    if (btnShortcutFace) {
        btnShortcutFace.addEventListener('click', () => {
            verifyWebAuthnBiometrics('face');
        });
    }
});

function loadAdminProfileData() {
    let adminProfile = {
        name: "Ankush Maharaj Kadam",
        email: "ankush@varkari.org",
        phone: "9822334455",
        photo: null
    };
    const storedAdmin = localStorage.getItem('vss_admin_profile');
    if (storedAdmin) {
        adminProfile = JSON.parse(storedAdmin);
    }
    document.getElementById('admin-name').value = adminProfile.name;
    document.getElementById('admin-email').value = adminProfile.email;
    document.getElementById('admin-phone').value = adminProfile.phone;

    const avatarTxt = adminProfile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const preview = document.getElementById('admin-profile-avatar-preview');
    if (adminProfile.photo) {
        preview.innerHTML = `<img src="${adminProfile.photo}" alt="${adminProfile.name}">`;
    } else {
        preview.textContent = avatarTxt;
    }
}

function updateBiometricsUI() {
    const isFinger = localStorage.getItem('vss_admin_fingerprint') === 'true';
    const isFace = localStorage.getItem('vss_admin_face') === 'true';

    const fingerBadge = document.getElementById('fingerprint-status-badge');
    const fingerBtn = document.getElementById('btn-setup-fingerprint');
    const faceBadge = document.getElementById('face-status-badge');
    const faceBtn = document.getElementById('btn-setup-face');

    if (fingerBadge && fingerBtn) {
        if (isFinger) {
            fingerBadge.className = 'badge green';
            fingerBadge.textContent = currentLanguage === 'en' ? 'Configured / Active' : 'सक्रिय / कॉन्फिगर केलेले';
            fingerBtn.className = 'btn-secondary btn-sm mt-2 w-full';
            fingerBtn.textContent = currentLanguage === 'en' ? 'Remove' : 'हटवा';
        } else {
            fingerBadge.className = 'badge red';
            fingerBadge.textContent = currentLanguage === 'en' ? 'Not Configured' : 'कॉन्फिगर केलेले नाही';
            fingerBtn.className = 'btn-primary btn-sm mt-2 w-full';
            fingerBtn.textContent = currentLanguage === 'en' ? 'Configure' : 'कॉन्फिगर करा';
        }
    }

    if (faceBadge && faceBtn) {
        if (isFace) {
            faceBadge.className = 'badge green';
            faceBadge.textContent = currentLanguage === 'en' ? 'Configured / Active' : 'सक्रिय / कॉन्फिगर केलेले';
            faceBtn.className = 'btn-secondary btn-sm mt-2 w-full';
            faceBtn.textContent = currentLanguage === 'en' ? 'Remove' : 'हटवा';
        } else {
            faceBadge.className = 'badge red';
            faceBadge.textContent = currentLanguage === 'en' ? 'Not Configured' : 'कॉन्फिगर केलेले नाही';
            faceBtn.className = 'btn-primary btn-sm mt-2 w-full';
            faceBtn.textContent = currentLanguage === 'en' ? 'Configure' : 'कॉन्फिगर करा';
        }
    }
}

function updateLoginBiometricsUI() {
    const isFinger = localStorage.getItem('vss_admin_fingerprint') === 'true';
    const isFace = localStorage.getItem('vss_admin_face') === 'true';
    const btnFinger = document.getElementById('btn-login-biometric-fingerprint');
    const btnFace = document.getElementById('btn-login-biometric-face');

    if (btnFinger) {
        if (isFinger) btnFinger.classList.remove('d-none');
        else btnFinger.classList.add('d-none');
    }
    if (btnFace) {
        if (isFace) btnFace.classList.remove('d-none');
        else btnFace.classList.add('d-none');
    }
}
