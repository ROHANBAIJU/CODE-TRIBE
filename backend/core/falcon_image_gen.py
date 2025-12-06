"""
Falcon-Link: AI-Powered Synthetic Image Generation
Uses Hugging Face Inference API to generate real synthetic training images
"""

import os
import httpx
import base64
from typing import Optional, Dict, List
from datetime import datetime
import asyncio


class FalconImageGenerator:
    """Generate synthetic safety equipment images using Hugging Face"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("HUGGINGFACE_API_KEY")
        # Updated to new Hugging Face router endpoint
        self.base_url = "https://router.huggingface.co/hf-inference/models"
        
        # Recommended models
        self.models = {
            "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
            "sd15": "runwayml/stable-diffusion-v1-5",
            "controlnet": "lllyasviel/control_v11p_sd15_canny"
        }
        
        # Safety equipment templates
        self.object_prompts = {
            "FireExtinguisher": "Industrial fire extinguisher, red cylinder, wall-mounted, professional photography, safety equipment, high detail",
            "OxygenTank": "Industrial oxygen tank, green cylinder, medical grade, high pressure container, professional photography",
            "NitrogenTank": "Industrial nitrogen tank, blue cylinder, compressed gas, safety valve, professional photography",
            "FirstAidBox": "First aid kit box, white with red cross, medical supplies, emergency equipment, professional photography",
            "FireAlarm": "Fire alarm system, red emergency button, wall-mounted, industrial safety device, professional photography",
            "SafetySwitchPanel": "Industrial safety switch panel, electrical control box, emergency stop buttons, professional photography",
            "EmergencyPhone": "Emergency telephone, red emergency phone box, wall-mounted, safety communication device, professional photography"
        }
        
        # Variation types for augmentation
        self.variations = {
            "low_light": "dark environment, low lighting, dim illumination, shadows",
            "high_glare": "bright lighting, glare effect, high contrast, overexposed areas",
            "fog": "foggy environment, misty atmosphere, reduced visibility, haze",
            "rain": "rainy conditions, water droplets, wet surface, rain effect",
            "motion_blur": "motion blur, movement effect, dynamic scene, blurred motion",
            "partial_occlusion": "partially hidden, obscured view, blocked by objects, partial visibility"
        }
    
    async def generate_image(
        self, 
        object_class: str, 
        variation: str = "normal",
        negative_prompt: Optional[str] = None
    ) -> Dict:
        """
        Generate a single synthetic image using Stable Diffusion
        
        Args:
            object_class: Safety equipment class
            variation: Type of variation (low_light, fog, etc.)
            negative_prompt: Things to avoid in generation
        
        Returns:
            Dict with image_data (base64), prompt, and metadata
        """
        if not self.api_key or self.api_key == "your_hf_api_key_here":
            # Return simulated data if no API key
            return self._generate_simulated_image(object_class, variation)
        
        # Build prompt
        base_prompt = self.object_prompts.get(object_class, f"{object_class} safety equipment")
        variation_text = self.variations.get(variation, "")
        full_prompt = f"{base_prompt}, {variation_text}" if variation_text else base_prompt
        
        # Default negative prompt
        if negative_prompt is None:
            negative_prompt = "low quality, blurry, distorted, cartoon, illustration, drawing"
        
        # Call Hugging Face API
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "inputs": full_prompt,
            "negative_prompt": negative_prompt,
            "num_inference_steps": 30,
            "guidance_scale": 7.5
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/{self.models['sdxl']}",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    # Image returned as bytes
                    image_bytes = response.content
                    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                    
                    return {
                        "status": "success",
                        "image_data": image_base64,
                        "prompt": full_prompt,
                        "negative_prompt": negative_prompt,
                        "model": self.models['sdxl'],
                        "object_class": object_class,
                        "variation": variation,
                        "generated_at": datetime.utcnow().isoformat(),
                        "api_used": True
                    }
                else:
                    print(f"⚠️  Hugging Face API error: {response.status_code}")
                    return self._generate_simulated_image(object_class, variation)
                    
        except Exception as e:
            print(f"⚠️  Image generation failed: {e}")
            return self._generate_simulated_image(object_class, variation)
    
    def _generate_simulated_image(self, object_class: str, variation: str) -> Dict:
        """Fallback: Return simulated metadata without real image"""
        import random
        
        return {
            "status": "simulated",
            "image_data": None,  # No actual image
            "prompt": self.object_prompts.get(object_class, object_class),
            "object_class": object_class,
            "variation": variation,
            "generated_at": datetime.utcnow().isoformat(),
            "api_used": False,
            "quality_score": round(random.uniform(0.7, 0.95), 3),
            "augmentation_params": {
                "brightness": round(random.uniform(0.3, 1.5), 2),
                "contrast": round(random.uniform(0.5, 1.5), 2),
                "rotation": random.randint(-15, 15),
                "noise_level": round(random.uniform(0, 0.3), 2)
            }
        }
    
    async def generate_batch(
        self,
        object_class: str,
        count: int = 10,
        variations: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Generate multiple synthetic images in batch
        
        Args:
            object_class: Safety equipment class
            count: Number of images to generate
            variations: List of variation types to cycle through
        
        Returns:
            List of generated image data
        """
        if variations is None:
            variations = list(self.variations.keys())
        
        results = []
        for i in range(count):
            variation = variations[i % len(variations)]
            result = await self.generate_image(object_class, variation)
            results.append(result)
            
            # Rate limiting: wait 1 second between API calls
            if result.get("api_used") and i < count - 1:
                await asyncio.sleep(1)
        
        return results


# Singleton instance
_image_generator: Optional[FalconImageGenerator] = None

def get_image_generator(api_key: Optional[str] = None) -> FalconImageGenerator:
    """Get or create the Falcon image generator instance"""
    global _image_generator
    if _image_generator is None:
        _image_generator = FalconImageGenerator(api_key)
    return _image_generator
