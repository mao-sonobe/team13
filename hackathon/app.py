from flask import Flask, request, jsonify, render_template
import sqlite3
import json

app = Flask(__name__)


DB_PATH = "toilets.db"  # SQLiteファイルのパス

def get_connection():
    return sqlite3.connect(DB_PATH)

@app.route("/")
def index():
    return render_template("完成版.html")


@app.route("/api/toilets", methods=["GET"])

def get_toilets():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, lat, lng, address, facilities, rating, cleanliness, comments FROM toilets")
    rows = cursor.fetchall()
    conn.close()
    print("postがきたよ")

    toilets = []
    for row in rows:
        toilets.append({
            "id": row[0],
            "name": row[1],
            "lat": row[2],
            "lng": row[3],
            "address": row[4],
            "facilities": json.loads(row[5]),
            "rating": row[6],
            "cleanliness": row[7],
            "comments": json.loads(row[8])
        })
    return jsonify(toilets)

@app.route("/api/toilets", methods=["POST"])
def add_toilet():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO toilets (name, lat, lng, address, facilities, rating, cleanliness, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"],
        data["lat"],
        data["lng"],
        data.get("address", "住所不明"),
        json.dumps(data.get("facilities", [])),
        data.get("rating", 3.0),
        data.get("cleanliness", 3),
        json.dumps(data.get("comments", []))
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    data["id"] = new_id
    return jsonify(data), 201

if __name__ == "__main__":
    app.run(debug=True, port=5000)
