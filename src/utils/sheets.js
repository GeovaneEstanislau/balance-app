import Papa from 'papaparse';

/**
 * Fetches and parses CSV data from a published Google Sheet.
 * @param {string} sheetId - The ID of the Google Sheet.
 * @returns {Promise<Array>} - Array of objects representing the rows.
 */
export const fetchSheetsData = async (sheetId) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
    const response = await fetch(url);
    const csvData = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Error fetching sheets data:', error);
    throw error;
  }
};

/**
 * Calculates the balance from the sheet data.
 * Assumes a column named 'Valor' exists.
 * @param {Array} data - The rows from the sheet.
 * @returns {number} - The total balance.
 */
export const calculateBalance = (data) => {
  return data.reduce((acc, row) => {
    const value = row['Valor'] || 0;
    // Handle cases where value might be string with currency or comma
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^\d.-]/g, '')) 
      : value;
    return acc + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);
};
