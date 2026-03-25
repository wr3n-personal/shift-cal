let calendar;
let currentEditId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'cs',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: await loadEvents(),
    eventClick: function(info) {
      editShift(info.event);
    },
    dateClick: function(info) {
      openModal(info.dateStr);
    }
  });

  calendar.render();

  // Tlačítka
  document.getElementById('add-shift-btn').addEventListener('click', () => openModal());
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
  document.getElementById('shift-form').addEventListener('submit', saveShift);
});

async function loadEvents() {
  const shifts = await getAllShifts();
  return shifts.map(s => ({
    id: s.id,
    title: `${s.type} ${s.hours ? '(' + s.hours + 'h)' : ''}`,
    start: s.date,
    allDay: true,
    backgroundColor: getColor(s.type),
    extendedProps: s
  }));
}

function getColor(type) {
  const colors = {
    'ranní': '#22c55e',
    'odpolední': '#eab308',
    'noční': '#3b82f6',
    'volno': '#64748b'
  };
  return colors[type] || '#6b7280';
}

async function refreshCalendar() {
  calendar.removeAllEvents();
  const events = await loadEvents();
  calendar.addEventSource(events);
}

function openModal(dateStr = null) {
  currentEditId = null;
  document.getElementById('modal-title').textContent = 'Nová směna';
  document.getElementById('shift-form').reset();
  if (dateStr) document.getElementById('shift-date').value = dateStr;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  currentEditId = null;
}

async function saveShift(e) {
  e.preventDefault();

  const shift = {
    date: document.getElementById('shift-date').value,
    type: document.getElementById('shift-type').value,
    start: document.getElementById('start-time').value || null,
    end: document.getElementById('end-time').value || null,
    hours: parseFloat(document.getElementById('hours').value) || null,
    note: document.getElementById('note').value
  };

  if (currentEditId) {
    await updateShift(currentEditId, shift);
  } else {
    await addShift(shift);
  }

  closeModal();
  await refreshCalendar();
}

async function editShift(event) {
  currentEditId = parseInt(event.id);
  const s = event.extendedProps;

  document.getElementById('modal-title').textContent = 'Upravit směnu';
  document.getElementById('shift-date').value = s.date;
  document.getElementById('shift-type').value = s.type;
  document.getElementById('start-time').value = s.start || '';
  document.getElementById('end-time').value = s.end || '';
  document.getElementById('hours').value = s.hours || '';
  document.getElementById('note').value = s.note || '';

  document.getElementById('modal').style.display = 'flex';
}
