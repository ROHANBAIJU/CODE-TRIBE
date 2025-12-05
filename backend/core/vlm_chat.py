"""
SafetyGuard AI - Vision Language Model Chat Interface
The "Brain" of the system - Natural language reasoning about safety

Supports: Groq API (Llama Vision), Ollama (local), Mock (demo)
"""

import os
import base64
import httpx
from typing import Optional, Dict, List
from dataclasses import dataclass
from enum import Enum


class VLMProvider(Enum):
    GROQ = "groq"
    OLLAMA = "ollama"
    MOCK = "mock"


@dataclass
class SafetyAnalysis:
    """Structured safety analysis result"""
    is_safe: bool
    confidence: float
    summary: str
    alerts: List[str]
    recommendations: List[str]
    detected_equipment: List[Dict]
    raw_response: str


class VLMChat:
    """
    Vision-Language Model Chat for Safety Analysis
    Allows natural language queries about safety equipment status
    """
    
    def __init__(self, provider: VLMProvider = VLMProvider.MOCK):
        self.provider = provider
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        
        # System prompt for safety analysis
        self.system_prompt = """You are SafetyGuard AI, an expert industrial safety monitoring agent.
Your role is to analyze images of industrial environments and assess safety equipment status.

You MUST:
1. Identify all safety equipment visible (fire extinguishers, oxygen tanks, helmets, first aid boxes, emergency phones, fire alarms, safety switch panels)
2. Assess if each piece of equipment is:
   - Visible and accessible
   - Potentially obstructed
   - Missing from expected location
3. Provide a clear safety assessment
4. Give actionable recommendations

Respond in a helpful, professional manner. Be specific about locations and issues.
If you detect potential safety hazards, clearly state them with urgency level.

Format your response clearly with:
- SAFETY STATUS: SAFE / WARNING / CRITICAL
- EQUIPMENT FOUND: List of detected items
- ISSUES: Any problems detected
- RECOMMENDATIONS: What actions to take
"""
        
        print(f"🧠 VLM Chat initialized with provider: {provider.value}")
    
    async def analyze_safety(
        self, 
        image_bytes: bytes, 
        query: str,
        detections: Optional[List[Dict]] = None
    ) -> SafetyAnalysis:
        """
        Analyze image for safety with natural language query
        
        Args:
            image_bytes: Raw image bytes
            query: User's natural language question
            detections: Optional YOLO detections to include in context
        
        Returns:
            SafetyAnalysis with structured results
        """
        
        # Build context from detections
        detection_context = ""
        if detections:
            detection_context = "\n\nCurrent AI Detection Results:\n"
            for det in detections:
                label = det.get('label', det.get('class', 'Unknown'))
                conf = det.get('score', det.get('confidence', 0))
                track_age = det.get('track_age', 'N/A')
                detection_context += f"- {label}: {conf:.1%} confidence (tracked for {track_age} frames)\n"
        
        full_query = f"{query}{detection_context}"
        
        if self.provider == VLMProvider.GROQ:
            return await self._query_groq(image_bytes, full_query)
        elif self.provider == VLMProvider.OLLAMA:
            return await self._query_ollama(image_bytes, full_query)
        else:
            return await self._query_mock(image_bytes, full_query, detections)
    
    async def _query_groq(self, image_bytes: bytes, query: str) -> SafetyAnalysis:
        """Query Groq API with Llama Vision"""
        
        if not self.groq_api_key:
            print("⚠️ No Groq API key found, falling back to mock")
            return await self._query_mock(image_bytes, query, None)
        
        # Encode image to base64
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')
        
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.2-90b-vision-preview",
            "messages": [
                {
                    "role": "system",
                    "content": self.system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": query
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1024,
            "temperature": 0.3
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                return self._parse_response(content)
                
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            return await self._query_mock(image_bytes, query, None)
    
    async def _query_ollama(self, image_bytes: bytes, query: str) -> SafetyAnalysis:
        """Query local Ollama with Llava"""
        
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')
        
        payload = {
            "model": "llava",
            "prompt": f"{self.system_prompt}\n\nUser Query: {query}",
            "images": [image_b64],
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                content = result.get("response", "")
                
                return self._parse_response(content)
                
        except Exception as e:
            print(f"❌ Ollama error: {e}")
            return await self._query_mock(image_bytes, query, None)
    
    async def _query_mock(
        self, 
        image_bytes: bytes, 
        query: str,
        detections: Optional[List[Dict]]
    ) -> SafetyAnalysis:
        """
        Mock VLM response for demo purposes
        Generates intelligent responses based on detections
        """
        
        query_lower = query.lower()
        
        # Analyze based on available detections
        equipment_found = []
        alerts = []
        is_safe = True
        
        if detections:
            for det in detections:
                label = det.get('label', det.get('class', 'Unknown'))
                conf = det.get('score', det.get('confidence', 0))
                equipment_found.append({
                    "name": label,
                    "confidence": conf,
                    "status": "visible" if conf > 0.7 else "partially_obstructed"
                })
                
                if conf < 0.45:
                    alerts.append(f"⚠️ {label} has low visibility ({conf:.1%}) - possible obstruction")
                    is_safe = False
                elif conf < 0.7:
                    alerts.append(f"⚡ {label} detected but with reduced confidence ({conf:.1%})")
        
        # Generate contextual response
        if "safe" in query_lower:
            if is_safe:
                summary = "✅ SAFETY STATUS: SAFE\n\nAll monitored safety equipment is visible and accessible. No immediate hazards detected."
            else:
                summary = "⚠️ SAFETY STATUS: WARNING\n\nSome safety equipment has reduced visibility. Physical inspection recommended."
        elif "fire" in query_lower:
            fire_eq = [e for e in equipment_found if "fire" in e["name"].lower() or "extinguisher" in e["name"].lower()]
            if fire_eq:
                summary = f"🔥 FIRE SAFETY CHECK:\n\nFire equipment detected: {len(fire_eq)} item(s)\n"
                for eq in fire_eq:
                    summary += f"- {eq['name']}: {eq['confidence']:.1%} confidence, {eq['status']}\n"
            else:
                summary = "⚠️ FIRE SAFETY CHECK:\n\nNo fire safety equipment detected in current frame. Verify equipment placement."
                is_safe = False
        elif "oxygen" in query_lower:
            oxy_eq = [e for e in equipment_found if "oxygen" in e["name"].lower()]
            if oxy_eq:
                summary = f"💨 OXYGEN SUPPLY CHECK:\n\nOxygen equipment detected: {len(oxy_eq)} item(s)\n"
                for eq in oxy_eq:
                    summary += f"- {eq['name']}: {eq['confidence']:.1%} confidence, {eq['status']}\n"
            else:
                summary = "⚠️ OXYGEN CHECK:\n\nNo oxygen tanks detected in current frame."
        elif "status" in query_lower or "report" in query_lower:
            summary = f"📊 SAFETY STATUS REPORT\n\n"
            summary += f"Equipment Detected: {len(equipment_found)} items\n"
            summary += f"Overall Status: {'SAFE ✅' if is_safe else 'WARNING ⚠️'}\n\n"
            if equipment_found:
                summary += "Equipment List:\n"
                for eq in equipment_found:
                    status_icon = "✅" if eq["confidence"] > 0.7 else "⚠️"
                    summary += f"{status_icon} {eq['name']}: {eq['confidence']:.1%}\n"
        else:
            # Generic response
            summary = f"🔍 ANALYSIS RESULT\n\n"
            summary += f"I detected {len(equipment_found)} safety equipment items in this image.\n\n"
            if equipment_found:
                for eq in equipment_found:
                    summary += f"• {eq['name']}: {eq['confidence']:.1%} confidence\n"
            summary += f"\nOverall safety status: {'SAFE ✅' if is_safe else 'NEEDS ATTENTION ⚠️'}"
        
        recommendations = []
        if not is_safe:
            recommendations.append("Conduct physical inspection of flagged equipment")
            recommendations.append("Verify equipment is not obstructed")
            recommendations.append("Check lighting conditions in the area")
        else:
            recommendations.append("Continue regular monitoring")
            recommendations.append("Maintain current equipment placement")
        
        return SafetyAnalysis(
            is_safe=is_safe,
            confidence=0.85 if detections else 0.5,
            summary=summary,
            alerts=alerts,
            recommendations=recommendations,
            detected_equipment=equipment_found,
            raw_response=summary
        )
    
    def _parse_response(self, content: str) -> SafetyAnalysis:
        """Parse VLM response into structured SafetyAnalysis"""
        
        # Determine safety status from content
        content_lower = content.lower()
        is_safe = "critical" not in content_lower and "danger" not in content_lower and "unsafe" not in content_lower
        
        # Extract alerts (lines with warning indicators)
        alerts = []
        for line in content.split('\n'):
            if any(word in line.lower() for word in ['warning', 'alert', 'issue', 'problem', 'missing', 'obstructed']):
                alerts.append(line.strip())
        
        # Extract recommendations
        recommendations = []
        in_recommendations = False
        for line in content.split('\n'):
            if 'recommendation' in line.lower():
                in_recommendations = True
                continue
            if in_recommendations and line.strip().startswith(('-', '•', '*', '1', '2', '3')):
                recommendations.append(line.strip().lstrip('-•* 0123456789.'))
        
        if not recommendations:
            recommendations = ["Continue monitoring", "Report any changes"]
        
        return SafetyAnalysis(
            is_safe=is_safe,
            confidence=0.9,
            summary=content,
            alerts=alerts,
            recommendations=recommendations,
            detected_equipment=[],
            raw_response=content
        )
    
    async def quick_check(self, detections: List[Dict]) -> str:
        """Quick safety check without image - just analyze detections"""
        
        if not detections:
            return "⚠️ No equipment detected in current frame. Verify camera angle and lighting."
        
        low_conf = [d for d in detections if d.get('score', d.get('confidence', 0)) < 0.45]
        
        if low_conf:
            items = ", ".join([d.get('label', d.get('class', 'Unknown')) for d in low_conf])
            return f"⚠️ WARNING: Low confidence detection for: {items}. Physical inspection recommended."
        
        high_conf = [d for d in detections if d.get('score', d.get('confidence', 0)) > 0.8]
        
        return f"✅ SAFE: {len(detections)} equipment items detected. {len(high_conf)} with high confidence."


# Singleton instance
_vlm_instance: Optional[VLMChat] = None


def get_vlm_chat() -> VLMChat:
    """Get or create VLM chat instance"""
    global _vlm_instance
    
    if _vlm_instance is None:
        # Check for API key to determine provider
        if os.getenv("GROQ_API_KEY"):
            _vlm_instance = VLMChat(VLMProvider.GROQ)
        elif os.getenv("USE_OLLAMA"):
            _vlm_instance = VLMChat(VLMProvider.OLLAMA)
        else:
            _vlm_instance = VLMChat(VLMProvider.MOCK)
    
    return _vlm_instance
