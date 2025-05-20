# cloud/get-k-similar-products/main.py
import functions_framework
import pandas as pd
import numpy as np
import joblib
import os
from google.cloud import storage
import io
import re

# --- Configuration ---
# These should match the features used when X_train_original_for_knn_lookup_DEVICE.csv was saved
# And also the features expected by the preprocessor.
# This list defines the input structure for the preprocessor and what the client sends.
DESKTOP_PREPROCESSOR_INPUT_FEATURES = [
    'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'comunicaciones_version_bluetooth', 'alimentacion_wattage_binned',
    'procesador_tipo'
    # Add any other features the preprocessor was trained on for desktops
]
LAPTOP_PREPROCESSOR_INPUT_FEATURES = [
    'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'comunicaciones_version_bluetooth', 'alimentacion_vatios_hora',
    'camara_resolucion_pixeles', 'pantalla_tecnologia', 'pantalla_resolucion_pixeles',
    'alimentacion_wattage_binned',
    'procesador_tipo'
    # Add any other features the preprocessor was trained on for laptops
]

# Features to RETURN in the JSON output for neighbors
DESKTOP_RETURN_FEATURES = [
    'titulo', 'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'alimentacion_wattage_binned', 'precio_mean' # Assuming precio_mean is in your X_train_original CSV
]
LAPTOP_RETURN_FEATURES = [
    'titulo', 'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'alimentacion_vatios_hora', 'camara_resolucion_pixeles', 'pantalla_tecnologia',
    'pantalla_resolucion_pixeles', 'precio_mean' # Assuming precio_mean is in your X_train_original CSV
]

GCS_BUCKET_NAME = "df_engineered" # Make sure this is defined in your script

MODEL_CACHE = {
    "laptop": {
        "preprocessor_blob": "models/kNN/laptop/preprocessor_laptop_knn.joblib",
        "nn_model_blob": "models/kNN/laptop/nn_model_laptop.joblib",
        "x_train_blob": "models/kNN/laptop/X_train_original_for_knn_lookup_laptop.csv",
        "preprocessor": None, # To store the loaded object
        "nn_model": None,     # To store the loaded object
        "x_train_original": None, # To store the loaded object
        "loaded": False
    },
    "desktop": {
        "preprocessor_blob": "models/kNN/desktop/preprocessor_desktop_knn.joblib",
        "nn_model_blob": "models/kNN/desktop/nn_model_desktop.joblib",
        "x_train_blob": "models/kNN/desktop/X_train_original_for_knn_lookup_desktop.csv",
        "preprocessor": None,
        "nn_model": None,
        "x_train_original": None,
        "loaded": False
    }
    # Add other device types if you have them, following the same pattern
}
storage_client = None

def load_from_gcs(bucket_name, blob_name, is_joblib=True):
    """Loads a file from GCS. If is_joblib, loads as joblib, else as pandas CSV."""
    global storage_client
    if storage_client is None:
        storage_client = storage.Client()
    
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    
    if not blob.exists():
        raise FileNotFoundError(f"Blob {blob_name} not found in bucket {bucket_name}")

    if is_joblib:
        with blob.open("rb") as f:
            return joblib.load(f)
    else: # CSV
        data_string = blob.download_as_text()
        return pd.read_csv(io.StringIO(data_string))


def ensure_models_loaded(device_type):
    """Loads models and data for the given device_type if not already loaded."""
    if not MODEL_CACHE[device_type]["loaded"]:
        print(f"Loading models and data for {device_type} from GCS...")
        MODEL_CACHE[device_type]["preprocessor"] = load_from_gcs(GCS_BUCKET_NAME, MODEL_CACHE[device_type]["preprocessor_blob"], is_joblib=True)
        MODEL_CACHE[device_type]["nn_model"] = load_from_gcs(GCS_BUCKET_NAME, MODEL_CACHE[device_type]["nn_model_blob"], is_joblib=True)
        MODEL_CACHE[device_type]["x_train_original"] = load_from_gcs(GCS_BUCKET_NAME, MODEL_CACHE[device_type]["x_train_blob"], is_joblib=False)
        MODEL_CACHE[device_type]["loaded"] = True
        print(f"Finished loading for {device_type}.")
    return MODEL_CACHE[device_type]


