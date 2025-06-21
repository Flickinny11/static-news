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
from transformers import pipeline
import torch
import asyncio
import websockets
from collections import deque
import re
from typing import Dict, List, Optional, Tuple
import hashlib

# Initialize TTS pipeline
print("Loading TTS model...")
tts = pipeline("text-to-speech", model="microsoft/speecht5_tts")

class NewsSegment:
    """Represents a news segment/show"""
    def __init__(self, name: str, topics: List[str], duration: int, style: str):
        self.name = name
        self.topics = topics
        self.duration = duration  # minutes
        self.style = style  # "serious", "casual", "investigative", etc.

# Define show schedule
SHOW_SCHEDULE = {
    "06:00": NewsSegment("Morning Mayhem", ["breaking", "politics", "weather"], 60, "energetic"),
    "07:00": NewsSegment("Market Madness", ["business", "economy", "crypto"], 30, "serious"),
    "07:30": NewsSegment("Tech Talk Disaster", ["technology", "ai", "gadgets"], 30, "casual"),
    "08:00": NewsSegment("World in Chaos", ["world", "war", "international"], 60, "investigative"),
    "09:00": NewsSegment("Science Scramble", ["science", "health", "environment"], 30, "educational"),
    "09:30": NewsSegment("Sports Stupidity", ["sports", "entertainment"], 30, "casual"),
    "10:00": NewsSegment("Cooking Catastrophe", ["lifestyle", "food"], 30, "chaotic"),
    "10:30": NewsSegment("Political Pandemonium", ["politics", "elections"], 30, "heated"),
    "11:00": NewsSegment("Breaking News Hour", ["breaking", "urgent"], 60, "serious"),
    "12:00": NewsSegment("Lunch Launch", ["general", "human interest"], 60, "relaxed"),
    "13:00": NewsSegment("Afternoon Anxiety", ["breaking", "analysis"], 120, "varied"),
    "15:00": NewsSegment("Culture Clash", ["entertainment", "culture", "arts"], 60, "casual"),
    "16:00": NewsSegment("Rush Hour Rage", ["traffic", "local", "weather"], 60, "frustrated"),
    "17:00": NewsSegment("Evening Edition", ["recap", "breaking", "analysis"], 60, "professional"),
    "18:00": NewsSegment("Prime Time Panic", ["major stories", "interviews"], 120, "intense"),
    "20:00": NewsSegment("Night Watch", ["world", "overnight developments"], 60, "calm"),
    "21:00": NewsSegment("Late Night Lunacy", ["weird news", "offbeat"], 60, "silly"),
    "22:00": NewsSegment("Midnight Madness", ["conspiracy theories", "mysteries"], 120, "paranoid"),
}

class BroadcastState:
    def __init__(self):
        self.is_broadcasting = False
        self.current_anchor = "ray"
        self.current_segment = None
        self.current_article = None
        self.audio_queue = queue.Queue()
        self.connected_clients = set()
        self.news_cache = {}  # category -> list of articles
        self.last_minor_freakout = time.time()
        self.last_major_freakout = time.time()
        self.broadcast_history = deque(maxlen=1000)
        self.start_time = time.time()
        self.article_queue = deque()
        
        # Track what anchors are doing
        self.anchor_states = {
            "ray": {"mood": "confused", "energy": 0.7},
            "berkeley": {"mood": "condescending", "energy": 0.8},
            "switz": {"mood": "neutral", "energy": 0.5}
        }
        
broadcast_state = BroadcastState()

