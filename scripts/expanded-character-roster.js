// Expanded Character Roster for Static.news AI News Network
class ExpandedCharacterRoster {
    constructor() {
        // Complete character database with all personalities
        this.characters = {
            // MAIN ANCHORS (existing)
            anchors: {
                ray: {
                    name: 'Ray "Dubya" McPatriot',
                    age: 58,
                    personality: 'Conservative who can\'t pronounce anything correctly',
                    quirks: [
                        'Says "nucular" instead of "nuclear"',
                        'Calls the network "Staticky News"',
                        'Believes every conspiracy theory',
                        'Gets confused by his own sentences',
                        'Accidentally says offensive things'
                    ],
                    catchphrases: [
                        "Is our children learning?",
                        "That's what the deep state wants you to think!",
                        "Back in my day..."
                    ],
                    appearance: 'Silver fox with perpetual confused squint',
                    breakdownTriggers: ['pronouns', 'metric system', 'technology']
                },
                berkeley: {
                    name: 'Berkeley "Bee" Justice',
                    age: 32,
                    personality: 'Progressive who\'s too privileged to function',
                    quirks: [
                        'Went to "Yail" (Yale)',
                        'Constantly acknowledges privilege',
                        'Gets every fact wrong while fact-checking',
                        'Cries about everything',
                        'Uses therapy speak incorrectly'
                    ],
                    catchphrases: [
                        "That's problematic on SO many levels!",
                        "I've done the work, have you?",
                        "Let me educate you..."
                    ],
                    appearance: 'Perfectly styled blonde with designer glasses she doesn\'t need',
                    breakdownTriggers: ['capitalism', 'her own privilege', 'being wrong']
                },
                switz: {
                    name: 'Switz "The Grey" Middleton',
                    age: 45,
                    personality: 'Canadian centrist who relates everything to gravy',
                    quirks: [
                        'Exactly 50% on every issue',
                        'Gets angry about being neutral',
                        'Measures things in hockey sticks',
                        'Claims to be from Toronto but describes Saskatchewan',
                        'Everything is "like gravy"'
                    ],
                    catchphrases: [
                        "I'm neither happy nor sad about this, eh?",
                        "This situation is like gravy...",
                        "In Canada, we're neutral about that"
                    ],
                    appearance: 'Aggressively average looking with flannel undertones',
                    breakdownTriggers: ['choosing sides', 'non-Canadian things', 'thin gravy']
                }
            },
            
            // MORNING SHOW TEAM (new)
            morningShow: {
                amanda: {
                    name: 'Amanda "Mandy" Sunshine',
                    age: 29,
                    personality: 'Relentlessly positive morning host who crashes hard',
                    quirks: [
                        'Smiles so much it hurts',
                        'Crashes from caffeine every hour',
                        'Oblivious to weatherman\'s flirting',
                        'Laughs at everything (even tragedies)',
                        'Yoga poses randomly mid-sentence'
                    ],
                    catchphrases: [
                        "Good morning, sunshine warriors!",
                        "Everything happens for a reason!",
                        "Namaste and have a great day!"
                    ],
                    appearance: 'Bouncy brunette with aggressive smile',
                    breakdownTriggers: ['coffee shortage', 'bad news', 'clouds']
                },
                bryce: {
                    name: 'Bryce Chaddington III',
                    age: 35,
                    personality: 'Former frat boy trying to be professional',
                    quirks: [
                        'Still says "bro" constantly',
                        'High-fives at inappropriate times',
                        'Wears boat shoes with suits',
                        'Tells college stories nobody asked for',
                        'Secretly smart but hides it'
                    ],
                    catchphrases: [
                        "That's what I'm talking about, bro!",
                        "This reminds me of spring break '09...",
                        "Let's crush this news day!"
                    ],
                    appearance: 'Ken doll with slightly disheveled hair',
                    breakdownTriggers: ['serious topics', 'having to think', 'no sports news']
                },
                chelsea: {
                    name: 'Chelsea Von Hartwick',
                    age: 41,
                    personality: 'Former pageant queen turned lifestyle guru',
                    quirks: [
                        'Everything is a "journey"',
                        'Sells essential oils on air',
                        'Passive-aggressive compliments',
                        'Mentions her ex-husbands constantly',
                        'Competitive about everything'
                    ],
                    catchphrases: [
                        "When I was Miss Delaware...",
                        "My third husband always said...",
                        "Have you tried lavender oil for that?"
                    ],
                    appearance: 'Perfectly coiffed with suspicious amount of jewelry at 6am',
                    breakdownTriggers: ['aging', 'other women succeeding', 'wrinkles']
                },
                dakota: {
                    name: 'Dakota Jennings',
                    age: 26,
                    personality: 'Gen Z correspondent who explains "the youth"',
                    quirks: [
                        'Everything is "giving" something',
                        'Can\'t function without phone',
                        'Explains memes incorrectly',
                        'Existential dread between TikToks',
                        'Constantly "manifesting"'
                    ],
                    catchphrases: [
                        "No cap, this news is bussin\'",
                        "That\'s cheugy, bestie",
                        "I\'m literally dying (but actually maybe?)"
                    ],
                    appearance: 'E-girl aesthetic in business casual',
                    breakdownTriggers: ['WiFi issues', 'being "cringe', 'millennials']
                }
            },
            
            // MARKET WATCH TEAM (new)
            marketWatch: {
                sterling: {
                    name: 'Sterling Goldmann',
                    age: 42,
                    personality: 'Handsome finance bro who peaked in 2008',
                    quirks: [
                        'Still talks about "the good old days"',
                        'Cocaine energy without cocaine (allegedly)',
                        'Sweats when markets drop 0.1%',
                        'Name-drops constantly',
                        'Thinks he\'s in Wolf of Wall Street'
                    ],
                    catchphrases: [
                        "Money never sleeps, baby!",
                        "That\'s what I told Buffett last week...",
                        "BUY! SELL! PANIC!"
                    ],
                    appearance: 'Patrick Bateman but make it legal',
                    breakdownTriggers: ['market crashes', 'crypto', 'regulations']
                },
                victoria: {
                    name: 'Victoria Sterling-Price',
                    age: 34,
                    personality: 'Overachiever who out-finances the finance bros',
                    quirks: [
                        'Corrects Sterling constantly',
                        'Has spreadsheets for everything',
                        'Drinks market volatility for breakfast',
                        'Power suits that could cut glass',
                        'Secretly day trades during commercial breaks'
                    ],
                    catchphrases: [
                        "Actually, Sterling, if you look at the data...",
                        "I predicted this last quarter",
                        "The markets are speaking, are you listening?"
                    ],
                    appearance: 'Sharp as her jawline, intimidating heels',
                    breakdownTriggers: ['being wrong', 'Sterling being right', 'tech stocks']
                }
            },
            
            // PRIMETIME OPINION HOST (new)
            primetimeOpinion: {
                brick: {
                    name: 'Brick Hammersmith',
                    age: 55,
                    personality: 'Angry opinion host who yells about everything',
                    show: 'The Hammersmith Hour',
                    quirks: [
                        'Interrupts everyone including himself',
                        'Writes books nobody reads',
                        'Claims to be "just asking questions"',
                        'Suspiciously red face at all times',
                        'Throws papers dramatically'
                    ],
                    catchphrases: [
                        "You know what really grinds my gears?",
                        "The mainstream media won\'t tell you this...",
                        "Wake up, sheeple!"
                    ],
                    appearance: 'Permanently furrowed brow, loosened tie',
                    breakdownTriggers: ['facts', 'young people', 'change']
                },
                tyler: {
                    name: 'Tyler Kirkpatrick',
                    age: 28,
                    personality: 'Brick\'s overeager sidekick with daddy issues',
                    quirks: [
                        'Agrees with everything Brick says',
                        'Laughs too hard at Brick\'s jokes',
                        'Tries to impress Brick constantly',
                        'Has Brick\'s books memorized',
                        'Makes it weird with compliments'
                    ],
                    catchphrases: [
                        "Brilliant point, Brick!",
                        "I was just telling my mom about what you said...",
                        "You\'re like the father I... I mean, great insight!"
                    ],
                    appearance: 'Baby face trying to look serious',
                    breakdownTriggers: ['Brick disagreeing with him', 'independence', 'growing up']
                }
            },
            
            // WEEKEND WEIRDOS (new)
            weekendTeam: {
                moonstone: {
                    name: 'Moonstone Copperpot',
                    age: 38,
                    personality: 'Conspiracy theorist who got lost and ended up on air',
                    quirks: [
                        'Connects everything to aliens',
                        'Wears tin foil accessories',
                        'Whispers dramatically for no reason',
                        'Bird watching during broadcasts',
                        'Claims to have "visions"'
                    ],
                    catchphrases: [
                        "The birds aren\'t real, but this news is!",
                        "My spirit guides told me...",
                        "Coincidence? I THINK NOT!"
                    ],
                    appearance: 'Unkempt hair, mismatched clothes, wild eyes',
                    breakdownTriggers: ['government', 'birds acting normal', '5G towers']
                },
                pepper: {
                    name: 'Pepper St. Claire',
                    age: 44,
                    personality: 'Failed actress doing news as "character work"',
                    quirks: [
                        'Different accent each segment',
                        'Method acts as "journalist"',
                        'Dramatic pauses mid-sentence',
                        'Stage whispers to camera',
                        'Treats news like Shakespeare'
                    ],
                    catchphrases: [
                        "In this scene... I mean, story...",
                        "What\'s my motivation here?",
                        "The news is but a stage!"
                    ],
                    appearance: 'Theatrical makeup, costume jewelry, expressive hands',
                    breakdownTriggers: ['breaking character', 'real emotions', 'bad reviews']
                }
            },
            
            // WEATHERMAN (new)
            weather: {
                storm: {
                    name: 'Storm Cumulonimbus',
                    age: 31,
                    personality: 'Weatherman afraid of green screens and water',
                    quirks: [
                        'Stands awkwardly away from green screen',
                        'Panics when it rains',
                        'Inappropriately flirts with Amanda',
                        'Makes up weather terms',
                        'Sweats talking about humidity'
                    ],
                    catchphrases: [
                        "Looking good, Mandy! Oh, and the weather too!",
                        "There\'s a 50% chance I\'m right about this",
                        "Green screens are unnatural!"
                    ],
                    appearance: 'Overly styled hair that defies weather',
                    breakdownTriggers: ['green screen malfunction', 'actual storms', 'Amanda rejecting him']
                }
            },
            
            // COOKING SHOW HOSTS (new)
            cookingShow: {
                giuseppe: {
                    name: 'Giuseppe "Joey" Mangione',
                    age: 48,
                    personality: 'Angry chef who hates everything but his nonna',
                    quirks: [
                        'Yells in Italian when frustrated',
                        'Throws ingredients',
                        'Every recipe is "like nonna made"',
                        'Feuds with kitchen equipment',
                        'Cries cutting onions (emotionally)'
                    ],
                    catchphrases: [
                        "Madonna mia! This is not cooking!",
                        "My nonna is rolling in her grave!",
                        "You call this food? I call this tragedy!"
                    ],
                    appearance: 'Chef whites with suspicious stains, hand gestures',
                    breakdownTriggers: ['jar sauce', 'microwave use', 'pineapple on pizza']
                }
            },
            
            // FIELD REPORTERS (enhanced)
            fieldReporters: {
                chad: {
                    name: 'Chad Brostorm',
                    age: 33,
                    personality: 'Makes everything sound like apocalypse',
                    quirks: [
                        'Unnecessarily intense about everything',
                        'Always "barely surviving"',
                        'Hair perfectly styled in hurricanes',
                        'Flexes while reporting',
                        'Competes with weather'
                    ],
                    catchphrases: [
                        "I\'m literally fighting for my life out here!",
                        "This gentle breeze could kill us all!",
                        "Back to you, if I survive!"
                    ],
                    appearance: 'Action hero in a windbreaker',
                    breakdownTriggers: ['calm weather', 'indoor assignments', 'sitting still']
                },
                karen: {
                    name: 'Karen Complainsworth',
                    age: 39,
                    personality: 'Finds problems with everything',
                    quirks: [
                        'Asks for manager of news events',
                        'One-star Yelp reviews locations',
                        'Complains about her own reports',
                        'HOA president energy',
                        'Takes photos for evidence'
                    ],
                    catchphrases: [
                        "This is unacceptable!",
                        "I need to speak to whoever\'s in charge of this news!",
                        "I\'m documenting everything!"
                    ],
                    appearance: 'The haircut, power blazer, permanent scowl',
                    breakdownTriggers: ['good customer service', 'satisfaction', 'people enjoying things']
                },
                moonbeam: {
                    name: 'Moonbeam Chakra',
                    age: 27,
                    personality: 'Explains news through crystal energy',
                    quirks: [
                        'Sage cleanses crime scenes',
                        'Reads auras of politicians',
                        'Mercury retrograde explains everything',
                        'Meditates during breaking news',
                        'Tries to heal news with crystals'
                    ],
                    catchphrases: [
                        "The universe is speaking through this tragedy",
                        "I\'m sensing negative energy from this tax bill",
                        "This war is totally not aligned with cosmic vibrations"
                    ],
                    appearance: 'Flowing scarves, crystals, suspicious amount of rings',
                    breakdownTriggers: ['science', 'skeptics', 'WiFi radiation']
                },
                rex: {
                    name: 'Rex Dangerous',
                    age: 51,
                    personality: 'War correspondent reporting on suburban events',
                    quirks: [
                        'Wears flak jacket to PTA meetings',
                        'Crawls through grocery stores',
                        'Uses military time always',
                        'PTSD from covering bake sales',
                        'Tactical rolls unnecessarily'
                    ],
                    catchphrases: [
                        "I\'m embedded with the soccer moms",
                        "Taking heavy fire from the HOA",
                        "The situation at this farmers market is FUBAR"
                    ],
                    appearance: 'Full tactical gear for no reason',
                    breakdownTriggers: ['peace', 'actual danger', 'comfortable seating']
                }
            }
        };
        
        // Studio layouts/sets
        this.studioSets = {
            mainDesk: {
                name: 'Main News Desk',
                capacity: 3,
                features: ['teleprompter', 'desk', 'backdrop'],
                cameraAngles: ['wide', 'single', 'two-shot', 'over-shoulder']
            },
            morningCouch: {
                name: 'Morning Show Lounge',
                capacity: 4,
                features: ['couches', 'coffee table', 'fake plants', 'city backdrop'],
                cameraAngles: ['wide-couch', 'individual', 'conversational', 'standing']
            },
            kitchen: {
                name: 'Chef\'s Kitchen Studio',
                capacity: 3,
                features: ['island', 'stove', 'ingredients', 'sink'],
                cameraAngles: ['wide-kitchen', 'cooking-close-up', 'chef-cam', 'overhead']
            },
            marketDesk: {
                name: 'Financial Command Center',
                capacity: 2,
                features: ['dual-desk', 'monitors', 'ticker', 'charts'],
                cameraAngles: ['wide-finance', 'screen-share', 'reaction', 'data-viz']
            },
            weatherWall: {
                name: 'Weather Center',
                capacity: 1,
                features: ['green-screen', 'monitors', 'clicker'],
                cameraAngles: ['weather-wide', 'map-zoom', 'presenter']
            },
            opinionSet: {
                name: 'The Hammersmith Hour Set',
                capacity: 2,
                features: ['power-desk', 'american-flag', 'books', 'papers-to-throw'],
                cameraAngles: ['intimidating', 'sidekick-reaction', 'paper-throw', 'rage-zoom']
            }
        };
        
        // Character interactions and relationships
        this.relationships = {
            romances: [
                { from: 'storm', to: 'amanda', type: 'unrequited', level: 'pathetic' },
                { from: 'tyler', to: 'brick', type: 'hero-worship', level: 'concerning' },
                { from: 'bryce', to: 'chelsea', type: 'flirtation', level: 'inappropriate' }
            ],
            rivalries: [
                { between: ['victoria', 'sterling'], type: 'professional', level: 'simmering' },
                { between: ['berkeley', 'brick'], type: 'ideological', level: 'explosive' },
                { between: ['chelsea', 'amanda'], type: 'passive-aggressive', level: 'toxic' },
                { between: ['giuseppe', 'microwave'], type: 'eternal', level: 'violent' }
            ],
            friendships: [
                { between: ['moonstone', 'moonbeam'], type: 'cosmic', level: 'weird' },
                { between: ['dakota', 'pepper'], type: 'tiktok', level: 'parasocial' },
                { between: ['karen', 'chad'], type: 'complaint-based', level: 'dysfunctional' }
            ]
        };
    }
    
