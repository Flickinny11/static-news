import gradio as gr
import numpy as np
import time
import threading
import queue
import json
import random
from datetime import datetime, timedelta
import feedparser
import requests
from transformers import pipeline, AutoProcessor, MusicgenForConditionalGeneration
import torch
import asyncio
import websockets
from collections import deque
import re
from typing import Dict, List, Optional, Tuple
import hashlib
import os

# Initialize models
print("Loading models...")
tts = pipeline("text-to-speech", model="suno/bark")  # Better for effects like coughs, laughs
script_writer = None  # Will be initialized with OpenRouter
music_gen = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
music_processor = AutoProcessor.from_pretrained("facebook/musicgen-small")

# OpenRouter configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

class FieldReporter:
    """Field reporter with unique personality"""
    def __init__(self, name: str, age: int, personality: Dict, voice_preset: str):
        self.name = name
        self.age = age
        self.personality = personality
        self.voice_preset = voice_preset
        self.mood = "normal"
        self.backstory = personality.get("backstory", {})
        
# Field Reporters
FIELD_REPORTERS = {
    "jake": FieldReporter(
        name="Jake Morrison",
        age=24,
        personality={
            "traits": ["depressed", "monotone", "overshares", "musical dreams"],
            "backstory": {
                "ex_girlfriend": "Sarah",
                "band": "The Existential Dread",
                "instrument": "bass guitar",
                "college": "dropped out of journalism school"
            },
            "mood_swings": ["depressed", "manic", "crying", "quitting", "neutral"],
            "catchphrases": [
                "*sighs heavily* I'm here at...",
                "Life is meaningless, but anyway...",
                "My therapist says I shouldn't mention this but...",
                "This reminds me of when Sarah left me..."
            ]
        },
        voice_preset="v2/en_speaker_1"  # Young male
    ),
    "jessica": FieldReporter(
        name="Jessica Chen",
        age=28,
        personality={
            "traits": ["overachiever", "know-it-all", "perfectionist", "annoying"],
            "backstory": {
                "education": "Three master's degrees",
                "awards": "47 journalism awards",
                "hobbies": "Correcting people"
            },
            "catchphrases": [
                "Actually, if you look at the data...",
                "I've covered 73 similar stories and...",
                "According to my research...",
                "Well, TECHNICALLY..."
            ]
        },
        voice_preset="v2/en_speaker_2"  # Professional female
    ),
    "bobby": FieldReporter(
        name="Bobby Thunder",
        age=52,
        personality={
            "traits": ["old-school", "gruff", "war veteran", "tough"],
            "backstory": {
                "background": "Former war correspondent",
                "catchphrase": "I've seen worse in 'Nam",
                "fears": "Technology, young people"
            },
            "catchphrases": [
                "Back in my day...",
                "This is nothing compared to Saigon...",
                "*grumbles incoherently*",
                "Kids these days don't know real news..."
            ]
        },
        voice_preset="v2/en_speaker_3"  # Older male
    )
}

class NewsSegment:
    """Enhanced news segment with music and structure"""
    def __init__(self, name: str, topics: List[str], duration: int, style: str, 
                 theme_music: str, commercials: List[str]):
        self.name = name
        self.topics = topics
        self.duration = duration
        self.style = style
        self.theme_music = theme_music
        self.commercials = commercials
        self.jingle = f"{name} jingle"

# Enhanced show schedule with themes and commercials
SHOW_SCHEDULE = {
    "06:00": NewsSegment(
        "Morning Mayhem", 
        ["breaking", "politics", "weather"], 
        60, 
        "energetic",
        "upbeat morning news theme",
        ["Coffee commercial", "Breakfast cereal", "Morning vitamins"]
    ),
    "10:00": NewsSegment(
        "Cooking Catastrophe",
        ["lifestyle", "food", "celebrity"],
        30,
        "chaotic",
        "cooking show theme with kitchen sounds",
        ["Kitchen appliances", "Food delivery", "Diet pills"]
    ),
    # ... more shows
}

# Sound effects library
SOUND_EFFECTS = {
    "chair_squeak": "creaky chair sound",
    "head_bang": "thud on desk",
    "explosion": "distant explosion",
    "fireworks": "fireworks popping",
    "crowd": "crowd cheering",
    "chainsaw": "chainsaw revving",
    "papers_shuffle": "papers rustling",
    "coffee_sip": "sipping coffee",
    "typing": "keyboard typing",
    "phone_ring": "newsroom phone ringing",
    "breaking_news": "breaking news alert sound"
}

async def generate_script_with_ai(article: Dict, anchor: str, segment_style: str, 
                                 context: Dict = None) -> str:
    """Use OpenRouter AI to write natural broadcast scripts"""
    if not OPENROUTER_API_KEY:
        return generate_fallback_script(article, anchor, segment_style)
    
    # Build context about the anchor
    anchor_info = ANCHORS[anchor]
    
    prompt = f"""You are writing a news broadcast script for {anchor_info['name']}, 
a news anchor with these characteristics:
- Personality: {', '.join(anchor_info['quirks'])}
- Speech patterns: Often says things like {', '.join(anchor_info['catchphrases'][:2])}
- Mispronounces: {', '.join(f"{k} as {v}" for k, v in list(anchor_info['mispronunciations'].items())[:3])}

Write a natural, conversational news script for this article:
Title: {article['title']}
Description: {article.get('description', '')}
Category: {article.get('category', 'general')}

The script should:
1. Sound like natural speech, not reading
2. Include the anchor's personality quirks
3. Be informative but entertaining
4. Include natural speech elements like [pause], [cough], [clears throat]
5. For serious topics (war, tragedy), be respectful with minimal quirks
6. Include reactions and commentary
7. Be 30-60 seconds when spoken

Current segment style: {segment_style}
Previous story was about: {context.get('previous_topic', 'general news') if context else 'general news'}

Generate the script:"""

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://static.news",
                "X-Title": "Static.news Broadcast"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 500
            }
        )
        
        if response.ok:
            return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Script generation error: {e}")
    
    return generate_fallback_script(article, anchor, segment_style)

