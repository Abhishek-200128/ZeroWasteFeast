from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv


# Configure Gemini API
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)

@app.route('/get_storage_tips', methods=['GET'])
def get_storage_tips():
    product_name = request.args.get('productName')
    
    if not product_name:
        return jsonify({"error": "Product name is required"}), 400
    
    try:
        prompt = f"Provide storage tips for {product_name} in 150 words or less. Focus on practical advice for keeping the food fresh and safe to eat."
        response = model.generate_content(prompt)
        
        return jsonify({"storage_tips": response.text})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)