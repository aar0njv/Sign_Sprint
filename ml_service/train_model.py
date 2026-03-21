import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def train_model(data_path="hand_data.csv", model_path="model.pkl"):
    print("-" * 50)
    print("SignSprint Model Training Tool")
    print("-" * 50)
    
    if not os.path.exists(data_path):
        print(f" Error: Could not find '{data_path}'.")
        print("Please run 'python collect_data.py' first to gather training data.")
        return

    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    if df.empty:
        print(" Error: The dataset is empty.")
        return

    total_samples = len(df)
    labels = df['label'].unique()
    
    print(f" Loaded {total_samples} samples across {len(labels)} classes.")
    print(f"Classes found: {', '.join(labels)}")
    
    # Check if we have enough classes
    if len(labels) < 2:
        print("\n Warning: You only have data for 1 class. The model needs at least 2 different signs to learn how to classify them.")
        print("Please run collect_data.py again to collect data for another sign (e.g. 'B').")
        return

    # Split into features (X) and labels (y)
    X = df.iloc[:, 1:].values  # Columns 1 to 63 are the coordinates
    y = df.iloc[:, 0].values   # Column 0 is the label

    # Split into training and testing sets (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"\nTraining on {len(X_train)} samples, validating on {len(X_test)} samples.")
    print("Training Random Forest Classifier (this might take a few seconds)...")
    
    # Initialize and train the Random Forest
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate the model
    print("\nEvaluating model performance...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n Validation Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the trained model
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"\nclear Model saved successfully to '{model_path}'!")
    print("You can now start your FastAPI server (`python main.py`) and it will automatically load this model.")

if __name__ == "__main__":
    train_model()
