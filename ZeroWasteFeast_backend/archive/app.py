from flask import Flask, render_template
from flask import jsonify, request
import psycopg2
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import gc

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.route("/test-connection")
def hello_world():
    return "Backend Online"


def get_db_connection():
    conn = psycopg2.connect(
        host="my-postgre-db.cvk88iayawn4.ap-southeast-2.rds.amazonaws.com",
        database="postgres",
        user="postgres",
        password="Hifive16",
        port="5432",
    )
    return conn


population = {
    "2020": 25670051,
    "2019": 25357170,
    "2018": 24979230,
    "2017": 24590334,
    "2016": 24195701,
    "2015": 23820236,
    "2014": 23469579,
    "2013": 23111782,
    "2010": 22019168,
    "2009": 21660892,
    "2008": 21247873,
    "2006": 20467030,
}


@app.route("/avgAusWaste")
def index():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT year, tonnes FROM waste;")
    waste = cur.fetchall()
    cur.close()
    conn.close()
    waste_data = []

    for row in waste:
        waste_data.append({"Year": row[0], "Tonnes": row[1]})

    grouped_data = {}
    for entry in waste_data:
        year = entry["Year"]
        tonnes = entry["Tonnes"]

        if year not in grouped_data:
            grouped_data[year] = 0

        grouped_data[year] += tonnes * 1000 / population[year]

    average_waste_pp = round(sum(grouped_data.values()) / len(grouped_data))

    # print(average_waste_pp)

    return {"avg_waste": average_waste_pp}


@app.route("/ausWastePerc")
def calc_perc():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT year, tonnes FROM consumption;")
    consumption = cur.fetchall()
    cur.close()

    cur = conn.cursor()
    cur.execute("SELECT year, tonnes FROM waste;")
    waste = cur.fetchall()
    cur.close()
    conn.close()

    consumption_data = []
    waste_data = []

    for row in waste:
        waste_data.append({"Year": row[0], "Tonnes": row[1]})

    grouped_data = {}
    for entry in waste_data:
        year = entry["Year"]
        tonnes = entry["Tonnes"]

        if year not in grouped_data:
            grouped_data[year] = 0

        grouped_data[year] += tonnes * 1000 / population[year]

    for row in consumption:
        consumption_data.append({"Year": row[0], "Tonnes": row[1]})

    for entry in consumption_data:
        tonnes = entry["Tonnes"]
        year = entry["Year"]
        if year in population:
            entry["Tonnes"] += tonnes * 1000 * 1000000 / population[year]

    percentages = 0
    count = 0
    past_vals = []

    for entry in consumption_data:
        for waste_val in grouped_data.keys():
            if entry["Year"] == waste_val:
                percentages += grouped_data[waste_val] / entry["Tonnes"]
                past_vals.append(
                    round((grouped_data[waste_val] / entry["Tonnes"]) * 100)
                )
                count += 1

    waste_perc = round((percentages / count) * 100)
    # print(count)

    return {"waste_perc": waste_perc, "past_percs": past_vals}


@app.route('/get_product', methods=['GET'])
def search_barcode():
    # Get the barcode from the request parameters
    barcode = request.args.get('id')

    if not barcode:
        return jsonify({"error": "Barcode parameter is missing"}), 400

    try:
        # Connect to the database
        conn = get_db_connection()
        cur = conn.cursor()

        # Query the database for the provided barcode
        query = "SELECT * FROM products WHERE code = %s"
        cur.execute(query, (barcode,))

        # Fetch the result
        result = cur.fetchone()

        # Close the database connection
        cur.close()
        conn.close()

        # If no result is found
        if not result:
            return jsonify({"message": "No product found with this barcode"}), 404

        # Return the result as a JSON response
        product = {
            "name": result[1],
            "category": result[2]
        }

        return jsonify(product), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# initialize yolo model to ram
fruit_model = YOLO("best_fruit.pt")
veg_model = YOLO("best_veggie.pt")

@app.route('/get_produce', methods=['POST'])
def find_produce():
    try:
        produce = request.args.get('type')
        # Check if the post request has the file part
        if 'image' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['image']
        
        if file:
            # Load model
            if produce == 'fruit':
                trained_model = fruit_model
            elif produce == 'veg':
                trained_model = veg_model
            else:
                return jsonify({"error": "Invalid Produce Type"}), 400
            
            best_box = None
            best_conf = 0

            # Read file as a byte stream and decode
            file_bytes = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

            img = cv2.resize(img, (320, 320))

            results = trained_model(img, imgsz=320, show_boxes=True, verbose=False)

            for r in results:
                for box in r.boxes:
                    conf = box.conf[0].item()
                    if conf > best_conf:
                        best_box = box
                        best_conf = conf
                        
            label = trained_model.names[int(best_box.cls)]

            # force memory release
            del file_bytes
            del img
            del results
            gc.collect()

            return jsonify({"label": label, 
                            "category": 'Fresh Produce', 
                            'confidence':round(best_conf*100)}), 200
    except Exception as e:
        # Catch any exception and return a 500 error with the exception message
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    finally:
        gc.collect()
