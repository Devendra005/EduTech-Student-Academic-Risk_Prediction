# EduTech Student Academic Risk Prediction

This project uses machine learning to predict student academic risk based on various factors such as attendance, grades, and parental education. It helps educational institutions identify students who may need additional support.

## 📊 Project Overview

- **Objective**: Classify students into "Risk" or "No Risk" categories.
- **Model**: Logistic Regression.
- **Accuracy**: ~77%
- **Data Source**: `student_academic_risk_dataset_5000.csv` (contains 5000 records).

## 📂 Project Structure

- `train_model.py`: Main script to clean data, train the model, and evaluate performance.
- `student_academic_risk_dataset_5000.csv`: The dataset used for training and testing.
- `models/`: Directory where the trained model is saved (`academic_risk_model.pkl`).
- `EDA.ipynb`: Jupyter notebook for exploratory data analysis.
- `check_csv.py`: Helper script to inspect dataset columns and missing values.

## 🛠️ Installation & Setup

1. **Requirements**:
   Ensure you have Python installed, along with the following libraries:
   ```bash
   pip install pandas numpy scikit-learn
   ```

2. **Run Training**:
   Execute the training script to process the data and save the model:
   ```bash
   python train_model.py
   ```

## 🧠 Model Features

The model uses the following features for prediction:
- **Demographics**: Age, Gender.
- **Academic Performance**: Previous Grade, Current Grade, Assignments Submitted.
- **Engagement**: Attendance Percentage, Study Hours, Behavior Score.
- **Environment**: Parent Education, Family Income, Internet Access.

## 📈 Evaluation Results

The model achieves the following performance metrics:
- **Accuracy**: 0.77
- **F1-Score**: ~0.80 (for Risk category)

## 📝 License
This project is for educational purposes as part of the 6th Semester Project.
