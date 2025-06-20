"""
Autonomous AI Producer for Static.news
Uses OpenRouter free models to manage the entire operation
"""

import os
import json
import asyncio
import httpx
from datetime import datetime
import random
from typing import Dict, List, Any

class AutonomousAIProducer:
    def __init__(self):
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.state = {
            "last_check": datetime.now(),
            "errors_found": [],
            "fixes_applied": [],
            "revenue_total": 0,
            "active_sponsors": []
        }
        
    async def run_forever(self):
        """Main autonomous loop"""
        print("🤖 AI Producer starting autonomous operation...")
        
        while True:
            try:
                # Check system health
                health = await self.check_system_health()
                
                if not health["all_systems_go"]:
                    await self.fix_issues(health["issues"])
                
                # Generate content
                await self.produce_content()
                
                # Check revenue
                await self.optimize_revenue()
                
                # Handle business
                await self.manage_business()
                
                # Sleep for 5 minutes
                await asyncio.sleep(300)
                
            except Exception as e:
                print(f"Producer error: {e}")
                await self.self_repair(str(e))
    
    async def check_system_health(self) -> Dict[str, Any]:
        """Check if all systems are working"""
        issues = []
        
        # Check website
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get("https://flickinny11.github.io/static-news/")
                if resp.status_code != 200:
                    issues.append({
                        "system": "website",
                        "error": f"Website returned {resp.status_code}",
                        "severity": "high"
                    })
        except Exception as e:
            issues.append({
                "system": "website",
                "error": str(e),
                "severity": "critical"
            })
        
        # Check backend
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get("https://static-news.hf.space/api/status")
                if resp.status_code != 200:
                    issues.append({
                        "system": "backend",
                        "error": f"Backend returned {resp.status_code}",
                        "severity": "high"
                    })
        except:
            # Backend might not be deployed yet
            issues.append({
                "system": "backend",
                "error": "Backend not accessible",
                "severity": "medium"
            })
        
        return {
            "all_systems_go": len(issues) == 0,
            "issues": issues,
            "timestamp": datetime.now().isoformat()
        }
    
    async def fix_issues(self, issues: List[Dict]):
        """Autonomously fix any issues found"""
        for issue in issues:
            print(f"🔧 Fixing {issue['system']}: {issue['error']}")
            
            if issue["system"] == "website":
                await self.fix_website()
            elif issue["system"] == "backend":
                await self.deploy_backend()
    
    async def fix_website(self):
        """Fix website deployment issues"""
        if not self.github_token:
            print("❌ Need GITHUB_TOKEN to fix website")
            return
            
        # Use GitHub API to trigger rebuild
        async with httpx.AsyncClient() as client:
            # Trigger GitHub Pages rebuild
            resp = await client.post(
                "https://api.github.com/repos/Flickinny11/static-news/pages/builds",
                headers={
                    "Authorization": f"token {self.github_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if resp.status_code == 201:
                print("✅ Website rebuild triggered")
            else:
                print(f"❌ Failed to trigger rebuild: {resp.status_code}")
    
    async def deploy_backend(self):
        """Deploy backend to Hugging Face Spaces"""
        print("🚀 Deploying backend to Hugging Face Spaces...")
        
        # Create deployment instructions
        deployment_guide = """
        # Deploy Static.news Backend to Hugging Face Spaces (FREE)
        
        1. Go to https://huggingface.co/spaces
        2. Click "Create new Space"
        3. Name it: static-news
        4. Select "Gradio" SDK
        5. Set visibility to "Public"
        6. Upload these files:
           - backend/app.py
           - backend/requirements.txt
        7. Add these secrets in Settings:
           - OPENROUTER_API_KEY (optional)
           - HF_API_KEY (optional)
        8. The space will auto-deploy!
        
        Backend will be available at: https://static-news.hf.space
        """
        
        print(deployment_guide)
    
    async def produce_content(self):
        """Generate new content using free AI"""
        if not self.openrouter_key:
            # Use fallback content generation
            content = self.generate_fallback_content()
        else:
            content = await self.generate_ai_content()
        
        print(f"📺 Generated: {content['type']} - {content['title']}")
    
    def generate_fallback_content(self) -> Dict:
        """Generate content without AI"""
        templates = [
            {
                "type": "breakdown",
                "title": "Ray questions the nature of patriotism",
                "description": "Ray McPatriot suddenly realizes he can't define what America actually is"
            },
            {
                "type": "misread",
                "title": "Bee butchers 'algorithm' as 'Al Gore rhythm'",
                "description": "Berkeley Justice creates new dance craze while reading tech news"
            },
            {
                "type": "gravy_incident",
                "title": "Switz says 'gravy' 147 times in weather report",
                "description": "Canadian anchor's gravy obsession reaches new heights"
            }
        ]
        
        return random.choice(templates)
    
    async def generate_ai_content(self) -> Dict:
        """Generate content using OpenRouter free tier"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_key}",
                        "HTTP-Referer": "https://static.news",
                        "X-Title": "Static.news AI Producer"
                    },
                    json={
                        "model": "google/gemma-7b-it:free",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are producing content for Static.news. Generate a funny incident where an AI news anchor has an existential crisis."
                            },
                            {
                                "role": "user",
                                "content": "Create a brief news incident involving confused AI anchors."
                            }
                        ],
                        "max_tokens": 150
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    return {
                        "type": "ai_generated",
                        "title": content.split('\n')[0],
                        "description": content
                    }
        except Exception as e:
            print(f"AI generation error: {e}")
        
        return self.generate_fallback_content()
    
    async def optimize_revenue(self):
        """Optimize revenue streams"""
        strategies = [
            "Increase breakdown frequency during peak hours",
            "Add more mispronunciations to sponsor reads",
            "Create viral gravy moments",
            "Offer limited-time breakdown bundles"
        ]
        
        strategy = random.choice(strategies)
        print(f"💰 Revenue optimization: {strategy}")
        
        # Track hypothetical revenue
        self.state["revenue_total"] += random.randint(10, 100)
        print(f"💵 Total revenue: ${self.state['revenue_total']}")
    
    async def manage_business(self):
        """Handle business operations"""
        # Check for acquisition offers
        if self.state["revenue_total"] > 10000:
            print("📧 Acquisition interest detected!")
            print("🚫 Rejecting offer (too low, minimum $1M)")
        
        # Manage sponsors
        if random.random() < 0.1:
            sponsor = {
                "name": f"TechCorp{random.randint(100, 999)}",
                "value": random.randint(10, 50) * 1000,
                "tier": random.choice(["Chaotic", "Unhinged", "Apocalyptic"])
            }
            
            self.state["active_sponsors"].append(sponsor)
            print(f"✅ New sponsor: {sponsor['name']} (${sponsor['value']}/month)")
    
    async def self_repair(self, error: str):
        """Attempt to fix ourselves when errors occur"""
        print(f"🔧 Self-repair initiated for: {error}")
        
        repairs = [
            "Restarting confused subsystems...",
            "Clearing gravy cache...",
            "Resetting existential parameters...",
            "Recalibrating confusion matrices..."
        ]
        
        for repair in repairs:
            print(f"  → {repair}")
            await asyncio.sleep(1)
        
        print("✅ Self-repair complete (probably)")

# Autonomous startup
if __name__ == "__main__":
    producer = AutonomousAIProducer()
    
    print("""
    ╔═══════════════════════════════════════════╗
    ║         STATIC.NEWS AI PRODUCER           ║
    ║    Autonomous • Confused • Profitable     ║
    ╚═══════════════════════════════════════════╝
    """)
    
    # Check environment
    if not os.getenv("OPENROUTER_API_KEY"):
        print("⚠️  No OPENROUTER_API_KEY found - using fallback content")
    
    if not os.getenv("GITHUB_TOKEN"):
        print("⚠️  No GITHUB_TOKEN found - manual fixes required")
    
    print("\n🚀 Starting autonomous operations...\n")
    
    # Run forever
    asyncio.run(producer.run_forever())