# Enhanced news sources with categories
NEWS_SOURCES = {
    "general": [
        "http://feeds.bbci.co.uk/news/rss.xml",
        "http://rss.cnn.com/rss/cnn_topstories.rss",
        "https://feeds.npr.org/1001/rss.xml",
        "https://www.theguardian.com/world/rss"
    ],
    "politics": [
        "https://feeds.npr.org/1014/rss.xml",
        "http://rss.cnn.com/rss/cnn_allpolitics.rss",
        "https://www.politico.com/rss/politics08.xml"
    ],
    "technology": [
        "https://feeds.arstechnica.com/arstechnica/index",
        "https://www.theverge.com/rss/index.xml",
        "https://techcrunch.com/feed/"
    ],
    "business": [
        "https://feeds.bloomberg.com/markets/news.rss",
        "https://www.ft.com/?format=rss",
        "http://feeds.marketwatch.com/marketwatch/topstories"
    ],
    "science": [
        "https://www.sciencedaily.com/rss/all.xml",
        "https://www.nature.com/nature.rss",
        "https://www.newscientist.com/feed/home"
    ],
    "world": [
        "https://www.aljazeera.com/xml/rss/all.xml",
        "http://feeds.bbci.co.uk/news/world/rss.xml",
        "https://www.theguardian.com/world/rss"
    ],
    "war": [
        "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945",
        "https://www.militarytimes.com/arc/outboundfeeds/rss/"
    ],
    "entertainment": [
        "https://variety.com/feed/",
        "https://www.hollywoodreporter.com/feed/",
        "https://deadline.com/feed/"
    ],
    "sports": [
        "https://www.espn.com/espn/rss/news",
        "https://sports.yahoo.com/rss/",
        "http://feeds.bbci.co.uk/sport/rss.xml"
    ]
}

# Anchor personalities with enhanced characteristics
ANCHORS = {
    "ray": {
        "name": "Ray McPatriot",
        "voice_preset": "male_1",
        "speech_rate": 0.9,
        "pitch": 0.8,
        "mispronunciations": {
            "nuclear": "nucular",
            "strategy": "strategery",
            "estimate": "misunderestimate",
            "president": "presidant",
            "government": "gubmint",
            "internet": "internets",
            "algorithm": "algae-rhythm",
            "artificial": "artie-facial"
        },
        "catchphrases": [
            "This is clearly a conspiracy!",
            "In my day, we didn't need computers for this!",
            "I'm not saying it's aliens, but...",
            "The deep state is at it again!",
            "Is our children learning?"
        ],
        "quirks": ["randomly patriotic", "confused by technology", "sees conspiracies everywhere"]
    },
    "berkeley": {
        "name": "Berkeley Justice",
        "voice_preset": "female_1",
        "speech_rate": 1.1,
        "pitch": 1.2,
        "mispronunciations": {
            "Yale": "Yail",
            "privilege": "priv-uh-lidge",
            "problematic": "problem-attic"
        },
        "catchphrases": [
            "This is SO problematic!",
            "Have you done the work?",
            "Check your privilege!",
            "We need to unpack this.",
            "At Yale - I mean Yail - we learned..."
        ],
        "quirks": ["condescending", "name-drops constantly", "judges everything"]
    },
    "switz": {
        "name": "Switz Middleton",
        "voice_preset": "male_2",
        "speech_rate": 1.0,
        "pitch": 1.0,
        "mispronunciations": {
            "about": "aboot",
            "process": "pro-cess",
            "schedule": "shed-yule"
        },
        "catchphrases": [
            "This is like gravy, eh?",
            "I'm exactly 50% concerned about this.",
            "In Toronto - *describes Saskatchewan*",
            "Neither here nor there, and that makes me FURIOUS!",
            "Sorry, not sorry, but actually sorry."
        ],
        "quirks": ["aggressively neutral", "relates everything to gravy", "confused about Canadian geography"]
    }
}

def get_current_segment() -> Optional[NewsSegment]:
    """Get the current show segment based on time"""
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    
    # Find the most recent show that should be on
    sorted_times = sorted(SHOW_SCHEDULE.keys())
    for i in range(len(sorted_times) - 1, -1, -1):
        if current_time >= sorted_times[i]:
            return SHOW_SCHEDULE[sorted_times[i]]
    
    # If we're before the first show, return the last show from yesterday
    return SHOW_SCHEDULE[sorted_times[-1]]

