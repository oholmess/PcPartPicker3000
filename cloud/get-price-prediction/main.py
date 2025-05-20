import functions_framework
import pandas as pd
import numpy as np
import joblib
import os # To construct file paths for models
import json # For pretty printing dictionaries

# Define the expected features for each device type
# These must match the features the corresponding model was trained on.
DESKTOP_FEATURES = [
    'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'comunicaciones_version_bluetooth', 'alimentacion_wattage_binned'
]
LAPTOP_FEATURES = [
    'procesador', 'procesador_frecuencia_turbo_max_ghz', 'procesador_numero_nucleos',
    'grafica_tarjeta', 'disco_duro_capacidad_de_memoria_ssd_gb', 'ram_memoria_gb',
    'ram_tipo', 'ram_frecuencia_de_la_memoria_mhz', 'sistema_operativo_sistema_operativo',
    'comunicaciones_version_bluetooth', 'alimentacion_vatios_hora',
    'camara_resolucion_pixeles', 'pantalla_tecnologia', 'pantalla_resolucion_pixeles'
]

# Assumption: Models were trained with log-transformed target. This should be consistent.
MODEL_TRAINED_ON_LOG_TARGET = True

def get_aggregated_feature_importances(pipeline, original_feature_names):
    """
    Extracts feature importances from the pipeline and aggregates them
    for one-hot encoded features back to their original feature names.
    """
    print("Attempting to get aggregated feature importances...")
    try:
        lgbm_regressor = pipeline.named_steps['regressor']
        preprocessor = pipeline.named_steps['preprocessor']
        print("  Preprocessor and regressor steps found in pipeline.")
    except KeyError as e:
        print(f"  Error: Model pipeline missing 'preprocessor' or 'regressor' step: {e}")
        return {}
    if not hasattr(lgbm_regressor, 'feature_importances_'):
        print("  Error: Regressor does not have 'feature_importances_'.")
        return {}
    
    importances = lgbm_regressor.feature_importances_
    print(f"  Raw feature importances from LGBM: {importances}")
    
    try:
        transformed_feature_names = preprocessor.get_feature_names_out()
        print(f"  Transformed feature names from preprocessor: {transformed_feature_names}")
    except Exception as e:
        print(f"  Warning: Could not get transformed feature names automatically using get_feature_names_out(): {e}.")
        # Basic fallback - this might not be accurate if one-hot encoding changes feature count significantly
        if len(importances) == len(original_feature_names):
             print("  Fallback: Using original feature names directly due to matching length (might be inaccurate).")
             return dict(sorted(zip(original_feature_names, importances), key=lambda item: item[1], reverse=True))
        print("  Error: Cannot reliably map feature importances without transformed names or matching length.")
        return {}

    aggregated_importances = {}
    for i, transformed_name in enumerate(transformed_feature_names):
        parts = transformed_name.split('__', 1)
        base_name = transformed_name # Default to transformed_name if parsing fails
        if len(parts) == 2:
            original_component_name = parts[1]
            base_name = original_component_name # Start with this
            # Try to map back to the very original feature name (before one-hot encoding category was appended)
            for orig_feat in original_feature_names:
                if original_component_name.startswith(orig_feat + "_") or original_component_name == orig_feat:
                    base_name = orig_feat
                    break
        else: # If no '__' was found, it might be a passthrough feature or a numerical one not needing prefix.
            # Check if it directly matches an original feature name
            if transformed_name in original_feature_names:
                base_name = transformed_name

        aggregated_importances[base_name] = aggregated_importances.get(base_name, 0) + importances[i]
        # print(f"    Mapping: '{transformed_name}' (importance: {importances[i]}) to base_name: '{base_name}'")
            
    sorted_importances = dict(sorted(aggregated_importances.items(), key=lambda item: item[1], reverse=True))
    print(f"  Aggregated and sorted feature importances: {json.dumps(sorted_importances, indent=2)}")
    return sorted_importances