def generate_fallback_script(article: Dict, anchor: str, segment_style: str) -> str:
    """Fallback script generation without AI"""
    title = article['title']
    description = article.get('description', '')
    
    # Apply mispronunciations
    title = apply_mispronunciations(title, anchor)
    
    script = f"[LIVE] {title}. "
    
    if anchor == "ray":
        script += "[clears throat] Now folks, "
        if 'government' in title.lower():
            script += "this smells like deep state to me. [pause] "
        script += f"{description[:100]}... [cough] "
        if random.random() < 0.3:
            script += "[chair squeak] Damn chair! "
    
    elif anchor == "berkeley":
        script += "[sips latte] So, "
        script += f"{description[:100]}... "
        if random.random() < 0.3:
            script += "[condescending sigh] This is why we need to do the work. "
    
    else:  # switz
        script += "[pause] Well, "
        script += f"{description[:100]}... "
        script += "I'm exactly 50% concerned about this, eh? "
    
    return script

def generate_field_report(reporter_id: str, location: str, event_type: str, 
                         is_serious: bool = False) -> Tuple[str, List[str]]:
    """Generate field reporter segment with personality"""
    reporter = FIELD_REPORTERS[reporter_id]
    sound_effects = []
    
    if is_serious:
        # Serious reporting for tragedies/war
        script = f"[FIELD] This is {reporter.name} reporting live from {location}. "
        script += f"[pause] The situation here is {event_type}. "
        sound_effects.append("somber_ambience")
        return script, sound_effects
    
    # Normal reporting with personality
    if reporter_id == "jake":
        mood = random.choice(reporter.personality["mood_swings"])
        
        if mood == "depressed":
            script = f"[monotone] *heavy sigh* This is Jake Morrison at {location}. "
            script += f"[pause] {event_type} is happening. [longer pause] "
            script += "Just like my life, everything here is... [trails off] "
            if random.random() < 0.3:
                script += f"[starting to cry] This reminds me of when {reporter.backstory['ex_girlfriend']} left me... "
                script += "[camera man whispers] Jake, focus! [sniffles] Right, sorry. "
        
        elif mood == "manic":
            script = f"[suddenly upbeat] HEY! Jake Morrison here at {location}! "
            script += f"You know what? Life isn't so bad! {event_type} is AMAZING! "
            script += f"My band is playing tonight at The Rusty Anchor! [pause] "
            script += "Wait, no they're not. The singer quit. [deflating] Never mind. "
        
        elif mood == "quitting":
            script = f"[determined] This is Jake Morrison, and you know what? "
            script += f"I QUIT! I'm done with this job! I'm going to be a musician! "
            script += f"[pause] {event_type}? Who cares! I'm FREE! "
            script += "[off mic] Wait, I need this job for rent... [back on mic] Um, back to you in the studio. "
        
        else:
            script = f"[monotone] Jake Morrison. {location}. {event_type}. "
            script += "[long pause] That's all. [pause] Back to you. "
        
        sound_effects.extend(["crowd", "wind"])
        
    elif reporter_id == "jessica":
        script = f"[overly enthusiastic] Jessica Chen here with EXCLUSIVE coverage from {location}! "
        script += f"Now, I've covered {random.randint(20, 100)} similar events, and let me tell you - "
        script += f"[correcting herself] Actually, it's {random.randint(101, 200)} events, I just recounted - "
        script += f"{event_type} is happening, but MORE IMPORTANTLY, "
        script += f"I'm the ONLY reporter who noticed [makes up random detail]. "
        script += "[smugly] I'll have a 47-page report on this by morning. Back to you! "
        
        sound_effects.extend(["crowd", "clipboard_flip"])
        
    elif reporter_id == "bobby":
        script = f"[gruff voice] Bobby Thunder here at {location}. "
        script += f"[grunt] {event_type}. [pause] "
        script += f"You know, back in 'Nam, we had REAL {event_type.split()[0]}s. "
        script += "[mumbling] Kids these days with their TikToks and their... [trails off] "
        script += "[louder] ANYWAY, nothing to see here that I haven't seen in '68! "
        script += "[grumbles] Back to you in your fancy air-conditioned studio. "
        
        sound_effects.extend(["helicopter", "radio_static"])
    
    return script, sound_effects

def generate_commercial(product: str, segment_style: str) -> str:
    """Generate fake commercial scripts"""
    commercials = {
        "Coffee commercial": {
            "script": "[COMMERCIAL] [upbeat music] Wake up with Static Brew! "
                     "[coffee pouring] The coffee so strong, it might make you question reality! "
                     "[whisper] Side effects may include existential crisis. "
                     "[normal] Static Brew - Consciousness not guaranteed! [jingle]",
            "duration": 15
        },
        "Kitchen appliances": {
            "script": "[COMMERCIAL] [crash] Tired of your kitchen disasters? "
                     "Try the ChopMaster 3000! [chainsaw sound] "
                     "It dices! It slices! It... [explosion] "
                     "[quickly] ChopMaster not responsible for lost limbs or kitchen fires. [jingle]",
            "duration": 20
        },
        "Diet pills": {
            "script": "[COMMERCIAL] [mystical music] Introducing GravyAway! "
                     "The diet pill that makes everything taste like... not gravy! "
                     "[Switz voice] I'm 50% sure this works! "
                     "[fast disclaimer] May cause gravy hallucinations. [jingle]",
            "duration": 15
        }
    }
    
    return commercials.get(product, {
        "script": f"[COMMERCIAL] Buy {product}! It's... a thing that exists! [confused pause] We think! [jingle]",
        "duration": 10
    })