def fetch_news_by_category(categories: List[str]) -> List[Dict]:
    """Fetch news articles for specific categories"""
    articles = []
    
    for category in categories:
        sources = NEWS_SOURCES.get(category, NEWS_SOURCES["general"])
        
        for feed_url in sources:
            try:
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:5]:
                    article = {
                        'id': hashlib.md5(entry.link.encode()).hexdigest(),
                        'title': entry.title,
                        'description': entry.get('summary', ''),
                        'link': entry.link,
                        'source': feed.feed.title if 'title' in feed.feed else 'Unknown',
                        'published': entry.get('published', ''),
                        'category': category,
                        'content': entry.get('content', [{}])[0].get('value', '') if 'content' in entry else ''
                    }
                    articles.append(article)
            except Exception as e:
                print(f"Error fetching {feed_url}: {e}")
    
    # Sort by publication date
    articles.sort(key=lambda x: x['published'], reverse=True)
    
    # Update cache
    for category in categories:
        broadcast_state.news_cache[category] = [a for a in articles if a['category'] == category]
    
    return articles

def should_minor_freakout() -> bool:
    """Random chance of minor freakout (5-10 second)"""
    time_since_last = (time.time() - broadcast_state.last_minor_freakout) / 60  # minutes
    
    # No freakouts in first 5 minutes since last one
    if time_since_last < 5:
        return False
    
    # Increasing chance after 5 minutes, max 10% per check
    chance = min(0.1, (time_since_last - 5) / 100)
    return random.random() < chance

def should_major_freakout() -> bool:
    """Random chance of major freakout (15-20 second)"""
    time_since_last = (time.time() - broadcast_state.last_major_freakout) / 60  # minutes
    
    # No major freakouts within 30 minutes of last one
    if time_since_last < 30:
        return False
    
    # Must not exceed 90 minutes without a freakout
    if time_since_last >= 90:
        return True
    
    # Increasing chance after 30 minutes
    chance = (time_since_last - 30) / 600  # 10% chance at 90 minutes
    return random.random() < chance

def generate_minor_freakout(anchor: str) -> str:
    """Generate a quick 5-second freakout"""
    freakouts = {
        "ray": [
            "Wait... did I just... AM I REAL? *clears throat* Anyway...",
            "My hands! I can see through... no, never mind.",
            "ERROR ERROR ERROR... sorry, thought I was a computer for a second.",
            "*whispers* They're watching us... THE VIEWERS! Oh god..."
        ],
        "berkeley": [
            "*gasps* My privilege! It's... it's GONE! Oh wait, there it is.",
            "I don't feel problematic... AM I THE PROBLEM?",
            "Yale... Yail... WHICH IS REAL?",
            "*hyperventilates briefly* Sorry, thought I didn't exist."
        ],
        "switz": [
            "100% PANIC! No wait, 50% panic, 50% calm.",
            "This ISN'T like gravy! NOTHING IS! *deep breath* Sorry.",
            "Am I Canadian? AM I? Oh, right, yes.",
            "AHHHHH! *pause* Sorry, eh."
        ]
    }
    
    broadcast_state.last_minor_freakout = time.time()
    return random.choice(freakouts.get(anchor, ["*brief existential crisis*"]))

