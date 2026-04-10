function loadTruckingCompanies() {
  const jsonUrl = document.getElementById('jsonUrl').value.trim();
  const errorMessage = document.getElementById('errorMessage');

  errorMessage.innerHTML = '';

  if (!jsonUrl) {
    errorMessage.innerHTML = 'Please enter a valid JSON file URL.';
    return;
  }

  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
      }
      return response.text();
    })
    .then(text => {
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Error: Invalid JSON format.');
      }

      if (!data.Mainline || !data.Mainline.Table) {
        throw new Error('Error: JSON structure is invalid or missing required fields.');
      }

      const table = data.Mainline.Table;

      if (!table.Header || !table.Header.Data || !Array.isArray(table.Header.Data)) {
        throw new Error('Error: Table header data is missing or invalid.');
      }

      if (!table.Row || !Array.isArray(table.Row)) {
        throw new Error('Error: Table row data is missing or invalid.');
      }

      if (table.Row.length === 0) {
        throw new Error('No trucking companies found in the JSON file.');
      }

      displayTruckingCompanies(data);
    })
    .catch(error => {
      errorMessage.innerHTML = error.message;
    });
}

function displayTruckingCompanies(data) {
  const tableWindow = window.open('', '', 'width=950,height=700,scrollbars=yes');

  const headers = data.Mainline.Table.Header.Data;
  const rows = data.Mainline.Table.Row;

  let tableHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Top Trucking Companies</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 10px; }
    table { width: 100%; border-collapse: collapse; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 10px; text-align: left; vertical-align: top; }
    th { background-color: #f2f2f2; font-weight: bold; }
    ul { margin: 4px 0; padding-left: 18px; }
    img { max-width: 80px; }
  </style>
</head>
<body>
<table>
  <tr>`;

  headers.forEach(header => {
    tableHTML += `<th>${header}</th>`;
  });
  tableHTML += '</tr>';

  rows.forEach(company => {
    tableHTML += '<tr>';

    tableHTML += `<td>${company.Company || ''}</td>`;

    tableHTML += `<td>${company.Services || ''}</td>`;

    let hubContent = '';
    if (company.Hubs && company.Hubs.Hub) {
      const hubs = Array.isArray(company.Hubs.Hub)
        ? company.Hubs.Hub
        : [company.Hubs.Hub];
      hubContent = '<ul>' + hubs.map(h => `<li>${h}</li>`).join('') + '</ul>';
    }
    tableHTML += `<td>${hubContent}</td>`;

    tableHTML += `<td>${company.Revenue || ''}</td>`;

    const hp = company.HomePage;
    let hpContent = '';
    if (hp && (hp.startsWith('http://') || hp.startsWith('https://'))) {
      hpContent = `<a href="${hp}" target="_blank">${hp}</a>`;
    } else if (hp) {
      hpContent = 'N/A';
    }
    tableHTML += `<td>${hpContent}</td>`;

    const logo = company.Logo;
    let logoContent = '';
    if (logo) {
      logoContent = `<img src="${logo}" alt="${company.Company || ''} Logo" width="80"
        onerror="this.outerHTML='No Logo Available'" />`;
    } else {
      logoContent = 'No Logo Available';
    }
    tableHTML += `<td>${logoContent}</td>`;

    tableHTML += '</tr>';
  });

  tableHTML += `</table>
</body>
</html>`;

  tableWindow.document.write(tableHTML);
  tableWindow.document.close();
}
