# Test script to verify AstroOps Falcon-Link trigger
# Run: python test_falcon_trigger.py

import requests
import os

API_URL = "http://localhost:8000"

def test_falcon_trigger():
    """
    Test the Falcon-Link trigger mechanism
    
    The trigger fires when detection confidence is between 0.25 and 0.45
    This represents "ambiguous" detections that could benefit from retraining
    """
    print("=" * 60)
    print("🦅 FALCON-LINK TRIGGER TEST")
    print("=" * 60)
    
    # Check if test images exist
    test_images_dir = "../datasets/TESTING DATASET/images"
    
    if not os.path.exists(test_images_dir):
        print(f"⚠️  Test images directory not found: {test_images_dir}")
        print("   Using health check instead...")
        
        # Just check health
        response = requests.get(f"{API_URL}/system/health")
        print(f"\n📊 System Health: {response.json()}")
        return
    
    # Find a test image
    images = [f for f in os.listdir(test_images_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
    
    if not images:
        print("⚠️  No test images found")
        return
    
    test_image = os.path.join(test_images_dir, images[0])
    print(f"\n📷 Testing with: {test_image}")
    
    # Send to API
    with open(test_image, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{API_URL}/detect/fusion", files=files)
    
    result = response.json()
    
    print(f"\n📊 Results:")
    print(f"   Latency: {result.get('latency_ms', 'N/A')}ms")
    print(f"   Objects Detected: {result.get('count', 0)}")
    print(f"   🦅 FALCON TRIGGERED: {result.get('falcon_trigger', False)}")
    
    # Show detections
    if result.get('detections'):
        print(f"\n📦 Detections:")
        for det in result['detections']:
            score = det.get('score', 0)
            label = det.get('label', 'Unknown')
            
            # Check if this would trigger Falcon
            trigger_status = "🦅 TRIGGER" if 0.25 < score < 0.45 else ""
            
            print(f"   - {label}: {score:.2%} {trigger_status}")
    
    print("\n" + "=" * 60)
    print("TRIGGER CRITERIA:")
    print("  - Confidence > 25% (not garbage)")
    print("  - Confidence < 45% (ambiguous)")
    print("  - This 'gray zone' triggers self-healing")
    print("=" * 60)

if __name__ == "__main__":
    test_falcon_trigger()
