const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');

const modal = document.getElementById('modal');
const modalDate = document.getElementById('modalDate');
const shiftsList = document.getElementById('shiftsList');
const addShiftBtn = document.getElementById('addShiftBtn');
const addShiftForm = document.getElementById('addShiftForm');
const closeModalBtn = document.getElementById('closeModal');

let currentDate = new Date();
let selectedDateKey = '';   // formát YYYY-MM-DD

// Načtení směn z localStorage
let shifts = JSON.parse(localStorage.getItem('calendarShifts')) || [];

// Uložení směn
function saveShifts() {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
}

// Formát data pro klíč: 2026-03-24
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
        const dayEl = createDayElement(daysInPrevMonth - i, true);
        daysContainer.appendChild(dayEl);
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
        const dayEl = createDayElement(day, true);
        daysContainer.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('day');
    if (isOtherMonth) dayEl.classList.add('other-month');
    
    dayEl.innerHTML = `<strong>${day}</strong>`;
    
    // Kliknutí na den
    dayEl.addEventListener('click', () => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        selectedDateKey = formatDateKey(clickedDate);
        
        modalDate.textContent = clickedDate.toLocaleDateString('cs-CZ', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
        
        showShiftsForDay();
        modal.style.display = 'flex';
        addShiftForm.style.display = 'none';
    });
    
    return dayEl;
}

// Zobrazení směn pro vybraný den
function showShiftsForDay() {
    shiftsList.innerHTML = '';
    
    const dayShifts = shifts.filter(s => s.date === selectedDateKey);
    
    if (dayShifts.length === 0) {
        shiftsList.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">Zatím žádná směna</p>';
    } else {
        dayShifts.forEach((shift, index) => {
            const div = document.createElement('div');
            div.className = 'shift-item';
            div.innerHTML = `
                <strong>${shift.title}</strong>
                <span>${shift.start} – ${shift.end}</span>
                ${shift.note ? `<p style="margin:5px 0 0; font-size:0.9rem; color:#555;">${shift.note}</p>` : ''}
            `;
            shiftsList.appendChild(div);
        });
    }
}

// Otevření formuláře pro přidání
addShiftBtn.addEventListener('click', () => {
    addShiftForm.style.display = 'block';
    addShiftBtn.style.display = 'none';
});

// Uložení nové směny
document.getElementById('saveShiftBtn').addEventListener('click', () => {
    const title = document.getElementById('shiftTitle').value.trim();
    const start = document.getElementById('shiftStart').value;
    const end = document.getElementById('shiftEnd').value;
    const note = document.getElementById('shiftNote').value.trim();
    
    if (!title || !start || !end) {
        alert('Vyplňte název, začátek a konec směny.');
        return;
    }
    
    shifts.push({
        date: selectedDateKey,
        title: title,
        start: start,
        end: end,
        note: note
    });
    
    saveShifts();
    showShiftsForDay();
    
    // Reset formuláře
    document.getElementById('shiftTitle').value = '';
    document.getElementById('shiftStart').value = '';
    document.getElementById('shiftEnd').value = '';
    document.getElementById('shiftNote').value = '';
    
    addShiftForm.style.display = 'none';
    addShiftBtn.style.display = 'block';
});

// Zrušení přidávání
document.getElementById('cancelShiftBtn').addEventListener('click', () => {
    addShiftForm.style.display = 'none';
    addShiftBtn.style.display = 'block';
});

// Zavření modalu
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Navigace kalendáře
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
});

// Spuštění
renderCalendar();