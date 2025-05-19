import csv
import json
import os

csv_file_path = os.path.join('assignment', 'df_engineered_laptop.csv')
json_file_path = os.path.join('frontend', 'public', 'laptop_screen_sizes.json')
screen_size_column_name = 'pantalla_diagonal_cm' # Updated column name
cm_to_inch_conversion_factor = 2.54

screen_sizes_inches = []

try:
    print(f"Attempting to open and read {csv_file_path}...")
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        if screen_size_column_name not in csv_reader.fieldnames:
            print(f"Error: Column '{screen_size_column_name}' not found in {csv_file_path}.")
            print(f"Available columns are: {csv_reader.fieldnames}")
            exit()
            
        print(f"Successfully opened {csv_file_path}. Processing column '{screen_size_column_name}'...")
        processed_rows = 0
        valid_screen_sizes_found = 0
        for row_number, row in enumerate(csv_reader, 1):
            processed_rows += 1
            try:
                raw_value_cm = row.get(screen_size_column_name)
                if raw_value_cm is not None and raw_value_cm.strip() != "":
                    screen_size_cm_str = raw_value_cm.replace(',', '.').strip()
                    screen_size_cm = float(screen_size_cm_str)
                    if screen_size_cm > 0:
                        screen_size_inch = round(screen_size_cm / cm_to_inch_conversion_factor, 1) # Convert to inches and round to 1 decimal
                        if screen_size_inch > 0: # Double check after conversion
                            screen_sizes_inches.append(screen_size_inch)
                            valid_screen_sizes_found += 1
            except ValueError:
                pass 
            except Exception as e:
                pass

        print(f"Processed {processed_rows} rows.")
        print(f"Found {valid_screen_sizes_found} valid screen sizes (after conversion to inches).")

    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(screen_sizes_inches, json_file, indent=2)

    print(f"Successfully extracted and converted screen sizes to {json_file_path}")
    if screen_sizes_inches:
        print(f"First few screen_sizes (inches): {screen_sizes_inches[:5]}")
        print(f"Total valid screen sizes written: {len(screen_sizes_inches)}")
    else:
        print("No valid screen sizes were extracted or converted.")

except FileNotFoundError:
    print(f"Error: The file {csv_file_path} was not found.")
except Exception as e:
    print(f"An unexpected error occurred: {e}") 