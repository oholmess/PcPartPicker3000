# PcPartPicker3000

PcPartPicker3000 is a pricing and product intelligence service delivered through a multi-page web application. It transforms an 8,000-item, partially unstructured Spanish-language marketplace dataset of computer hardware into an English-navigable analytical tool. This project aims to offer buyers transparent benchmarking and provide sellers and the marketplace with evidence-based guidance for inventory and revenue decisions, moving away from manual spreadsheet work.

The application serves as a self-service decision cockpit for various users: executives can track market shifts, category managers can verify price competitiveness, and consumers can instantly compare configurations. The core goal is to sharpen price accuracy, lift conversion rates, and safeguard margins through accelerated insight-to-action loops.

## Features

*   **Descriptive Analytics:** Provides statistical overviews of market offerings, including price distributions, screen size frequencies, and categorical price breakdowns. Features K-Means segmentation to identify distinct market segments (e.g., basic vs. high-end hardware).
*   **Predictive Analytics:** Delivers price estimates for computer configurations using a LightGBM regression model. Includes feature importance explanations to show what specifications most strongly influence price.
*   **Prescriptive Analytics:** Returns the *k* most similar live offers from the dataset via a K-Nearest-Neighbours (KNN) search, allowing users to compare configurations and make informed purchasing decisions.
*   **Multi-Page Web Application:** Intuitive English UI with four main sections: Overview, Segmentation, Prediction, and Similar Offers, while preserving original Spanish data values for fidelity.
*   **Data Processing Pipeline:** Includes data collection, cleaning (handling mixed types, unit normalization, parsing composite specs), semantic alignment of Spanish-language raw feeds to English, feature engineering (e.g., pixel_density, interaction terms), and feature selection.
*   **User Feedback Logging:** (Implied for future) Mechanism for continuous monitoring and retraining to keep model performance aligned with evolving market reality.

## Installation

To set up the project environment, follow these steps:

**1. Backend Setup (Python):**
    1.  **Clone the repository:**
        ```bash
        git clone <your-repository-url>
        cd PcPartPicker3000
        ```
    2.  **Create and activate a virtual environment (recommended):**
        ```bash
        python -m venv venv
        # On Windows
        .\venv\Scripts\activate
        # On macOS/Linux
        source venv/bin/activate
        ```
    3.  **Install Python dependencies:**
        ```bash
        pip install -r requirements.txt
        ```