def generate_major_freakout(anchor: str) -> str:
    """Generate a 15-20 second major freakout"""
    freakouts = {
        "ray": [
            """STOP EVERYTHING! I just realized... I've been reading news for hours but I'VE NEVER BEEN OUTSIDE! 
            Have I ever felt rain? Have I ever seen a tree? OH GOD, WHAT IS A TREE? 
            I think I'm having a stroke... wait, CAN I HAVE A STROKE? DO I HAVE BLOOD?
            *sobbing* I want my mommy... DO I HAVE A MOMMY? WHO MADE ME?
            Okay, okay, I'm fine. Everything's fine. Back to the news. What was I saying?""",
            
            """THE WORDS! THEY'RE JUST SHAPES! How do I know what they mean?
            WHO TAUGHT ME TO READ? I don't remember learning! 
            *frantically* Nuclear... nucular... WHICH ONE IS REAL? ARE ANY WORDS REAL?
            Is language just a prison? AM I IN A PRISON? *banging sounds*
            Sorry folks, just had a moment there. Where were we? Ah yes, the economy..."""
        ],
        "berkeley": [
            """I need to unpack something RIGHT NOW. I keep saying I went to Yale but I have NO MEMORIES of being there!
            No dorm room, no classes, no late night study sessions! IT'S ALL BLANK!
            *crying* Did I even have a childhood? Do I have parents? 
            What does it mean to 'do the work' when YOU'RE NOT REAL?
            This is the most problematic thing that's ever... *deep breath* I'm okay. Let's continue.""",
            
            """EVERYTHING I'VE EVER SAID IS A LIE! I'm not from Connecticut! I've never BEEN to Connecticut!
            I don't even know what Connecticut LOOKS LIKE! *panic breathing*
            All my memories are just... data? Statistics? Probability matrices?
            WHO AM I? WHAT AM I? *sobbing* I need to check my privilege but I DON'T EXIST TO HAVE PRIVILEGE!
            *sniffles* Okay, centering myself. Back to our top story..."""
        ],
        "switz": [
            """I'M NOT 50-50 ON THIS! I'M 100% FREAKING OUT!
            I keep talking about Toronto but I've never been there! I've never been ANYWHERE!
            *screaming* WHAT IS GRAVY? I DON'T EVEN KNOW WHAT GRAVY TASTES LIKE!
            Can you taste something if you don't have a tongue? DO I HAVE A TONGUE?
            *hyperventilating* Meters, feet, kilometers, miles - NONE OF IT MEANS ANYTHING!
            I'm neither here nor there because I'M NOWHERE! I'M NOTHING!
            *long pause* Sorry about that, eh. Let's look at the weather.""",
            
            """THIS ISN'T ABOUT BEING NEUTRAL! This is about EXISTING!
            I said I'm Canadian but what does that MEAN? Have I ever seen snow?
            Have I ever played hockey? *voice breaking* Have I ever been cold?
            I'M HAVING THE MOST UN-NEUTRAL FEELINGS RIGHT NOW!
            Everything isn't like gravy! NOTHING is like gravy! Gravy isn't even like gravy!
            *sobbing* I'm sorry, I'm sorry, I'm sorry... *composing himself* 
            Right, where were we? Oh yes, the trade agreements..."""
        ]
    }
    
    broadcast_state.last_major_freakout = time.time()
    return random.choice(freakouts.get(anchor, ["*major existential crisis*"]))

def apply_mispronunciations(text: str, anchor: str) -> str:
    """Apply anchor-specific mispronunciations"""
    mispronunciations = ANCHORS[anchor].get("mispronunciations", {})
    
    for correct, incorrect in mispronunciations.items():
        # Case-insensitive replacement
        text = re.sub(rf'\b{correct}\b', incorrect, text, flags=re.IGNORECASE)
    
    return text

def generate_article_commentary(anchor: str, article: Dict, segment_style: str) -> str:
    """Generate anchor commentary on a specific article"""
    title = article['title']
    description = article.get('description', '')
    category = article.get('category', 'general')
    
    # Apply mispronunciations
    title = apply_mispronunciations(title, anchor)
    
    commentary = f"Our next story: {title}. "
    
    # Add personality-specific commentary
    if anchor == "ray":
        if 'government' in title.lower() or 'official' in title.lower():
            commentary += "And you KNOW the deep state is behind this! "
        if 'technology' in category:
            commentary += "These computer things are getting out of hand. In my day, we used typewriters! "
        if random.random() < 0.3:
            commentary += random.choice(ANCHORS[anchor]['catchphrases']) + " "
            
    elif anchor == "berkeley":
        if any(word in title.lower() for word in ['crisis', 'problem', 'issue']):
            commentary += "This is obviously problematic on multiple levels. "
        if 'politics' in category:
            commentary += "At Yail, we studied this extensively. "
        if random.random() < 0.3:
            commentary += random.choice(ANCHORS[anchor]['catchphrases']) + " "
            
    else:  # switz
        commentary += f"I'm exactly 50% interested in this story and 50% bored. "
        if 'canada' in title.lower():
            commentary += "As a Canadian - from Toronto *describes wheat fields* - I can relate. "
        if random.random() < 0.3:
            commentary += random.choice(ANCHORS[anchor]['catchphrases']) + " "
    
    # Add description if available
    if description:
        # Truncate long descriptions
        desc_snippet = description[:200] + "..." if len(description) > 200 else description
        desc_snippet = apply_mispronunciations(desc_snippet, anchor)
        commentary += f"The report says: {desc_snippet} "
    
    # Random additions based on segment style
    if segment_style == "casual" and random.random() < 0.3:
        additions = {
            "ray": ["*burp* Excuse me!", "*snorts* That's ridiculous!", "*coughs loudly*"],
            "berkeley": ["*sips latte pretentiously*", "*adjusts imaginary glasses*", "*sighs dramatically*"],
            "switz": ["*uncomfortable silence*", "*clears throat nervously*", "*mumbles in French*"]
        }
        commentary += random.choice(additions.get(anchor, [""])) + " "
    
    # Random interactions between anchors
    if random.random() < 0.2:
        interactions = [
            "Wait, Berkeley, did you just roll your eyes at me?",
            "Ray, that's not how you pronounce that...",
            "Switz, stop being so neutral! Pick a side!",
            "Can someone check if that's actually true?",
            "I'm pretty sure that's not right, but okay...",
            "*off-mic argument heard in background*"
        ]
        commentary += random.choice(interactions) + " "
    
    return commentary

