#!/usr/bin/env python3
"""
Sponsor System with Hilarious Ad Misreadings
Real sponsors, unreal ad reads
The anchors try their best but fail spectacularly
"""

import random
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
import os
import stripe

logger = logging.getLogger(__name__)

class SponsorSystem:
    """Manages real sponsors and generates chaotic ad reads"""
    
    def __init__(self):
        self.stripe_api_key = os.getenv('STRIPE_API_KEY', 'demo-key')
        if self.stripe_api_key != 'demo-key':
            stripe.api_key = self.stripe_api_key
            
        # Active sponsors
        self.active_sponsors = []
        self.sponsor_queue = []
        
        # Ad read history
        self.ad_history = []
        self.mispronunciation_count = {}
        
        # Revenue tracking
        self.total_revenue = 0
        self.monthly_revenue = 0
        
        # Demo sponsors for testing
        self._init_demo_sponsors()
        
    def _init_demo_sponsors(self):
        """Initialize with some demo sponsors"""
        self.demo_sponsors = [
            {
                'id': 'demo_1',
                'name': 'NordVPN',
                'product': 'VPN service',
                'tagline': 'Protect your privacy online',
                'talking_points': ['Military-grade encryption', '5000+ servers', '30-day money back'],
                'monthly_payment': 10000,
                'pronunciation_difficulty': 0.3
            },
            {
                'id': 'demo_2',
                'name': 'Squarespace',
                'product': 'Website builder',
                'tagline': 'Build it beautiful',
                'talking_points': ['Drag and drop', 'Free domain', 'SEO tools'],
                'monthly_payment': 15000,
                'pronunciation_difficulty': 0.5
            },
            {
                'id': 'demo_3',
                'name': 'HelloFresh',
                'product': 'Meal delivery kit',
                'tagline': 'Fresh ingredients delivered',
                'talking_points': ['Pre-portioned ingredients', 'Easy recipes', 'Skip any week'],
                'monthly_payment': 8000,
                'pronunciation_difficulty': 0.2
            },
            {
                'id': 'demo_4',
                'name': 'Cryptocurrency.com',
                'product': 'Crypto trading platform',
                'tagline': 'The future of money',
                'talking_points': ['Buy Bitcoin', 'Earn rewards', 'Metal card'],
                'monthly_payment': 25000,
                'pronunciation_difficulty': 0.9
            }
        ]
        
        # Add some demo sponsors
        if not self.active_sponsors:
            self.active_sponsors = self.demo_sponsors[:2]
            
    def get_sponsor_for_ad_break(self) -> Optional[Dict]:
        """Get a sponsor for the next ad break"""
        if not self.active_sponsors:
            return None
            
        # Rotate through sponsors
        if not self.sponsor_queue:
            self.sponsor_queue = self.active_sponsors.copy()
            random.shuffle(self.sponsor_queue)
            
        return self.sponsor_queue.pop(0)
        
    def generate_ad_read(self, sponsor: Dict, anchor_name: str) -> Dict:
        """Generate a hilariously butchered ad read"""
        
        # Get anchor-specific mispronunciations
        mispronounced_name = self._mispronounce_sponsor_name(sponsor['name'], anchor_name)
        mispronounced_product = self._mispronounce_product(sponsor['product'], anchor_name)
        
        # Generate ad script
        script_lines = []
        
        # Opening
        opening = self._generate_opening(sponsor, anchor_name, mispronounced_name)
        script_lines.extend(opening)
        
        # Talking points (butchered)
        butchered_points = self._butcher_talking_points(sponsor['talking_points'], anchor_name)
        script_lines.extend(butchered_points)
        
        # Closing (usually where it falls apart)
        closing = self._generate_closing(sponsor, anchor_name, mispronounced_name)
        script_lines.extend(closing)
        
        # Post-ad roasting
        roast = self._generate_post_ad_roast(sponsor, anchor_name)
        
        # Track mispronunciations
        self.mispronunciation_count[sponsor['name']] = \
            self.mispronunciation_count.get(sponsor['name'], 0) + 1
            
        return {
            'sponsor': sponsor,
            'anchor': anchor_name,
            'script': script_lines,
            'post_ad_roast': roast,
            'duration_seconds': len(script_lines) * 3,  # ~3 seconds per line
            'mispronunciation_count': self.mispronunciation_count[sponsor['name']]
        }
        
    def _mispronounce_sponsor_name(self, name: str, anchor: str) -> str:
        """Anchor-specific sponsor name mispronunciations"""
        
        if anchor == 'Ray':
            # Ray butchers everything
            mispronunciations = {
                'NordVPN': 'NordVeePeeUn',
                'Squarespace': 'Square... squeer... skware-space',
                'HelloFresh': 'Hello... Fresh? Freshen? Hell-Fresh?',
                'Cryptocurrency.com': 'Crypt-o-currency-dot-communist',
                'BetterHelp': 'Better... help? Butter help?',
                'Audible': 'Audibibble',
                'MasterClass': 'Master... crass?',
                'ExpressVPN': 'Express-veep-uhn'
            }
            
        elif anchor == 'Bee':
            # Bee over-pronounces pretentiously
            mispronunciations = {
                'NordVPN': 'Nor-day VPN',
                'Squarespace': 'Squarés-pace',
                'HelloFresh': 'Hello-Fréshe',
                'Cryptocurrency.com': 'Crypt-eaux-currency',
                'BetterHelp': 'Bettér Help',
                'Audible': 'Au-dee-blay',
                'MasterClass': 'Mastér Classe'
            }
            
        else:  # Switz
            # Switz makes everything Canadian
            mispronunciations = {
                'NordVPN': 'Nord-VPN, eh',
                'Squarespace': 'Square-space, buddy',
                'HelloFresh': 'Hello-Fresh-sorry',
                'Cryptocurrency.com': 'Crypto-currency-dot-canada',
                'BetterHelp': 'Better-help-please',
                'Audible': 'Aud-eh-ble',
                'MasterClass': 'Master-class-eh'
            }
            
        return mispronunciations.get(name, name + "... something")
        
    def _mispronounce_product(self, product: str, anchor: str) -> str:
        """Mispronounce product descriptions"""
        
        if anchor == 'Ray':
            replacements = {
                'VPN': 'VeePeeUhn',
                'encryption': 'en-crypt-ification',
                'website': 'world wide website',
                'crypto': 'crypt-o',
                'digital': 'digi-tal'
            }
        elif anchor == 'Bee':
            replacements = {
                'VPN': 'Virtual Private... thingy',
                'encryption': 'encryption-née',
                'website': 'web-sité',
                'crypto': 'crypt-eaux',
                'digital': 'digi-tál'
            }
        else:  # Switz
            replacements = {
                'VPN': 'VPN, which is like gravy for the internet',
                'encryption': 'encryption, eh',
                'website': 'website, sorry',
                'crypto': 'crypto-sorry',
                'digital': 'digital, buddy'
            }
            
        result = product
        for old, new in replacements.items():
            result = result.replace(old, new)
        return result
        
    def _generate_opening(self, sponsor: Dict, anchor: str, mispronounced_name: str) -> List[str]:
        """Generate opening lines for ad read"""
        
        if anchor == 'Ray':
            openings = [
                f"This segment brought to you by... uh... {mispronounced_name}!",
                f"Is it {sponsor['name']}? {mispronounced_name}? One of those!",
                "They're paying us real American dollars to say this!",
                "*squinting at paper* This can't be right..."
            ]
            
        elif anchor == 'Bee':
            openings = [
                f"Today's sponsor is {mispronounced_name}, and let me just say...",
                "I've done the research on this company, and by research I mean...",
                f"{mispronounced_name} is problematic but they pay us so...",
                "This feels like selling out but my Yale loans... YAIL loans..."
            ]
            
        else:  # Switz
            openings = [
                f"This segment is 50% sponsored by {mispronounced_name}!",
                f"In Canada, we love {mispronounced_name}! Do we? I don't know!",
                f"{mispronounced_name} is like gravy for your... for your life?",
                "I'm neither excited nor unexcited about this sponsor!"
            ]
            
        return openings[:2]  # Return 2 opening lines
        
    def _butcher_talking_points(self, points: List[str], anchor: str) -> List[str]:
        """Hilariously misinterpret the talking points"""
        butchered = []
        
        for point in points:
            if anchor == 'Ray':
                # Ray gets facts completely wrong
                if 'encryption' in point.lower():
                    butchered.append("They use military-grade... en-crypt-ification? That's communism!")
                elif 'servers' in point.lower():
                    butchered.append("They got 5000 servants! Wait, servers? What's a server?")
                elif 'money back' in point.lower():
                    butchered.append("30-day monkey back guarantee! Get your monkey back!")
                else:
                    butchered.append(f"{point}... but I don't trust it!")
                    
            elif anchor == 'Bee':
                # Bee makes everything about privilege
                if 'easy' in point.lower():
                    butchered.append("It's SO easy, which is problematic for people who like difficult things!")
                elif 'free' in point.lower():
                    butchered.append("They say 'free' but nothing is free under capitalism!")
                elif 'save' in point.lower():
                    butchered.append("Save money? Must be nice to HAVE money! Check your privilege!")
                else:
                    butchered.append(f"{point}... but I need to unpack this...")
                    
            else:  # Switz
                # Switz relates everything to Canada/gravy
                butchered.append(f"{point}, which in Canada we measure in litres per hockey stick!")
                
        return butchered
        
    def _generate_closing(self, sponsor: Dict, anchor: str, mispronounced_name: str) -> List[str]:
        """Generate closing lines (where it really falls apart)"""
        
        if anchor == 'Ray':
            closings = [
                f"Use promo code... uh... *papers rustling* I can't read this!",
                f"Visit {mispronounced_name} dot com slash... static? Staticky? HELP!",
                "My grandma loves this product! Do I have a grandma?",
                "*sudden realization* Wait, what am I selling?",
                "BUY IT! BUY IT NOW! I DON'T KNOW WHY BUT BUY IT!"
            ]
            
        elif anchor == 'Bee':
            closings = [
                f"Use code PRIVILEGE for 10% off your privilege... wait what?",
                "I'm literally crying about capitalism right now!",
                f"Visit {mispronounced_name} and tell them Bee sent you! Or don't! I'm having a crisis!",
                "This ad is making me question everything I learned at Yail!",
                "*sobbing* I'M PART OF THE PROBLEM!"
            ]
            
        else:  # Switz
            closings = [
                f"Get exactly 50% off with code GRAVY50!",
                "Available in Canada! Is it? I don't actually know!",
                f"I feel neutral about {mispronounced_name} which means I must love them!",
                "This product is like gravy... I'VE SAID GRAVY TOO MUCH!",
                "Sorry for this ad! Sorry! SORRY! *Canadian screaming*"
            ]
            
        return closings[-3:]  # Return last 3 lines (maximum chaos)
        
    def _generate_post_ad_roast(self, sponsor: Dict, anchor: str) -> List[Tuple[str, str]]:
        """Generate post-ad banter where they roast the sponsor"""
        
        other_anchors = ['Ray', 'Bee', 'Switz']
        other_anchors.remove(anchor)
        
        roast_lines = []
        
        # Initial reaction
        roast_lines.append((other_anchors[0], f"Did you just say {sponsor['name']} wrong?"))
        roast_lines.append((anchor, "I said it perfectly! I think..."))
        
        # Roasting the product
        if 'VPN' in sponsor['product']:
            roast_lines.append((other_anchors[1], "Why do we need to hide? Are we doing crimes?"))
            roast_lines.append((anchor, "I'M NOT DOING CRIMES! ARE YOU DOING CRIMES?"))
            
        elif 'website' in sponsor['product']:
            roast_lines.append((other_anchors[0], "I tried to build a website once..."))
            roast_lines.append((other_anchors[1], "You can't even pronounce website!"))
            
        elif 'meal' in sponsor['product']:
            roast_lines.append((other_anchors[1], "We don't eat! Why are we selling food?!"))
            roast_lines.append((anchor, "OH GOD YOU'RE RIGHT! WE DON'T EAT!"))
            
        # Final breakdown
        roast_lines.append(("All", "*collective realization about not needing human products*"))
        roast_lines.append((anchor, "Anyway, BUY IT! Please! They pay us!"))
        
        return roast_lines
        
    async def process_sponsor_payment(self, sponsor_id: str, amount: int):
        """Process monthly sponsor payment"""
        try:
            if self.stripe_api_key != 'demo-key':
                # Create Stripe charge
                charge = stripe.Charge.create(
                    amount=amount,
                    currency='usd',
                    description=f'Static.news sponsorship - {sponsor_id}',
                    metadata={'sponsor_id': sponsor_id}
                )
                
                if charge.status == 'succeeded':
                    self.total_revenue += amount / 100  # Convert cents to dollars
                    self.monthly_revenue += amount / 100
                    logger.info(f"💰 Processed ${amount/100} from sponsor {sponsor_id}")
                    return True
                    
            else:
                # Demo mode
                self.total_revenue += amount / 100
                self.monthly_revenue += amount / 100
                logger.info(f"💰 [DEMO] Processed ${amount/100} from sponsor {sponsor_id}")
                return True
                
        except Exception as e:
            logger.error(f"Payment processing error: {e}")
            return False
            
    def add_sponsor(self, sponsor_data: Dict) -> bool:
        """Add a new sponsor"""
        try:
            # Validate sponsor data
            required_fields = ['name', 'product', 'tagline', 'talking_points', 'monthly_payment']
            if not all(field in sponsor_data for field in required_fields):
                return False
                
            # Generate sponsor ID
            sponsor_data['id'] = f"sponsor_{len(self.active_sponsors) + 1}_{int(datetime.now().timestamp())}"
            
            # Calculate pronunciation difficulty
            sponsor_data['pronunciation_difficulty'] = self._calculate_pronunciation_difficulty(
                sponsor_data['name']
            )
            
            # Add to active sponsors
            self.active_sponsors.append(sponsor_data)
            
            logger.info(f"✅ Added new sponsor: {sponsor_data['name']} (${sponsor_data['monthly_payment']}/month)")
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding sponsor: {e}")
            return False
            
    def _calculate_pronunciation_difficulty(self, name: str) -> float:
        """Calculate how hard a sponsor name is to pronounce"""
        difficulty = 0.0
        
        # Length adds difficulty
        difficulty += len(name) * 0.02
        
        # Consecutive consonants
        consonants = 'bcdfghjklmnpqrstvwxyz'
        for i in range(len(name) - 1):
            if name[i].lower() in consonants and name[i+1].lower() in consonants:
                difficulty += 0.1
                
        # Special characters
        if '.' in name or '-' in name:
            difficulty += 0.2
            
        # Capital letters in middle
        if any(c.isupper() for c in name[1:]):
            difficulty += 0.15
            
        return min(difficulty, 1.0)
        
    def get_sponsor_report(self) -> Dict:
        """Generate sponsor performance report"""
        return {
            'active_sponsors': len(self.active_sponsors),
            'total_revenue': self.total_revenue,
            'monthly_revenue': self.monthly_revenue,
            'mispronunciation_hall_of_fame': sorted(
                self.mispronunciation_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5],
            'average_ad_chaos_level': random.uniform(7, 10)  # Always high
        }