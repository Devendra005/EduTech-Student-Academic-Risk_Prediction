import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import confusion_matrix, roc_curve, auc

# 1. Load Data and Process (Replicating train_model.py logic)
data_path = r"E:\6 Sem\Project\EduTech ML Model\student_academic_risk_dataset_5000.csv"
df = pd.read_csv(data_path)
df = df.drop_duplicates()
df['Parent_Education'] = df['Parent_Education'].fillna('Unknown')

le = LabelEncoder()
categorical_cols = ["Gender", "Parent_Education", "Family_Income", "Internet_Access"]
for col in categorical_cols:
    df[col] = le.fit_transform(df[col])

X = df.drop(["Student_ID", "Academic_Risk"], axis=1)
y = df["Academic_Risk"]
feature_names = X.columns

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Load the trained model
with open("models/academic_risk_model.pkl", "rb") as f:
    model = pickle.load(f)

# 3. Generate Predictions
y_pred = model.predict(X_scaled)
y_probs = model.predict_proba(X_scaled)[:, 1]

# 4. Create Visualizations
plt.figure(figsize=(20, 15))

# Plot 1: Confusion Matrix
plt.subplot(2, 2, 1)
cm = confusion_matrix(y, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
plt.title('Confusion Matrix (Model Accuracy)', fontsize=15)
plt.xlabel('Predicted Label')
plt.ylabel('True Label')

# Plot 2: Feature Importance (Logistic Regression Coefficients)
plt.subplot(2, 2, 2)
importance = model.coef_[0]
indices = np.argsort(np.abs(importance))
plt.barh(range(len(indices)), importance[indices], align='center', color='teal')
plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
plt.title('Feature Importance (Impact on Risk)', fontsize=15)
plt.xlabel('Importance (Coefficient Value)')

# Plot 3: Distribution of Target
plt.subplot(2, 2, 3)
sns.countplot(x='Academic_Risk', data=df, palette='viridis')
plt.title('Dataset Balance: Risk (1) vs No Risk (0)', fontsize=15)

# Plot 4: ROC Curve
plt.subplot(2, 2, 4)
fpr, tpr, _ = roc_curve(y, y_probs)
roc_auc = auc(fpr, tpr)
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve (Model Performance)', fontsize=15)
plt.legend(loc="lower right")

plt.tight_layout()
plt.savefig('models/model_visualizations.png')
print("Visualizations saved to 'models/model_visualizations.png'")