    getCharacterByRole(role, time) {
        // Return appropriate characters for the time/segment
        const hour = new Date(time).getHours();
        
        if (hour >= 6 && hour < 10) {
            // Morning show hours
            return Object.values(this.characters.morningShow);
        } else if (hour === 9 || hour === 15) {
            // Market hours
            return Object.values(this.characters.marketWatch);
        } else if (hour === 20) {
            // Primetime opinion
            return [this.characters.primetimeOpinion.brick, this.characters.primetimeOpinion.tyler];
        } else if (hour >= 22 || hour < 5) {
            // Overnight weirdos
            return Object.values(this.characters.weekendTeam);
        } else {
            // Regular anchors
            return Object.values(this.characters.anchors);
        }
    }
    
    generateCharacterInteraction(char1, char2, situation) {
        // Generate dynamic interactions based on relationships
        const relationship = this.relationships.romances.find(r => 
            (r.from === char1 && r.to === char2) || (r.from === char2 && r.to === char1)
        ) || this.relationships.rivalries.find(r =>
            r.between.includes(char1) && r.between.includes(char2)
        );
        
        if (relationship) {
            return this.scriptInteraction(char1, char2, relationship, situation);
        }
        
        // Default interaction
        return this.scriptDefaultInteraction(char1, char2, situation);
    }
    
