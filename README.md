# EduTrace | Student Performance & Dropout Risk Prediction

EduTrace is a premium, full-stack educational management platform that utilizes machine learning to identify students at dropout risk while providing a comprehensive suite for student performance management.

![EduTrace Dashboard Mockup](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop)

## 🚀 Key Features

- **AI-Driven Risk Prediction**: Logistic Regression model trained on 5,000+ student records with 77% accuracy.
- **Full CRUD Student Database**: Search, Enroll, Edit, and Delete student records directly from a premium glassmorphism dashboard.
- **Institutional Analytics**: Real-time charts for GPA distribution, attendance trends, and AI impact factors.
- **Multi-Page SPA**: Integrated Dashboard, Predictor, and Settings pages.
- **Modern Backend**: FastAPI-powered REST API for high-performance data handling.

## 🛠️ Prerequisites

Ensure you have **Python 3.8+** installed. You will also need the following libraries:

```bash
pip install fastapi uvicorn pandas numpy scikit-learn pydantic
```

## 📂 Project Structure

- `main.py`: The FastAPI backend server and static file host.
- `train_model.py`: Script to train the ML model and generate the deployment bundle.
- `static/`: Contains the premium frontend (HTML, CSS, JS).
- `models/`: Stores the trained model bundle (`dropout_risk_model_bundle.pkl`).
- `student_dropout_risk_dataset_5000.csv`: The core student database.

## 🏃 Running the Application

### 1. Training the Model (Optional)
If you want to retrain the model or update the deployment bundle:
```bash
python train_model.py
```
This will regenerate the model bundle in the `models/` directory with updated `StandardScaler` and `LabelEncoders`.

### 2. Launching the Web Portal
To start the integrated management system:
```bash
python main.py

error show then 
netstat -ano | findstr :8000

taskkill /F /PID 22828
```
After the server starts, open your web browser and navigate to:
👉 **[http://localhost:8000/app/index.html](http://localhost:8000/app/index.html)**

## 📊 Using the Platform

1. **Dashboard**: View global institutional metrics and performance trends.
2. **Risk Predictor**: Enter student metrics to run real-time AI diagnostic reports.
3. **Student database**: 
    - Use the search bar to filter records by ID or Gender.
    - Click "Enroll Student" to add new records to the system.
    - Click the "Edit" or "Delete" icons on any row to manage student data.
4. **Analytics**: Review advanced radar charts for AI influence factors and demographic distribution.

---

### Created by Antigravity - Advanced Coding Agentic AI
*Engineering State-of-the-Art Educational Solutions*
