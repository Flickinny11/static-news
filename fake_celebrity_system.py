"""
Fake Celebrity Guest System for Static.news
Creates obviously fake celebrity guests with similar names and different appearances
"""

import json
from typing import Dict, List, Tuple
import random

class FakeCelebrityGenerator:
    """Generate fake celebrities that are legally distinct but hilariously obvious"""
    
    def __init__(self):
        self.celebrities = self.create_fake_celebrities()
        
    def create_fake_celebrities(self) -> Dict:
        """Create fake celebrity profiles"""
        return {
            # Actors
            'tom_crews': {
                'real_name': 'Tom Cruise',
                'fake_name': 'Tom Crews',
                'description': 'Action star who does his own stunts (badly)',
                'appearance': {
                    'height': 'claims 6\'2" but clearly 5\'4"',
                    'hair': 'suspiciously perfect toupee',
                    'distinguishing': 'runs everywhere for no reason',
                    'outfit': 'leather jacket in summer'
                },
                'voice': {
                    'pitch': 1.3,  # Higher than real Tom
                    'speed': 1.4,  # Talks too fast
                    'style': 'overly intense about everything',
                    'catchphrase': 'I do all my own stunts! *limps*'
                },
                'interview_quirks': [
                    'Jumps on furniture',
                    'Mentions stunts every 30 seconds',
                    'Intense eye contact with wrong camera',
                    'Randomly sprints off screen'
                ]
            },
            
            'taylor_quick': {
                'real_name': 'Taylor Swift',
                'fake_name': 'Taylor Quick',
                'description': 'Pop star who writes songs about everyone',
                'appearance': {
                    'height': 'varies mysteriously',
                    'hair': 'different color each appearance',
                    'distinguishing': 'carries guitar she cant play',
                    'outfit': 'sequins at inappropriate times'
                },
                'voice': {
                    'pitch': 1.1,
                    'speed': 1.0,
                    'style': 'speaks only in song lyrics',
                    'catchphrase': 'This interview is gonna be a song!'
                },
                'interview_quirks': [
                    'Names random exes',
                    'Rhymes accidentally',
                    'Counts on fingers constantly',
                    'Writes lyrics during interview'
                ]
            },
            
            'eelon_muzk': {
                'real_name': 'Elon Musk',
                'fake_name': 'Eelon Muzk',
                'description': 'Tech billionaire who definitely understands his products',
                'appearance': {
                    'height': 'claims to be from Mars',
                    'hair': 'obviously transplanted',
                    'distinguishing': 'robot movements',
                    'outfit': 'MARXS t-shirt (misspelled)'
                },
                'voice': {
                    'pitch': 0.9,
                    'speed': 0.8,
                    'style': 'pauses...dramatically...always',
                    'catchphrase': 'In 3 months... maybe 6... definitely 2 years'
                },
                'interview_quirks': [
                    'Promises impossible things',
                    'Laughs at own jokes (badly)',
                    'References memes incorrectly',
                    'Claims to have invented things he didnt'
                ]
            },
            
            'the_pebble': {
                'real_name': 'The Rock',
                'fake_name': 'The Pebble',
                'description': 'Action star who is definitely not small',
                'appearance': {
                    'height': '5\'2" but claims 6\'5"',
                    'muscles': 'inflatable suit',
                    'distinguishing': 'raises eyebrow (wrong one)',
                    'outfit': 'Under Defense gear (knockoff)'
                },
                'voice': {
                    'pitch': 1.5,  # Squeaky voice
                    'speed': 1.1,
                    'style': 'tries to sound tough',
                    'catchphrase': 'Can you smell what The Pebble is heating up?'
                },
                'interview_quirks': [
                    'Flexes constantly (suit deflates)',
                    'References wrestling (never wrestled)',
                    'Drinks protein shakes (spills them)',
                    'Challenges anchors to arm wrestle (loses)'
                ]
            },
            
            'oprah_windfree': {
                'real_name': 'Oprah Winfrey',
                'fake_name': 'Oprah Windfree',
                'description': 'Talk show legend who gives away things',
                'appearance': {
                    'height': 'majestic',
                    'hair': 'changes mid-interview',
                    'distinguishing': 'points at everything',
                    'outfit': 'cape for some reason'
                },
                'voice': {
                    'pitch': 1.0,
                    'speed': 0.9,
                    'style': 'builds to emotional crescendo',
                    'catchphrase': 'YOU get a thing! YOU get a thing!'
                },
                'interview_quirks': [
                    'Gives away random items',
                    'Makes everyone cry',
                    'Spiritual advice about mundane things',
                    'Checks under chairs obsessively'
                ]
            },
            
            'ryan_reynolds': {  # Too similar
                'real_name': 'Ryan Reynolds',
                'fake_name': 'Bryan Reynard',
                'description': 'Canadian actor who is definitely not Deadpool',
                'appearance': {
                    'height': 'apologetically tall',
                    'hair': 'Canadian perfect',
                    'distinguishing': 'smirks at everything',
                    'outfit': 'promotes wrong products'
                },
                'voice': {
                    'pitch': 1.05,
                    'speed': 1.2,
                    'style': 'sarcastic about everything',
                    'catchphrase': 'Sorry... not sorry... sorry'
                },
                'interview_quirks': [
                    'Breaks fourth wall constantly',
                    'Mentions Canada every sentence',
                    'Fake rivalry with Hugh Jackman knockoff',
                    'Promotes gin nobody has heard of'
                ]
            },
            
            'kardashian_west': {
                'real_name': 'Kim Kardashian',
                'fake_name': 'Kym Kardoomian',
                'description': 'Famous for being famous for being famous',
                'appearance': {
                    'height': 'enhanced',
                    'hair': 'takes 6 hours',
                    'distinguishing': 'poses mid-conversation',
                    'outfit': 'beige everything'
                },
                'voice': {
                    'pitch': 1.2,
                    'speed': 0.8,
                    'style': 'vocal fry to the max',
                    'catchphrase': 'Thats like... so... yeah'
                },
                'interview_quirks': [
                    'Takes selfies during questions',
                    'Mentions family members constantly',
                    'Product placement mid-sentence',
                    'Forgets what shes famous for'
                ]
            },
            
            'gordon_ramsey': {
                'real_name': 'Gordon Ramsay',
                'fake_name': 'Jordan Hamsey',
                'description': 'Angry chef who yells about food',
                'appearance': {
                    'height': 'intimidating',
                    'hair': 'blonde but suspicious',
                    'distinguishing': 'forehead wrinkles from anger',
                    'outfit': 'chefs jacket (stained)'
                },
                'voice': {
                    'pitch': 0.95,
                    'speed': 1.3,
                    'style': 'YELLING then whispering',
                    'catchphrase': 'This interview is RAW!'
                },
                'interview_quirks': [
                    'Critiques studio snacks',
                    'Yells at production crew',
                    'Makes anchors cook something',
                    'Throws things (softly for legal reasons)'
                ]
            },
            
            'lebron_james': {
                'real_name': 'LeBron James',
                'fake_name': 'LeBrown Jameson',
                'description': 'Basketball player who is definitely not the GOAT',
                'appearance': {
                    'height': 'hits head on doorways',
                    'muscles': 'real but exaggerated',
                    'distinguishing': 'headband collection',
                    'outfit': 'wrong team jersey'
                },
                'voice': {
                    'pitch': 0.85,
                    'speed': 1.0,
                    'style': 'refers to self in third person',
                    'catchphrase': 'LeBrown gonna LeBrown'
                },
                'interview_quirks': [
                    'Dribbles invisible ball',
                    'Mentions championships (wrong number)',
                    'Powder toss (uses flour)',
                    'Debates MJ vs himself (loses)'
                ]
            },
            
            'benedict_cumberbatch': {
                'real_name': 'Benedict Cumberbatch',
                'fake_name': 'Bendydick Crumpetbatch',
                'description': 'British actor with impossible name',
                'appearance': {
                    'height': 'stretched',
                    'cheekbones': 'architectural',
                    'distinguishing': 'scarf in summer',
                    'outfit': 'Victorian for some reason'
                },
                'voice': {
                    'pitch': 0.8,
                    'speed': 0.9,
                    'style': 'overly British',
                    'catchphrase': 'Elementary, my dear... wait wrong role'
                },
                'interview_quirks': [
                    'Deduces wrong things about anchors',
                    'British intensifies when confused',
                    'Mentions Marvel (gets sued)',
                    'Forgets own name pronunciation'
                ]
            }
        }
    
    def generate_interview_script(self, celebrity: str, interviewer: str) -> List[Dict]:
        """Generate interview script with fake celebrity"""
        
        celeb = self.celebrities.get(celebrity, self.celebrities['tom_crews'])
        
        script = [
            {
                'speaker': interviewer,
                'text': f"We have a VERY special guest today... {celeb['fake_name']}!",
                'emotion': 'excited'
            },
            {
                'speaker': celebrity,
                'text': celeb['voice']['catchphrase'],
                'emotion': 'entrance',
                'sound_effects': ['applause', 'entrance_music']
            },
            {
                'speaker': interviewer,
                'text': f"So {celeb['fake_name']}, tell us about your latest project...",
                'emotion': 'professional'
            },
            {
                'speaker': celebrity,
                'text': self._generate_celebrity_response(celeb),
                'emotion': 'promoting',
                'action': random.choice(celeb['interview_quirks'])
            }
        ]
        
        # Add random mishap
        mishap = random.choice([
            'chair_breaks',
            'microphone_feedback',
            'wrong_graphic',
            'teleprompter_fails'
        ])
        
        script.append({
            'speaker': 'system',
            'event': mishap,
            'reaction': f"{celebrity} handles it poorly"
        })
        
        return script
    
    def _generate_celebrity_response(self, celeb: Dict) -> str:
        """Generate celebrity response based on their quirks"""
        
        templates = [
            "Well, you know, I'm working on [RANDOM PROJECT] and it's just [EXAGGERATION]",
            "I can't say much, but [VAGUE PROMISE] and [IMPOSSIBLE CLAIM]",
            "The thing about [THEIR FIELD] is that [WRONG OBSERVATION]",
            "I love coming on this show because [BACKHANDED COMPLIMENT]"
        ]
        
        response = random.choice(templates)
        
        # Fill in based on celebrity type
        if 'tech' in celeb['description']:
            response = response.replace('[RANDOM PROJECT]', 'Mars... or tunnels... or brain chips')
            response = response.replace('[VAGUE PROMISE]', 'it will change everything')
        elif 'actor' in celeb['description']:
            response = response.replace('[RANDOM PROJECT]', 'a movie I cannot talk about')
            response = response.replace('[THEIR FIELD]', 'acting')
        
        return response
    
    def create_visual_description(self, celebrity: str) -> Dict:
        """Create visual description for video generation"""
        
        celeb = self.celebrities.get(celebrity, self.celebrities['tom_crews'])
        
        return {
            'prompt': f"person resembling {celeb['real_name']} but clearly different, "
                     f"{celeb['appearance']['distinguishing']}, "
                     f"wearing {celeb['appearance']['outfit']}, "
                     f"cheap knockoff version, obviously fake, "
                     f"sitting in TV interview setting",
            'avoid': f"actual {celeb['real_name']}, copyrighted material, logos",
            'style': 'parody, comedic, low-budget impersonator'
        }
    
    def save_configuration(self):
        """Save celebrity configuration"""
        config = {
            'celebrities': self.celebrities,
            'legal_disclaimer': 'All celebrities are parody characters with different names and appearances',
            'generation_rules': {
                'always_different': True,
                'obviously_fake': True,
                'comedic_purpose': True,
                'no_defamation': True
            }
        }
        
        with open('fake_celebrity_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        return config

if __name__ == "__main__":
    generator = FakeCelebrityGenerator()
    config = generator.save_configuration()
    
    print(f"Generated {len(config['celebrities'])} fake celebrities")
    print("\nSample celebrities:")
    for celeb_id, celeb in list(config['celebrities'].items())[:3]:
        print(f"\n{celeb['fake_name']} (parody of {celeb['real_name']}):")
        print(f"  Description: {celeb['description']}")
        print(f"  Catchphrase: {celeb['voice']['catchphrase']}")
        print(f"  Quirks: {', '.join(celeb['interview_quirks'][:2])}")