# --- Helper function to derive procesador_tipo ---
def get_procesador_tipo(procesador_str):
    if pd.isna(procesador_str) or not isinstance(procesador_str, str):
        return np.nan

    patterns_results = [
        (r"Apple M\d*", "Apple M"),
        (r"Core Ultra", "Core Ultra"),
        (r"Core i(\d)", lambda m: f"Core i{m.group(1)}"),
        (r"Intel N\d*", "Intel N"),
        (r"Pentium", "Pentium"),
        (r"Celeron", "Celeron"),
        (r"Atom", "Atom"),
        (r"Xeon", "Xeon"),
        (r"Ryzen AI", "Ryzen AI"),
        (r"Ryzen (\d)", lambda m: f"Ryzen {m.group(1)}"),
        (r"Threadripper", "Threadripper"),
        (r"EPYC", "EPYC"),
        (r"Athlon", "Athlon")
    ]

    for pattern, result_val_or_func in patterns_results:
        match = re.search(pattern, procesador_str, flags=re.IGNORECASE)
        if match:
            if callable(result_val_or_func):
                return result_val_or_func(match)
            return result_val_or_func
    
    return np.nan


@functions_framework.http
def get_k_similar_products(request):
    """
    HTTP Cloud Function to find and return K most similar products based on input features.

    This function takes a JSON request detailing a query product's features,
    processes these features using a pre-trained preprocessor, and then uses a
    K-Nearest Neighbors (k-NN) model to find similar products from a pre-existing
    training dataset. The details of these similar products are then returned.

    Expected JSON request body:
    {
        "device_type": "desktop" | "laptop",      // Required. Specifies the type of product.
        "k": 5,                                     // Optional. Number of similar items to return. Defaults to 5.
        "feature_values": {                         // Required. Dictionary of feature names and their values for the query product.
            // Example for "laptop":
            // "procesador": "Intel Core i7",
            // "ram_memoria_gb": 16,
            // "disco_duro_capacidad_de_memoria_ssd_gb": 512,
            // ... (other features as defined in LAPTOP_PREPROCESSOR_INPUT_FEATURES)
            // Example for "desktop":
            // "procesador": "AMD Ryzen 5",
            // "alimentacion_wattage_binned": "Medium_Power (201-500W)",
            // ... (other features as defined in DESKTOP_PREPROCESSOR_INPUT_FEATURES)
        }
    }
    The keys in "feature_values" must match the features expected by the preprocessor
    for the specified "device_type" (defined in global *_PREPROCESSOR_INPUT_FEATURES lists).

    Successful JSON response (200 OK):
    {
        "similar_products": [
            {
                "similarity_distance": 0.1234, // k-NN distance (lower is more similar)
                "titulo": "Example Laptop Title 1",
                "procesador": "Intel Core i7",
                "ram_memoria_gb": 16,
                "precio_mean": 1200.50, // Example, if 'precio_mean' is in RETURN_FEATURES
                // ... (other features as defined in *_RETURN_FEATURES for the device_type)
            },
            // ... (up to k similar products)
        ]
    }

    Error JSON response (e.g., 400 Bad Request, 500 Internal Server Error):
    {
        "error": "Descriptive error message."
    }
    """
    # Set CORS headers for preflight requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    request_json = request.get_json(silent=True)

    if not request_json:
        return ({'error': 'No JSON payload received.'}, 400, headers)

    device_type = request_json.get('device_type')
    feature_values = request_json.get('feature_values')
    k_neighbors_requested = request_json.get('k', 5)  # Default to 5 neighbors

    if not device_type:
        return ({'error': 'Missing "device_type" in JSON payload.'}, 400, headers)
    device_type = device_type.lower()
    if device_type not in ['desktop', 'laptop']:
        return ({'error': 'Invalid "device_type". Must be "desktop" or "laptop".'}, 400, headers)
    
    if not feature_values or not isinstance(feature_values, dict):
        return ({'error': 'Missing or invalid "feature_values". Must be a dictionary.'}, 400, headers)
    
    try:
        k_neighbors = int(k_neighbors_requested)
        if k_neighbors <= 0:
            k_neighbors = 5 # Default if invalid k
    except ValueError:
        return ({'error': 'Invalid "k" value. Must be an integer.'}, 400, headers)


    # Load models and data
    try:
        device_assets = ensure_models_loaded(device_type)
        preprocessor = device_assets["preprocessor"]
        nn_model = device_assets["nn_model"]
        df_X_train_original = device_assets["x_train_original"]
    except FileNotFoundError as e:
        print(f"Error: A required model or data file was not found in GCS: {e}")
        return ({'error': f"Configuration error: missing model/data file for {device_type}. {e}"}, 500, headers)
    except Exception as e:
        print(f"Error loading models/data for {device_type}: {e}")
        return ({'error': f"Could not load necessary assets for {device_type}." }, 500, headers)


    # Determine the correct feature list for preprocessing
    if device_type == 'desktop':
        preprocessor_input_features = DESKTOP_PREPROCESSOR_INPUT_FEATURES
        return_features_list = DESKTOP_RETURN_FEATURES
    else: # laptop
        preprocessor_input_features = LAPTOP_PREPROCESSOR_INPUT_FEATURES
        return_features_list = LAPTOP_RETURN_FEATURES
    
    # Create DataFrame for the query item, ensuring correct column order for preprocessor
    try:
        query_df_input = pd.DataFrame([feature_values])

        # Derive 'procesador_tipo' if 'procesador' is present
        if 'procesador' in query_df_input.columns:
            query_df_input['procesador_tipo'] = query_df_input['procesador'].apply(get_procesador_tipo)
        else:
            # If 'procesador' isn't even in the input, 'procesador_tipo' will also be missing
            # The loop below will add it as NaN if it's in preprocessor_input_features
            pass 

        # Ensure all expected columns for preprocessor are present, fill missing with NaN
        for col in preprocessor_input_features:
            if col not in query_df_input.columns:
                query_df_input[col] = np.nan 
        query_df_for_preprocessing = query_df_input[preprocessor_input_features] # Enforce order
    except Exception as e:
        return ({'error': f'Error creating DataFrame from input features: {e}'}, 400, headers)

    # Preprocess the query item
    try:
        query_item_processed = preprocessor.transform(query_df_for_preprocessing)
    except Exception as e:
        print(f"Error preprocessing input query: {e}")
        # This can happen if input features have unexpected values/types not handled by imputer/OHE
        return ({'error': f"Error during preprocessing of input features: {e}"}, 400, headers)

    # Find neighbors 
    actual_k_for_nn = k_neighbors 
    
    try:
        distances, indices_in_X_train = nn_model.kneighbors(query_item_processed, n_neighbors=actual_k_for_nn)
    except Exception as e:
        print(f"Error during kneighbors search: {e}")
        return ({'error': "Failed to find similar items."}, 500, headers)

    # Retrieve neighbors from the original X_train data
    try:
        valid_indices = indices_in_X_train.flatten()[:min(len(indices_in_X_train.flatten()), len(df_X_train_original))]
        neighbors_df = df_X_train_original.iloc[valid_indices].copy()
        neighbors_df['similarity_distance'] = distances.flatten()[:len(valid_indices)]
    except IndexError:
        print(f"IndexError: Indices from kNN out of bounds for df_X_train_original.")
        return ({'error': "Error retrieving neighbor details due to index mismatch or too few items in training data."}, 500, headers)
    except Exception as e:
        print(f"Error retrieving neighbor details: {e}")
        return ({'error': "Error retrieving neighbor details."}, 500, headers)

    # Select and format the return features
    actual_return_features = [col for col in return_features_list if col in neighbors_df.columns]
    if 'similarity_distance' not in actual_return_features : 
        actual_return_features = ['similarity_distance'] + actual_return_features
    else: 
        actual_return_features.insert(0, actual_return_features.pop(actual_return_features.index('similarity_distance')))

    similar_products_data = neighbors_df[actual_return_features].to_dict(orient='records')
    
    for product_dict in similar_products_data:
        for key, value in product_dict.items():
            if isinstance(value, (np.float32, np.float64, float)):
                product_dict[key] = round(value, 4) 
            elif pd.isna(value): 
                product_dict[key] = None

    return ({"similar_products": similar_products_data}, 200, headers)
