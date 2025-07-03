"""
PcPartPicker3000 Exploratory Visualizations

This script contains custom exploratory graphs for the engineered datasets in the PcPartPicker3000 project.
Each section is clearly titled for easy navigation and future expansion.
"""

# 1. RAM vs. Price by Cluster
# ---------------------------
# This section visualizes the relationship between RAM and Price, colored by cluster (using KMeans if clusters are not present).

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans

# Load the engineered dataset
df = pd.read_csv('df_engineered.csv')

# Check for cluster column
if 'cluster' not in df.columns:
    # Use RAM and Price for clustering (or add more features if desired)
    features = df[['ram', 'price']].dropna()
    kmeans = KMeans(n_clusters=3, random_state=42)
    clusters = kmeans.fit_predict(features)
    df.loc[features.index, 'cluster'] = clusters
    df['cluster'] = df['cluster'].astype(int)

plt.figure(figsize=(10, 6))
sns.scatterplot(data=df, x='ram', y='price', hue='cluster', palette='tab10')
plt.title('RAM vs. Price by Cluster')
plt.xlabel('RAM (GB)')
plt.ylabel('Price')
plt.legend(title='Cluster')
plt.tight_layout()
plt.show() 