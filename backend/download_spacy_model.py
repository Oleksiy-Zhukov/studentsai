#!/usr/bin/env python3
"""
Script to download required models for the hybrid AI service.
"""

import subprocess
import sys
import os

def download_spacy_model():
    """Download the required spaCy model."""
    try:
        print("Downloading spaCy model: en_core_web_sm")
        subprocess.run([
            sys.executable, "-m", "spacy", "download", "en_core_web_sm"
        ], check=True)
        print("✅ spaCy model downloaded successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to download spaCy model: {e}")
        return False
    except FileNotFoundError:
        print("❌ spaCy not found. Please install spaCy first: pip install spacy")
        return False

def test_model_loading():
    """Test if the model can be loaded successfully."""
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        test_text = "Apple Inc. is headquartered in Cupertino, California."
        doc = nlp(test_text)
        entities = [ent.text for ent in doc.ents]
        print(f"✅ Model test successful. Found entities: {entities}")
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def main():
    """Main function to download and test all required models."""
    print("🚀 Setting up models for hybrid AI service...")
    
    success = True
    
    # Download spaCy model
    if not download_spacy_model():
        success = False
    
    # Test model loading
    if success and not test_model_loading():
        success = False
    
    if success:
        print("✅ All models downloaded and tested successfully!")
        print("🎉 Hybrid AI service is ready to use!")
    else:
        print("❌ Some models failed to download or test. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 