import csv
import json

csv_file_path = 'assignment/df_modified.csv'
json_file_path = 'frontend/public/laptop_data.json'

data = []
id_counter = 1

with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        # Ensure 'pantalla_tamano_pulgadas' and 'precio_mean' are present and not empty
        screen_size_str = row.get('pantalla_tamano_pulgadas', '0')
        price_str = row.get('precio_mean', '0')

        try:
            screen_size = float(screen_size_str) if screen_size_str else 0.0
        except ValueError:
            screen_size = 0.0 # Default or error value

        try:
            price = float(price_str) if price_str else 0.0
        except ValueError:
            price = 0.0 # Default or error value
            
        data.append({
            'id': id_counter,
            'title': row.get('titulo', ''), # Use .get for safety
            'brand': row.get('brand', ''),   # Use .get for safety
            'screenSize': screen_size,
            'price': price
        })
        id_counter += 1

with open(json_file_path, mode='w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=2)

print(f"Successfully converted {csv_file_path} to {json_file_path}") 