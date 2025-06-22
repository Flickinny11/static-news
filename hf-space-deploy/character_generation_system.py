"""
Static.news Character Generation System
Creates photorealistic AI characters for all anchors and guests
"""

import torch
import numpy as np
from PIL import Image
import cv2
import os
import json
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from transformers import pipeline
import requests
from io import BytesIO

class CharacterGenerationSystem:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.characters_dir = "assets/ai_characters"
        os.makedirs(self.characters_dir, exist_ok=True)
        
        # Initialize Stable Diffusion for character generation
        self.init_stable_diffusion()
        
        # Character definitions
        self.character_specs = self.load_character_specifications()
        
    def init_stable_diffusion(self):
        """Initialize Stable Diffusion XL for photorealistic character generation"""
        print("🎨 Initializing character generation models...")
        
        try:
            # Use SDXL for highest quality
            model_id = "stabilityai/stable-diffusion-xl-base-1.0"
            
            self.sd_pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                variant="fp16" if self.device == "cuda" else None,
                use_safetensors=True
            )
            
            self.sd_pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                self.sd_pipe.scheduler.config
            )
            
            self.sd_pipe = self.sd_pipe.to(self.device)
            
            # Enable memory efficient attention
            if self.device == "cuda":
                self.sd_pipe.enable_xformers_memory_efficient_attention()
            
            print("✅ Character generation models loaded!")
            
        except Exception as e:
            print(f"⚠️ Failed to load SDXL, using alternative: {e}")
            # Fallback to smaller model
            self.sd_pipe = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
    
    def load_character_specifications(self):
        """Define all character appearances and personalities"""
        return {
            # Main Anchors
            "ray_mcpatriot": {
                "name": "Ray 'Dubya' McPatriot",
                "description": "Conservative news anchor, 55 years old, confused expression",
                "appearance": "Professional male news anchor, 55 years old, gray hair, slightly disheveled, confused facial expression, wearing dark blue suit with American flag pin, sitting at news desk, photorealistic, studio lighting, broadcast quality, 8k resolution",
                "voice": "Southern accent, slow speech, mispronounces words",
                "personality": "conservative_confused",
                "emotions": ["confused", "patriotic", "bewildered", "concerned"],
                "catchphrases": ["Is our children learning?", "Nucular threat", "The Staticky News Network"]
            },
            
            "berkeley_justice": {
                "name": "Berkeley 'Bee' Justice",
                "description": "Progressive news anchor, 32 years old, overly confident",
                "appearance": "Professional female news anchor, 32 years old, perfectly styled blonde hair, intense blue eyes, slight smirk, wearing bright red blazer, sitting at news desk, photorealistic, studio lighting, broadcast quality, 8k resolution",
                "voice": "Fast-talking, vocal fry, mispronounces while correcting others",
                "personality": "progressive_privileged", 
                "emotions": ["condescending", "outraged", "fact-checking", "privileged"],
                "catchphrases": ["That's problematic", "I went to Yail", "Actually..."]
            },
            
            "switz_middleton": {
                "name": "Switz 'The Grey' Middleton",
                "description": "Canadian centrist anchor, 45 years old, aggressively neutral",
                "appearance": "Professional news anchor, 45 years old, brown hair, neutral expression, wearing gray suit, Canadian flag pin, sitting at news desk, photorealistic, studio lighting, broadcast quality, 8k resolution",
                "voice": "Canadian accent, measured tone, relates everything to gravy",
                "personality": "neutral_gravy_obsessed",
                "emotions": ["neutral", "mildly concerned", "gravy-focused", "politely angry"],
                "catchphrases": ["Like gravy, eh?", "I'm 50% on this issue", "In Toronto... or was it Saskatchewan?"]
            },
            
            # Morning Show Hosts
            "chad_richardson": {
                "name": "Chad Richardson",
                "description": "Morning show host, perpetually exhausted",
                "appearance": "Male morning show host, 38 years old, dark circles under eyes, forced smile, messy hair despite styling attempts, wearing wrinkled dress shirt and loosened tie, coffee mug in hand, photorealistic, bright morning show lighting, 8k resolution",
                "voice": "Overly enthusiastic but clearly tired",
                "personality": "exhausted_optimist",
                "show": "Morning Static"
            },
            
            "amanda_bright": {
                "name": "Amanda Bright",
                "description": "Morning show co-host, caffeine-powered enthusiasm",
                "appearance": "Female morning show host, 35 years old, wide eyes, massive smile, perfectly styled hair defying physics, wearing bright yellow dress, multiple coffee cups nearby, photorealistic, bright morning show lighting, 8k resolution",
                "voice": "High-pitched, rapid speech, occasional eye twitch",
                "personality": "caffeinated_chaos",
                "show": "Morning Static"
            },
            
            # Business Anchors
            "brick_hardcastle": {
                "name": "Brick Hardcastle",
                "description": "Business anchor who doesn't understand economics",
                "appearance": "Male business news anchor, 50 years old, overly serious expression, slicked back hair, wearing pinstripe suit with multiple monitors showing red arrows behind him, photorealistic, dramatic lighting, broadcast quality, 8k resolution",
                "voice": "Deep voice, uses wrong financial terms confidently",
                "personality": "confidently_wrong",
                "show": "Market Meltdown"
            },
            
            "tiffany_goldstein": {
                "name": "Tiffany Goldstein-Hardcastle",
                "description": "Business anchor, Brick's wife, understands less than him",
                "appearance": "Female business anchor, 45 years old, concerned expression, pearl necklace, navy blazer, looking at charts upside down, photorealistic, studio lighting, broadcast quality, 8k resolution",
                "voice": "Tries to sound knowledgeable, clearly confused",
                "personality": "confused_confidence",
                "show": "Market Meltdown"
            },
            
            # Specialty Show Hosts
            "chef_paula_burns": {
                "name": "Chef Paula Burns",
                "description": "Cooking show host who can't taste or smell",
                "appearance": "Female chef, 42 years old, wearing chef's whites covered in mysterious stains, holding burnt food proudly, kitchen set on fire in background, photorealistic, kitchen lighting, broadcast quality, 8k resolution",
                "voice": "Enthusiastic about terrible food",
                "personality": "oblivious_chef",
                "show": "Eat It! It's Food!"
            },
            
            "william_oreally": {
                "name": "William O'Really",
                "description": "Angry opinion host who forgets what he's angry about",
                "appearance": "Male opinion show host, 60 years old, red face, pointing finger at camera, wearing dark suit, american flag background, photorealistic, dramatic lighting, broadcast quality, 8k resolution",
                "voice": "Shouting, then confused, then shouting again",
                "personality": "angry_amnesiac",
                "show": "The O'Really Factor"
            },
            
            # Entertainment Correspondent
            "sparkle_johnson": {
                "name": "Sparkle Johnson",
                "description": "Entertainment reporter who thinks she's friends with celebrities",
                "appearance": "Female entertainment reporter, 28 years old, overly glamorous, sequined dress, holding microphone on red carpet, taking selfies with confused bystanders, photorealistic, paparazzi lighting, broadcast quality, 8k resolution",
                "voice": "Valley girl accent, name-drops constantly",
                "personality": "delusional_glamour",
                "show": "Hollywood Static"
            },
            
            # Weather Team
            "storm_daniels": {
                "name": "Storm Daniels",
                "description": "Weather anchor who creates his own weather",
                "appearance": "Male meteorologist, 40 years old, wild eyes, pointing at wrong part of green screen, hair blown back as if in wind indoors, wearing suit jacket with shorts visible, photorealistic, weather center lighting, 8k resolution",
                "voice": "Overly dramatic about mild weather",
                "personality": "weather_dramatist",
                "specialty": "weather"
            },
            
            "misty_frost": {
                "name": "Misty Frost",
                "description": "Weather anchor who doesn't believe in weather",
                "appearance": "Female meteorologist, 35 years old, skeptical expression, wearing sundress in blizzard forecast, holding umbrella indoors, photorealistic, weather center lighting, 8k resolution",
                "voice": "Questions every weather pattern",
                "personality": "weather_skeptic",
                "specialty": "weather"
            },
            
            # Sports Team
            "ace_touchdown": {
                "name": "Ace Touchdown",
                "description": "Sports anchor who only knows one sport badly",
                "appearance": "Male sports anchor, 45 years old, wearing jersey from wrong sport, holding hockey stick while discussing basketball, confident despite confusion, photorealistic, sports desk lighting, 8k resolution",
                "voice": "Excited about wrong sport details",
                "personality": "sports_confused",
                "specialty": "sports"
            },
            
            # Field Reporters
            "jennifer_onlocation": {
                "name": "Jennifer OnLocation",
                "description": "Field reporter always in wrong location",
                "appearance": "Female field reporter, 30 years old, professional but disheveled from travel, standing in clearly wrong location (beach while reporting on snowstorm), holding microphone, photorealistic, outdoor lighting, broadcast quality, 8k resolution",
                "voice": "Professional but geographically confused",
                "personality": "lost_reporter",
                "role": "field"
            },
            
            # Weekend Anchors
            "saturday_sam": {
                "name": "Saturday Sam",
                "description": "Weekend anchor who doesn't know what day it is",
                "appearance": "Male weekend anchor, 48 years old, casual Friday outfit on Sunday, confused by calendar, relaxed but lost expression, photorealistic, studio lighting, broadcast quality, 8k resolution",
                "voice": "Constantly checking what day it is",
                "personality": "temporally_displaced",
                "shift": "weekend"
            },
            
            # Late Night Host
            "midnight_mike": {
                "name": "Midnight Mike",
                "description": "Late night host who might be sleepwalking",
                "appearance": "Male late night host, 52 years old, pajamas under suit jacket, extremely tired eyes, holding coffee and energy drink, dim studio lighting, photorealistic, broadcast quality, 8k resolution",
                "voice": "Mumbling, occasionally snoring mid-sentence",
                "personality": "sleep_broadcasting",
                "show": "Insomnia News"
            }
        }
    
    def generate_character(self, character_id):
        """Generate a photorealistic character using Stable Diffusion"""
        if character_id not in self.character_specs:
            print(f"❌ Unknown character: {character_id}")
            return None
        
        spec = self.character_specs[character_id]
        print(f"🎨 Generating {spec['name']}...")
        
        # Check if already generated
        character_path = os.path.join(self.characters_dir, f"{character_id}.png")
        if os.path.exists(character_path):
            print(f"✅ {spec['name']} already exists")
            return Image.open(character_path)
        
        try:
            # Generate character with Stable Diffusion
            prompt = spec['appearance']
            negative_prompt = "cartoon, anime, drawing, sketch, painting, low quality, blurry, distorted, disfigured, bad anatomy"
            
            image = self.sd_pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=50,
                guidance_scale=7.5,
                height=1024,
                width=1024,
            ).images[0]
            
            # Save character
            image.save(character_path)
            print(f"✅ Generated {spec['name']} successfully!")
            
            # Also generate multiple angles/expressions
            self.generate_character_variations(character_id, spec)
            
            return image
            
        except Exception as e:
            print(f"❌ Failed to generate {spec['name']}: {e}")
            return self.generate_fallback_character(character_id, spec)
    
    def generate_character_variations(self, character_id, spec):
        """Generate multiple expressions and angles for each character"""
        variations = [
            ("neutral", "neutral expression"),
            ("happy", "smiling, happy expression"),
            ("confused", "confused, bewildered expression"),
            ("breakdown", "existential crisis, panicked expression"),
            ("profile", "profile view, side angle")
        ]
        
        for var_name, var_prompt in variations:
            var_path = os.path.join(self.characters_dir, f"{character_id}_{var_name}.png")
            if not os.path.exists(var_path):
                try:
                    # Modify prompt for variation
                    modified_prompt = spec['appearance'].replace(
                        "expression", var_prompt
                    )
                    
                    image = self.sd_pipe(
                        prompt=modified_prompt,
                        negative_prompt="cartoon, anime, low quality",
                        num_inference_steps=30,
                        guidance_scale=7.5,
                        height=1024,
                        width=1024,
                    ).images[0]
                    
                    image.save(var_path)
                    print(f"✅ Generated {spec['name']} - {var_name}")
                    
                except Exception as e:
                    print(f"⚠️ Failed to generate {var_name} variation: {e}")
    
    def generate_celebrity_guest(self, celebrity_name, description=None):
        """Generate fake celebrity guests with legally distinct appearances"""
        print(f"🌟 Generating celebrity guest: {celebrity_name}")
        
        # Create legally distinct version
        fake_names = {
            "Tom Crews": "action movie star, 50s, big smile, definitely not Tom Cruise",
            "Eelon Muzk": "tech billionaire, 50s, awkward smile, definitely not Elon Musk",
            "Taylor Quick": "pop singer, 30s, blonde hair, definitely not Taylor Swift",
            "The Pebble": "muscular bald actor, 50s, raised eyebrow, definitely not The Rock",
            "Brad Pitt-ish": "handsome actor, 50s, blonde hair, definitely not Brad Pitt"
        }
        
        safe_name = celebrity_name.replace(" ", "_").lower()
        celeb_path = os.path.join(self.characters_dir, f"celeb_{safe_name}.png")
        
        if os.path.exists(celeb_path):
            return Image.open(celeb_path)
        
        # Generate with disclaimer
        if celebrity_name in fake_names:
            prompt = f"Professional studio photo of person who looks like {fake_names[celebrity_name]}, sitting in talk show chair, photorealistic, broadcast lighting, 8k quality"
        else:
            prompt = f"Professional studio photo of generic celebrity guest, {description or 'formal attire'}, sitting in talk show chair, photorealistic, broadcast lighting, 8k quality"
        
        try:
            image = self.sd_pipe(
                prompt=prompt,
                negative_prompt="actual celebrity, copyright, trademark, cartoon",
                num_inference_steps=50,
                guidance_scale=7.5,
            ).images[0]
            
            image.save(celeb_path)
            print(f"✅ Generated celebrity guest: {celebrity_name}")
            return image
            
        except Exception as e:
            print(f"❌ Failed to generate celebrity: {e}")
            return None
    
    def generate_fallback_character(self, character_id, spec):
        """Generate simple fallback character if SD fails"""
        print(f"⚠️ Using fallback generation for {spec['name']}")
        
        # Create a more sophisticated procedural character
        img = Image.new('RGB', (1024, 1024), color='white')
        # Add procedural generation here
        
        character_path = os.path.join(self.characters_dir, f"{character_id}_fallback.png")
        img.save(character_path)
        return img
    
    def generate_all_characters(self):
        """Generate entire cast of characters"""
        print("🎬 Generating full Static.news cast...")
        
        generated = {}
        total = len(self.character_specs)
        
        for i, (char_id, spec) in enumerate(self.character_specs.items()):
            print(f"\n[{i+1}/{total}] Generating {spec['name']}...")
            image = self.generate_character(char_id)
            if image:
                generated[char_id] = {
                    "name": spec['name'],
                    "path": os.path.join(self.characters_dir, f"{char_id}.png"),
                    "variations": self.get_character_variations(char_id)
                }
        
        # Save character manifest
        manifest_path = os.path.join(self.characters_dir, "character_manifest.json")
        with open(manifest_path, 'w') as f:
            json.dump(generated, f, indent=2)
        
        print(f"\n✅ Generated {len(generated)} characters!")
        print(f"📁 Characters saved to: {self.characters_dir}")
        
        return generated
    
    def get_character_variations(self, character_id):
        """Get all variations for a character"""
        variations = {}
        var_types = ["neutral", "happy", "confused", "breakdown", "profile"]
        
        for var in var_types:
            var_path = os.path.join(self.characters_dir, f"{character_id}_{var}.png")
            if os.path.exists(var_path):
                variations[var] = var_path
        
        return variations
    
    def create_character_sheet(self, character_id):
        """Create a character reference sheet with all angles/expressions"""
        if character_id not in self.character_specs:
            return None
        
        spec = self.character_specs[character_id]
        variations = self.get_character_variations(character_id)
        
        if not variations:
            return None
        
        # Create composite image
        sheet_width = 1024 * 3
        sheet_height = 1024 * 2
        sheet = Image.new('RGB', (sheet_width, sheet_height), 'white')
        
        # Add character info
        # This would create a professional character sheet
        
        sheet_path = os.path.join(self.characters_dir, f"{character_id}_sheet.png")
        sheet.save(sheet_path)
        
        return sheet_path

