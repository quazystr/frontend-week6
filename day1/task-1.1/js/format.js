export function formatPrice(value) {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) {
    return "Цена не указана";
  }
  return `${amount.toLocaleString("ru-RU")} руб.`;
}

export function formatDate(isoString) {
  if (isoString === null || isoString === undefined || isoString === "") {
    return "Дата не указана";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return date.toLocaleDateString("ru-RU");
}
