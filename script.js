// ===================================================================
// 1. إعدادات أولية ومتغيرات عامة
// ===================================================================

// عنوان API الخاص بالخادم
const API_URL = 'http://localhost:3000/api';

// متغير لحفظ بيانات جميع الاستبيانات (يتم تحميلها من قاعدة البيانات)
window.surveysData = [];

// متغير لتتبع حالة تسجيل دخول المستخدم (الموظف)
let isLoggedIn = false;

// بيانات الدخول الافتراضية للموظف
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';


// ===================================================================
// 2. دوال التنقل بين الصفحات (Navigation Functions)
// ===================================================================

// دالة لإظهار الصفحة الرئيسية وإخفاء البقية
function showLanding() {
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('landingPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// دالة لإظهار صفحة الاستبيان وإخفاء البقية
function showSurvey() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// دالة لإظهار صفحة تسجيل الدخول وإخفاء البقية
function showLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// دالة لإظهار لوحة التحكم (بعد التحقق من تسجيل الدخول)
async function showDashboard() {
    // إذا لم يكن المستخدم مسجلاً دخوله، يتم توجيهه لصفحة الدخول
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    
    // تحميل البيانات من قاعدة البيانات
    await loadSurveysFromDatabase();
    updateDashboard();
    window.scrollTo(0, 0);
}

// دالة تسجيل الخروج
function logout() {
    isLoggedIn = false;
    showLanding();
}


// ===================================================================
// 3. دوال الاتصال بقاعدة البيانات (Database API Functions)
// ===================================================================

// دالة لتحميل جميع الاستبيانات من قاعدة البيانات
async function loadSurveysFromDatabase() {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        if (response.ok) {
            window.surveysData = await response.json();
            console.log('✅ تم تحميل البيانات من قاعدة البيانات:', window.surveysData.length);
        } else {
            console.error('خطأ في تحميل البيانات');
        }
    } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        alert('تعذر الاتصال بالخادم. تأكد من تشغيل الخادم أولاً.');
    }
}

