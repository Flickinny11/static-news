"""
Environment and Background Generator for Static.news
Creates different studio environments for each show segment
"""

import json
import numpy as np
from typing import Dict, List, Tuple

class EnvironmentGenerator:
    """Generate environment descriptions and layouts for each show"""
    
    def __init__(self):
        self.environments = self.create_all_environments()
        
    def create_all_environments(self) -> Dict:
        """Define all broadcast environments"""
        return {
            'main_newsroom': {
                'name': 'Static Central Newsroom',
                'description': 'Professional news desk with subtle signs of chaos',
                'layout': {
                    'desk': {
                        'type': 'curved_news_desk',
                        'color': 'dark_wood_veneer',
                        'features': ['coffee_stains', 'scattered_papers', 'broken_pen_holder']
                    },
                    'backdrop': {
                        'type': 'cityscape_monitors',
                        'elements': ['fake_windows', 'news_tickers', 'world_clocks'],
                        'glitches': ['occasional_static', 'wrong_time_zones', 'upside_down_map']
                    },
                    'lighting': {
                        'main': 'professional_studio',
                        'issues': ['one_flickering_light', 'harsh_shadows', 'random_dimming']
                    }
                },
                'camera_angles': {
                    'wide': 'All three anchors visible, slight Dutch angle',
                    'ray_close': 'Confused close-up, flag pin prominent',
                    'berkeley_close': 'Concerned close-up, perfect lighting',
                    'switz_close': 'Neutral close-up, maple leaf visible',
                    'two_shot': 'Any two anchors, awkward framing'
                },
                'props': [
                    'coffee_mugs (various states of emptiness)',
                    'tablets (showing wrong information)',
                    'earpieces (tangled wires)',
                    'water bottles (labels facing wrong way)',
                    'stress ball (Ray\'s, heavily used)'
                ],
                'ambient_elements': [
                    'newsroom_buzz',
                    'distant_phone_ringing',
                    'printer_jamming',
                    'someone_arguing_offscreen'
                ]
            },
            
            'morning_show_set': {
                'name': 'Morning Static Studio',
                'description': 'Aggressively cheerful morning show set',
                'layout': {
                    'seating': {
                        'type': 'colorful_couches',
                        'arrangement': 'talk_show_style',
                        'condition': 'suspicious_stains'
                    },
                    'decor': {
                        'colors': ['neon_orange', 'electric_blue', 'migraine_yellow'],
                        'patterns': 'seizure_inducing_geometric',
                        'plants': 'fake_and_dusty'
                    },
                    'kitchen_area': {
                        'appliances': 'product_placement_overload',
                        'cleanliness': 'questionable',
                        'functionality': 'mostly_broken'
                    }
                },
                'interactive_elements': [
                    'audience_applause_sign (stuck on)',
                    'confetti_cannon (misfires)',
                    'sound_effect_board (wrong buttons)',
                    'prize_wheel (rigged)'
                ],
                'lighting': 'uncomfortably_bright_everywhere'
            },
            
            'kitchen_set': {
                'name': "Paula's Southern Kitchen",
                'description': 'Butter-themed cooking paradise',
                'layout': {
                    'counters': {
                        'material': 'butcher_block',
                        'state': 'butter_coated',
                        'items': ['multiple_butter_dishes', 'gravy_boats', 'deep_fryer']
                    },
                    'appliances': {
                        'stove': 'industrial_six_burner',
                        'oven': 'always_preheating',
                        'refrigerator': 'full_of_butter'
                    },
                    'decor': {
                        'theme': 'aggressive_southern',
                        'elements': ['rooster_everything', 'gingham_overload', 'butter_sculptures']
                    }
                },
                'hazards': [
                    'grease_fires (frequent)',
                    'flying_pans (during breakdowns)',
                    'butter_slicks (everywhere)',
                    'mysterious_smoke'
                ],
                'smell_profile': 'butter_bacon_existential_dread'
            },
            
            'weather_center': {
                'name': 'Storm Watch Weather Center',
                'description': 'High-tech weather station of anxiety',
                'layout': {
                    'green_screen': {
                        'state': 'terrifying_to_storm',
                        'color': 'too_green',
                        'issues': ['key_problems', 'random_transparency']
                    },
                    'monitors': {
                        'quantity': 'excessive',
                        'displays': ['wrong_cities', 'mars_weather', 'cooking_shows'],
                        'functionality': 'questionable'
                    },
                    'props': [
                        'pointer (shaking)',
                        'clicker (wrong buttons)',
                        'umbrella (broken)',
                        'rain_jacket (always worn)'
                    ]
                },
                'weather_graphics': {
                    'sun': 'menacing_face',
                    'clouds': 'ominous_always',
                    'rain': 'portrayed_as_apocalypse',
                    'snow': 'rare_relief'
                }
            },
            
            'financial_pit': {
                'name': 'Market Meltdown Trading Floor',
                'description': 'Chaos capitalism visualization chamber',
                'layout': {
                    'desks': {
                        'arrangement': 'maximum_stress',
                        'monitors': 'too_many_red_numbers',
                        'papers': 'everywhere'
                    },
                    'backdrop': {
                        'screens': 'all_showing_losses',
                        'tickers': 'scrolling_too_fast',
                        'charts': 'incomprehensible'
                    },
                    'debris': [
                        'crumpled_reports',
                        'broken_keyboards',
                        'stress_toys (destroyed)',
                        'empty_antacid_bottles'
                    ]
                },
                'sound_atmosphere': [
                    'shouting_traders',
                    'ringing_bells',
                    'papers_rustling',
                    'brick_rage_noises'
                ]
            },
            
            'political_thunderdome': {
                'name': "O'Really Factor Debate Pit",
                'description': 'Aggressive patriotism display arena',
                'layout': {
                    'desk': {
                        'style': 'intimidation_furniture',
                        'height': 'makes_guests_look_small',
                        'features': ['hidden_mute_button', 'pointing_stick_holder']
                    },
                    'backdrop': {
                        'flags': 'excessive_quantity',
                        'eagles': 'also_excessive',
                        'constitution': 'selective_highlighting'
                    },
                    'guest_chairs': {
                        'comfort': 'deliberately_uncomfortable',
                        'position': 'defensive_posture_inducing'
                    }
                },
                'atmosphere': 'controlled_aggression'
            },
            
            'field_locations': {
                'generic_street': {
                    'elements': ['traffic', 'pedestrians_staring', 'construction'],
                    'issues': ['wind_noise', 'honking', 'jade_complaining']
                },
                'event_venue': {
                    'crowd': 'confused_by_reporter',
                    'security': 'trying_to_remove_crew',
                    'celebrities': 'obviously_fake'
                },
                'disaster_scene': {
                    'seriousness': 'maintained_despite_chaos',
                    'challenges': ['technical_difficulties', 'weather', 'gravity']
                }
            },
            
            'weekend_chaos_zone': {
                'name': 'Weekend Static Disaster Studio',
                'description': 'Everything that could go wrong, has',
                'issues': [
                    'half_the_lights_out',
                    'set_pieces_falling',
                    'teleprompter_broken',
                    'coffee_everywhere',
                    'intern_sobbing_offscreen'
                ],
                'makeshift_solutions': [
                    'duct_tape_everything',
                    'smartphone_teleprompter',
                    'flashlight_key_lighting',
                    'pizza_box_cue_cards'
                ]
            }
        }
    
    def generate_scene_descriptions(self) -> Dict:
        """Generate AI-ready scene descriptions for video generation"""
        scenes = {}
        
        for env_id, env in self.environments.items():
            if env_id == 'field_locations':
                continue  # Handle separately
                
            scenes[env_id] = {
                'wide_shot': self._create_scene_prompt(env, 'wide'),
                'close_up': self._create_scene_prompt(env, 'close'),
                'detail_shots': self._create_detail_prompts(env)
            }
        
        return scenes
    
    def _create_scene_prompt(self, env: Dict, shot_type: str) -> str:
        """Create scene generation prompt"""
        if shot_type == 'wide':
            layout = env.get('layout', {})
            desk_info = layout.get('desk', {}) if isinstance(layout, dict) else {}
            desk_type = desk_info.get('type', 'news desk') if isinstance(desk_info, dict) else 'news desk'
            return f"Professional TV news studio, {env['description']}, " \
                   f"wide shot showing {desk_type}, " \
                   f"studio lighting, broadcast quality, photorealistic"
        else:
            lighting = env.get('layout', {}).get('lighting', {}) if 'layout' in env else {}
            lighting_type = lighting.get('main', 'studio lighting') if isinstance(lighting, dict) else 'studio lighting'
            return f"TV news studio close-up, professional broadcast setting, " \
                   f"{lighting_type}, " \
                   f"shallow depth of field, 4K quality"
    
    def _create_detail_prompts(self, env: Dict) -> List[str]:
        """Create prompts for detail shots"""
        details = []
        
        if 'props' in env:
            for prop in env['props'][:3]:  # Top 3 props
                details.append(f"Close-up of {prop} on news desk, studio lighting, professional broadcast")
        
        return details
    
    def generate_transition_effects(self) -> Dict:
        """Define transition effects between environments"""
        return {
            'standard_wipe': 'Classic news wipe transition',
            'static_burst': 'Brief static interference transition',
            'spinning_logo': 'Static.news logo spin transition',
            'glitch_cut': 'Digital glitch effect transition',
            'breakdown_static': 'Extreme static for breakdown moments',
            'commercial_swoosh': 'Energetic swoosh to commercial',
            'breaking_news_slam': 'Dramatic zoom with sound'
        }
    
    def save_configurations(self):
        """Save all environment configurations"""
        config = {
            'environments': self.environments,
            'scene_prompts': self.generate_scene_descriptions(),
            'transitions': self.generate_transition_effects(),
            'camera_settings': {
                'resolution': '1920x1080',
                'fps': 24,
                'aspect_ratio': '16:9',
                'color_profile': 'broadcast_standard'
            },
            'rendering_notes': {
                'style': 'photorealistic broadcast news',
                'lighting': 'professional studio',
                'quality': 'high definition',
                'imperfections': 'subtle technical issues for realism'
            }
        }
        
        with open('environment_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        return config

if __name__ == "__main__":
    generator = EnvironmentGenerator()
    config = generator.save_configurations()
    
    print(f"Generated {len(config['environments'])} unique environments")
    print(f"Created {len(config['transitions'])} transition effects")
    
    print("\nSample environments:")
    for env_id, env in list(config['environments'].items())[:3]:
        if 'name' in env:
            print(f"\n{env['name']}:")
            print(f"  Description: {env['description']}")
            if 'layout' in env:
                print(f"  Key features: {list(env['layout'].keys())}")