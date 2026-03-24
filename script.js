const daysContainer = document.getElementById('days');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const todayBtn = document.getElementById('today');

let currentDate = new Date();

function renderCalendar() {
    daysContainer.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYear.textContent = currentDate.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' });
    
    // První den měsíce (0 = neděle, ale chceme pondělí jako první)
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // posun na pondělí
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Dny z předchozího měsíce
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = createDayElement(daysInPrevMonth - i, true);
        daysContainer.appendChild(dayEl);
    }
    
    // Dny aktuálního měsíce
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false);
        
        if (day === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        daysContainer.appendChild(dayEl);
    }
    
    // Dny z následujícího měsíce
    const remainingCells = 42 - (firstDay + daysInMonth); // 6 řádků × 7
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true);
        daysContainer.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('day');
    if (isOtherMonth) dayEl.classList.add('other-month');
    
    dayEl.innerHTML = `<span class="day-name">${day}</span>`;
    // Sem můžeš později přidat události, poznámky apod.
    return dayEl;
}

// Navigace
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

// Inicializace
renderCalendar();