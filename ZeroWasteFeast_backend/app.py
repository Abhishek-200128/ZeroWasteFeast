from flask import Flask, render_template
from flask import jsonify, request
from io import BytesIO
from PIL import Image
import psycopg2
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import gc
import base64
import random
from fuzzywuzzy import fuzz
import ast

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


@app.route("/get_product", methods=["GET"])
def search_barcode():
    # Get the barcode from the request parameters
    barcode = request.args.get("id")

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
        product = {"name": result[1], "category": result[2]}

        return jsonify(product), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# initialize yolo model to ram
fruit_model = YOLO("best_fruit.pt")
veg_model = YOLO("best_veggie.pt")


@app.route("/get_produce", methods=["POST"])
def find_produce():
    try:
        produce = request.args.get("type")
        # Check if the post request has the file part
        data = request.json

        if "image" not in data:
            return jsonify({"error": "No image data"}), 400

        image_data = data["image"]
        # decode base64 pic
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Load model
        if produce == "fruit":
            trained_model = fruit_model
        elif produce == "veg":
            trained_model = veg_model
        else:
            return jsonify({"error": "Invalid Produce Type"}), 400

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

        # force memory release
        del img
        del results
        gc.collect()

        return (
            jsonify(
                {
                    "label": label,
                    "category": "Fresh Produce",
                    "confidence": round(best_conf * 100),
                }
            ),
            200,
        )
    except Exception as e:
        # Catch any exception and return a 500 error with the exception message
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    finally:
        gc.collect()


conn = get_db_connection()
cur = conn.cursor()
cur.execute("SELECT clean_ingredients, id FROM recipes;")
ing_list = cur.fetchall()
cur.close()


@app.route("/get_recipes", methods=["GET"])
def get_recipes():
    try:
        ingredients = eval(request.args.get("ings"))
        ing_str = ""

        for ing in ingredients:
            ing_str += ing + " "

        ratio_list = []  # List to store all words and ratios

        # Calculate the ratio for each word in ings and store it in the ratio_list
        for val in ing_list:
            ratio = fuzz.token_set_ratio(ing_str, val[0])
            ratio_list.append((val[1], ratio))

        # Sort the ratio_list by ratios in descending order
        sorted_ratios = sorted(ratio_list, key=lambda x: x[1], reverse=True)

        # Select the top 20 (or any number you prefer) to choose randomly from
        top_n = sorted_ratios[:15]

        # Randomly sample 5 words from the top_n list
        random_top_5 = random.sample(top_n, 5)

        # Extract the first value (id) from each tuple and store them in a list
        selected_ids = [word for word, ratio in random_top_5]

        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the SELECT query with the selected_ids
        query = "SELECT * FROM recipes WHERE id = ANY(%s);"
        cursor.execute(query, (selected_ids,))

        # Fetch all results
        results = cursor.fetchall()

        # Close the cursor and connection
        cursor.close()
        conn.close()

        response = []

        for row in results:
            # Parse the ingredients string into a list
            ingredients_string = row[2]
            try:
                ingredients_list = ast.literal_eval(ingredients_string)
            except (ValueError, SyntaxError):
                # If parsing fails, fall back to the original string
                ingredients_list = ingredients_string

            instructions = row[3].split(".")

            for idx, value in enumerate(instructions):
                value = value.strip()
                value = value.replace("\\n", "")
                instructions[idx] = value

            if isinstance(row[4], memoryview):
                image_data = row[4].tobytes().decode("utf-8")
            else:
                image_data = row[4]

            recipe = {
                "id": row[0],
                "title": row[1],
                "ingredients": ingredients_list,
                "steps": instructions[: len(instructions) - 1],
                "image": image_data,
            }

            response.append(recipe)

        return jsonify(response), 200

    except Exception as e:
        # Catch any exception and return a 500 error with the exception message
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
