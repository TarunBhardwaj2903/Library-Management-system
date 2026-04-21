const { diffDays } = require('./dates');

function calcFine(expectedReturnDate, actualReturnDate) {
  const perDay = Number(process.env.FINE_PER_DAY || 5);
  const late = diffDays(actualReturnDate, expectedReturnDate);
  return late > 0 ? late * perDay : 0;
}

module.exports = { calcFine };
