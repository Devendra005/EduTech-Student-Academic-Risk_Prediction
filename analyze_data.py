import pandas as pd
import os

data_path = "student_academic_risk_dataset_5000.csv"
if not os.path.exists(data_path):
    print(f"File {data_path} not found!")
else:
    df = pd.read_csv(data_path)
    print("Columns:", df.columns.tolist())
    for col in df.columns:
        print(f"\nColumn: {col}")
        print(f"Dtype: {df[col].dtype}")
        if df[col].dtype == "object":
            print(f"Unique values: {df[col].unique().tolist()}")
        else:
            print(f"Range: {df[col].min()} - {df[col].max()}")
