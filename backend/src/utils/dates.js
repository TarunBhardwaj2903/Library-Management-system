
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(a) - startOfDay(b)) / MS);
}

module.exports = { addDays, addMonths, startOfDay, diffDays };
