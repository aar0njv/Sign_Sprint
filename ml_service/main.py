import json
import pickle
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the scikit-learn model
# In a real app, you would train and save a model first using: pickle.dump(model, open('model.pkl', 'wb'))
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
except FileNotFoundError:
    model = None
    print("Warning: model.pkl not found. Predictions will be mocked for boilerplate.")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Extract the 63 coordinates [x1, y1, z1, x2, y2, z2, ...]
            coordinates = payload.get("coordinates", [])
            
            if len(coordinates) == 63:
                if model:
                    # Model expects a 2D array: [n_samples, n_features]
                    prediction = model.predict([coordinates])
                    predicted_letter = str(prediction[0])
                else:
                    # Mock prediction if no model file exists
                    predicted_letter = "A" 
                
                # Emit result back over WebSocket immediately
                await websocket.send_json({
                    "Predicted_Letter": predicted_letter
                })
            else:
                await websocket.send_json({
                    "error": f"Expected 63 coordinates, got {len(coordinates)}"
                })
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error during prediction: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
