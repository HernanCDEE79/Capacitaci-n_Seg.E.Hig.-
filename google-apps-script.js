// Google Apps Script para recibir datos de la capacitación
// Este código debe copiarse en Google Apps Script y publicarse como Web App

function doPost(e) {
  try {
    // Obtener la hoja de cálculo activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Preparar la fila de datos
    const rowData = [
      new Date(), // Timestamp
      data.fecha,
      data.hora,
      data.nombre,
      data.apellido,
      data.dni,
      data.empresa,
      data.puntaje,
      data.aprobado,
      data.firma // Base64 de la firma
    ];
    
    // Agregar la fila a la hoja
    sheet.appendRow(rowData);
    
    // Retornar éxito
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Datos registrados correctamente' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar error
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Script funcionando correctamente')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Función para configurar la hoja inicial (ejecutar solo una vez)
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Configurar encabezados
  const headers = [
    'Timestamp',
    'Fecha',
    'Hora',
    'Nombre',
    'Apellido',
    'DNI',
    'Empresa',
    'Puntaje',
    'Aprobado',
    'Firma (Base64)'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#00A651');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
  
  // Ajustar anchos de columna
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 100); // Fecha
  sheet.setColumnWidth(3, 100); // Hora
  sheet.setColumnWidth(4, 150); // Nombre
  sheet.setColumnWidth(5, 150); // Apellido
  sheet.setColumnWidth(6, 100); // DNI
  sheet.setColumnWidth(7, 150); // Empresa
  sheet.setColumnWidth(8, 80);  // Puntaje
  sheet.setColumnWidth(9, 100); // Aprobado
  sheet.setColumnWidth(10, 200); // Firma
  
  Logger.log('Hoja configurada correctamente');
}
