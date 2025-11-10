import ejs from 'ejs';
import path from 'path';

// Objek untuk menyimpan semua komponen yang terdaftar di setiap area
const areas = {};

/**
 * Mendaftarkan sebuah komponen (file .ejs) ke area tertentu.
 */
export function registerToArea(areaName, templatePath, data = {}) {
  if (!areas[areaName]) {
    areas[areaName] = [];
  }
  areas[areaName].push({ templatePath, data });
}

/**
 * Merender semua komponen yang ada di sebuah area.
 */
export async function renderArea(areaName) {
  if (!areas[areaName] || areas[areaName].length === 0) {
    return ''; // Kembalikan string kosong jika tidak ada komponen
  }

  // Gunakan Promise.all untuk merender semua komponen secara asinkron
  const renderedComponents = await Promise.all(
    areas[areaName].map(component =>
      // TAMBAHKAN { async: true } agar ejs.renderFile mengembalikan Promise
      ejs.renderFile(component.templatePath, component.data, { async: true })
    )
  );

  return renderedComponents.join('\n');
}