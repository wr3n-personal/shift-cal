// === KALENDÁŘ SMĚN – finální verze ===

const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');

const dayModal = document.getElementById('dayModal');
const modalDate = document.getElementById('modalDate');
const shiftsList = document.getElementById('shiftsList');
const addShiftBtn = document.getElementById('addShiftBtn');
const addShiftForm = document.getElementById('addShiftForm');
const closeDayModal = document.getElementById('closeDayModal');

const typeStandard = document.getElementById('typeStandard');
const typeExpress = document.getElementById('typeExpress');
const shiftKind = document.getElementById('shiftKind');
const shiftStart = document.getElementById('shiftStart');
const shiftEnd = document.getElementById('shiftEnd');
const shiftNote = document.getElementById('shiftNote');
const saveShiftBtn = document.getElementById('saveShiftBtn');
const cancelShiftBtn = document.getElementById('cancelShiftBtn');

let currentDate = new Date();
let selectedDateKey = '';
let shifts = JSON.parse(localStorage.getItem('calendarShifts')) || [];
let currentType = 'Standard';

// Formát data
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function renderCalendar() {
    daysContainer.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];
    
    monthYear.textContent = `${monthNames[month]} ${year}`;

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day';
        empty.style.opacity = '0.3';
        daysContainer.appendChild(empty);
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = day;

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        const dateKey = formatDateKey(new Date(year, month, day));

        if (shifts.some(s => s.date === dateKey)) {
            dayEl.innerHTML = day + '<span style="position:absolute;bottom:8px;right:8px;width:7px;height:7px;background:#ef4444;border-radius:50%;"></span>';
        }

        dayEl.addEventListener('click', () => {
            selectedDateKey = dateKey;
            modalDate.textContent = `${day}. ${monthNames[month]} ${year}`;
            showShiftsForDay();
            dayModal.style.display = 'flex';
            addShiftForm.style.display = 'none';
            addShiftBtn.style.display = 'block';
        });

        daysContainer.appendChild(dayEl);
    }
}

function showShiftsForDay() {
    shiftsList.innerHTML = '';
    const dayShifts = shifts.filter(s => s.date === selectedDateKey);

    if (dayShifts.length === 0) {
        shiftsList.innerHTML = '<p style="text-align:center;color:#888;padding:30px 0;">Zatím žádná směna</p>';
    } else {
        dayShifts.forEach(shift => {
            const div = document.createElement('div');
            div.style = 'background:#f0f9ff; padding:14px; margin:10px 0; border-radius:12px; border-left:6px solid #4f46e5;';
            div.innerHTML = `
                <strong>${shift.type} – ${shift.kind}</strong><br>
                ${shift.start} – ${shift.end}
                ${shift.note ? `<p style="margin:5px 0 0; font-size:0.9rem;">${shift.note}</p>` : ''}
            `;
            shiftsList.appendChild(div);
        });
    }
}

// Přepínání Standard / Express
typeStandard.addEventListener('click', () => {
    currentType = 'Standard';
    typeStandard.classList.add('active');
    typeExpress.classList.remove('active');
});

typeExpress.addEventListener('click', () => {
    currentType = 'Express';
    typeExpress.classList.add('active');
    typeStandard.classList.remove('active');
});

// Otevření formuláře
addShiftBtn.addEventListener('click', () => {
    addShiftForm.style.display = 'block';
    addShiftBtn.style.display = 'none';
    shiftKind.value = '';
    shiftStart.value = '07:00';
    shiftEnd.value = '15:00';
    shiftNote.value = '';
});

// Uložení směny
saveShiftBtn.addEventListener('click', () => {
    const kind = shiftKind.value;
    const start = shiftStart.value;
    const end = shiftEnd.value;
    const note = shiftNote.value.trim();

    if (!kind || !start || !end) {
        alert('Vyber druh směny a vyplň čas od-do');
        return;
    }

    shifts.push({
        date: selectedDateKey,
        type: currentType,
        kind: kind,
        start: start,
        end: end,
        note: note
    });

    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
    showShiftsForDay();
    
    addShiftForm.style.display = 'none';
    addShiftBtn.style.display = 'block';
});

cancelShiftBtn.addEventListener('click', () => {
    addShiftForm.style.display = 'none';
    addShiftBtn.style.display = 'block';
});

closeDayModal.addEventListener('click', () => dayModal.style.display = 'none');
dayModal.addEventListener('click', e => {
    if (e.target === dayModal) dayModal.style.display = 'none';
});

// Navigace
prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

// Start
renderCalendar();
