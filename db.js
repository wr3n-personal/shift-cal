const db = new Dexie('ShiftPlanner');

db.version(1).stores({
  shifts: '++id, date, type, hours'   // indexy pro rychlé vyhledávání
});

export async function addShift(shift) {
  await db.shifts.add(shift);
}

export async function updateShift(id, shift) {
  await db.shifts.update(id, shift);
}

export async function deleteShift(id) {
  await db.shifts.delete(id);
}

export async function getAllShifts() {
  return await db.shifts.orderBy('date').toArray();
}

export async function getShiftsByMonth(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  return await db.shifts
    .where('date')
    .between(start, end)
    .toArray();
}
