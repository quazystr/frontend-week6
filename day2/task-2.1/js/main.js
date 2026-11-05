import { getJson } from "./api.js";

async function loadData() {
  try {
    console.log("Загрузка данных...");
    const products = await getJson("../data/products.json");

    console.table(products);
  } catch (error) {
    console.warn("Не удалось загрузить:", error.name, error.message);
  }
}

loadData();