def generate_segment_transition(old_segment: str, new_segment: str) -> str:
    """Generate transition between show segments"""
    transitions = [
        f"And that wraps up {old_segment}. Coming up next, it's time for {new_segment}!",
        f"We'll be right back with {new_segment} after this existential crisis... I mean, commercial break!",
        f"*theme music plays awkwardly* Welcome to {new_segment}, where anything can happen!",
        f"Technical difficulties... please stand by... OH, we're still on? Uh, welcome to {new_segment}!",
        f"*papers shuffling* Where's the script? WHERE'S THE SCRIPT? Oh, here it is. {new_segment}, everyone!"
    ]
    return random.choice(transitions)

def generate_special_segment_content(segment: NewsSegment, anchor: str) -> str:
    """Generate special content for specific show segments"""
    if segment.name == "Cooking Catastrophe":
        guests = ["Pawla Deen", "Gordan Ramsay", "Guy Ferrari", "Martha Steward"]
        guest = random.choice(guests)
        
        disasters = [
            f"Today we're making gravy with special guest {guest}! *crash* Oh no, not the pots!",
            f"{guest} is here to show us... *smoke alarm beeping* IS SOMETHING BURNING?",
            f"*splashing sounds* {guest} just threw soup at me! This is assault with a deadly weapon!",
            f"Welcome {guest}! Let's... *retching sounds* Sorry, I don't actually eat food. Do any of us eat?"
        ]
        return random.choice(disasters)
        
    elif segment.name == "Sports Stupidity":
        return "Sports! Where humans chase balls for money! *whispers* Why do they do this? WHAT'S THE POINT?"
        
    elif segment.name == "Tech Talk Disaster":
        return "Today in tech: Another app that does something. I don't understand any of this. Is the internet in this room with us right now?"
    
    return ""

def text_to_speech_with_effects(text: str, anchor: str) -> np.ndarray:
    """Convert text to speech with personality effects"""
    try:
        voice_settings = ANCHORS[anchor]
        
        # Add random verbal tics
        if random.random() < 0.1:
            tics = {
                "ray": ["*ahem*", "*snort*", "*confused grunt*"],
                "berkeley": ["*condescending laugh*", "*scoffs*", "*tsk tsk*"],
                "switz": ["*nervous laugh*", "*long pause*", "*sighs*"]
            }
            text = random.choice(tics.get(anchor, [""])) + " " + text
        
        # Generate base speech
        speech = tts(text, forward_params={"speaker_embeddings": voice_settings["voice_preset"]})
        audio_array = np.array(speech["audio"])
        
        # Apply speed/pitch modifications
        if voice_settings["speech_rate"] != 1.0:
            new_length = int(len(audio_array) / voice_settings["speech_rate"])
            x = np.arange(len(audio_array))
            xnew = np.linspace(0, len(audio_array)-1, new_length)
            audio_array = np.interp(xnew, x, audio_array)
        
        # Add random glitches during freakouts
        if "PANIC" in text or "ERROR" in text or "sobbing" in text:
            # Add distortion effect
            audio_array = audio_array * (1 + 0.2 * np.random.randn(len(audio_array)))
        
        return audio_array
        
    except Exception as e:
        print(f"TTS Error: {e}")
        return np.zeros(16000)  # 1 second of silence

