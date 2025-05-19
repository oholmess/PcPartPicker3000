import pandas as pd

# Define the input and output file path
input_file_path = 'assignment/df_engineered.csv'
output_file_path = 'assignment/df_modified.csv' # New output file path

# Read the CSV file
try:
    df = pd.read_csv(input_file_path)
except FileNotFoundError:
    print(f"Error: The file {input_file_path} was not found.")
    exit()

# Define the columns to keep
columns_to_keep = ['titulo', 'pantalla_tamano_pulgadas', 'precio_min', 'precio_max', 'precio_mean']

# Check if all required columns exist in the DataFrame
missing_columns = [col for col in columns_to_keep if col not in df.columns]
if missing_columns:
    print(f"Error: The following required columns are missing from the CSV: {', '.join(missing_columns)}")
    # Optionally, print all available columns for user to check
    # print(f"Available columns are: {', '.join(df.columns)}")
    exit()

# Select the desired columns
df_modified = df[columns_to_keep].copy()

# Create the 'brand' column from the first word of 'titulo'
# Ensure 'titulo' column exists before trying to access it
if 'titulo' in df_modified.columns:
    df_modified['brand'] = df_modified['titulo'].astype(str).apply(lambda x: x.split()[0] if x else '')
else:
    print("Error: 'titulo' column not found, cannot create 'brand' column.")
    exit()
    
# Reorder columns to have 'brand' after 'titulo' (optional, for better readability)
if 'brand' in df_modified.columns and 'titulo' in df_modified.columns:
    cols = df_modified.columns.tolist()
    # Remove brand if it exists, to re-insert it at the correct position
    if 'brand' in cols:
        cols.remove('brand')
    
    titulo_index = cols.index('titulo')
    cols.insert(titulo_index + 1, 'brand')
    df_modified = df_modified[cols]


# Save the modified DataFrame back to the original file path
try:
    df_modified.to_csv(output_file_path, index=False) # Changed to output_file_path
    print(f"Successfully created {output_file_path}")
    print("Kept columns: titulo, brand, pantalla_tamano_pulgadas, precio_min, precio_max, precio_mean")
except Exception as e:
    print(f"Error saving the modified file: {e}") 