@functions_framework.http
def get_price_prediction(request):
    """
    HTTP Cloud Function to predict price based on input feature values.
    Loads a pre-trained model (desktop or laptop) and returns a prediction.
    Handles CORS preflight (OPTIONS) and actual requests.

    Expected JSON payload:
    {
        "device_type": "desktop",  // or "laptop"
        "feature_values": {
            "procesador": "Intel Core i7",
            "procesador_frecuencia_turbo_max_ghz": 4.5,
            "procesador_numero_nucleos": 8,
            "grafica_tarjeta": "NVIDIA GeForce RTX 3070",
            "disco_duro_capacidad_de_memoria_ssd_gb": 1024,
            "ram_memoria_gb": 16,
            "ram_tipo": "DDR4",
            "ram_frecuencia_de_la_memoria_mhz": 3200,
            "sistema_operativo_sistema_operativo": "Windows 10",
            "comunicaciones_version_bluetooth": "5.0",
            "alimentacion_wattage_binned": "650W" // or "alimentacion_vatios_hora" for laptop, etc.
            // ... other relevant features for the device_type
        }
    }
    The keys in "feature_values" must match the features expected for the "device_type".
    """

    print(f"---- New Request Received ----")
    print(f"Request Method: {request.method}")
    print(f"Request Headers: {request.headers}")

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        print("Handling OPTIONS preflight request...")
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        print(f"Returning preflight headers: {json.dumps(headers, indent=2)}")
        return ('', 204, headers)

    # Set CORS headers for the main request
    # For development, '*' is fine. For production, restrict to your frontend's domain.
    cors_headers = {
        'Access-Control-Allow-Origin': '*' # Or 'http://localhost:8080'
    }
    print(f"CORS headers for actual request: {json.dumps(cors_headers, indent=2)}")

    request_json = request.get_json(silent=True)
    print(f"Request JSON payload: {json.dumps(request_json, indent=2) if request_json else 'No JSON payload or failed to parse'}")

    if not request_json:
        print("Error: No JSON payload received.")
        return ({'error': 'No JSON payload received.'}, 400, cors_headers)

    device_type = request_json.get('device_type')
    feature_values = request_json.get('feature_values')
    print(f"Parsed device_type: {device_type}")
    print(f"Parsed feature_values: {json.dumps(feature_values, indent=2) if isinstance(feature_values, dict) else feature_values}")

    if not device_type:
        print("Error: Missing 'device_type' in JSON payload.")
        return ({'error': 'Missing "device_type" in JSON payload.'}, 400, cors_headers)
    if device_type.lower() not in ['desktop', 'laptop']:
        print(f"Error: Invalid 'device_type': {device_type}")
        return ({'error': 'Invalid "device_type". Must be "desktop" or "laptop".'}, 400, cors_headers)
    if not feature_values or not isinstance(feature_values, dict):
        print("Error: Missing or invalid 'feature_values' in JSON payload.")
        return ({'error': 'Missing or invalid "feature_values" in JSON payload. Must be a dictionary.'}, 400, cors_headers)

    device_type = device_type.lower()
    print(f"Normalized device_type: {device_type}")
    
    # Create DataFrame from the input feature values (single row)
    try:
        df_input = pd.DataFrame([feature_values]) # Note: [feature_values] creates a DataFrame with 1 row
        print(f"Successfully created DataFrame from input features. Shape: {df_input.shape}")
    except Exception as e:
        error_msg = f'Error creating DataFrame from "feature_values": {str(e)}'
        print(f"Error: {error_msg}")
        return ({'error': error_msg}, 400, cors_headers)

    if device_type == 'desktop':
        required_features = DESKTOP_FEATURES
        model_file_name = 'desktop_model_pipeline.joblib'
    else: # laptop
        required_features = LAPTOP_FEATURES
        model_file_name = 'laptop_model_pipeline.joblib'
    print(f"Using model_file_name: {model_file_name}")
    print(f"Required features for {device_type}: {required_features}")

    # Validate that all required features are in the input DataFrame (created from feature_values)
    missing_features = [col for col in required_features if col not in df_input.columns]
    if missing_features:
        error_msg = (f"Missing required keys in 'feature_values' for device type "
                     f"'{device_type}': {missing_features}. "
                     f"Expected: {required_features}")
        print(f"Error: {error_msg}")
        return ({'error': error_msg}, 400, cors_headers)

    # Ensure DataFrame has columns in the correct order expected by the model pipeline,
    # if the pipeline is sensitive to column order (ColumnTransformer typically isn't for selection).
    # Selecting only the required features also handles any extra features sent by the client.
    try:
        X_predict = df_input[required_features]
    except KeyError as e:
        error_msg = f"A feature specified in {device_type.upper()}_FEATURES was not found in the input: {e}"
        print(f"Error: {error_msg}")
        return ({'error': error_msg, 'details': f"Ensure all features in {required_features} are provided in 'feature_values'."}, 400, cors_headers)


    model_pipeline = None
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, model_file_name)
        
        print(f"Attempting to load model from: {model_path}")
        if not os.path.exists(model_path):
            error_msg = f"Model file '{model_file_name}' not found at {model_path}. Ensure it's deployed with the function."
            print(f"Error: {error_msg}")
            return ({'error': error_msg}, 500, cors_headers)
            
        model_pipeline = joblib.load(model_path)
        print(f"Successfully loaded model: {model_file_name}")
        print(f"Model pipeline object: {model_pipeline}")
    except Exception as e:
        error_msg = f"Error loading model '{model_file_name}': {str(e)}"
        print(f"Error: {error_msg}")
        return ({'error': error_msg, 'details': 'Ensure model file is valid and dependencies are met.'}, 500, cors_headers)

    try:
        print(f"Making prediction with model: {model_file_name}...")
        predictions_transformed = model_pipeline.predict(X_predict)
        print(f"Raw prediction (transformed scale): {predictions_transformed}")
        
        predicted_price_transformed = predictions_transformed[0] # We expect a single prediction
        
        predicted_price = predicted_price_transformed
        if MODEL_TRAINED_ON_LOG_TARGET:
            print(f"Applying np.expm1 to prediction because MODEL_TRAINED_ON_LOG_TARGET is True.")
            predicted_price = np.expm1(predicted_price_transformed)
            print(f"Prediction after expm1: {predicted_price}")
        
        predicted_price = max(0, predicted_price) # Ensure price is not negative

        feature_importances_dict = get_aggregated_feature_importances(model_pipeline, required_features)

    except Exception as e:
        error_msg = f"Error during prediction or feature importance extraction: {str(e)}"
        print(f"Error: {error_msg}")
        return ({'error': error_msg}, 500, cors_headers)

    results = {
        "model_type_used": device_type,
        "predicted_price": round(predicted_price, 2),
        "feature_importances": feature_importances_dict
    }
    print(f"Successfully processed request. Returning results: {json.dumps(results, indent=2)}")
    
    return (results, 200, cors_headers)