// ==================== KALENDÁŘ SMĚN ====================

const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');

const dayModal = document.getElementById('dayModal');
const modalDateEl = document.getElementById('modalDate');
const shiftsList = document.getElementById('shiftsList');
const addShiftBtn = document.getElementById('addShiftBtn');
const closeDayModal = document.getElementById('closeDayModal');

let currentDate = new Date();
let selectedDateKey = '';
let shifts = JSON.parse(localStorage.getItem('calendarShifts')) || [];

// Formát data pro ukládání
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

    // Prázdné buňky před 1. dnem
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

        const thisDate = new Date(year, month, day);
        const dateKey = formatDateKey(thisDate);

        // Tečka, pokud je v dni směna
        if (shifts.some(s => s.date === dateKey)) {
            dayEl.innerHTML = day + '<span style="position:absolute;bottom:8px;right:8px;width:7px;height:7px;background:#ef4444;border-radius:50%;"></span>';
        }

        dayEl.addEventListener('click', () => {
            selectedDateKey = dateKey;
            modalDateEl.textContent = `${day}. ${monthNames[month]} ${year}`;
            showShiftsForDay();
            dayModal.style.display = 'flex';
        });

        daysContainer.appendChild(dayEl);
    }
}

function showShiftsForDay() {
    shiftsList.innerHTML = '';
    const dayShifts = shifts.filter(s => s.date === selectedDateKey);

    if (dayShifts.length === 0) {
        shiftsList.innerHTML = '<p style="text-align:center;color:#888;padding:40px 0;">Zatím žádná směna</p>';
    } else {
        dayShifts.forEach(shift => {
            const div = document.createElement('div');
            div.style = 'background:#f0f9ff; padding:14px; margin:10px 0; border-radius:12px; border-left:6px solid #4f46e5;';
            div.innerHTML = `
                <strong>${shift.title}</strong><br>
                ${shift.start} – ${shift.end}
                ${shift.note ? `<p style="margin:6px 0 0; font-size:0.9rem; color:#555;">${shift.note}</p>` : ''}
            `;
            shiftsList.appendChild(div);
        });
    }
}

// Přidání směny
addShiftBtn.addEventListener('click', () => {
    const title = prompt('Název směny (např. Ranní, Noční, Volno):');
    if (!title) return;

    const start = prompt('Začátek (HH:MM):', '07:00');
    const end = prompt('Konec (HH:MM):', '15:30');
    const note = prompt('Poznámka (volitelné):') || '';

    if (title && start && end) {
        shifts.push({ date: selectedDateKey, title, start, end, note });
        localStorage.setItem('calendarShifts', JSON.stringify(shifts));
        showShiftsForDay();
    }
});

// Zavírání modalu
closeDayModal.addEventListener('click', () => dayModal.style.display = 'none');
dayModal.addEventListener('click', e => {
    if (e.target === dayModal) dayModal.style.display = 'none';
});

// Navigace
prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

// Spuštění
renderCalendar();