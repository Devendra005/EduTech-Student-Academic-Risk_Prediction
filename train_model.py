# ==============================
# 1. Import Libraries
# ==============================
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# ==============================
# 2. Load Dataset
# ==============================
data_path = "student_academic_risk_dataset_5000.csv"
if not os.path.exists(data_path):
    print(f"Error: {data_path} not found.")
    exit()

df = pd.read_csv(data_path)
print("Dataset Shape:", df.shape)

# ==============================
# 3. Data Cleaning
# ==============================
df = df.drop_duplicates()
df['Parent_Education'] = df['Parent_Education'].fillna('Unknown')
df['Internet_Access'] = df['Internet_Access'].fillna('No')
df['Family_Income'] = df['Family_Income'].fillna('Medium')

# Drop any rows where Academic_Risk is NaN
df = df.dropna(subset=['Academic_Risk'])

# ==============================
# 4. Encode Categorical Variables
# ==============================
# We need to save the encoders to use them in the web app.
encoders = {}
categorical_cols = ["Gender", "Parent_Education", "Family_Income", "Internet_Access"]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# ==============================
# 5. Define Features and Target (Correcting feature list)
# ==============================
# All features except Student_ID and Academic_Risk
X = df.drop(["Student_ID", "Academic_Risk"], axis=1)
y = df["Academic_Risk"]

# Print columns to make sure they match
print("Features used:", X.columns.tolist())

# ==============================
# 6. Feature Scaling
# ==============================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ==============================
# 7. Train Test Split
# ==============================
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# ==============================
# 8. Train Model (Logistic Regression)
# ==============================
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# ==============================
# 9. Model Evaluation
# ==============================
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# ==============================
# 10. Save Model, Scaler, and Encoders
# ==============================
os.makedirs("models", exist_ok=True)

# Save everything in a bundle for easy loading
model_bundle = {
    "model": model,
    "scaler": scaler,
    "encoders": encoders,
    "features": X.columns.tolist()
}

with open("models/academic_risk_model_bundle.pkl", "wb") as f:
    pickle.dump(model_bundle, f)

print("Model Bundle Saved Successfully in 'models/academic_risk_model_bundle.pkl'")