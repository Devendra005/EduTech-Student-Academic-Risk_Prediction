// --- GLOBAL STATE & CONFIG ---
let charts = {};
const chartColors = {
    primary: '#72dcff',
    secondary: '#669dff',
    accent: '#ff716c',
    bg: 'rgba(255, 255, 255, 0.05)'
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupNavigation();
    fetchStats();
    initCharts();
    loadStudents();
    loadHistory();
    setupForm();
    setupModals();
    setupSearch();
    setupExport();
}

function setupExport() {
    document.getElementById('exportData').addEventListener('click', async () => {
        showToast("Generating Export Stream...");
        try {
            const res = await fetch('/students?limit=5000');
            const data = await res.json();
            if (data.length === 0) return;
            
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
            const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `EduTrace_Student_Data_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            showToast("CSV Export Successful.");
        } catch (err) {
            showToast("Export Failed.");
        }
    });
}

// --- SEARCH LOGIC ---
function setupSearch() {
    const searchInput = document.getElementById('globalSearch');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value;
            loadStudents(query);
            showToast(query ? `Searching institutional records: "${query}"` : "Search cleared.");
        }, 500);
    });
}

// --- MODAL & CRUD LOGIC ---
function setupModals() {
    const modal = document.getElementById('studentModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');
    const enrollBtn = document.getElementById('addStudentBtn');
    const studentForm = document.getElementById('studentDataForm');

    enrollBtn.addEventListener('click', () => {
        studentForm.reset();
        document.getElementById('modalTitle').innerText = "Enroll New Student";
        document.getElementById('mStudentId').readOnly = false;
        modal.classList.add('active');
    });

    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Finalize IDs and Numbers
        const studentId = parseInt(data.Student_ID);
        const isEdit = document.getElementById('modalTitle').innerText === "Edit Student Record";
        const url = isEdit ? `/student/${studentId}` : '/students';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (result.status === 'success') {
                showToast(`SUCCESS: Student ${isEdit ? 'Updated' : 'Enrolled'}.`);
                modal.classList.remove('active');
                loadStudents();
                fetchStats();
            }
        } catch (err) {
            showToast("Database Save Error.");
        }
    });
}

async function deleteStudent(id) {
    if (confirm(`CRITICAL: Confirm deletion of Student #${id}? This action cannot be undone.`)) {
        try {
            const res = await fetch(`/student/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(`Student #${id} removed from records.`);
                loadStudents();
                fetchStats();
            }
        } catch (err) { showToast("Deletion Error."); }
    }
}

async function editStudent(id) {
    showToast(`Loading Student #${id} metadata...`);
    try {
        const res = await fetch(`/student/${id}`);
        const student = await res.json();
        
        // Populate modal
        const form = document.getElementById('studentDataForm');
        document.getElementById('modalTitle').innerText = "Edit Student Record";
        document.getElementById('mStudentId').value = student.Student_ID;
        document.getElementById('mStudentId').readOnly = true;
        document.getElementById('mAge').value = student.Age;
        document.getElementById('mGender').value = student.Gender;
        document.getElementById('mAttendance').value = student.Attendance_Percentage;
        document.getElementById('mGrade').value = student.Current_Grade;
        document.getElementById('mBehavior').value = student.Behavior_Score;
        document.getElementById('mPrevGrade').value = student.Previous_Grade;
        document.getElementById('mStudy').value = student.Study_Hours;
        document.getElementById('mAssignments').value = student.Assignments_Submitted;
        document.getElementById('mParentEdu').value = student.Parent_Education || "Unknown";
        document.getElementById('mFamilyInc').value = student.Family_Income || "Medium";
        document.getElementById('mInternet').value = student.Internet_Access || "No";
        document.getElementById('mRisk').value = student.Academic_Risk ?? 0;

        document.getElementById('studentModal').classList.add('active');
    } catch (err) { showToast("Record Retrieval Error."); }
}

// --- DATA FETCHING ---
async function loadStudents(query = "") {
    const body = document.getElementById('fullStudentsBody');
    body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 50px;">Processing Database...</td></tr>';
    
    try {
        const url = query ? `/students?search=${encodeURIComponent(query)}` : '/students';
        const res = await fetch(url);
        const students = await res.json();
        
        body.innerHTML = '';
        if (students.length === 0) {
            body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 50px; opacity:0.5;">No records found matching criteria.</td></tr>';
            return;
        }

        students.forEach(student => {
            const riskStatus = student.Academic_Risk === 1 ? 'At Risk' : 'Secure';
            const riskClass = student.Academic_Risk === 1 ? 'status-at-risk' : 'status-optimal';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight:800; color:var(--primary)">#${student.Student_ID}</td>
                <td>${student.Gender}</td>
                <td>${student.Age}</td>
                <td>${student.Attendance_Percentage}%</td>
                <td>${student.Current_Grade}</td>
                <td>${student.Behavior_Score} Index</td>
                <td><span class="status-pill ${riskClass}">${riskStatus}</span></td>
                <td>
                    <button class="action-btn" style="color:var(--primary)" onclick="editStudent(${student.Student_ID})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn" style="color:var(--accent-red)" onclick="deleteStudent(${student.Student_ID})"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            body.appendChild(row);
        });
    } catch (err) { body.innerHTML = 'Error loading records.'; }
}

// --- REST OF THE LOGIC (PREVIOUSLY IMPLEMENTED) ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar .nav-item'); // Limit to sidebar items
    const pages = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('pageTitle');
    const pageDesc = document.getElementById('pageDescription');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (!target) return;
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            pages.forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById(target);
            if (targetPage) targetPage.classList.add('active');
            updateHeader(target, pageTitle, pageDesc);
        });
    });
}