// دالة لحفظ استبيان جديد في قاعدة البيانات
async function saveSurveyToDatabase(surveyData) {
    try {
        const response = await fetch(`${API_URL}/surveys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ تم حفظ الاستبيان في قاعدة البيانات');
            return result;
        } else {
            console.error('خطأ في حفظ البيانات');
            return null;
        }
    } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        alert('تعذر حفظ البيانات. تأكد من تشغيل الخادم.');
        return null;
    }
}


// ===================================================================
// 4. دوال معالجة النماذج (Form Handlers)
// ===================================================================

// دالة لمعالجة عملية تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // التحقق من صحة اسم المستخدم وكلمة المرور
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        showDashboard();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// دالة لمعالجة إرسال نموذج الاستبيان
async function handleSubmit(event) {
    event.preventDefault();
    
    // جمع بيانات النموذج في كائن (object) واحد
    const formData = {
        fullName: document.getElementById('fullName').value,
        ageGroup: document.getElementById('ageGroup').value,
        gender: document.getElementById('gender').value,
        incomeLevel: document.getElementById('incomeLevel').value,
        educationLevel: document.getElementById('educationLevel').value,
        employmentStatus: document.getElementById('employmentStatus').value,
        familySize: document.getElementById('familySize').value,
        timestamp: new Date().toISOString(),
        programs: getRecommendedPrograms(
            document.getElementById('ageGroup').value, 
            document.getElementById('incomeLevel').value
        )
    };

    // حفظ البيانات في قاعدة البيانات
    const result = await saveSurveyToDatabase(formData);
    
    if (result) {
        console.log('Survey Data Submitted:', formData);

        // إظهار نافذة تأكيد الإرسال
        const modal = document.getElementById('successModal');
        modal.classList.add('show');
        
        // إخفاء النافذة بعد 3 ثوانٍ والعودة للصفحة الرئيسية
        setTimeout(() => {
            modal.classList.remove('show');
            document.getElementById('surveyForm').reset();
            showLanding();
        }, 3000);
    }
}


// ===================================================================
// 5. منطق النظام (Business Logic)
// ===================================================================

// دالة لتحديد البرامج الموصى بها بناءً على معايير محددة
function getRecommendedPrograms(age, income) {
    const programs = [];
    
    // توصيات بناءً على العمر
    if (age === '0-12' || age === '13-17') {
        programs.push('التدريب على المهارات');
    }
    if (age === '18-25' || age === '26-35') {
        programs.push('التطوير المهني');
    }
    if (age === '56-65' || age === '66+') {
        programs.push('حلول الرعاية');
    }
    
    // توصيات بناءً على الدخل
    if (income === 'low' || income === 'medium-low') {
        programs.push('الثقافة المالية');
    }
    
    // إضافة برنامج افتراضي إذا لم تتطابق أي من الشروط
    if (programs.length === 0) {
        programs.push('التطوير المهني');
    }
    
    return programs;
}


// ===================================================================
// 6. دوال تحديث لوحة التحكم (Dashboard Update Functions)
// ===================================================================

// دالة رئيسية لتحديث جميع مكونات لوحة التحكم
function updateDashboard() {
    updateKPIs();
    updateCharts();
    updateTable();
}

// تحديث بطاقات مؤشرات الأداء الرئيسية (KPIs)
function updateKPIs() {
    const total = window.surveysData.length;
    document.getElementById('totalSurveys').textContent = total;
    
    if (total > 0) {
        const totalProgramsCount = window.surveysData.reduce((sum, survey) => 
            sum + (survey.programs ? survey.programs.length : 0), 0);
        const avg = (totalProgramsCount / total).toFixed(1);
        document.getElementById('avgPrograms').textContent = avg;
    } else {
        document.getElementById('avgPrograms').textContent = 0;
    }
}

// تحديث الرسوم البيانية
function updateCharts() {
    updateProgramsChart();
    updateDemographicChart();
    updateIncomeChart();
    updateEducationChart();
}

// دالة لتحديث الرسم البياني الخاص بالبرامج
function updateProgramsChart() {
    const ctx = document.getElementById('programsChart').getContext('2d');
    const programCounts = {};
    
    window.surveysData.forEach(survey => {
        if (survey.programs) {
            survey.programs.forEach(program => {
                programCounts[program] = (programCounts[program] || 0) + 1;
            });
        }
    });

    if (window.programsChartInstance) {
        window.programsChartInstance.destroy();
    }

    window.programsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(programCounts),
            datasets: [{
                label: 'عدد المستفيدين',
                data: Object.values(programCounts),
                backgroundColor: '#f5a623',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// دالة لتحديث الرسم البياني الخاص بالفئات العمرية
function updateDemographicChart() {
    const ctx = document.getElementById('demographicChart').getContext('2d');
    const ageCounts = {};
    
    window.surveysData.forEach(survey => {
        ageCounts[survey.ageGroup] = (ageCounts[survey.ageGroup] || 0) + 1;
    });

    if (window.demographicChartInstance) {
        window.demographicChartInstance.destroy();
    }

    window.demographicChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(ageCounts),
            datasets: [{
                data: Object.values(ageCounts),
                backgroundColor: ['#f5a623', '#e67e22', '#d68910', '#c77a0a', '#b86b05', '#f39c12', '#d35400', '#e74c3c']
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
}

// دالة لتحديث الرسم البياني الخاص بالدخل
function updateIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    const incomeCounts = {};
    
    window.surveysData.forEach(survey => {
        incomeCounts[survey.incomeLevel] = (incomeCounts[survey.incomeLevel] || 0) + 1;
    });

    if (window.incomeChartInstance) {
        window.incomeChartInstance.destroy();
    }

    window.incomeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(incomeCounts),
            datasets: [{
                label: 'عدد المستفيدين',
                data: Object.values(incomeCounts),
                backgroundColor: '#3cb579',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// دالة لتحديث الرسم البياني الخاص بالمستوى التعليمي
function updateEducationChart() {
    const ctx = document.getElementById('educationChart').getContext('2d');
    const eduCounts = {};
    
    window.surveysData.forEach(survey => {
        eduCounts[survey.educationLevel] = (eduCounts[survey.educationLevel] || 0) + 1;
    });

    if (window.educationChartInstance) {
        window.educationChartInstance.destroy();
    }

    window.educationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(eduCounts),
            datasets: [{
                label: 'عدد المستفيدين',
                data: Object.values(eduCounts),
                backgroundColor: '#3498db',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// دالة لتحديث جدول أحدث الاستبيانات
function updateTable() {
    const tbody = document.getElementById('surveysTableBody');
    
    if (window.surveysData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">لا توجد استبيانات بعد</td></tr>';
        return;
    }

    tbody.innerHTML = window.surveysData.slice(-10).reverse().map(survey => `
        <tr>
            <td>${new Date(survey.timestamp).toLocaleDateString('ar-SA')}</td>
            <td>
                ${survey.programs.map(p => `<span class="badge badge-yellow">${p}</span>`).join(' ')}
            </td>
            <td>${survey.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
            <td>${survey.ageGroup}</td>
            <td>${survey.fullName}</td>
        </tr>
    `).join('');
}


// ===================================================================
// 7. دوال إضافية (Utility Functions)
// ===================================================================

// دالة لتصدير البيانات إلى ملف CSV (متوافق مع Excel)
function exportToExcel() {
    if (window.surveysData.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }

    let csv = 'الاسم,الفئة العمرية,الجنس,مستوى الدخل,المستوى التعليمي,الحالة الوظيفية,عدد أفراد الأسرة,البرامج الموصى بها,التاريخ\n';
    
    window.surveysData.forEach(survey => {
        csv += `${survey.fullName},${survey.ageGroup},${survey.gender},${survey.incomeLevel},${survey.educationLevel},${survey.employmentStatus},${survey.familySize},"${survey.programs.join(', ')}",${new Date(survey.timestamp).toLocaleDateString('ar-SA')}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// رسائل تظهر في console المتصفح للمطورين
console.log('Social Development Survey System Loaded');
console.log('Default Login - Username: admin, Password: admin123');
console.log('Backend API URL:', API_URL);