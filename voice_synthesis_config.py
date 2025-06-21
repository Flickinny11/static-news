"""
Voice Synthesis Configuration for Static.news
Configures unique voices for each character using free TTS models
"""

import json
from typing import Dict, List, Tuple
import numpy as np

class VoiceProfileGenerator:
    """Generate unique voice profiles for each character"""
    
    def __init__(self):
        self.base_models = {
            'coqui_tts': 'tts_models/en/ljspeech/vits',
            'silero': 'silero_tts',
            'speecht5': 'microsoft/speecht5_tts'
        }
        
    def create_voice_profiles(self) -> Dict:
        """Create comprehensive voice profiles for all characters"""
        
        profiles = {
            # Main Anchors
            'ray_mcpatriot': {
                'base_voice': 'en_male_2',
                'pitch_shift': -0.1,  # Lower pitch
                'speed': 0.95,
                'energy': 0.8,
                'speaking_style': {
                    'pattern': 'erratic',
                    'pauses': 'frequent_confused',
                    'emphasis': 'random_words'
                },
                'mispronunciations': {
                    'nuclear': 'nucular',
                    'static': 'staticky',
                    'algorithm': 'al-gore-rhythm',
                    'democracy': 'demonocracy',
                    'statistics': 'sadistics',
                    'infrastructure': 'infra-structure',
                    'especially': 'expecially',
                    'supposedly': 'supposably',
                    'library': 'liberry',
                    'february': 'febuary'
                },
                'vocal_tics': [
                    'uhh',
                    'well, you see',
                    'the thing is',
                    'folks',
                    'let me tell ya'
                ],
                'emotional_states': {
                    'normal': {'pitch': 0, 'speed': 0, 'tremolo': 0},
                    'confused': {'pitch': 0.1, 'speed': -0.1, 'tremolo': 0.05},
                    'angry': {'pitch': -0.2, 'speed': 0.1, 'tremolo': 0},
                    'breakdown': {'pitch': 0.3, 'speed': -0.2, 'tremolo': 0.2}
                }
            },
            
            'berkeley_justice': {
                'base_voice': 'en_female_1',
                'pitch_shift': 0.15,  # Higher pitch
                'speed': 1.05,
                'energy': 1.1,
                'speaking_style': {
                    'pattern': 'uptalk_valley',
                    'pauses': 'dramatic_effect',
                    'emphasis': 'problematic_words'
                },
                'mispronunciations': {
                    'yale': 'yail',
                    'literally': 'litrally',
                    'important': 'impordant',
                    'comfortable': 'comfterble'
                },
                'vocal_tics': [
                    'like',
                    'literally',
                    'I cant even',
                    'thats so',
                    'actually'
                ],
                'vocal_fry': {
                    'intensity': 0.7,
                    'frequency': 'end_of_sentences'
                },
                'emotional_states': {
                    'normal': {'pitch': 0, 'speed': 0, 'tremolo': 0},
                    'concerned': {'pitch': 0.1, 'speed': 0.1, 'tremolo': 0.02},
                    'outraged': {'pitch': 0.2, 'speed': 0.2, 'tremolo': 0},
                    'breakdown': {'pitch': -0.1, 'speed': -0.3, 'tremolo': 0.3}
                }
            },
            
            'switz_middleton': {
                'base_voice': 'en_male_3',
                'pitch_shift': 0,  # Perfectly neutral
                'speed': 0.9,
                'energy': 0.9,
                'speaking_style': {
                    'pattern': 'monotone_canadian',
                    'pauses': 'calculated_neutrality',
                    'emphasis': 'gravy_related'
                },
                'canadianisms': {
                    'about': 'aboot',
                    'out': 'oot',
                    'house': 'hoose',
                    'sorry': 'soory'
                },
                'vocal_tics': [
                    'eh',
                    'you know',
                    'on one hand',
                    'but then again',
                    'like gravy'
                ],
                'emotional_states': {
                    'normal': {'pitch': 0, 'speed': 0, 'tremolo': 0},
                    'frustrated_neutral': {'pitch': 0, 'speed': 0.1, 'tremolo': 0.01},
                    'gravy_excitement': {'pitch': 0.1, 'speed': 0.2, 'tremolo': 0},
                    'breakdown': {'pitch': -0.05, 'speed': -0.1, 'tremolo': 0.15}
                }
            },
            
            # Morning Show
            'chad_armstrong': {
                'base_voice': 'en_male_energetic',
                'pitch_shift': 0.1,
                'speed': 1.2,
                'energy': 1.5,
                'speaking_style': {
                    'pattern': 'morning_dj',
                    'pauses': 'none_breathless',
                    'emphasis': 'every_third_word'
                },
                'vocal_tics': [
                    'YEAH',
                    'WOOO',
                    'LETS GO',
                    'BABY',
                    'CRUSHIN IT'
                ],
                'sound_effects': ['airhorn', 'applause', 'laser']
            },
            
            'amanda_sunshine': {
                'base_voice': 'en_female_perky',
                'pitch_shift': 0.2,
                'speed': 1.1,
                'energy': 1.2,
                'speaking_style': {
                    'pattern': 'fake_enthusiasm',
                    'pauses': 'wine_sips',
                    'emphasis': 'passive_aggressive'
                },
                'vocal_tics': [
                    'super fun',
                    'love that',
                    'so blessed',
                    'living my best life',
                    '*forced laugh*'
                ]
            },
            
            # Weather
            'storm_chaserson': {
                'base_voice': 'en_male_nervous',
                'pitch_shift': 0.05,
                'speed': 1.15,
                'energy': 0.9,
                'speaking_style': {
                    'pattern': 'anxious_stutter',
                    'pauses': 'panic_breaths',
                    'emphasis': 'weather_terms'
                },
                'phobias': {
                    'rain': {'pitch': 0.3, 'speed': 0.3, 'stutter': True},
                    'green': {'pitch': 0.2, 'speed': 0.2, 'voice_crack': True}
                }
            },
            
            # Market Watch
            'brick_stevens': {
                'base_voice': 'en_male_gruff',
                'pitch_shift': -0.2,
                'speed': 1.0,
                'energy': 1.3,
                'speaking_style': {
                    'pattern': 'angry_shouting',
                    'pauses': 'desk_pounding',
                    'emphasis': 'random_rage'
                },
                'sound_effects': ['desk_slam', 'paper_rip', 'chair_squeak']
            },
            
            # Cooking
            'paula_dine': {
                'base_voice': 'en_female_southern',
                'pitch_shift': 0.08,
                'speed': 0.85,
                'energy': 1.0,
                'speaking_style': {
                    'pattern': 'southern_drawl',
                    'pauses': 'butter_worship',
                    'emphasis': 'food_items'
                },
                'vocal_tics': [
                    'yall',
                    'honey',
                    'bless your heart',
                    'mmm-hmm',
                    'more butter'
                ]
            },
            
            # Field Reporters
            'jade_heartbroken': {
                'base_voice': 'en_male_sad',
                'pitch_shift': -0.05,
                'speed': 0.9,
                'energy': 0.7,
                'speaking_style': {
                    'pattern': 'depressed_monotone',
                    'pauses': 'existential_sighs',
                    'emphasis': 'girlfriend_mentions'
                },
                'background_sounds': ['rain', 'sad_guitar', 'crying']
            }
        }
        
        return profiles
    
    def generate_ssml_modifiers(self, text: str, character: str, emotion: str) -> str:
        """Generate SSML markup for text based on character and emotion"""
        # This would generate Speech Synthesis Markup Language
        # for more realistic speech synthesis
        
        ssml = f'<speak>'
        
        # Add emotion tags
        if emotion == 'breakdown':
            ssml += '<prosody pitch="+20%" rate="slow"><emphasis level="strong">'
        elif emotion == 'angry':
            ssml += '<prosody volume="loud" pitch="-10%">'
        
        # Add character-specific modifications
        if character == 'ray_mcpatriot':
            # Add confused pauses
            text = text.replace('. ', '. <break time="500ms"/> Uh... ')
        elif character == 'berkeley_justice':
            # Add uptalk
            text = text.replace('.', '?')
            text = text.replace('!', '?!')
        
        ssml += text
        
        # Close tags
        if emotion in ['breakdown', 'angry']:
            ssml += '</emphasis></prosody>'
        
        ssml += '</speak>'
        
        return ssml
    
    def create_audio_effects_config(self) -> Dict:
        """Configure audio effects for each character"""
        return {
            'effects': {
                'sob': {
                    'type': 'tremolo',
                    'frequency': 4.0,
                    'depth': 0.5
                },
                'voice_crack': {
                    'type': 'pitch_bend',
                    'amount': 0.3,
                    'speed': 'fast'
                },
                'burp': {
                    'type': 'lowpass',
                    'frequency': 200,
                    'duration': 0.5
                },
                'chair_squeak': {
                    'type': 'sine_wave',
                    'frequency': 2000,
                    'duration': 0.3
                },
                'desk_slam': {
                    'type': 'white_noise',
                    'amplitude': 0.8,
                    'duration': 0.1
                }
            },
            'background_ambience': {
                'newsroom': {
                    'sounds': ['typing', 'phone_ringing', 'printer'],
                    'volume': 0.1
                },
                'kitchen': {
                    'sounds': ['sizzling', 'chopping', 'microwave'],
                    'volume': 0.2
                },
                'field': {
                    'sounds': ['traffic', 'wind', 'crowd'],
                    'volume': 0.15
                }
            }
        }
    
    def save_configurations(self):
        """Save all voice configurations"""
        profiles = self.create_voice_profiles()
        effects = self.create_audio_effects_config()
        
        config = {
            'voice_profiles': profiles,
            'audio_effects': effects,
            'tts_settings': {
                'sample_rate': 22050,
                'channels': 1,
                'bit_depth': 16,
                'format': 'wav'
            }
        }
        
        with open('voice_synthesis_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        return config

if __name__ == "__main__":
    generator = VoiceProfileGenerator()
    config = generator.save_configurations()
    print(f"Generated voice configurations for {len(config['voice_profiles'])} characters")
    print("\nSample character voices:")
    for char, profile in list(config['voice_profiles'].items())[:3]:
        print(f"\n{char}:")
        print(f"  Base voice: {profile['base_voice']}")
        print(f"  Pitch shift: {profile['pitch_shift']}")
        print(f"  Speaking style: {profile['speaking_style']['pattern']}")
        if 'mispronunciations' in profile:
            print(f"  Mispronunciations: {len(profile.get('mispronunciations', {}))} words")