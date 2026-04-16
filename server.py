#!/usr/bin/python3

import json
import os
import sys
from urllib.parse import parse_qs

print("Content-Type: text/html\n")

query_string = os.environ.get('QUERY_STRING', '')
params = parse_qs(query_string)
filename = params.get('file', [''])[0]

if not filename:
    print("ERROR:Please enter a valid JSON file URL.")
    sys.exit()

filepath = "/var/www/html/" + filename

try:
    with open(filepath, 'r') as f:
        text = f.read()
except Exception as e:
    print("ERROR:Error: " + str(e))
    sys.exit()

try:
    data = json.loads(text)
except:
    print("ERROR:Error: Invalid JSON format.")
    sys.exit()

if 'Mainline' not in data or 'Table' not in data.get('Mainline', {}):
    print("ERROR:Error: JSON structure is invalid or missing required fields.")
    sys.exit()

table = data['Mainline']['Table']

if 'Header' not in table or 'Data' not in table.get('Header', {}) or not isinstance(table['Header']['Data'], list):
    print("ERROR:Error: Table header data is missing or invalid.")
    sys.exit()

if 'Row' not in table or not isinstance(table['Row'], list):
    print("ERROR:Error: Table row data is missing or invalid.")
    sys.exit()

if len(table['Row']) == 0:
    print("ERROR:No trucking companies found in the JSON file.")
    sys.exit()

headers = table['Header']['Data']
rows = table['Row']

html = "<!DOCTYPE html><html><head><title>Top Trucking Companies</title>"
html += "<style>"
html += "body { font-family: Arial, sans-serif; padding: 10px; }"
html += "table { width: 100%; border-collapse: collapse; }"
html += "table, th, td { border: 1px solid black; }"
html += "th, td { padding: 10px; text-align: left; vertical-align: top; }"
html += "th { background-color: #f2f2f2; font-weight: bold; }"
html += "ul { margin: 4px 0; padding-left: 18px; }"
html += "img { max-width: 80px; }"
html += "</style></head><body><table><tr>"

for header in headers:
    html += f"<th>{header}</th>"
html += "</tr>"

for company in rows:
    html += "<tr>"
    html += f"<td>{company.get('Company', '')}</td>"
    html += f"<td>{company.get('Services', '')}</td>"

    hub_content = ''
    hubs_data = company.get('Hubs', {})
    if hubs_data and 'Hub' in hubs_data:
        hub_list = hubs_data['Hub']
        if not isinstance(hub_list, list):
            hub_list = [hub_list]
        hub_content = '<ul>'
        for h in hub_list:
            hub_content += f"<li>{h}</li>"
        hub_content += '</ul>'
    html += f"<td>{hub_content}</td>"

    html += f"<td>{company.get('Revenue', '')}</td>"

    hp = company.get('HomePage', '')
    if hp and hp.startswith('http'):
        html += f'<td><a href="{hp}" target="_blank">{hp}</a></td>'
    elif hp:
        html += "<td>N/A</td>"
    else:
        html += "<td></td>"

    logo = company.get('Logo', '')
    if logo:
        html += f'<td><img src="{logo}" alt="Logo" width="80" onerror="this.outerHTML=\'No Logo Available\'" /></td>'
    else:
        html += "<td>No Logo Available</td>"

    html += "</tr>"

html += "</table></body></html>"
print(html)