function updateHeader(pageId, title, desc) {
    const headers = {
        dashboardPage: ["Dashboard Overview", "Global system statistics and institutional performance trends."],
        predictorPage: ["Dropout Risk Predictor", "Diagnostic neural analysis for individual student dropout risk."],
        studentsPage: ["Student Performance Database", "Search and manage centralized student records."],
        analyticsPage: ["Institutional Analytics", "Advanced data visualization of AI influence factors."],
        settingsPage: ["Portal Settings", "Configure system security, biometrics, and AI behavior."]
    };
    [title.innerText, desc.innerText] = headers[pageId];
}

function initCharts() {
    const ctx1 = document.getElementById('gradeChart').getContext('2d');
    const ctx2 = document.getElementById('performanceChart').getContext('2d');
    const ctx3 = document.getElementById('influenceChart').getContext('2d');
    const ctx4 = document.getElementById('genderDistribution').getContext('2d');
    Chart.defaults.color = '#a9abb3';
    Chart.defaults.font.family = "'Manrope', sans-serif";
    charts.grades = new Chart(ctx1, { type: 'bar', data: { labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], datasets: [{ label: 'Count', data: [120, 450, 1800, 2100, 530], backgroundColor: 'rgba(114, 220, 255, 0.4)', borderColor: chartColors.primary, borderWidth: 1, borderRadius: 12 }] }, options: { scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } } });
    charts.performance = new Chart(ctx2, { type: 'line', data: { labels: ['T1', 'T2', 'T3', 'T4', 'T5'], datasets: [{ label: 'Attendance', data: [82, 85, 84, 88, 91], borderColor: chartColors.primary, tension: 0.4 }, { label: 'Grade', data: [71, 74, 73, 78, 82], borderColor: chartColors.secondary, tension: 0.4 }] } });
    charts.influence = new Chart(ctx3, { type: 'radar', data: { labels: ['Attendance', 'Prev Grade', 'Study Hours', 'Behavior', 'Family Income', 'Internet'], datasets: [{ label: 'Significance %', data: [85, 75, 90, 60, 40, 55], backgroundColor: 'rgba(114, 220, 255, 0.15)', borderColor: chartColors.primary, borderWidth: 3, pointBackgroundColor: chartColors.primary, pointHoverRadius: 8 }] }, options: { scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.05)' }, pointLabels: { font: { size: 14, weight: 'bold' }, color: '#ecedf6' }, ticks: { display: false } } }, plugins: { legend: { display: false } } } });
    charts.gender = new Chart(ctx4, { type: 'doughnut', data: { labels: ['Female', 'Male'], datasets: [{ data: [52, 48], backgroundColor: [chartColors.primary, chartColors.secondary], borderWidth: 0 }] } });
}

async function fetchStats() {
    try {
        const res = await fetch('/stats');
        const stats = await res.json();
        document.getElementById('statTotal').innerText = stats.total_students.toLocaleString();
        document.getElementById('statAttendance').innerText = `${stats.avg_attendance}%`;
        document.getElementById('statGrade').innerText = stats.avg_grade;
        document.getElementById('statRisk').innerText = `${stats.risk_percentage}%`;
    } catch (err) {}
}

function setupForm() {
    document.getElementById('riskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultContent = document.getElementById('resultContent');
        const riskDisplay = document.getElementById('riskDisplay');
        const loader = resultContent.querySelector('.loader-container');
        const msg = resultContent.querySelector('.placeholder-msg');
        resultContent.style.display = 'flex'; msg.style.display = 'none'; loader.style.display = 'block'; riskDisplay.style.display = 'none';
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        for (let k in data) if (!isNaN(data[k])) data[k] = parseFloat(data[k]);
        try {
            const res = await fetch('/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await res.json();
            setTimeout(() => { showPredictResult(result); saveToHistory(data, result); }, 1200);
        } catch (err) { }
    });
}

function showPredictResult(result) {
    document.getElementById('resultContent').style.display = 'none';
    const disp = document.getElementById('riskDisplay'); disp.style.display = 'block';
    document.getElementById('riskPct').innerText = `${result.risk_score}%`;
    const status = document.getElementById('riskStatus'); status.innerText = result.status;
    status.className = `risk-status ${result.prediction === 1 ? 'status-high' : 'status-low'}`;
    const gauge = document.getElementById('gaugeFill'); gauge.style.strokeDashoffset = 283 - (result.risk_score / 100) * 283;
}

function saveToHistory(input, result) {
    let history = JSON.parse(localStorage.getItem('eduTraceHistoryV1') || '[]');
    history.unshift({ date: new Date().toLocaleTimeString(), id: input.Student_ID || 'NEW', grade: input.Current_Grade, score: result.risk_score, status: result.status, prediction: result.prediction });
    localStorage.setItem('eduTraceHistoryV1', JSON.stringify(history.slice(0, 10)));
    loadHistory();
}

function loadHistory() {
    try {
        const historyData = localStorage.getItem('eduTraceHistoryV1');
        const history = historyData ? JSON.parse(historyData) : [];
        const body = document.getElementById('historyBody');
        if (!body) return;
        body.innerHTML = '';
        
        if (history.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align:center; opacity:0.3; padding: 20px;">No Recent Analytics.</td></tr>';
            return;
        }
        
        history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.date}</td><td style="font-weight: 800">#${item.id}</td><td>${item.grade}</td><td style="color:var(--primary); font-weight:800">${item.score}%</td><td><span class="trend" style="color:${item.prediction === 1 ? 'var(--accent-red)' : 'var(--accent-green)'}">${item.status}</span></td>`;
            body.appendChild(row);
        });
    } catch (err) {
        console.error("History Retrieval Failure:", err);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast'); toast.innerText = msg; toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

