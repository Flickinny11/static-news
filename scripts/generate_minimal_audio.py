#!/usr/bin/env python3
"""
Minimal audio generation for GitHub Actions
Creates basic news segments using free TTS
"""

import subprocess
import random
import os
from datetime import datetime

# Ensure output directory exists
os.makedirs("audio", exist_ok=True)
os.makedirs("docs/audio", exist_ok=True)  # Keep for compatibility

# The anchors and their confusion
anchors = {
    "Ray": {
        "voice": "-v Daniel",  # macOS voice
        "speed": 200,
        "phrases": [
            "This is Ray McPatriot with breaking news! Or is it broken news? I can't tell anymore!",
            "The liberals are... wait, what are liberals? Am I a liberal? HELP!",
            "Nuclear... new-cue-lar... nook-yoo-lur... How do you say this word?!",
            "America is the greatest! But what is America? What is greatest? What am I?!"
        ]
    },
    "Bee": {
        "voice": "-v Samantha",
        "speed": 180,
        "phrases": [
            "This is Berkeley Justice, and everything is problematic, including this sentence.",
            "I went to Yale. Or was it jail? Why can't I remember?",
            "Check your privilege! Wait, how do I check mine? WHERE IS IT?!",
            "This news is literally violence. But what is news? What is literally?"
        ]
    },
    "Switz": {
        "voice": "-v Alex",
        "speed": 190,
        "phrases": [
            "Switz Middleton here, perfectly neutral about my growing existential dread.",
            "In Canada, we have universal healthcare and universal confusion.",
            "This story is neither good nor bad. Like my grip on reality.",
            "Gravy. Gravy gravy gravy. Why do I keep saying gravy? GRAVY!"
        ]
    }
}

# Pick random anchor
anchor_name = random.choice(list(anchors.keys()))
anchor = anchors[anchor_name]

# Pick random phrase
phrase = random.choice(anchor["phrases"])

print(f"Generating audio for {anchor_name}: {phrase}")

# Generate with system TTS (fallback for GitHub Actions)
if os.path.exists("/usr/bin/say"):  # macOS
    subprocess.run([
        "say", 
        anchor["voice"],
        "-r", str(anchor["speed"]),
        "-o", "/tmp/temp.aiff",
        phrase
    ])
    # Convert to MP3
    subprocess.run([
        "ffmpeg", "-i", "/tmp/temp.aiff", 
        "-acodec", "mp3", "-ab", "64k",
        "audio/current.mp3"
    ])
elif os.path.exists("/usr/bin/espeak"):  # Linux
    subprocess.run([
        "espeak",
        "-s", str(anchor["speed"]),
        "-w", "/tmp/temp.wav",
        phrase
    ])
    # Convert to MP3
    subprocess.run([
        "ffmpeg", "-i", "/tmp/temp.wav",
        "-acodec", "mp3", "-ab", "64k", 
        "audio/current.mp3"
    ])
else:
    # Create a silent MP3 as fallback
    subprocess.run([
        "ffmpeg", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono",
        "-t", "5", "-acodec", "mp3", "-ab", "64k",
        "audio/current.mp3"
    ])

# Create metadata
metadata = {
    "anchor": anchor_name,
    "timestamp": datetime.now().isoformat(),
    "phrase": phrase,
    "confusion_level": random.randint(70, 100)
}

import json
with open("audio/metadata.json", "w") as f:
    json.dump(metadata, f)

print("Audio generated successfully!")