// ===================================================================
// 1. إعدادات أولية ومتغيرات عامة
// ===================================================================

// عنوان API الخاص بالخادم
const API_URL = 'http://localhost:3000/api';

// متغير لحفظ بيانات جميع الاستبيانات
window.surveysData = [];

// متغير لتتبع حالة تسجيل دخول المستخدم
let isLoggedIn = false;

// بيانات الدخول الافتراضية
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// فحص حالة الخادم عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', async () => {
    await checkServerStatus();
});

// ===================================================================
// 2. دالة فحص حالة الخادم
// ===================================================================
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        if (response.ok) {
            console.log('✅ الخادم يعمل بشكل صحيح');
            return true;
        } else {
            console.warn('⚠️ الخادم يعمل لكن هناك مشكلة في API');
            showServerWarning();
            return false;
        }
    } catch (error) {
        console.error('❌ الخادم لا يعمل:', error);
        showServerWarning();
        return false;
    }
}

function showServerWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #e74c3c;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-family: Tajawal, sans-serif;
        text-align: center;
    `;
    warning.innerHTML = `
        <strong>⚠️ تحذير:</strong> الخادم لا يعمل!<br>
        <small>قم بتشغيل الأمر: <code>npm start</code> في Terminal</small>
    `;
    document.body.appendChild(warning);
    
    setTimeout(() => warning.remove(), 8000);
}

// ===================================================================
// 3. دوال التنقل بين الصفحات
// ===================================================================

function showLanding() {
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('landingPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showSurvey() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    window.scrollTo(0, 0);
}

async function showDashboard() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('surveyPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    
    await loadSurveysFromDatabase();
    updateDashboard();
    window.scrollTo(0, 0);
}

function logout() {
    isLoggedIn = false;
    showLanding();
}

// ===================================================================
// 4. دوال الاتصال بقاعدة البيانات - محسنة
// ===================================================================

async function loadSurveysFromDatabase() {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        if (response.ok) {
            window.surveysData = await response.json();
            console.log('✅ تم تحميل البيانات:', window.surveysData.length, 'استبيان');
        } else {
            console.error('خطأ في تحميل البيانات - الكود:', response.status);
            alert('حدث خطأ في تحميل البيانات من الخادم');
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بالخادم:', error);
        alert('تعذر الاتصال بالخادم.\n\nتأكد من:\n1. تشغيل الخادم (npm start)\n2. الخادم يعمل على المنفذ 3000');
    }
}

async function saveSurveyToDatabase(surveyData) {
    try {
        console.log('📤 جاري إرسال البيانات إلى الخادم...');
        
        const response = await fetch(`${API_URL}/surveys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ تم حفظ الاستبيان بنجاح - ID:', result.id);
            return result;
        } else {
            const errorText = await response.text();
            console.error('❌ خطأ في حفظ البيانات:', response.status, errorText);
            alert(`خطأ في حفظ البيانات (الكود: ${response.status})\n\nالمرجو التواصل مع الدعم الفني.`);
            return null;
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بالخادم:', error);
        
        // رسالة خطأ أكثر تفصيلاً
        let errorMessage = 'تعذر حفظ البيانات!\n\n';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += 'السبب: الخادم لا يعمل أو غير متصل\n\n';
            errorMessage += 'الحل:\n';
            errorMessage += '1. افتح Terminal في مجلد المشروع\n';
            errorMessage += '2. شغل الأمر: npm start\n';
            errorMessage += '3. تأكد من ظهور رسالة "الخادم يعمل الآن"';
        } else {
            errorMessage += 'خطأ غير متوقع: ' + error.message;
        }
        
        alert(errorMessage);
        return null;
    }
}

// ===================================================================
// 5. دوال معالجة النماذج
// ===================================================================

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        showDashboard();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    // إضافة مؤشر تحميل
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ جاري الحفظ...';
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        ageGroup: document.getElementById('ageGroup').value,
        gender: document.getElementById('gender').value,
        incomeLevel: document.getElementById('incomeLevel').value,
        educationLevel: document.getElementById('educationLevel').value,
        employmentStatus: document.getElementById('employmentStatus').value,
        familySize: parseInt(document.getElementById('familySize').value),
        timestamp: new Date().toISOString(),
        programs: getRecommendedPrograms(
            document.getElementById('ageGroup').value, 
            document.getElementById('incomeLevel').value
        )
    };

    const result = await saveSurveyToDatabase(formData);
    
    // إعادة تفعيل الزر
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    if (result) {
        console.log('✅ تم إرسال الاستبيان:', formData);

        const modal = document.getElementById('successModal');
        modal.classList.add('show');
        
        setTimeout(() => {
            modal.classList.remove('show');
            document.getElementById('surveyForm').reset();
            showLanding();
        }, 3000);
    }
}

// ===================================================================
// 6. منطق النظام
// ===================================================================

function getRecommendedPrograms(age, income) {
    const programs = [];
    
    if (age === '0-12' || age === '13-17') {
        programs.push('التدريب على المهارات');
    }
    if (age === '18-25' || age === '26-35') {
        programs.push('التطوير المهني');
    }
    if (age === '56-65' || age === '66+') {
        programs.push('حلول الرعاية');
    }
    
    if (income === 'low' || income === 'medium-low') {
        programs.push('الثقافة المالية');
    }
    
    if (programs.length === 0) {
        programs.push('التطوير المهني');
    }
    
    return programs;
}

// ===================================================================
// 7. دوال تحديث لوحة التحكم
// ===================================================================

function updateDashboard() {
    updateKPIs();
    updateCharts();
    updateTable();
}

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

function updateCharts() {
    updateProgramsChart();
    updateDemographicChart();
    updateIncomeChart();
    updateEducationChart();
}

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
// 8. دوال إضافية
// ===================================================================

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

console.log('✅ Social Development Survey System Loaded');
console.log('👤 Default Login - Username: admin, Password: admin123');
console.log('🔗 Backend API URL:', API_URL);