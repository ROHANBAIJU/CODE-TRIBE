"""
Falcon-Link: Image Extraction Utility
Extracts synthetic images from MongoDB and saves them as files
"""

import os
import pymongo
import base64
from typing import Optional

def extract_synthetic_images(
    extract_dir: str = '/tmp/synthetic_images_extracted',
    mongo_uri: str = 'mongodb://localhost:27017/',
    db_name: str = 'safetyguard_db',
    limit: int = 10
) -> int:
    """
    Extract synthetic images from MongoDB to file system
    
    Args:
        extract_dir: Directory to save extracted images
        mongo_uri: MongoDB connection URI
        db_name: Database name
        limit: Maximum number of images to extract
        
    Returns:
        Number of images extracted
    """
    
    # Create extraction directory
    os.makedirs(extract_dir, exist_ok=True)
    
    # Connect to MongoDB
    client = pymongo.MongoClient(mongo_uri)
    db = client[db_name]
    collection = db['synthetic_images']
    
    print(f'🗂️  EXTRACTING IMAGES TO: {extract_dir}')
    print('=' * 50)
    
    # Get recent API-generated images
    images = collection.find({'api_generated': True}).sort('generated_at', -1).limit(limit)
    
    extracted_count = 0
    for img in images:
        if 'image_data' in img and img['image_data']:
            try:
                base64_data = img['image_data']
                image_bytes = base64.b64decode(base64_data)
                
                # Generate filename
                filename = f'{img["object_class"]}_{img["variation"]}_{img["_id"]}.jpg'
                filepath = os.path.join(extract_dir, filename)
                
                # Save to file system
                with open(filepath, 'wb') as f:
                    f.write(image_bytes)
                
                extracted_count += 1
                print(f'✅ {extracted_count}. {filename} ({len(image_bytes)//1024}KB)')
                
            except Exception as e:
                print(f'❌ Error extracting {img.get("object_class", "unknown")}: {e}')
    
    print(f'\n📁 {extracted_count} images extracted to: {extract_dir}')
    return extracted_count

if __name__ == "__main__":
    # Extract images when script is run directly
    count = extract_synthetic_images(limit=20)
    print(f'🎉 Extraction complete: {count} images saved!')