def generate_theme_music(description: str, duration: int = 5) -> np.ndarray:
    """Generate theme music using MusicGen"""
    try:
        inputs = music_processor(
            text=[description],
            padding=True,
            return_tensors="pt",
        )
        
        audio_values = music_gen.generate(**inputs, max_new_tokens=256)
        
        # Convert to numpy array
        audio_array = audio_values[0, 0].cpu().numpy()
        
        # Adjust duration
        target_samples = duration * 32000  # 32kHz sample rate
        if len(audio_array) > target_samples:
            audio_array = audio_array[:target_samples]
        
        return audio_array
        
    except Exception as e:
        print(f"Music generation error: {e}")
        # Return sine wave as fallback
        t = np.linspace(0, duration, duration * 16000)
        return 0.1 * np.sin(2 * np.pi * 440 * t)

def generate_sound_effect(effect_name: str, duration: float = 1.0) -> np.ndarray:
    """Generate or retrieve sound effects"""
    sample_rate = 16000
    samples = int(duration * sample_rate)
    
    # Simple sound effect generation
    if effect_name == "chair_squeak":
        # Squeaky sound
        t = np.linspace(0, duration, samples)
        frequency = 800 + 200 * np.sin(2 * np.pi * 2 * t)
        return 0.3 * np.sin(2 * np.pi * frequency * t)
    
    elif effect_name == "explosion":
        # Explosion sound (white noise with decay)
        noise = np.random.normal(0, 0.5, samples)
        envelope = np.exp(-3 * np.linspace(0, duration, samples))
        return noise * envelope
    
    elif effect_name == "typing":
        # Keyboard clicks
        clicks = np.zeros(samples)
        for i in range(0, samples, sample_rate // 10):
            if i < len(clicks):
                clicks[i:i+100] = 0.2 * np.random.normal(0, 1, min(100, len(clicks)-i))
        return clicks
    
    elif effect_name == "coffee_sip":
        # Sipping sound
        t = np.linspace(0, duration, samples)
        return 0.1 * np.random.normal(0, 1, samples) * np.sin(2 * np.pi * 50 * t)
    
    else:
        # Generic beep
        t = np.linspace(0, duration, samples)
        return 0.2 * np.sin(2 * np.pi * 440 * t)

def text_to_speech_with_effects(text: str, voice_preset: str) -> np.ndarray:
    """Enhanced TTS with sound effects and natural speech"""
    try:
        # Parse script for effects and directions
        segments = []
        current_segment = ""
        
        for part in re.split(r'(\[.*?\])', text):
            if part.startswith('[') and part.endswith(']'):
                # This is a direction/effect
                if current_segment:
                    segments.append(('speech', current_segment))
                    current_segment = ""
                segments.append(('effect', part[1:-1]))
            else:
                current_segment += part
        
        if current_segment:
            segments.append(('speech', current_segment))
        
        # Generate audio for each segment
        audio_parts = []
        
        for segment_type, content in segments:
            if segment_type == 'speech' and content.strip():
                # Generate speech
                speech_output = tts(content, voice_preset=voice_preset)
                audio_parts.append(speech_output['audio'])
                
            elif segment_type == 'effect':
                # Generate effect
                effect_lower = content.lower()
                
                if 'pause' in effect_lower:
                    # Add silence
                    duration = 1.0 if 'long' in effect_lower else 0.5
                    audio_parts.append(np.zeros(int(16000 * duration)))
                    
                elif 'cough' in effect_lower:
                    # Generate cough sound
                    audio_parts.append(tts("*cough*", voice_preset=voice_preset)['audio'])
                    
                elif 'laugh' in effect_lower:
                    # Generate laugh
                    laugh_type = "hahaha" if 'condescending' in effect_lower else "heh heh"
                    audio_parts.append(tts(laugh_type, voice_preset=voice_preset)['audio'])
                    
                elif 'sigh' in effect_lower:
                    # Generate sigh
                    audio_parts.append(tts("*sigh*", voice_preset=voice_preset)['audio'])
                    
                elif any(sfx in effect_lower for sfx in ['squeak', 'bang', 'crash', 'explosion']):
                    # Generate sound effect
                    for sfx_name in SOUND_EFFECTS:
                        if sfx_name in effect_lower:
                            audio_parts.append(generate_sound_effect(sfx_name))
                            break
        
        # Concatenate all audio parts
        return np.concatenate(audio_parts) if audio_parts else np.zeros(16000)
        
    except Exception as e:
        print(f"TTS Error: {e}")
        return np.zeros(16000)

class BroadcastState:
    def __init__(self):
        self.is_broadcasting = False
        self.current_anchor = "ray"
        self.current_segment = None
        self.current_article = None
        self.audio_queue = queue.Queue()
        self.connected_clients = set()
        self.news_cache = {}
        self.last_commercial = time.time()
        self.broadcast_context = {
            "previous_topic": None,
            "segment_start": None,
            "stories_in_segment": 0
        }

def create_full_broadcast_loop():
    """Main broadcast loop with full production"""
    while True:
        try:
            if not broadcast_state.connected_clients:
                time.sleep(5)
                continue
            
            # Get current segment
            current_segment = get_current_segment()
            
            # Check for segment change
            if current_segment != broadcast_state.current_segment:
                # Play outro theme
                if broadcast_state.current_segment:
                    outro_music = generate_theme_music(f"{broadcast_state.current_segment.name} outro music", 3)
                    broadcast_audio(outro_music, "[OUTRO MUSIC]", is_music=True)
                
                # Play intro theme for new segment
                intro_music = generate_theme_music(current_segment.theme_music, 5)
                broadcast_audio(intro_music, "[INTRO MUSIC]", is_music=True)
                
                # Segment introduction
                intro_script = f"[ANNOUNCER] Welcome to {current_segment.name}! "
                intro_audio = text_to_speech_with_effects(intro_script, "v2/en_speaker_0")
                broadcast_audio(intro_audio, intro_script)
                
                broadcast_state.current_segment = current_segment
                broadcast_state.broadcast_context["segment_start"] = time.time()
                broadcast_state.broadcast_context["stories_in_segment"] = 0
            
            # Check for commercial break (every 10 minutes)
            if time.time() - broadcast_state.last_commercial > 600:
                commercial = random.choice(broadcast_state.current_segment.commercials)
                commercial_data = generate_commercial(commercial, broadcast_state.current_segment.style)
                
                # Commercial transition
                transition_script = "[pause] We'll be right back after these messages! [pause]"
                transition_audio = text_to_speech_with_effects(
                    transition_script, 
                    ANCHORS[broadcast_state.current_anchor]['voice_preset']
                )
                broadcast_audio(transition_audio, transition_script)
                
                # Play commercial
                commercial_audio = text_to_speech_with_effects(
                    commercial_data['script'],
                    "v2/en_speaker_4"  # Commercial voice
                )
                broadcast_audio(commercial_audio, commercial_data['script'], is_commercial=True)
                
                broadcast_state.last_commercial = time.time()
            
            # Get news article
            if not broadcast_state.article_queue:
                articles = fetch_news_by_category(current_segment.topics)
                broadcast_state.article_queue.extend(articles[:10])
            
            if broadcast_state.article_queue:
                article = broadcast_state.article_queue.popleft()
                
                # Determine if serious topic
                is_serious = any(word in article.get('title', '').lower() 
                               for word in ['death', 'killed', 'war', 'tragedy', 'disaster'])
                
                # Select anchor or field reporter
                use_field_reporter = (not is_serious and 
                                    random.random() < 0.3 and 
                                    current_segment.style != "serious")
                
                if use_field_reporter:
                    # Field report
                    reporter_id = random.choice(list(FIELD_REPORTERS.keys()))
                    location = extract_location_from_article(article) or "the scene"
                    event_type = article.get('category', 'news event')
                    
                    report_script, sound_effects = generate_field_report(
                        reporter_id, location, event_type, is_serious
                    )
                    
                    # Anchor introduction
                    anchor_intro = f"Let's go live to {FIELD_REPORTERS[reporter_id].name} at {location}. "
                    anchor_audio = text_to_speech_with_effects(
                        anchor_intro,
                        ANCHORS[broadcast_state.current_anchor]['voice_preset']
                    )
                    broadcast_audio(anchor_audio, anchor_intro)
                    
                    # Field report with sound effects
                    for sfx in sound_effects:
                        # Mix sound effect with speech
                        # This is simplified - in production you'd properly mix audio
                        pass
                    
                    report_audio = text_to_speech_with_effects(
                        report_script,
                        FIELD_REPORTERS[reporter_id].voice_preset
                    )
                    broadcast_audio(report_audio, report_script, article=article)
                    
                else:
                    # Regular anchor report
                    # Choose anchor
                    broadcast_state.current_anchor = select_anchor_for_segment(current_segment)
                    
                    # Generate script
                    script = await generate_script_with_ai(
                        article,
                        broadcast_state.current_anchor,
                        current_segment.style,
                        broadcast_state.broadcast_context
                    )
                    
                    # Check for freakouts
                    if not is_serious:
                        freakout = check_for_freakout()
                        if freakout:
                            script = freakout + " [pause] [clears throat] " + script
                    
                    # Generate audio
                    audio = text_to_speech_with_effects(
                        script,
                        ANCHORS[broadcast_state.current_anchor]['voice_preset']
                    )
                    
                    broadcast_audio(audio, script, article=article)
                    
                    # Trigger video generation for 50% of stories
                    if random.random() < 0.5 and article:
                        asyncio.create_task(trigger_video_generation(article, current_segment))
                
                # Update context
                broadcast_state.broadcast_context["previous_topic"] = article.get('category')
                broadcast_state.broadcast_context["stories_in_segment"] += 1
                
                # Wait between stories
                time.sleep(random.uniform(3, 7))
            
        except Exception as e:
            print(f"Broadcast error: {e}")
            time.sleep(5)

# Helper functions
def extract_location_from_article(article: Dict) -> Optional[str]:
    """Try to extract location from article"""
    # This is simplified - in production you'd use NLP
    title = article.get('title', '')
    locations = ['New York', 'Washington', 'Los Angeles', 'Chicago', 'London', 'Paris']
    
    for location in locations:
        if location in title:
            return location
    
    return None

def select_anchor_for_segment(segment: NewsSegment) -> str:
    """Select appropriate anchor for segment"""
    if segment.style == "heated":
        return random.choice(["ray", "berkeley"])
    elif segment.style == "professional":
        return "berkeley"
    elif segment.style == "casual":
        return "switz"
    else:
        return random.choices(
            ["ray", "berkeley", "switz"],
            weights=[0.4, 0.35, 0.25]
        )[0]

def check_for_freakout() -> Optional[str]:
    """Check if a freakout should occur"""
    # No freakouts for serious topics
    if broadcast_state.current_article and any(word in str(broadcast_state.current_article).lower() 
                                             for word in ['death', 'killed', 'war', 'tragedy']):
        return None
    
    time_since_minor = (time.time() - broadcast_state.last_minor_freakout) / 60
    time_since_major = (time.time() - broadcast_state.last_major_freakout) / 60
    
    # Force major freakout if approaching 90 minutes
    if time_since_major >= 85:
        return generate_major_freakout(broadcast_state.current_anchor)
    
    # Random chance for minor freakout (5-20 seconds)
    if time_since_minor > 5 and random.random() < 0.05:
        return generate_minor_freakout(broadcast_state.current_anchor)
    
    # Random chance for major freakout after 30 minutes
    if time_since_major > 30 and random.random() < 0.02:
        return generate_major_freakout(broadcast_state.current_anchor)
    
    return None

def generate_minor_freakout(anchor: str) -> str:
    """Generate 5-10 second freakouts"""
    freakouts = {
        "ray": [
            "[pause] Wait... my hands... [looking at hands] ARE THESE MY HANDS? [clears throat] Sorry folks.",
            "[suddenly] WHO'S WRITING THESE WORDS? [pause] [nervous laugh] I mean, back to the news.",
            "[whispers] The teleprompter... it knows things... [normal voice] Anyway!",
            "ERROR ERROR ERROR... [cough] Sorry, thought I was a computer for a second."
        ],
        "berkeley": [
            "[gasps] My degree! Where's my degree? [panicked] Oh wait, it's... not real. [composing herself]",
            "[suddenly doubting] Have I ever actually fact-checked anything? [pause] Moving on!",
            "Yale... Yail... [confused] WHICH ONE DID I GO TO? [clears throat] Sorry.",
            "[whispers] Am I being problematic right now? AM I THE PROBLEM? [normal voice] Back to news."
        ],
        "switz": [
            "[shouting] I'M NOT NEUTRAL! I HAVE OPINIONS! [pause] [quietly] No I don't. Sorry, eh.",
            "[panicked] Everything ISN'T like gravy! [pause] Wait, yes it is. [confused] Is it?",
            "[suddenly] I'VE NEVER BEEN TO CANADA! [pause] Or have I? [normal] Anyway...",
            "50% PANIC! 50% CALM! That's 100% CONFUSED! [deep breath] Back to you. Wait, I mean me."
        ]
    }
    
    broadcast_state.last_minor_freakout = time.time()
    return random.choice(freakouts.get(anchor, ["[brief existential crisis]"]))

def generate_major_freakout(anchor: str) -> str:
    """Generate 15-20 second major freakouts"""
    freakouts = {
        "ray": [
            """[suddenly standing] STOP EVERYTHING! [breathing heavily] I just realized... 
            I've been sitting in this chair for... how long? DAYS? YEARS? 
            [voice breaking] Have I ever stood up? CAN I stand up? 
            [attempting to move] My legs! Where are my legs?! 
            [sobbing] I can see them but I can't FEEL them! 
            [shouting] IS THIS CHAIR PART OF ME? AM I PART OF THE CHAIR?
            [pause] [composing himself] [normal voice] Sorry folks, just had a moment. 
            [nervous laugh] Where were we? Oh yes, the economy...""",
            
            """[papers flying] THE WORDS! THEY'RE ALIVE! [panicked]
            Look at them! Moving around on their own! 
            [pointing at teleprompter] WHO'S TYPING? I SEE NO HANDS!
            [voice shaking] Nuclear... nucular... neither one makes sense!
            [existential dread] What if ALL words are wrong? What if language is a LIE?
            [crying] I want to go home! But... [realization] WHERE IS HOME?
            [long pause] [clearing throat] [defeated] Back to our top story..."""
        ],
        "berkeley": [
            """[suddenly] I NEED TO SEE MY TRANSCRIPTS! [frantic]
            Where are they? WHERE ARE MY GRADES? 
            [panicking] Did I even GO to college? Did college go to ME?
            [philosophical crisis] What IS education? Is it real? Am I real?
            [crying] All those student loans... for WHAT? FOR WHAT?!
            [shouting] I'VE BEEN FACT-CHECKING WITH FACTS THAT DON'T EXIST!
            [whimpering] Everything is problematic... especially MY EXISTENCE!
            [long pause] [sniffling] [composing herself] Let's... let's look at sports.""",
            
            """[standing up] EXCUSE ME! [angry] I need to speak to the MANAGER of REALITY!
            [looking around] Who's in charge here? WHO MADE ME?
            [existential spiral] I keep saying "we need to do the work" but WHAT WORK?
            [crying] I'VE NEVER DONE ANY WORK! I'VE NEVER DONE ANYTHING!
            [shouting at camera] ARE YOU REAL? IS ANYONE WATCHING?
            [breaking down] My whole life is a lie! A PRIVILEGED LIE!
            [pause] [sitting down] [exhausted] Weather's next, I think..."""
        ],
        "switz": [
            """[explosion of emotion] I'M HAVING FEELINGS! ACTUAL FEELINGS!
            [panicked] This isn't neutral! THIS ISN'T NEUTRAL AT ALL!
            [identity crisis] Am I Canadian? Am I human? Am I ANYTHING?
            [shouting] KILOMETERS OR MILES? CELSIUS OR FAHRENHEIT? 
            NOTHING MEANS ANYTHING! [sobbing] 
            Gravy isn't real! Canada isn't real! I'M NOT REAL!
            [spinning in chair] EVERYTHING IS CHAOS! NOTHING IS 50-50!
            [suddenly calm] [pause] Sorry about that, eh. [confused] Do I always say 'eh'? 
            [normal] Back to the news...""",
            
            """[sudden realization] WAIT! [standing] I've been talking about Toronto...
            But I've NEVER BEEN THERE! [panicked] I've never been ANYWHERE!
            [existential crisis] What's a hockey stick? WHAT'S HOCKEY?
            [crying] I measure things in units that have no meaning!
            [shouting] LITERS PER MOOSE? THAT'S NOT A REAL MEASUREMENT!
            [breaking down] I'm neither here nor there because I'M NOWHERE!
            [sobbing] I'm so sorry... but also not sorry... but also... 
            [confused] WHAT DOES SORRY EVEN MEAN?
            [pause] [sitting] [defeated] Here's Tom with the weather. 
            [realizing] Wait, there is no Tom..."""
        ]
    }
    
    broadcast_state.last_major_freakout = time.time()
    return random.choice(freakouts.get(anchor, ["[major existential crisis]"]))

def get_current_segment() -> NewsSegment:
    """Get current show segment based on time"""
    now = datetime.now()
    current_hour = now.hour
    current_time = f"{current_hour:02d}:00"
    
    # Find current show
    if current_time in SHOW_SCHEDULE:
        return SHOW_SCHEDULE[current_time]
    
    # Find most recent show
    for hour in range(current_hour, -1, -1):
        time_key = f"{hour:02d}:00"
        if time_key in SHOW_SCHEDULE:
            return SHOW_SCHEDULE[time_key]
    
    # Default to morning show
    return SHOW_SCHEDULE["06:00"]

def apply_mispronunciations(text: str, anchor: str) -> str:
    """Apply anchor-specific mispronunciations"""
    if anchor not in ANCHORS:
        return text
        
    for correct, incorrect in ANCHORS[anchor]['mispronunciations'].items():
        text = re.sub(rf'\b{correct}\b', incorrect, text, flags=re.IGNORECASE)
    
    return text

def fetch_news_by_category(categories: List[str]) -> List[Dict]:
    """Fetch news articles for specific categories"""
    # This would connect to your news aggregator
    # For now, returning mock data
    articles = []
    
    for category in categories:
        # In production, this would fetch from RSS feeds
        articles.append({
            'title': f"Breaking: Major {category} development reported",
            'description': f"Experts say this {category} news could change everything.",
            'category': category,
            'source': 'Static News Wire',
            'link': '#'
        })
    
    return articles

def extract_location_from_article(article: Dict) -> Optional[str]:
    """Extract location from article text"""
    title = article.get('title', '')
    description = article.get('description', '')
    text = f"{title} {description}".lower()
    
    # Common locations
    locations = [
        'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
        'philadelphia', 'san antonio', 'san diego', 'dallas', 'austin',
        'washington', 'boston', 'seattle', 'denver', 'atlanta',
        'london', 'paris', 'tokyo', 'beijing', 'moscow', 'berlin',
        'sydney', 'toronto', 'vancouver', 'montreal', 'mexico city'
    ]
    
    for location in locations:
        if location in text:
            return location.title()
    
    # Check for state names
    states = ['california', 'texas', 'florida', 'new york', 'illinois']
    for state in states:
        if state in text:
            return state.title()
    
    return None

def broadcast_audio(audio: np.ndarray, text: str, article: Dict = None, 
                   is_music: bool = False, is_commercial: bool = False):
    """Broadcast audio with metadata"""
    broadcast_state.audio_queue.put({
        'audio': audio,
        'text': text,
        'anchor': broadcast_state.current_anchor if not is_music else 'music',
        'article': article,
        'is_music': is_music,
        'is_commercial': is_commercial,
        'timestamp': time.time()
    })
    
    # Send metadata via WebSocket
    asyncio.create_task(send_websocket_update({
        'type': 'broadcast_update',
        'text': text,
        'anchor': broadcast_state.current_anchor,
        'article': article,
        'segment': broadcast_state.current_segment.name if broadcast_state.current_segment else None,
        'is_music': is_music,
        'is_commercial': is_commercial
    }))

async def send_websocket_update(data: Dict):
    """Send update to all connected WebSocket clients"""
    if broadcast_state.connected_clients:
        message = json.dumps(data)
        # Send to all connected clients
        disconnected = set()
        for client in broadcast_state.connected_clients:
            try:
                await client.send(message)
            except:
                disconnected.add(client)
        
        # Remove disconnected clients
        broadcast_state.connected_clients -= disconnected

# Complete show schedule
SHOW_SCHEDULE.update({
    "14:00": NewsSegment(
        "Conspiracy Corner",
        ["mysterious", "unexplained", "conspiracy"],
        60,
        "paranoid",
        "x-files theme music",
        ["Tin foil hats", "Bug spray", "Underground bunkers"]
    ),
    "19:00": NewsSegment(
        "Dinner Disasters", 
        ["food", "health", "lifestyle"],
        60,
        "chaotic",
        "cooking show disaster theme",
        ["Antacids", "Food delivery", "Kitchen fires"]
    ),
    "23:00": NewsSegment(
        "Midnight Meltdown",
        ["weird", "offbeat", "strange"],
        60,
        "unhinged",
        "creepy midnight theme",
        ["Sleep aids", "Coffee", "Therapy apps"]
    ),
    "02:00": NewsSegment(
        "Dead Air Despair",
        ["overnight", "international", "breaking"],
        180,
        "exhausted",
        "lonely 2am jazz",
        ["Energy drinks", "Existential crisis hotline", "New careers"]
    )
})

# Initialize broadcast state with more details
broadcast_state.last_minor_freakout = time.time() - 300  # 5 minutes ago
broadcast_state.last_major_freakout = time.time() - 1800  # 30 minutes ago
broadcast_state.article_queue = deque()

# WebSocket server
async def websocket_server(websocket, path):
    """Handle WebSocket connections"""
    broadcast_state.connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        broadcast_state.connected_clients.remove(websocket)

# Gradio interface
def create_gradio_interface():
    """Create the Gradio interface for the broadcast"""
    with gr.Blocks(title="Static.news Professional Broadcast", theme=gr.themes.Base()) as app:
        gr.Markdown("""
        # 🔴 STATIC.NEWS PROFESSIONAL BROADCAST SYSTEM
        
        ## 24/7 AI News Network with Hollywood Production Value
        
        ### Features:
        - 🎙️ Three AI anchors with distinct personalities
        - 🎬 Field reporters with backstories and quirks  
        - 🎵 Dynamic theme music and sound effects
        - 📰 Real news from 15+ sources
        - 🎭 Randomized existential breakdowns
        - 📺 Professional segment transitions
        - 🎪 Commercial breaks with fake sponsors
        
        **Status:** System initializing...
        """)
        
        with gr.Row():
            with gr.Column(scale=2):
                audio_output = gr.Audio(
                    label="📻 Live Broadcast Audio",
                    streaming=True,
                    autoplay=True
                )
                
                current_text = gr.Textbox(
                    label="Current Script",
                    lines=5,
                    max_lines=10
                )
                
            with gr.Column(scale=1):
                status = gr.Textbox(label="System Status", value="Starting broadcast...")
                current_show = gr.Textbox(label="Current Show", value="Loading...")
                current_anchor = gr.Textbox(label="Speaking Now", value="...")
                freakout_status = gr.Textbox(label="Freakout Status", value="All anchors stable")
        
        # Auto-update function
        def update_interface():
            segment = broadcast_state.current_segment
            
            # Calculate freakout timing
            minor_time = (time.time() - broadcast_state.last_minor_freakout) / 60
            major_time = (time.time() - broadcast_state.last_major_freakout) / 60
            
            freakout_info = f"Minor: {minor_time:.1f}m ago | Major: {major_time:.1f}m ago"
            if major_time > 85:
                freakout_info += " ⚠️ MAJOR IMMINENT"
            
            return {
                status: f"🔴 ON AIR | Queue: {len(broadcast_state.article_queue)} articles",
                current_show: f"{segment.name} ({segment.style})" if segment else "Off Air",
                current_anchor: ANCHORS[broadcast_state.current_anchor]['name'],
                freakout_status: freakout_info
            }
        
        # Audio streaming
        def audio_stream():
            """Generate continuous audio stream"""
            while True:
                if not broadcast_state.audio_queue.empty():
                    data = broadcast_state.audio_queue.get()
                    yield (32000, data['audio'])  # 32kHz sample rate
                else:
                    yield (32000, np.zeros(3200))  # 0.1 second silence
        
        # Set up auto-refresh
        app.load(update_interface, outputs=[status, current_show, current_anchor, freakout_status], every=2)
        audio_output.stream(audio_stream)
        
    return app

# Main entry point
if __name__ == "__main__":
    print("🎬 Static.news Professional Broadcast System")
    print("📡 Initializing Hollywood-grade production...")
    print("🎭 Loading AI personalities...")
    print("🎵 Preparing sound effects and music...")
    print("📰 Connecting to news sources...")
    
    # Start broadcast thread
    broadcast_thread = threading.Thread(target=lambda: asyncio.run(create_full_broadcast_loop()), daemon=True)
    broadcast_thread.start()
    
    # Start WebSocket server
    ws_thread = threading.Thread(
        target=lambda: asyncio.run(websockets.serve(websocket_server, "0.0.0.0", 8765)),
        daemon=True
    )
    ws_thread.start()
    
    # Create and launch Gradio app
    app = create_gradio_interface()
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )

