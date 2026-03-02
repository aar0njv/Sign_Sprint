import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import os
import time

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False, 
    max_num_hands=1, 
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

def collect_data_for_label(label, num_samples=300, save_path="hand_data.csv"):
    cap = cv2.VideoCapture(0)
    print(f"\n✅ Collecting data for '{label}'.")
    print("Get ready! Starting in 3 seconds...")
    time.sleep(1)
    print("2...")
    time.sleep(1)
    print("1...")
    time.sleep(1)
    print("Go!")
    
    data = []
    samples_collected = 0
    
    while cap.isOpened() and samples_collected < num_samples:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break
            
        # Flip the frame horizontally for a later selfie-view display
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame to find hands
        results = hands.process(frame_rgb)
        
        cv2.putText(frame, f"Collecting '{label}'", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        cv2.putText(frame, f"Progress: {samples_collected}/{num_samples}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                coords = []
                for lm in hand_landmarks.landmark:
                    coords.extend([lm.x, lm.y, lm.z])
                
                # We expect exactly 21 landmarks * 3 coords = 63 coords
                if len(coords) == 63:
                    data.append([label] + coords)
                    samples_collected += 1
                
        cv2.imshow('Data Collection Pipeline', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\nCollection interrupted by user.")
            break
            
    cap.release()
    cv2.destroyAllWindows()
    
    if data:
        columns = ['label'] + [f'coord_{i}' for i in range(63)]
        df = pd.DataFrame(data, columns=columns)
        
        # Append to CSV if it exists, otherwise create it
        if os.path.exists(save_path):
            df.to_csv(save_path, mode='a', header=False, index=False)
        else:
            df.to_csv(save_path, index=False)
        print(f"\n🎉 Successfully collected and saved {len(data)} samples for '{label}'.")
    else:
        print("\n❌ No data collected.")

if __name__ == "__main__":
    print("-" * 50)
    print("SignSprint Data Collection Tool")
    print("-" * 50)
    
    while True:
        target_sign = input("\nEnter the target sign (e.g., A, B, C) or 'quit' to exit: ").upper()
        
        if target_sign == 'QUIT' or target_sign == 'Q':
            break
            
        if not target_sign:
            print("Please enter a valid sign.")
            continue
            
        num = input("Number of frames to collect (default 300): ")
        num = int(num) if num.isdigit() else 300
        
        collect_data_for_label(target_sign, num_samples=num)
