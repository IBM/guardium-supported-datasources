#!/usr/bin/env python3
"""
Script to download the IBM Granite model to a specific location.
"""

import os
import sys
import logging
import subprocess

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def install_dependencies():
    """
    Install required dependencies if they are not already installed.
    """
    try:
        # Check if huggingface_hub is installed
        try:
            import huggingface_hub
            logger.info("huggingface_hub is already installed.")
        except ImportError:
            logger.info("Installing huggingface_hub...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
            logger.info("huggingface_hub installed successfully.")
        
        # Check if torch is installed
        try:
            import torch
            logger.info("torch is already installed.")
        except ImportError:
            logger.info("Installing torch...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "torch"])
            logger.info("torch installed successfully.")
        
        # Check if transformers is installed
        try:
            import transformers
            logger.info("transformers is already installed.")
        except ImportError:
            logger.info("Installing transformers...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers"])
            logger.info("transformers installed successfully.")
            
    except Exception as e:
        logger.error(f"Error installing dependencies: {str(e)}")
        raise

def download_model(output_dir=None):
    """
    Download the IBM Granite model.
    
    Args:
        output_dir: Directory to save the model
    """
    try:
        # If output_dir is not provided, use the default path
        if output_dir is None:
            # Get the directory of this script
            script_dir = os.path.dirname(os.path.abspath(__file__))
            output_dir = os.path.join(script_dir, "model/granite")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        logger.info(f"Model will be saved to: {output_dir}")
        
        # Install dependencies if needed
        install_dependencies()
        
        # Import huggingface_hub
        from huggingface_hub import snapshot_download
        
        # Full model name on Hugging Face
        model_name = "granite-4.0-micro"
        full_model_name = f"ibm-granite/{model_name}"
        
        logger.info(f"Downloading model {full_model_name} to {output_dir}...")
        
        # Download the model
        model_path = snapshot_download(
            repo_id=full_model_name,
            local_dir=os.path.join(output_dir, model_name),
            local_dir_use_symlinks=False
        )
        
        logger.info(f"Model downloaded successfully to {model_path}")
        return model_path
        
    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        raise RuntimeError(f"Failed to download model: {str(e)}")

if __name__ == "__main__":
    try:
        # Use the default path or a custom path if provided
        output_dir = sys.argv[1] if len(sys.argv) > 1 else None
        
        print("Starting model download process...")
        print("This may take a while depending on your internet connection.")
        print("Please be patient...")
        
        # Download the model
        model_path = download_model(output_dir)
        
        print("\n" + "="*60)
        print(f"Model downloaded successfully to: {model_path}")
        print("="*60)
        
        # Get the directory of this script for relative paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        print("\nYou can now use the model with AskAny.py:")
        print(f"cd {script_dir}")
        print(f"python AskAny.py --model {os.path.relpath(model_path, script_dir)}")
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure you have a stable internet connection")
        print("2. Check that you have sufficient disk space")
        print("3. Try running with administrator/sudo privileges if you encounter permission issues")
        print("4. If the issue persists, try downloading the model manually from https://huggingface.co/ibm/granite-4.0-micro")
        sys.exit(1)
