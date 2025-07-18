"""
File processing utilities for the Student AI Toolkit.
Handles extraction of text content from various file formats.
"""

import os
import PyPDF2
import docx
from typing import Optional, Tuple
from config import config

class FileProcessor:
    """Handles file upload and text extraction."""
    
    def __init__(self):
        """Initialize the file processor."""
        self.upload_folder = config.UPLOAD_FOLDER
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def is_allowed_file(self, filename: str) -> bool:
        """Check if the file extension is allowed."""
        if not filename:
            return False
        
        file_ext = os.path.splitext(filename)[1].lower()
        return file_ext in config.ALLOWED_EXTENSIONS
    
    def extract_text_from_pdf(self, file_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Extract text from a PDF file.
        
        Returns:
            Tuple of (success, extracted_text, error_message)
        """
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_content = ""
                
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
                
                if not text_content.strip():
                    return False, None, "No text content found in PDF"
                
                return True, text_content.strip(), None
                
        except Exception as e:
            return False, None, f"Error reading PDF: {str(e)}"
    
    def extract_text_from_docx(self, file_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Extract text from a DOCX file.
        
        Returns:
            Tuple of (success, extracted_text, error_message)
        """
        try:
            doc = docx.Document(file_path)
            text_content = ""
            
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
            
            if not text_content.strip():
                return False, None, "No text content found in DOCX"
            
            return True, text_content.strip(), None
            
        except Exception as e:
            return False, None, f"Error reading DOCX: {str(e)}"
    
    def extract_text_from_txt(self, file_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Extract text from a TXT file.
        
        Returns:
            Tuple of (success, extracted_text, error_message)
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text_content = file.read()
            
            if not text_content.strip():
                return False, None, "No text content found in file"
            
            return True, text_content.strip(), None
            
        except UnicodeDecodeError:
            try:
                # Try with different encoding
                with open(file_path, 'r', encoding='latin-1') as file:
                    text_content = file.read()
                return True, text_content.strip(), None
            except Exception as e:
                return False, None, f"Error reading text file: {str(e)}"
        except Exception as e:
            return False, None, f"Error reading text file: {str(e)}"
    
    def extract_text_from_file(self, file_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Extract text from a file based on its extension.
        
        Returns:
            Tuple of (success, extracted_text, error_message)
        """
        if not os.path.exists(file_path):
            return False, None, "File not found"
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_ext == '.docx':
            return self.extract_text_from_docx(file_path)
        elif file_ext == '.txt':
            return self.extract_text_from_txt(file_path)
        else:
            return False, None, f"Unsupported file type: {file_ext}"
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Save uploaded file content to disk.
        
        Returns:
            Tuple of (success, file_path, error_message)
        """
        try:
            if not self.is_allowed_file(filename):
                return False, None, "File type not allowed"
            
            file_path = os.path.join(self.upload_folder, filename)
            
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            return True, file_path, None
            
        except Exception as e:
            return False, None, f"Error saving file: {str(e)}"

