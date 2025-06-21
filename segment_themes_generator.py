"""
Segment Theme Music and Sound Effects Generator
Creates unique jingles and audio assets for each show
"""

import json
import numpy as np
from typing import Dict, List, Tuple

class ThemeMusicGenerator:
    """Generate theme music descriptions for AI music generation"""
    
    def __init__(self):
        self.segments = self.define_all_segments()
        
    def define_all_segments(self) -> Dict:
        """Define all news segments and their musical themes"""
        return {
            # Main News Programs
            'morning_static': {
                'name': 'Morning Static',
                'time': '6:00 AM - 9:00 AM',
                'hosts': ['Chad Armstrong', 'Amanda Sunshine'],
                'theme': {
                    'style': 'upbeat morning show',
                    'tempo': 140,
                    'instruments': ['synthesizer', 'drums', 'electric guitar'],
                    'mood': 'energetic chaos',
                    'duration': 15,
                    'prompt': 'Energetic morning show theme, upbeat synth pop, air horns, 140 bpm, major key, coffee commercial energy'
                },
                'stingers': {
                    'intro': 'Rising synth sweep with air horn',
                    'outro': 'Quick drum fill to silence',
                    'break': 'Cheerful chime sequence'
                }
            },
            
            'static_central': {
                'name': 'Static Central',
                'time': '12:00 PM, 6:00 PM, 11:00 PM',
                'hosts': ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton'],
                'theme': {
                    'style': 'serious news theme',
                    'tempo': 120,
                    'instruments': ['orchestra', 'brass section', 'timpani'],
                    'mood': 'urgent importance',
                    'duration': 20,
                    'prompt': 'Epic news theme, orchestral brass, urgent strings, timpani rolls, 120 bpm, minor key, CNN-style drama'
                },
                'stingers': {
                    'breaking': 'Three dramatic horn blasts',
                    'update': 'Quick string crescendo',
                    'analysis': 'Thoughtful piano phrase'
                }
            },
            
            'market_meltdown': {
                'name': 'Market Meltdown with Brick & Tiffany',
                'time': '9:30 AM, 2:00 PM',
                'hosts': ['Brick Stevens', 'Tiffany Goldwater'],
                'theme': {
                    'style': 'financial news chaos',
                    'tempo': 130,
                    'instruments': ['electronic', 'cash register', 'alarm bells'],
                    'mood': 'controlled panic',
                    'duration': 12,
                    'prompt': 'Fast-paced financial news theme, electronic beats, cash register sounds, alarm bells, 130 bpm, ascending chromatic'
                },
                'sound_effects': {
                    'market_up': 'Cash register cha-ching',
                    'market_down': 'Slide whistle down',
                    'desk_slam': 'Wood impact with reverb'
                }
            },
            
            'eat_it_its_food': {
                'name': "Eat It. It's Food!",
                'time': '10:30 AM',
                'hosts': ['Paula Dine'],
                'theme': {
                    'style': 'southern cooking show',
                    'tempo': 95,
                    'instruments': ['banjo', 'harmonica', 'kitchen sounds'],
                    'mood': 'butter worship',
                    'duration': 10,
                    'prompt': 'Southern cooking show theme, banjo, harmonica, sizzling sounds, 95 bpm, major key, food network style'
                },
                'sound_effects': {
                    'butter_sizzle': 'Extended sizzle with pop',
                    'pan_throw': 'Metal clang with crash',
                    'gravy_pour': 'Liquid glug sound'
                }
            },
            
            'storm_watch': {
                'name': 'Storm Watch',
                'time': 'Every 30 minutes',
                'hosts': ['Storm Chaserson'],
                'theme': {
                    'style': 'anxious weather report',
                    'tempo': 110,
                    'instruments': ['synthesizer', 'wind sounds', 'thunder'],
                    'mood': 'meteorological anxiety',
                    'duration': 8,
                    'prompt': 'Nervous weather theme, swirling synths, wind sounds, distant thunder, 110 bpm, minor key, building tension'
                },
                'sound_effects': {
                    'rain_panic': 'Rain with scared breathing',
                    'green_screen': 'Digital glitch sound',
                    'wind': 'Howling wind loop'
                }
            },
            
            'oreally_factor': {
                'name': "The O'Really Factor",
                'time': '5:00 PM',
                'hosts': ['William O\'Really', 'Jessica Agrees'],
                'theme': {
                    'style': 'aggressive political show',
                    'tempo': 125,
                    'instruments': ['electric guitar', 'drums', 'patriotic brass'],
                    'mood': 'righteous anger',
                    'duration': 18,
                    'prompt': 'Aggressive political show theme, distorted guitar, military drums, brass hits, 125 bpm, power chords'
                },
                'stingers': {
                    'point': 'Single dramatic brass hit',
                    'agreement': 'Ascending harp gliss',
                    'commercial': 'Patriotic drum roll'
                }
            },
            
            'weekend_static': {
                'name': 'Weekend Static',
                'time': 'Saturdays & Sundays',
                'hosts': ['Weekend Wendy', 'Intern Steve'],
                'theme': {
                    'style': 'relaxed weekend news',
                    'tempo': 100,
                    'instruments': ['acoustic guitar', 'light percussion', 'coffee shop ambience'],
                    'mood': 'casual incompetence',
                    'duration': 12,
                    'prompt': 'Relaxed weekend news theme, acoustic guitar, bongos, coffee shop sounds, 100 bpm, major key, NPR weekend vibes'
                },
                'sound_effects': {
                    'coffee_sip': 'Loud slurping sound',
                    'paper_shuffle': 'Frantic page turning',
                    'mic_feedback': 'High pitched squeal'
                }
            },
            
            'tech_glitch': {
                'name': 'Tech Glitch with Kevin',
                'time': '3:30 PM',
                'hosts': ['Kevin Debugger'],
                'theme': {
                    'style': 'glitchy tech show',
                    'tempo': 128,
                    'instruments': ['chiptune', 'modem sounds', 'keyboard clicks'],
                    'mood': 'digital chaos',
                    'duration': 10,
                    'prompt': 'Glitchy tech show theme, 8-bit chiptune, modem sounds, keyboard typing, 128 bpm, digital artifacts'
                }
            },
            
            'hollywood_static': {
                'name': 'Hollywood Static',
                'time': '7:30 PM',
                'hosts': ['Sparkle Hollywood'],
                'theme': {
                    'style': 'glamorous entertainment news',
                    'tempo': 118,
                    'instruments': ['strings', 'champagne pop', 'camera clicks'],
                    'mood': 'superficial glamour',
                    'duration': 14,
                    'prompt': 'Glamorous entertainment theme, sweeping strings, champagne pops, paparazzi cameras, 118 bpm, major key'
                }
            }
        }
    
    def generate_sound_effects_library(self) -> Dict:
        """Define all sound effects needed for the broadcast"""
        return {
            'transitions': {
                'whoosh': 'Quick swoosh sound for scene changes',
                'static_burst': 'Brief static noise for glitches',
                'news_sting': 'Dramatic three-note news alert',
                'breaking_news': 'Urgent alarm with reverb'
            },
            
            'character_sounds': {
                'burp': 'Various burp sounds (small, medium, epic)',
                'fart': 'Chair squeak that sounds suspicious',
                'sob': 'Crying with sniffles',
                'nervous_laugh': 'Awkward forced laughter',
                'sigh': 'Existential exhaustion exhale',
                'gulp': 'Nervous swallow sound',
                'hiccup': 'Sudden hiccup interruption'
            },
            
            'environment': {
                'newsroom': {
                    'typing': 'Keyboard clacking loop',
                    'phones': 'Office phones ringing',
                    'printer': 'Dot matrix printer sounds',
                    'coffee_machine': 'Brewing and steaming'
                },
                'studio': {
                    'chair_squeak': 'Office chair rotation',
                    'paper_rustle': 'Script pages shuffling',
                    'mic_bump': 'Microphone handling noise',
                    'headphone_feedback': 'High-pitched squeal'
                },
                'kitchen': {
                    'sizzle': 'Bacon frying sound',
                    'chop': 'Knife on cutting board',
                    'microwave': 'Beeping and humming',
                    'mixer': 'Electric mixer whirring'
                },
                'field': {
                    'traffic': 'City traffic ambience',
                    'crowd': 'Murmuring crowd noise',
                    'sirens': 'Emergency vehicles passing',
                    'construction': 'Jackhammer and drilling'
                }
            },
            
            'breakdown_sounds': {
                'head_bang': 'Dull thud with reverb',
                'desk_flip': 'Crashing furniture sound',
                'glass_break': 'Something expensive shattering',
                'scream': 'Existential crisis yell',
                'equipment_malfunction': 'Electronic failure noise'
            },
            
            'commercial_sounds': {
                'cash_register': 'Old-timey cha-ching',
                'sparkle': 'Magic wand sound effect',
                'whomp': 'Bass drop for emphasis',
                'applause': 'Canned studio audience',
                'rimshot': 'Bad joke punctuation'
            }
        }
    
    def generate_music_prompts(self) -> Dict:
        """Generate AI music generation prompts for each segment"""
        prompts = {}
        
        for segment_id, segment in self.segments.items():
            theme = segment['theme']
            
            # Main theme prompt
            prompts[segment_id] = {
                'full_theme': theme['prompt'],
                'short_version': f"{theme['prompt']}, 5 second version, just the hook",
                'bed_music': f"{theme['prompt']}, instrumental bed, loopable, subtle, {theme['tempo']-20} bpm",
                'breaking_news': f"Urgent breaking news variant of {theme['style']}, dramatic, intense"
            }
            
            # Stinger prompts
            if 'stingers' in segment:
                prompts[segment_id]['stingers'] = {}
                for stinger_name, description in segment['stingers'].items():
                    prompts[segment_id]['stingers'][stinger_name] = f"Short musical stinger: {description}, 2-3 seconds"
        
        return prompts
    
    def save_configurations(self):
        """Save all audio configurations"""
        config = {
            'segments': self.segments,
            'sound_effects': self.generate_sound_effects_library(),
            'music_prompts': self.generate_music_prompts(),
            'audio_settings': {
                'sample_rate': 44100,
                'bit_depth': 16,
                'channels': 2,
                'normalization': -3.0,  # dB
                'compression': {
                    'ratio': 4.0,
                    'threshold': -20.0,
                    'attack': 5.0,
                    'release': 50.0
                }
            }
        }
        
        with open('segment_themes_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        return config

if __name__ == "__main__":
    generator = ThemeMusicGenerator()
    config = generator.save_configurations()
    
    print(f"Generated theme music for {len(config['segments'])} segments")
    print(f"Sound effects library: {sum(len(cat) for cat in config['sound_effects'].values())} effects")
    
    print("\nSample segment themes:")
    for segment_id, segment in list(config['segments'].items())[:3]:
        print(f"\n{segment['name']}:")
        print(f"  Time: {segment['time']}")
        print(f"  Style: {segment['theme']['style']}")
        print(f"  Tempo: {segment['theme']['tempo']} BPM")
        print(f"  Mood: {segment['theme']['mood']}")