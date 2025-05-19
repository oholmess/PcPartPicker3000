import csv
import json
import os

csv_file_path = os.path.join('assignment', 'df_engineered_laptop.csv')
# Updated JSON file path and name
json_file_path = os.path.join('frontend', 'public', 'engineered_laptop_details.json') 

title_column_name = 'titulo'  # Added title column
screen_size_column_name = 'pantalla_diagonal_cm'
cm_to_inch_conversion_factor = 2.54

laptop_details = [] # Changed from screen_sizes_inches to store objects

try:
    print(f"Attempting to open and read {csv_file_path}...")
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        if screen_size_column_name not in csv_reader.fieldnames:
            print(f"Error: Column '{screen_size_column_name}' not found in {csv_file_path}.")
            print(f"Available columns are: {csv_reader.fieldnames}")
            exit()
        if title_column_name not in csv_reader.fieldnames:
            print(f"Error: Column '{title_column_name}' not found in {csv_file_path}.")
            print(f"Available columns are: {csv_reader.fieldnames}")
            exit()
            
        print(f"Successfully opened {csv_file_path}. Processing columns '{title_column_name}' and '{screen_size_column_name}'...")
        processed_rows = 0
        valid_entries_found = 0
        for row_number, row in enumerate(csv_reader, 1):
            processed_rows += 1
            try:
                title_value = row.get(title_column_name)
                raw_value_cm = row.get(screen_size_column_name)

                if title_value and title_value.strip() != "" and raw_value_cm is not None and raw_value_cm.strip() != "":
                    screen_size_cm_str = raw_value_cm.replace(',', '.').strip()
                    screen_size_cm = float(screen_size_cm_str)
                    if screen_size_cm > 0:
                        screen_size_inch = round(screen_size_cm / cm_to_inch_conversion_factor, 1)
                        if screen_size_inch > 0:
                            laptop_details.append({
                                "title": title_value.strip(),
                                "engineered_screen_size_inches": screen_size_inch
                            })
                            valid_entries_found += 1
            except ValueError:
                # print(f"Skipping row {row_number} due to ValueError during conversion.")
                pass 
            except Exception as e:
                # print(f"Skipping row {row_number} due to an unexpected error: {e}")
                pass

        print(f"Processed {processed_rows} rows.")
        print(f"Found {valid_entries_found} valid laptop entries with title and screen size.")

    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(laptop_details, json_file, indent=2) # Dump laptop_details list

    print(f"Successfully extracted and converted laptop details to {json_file_path}")
    if laptop_details:
        print(f"First few entries: {laptop_details[:3]}")
        print(f"Total valid entries written: {len(laptop_details)}")
    else:
        print("No valid laptop details were extracted or converted.")

except FileNotFoundError:
    print(f"Error: The file {csv_file_path} was not found. Current working directory: {os.getcwd()}")
except Exception as e:
    print(f"An unexpected error occurred: {e}") 