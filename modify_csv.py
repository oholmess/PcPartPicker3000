import pandas as pd

# Define the input and output file paths
input_file_path = 'assignment/df_engineered.csv'
output_file_path = 'assignment/df_modified.csv'

# Read the CSV file
try:
    df = pd.read_csv(input_file_path)
except FileNotFoundError:
    print(f"Error: The file {input_file_path} was not found.")
    exit()
except Exception as e:
    print(f"Error reading {input_file_path}: {e}")
    exit()

# Define the columns to keep from df_engineered.csv
# These are the source columns. We will rename them later if needed for the final JSON.
columns_to_keep_config = {
    'titulo': 'title',
    'pantalla_tamano_pulgadas': 'screenSize',
    'precio_mean': 'price',
    'serie': 'series',
    'tipo_de_producto': 'productType',
    'ram_memoria_gb': 'ram',
    'disco_duro_capacidad_de_memoria_ssd_gb': 'storage',
    'procesador': 'cpu',
    'procesador_frecuencia_turbo_max_ghz': 'clockSpeed',
    'grafica_tarjeta': 'gpu',
    'sistema_operativo_sistema_operativo': 'os',
    # Columns needed for brand derivation or min/max price if desired later
    'precio_min': 'price_min', 
    'precio_max': 'price_max' 
}

actual_columns_in_df = df.columns.tolist()
print(f"Columns found in {input_file_path}:")
print(", ".join(actual_columns_in_df))
print("\n")

columns_to_select_and_rename = {}
missing_source_columns = []

for source_col, _ in columns_to_keep_config.items():
    if source_col in actual_columns_in_df:
        columns_to_select_and_rename[source_col] = source_col # Keep original name for now
    else:
        missing_source_columns.append(source_col)

if missing_source_columns:
    print(f"Warning: The following source columns specified in columns_to_keep_config are MISSING from {input_file_path} and will not be included:")
    print(", ".join(missing_source_columns))
    print("Please verify their names against the list of columns found above.")

if not columns_to_select_and_rename:
    print(f"Error: No columns to select. Check column names in {input_file_path} against columns_to_keep_config.")
    exit()

# Select the desired columns
df_selected = df[list(columns_to_select_and_rename.keys())].copy()

# Create the 'brand' column from the first word of 'titulo'
if 'titulo' in df_selected.columns:
    df_selected['brand'] = df_selected['titulo'].astype(str).apply(lambda x: x.split(' ', 1)[0] if pd.notna(x) and x.strip() else '')
else:
    print("Warning: 'titulo' column not found in selected columns, cannot create 'brand' column.")
    df_selected['brand'] = '' # Ensure brand column exists for ordering

# Define final column order for df_modified.csv (using original source names)
# 'brand' is added here.
# Other columns from columns_to_select_and_rename will follow.
final_output_columns = []
if 'titulo' in columns_to_select_and_rename:
    final_output_columns.append('titulo')
final_output_columns.append('brand')

for source_col in columns_to_select_and_rename.keys():
    if source_col != 'titulo':
        final_output_columns.append(source_col)

# Filter final_output_columns to only include columns that actually exist in df_selected
final_output_columns = [col for col in final_output_columns if col in df_selected.columns]

df_modified = df_selected[final_output_columns]

# Save the modified DataFrame
try:
    df_modified.to_csv(output_file_path, index=False, encoding='utf-8')
    print(f"\nSuccessfully created {output_file_path} with columns:")
    print(", ".join(df_modified.columns))
except Exception as e:
    print(f"Error saving the modified file: {e}") 