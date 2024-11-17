import json
import os
import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
import gc
from ultralytics import YOLO

# Initialize YOLO models
MODEL_DIR = os.path.join(os.environ['LAMBDA_TASK_ROOT'], 'models')
FRUIT_MODEL_PATH = os.path.join(MODEL_DIR, 'best_fruit.pt')
VEG_MODEL_PATH = os.path.join(MODEL_DIR, 'best_veggie.pt')
fruit_model = YOLO(FRUIT_MODEL_PATH)
veg_model = YOLO(VEG_MODEL_PATH)

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    try:
        body = json.loads(event['body'])
        produce = event['queryStringParameters'].get('type')
        
        if 'image' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({"error": "No image data"})
            }
        
        image_data = body['image']
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        if produce == 'fruit':
            trained_model = fruit_model
        elif produce == 'veg':
            trained_model = veg_model
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({"error": "Invalid Produce Type"})
            }
        
        best_box = None
        best_conf = 0

        img = cv2.resize(img, (320, 320))

        results = trained_model(img, imgsz=320, show_boxes=True, verbose=False)

        for r in results:
            for box in r.boxes:
                conf = box.conf[0].item()
                if conf > best_conf:
                    best_box = box
                    best_conf = conf
                    
        label = trained_model.names[int(best_box.cls)]

        # Force memory release
        del img
        del results
        gc.collect()

        return {
            'statusCode': 200,
            'body': json.dumps({
                "label": label, 
                "category": 'Fresh Produce', 
                'confidence': round(best_conf*100)
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"error": "Internal Server Error", "message": str(e)})
        }
    finally:
        gc.collect()