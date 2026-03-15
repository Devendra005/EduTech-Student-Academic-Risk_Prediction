import pandas as pd
df = pd.read_csv(r"E:\6 Sem\Project\EduTech ML Model\student_academic_risk_dataset_5000.csv")
print("Columns in Dataset:")
for col in df.columns:
    print(f"- {col} ({df[col].dtype})")

print("\nMissing values per column:")
print(df.isnull().sum())
