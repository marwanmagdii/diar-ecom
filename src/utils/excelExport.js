import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exports data to an Excel file with styling.
 * 
 * @param {Object} options
 * @param {Array<Object>} options.data - The data array to export.
 * @param {Array<Object>} options.columns - The columns mapping (header and key).
 * @param {string} options.filename - The output filename (e.g., 'Orders.xlsx').
 * @param {string} [options.sheetName] - The name of the worksheet (defaults to 'Data').
 */
export const exportToExcel = async ({ data, columns, filename, sheetName = 'Data' }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });

  // Define columns
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20 // Default width
  }));

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' } // Brand primary color
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Add Data
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Apply basic borders and styling to data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { size: 11, color: { argb: 'FF1E293B' } };
    }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  // Auto-adjust column widths based on content
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // Add a little padding, max width 50
    column.width = Math.min(maxLength + 2, 50);
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};
