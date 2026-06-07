#  CyberGuard — Project

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3-orange?logo=scikit-learn&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.0-150458?logo=pandas&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

> Predicting student math scores using demographic and academic features with three ML models — Linear Regression, Random Forest, and Gradient Boosting.

---

##  Project Overview

This end-to-end machine learning project analyzes a dataset of **1,000 students** to predict math scores based on factors like gender, parental education, lunch type, and test preparation course completion.

The project covers the complete data science workflow:
- Exploratory Data Analysis (EDA)
- Feature Engineering
- Model Training & Evaluation
- Visualization & Insights

---

## Dataset

| Feature | Type | Description |
|---|---|---|
| `gender` | Categorical | Male / Female |
| `race/ethnicity` | Categorical | Group A to Group E |
| `parental level of education` | Categorical | High school to Master's degree |
| `lunch` | Categorical | Standard / Free-reduced |
| `test preparation course` | Categorical | Completed / None |
| `reading score` | Numerical | Score out of 100 |
| `writing score` | Numerical | Score out of 100 |
| `math score` | Numerical | **Target variable** — score out of 100 |

- **Rows:** 1,000 students  
- **Missing values:** None  
- **Source:** Inspired by [Kaggle — Students Performance in Exams](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams)

---

##  Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Python | 3.10 | Core language |
| Pandas | 2.0 | Data loading & manipulation |
| NumPy | 1.24 | Numerical operations |
| Matplotlib | 3.7 | Data visualization |
| Seaborn | 0.12 | Statistical charts |
| Scikit-learn | 1.3 | ML models & evaluation |

---

## Project Structure

```
student-marks-predictor/
│
├── Student_Marks_Predictor_FINAL.ipynb   # Main notebook (all 3 days)
├── README.md                              # Project documentation
│
├── charts/                                # Generated visualizations
│   ├── chart1_score_distributions.png
│   ├── chart2_feature_analysis.png
│   ├── chart3_correlation_heatmap.png
│   ├── chart4_boxplot_gender.png
│   ├── chart5_actual_vs_predicted.png
│   ├── chart6_feature_importance.png
│   ├── chart7_model_comparison.png
│   └── chart8_residual_analysis.png
│
└── requirements.txt                       # Python dependencies
```

---

##  How to Run

### Option 1 — Google Colab (Recommended, no setup needed)

1. Click the badge below or open [Google Colab](https://colab.research.google.com)
2. Go to **File → Upload notebook**
3. Upload `Student_Marks_Predictor_FINAL.ipynb`
4. Click **Runtime → Run all**

>  No installation needed — all libraries are pre-installed in Colab

### Option 2 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/student-marks-predictor.git
cd student-marks-predictor

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch Jupyter Notebook
jupyter notebook Student_Marks_Predictor_FINAL.ipynb
```

---

##  Model Results

Three models were trained and compared on the same 80/20 train-test split:

| Model | R² Score | MAE | RMSE |
|---|---|---|---|
| Linear Regression | 0.40 | 8.99 | 11.2 |
| Random Forest | 0.87 | 5.21 | 7.3 |
| **Gradient Boosting** | **0.89** | **4.98** | **7.0** |

>  **Best Model: Gradient Boosting** with ~89% variance explained

**Evaluation Metrics Explained:**
- **R² Score** — How much variance the model explains (higher = better, max 1.0)
- **MAE** — Average error in marks (lower = better)
- **RMSE** — Penalizes large errors more heavily (lower = better)

---

## Visualizations

The notebook generates **8 charts** automatically:

| # | Chart | Purpose |
|---|---|---|
| 1 | Score distributions | Understand spread of all 3 scores |
| 2 | Feature analysis | Which features impact math score most |
| 3 | Correlation heatmap | Relationship between reading, writing, math |
| 4 | Boxplot by gender | Score distribution differences by gender |
| 5 | Actual vs Predicted | Visual model accuracy check |
| 6 | Feature importance | Top 10 most influential features (RF) |
| 7 | Model comparison | R² and MAE comparison across all 3 models |
| 8 | Residual analysis | Error pattern analysis |

---

##  Key Insights

-  **Reading & writing scores** are the strongest predictors of math performance
- Students who **completed test prep** scored ~10 marks higher on average
-  **Standard lunch** students consistently outperformed free/reduced lunch students
-  **Higher parental education** level is positively correlated with student scores
-  **Female students** score higher in reading and writing; male students slightly higher in math

---

## Future Improvements

- [ ] Deploy as a web app using **Streamlit** so anyone can enter student details and get a prediction
- [ ] Add more advanced models (XGBoost, LightGBM)
- [ ] Hyperparameter tuning using GridSearchCV
- [ ] Add SHAP values for better model explainability
- [ ] Try classification version — predict pass/fail instead of exact score

---

## Author

**Srithar K**  
B.Tech — Artificial Intelligence & Data Science  
K Ramakrishnan College of Engineering, Coimbatore  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/SRITHAR-K)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/SRITHAR-K)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail)](mailto:sritharsrithar568@gmail.com)

---

##  License

This project is licensed under the **MIT License** — feel free to use, modify, and share with attribution.

---

>  If you found this project useful, please give it a star on GitHub — it helps other students find it!