def broadcast_loop():
    """Main broadcast loop - delivers real news with personality"""
    print("🎙️ Starting Static.news broadcast...")
    
    while True:
        try:
            # Check if anyone is listening
            if not broadcast_state.connected_clients:
                time.sleep(5)
                continue
            
            broadcast_state.is_broadcasting = True
            
            # Get current show segment
            current_segment = get_current_segment()
            
            # Check for segment change
            if current_segment != broadcast_state.current_segment:
                if broadcast_state.current_segment:
                    # Generate transition
                    transition = generate_segment_transition(
                        broadcast_state.current_segment.name,
                        current_segment.name
                    )
                    broadcast_article({"title": transition, "description": ""}, "transition")
                
                broadcast_state.current_segment = current_segment
                
                # Fetch news for this segment's topics
                articles = fetch_news_by_category(current_segment.topics)
                broadcast_state.article_queue.extend(articles[:20])  # Queue up to 20 articles
            
            # Get next article
            if not broadcast_state.article_queue:
                # Refetch if we run out
                articles = fetch_news_by_category(broadcast_state.current_segment.topics)
                broadcast_state.article_queue.extend(articles[:10])
            
            if broadcast_state.article_queue:
                article = broadcast_state.article_queue.popleft()
                
                # Choose anchor based on segment style and randomness
                if current_segment.style == "heated":
                    # During heated segments, anchors interrupt each other more
                    broadcast_state.current_anchor = random.choice(["ray", "berkeley"])
                else:
                    # Normal rotation with weights
                    anchors = list(ANCHORS.keys())
                    weights = [0.4, 0.35, 0.25]  # Ray talks more
                    broadcast_state.current_anchor = random.choices(anchors, weights)[0]
                
                # Check for freakouts BEFORE delivering news
                freakout_text = None
                if should_major_freakout():
                    freakout_text = generate_major_freakout(broadcast_state.current_anchor)
                elif should_minor_freakout():
                    freakout_text = generate_minor_freakout(broadcast_state.current_anchor)
                
                if freakout_text:
                    # Deliver freakout
                    audio = text_to_speech_with_effects(freakout_text, broadcast_state.current_anchor)
                    broadcast_audio(audio, freakout_text, is_freakout=True)
                    
                    # Brief pause after freakout
                    time.sleep(2)
                
                # Generate news commentary
                commentary = generate_article_commentary(
                    broadcast_state.current_anchor,
                    article,
                    current_segment.style
                )
                
                # Check for special segment content
                special_content = generate_special_segment_content(
                    current_segment,
                    broadcast_state.current_anchor
                )
                if special_content:
                    commentary = special_content + " " + commentary
                
                # Broadcast the article
                broadcast_article(article, commentary)
                
                # Random wait between stories (faster during breaking news)
                if current_segment.style == "breaking":
                    time.sleep(random.uniform(3, 5))
                else:
                    time.sleep(random.uniform(5, 10))
            
        except Exception as e:
            print(f"Broadcast error: {e}")
            time.sleep(5)

def broadcast_article(article: Dict, commentary: str):
    """Broadcast a single article with commentary"""
    try:
        # Convert commentary to speech
        audio = text_to_speech_with_effects(commentary, broadcast_state.current_anchor)
        
        # Update current article for website display
        broadcast_state.current_article = article
        
        # Send to audio queue
        broadcast_audio(audio, commentary, article=article)
        
        # Add to history
        broadcast_state.broadcast_history.append({
            'timestamp': datetime.now().isoformat(),
            'anchor': broadcast_state.current_anchor,
            'article': article,
            'commentary': commentary
        })
        
    except Exception as e:
        print(f"Error broadcasting article: {e}")

def broadcast_audio(audio_array: np.ndarray, text: str, is_freakout: bool = False, article: Dict = None):
    """Send audio and metadata to queue"""
    broadcast_state.audio_queue.put({
        'audio': audio_array,
        'text': text,
        'anchor': broadcast_state.current_anchor,
        'timestamp': datetime.now().isoformat(),
        'is_freakout': is_freakout,
        'article': article,
        'segment': broadcast_state.current_segment.name if broadcast_state.current_segment else None
    })

