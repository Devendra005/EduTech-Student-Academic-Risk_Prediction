from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os

app = FastAPI(title="EduTrace Student Performance & Dropout Risk Predictor")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files will be mounted at the end to avoid route conflicts

# Load the model bundle
MODEL_PATH = "models/academic_risk_model_bundle.pkl"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model bundle not found at {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    bundle = pickle.load(f)

model = bundle["model"]
scaler = bundle["scaler"]
encoders = bundle["encoders"]
feature_names = bundle["features"]
DATA_PATH = "student_academic_risk_dataset_5000.csv"

class StudentData(BaseModel):
    Age: int
    Gender: str
    Attendance_Percentage: float
    Previous_Grade: float
    Current_Grade: float
    Assignments_Submitted: int
    Behavior_Score: int
    Parent_Education: str
    Family_Income: str
    Internet_Access: str
    Study_Hours: float

class FullStudentData(StudentData):
    Student_ID: int
    Academic_Risk: int

def calculate_stats():
    global stats
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        stats = {
            "avg_attendance": round(float(df_full["Attendance_Percentage"].mean()), 1),
            "avg_grade": round(float(df_full["Current_Grade"].mean()), 1),
            "risk_percentage": round(float(df_full["Academic_Risk"].mean() * 100), 1),
            "total_students": len(df_full)
        }
    else:
        stats = {"avg_attendance": 0, "avg_grade": 0, "risk_percentage": 0, "total_students": 0}

# Initial stats calculation
calculate_stats()

@app.post("/predict")
async def predict(data: StudentData):
    try:
        # Convert input data to DataFrame
        input_dict = data.model_dump()
        df = pd.DataFrame([input_dict])
        
        # Encode categorical variables
        for col, le in encoders.items():
            if col in df.columns:
                # Handle unseen labels by mapping them if necessary (basic implementation)
                try:
                    df[col] = le.transform(df[col])
                except ValueError:
                    # If label is unseen, just use the first available category or 0
                    df[col] = 0
        
        # Ensure correct column order
        df = df[feature_names]
        
        # Scale features
        X_scaled = scaler.transform(df)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0][1] # Probability of "1" (Risk)
        
        return {
            "prediction": int(prediction),
            "risk_score": round(float(probability) * 100, 2),
            "status": "At Risk" if prediction == 1 else "Low Risk"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    return stats

@app.get("/students")
async def get_students(limit: int = 50, search: str = None):
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        if search:
            mask = df_full['Student_ID'].astype(str).str.contains(search) | \
                   df_full['Gender'].str.contains(search, case=False)
            df_full = df_full[mask]
        
        # Fill NaN for JSON compliance
        df_full = df_full.fillna({
            "Parent_Education": "Unknown",
            "Internet_Access": "No",
            "Family_Income": "Medium"
        }).fillna(0)
        
        students = df_full.head(limit).to_dict(orient="records")
        return students
    return []

@app.post("/students")
async def add_student(data: FullStudentData):
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        new_row = pd.DataFrame([data.model_dump()])
        df_full = pd.concat([df_full, new_row], ignore_index=True)
        df_full.to_csv(DATA_PATH, index=False)
        calculate_stats()
        return {"status": "success", "message": "Student added successfully"}
    return {"status": "error", "message": "Database not found"}

@app.put("/student/{student_id}")
async def update_student(student_id: int, data: FullStudentData):
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        if student_id in df_full['Student_ID'].values:
            # Update all fields from the model
            update_dict = data.model_dump()
            for key, value in update_dict.items():
                if key in df_full.columns:
                    df_full.loc[df_full['Student_ID'] == student_id, key] = value
            df_full.to_csv(DATA_PATH, index=False)
            calculate_stats()
            return {"status": "success", "message": "Student updated"}
    raise HTTPException(status_code=404, detail="Student not found")

@app.delete("/student/{student_id}")
async def delete_student(student_id: int):
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        if student_id in df_full['Student_ID'].values:
            df_full = df_full[df_full['Student_ID'] != student_id]
            df_full.to_csv(DATA_PATH, index=False)
            calculate_stats()
            return {"status": "success", "message": "Student deleted"}
    raise HTTPException(status_code=404, detail="Student not found")

@app.get("/student/{student_id}")
async def get_student(student_id: int):
    if os.path.exists(DATA_PATH):
        df_full = pd.read_csv(DATA_PATH)
        student = df_full[df_full['Student_ID'] == student_id]
        if not student.empty:
            # Fill NaN for JSON compliance
            student = student.fillna(0)
            return student.iloc[0].to_dict()
    raise HTTPException(status_code=404, detail="Student not found")

from fastapi.responses import FileResponse

@app.get("/")
async def root():
    return FileResponse("static/index.html")

# Mount static files at root AFTER all API routes
os.makedirs("static", exist_ok=True)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