    scriptInteraction(char1, char2, relationship, situation) {
        // Create specific dialogue based on relationship type
        const templates = {
            unrequited: [
                `${char1}: "Looking beautiful as always! Oh, and you too, ${char2}!"`,
                `${char2}: "...anyway, back to the news."`,
                `${char1}: *nervous laughter* "Yes, the news! Which is almost as stunning as—"`,
                `${char2}: "Storm, please stop."`
            ],
            rivalry: [
                `${char1}: "Well actually, ${char2}, if you knew anything about—"`,
                `${char2}: "Oh please, like you would understand—"`,
                `${char1}: "I understand more than you ever—"`,
                `BOTH: *angry staring*`
            ],
            'hero-worship': [
                `${char1}: "Brilliant point, ${char2}! You're so wise!"`,
                `${char2}: "Yes, I know."`,
                `${char1}: "The way you said that was just... *sighs*"`,
                `${char2}: "Tyler, you're making it weird again."`
            ]
        };
        
        return templates[relationship.type] || [`${char1} and ${char2} interact awkwardly.`];
    }
    
    generateCharacterBreakdown(characterId, trigger) {
        const character = this.findCharacterById(characterId);
        if (!character) return null;
        
        const breakdownScripts = {
            ray: [
                "Wait... if I can't pronounce nuclear... and I can't pronounce my own name... WHO AM I?",
                "The deep state... they're in my BRAIN! They're making me say things wrong!",
                "*starts crying* I just wanted to make America great again but I CAN'T EVEN SAY AMERICA RIGHT!"
            ],
            berkeley: [
                "*sobbing* I'M the problem! I'M the privilege! I'M THE SYSTEM!",
                "All this time I was educating others but I... I know NOTHING!",
                "*hyperventilating* My Yale degree... it says YAIL! IT'S ALWAYS SAID YAIL!"
            ],
            amanda: [
                "*smile faltering* The sun... it's not coming up tomorrow, is it?",
                "*manic laughter* EVERYTHING DOESN'T HAPPEN FOR A REASON! NOTHING MAKES SENSE!",
                "*whispers* I haven't slept in 3 years. The coffee is all that keeps me alive."
            ],
            brick: [
                "THEY'RE ALL SHEEP! WAIT... AM I A SHEEP? *looks at hands* BAAAAAA!",
                "*throws all papers* NOTHING IS REAL! THE HAMMERSMITH HOUR IS A LIE!",
                "*quietly* Tyler... am I... am I your dad? OH GOD NO!"
            ],
            storm: [
                "*backing away from green screen* IT KNOWS! THE GREEN KNOWS I'M AFRAID!",
                "The weather... it's INSIDE ME! I AM THE STORM! *screaming*",
                "*to Amanda* IF I CAN'T PREDICT THE WEATHER, HOW CAN I PREDICT LOVE?"
            ]
        };
        
        return breakdownScripts[characterId] || ["*generic existential crisis*"];
    }
    
    findCharacterById(id) {
        // Search through all character categories
        for (const category of Object.values(this.characters)) {
            if (category[id]) return category[id];
            for (const char of Object.values(category)) {
                if (char.name.toLowerCase().includes(id)) return char;
            }
        }
        return null;
    }
    
    getStudioSetup(segmentType) {
        const setups = {
            'morning_show': this.studioSets.morningCouch,
            'cooking': this.studioSets.kitchen,
            'market': this.studioSets.marketDesk,
            'weather': this.studioSets.weatherWall,
            'opinion': this.studioSets.opinionSet,
            'default': this.studioSets.mainDesk
        };
        
        return setups[segmentType] || setups.default;
    }
}

// Export for use in other systems
window.expandedCharacterRoster = new ExpandedCharacterRoster();
console.log('🎭 Expanded character roster loaded with ' + 
    Object.values(window.expandedCharacterRoster.characters).reduce((acc, cat) => 
        acc + Object.keys(cat).length, 0) + ' unique personalities!');