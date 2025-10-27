from pathlib import Path
import os
script_path = Path(__file__).resolve()
script_dir = script_path.parent
project_root = os.path.dirname(os.path.dirname(script_dir)) 
CONFIDENCE_SCORE=0.62
GRANITE_MODEL=f"{project_root}/src/chatbot/model/granite/granite-4.0-micro"
CUSTOM_MODEL=f"{project_root}/src/chatbot/model/custom"
VECTOR_MODEL=f"{project_root}/src/chatbot/model/custom"
TRAIN_FILE=f"{project_root}/src/chatbot/TrainDataSet.json"
DOC_DIR="doc"