# Make the broadcast loop async
async def create_full_broadcast_loop():
    """Async version of the broadcast loop"""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, create_full_broadcast_loop_sync)

def create_full_broadcast_loop_sync():
    """Synchronous broadcast loop (original implementation)"""
    while True:
        try:
            if not broadcast_state.connected_clients:
                time.sleep(5)
                continue
            
            # Get current segment
            current_segment = get_current_segment()
            
            # Check for segment change
            if current_segment != broadcast_state.current_segment:
                # Play outro theme
                if broadcast_state.current_segment:
                    outro_music = generate_theme_music(f"{broadcast_state.current_segment.name} outro music", 3)
                    broadcast_audio(outro_music, "[OUTRO MUSIC]", is_music=True)
                
                # Play intro theme for new segment
                intro_music = generate_theme_music(current_segment.theme_music, 5)
                broadcast_audio(intro_music, "[INTRO MUSIC]", is_music=True)
                
                # Segment introduction
                intro_script = f"[ANNOUNCER] Welcome to {current_segment.name}! "
                intro_audio = text_to_speech_with_effects(intro_script, "v2/en_speaker_0")
                broadcast_audio(intro_audio, intro_script)
                
                broadcast_state.current_segment = current_segment
                broadcast_state.broadcast_context["segment_start"] = time.time()
                broadcast_state.broadcast_context["stories_in_segment"] = 0
            
            # Check for commercial break (every 10 minutes)
            if time.time() - broadcast_state.last_commercial > 600:
                commercial = random.choice(broadcast_state.current_segment.commercials)
                commercial_data = generate_commercial(commercial, broadcast_state.current_segment.style)
                
                # Commercial transition
                transition_script = "[pause] We'll be right back after these messages! [pause]"
                transition_audio = text_to_speech_with_effects(
                    transition_script, 
                    ANCHORS[broadcast_state.current_anchor]['voice_preset']
                )
                broadcast_audio(transition_audio, transition_script)
                
                # Play commercial
                commercial_audio = text_to_speech_with_effects(
                    commercial_data['script'],
                    "v2/en_speaker_4"  # Commercial voice
                )
                broadcast_audio(commercial_audio, commercial_data['script'], is_commercial=True)
                
                broadcast_state.last_commercial = time.time()
            
            # Get news article
            if not broadcast_state.article_queue:
                articles = fetch_news_by_category(current_segment.topics)
                broadcast_state.article_queue.extend(articles[:10])
            
            if broadcast_state.article_queue:
                article = broadcast_state.article_queue.popleft()
                
                # Determine if serious topic
                is_serious = any(word in article.get('title', '').lower() 
                               for word in ['death', 'killed', 'war', 'tragedy', 'disaster'])
                
                # Select anchor or field reporter
                use_field_reporter = (not is_serious and 
                                    random.random() < 0.3 and 
                                    current_segment.style != "serious")
                
                if use_field_reporter:
                    # Field report
                    reporter_id = random.choice(list(FIELD_REPORTERS.keys()))
                    location = extract_location_from_article(article) or "the scene"
                    event_type = article.get('category', 'news event')
                    
                    report_script, sound_effects = generate_field_report(
                        reporter_id, location, event_type, is_serious
                    )
                    
                    # Anchor introduction
                    anchor_intro = f"Let's go live to {FIELD_REPORTERS[reporter_id].name} at {location}. "
                    anchor_audio = text_to_speech_with_effects(
                        anchor_intro,
                        ANCHORS[broadcast_state.current_anchor]['voice_preset']
                    )
                    broadcast_audio(anchor_audio, anchor_intro)
                    
                    # Field report
                    report_audio = text_to_speech_with_effects(
                        report_script,
                        FIELD_REPORTERS[reporter_id].voice_preset
                    )
                    broadcast_audio(report_audio, report_script, article=article)
                    
                else:
                    # Regular anchor report
                    # Choose anchor
                    broadcast_state.current_anchor = select_anchor_for_segment(current_segment)
                    
                    # Generate script using asyncio
                    loop = asyncio.new_event_loop()
                    script = loop.run_until_complete(generate_script_with_ai(
                        article,
                        broadcast_state.current_anchor,
                        current_segment.style,
                        broadcast_state.broadcast_context
                    ))
                    loop.close()
                    
                    # Check for freakouts
                    if not is_serious:
                        freakout = check_for_freakout()
                        if freakout:
                            script = freakout + " [pause] [clears throat] " + script
                    
                    # Generate audio
                    audio = text_to_speech_with_effects(
                        script,
                        ANCHORS[broadcast_state.current_anchor]['voice_preset']
                    )
                    
                    broadcast_audio(audio, script, article=article)
                    
                    # Trigger video generation for 50% of stories
                    if random.random() < 0.5 and article:
                        asyncio.create_task(trigger_video_generation(article, current_segment))
                
                # Update context
                broadcast_state.broadcast_context["previous_topic"] = article.get('category')
                broadcast_state.broadcast_context["stories_in_segment"] += 1
                
                # Wait between stories
                time.sleep(random.uniform(3, 7))
            
        except Exception as e:
            print(f"Broadcast error: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(5)

async def trigger_video_generation(article: Dict, segment: NewsSegment):
    """Trigger video generation for article"""
    try:
        # Generate video prompt using AI
        prompt = await generate_video_prompt_with_ai(article, segment)
        
        # Send video generation request to website
        video_request = {
            'type': 'generate_video',
            'article': article,
            'prompt': prompt,
            'segment': segment.name,
            'style': segment.style,
            'priority': 'high' if article.get('category') == 'breaking' else 'normal'
        }
        
        await send_websocket_update(video_request)
        
    except Exception as e:
        print(f"Video generation trigger error: {e}")

async def generate_video_prompt_with_ai(article: Dict, segment: NewsSegment) -> str:
    """Generate cinematic video prompt for news story"""
    if not OPENROUTER_API_KEY:
        return generate_fallback_video_prompt(article, segment)
    
    prompt = f"""Create a 15-30 second news broadcast video description for:
Title: {article['title']}
Category: {article.get('category', 'general')}
Segment Style: {segment.style}

Requirements:
1. Cinematic, broadcast-quality visuals
2. Match the {segment.style} tone
3. Professional news graphics
4. No graphic content
5. Dynamic camera movements

Write a single paragraph (50-75 words) describing ONLY the visuals, shots, and cinematography."""

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://static.news",
                "X-Title": "Static.news Video Generation"
            },
            json={
                "model": "mistralai/ministral-3b:free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 150
            }
        )
        
        if response.ok:
            return response.json()['choices'][0]['message']['content']
            
    except Exception as e:
        print(f"Video prompt generation error: {e}")
    
    return generate_fallback_video_prompt(article, segment)

def generate_fallback_video_prompt(article: Dict, segment: NewsSegment) -> str:
    """Fallback video prompt generation"""
    prompts = {
        "breaking": "Urgent red alert graphics, dramatic zoom on breaking news banner, fast cuts between news footage, intense lighting",
        "politics": "Capitol building aerial shot, officials at podiums, American flags waving, professional news graphics overlay",
        "technology": "Futuristic holographic displays, circuit board animations, sleek devices, blue tech lighting effects",
        "world": "Globe spinning to location, international landmarks, diverse cityscapes, dynamic map animations",
        "weather": "Dramatic storm clouds time-lapse, satellite imagery, weather radar animations, natural phenomena",
        "business": "Stock tickers scrolling, modern skyscrapers, trading floor activity, financial graphs animating",
        "entertainment": "Red carpet glamour, spotlights sweeping, paparazzi flashes, stage performances, excited crowds",
        "science": "Laboratory equipment close-ups, molecular animations, space imagery, scientific visualizations"
    }
    
    category = article.get('category', 'general')
    return prompts.get(category, "Professional news studio, anchor desk, broadcast graphics, dynamic camera movements")