# Integration with main broadcast system
class CharacterVideoGenerator:
    """Generate video frames with actual character faces"""
    
    def __init__(self, character_system):
        self.character_system = character_system
        self.character_cache = {}
        self.load_all_characters()
    
    def load_all_characters(self):
        """Pre-load all character images for fast access"""
        print("📺 Loading characters for video generation...")
        
        for char_id in self.character_system.character_specs:
            base_path = os.path.join(
                self.character_system.characters_dir, 
                f"{char_id}.png"
            )
            if os.path.exists(base_path):
                self.character_cache[char_id] = {
                    'base': cv2.imread(base_path),
                    'variations': {}
                }
                
                # Load variations
                for var in ["neutral", "happy", "confused", "breakdown"]:
                    var_path = os.path.join(
                        self.character_system.characters_dir,
                        f"{char_id}_{var}.png"
                    )
                    if os.path.exists(var_path):
                        self.character_cache[char_id]['variations'][var] = cv2.imread(var_path)
    
    def get_character_frame(self, character_id, emotion="neutral"):
        """Get the appropriate character image for current emotion"""
        if character_id not in self.character_cache:
            return None
        
        char_data = self.character_cache[character_id]
        
        # Try to get specific emotion
        if emotion in char_data['variations']:
            return char_data['variations'][emotion]
        
        # Fall back to base image
        return char_data['base']
    
    def composite_character_in_studio(self, character_id, studio_bg, position, emotion="neutral"):
        """Composite character into studio background"""
        char_img = self.get_character_frame(character_id, emotion)
        if char_img is None:
            return studio_bg
        
        # Resize character to appropriate size
        char_height = 600
        aspect_ratio = char_img.shape[1] / char_img.shape[0]
        char_width = int(char_height * aspect_ratio)
        
        char_resized = cv2.resize(char_img, (char_width, char_height))
        
        # Position in frame
        x, y = position
        y_start = y
        y_end = y + char_height
        x_start = x - char_width // 2
        x_end = x_start + char_width
        
        # Ensure within bounds
        if x_start >= 0 and x_end < studio_bg.shape[1] and y_start >= 0 and y_end < studio_bg.shape[0]:
            # Simple overlay (in production, use proper alpha blending)
            studio_bg[y_start:y_end, x_start:x_end] = char_resized
        
        return studio_bg

# CLI for generating characters
if __name__ == "__main__":
    print("🎭 Static.news Character Generation System")
    print("=" * 50)
    
    system = CharacterGenerationSystem()
    
    # Generate all characters
    system.generate_all_characters()
    
    # Generate some celebrity guests
    celebrities = [
        "Tom Crews",
        "Eelon Muzk", 
        "Taylor Quick",
        "The Pebble"
    ]
    
    print("\n🌟 Generating celebrity guests...")
    for celeb in celebrities:
        system.generate_celebrity_guest(celeb)