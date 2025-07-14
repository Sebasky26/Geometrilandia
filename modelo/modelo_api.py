from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

# Cargar modelo y encoders
modelo = joblib.load("modelo_random_forest.pkl")
label_encoders = joblib.load("label_encoders.pkl")

# Inicializar Flask
app = Flask(__name__)
CORS(app)  # Para permitir peticiones desde Node.js

@app.route("/predecir", methods=["POST"])
def predecir():
    try:
        datos = request.json
        df = pd.DataFrame([datos])

        # Normalizar a mayúscula inicial para que coincida con lo entrenado
        df["modo_usado_ultima_sesion"] = df["modo_usado_ultima_sesion"].str.capitalize()

        # Codificar el campo categórico
        df["modo_usado_ultima_sesion"] = label_encoders["modo_usado_ultima_sesion"].transform(
            df["modo_usado_ultima_sesion"]
        )

        # Predecir
        pred = modelo.predict(df)[0]
        modo = label_encoders["modo_actual_sugerido"].inverse_transform([pred])[0]

        return jsonify({"success": True, "modo_sugerido": modo})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
