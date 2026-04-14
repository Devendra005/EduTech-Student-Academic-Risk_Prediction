# EduTrace | Lumina Academic Management Platform

EduTrace is a premium, AI-powered institutional management platform. It utilizes advanced machine learning to identify student dropout risks while offering a sophisticated, editorial-style interface for academic record management and data visualization.

![EduTrace Interface Mockup](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop)

## 🌌 The Ethereal Observatory Design
Based on the **Lumina Academic** design system, the platform adopts an "Editorial" aesthetic:
- **Dual-Font Precision**: Utilizing **Manrope** for authoritative headlines and **Inter** for technical data legibility.
- **Glassmorphism Components**: Premium glass cards with `24px` backdrop blur and high-chroma cyan accents.
- **Ghost Border System**: Minimalist input fields that respond with neon glows upon interaction.
- **Asymmetric Layouts**: A non-rigid, modern dashboard structure that prioritizes visual depth.

## 🚀 Key Features

- **Neural Diagnostic Engine**: Logistic Regression model providing real-time risk scores and status updates.
- **Editorial Student Database**: Full CRUD capabilities within a sleek, searchable institutional record system.
- **High-Impact Analytics**: Expansive radar charts for AI influence factors and Bar/Doughnut charts for demographic trends.
- **Institutional Scale**: Designed for handling thousands of records with rapid search and data export.

## 🛠️ Prerequisites

Ensure you have **Python 3.8+** installed. Install the necessary dependencies:

```bash
pip install fastapi uvicorn pandas numpy scikit-learn pydantic
```

## 📂 Project Structure

- `main.py`: High-performance FastAPI backend serving the AI engine and frontend.
- `train_model.py`: Training script for generating the deployment model bundle.
- `static/`: Premium "Lumina Academic" frontend (HTML, CSS, JS).
- `models/`: Stores the quantized AI deployment bundle.
- `student_academic_risk_dataset_5000.csv`: Central database for student records.

## 🏃 Running the Application

### 1. Model Preparation (Optional)
To regenerate or update the predictive neural weights:
```bash
python train_model.py
```

### 2. Launching the Management Portal
Start the integrated backend and frontend server:
```bash
python main.py
```

#### Troubleshooting Port Conflicts
If you encounter a "Port already in use" error:
```powershell
# Find the Process ID using port 8000
netstat -ano | findstr :8000

# Kill the process (Replace <PID> with the ID found)
taskkill /F /PID <PID>
```

### 3. Accessing the Platform
Open your browser and navigate to the root endpoint:
👉 **[http://localhost:8000/](http://localhost:8000/)**

## 📊 Using the Platform

1. **Dashboard**: Monitor global institutional performance and average risk indexes.
2. **Predictor**: Use the "Run Neural Diagnostic" tool to analyze individual student telemetry.
3. **Database**: Manage centralized student records, search by ID, and export institutional data to CSV.
4. **Analytics**: Drill down into "AI Influence Factors" to understand the core metrics driving student success.

---

### Created by Antigravity - Advanced Coding Agentic AI
*Engineering State-of-the-Art Educational Solutions with the Lumina Design System*

