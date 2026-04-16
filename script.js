function loadTruckingCompanies() {
  const jsonUrl = document.getElementById('jsonUrl').value.trim();
  const errorMessage = document.getElementById('errorMessage');

  errorMessage.innerHTML = '';

  if (!jsonUrl) {
    errorMessage.innerHTML = 'Please enter a valid JSON file URL.';
    return;
  }

  fetch('/cgi-bin/server.py?file=' + encodeURIComponent(jsonUrl))
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(html => {
      if (html.startsWith('ERROR:')) {
        errorMessage.innerHTML = html.replace('ERROR:', '').trim();
      } else {
        const tableWindow = window.open('', '', 'width=950,height=700,scrollbars=yes');
        tableWindow.document.write(html);
        tableWindow.document.close();
      }
    })
    .catch(error => {
      errorMessage.innerHTML = 'Error: ' + error.message;
    });
}