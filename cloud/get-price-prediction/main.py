import functions_framework
import pandas as pd
import numpy as np
import joblib
import os # To construct file paths for models

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
    try:
        lgbm_regressor = pipeline.named_steps['regressor']
        preprocessor = pipeline.named_steps['preprocessor']
    except KeyError:
        print("Error: Model pipeline must have 'preprocessor' and 'regressor' steps.")
        return {}

    if not hasattr(lgbm_regressor, 'feature_importances_'):
        print("Error: Regressor does not have 'feature_importances_'.")
        return {}
        
    importances = lgbm_regressor.feature_importances_
    
    try:
        transformed_feature_names = preprocessor.get_feature_names_out()
    except Exception as e:
        # Fallback if get_feature_names_out fails or not available in old sklearn
        # This part is complex and highly dependent on preprocessor structure.
        # For a robust solution, ensure get_feature_names_out() works with your sklearn version.
        print(f"Warning: Could not get transformed feature names automatically: {e}. Attempting to map based on known structure.")
        # This fallback is simplified and might need adjustment based on the exact preprocessor.
        # It assumes the order of features in `importances` matches the order of `original_feature_names`
        # after one-hot encoding etc. This is often NOT the case.
        # It's much better to rely on get_feature_names_out().
        if len(importances) == len(original_feature_names): # Highly unlikely for categorical
             return dict(sorted(zip(original_feature_names, importances), key=lambda item: item[1], reverse=True))
        print("Error: Cannot map feature importances without reliable transformed names.")
        return {}


    aggregated_importances = {}
    # This logic maps transformed feature names (e.g., 'cat__feature_value')
    # back to original feature names (e.g., 'feature')
    for i, transformed_name in enumerate(transformed_feature_names):
        # Example: 'num__age', 'cat__color_blue'
        parts = transformed_name.split('__', 1)
        if len(parts) == 2:
            original_component_name = parts[1]
            # Further parse original_component_name if it's from one-hot encoding like 'feature_value'
            # We want to aggregate to 'feature'
            base_name = original_component_name
            for orig_feat in original_feature_names: # original_feature_names are the columns fed to preprocessor
                if original_component_name.startswith(orig_feat + "_") or original_component_name == orig_feat:
                    base_name = orig_feat
                    break
            aggregated_importances[base_name] = aggregated_importances.get(base_name, 0) + importances[i]
        else: # Should not happen with standard ColumnTransformer output
            aggregated_importances[transformed_name] = aggregated_importances.get(transformed_name, 0) + importances[i]
            
    return dict(sorted(aggregated_importances.items(), key=lambda item: item[1], reverse=True))


@functions_framework.http
def get_price_prediction(request):
    """
    HTTP Cloud Function to predict price based on input feature values.
    Loads a pre-trained model (desktop or laptop) and returns a prediction.

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
    request_json = request.get_json(silent=True)

    if not request_json:
        return {'error': 'No JSON payload received.'}, 400

    device_type = request_json.get('device_type')
    feature_values = request_json.get('feature_values')

    if not device_type:
        return {'error': 'Missing "device_type" in JSON payload.'}, 400
    if device_type.lower() not in ['desktop', 'laptop']:
        return {'error': 'Invalid "device_type". Must be "desktop" or "laptop".'}, 400
    if not feature_values or not isinstance(feature_values, dict):
        return {'error': 'Missing or invalid "feature_values" in JSON payload. Must be a dictionary.'}, 400

    device_type = device_type.lower()
    
    # Create DataFrame from the input feature values (single row)
    try:
        df_input = pd.DataFrame([feature_values]) # Note: [feature_values] creates a DataFrame with 1 row
        print(f"Successfully created DataFrame from input features. Shape: {df_input.shape}")
    except Exception as e:
        error_msg = f'Error creating DataFrame from "feature_values": {str(e)}'
        print(error_msg)
        return {'error': error_msg}, 400

    if device_type == 'desktop':
        required_features = DESKTOP_FEATURES
        model_file_name = 'desktop_model_pipeline.joblib'
    else: # laptop
        required_features = LAPTOP_FEATURES
        model_file_name = 'laptop_model_pipeline.joblib'

    # Validate that all required features are in the input DataFrame (created from feature_values)
    missing_features = [col for col in required_features if col not in df_input.columns]
    if missing_features:
        error_msg = (f"Missing required keys in 'feature_values' for device type "
                     f"'{device_type}': {missing_features}. "
                     f"Expected: {required_features}")
        print(error_msg)
        return {'error': error_msg}, 400

    # Ensure DataFrame has columns in the correct order expected by the model pipeline,
    # if the pipeline is sensitive to column order (ColumnTransformer typically isn't for selection).
    # Selecting only the required features also handles any extra features sent by the client.
    try:
        X_predict = df_input[required_features]
    except KeyError as e:
        error_msg = f"A feature specified in {device_type.upper()}_FEATURES was not found in the input: {e}"
        print(error_msg)
        return {'error': error_msg, 'details': f"Ensure all features in {required_features} are provided in 'feature_values'."}, 400


    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, model_file_name)
        
        print(f"Loading model from: {model_path}")
        if not os.path.exists(model_path):
            error_msg = f"Model file '{model_file_name}' not found at {model_path}. Ensure it's deployed with the function."
            print(error_msg)
            return {'error': error_msg}, 500
            
        model_pipeline = joblib.load(model_path)
        print(f"Successfully loaded model: {model_file_name}")
    except Exception as e:
        error_msg = f"Error loading model '{model_file_name}': {str(e)}"
        print(error_msg)
        return {'error': error_msg, 'details': 'Ensure model file is valid and dependencies are met.'}, 500

    try:
        predictions_transformed = model_pipeline.predict(X_predict)
        
        predicted_price_transformed = predictions_transformed[0] # We expect a single prediction
        
        predicted_price = predicted_price_transformed
        if MODEL_TRAINED_ON_LOG_TARGET:
            predicted_price = np.expm1(predicted_price_transformed)
        
        predicted_price = max(0, predicted_price) # Ensure price is not negative

        feature_importances = get_aggregated_feature_importances(model_pipeline, required_features)

    except Exception as e:
        error_msg = f"Error during prediction or feature importance extraction: {str(e)}"
        print(error_msg)
        return {'error': error_msg}, 500

    results = {
        "model_type_used": device_type,
        "predicted_price": round(predicted_price, 2),
        "feature_importances": feature_importances
    }
    
    return results, 200