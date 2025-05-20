import csv
import json
import os

def extract_prices_to_json(csv_filepath, price_column_name, output_json_filepath):
    """
    Extracts a specific column (prices) from a CSV file and saves it as a JSON array.

    Args:
        csv_filepath (str): Path to the input CSV file.
        price_column_name (str): The header name of the column containing prices.
        output_json_filepath (str): Path to save the output JSON file.
    """
    prices = []
    try:
        with open(csv_filepath, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            if price_column_name not in reader.fieldnames:
                print(f"Error: Column '{price_column_name}' not found in the CSV headers.")
                print(f"Available headers are: {reader.fieldnames}")
                return

            for row in reader:
                try:
                    price_str = row[price_column_name]
                    # Clean and convert price (handle currency symbols, commas, etc. if necessary)
                    # Example: price_str = price_str.replace('$', '').replace(',', '')
                    if price_str: # Ensure price is not empty
                        prices.append(float(price_str))
                except ValueError:
                    print(f"Warning: Could not convert value '{row[price_column_name]}' to a number. Skipping.")
                except KeyError:
                    # This case should be caught by the header check, but as a safeguard:
                    print(f"Warning: Price column '{price_column_name}' missing in a row. Skipping.")


        with open(output_json_filepath, mode='w', encoding='utf-8') as jsonfile:
            json.dump(prices, jsonfile, indent=4) # indent for pretty printing, optional

        print(f"Successfully extracted prices to '{output_json_filepath}'")

    except FileNotFoundError:
        print(f"Error: CSV file not found at '{csv_filepath}'")
    except Exception as e:
        print(f"An error occurred: {e}")

# --- Configuration ---
csv_file_path = os.path.join('local_work', 'df_engineered_laptop.csv')  # Replace with your CSV file path
price_column_name = 'precio_mean'            # Replace with the actual header name of your price column
output_json_file = 'frontend/public/data/all_prices.json' # Your desired output path

# --- Run the extraction ---
extract_prices_to_json(csv_file_path, price_column_name, output_json_file)