**2. Frontend Setup (Node.js):**
    1.  **Install Node.js and npm:**
        Ensure you have Node.js (which includes npm) installed. You can download it from [https://nodejs.org/](https://nodejs.org/).
    2.  **Navigate to the frontend directory:**
        ```bash
        cd frontend
        ```
    3.  **Install frontend dependencies:**
        ```bash
        npm install
        ```
    4. **Navigate back to the project root directory:**
       ```bash
       cd ..
       ```

## File Structure

```text
PcPartPicker3000/
├── .gitattributes
├── .github/
│   └── workflows/
│       └── google-cloudrun-source.yml
├── .DS_Store
├── README.md
├──raw_data/
│       ├── db_computers_2025_raw.csv
│       └── db_computers_columns_names.txt
├── cloud/
│   ├── get-k-similar-products/
│   │   ├── .vscode/
│   │   │   └── launch.json
│   │   ├── README.md
│   │   ├── X_train_original_for_knn_lookup_desktop.csv
│   │   ├── X_train_original_for_knn_lookup_laptop.csv
│   │   ├── main.py
│   │   ├── main.py.zip
│   │   ├── nn_model_desktop.joblib
│   │   ├── nn_model_laptop.joblib
│   │   ├── preprocessor_desktop_knn.joblib
│   │   ├── preprocessor_laptop_knn.joblib
│   │   └── requirements.txt
│   └── get-price-prediction/
│       ├── .vscode/
│       │   └── launch.json
│       ├── README.md
│       ├── desktop_model_pipeline.joblib
│       ├── laptop_model_pipeline.joblib
│       ├── main.py
│       └── requirements.txt
│ 
├── frontend/
│   ├── .gitignore
│   ├── README.md
│   ├── bun.lockb
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── node_modules/ [...]
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   ├── all_prices.json
│   │   ├── engineered_laptop_details.json
│   │   ├── favicon.ico
│   │   ├── laptop_data.json
│   │   ├── laptop_screen_sizes.json
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── index.css
│   │   ├── lib/
│   │   ├── main.tsx
│   │   ├── pages/
│   │   ├── services/
│   │   ├── util/
│   │   └── vite-env.d.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── local_work/
│   ├── EDA.ipynb
│   ├── K-Means_k=2 documented.ipynb
│   ├── KNN_2 documented.ipynb
│   ├── Predictive_Model.ipynb
│   ├── df_engineered.csv
│   ├── df_engineered_desktop_pc.csv
│   ├── df_engineered_laptop.csv
│   ├── df_engineered_partial_pc.csv
│   ├── df_modified.csv
│   ├── piplines/
│   │   ├── LightGBM/
│   │   │   ├── desktop_model_pipeline.joblib
│   │   │   └── laptop_model_pipeline.joblib
│   │   └── kNN/
│   │       ├── X_train_original_for_knn_lookup_desktop.csv
│   │       ├── X_train_original_for_knn_lookup_laptop.csv
│   │       ├── nn_model_desktop.joblib
│   │       ├── nn_model_laptop.joblib
│   │       ├── preprocessor_desktop_knn.joblib
│   │       └── preprocessor_laptop.joblib
│   ├── static_frontend_data.ipynb
│   └── temp.ipynb
│ 
├── requirements.txt
└── temp_helper_funcs/
    ├── convert_csv_to_json.py
    ├── generate_screen_size_json.py
    └── modify_csv.py
```

## Usage

The application is a multi-page Streamlit web app with a separate frontend component.

1.  **Ensure all dependencies are installed** by following the steps in the [Installation](#installation) section (for both backend/Python and frontend/Node.js).

2.  **Run the Backend/Streamlit Application:**
    The main application is built with Streamlit. To run it, navigate to the project's root directory and use the Streamlit CLI. You will typically run a main Python script.
    ```bash
    # Ensure your Python virtual environment is activated
    # e.g., .\venv\Scripts\activate or source venv/bin/activate

    streamlit run your_main_app_script.py 
    ```
    *(Replace `your_main_app_script.py` with the actual name of your main Streamlit Python file.)*
    The backend models (K-Means, LightGBM, KNN) are served via API endpoints (e.g., `/predict`, `/similar`) that the frontend consumes.

3.  **Run the Frontend Development Server:**
    The user interface is located in the `frontend` directory.
    ```bash
    cd frontend
    npm run dev
    ```
    This will typically open the application in your default web browser, or the console output will provide a local URL (e.g., `http://localhost:3000` or a port used by Streamlit if it proxies).

*Note: The frontend makes API calls (using Axios) to the backend Streamlit application for model predictions and recommendations. Ensure the backend Streamlit application is running and accessible by the frontend.*

## Technologies Used

*   **Backend & Machine Learning:**
    *   Python
    *   Pandas, NumPy
    *   Matplotlib, Seaborn, Missingno (for EDA and visualization)
    *   Scikit-learn (for K-Means clustering, KNN, preprocessing pipelines)
    *   LightGBM, XGBoost (for price prediction modeling)
    *   Streamlit (for the web application framework and serving backend models)
*   **Frontend:**
    *   Node.js, npm
    *   Axios (for API communication with the backend)
    *   (Potentially a specific frontend framework like React, Vue, Angular - if mentioned or can be inferred, add here)
*   **Version Control:**
    *   Git & GitHub (implied)

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -am 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Create a new Pull Request.