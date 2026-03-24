const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');
const settingsBtn = document.getElementById('settingsBtn');

const dayModal = document.getElementById('dayModal');
const settingsModal = document.getElementById('settingsModal');

let currentDate = new Date();
let selectedDateKey = '';
let shifts = JSON.parse(localStorage.getItem('calendarShifts')) || [];
let shiftTypes = JSON.parse(localStorage.getItem('shiftTypes')) || [
    { id: 1, name: "Ranní", color: "#3b82f6" },
    { id: 2, name: "Odpolední", color: "#10b981" },
    { id: 3, name: "Noční", color: "#8b5cf6" },
    { id: 4, name: "Volno", color: "#6b7280" }
];

// Ukládání
function saveShifts() { localStorage.setItem('calendarShifts', JSON.stringify(shifts)); }
function saveShiftTypes() { localStorage.setItem('shiftTypes', JSON.stringify(shiftTypes)); }

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Vykreslení kalendáře
function renderCalendar() {
    daysContainer.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Předchozí měsíc
    for (let i = firstDay - 1; i >= 0; i--) {
        daysContainer.appendChild(createDayElement(daysInPrevMonth - i, true));
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false);
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        daysContainer.appendChild(dayEl);
    }

    // Následující měsíc
    const remaining = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remaining; day++) {
        daysContainer.appendChild(createDayElement(day, true));
    }
}

function createDayElement(day, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('day');
    if (isOtherMonth) dayEl.classList.add('other-month');
    dayEl.innerHTML = `<strong>${day}</strong>`;

    const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(thisDate);

    if (shifts.some(s => s.date === dateKey)) {
        dayEl.classList.add('has-shift');
    }

    dayEl.addEventListener('click', () => {
        selectedDateKey = dateKey;
        document.getElementById('modalDate').textContent = thisDate.toLocaleDateString('cs-CZ', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        showShiftsForDay();
        dayModal.style.display = 'flex';
    });

    return dayEl;
}

function showShiftsForDay() {
    const list = document.getElementById('shiftsList');
    list.innerHTML = '';
    const dayShifts = shifts.filter(s => s.date === selectedDateKey);

    if (dayShifts.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:30px 0;">Zatím žádná směna</p>';
    } else {
        dayShifts.forEach(shift => {
            const type = shiftTypes.find(t => t.id === shift.typeId) || {name: "Směna", color: "#4f46e5"};
            const div = document.createElement('div');
            div.className = 'shift-item';
            div.style.setProperty('--shift-color', type.color);
            div.innerHTML = `
                <strong>${type.name}</strong>
                <span>${shift.start} – ${shift.end}</span>
                ${shift.note ? `<p style="margin:5px 0 0; font-size:0.9rem; color:#555;">${shift.note}</p>` : ''}
            `;
            list.appendChild(div);
        });
    }
}

function populateShiftTypes() {
    const select = document.getElementById('shiftType');
    select.innerHTML = '';
    shiftTypes.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type.id;
        opt.textContent = type.name;
        select.appendChild(opt);
    });
}

// Eventy pro přidávání směny
document.getElementById('addShiftBtn').addEventListener('click', () => {
    populateShiftTypes();
    document.getElementById('addShiftForm').style.display = 'block';
    document.getElementById('addShiftBtn').style.display = 'none';
});

document.getElementById('saveShiftBtn').addEventListener('click', () => {
    const typeId = parseInt(document.getElementById('shiftType').value);
    const start = document.getElementById('shiftStart').value;
    const end = document.getElementById('shiftEnd').value;
    const note = document.getElementById('shiftNote').value.trim();

    if (!typeId || !start || !end) {
        alert('Vyplňte všechny povinné údaje.');
        return;
    }

    shifts.push({ date: selectedDateKey, typeId, start, end, note });
    saveShifts();
    showShiftsForDay();

    document.getElementById('addShiftForm').style.display = 'none';
    document.getElementById('addShiftBtn').style.display = 'block';
});

document.getElementById('cancelShiftBtn').addEventListener('click', () => {
    document.getElementById('addShiftForm').style.display = 'none';
    document.getElementById('addShiftBtn').style.display = 'block';
});

// Nastavení
settingsBtn.addEventListener('click', () => {
    renderShiftTypes();
    settingsModal.style.display = 'flex';
});

function renderShiftTypes() {
    const list = document.getElementById('typesList');
    list.innerHTML = '';
    shiftTypes.forEach((type, index) => {
        const div = document.createElement('div');
        div.className = 'type-item';
        div.innerHTML = `
            <div class="color-dot" style="background:${type.color}"></div>
            <span>${type.name}</span>
            <button class="delete-type" data-index="${index}" style="margin-left:auto; background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:6px;">Smazat</button>
        `;
        list.appendChild(div);
    });
}

document.getElementById('addTypeBtn').addEventListener('click', () => {
    const name = document.getElementById('newTypeName').value.trim();
    const color = document.getElementById('newTypeColor').value;
    if (!name) return alert('Zadejte název typu');
    
    shiftTypes.push({ id: Date.now(), name, color });
    saveShiftTypes();
    renderShiftTypes();
    document.getElementById('newTypeName').value = '';
});

document.getElementById('typesList').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-type')) {
        const index = parseInt(e.target.dataset.index);
        if (confirm('Opravdu chcete smazat tento typ směny?')) {
            shiftTypes.splice(index, 1);
            saveShiftTypes();
            renderShiftTypes();
        }
    }
});

// Zavírání modalů
function closeModal(modalEl) {
    modalEl.style.display = 'none';
}

document.getElementById('closeDayModal').addEventListener('click', () => closeModal(dayModal));
document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal(settingsModal));

dayModal.addEventListener('click', e => { if (e.target === dayModal) closeModal(dayModal); });
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeModal(settingsModal); });

// Navigace
prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

// Start
renderCalendar();