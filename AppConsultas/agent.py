import os
import sys
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings




APIKEY = os.getenv('OPENAI_API_KEY')
if not APIKEY:
    sys.exit("API key not found. Please set the OPENAI_API_KEY environment variable.")

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
dialect = db.dialect
table_names = db.get_usable_table_names()
top_k = 1000

question = input("What is you question: ")

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)



system = """You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results.
You can order the results by a relevant column to return the most interesting examples in the database.
You have access to tools for interacting with the database.
Only use the given tools. Only use the information returned by the tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If you need to filter on a proper noun, you must ALWAYS first look up the filter value using the "search_proper_nouns" tool! 

You have access to the following tables: {table_names}

If the question does not seem related to the database, just return "I don't know" as the answer."""




agent = create_sql_agent(
    llm=llm,
    db=db,
    verbose=True,
    agent_type="openai-tools",
    top_k=1000,
    system=system
)

agent.invoke({"input": question})