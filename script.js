// ===================================================================
// 1. إعدادات أولية ومتغيرات عامة
// ===================================================================

// متغير لحفظ بيانات جميع الاستبيانات في ذاكرة المتصفح.
// ملاحظة: هذه البيانات مؤقتة وتفقد عند تحديث الصفحة.
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
    window.scrollTo(0, 0); // الانتقال لأعلى الصفحة
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
function showDashboard() {
    // إذا لم يكن المستخدم مسجلاً دخوله، يتم توجيهه لصفحة الدخول
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    updateDashboard(); // تحديث بيانات لوحة التحكم
    window.scrollTo(0, 0);
}

// دالة تسجيل الخروج
function logout() {
    isLoggedIn = false;
    showLanding(); // العودة للصفحة الرئيسية
}


// ===================================================================
// 3. دوال معالجة النماذج (Form Handlers)
// ===================================================================

// دالة لمعالجة عملية تسجيل الدخول
function handleLogin(event) {
    event.preventDefault(); // منع السلوك الافتراضي للنموذج (تحديث الصفحة)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // التحقق من صحة اسم المستخدم وكلمة المرور
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        showDashboard(); // عرض لوحة التحكم عند النجاح
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// دالة لمعالجة إرسال نموذج الاستبيان
function handleSubmit(event) {
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
        timestamp: new Date().toISOString(), // إضافة التاريخ والوقت الحالي
        // استدعاء دالة لتحديد البرامج الموصى بها بناءً على الإجابات
        programs: getRecommendedPrograms(
            document.getElementById('ageGroup').value, 
            document.getElementById('incomeLevel').value
        )
    };

    // إضافة بيانات الاستبيان الجديد إلى مصفوفة البيانات العامة
    window.surveysData.push(formData);
    console.log('Survey Data Submitted:', formData);

    // إظهار نافذة تأكيد الإرسال
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    
    // إخفاء النافذة بعد 3 ثوانٍ والعودة للصفحة الرئيسية
    setTimeout(() => {
        modal.classList.remove('show');
        document.getElementById('surveyForm').reset(); // إعادة تعيين حقول النموذج
        showLanding();
    }, 3000);
}


// ===================================================================
// 4. منطق النظام (Business Logic)
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
    
    return programs; // إرجاع مصفوفة البرامج الموصى بها
}


// ===================================================================
// 5. دوال تحديث لوحة التحكم (Dashboard Update Functions)
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
        // حساب إجمالي عدد البرامج الموصى بها
        const totalProgramsCount = window.surveysData.reduce((sum, survey) => 
            sum + (survey.programs ? survey.programs.length : 0), 0);
        // حساب متوسط البرامج لكل فرد
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
    const programCounts = {}; // كائن لحفظ عدد مرات التوصية بكل برنامج
    
    // حساب التكرارات
    window.surveysData.forEach(survey => {
        if (survey.programs) {
            survey.programs.forEach(program => {
                programCounts[program] = (programCounts[program] || 0) + 1;
            });
        }
    });

    // حذف الرسم البياني القديم قبل إنشاء واحد جديد (لتجنب التراكم)
    if (window.programsChartInstance) {
        window.programsChartInstance.destroy();
    }

    // إنشاء رسم بياني جديد باستخدام Chart.js
    window.programsChartInstance = new Chart(ctx, {
        type: 'bar', // نوع الرسم: أعمدة
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
        type: 'pie', // نوع الرسم: دائري
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
    
    // إذا لم تكن هناك بيانات، يتم عرض رسالة
    if (window.surveysData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">لا توجد استبيانات بعد</td></tr>';
        return;
    }

    // عرض آخر 10 استبيانات فقط (مع عكس الترتيب لإظهار الأحدث أولاً)
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
// 6. دوال إضافية (Utility Functions)
// ===================================================================

// دالة لتصدير البيانات إلى ملف CSV (متوافق مع Excel)
function exportToExcel() {
    if (window.surveysData.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }

    // إنشاء رأس الجدول
    let csv = 'الاسم,الفئة العمرية,الجنس,مستوى الدخل,المستوى التعليمي,الحالة الوظيفية,عدد أفراد الأسرة,البرامج الموصى بها,التاريخ\n';
    
    // إضافة صف لكل استبيان
    window.surveysData.forEach(survey => {
        csv += `${survey.fullName},${survey.ageGroup},${survey.gender},${survey.incomeLevel},${survey.educationLevel},${survey.employmentStatus},${survey.familySize},"${survey.programs.join(', ')}",${new Date(survey.timestamp).toLocaleDateString('ar-SA')}\n`;
    });

    // إنشاء ملف وتنزيله
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// رسائل تظهر في console المتصفح للمطورين
console.log('Social Development Survey System Loaded');
console.log('Default Login - Username: admin, Password: admin123');