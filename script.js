const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');

const dayModal = document.getElementById('dayModal');
const modalDate = document.getElementById('modalDate');
const shiftsList = document.getElementById('shiftsList');
const addShiftBtn = document.getElementById('addShiftBtn');
const closeDayModal = document.getElementById('closeDayModal');

let currentDate = new Date();
let selectedDateKey = '';
let shifts = JSON.parse(localStorage.getItem('calendarShifts')) || [];

// Formát data YYYY-MM-DD
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

    // Prázdné buňky před měsícem
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

        // Pokud má den směnu, přidáme tečku
        if (shifts.some(s => s.date === dateKey)) {
            dayEl.style.position = 'relative';
            dayEl.innerHTML = `${day}<span style="position:absolute; bottom:8px; width:6px; height:6px; background:#ef4444; border-radius:50%;"></span>`;
        }

        dayEl.addEventListener('click', () => {
            selectedDateKey = dateKey;
            modalDate.textContent = `${day}. ${monthNames[month]} ${year}`;
            showShifts();
            dayModal.style.display = 'flex';
        });

        daysContainer.appendChild(dayEl);
    }
}

function showShifts() {
    shiftsList.innerHTML = '';
    const dayShifts = shifts.filter(s => s.date === selectedDateKey);

    if (dayShifts.length === 0) {
        shiftsList.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">Zatím žádná směna</p>';
    } else {
        dayShifts.forEach((shift, i) => {
            const div = document.createElement('div');
            div.style.cssText = 'background:#f8fafc; padding:14px; margin:8px 0; border-radius:12px; border-left:5px solid #4f46e5;';
            div.innerHTML = `
                <strong>${shift.title}</strong><br>
                <span>${shift.start} – ${shift.end}</span>
                ${shift.note ? `<p style="margin:5px 0 0; font-size:0.9rem;">${shift.note}</p>` : ''}
            `;
            shiftsList.appendChild(div);
        });
    }
}

// Přidání nové směny
addShiftBtn.addEventListener('click', () => {
    const title = prompt('Název směny (např. Ranní, Noční):');
    if (!title) return;

    const start = prompt('Začátek směny (HH:MM):', '07:00');
    const end = prompt('Konec směny (HH:MM):', '15:00');
    const note = prompt('Poznámka (volitelné):') || '';

    if (title && start && end) {
        shifts.push({
            date: selectedDateKey,
            title: title,
            start: start,
            end: end,
            note: note
        });
        localStorage.setItem('calendarShifts', JSON.stringify(shifts));
        showShifts();
    }
});

// Zavírání modalu
closeDayModal.addEventListener('click', () => dayModal.style.display = 'none');
dayModal.addEventListener('click', (e) => {
    if (e.target === dayModal) dayModal.style.display = 'none';
});

// Navigace
prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

// Start
renderCalendar();
