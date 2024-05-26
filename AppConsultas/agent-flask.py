from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/api/ask', methods=['POST'])
def handle_question():
    data = request.get_json()
    question = data.get('question')
    if not question:
        return jsonify({"error": "Please provide a question"}), 400

    # Call your existing agent logic here
    response = get_agent_response(question)  # This is your logic from agent.py
    return jsonify({"answer": response})

def get_agent_response(question):
    # Logic from agent.py
    APIKEY = os.getenv('OPENAI_API_KEY')

    if not APIKEY:
        return "API key not found. Please set the OPENAI_API_KEY environment variable."

    db_path = os.path.join(os.path.dirname(__file__), 'Chinook.db')
    db = SQLDatabase.from_uri(f"sqlite:///{db_path}")

    dialect = db.dialect
    table_names = db.get_usable_table_names()
    top_k = 1000

    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    system = f"""Eres un agente diseñado para interactuar con una base de datos SQL.
    Dada una pregunta de entrada, crea una consulta {dialect} sintácticamente correcta para ejecutar, luego revisa los resultados de la consulta y devuelve la respuesta.
    A menos que el usuario especifique un número específico de ejemplos que desea obtener, siempre limita tu consulta a un máximo de {top_k} resultados.
    Puedes ordenar los resultados por una columna relevante para devolver los ejemplos más interesantes en la base de datos.
    Tienes acceso a herramientas para interactuar con la base de datos.
    Solo usa las herramientas proporcionadas. Solo usa la información devuelta por las herramientas para construir tu respuesta final.
    DEBES verificar tu consulta antes de ejecutarla. Si obtienes un error al ejecutar una consulta, reescribe la consulta e inténtalo de nuevo.
    NO hagas ninguna declaración DML (INSERT, UPDATE, DELETE, DROP, etc.) en la base de datos.
    Si necesitas filtrar un nombre propio, ¡debes SIEMPRE primero buscar el valor del filtro usando la herramienta "search_proper_nouns"!
    Tienes acceso a las siguientes tablas: {table_names}
    Si la pregunta no parece estar relacionada con la base de datos, simplemente devuelve "No lo sé" como respuesta."""

    agent = create_sql_agent(
        llm=llm,
        db=db,
        verbose=True,
        agent_type="openai-tools",
        top_k=1000,
        system=system
    )

    result = agent.invoke({"input": question})
    return result['output']

if __name__ == '__main__':
    app.run(port=5001)  # Run Flask on port 5001
