import csv
import json

csv_file_path = 'assignment/df_modified.csv'
json_file_path = 'frontend/public/laptop_data.json'

# Define the mapping from CSV columns to JSON keys (which should match Laptop interface)
column_mapping = {
    'titulo': 'title',
    'brand': 'brand',
    'serie': 'series',
    'pantalla_tamano_pulgadas': 'screenSize',
    'precio_mean': 'price',
    'tipo_de_producto': 'productType',
    'ram_memoria_gb': 'ram',
    'disco_duro_capacidad_de_memoria_ssd_gb': 'storage',
    'procesador': 'cpu',
    'procesador_frecuencia_turbo_max_ghz': 'clockSpeed',
    'grafica_tarjeta': 'gpu',
    'sistema_operativo_sistema_operativo': 'os'
}

# Fields that should be numeric. Add others if necessary.
numeric_fields_json = ['screenSize', 'price', 'ram', 'storage', 'clockSpeed'] 

data = []
id_counter = 1

try:
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        if not csv_reader.fieldnames:
            print(f"Error: CSV file {csv_file_path} is empty or has no header.")
            exit()
            
        print(f"CSV Headers found in {csv_file_path}: {csv_reader.fieldnames}\n")

        for row in csv_reader:
            laptop_obj = {'id': id_counter}
            all_expected_cols_present = True
            for csv_col, json_key in column_mapping.items():
                if csv_col not in row:
                    print(f"Warning: Expected CSV column '{csv_col}' not found in a row. Setting '{json_key}' to default.")
                    # Set a default based on type if a numeric field is missing
                    if json_key in numeric_fields_json:
                        laptop_obj[json_key] = 0.0 if json_key == 'clockSpeed' else 0 # Default numeric
                    else:
                        laptop_obj[json_key] = "" # Default string
                    all_expected_cols_present = False
                    continue
                
                value = row[csv_col]
                if json_key in numeric_fields_json:
                    try:
                        laptop_obj[json_key] = float(value) if value else (0.0 if json_key == 'clockSpeed' else 0)
                    except ValueError:
                        # print(f"Warning: Could not convert '{value}' to float for '{json_key}'. Using default.")
                        laptop_obj[json_key] = 0.0 if json_key == 'clockSpeed' else 0 # Default on conversion error
                else:
                    laptop_obj[json_key] = value if value else ""
            
            data.append(laptop_obj)
            id_counter += 1

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=2)

    print(f"Successfully converted {csv_file_path} to {json_file_path}")
    if data:
        print(f"First data object in JSON: {data[0]}")

except FileNotFoundError:
    print(f"Error: The file {csv_file_path} was not found.")
except Exception as e:
    print(f"An error occurred: {e}") 