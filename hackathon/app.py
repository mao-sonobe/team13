from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# フロントエンドからのAPIリクエストを許可
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- SQLAlchemy設定 ---
# プロジェクトのルートディレクトリを取得
basedir = os.path.abspath(os.path.dirname(__file__))
# データベースのURIを設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'toilets.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- トイレ情報モデルクラス ---
class Toilet(db.Model):
    __tablename__ = 'toilets'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(200))
    facilities = db.Column(db.Text)
    rating = db.Column(db.Float)
    cleanliness = db.Column(db.Integer)
    comments = db.Column(db.Text)

    def to_dict(self):
        """オブジェクトを辞書形式に変換"""
        return {
            "id": self.id,
            "name": self.name,
            "lat": self.lat,
            "lng": self.lng,
            "address": self.address,
            "facilities": json.loads(self.facilities) if self.facilities else [],
            "rating": self.rating,
            "cleanliness": self.cleanliness,
            "comments": json.loads(self.comments) if self.comments else []
        }

# --- アプリケーションコンテキスト内でデータベースを作成 ---
with app.app_context():
    db.create_all()

# --- ルート定義 ---
@app.route("/")
def index():
    """メインのHTMLページをレンダリング"""
    return render_template("完成版.html")

@app.route("/api/toilets", methods=["GET"])
def get_toilets():
    """DBからすべてのトイレ情報を取得してJSONで返す"""
    try:
        toilets = Toilet.query.all()
        return jsonify([toilet.to_dict() for toilet in toilets])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/toilets", methods=["POST"])
def add_toilet():
    """新しいトイレ情報をDBに追加する"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # 必須項目のチェック
    if "name" not in data or "lat" not in data or "lng" not in data:
        return jsonify({"error": "Missing required fields: name, lat, lng"}), 400

    new_toilet = Toilet(
        name=data["name"],
        lat=data["lat"],
        lng=data["lng"],
        address=data.get("address", "住所不明"),
        facilities=json.dumps(data.get("facilities", [])),
        rating=data.get("rating", 3.0),
        cleanliness=data.get("cleanliness", 3),
        comments=json.dumps(data.get("comments", []))
    )
    
    try:
        db.session.add(new_toilet)
        db.session.commit()
        return jsonify(new_toilet.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)