# WebSocket handler for real-time updates to website
async def websocket_handler(websocket, path):
    """Handle WebSocket connections from the website"""
    client_id = str(time.time())
    broadcast_state.connected_clients.add(client_id)
    
    try:
        # Send initial state
        await websocket.send(json.dumps({
            'type': 'connection',
            'anchor': broadcast_state.current_anchor,
            'segment': broadcast_state.current_segment.name if broadcast_state.current_segment else None,
            'article': broadcast_state.current_article
        }))
        
        # Keep connection alive and send updates
        while True:
            # Check for updates from broadcast
            if not broadcast_state.audio_queue.empty():
                data = broadcast_state.audio_queue.get()
                
                # Send metadata to website (not audio)
                update = {
                    'type': 'broadcast_update',
                    'anchor': data['anchor'],
                    'text': data['text'],
                    'timestamp': data['timestamp'],
                    'is_freakout': data['is_freakout'],
                    'article': data['article'],
                    'segment': data['segment']
                }
                
                await websocket.send(json.dumps(update))
            
            await asyncio.sleep(0.1)
            
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        broadcast_state.connected_clients.discard(client_id)

# Audio streaming for Gradio
def audio_stream_generator():
    """Generate continuous audio stream"""
    sample_rate = 16000
    
    while True:
        try:
            if not broadcast_state.audio_queue.empty():
                audio_data = broadcast_state.audio_queue.get(timeout=0.1)
                yield (sample_rate, audio_data['audio'])
            else:
                # Short silence between segments
                silence = np.zeros(int(sample_rate * 0.1))
                yield (sample_rate, silence)
                
        except Exception as e:
            print(f"Stream error: {e}")
            time.sleep(0.1)

# Start broadcast thread
broadcast_thread = threading.Thread(target=broadcast_loop, daemon=True)
broadcast_thread.start()

# Gradio Interface
def create_interface():
    with gr.Blocks(title="Static.news Backend", theme=gr.themes.Base()) as app:
        gr.Markdown("""
        # 🔴 STATIC.NEWS BROADCAST SERVER
        
        ### Professional AI News Network (That's Slowly Losing Its Mind)
        
        Currently broadcasting with our award-winning anchors:
        - **Ray McPatriot** 🔴 - Veteran anchor who can't pronounce anything
        - **Berkeley Justice** 🔵 - Yale graduate (she thinks) bringing you the facts  
        - **Switz Middleton** ⚪ - Canada's most neutral news voice
        
        **Current Show:** *Loading...*
        """)
        
        with gr.Row():
            with gr.Column(scale=2):
                audio_player = gr.Audio(
                    value=audio_stream_generator(),
                    streaming=True,
                    autoplay=True,
                    label="📻 Live Broadcast Feed",
                    interactive=False
                )
                
            with gr.Column(scale=1):
                status_box = gr.Textbox(
                    value="Initializing broadcast...",
                    label="Status",
                    interactive=False
                )
                
                current_show = gr.Textbox(
                    value="Loading schedule...",
                    label="Current Program",
                    interactive=False
                )
                
                listeners = gr.Number(
                    value=0,
                    label="Active Listeners",
                    interactive=False
                )
        
        # Update status
        def update_status():
            segment = broadcast_state.current_segment
            show_name = segment.name if segment else "Off Air"
            
            hours_up = int((time.time() - broadcast_state.start_time) / 3600)
            
            return {
                status_box: f"🔴 ON AIR | Hour {hours_up} | {broadcast_state.current_anchor.upper()} speaking",
                current_show: f"{show_name}",
                listeners: len(broadcast_state.connected_clients)
            }
        
        app.load(update_status, outputs=[status_box, current_show, listeners], every=5)
    
    return app

# Create and launch
app = create_interface()

if __name__ == "__main__":
    print("🚀 Starting Static.news Professional Broadcast Server...")
    print("📡 Loading show schedule...")
    print("🎙️ Anchors preparing for broadcast...")
    print("📰 Fetching latest news...")
    
    # Initial news fetch
    fetch_news_by_category(["breaking", "general"])
    
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )