// Hand-crafted, rule-aligned mini-quiz definitions (6 for tenses, 5+ for micro-rules)

const TENSE_QUIZ_DEF = {
  "present_simple": [
    {
      "blanked": "Trains ___ at seven sharp every morning.",
      "answer": "leave",
      "options": [
        "leaves",
        "leave",
        "are leaving",
        "left"
      ]
    },
    {
      "blanked": "My brother ___ the violin in a local orchestra.",
      "answer": "plays",
      "options": [
        "play",
        "plays",
        "is playing",
        "played"
      ]
    },
    {
      "blanked": "They ___ eat meat because they are vegetarian.",
      "answer": "don't",
      "options": [
        "doesn't",
        "don't",
        "aren't",
        "didn't"
      ]
    },
    {
      "blanked": "___ the museum open on Mondays?",
      "answer": "Does",
      "options": [
        "Do",
        "Does",
        "Is",
        "Did"
      ]
    },
    {
      "blanked": "Do you live near the station? — Yes, I ___.",
      "answer": "do",
      "options": [
        "am",
        "do",
        "does",
        "have"
      ]
    },
    {
      "blanked": "Does Anna speak German? — No, she ___.",
      "answer": "doesn't",
      "options": [
        "don't",
        "isn't",
        "doesn't",
        "didn't"
      ]
    }
  ],
  "past_simple": [
    {
      "blanked": "Maya ___ her first novel last summer.",
      "answer": "published",
      "options": [
        "publishes",
        "published",
        "is publishing",
        "has published"
      ]
    },
    {
      "blanked": "We ___ to Lisbon by train three years ago.",
      "answer": "went",
      "options": [
        "go",
        "went",
        "were going",
        "have gone"
      ]
    },
    {
      "blanked": "Sorry, I ___ see your message until this morning.",
      "answer": "didn't",
      "options": [
        "don't",
        "wasn't",
        "didn't",
        "haven't"
      ]
    },
    {
      "blanked": "Why ___ you leave the stadium so early?",
      "answer": "did",
      "options": [
        "do",
        "were",
        "did",
        "had"
      ]
    },
    {
      "blanked": "Did Leo finish the report on time? — Yes, he ___.",
      "answer": "did",
      "options": [
        "was",
        "did",
        "does",
        "had"
      ]
    },
    {
      "blanked": "Did they call you back? — No, they ___.",
      "answer": "didn't",
      "options": [
        "weren't",
        "don't",
        "didn't",
        "haven't"
      ]
    }
  ],
  "future_simple": [
    {
      "blanked": "Don't worry — I ___ send you the notes tonight.",
      "answer": "will",
      "options": [
        "am",
        "will",
        "did",
        "was"
      ]
    },
    {
      "blanked": "I think the guests ___ arrive around eight.",
      "answer": "will",
      "options": [
        "are",
        "did",
        "will",
        "have"
      ]
    },
    {
      "blanked": "She ___ tell anyone your secret, I promise.",
      "answer": "won't",
      "options": [
        "doesn't",
        "isn't",
        "won't",
        "didn't"
      ]
    },
    {
      "blanked": "___ you help me move this heavy table?",
      "answer": "Will",
      "options": [
        "Do",
        "Are",
        "Will",
        "Did"
      ]
    },
    {
      "blanked": "Will the shop be open at nine? — Yes, it ___.",
      "answer": "will",
      "options": [
        "is",
        "does",
        "will",
        "has"
      ]
    },
    {
      "blanked": "Will Tom join us for dinner? — No, he ___.",
      "answer": "won't",
      "options": [
        "doesn't",
        "isn't",
        "won't",
        "didn't"
      ]
    }
  ],
  "present_continuous": [
    {
      "blanked": "Look! The children ___ a snowman outside.",
      "answer": "are building",
      "options": [
        "build",
        "built",
        "are building",
        "has built"
      ]
    },
    {
      "blanked": "Sorry, I can't talk right now — I ___ dinner.",
      "answer": "am making",
      "options": [
        "make",
        "made",
        "have made",
        "am making"
      ]
    },
    {
      "blanked": "Please be quiet; the baby ___ right now.",
      "answer": "isn't sleeping",
      "options": [
        "doesn't sleep",
        "isn't sleeping",
        "wasn't sleeping",
        "won't sleep"
      ]
    },
    {
      "blanked": "___ you waiting for the airport shuttle?",
      "answer": "Are",
      "options": [
        "Do",
        "Are",
        "Will",
        "Have"
      ]
    },
    {
      "blanked": "Is Sam working from home today? — Yes, he ___.",
      "answer": "is",
      "options": [
        "does",
        "is",
        "will",
        "has"
      ]
    },
    {
      "blanked": "Are they staying at our hotel? — No, they ___.",
      "answer": "aren't",
      "options": [
        "don't",
        "weren't",
        "aren't",
        "haven't"
      ]
    }
  ],
  "past_continuous": [
    {
      "blanked": "At 10 AM yesterday, Alex ___ a long report.",
      "answer": "was writing",
      "options": [
        "wrote",
        "was writing",
        "writes",
        "has written"
      ]
    },
    {
      "blanked": "The lights went out while we ___ a film.",
      "answer": "were watching",
      "options": [
        "watched",
        "watch",
        "are watching",
        "were watching"
      ]
    },
    {
      "blanked": "I ___ paying attention when the teacher asked me.",
      "answer": "wasn't",
      "options": [
        "didn't",
        "wasn't",
        "am not",
        "haven't"
      ]
    },
    {
      "blanked": "___ it still raining when you left the office?",
      "answer": "Was",
      "options": [
        "Did",
        "Was",
        "Were",
        "Has"
      ]
    },
    {
      "blanked": "Were you sleeping at midnight? — Yes, I ___.",
      "answer": "was",
      "options": [
        "did",
        "am",
        "was",
        "were"
      ]
    },
    {
      "blanked": "Were the kids playing outside? — No, they ___.",
      "answer": "weren't",
      "options": [
        "didn't",
        "aren't",
        "wasn't",
        "weren't"
      ]
    }
  ],
  "future_continuous": [
    {
      "blanked": "At nine tonight, Ben ___ for his exam.",
      "answer": "will be studying",
      "options": [
        "studies",
        "will be studying",
        "studied",
        "has studied"
      ]
    },
    {
      "blanked": "This time next week, they ___ on the beach.",
      "answer": "will be relaxing",
      "options": [
        "relax",
        "relaxed",
        "will be relaxing",
        "were relaxing"
      ]
    },
    {
      "blanked": "Please do not ring at eight — we ___ dinner then.",
      "answer": "won't be having",
      "options": [
        "don't have",
        "won't be having",
        "aren't having",
        "didn't have"
      ]
    },
    {
      "blanked": "___ you be staying at the office late tonight?",
      "answer": "Will",
      "options": [
        "Are",
        "Do",
        "Will",
        "Were"
      ]
    },
    {
      "blanked": "Will Kate be working tomorrow morning? — Yes, she ___.",
      "answer": "will",
      "options": [
        "is",
        "does",
        "will",
        "be"
      ]
    },
    {
      "blanked": "Will they be driving through Leeds? — No, they ___.",
      "answer": "won't",
      "options": [
        "aren't",
        "don't",
        "won't",
        "didn't"
      ]
    }
  ],
  "present_perfect": [
    {
      "blanked": "Look, someone ___ left the garden gate open.",
      "answer": "has",
      "options": [
        "has",
        "have",
        "is",
        "did"
      ]
    },
    {
      "blanked": "We ___ never tried authentic Thai curry before.",
      "answer": "have",
      "options": [
        "had",
        "are",
        "have",
        "were"
      ]
    },
    {
      "blanked": "Paul ___ finished painting the bedroom yet.",
      "answer": "hasn't",
      "options": [
        "didn't",
        "isn't",
        "hasn't",
        "haven't"
      ]
    },
    {
      "blanked": "___ you ever visited the British Museum?",
      "answer": "Have",
      "options": [
        "Did",
        "Are",
        "Have",
        "Had"
      ]
    },
    {
      "blanked": "Has Maria sent the invoice yet? — Yes, she ___.",
      "answer": "has",
      "options": [
        "is",
        "did",
        "has",
        "does"
      ]
    },
    {
      "blanked": "Have they arrived at the gate? — No, they ___.",
      "answer": "haven't",
      "options": [
        "didn't",
        "aren't",
        "haven't",
        "hasn't"
      ]
    }
  ],
  "past_perfect": [
    {
      "blanked": "When Sam opened the fridge, someone ___ eaten the pie.",
      "answer": "had",
      "options": [
        "has",
        "had",
        "was",
        "did"
      ]
    },
    {
      "blanked": "Before moving to Lyon, Julia ___ studied French for years.",
      "answer": "had",
      "options": [
        "has",
        "did",
        "was",
        "had"
      ]
    },
    {
      "blanked": "They ___ booked a table, so we had to wait outside.",
      "answer": "hadn't",
      "options": [
        "didn't",
        "haven't",
        "hadn't",
        "weren't"
      ]
    },
    {
      "blanked": "___ he already left when you reached the station?",
      "answer": "Had",
      "options": [
        "Did",
        "Has",
        "Was",
        "Had"
      ]
    },
    {
      "blanked": "Had you met Mia before that party? — Yes, I ___.",
      "answer": "had",
      "options": [
        "did",
        "have",
        "was",
        "had"
      ]
    },
    {
      "blanked": "Had the film started when you got there? — No, it ___.",
      "answer": "hadn't",
      "options": [
        "didn't",
        "wasn't",
        "hadn't",
        "hasn't"
      ]
    }
  ],
  "future_perfect": [
    {
      "blanked": "By 2030, engineers ___ built the new bridge.",
      "answer": "will have",
      "options": [
        "are having",
        "will have",
        "had",
        "were"
      ]
    },
    {
      "blanked": "She ___ completed every module before the deadline.",
      "answer": "will have",
      "options": [
        "is",
        "has",
        "will have",
        "was"
      ]
    },
    {
      "blanked": "By noon, the workers ___ cleared all the snow yet.",
      "answer": "won't have",
      "options": [
        "don't have",
        "haven't",
        "won't have",
        "didn't have"
      ]
    },
    {
      "blanked": "___ you have packed your bags before the taxi arrives?",
      "answer": "Will",
      "options": [
        "Have",
        "Do",
        "Are",
        "Will"
      ]
    },
    {
      "blanked": "Will Max have repaired the bike by Sunday? — Yes, he ___.",
      "answer": "will",
      "options": [
        "has",
        "does",
        "will",
        "is"
      ]
    },
    {
      "blanked": "Will they have signed the contract by five? — No, they ___.",
      "answer": "won't",
      "options": [
        "haven't",
        "don't",
        "won't",
        "aren't"
      ]
    }
  ],
  "present_perfect_continuous": [
    {
      "blanked": "It ___ snowing nonstop since early dawn.",
      "answer": "has been",
      "options": [
        "is",
        "has been",
        "was",
        "will"
      ]
    },
    {
      "blanked": "They ___ renovating the kitchen for two months.",
      "answer": "have been",
      "options": [
        "are",
        "were",
        "have been",
        "had"
      ]
    },
    {
      "blanked": "He ___ feeling well since Tuesday.",
      "answer": "hasn't been",
      "options": [
        "isn't",
        "wasn't",
        "hasn't been",
        "doesn't"
      ]
    },
    {
      "blanked": "How long ___ you been playing chess?",
      "answer": "have",
      "options": [
        "are",
        "did",
        "have",
        "were"
      ]
    },
    {
      "blanked": "Has she been waiting long? — Yes, she ___.",
      "answer": "has",
      "options": [
        "is",
        "has",
        "did",
        "does"
      ]
    },
    {
      "blanked": "Have they been practicing all morning? — No, they ___.",
      "answer": "haven't",
      "options": [
        "aren't",
        "didn't",
        "haven't",
        "don't"
      ]
    }
  ],
  "past_perfect_continuous": [
    {
      "blanked": "Emma was exhausted because she ___ running all morning.",
      "answer": "had been",
      "options": [
        "had been",
        "has been",
        "is",
        "was"
      ]
    },
    {
      "blanked": "We ___ waiting half an hour before the waiter arrived.",
      "answer": "had been",
      "options": [
        "have been",
        "are",
        "were",
        "had been"
      ]
    },
    {
      "blanked": "He ___ working there long when the company closed.",
      "answer": "hadn't been",
      "options": [
        "wasn't",
        "hasn't been",
        "hadn't been",
        "didn't"
      ]
    },
    {
      "blanked": "___ it been raining long before the match stopped?",
      "answer": "Had",
      "options": [
        "Was",
        "Has",
        "Did",
        "Had"
      ]
    },
    {
      "blanked": "Had they been arguing before you entered? — Yes, they ___.",
      "answer": "had",
      "options": [
        "were",
        "did",
        "have",
        "had"
      ]
    },
    {
      "blanked": "Had she been studying all night? — No, she ___.",
      "answer": "hadn't",
      "options": [
        "wasn't",
        "hasn't",
        "hadn't",
        "didn't"
      ]
    }
  ],
  "future_perfect_continuous": [
    {
      "blanked": "By October, Paul ___ coaching this team for a decade.",
      "answer": "will have been",
      "options": [
        "is",
        "was",
        "will have been",
        "had been"
      ]
    },
    {
      "blanked": "At noon, the crew ___ filming for six hours.",
      "answer": "will have been",
      "options": [
        "are",
        "will have been",
        "were",
        "has been"
      ]
    },
    {
      "blanked": "By Monday, she ___ resting long enough to travel.",
      "answer": "won't have been",
      "options": [
        "isn't",
        "hasn't been",
        "won't have been",
        "wasn't"
      ]
    },
    {
      "blanked": "How long ___ they have been traveling by midnight?",
      "answer": "will",
      "options": [
        "are",
        "have",
        "will",
        "had"
      ]
    },
    {
      "blanked": "Will you have been living here ten years by May? — Yes, I ___.",
      "answer": "will",
      "options": [
        "have",
        "am",
        "will",
        "do"
      ]
    },
    {
      "blanked": "Will he have been driving for eight hours by dusk? — No, he ___.",
      "answer": "won't",
      "options": [
        "hasn't",
        "isn't",
        "won't",
        "doesn't"
      ]
    }
  ],
  "be_going_to": [
    {
      "blanked": "Watch out — that tall stack of plates ___ fall!",
      "answer": "is going to",
      "options": [
        "used to",
        "is going to",
        "has been",
        "was"
      ]
    },
    {
      "blanked": "Nina saved money because she ___ open a bakery.",
      "answer": "is going to",
      "options": [
        "used to",
        "was",
        "did",
        "is going to"
      ]
    },
    {
      "blanked": "They ___ paint the fence until next spring.",
      "answer": "aren't going to",
      "options": [
        "don't",
        "aren't going to",
        "weren't",
        "haven't"
      ]
    },
    {
      "blanked": "___ you going to book the tickets tonight?",
      "answer": "Are",
      "options": [
        "Do",
        "Will",
        "Are",
        "Have"
      ]
    },
    {
      "blanked": "Is Ben going to join the course? — Yes, he ___.",
      "answer": "is",
      "options": [
        "will",
        "does",
        "is",
        "has"
      ]
    },
    {
      "blanked": "Are we going to stay overnight? — No, we ___.",
      "answer": "aren't",
      "options": [
        "won't",
        "don't",
        "aren't",
        "haven't"
      ]
    }
  ],
  "used_to_would": [
    {
      "blanked": "This quiet avenue ___ have an old tram line years ago.",
      "answer": "used to",
      "options": [
        "used to",
        "is used to",
        "use to",
        "gets used to"
      ]
    },
    {
      "blanked": "On rainy Sundays, Grandpa ___ tell us sea stories.",
      "answer": "would",
      "options": [
        "is used to",
        "would",
        "has",
        "was"
      ]
    },
    {
      "blanked": "I ___ like olives as a child, though I love them now.",
      "answer": "didn't use to",
      "options": [
        "don't use to",
        "didn't use to",
        "wasn't used to",
        "wouldn't"
      ]
    },
    {
      "blanked": "___ they use to live near the old harbour?",
      "answer": "Did",
      "options": [
        "Were",
        "Do",
        "Did",
        "Would"
      ]
    },
    {
      "blanked": "Did Mia use to work at that cafe? — Yes, she ___.",
      "answer": "did",
      "options": [
        "was",
        "used",
        "did",
        "would"
      ]
    },
    {
      "blanked": "Did you use to wear glasses? — No, I ___.",
      "answer": "didn't",
      "options": [
        "wasn't",
        "don't",
        "didn't",
        "wouldn't"
      ]
    }
  ],
  "be_get_used_to": [
    {
      "blanked": "After six months in Tokyo, Leo ___ the busy trains.",
      "answer": "is used to",
      "options": [
        "used to",
        "is used to",
        "use to",
        "would"
      ]
    },
    {
      "blanked": "Don't worry, you'll soon ___ speaking in public.",
      "answer": "get used to",
      "options": [
        "used to",
        "get used to",
        "be use to",
        "got used to"
      ]
    },
    {
      "blanked": "We ___ the freezing winter wind yet.",
      "answer": "aren't used to",
      "options": [
        "didn't use to",
        "aren't used to",
        "don't used to",
        "weren't use to"
      ]
    },
    {
      "blanked": "___ she used to working night shifts?",
      "answer": "Is",
      "options": [
        "Does",
        "Did",
        "Is",
        "Has"
      ]
    },
    {
      "blanked": "Are you used to spicy food now? — Yes, I ___.",
      "answer": "am",
      "options": [
        "do",
        "have",
        "am",
        "did"
      ]
    },
    {
      "blanked": "Is he used to the new software yet? — No, he ___.",
      "answer": "isn't",
      "options": [
        "doesn't",
        "didn't",
        "isn't",
        "hasn't"
      ]
    }
  ],
  "future_in_the_past": [
    {
      "blanked": "He promised me he ___ return the camera on Monday.",
      "answer": "would",
      "options": [
        "will",
        "would",
        "is",
        "has"
      ]
    },
    {
      "blanked": "We ___ leave at six, but the car broke down.",
      "answer": "were going to",
      "options": [
        "are going to",
        "were going to",
        "will",
        "have"
      ]
    },
    {
      "blanked": "She told us she ___ be late for the rehearsal.",
      "answer": "wouldn't",
      "options": [
        "won't",
        "wouldn't",
        "isn't",
        "doesn't"
      ]
    },
    {
      "blanked": "Did he say when he ___ arrive in Prague?",
      "answer": "would",
      "options": [
        "will",
        "would",
        "is",
        "does"
      ]
    },
    {
      "blanked": "Did Anna say she would help us? — Yes, she ___.",
      "answer": "did",
      "options": [
        "would",
        "was",
        "did",
        "will"
      ]
    },
    {
      "blanked": "Were they going to stay longer? — No, they ___.",
      "answer": "weren't",
      "options": [
        "didn't",
        "wouldn't",
        "weren't",
        "aren't"
      ]
    }
  ]
};

const MICRO_RULE_QUIZ_DEF = {
  "1": [
    {
      "blanked": "Choose the noun: The ___ slept on the sofa.",
      "answer": "puppy",
      "options": [
        "puppy",
        "quickly",
        "soft",
        "sleep"
      ]
    },
    {
      "blanked": "Choose the noun: Fresh ___ filled the crystal glass.",
      "answer": "water",
      "options": [
        "cold",
        "pour",
        "water",
        "slowly"
      ]
    },
    {
      "blanked": "Choose the noun: Our friendly ___ showed us around town.",
      "answer": "guide",
      "options": [
        "guide",
        "kindly",
        "visit",
        "bright"
      ]
    },
    {
      "blanked": "Choose the noun: Paris is a famous ___ in France.",
      "answer": "city",
      "options": [
        "city",
        "ancient",
        "travel",
        "fast"
      ]
    },
    {
      "blanked": "Choose the noun: True ___ matters more than wealth.",
      "answer": "friendship",
      "options": [
        "friendship",
        "honest",
        "share",
        "happily"
      ]
    }
  ],
  "2": [
    {
      "blanked": "Choose the verb: Birds ___ south before winter arrives.",
      "answer": "fly",
      "options": [
        "flight",
        "fly",
        "winged",
        "high"
      ]
    },
    {
      "blanked": "Choose the verb: Children ___ happily in the yard.",
      "answer": "laugh",
      "options": [
        "laughter",
        "cheerful",
        "sadly",
        "laugh"
      ]
    },
    {
      "blanked": "Choose the verb: Musicians ___ new songs in the studio.",
      "answer": "create",
      "options": [
        "creation",
        "create",
        "creative",
        "creatively"
      ]
    },
    {
      "blanked": "Choose the verb: Those quiet moments ___ very peaceful.",
      "answer": "seem",
      "options": [
        "seem",
        "seeming",
        "peace",
        "calmly"
      ]
    },
    {
      "blanked": "Choose the verb: We ___ warm milk before sleeping.",
      "answer": "drink",
      "options": [
        "drink",
        "glass",
        "thirsty",
        "sweetly"
      ]
    }
  ],
  "3": [
    {
      "blanked": "Choose the adjective: Take a ___ blanket for the trip.",
      "answer": "warm",
      "options": [
        "warm",
        "warmly",
        "warmth",
        "cover"
      ]
    },
    {
      "blanked": "Choose the adjective: The ___ girl fixed the radio.",
      "answer": "clever",
      "options": [
        "cleverly",
        "radio",
        "clever",
        "fix"
      ]
    },
    {
      "blanked": "Choose the adjective: We crossed a ___ wooden bridge.",
      "answer": "narrow",
      "options": [
        "narrow",
        "narrowly",
        "narrowness",
        "cross"
      ]
    },
    {
      "blanked": "Choose the adjective: The baker makes ___ bread every dawn.",
      "answer": "fresh",
      "options": [
        "fresh",
        "freshly",
        "freshen",
        "bake"
      ]
    },
    {
      "blanked": "Choose the adjective: She wore a ___ silk scarf.",
      "answer": "bright",
      "options": [
        "bright",
        "brightly",
        "brightness",
        "shine"
      ]
    }
  ],
  "4": [
    {
      "blanked": "Choose the adverb: The clerk greeted us ___.",
      "answer": "politely",
      "options": [
        "polite",
        "politely",
        "politeness",
        "greet"
      ]
    },
    {
      "blanked": "Choose the adverb: Grandpa shut the door ___.",
      "answer": "quietly",
      "options": [
        "quiet",
        "silence",
        "open",
        "quietly"
      ]
    },
    {
      "blanked": "Choose the adverb of time: They will arrive ___ to help us.",
      "answer": "soon",
      "options": [
        "soon",
        "quick",
        "early time",
        "arrival"
      ]
    },
    {
      "blanked": "Choose the adverb of place: The children played ___ all afternoon.",
      "answer": "indoors",
      "options": [
        "indoors",
        "room",
        "wooden",
        "play"
      ]
    },
    {
      "blanked": "Choose the adverb: He solved the puzzle ___.",
      "answer": "easily",
      "options": [
        "easily",
        "easy",
        "ease",
        "easiest"
      ]
    }
  ],
  "5": [
    {
      "blanked": "Choose the pronoun: Leo bought boots and ___ wears them daily.",
      "answer": "he",
      "options": [
        "he",
        "leather",
        "walk",
        "new"
      ]
    },
    {
      "blanked": "Choose the pronoun: Look at the clouds — ___ look dark.",
      "answer": "they",
      "options": [
        "rain",
        "heavy",
        "they",
        "move"
      ]
    },
    {
      "blanked": "Choose the pronoun: Maya lost her keys and searched for ___ everywhere.",
      "answer": "them",
      "options": [
        "them",
        "it",
        "key",
        "lost"
      ]
    },
    {
      "blanked": "Choose the pronoun: The old clock stopped because ___ was broken.",
      "answer": "it",
      "options": [
        "it",
        "he",
        "tick",
        "heavy"
      ]
    },
    {
      "blanked": "Choose the pronoun: Clara and I are hungry, so ___ ordered soup.",
      "answer": "we",
      "options": [
        "we",
        "them",
        "us",
        "she"
      ]
    }
  ],
  "6": [
    {
      "blanked": "Choose the numeral: Our club won ___ gold medals.",
      "answer": "four",
      "options": [
        "four",
        "medal",
        "proudly",
        "gold"
      ]
    },
    {
      "blanked": "Choose the ordinal numeral: We live on the ___ floor.",
      "answer": "fifth",
      "options": [
        "elevator",
        "high",
        "fifth",
        "climb"
      ]
    },
    {
      "blanked": "Choose the cardinal numeral: A spider has ___ legs.",
      "answer": "eight",
      "options": [
        "eight",
        "eighth",
        "legs",
        "crawl"
      ]
    },
    {
      "blanked": "Choose the ordinal numeral: Tuesday is the ___ day of the week.",
      "answer": "second",
      "options": [
        "second",
        "two",
        "seconds",
        "twice"
      ]
    },
    {
      "blanked": "Choose the ordinal numeral: Neil Armstrong was the ___ man on the Moon.",
      "answer": "first",
      "options": [
        "first",
        "one",
        "once",
        "single"
      ]
    }
  ],
  "7": [
    {
      "blanked": "Choose the preposition: The fox hid ___ the bridge.",
      "answer": "under",
      "options": [
        "under",
        "hidden",
        "bridge",
        "silently"
      ]
    },
    {
      "blanked": "Choose the preposition: Fresh air blew ___ the window.",
      "answer": "through",
      "options": [
        "window",
        "through",
        "cool",
        "blew"
      ]
    },
    {
      "blanked": "Choose the preposition: The train departs ___ midnight.",
      "answer": "at",
      "options": [
        "at",
        "on",
        "in",
        "to"
      ]
    },
    {
      "blanked": "Choose the preposition: She walked ___ the library after class.",
      "answer": "towards",
      "options": [
        "towards",
        "library",
        "walking",
        "nearer"
      ]
    },
    {
      "blanked": "Choose the preposition: He opened the lock ___ a small pin.",
      "answer": "with",
      "options": [
        "with",
        "by",
        "for",
        "from"
      ]
    }
  ],
  "8": [
    {
      "blanked": "Choose the conjunction: Take a coat ___ the wind is icy.",
      "answer": "because",
      "options": [
        "because",
        "chilly",
        "coat",
        "wear"
      ]
    },
    {
      "blanked": "Choose the conjunction: Would you like milk ___ lemon?",
      "answer": "or",
      "options": [
        "drink",
        "sweet",
        "or",
        "cup"
      ]
    },
    {
      "blanked": "Choose the conjunction: He wanted to go for a run, ___ it started to hail.",
      "answer": "but",
      "options": [
        "but",
        "and",
        "so",
        "or"
      ]
    },
    {
      "blanked": "Choose the conjunction: We packed sandwiches ___ juice for the picnic.",
      "answer": "and",
      "options": [
        "and",
        "or",
        "but",
        "because"
      ]
    },
    {
      "blanked": "Choose the conjunction: She stayed after work ___ the report was urgent.",
      "answer": "because",
      "options": [
        "because",
        "or",
        "but",
        "so"
      ]
    }
  ],
  "9": [
    {
      "blanked": "Basic SVO order: My cousin ___ electric guitars.",
      "answer": "repairs",
      "options": [
        "repairs",
        "guitars repairs",
        "loudly repairs",
        "repairing"
      ]
    },
    {
      "blanked": "Basic SVO order: ___ opened the blue envelope.",
      "answer": "Clara",
      "options": [
        "Clara",
        "Slowly opened",
        "Opened Clara",
        "The blue opened"
      ]
    },
    {
      "blanked": "Basic SVO order: The chef ___ a fresh salad.",
      "answer": "prepared",
      "options": [
        "prepared",
        "salad prepared",
        "freshly prepared salad",
        "preparing"
      ]
    },
    {
      "blanked": "Basic SVO order: Peter always ___ his homework before dinner.",
      "answer": "finishes",
      "options": [
        "finishes",
        "homework finishes",
        "finishes homework his",
        "finishing"
      ]
    },
    {
      "blanked": "Basic SVO order: The tourists took ___ near the fountain.",
      "answer": "many photos",
      "options": [
        "many photos",
        "photos many took",
        "taking many photos",
        "many took photos"
      ]
    }
  ],
  "10": [
    {
      "blanked": "___ is twenty kilometers to the nearest harbor.",
      "answer": "It",
      "options": [
        "It",
        "There",
        "This is",
        "Weather"
      ]
    },
    {
      "blanked": "___ feels wonderful to walk after the rain.",
      "answer": "It",
      "options": [
        "Are",
        "Is",
        "It",
        "Has"
      ]
    },
    {
      "blanked": "___ is foggy in the valley today.",
      "answer": "It",
      "options": [
        "It",
        "There",
        "Is",
        "Being"
      ]
    },
    {
      "blanked": "___ is getting dark outside.",
      "answer": "It",
      "options": [
        "It",
        "There",
        "Has",
        "Does"
      ]
    },
    {
      "blanked": "In English we must include a verb: The soup ___ delicious.",
      "answer": "is",
      "options": [
        "is",
        "being",
        "are",
        "been"
      ]
    }
  ],
  "11": [
    {
      "blanked": "Order Place → Time: They stayed ___.",
      "answer": "in Madrid in May",
      "options": [
        "in May in Madrid",
        "in Madrid in May",
        "May Madrid in",
        "at May Madrid"
      ]
    },
    {
      "blanked": "Order Place → Time: I left my bag ___.",
      "answer": "at the gym yesterday",
      "options": [
        "yesterday at the gym",
        "the gym yesterday at",
        "at the gym yesterday",
        "yesterday gym at"
      ]
    },
    {
      "blanked": "Order Place → Time: We watched the concert ___.",
      "answer": "in the park on Sunday",
      "options": [
        "on Sunday in the park",
        "in the park on Sunday",
        "on Sunday park in",
        "park on Sunday in"
      ]
    },
    {
      "blanked": "Order Place → Time: David studied ___.",
      "answer": "at the library this morning",
      "options": [
        "this morning at the library",
        "at the library this morning",
        "morning at library this",
        "at this morning library"
      ]
    },
    {
      "blanked": "Order Place → Time: The plane landed ___.",
      "answer": "in Tokyo at dawn",
      "options": [
        "at dawn in Tokyo",
        "in Tokyo at dawn",
        "Tokyo at dawn in",
        "at Tokyo dawn in"
      ]
    }
  ],
  "12": [
    {
      "blanked": "The library ___ open until nine tonight.",
      "answer": "is",
      "options": [
        "am",
        "is",
        "are",
        "be"
      ]
    },
    {
      "blanked": "Both of my cousins ___ engineers in Prague.",
      "answer": "are",
      "options": [
        "am",
        "is",
        "are",
        "be"
      ]
    },
    {
      "blanked": "I ___ excited about the upcoming journey.",
      "answer": "am",
      "options": [
        "am",
        "is",
        "are",
        "be"
      ]
    },
    {
      "blanked": "She ___ an experienced graphic designer.",
      "answer": "is",
      "options": [
        "am",
        "is",
        "are",
        "be"
      ]
    },
    {
      "blanked": "You and I ___ on the same project team.",
      "answer": "are",
      "options": [
        "am",
        "is",
        "are",
        "be"
      ]
    }
  ],
  "13": [
    {
      "blanked": "The soup ___ salty enough for my taste.",
      "answer": "isn't",
      "options": [
        "isn't",
        "don't",
        "doesn't",
        "aren't"
      ]
    },
    {
      "blanked": "We ___ ready to sign the contract yet.",
      "answer": "aren't",
      "options": [
        "don't",
        "isn't",
        "doesn't",
        "aren't"
      ]
    },
    {
      "blanked": "I ___ interested in buying a car right now.",
      "answer": "am not",
      "options": [
        "am not",
        "don't",
        "isn't",
        "aren't"
      ]
    },
    {
      "blanked": "These apples ___ sweet at all.",
      "answer": "aren't",
      "options": [
        "isn't",
        "aren't",
        "don't",
        "doesn't"
      ]
    },
    {
      "blanked": "The museum ___ crowded on weekday mornings.",
      "answer": "isn't",
      "options": [
        "isn't",
        "aren't",
        "doesn't",
        "not is"
      ]
    }
  ],
  "14": [
    {
      "blanked": "___ this seat taken by anyone?",
      "answer": "Is",
      "options": [
        "Do",
        "Does",
        "Is",
        "Are"
      ]
    },
    {
      "blanked": "___ your neighbors traveling this month?",
      "answer": "Are",
      "options": [
        "Do",
        "Are",
        "Is",
        "Does"
      ]
    },
    {
      "blanked": "___ I late for the morning briefing?",
      "answer": "Am",
      "options": [
        "Am",
        "Is",
        "Are",
        "Do"
      ]
    },
    {
      "blanked": "___ you sure about this address?",
      "answer": "Are",
      "options": [
        "Is",
        "Are",
        "Do",
        "Does"
      ]
    },
    {
      "blanked": "___ your smartphone connected to Wi-Fi?",
      "answer": "Is",
      "options": [
        "Does",
        "Is",
        "Are",
        "Has"
      ]
    }
  ],
  "15": [
    {
      "blanked": "Is the printer working now? — Yes, ___.",
      "answer": "it is",
      "options": [
        "it's",
        "it is",
        "is it",
        "it does"
      ]
    },
    {
      "blanked": "Are the tickets cheap? — Yes, ___.",
      "answer": "they are",
      "options": [
        "they're",
        "they do",
        "they are",
        "are they"
      ]
    },
    {
      "blanked": "Are you ready for the presentation? — Yes, ___.",
      "answer": "I am",
      "options": [
        "I'm",
        "I am",
        "am I",
        "I do"
      ]
    },
    {
      "blanked": "Is Lisa in the conference room? — Yes, ___.",
      "answer": "she is",
      "options": [
        "she's",
        "she is",
        "is she",
        "she does"
      ]
    },
    {
      "blanked": "Are we on the right path? — Yes, ___.",
      "answer": "we are",
      "options": [
        "we're",
        "we are",
        "are we",
        "we do"
      ]
    }
  ],
  "16": [
    {
      "blanked": "___ a fresh loaf of bread on the counter.",
      "answer": "There is",
      "options": [
        "There is",
        "There are",
        "It has",
        "They are"
      ]
    },
    {
      "blanked": "___ plenty of warm tea left in the pot.",
      "answer": "There is",
      "options": [
        "There are",
        "They have",
        "There is",
        "Are there"
      ]
    },
    {
      "blanked": "___ a red bicycle leaning against the wall.",
      "answer": "There is",
      "options": [
        "There is",
        "There are",
        "It have",
        "They are"
      ]
    },
    {
      "blanked": "___ fresh orange juice in the pitcher.",
      "answer": "There is",
      "options": [
        "There is",
        "There are",
        "Are there",
        "It are"
      ]
    },
    {
      "blanked": "___ a quiet reading room on the second floor.",
      "answer": "There is",
      "options": [
        "There is",
        "There are",
        "It is having",
        "They is"
      ]
    }
  ],
  "17": [
    {
      "blanked": "___ twelve oak trees along the footpath.",
      "answer": "There are",
      "options": [
        "There is",
        "There are",
        "It is",
        "Have there"
      ]
    },
    {
      "blanked": "___ several tourists waiting at the pier.",
      "answer": "There are",
      "options": [
        "There are",
        "There is",
        "It has",
        "This is"
      ]
    },
    {
      "blanked": "___ four comfortable chairs around the dining table.",
      "answer": "There are",
      "options": [
        "There is",
        "There are",
        "It is",
        "Has there"
      ]
    },
    {
      "blanked": "___ many bright stars visible tonight.",
      "answer": "There are",
      "options": [
        "There is",
        "There are",
        "It has",
        "They is"
      ]
    },
    {
      "blanked": "___ three new messages in your inbox.",
      "answer": "There are",
      "options": [
        "There is",
        "There are",
        "It is",
        "This are"
      ]
    }
  ],
  "18": [
    {
      "blanked": "___ a subway station near this hotel?",
      "answer": "Is there",
      "options": [
        "Is there",
        "Are there",
        "There is",
        "Does there"
      ]
    },
    {
      "blanked": "___ any chairs left in the conference hall.",
      "answer": "There aren't",
      "options": [
        "There isn't",
        "There aren't",
        "It isn't",
        "Aren't it"
      ]
    },
    {
      "blanked": "___ any clean towels in the cabinet?",
      "answer": "Are there",
      "options": [
        "Is there",
        "Are there",
        "There are",
        "Do there"
      ]
    },
    {
      "blanked": "___ any hot water in the kettle.",
      "answer": "There isn't",
      "options": [
        "There isn't",
        "There aren't",
        "Isn't there",
        "It isn't"
      ]
    },
    {
      "blanked": "___ an elevator in this apartment block?",
      "answer": "Is there",
      "options": [
        "Is there",
        "Are there",
        "There is",
        "Has there"
      ]
    }
  ],
  "19": [
    {
      "blanked": "Dan and Lisa called; ___ want to join us.",
      "answer": "they",
      "options": [
        "them",
        "their",
        "they",
        "theirs"
      ]
    },
    {
      "blanked": "Where is your sister? — ___ works downtown.",
      "answer": "She",
      "options": [
        "Her",
        "Hers",
        "She",
        "Them"
      ]
    },
    {
      "blanked": "Arthur bought a violin; ___ practices every evening.",
      "answer": "he",
      "options": [
        "him",
        "his",
        "he",
        "himself"
      ]
    },
    {
      "blanked": "My brother and I love hiking; ___ climb mountains every summer.",
      "answer": "we",
      "options": [
        "us",
        "our",
        "we",
        "ours"
      ]
    },
    {
      "blanked": "Look at that old engine; ___ runs very smoothly.",
      "answer": "it",
      "options": [
        "it",
        "he",
        "its",
        "him"
      ]
    }
  ],
  "20": [
    {
      "blanked": "Tell Marco that I will meet ___ at noon.",
      "answer": "him",
      "options": [
        "he",
        "him",
        "his",
        "himself"
      ]
    },
    {
      "blanked": "These boxes are heavy — help ___ lift them.",
      "answer": "us",
      "options": [
        "we",
        "our",
        "ours",
        "us"
      ]
    },
    {
      "blanked": "If you see Rachel, give ___ this document.",
      "answer": "her",
      "options": [
        "she",
        "her",
        "hers",
        "herself"
      ]
    },
    {
      "blanked": "I cannot reach that top shelf; could you help ___?",
      "answer": "me",
      "options": [
        "I",
        "me",
        "my",
        "mine"
      ]
    },
    {
      "blanked": "Those stray kittens are hungry; let us feed ___.",
      "answer": "them",
      "options": [
        "they",
        "their",
        "them",
        "theirs"
      ]
    }
  ],
  "21": [
    {
      "blanked": "Did Ella bring ___ passport to the airport?",
      "answer": "her",
      "options": [
        "hers",
        "she",
        "her",
        "herself"
      ]
    },
    {
      "blanked": "We always park ___ bicycles behind the shop.",
      "answer": "our",
      "options": [
        "we",
        "ours",
        "us",
        "our"
      ]
    },
    {
      "blanked": "The cat licked ___ paws after finishing dinner.",
      "answer": "its",
      "options": [
        "its",
        "it's",
        "their",
        "it"
      ]
    },
    {
      "blanked": "Oliver forgot ___ umbrella on the train.",
      "answer": "his",
      "options": [
        "he",
        "him",
        "his",
        "himself"
      ]
    },
    {
      "blanked": "The students opened ___ notebooks when class began.",
      "answer": "their",
      "options": [
        "they",
        "them",
        "their",
        "theirs"
      ]
    }
  ],
  "22": [
    {
      "blanked": "My desk is tidy, while ___ is covered in paper.",
      "answer": "hers",
      "options": [
        "her",
        "she",
        "hers",
        "herself"
      ]
    },
    {
      "blanked": "Forgot your pen? Feel free to borrow ___.",
      "answer": "mine",
      "options": [
        "my",
        "mine",
        "me",
        "I"
      ]
    },
    {
      "blanked": "This is not our car; ___ is parked across the street.",
      "answer": "ours",
      "options": [
        "our",
        "ours",
        "us",
        "we"
      ]
    },
    {
      "blanked": "Your garden looks nice, but ___ is much bigger.",
      "answer": "theirs",
      "options": [
        "their",
        "theirs",
        "them",
        "they"
      ]
    },
    {
      "blanked": "I found a blue scarf; is it ___?",
      "answer": "yours",
      "options": [
        "your",
        "yours",
        "you",
        "yourself"
      ]
    }
  ],
  "23": [
    {
      "blanked": "We stayed at my ___ cottage by the lake.",
      "answer": "uncle's",
      "options": [
        "uncle's",
        "uncles",
        "uncle of",
        "uncle is"
      ]
    },
    {
      "blanked": "The ___ collar got stuck on the fence.",
      "answer": "dog's",
      "options": [
        "dogs of",
        "dog's",
        "dog of",
        "dogs is"
      ]
    },
    {
      "blanked": "I borrowed my ___ laptop for the weekend.",
      "answer": "sister's",
      "options": [
        "sisters",
        "sister's",
        "sister of",
        "sisters's"
      ]
    },
    {
      "blanked": "The ___ nest was hidden high in the tree.",
      "answer": "bird's",
      "options": [
        "birds",
        "bird's",
        "bird of",
        "birds's"
      ]
    },
    {
      "blanked": "We attended ___ birthday party yesterday.",
      "answer": "Emma's",
      "options": [
        "Emmas",
        "Emma's",
        "Emma of",
        "of Emma"
      ]
    }
  ],
  "24": [
    {
      "blanked": "The ___ locker room is down this hallway.",
      "answer": "players'",
      "options": [
        "players'",
        "player's",
        "players of",
        "of players"
      ]
    },
    {
      "blanked": "We celebrated my ___ thirty years of marriage.",
      "answer": "grandparents'",
      "options": [
        "grandparents of",
        "grandparents'",
        "grandparent",
        "grandparents's"
      ]
    },
    {
      "blanked": "The ___ staff room is on the second floor.",
      "answer": "teachers'",
      "options": [
        "teacher's",
        "teachers'",
        "teachers's",
        "teachers of"
      ]
    },
    {
      "blanked": "The ___ uniforms were clean and pressed.",
      "answer": "soldiers'",
      "options": [
        "soldier's",
        "soldiers'",
        "soldiers's",
        "of soldiers"
      ]
    },
    {
      "blanked": "The ___ common room has comfortable armchairs.",
      "answer": "residents'",
      "options": [
        "resident's",
        "residents'",
        "residents's",
        "residents of"
      ]
    }
  ],
  "25": [
    {
      "blanked": "The ___ need a fresh coat of paint.",
      "answer": "legs of the table",
      "options": [
        "table's legs",
        "tables legs",
        "legs of the table",
        "leg table"
      ]
    },
    {
      "blanked": "I wrote down the ___ on a sticky note.",
      "answer": "title of the chapter",
      "options": [
        "chapter's title",
        "title of the chapter",
        "chapter title of",
        "titles chapter"
      ]
    },
    {
      "blanked": "He repaired the ___ after the storm.",
      "answer": "roof of the house",
      "options": [
        "house's roof",
        "roof of the house",
        "house roof of",
        "roofs house"
      ]
    },
    {
      "blanked": "The ___ was completely shattered by the rock.",
      "answer": "screen of the phone",
      "options": [
        "phone's screen",
        "screen of the phone",
        "phones screen",
        "screen phone of"
      ]
    },
    {
      "blanked": "Can you see the ___ from this hill?",
      "answer": "center of the town",
      "options": [
        "town's center",
        "center of the town",
        "town center of",
        "center town's"
      ]
    }
  ],
  "26": [
    {
      "blanked": "Hold on — look at ___ tiny coin in my hand.",
      "answer": "this",
      "options": [
        "this",
        "that",
        "those",
        "these"
      ]
    },
    {
      "blanked": "Try on ___ warm gloves right here beside you.",
      "answer": "these",
      "options": [
        "this",
        "that",
        "those",
        "these"
      ]
    },
    {
      "blanked": "___ cup right here in front of me is still hot.",
      "answer": "This",
      "options": [
        "This",
        "These",
        "Those",
        "That"
      ]
    },
    {
      "blanked": "Are ___ fresh cherries on this plate from your orchard?",
      "answer": "these",
      "options": [
        "this",
        "that",
        "these",
        "those"
      ]
    },
    {
      "blanked": "I really like ___ watch on my wrist.",
      "answer": "this",
      "options": [
        "this",
        "these",
        "those",
        "that"
      ]
    }
  ],
  "27": [
    {
      "blanked": "Can you see ___ lighthouse across the bay?",
      "answer": "that",
      "options": [
        "this",
        "these",
        "that",
        "those"
      ]
    },
    {
      "blanked": "Hand me ___ folders on the top shelf over there.",
      "answer": "those",
      "options": [
        "these",
        "those",
        "this",
        "that"
      ]
    },
    {
      "blanked": "Who is ___ tall man standing across the street?",
      "answer": "that",
      "options": [
        "this",
        "these",
        "that",
        "those"
      ]
    },
    {
      "blanked": "Look at ___ snow-capped peaks in the distance.",
      "answer": "those",
      "options": [
        "these",
        "those",
        "this",
        "that"
      ]
    },
    {
      "blanked": "Do you recognize ___ old windmill on the far hill?",
      "answer": "that",
      "options": [
        "this",
        "these",
        "that",
        "those"
      ]
    }
  ],
  "28": [
    {
      "blanked": "___ snows heavily in Iceland every January.",
      "answer": "It",
      "options": [
        "There",
        "They",
        "It",
        "This"
      ]
    },
    {
      "blanked": "___ is a quarter to four right now.",
      "answer": "It",
      "options": [
        "There",
        "It",
        "That",
        "One"
      ]
    },
    {
      "blanked": "___ is twelve miles to the nearest gas station.",
      "answer": "It",
      "options": [
        "There",
        "It",
        "That",
        "This"
      ]
    },
    {
      "blanked": "___ was very windy throughout the afternoon.",
      "answer": "It",
      "options": [
        "There",
        "It",
        "That",
        "What"
      ]
    },
    {
      "blanked": "___ is the tenth of October today.",
      "answer": "It",
      "options": [
        "There",
        "It",
        "This",
        "He"
      ]
    }
  ],
  "29": [
    {
      "blanked": "I bought a lantern yesterday; ___ lantern glows softly.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Could you hand me ___ clean towel from anywhere?",
      "answer": "a",
      "options": [
        "a",
        "the",
        "an",
        "—"
      ]
    },
    {
      "blanked": "We found ___ old wooden chest in the attic.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "She noticed a stray puppy, and ___ puppy followed her home.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Can I borrow ___ pencil to write a quick note?",
      "answer": "a",
      "options": [
        "a",
        "the",
        "an",
        "—"
      ]
    }
  ],
  "30": [
    {
      "blanked": "Wearing ___ uniform is mandatory in this lab.",
      "answer": "a",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "We rented ___ European van for the tour.",
      "answer": "a",
      "options": [
        "an",
        "a",
        "one of",
        "—"
      ]
    },
    {
      "blanked": "That was ___ unique experience for everyone.",
      "answer": "a",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "He bought ___ new camera before the vacation.",
      "answer": "a",
      "options": [
        "an",
        "a",
        "one",
        "—"
      ]
    },
    {
      "blanked": "They formed ___ union to protect workers.",
      "answer": "a",
      "options": [
        "an",
        "a",
        "the",
        "—"
      ]
    }
  ],
  "31": [
    {
      "blanked": "Sam made ___ honest apology after the meeting.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "any",
        "—"
      ]
    },
    {
      "blanked": "She carries ___ umbrella in her backpack.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "two",
        "—"
      ]
    },
    {
      "blanked": "It took ___ hour to reach the campsite.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "It was ___ honor to speak at the ceremony.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "some",
        "—"
      ]
    },
    {
      "blanked": "He peeled ___ orange for a quick snack.",
      "answer": "an",
      "options": [
        "a",
        "an",
        "one",
        "—"
      ]
    }
  ],
  "32": [
    {
      "blanked": "Before \"east\", we pronounce \"the\" with [ðiː]: ___ east coast.",
      "answer": "the",
      "options": [
        "the",
        "a",
        "an",
        "—"
      ]
    },
    {
      "blanked": "Before \"helmet\", we pronounce \"the\" with [ðə]: ___ helmet.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Before \"eagle\", we pronounce \"the\" with [ðiː]: ___ eagle.",
      "answer": "the",
      "options": [
        "the",
        "a",
        "an",
        "—"
      ]
    },
    {
      "blanked": "Before \"guitar\", we pronounce \"the\" with [ðə]: ___ guitar.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Before \"hour\", we pronounce \"the\" with [ðiː]: ___ hour.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    }
  ],
  "33": [
    {
      "blanked": "Never leave a singular noun bare: ___ called me.",
      "answer": "A customer",
      "options": [
        "Customer",
        "A customer",
        "Customers is",
        "Customer was"
      ]
    },
    {
      "blanked": "She picked up ___ from the shelf.",
      "answer": "a dictionary",
      "options": [
        "dictionary",
        "a dictionary",
        "dictionaries a",
        "an dictionary"
      ]
    },
    {
      "blanked": "He parked ___ outside the office building.",
      "answer": "his car",
      "options": [
        "car",
        "his car",
        "a cars",
        "car his"
      ]
    },
    {
      "blanked": "We decided to adopt ___ from the animal shelter.",
      "answer": "a puppy",
      "options": [
        "puppy",
        "a puppy",
        "an puppy",
        "puppy a"
      ]
    },
    {
      "blanked": "Could you pass me ___ on the counter?",
      "answer": "the envelope",
      "options": [
        "envelope",
        "the envelope",
        "an envelopes",
        "envelope the"
      ]
    }
  ],
  "34": [
    {
      "blanked": "We ordered ___ pizzas for the whole office.",
      "answer": "four",
      "options": [
        "a four",
        "four",
        "an four",
        "the a four"
      ]
    },
    {
      "blanked": "The shelf holds ___ thick encyclopedias.",
      "answer": "six",
      "options": [
        "a six",
        "six",
        "an six",
        "six a"
      ]
    },
    {
      "blanked": "They booked ___ hotel rooms for the delegation.",
      "answer": "three",
      "options": [
        "three",
        "a three",
        "an three",
        "three a"
      ]
    },
    {
      "blanked": "He bought ___ wool coats during the winter sale.",
      "answer": "two",
      "options": [
        "two",
        "a two",
        "an two",
        "the a two"
      ]
    },
    {
      "blanked": "The gardener planted ___ rose bushes along the fence.",
      "answer": "five",
      "options": [
        "five",
        "a five",
        "an five",
        "five a"
      ]
    }
  ],
  "35": [
    {
      "blanked": "Never stack articles with possessives: Where is ___?",
      "answer": "my suitcase",
      "options": [
        "the my suitcase",
        "a my suitcase",
        "my suitcase",
        "my a suitcase"
      ]
    },
    {
      "blanked": "No article after demonstratives: Please sign ___.",
      "answer": "that form",
      "options": [
        "that the form",
        "a that form",
        "that form",
        "the that form"
      ]
    },
    {
      "blanked": "Have you seen ___ on the kitchen counter?",
      "answer": "his keys",
      "options": [
        "the his keys",
        "his keys",
        "a his keys",
        "his the keys"
      ]
    },
    {
      "blanked": "I really admire ___ painted on the brick wall.",
      "answer": "this mural",
      "options": [
        "this the mural",
        "a this mural",
        "this mural",
        "the this mural"
      ]
    },
    {
      "blanked": "We admired ___ blooming in the backyard.",
      "answer": "their roses",
      "options": [
        "their the roses",
        "the their roses",
        "their roses",
        "a their roses"
      ]
    }
  ],
  "36": [
    {
      "blanked": "Turn off ___ stove before we leave the kitchen.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Did you feed ___ parrot in our living room?",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Please lock ___ front gate before going to sleep.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Could you pass ___ salt on our table?",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "Who left ___ refrigerator door open?",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    }
  ],
  "37": [
    {
      "blanked": "___ sky turned bright pink at sunset.",
      "answer": "The",
      "options": [
        "A",
        "An",
        "The",
        "—"
      ]
    },
    {
      "blanked": "Check ___ Internet before calling support.",
      "answer": "the",
      "options": [
        "a",
        "the",
        "an",
        "—"
      ]
    },
    {
      "blanked": "___ moon looked enormous above the lake.",
      "answer": "The",
      "options": [
        "A",
        "An",
        "The",
        "—"
      ]
    },
    {
      "blanked": "Astronauts traveled beyond ___ Earth into deep space.",
      "answer": "the",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "___ world is full of fascinating cultures.",
      "answer": "The",
      "options": [
        "A",
        "An",
        "The",
        "—"
      ]
    }
  ],
  "38": [
    {
      "blanked": "Speaking generally: ___ penguins cannot fly.",
      "answer": "—",
      "options": [
        "The",
        "A",
        "An",
        "—"
      ]
    },
    {
      "blanked": "Speaking generally: Children love ___ cartoons.",
      "answer": "—",
      "options": [
        "the",
        "a",
        "an",
        "—"
      ]
    },
    {
      "blanked": "Speaking generally: ___ wolves hunt in organized packs.",
      "answer": "—",
      "options": [
        "—",
        "The",
        "A",
        "An"
      ]
    },
    {
      "blanked": "Most teenagers enjoy listening to ___ podcasts.",
      "answer": "—",
      "options": [
        "—",
        "the",
        "a",
        "an"
      ]
    },
    {
      "blanked": "___ horses need plenty of open space to run.",
      "answer": "—",
      "options": [
        "—",
        "The",
        "A",
        "An"
      ]
    }
  ],
  "39": [
    {
      "blanked": "General truth: ___ honesty builds lasting trust.",
      "answer": "—",
      "options": [
        "A",
        "An",
        "The",
        "—"
      ]
    },
    {
      "blanked": "General truth: Do you take ___ sugar in green tea?",
      "answer": "—",
      "options": [
        "a",
        "an",
        "the",
        "—"
      ]
    },
    {
      "blanked": "General truth: ___ patience is essential for learning languages.",
      "answer": "—",
      "options": [
        "—",
        "A",
        "An",
        "The"
      ]
    },
    {
      "blanked": "Plants cannot survive without ___ sunlight.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "an",
        "the"
      ]
    },
    {
      "blanked": "___ music brings people together across the globe.",
      "answer": "—",
      "options": [
        "—",
        "A",
        "An",
        "The"
      ]
    }
  ],
  "40": [
    {
      "blanked": "My roommate practices ___ Japanese every evening.",
      "answer": "—",
      "options": [
        "a",
        "the",
        "—",
        "an"
      ]
    },
    {
      "blanked": "Claire teaches ___ physics at a college.",
      "answer": "—",
      "options": [
        "the",
        "a",
        "an",
        "—"
      ]
    },
    {
      "blanked": "He speaks ___ German with his grandparents.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    },
    {
      "blanked": "We have an exam in ___ chemistry next Monday.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    },
    {
      "blanked": "She is passionate about ___ history and archaeology.",
      "answer": "—",
      "options": [
        "—",
        "the",
        "a",
        "an"
      ]
    }
  ],
  "41": [
    {
      "blanked": "School concerts always happen in ___ December.",
      "answer": "—",
      "options": [
        "the",
        "a",
        "—",
        "an"
      ]
    },
    {
      "blanked": "Our book club meets every ___ Thursday.",
      "answer": "—",
      "options": [
        "a",
        "the",
        "—",
        "an"
      ]
    },
    {
      "blanked": "The art gallery remains closed on ___ Sunday.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    },
    {
      "blanked": "We are taking our annual holiday in ___ July.",
      "answer": "—",
      "options": [
        "—",
        "the",
        "a",
        "an"
      ]
    },
    {
      "blanked": "The semester finishes at the end of ___ January.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    }
  ],
  "42": [
    {
      "blanked": "Wait, it is late — time to go to ___ bed.",
      "answer": "—",
      "options": [
        "a",
        "the",
        "—",
        "an"
      ]
    },
    {
      "blanked": "We usually have ___ lunch near the harbor.",
      "answer": "—",
      "options": [
        "the",
        "a",
        "an",
        "—"
      ]
    },
    {
      "blanked": "They invited their neighbors over for ___ dinner.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    },
    {
      "blanked": "Is Dad still at ___ work or on his way home?",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    },
    {
      "blanked": "After a long flight, I was thrilled to be at ___ home.",
      "answer": "—",
      "options": [
        "—",
        "a",
        "the",
        "an"
      ]
    }
  ],
  "43": [
    {
      "blanked": "There are two brass ___ on the mantelpiece.",
      "answer": "clocks",
      "options": [
        "clock",
        "clocks",
        "clockes",
        "clockies"
      ]
    },
    {
      "blanked": "Pack three warm ___ for the mountain hike.",
      "answer": "sweaters",
      "options": [
        "sweater",
        "sweaters",
        "sweateres",
        "sweatr"
      ]
    },
    {
      "blanked": "Several foreign ___ docked at the quiet bay.",
      "answer": "boats",
      "options": [
        "boats",
        "boat",
        "boates",
        "boaties"
      ]
    },
    {
      "blanked": "She collected five vintage ___ from the antique market.",
      "answer": "cups",
      "options": [
        "cups",
        "cup",
        "cupes",
        "cupies"
      ]
    },
    {
      "blanked": "The students placed their ___ neatly under the desks.",
      "answer": "bags",
      "options": [
        "bags",
        "bag",
        "bages",
        "bagies"
      ]
    }
  ],
  "44": [
    {
      "blanked": "Carry those heavy ___ to the basement.",
      "answer": "boxes",
      "options": [
        "box",
        "boxs",
        "boxes",
        "boxies"
      ]
    },
    {
      "blanked": "Three bright ___ flew past our balcony.",
      "answer": "flashes",
      "options": [
        "flashs",
        "flashes",
        "flash",
        "flashies"
      ]
    },
    {
      "blanked": "She packed four cheese ___ for the picnic.",
      "answer": "sandwiches",
      "options": [
        "sandwiches",
        "sandwich",
        "sandwichs",
        "sandwichies"
      ]
    },
    {
      "blanked": "The students take three crowded ___ to campus.",
      "answer": "buses",
      "options": [
        "buses",
        "bus",
        "buss",
        "busies"
      ]
    },
    {
      "blanked": "Pour water into those tall ___.",
      "answer": "glasses",
      "options": [
        "glasses",
        "glass",
        "glasss",
        "glassies"
      ]
    }
  ],
  "45": [
    {
      "blanked": "Many ancient ___ stand along the river.",
      "answer": "cities",
      "options": [
        "citys",
        "cities",
        "city",
        "cites"
      ]
    },
    {
      "blanked": "Those ___ look forward to Saturday matches.",
      "answer": "boys",
      "options": [
        "boies",
        "boys",
        "boy",
        "boyes"
      ]
    },
    {
      "blanked": "The librarian stacked new ___ on the wooden cart.",
      "answer": "stories",
      "options": [
        "stories",
        "storys",
        "story",
        "storeys"
      ]
    },
    {
      "blanked": "We spent several sunny ___ relaxing near the beach.",
      "answer": "days",
      "options": [
        "days",
        "daies",
        "day",
        "dayes"
      ]
    },
    {
      "blanked": "Two sweet ___ slept peacefully in their prams.",
      "answer": "babies",
      "options": [
        "babies",
        "babys",
        "baby",
        "babyes"
      ]
    }
  ],
  "46": [
    {
      "blanked": "Ripe autumn ___ covered the garden path.",
      "answer": "leaves",
      "options": [
        "leafs",
        "leaves",
        "leaf",
        "leafes"
      ]
    },
    {
      "blanked": "Store those sharp chef ___ inside the drawer.",
      "answer": "knives",
      "options": [
        "knifs",
        "knifes",
        "knives",
        "knife"
      ]
    },
    {
      "blanked": "The carpenter assembled two sturdy book ___.",
      "answer": "shelves",
      "options": [
        "shelves",
        "shelfs",
        "shelf",
        "shelfes"
      ]
    },
    {
      "blanked": "Firefighters risk their ___ to rescue citizens.",
      "answer": "lives",
      "options": [
        "lives",
        "lifes",
        "life",
        "live"
      ]
    },
    {
      "blanked": "Hungry ___ howled deep in the snowy forest.",
      "answer": "wolves",
      "options": [
        "wolves",
        "wolfs",
        "wolf",
        "wolfes"
      ]
    }
  ],
  "47": [
    {
      "blanked": "A flock of wild ___ crossed the meadow.",
      "answer": "geese",
      "options": [
        "gooses",
        "geese",
        "goose",
        "geeses"
      ]
    },
    {
      "blanked": "Wash your ___ before eating dinner.",
      "answer": "teeth",
      "options": [
        "tooths",
        "toothes",
        "teeth",
        "teeths"
      ]
    },
    {
      "blanked": "The cat chased three little ___ under the floor.",
      "answer": "mice",
      "options": [
        "mice",
        "mouses",
        "mices",
        "mouse"
      ]
    },
    {
      "blanked": "Both of my ___ hurt after walking all day.",
      "answer": "feet",
      "options": [
        "feet",
        "foots",
        "feets",
        "foot"
      ]
    },
    {
      "blanked": "Five young ___ joined the local coding club.",
      "answer": "women",
      "options": [
        "women",
        "womans",
        "womens",
        "woman"
      ]
    }
  ],
  "48": [
    {
      "blanked": "Your reading ___ on the bedside table.",
      "answer": "glasses are",
      "options": [
        "glass is",
        "glasses is",
        "glasses are",
        "glass are"
      ]
    },
    {
      "blanked": "Those black ___ too long for me.",
      "answer": "trousers are",
      "options": [
        "trouser is",
        "trousers is",
        "trousers are",
        "trouser are"
      ]
    },
    {
      "blanked": "Where ___ those metal scissors I used earlier?",
      "answer": "are",
      "options": [
        "are",
        "is",
        "was",
        "be"
      ]
    },
    {
      "blanked": "These brand new ___ incredibly comfortable.",
      "answer": "jeans are",
      "options": [
        "jeans are",
        "jean is",
        "jeans is",
        "jean are"
      ]
    },
    {
      "blanked": "The kitchen ___ kept in the top drawer.",
      "answer": "scissors are",
      "options": [
        "scissors are",
        "scissor is",
        "scissors is",
        "scissor are"
      ]
    }
  ],
  "49": [
    {
      "blanked": "___ your seatbelt before the plane takes off.",
      "answer": "Fasten",
      "options": [
        "You fasten",
        "Fasten",
        "To fasten",
        "Fastens"
      ]
    },
    {
      "blanked": "___ left at the traffic light ahead.",
      "answer": "Turn",
      "options": [
        "Turn",
        "Turns",
        "You turning",
        "Turned"
      ]
    },
    {
      "blanked": "___ your hands thoroughly before cooking.",
      "answer": "Wash",
      "options": [
        "Wash",
        "You wash",
        "Washing",
        "Washes"
      ]
    },
    {
      "blanked": "Please ___ the front door quietly on your way out.",
      "answer": "close",
      "options": [
        "close",
        "closing",
        "closed",
        "to close"
      ]
    },
    {
      "blanked": "___ the ingredients gently into the bowl.",
      "answer": "Stir",
      "options": [
        "Stir",
        "Stirs",
        "Stirring",
        "You stir"
      ]
    }
  ],
  "50": [
    {
      "blanked": "___ touch that freshly painted bench!",
      "answer": "Don't",
      "options": [
        "Not",
        "Isn't",
        "Don't",
        "No"
      ]
    },
    {
      "blanked": "___ leave the campfire unattended tonight.",
      "answer": "Don't",
      "options": [
        "No",
        "Don't",
        "Doesn't",
        "Won't be"
      ]
    },
    {
      "blanked": "___ feed the wild animals in the sanctuary.",
      "answer": "Don't",
      "options": [
        "Don't",
        "Not",
        "No",
        "Doesn't"
      ]
    },
    {
      "blanked": "Please ___ run near the slippery swimming pool.",
      "answer": "don't",
      "options": [
        "don't",
        "not",
        "no",
        "doesn't"
      ]
    },
    {
      "blanked": "___ open the oven door while the cake is baking.",
      "answer": "Don't",
      "options": [
        "Don't",
        "Not",
        "Doesn't",
        "No"
      ]
    }
  ],
  "51": [
    {
      "blanked": "___ take the scenic coastal road today!",
      "answer": "Let's",
      "options": [
        "Let",
        "Let's",
        "Lets",
        "Let us to"
      ]
    },
    {
      "blanked": "It's too dark — ___ walk through the forest.",
      "answer": "let's not",
      "options": [
        "don't let",
        "let's not",
        "not let us",
        "let's don't"
      ]
    },
    {
      "blanked": "___ invite our new neighbors to the garden barbecue.",
      "answer": "Let's",
      "options": [
        "Let's",
        "Lets",
        "Let us to",
        "Let we"
      ]
    },
    {
      "blanked": "We have an early flight tomorrow, so ___ stay up late.",
      "answer": "let's not",
      "options": [
        "let's not",
        "let's don't",
        "don't let's",
        "not let"
      ]
    },
    {
      "blanked": "___ order some herbal tea while we wait.",
      "answer": "Let's",
      "options": [
        "Let's",
        "Let",
        "Lets",
        "Let to"
      ]
    }
  ],
  "52": [
    {
      "blanked": "___ your colleagues agree with the timeline?",
      "answer": "Do",
      "options": [
        "Do",
        "Are",
        "Does",
        "Have"
      ]
    },
    {
      "blanked": "___ Mia checked the departure board yet?",
      "answer": "Has",
      "options": [
        "Is",
        "Does",
        "Has",
        "Did"
      ]
    },
    {
      "blanked": "___ you play the acoustic guitar?",
      "answer": "Do",
      "options": [
        "Do",
        "Are",
        "Does",
        "Is"
      ]
    },
    {
      "blanked": "___ Thomas know the secret recipe?",
      "answer": "Does",
      "options": [
        "Does",
        "Do",
        "Is",
        "Has"
      ]
    },
    {
      "blanked": "___ she speak Japanese fluently?",
      "answer": "Can",
      "options": [
        "Can",
        "Do",
        "Are",
        "Have"
      ]
    }
  ],
  "53": [
    {
      "blanked": "My phone ___ hold a charge anymore.",
      "answer": "doesn't",
      "options": [
        "not doesn't",
        "no holds",
        "doesn't",
        "isn't"
      ]
    },
    {
      "blanked": "They ___ finished unpacking the crates yet.",
      "answer": "haven't",
      "options": [
        "haven't",
        "don't",
        "didn't",
        "aren't"
      ]
    },
    {
      "blanked": "We ___ agree with the suggested budget.",
      "answer": "do not",
      "options": [
        "do not",
        "not do",
        "no do",
        "are not do"
      ]
    },
    {
      "blanked": "He ___ swim very well in deep water.",
      "answer": "cannot",
      "options": [
        "cannot",
        "cannot to",
        "not can",
        "doesn't can"
      ]
    },
    {
      "blanked": "Sandra ___ like sweet desserts after dinner.",
      "answer": "does not",
      "options": [
        "does not",
        "not does",
        "is not",
        "do not"
      ]
    }
  ],
  "54": [
    {
      "blanked": "Correct question order: Where ___ last weekend?",
      "answer": "did they camp",
      "options": [
        "they camped",
        "did they camp",
        "camped they",
        "were they camp"
      ]
    },
    {
      "blanked": "Correct question order: What time ___?",
      "answer": "does the ferry sail",
      "options": [
        "the ferry sails",
        "sails the ferry",
        "does the ferry sail",
        "is the ferry sail"
      ]
    },
    {
      "blanked": "Where ___ your winter jackets?",
      "answer": "do you buy",
      "options": [
        "do you buy",
        "you buy",
        "buy you",
        "are you buy"
      ]
    },
    {
      "blanked": "Why ___ so early this morning?",
      "answer": "did she wake up",
      "options": [
        "did she wake up",
        "she woke up",
        "woke she up",
        "was she woke up"
      ]
    },
    {
      "blanked": "When ___ the bus for Oxford?",
      "answer": "will we catch",
      "options": [
        "will we catch",
        "we will catch",
        "catch will we",
        "do we will catch"
      ]
    }
  ],
  "55": [
    {
      "blanked": "Subject question: Who ___ this delicious pie?",
      "answer": "baked",
      "options": [
        "did bake",
        "baked",
        "did baked",
        "was bake"
      ]
    },
    {
      "blanked": "Subject question: Who ___ the guitar in your band?",
      "answer": "plays",
      "options": [
        "does play",
        "play",
        "plays",
        "is play"
      ]
    },
    {
      "blanked": "Subject question: Who ___ the window in the lounge?",
      "answer": "broke",
      "options": [
        "broke",
        "did break",
        "did broke",
        "was break"
      ]
    },
    {
      "blanked": "Subject question: Who ___ the best coffee in town?",
      "answer": "serves",
      "options": [
        "serves",
        "does serve",
        "serve",
        "is serve"
      ]
    },
    {
      "blanked": "Object question: Who ___ meet at the station yesterday?",
      "answer": "did you",
      "options": [
        "did you",
        "you did",
        "were you",
        "you"
      ]
    }
  ],
  "56": [
    {
      "blanked": "___ happened after the power returned?",
      "answer": "What",
      "options": [
        "Who",
        "What",
        "Where",
        "Which"
      ]
    },
    {
      "blanked": "___ does your older brother do for a living?",
      "answer": "What",
      "options": [
        "Where",
        "Who",
        "What",
        "When"
      ]
    },
    {
      "blanked": "___ did you learn during today's lecture?",
      "answer": "What",
      "options": [
        "What",
        "Who",
        "Where",
        "Why"
      ]
    },
    {
      "blanked": "___ is your father's profession?",
      "answer": "What",
      "options": [
        "What",
        "Where",
        "Who",
        "How"
      ]
    },
    {
      "blanked": "___ caused the delay on the train tracks?",
      "answer": "What",
      "options": [
        "What",
        "When",
        "Where",
        "Who"
      ]
    }
  ],
  "57": [
    {
      "blanked": "___ did you hide the spare house key?",
      "answer": "Where",
      "options": [
        "When",
        "Who",
        "Where",
        "Why"
      ]
    },
    {
      "blanked": "___ is the nearest tram stop from here?",
      "answer": "Where",
      "options": [
        "Where",
        "What",
        "When",
        "How"
      ]
    },
    {
      "blanked": "___ are the hikers heading this afternoon?",
      "answer": "Where",
      "options": [
        "Where",
        "When",
        "Why",
        "Who"
      ]
    },
    {
      "blanked": "___ did you leave your leather jacket?",
      "answer": "Where",
      "options": [
        "Where",
        "When",
        "Who",
        "Which"
      ]
    },
    {
      "blanked": "___ does this scenic mountain path lead?",
      "answer": "Where",
      "options": [
        "Where",
        "What",
        "Why",
        "When"
      ]
    }
  ],
  "58": [
    {
      "blanked": "___ does the morning ferry leave the port?",
      "answer": "When",
      "options": [
        "Where",
        "Who",
        "When",
        "Why"
      ]
    },
    {
      "blanked": "___ were these ancient ruins first discovered?",
      "answer": "When",
      "options": [
        "Who",
        "When",
        "Where",
        "Which"
      ]
    },
    {
      "blanked": "___ does the library close on Fridays?",
      "answer": "When",
      "options": [
        "When",
        "Where",
        "Why",
        "Who"
      ]
    },
    {
      "blanked": "___ did you celebrate your graduation?",
      "answer": "When",
      "options": [
        "When",
        "Where",
        "What",
        "Which"
      ]
    },
    {
      "blanked": "___ will the construction work begin?",
      "answer": "When",
      "options": [
        "When",
        "Who",
        "Where",
        "Why"
      ]
    }
  ],
  "59": [
    {
      "blanked": "___ did you cancel Tuesday’s rehearsal?",
      "answer": "Why",
      "options": [
        "When",
        "Why",
        "Which",
        "Who"
      ]
    },
    {
      "blanked": "Why are you whispering? — ___ the baby is asleep.",
      "answer": "Because",
      "options": [
        "To",
        "Because",
        "So",
        "Where"
      ]
    },
    {
      "blanked": "Why did you call the technician? — ___ fix the heating.",
      "answer": "To",
      "options": [
        "To",
        "For",
        "Because",
        "So that"
      ]
    },
    {
      "blanked": "___ are all the street lamps turned off?",
      "answer": "Why",
      "options": [
        "Why",
        "When",
        "Where",
        "Who"
      ]
    },
    {
      "blanked": "Why did you take an umbrella? — ___ it was raining.",
      "answer": "Because",
      "options": [
        "Because",
        "To",
        "For",
        "Although"
      ]
    }
  ],
  "60": [
    {
      "blanked": "___ does it take to bake sourdough bread?",
      "answer": "How long",
      "options": [
        "How many",
        "How long",
        "How much time far",
        "How old"
      ]
    },
    {
      "blanked": "___ is the train station from the hotel?",
      "answer": "How far",
      "options": [
        "How far",
        "How long time",
        "How tall",
        "What far"
      ]
    },
    {
      "blanked": "___ is your grandfather today?",
      "answer": "How",
      "options": [
        "How",
        "What",
        "Which",
        "Where"
      ]
    },
    {
      "blanked": "___ is that ancient castle on the hill?",
      "answer": "How old",
      "options": [
        "How old",
        "How long",
        "How far",
        "How much"
      ]
    },
    {
      "blanked": "___ do you solve this mathematical equation?",
      "answer": "How",
      "options": [
        "How",
        "What",
        "Which",
        "Who"
      ]
    }
  ],
  "61": [
    {
      "blanked": "Of these two sweaters, ___ keeps you warmer?",
      "answer": "which",
      "options": [
        "what",
        "which",
        "who",
        "where"
      ]
    },
    {
      "blanked": "Look at the three routes: ___ is the shortest?",
      "answer": "which",
      "options": [
        "what",
        "how",
        "which",
        "why"
      ]
    },
    {
      "blanked": "___ flavor of ice cream would you like from the menu?",
      "answer": "Which",
      "options": [
        "Which",
        "What",
        "Where",
        "Who"
      ]
    },
    {
      "blanked": "___ languages do you speak in general?",
      "answer": "What",
      "options": [
        "What",
        "Which",
        "Who",
        "Where"
      ]
    },
    {
      "blanked": "Between the red and the blue umbrella, ___ is yours?",
      "answer": "which",
      "options": [
        "which",
        "what",
        "who",
        "where"
      ]
    }
  ],
  "62": [
    {
      "blanked": "___ waterproof backpack was left by the bench?",
      "answer": "Whose",
      "options": [
        "Who's",
        "Whose",
        "Which",
        "Whom"
      ]
    },
    {
      "blanked": "___ sunglasses are lying on the dashboard?",
      "answer": "Whose",
      "options": [
        "Who",
        "Who's",
        "Whose",
        "What"
      ]
    },
    {
      "blanked": "___ bicycle is parked outside the shop?",
      "answer": "Whose",
      "options": [
        "Whose",
        "Who's",
        "Who",
        "Which"
      ]
    },
    {
      "blanked": "___ is this warm wool scarf?",
      "answer": "Whose",
      "options": [
        "Whose",
        "Who's",
        "Who",
        "Whom"
      ]
    },
    {
      "blanked": "Do you know ___ signature is on this document?",
      "answer": "whose",
      "options": [
        "whose",
        "who's",
        "whom",
        "which"
      ]
    }
  ],
  "63": [
    {
      "blanked": "Our new apartment ___ a bright sunny balcony.",
      "answer": "has",
      "options": [
        "have",
        "has",
        "is having",
        "do have"
      ]
    },
    {
      "blanked": "Sadly, this old laptop ___ a working webcam.",
      "answer": "doesn't have",
      "options": [
        "haven't",
        "don't have",
        "doesn't have",
        "isn't having"
      ]
    },
    {
      "blanked": "They ___ a spacious garden behind their house.",
      "answer": "have",
      "options": [
        "have",
        "has",
        "is having",
        "are have"
      ]
    },
    {
      "blanked": "We ___ any spare batteries in the drawer.",
      "answer": "don't have",
      "options": [
        "don't have",
        "doesn't have",
        "haven't",
        "aren't have"
      ]
    },
    {
      "blanked": "Does your friend ___ an extra charger?",
      "answer": "have",
      "options": [
        "have",
        "has",
        "having",
        "had"
      ]
    }
  ],
  "64": [
    {
      "blanked": "My little nephew ___ read simple comics already.",
      "answer": "can",
      "options": [
        "can to",
        "cans",
        "can",
        "is can"
      ]
    },
    {
      "blanked": "Visitors ___ bring glass bottles inside the stadium.",
      "answer": "can't",
      "options": [
        "don't can",
        "can't to",
        "aren't can",
        "can't"
      ]
    },
    {
      "blanked": "Excuse me, ___ I open the window for some fresh air?",
      "answer": "can",
      "options": [
        "can",
        "can to",
        "am can",
        "cans"
      ]
    },
    {
      "blanked": "She ___ play the violin very gracefully.",
      "answer": "can",
      "options": [
        "can",
        "can to",
        "cans",
        "is can"
      ]
    },
    {
      "blanked": "You ___ take photos inside this art gallery.",
      "answer": "can't",
      "options": [
        "can't",
        "can't to",
        "aren't can",
        "don't can"
      ]
    }
  ],
  "65": [
    {
      "blanked": "All the winter coats are stored ___ the closet.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "to"
      ]
    },
    {
      "blanked": "Her cousins grew up ___ Osaka, Japan.",
      "answer": "in",
      "options": [
        "at",
        "on",
        "in",
        "to"
      ]
    },
    {
      "blanked": "The children were playing happily ___ the living room.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "to"
      ]
    },
    {
      "blanked": "He spent three years working ___ Canada.",
      "answer": "in",
      "options": [
        "in",
        "at",
        "to",
        "on"
      ]
    },
    {
      "blanked": "She kept all her coins ___ a small leather purse.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "towards"
      ]
    }
  ],
  "66": [
    {
      "blanked": "Please hang the calendar ___ the kitchen wall.",
      "answer": "on",
      "options": [
        "in",
        "on",
        "at",
        "into"
      ]
    },
    {
      "blanked": "We met our teacher ___ the commuter train.",
      "answer": "on",
      "options": [
        "at",
        "in",
        "on",
        "to"
      ]
    },
    {
      "blanked": "Leave your keys ___ the wooden desk.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "underneath"
      ]
    },
    {
      "blanked": "Their apartment is located ___ the third floor.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "by"
      ]
    },
    {
      "blanked": "There were many passengers reading ___ the morning bus.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "into"
      ]
    }
  ],
  "67": [
    {
      "blanked": "Meet our guide ___ the main museum entrance.",
      "answer": "at",
      "options": [
        "at",
        "in",
        "to",
        "over"
      ]
    },
    {
      "blanked": "She lives ___ 42 Oak Avenue.",
      "answer": "at",
      "options": [
        "on",
        "in",
        "at",
        "from"
      ]
    },
    {
      "blanked": "Someone is knocking ___ the front door.",
      "answer": "at",
      "options": [
        "at",
        "on",
        "in",
        "to"
      ]
    },
    {
      "blanked": "We ran into each other ___ the rock concert.",
      "answer": "at",
      "options": [
        "at",
        "in",
        "on",
        "into"
      ]
    },
    {
      "blanked": "The taxi is waiting ___ the arrivals gate.",
      "answer": "at",
      "options": [
        "at",
        "on",
        "to",
        "by of"
      ]
    }
  ],
  "68": [
    {
      "blanked": "The delivery van drove straight ___ the warehouse.",
      "answer": "to",
      "options": [
        "at",
        "to",
        "with",
        "of"
      ]
    },
    {
      "blanked": "Hand that signed receipt ___ the cashier.",
      "answer": "to",
      "options": [
        "from",
        "at",
        "to",
        "in"
      ]
    },
    {
      "blanked": "They walked together ___ the subway station.",
      "answer": "to",
      "options": [
        "to",
        "at",
        "for",
        "with"
      ]
    },
    {
      "blanked": "She passed the document ___ her supervisor.",
      "answer": "to",
      "options": [
        "to",
        "from",
        "with",
        "at"
      ]
    },
    {
      "blanked": "We are traveling ___ Rome for the holiday.",
      "answer": "to",
      "options": [
        "to",
        "at",
        "in",
        "on"
      ]
    }
  ],
  "69": [
    {
      "blanked": "These roasted cocoa beans come ___ Ecuador.",
      "answer": "from",
      "options": [
        "to",
        "from",
        "with",
        "into"
      ]
    },
    {
      "blanked": "I received a postcard ___ my friend in Oslo.",
      "answer": "from",
      "options": [
        "from",
        "to",
        "at",
        "on"
      ]
    },
    {
      "blanked": "The marathon runners dashed ___ the starting line.",
      "answer": "from",
      "options": [
        "from",
        "to",
        "at",
        "with"
      ]
    },
    {
      "blanked": "Where are those ceramic tiles ___ originally?",
      "answer": "from",
      "options": [
        "from",
        "to",
        "at",
        "in"
      ]
    },
    {
      "blanked": "We borrowed this antique dictionary ___ the library.",
      "answer": "from",
      "options": [
        "from",
        "to",
        "at",
        "by"
      ]
    }
  ],
  "70": [
    {
      "blanked": "Cut the thick cardboard ___ sharp scissors.",
      "answer": "with",
      "options": [
        "by",
        "with",
        "from",
        "about"
      ]
    },
    {
      "blanked": "Do you enjoy pancakes ___ maple syrup?",
      "answer": "with",
      "options": [
        "to",
        "by",
        "with",
        "at"
      ]
    },
    {
      "blanked": "He unlocked the garage door ___ an old brass key.",
      "answer": "with",
      "options": [
        "with",
        "by",
        "from",
        "at"
      ]
    },
    {
      "blanked": "Liam went to the modern art museum ___ his sister.",
      "answer": "with",
      "options": [
        "with",
        "by",
        "from",
        "to"
      ]
    },
    {
      "blanked": "Stir the warm vegetable soup ___ a wooden spoon.",
      "answer": "with",
      "options": [
        "with",
        "in",
        "by",
        "for"
      ]
    }
  ],
  "71": [
    {
      "blanked": "He left the house without ___ his keys.",
      "answer": "checking",
      "options": [
        "check",
        "to check",
        "checking",
        "checked"
      ]
    },
    {
      "blanked": "She solved the problem ___ asking for hints.",
      "answer": "without",
      "options": [
        "with",
        "from",
        "without",
        "about"
      ]
    },
    {
      "blanked": "He prefers black tea without ___ or lemon.",
      "answer": "milk",
      "options": [
        "milk",
        "milking",
        "to milk",
        "milked"
      ]
    },
    {
      "blanked": "Never sign a lease without ___ the terms carefully.",
      "answer": "reading",
      "options": [
        "reading",
        "read",
        "to read",
        "reads"
      ]
    },
    {
      "blanked": "They completed the difficult hike ___ any complaints.",
      "answer": "without",
      "options": [
        "without",
        "with",
        "by",
        "for"
      ]
    }
  ],
  "72": [
    {
      "blanked": "This documentary is ___ Arctic whales.",
      "answer": "about",
      "options": [
        "about",
        "with",
        "from",
        "to"
      ]
    },
    {
      "blanked": "The hike takes ___ forty minutes on foot.",
      "answer": "about",
      "options": [
        "for",
        "about",
        "by",
        "since"
      ]
    },
    {
      "blanked": "We read a gripping article ___ space exploration.",
      "answer": "about",
      "options": [
        "about",
        "with",
        "for",
        "from"
      ]
    },
    {
      "blanked": "There are ___ fifty passengers on the bus.",
      "answer": "about",
      "options": [
        "about",
        "since",
        "until",
        "for"
      ]
    },
    {
      "blanked": "What were you two talking ___ in the hallway?",
      "answer": "about",
      "options": [
        "about",
        "of",
        "from",
        "with"
      ]
    }
  ],
  "73": [
    {
      "blanked": "We wrapped this warm scarf ___ Grandma.",
      "answer": "for",
      "options": [
        "to",
        "for",
        "with",
        "about"
      ]
    },
    {
      "blanked": "They waited at the pier ___ nearly an hour.",
      "answer": "for",
      "options": [
        "since",
        "at",
        "for",
        "until"
      ]
    },
    {
      "blanked": "I bought these fresh flowers ___ my mother.",
      "answer": "for",
      "options": [
        "for",
        "to",
        "at",
        "from"
      ]
    },
    {
      "blanked": "She studied French in Lyon ___ six months.",
      "answer": "for",
      "options": [
        "for",
        "since",
        "at",
        "during"
      ]
    },
    {
      "blanked": "We went to the store ___ some groceries.",
      "answer": "for",
      "options": [
        "for",
        "to",
        "at",
        "with"
      ]
    }
  ],
  "74": [
    {
      "blanked": "The last express train departs ___ 11:15 PM.",
      "answer": "at",
      "options": [
        "in",
        "on",
        "at",
        "to"
      ]
    },
    {
      "blanked": "Owls usually hunt quietly ___ night.",
      "answer": "at",
      "options": [
        "in",
        "on",
        "at",
        "during"
      ]
    },
    {
      "blanked": "We usually take our lunch break ___ noon.",
      "answer": "at",
      "options": [
        "at",
        "in",
        "on",
        "to"
      ]
    },
    {
      "blanked": "The concert concluded exactly ___ midnight.",
      "answer": "at",
      "options": [
        "at",
        "in",
        "on",
        "by"
      ]
    },
    {
      "blanked": "The morning meeting begins ___ 9:00 AM sharp.",
      "answer": "at",
      "options": [
        "at",
        "in",
        "on",
        "with"
      ]
    }
  ],
  "75": [
    {
      "blanked": "Our piano lessons are ___ Wednesday afternoon.",
      "answer": "on",
      "options": [
        "in",
        "on",
        "at",
        "by"
      ]
    },
    {
      "blanked": "The festival opens ___ June 14th.",
      "answer": "on",
      "options": [
        "in",
        "at",
        "on",
        "from"
      ]
    },
    {
      "blanked": "The package is scheduled to arrive ___ Tuesday.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "by"
      ]
    },
    {
      "blanked": "Our anniversary is celebrated ___ September 20th.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "from"
      ]
    },
    {
      "blanked": "We love going for long jogs ___ Saturday morning.",
      "answer": "on",
      "options": [
        "on",
        "in",
        "at",
        "by"
      ]
    }
  ],
  "76": [
    {
      "blanked": "Cherry blossoms appear here ___ April.",
      "answer": "in",
      "options": [
        "on",
        "at",
        "in",
        "to"
      ]
    },
    {
      "blanked": "I always drink green tea ___ the morning.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "by"
      ]
    },
    {
      "blanked": "Leaves turn vibrant red and gold ___ autumn.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "to"
      ]
    },
    {
      "blanked": "This historic bridge was built ___ 1924.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "by"
      ]
    },
    {
      "blanked": "We prefer relaxing with a book ___ the evening.",
      "answer": "in",
      "options": [
        "in",
        "on",
        "at",
        "by"
      ]
    }
  ],
  "77": [
    {
      "blanked": "Pure mountain water ___ at 100 degrees Celsius.",
      "answer": "boils",
      "options": [
        "boiling",
        "boils",
        "is boil",
        "boil"
      ]
    },
    {
      "blanked": "We ___ fresh croissants every Sunday morning.",
      "answer": "bake",
      "options": [
        "bake",
        "bakes",
        "baking",
        "to bake"
      ]
    },
    {
      "blanked": "The local museum ___ at ten o'clock every morning.",
      "answer": "opens",
      "options": [
        "opens",
        "open",
        "opening",
        "to open"
      ]
    },
    {
      "blanked": "They ___ soccer in the local park every weekend.",
      "answer": "play",
      "options": [
        "play",
        "plays",
        "playing",
        "to play"
      ]
    },
    {
      "blanked": "The earth ___ around the sun.",
      "answer": "revolves",
      "options": [
        "revolves",
        "revolve",
        "revolving",
        "is revolve"
      ]
    }
  ],
  "78": [
    {
      "blanked": "Dan ___ his car every second Saturday.",
      "answer": "washes",
      "options": [
        "wash",
        "washs",
        "washes",
        "washing"
      ]
    },
    {
      "blanked": "My aunt ___ calligraphy as a hobby.",
      "answer": "teaches",
      "options": [
        "teach",
        "teachs",
        "teaches",
        "teaching"
      ]
    },
    {
      "blanked": "He ___ to the gym three times a week.",
      "answer": "goes",
      "options": [
        "goes",
        "go",
        "gos",
        "going"
      ]
    },
    {
      "blanked": "Sarah ___ classical literature in her spare time.",
      "answer": "reads",
      "options": [
        "reads",
        "read",
        "reades",
        "reading"
      ]
    },
    {
      "blanked": "The mechanic ___ broken appliances efficiently.",
      "answer": "fixes",
      "options": [
        "fixes",
        "fix",
        "fixs",
        "fixing"
      ]
    }
  ],
  "79": [
    {
      "blanked": "Does Elena ___ near the central square?",
      "answer": "live",
      "options": [
        "lives",
        "live",
        "living",
        "lived"
      ]
    },
    {
      "blanked": "My alarm clock ___ ring on bank holidays.",
      "answer": "doesn't",
      "options": [
        "don't",
        "isn't",
        "doesn't",
        "hasn't"
      ]
    },
    {
      "blanked": "Does your father ___ coffee in the morning?",
      "answer": "drink",
      "options": [
        "drink",
        "drinks",
        "drinking",
        "drank"
      ]
    },
    {
      "blanked": "She ___ eat spicy food when dining out.",
      "answer": "doesn't",
      "options": [
        "doesn't",
        "don't",
        "isn't",
        "hasn't"
      ]
    },
    {
      "blanked": "Why does the train ___ so frequently at night?",
      "answer": "stop",
      "options": [
        "stop",
        "stops",
        "stopping",
        "stopped"
      ]
    }
  ],
  "80": [
    {
      "blanked": "Correct position: Nora ___ on weekdays.",
      "answer": "usually cycles",
      "options": [
        "cycles usually",
        "usually cycles",
        "does usually cycle",
        "is cycle usually"
      ]
    },
    {
      "blanked": "Correct position: That fast train ___ behind schedule.",
      "answer": "is rarely",
      "options": [
        "rarely is",
        "is rarely",
        "rarely does",
        "be rarely"
      ]
    },
    {
      "blanked": "Correct position: Marcus ___ cereal for breakfast.",
      "answer": "always eats",
      "options": [
        "always eats",
        "eats always",
        "is eat always",
        "does always eat"
      ]
    },
    {
      "blanked": "Correct position: Our managers ___ patient with new staff.",
      "answer": "are always",
      "options": [
        "are always",
        "always are",
        "do always be",
        "be always"
      ]
    },
    {
      "blanked": "Correct position: We ___ movies on weekday evenings.",
      "answer": "never watch",
      "options": [
        "never watch",
        "watch never",
        "do watch never",
        "are watch never"
      ]
    }
  ],
  "81": [
    {
      "blanked": "Countable plural: Three bright ___ landed on the fence.",
      "answer": "sparrows",
      "options": [
        "sparrow",
        "sparrows",
        "a sparrow",
        "much sparrow"
      ]
    },
    {
      "blanked": "Countable singular: Can you lend me ___ for a second?",
      "answer": "a ruler",
      "options": [
        "ruler",
        "a ruler",
        "many ruler",
        "rulers a"
      ]
    },
    {
      "blanked": "There are four ___ waiting outside the clinic.",
      "answer": "patients",
      "options": [
        "patient",
        "patients",
        "much patient",
        "a patients"
      ]
    },
    {
      "blanked": "I need to buy ___ before starting this drawing.",
      "answer": "an eraser",
      "options": [
        "eraser",
        "an eraser",
        "erasers an",
        "many eraser"
      ]
    },
    {
      "blanked": "We counted seven ___ flying over the lake.",
      "answer": "swans",
      "options": [
        "swan",
        "swans",
        "a swan",
        "much swans"
      ]
    }
  ],
  "82": [
    {
      "blanked": "There isn’t ___ left in the pitcher.",
      "answer": "much juice",
      "options": [
        "a juice",
        "many juices",
        "much juice",
        "two juices"
      ]
    },
    {
      "blanked": "Put ___ honey into the warm herbal tea.",
      "answer": "some",
      "options": [
        "a",
        "some",
        "several",
        "many"
      ]
    },
    {
      "blanked": "He poured fresh ___ into the glass bowl.",
      "answer": "milk",
      "options": [
        "a milk",
        "milks",
        "milk",
        "several milks"
      ]
    },
    {
      "blanked": "We don't have enough ___ to complete the project.",
      "answer": "time",
      "options": [
        "a time",
        "times",
        "time",
        "many time"
      ]
    },
    {
      "blanked": "How much ___ did they bring for the baking class?",
      "answer": "flour",
      "options": [
        "flour",
        "flours",
        "a flour",
        "many flours"
      ]
    }
  ],
  "83": [
    {
      "blanked": "Our guide gave us ___ about local trails.",
      "answer": "useful advice",
      "options": [
        "a useful advice",
        "useful advices",
        "useful advice",
        "many advices"
      ]
    },
    {
      "blanked": "The hall has modern audio ___.",
      "answer": "equipment",
      "options": [
        "an equipment",
        "equipments",
        "many equipment",
        "equipment"
      ]
    },
    {
      "blanked": "All of our heavy ___ was loaded onto the bus.",
      "answer": "luggage",
      "options": [
        "a luggage",
        "luggages",
        "luggage",
        "many luggages"
      ]
    },
    {
      "blanked": "This living room needs new ___ before we move in.",
      "answer": "furniture",
      "options": [
        "furnitures",
        "a furniture",
        "furniture",
        "many furnitures"
      ]
    },
    {
      "blanked": "The scientist shared valuable ___ about the discovery.",
      "answer": "information",
      "options": [
        "an information",
        "informations",
        "information",
        "many informations"
      ]
    }
  ],
  "84": [
    {
      "blanked": "We packed ___ fresh peaches for the drive.",
      "answer": "some",
      "options": [
        "any",
        "some",
        "no an",
        "a"
      ]
    },
    {
      "blanked": "There is ___ olive oil on the top shelf.",
      "answer": "some",
      "options": [
        "some",
        "any",
        "few",
        "many"
      ]
    },
    {
      "blanked": "She bought ___ beautiful flowers at the market.",
      "answer": "some",
      "options": [
        "any",
        "some",
        "every",
        "a"
      ]
    },
    {
      "blanked": "There is ___ orange juice left in the fridge.",
      "answer": "some",
      "options": [
        "any",
        "many",
        "some",
        "few"
      ]
    },
    {
      "blanked": "They invited ___ neighbors over for dinner.",
      "answer": "some",
      "options": [
        "any",
        "much",
        "some",
        "a"
      ]
    }
  ],
  "85": [
    {
      "blanked": "Polite offer: Would you care for ___ lemonade?",
      "answer": "some",
      "options": [
        "any",
        "some",
        "many",
        "few"
      ]
    },
    {
      "blanked": "Polite request: Could I borrow ___ paper clips?",
      "answer": "some",
      "options": [
        "some",
        "any",
        "much",
        "little"
      ]
    },
    {
      "blanked": "Would you like ___ warm biscuits with your meal?",
      "answer": "some",
      "options": [
        "any",
        "some",
        "much",
        "little"
      ]
    },
    {
      "blanked": "Can you pass me ___ napkins from that counter?",
      "answer": "some",
      "options": [
        "any",
        "much",
        "some",
        "little"
      ]
    },
    {
      "blanked": "Shall I pour you ___ hot chocolate?",
      "answer": "some",
      "options": [
        "any",
        "many",
        "some",
        "few"
      ]
    }
  ],
  "86": [
    {
      "blanked": "Wait — I can’t find ___ batteries in this drawer.",
      "answer": "any",
      "options": [
        "some",
        "no",
        "any",
        "many"
      ]
    },
    {
      "blanked": "Are there ___ pharmacies open after midnight?",
      "answer": "any",
      "options": [
        "some",
        "any",
        "a",
        "much"
      ]
    },
    {
      "blanked": "Do you have ___ questions about the schedule?",
      "answer": "any",
      "options": [
        "some",
        "any",
        "no",
        "much"
      ]
    },
    {
      "blanked": "We didn't see ___ wildlife during our hike.",
      "answer": "any",
      "options": [
        "some",
        "no",
        "any",
        "much"
      ]
    },
    {
      "blanked": "Is there ___ milk left for tomorrow morning?",
      "answer": "any",
      "options": [
        "some",
        "any",
        "many",
        "few"
      ]
    }
  ],
  "87": [
    {
      "blanked": "Luckily, there is ___ traffic on the ring road today.",
      "answer": "no",
      "options": [
        "not any of",
        "no",
        "any",
        "none"
      ]
    },
    {
      "blanked": "Notice the affirmative verb: She had ___ cash in her wallet.",
      "answer": "no",
      "options": [
        "no",
        "not",
        "any",
        "never"
      ]
    },
    {
      "blanked": "There are ___ clouds in the bright blue sky.",
      "answer": "no",
      "options": [
        "not",
        "no",
        "any",
        "none"
      ]
    },
    {
      "blanked": "He gave ___ reason for his unexpected absence.",
      "answer": "no",
      "options": [
        "not",
        "no",
        "none",
        "any"
      ]
    },
    {
      "blanked": "I have ___ doubt that she will pass the exam.",
      "answer": "no",
      "options": [
        "not",
        "no",
        "any",
        "none"
      ]
    }
  ],
  "88": [
    {
      "blanked": "How ___ suitcases are we checking onto the flight?",
      "answer": "many",
      "options": [
        "much",
        "many",
        "little",
        "a little"
      ]
    },
    {
      "blanked": "There wasn’t ___ snow on the slopes in March.",
      "answer": "much",
      "options": [
        "many",
        "few",
        "much",
        "several"
      ]
    },
    {
      "blanked": "Did ___ students attend the optional lecture?",
      "answer": "many",
      "options": [
        "much",
        "many",
        "little",
        "a little"
      ]
    },
    {
      "blanked": "I don't drink ___ coffee in the late afternoon.",
      "answer": "much",
      "options": [
        "many",
        "much",
        "few",
        "a few"
      ]
    },
    {
      "blanked": "How ___ petrol is still remaining in the tank?",
      "answer": "much",
      "options": [
        "many",
        "much",
        "few",
        "several"
      ]
    }
  ],
  "89": [
    {
      "blanked": "Yes, this quiet town has ___ cozy bakeries.",
      "answer": "a lot of",
      "options": [
        "much",
        "a lot of",
        "a little",
        "many of"
      ]
    },
    {
      "blanked": "She spent ___ time perfecting her violin solo.",
      "answer": "lots of",
      "options": [
        "many",
        "few",
        "lots of",
        "several"
      ]
    },
    {
      "blanked": "The library has ___ rare manuscripts on display.",
      "answer": "a lot of",
      "options": [
        "much",
        "a little",
        "a lot of",
        "many of"
      ]
    },
    {
      "blanked": "There are ___ interesting birds in this wetland.",
      "answer": "lots of",
      "options": [
        "much",
        "lots of",
        "little",
        "a little"
      ]
    },
    {
      "blanked": "We received ___ positive feedback from the team.",
      "answer": "a lot of",
      "options": [
        "many",
        "a lot of",
        "few",
        "a few"
      ]
    }
  ],
  "90": [
    {
      "blanked": "Relax, we still have ___ time before boarding.",
      "answer": "plenty of",
      "options": [
        "few",
        "plenty of",
        "many",
        "plenty"
      ]
    },
    {
      "blanked": "There are ___ clean mugs in the cupboard.",
      "answer": "plenty of",
      "options": [
        "much",
        "little",
        "plenty of",
        "plenty"
      ]
    },
    {
      "blanked": "Don't worry about food; we made ___ soup.",
      "answer": "plenty of",
      "options": [
        "many",
        "few",
        "plenty of",
        "plenty"
      ]
    },
    {
      "blanked": "The hotel garden has ___ shade under the trees.",
      "answer": "plenty of",
      "options": [
        "many",
        "few",
        "plenty of",
        "plenty"
      ]
    },
    {
      "blanked": "You will find ___ seats available in the rear car.",
      "answer": "plenty of",
      "options": [
        "much",
        "little",
        "plenty of",
        "plenty"
      ]
    }
  ],
  "91": [
    {
      "blanked": "Good news: ___ volunteers arrived early to help!",
      "answer": "A few",
      "options": [
        "Few",
        "A few",
        "Little",
        "A little"
      ]
    },
    {
      "blanked": "Unfortunately, ___ shops stay open past nine here.",
      "answer": "few",
      "options": [
        "a little",
        "few",
        "much",
        "plenty"
      ]
    },
    {
      "blanked": "We still have ___ minutes left to review the plan.",
      "answer": "a few",
      "options": [
        "few",
        "a few",
        "little",
        "a little"
      ]
    },
    {
      "blanked": "Sadly, ___ travelers bother to visit this remote ruin.",
      "answer": "few",
      "options": [
        "a few",
        "few",
        "a little",
        "little"
      ]
    },
    {
      "blanked": "I managed to take ___ photographs before the fog rolled in.",
      "answer": "a few",
      "options": [
        "few",
        "a few",
        "little",
        "much"
      ]
    }
  ],
  "92": [
    {
      "blanked": "Wait — we still have ___ milk for one coffee.",
      "answer": "a little",
      "options": [
        "little",
        "a little",
        "few",
        "a few"
      ]
    },
    {
      "blanked": "Sadly, there is ___ hope of clear skies today.",
      "answer": "little",
      "options": [
        "a few",
        "few",
        "little",
        "many"
      ]
    },
    {
      "blanked": "Can you give me ___ help with this heavy box?",
      "answer": "a little",
      "options": [
        "little",
        "a little",
        "few",
        "a few"
      ]
    },
    {
      "blanked": "There is ___ interest in reviving that outdated law.",
      "answer": "little",
      "options": [
        "a little",
        "little",
        "few",
        "a few"
      ]
    },
    {
      "blanked": "We still have ___ time to finish the crossword.",
      "answer": "a little",
      "options": [
        "little",
        "a little",
        "few",
        "many"
      ]
    }
  ],
  "93": [
    {
      "blanked": "There are ___ bikes parked beside the narrow gate.",
      "answer": "too many",
      "options": [
        "too much",
        "too many",
        "much too",
        "many enough"
      ]
    },
    {
      "blanked": "Adding ___ salt spoils the delicate soup.",
      "answer": "too much",
      "options": [
        "too many",
        "many",
        "too much",
        "too few"
      ]
    },
    {
      "blanked": "Don't pack ___ heavy coats for a summer trip.",
      "answer": "too many",
      "options": [
        "too much",
        "too many",
        "many too",
        "too enough"
      ]
    },
    {
      "blanked": "Drinking ___ caffeine makes it hard to sleep.",
      "answer": "too much",
      "options": [
        "too many",
        "too much",
        "many too",
        "too few"
      ]
    },
    {
      "blanked": "There were ___ tourists crammed into the tiny museum.",
      "answer": "too many",
      "options": [
        "too much",
        "too many",
        "much too",
        "enough too"
      ]
    }
  ],
  "94": [
    {
      "blanked": "Did ___ remember to lock the side door?",
      "answer": "anyone",
      "options": [
        "any one",
        "anyone",
        "some of one",
        "no body"
      ]
    },
    {
      "blanked": "There is ___ quiet to sit in this crowded mall.",
      "answer": "nowhere",
      "options": [
        "no where",
        "nowhere",
        "every where",
        "any where"
      ]
    },
    {
      "blanked": "I left my umbrella ___ in the train station.",
      "answer": "somewhere",
      "options": [
        "some where",
        "somewhere",
        "any where",
        "every where"
      ]
    },
    {
      "blanked": "Is there ___ unusual about this painting?",
      "answer": "anything",
      "options": [
        "any thing",
        "anything",
        "some thing",
        "every thing"
      ]
    },
    {
      "blanked": "___ must have dropped this silver earring.",
      "answer": "Somebody",
      "options": [
        "Some body",
        "Somebody",
        "Any body",
        "No body"
      ]
    }
  ],
  "95": [
    {
      "blanked": "Everybody in this workshop ___ an extra notebook.",
      "answer": "needs",
      "options": [
        "need",
        "needs",
        "are needing",
        "have needed"
      ]
    },
    {
      "blanked": "Nobody ___ where the spare compass went.",
      "answer": "knows",
      "options": [
        "know",
        "are knowing",
        "knows",
        "were knowing"
      ]
    },
    {
      "blanked": "Someone ___ knocking loudly on the front door.",
      "answer": "is",
      "options": [
        "are",
        "is",
        "were",
        "be"
      ]
    },
    {
      "blanked": "Everything ___ ready for tomorrow's performance.",
      "answer": "is",
      "options": [
        "are",
        "is",
        "were",
        "being"
      ]
    },
    {
      "blanked": "Everyone ___ their own ticket before entering.",
      "answer": "shows",
      "options": [
        "show",
        "shows",
        "are showing",
        "have shown"
      ]
    }
  ],
  "96": [
    {
      "blanked": "Good ___ travels slowly compared to gossip.",
      "answer": "news",
      "options": [
        "news are",
        "news",
        "news were",
        "a news"
      ]
    },
    {
      "blanked": "Over three hundred ___ attending the concert.",
      "answer": "people are",
      "options": [
        "person is",
        "people is",
        "people are",
        "peoples are"
      ]
    },
    {
      "blanked": "The local news ___ broadcast at six o'clock every evening.",
      "answer": "is",
      "options": [
        "are",
        "is",
        "were",
        "have been"
      ]
    },
    {
      "blanked": "Most people ___ that fresh fruit is healthy.",
      "answer": "agree",
      "options": [
        "agrees",
        "agree",
        "is agreeing",
        "has agreed"
      ]
    },
    {
      "blanked": "This bad news ___ upset the entire community.",
      "answer": "has",
      "options": [
        "have",
        "has",
        "are",
        "were"
      ]
    }
  ],
  "97": [
    {
      "blanked": "We ordered two ___ salads for lunch.",
      "answer": "fresh green",
      "options": [
        "greens fresh",
        "freshs green",
        "fresh green",
        "green freshes"
      ]
    },
    {
      "blanked": "Choose the right form: those three ___ suitcases.",
      "answer": "heavy",
      "options": [
        "heavies",
        "heavy",
        "heavily",
        "heavy ones is"
      ]
    },
    {
      "blanked": "Look at those four ___ cars parked by the garage.",
      "answer": "fast",
      "options": [
        "fasts",
        "fast",
        "fastly",
        "fastes"
      ]
    },
    {
      "blanked": "She wore two ___ scarves to protect against the wind.",
      "answer": "warm woolen",
      "options": [
        "warms woolens",
        "warm woolen",
        "woolen warms",
        "warmly woolens"
      ]
    },
    {
      "blanked": "They visited several ___ museums during their vacation.",
      "answer": "ancient",
      "options": [
        "ancients",
        "ancient",
        "anciently",
        "ancient ones are"
      ]
    }
  ],
  "98": [
    {
      "blanked": "After hiking, the mountain air smelled ___.",
      "answer": "crisp",
      "options": [
        "crisply",
        "crisp",
        "crispness",
        "more crisply"
      ]
    },
    {
      "blanked": "That jazz melody sounds really ___.",
      "answer": "smooth",
      "options": [
        "smoothly",
        "smooth",
        "smoothness",
        "very smoothly"
      ]
    },
    {
      "blanked": "This lemon tart tastes completely ___.",
      "answer": "sweet",
      "options": [
        "sweetly",
        "sweet",
        "sweetness",
        "more sweetly"
      ]
    },
    {
      "blanked": "The patient felt ___ after resting all afternoon.",
      "answer": "better",
      "options": [
        "wellly",
        "better",
        "bestly",
        "in a better way"
      ]
    },
    {
      "blanked": "The weather became ___ as evening approached.",
      "answer": "chilly",
      "options": [
        "chillily",
        "chilly",
        "chilliness",
        "chillly"
      ]
    }
  ],
  "99": [
    {
      "blanked": "Natural order (Opinion → Age → Color): ___ jacket.",
      "answer": "a lovely old brown",
      "options": [
        "a brown old lovely",
        "an old lovely brown",
        "a lovely old brown",
        "a brown lovely old"
      ]
    },
    {
      "blanked": "Natural order (Size → Material): ___ bowl.",
      "answer": "a large ceramic",
      "options": [
        "a ceramic large",
        "a large ceramic",
        "ceramic a large",
        "largely ceramic"
      ]
    },
    {
      "blanked": "She bought ___ table at the antique shop.",
      "answer": "a beautiful antique wooden",
      "options": [
        "a wooden antique beautiful",
        "a beautiful antique wooden",
        "an antique wooden beautiful",
        "a beautiful wooden antique"
      ]
    },
    {
      "blanked": "He wore ___ hat to the outdoor festival.",
      "answer": "a funny round straw",
      "options": [
        "a straw round funny",
        "a round funny straw",
        "a funny round straw",
        "a straw funny round"
      ]
    },
    {
      "blanked": "They found ___ puppy shivering near the porch.",
      "answer": "a tiny black",
      "options": [
        "a black tiny",
        "a tiny black",
        "tiny a black",
        "black a tiny"
      ]
    }
  ],
  "100": [
    {
      "blanked": "The children were ___ by the magician’s tricks.",
      "answer": "amazed",
      "options": [
        "amazing",
        "amazed",
        "amaze",
        "amazement"
      ]
    },
    {
      "blanked": "That three-hour documentary was truly ___.",
      "answer": "fascinating",
      "options": [
        "fascinated",
        "fascinate",
        "fascinating",
        "fascinatedly"
      ]
    },
    {
      "blanked": "After running the marathon, the athletes felt utterly ___.",
      "answer": "exhausted",
      "options": [
        "exhausting",
        "exhausted",
        "exhaust",
        "exhausts"
      ]
    },
    {
      "blanked": "Solving that difficult puzzle was an ___ experience.",
      "answer": "annoying",
      "options": [
        "annoyed",
        "annoying",
        "annoy",
        "annoys"
      ]
    },
    {
      "blanked": "Maria was ___ when she heard the unexpected news.",
      "answer": "shocked",
      "options": [
        "shocking",
        "shocked",
        "shock",
        "shockingly"
      ]
    }
  ],
  "101": [
    {
      "blanked": "The violin soloist performed the piece ___.",
      "answer": "brilliantly",
      "options": [
        "brilliant",
        "brilliantly",
        "brilliance",
        "more brilliant"
      ]
    },
    {
      "blanked": "Irregular manner adverb: He repairs vintage radios ___.",
      "answer": "well",
      "options": [
        "good",
        "goodly",
        "well",
        "bestly"
      ]
    },
    {
      "blanked": "She studied ___ all night before the final chemistry exam.",
      "answer": "hard",
      "options": [
        "hardly",
        "hard",
        "hardful",
        "more hard"
      ]
    },
    {
      "blanked": "The cheetah can run incredibly ___ across the savanna.",
      "answer": "fast",
      "options": [
        "fastly",
        "fast",
        "fasterly",
        "more fastly"
      ]
    },
    {
      "blanked": "The students walked ___ into the silent library.",
      "answer": "quietly",
      "options": [
        "quiet",
        "quietly",
        "quietness",
        "more quiet"
      ]
    }
  ],
  "102": [
    {
      "blanked": "Natural order: She folded ___ cleanly.",
      "answer": "all the napkins",
      "options": [
        "cleanly all the napkins",
        "all the napkins",
        "napkins cleanly all",
        "quietly napkins all"
      ]
    },
    {
      "blanked": "Never split verb and object: Tom speaks ___.",
      "answer": "Italian fluently",
      "options": [
        "fluently Italian",
        "Italian fluently",
        "Italian very fluent",
        "in fluently Italian"
      ]
    },
    {
      "blanked": "Never split verb and object: She finished ___ quickly.",
      "answer": "the assignment",
      "options": [
        "quickly the assignment",
        "the assignment",
        "the assignment quick",
        "assignment the quickly"
      ]
    },
    {
      "blanked": "Never split verb and object: He played ___ beautifully.",
      "answer": "the piano piece",
      "options": [
        "beautifully the piano piece",
        "the piano piece",
        "the beautifully piano piece",
        "piano piece beautifully the"
      ]
    },
    {
      "blanked": "They drove ___ carefully on the icy highway.",
      "answer": "the rental car",
      "options": [
        "carefully the rental car",
        "the rental car",
        "careful the rental car",
        "the car rental carefully"
      ]
    }
  ],
  "103": [
    {
      "blanked": "Problematic excess: This suitcase is ___ heavy to lift!",
      "answer": "too",
      "options": [
        "very",
        "too",
        "much",
        "enough"
      ]
    },
    {
      "blanked": "Neutral praise: This homemade jam is ___ tasty.",
      "answer": "very",
      "options": [
        "too",
        "very",
        "enough",
        "such"
      ]
    },
    {
      "blanked": "Strong emotion: I am ___ grateful for your constant support!",
      "answer": "so",
      "options": [
        "too",
        "so",
        "such",
        "enough"
      ]
    },
    {
      "blanked": "Excess problem: The music is ___ loud; I can't concentrate.",
      "answer": "too",
      "options": [
        "very",
        "too",
        "so",
        "enough"
      ]
    },
    {
      "blanked": "Neutral fact: This jacket is ___ warm and keeps the wind out.",
      "answer": "very",
      "options": [
        "too",
        "very",
        "enough",
        "such"
      ]
    }
  ],
  "104": [
    {
      "blanked": "Place \"enough\" correctly: The bridge isn’t ___.",
      "answer": "wide enough",
      "options": [
        "enough wide",
        "wide enough",
        "widely enough",
        "enough widely"
      ]
    },
    {
      "blanked": "Place \"enough\" correctly: Do we have ___ for pie?",
      "answer": "enough apples",
      "options": [
        "apples enough",
        "enough apples",
        "apple enough",
        "too enough apples"
      ]
    },
    {
      "blanked": "Position after adjective: He isn't ___ to lift that granite rock.",
      "answer": "strong enough",
      "options": [
        "enough strong",
        "strong enough",
        "strongly enough",
        "enough strongly"
      ]
    },
    {
      "blanked": "Position before noun: Did you buy ___ for all the guests?",
      "answer": "enough bread",
      "options": [
        "bread enough",
        "enough bread",
        "breads enough",
        "enough of bread"
      ]
    },
    {
      "blanked": "Position after adverb: She didn't speak ___ for the back row.",
      "answer": "clearly enough",
      "options": [
        "enough clearly",
        "clearly enough",
        "clear enough",
        "enough clear"
      ]
    }
  ],
  "105": [
    {
      "blanked": "That coastal storm was ___ fierce that ferries stopped.",
      "answer": "so",
      "options": [
        "such",
        "so",
        "such a",
        "too"
      ]
    },
    {
      "blanked": "It was ___ a charming village that we stayed twice.",
      "answer": "such",
      "options": [
        "so",
        "very",
        "such",
        "too"
      ]
    },
    {
      "blanked": "The train was moving ___ fast that everything was a blur.",
      "answer": "so",
      "options": [
        "such",
        "so",
        "such a",
        "too"
      ]
    },
    {
      "blanked": "They are ___ friendly people; they welcomed us immediately.",
      "answer": "such",
      "options": [
        "so",
        "such",
        "such a",
        "very"
      ]
    },
    {
      "blanked": "Why are you walking ___ slowly in the cold rain?",
      "answer": "so",
      "options": [
        "such",
        "so",
        "such a",
        "too"
      ]
    }
  ],
  "106": [
    {
      "blanked": "This morning’s breeze feels ___ than yesterday’s.",
      "answer": "cooler",
      "options": [
        "more cool",
        "coolest",
        "cooler",
        "the cooler"
      ]
    },
    {
      "blanked": "Notice \"than\": Silver is ___ than platinum.",
      "answer": "lighter",
      "options": [
        "light",
        "more light",
        "lightest",
        "lighter"
      ]
    },
    {
      "blanked": "Our new apartment is ___ than our previous flat.",
      "answer": "cheaper",
      "options": [
        "more cheap",
        "cheaper",
        "cheapest",
        "the cheaper"
      ]
    },
    {
      "blanked": "The northern path is ___ than the valley route.",
      "answer": "shorter",
      "options": [
        "more short",
        "shorter",
        "shortest",
        "short"
      ]
    },
    {
      "blanked": "Iron is ___ than copper.",
      "answer": "harder",
      "options": [
        "more hard",
        "harder",
        "hardest",
        "the harder"
      ]
    }
  ],
  "107": [
    {
      "blanked": "That summit is ___ peak in the whole range.",
      "answer": "the highest",
      "options": [
        "higher",
        "highest",
        "the highest",
        "most high"
      ]
    },
    {
      "blanked": "January is usually ___ month in Oslo.",
      "answer": "the coldest",
      "options": [
        "colder",
        "the coldest",
        "most cold",
        "coldest than"
      ]
    },
    {
      "blanked": "This wooden bridge is ___ structure in our village.",
      "answer": "the oldest",
      "options": [
        "oldest",
        "the oldest",
        "most old",
        "the older"
      ]
    },
    {
      "blanked": "Who is ___ runner on your school track team?",
      "answer": "the fastest",
      "options": [
        "fastest",
        "the fastest",
        "faster",
        "the most fast"
      ]
    },
    {
      "blanked": "Yesterday was ___ day of the entire summer.",
      "answer": "the hottest",
      "options": [
        "hotter",
        "the hottest",
        "hottest",
        "most hot"
      ]
    }
  ],
  "108": [
    {
      "blanked": "Train travel is ___ than driving through snow.",
      "answer": "more reliable",
      "options": [
        "reliabler",
        "more reliable",
        "most reliable",
        "reliable"
      ]
    },
    {
      "blanked": "That puzzle was ___ task in the entire test.",
      "answer": "the most complex",
      "options": [
        "complexest",
        "more complex",
        "the most complex",
        "the more complex"
      ]
    },
    {
      "blanked": "Traveling by train is ___ than driving through traffic.",
      "answer": "more comfortable",
      "options": [
        "comfortabler",
        "more comfortable",
        "most comfortable",
        "as comfortable"
      ]
    },
    {
      "blanked": "That diamond necklace is ___ item in the jewelry shop.",
      "answer": "the most expensive",
      "options": [
        "more expensive",
        "the expensivest",
        "the most expensive",
        "most expensivest"
      ]
    },
    {
      "blanked": "Online security is ___ than ever before.",
      "answer": "more important",
      "options": [
        "importanter",
        "more important",
        "most important",
        "as important"
      ]
    }
  ],
  "109": [
    {
      "blanked": "Adverb comparative (-ly): Can you speak ___ please?",
      "answer": "more clearly",
      "options": [
        "clearer",
        "more clearly",
        "most clearly",
        "clearliest"
      ]
    },
    {
      "blanked": "Short adverb comparative: Mia ran ___ than Sam.",
      "answer": "faster",
      "options": [
        "more fast",
        "faster",
        "fastest",
        "more faster"
      ]
    },
    {
      "blanked": "Among all the apprentices, David worked ___ during harvest.",
      "answer": "the hardest",
      "options": [
        "most hardly",
        "the hardest",
        "the hardliest",
        "more hard"
      ]
    },
    {
      "blanked": "Please write ___ on the official application form.",
      "answer": "more neatly",
      "options": [
        "neatlier",
        "more neatly",
        "most neat",
        "neatlyer"
      ]
    },
    {
      "blanked": "The athlete jumped ___ than any of his competitors.",
      "answer": "higher",
      "options": [
        "more high",
        "higher",
        "more highly",
        "highest"
      ]
    }
  ],
  "110": [
    {
      "blanked": "Irregular superlative: That café serves ___ espresso in town.",
      "answer": "the best",
      "options": [
        "goodest",
        "the best",
        "better",
        "most good"
      ]
    },
    {
      "blanked": "Irregular comparative: Today’s fog is ___ than Monday’s.",
      "answer": "worse",
      "options": [
        "badder",
        "more bad",
        "worse",
        "worst"
      ]
    },
    {
      "blanked": "Comparative of \"bad\": Today's traffic is ___ than it was yesterday.",
      "answer": "worse",
      "options": [
        "baddest",
        "worse",
        "worser",
        "more bad"
      ]
    },
    {
      "blanked": "Comparative of \"far\": We walked five miles ___ down the mountain trail.",
      "answer": "further",
      "options": [
        "farer",
        "further",
        "farthest",
        "more far"
      ]
    },
    {
      "blanked": "Superlative of \"good\": That bakery makes ___ apple pie in town.",
      "answer": "the best",
      "options": [
        "the goodest",
        "the best",
        "the better",
        "most good"
      ]
    }
  ],
  "111": [
    {
      "blanked": "This green wool scarf is ___ soft as silk.",
      "answer": "as",
      "options": [
        "so",
        "than",
        "as",
        "more"
      ]
    },
    {
      "blanked": "The new electric kettle isn’t ___ loud as the old one.",
      "answer": "as",
      "options": [
        "as",
        "than",
        "like",
        "most"
      ]
    },
    {
      "blanked": "Equality: This winter coat is ___ as that heavy jacket.",
      "answer": "as warm",
      "options": [
        "as warmer",
        "as warm",
        "so warm",
        "warmer as"
      ]
    },
    {
      "blanked": "Equality: Clara plays the flute ___ as her music tutor.",
      "answer": "as skillfully",
      "options": [
        "as skillfuller",
        "as skillfully",
        "skillful as",
        "so skillful"
      ]
    },
    {
      "blanked": "Inequality: This tiny town is ___ as the capital city.",
      "answer": "not as noisy",
      "options": [
        "not as noisier",
        "not as noisy",
        "no as noisy",
        "not noisy as"
      ]
    }
  ],
  "112": [
    {
      "blanked": "My pen ran dry — do you have a spare ___?",
      "answer": "one",
      "options": [
        "one",
        "ones",
        "it",
        "those"
      ]
    },
    {
      "blanked": "These dark boots look sturdier than the tan ___.",
      "answer": "ones",
      "options": [
        "one",
        "ones",
        "its",
        "them"
      ]
    },
    {
      "blanked": "I lost my pen; can you lend me an ink ___?",
      "answer": "one",
      "options": [
        "ones",
        "one",
        "it",
        "them"
      ]
    },
    {
      "blanked": "Which shoes should I wear? — The leather ___ by the door.",
      "answer": "ones",
      "options": [
        "one",
        "ones",
        "it",
        "that"
      ]
    },
    {
      "blanked": "This cup is chipped; please hand me a clean ___.",
      "answer": "one",
      "options": [
        "ones",
        "one",
        "them",
        "those"
      ]
    }
  ],
  "113": [
    {
      "blanked": "I accidentally cut ___ while slicing bread.",
      "answer": "myself",
      "options": [
        "me",
        "mine",
        "myself",
        "himself"
      ]
    },
    {
      "blanked": "Enjoy ___ at the lantern festival tonight!",
      "answer": "yourselves",
      "options": [
        "you",
        "your",
        "yourselfs",
        "yourselves"
      ]
    },
    {
      "blanked": "I taught ___ how to play the acoustic guitar.",
      "answer": "myself",
      "options": [
        "meself",
        "myself",
        "me",
        "mineself"
      ]
    },
    {
      "blanked": "She prepared the entire three-course dinner ___.",
      "answer": "herself",
      "options": [
        "herself",
        "her",
        "herselves",
        "sheself"
      ]
    },
    {
      "blanked": "The kitten cleaned ___ with its tiny front paws.",
      "answer": "itself",
      "options": [
        "itself",
        "its",
        "it",
        "its-self"
      ]
    }
  ],
  "114": [
    {
      "blanked": "Mutual action: Both teammates smiled at ___.",
      "answer": "each other",
      "options": [
        "themselves",
        "each other",
        "myself",
        "itself"
      ]
    },
    {
      "blanked": "Acting on self: The twins dressed ___ in minutes.",
      "answer": "themselves",
      "options": [
        "each other",
        "themselves",
        "them",
        "theirs"
      ]
    },
    {
      "blanked": "The two rivals shook hands and congratulated ___.",
      "answer": "each other",
      "options": [
        "themselves",
        "each other",
        "oneself",
        "the other"
      ]
    },
    {
      "blanked": "The dancers admired ___ in the studio mirror.",
      "answer": "themselves",
      "options": [
        "each other",
        "themselves",
        "them",
        "theirselves"
      ]
    },
    {
      "blanked": "Emma and Lucas write letters to ___ every week.",
      "answer": "each other",
      "options": [
        "themselves",
        "each other",
        "itself",
        "one other"
      ]
    }
  ],
  "115": [
    {
      "blanked": "Exclamation + noun phrase: ___ vivid sunset!",
      "answer": "What a",
      "options": [
        "How",
        "What",
        "What a",
        "How a"
      ]
    },
    {
      "blanked": "Exclamation + adjective alone: ___ peaceful this valley is!",
      "answer": "How",
      "options": [
        "What",
        "What a",
        "How",
        "Such"
      ]
    },
    {
      "blanked": "Exclamation with plural noun: ___ gorgeous flowers you brought!",
      "answer": "What",
      "options": [
        "What a",
        "How",
        "What",
        "Such a"
      ]
    },
    {
      "blanked": "Exclamation with adverb alone: ___ bravely the firefighter fought the flames!",
      "answer": "How",
      "options": [
        "What",
        "What a",
        "How",
        "How a"
      ]
    },
    {
      "blanked": "Exclamation with singular countable noun: ___ incredible discovery this is!",
      "answer": "What an",
      "options": [
        "How",
        "What",
        "What an",
        "How an"
      ]
    }
  ],
  "116": [
    {
      "blanked": "Drop silent -e before -ing: Who is ___ the soup?",
      "answer": "making",
      "options": [
        "makeing",
        "making",
        "makes",
        "makying"
      ]
    },
    {
      "blanked": "Use Present Continuous: Look, the train is ___.",
      "answer": "arriving",
      "options": [
        "arriveing",
        "arriving",
        "arrives",
        "arrive"
      ]
    },
    {
      "blanked": "Drop silent -e before -ing: She is ___ a letter to her friend.",
      "answer": "writing",
      "options": [
        "writeing",
        "writing",
        "writes",
        "writed"
      ]
    },
    {
      "blanked": "Drop silent -e before -ing: They are ___ to a larger apartment.",
      "answer": "moving",
      "options": [
        "moveing",
        "moving",
        "moves",
        "moved"
      ]
    },
    {
      "blanked": "Form Present Continuous: The chef is ___ the cake with strawberries.",
      "answer": "baking",
      "options": [
        "bakeing",
        "baking",
        "bakes",
        "baked"
      ]
    }
  ],
  "117": [
    {
      "blanked": "Right this second, our chef ___ fresh pasta.",
      "answer": "is rolling",
      "options": [
        "rolls",
        "is rolling",
        "rolled",
        "has rolled"
      ]
    },
    {
      "blanked": "Be quiet — the announcer ___ the gate number now.",
      "answer": "is reading",
      "options": [
        "reads",
        "is reading",
        "read",
        "was reading"
      ]
    },
    {
      "blanked": "Listen! The nightingale ___ in the garden tree right now.",
      "answer": "is singing",
      "options": [
        "sings",
        "is singing",
        "sang",
        "has sung"
      ]
    },
    {
      "blanked": "Look out the window! It ___ heavily across the city.",
      "answer": "is raining",
      "options": [
        "rains",
        "is raining",
        "rained",
        "was raining"
      ]
    },
    {
      "blanked": "At this very moment, the mechanic ___ our car engine.",
      "answer": "is repairing",
      "options": [
        "repairs",
        "is repairing",
        "repaired",
        "has repaired"
      ]
    }
  ],
  "118": [
    {
      "blanked": "Temporary situation: Nina ___ with her aunt this month.",
      "answer": "is staying",
      "options": [
        "stays",
        "is staying",
        "stayed",
        "has stay"
      ]
    },
    {
      "blanked": "This semester, I ___ extra shifts at the clinic.",
      "answer": "am working",
      "options": [
        "work",
        "am working",
        "worked",
        "was work"
      ]
    },
    {
      "blanked": "Temporary situation: Alex ___ a programming course this term.",
      "answer": "is taking",
      "options": [
        "takes",
        "is taking",
        "took",
        "was take"
      ]
    },
    {
      "blanked": "This month, my parents ___ their country cottage.",
      "answer": "are renovating",
      "options": [
        "renovate",
        "are renovating",
        "renovated",
        "were renovate"
      ]
    },
    {
      "blanked": "She ___ an apartment in the city center until December.",
      "answer": "is renting",
      "options": [
        "rents",
        "is renting",
        "rented",
        "has rent"
      ]
    }
  ],
  "119": [
    {
      "blanked": "Booked arrangement: We ___ our dentist tomorrow at 9 AM.",
      "answer": "are seeing",
      "options": [
        "see",
        "saw",
        "are seeing",
        "have seen"
      ]
    },
    {
      "blanked": "Confirmed plan: Sam ___ the plumber on Thursday.",
      "answer": "is meeting",
      "options": [
        "meets",
        "is meeting",
        "met",
        "was meeting"
      ]
    },
    {
      "blanked": "Tickets are booked: She ___ to Rome on Friday afternoon.",
      "answer": "is flying",
      "options": [
        "flies",
        "flew",
        "is flying",
        "has flown"
      ]
    },
    {
      "blanked": "Confirmed schedule: We ___ dinner with the director at eight.",
      "answer": "are having",
      "options": [
        "have",
        "had",
        "are having",
        "were have"
      ]
    },
    {
      "blanked": "Fixed appointment: Dr. Jenkins ___ the new patient at two o'clock.",
      "answer": "is examining",
      "options": [
        "examines",
        "examined",
        "is examining",
        "has examine"
      ]
    }
  ],
  "120": [
    {
      "blanked": "Stative verb: Sorry, I don’t ___ that technical term.",
      "answer": "understand",
      "options": [
        "am understanding",
        "understanding",
        "understand",
        "understands"
      ]
    },
    {
      "blanked": "Stative verb: Who ___ this violin belong to?",
      "answer": "does",
      "options": [
        "is",
        "does",
        "are",
        "was"
      ]
    },
    {
      "blanked": "Stative verb: I ___ a hot cup of tea right now.",
      "answer": "want",
      "options": [
        "am wanting",
        "want",
        "wanting",
        "was wanting"
      ]
    },
    {
      "blanked": "Stative verb: Do you ___ the answer to this riddle?",
      "answer": "know",
      "options": [
        "knowing",
        "know",
        "are knowing",
        "were know"
      ]
    },
    {
      "blanked": "Stative verb: She ___ fresh vegetables and grilled fish.",
      "answer": "likes",
      "options": [
        "is liking",
        "likes",
        "liking",
        "are liking"
      ]
    }
  ],
  "121": [
    {
      "blanked": "Finished past time: We ___ three museums last spring.",
      "answer": "visited",
      "options": [
        "visit",
        "have visited",
        "visited",
        "are visiting"
      ]
    },
    {
      "blanked": "Closed past period: Her train ___ ten minutes ago.",
      "answer": "departed",
      "options": [
        "departs",
        "has departed",
        "departed",
        "will depart"
      ]
    },
    {
      "blanked": "My grandfather ___ this stone cottage in 1965.",
      "answer": "built",
      "options": [
        "builds",
        "has built",
        "built",
        "is building"
      ]
    },
    {
      "blanked": "They ___ all their exams two weeks ago.",
      "answer": "completed",
      "options": [
        "complete",
        "completed",
        "have completed",
        "completing"
      ]
    },
    {
      "blanked": "Yesterday evening, I ___ a long letter to my cousin.",
      "answer": "wrote",
      "options": [
        "write",
        "wrote",
        "have written",
        "writing"
      ]
    }
  ],
  "122": [
    {
      "blanked": "Past Simple of \"to be\": Why ___ the lights off at nine?",
      "answer": "were",
      "options": [
        "was",
        "were",
        "did",
        "are"
      ]
    },
    {
      "blanked": "Past Simple of \"to be\": My uncle ___ a baker in 1998.",
      "answer": "was",
      "options": [
        "were",
        "did",
        "was",
        "has been"
      ]
    },
    {
      "blanked": "We ___ completely exhausted after the ten-mile hike.",
      "answer": "were",
      "options": [
        "was",
        "were",
        "did be",
        "have been"
      ]
    },
    {
      "blanked": "She ___ not at the staff meeting yesterday morning.",
      "answer": "was",
      "options": [
        "were",
        "was",
        "did",
        "are"
      ]
    },
    {
      "blanked": "Where ___ you when the thunderstorm started?",
      "answer": "were",
      "options": [
        "was",
        "were",
        "did",
        "are"
      ]
    }
  ],
  "123": [
    {
      "blanked": "Consonant + y in Past Simple: Sam ___ every button.",
      "answer": "tried",
      "options": [
        "tryed",
        "tried",
        "tries",
        "trying"
      ]
    },
    {
      "blanked": "Regular Past Simple: We ___ all the luggage upstairs.",
      "answer": "carried",
      "options": [
        "carryed",
        "carried",
        "carrying",
        "carries"
      ]
    },
    {
      "blanked": "Consonant + y spelling: The baby ___ loudly until mother arrived.",
      "answer": "cried",
      "options": [
        "cryed",
        "cried",
        "crys",
        "crying"
      ]
    },
    {
      "blanked": "Doubled consonant: The car ___ immediately at the red signal.",
      "answer": "stopped",
      "options": [
        "stoped",
        "stopped",
        "stopping",
        "stops"
      ]
    },
    {
      "blanked": "Regular -ed: They ___ their grandparents last weekend.",
      "answer": "visited",
      "options": [
        "visitted",
        "visited",
        "visiting",
        "visits"
      ]
    }
  ],
  "124": [
    {
      "blanked": "Irregular V2: Grandma ___ me a silver watch yesterday.",
      "answer": "gave",
      "options": [
        "gived",
        "gave",
        "given",
        "gives"
      ]
    },
    {
      "blanked": "Irregular V2: I ___ my favorite poem last night.",
      "answer": "wrote",
      "options": [
        "writed",
        "written",
        "wrote",
        "writes"
      ]
    },
    {
      "blanked": "Irregular V2: We ___ across the calm lake at dawn.",
      "answer": "swam",
      "options": [
        "swimmed",
        "swam",
        "swum",
        "swimming"
      ]
    },
    {
      "blanked": "Irregular V2: She ___ the train ticket yesterday afternoon.",
      "answer": "bought",
      "options": [
        "buyed",
        "bought",
        "buying",
        "buys"
      ]
    },
    {
      "blanked": "Irregular V2: The bird ___ high into the blue sky.",
      "answer": "flew",
      "options": [
        "flied",
        "flew",
        "flown",
        "flying"
      ]
    }
  ],
  "125": [
    {
      "blanked": "Revert to V1 after didn’t: We ___ catch the early bus.",
      "answer": "didn't",
      "options": [
        "didn't caught",
        "didn't",
        "weren't",
        "don't"
      ]
    },
    {
      "blanked": "After \"Did\", use base V1: Did he ___ the parcel?",
      "answer": "deliver",
      "options": [
        "delivered",
        "delivers",
        "deliver",
        "delivering"
      ]
    },
    {
      "blanked": "After \"didn't\", use base V1: She didn't ___ any milk at the store.",
      "answer": "buy",
      "options": [
        "bought",
        "buy",
        "buys",
        "buying"
      ]
    },
    {
      "blanked": "Past Simple question: Did you ___ that museum exhibition?",
      "answer": "visit",
      "options": [
        "visited",
        "visit",
        "visiting",
        "visits"
      ]
    },
    {
      "blanked": "Past Simple negative: We didn't ___ the loud alarm clock.",
      "answer": "hear",
      "options": [
        "heard",
        "hear",
        "hearing",
        "hears"
      ]
    }
  ],
  "126": [
    {
      "blanked": "Instant decision: Your bag looks heavy — I ___ carry it!",
      "answer": "will",
      "options": [
        "will",
        "am",
        "did",
        "was"
      ]
    },
    {
      "blanked": "Promise: Don’t worry, we ___ keep your secret.",
      "answer": "will",
      "options": [
        "are",
        "were",
        "will",
        "did"
      ]
    },
    {
      "blanked": "Instant decision: The phone is ringing — I ___ answer it!",
      "answer": "will",
      "options": [
        "will",
        "did",
        "am",
        "was"
      ]
    },
    {
      "blanked": "Opinion/prediction: I think the sun ___ shine all day tomorrow.",
      "answer": "will",
      "options": [
        "will",
        "is",
        "did",
        "has"
      ]
    },
    {
      "blanked": "Offer: You look thirsty; I ___ pour you a glass of water.",
      "answer": "will",
      "options": [
        "will",
        "did",
        "was",
        "have"
      ]
    }
  ],
  "127": [
    {
      "blanked": "Always bare V1 after will: She ___ arrive before noon.",
      "answer": "will",
      "options": [
        "will to",
        "will",
        "wills to",
        "will arrives"
      ]
    },
    {
      "blanked": "Check verb form: That battery won’t ___ in freezing weather.",
      "answer": "last",
      "options": [
        "lasts",
        "to last",
        "lasting",
        "last"
      ]
    },
    {
      "blanked": "Bare verb after will: He will ___ us at the station tomorrow.",
      "answer": "meet",
      "options": [
        "meets",
        "to meet",
        "meet",
        "meeting"
      ]
    },
    {
      "blanked": "Bare verb after won't: They won't ___ any mistakes this time.",
      "answer": "make",
      "options": [
        "makes",
        "to make",
        "make",
        "making"
      ]
    },
    {
      "blanked": "Bare verb in question: Will you ___ the gate before leaving?",
      "answer": "lock",
      "options": [
        "locks",
        "to lock",
        "lock",
        "locking"
      ]
    }
  ],
  "128": [
    {
      "blanked": "Polite offer to help: ___ I carry those trays upstairs?",
      "answer": "Shall",
      "options": [
        "Will",
        "Shall",
        "Do",
        "Am"
      ]
    },
    {
      "blanked": "Asking advice politely: What ___ I tell the landlord?",
      "answer": "should",
      "options": [
        "am",
        "should",
        "would to",
        "shall to"
      ]
    },
    {
      "blanked": "Offer of help: ___ I carry those heavy boxes upstairs?",
      "answer": "Shall",
      "options": [
        "Will",
        "Shall",
        "Did",
        "Would"
      ]
    },
    {
      "blanked": "Asking advice: What ___ we do about this broken window?",
      "answer": "shall",
      "options": [
        "shall",
        "would to",
        "must to",
        "will to"
      ]
    },
    {
      "blanked": "Joint suggestion: ___ we begin the meeting right now?",
      "answer": "Shall",
      "options": [
        "Shall",
        "Will",
        "Would",
        "Must"
      ]
    }
  ],
  "129": [
    {
      "blanked": "Prior intention: We ___ repaint the hallway next month.",
      "answer": "are going to",
      "options": [
        "will to",
        "are going to",
        "used to",
        "go to"
      ]
    },
    {
      "blanked": "Decided plan: Mia ___ study marine biology this fall.",
      "answer": "is going to",
      "options": [
        "is going to",
        "goes",
        "was going",
        "went to"
      ]
    },
    {
      "blanked": "Prior intention: I ___ paint my bedroom this weekend.",
      "answer": "am going to",
      "options": [
        "am going to",
        "will to",
        "go to",
        "am go to"
      ]
    },
    {
      "blanked": "Prior intention: They ___ start their own business next year.",
      "answer": "are going to",
      "options": [
        "are going to",
        "will to",
        "is going to",
        "go to"
      ]
    },
    {
      "blanked": "Question about plan: What ___ you going to cook for dinner?",
      "answer": "are",
      "options": [
        "are",
        "do",
        "will",
        "have"
      ]
    }
  ],
  "130": [
    {
      "blanked": "Look at that leaning ladder — it ___ topple over!",
      "answer": "is going to",
      "options": [
        "is going to",
        "used to",
        "did",
        "was"
      ]
    },
    {
      "blanked": "The kettle is whistling loudly — the tea ___ boil over!",
      "answer": "is going to",
      "options": [
        "used to",
        "is going to",
        "has",
        "was"
      ]
    },
    {
      "blanked": "Visible evidence: Look at that wobbling glass! It ___ spill!",
      "answer": "is going to",
      "options": [
        "is going to",
        "will to",
        "goes to",
        "shall"
      ]
    },
    {
      "blanked": "Immediate evidence: The runner is exhausted; he ___ collapse!",
      "answer": "is going to",
      "options": [
        "is going to",
        "will to",
        "goes to",
        "shall"
      ]
    },
    {
      "blanked": "Visible sign: The boat is taking on water; it ___ sink!",
      "answer": "is going to",
      "options": [
        "is going to",
        "will to",
        "shall",
        "goes to"
      ]
    }
  ],
  "131": [
    {
      "blanked": "Friendly suggestion: ___ try that new ramen place?",
      "answer": "Why don't we",
      "options": [
        "Why aren't we",
        "Why don't we",
        "How about we to",
        "Let's to"
      ]
    },
    {
      "blanked": "After \"How about\", use V-ing: How about ___ early?",
      "answer": "leaving",
      "options": [
        "leave",
        "to leave",
        "leaving",
        "left"
      ]
    },
    {
      "blanked": "Why don't we + V1: Why don't we ___ a board game tonight?",
      "answer": "play",
      "options": [
        "play",
        "playing",
        "to play",
        "played"
      ]
    },
    {
      "blanked": "What about + V-ing: What about ___ a movie this evening?",
      "answer": "watching",
      "options": [
        "watch",
        "watching",
        "to watch",
        "watched"
      ]
    },
    {
      "blanked": "How about + V-ing: How about ___ Thai food for lunch?",
      "answer": "ordering",
      "options": [
        "order",
        "ordering",
        "to order",
        "ordered"
      ]
    }
  ],
  "132": [
    {
      "blanked": "Structure \"It takes + time + to V1\": It takes 20 minutes ___ home.",
      "answer": "to cycle",
      "options": [
        "cycling",
        "to cycle",
        "cycle",
        "cycled"
      ]
    },
    {
      "blanked": "Structure: ___ him an hour to assemble the desk.",
      "answer": "It took",
      "options": [
        "There took",
        "He took it",
        "It took",
        "Took it"
      ]
    },
    {
      "blanked": "Present duration: It ___ about forty minutes to bake this loaf.",
      "answer": "takes",
      "options": [
        "take",
        "takes",
        "taking",
        "is take"
      ]
    },
    {
      "blanked": "Structure with infinitive: It took him three days ___ the project.",
      "answer": "to complete",
      "options": [
        "complete",
        "completing",
        "to complete",
        "completed"
      ]
    },
    {
      "blanked": "Question pattern: How long does it take ___ the city center?",
      "answer": "to reach",
      "options": [
        "reach",
        "to reach",
        "reaching",
        "reached"
      ]
    }
  ],
  "133": [
    {
      "blanked": "Followed by a noun period: No whispering ___ the exam.",
      "answer": "during",
      "options": [
        "while",
        "during",
        "for",
        "until"
      ]
    },
    {
      "blanked": "Followed by S + V clause: I brewed tea ___ you unpacked.",
      "answer": "while",
      "options": [
        "during",
        "for",
        "while",
        "by"
      ]
    },
    {
      "blanked": "While + clause: The phone rang ___ I was taking a shower.",
      "answer": "while",
      "options": [
        "during",
        "for",
        "while",
        "since"
      ]
    },
    {
      "blanked": "During + noun period: Many animals hibernate ___ the harsh winter.",
      "answer": "during",
      "options": [
        "while",
        "for",
        "during",
        "since"
      ]
    },
    {
      "blanked": "For + duration: She has studied piano ___ six months.",
      "answer": "for",
      "options": [
        "during",
        "while",
        "for",
        "at"
      ]
    }
  ],
  "134": [
    {
      "blanked": "Deadline (\"not later than\"): Submit essays ___ Friday noon.",
      "answer": "by",
      "options": [
        "until",
        "by",
        "during",
        "since"
      ]
    },
    {
      "blanked": "Action continuing up to a point: Wait here ___ I return.",
      "answer": "until",
      "options": [
        "by",
        "until",
        "during",
        "for"
      ]
    },
    {
      "blanked": "Deadline: Please return the library books ___ next Tuesday.",
      "answer": "by",
      "options": [
        "until",
        "by",
        "during",
        "since"
      ]
    },
    {
      "blanked": "Continuing action: The supermarket stays open ___ midnight.",
      "answer": "until",
      "options": [
        "by",
        "until",
        "during",
        "since"
      ]
    },
    {
      "blanked": "Deadline: We must finish this assignment ___ five o'clock.",
      "answer": "by",
      "options": [
        "until",
        "by",
        "while",
        "for"
      ]
    }
  ],
  "135": [
    {
      "blanked": "After preposition \"before/after\", use V-ing: Wash hands before ___.",
      "answer": "cooking",
      "options": [
        "cook",
        "to cook",
        "cooking",
        "cooked"
      ]
    },
    {
      "blanked": "After ___ the tunnel, turn left onto Pine Road.",
      "answer": "exiting",
      "options": [
        "exit",
        "exited",
        "to exit",
        "exiting"
      ]
    },
    {
      "blanked": "Preposition + V-ing: Always lock the front door before ___ the house.",
      "answer": "leaving",
      "options": [
        "leave",
        "leaving",
        "to leave",
        "left"
      ]
    },
    {
      "blanked": "Preposition + V-ing: After ___ the medicine, drink plenty of water.",
      "answer": "taking",
      "options": [
        "take",
        "taking",
        "to take",
        "took"
      ]
    },
    {
      "blanked": "Preposition + V-ing: Turn off the headlights after ___ the car.",
      "answer": "parking",
      "options": [
        "park",
        "parking",
        "to park",
        "parked"
      ]
    }
  ],
  "136": [
    {
      "blanked": "Two distinct sides: Our bench sits ___ the fountain and the oak.",
      "answer": "between",
      "options": [
        "among",
        "between",
        "through",
        "inside"
      ]
    },
    {
      "blanked": "Surrounded by many: Her letter was hidden ___ dozens of files.",
      "answer": "among",
      "options": [
        "between",
        "among",
        "by two",
        "opposite"
      ]
    },
    {
      "blanked": "Two items: The small clinic is situated ___ the pharmacy and the bakery.",
      "answer": "between",
      "options": [
        "among",
        "between",
        "through",
        "around"
      ]
    },
    {
      "blanked": "Surrounded by many: The cottage was hidden ___ ancient oak trees.",
      "answer": "among",
      "options": [
        "between",
        "among",
        "across",
        "along"
      ]
    },
    {
      "blanked": "Two people: This agreement is strictly ___ you and me.",
      "answer": "between",
      "options": [
        "among",
        "between",
        "through",
        "around"
      ]
    }
  ],
  "137": [
    {
      "blanked": "Facing across the street: The bakery is directly ___ the bank.",
      "answer": "opposite",
      "options": [
        "between",
        "opposite",
        "among",
        "inside"
      ]
    },
    {
      "blanked": "Standing right behind someone in line: Leo waited ___ me.",
      "answer": "behind",
      "options": [
        "among",
        "between",
        "behind",
        "across"
      ]
    },
    {
      "blanked": "Beside: The new library was built ___ the town hall.",
      "answer": "next to",
      "options": [
        "opposite to",
        "next to",
        "in behind",
        "front of"
      ]
    },
    {
      "blanked": "In front of: A red sports car parked ___ our driveway.",
      "answer": "in front of",
      "options": [
        "in front of",
        "front of",
        "in back of",
        "behind of"
      ]
    },
    {
      "blanked": "Behind: The small children hid ___ the tall sofa during hide-and-seek.",
      "answer": "behind",
      "options": [
        "opposite",
        "behind",
        "between",
        "next"
      ]
    }
  ],
  "138": [
    {
      "blanked": "Through an enclosed space: The express train sped ___ the tunnel.",
      "answer": "through",
      "options": [
        "across",
        "along",
        "through",
        "onto"
      ]
    },
    {
      "blanked": "Walking parallel beside a river: We strolled ___ the canal.",
      "answer": "along",
      "options": [
        "along",
        "through",
        "into",
        "between"
      ]
    },
    {
      "blanked": "Surface crossing: Be cautious when you jog ___ the icy road.",
      "answer": "across",
      "options": [
        "across",
        "through",
        "along",
        "past"
      ]
    },
    {
      "blanked": "Passing by: He walked right ___ the bookstore without stopping.",
      "answer": "past",
      "options": [
        "past",
        "passed",
        "through",
        "along"
      ]
    },
    {
      "blanked": "Inside a volume: Sunlight streamed ___ the stained-glass window.",
      "answer": "through",
      "options": [
        "across",
        "along",
        "through",
        "past"
      ]
    }
  ],
  "139": [
    {
      "blanked": "Agree WITH a person/idea: Do you agree ___ her proposal?",
      "answer": "with",
      "options": [
        "on",
        "to",
        "with",
        "for"
      ]
    },
    {
      "blanked": "Agree ON a shared plan: Both teams agreed ___ the launch date.",
      "answer": "on",
      "options": [
        "with",
        "on",
        "by",
        "at"
      ]
    },
    {
      "blanked": "Agree TO a condition/terms: The manager agreed ___ the proposed contract terms.",
      "answer": "to",
      "options": [
        "with",
        "on",
        "to",
        "for"
      ]
    },
    {
      "blanked": "Agree WITH a person: I don't really agree ___ my coworker on this issue.",
      "answer": "with",
      "options": [
        "to",
        "with",
        "on",
        "about"
      ]
    },
    {
      "blanked": "Agree ON a decision: The committee could not agree ___ a single winner.",
      "answer": "on",
      "options": [
        "to",
        "with",
        "on",
        "for"
      ]
    }
  ],
  "140": [
    {
      "blanked": "Negative end-of-sentence agreement: I don’t like olives ___.",
      "answer": "either",
      "options": [
        "too",
        "also",
        "either",
        "neither"
      ]
    },
    {
      "blanked": "Positive end-of-sentence agreement: My sister speaks Danish ___.",
      "answer": "too",
      "options": [
        "either",
        "neither",
        "too",
        "nor"
      ]
    },
    {
      "blanked": "Negative sentence end: We haven't seen that new movie ___.",
      "answer": "either",
      "options": [
        "too",
        "also",
        "either",
        "neither"
      ]
    },
    {
      "blanked": "Positive sentence end: Clara wants to come with us ___.",
      "answer": "too",
      "options": [
        "either",
        "neither",
        "too",
        "also"
      ]
    },
    {
      "blanked": "Negative sentence end: He cannot swim, and his brother can't ___.",
      "answer": "either",
      "options": [
        "too",
        "either",
        "neither",
        "also"
      ]
    }
  ],
  "141": [
    {
      "blanked": "Positive echo: I love jazz concerts! — ___!",
      "answer": "So do I",
      "options": [
        "Neither do I",
        "So I do",
        "So do I",
        "Too I do"
      ]
    },
    {
      "blanked": "Negative echo: I can’t skate well. — ___!",
      "answer": "Neither can I",
      "options": [
        "So can I",
        "Neither I can",
        "Neither can't I",
        "Neither can I"
      ]
    },
    {
      "blanked": "Positive echo with 'be': I am ready for the test! — ___!",
      "answer": "So am I",
      "options": [
        "So am I",
        "So do I",
        "Neither am I",
        "So I am"
      ]
    },
    {
      "blanked": "Negative echo with 'have': I haven't visited Paris yet. — ___!",
      "answer": "Neither have I",
      "options": [
        "So have I",
        "Neither have I",
        "Neither I have",
        "Nor haven't I"
      ]
    },
    {
      "blanked": "Positive echo with modal: I can play the cello. — ___!",
      "answer": "So can I",
      "options": [
        "So can I",
        "Neither can I",
        "So do I",
        "So I can"
      ]
    }
  ],
  "142": [
    {
      "blanked": "Modal verbs take no -s: He ___ play chess very calmly.",
      "answer": "can",
      "options": [
        "cans",
        "can to",
        "can",
        "is can"
      ]
    },
    {
      "blanked": "Modal question inversion: ___ I borrow this highlighter?",
      "answer": "May",
      "options": [
        "Do may",
        "May",
        "Does may",
        "Am may"
      ]
    },
    {
      "blanked": "No 'to' after modal: She should ___ her doctor before traveling.",
      "answer": "call",
      "options": [
        "call",
        "to call",
        "calling",
        "calls"
      ]
    },
    {
      "blanked": "No '-s' on third person modal: He ___ finish this report tonight.",
      "answer": "must",
      "options": [
        "musts",
        "must",
        "must to",
        "is must"
      ]
    },
    {
      "blanked": "Direct inversion in question: ___ we enter the building now?",
      "answer": "Can",
      "options": [
        "Do can",
        "Can",
        "Are can",
        "Does can"
      ]
    }
  ],
  "143": [
    {
      "blanked": "Past ability: At age six, Maya ___ already swim across the pool.",
      "answer": "could",
      "options": [
        "can",
        "could",
        "could to",
        "did can"
      ]
    },
    {
      "blanked": "Softer polite request: ___ you lower the blinds slightly?",
      "answer": "Could",
      "options": [
        "Could",
        "Did",
        "May to",
        "Must to"
      ]
    },
    {
      "blanked": "Past ability: When he lived in Spain, he ___ speak fluent Spanish.",
      "answer": "could",
      "options": [
        "can",
        "could",
        "could to",
        "did can"
      ]
    },
    {
      "blanked": "Polite request: ___ you pass me that dictionary on the shelf?",
      "answer": "Could",
      "options": [
        "Could",
        "Did",
        "Shall to",
        "Must to"
      ]
    },
    {
      "blanked": "Past negative ability: We ___ not see anything through the thick fog.",
      "answer": "could",
      "options": [
        "can",
        "could",
        "did",
        "were"
      ]
    }
  ],
  "144": [
    {
      "blanked": "\"No obligation\" (optional): It’s Sunday, so we ___ wake early.",
      "answer": "don't have to",
      "options": [
        "mustn't",
        "don't have to",
        "has not to",
        "aren't have to"
      ]
    },
    {
      "blanked": "External rule: All cyclists ___ wear helmets in this park.",
      "answer": "have to",
      "options": [
        "have",
        "has to",
        "have to",
        "can to"
      ]
    },
    {
      "blanked": "Lack of obligation: The museum is free, so you ___ buy a ticket.",
      "answer": "don't have to",
      "options": [
        "mustn't",
        "don't have to",
        "haven't to",
        "aren't having to"
      ]
    },
    {
      "blanked": "Third person external obligation: Mark ___ wear a tie at his law firm.",
      "answer": "has to",
      "options": [
        "have to",
        "has to",
        "must to",
        "is having"
      ]
    },
    {
      "blanked": "Past external obligation: Yesterday, she ___ take a taxi because of the strike.",
      "answer": "had to",
      "options": [
        "must",
        "had to",
        "has to",
        "have to"
      ]
    }
  ],
  "145": [
    {
      "blanked": "Strict prohibition (\"forbidden!\"): Guests ___ feed the bears.",
      "answer": "mustn't",
      "options": [
        "don't have to",
        "mustn't",
        "need not to",
        "didn't have to"
      ]
    },
    {
      "blanked": "Strong internal obligation: I ___ call Grandma on her birthday.",
      "answer": "must",
      "options": [
        "must to",
        "must",
        "have",
        "ought"
      ]
    },
    {
      "blanked": "Strict prohibition: You ___ take photographs inside the courtroom.",
      "answer": "mustn't",
      "options": [
        "don't have to",
        "mustn't",
        "must to not",
        "haven't to"
      ]
    },
    {
      "blanked": "Strict rule: Passengers ___ keep their seatbelts fastened during takeoff.",
      "answer": "must",
      "options": [
        "must",
        "must to",
        "ought",
        "are must"
      ]
    },
    {
      "blanked": "Prohibition: You ___ touch the wet paint on that bench.",
      "answer": "mustn't",
      "options": [
        "don't have to",
        "mustn't",
        "needn't to",
        "aren't to"
      ]
    }
  ],
  "146": [
    {
      "blanked": "Friendly advice: You look pale — you ___ get some rest.",
      "answer": "should",
      "options": [
        "should to",
        "mustn’t",
        "should",
        "have"
      ]
    },
    {
      "blanked": "With \"ought\", keep \"to\": You ___ apologize for the delay.",
      "answer": "ought to",
      "options": [
        "should to",
        "ought",
        "ought to",
        "must to"
      ]
    },
    {
      "blanked": "Negative advice: You ___ drink iced water when you have a sore throat.",
      "answer": "shouldn't",
      "options": [
        "shouldn't to",
        "shouldn't",
        "oughtn't",
        "mustn't to"
      ]
    },
    {
      "blanked": "Asking for advice: What ___ I wear to the job interview tomorrow?",
      "answer": "should",
      "options": [
        "should",
        "should to",
        "ought",
        "must to"
      ]
    },
    {
      "blanked": "Recommendation: Drivers ___ check their tire pressure before long trips.",
      "answer": "should",
      "options": [
        "should",
        "should to",
        "ought",
        "must to"
      ]
    }
  ],
  "147": [
    {
      "blanked": "Uncertain possibility (\"maybe\"): Take a flashlight — it ___ rain.",
      "answer": "might",
      "options": [
        "might to",
        "might",
        "cans",
        "will must"
      ]
    },
    {
      "blanked": "Formal permission: ___ I leave the table briefly?",
      "answer": "May",
      "options": [
        "May",
        "Might to",
        "Do may",
        "Will must"
      ]
    },
    {
      "blanked": "Possibility: The package ___ arrive tomorrow morning or on Monday.",
      "answer": "might",
      "options": [
        "might to",
        "might",
        "shall to",
        "must to"
      ]
    },
    {
      "blanked": "Formal permission: ___ I open the window for some fresh air?",
      "answer": "May",
      "options": [
        "May",
        "Do may",
        "Might to",
        "Am may"
      ]
    },
    {
      "blanked": "Future possibility: Don't wait for him; he ___ be delayed by traffic.",
      "answer": "may",
      "options": [
        "may",
        "may to",
        "must to",
        "is may"
      ]
    }
  ],
  "148": [
    {
      "blanked": "Polite wish/order: We ___ book a table near the window.",
      "answer": "would like to",
      "options": [
        "like to would",
        "would like to",
        "would liking",
        "want would"
      ]
    },
    {
      "blanked": "Polite offer: ___ some sparkling water with lime?",
      "answer": "Would you like",
      "options": [
        "Do you would like",
        "Would you like",
        "Want you",
        "Like you"
      ]
    },
    {
      "blanked": "Polite desire + noun: I ___ some orange marmalade on my toast, please.",
      "answer": "would like",
      "options": [
        "would like",
        "like to",
        "will liking",
        "would to like"
      ]
    },
    {
      "blanked": "Polite invitation: ___ you like to join our study group tonight?",
      "answer": "Would",
      "options": [
        "Do",
        "Would",
        "Will",
        "Are"
      ]
    },
    {
      "blanked": "Polite third person: Mr. Davis ___ to speak with the manager.",
      "answer": "would like",
      "options": [
        "would like",
        "would likes",
        "will like to",
        "likes would"
      ]
    }
  ],
  "149": [
    {
      "blanked": "Person’s purpose (\"to + V1\"): She cycled downtown ___ fresh flowers.",
      "answer": "to buy",
      "options": [
        "for buy",
        "buying",
        "to buy",
        "for to buy"
      ]
    },
    {
      "blanked": "Object’s function (\"for + V-ing\"): This brush is for ___ dust.",
      "answer": "sweeping",
      "options": [
        "sweep",
        "to sweep",
        "swept",
        "sweeping"
      ]
    },
    {
      "blanked": "Person's purpose: He opened the dictionary ___ the rare word.",
      "answer": "to look up",
      "options": [
        "for look up",
        "to look up",
        "for looking",
        "to looking"
      ]
    },
    {
      "blanked": "Object's function: This wooden mallet is used ___ tenderizing meat.",
      "answer": "for",
      "options": [
        "to",
        "for",
        "with",
        "by"
      ]
    },
    {
      "blanked": "Person's purpose: She saved money for two years ___ a second-hand car.",
      "answer": "to buy",
      "options": [
        "for buy",
        "to buy",
        "for to buy",
        "to buying"
      ]
    }
  ],
  "150": [
    {
      "blanked": "Two objects without \"to\": Please pass ___ the salt.",
      "answer": "grandpa",
      "options": [
        "to grandpa",
        "grandpa",
        "for grandpa",
        "at grandpa"
      ]
    },
    {
      "blanked": "Direct object first requires \"to\": I lent my umbrella ___ Mia.",
      "answer": "to",
      "options": [
        "for",
        "to",
        "at",
        "by"
      ]
    },
    {
      "blanked": "Indirect + Direct: She sent ___ a lovely postcard from Vienna.",
      "answer": "her parents",
      "options": [
        "to her parents",
        "her parents",
        "for her parents",
        "parents hers"
      ]
    },
    {
      "blanked": "Direct + to + Indirect: Did you return the library book ___?",
      "answer": "to the librarian",
      "options": [
        "the librarian",
        "to the librarian",
        "for the librarian",
        "librarian to"
      ]
    },
    {
      "blanked": "Direct + for + Indirect: He bought a beautiful bouquet of roses ___.",
      "answer": "for his mother",
      "options": [
        "to his mother",
        "for his mother",
        "his mother to",
        "at his mother"
      ]
    }
  ],
  "151": [
    {
      "blanked": "Past existence (plural): ___ forty bicycles outside the hall.",
      "answer": "There were",
      "options": [
        "There was",
        "There were",
        "They were",
        "It was"
      ]
    },
    {
      "blanked": "Future existence: ___ a fireworks display next Saturday.",
      "answer": "There will be",
      "options": [
        "It will be",
        "There will be",
        "There are going",
        "There was"
      ]
    },
    {
      "blanked": "Past singular existence: ___ a power outage in our street last evening.",
      "answer": "There was",
      "options": [
        "There was",
        "There were",
        "There had",
        "It were"
      ]
    },
    {
      "blanked": "Future existence: Tomorrow afternoon, ___ a solar eclipse visible from here.",
      "answer": "there will be",
      "options": [
        "there will be",
        "there was",
        "it will be",
        "there is being"
      ]
    },
    {
      "blanked": "Past plural question: How many guests ___ at the wedding reception?",
      "answer": "were there",
      "options": [
        "was there",
        "were there",
        "did there be",
        "there were"
      ]
    }
  ],
  "152": [
    {
      "blanked": "Avoid double negatives: I don’t see ___ clouds in the sky.",
      "answer": "any",
      "options": [
        "no",
        "none",
        "any",
        "nothing"
      ]
    },
    {
      "blanked": "Affirmative verb + \"no\": Sadly, there is ___ sugar left.",
      "answer": "no",
      "options": [
        "not no",
        "no",
        "any",
        "nothing"
      ]
    },
    {
      "blanked": "Negative verb + any: He didn't make ___ mistakes on the spelling test.",
      "answer": "any",
      "options": [
        "no",
        "any",
        "none",
        "not any of"
      ]
    },
    {
      "blanked": "Affirmative verb + no: They found ___ evidence of water on that dry slope.",
      "answer": "no",
      "options": [
        "not",
        "no",
        "any",
        "none"
      ]
    },
    {
      "blanked": "Negative verb + any: I couldn't hear ___ sound in the abandoned hallway.",
      "answer": "any",
      "options": [
        "no",
        "any",
        "none",
        "not"
      ]
    }
  ],
  "153": [
    {
      "blanked": "Object question (needs \"did\"): Who ___ you invite to dinner?",
      "answer": "did",
      "options": [
        "were",
        "did",
        "has",
        "was"
      ]
    },
    {
      "blanked": "Subject question (no \"did\"): Who ___ the stray kitten?",
      "answer": "rescued",
      "options": [
        "did rescue",
        "did rescued",
        "rescued",
        "was rescue"
      ]
    },
    {
      "blanked": "Subject question: Who ___ that delicious chocolate cake?",
      "answer": "baked",
      "options": [
        "did bake",
        "baked",
        "does bake",
        "bake"
      ]
    },
    {
      "blanked": "Object question: What did the detective ___ under the floorboards?",
      "answer": "find",
      "options": [
        "found",
        "find",
        "finding",
        "finds"
      ]
    },
    {
      "blanked": "Subject question: What ___ during the power failure last night?",
      "answer": "happened",
      "options": [
        "did happen",
        "happened",
        "happens",
        "does happen"
      ]
    }
  ],
  "154": [
    {
      "blanked": "Cause (never combine with \"so\"): We stayed inside ___ it hailed.",
      "answer": "because",
      "options": [
        "so",
        "because",
        "therefore because",
        "because so"
      ]
    },
    {
      "blanked": "Result: The ferry was full, ___ we caught the evening train.",
      "answer": "so",
      "options": [
        "because",
        "so",
        "although",
        "since"
      ]
    },
    {
      "blanked": "Cause clause: She turned on the heater ___ the bedroom was freezing.",
      "answer": "because",
      "options": [
        "so",
        "because",
        "so that",
        "because so"
      ]
    },
    {
      "blanked": "Result clause: The bridge was closed for repairs, ___ we took a detour.",
      "answer": "so",
      "options": [
        "because",
        "so",
        "since",
        "due to"
      ]
    },
    {
      "blanked": "Cause clause: I went to sleep early ___ I was exhausted after work.",
      "answer": "because",
      "options": [
        "so",
        "because",
        "so because",
        "therefore"
      ]
    }
  ],
  "155": [
    {
      "blanked": "Name the listener (say vs tell): Did Leo ___ you his password?",
      "answer": "tell",
      "options": [
        "say",
        "tell",
        "speak",
        "talk"
      ]
    },
    {
      "blanked": "Focus on words without listener: What did she ___?",
      "answer": "say",
      "options": [
        "tell",
        "say",
        "told",
        "explain me"
      ]
    },
    {
      "blanked": "Listener named: Can you ___ us the story of your mountain journey?",
      "answer": "tell",
      "options": [
        "say",
        "tell",
        "speak",
        "talk"
      ]
    },
    {
      "blanked": "Words focused: He didn't ___ goodbye before walking out.",
      "answer": "say",
      "options": [
        "tell",
        "say",
        "tell to",
        "speak to"
      ]
    },
    {
      "blanked": "Listener named: She always ___ her children a bedtime fairy tale.",
      "answer": "tells",
      "options": [
        "says",
        "tells",
        "speaks",
        "talks"
      ]
    }
  ],
  "156": [
    {
      "blanked": "Language ability: How many foreign languages does Amy ___?",
      "answer": "speak",
      "options": [
        "talk",
        "tell",
        "speak",
        "say"
      ]
    },
    {
      "blanked": "Casual chat: Let’s ___ about our summer camping route.",
      "answer": "talk",
      "options": [
        "talk",
        "speak",
        "say",
        "tell to"
      ]
    },
    {
      "blanked": "Language fluency: Can your grandfather ___ Portuguese?",
      "answer": "speak",
      "options": [
        "talk",
        "speak",
        "say",
        "tell"
      ]
    },
    {
      "blanked": "Casual conversation: We sat on the balcony and ___ until midnight.",
      "answer": "talked",
      "options": [
        "spoke",
        "talked",
        "said",
        "told"
      ]
    },
    {
      "blanked": "Formal address: The ambassador will ___ to the delegates tomorrow.",
      "answer": "speak",
      "options": [
        "talk",
        "speak",
        "say",
        "tell"
      ]
    }
  ],
  "157": [
    {
      "blanked": "Accidental sound: Did you ___ that thunder a minute ago?",
      "answer": "hear",
      "options": [
        "listen",
        "hear",
        "listen to",
        "hearing"
      ]
    },
    {
      "blanked": "Active attention: They ___ the weather forecast on radio.",
      "answer": "listened to",
      "options": [
        "heard to",
        "listened",
        "listened to",
        "saw"
      ]
    },
    {
      "blanked": "Natural auditory perception: I could ___ footsteps coming down the stairs.",
      "answer": "hear",
      "options": [
        "listen",
        "hear",
        "listen to",
        "hearing"
      ]
    },
    {
      "blanked": "Active attention: Please ___ what the teacher is explaining.",
      "answer": "listen to",
      "options": [
        "hear",
        "listen",
        "listen to",
        "hear to"
      ]
    },
    {
      "blanked": "Active hobby: In the evenings, my father likes to ___ classical records.",
      "answer": "listen to",
      "options": [
        "hear",
        "hear to",
        "listen",
        "listen to"
      ]
    }
  ],
  "158": [
    {
      "blanked": "Follow moving screen/action: We ___ the rocket launch live.",
      "answer": "watched",
      "options": [
        "looked",
        "watched",
        "seen",
        "heard"
      ]
    },
    {
      "blanked": "Direct gaze: ___ that bright rainbow over the harbor!",
      "answer": "Look at",
      "options": [
        "See at",
        "Watch at",
        "Look at",
        "Look"
      ]
    },
    {
      "blanked": "Natural vision: Did you ___ the deer crossing the clearing?",
      "answer": "see",
      "options": [
        "look",
        "see",
        "watch at",
        "listen"
      ]
    },
    {
      "blanked": "Screen/motion: The children love to ___ animated movies on Saturday.",
      "answer": "watch",
      "options": [
        "see",
        "look",
        "watch",
        "look at"
      ]
    },
    {
      "blanked": "Direct gaze: Please ___ the chart displayed on the screen.",
      "answer": "look at",
      "options": [
        "look at",
        "watch at",
        "see at",
        "look"
      ]
    }
  ],
  "159": [
    {
      "blanked": "Give temporarily: Could you ___ me your charger until noon?",
      "answer": "lend",
      "options": [
        "borrow",
        "lend",
        "owe",
        "take"
      ]
    },
    {
      "blanked": "Take temporarily: Can I ___ a pen from your pencil case?",
      "answer": "borrow",
      "options": [
        "lend",
        "borrow",
        "give",
        "hand"
      ]
    },
    {
      "blanked": "Give temporarily: I can ___ you my umbrella if it starts raining.",
      "answer": "lend",
      "options": [
        "borrow",
        "lend",
        "take",
        "rent"
      ]
    },
    {
      "blanked": "Take temporarily from: He asked to ___ twenty dollars from his brother.",
      "answer": "borrow",
      "options": [
        "lend",
        "borrow",
        "give",
        "grant"
      ]
    },
    {
      "blanked": "Give temporarily: Will the bank ___ them the money for the house?",
      "answer": "lend",
      "options": [
        "borrow",
        "lend",
        "take from",
        "hand"
      ]
    }
  ],
  "160": [
    {
      "blanked": "Toward destination here: Remember to ___ your sketchbook to class.",
      "answer": "bring",
      "options": [
        "take away",
        "bring",
        "deliver away",
        "carry away"
      ]
    },
    {
      "blanked": "Away from here: Please ___ these empty crates back to the van.",
      "answer": "take",
      "options": [
        "bring",
        "take",
        "come with",
        "fetch here"
      ]
    },
    {
      "blanked": "Toward speaker: Could you ___ me that notebook from the table?",
      "answer": "bring",
      "options": [
        "take",
        "bring",
        "carry away",
        "remove"
      ]
    },
    {
      "blanked": "Away from here: Don't forget to ___ your passport when you go to the airport.",
      "answer": "take",
      "options": [
        "bring",
        "take",
        "fetch here",
        "bring here"
      ]
    },
    {
      "blanked": "Toward destination: You may ___ a guest to the award ceremony.",
      "answer": "bring",
      "options": [
        "take away",
        "bring",
        "remove",
        "carry away"
      ]
    }
  ],
  "161": [
    {
      "blanked": "At 7 AM this morning, our dog ___ in the garden.",
      "answer": "was digging",
      "options": [
        "dug",
        "was digging",
        "digs",
        "has dug"
      ]
    },
    {
      "blanked": "At midnight on Friday, firefighters ___ the blaze.",
      "answer": "were fighting",
      "options": [
        "fought",
        "fight",
        "are fighting",
        "were fighting"
      ]
    },
    {
      "blanked": "At 3 PM yesterday, Alice ___ her bicycle in the park.",
      "answer": "was riding",
      "options": [
        "was riding",
        "rode",
        "rides",
        "has ridden"
      ]
    },
    {
      "blanked": "What ___ you doing at ten o'clock last night?",
      "answer": "were",
      "options": [
        "were",
        "was",
        "did",
        "are"
      ]
    },
    {
      "blanked": "The children ___ quietly all evening while their mother worked.",
      "answer": "were sleeping",
      "options": [
        "were sleeping",
        "slept",
        "sleep",
        "are sleeping"
      ]
    }
  ],
  "162": [
    {
      "blanked": "Ben tripped while he ___ downstairs.",
      "answer": "was running",
      "options": [
        "ran",
        "was running",
        "runs",
        "has run"
      ]
    },
    {
      "blanked": "We ___ chess when someone knocked.",
      "answer": "were playing",
      "options": [
        "played",
        "were playing",
        "play",
        "are playing"
      ]
    },
    {
      "blanked": "Karen was making soup when the power ___ out.",
      "answer": "went",
      "options": [
        "went",
        "was going",
        "goes",
        "has gone"
      ]
    },
    {
      "blanked": "The doorbell rang while I ___ a shower.",
      "answer": "was taking",
      "options": [
        "was taking",
        "took",
        "take",
        "am taking"
      ]
    },
    {
      "blanked": "They were waiting at the platform when the train ___.",
      "answer": "arrived",
      "options": [
        "arrived",
        "was arriving",
        "arrives",
        "had arrive"
      ]
    }
  ],
  "163": [
    {
      "blanked": "Dan painted ___ Nora sanded timber.",
      "answer": "while",
      "options": [
        "during",
        "while",
        "until",
        "by"
      ]
    },
    {
      "blanked": "I swept the porch while they ___ leaves.",
      "answer": "were raking",
      "options": [
        "raked",
        "rakes",
        "were raking",
        "had rake"
      ]
    },
    {
      "blanked": "While the mechanic was fixing the car, we ___ coffee.",
      "answer": "were drinking",
      "options": [
        "were drinking",
        "drank",
        "drink",
        "are drinking"
      ]
    },
    {
      "blanked": "Liam was practicing the guitar while his sister ___ a novel.",
      "answer": "was reading",
      "options": [
        "was reading",
        "read",
        "reads",
        "is reading"
      ]
    },
    {
      "blanked": "The wind was howling outside while the fire ___ in the hearth.",
      "answer": "was burning",
      "options": [
        "was burning",
        "burned",
        "burns",
        "has burned"
      ]
    }
  ],
  "164": [
    {
      "blanked": "Oh no, someone ___ the vase!",
      "answer": "has broken",
      "options": [
        "breaks",
        "was breaking",
        "has broken",
        "had break"
      ]
    },
    {
      "blanked": "Great! Our team ___ repaired the leaky roof.",
      "answer": "has",
      "options": [
        "had",
        "has",
        "is",
        "did"
      ]
    },
    {
      "blanked": "Look, Emma ___ her finger and needs a bandage.",
      "answer": "has cut",
      "options": [
        "has cut",
        "was cutting",
        "cuts",
        "is cut"
      ]
    },
    {
      "blanked": "The streets are all wet because it ___.",
      "answer": "has rained",
      "options": [
        "has rained",
        "was rained",
        "rains",
        "had rain"
      ]
    },
    {
      "blanked": "I can't access my account because I ___ my password.",
      "answer": "have forgotten",
      "options": [
        "have forgotten",
        "forgotten",
        "am forgetting",
        "forget"
      ]
    }
  ],
  "165": [
    {
      "blanked": "Have you ___ ridden a camel?",
      "answer": "ever",
      "options": [
        "ever",
        "yet",
        "already",
        "never"
      ]
    },
    {
      "blanked": "Leo has ___ tasted durian fruit before.",
      "answer": "never",
      "options": [
        "ever",
        "never",
        "yet",
        "still"
      ]
    },
    {
      "blanked": "Has your sister ___ visited South America?",
      "answer": "ever",
      "options": [
        "ever",
        "never",
        "yet",
        "since"
      ]
    },
    {
      "blanked": "I have ___ seen such a brilliant meteor shower before.",
      "answer": "never",
      "options": [
        "never",
        "ever",
        "yet",
        "already"
      ]
    },
    {
      "blanked": "This is the most thrilling movie we have ever ___.",
      "answer": "watched",
      "options": [
        "watched",
        "watch",
        "watching",
        "watches"
      ]
    }
  ],
  "166": [
    {
      "blanked": "We ___ that mountain railway in 2019.",
      "answer": "rode",
      "options": [
        "have ridden",
        "rode",
        "ride",
        "had ride"
      ]
    },
    {
      "blanked": "Mia ___ three drafts so far this week.",
      "answer": "has written",
      "options": [
        "wrote",
        "has written",
        "writes",
        "did write"
      ]
    },
    {
      "blanked": "Last night, Lucas ___ dinner for his whole family.",
      "answer": "cooked",
      "options": [
        "cooked",
        "has cooked",
        "cooks",
        "was cooked"
      ]
    },
    {
      "blanked": "So far today, our team ___ five customer inquiries.",
      "answer": "has answered",
      "options": [
        "has answered",
        "answered",
        "answers",
        "was answering"
      ]
    },
    {
      "blanked": "Two years ago, they ___ their old apartment downtown.",
      "answer": "sold",
      "options": [
        "sold",
        "have sold",
        "sell",
        "had sell"
      ]
    }
  ],
  "167": [
    {
      "blanked": "Sam hasn’t packed his skis ___.",
      "answer": "yet",
      "options": [
        "already",
        "just",
        "yet",
        "ever"
      ]
    },
    {
      "blanked": "We have ___ mailed the invitations.",
      "answer": "already",
      "options": [
        "yet",
        "already",
        "ever",
        "since"
      ]
    },
    {
      "blanked": "Has the postman delivered the parcel ___?",
      "answer": "yet",
      "options": [
        "yet",
        "already",
        "still",
        "just"
      ]
    },
    {
      "blanked": "The conference attendees have ___ taken their seats in the hall.",
      "answer": "already",
      "options": [
        "already",
        "yet",
        "still",
        "ever"
      ]
    },
    {
      "blanked": "They haven't announced the winners of the contest ___.",
      "answer": "yet",
      "options": [
        "yet",
        "already",
        "ago",
        "just"
      ]
    }
  ],
  "168": [
    {
      "blanked": "Look, the newborn lamb has ___ stood up!",
      "answer": "just",
      "options": [
        "yet",
        "just",
        "since",
        "for"
      ]
    },
    {
      "blanked": "The baker has ___ pulled the loaves from the oven.",
      "answer": "just",
      "options": [
        "just",
        "yet",
        "ago",
        "until"
      ]
    },
    {
      "blanked": "Be careful, the painter has ___ coated the bench with wet varnish.",
      "answer": "just",
      "options": [
        "just",
        "yet",
        "ago",
        "since"
      ]
    },
    {
      "blanked": "The plane has ___ touched down on the runway.",
      "answer": "just",
      "options": [
        "just",
        "yet",
        "still",
        "ever"
      ]
    },
    {
      "blanked": "I have ___ received an email confirming our hotel reservation.",
      "answer": "just",
      "options": [
        "just",
        "yet",
        "ago",
        "before"
      ]
    }
  ],
  "169": [
    {
      "blanked": "Sorry, Ken isn’t in — he has ___ Athens.",
      "answer": "gone to",
      "options": [
        "been to",
        "gone to",
        "been in",
        "went to"
      ]
    },
    {
      "blanked": "I love Lisbon; I’ve ___ there twice.",
      "answer": "been",
      "options": [
        "gone",
        "been",
        "went",
        "staying"
      ]
    },
    {
      "blanked": "Where is Rachel? She has ___ the supermarket to buy milk.",
      "answer": "gone to",
      "options": [
        "gone to",
        "been to",
        "went to",
        "going"
      ]
    },
    {
      "blanked": "We have ___ that seaside resort several times, and we always return.",
      "answer": "been to",
      "options": [
        "been to",
        "gone to",
        "visited to",
        "went to"
      ]
    },
    {
      "blanked": "Marcus is not at his desk because he has ___ Berlin for a business meeting.",
      "answer": "gone to",
      "options": [
        "gone to",
        "been to",
        "went to",
        "be in"
      ]
    }
  ],
  "170": [
    {
      "blanked": "Our violinist has practiced daily ___ six years.",
      "answer": "for",
      "options": [
        "since",
        "from",
        "for",
        "ago"
      ]
    },
    {
      "blanked": "That tiny bookstore has stood here ___ 1984.",
      "answer": "since",
      "options": [
        "for",
        "since",
        "during",
        "ago"
      ]
    },
    {
      "blanked": "Clara has been a doctor at this clinic ___ twelve months.",
      "answer": "for",
      "options": [
        "for",
        "since",
        "from",
        "during"
      ]
    },
    {
      "blanked": "We have known each other ___ primary school.",
      "answer": "since",
      "options": [
        "since",
        "for",
        "from",
        "until"
      ]
    },
    {
      "blanked": "David has lived in this quiet village ___ last November.",
      "answer": "since",
      "options": [
        "since",
        "for",
        "during",
        "ago"
      ]
    }
  ],
  "171": [
    {
      "blanked": "Before we reached the hut, campers ___ the fire.",
      "answer": "had lit",
      "options": [
        "lit",
        "have lit",
        "had lit",
        "will light"
      ]
    },
    {
      "blanked": "She noticed someone ___ moved her sketchbook.",
      "answer": "had",
      "options": [
        "has",
        "had",
        "was",
        "did"
      ]
    },
    {
      "blanked": "By the time the police arrived, the burglar ___ through the back window.",
      "answer": "had escaped",
      "options": [
        "had escaped",
        "escaped",
        "has escaped",
        "escapes"
      ]
    },
    {
      "blanked": "Tom was upset because he ___ his notebook on the bus.",
      "answer": "had forgotten",
      "options": [
        "had forgotten",
        "has forgotten",
        "forgets",
        "is forgetting"
      ]
    },
    {
      "blanked": "The train ___ already departed when we reached platform four.",
      "answer": "had",
      "options": [
        "had",
        "has",
        "was",
        "did"
      ]
    }
  ],
  "172": [
    {
      "blanked": "___ the storm cleared, we had fixed the gate.",
      "answer": "By the time",
      "options": [
        "By the time",
        "Now that",
        "Since when",
        "So far"
      ]
    },
    {
      "blanked": "After he ___ checked the tires, we drove off.",
      "answer": "had",
      "options": [
        "has",
        "had",
        "is",
        "will"
      ]
    },
    {
      "blanked": "The doctor had ___ stepped out of the room when the monitor beeped.",
      "answer": "just",
      "options": [
        "just",
        "yet",
        "ever",
        "ago"
      ]
    },
    {
      "blanked": "By the time the fire truck arrived, the neighbors ___ extinguished the flames.",
      "answer": "had already",
      "options": [
        "had already",
        "have already",
        "are already",
        "did already"
      ]
    },
    {
      "blanked": "She had never seen an iceberg ___ that Arctic voyage.",
      "answer": "before",
      "options": [
        "before",
        "after",
        "while",
        "during"
      ]
    }
  ],
  "173": [
    {
      "blanked": "There ___ be a bakery on Oak Street.",
      "answer": "used to",
      "options": [
        "used to",
        "use to",
        "is used to",
        "would to"
      ]
    },
    {
      "blanked": "I ___ enjoy olives, but now I love them.",
      "answer": "didn't use to",
      "options": [
        "didn't used to",
        "didn't use to",
        "wasn't used to",
        "use not to"
      ]
    },
    {
      "blanked": "Did you ___ play the violin when you were in school?",
      "answer": "use to",
      "options": [
        "use to",
        "used to",
        "used",
        "using to"
      ]
    },
    {
      "blanked": "My grandfather ___ walk five miles to work every morning.",
      "answer": "used to",
      "options": [
        "used to",
        "use to",
        "was used to",
        "is used to"
      ]
    },
    {
      "blanked": "We ___ have internet access in our summer cabin, but now we do.",
      "answer": "didn't use to",
      "options": [
        "didn't use to",
        "didn't used to",
        "not used to",
        "weren't use to"
      ]
    }
  ],
  "174": [
    {
      "blanked": "I ___ own an old moped.",
      "answer": "used to",
      "options": [
        "would",
        "used to",
        "am used to",
        "will"
      ]
    },
    {
      "blanked": "On frosty nights, we ___ roast chestnuts.",
      "answer": "would",
      "options": [
        "used",
        "are used to",
        "would",
        "had been"
      ]
    },
    {
      "blanked": "Whenever it rained, Grandma ___ tell us old folklore stories.",
      "answer": "would",
      "options": [
        "would",
        "is used to",
        "used",
        "was"
      ]
    },
    {
      "blanked": "My uncle ___ have long blonde hair when he was a teenager.",
      "answer": "used to",
      "options": [
        "used to",
        "would",
        "will",
        "was used to"
      ]
    },
    {
      "blanked": "Every summer, we ___ camp beside the pine forest for two weeks.",
      "answer": "would",
      "options": [
        "would",
        "used",
        "are used to",
        "did to"
      ]
    }
  ],
  "175": [
    {
      "blanked": "Librarians ___ sorting long queues.",
      "answer": "are used to",
      "options": [
        "used to",
        "are used to",
        "use to",
        "get use to"
      ]
    },
    {
      "blanked": "Is Elena ___ driving through thick fog?",
      "answer": "used to",
      "options": [
        "use to",
        "used to",
        "used",
        "using to"
      ]
    },
    {
      "blanked": "I live in Seattle, so I ___ the frequent drizzle.",
      "answer": "am used to",
      "options": [
        "am used to",
        "used to",
        "use to",
        "get used"
      ]
    },
    {
      "blanked": "He is an experienced chef, so he is used to ___ under pressure.",
      "answer": "working",
      "options": [
        "working",
        "work",
        "worked",
        "to work"
      ]
    },
    {
      "blanked": "They aren't used to ___ in such noisy surroundings.",
      "answer": "sleeping",
      "options": [
        "sleeping",
        "sleep",
        "slept",
        "to sleep"
      ]
    }
  ],
  "176": [
    {
      "blanked": "It took weeks to ___ the tropical heat.",
      "answer": "get used to",
      "options": [
        "used to",
        "be use to",
        "get used to",
        "getting"
      ]
    },
    {
      "blanked": "Soon you will ___ waking with roosters.",
      "answer": "get used to",
      "options": [
        "used to",
        "get used to",
        "would",
        "be used"
      ]
    },
    {
      "blanked": "It was difficult at first, but I am slowly getting used to ___ the night shift.",
      "answer": "working",
      "options": [
        "working",
        "work",
        "worked",
        "to work"
      ]
    },
    {
      "blanked": "Don't worry, you will soon get used to ___ on the left side of the road.",
      "answer": "driving",
      "options": [
        "driving",
        "drive",
        "drove",
        "to drive"
      ]
    },
    {
      "blanked": "She hasn't got used to ___ alone in the big city yet.",
      "answer": "living",
      "options": [
        "living",
        "live",
        "lived",
        "to live"
      ]
    }
  ],
  "177": [
    {
      "blanked": "Call me as soon as the ferry ___.",
      "answer": "docks",
      "options": [
        "will dock",
        "docks",
        "would dock",
        "docked"
      ]
    },
    {
      "blanked": "Save your file before you ___ the app.",
      "answer": "close",
      "options": [
        "will close",
        "closed",
        "close",
        "are closing"
      ]
    },
    {
      "blanked": "We will set off on our hike as soon as the sun ___.",
      "answer": "rises",
      "options": [
        "rises",
        "will rise",
        "rose",
        "is rising"
      ]
    },
    {
      "blanked": "Please stay in the lobby until the doctor ___ your name.",
      "answer": "calls",
      "options": [
        "calls",
        "will call",
        "called",
        "would call"
      ]
    },
    {
      "blanked": "I will send you a text message after I ___ at the hotel.",
      "answer": "arrive",
      "options": [
        "arrive",
        "will arrive",
        "arrived",
        "am arriving"
      ]
    }
  ],
  "178": [
    {
      "blanked": "It’s the third time Max ___ late.",
      "answer": "has arrived",
      "options": [
        "arrives",
        "arrived",
        "has arrived",
        "is arriving"
      ]
    },
    {
      "blanked": "This is the first time I ___ sushi.",
      "answer": "have rolled",
      "options": [
        "rolled",
        "roll",
        "have rolled",
        "had rolled"
      ]
    },
    {
      "blanked": "It is the second time they ___ their car keys this month.",
      "answer": "have lost",
      "options": [
        "have lost",
        "lost",
        "lose",
        "had lost"
      ]
    },
    {
      "blanked": "This is the fourth time she ___ that song today.",
      "answer": "has played",
      "options": [
        "has played",
        "plays",
        "played",
        "is playing"
      ]
    },
    {
      "blanked": "Is this the first time you ___ a scuba mask?",
      "answer": "have worn",
      "options": [
        "have worn",
        "wore",
        "wear",
        "had worn"
      ]
    }
  ],
  "179": [
    {
      "blanked": "At 3 PM tomorrow, I ___ across the lake.",
      "answer": "will be sailing",
      "options": [
        "sail",
        "will be sailing",
        "sailed",
        "have sailed"
      ]
    },
    {
      "blanked": "Don’t phone at eight — we ___ the concert.",
      "answer": "will be watching",
      "options": [
        "watch",
        "watched",
        "will be watching",
        "have watched"
      ]
    },
    {
      "blanked": "This time next Tuesday, they ___ over the Atlantic Ocean.",
      "answer": "will be flying",
      "options": [
        "will be flying",
        "fly",
        "flew",
        "have flown"
      ]
    },
    {
      "blanked": "Will you ___ using the lawnmower this afternoon?",
      "answer": "be",
      "options": [
        "be",
        "have",
        "are",
        "do"
      ]
    },
    {
      "blanked": "Don't visit at nine because the baby ___ then.",
      "answer": "will be sleeping",
      "options": [
        "will be sleeping",
        "sleeps",
        "slept",
        "has slept"
      ]
    }
  ],
  "180": [
    {
      "blanked": "My boots are muddy because I ___ gardening.",
      "answer": "have been",
      "options": [
        "am",
        "was",
        "have been",
        "will be"
      ]
    },
    {
      "blanked": "Who ___ using my drafting pens all day?",
      "answer": "has been",
      "options": [
        "is",
        "was",
        "has been",
        "will"
      ]
    },
    {
      "blanked": "She is exhausted because she ___ running for two hours.",
      "answer": "has been",
      "options": [
        "has been",
        "is",
        "was",
        "had"
      ]
    },
    {
      "blanked": "We ___ repairing the old barn roof since eight this morning.",
      "answer": "have been",
      "options": [
        "have been",
        "are",
        "were",
        "had"
      ]
    },
    {
      "blanked": "How long ___ you been studying Japanese?",
      "answer": "have",
      "options": [
        "have",
        "has",
        "are",
        "did"
      ]
    }
  ],
  "181": [
    {
      "blanked": "So far today, Maya ___ four apples.",
      "answer": "has eaten",
      "options": [
        "has eaten",
        "has been eating",
        "eats",
        "is eating"
      ]
    },
    {
      "blanked": "How long ___ those mechanics been fixing our van?",
      "answer": "have",
      "options": [
        "have",
        "has",
        "did",
        "are"
      ]
    },
    {
      "blanked": "He has ___ writing letters all morning, and he has written six so far.",
      "answer": "been",
      "options": [
        "been",
        "had",
        "done",
        "got"
      ]
    },
    {
      "blanked": "Oliver has ___ five chapters of the novel this afternoon.",
      "answer": "read",
      "options": [
        "read",
        "been reading",
        "reading",
        "reads"
      ]
    },
    {
      "blanked": "How many kilometers have you ___ today?",
      "answer": "run",
      "options": [
        "run",
        "been running",
        "running",
        "ran"
      ]
    }
  ],
  "182": [
    {
      "blanked": "You’d better ___ a spare coat.",
      "answer": "take",
      "options": [
        "to take",
        "take",
        "taking",
        "took"
      ]
    },
    {
      "blanked": "We ___ leave now — the bridge closes in five minutes!",
      "answer": "had better",
      "options": [
        "had better",
        "would better",
        "had rather",
        "have better"
      ]
    },
    {
      "blanked": "You had better ___ eat those wild mushrooms; they could be poisonous.",
      "answer": "not",
      "options": [
        "not",
        "don't",
        "not to",
        "didn't"
      ]
    },
    {
      "blanked": "It's getting dark; we'd better ___ back to the campsite.",
      "answer": "head",
      "options": [
        "head",
        "to head",
        "heading",
        "headed"
      ]
    },
    {
      "blanked": "You had better ___ your seatbelt before the plane takes off.",
      "answer": "fasten",
      "options": [
        "fasten",
        "to fasten",
        "fastening",
        "fastened"
      ]
    }
  ],
  "183": [
    {
      "blanked": "She slowed down ___ the deer clearly.",
      "answer": "to watch",
      "options": [
        "for watch",
        "to watch",
        "for watching",
        "watching"
      ]
    },
    {
      "blanked": "He saved every coin ___ a mountain telescope.",
      "answer": "to buy",
      "options": [
        "to buy",
        "for buy",
        "buying",
        "bought"
      ]
    },
    {
      "blanked": "We stopped at the petrol station ___ some fuel.",
      "answer": "to get",
      "options": [
        "to get",
        "for get",
        "getting",
        "for getting"
      ]
    },
    {
      "blanked": "Lucas opened the window ___ some fresh air into the room.",
      "answer": "to let",
      "options": [
        "to let",
        "for let",
        "letting",
        "lets"
      ]
    },
    {
      "blanked": "She went to the library ___ a quiet place to study.",
      "answer": "to find",
      "options": [
        "to find",
        "for finding",
        "for find",
        "finding"
      ]
    }
  ],
  "184": [
    {
      "blanked": "___ daily keeps your memory sharp.",
      "answer": "Reading",
      "options": [
        "Read",
        "To reading",
        "Reading",
        "Having read"
      ]
    },
    {
      "blanked": "___ fresh herbs takes very little balcony space.",
      "answer": "Growing",
      "options": [
        "Grow",
        "Growing",
        "Grown",
        "To growing"
      ]
    },
    {
      "blanked": "___ across the desert requires specialized survival training.",
      "answer": "Traveling",
      "options": [
        "Traveling",
        "Travel",
        "Traveled",
        "To traveling"
      ]
    },
    {
      "blanked": "___ ancient manuscripts requires great attention to detail.",
      "answer": "Restoring",
      "options": [
        "Restoring",
        "Restore",
        "Restored",
        "To restoring"
      ]
    },
    {
      "blanked": "___ late at night often causes headaches the next morning.",
      "answer": "Working",
      "options": [
        "Working",
        "Work",
        "Worked",
        "To working"
      ]
    }
  ],
  "185": [
    {
      "blanked": "Earn points by ___ short puzzles.",
      "answer": "solving",
      "options": [
        "solve",
        "solving",
        "to solve",
        "solved"
      ]
    },
    {
      "blanked": "Try walking instead of ___ a taxi.",
      "answer": "taking",
      "options": [
        "take",
        "taking",
        "to take",
        "taken"
      ]
    },
    {
      "blanked": "She succeeded by ___ twelve hours every day before the competition.",
      "answer": "practicing",
      "options": [
        "practicing",
        "practice",
        "to practice",
        "practiced"
      ]
    },
    {
      "blanked": "Before ___ the contract, read all the small print carefully.",
      "answer": "signing",
      "options": [
        "signing",
        "sign",
        "to sign",
        "signed"
      ]
    },
    {
      "blanked": "We talked about ___ to a warmer climate next year.",
      "answer": "moving",
      "options": [
        "moving",
        "move",
        "to move",
        "moved"
      ]
    }
  ],
  "186": [
    {
      "blanked": "The committee decided ___ the fair.",
      "answer": "to postpone",
      "options": [
        "postpone",
        "postponing",
        "to postpone",
        "for postpone"
      ]
    },
    {
      "blanked": "Luckily, she managed ___ an early seat.",
      "answer": "to secure",
      "options": [
        "secure",
        "securing",
        "to secure",
        "for securing"
      ]
    },
    {
      "blanked": "The hikers planned ___ the mountain summit before sunrise.",
      "answer": "to reach",
      "options": [
        "to reach",
        "reaching",
        "reach",
        "for reach"
      ]
    },
    {
      "blanked": "David offered ___ the elderly neighbor carry her groceries.",
      "answer": "to help",
      "options": [
        "to help",
        "helping",
        "help",
        "for helping"
      ]
    },
    {
      "blanked": "They agreed ___ the contract terms after a short discussion.",
      "answer": "to sign",
      "options": [
        "to sign",
        "signing",
        "sign",
        "for signing"
      ]
    }
  ],
  "187": [
    {
      "blanked": "Do you mind ___ the curtains slightly?",
      "answer": "closing",
      "options": [
        "close",
        "closing",
        "to close",
        "closed"
      ]
    },
    {
      "blanked": "Cyclists avoid ___ through deep mud.",
      "answer": "riding",
      "options": [
        "ride",
        "to ride",
        "riding",
        "rode"
      ]
    },
    {
      "blanked": "She practiced ___ the violin passage until it was flawless.",
      "answer": "playing",
      "options": [
        "playing",
        "to play",
        "play",
        "played"
      ]
    },
    {
      "blanked": "Would you consider ___ your old apartment and buying a house?",
      "answer": "selling",
      "options": [
        "selling",
        "to sell",
        "sell",
        "sold"
      ]
    },
    {
      "blanked": "He always avoids ___ into political debates at dinner parties.",
      "answer": "getting",
      "options": [
        "getting",
        "to get",
        "get",
        "got"
      ]
    }
  ],
  "188": [
    {
      "blanked": "Both brothers love ___ kites.",
      "answer": "flying",
      "options": [
        "flying",
        "flew",
        "flown",
        "flight"
      ]
    },
    {
      "blanked": "I prefer ___ warm herbal tea after dinner.",
      "answer": "to drink",
      "options": [
        "to drink",
        "drank",
        "drunk",
        "drink to"
      ]
    },
    {
      "blanked": "She hates ___ in long queues at the post office.",
      "answer": "waiting",
      "options": [
        "waiting",
        "waited",
        "wait for",
        "waits"
      ]
    },
    {
      "blanked": "On cold winter days, we like ___ beside the fireplace.",
      "answer": "to sit",
      "options": [
        "to sit",
        "sat",
        "sitting on",
        "sit to"
      ]
    },
    {
      "blanked": "Do you prefer ___ by train or by airplane?",
      "answer": "traveling",
      "options": [
        "traveling",
        "traveled",
        "travel to",
        "travels"
      ]
    }
  ],
  "189": [
    {
      "blanked": "They asked ___ the back gate open.",
      "answer": "us not to leave",
      "options": [
        "us not to leave",
        "that we don't leave",
        "us to not leave",
        "us not leaving"
      ]
    },
    {
      "blanked": "Grandma wants ___ a lantern tomorrow.",
      "answer": "me to bring",
      "options": [
        "that I bring",
        "me to bring",
        "me bring",
        "I to bring"
      ]
    },
    {
      "blanked": "The teacher told the students ___ their textbooks to page twenty.",
      "answer": "to open",
      "options": [
        "to open",
        "open",
        "opening",
        "opened"
      ]
    },
    {
      "blanked": "The police officer ordered the driver ___ out of the vehicle.",
      "answer": "to step",
      "options": [
        "to step",
        "step",
        "stepping",
        "that he step"
      ]
    },
    {
      "blanked": "The doctor advised him ___ sugary snacks between meals.",
      "answer": "not to eat",
      "options": [
        "not to eat",
        "to not eat",
        "don't eat",
        "that he not eat"
      ]
    }
  ],
  "190": [
    {
      "blanked": "Please let your guests ___ first.",
      "answer": "enter",
      "options": [
        "enter",
        "to enter",
        "entering",
        "entered"
      ]
    },
    {
      "blanked": "That spicy chili made my eyes ___.",
      "answer": "water",
      "options": [
        "water",
        "to water",
        "watering",
        "watered"
      ]
    },
    {
      "blanked": "Our teacher made us ___ the entire essay after school.",
      "answer": "rewrite",
      "options": [
        "rewrite",
        "to rewrite",
        "rewriting",
        "rewritten"
      ]
    },
    {
      "blanked": "My parents let me ___ their car for the weekend trip.",
      "answer": "borrow",
      "options": [
        "borrow",
        "to borrow",
        "borrowing",
        "borrowed"
      ]
    },
    {
      "blanked": "The hilarious comedian made the whole audience ___ with laughter.",
      "answer": "roar",
      "options": [
        "roar",
        "to roar",
        "roaring",
        "roared"
      ]
    }
  ],
  "191": [
    {
      "blanked": "Could you help me ___ these heavy jars?",
      "answer": "open",
      "options": [
        "opening",
        "opened",
        "open",
        "for open"
      ]
    },
    {
      "blanked": "Mia helped Leo ___ his bike.",
      "answer": "to mend",
      "options": [
        "mending",
        "to mend",
        "mended",
        "mend to"
      ]
    },
    {
      "blanked": "Can anyone help us ___ this couch up the stairs?",
      "answer": "move",
      "options": [
        "move",
        "moving",
        "moved",
        "for moving"
      ]
    },
    {
      "blanked": "The tutorial helped him ___ the complex software quickly.",
      "answer": "to understand",
      "options": [
        "to understand",
        "understanding",
        "understood",
        "understand to"
      ]
    },
    {
      "blanked": "Reading daily helps children ___ their vocabulary.",
      "answer": "expand",
      "options": [
        "expand",
        "expanding",
        "expanded",
        "expands to"
      ]
    }
  ],
  "192": [
    {
      "blanked": "He stopped ___ a bandage.",
      "answer": "to buy",
      "options": [
        "buying",
        "to buy",
        "buy",
        "bought"
      ]
    },
    {
      "blanked": "You must stop ___ your nails!",
      "answer": "biting",
      "options": [
        "to bite",
        "bite",
        "biting",
        "bitten"
      ]
    },
    {
      "blanked": "While driving through the mountains, we stopped ___ photos of the valley.",
      "answer": "to take",
      "options": [
        "to take",
        "taking",
        "take",
        "took"
      ]
    },
    {
      "blanked": "The doctor advised him to stop ___ sugary soda completely.",
      "answer": "drinking",
      "options": [
        "drinking",
        "to drink",
        "drink",
        "drank"
      ]
    },
    {
      "blanked": "Can everyone please stop ___ so loudly while the baby sleeps?",
      "answer": "talking",
      "options": [
        "talking",
        "to talk",
        "talk",
        "talked"
      ]
    }
  ],
  "193": [
    {
      "blanked": "Please remember ___ the greenhouse before dusk.",
      "answer": "to water",
      "options": [
        "watering",
        "to water",
        "watered",
        "water"
      ]
    },
    {
      "blanked": "I clearly remember ___ that lighthouse years ago.",
      "answer": "climbing",
      "options": [
        "to climb",
        "climb",
        "climbing",
        "climbed"
      ]
    },
    {
      "blanked": "Did you remember ___ off the gas stove before leaving?",
      "answer": "to turn",
      "options": [
        "to turn",
        "turning",
        "turned",
        "turn"
      ]
    },
    {
      "blanked": "I will always remember ___ that breathtaking sunrise from the mountain peak.",
      "answer": "seeing",
      "options": [
        "seeing",
        "to see",
        "saw",
        "seen"
      ]
    },
    {
      "blanked": "Remember ___ your passport in your carry-on bag.",
      "answer": "to keep",
      "options": [
        "to keep",
        "keeping",
        "kept",
        "keep"
      ]
    }
  ],
  "194": [
    {
      "blanked": "Oops, I forgot ___ the oven off!",
      "answer": "to switch",
      "options": [
        "switching",
        "to switch",
        "switched",
        "switch"
      ]
    },
    {
      "blanked": "I’ll never forget ___ whale songs live.",
      "answer": "hearing",
      "options": [
        "to hear",
        "hear",
        "hearing",
        "heard"
      ]
    },
    {
      "blanked": "Don't forget ___ the front gate when you leave.",
      "answer": "to lock",
      "options": [
        "to lock",
        "locking",
        "locked",
        "lock"
      ]
    },
    {
      "blanked": "She will never forget ___ hands with the astronaut at the science fair.",
      "answer": "shaking",
      "options": [
        "shaking",
        "to shake",
        "shook",
        "shake"
      ]
    },
    {
      "blanked": "He forgot ___ his umbrella, so he got completely soaked in the storm.",
      "answer": "to bring",
      "options": [
        "to bring",
        "bringing",
        "brought",
        "bring"
      ]
    }
  ],
  "195": [
    {
      "blanked": "The door stuck, so try ___ the lock.",
      "answer": "lubricating",
      "options": [
        "to lubricate",
        "lubricating",
        "lubricated",
        "lubricate"
      ]
    },
    {
      "blanked": "We tried ___ the rusted bolt twice.",
      "answer": "to loosen",
      "options": [
        "to loosen",
        "loosening",
        "loosened",
        "loosen"
      ]
    },
    {
      "blanked": "If the soup tastes bland, try ___ a pinch of sea salt.",
      "answer": "adding",
      "options": [
        "adding",
        "to add",
        "added",
        "add"
      ]
    },
    {
      "blanked": "The young gymnast tried ___ a backflip for the first time.",
      "answer": "to do",
      "options": [
        "to do",
        "doing",
        "did",
        "done"
      ]
    },
    {
      "blanked": "The printer isn't working; try ___ it off and on again.",
      "answer": "turning",
      "options": [
        "turning",
        "to turn",
        "turned",
        "turn"
      ]
    }
  ],
  "196": [
    {
      "blanked": "We regret ___ that Friday’s flight is delayed.",
      "answer": "to inform you",
      "options": [
        "informing you",
        "to inform you",
        "inform you",
        "informed you"
      ]
    },
    {
      "blanked": "Sam regrets ___ his temper yesterday.",
      "answer": "losing",
      "options": [
        "to lose",
        "lose",
        "losing",
        "lost"
      ]
    },
    {
      "blanked": "I regret ___ that your application was unsuccessful.",
      "answer": "to say",
      "options": [
        "to say",
        "saying",
        "said",
        "say"
      ]
    },
    {
      "blanked": "Do you regret ___ your old guitar last year?",
      "answer": "selling",
      "options": [
        "selling",
        "to sell",
        "sold",
        "sell"
      ]
    },
    {
      "blanked": "The airline regrets ___ that baggage handling is currently suspended.",
      "answer": "to announce",
      "options": [
        "to announce",
        "announcing",
        "announced",
        "announce"
      ]
    }
  ],
  "197": [
    {
      "blanked": "Even in rain, hikers went on ___.",
      "answer": "singing",
      "options": [
        "to sing",
        "sing",
        "singing",
        "sang"
      ]
    },
    {
      "blanked": "After biology, Eva went on ___ chemistry.",
      "answer": "to study",
      "options": [
        "studying",
        "to study",
        "study",
        "studied"
      ]
    },
    {
      "blanked": "Despite the loud noise outside, the speaker went on ___.",
      "answer": "talking",
      "options": [
        "talking",
        "to talk",
        "talk",
        "talked"
      ]
    },
    {
      "blanked": "After winning the national tournament, the team went on ___ the world championship.",
      "answer": "to win",
      "options": [
        "to win",
        "winning",
        "won",
        "win"
      ]
    },
    {
      "blanked": "Don't stop now, please go on ___ what happened next.",
      "answer": "explaining",
      "options": [
        "explaining",
        "to explain",
        "explained",
        "explain"
      ]
    }
  ],
  "198": [
    {
      "blanked": "Moving north means ___ warmer coats.",
      "answer": "buying",
      "options": [
        "to buy",
        "buy",
        "buying",
        "bought"
      ]
    },
    {
      "blanked": "Honestly, I didn’t mean ___ your teacup.",
      "answer": "to chip",
      "options": [
        "chipping",
        "chip",
        "chipped",
        "to chip"
      ]
    },
    {
      "blanked": "Accepting this promotion means ___ to another city.",
      "answer": "relocating",
      "options": [
        "relocating",
        "to relocate",
        "relocate",
        "relocated"
      ]
    },
    {
      "blanked": "I'm sorry, I didn't mean ___ you.",
      "answer": "to offend",
      "options": [
        "to offend",
        "offending",
        "offend",
        "offended"
      ]
    },
    {
      "blanked": "Studying abroad will mean ___ on a tight budget.",
      "answer": "living",
      "options": [
        "living",
        "to live",
        "live",
        "lived"
      ]
    }
  ],
  "199": [
    {
      "blanked": "Little owls are afraid of ___ into bright lamps.",
      "answer": "flying",
      "options": [
        "to fly",
        "fly",
        "flying",
        "flew"
      ]
    },
    {
      "blanked": "Leo is surprisingly good at ___ clocks.",
      "answer": "repairing",
      "options": [
        "repair",
        "to repair",
        "repaired",
        "repairing"
      ]
    },
    {
      "blanked": "She is tired of ___ to the same excuses every week.",
      "answer": "listening",
      "options": [
        "listening",
        "to listen",
        "listen",
        "listened"
      ]
    },
    {
      "blanked": "Are you capable of ___ a marathon next spring?",
      "answer": "running",
      "options": [
        "running",
        "to run",
        "run",
        "ran"
      ]
    },
    {
      "blanked": "The boys are really excited about ___ the space museum.",
      "answer": "visiting",
      "options": [
        "visiting",
        "to visit",
        "visit",
        "visited"
      ]
    }
  ],
  "200": [
    {
      "blanked": "The ancient ruins on the hill are well worth ___.",
      "answer": "visiting",
      "options": [
        "to visit",
        "to be visited",
        "visiting",
        "visited"
      ]
    },
    {
      "blanked": "Is this scratched vinyl worth ___?",
      "answer": "keeping",
      "options": [
        "keeping",
        "to keep",
        "kept",
        "to be kept"
      ]
    },
    {
      "blanked": "That classic novel is definitely worth ___ more than once.",
      "answer": "reading",
      "options": [
        "reading",
        "to read",
        "to be read",
        "read"
      ]
    },
    {
      "blanked": "The old camera isn't worth ___ because the parts are too expensive.",
      "answer": "repairing",
      "options": [
        "repairing",
        "to repair",
        "to be repaired",
        "repaired"
      ]
    },
    {
      "blanked": "It is not worth ___ over such minor disagreements.",
      "answer": "worrying",
      "options": [
        "worrying",
        "to worry",
        "to be worried",
        "worried"
      ]
    }
  ],
  "201": [
    {
      "blanked": "We look forward to ___ from you.",
      "answer": "hearing",
      "options": [
        "hear",
        "to hear",
        "hearing",
        "heard"
      ]
    },
    {
      "blanked": "Kids look forward to ___ at camp.",
      "answer": "camping",
      "options": [
        "camp",
        "camping",
        "camped",
        "to camp"
      ]
    },
    {
      "blanked": "I am really looking forward to ___ my grandparents next weekend.",
      "answer": "visiting",
      "options": [
        "visiting",
        "visit",
        "to visit",
        "visited"
      ]
    },
    {
      "blanked": "Our team looks forward to ___ the new software system next month.",
      "answer": "launching",
      "options": [
        "launching",
        "launch",
        "to launch",
        "launched"
      ]
    },
    {
      "blanked": "Are you looking forward to ___ that international conference?",
      "answer": "attending",
      "options": [
        "attending",
        "attend",
        "to attend",
        "attended"
      ]
    }
  ],
  "202": [
    {
      "blanked": "Look at those leaves ___ down gently.",
      "answer": "falling",
      "options": [
        "fallen",
        "falling",
        "fall",
        "fell"
      ]
    },
    {
      "blanked": "Swept up every ___ plate quickly.",
      "answer": "broken",
      "options": [
        "breaking",
        "broke",
        "broken",
        "breaks"
      ]
    },
    {
      "blanked": "The sound of ___ water in the brook helped him relax.",
      "answer": "running",
      "options": [
        "running",
        "run",
        "ran",
        "runs"
      ]
    },
    {
      "blanked": "The police recovered the ___ bicycle behind the warehouse.",
      "answer": "stolen",
      "options": [
        "stolen",
        "stealing",
        "stole",
        "steals"
      ]
    },
    {
      "blanked": "A ___ dog will rarely bite if you leave it alone.",
      "answer": "barking",
      "options": [
        "barking",
        "barked",
        "bark",
        "barks"
      ]
    }
  ],
  "203": [
    {
      "blanked": "On rainy days, I’d rather ___ chess.",
      "answer": "play",
      "options": [
        "to play",
        "playing",
        "play",
        "played"
      ]
    },
    {
      "blanked": "She’d rather ___ out during hail.",
      "answer": "not go",
      "options": [
        "not to go",
        "don’t go",
        "not go",
        "to not go"
      ]
    },
    {
      "blanked": "I'd rather ___ by train than drive through heavy traffic.",
      "answer": "travel",
      "options": [
        "travel",
        "to travel",
        "traveling",
        "traveled"
      ]
    },
    {
      "blanked": "Would you rather ___ tea or freshly brewed coffee?",
      "answer": "have",
      "options": [
        "have",
        "to have",
        "having",
        "had"
      ]
    },
    {
      "blanked": "We would rather ___ here until the storm passes.",
      "answer": "wait",
      "options": [
        "wait",
        "to wait",
        "waiting",
        "waited"
      ]
    }
  ],
  "204": [
    {
      "blanked": "I prefer bitter tea ___ sweet soda.",
      "answer": "to",
      "options": [
        "than",
        "to",
        "over",
        "from"
      ]
    },
    {
      "blanked": "Max prefers cycling ___ driving downtown.",
      "answer": "to",
      "options": [
        "than",
        "for",
        "to",
        "by"
      ]
    },
    {
      "blanked": "She prefers to read at home rather ___ go to a crowded party.",
      "answer": "than",
      "options": [
        "than",
        "to",
        "from",
        "over"
      ]
    },
    {
      "blanked": "Most children prefer playing outside ___ sitting in front of a screen.",
      "answer": "to",
      "options": [
        "to",
        "than",
        "over",
        "against"
      ]
    },
    {
      "blanked": "I would prefer to walk rather than ___ a taxi.",
      "answer": "take",
      "options": [
        "take",
        "taking",
        "to take",
        "took"
      ]
    }
  ],
  "205": [
    {
      "blanked": "Those antique coins were ___ under floor planks.",
      "answer": "discovered",
      "options": [
        "discover",
        "discovering",
        "discovered",
        "discovers"
      ]
    },
    {
      "blanked": "New streetlamps will be ___ next spring.",
      "answer": "installed",
      "options": [
        "install",
        "installing",
        "installed",
        "installs"
      ]
    },
    {
      "blanked": "The ancient manuscript was ___ by a team of archaeologists.",
      "answer": "found",
      "options": [
        "found",
        "find",
        "finding",
        "finds"
      ]
    },
    {
      "blanked": "Delicious pastries are ___ fresh each morning at the bakery.",
      "answer": "baked",
      "options": [
        "baked",
        "baking",
        "bake",
        "bakes"
      ]
    },
    {
      "blanked": "The missing keys were ___ under the sofa.",
      "answer": "located",
      "options": [
        "located",
        "locating",
        "locate",
        "locates"
      ]
    }
  ],
  "206": [
    {
      "blanked": "This portrait was painted ___ Mia.",
      "answer": "by",
      "options": [
        "with",
        "from",
        "by",
        "of"
      ]
    },
    {
      "blanked": "Each silver ring is carved ___ a fine chisel.",
      "answer": "with",
      "options": [
        "by",
        "with",
        "from",
        "as"
      ]
    },
    {
      "blanked": "The symphony was composed ___ Beethoven.",
      "answer": "by",
      "options": [
        "by",
        "with",
        "from",
        "of"
      ]
    },
    {
      "blanked": "The wooden door was locked ___ a heavy iron padlock.",
      "answer": "with",
      "options": [
        "with",
        "by",
        "from",
        "about"
      ]
    },
    {
      "blanked": "The roof was damaged ___ the violent thunderstorm.",
      "answer": "by",
      "options": [
        "by",
        "with",
        "from",
        "at"
      ]
    }
  ],
  "207": [
    {
      "blanked": "Sea salt ___ dried here in wide pans.",
      "answer": "is",
      "options": [
        "was",
        "is",
        "has",
        "does"
      ]
    },
    {
      "blanked": "Fresh tickets ___ sold daily at gate two.",
      "answer": "are",
      "options": [
        "is",
        "are",
        "have",
        "do"
      ]
    },
    {
      "blanked": "Millions of emails ___ sent around the world every minute.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "have",
        "do"
      ]
    },
    {
      "blanked": "Coffee beans ___ grown on tropical mountain slopes.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "were",
        "been"
      ]
    },
    {
      "blanked": "This historic castle ___ visited by thousands of tourists every summer.",
      "answer": "is",
      "options": [
        "is",
        "are",
        "was",
        "has"
      ]
    }
  ],
  "208": [
    {
      "blanked": "That stone bridge ___ built two centuries ago.",
      "answer": "was",
      "options": [
        "is",
        "was",
        "did",
        "has"
      ]
    },
    {
      "blanked": "All winning poems ___ printed last week.",
      "answer": "were",
      "options": [
        "was",
        "did",
        "were",
        "have been"
      ]
    },
    {
      "blanked": "The Eiffel Tower ___ constructed in 1889.",
      "answer": "was",
      "options": [
        "was",
        "were",
        "is",
        "has been"
      ]
    },
    {
      "blanked": "The stolen paintings ___ recovered by police yesterday.",
      "answer": "were",
      "options": [
        "were",
        "was",
        "are",
        "did"
      ]
    },
    {
      "blanked": "When ___ the first computer invented?",
      "answer": "was",
      "options": [
        "was",
        "did",
        "were",
        "had"
      ]
    }
  ],
  "209": [
    {
      "blanked": "Final race scores ___ announced tomorrow.",
      "answer": "will be",
      "options": [
        "are be",
        "will be",
        "will being",
        "were be"
      ]
    },
    {
      "blanked": "Your lost parcel will ___ delivered by courier.",
      "answer": "be",
      "options": [
        "being",
        "been",
        "be",
        "is"
      ]
    },
    {
      "blanked": "The new highway ___ opened to traffic next month.",
      "answer": "will be",
      "options": [
        "will be",
        "is be",
        "was be",
        "has been"
      ]
    },
    {
      "blanked": "A new library will ___ built in our neighborhood next year.",
      "answer": "be",
      "options": [
        "be",
        "been",
        "being",
        "is"
      ]
    },
    {
      "blanked": "All late submissions ___ rejected automatically by the system.",
      "answer": "will be",
      "options": [
        "will be",
        "are be",
        "were be",
        "have been"
      ]
    }
  ],
  "210": [
    {
      "blanked": "Look — the cracked fence has finally ___!",
      "answer": "been fixed",
      "options": [
        "fixed",
        "be fixed",
        "been fixed",
        "being fixed"
      ]
    },
    {
      "blanked": "All essays ___ graded already.",
      "answer": "have been",
      "options": [
        "has been",
        "are been",
        "have been",
        "were been"
      ]
    },
    {
      "blanked": "The front door has ___ unlocked, so you can walk right in.",
      "answer": "been",
      "options": [
        "been",
        "being",
        "be",
        "was"
      ]
    },
    {
      "blanked": "Several important documents ___ misplaced during the office relocation.",
      "answer": "have been",
      "options": [
        "have been",
        "has been",
        "were been",
        "are been"
      ]
    },
    {
      "blanked": "The new software update has ___ installed on all computers.",
      "answer": "already been",
      "options": [
        "already been",
        "been already",
        "already being",
        "be already"
      ]
    }
  ],
  "211": [
    {
      "blanked": "Please use the stairs — the lift ___ now.",
      "answer": "is being repaired",
      "options": [
        "is repaired",
        "is being repaired",
        "has being repaired",
        "repairs"
      ]
    },
    {
      "blanked": "Our bikes were ___ when we arrived.",
      "answer": "being washed",
      "options": [
        "washed been",
        "be washed",
        "being washed",
        "washing"
      ]
    },
    {
      "blanked": "A new hospital is ___ constructed on the north side of the city.",
      "answer": "being",
      "options": [
        "being",
        "been",
        "be",
        "is"
      ]
    },
    {
      "blanked": "The documents were ___ scanned when the power cut occurred.",
      "answer": "being",
      "options": [
        "being",
        "been",
        "be",
        "are"
      ]
    },
    {
      "blanked": "Quiet, please! The movie is ___ filmed in this street right now.",
      "answer": "being",
      "options": [
        "being",
        "been",
        "be",
        "having"
      ]
    }
  ],
  "212": [
    {
      "blanked": "Fragile parcels must ___ handled with great care.",
      "answer": "be",
      "options": [
        "been",
        "being",
        "be",
        "are"
      ]
    },
    {
      "blanked": "That ancient oak should not ___ cut down.",
      "answer": "be",
      "options": [
        "be",
        "is",
        "been",
        "to be"
      ]
    },
    {
      "blanked": "The project can ___ completed within three days.",
      "answer": "be",
      "options": [
        "be",
        "been",
        "being",
        "is"
      ]
    },
    {
      "blanked": "Seatbelts must ___ worn at all times during the flight.",
      "answer": "be",
      "options": [
        "be",
        "been",
        "being",
        "are"
      ]
    },
    {
      "blanked": "Old batteries should not ___ thrown into regular household trash.",
      "answer": "be",
      "options": [
        "be",
        "been",
        "being",
        "to be"
      ]
    }
  ],
  "213": [
    {
      "blanked": "That ___ be Leo — he flew to Tokyo yesterday!",
      "answer": "can't",
      "options": [
        "mustn't",
        "can't",
        "shouldn't",
        "needn't"
      ]
    },
    {
      "blanked": "You walked 12 miles — your feet ___ ache!",
      "answer": "must",
      "options": [
        "must",
        "can",
        "ought",
        "need"
      ]
    },
    {
      "blanked": "She has lived in Madrid for ten years, so she ___ speak fluent Spanish.",
      "answer": "must",
      "options": [
        "must",
        "can't",
        "might not",
        "needn't"
      ]
    },
    {
      "blanked": "He only bought that laptop yesterday, so it ___ be broken already!",
      "answer": "can't",
      "options": [
        "can't",
        "mustn't",
        "shouldn't",
        "must"
      ]
    },
    {
      "blanked": "There is no answer at the door; they ___ be away on holiday.",
      "answer": "must",
      "options": [
        "must",
        "can't",
        "needn't",
        "shall"
      ]
    }
  ],
  "214": [
    {
      "blanked": "Relax, you needn’t ___ an umbrella inside.",
      "answer": "carry",
      "options": [
        "to carry",
        "carrying",
        "carry",
        "carried"
      ]
    },
    {
      "blanked": "Guests don’t need ___ printed boarding passes.",
      "answer": "to bring",
      "options": [
        "bring",
        "to bring",
        "bringing",
        "brought"
      ]
    },
    {
      "blanked": "You needn't ___ early tomorrow; our meeting starts at noon.",
      "answer": "wake up",
      "options": [
        "wake up",
        "to wake up",
        "waking up",
        "woke up"
      ]
    },
    {
      "blanked": "We don't need ___ a table; the restaurant is usually empty on Tuesdays.",
      "answer": "to book",
      "options": [
        "to book",
        "book",
        "booking",
        "booked"
      ]
    },
    {
      "blanked": "You needn't ___ for the tickets; admission is free today.",
      "answer": "pay",
      "options": [
        "pay",
        "to pay",
        "paying",
        "paid"
      ]
    }
  ],
  "215": [
    {
      "blanked": "Library books are ___ be returned within 14 days.",
      "answer": "supposed to",
      "options": [
        "supposed to",
        "supposing to",
        "suppose to",
        "supposed"
      ]
    },
    {
      "blanked": "Our shuttle bus ___ arrive at terminal B.",
      "answer": "is supposed to",
      "options": [
        "supposes to",
        "is supposed to",
        "supposed",
        "is supposing"
      ]
    },
    {
      "blanked": "You are not supposed ___ your phone during the examination.",
      "answer": "to use",
      "options": [
        "to use",
        "using",
        "use",
        "used"
      ]
    },
    {
      "blanked": "The package was supposed to ___ yesterday, but it hasn't come yet.",
      "answer": "arrive",
      "options": [
        "arrive",
        "arriving",
        "arrived",
        "to arrive"
      ]
    },
    {
      "blanked": "We are supposed ___ the manager before making any changes.",
      "answer": "to inform",
      "options": [
        "to inform",
        "informing",
        "inform",
        "informed"
      ]
    }
  ],
  "216": [
    {
      "blanked": "If you mix blue and yellow, you ___ green.",
      "answer": "get",
      "options": [
        "would get",
        "got",
        "get",
        "are getting"
      ]
    },
    {
      "blanked": "Snow ___ if temperatures climb above zero.",
      "answer": "melts",
      "options": [
        "would melt",
        "melted",
        "melts",
        "melting"
      ]
    },
    {
      "blanked": "If you heat water to one hundred degrees Celsius, it ___.",
      "answer": "boils",
      "options": [
        "boils",
        "boiled",
        "would boil",
        "is boiling"
      ]
    },
    {
      "blanked": "Plants die if they ___ get enough sunlight and water.",
      "answer": "don't",
      "options": [
        "don't",
        "didn't",
        "won't",
        "haven't"
      ]
    },
    {
      "blanked": "If you press this button, the bell ___.",
      "answer": "rings",
      "options": [
        "rings",
        "rang",
        "would ring",
        "ringing"
      ]
    }
  ],
  "217": [
    {
      "blanked": "If rain ___ soon, we’ll hike.",
      "answer": "stops",
      "options": [
        "will stop",
        "stops",
        "stopped",
        "would stop"
      ]
    },
    {
      "blanked": "If Sam trains daily, he ___ finish the race.",
      "answer": "will",
      "options": [
        "would",
        "will",
        "did",
        "was"
      ]
    },
    {
      "blanked": "If we leave right now, we ___ catch the express bus.",
      "answer": "will",
      "options": [
        "will",
        "would",
        "had",
        "are"
      ]
    },
    {
      "blanked": "If she passes the entrance exam, her parents ___ throw a party.",
      "answer": "will",
      "options": [
        "will",
        "would",
        "were",
        "did"
      ]
    },
    {
      "blanked": "They will miss their flight if the taxi ___ not arrive soon.",
      "answer": "does",
      "options": [
        "does",
        "will",
        "did",
        "would"
      ]
    }
  ],
  "218": [
    {
      "blanked": "If the alarm rings, ___ the exit.",
      "answer": "use",
      "options": [
        "using",
        "to use",
        "use",
        "would use"
      ]
    },
    {
      "blanked": "If your knee hurts, you ___ rest today.",
      "answer": "should",
      "options": [
        "would",
        "had",
        "should",
        "were"
      ]
    },
    {
      "blanked": "If you visit Paris, you ___ take a walk along the Seine.",
      "answer": "must",
      "options": [
        "must",
        "would",
        "did",
        "had"
      ]
    },
    {
      "blanked": "If anyone asks for me, please ___ them I will return soon.",
      "answer": "tell",
      "options": [
        "tell",
        "to tell",
        "telling",
        "would tell"
      ]
    },
    {
      "blanked": "If you finish your chores early, you ___ go out with your friends.",
      "answer": "can",
      "options": [
        "can",
        "would",
        "did",
        "were"
      ]
    }
  ],
  "219": [
    {
      "blanked": "If we owned a sailboat, we ___ island-hop.",
      "answer": "would",
      "options": [
        "will",
        "would",
        "had",
        "do"
      ]
    },
    {
      "blanked": "What would you change if you ___ mayor?",
      "answer": "became",
      "options": [
        "become",
        "will become",
        "became",
        "have become"
      ]
    },
    {
      "blanked": "If I had more free time, I ___ learn how to play the cello.",
      "answer": "would",
      "options": [
        "would",
        "will",
        "can",
        "shall"
      ]
    },
    {
      "blanked": "If they lived in the countryside, they ___ grow their own vegetables.",
      "answer": "would",
      "options": [
        "would",
        "will",
        "did",
        "have"
      ]
    },
    {
      "blanked": "What would happen if the sun ___ shine for a week?",
      "answer": "didn't",
      "options": [
        "didn't",
        "doesn't",
        "won't",
        "hadn't"
      ]
    }
  ],
  "220": [
    {
      "blanked": "If I ___ you, I’d accept that scholarship.",
      "answer": "were",
      "options": [
        "am",
        "would be",
        "were",
        "will be"
      ]
    },
    {
      "blanked": "If Mia ___ closer, she’d join our choir.",
      "answer": "were",
      "options": [
        "is",
        "has been",
        "were",
        "will be"
      ]
    },
    {
      "blanked": "If he ___ more patient, he would be a great teacher.",
      "answer": "were",
      "options": [
        "were",
        "is",
        "will be",
        "would be"
      ]
    },
    {
      "blanked": "If it ___ not so cold outside, we would go for a swim.",
      "answer": "were",
      "options": [
        "were",
        "is",
        "will be",
        "has been"
      ]
    },
    {
      "blanked": "I would buy that painting immediately if it ___ not so expensive.",
      "answer": "were",
      "options": [
        "were",
        "is",
        "will be",
        "would be"
      ]
    }
  ],
  "221": [
    {
      "blanked": "We can’t bake unless you ___ eggs.",
      "answer": "buy",
      "options": [
        "don't buy",
        "buy",
        "won’t buy",
        "bought not"
      ]
    },
    {
      "blanked": "Nobody enters unless they ___ a badge.",
      "answer": "show",
      "options": [
        "don't show",
        "never show",
        "show",
        "will show"
      ]
    },
    {
      "blanked": "You will fail the exam unless you ___ regularly.",
      "answer": "study",
      "options": [
        "study",
        "don't study",
        "won't study",
        "studied not"
      ]
    },
    {
      "blanked": "I won't tell you the secret unless you ___ to keep it quiet.",
      "answer": "promise",
      "options": [
        "promise",
        "don't promise",
        "won't promise",
        "promising"
      ]
    },
    {
      "blanked": "Unless the weather ___ tomorrow, the match will be postponed.",
      "answer": "improves",
      "options": [
        "improves",
        "doesn't improve",
        "won't improve",
        "improving"
      ]
    }
  ],
  "222": [
    {
      "blanked": "Borrow my camera, ___ you guard the lens.",
      "answer": "as long as",
      "options": [
        "unless",
        "despite",
        "as long as",
        "however"
      ]
    },
    {
      "blanked": "We will picnic outdoors ___ the wind stays calm.",
      "answer": "provided that",
      "options": [
        "provided that",
        "even though",
        "unless",
        "because of"
      ]
    },
    {
      "blanked": "You can stay at our apartment ___ you keep it clean and tidy.",
      "answer": "as long as",
      "options": [
        "as long as",
        "unless",
        "although",
        "despite"
      ]
    },
    {
      "blanked": "The outdoor concert will proceed ___ it doesn't rain heavily.",
      "answer": "provided that",
      "options": [
        "provided that",
        "unless",
        "in spite of",
        "whereas"
      ]
    },
    {
      "blanked": "You may borrow this laptop ___ you return it by Friday.",
      "answer": "as long as",
      "options": [
        "as long as",
        "unless",
        "although",
        "despite"
      ]
    }
  ],
  "223": [
    {
      "blanked": "It’s high time the city ___ that bridge.",
      "answer": "repainted",
      "options": [
        "repaints",
        "will repaint",
        "repainted",
        "has repaint"
      ]
    },
    {
      "blanked": "Look at the clock — it’s time we ___ home.",
      "answer": "headed",
      "options": [
        "head",
        "headed",
        "will head",
        "are heading"
      ]
    },
    {
      "blanked": "It is high time you ___ for a job.",
      "answer": "applied",
      "options": [
        "applied",
        "apply",
        "will apply",
        "have applied"
      ]
    },
    {
      "blanked": "It's about time they ___ their messy bedroom.",
      "answer": "cleaned",
      "options": [
        "cleaned",
        "clean",
        "cleaning",
        "will clean"
      ]
    },
    {
      "blanked": "It's high time you ___ a dental checkup.",
      "answer": "scheduled",
      "options": [
        "scheduled",
        "schedule",
        "will schedule",
        "scheduling"
      ]
    }
  ],
  "224": [
    {
      "blanked": "Both Elena and Sam ___ fluently.",
      "answer": "translate",
      "options": [
        "translates",
        "translate",
        "is translating",
        "was translating"
      ]
    },
    {
      "blanked": "Neither Leo nor his friends ___ ready.",
      "answer": "are",
      "options": [
        "is",
        "was",
        "are",
        "has"
      ]
    },
    {
      "blanked": "Both the teacher and the students ___ excited about the field trip.",
      "answer": "were",
      "options": [
        "were",
        "was",
        "is",
        "has been"
      ]
    },
    {
      "blanked": "Either the manager or her assistants ___ responsible for this report.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "was",
        "has"
      ]
    },
    {
      "blanked": "Neither the captain nor the coach ___ satisfied with the team's performance.",
      "answer": "was",
      "options": [
        "was",
        "were",
        "are",
        "have been"
      ]
    }
  ],
  "225": [
    {
      "blanked": "The botanist ___ discovered that fern won a prize.",
      "answer": "who",
      "options": [
        "which",
        "who",
        "whom",
        "where"
      ]
    },
    {
      "blanked": "Look for the clerk ___ wears a green vest.",
      "answer": "who",
      "options": [
        "which",
        "who",
        "where",
        "whose"
      ]
    },
    {
      "blanked": "The architect ___ designed this skyscraper is famous worldwide.",
      "answer": "who",
      "options": [
        "who",
        "which",
        "where",
        "when"
      ]
    },
    {
      "blanked": "We met a friendly tourist ___ showed us the way to the castle.",
      "answer": "who",
      "options": [
        "who",
        "which",
        "where",
        "what"
      ]
    },
    {
      "blanked": "Do you know anyone ___ speaks both Portuguese and Japanese?",
      "answer": "who",
      "options": [
        "who",
        "which",
        "whose",
        "where"
      ]
    }
  ],
  "226": [
    {
      "blanked": "Keep the receipt ___ comes inside the box.",
      "answer": "which",
      "options": [
        "who",
        "whom",
        "which",
        "whose"
      ]
    },
    {
      "blanked": "That tiny lantern ___ hangs outdoors resists wind.",
      "answer": "which",
      "options": [
        "who",
        "which",
        "where",
        "whom"
      ]
    },
    {
      "blanked": "She gave me a watch ___ belonged to her grandfather.",
      "answer": "which",
      "options": [
        "which",
        "who",
        "whom",
        "where"
      ]
    },
    {
      "blanked": "We found an injured bird ___ could not fly.",
      "answer": "which",
      "options": [
        "which",
        "who",
        "whom",
        "where"
      ]
    },
    {
      "blanked": "He bought a camera ___ takes high-resolution images underwater.",
      "answer": "which",
      "options": [
        "which",
        "who",
        "whom",
        "whose"
      ]
    }
  ],
  "227": [
    {
      "blanked": "Everything ___ Maya cooked vanished.",
      "answer": "that",
      "options": [
        "what",
        "that",
        "whom",
        "whose"
      ]
    },
    {
      "blanked": "Here’s the blue mug ___ survived three moves.",
      "answer": "that",
      "options": [
        "what",
        "whose",
        "that",
        "where"
      ]
    },
    {
      "blanked": "The bicycle ___ was parked outside has been stolen.",
      "answer": "that",
      "options": [
        "that",
        "what",
        "whom",
        "whose"
      ]
    },
    {
      "blanked": "She is the only person ___ truly understands my situation.",
      "answer": "that",
      "options": [
        "that",
        "what",
        "which",
        "whose"
      ]
    },
    {
      "blanked": "All the books ___ were on the top shelf have been packed away.",
      "answer": "that",
      "options": [
        "that",
        "what",
        "whom",
        "whose"
      ]
    }
  ],
  "228": [
    {
      "blanked": "The sourdough bread ___ Sam baked smelled heavenly.",
      "answer": "—",
      "options": [
        "whose",
        "what",
        "—",
        "where"
      ]
    },
    {
      "blanked": "Here are the postcards ___ we picked up in Vienna.",
      "answer": "—",
      "options": [
        "who",
        "what",
        "—",
        "when"
      ]
    },
    {
      "blanked": "The delicious meal ___ she prepared was enjoyed by all the guests.",
      "answer": "—",
      "options": [
        "—",
        "whose",
        "what",
        "where"
      ]
    },
    {
      "blanked": "The warm sweater ___ my grandmother knitted keeps me cozy all winter.",
      "answer": "—",
      "options": [
        "—",
        "what",
        "where",
        "when"
      ]
    },
    {
      "blanked": "Is that the handsome jacket ___ you bought in Milan?",
      "answer": "—",
      "options": [
        "—",
        "what",
        "whose",
        "where"
      ]
    }
  ],
  "229": [
    {
      "blanked": "We met a sculptor ___ studio overlooks cliffs.",
      "answer": "whose",
      "options": [
        "who",
        "who's",
        "whose",
        "which"
      ]
    },
    {
      "blanked": "Help the passenger ___ luggage missed the train.",
      "answer": "whose",
      "options": [
        "who",
        "which",
        "whose",
        "who's"
      ]
    },
    {
      "blanked": "The woman ___ dog won the competition received a gold medal.",
      "answer": "whose",
      "options": [
        "whose",
        "who's",
        "who",
        "which"
      ]
    },
    {
      "blanked": "We stayed in a charming hotel ___ windows faced the snowy peaks.",
      "answer": "whose",
      "options": [
        "whose",
        "who's",
        "which",
        "where"
      ]
    },
    {
      "blanked": "Do you know the author ___ latest book became an instant bestseller?",
      "answer": "whose",
      "options": [
        "whose",
        "who's",
        "whom",
        "which"
      ]
    }
  ],
  "230": [
    {
      "blanked": "Show me the studio ___ you record podcasts.",
      "answer": "where",
      "options": [
        "which",
        "when",
        "where",
        "whose"
      ]
    },
    {
      "blanked": "Autumn is the season ___ maples turn bright scarlet.",
      "answer": "when",
      "options": [
        "where",
        "when",
        "which",
        "whose"
      ]
    },
    {
      "blanked": "This is the peaceful seaside town ___ my parents grew up.",
      "answer": "where",
      "options": [
        "where",
        "which",
        "when",
        "whose"
      ]
    },
    {
      "blanked": "Sunday is the only day ___ our whole family has breakfast together.",
      "answer": "when",
      "options": [
        "when",
        "where",
        "which",
        "whose"
      ]
    },
    {
      "blanked": "Do you remember the quiet library ___ we studied for finals?",
      "answer": "where",
      "options": [
        "where",
        "when",
        "which",
        "whose"
      ]
    }
  ],
  "231": [
    {
      "blanked": "Berlin, ___ lies on the Spree, has vast parks.",
      "answer": "which",
      "options": [
        "that",
        "which",
        "what",
        "where in"
      ]
    },
    {
      "blanked": "Uncle Ben, ___ lives in Cork, builds violins.",
      "answer": "who",
      "options": [
        "that",
        "who",
        "whom",
        "which"
      ]
    },
    {
      "blanked": "My English teacher, ___ is from Oxford, loves British literature.",
      "answer": "who",
      "options": [
        "who",
        "that",
        "which",
        "whom"
      ]
    },
    {
      "blanked": "The Golden Gate Bridge, ___ was opened in 1937, attracts millions of visitors.",
      "answer": "which",
      "options": [
        "which",
        "that",
        "what",
        "who"
      ]
    },
    {
      "blanked": "Mount Everest, ___ is the highest peak on Earth, is located in the Himalayas.",
      "answer": "which",
      "options": [
        "which",
        "that",
        "where",
        "what"
      ]
    }
  ],
  "232": [
    {
      "blanked": "Clara didn’t forget the compass, ___?",
      "answer": "did she",
      "options": [
        "didn't she",
        "did she",
        "was she",
        "does she"
      ]
    },
    {
      "blanked": "Your twins love astronomy, ___?",
      "answer": "don't they",
      "options": [
        "do they",
        "aren't they",
        "don't they",
        "didn't they"
      ]
    },
    {
      "blanked": "You have seen this movie before, ___?",
      "answer": "haven't you",
      "options": [
        "haven't you",
        "have you",
        "didn't you",
        "don't you"
      ]
    },
    {
      "blanked": "The children aren't sleeping yet, ___?",
      "answer": "are they",
      "options": [
        "are they",
        "aren't they",
        "do they",
        "were they"
      ]
    },
    {
      "blanked": "Tom will help us tomorrow, ___?",
      "answer": "won't he",
      "options": [
        "won't he",
        "will he",
        "doesn't he",
        "isn't he"
      ]
    }
  ],
  "233": [
    {
      "blanked": "Oops, I am blocking your view, ___?",
      "answer": "aren't I",
      "options": [
        "am I not",
        "isn't I",
        "aren't I",
        "don't I"
      ]
    },
    {
      "blanked": "Let’s explore the botanical dome, ___?",
      "answer": "shall we",
      "options": [
        "will we",
        "shall we",
        "don't we",
        "do we"
      ]
    },
    {
      "blanked": "Close the window, ___?",
      "answer": "will you",
      "options": [
        "will you",
        "shall you",
        "do you",
        "aren't you"
      ]
    },
    {
      "blanked": "I am responsible for the tickets, ___?",
      "answer": "aren't I",
      "options": [
        "aren't I",
        "am not I",
        "isn't I",
        "don't I"
      ]
    },
    {
      "blanked": "Let's take a quick coffee break, ___?",
      "answer": "shall we",
      "options": [
        "shall we",
        "will we",
        "do we",
        "won't we"
      ]
    }
  ],
  "234": [
    {
      "blanked": "___ it hailed, the match continued.",
      "answer": "Although",
      "options": [
        "Despite",
        "In spite of",
        "Although",
        "However"
      ]
    },
    {
      "blanked": "Even though Ben was hoarse, he ___.",
      "answer": "sang well",
      "options": [
        "but sang well",
        "sang well",
        "although sang",
        "still but sang"
      ]
    },
    {
      "blanked": "___ she was exhausted after the long flight, she attended the evening banquet.",
      "answer": "Although",
      "options": [
        "Although",
        "Despite",
        "In spite of",
        "However"
      ]
    },
    {
      "blanked": "Even though they practiced every day, they ___ win the trophy.",
      "answer": "didn't",
      "options": [
        "didn't",
        "but didn't",
        "although didn't",
        "however didn't"
      ]
    },
    {
      "blanked": "We decided to go camping, ___ the weather forecast predicted rain.",
      "answer": "even though",
      "options": [
        "even though",
        "despite",
        "in spite of",
        "however"
      ]
    }
  ],
  "235": [
    {
      "blanked": "___ the thick fog, planes landed.",
      "answer": "Despite",
      "options": [
        "Despite of",
        "Despite",
        "Although",
        "Even though"
      ]
    },
    {
      "blanked": "They kept smiling in spite of ___ soaking wet.",
      "answer": "being",
      "options": [
        "they were",
        "be",
        "being",
        "to be"
      ]
    },
    {
      "blanked": "___ the heavy rain, the football match was not canceled.",
      "answer": "In spite of",
      "options": [
        "In spite of",
        "Despite of",
        "Although",
        "Even though"
      ]
    },
    {
      "blanked": "He managed to finish the marathon despite ___ an injured ankle.",
      "answer": "having",
      "options": [
        "having",
        "he had",
        "to have",
        "of having"
      ]
    },
    {
      "blanked": "___ her busy schedule, Dr. Evans always finds time to volunteer.",
      "answer": "Despite",
      "options": [
        "Despite",
        "Despite of",
        "Although",
        "Even though"
      ]
    }
  ],
  "236": [
    {
      "blanked": "The trail was steep; ___, the summit view glowed.",
      "answer": "however",
      "options": [
        "although",
        "however",
        "despite",
        "but"
      ]
    },
    {
      "blanked": "Our train stopped twice. ___, we arrived on schedule.",
      "answer": "However",
      "options": [
        "Despite",
        "Although",
        "However",
        "Whereas"
      ]
    },
    {
      "blanked": "The hotel was quite small. ___, the rooms were exceptionally clean and comfortable.",
      "answer": "However",
      "options": [
        "However",
        "Although",
        "Despite",
        "In spite of"
      ]
    },
    {
      "blanked": "She studied diligently for weeks; ___, the test was much harder than expected.",
      "answer": "however",
      "options": [
        "however",
        "although",
        "despite",
        "whereas"
      ]
    },
    {
      "blanked": "He wanted to buy the vintage car. ___, it was far too expensive.",
      "answer": "However",
      "options": [
        "However",
        "Although",
        "Despite",
        "Even though"
      ]
    }
  ],
  "237": [
    {
      "blanked": "Nora not only sketches portraits ___ carves wood.",
      "answer": "but also",
      "options": [
        "and also",
        "but also",
        "or also",
        "as well"
      ]
    },
    {
      "blanked": "That scarf is not only feather-light ___ remarkably warm.",
      "answer": "but also",
      "options": [
        "but also",
        "or rather",
        "even though",
        "however"
      ]
    },
    {
      "blanked": "The scholarship covers not only tuition fees ___ living expenses.",
      "answer": "but also",
      "options": [
        "but also",
        "and too",
        "as well",
        "or also"
      ]
    },
    {
      "blanked": "The new smart thermostat not only saves energy ___ improves home comfort.",
      "answer": "but also",
      "options": [
        "but also",
        "and also",
        "as well as",
        "or else"
      ]
    },
    {
      "blanked": "He is not only an accomplished violinist ___ a talented composer.",
      "answer": "but also",
      "options": [
        "but also",
        "and also",
        "as well",
        "neither also"
      ]
    }
  ],
  "238": [
    {
      "blanked": "I didn’t drop ___ onto the tiles.",
      "answer": "anything",
      "options": [
        "nothing",
        "anything",
        "nobody",
        "never"
      ]
    },
    {
      "blanked": "Did you see? Nobody knows — I haven’t told ___.",
      "answer": "anybody",
      "options": [
        "nobody",
        "no one",
        "anybody",
        "none"
      ]
    },
    {
      "blanked": "We haven't seen ___ at the train station yet.",
      "answer": "anyone",
      "options": [
        "anyone",
        "no one",
        "nobody",
        "none"
      ]
    },
    {
      "blanked": "She doesn't have ___ money left in her wallet.",
      "answer": "any",
      "options": [
        "any",
        "no",
        "none",
        "nothing"
      ]
    },
    {
      "blanked": "He didn't say ___ about the upcoming merger during the meeting.",
      "answer": "anything",
      "options": [
        "anything",
        "nothing",
        "nowhere",
        "no one"
      ]
    }
  ],
  "239": [
    {
      "blanked": "___ that lighthouse beam look bright?",
      "answer": "Doesn't",
      "options": [
        "Doesn't",
        "Isn't",
        "Hasn't",
        "Wasn't"
      ]
    },
    {
      "blanked": "___ you already packed the picnic basket?",
      "answer": "Haven't",
      "options": [
        "Don't",
        "Didn't",
        "Haven't",
        "Aren't"
      ]
    },
    {
      "blanked": "___ you recognize your old primary school teacher?",
      "answer": "Didn't",
      "options": [
        "Didn't",
        "Aren't",
        "Haven't",
        "Isn't"
      ]
    },
    {
      "blanked": "___ this aroma of freshly ground coffee wonderful?",
      "answer": "Isn't",
      "options": [
        "Isn't",
        "Doesn't",
        "Hasn't",
        "Aren't"
      ]
    },
    {
      "blanked": "___ you remember where you parked the car?",
      "answer": "Don't",
      "options": [
        "Don't",
        "Aren't",
        "Haven't",
        "Isn't"
      ]
    }
  ],
  "240": [
    {
      "blanked": "Steam ___ slowly from warm springs.",
      "answer": "rises",
      "options": [
        "raises",
        "rises",
        "is raising",
        "lays"
      ]
    },
    {
      "blanked": "Please ___ those clean towels on the bench.",
      "answer": "lay",
      "options": [
        "lie",
        "lay",
        "risen",
        "lying"
      ]
    },
    {
      "blanked": "The company decided to ___ salaries by ten percent.",
      "answer": "raise",
      "options": [
        "raise",
        "rise",
        "arise",
        "risen"
      ]
    },
    {
      "blanked": "When I have a headache, I like to ___ down in a quiet dark room.",
      "answer": "lie",
      "options": [
        "lie",
        "lay",
        "laid",
        "lain"
      ]
    },
    {
      "blanked": "He gently ___ the sleeping puppy in its basket.",
      "answer": "laid",
      "options": [
        "laid",
        "lay",
        "lied",
        "lain"
      ]
    }
  ],
  "241": [
    {
      "blanked": "Future Perfect: By Friday evening, we ___ painted all three doors.",
      "answer": "will have",
      "options": [
        "have",
        "are having",
        "will have",
        "had"
      ]
    },
    {
      "blanked": "Completed before future date: By 2029, Ken will have ___ his residency.",
      "answer": "finished",
      "options": [
        "finish",
        "finishing",
        "finished",
        "finishes"
      ]
    },
    {
      "blanked": "Negative Future Perfect: By midnight, they ___ downloaded all files.",
      "answer": "won't have",
      "options": [
        "won't have",
        "haven't",
        "aren't having",
        "didn't have"
      ]
    },
    {
      "blanked": "Question form: ___ you have saved enough money by December?",
      "answer": "Will",
      "options": [
        "Will",
        "Have",
        "Did",
        "Are"
      ]
    },
    {
      "blanked": "By the time clause: By the time the train arrives, Sarah ___ eaten.",
      "answer": "will have",
      "options": [
        "will have",
        "would have",
        "had",
        "has"
      ]
    }
  ],
  "242": [
    {
      "blanked": "Past Perfect Continuous: His sleeves were dusty because he ___ shelves.",
      "answer": "had been sanding",
      "options": [
        "sands",
        "has been sanding",
        "had been sanding",
        "was sand"
      ]
    },
    {
      "blanked": "Duration up to past point: We ___ for an hour before the mist cleared.",
      "answer": "had been hiking",
      "options": [
        "have been hiking",
        "had been hiking",
        "are hiking",
        "hike"
      ]
    },
    {
      "blanked": "Past visible result: Her eyes were red because she ___ onions.",
      "answer": "had been chopping",
      "options": [
        "had been chopping",
        "has been chopping",
        "was chopped",
        "chopped"
      ]
    },
    {
      "blanked": "Question on duration: How long ___ you been waiting before the doors opened?",
      "answer": "had",
      "options": [
        "had",
        "have",
        "were",
        "did"
      ]
    },
    {
      "blanked": "Negative continuous: They ___ sleeping long when the alarm sounded.",
      "answer": "hadn't been",
      "options": [
        "hadn't been",
        "haven't been",
        "weren't being",
        "didn't be"
      ]
    }
  ],
  "243": [
    {
      "blanked": "Duration up to future point: By June, Leo will have ___ this boat for years.",
      "answer": "been sailing",
      "options": [
        "sailed been",
        "being sailed",
        "been sailing",
        "to sail"
      ]
    },
    {
      "blanked": "Future Perfect Continuous: At 4 PM, Maya ___ coding for seven hours.",
      "answer": "will have been",
      "options": [
        "has been",
        "was",
        "will have been",
        "is"
      ]
    },
    {
      "blanked": "Future duration milestone: By autumn, we ___ studying French for a decade.",
      "answer": "will have been",
      "options": [
        "will have been",
        "will be",
        "have been",
        "had been"
      ]
    },
    {
      "blanked": "Question form: Will she have been ___ at the hospital for two years?",
      "answer": "working",
      "options": [
        "working",
        "worked",
        "work",
        "works"
      ]
    },
    {
      "blanked": "Time marker next year: Next April, Dan will ___ been driving for twenty years.",
      "answer": "have",
      "options": [
        "have",
        "has",
        "had",
        "having"
      ]
    }
  ],
  "244": [
    {
      "blanked": "Regret right thing not done: Our flashlight died — we ___ packed batteries!",
      "answer": "should have",
      "options": [
        "must have",
        "should have",
        "can’t have",
        "might not"
      ]
    },
    {
      "blanked": "Criticism of missed past act: Tom ___ called before catching the ferry.",
      "answer": "should have",
      "options": [
        "should have",
        "should",
        "had to should",
        "ought"
      ]
    },
    {
      "blanked": "Personal regret: I failed the quiz; I should have ___ harder.",
      "answer": "studied",
      "options": [
        "studied",
        "study",
        "studying",
        "studies"
      ]
    },
    {
      "blanked": "Mild criticism: You should ___ your umbrella; look at the storm!",
      "answer": "have brought",
      "options": [
        "have brought",
        "brought",
        "had brought",
        "bring"
      ]
    },
    {
      "blanked": "Past regret question: Should they have ___ the landlord beforehand?",
      "answer": "notified",
      "options": [
        "notified",
        "notify",
        "notifying",
        "notifies"
      ]
    }
  ],
  "245": [
    {
      "blanked": "Regret past mistake: Look at my sunburn — I ___ napped on the beach!",
      "answer": "shouldn't have",
      "options": [
        "shouldn't have",
        "mustn't have",
        "needn't",
        "wouldn't"
      ]
    },
    {
      "blanked": "Past mistake: Wait, you ___ shared that confidential code.",
      "answer": "shouldn't have",
      "options": [
        "should have",
        "shouldn't have",
        "couldn't",
        "haven't to"
      ]
    },
    {
      "blanked": "Regret over spending: I shouldn't have ___ so much money on that gadget.",
      "answer": "spent",
      "options": [
        "spent",
        "spend",
        "spending",
        "spends"
      ]
    },
    {
      "blanked": "Criticism of action: You shouldn't ___ left the window open during the rain.",
      "answer": "have",
      "options": [
        "have",
        "had",
        "has",
        "having"
      ]
    },
    {
      "blanked": "Unwise choice: Mark ___ eaten the spicy chili right before sleeping.",
      "answer": "shouldn't have",
      "options": [
        "shouldn't have",
        "mustn't have",
        "doesn't have",
        "should have not"
      ]
    }
  ],
  "246": [
    {
      "blanked": "Unused past chance: Why didn’t you enter? You ___ won first ribbon!",
      "answer": "could have",
      "options": [
        "could have",
        "can have",
        "mustn’t have",
        "had to"
      ]
    },
    {
      "blanked": "Past capability unused: We ___ caught the tram, but we walked instead.",
      "answer": "could have",
      "options": [
        "could have",
        "shouldn’t",
        "might not",
        "can’t have"
      ]
    },
    {
      "blanked": "Danger avoided: Watch your step! You could have ___ into the ditch.",
      "answer": "fallen",
      "options": [
        "fallen",
        "fall",
        "fell",
        "falling"
      ]
    },
    {
      "blanked": "Unused option: Brian had savings, so he ___ bought a newer car.",
      "answer": "could have",
      "options": [
        "could have",
        "must have",
        "can have",
        "had to have"
      ]
    },
    {
      "blanked": "Missed opportunity: We could ___ visited the gallery, but it was closed.",
      "answer": "have",
      "options": [
        "have",
        "had",
        "has",
        "be"
      ]
    }
  ],
  "247": [
    {
      "blanked": "Strong logical past certainty: The lawn is soaked — it ___ rained overnight.",
      "answer": "must have",
      "options": [
        "should have",
        "must have",
        "can’t have",
        "needn’t have"
      ]
    },
    {
      "blanked": "Strong past deduction: Eva knew every line — she ___ rehearsed endlessly.",
      "answer": "must have",
      "options": [
        "must have",
        "could",
        "needn’t have",
        "shouldn’t have"
      ]
    },
    {
      "blanked": "Logical deduction: The lights are out; they must have ___ to bed.",
      "answer": "gone",
      "options": [
        "gone",
        "went",
        "go",
        "going"
      ]
    },
    {
      "blanked": "Past deduction: His phone is switched off; he must ___ boarded the plane.",
      "answer": "have",
      "options": [
        "have",
        "had",
        "has",
        "been"
      ]
    },
    {
      "blanked": "Certain conclusion: You ran twenty miles today — you ___ felt exhausted!",
      "answer": "must have",
      "options": [
        "must have",
        "should have",
        "can have",
        "might not"
      ]
    }
  ],
  "248": [
    {
      "blanked": "Past impossibility: You ___ seen Max in Rome — he’s been with me!",
      "answer": "can't have",
      "options": [
        "mustn't have",
        "can't have",
        "shouldn't have",
        "mayn't have"
      ]
    },
    {
      "blanked": "Impossible past event: Our kitten ___ opened that heavy iron latch!",
      "answer": "couldn't have",
      "options": [
        "couldn't have",
        "mustn't have",
        "shouldn't have",
        "would have"
      ]
    },
    {
      "blanked": "Impossibility in past: Clara ___ stolen the cake; she was in London.",
      "answer": "can't have",
      "options": [
        "can't have",
        "mustn't have",
        "shouldn't have",
        "doesn't have"
      ]
    },
    {
      "blanked": "Past deduction of impossibility: He couldn't have ___ the secret; nobody told him.",
      "answer": "known",
      "options": [
        "known",
        "knew",
        "know",
        "knowing"
      ]
    },
    {
      "blanked": "Impossible outcome: The baby ___ climbed that tall tree alone!",
      "answer": "couldn't have",
      "options": [
        "couldn't have",
        "mustn't have",
        "didn't have",
        "needn't have"
      ]
    }
  ],
  "249": [
    {
      "blanked": "Uncertain past guess: Where are the keys? Perhaps you ___ dropped them outside.",
      "answer": "might have",
      "options": [
        "mustn’t have",
        "might have",
        "couldn’t",
        "should"
      ]
    },
    {
      "blanked": "Past possibility: Someone ___ borrowed your ruler during math class.",
      "answer": "may have",
      "options": [
        "may have",
        "should",
        "needn’t have",
        "can’t"
      ]
    },
    {
      "blanked": "Uncertain guess: Paul isn't answering; he ___ fallen asleep on the couch.",
      "answer": "may have",
      "options": [
        "may have",
        "must to have",
        "should had",
        "can to have"
      ]
    },
    {
      "blanked": "Past uncertainty: They might have ___ the address down incorrectly.",
      "answer": "written",
      "options": [
        "written",
        "wrote",
        "write",
        "writing"
      ]
    },
    {
      "blanked": "Possibility negative: Lisa didn't call; she might ___ heard the news yet.",
      "answer": "not have",
      "options": [
        "not have",
        "have not",
        "didn't have",
        "had not"
      ]
    }
  ],
  "250": [
    {
      "blanked": "Did it needlessly: You ___ brought snacks — the hotel served a banquet!",
      "answer": "needn't have",
      "options": [
        "didn't need to have",
        "needn't have",
        "didn't must",
        "needn't"
      ]
    },
    {
      "blanked": "Unnecessary so skipped: Entry was free, so I ___ wait at the ticket booth.",
      "answer": "didn't need to",
      "options": [
        "needn't have",
        "didn't need to",
        "mustn't have",
        "needn't to"
      ]
    },
    {
      "blanked": "Did needlessly: The weather stayed dry, so we needn't have ___ our coats.",
      "answer": "carried",
      "options": [
        "carried",
        "carry",
        "carrying",
        "carries"
      ]
    },
    {
      "blanked": "Skipped past necessity: We had coupons, so we ___ pay the entrance fee.",
      "answer": "didn't need to",
      "options": [
        "didn't need to",
        "needn't have",
        "mustn't to",
        "hadn't to"
      ]
    },
    {
      "blanked": "Unnecessary effort done: You ___ ironed those socks — nobody sees them!",
      "answer": "needn't have",
      "options": [
        "needn't have",
        "didn't need",
        "hadn't need",
        "wouldn't need to"
      ]
    }
  ],
  "251": [
    {
      "blanked": "Third Conditional (unreal past): If we ___ left earlier, we would have boarded.",
      "answer": "had",
      "options": [
        "would have",
        "had",
        "have",
        "were"
      ]
    },
    {
      "blanked": "Third Conditional result: If Sue had checked the map, she ___ lost her way.",
      "answer": "wouldn't have",
      "options": [
        "won't have",
        "wouldn't have",
        "didn't",
        "hadn't"
      ]
    },
    {
      "blanked": "Third conditional main clause: If they had warned us, we ___ canceled the flight.",
      "answer": "would have",
      "options": [
        "would have",
        "will have",
        "had",
        "would"
      ]
    },
    {
      "blanked": "Third conditional negative if: If he ___ forgotten his passport, he wouldn't have been delayed.",
      "answer": "hadn't",
      "options": [
        "hadn't",
        "didn't",
        "wouldn't",
        "hasn't"
      ]
    },
    {
      "blanked": "Third conditional question: Would you have accepted the role if they ___ offered it?",
      "answer": "had",
      "options": [
        "had",
        "have",
        "would have",
        "did"
      ]
    }
  ],
  "252": [
    {
      "blanked": "Mixed Conditional (unreal past → present): If Bob had saved money, he ___ rich now.",
      "answer": "would be",
      "options": [
        "would have been",
        "will be",
        "would be",
        "was"
      ]
    },
    {
      "blanked": "Mixed Conditional: We wouldn’t feel lost now if we ___ bought a compass.",
      "answer": "had",
      "options": [
        "would have",
        "had",
        "were",
        "did"
      ]
    },
    {
      "blanked": "Past condition, present outcome: If they had won that championship, they ___ famous today.",
      "answer": "would be",
      "options": [
        "would be",
        "would have been",
        "will be",
        "are"
      ]
    },
    {
      "blanked": "Present state, past outcome: If she weren't so afraid of heights, she ___ climbed the tower yesterday.",
      "answer": "would have",
      "options": [
        "would have",
        "would",
        "will have",
        "had"
      ]
    },
    {
      "blanked": "Mixed conditional past condition: If you ___ listened to the guide, we would know where we are now.",
      "answer": "had",
      "options": [
        "had",
        "have",
        "would have",
        "did"
      ]
    }
  ],
  "253": [
    {
      "blanked": "Wish about the present: I wish our apartment ___ closer to the tram line.",
      "answer": "were",
      "options": [
        "is",
        "would be been",
        "were",
        "will be"
      ]
    },
    {
      "blanked": "Wish (+ Past Simple): Maya wishes she ___ speak Norwegian.",
      "answer": "could",
      "options": [
        "can",
        "will",
        "could",
        "has"
      ]
    },
    {
      "blanked": "Present regret: I wish I ___ play the violin like Arthur.",
      "answer": "could",
      "options": [
        "could",
        "can",
        "will",
        "would can"
      ]
    },
    {
      "blanked": "Present negative wish: Maya wishes she ___ have to commute two hours every day.",
      "answer": "didn't",
      "options": [
        "didn't",
        "doesn't",
        "won't",
        "not"
      ]
    },
    {
      "blanked": "Present wish with verb: We wish we ___ the answer to this riddle right now.",
      "answer": "knew",
      "options": [
        "knew",
        "know",
        "known",
        "are knowing"
      ]
    }
  ],
  "254": [
    {
      "blanked": "Regret past action: I wish I ___ worn waterproof boots on that marsh trail.",
      "answer": "had",
      "options": [
        "have",
        "would",
        "had",
        "did"
      ]
    },
    {
      "blanked": "Past wish (+ had + V3): Tom wishes he hadn’t ___ his old guitar.",
      "answer": "sold",
      "options": [
        "sell",
        "sold",
        "selling",
        "to sell"
      ]
    },
    {
      "blanked": "Past regret positive: I wish I had ___ my warm jacket yesterday.",
      "answer": "packed",
      "options": [
        "packed",
        "pack",
        "packing",
        "packs"
      ]
    },
    {
      "blanked": "Past regret negative: James wishes he ___ stayed out in the rain last night.",
      "answer": "hadn't",
      "options": [
        "hadn't",
        "didn't",
        "wouldn't",
        "hasn't"
      ]
    },
    {
      "blanked": "Past regret missed chance: They wish they ___ taken the earlier train.",
      "answer": "had",
      "options": [
        "had",
        "have",
        "would",
        "did"
      ]
    }
  ],
  "255": [
    {
      "blanked": "Annoyance wish (+ would V1): I wish those scooters ___ stop racing past!",
      "answer": "would",
      "options": [
        "will",
        "would",
        "did",
        "had"
      ]
    },
    {
      "blanked": "Change someone’s habit: I wish my roommate ___ wash his mugs.",
      "answer": "would",
      "options": [
        "would",
        "does",
        "has",
        "had"
      ]
    },
    {
      "blanked": "Annoyance at someone: I wish you ___ interrupt me while I'm presenting.",
      "answer": "wouldn't",
      "options": [
        "wouldn't",
        "didn't",
        "won't",
        "don't"
      ]
    },
    {
      "blanked": "Wish for action: The teacher wishes the students ___ pay attention.",
      "answer": "would",
      "options": [
        "would",
        "will",
        "did",
        "should"
      ]
    },
    {
      "blanked": "Annoyance at delay: I wish the delivery driver ___ arrive soon.",
      "answer": "would",
      "options": [
        "would",
        "could",
        "will",
        "might"
      ]
    }
  ],
  "256": [
    {
      "blanked": "Dramatic regret: ___ I had backed up those holiday photos earlier!",
      "answer": "If only",
      "options": [
        "If even",
        "Only when",
        "If only",
        "So that"
      ]
    },
    {
      "blanked": "Present strong wish: If only spring ___ already here!",
      "answer": "were",
      "options": [
        "is",
        "will be",
        "were",
        "has been"
      ]
    },
    {
      "blanked": "Dramatic present wish: If only I ___ fluent in Spanish right now!",
      "answer": "were",
      "options": [
        "were",
        "am",
        "will be",
        "have been"
      ]
    },
    {
      "blanked": "Dramatic past regret: If only they ___ followed the safety protocols!",
      "answer": "had",
      "options": [
        "had",
        "have",
        "would have",
        "did"
      ]
    },
    {
      "blanked": "Dramatic plea for weather: If only the storm ___ stop howling!",
      "answer": "would",
      "options": [
        "would",
        "will",
        "shall",
        "can"
      ]
    }
  ],
  "257": [
    {
      "blanked": "Prefer another person to act: I’d rather you ___ the spare key inside.",
      "answer": "kept",
      "options": [
        "keep",
        "will keep",
        "kept",
        "to keep"
      ]
    },
    {
      "blanked": "Negative other subject: Dad would rather we didn’t ___ late tonight.",
      "answer": "stay",
      "options": [
        "stayed",
        "stay",
        "to stay",
        "staying"
      ]
    },
    {
      "blanked": "Polite preference: I would rather you ___ the confidential files now.",
      "answer": "locked",
      "options": [
        "locked",
        "lock",
        "locking",
        "to lock"
      ]
    },
    {
      "blanked": "Negative preference: We would rather they ___ arrive unannounced.",
      "answer": "didn't",
      "options": [
        "didn't",
        "don't",
        "won't",
        "wouldn't"
      ]
    },
    {
      "blanked": "Preference with verb: Would your father rather you ___ home earlier?",
      "answer": "came",
      "options": [
        "came",
        "come",
        "comes",
        "will come"
      ]
    }
  ],
  "258": [
    {
      "blanked": "Unreal comparison: He talks as if he ___ the whole mountain range!",
      "answer": "owned",
      "options": [
        "owns",
        "owned",
        "will own",
        "is owning"
      ]
    },
    {
      "blanked": "Unreal \"as though\": Nina smiled as though nothing ___ wrong.",
      "answer": "were",
      "options": [
        "is",
        "will be",
        "has",
        "were"
      ]
    },
    {
      "blanked": "Unreal comparison present: She treats the puppy as if it ___ a human baby.",
      "answer": "were",
      "options": [
        "were",
        "is",
        "will be",
        "be"
      ]
    },
    {
      "blanked": "Unreal comparison manner: He talks about Paris as though he ___ lived there for decades.",
      "answer": "had",
      "options": [
        "had",
        "has",
        "would have",
        "is"
      ]
    },
    {
      "blanked": "Unreal behavior: Why does Brian act as if he ___ the entire building?",
      "answer": "owned",
      "options": [
        "owned",
        "owns",
        "owning",
        "to own"
      ]
    }
  ],
  "259": [
    {
      "blanked": "Precaution beforehand: Pack an extra sweater ___ the evening turns chilly.",
      "answer": "in case",
      "options": [
        "in case",
        "if only",
        "unless",
        "because of"
      ]
    },
    {
      "blanked": "Precaution: I jotted down the gate number in case my phone ___ dead.",
      "answer": "goes",
      "options": [
        "will go",
        "goes",
        "went would",
        "going"
      ]
    },
    {
      "blanked": "Precautionary backup: I wrote down his phone number ___ my phone died.",
      "answer": "in case",
      "options": [
        "in case",
        "if only",
        "unless",
        "even if"
      ]
    },
    {
      "blanked": "Conditional action: Press the red button ___ there is an emergency.",
      "answer": "if",
      "options": [
        "if",
        "in case",
        "due to",
        "because"
      ]
    },
    {
      "blanked": "Precaution with keys: Take a spare key ___ the door locks automatically.",
      "answer": "in case",
      "options": [
        "in case",
        "if",
        "unless",
        "whether"
      ]
    }
  ],
  "260": [
    {
      "blanked": "Imminent next seconds: Hurry onto the platform — the train ___ depart!",
      "answer": "is about to",
      "options": [
        "is about to",
        "has about to",
        "is point to",
        "was going"
      ]
    },
    {
      "blanked": "Be on the point of + V-ing: The curtain is on the point of ___.",
      "answer": "rising",
      "options": [
        "rise",
        "to rise",
        "rising",
        "rose"
      ]
    },
    {
      "blanked": "Imminent past event interrupted: I ___ leave the office when the phone rang.",
      "answer": "was about to",
      "options": [
        "was about to",
        "was on point to",
        "am about to",
        "had about to"
      ]
    },
    {
      "blanked": "On the point of + V-ing: The scientist was on the point of ___ a breakthrough.",
      "answer": "making",
      "options": [
        "making",
        "make",
        "to make",
        "made"
      ]
    },
    {
      "blanked": "Present imminent action: Quiet, everyone! The speaker ___ begin.",
      "answer": "is about to",
      "options": [
        "is about to",
        "is point of",
        "about to",
        "is about"
      ]
    }
  ],
  "261": [
    {
      "blanked": "Causative service (\"arranged it\"): We ___ our chimney swept yesterday.",
      "answer": "had",
      "options": [
        "made",
        "had",
        "were",
        "did"
      ]
    },
    {
      "blanked": "Causative pattern (get + obj + V3): Where did Leo get his boots ___?",
      "answer": "repaired",
      "options": [
        "repair",
        "repairing",
        "to repair",
        "repaired"
      ]
    },
    {
      "blanked": "Arranging service: We must have our roof ___ before winter.",
      "answer": "repaired",
      "options": [
        "repaired",
        "repair",
        "repairing",
        "repairs"
      ]
    },
    {
      "blanked": "Causative question: Where do you usually get your suits ___?",
      "answer": "dry-cleaned",
      "options": [
        "dry-cleaned",
        "dry-clean",
        "dry-cleaning",
        "to dry-clean"
      ]
    },
    {
      "blanked": "Past causative: Yesterday, Maria had her laptop ___ by an expert.",
      "answer": "checked",
      "options": [
        "checked",
        "check",
        "checking",
        "checks"
      ]
    }
  ],
  "262": [
    {
      "blanked": "Future from past view: Nobody guessed that quiet cafe ___ win an award.",
      "answer": "would",
      "options": [
        "will",
        "would",
        "is going",
        "has"
      ]
    },
    {
      "blanked": "Unfulfilled past plan: They ___ launch the kayak, until waves rose.",
      "answer": "were going to",
      "options": [
        "are going to",
        "will",
        "were going to",
        "had been"
      ]
    },
    {
      "blanked": "Past promise: He promised he ___ send the documents before noon.",
      "answer": "would",
      "options": [
        "would",
        "will",
        "shall",
        "is going to"
      ]
    },
    {
      "blanked": "Unfulfilled past plan: I ___ visit the library, but it started raining.",
      "answer": "was going to",
      "options": [
        "was going to",
        "am going to",
        "will go to",
        "have gone to"
      ]
    },
    {
      "blanked": "Past belief about future: They believed the project ___ succeed.",
      "answer": "would",
      "options": [
        "would",
        "will",
        "is to",
        "can"
      ]
    }
  ],
  "263": [
    {
      "blanked": "Still true general fact: Our teacher explained that whales ___ mammals.",
      "answer": "are",
      "options": [
        "had been",
        "were being",
        "are",
        "would be"
      ]
    },
    {
      "blanked": "Immediate report: Wait — Mia just said she ___ busy right now.",
      "answer": "is",
      "options": [
        "was had",
        "is",
        "had been",
        "would"
      ]
    },
    {
      "blanked": "Scientific law: Our geography teacher told us that the Earth ___ the Sun.",
      "answer": "orbits",
      "options": [
        "orbits",
        "orbited",
        "was orbiting",
        "had orbited"
      ]
    },
    {
      "blanked": "Still true fact: Mark said he ___ vegetarian, so he doesn't eat meat.",
      "answer": "is",
      "options": [
        "is",
        "was",
        "had been",
        "would be"
      ]
    },
    {
      "blanked": "Reporting with present says: Chloe says she ___ her new apartment very much.",
      "answer": "loves",
      "options": [
        "loves",
        "loved",
        "had loved",
        "was loving"
      ]
    }
  ],
  "264": [
    {
      "blanked": "Backshift (am → was): He mentioned that he ___ waiting in the lobby.",
      "answer": "was",
      "options": [
        "is",
        "has been",
        "was",
        "will be"
      ]
    },
    {
      "blanked": "Backshift (will → would): Sara told us she ___ bring extra chairs.",
      "answer": "would",
      "options": [
        "will",
        "can",
        "would",
        "shall"
      ]
    },
    {
      "blanked": "Backshift past to past perfect: 'I lost my keys.' → Sam said he ___ his keys.",
      "answer": "had lost",
      "options": [
        "had lost",
        "lost",
        "has lost",
        "would lose"
      ]
    },
    {
      "blanked": "Backshift present continuous: 'I am cooking.' → Ella said she ___ dinner.",
      "answer": "was cooking",
      "options": [
        "was cooking",
        "is cooking",
        "cooked",
        "has been cooking"
      ]
    },
    {
      "blanked": "Backshift modal can: 'I can drive.' → Rick mentioned that he ___ drive.",
      "answer": "could",
      "options": [
        "could",
        "can",
        "would can",
        "could have"
      ]
    }
  ],
  "265": [
    {
      "blanked": "Embedded question (SVO order): Can you tell me where ___?",
      "answer": "the exit is",
      "options": [
        "is the exit",
        "does the exit is",
        "the exit is",
        "was exit"
      ]
    },
    {
      "blanked": "Indirect question (no did): I wonder why Sam ___ early.",
      "answer": "left",
      "options": [
        "did leave",
        "left",
        "did left",
        "had leave"
      ]
    },
    {
      "blanked": "Embedded question word order: Do you know where Arthur ___?",
      "answer": "works",
      "options": [
        "works",
        "does work",
        "is he working",
        "does he work"
      ]
    },
    {
      "blanked": "Polite indirect inquiry: Could you tell me how much this camera ___?",
      "answer": "costs",
      "options": [
        "costs",
        "does cost",
        "does it cost",
        "is costing"
      ]
    },
    {
      "blanked": "Wonder clause word order: I wonder why the flight ___ delayed.",
      "answer": "was",
      "options": [
        "was",
        "was it",
        "did it be",
        "has it"
      ]
    }
  ],
  "266": [
    {
      "blanked": "Report Yes/No question: Grandma asked ___ the soup needed salt.",
      "answer": "whether",
      "options": [
        "what",
        "whether",
        "did",
        "that if"
      ]
    },
    {
      "blanked": "Indirect Yes/No (+ SVO): Could you check if ___?",
      "answer": "the library opened",
      "options": [
        "did the library open",
        "opened the library",
        "the library opened",
        "was open library"
      ]
    },
    {
      "blanked": "Yes/No indirect clause: The receptionist asked ___ we needed extra towels.",
      "answer": "if",
      "options": [
        "if",
        "that",
        "what",
        "did"
      ]
    },
    {
      "blanked": "Choice with whether: I am not sure ___ the museum is open on Mondays.",
      "answer": "whether",
      "options": [
        "whether",
        "that",
        "which",
        "what"
      ]
    },
    {
      "blanked": "Normal order after if: He asked if they ___ arrived yet.",
      "answer": "had",
      "options": [
        "had",
        "did have",
        "have they",
        "had they"
      ]
    }
  ],
  "267": [
    {
      "blanked": "\"One of + plural\" takes singular verb: One of the lanterns ___ flickering.",
      "answer": "is",
      "options": [
        "are",
        "were",
        "is",
        "have been"
      ]
    },
    {
      "blanked": "Head subject is \"One\": One of his short stories ___ won two medals.",
      "answer": "has",
      "options": [
        "have",
        "has",
        "are",
        "were"
      ]
    },
    {
      "blanked": "Subject agreement with one of: One of my close friends ___ in Toronto.",
      "answer": "lives",
      "options": [
        "lives",
        "live",
        "are living",
        "have lived"
      ]
    },
    {
      "blanked": "Singular verb for one of: One of the windows ___ left unlocked overnight.",
      "answer": "was",
      "options": [
        "was",
        "were",
        "are",
        "have been"
      ]
    },
    {
      "blanked": "Possessive verb with one of: One of these dictionaries ___ to Professor Evans.",
      "answer": "belongs",
      "options": [
        "belongs",
        "belong",
        "are belonging",
        "have belonged"
      ]
    }
  ],
  "268": [
    {
      "blanked": "\"The number of\" = single count: The number of cyclists ___ steadily rising.",
      "answer": "is",
      "options": [
        "are",
        "is",
        "were",
        "have"
      ]
    },
    {
      "blanked": "\"A number of\" = several: A number of old oaks ___ damaged in storms.",
      "answer": "were",
      "options": [
        "was",
        "were",
        "is",
        "has been"
      ]
    },
    {
      "blanked": "Singular with the number: The number of smartphone users ___ rising every month.",
      "answer": "is",
      "options": [
        "is",
        "are",
        "were",
        "have been"
      ]
    },
    {
      "blanked": "Plural with a number: A number of volunteers ___ gathered in the hall.",
      "answer": "have",
      "options": [
        "have",
        "has",
        "is",
        "was"
      ]
    },
    {
      "blanked": "Count as subject: The number of complaints ___ remarkably low last month.",
      "answer": "was",
      "options": [
        "was",
        "were",
        "are",
        "have been"
      ]
    }
  ],
  "269": [
    {
      "blanked": "\"Each\" + singular verb: Each hiker ___ carrying an emergency whistle.",
      "answer": "is",
      "options": [
        "are",
        "is",
        "were",
        "have"
      ]
    },
    {
      "blanked": "\"Several\" + plural verb: Several rare beetles ___ spotted near dusk.",
      "answer": "were",
      "options": [
        "was",
        "is",
        "were",
        "has been"
      ]
    },
    {
      "blanked": "Singular verb with each: Each candidate ___ an interview with the panel.",
      "answer": "has",
      "options": [
        "has",
        "have",
        "are having",
        "having"
      ]
    },
    {
      "blanked": "Plural verb with both: Both brothers ___ excellent at playing chess.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "was",
        "has been"
      ]
    },
    {
      "blanked": "Singular noun after every: Every ___ in the gallery had a distinct style.",
      "answer": "painting",
      "options": [
        "painting",
        "paintings",
        "painting's",
        "of painting"
      ]
    }
  ],
  "270": [
    {
      "blanked": "\"The + adj\" for group (plural): The elderly ___ free bus rides here.",
      "answer": "receive",
      "options": [
        "receives",
        "receive",
        "is receiving",
        "has received"
      ]
    },
    {
      "blanked": "Plural verb agreement: The homeless often ___ warm winter shelters.",
      "answer": "need",
      "options": [
        "needs",
        "is needing",
        "need",
        "was needing"
      ]
    },
    {
      "blanked": "Plural verb with group: The brave ___ not shrink from difficult challenges.",
      "answer": "do",
      "options": [
        "do",
        "does",
        "is",
        "has"
      ]
    },
    {
      "blanked": "Social group agreement: The unemployed ___ supported by government benefits.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "was",
        "has been"
      ]
    },
    {
      "blanked": "Collective group meaning: In this clinic, the sick ___ treated free of charge.",
      "answer": "are",
      "options": [
        "are",
        "is",
        "was",
        "has been"
      ]
    }
  ],
  "271": [
    {
      "blanked": "Negative inversion: Never ___ witnessed such brilliant northern lights!",
      "answer": "have I",
      "options": [
        "I have",
        "have I",
        "did I have",
        "I had"
      ]
    },
    {
      "blanked": "Negative opening: Rarely ___ such calm weather arrive in November.",
      "answer": "does",
      "options": [
        "is",
        "does",
        "was",
        "has did"
      ]
    },
    {
      "blanked": "Inversion after Never: Never ___ I heard such an inspiring symphony.",
      "answer": "have",
      "options": [
        "have",
        "did",
        "I have",
        "had I"
      ]
    },
    {
      "blanked": "Inversion after Rarely: Rarely ___ the professor arrive late to class.",
      "answer": "does",
      "options": [
        "does",
        "is",
        "he does",
        "did he"
      ]
    },
    {
      "blanked": "Inversion after Little: Little ___ they suspect that a surprise was waiting.",
      "answer": "did",
      "options": [
        "did",
        "do",
        "had",
        "would"
      ]
    }
  ],
  "272": [
    {
      "blanked": "Pair \"Hardly ... when\": Hardly had we stepped indoors ___ thunder crashed.",
      "answer": "when",
      "options": [
        "than",
        "when",
        "while",
        "then"
      ]
    },
    {
      "blanked": "Pair \"No sooner ... than\": No sooner had Eva landed ___ she called home.",
      "answer": "than",
      "options": [
        "when",
        "than",
        "that",
        "then"
      ]
    },
    {
      "blanked": "Inversion with No sooner: No sooner ___ we finished dinner than the power went out.",
      "answer": "had",
      "options": [
        "had",
        "did",
        "have",
        "were"
      ]
    },
    {
      "blanked": "Correlative with Hardly: Hardly had the train stopped ___ passengers rushed to the doors.",
      "answer": "when",
      "options": [
        "when",
        "than",
        "then",
        "as"
      ]
    },
    {
      "blanked": "Inversion structure: Scarcely ___ she touched the piano when applause broke out.",
      "answer": "had",
      "options": [
        "had",
        "did",
        "was",
        "has"
      ]
    }
  ],
  "273": [
    {
      "blanked": "Inversion in main clause: Only after reading the note ___ grasp the clue.",
      "answer": "did they",
      "options": [
        "they did",
        "did they",
        "they",
        "had they to"
      ]
    },
    {
      "blanked": "Only then + inversion: Only then ___ realize how close dawn was.",
      "answer": "did we",
      "options": [
        "we did",
        "did we",
        "were we",
        "we have"
      ]
    },
    {
      "blanked": "Inversion in main clause: Only when the lights came on ___ we see the mess.",
      "answer": "did",
      "options": [
        "did",
        "do",
        "were",
        "had"
      ]
    },
    {
      "blanked": "Inversion after Only later: Only later ___ the true cost become apparent.",
      "answer": "did",
      "options": [
        "did",
        "was",
        "has",
        "had"
      ]
    },
    {
      "blanked": "Inversion after Only after: Only after speaking to the doctor ___ she feel reassured.",
      "answer": "did",
      "options": [
        "did",
        "was",
        "has",
        "could"
      ]
    }
  ],
  "274": [
    {
      "blanked": "Inverted 3rd Conditional (omit \"if\"): ___ we packed ropes, we’d have climbed.",
      "answer": "Had",
      "options": [
        "If had",
        "Had",
        "Have",
        "Were"
      ]
    },
    {
      "blanked": "Inverted 2nd Conditional: ___ she here today, she would laugh aloud.",
      "answer": "Were",
      "options": [
        "Was",
        "If were",
        "Were",
        "Would"
      ]
    },
    {
      "blanked": "Inverted second conditional: ___ he more patient, he would be a great mentor.",
      "answer": "Were",
      "options": [
        "Were",
        "Was",
        "If were",
        "Had"
      ]
    },
    {
      "blanked": "Inverted third conditional: ___ they informed us sooner, we would have adjusted the schedule.",
      "answer": "Had",
      "options": [
        "Had",
        "Have",
        "Were",
        "Should"
      ]
    },
    {
      "blanked": "Formal polite condition: ___ you have any further questions, please contact our support team.",
      "answer": "Should",
      "options": [
        "Should",
        "Had",
        "Were",
        "Would"
      ]
    }
  ],
  "275": [
    {
      "blanked": "Noun after \"Here/There\": Look up — there ___ the afternoon express!",
      "answer": "goes",
      "options": [
        "it goes",
        "goes",
        "going",
        "to go"
      ]
    },
    {
      "blanked": "Pronoun keeps order: Ah, look by the corner — here ___ comes!",
      "answer": "it",
      "options": [
        "comes it",
        "it",
        "does it",
        "is it"
      ]
    },
    {
      "blanked": "Noun subject after here: Listen! Here ___ the mail carrier.",
      "answer": "comes",
      "options": [
        "comes",
        "he comes",
        "come",
        "coming"
      ]
    },
    {
      "blanked": "Pronoun subject with there: Look over by the gate — there ___ go!",
      "answer": "they",
      "options": [
        "they",
        "go they",
        "are they",
        "do they"
      ]
    },
    {
      "blanked": "Noun subject after there: Watch out! There ___ the last taxi!",
      "answer": "goes",
      "options": [
        "goes",
        "it goes",
        "go",
        "going"
      ]
    }
  ],
  "276": [
    {
      "blanked": "Formal Subjunctive (+ base V1): The judge insisted that he ___ on time.",
      "answer": "appear",
      "options": [
        "appears",
        "appeared",
        "appear",
        "appearing"
      ]
    },
    {
      "blanked": "Subjunctive \"be\": Coaches recommended that every diver ___ rested.",
      "answer": "be",
      "options": [
        "is",
        "was",
        "be",
        "are"
      ]
    },
    {
      "blanked": "Subjunctive with demand: The manager demanded that he ___ the missing funds.",
      "answer": "return",
      "options": [
        "return",
        "returns",
        "returned",
        "returning"
      ]
    },
    {
      "blanked": "Subjunctive with suggest: We suggest that she ___ an independent financial advisor.",
      "answer": "consult",
      "options": [
        "consult",
        "consults",
        "consulted",
        "will consult"
      ]
    },
    {
      "blanked": "Passive subjunctive: The regulations require that all helmets ___ tested for safety.",
      "answer": "be",
      "options": [
        "be",
        "are",
        "were",
        "to be"
      ]
    }
  ],
  "277": [
    {
      "blanked": "Mandative adjective + bare V1: It is vital that the bridge ___ inspected.",
      "answer": "be",
      "options": [
        "is",
        "be",
        "being",
        "was"
      ]
    },
    {
      "blanked": "Essential that + V1: It is essential that Nora ___ that envelope today.",
      "answer": "sign",
      "options": [
        "signs",
        "signed",
        "to sign",
        "sign"
      ]
    },
    {
      "blanked": "Subjunctive after imperative: It is imperative that he ___ the agreement today.",
      "answer": "sign",
      "options": [
        "sign",
        "signs",
        "signed",
        "will sign"
      ]
    },
    {
      "blanked": "Subjunctive after crucial: It is crucial that she ___ informed of any schedule changes.",
      "answer": "be",
      "options": [
        "be",
        "is",
        "was",
        "will be"
      ]
    },
    {
      "blanked": "Subjunctive after important: It is important that every student ___ the safety rules.",
      "answer": "understand",
      "options": [
        "understand",
        "understands",
        "understood",
        "understanding"
      ]
    }
  ],
  "278": [
    {
      "blanked": "Emphatic \"do/did\" for contrast: Honestly, I ___ enjoy opera, though rarely.",
      "answer": "do",
      "options": [
        "am",
        "do",
        "have",
        "was"
      ]
    },
    {
      "blanked": "Past emphasis: Calm down — she ___ lock the safe before leaving!",
      "answer": "did",
      "options": [
        "was",
        "has",
        "did",
        "does"
      ]
    },
    {
      "blanked": "Emphatic does: He rarely talks about his hobby, but he ___ love painting.",
      "answer": "does",
      "options": [
        "does",
        "do",
        "did",
        "is"
      ]
    },
    {
      "blanked": "Emphatic do in polite assertion: I ___ hope you will join us for dinner tonight.",
      "answer": "do",
      "options": [
        "do",
        "did",
        "does",
        "am"
      ]
    },
    {
      "blanked": "Emphatic did in defense: Don't worry, Mom — I ___ wash the dishes before leaving!",
      "answer": "did",
      "options": [
        "did",
        "do",
        "have",
        "was"
      ]
    }
  ],
  "279": [
    {
      "blanked": "It-cleft spotlight: It was Tom ___ spotted the tiny owl first.",
      "answer": "who",
      "options": [
        "which",
        "who",
        "what",
        "whom"
      ]
    },
    {
      "blanked": "It-cleft object: It is patience ___ solves tricky chess puzzles.",
      "answer": "that",
      "options": [
        "who",
        "that",
        "what",
        "where"
      ]
    },
    {
      "blanked": "Thing focus with cleft: It was a sudden phone call ___ interrupted our meeting.",
      "answer": "that",
      "options": [
        "that",
        "who",
        "whom",
        "where"
      ]
    },
    {
      "blanked": "Person focus with cleft: It was Dr. Watson ___ solved the mystery.",
      "answer": "who",
      "options": [
        "who",
        "which",
        "whose",
        "what"
      ]
    },
    {
      "blanked": "Time focus with cleft: It was in 1969 ___ astronauts first walked on the Moon.",
      "answer": "that",
      "options": [
        "that",
        "which",
        "where",
        "who"
      ]
    }
  ],
  "280": [
    {
      "blanked": "What-cleft focus: ___ we desperately need right now is a hot thermos.",
      "answer": "What",
      "options": [
        "That",
        "Which",
        "What",
        "It"
      ]
    },
    {
      "blanked": "What-cleft: What surprised our guide ___ the calm blue glacier.",
      "answer": "was",
      "options": [
        "were",
        "did",
        "was",
        "are"
      ]
    },
    {
      "blanked": "Present what-cleft: What I admire most about him ___ his endless patience.",
      "answer": "is",
      "options": [
        "is",
        "are",
        "were",
        "being"
      ]
    },
    {
      "blanked": "Past what-cleft: What baffled the detectives ___ the lack of any footprints.",
      "answer": "was",
      "options": [
        "was",
        "were",
        "are",
        "been"
      ]
    },
    {
      "blanked": "What-cleft opening: ___ annoys me most is people talking during films.",
      "answer": "What",
      "options": [
        "What",
        "That",
        "Which",
        "It"
      ]
    }
  ],
  "281": [
    {
      "blanked": "Proportional parallel: The higher we climbed, ___ fresher the wind blew.",
      "answer": "the",
      "options": [
        "than",
        "more",
        "the",
        "as"
      ]
    },
    {
      "blanked": "The more..., the...: The ___ you sketch, the sharper your eye grows.",
      "answer": "more",
      "options": [
        "most",
        "more",
        "much",
        "many"
      ]
    },
    {
      "blanked": "Proportional change: The harder you work on this problem, the ___ it becomes.",
      "answer": "easier",
      "options": [
        "easier",
        "easy",
        "more easy",
        "easiest"
      ]
    },
    {
      "blanked": "Double comparative with the: The more questions you ask, ___ more you learn.",
      "answer": "the",
      "options": [
        "the",
        "a",
        "an",
        "that"
      ]
    },
    {
      "blanked": "Comparative with adjective: The warmer the weather, the ___ the beaches become.",
      "answer": "more crowded",
      "options": [
        "more crowded",
        "crowded",
        "most crowded",
        "as crowded"
      ]
    }
  ],
  "282": [
    {
      "blanked": "Shared subject required: Walking across the bridge, ___ saw three seals.",
      "answer": "we",
      "options": [
        "three seals were",
        "our camera saw",
        "we",
        "the river showed"
      ]
    },
    {
      "blanked": "Participle subject match: ___ from exhaustion, the climber rested.",
      "answer": "Tired",
      "options": [
        "Tiring",
        "Tired",
        "Having tire",
        "To tire"
      ]
    },
    {
      "blanked": "Perfect participle sharing subject: Having packed all the boxes, ___ sat down to rest.",
      "answer": "we",
      "options": [
        "we",
        "the room",
        "it",
        "our break"
      ]
    },
    {
      "blanked": "Present participle clause: Running down the stairs, ___ dropped my wallet.",
      "answer": "I",
      "options": [
        "I",
        "my wallet",
        "the floor",
        "there"
      ]
    },
    {
      "blanked": "Passive participle clause: Exhausted by the long trek, ___ fell asleep immediately.",
      "answer": "the hikers",
      "options": [
        "the hikers",
        "the tent",
        "the trail",
        "their backpacks"
      ]
    }
  ],
  "283": [
    {
      "blanked": "Result with \"so + adj + that\": The fog grew ___ thick that ships halted.",
      "answer": "so",
      "options": [
        "such",
        "too",
        "so",
        "such a"
      ]
    },
    {
      "blanked": "Result with noun phrase: It was ___ a breezy day that kites soared!",
      "answer": "such",
      "options": [
        "so",
        "such",
        "very",
        "enough"
      ]
    },
    {
      "blanked": "So + adverb + that: The soprano sang ___ beautifully that the audience wept.",
      "answer": "so",
      "options": [
        "so",
        "such",
        "too",
        "very"
      ]
    },
    {
      "blanked": "Such + plural noun: They had ___ interesting books that I stayed for hours.",
      "answer": "such",
      "options": [
        "such",
        "so",
        "such a",
        "as"
      ]
    },
    {
      "blanked": "Such an + vowel: It was ___ unexpected outcome that everyone was stunned.",
      "answer": "such an",
      "options": [
        "such an",
        "so an",
        "such a",
        "so"
      ]
    }
  ],
  "284": [
    {
      "blanked": "Positive opinion echo: Will ferries run by noon? — I ___!",
      "answer": "hope so",
      "options": [
        "hope yes",
        "hope it",
        "hope so",
        "so hope"
      ]
    },
    {
      "blanked": "Negative opinion echo: Could snow delay our flight? — I hope ___!",
      "answer": "not",
      "options": [
        "no",
        "not",
        "don't",
        "never"
      ]
    },
    {
      "blanked": "Negative opinion with think: Are they going to lose the match? — I don't ___.",
      "answer": "think so",
      "options": [
        "think so",
        "think not",
        "hope so",
        "suppose not"
      ]
    },
    {
      "blanked": "Agreement with suppose: Are we meeting at six o'clock? — I ___.",
      "answer": "suppose so",
      "options": [
        "suppose so",
        "suppose it",
        "suppose yes",
        "think it"
      ]
    },
    {
      "blanked": "Positive hope echo: Will the weather stay sunny tomorrow? — I ___.",
      "answer": "hope so",
      "options": [
        "hope so",
        "hope it",
        "hope that",
        "hope yes"
      ]
    }
  ],
  "285": [
    {
      "blanked": "Suffix \"-er / -or\" (doer): Someone who translates books is a ___.",
      "answer": "translator",
      "options": [
        "translating",
        "translator",
        "translateful",
        "translateless"
      ]
    },
    {
      "blanked": "Device suffix: A kitchen tool that mixes batter quickly is a ___.",
      "answer": "mixer",
      "options": [
        "mixness",
        "mixer",
        "mixable",
        "mixment"
      ]
    },
    {
      "blanked": "Suffix -or for profession: The hospital hired a skilled surgical ___.",
      "answer": "operator",
      "options": [
        "operator",
        "operater",
        "operation",
        "operatist"
      ]
    },
    {
      "blanked": "Suffix -er for person: My brother is an experienced mountain ___.",
      "answer": "climber",
      "options": [
        "climber",
        "climbor",
        "climbing",
        "climbist"
      ]
    },
    {
      "blanked": "Suffix -or for device: Use this scientific ___ to solve the equations.",
      "answer": "calculator",
      "options": [
        "calculator",
        "calculater",
        "calculating",
        "calculist"
      ]
    }
  ],
  "286": [
    {
      "blanked": "Suffix \"-ness\" (y → i): The opposite of sadness or gloom is ___.",
      "answer": "happiness",
      "options": [
        "happyness",
        "happiment",
        "happiness",
        "happyity"
      ]
    },
    {
      "blanked": "Quality noun: Thick winter ___ settled softly over the alley.",
      "answer": "darkness",
      "options": [
        "darkment",
        "darkness",
        "darkity",
        "darkful"
      ]
    },
    {
      "blanked": "Suffix -ness for illness: She couldn't attend school because of a sudden ___.",
      "answer": "illness",
      "options": [
        "illness",
        "illment",
        "illity",
        "illtion"
      ]
    },
    {
      "blanked": "Suffix -ness with y -> i: His chronic ___ made it difficult to wake up early.",
      "answer": "laziness",
      "options": [
        "laziness",
        "lazyness",
        "laziment",
        "lazity"
      ]
    },
    {
      "blanked": "Abstract noun with -ness: The nurse treated the frightened child with incredible ___.",
      "answer": "gentleness",
      "options": [
        "gentleness",
        "gentlehood",
        "gentlement",
        "gentlity"
      ]
    }
  ],
  "287": [
    {
      "blanked": "Suffix \"-ment\": Reaching mutual terms on a plan creates an ___.",
      "answer": "agreement",
      "options": [
        "agreeance",
        "agreeness",
        "agreement",
        "agreeity"
      ]
    },
    {
      "blanked": "Action noun: City builders announced a major park ___.",
      "answer": "improvement",
      "options": [
        "improveness",
        "improvement",
        "improvity",
        "improvation"
      ]
    },
    {
      "blanked": "Suffix -ment for state: Children shivered with ___ before opening their gifts.",
      "answer": "excitement",
      "options": [
        "excitement",
        "exciting",
        "exciteness",
        "excitity"
      ]
    },
    {
      "blanked": "Suffix -ment for result: The city opened new centers to boost local ___.",
      "answer": "employment",
      "options": [
        "employment",
        "employness",
        "employance",
        "employation"
      ]
    },
    {
      "blanked": "Suffix -ment for entertainment: The circus provided joyful ___ for the whole family.",
      "answer": "entertainment",
      "options": [
        "entertainment",
        "entertaining",
        "entertainness",
        "entertainance"
      ]
    }
  ],
  "288": [
    {
      "blanked": "Suffix \"-tion / -sion\": Making a clear choice after weighing options is a ___.",
      "answer": "decision",
      "options": [
        "decidement",
        "decideness",
        "decision",
        "decideful"
      ]
    },
    {
      "blanked": "Concept noun: Clean solar power lowers air ___.",
      "answer": "pollution",
      "options": [
        "pollutement",
        "pollution",
        "polluteless",
        "pollutity"
      ]
    },
    {
      "blanked": "Suffix -tion for action noun: Strict environmental laws ensure the ___ of wild animals.",
      "answer": "protection",
      "options": [
        "protection",
        "protectment",
        "protectness",
        "protectance"
      ]
    },
    {
      "blanked": "Suffix -sion from verb: At the end of the essay, write a clear ___.",
      "answer": "conclusion",
      "options": [
        "conclusion",
        "concludement",
        "concludity",
        "concluseness"
      ]
    },
    {
      "blanked": "Suffix -tion for concept: Solar panels boost clean energy ___.",
      "answer": "production",
      "options": [
        "production",
        "productment",
        "productness",
        "productance"
      ]
    }
  ],
  "289": [
    {
      "blanked": "Suffix \"-ity\": Checking facts carefully confirms their high ___.",
      "answer": "reliability",
      "options": [
        "reliableness",
        "reliability",
        "reliablity",
        "reliablement"
      ]
    },
    {
      "blanked": "State noun: Fresh artists bring endless creative ___.",
      "answer": "ability",
      "options": [
        "ableness",
        "ablement",
        "ability",
        "ableful"
      ]
    },
    {
      "blanked": "Suffix -ity for state: The airport increased ___ checks after midnight.",
      "answer": "security",
      "options": [
        "security",
        "secureness",
        "securation",
        "securance"
      ]
    },
    {
      "blanked": "Suffix -ity from -ible: Yoga exercises improve muscle ___.",
      "answer": "flexibility",
      "options": [
        "flexibility",
        "flexibleness",
        "flexiblance",
        "flexiblion"
      ]
    },
    {
      "blanked": "Suffix -ity from equal: The constitution guarantees legal ___ for all citizens.",
      "answer": "equality",
      "options": [
        "equality",
        "equalness",
        "equalment",
        "equalance"
      ]
    }
  ],
  "290": [
    {
      "blanked": "Adjective suffixes (-ful / -less): A sleepy ___ driver risks accidents.",
      "answer": "careless",
      "options": [
        "careful",
        "careless",
        "carefully",
        "careness"
      ]
    },
    {
      "blanked": "Full of wonder: Every guide told ___ stories around the campfire.",
      "answer": "wonderful",
      "options": [
        "wonderless",
        "wonderful",
        "wonderness",
        "wonderly"
      ]
    },
    {
      "blanked": "Without pain: The dentist gave an injection that made the procedure ___.",
      "answer": "painless",
      "options": [
        "painless",
        "painful",
        "painness",
        "painly"
      ]
    },
    {
      "blanked": "Full of harm: Smoking carries many ___ effects on respiratory health.",
      "answer": "harmful",
      "options": [
        "harmful",
        "harmless",
        "harmness",
        "harmfully"
      ]
    },
    {
      "blanked": "Without fear: The ___ firefighter entered the burning building to save the cat.",
      "answer": "fearless",
      "options": [
        "fearless",
        "fearful",
        "fearness",
        "fearfully"
      ]
    }
  ],
  "291": [
    {
      "blanked": "\"Can be done\" suffix: Mountain spring water here is completely ___.",
      "answer": "drinkable",
      "options": [
        "drinkless",
        "drinkable",
        "drinkness",
        "drinkment"
      ]
    },
    {
      "blanked": "Can be read clearly: Her crisp handwriting is always easily ___.",
      "answer": "readable",
      "options": [
        "readable",
        "readless",
        "readful",
        "readness"
      ]
    },
    {
      "blanked": "Suffix -able from wash: This wool blanket is machine ___ in cold water.",
      "answer": "washable",
      "options": [
        "washable",
        "washible",
        "washive",
        "washous"
      ]
    },
    {
      "blanked": "Suffix -able from accept: Such rude behavior is not ___ in a library.",
      "answer": "acceptable",
      "options": [
        "acceptable",
        "acceptible",
        "acceptive",
        "acceptous"
      ]
    },
    {
      "blanked": "Suffix -ible: Can you believe that? The magician's trick was truly ___.",
      "answer": "incredible",
      "options": [
        "incredible",
        "incredable",
        "incredive",
        "incredal"
      ]
    }
  ],
  "292": [
    {
      "blanked": "Adjective suffixes (-ous / -ive / -al): Bears can act very ___ of cubs.",
      "answer": "protective",
      "options": [
        "protectous",
        "protective",
        "protectal",
        "protectness"
      ]
    },
    {
      "blanked": "Famous/natural pattern: Wait near the ___ waterfall at sunset.",
      "answer": "famous",
      "options": [
        "fameful",
        "famous",
        "famive",
        "famement"
      ]
    },
    {
      "blanked": "Suffix -ous from poison: Some wild mushrooms are highly ___ to humans.",
      "answer": "poisonous",
      "options": [
        "poisonous",
        "poisonive",
        "poisonal",
        "poisonic"
      ]
    },
    {
      "blanked": "Suffix -ive from effect: Regular exercise is an ___ way to reduce stress.",
      "answer": "effective",
      "options": [
        "effective",
        "effectous",
        "effectal",
        "effecting"
      ]
    },
    {
      "blanked": "Suffix -al from nation: The museum displays treasures of ___ importance.",
      "answer": "national",
      "options": [
        "national",
        "nationous",
        "nationive",
        "nationly"
      ]
    }
  ],
  "293": [
    {
      "blanked": "Verb suffix \"-ize / -ify / -en\": Please ___ this knotted rope!",
      "answer": "loosen",
      "options": [
        "loosify",
        "loosen",
        "loosize",
        "looseness"
      ]
    },
    {
      "blanked": "Verb \"to make clearer\": Clear charts always ___ tough physics ideas.",
      "answer": "simplify",
      "options": [
        "simplize",
        "simplen",
        "simplify",
        "simpleness"
      ]
    },
    {
      "blanked": "Suffix -ize for standard: We need to ___ our safety procedures across branches.",
      "answer": "standardize",
      "options": [
        "standardize",
        "standardify",
        "standarden",
        "standardate"
      ]
    },
    {
      "blanked": "Suffix -en from sharp: Use this whetstone to ___ the kitchen knife.",
      "answer": "sharpen",
      "options": [
        "sharpen",
        "sharpize",
        "sharpify",
        "sharpate"
      ]
    },
    {
      "blanked": "Suffix -ify from pure: These charcoal filters ___ tap water effectively.",
      "answer": "purify",
      "options": [
        "purify",
        "purize",
        "pureen",
        "purate"
      ]
    }
  ],
  "294": [
    {
      "blanked": "Undo action prefix: Turn the brass key gently to ___ the trunk.",
      "answer": "unlock",
      "options": [
        "inlock",
        "dislock",
        "unlock",
        "mislock"
      ]
    },
    {
      "blanked": "Reverse adjective: Wet boots made our long walk quite ___.",
      "answer": "unpleasant",
      "options": [
        "inpleasant",
        "displeasant",
        "unpleasant",
        "impleasant"
      ]
    },
    {
      "blanked": "Reversing action with un-: The knot was so tight I could not ___ it.",
      "answer": "untie",
      "options": [
        "untie",
        "distie",
        "mistie",
        "intie"
      ]
    },
    {
      "blanked": "Negative adjective with un-: Treating workers unequally is completely ___.",
      "answer": "unfair",
      "options": [
        "unfair",
        "disfair",
        "misfair",
        "infair"
      ]
    },
    {
      "blanked": "Negative adjective for weather: A chilly wind made the walk quite ___.",
      "answer": "unpleasant",
      "options": [
        "unpleasant",
        "displeasant",
        "mispleasant",
        "inpleasant"
      ]
    }
  ],
  "295": [
    {
      "blanked": "Assimilated negative before \"p/m\": Climbing sheer ice bare-handed is ___.",
      "answer": "impossible",
      "options": [
        "inpossible",
        "impossible",
        "ilpossible",
        "irpossible"
      ]
    },
    {
      "blanked": "Before \"r\": Leaving campfire coals glowing is totally ___.",
      "answer": "irresponsible",
      "options": [
        "inresponsible",
        "imresponsible",
        "ilresponsible",
        "irresponsible"
      ]
    },
    {
      "blanked": "Assimilation ir- before r: Leaving a campfire unattended is ___.",
      "answer": "irresponsible",
      "options": [
        "irresponsible",
        "inresponsible",
        "imresponsible",
        "ilresponsible"
      ]
    },
    {
      "blanked": "Assimilation im- before p: Waiting in long queues makes him ___.",
      "answer": "impatient",
      "options": [
        "impatient",
        "inpatient",
        "ilpatient",
        "irpatient"
      ]
    },
    {
      "blanked": "Assimilation il- before l: His bizarre argument was completely ___.",
      "answer": "illogical",
      "options": [
        "illogical",
        "inlogical",
        "imlogical",
        "irlogical"
      ]
    }
  ],
  "296": [
    {
      "blanked": "Prefix \"dis-\": Clouds parted, and the thick mist suddenly ___.",
      "answer": "disappeared",
      "options": [
        "unappeared",
        "misappeared",
        "disappeared",
        "inappeared"
      ]
    },
    {
      "blanked": "Reverse quality: Even close friends sometimes ___ on movie picks.",
      "answer": "disagree",
      "options": [
        "unagree",
        "disagree",
        "misagree",
        "inagree"
      ]
    },
    {
      "blanked": "Prefix dis- with verb: Before cleaning the blender, ___ the power cord.",
      "answer": "disconnect",
      "options": [
        "disconnect",
        "unconnect",
        "misconnect",
        "inconnect"
      ]
    },
    {
      "blanked": "Prefix dis- with obey: Soldiers who ___ direct orders face severe penalties.",
      "answer": "disobey",
      "options": [
        "disobey",
        "unobey",
        "misobey",
        "inobey"
      ]
    },
    {
      "blanked": "Prefix dis- noun: Consumers expressed deep ___ with the faulty product.",
      "answer": "dissatisfaction",
      "options": [
        "dissatisfaction",
        "unsatisfaction",
        "missatisfaction",
        "insatisfaction"
      ]
    }
  ],
  "297": [
    {
      "blanked": "Prefix \"mis-\" (\"wrongly\"): Hurrying makes students ___ simple nouns.",
      "answer": "misspell",
      "options": [
        "unspell",
        "disspell",
        "misspell",
        "respell"
      ]
    },
    {
      "blanked": "Wrongly judge/read: Don’t ___ his quiet tone as anger.",
      "answer": "misread",
      "options": [
        "disread",
        "misread",
        "unread",
        "preread"
      ]
    },
    {
      "blanked": "Wrongly lead: Dishonest advertisements often ___ gullible consumers.",
      "answer": "mislead",
      "options": [
        "mislead",
        "dislead",
        "unlead",
        "outlead"
      ]
    },
    {
      "blanked": "Wrongly judge: Be careful not to ___ a person based purely on appearance.",
      "answer": "misjudge",
      "options": [
        "misjudge",
        "disjudge",
        "unjudge",
        "injudge"
      ]
    },
    {
      "blanked": "Wrongly inform: The false blog post served only to ___ the public.",
      "answer": "misinform",
      "options": [
        "misinform",
        "disinform",
        "uninform",
        "deinform"
      ]
    }
  ],
  "298": [
    {
      "blanked": "\"Again\" vs \"Before\": Battery hit 5% — I need to ___ my flashlight.",
      "answer": "recharge",
      "options": [
        "precharge",
        "discharge",
        "recharge",
        "mischarge"
      ]
    },
    {
      "blanked": "\"Ahead of time\": Watch a short ___ before Friday’s film opens.",
      "answer": "preview",
      "options": [
        "review",
        "preview",
        "misview",
        "unview"
      ]
    },
    {
      "blanked": "Prefix re- (do again): The town had to ___ the historic bridge after the flood.",
      "answer": "rebuild",
      "options": [
        "rebuild",
        "prebuild",
        "unbuild",
        "misbuild"
      ]
    },
    {
      "blanked": "Prefix pre- (pay in advance): Hotel guests can ___ their parking fees online.",
      "answer": "prepay",
      "options": [
        "prepay",
        "repay",
        "mispay",
        "dispay"
      ]
    },
    {
      "blanked": "Prefix re- (open again): The museum will ___ to visitors next Tuesday.",
      "answer": "reopen",
      "options": [
        "reopen",
        "preopen",
        "misopen",
        "deopen"
      ]
    }
  ],
  "299": [
    {
      "blanked": "\"Too much\" vs \"Too little\": Water boiling away means you ___ the pot.",
      "answer": "overcooked",
      "options": [
        "undercooked",
        "overcooked",
        "miscooked",
        "precooked"
      ]
    },
    {
      "blanked": "\"Not enough\": Cheap flights often fail because airlines ___ seats.",
      "answer": "underprice",
      "options": [
        "overprice",
        "underprice",
        "misprice",
        "preprice"
      ]
    },
    {
      "blanked": "Excessive price: Tourists complained that souvenirs in the center were ___.",
      "answer": "overpriced",
      "options": [
        "overpriced",
        "underpriced",
        "mispriced",
        "dispriced"
      ]
    },
    {
      "blanked": "Insufficient staffing: The emergency clinic was chaotic because it was ___.",
      "answer": "understaffed",
      "options": [
        "understaffed",
        "overstaffed",
        "unstaffed",
        "misstaffed"
      ]
    },
    {
      "blanked": "Excessive crowd: In rush hour, metro platforms become dangerously ___.",
      "answer": "overcrowded",
      "options": [
        "overcrowded",
        "undercrowded",
        "uncrowded",
        "miscrowded"
      ]
    }
  ],
  "300": [
    {
      "blanked": "Idiomatic phrasal verb: Please ___ the lamp before heading to bed.",
      "answer": "turn off",
      "options": [
        "turn under",
        "turn off",
        "turn among",
        "turn beside"
      ]
    },
    {
      "blanked": "Phrasal meaning (\"find word\"): Can you ___ this rare herb online?",
      "answer": "look up",
      "options": [
        "look on",
        "look up",
        "look over there",
        "look down"
      ]
    },
    {
      "blanked": "Postpone an event: Never ___ until tomorrow what you can do today.",
      "answer": "put off",
      "options": [
        "put off",
        "put in",
        "put on",
        "put up"
      ]
    },
    {
      "blanked": "Reject an offer: She decided to ___ the lucrative job offer in London.",
      "answer": "turn down",
      "options": [
        "turn down",
        "turn over",
        "turn off",
        "turn into"
      ]
    },
    {
      "blanked": "Cancel an event: Due to heavy fog, the airline had to ___ the afternoon flight.",
      "answer": "call off",
      "options": [
        "call off",
        "call in",
        "call on",
        "call up"
      ]
    }
  ],
  "301": [
    {
      "blanked": "Pronoun MUST go in middle: That towel fell — please ___.",
      "answer": "pick it up",
      "options": [
        "pick up it",
        "pick it up",
        "it pick up",
        "up pick it"
      ]
    },
    {
      "blanked": "Separable phrasal + pronoun: Great jacket! Try ___.",
      "answer": "it on",
      "options": [
        "on it",
        "it on",
        "itself on",
        "on them"
      ]
    },
    {
      "blanked": "Pronoun inside verb: That old battery is dead; please throw ___.",
      "answer": "it away",
      "options": [
        "it away",
        "away it",
        "it out to",
        "away to it"
      ]
    },
    {
      "blanked": "Pronoun object: Those sneakers look great — why don't you try ___?",
      "answer": "them on",
      "options": [
        "them on",
        "on them",
        "they on",
        "on they"
      ]
    },
    {
      "blanked": "Pronoun with person: The baby is sleeping peacefully, so don't wake ___.",
      "answer": "her up",
      "options": [
        "her up",
        "up her",
        "she up",
        "up she"
      ]
    }
  ],
  "302": [
    {
      "blanked": "Noun object middle or end: Don’t forget to ___ before boarding.",
      "answer": "fill out the form",
      "options": [
        "out fill the form",
        "fill the form of out",
        "fill out the form",
        "the form fill out"
      ]
    },
    {
      "blanked": "Both valid with nouns: Mia helped ___ the heavy lanterns.",
      "answer": "hang up",
      "options": [
        "hang on up",
        "hang up",
        "up hang",
        "hanging of"
      ]
    },
    {
      "blanked": "Noun object position: She decided to turn ___ the radio before sleeping.",
      "answer": "off",
      "options": [
        "off",
        "out of",
        "away from",
        "up with"
      ]
    },
    {
      "blanked": "Noun in middle: Can you drop the children ___ at school this morning?",
      "answer": "off",
      "options": [
        "off",
        "up",
        "in",
        "to"
      ]
    },
    {
      "blanked": "Separable particle: Did you give the borrowed books ___ to the librarian?",
      "answer": "back",
      "options": [
        "back",
        "up",
        "away of",
        "into"
      ]
    }
  ],
  "303": [
    {
      "blanked": "Inseparable (keep together): Did anyone ___ the missing compass?",
      "answer": "look for it",
      "options": [
        "look it for",
        "look for it",
        "for look it",
        "it look for"
      ]
    },
    {
      "blanked": "Inseparable: Grandma is resting; can you ___ her today?",
      "answer": "look after",
      "options": [
        "look she after",
        "look after",
        "after look",
        "look at after"
      ]
    },
    {
      "blanked": "Inseparable with pronoun: I searched the library and came across ___ by chance.",
      "answer": "it",
      "options": [
        "it",
        "it across",
        "across to it",
        "up it"
      ]
    },
    {
      "blanked": "Inseparable verb particle: Who will look ___ the sick puppy while we work?",
      "answer": "after",
      "options": [
        "after",
        "up to",
        "away",
        "for of"
      ]
    },
    {
      "blanked": "Inseparable with person: While walking in the park, I ran ___ an old classmate.",
      "answer": "into",
      "options": [
        "into",
        "onto",
        "in to",
        "inside"
      ]
    }
  ],
  "304": [
    {
      "blanked": "Three-word phrasal verb: Our campsite has ___ fresh drinking water!",
      "answer": "run out of",
      "options": [
        "run it out of",
        "run out of",
        "run of out",
        "ran out from"
      ]
    },
    {
      "blanked": "Always inseparable: Nobody should ___ constant street noise.",
      "answer": "put up with",
      "options": [
        "put with it up",
        "put up it with",
        "put up with",
        "put up of"
      ]
    },
    {
      "blanked": "Three-word phrasal: Doctors advise patients to cut down ___ sweet snacks.",
      "answer": "on",
      "options": [
        "on",
        "with",
        "at",
        "for"
      ]
    },
    {
      "blanked": "Three-word particle: We are traveling tomorrow and must catch up ___ our schedule.",
      "answer": "with",
      "options": [
        "with",
        "to",
        "on",
        "for"
      ]
    },
    {
      "blanked": "Three-word meaning: The garage mechanic advised us to get rid ___ that old rust.",
      "answer": "of",
      "options": [
        "of",
        "from",
        "off",
        "with"
      ]
    }
  ],
  "305": [
    {
      "blanked": "Actual job/role (\"as\"): Mia worked ___ a tour guide in Rome.",
      "answer": "as",
      "options": [
        "like",
        "as",
        "such",
        "same"
      ]
    },
    {
      "blanked": "Similar to (\"like\"): Wow, this sparkling juice tastes ___ melon!",
      "answer": "like",
      "options": [
        "as",
        "like",
        "how",
        "so"
      ]
    },
    {
      "blanked": "Comparison with noun: Simon sings ___ an opera star.",
      "answer": "like",
      "options": [
        "like",
        "as",
        "as if",
        "same"
      ]
    },
    {
      "blanked": "Actual profession/role: He was hired ___ the new regional sales manager.",
      "answer": "as",
      "options": [
        "as",
        "like",
        "such",
        "how"
      ]
    },
    {
      "blanked": "Introducing a clause: ___ you all know, tomorrow is a public holiday.",
      "answer": "As",
      "options": [
        "As",
        "Like",
        "Such as",
        "Alike"
      ]
    }
  ],
  "306": [
    {
      "blanked": "Concrete examples in list: Citrus fruits, ___ lemons and limes, pack vitamin C.",
      "answer": "such as",
      "options": [
        "such",
        "as well",
        "such as",
        "for example as"
      ]
    },
    {
      "blanked": "Informal examples: Board games ___ chess and checkers sharpen focus.",
      "answer": "like",
      "options": [
        "as",
        "like",
        "such",
        "what"
      ]
    },
    {
      "blanked": "Examples of instruments: Acoustic instruments ___ the guitar and cello produce warm tones.",
      "answer": "such as",
      "options": [
        "such as",
        "as like",
        "such like",
        "so as"
      ]
    },
    {
      "blanked": "Healthy diet examples: Eat plenty of green vegetables ___ spinach and broccoli.",
      "answer": "such as",
      "options": [
        "such as",
        "as",
        "so",
        "as well"
      ]
    },
    {
      "blanked": "Informal comparison: People ___ you make community projects successful.",
      "answer": "like",
      "options": [
        "like",
        "such as to",
        "as of",
        "same"
      ]
    }
  ],
  "307": [
    {
      "blanked": "Preposition phrase (no verb): Ferries halted ___ thick ice.",
      "answer": "because of",
      "options": [
        "because",
        "although",
        "because of",
        "since that"
      ]
    },
    {
      "blanked": "Full clause (S + V): We brought umbrellas ___ storms were forecast.",
      "answer": "because",
      "options": [
        "because of",
        "due to",
        "because",
        "despite"
      ]
    },
    {
      "blanked": "Clause with subject and verb: She passed the bar exam ___ she studied diligently.",
      "answer": "because",
      "options": [
        "because",
        "because of",
        "due to",
        "owing"
      ]
    },
    {
      "blanked": "Preposition with noun: The soccer match was postponed ___ the blizzard.",
      "answer": "due to",
      "options": [
        "due to",
        "because",
        "since that",
        "as for"
      ]
    },
    {
      "blanked": "Noun object: We arrived late at the theater ___ heavy downtown traffic.",
      "answer": "because of",
      "options": [
        "because of",
        "because",
        "due",
        "owing that"
      ]
    }
  ],
  "308": [
    {
      "blanked": "\"Belonging to it\" (no apostrophe): Every swan preens ___ snowy feathers.",
      "answer": "its",
      "options": [
        "it's",
        "its",
        "its'",
        "it is"
      ]
    },
    {
      "blanked": "\"It is / It has\": Check your watch — ___ almost six o’clock.",
      "answer": "it's",
      "options": [
        "its",
        "it's",
        "its'",
        "it be"
      ]
    },
    {
      "blanked": "Contraction it is: Look out the window — ___ starting to snow!",
      "answer": "it's",
      "options": [
        "it's",
        "its",
        "its'",
        "it"
      ]
    },
    {
      "blanked": "Possessive adjective its: The puppy wagged ___ tail happily when I arrived.",
      "answer": "its",
      "options": [
        "its",
        "it's",
        "its'",
        "it is"
      ]
    },
    {
      "blanked": "Possessive attribute: Every computer system has ___ own set of strengths.",
      "answer": "its",
      "options": [
        "its",
        "it's",
        "its'",
        "it"
      ]
    }
  ],
  "309": [
    {
      "blanked": "Contracted \"they are\": Look outside — ___ setting up festival tents!",
      "answer": "they're",
      "options": [
        "their",
        "there",
        "they're",
        "theirs"
      ]
    },
    {
      "blanked": "Possessive \"your\": Remember to label ___ checked suitcase.",
      "answer": "your",
      "options": [
        "you're",
        "yours",
        "your",
        "you are"
      ]
    },
    {
      "blanked": "You're vs your: Make sure ___ ready before ___ bus arrives.",
      "answer": "you're / your",
      "options": [
        "you're / your",
        "your / you're",
        "your / your",
        "you're / you're"
      ]
    },
    {
      "blanked": "Possessive whose: I found a black coat, but I don't know ___ it is.",
      "answer": "whose",
      "options": [
        "whose",
        "who's",
        "who is",
        "who"
      ]
    },
    {
      "blanked": "Homophone they're: Look across the street — ___ opening a new bakery!",
      "answer": "they're",
      "options": [
        "they're",
        "their",
        "there",
        "theirs"
      ]
    }
  ],
  "310": [
    {
      "blanked": "Create/prepare: Grandma always ___ pancakes on snowy mornings.",
      "answer": "makes",
      "options": [
        "does",
        "makes",
        "works",
        "brings"
      ]
    },
    {
      "blanked": "Chores/tasks: Who will ___ the dishes after dinner tonight?",
      "answer": "do",
      "options": [
        "make",
        "create",
        "do",
        "build"
      ]
    },
    {
      "blanked": "Collocation with decision: Take your time before you ___ an important decision.",
      "answer": "make",
      "options": [
        "make",
        "do",
        "create",
        "act"
      ]
    },
    {
      "blanked": "Collocation with laundry: Can you help me ___ the laundry this afternoon?",
      "answer": "do",
      "options": [
        "do",
        "make",
        "create",
        "take"
      ]
    },
    {
      "blanked": "Collocation with mistake: Everyone can ___ a mistake when learning a new language.",
      "answer": "make",
      "options": [
        "make",
        "do",
        "build",
        "cause"
      ]
    }
  ],
  "311": [
    {
      "blanked": "One more + singular: This tea is wonderful — may I have ___ cup?",
      "answer": "another",
      "options": [
        "other",
        "others",
        "another",
        "the others"
      ]
    },
    {
      "blanked": "Plural indefinite: Some birds migrate south; ___ insects hibernate.",
      "answer": "other",
      "options": [
        "another",
        "other",
        "others",
        "an other"
      ]
    },
    {
      "blanked": "Other + plural noun: Are there any ___ questions before we finish the lecture?",
      "answer": "other",
      "options": [
        "other",
        "another",
        "the others",
        "others"
      ]
    },
    {
      "blanked": "Another + singular noun: He was given ___ opportunity to prove his skill.",
      "answer": "another",
      "options": [
        "another",
        "other",
        "others",
        "the other"
      ]
    },
    {
      "blanked": "The other of a pair: One twin loves science, while ___ prefers art.",
      "answer": "the other",
      "options": [
        "the other",
        "another",
        "other",
        "others"
      ]
    }
  ],
  "312": [
    {
      "blanked": "Individual focus (\"each of\"): ___ our four canoes needs a spare paddle.",
      "answer": "Each of",
      "options": [
        "Every",
        "Every of",
        "Each of",
        "All single"
      ]
    },
    {
      "blanked": "General group (3+): Wait, check ___ window upstairs before leaving.",
      "answer": "every",
      "options": [
        "every of",
        "every",
        "both",
        "few"
      ]
    },
    {
      "blanked": "Two sides: There is a decorative badge on ___ side of the collar.",
      "answer": "each",
      "options": [
        "each",
        "every",
        "all",
        "both of"
      ]
    },
    {
      "blanked": "General group regular recurrence: The bus departs ___ fifteen minutes.",
      "answer": "every",
      "options": [
        "every",
        "each",
        "either",
        "any"
      ]
    },
    {
      "blanked": "Each of + pronoun: The manager gave a gift to ___ of us.",
      "answer": "each",
      "options": [
        "each",
        "every",
        "all of",
        "whole"
      ]
    }
  ],
  "313": [
    {
      "blanked": "Unexpectedly early: Wait, have they ___ finished painting the fence?",
      "answer": "already",
      "options": [
        "still",
        "yet",
        "already",
        "anymore"
      ]
    },
    {
      "blanked": "Continuing situation: Grandma ___ tends roses at age eighty-six.",
      "answer": "still",
      "options": [
        "anymore",
        "yet",
        "still",
        "already"
      ]
    },
    {
      "blanked": "Early completion: Has the bell rung ___? It's only half past two!",
      "answer": "already",
      "options": [
        "already",
        "still",
        "yet",
        "anymore"
      ]
    },
    {
      "blanked": "Negative with anymore: My grandfather doesn't drive at night ___.",
      "answer": "anymore",
      "options": [
        "anymore",
        "still",
        "already",
        "longer"
      ]
    },
    {
      "blanked": "Continuation before verb: Despite the rain, the children ___ wanted to play outside.",
      "answer": "still",
      "options": [
        "still",
        "already",
        "yet",
        "anymore"
      ]
    }
  ],
  "314": [
    {
      "blanked": "With great effort: All athletes trained ___ before finals.",
      "answer": "hard",
      "options": [
        "hardly",
        "hard",
        "hardest than",
        "almost not"
      ]
    },
    {
      "blanked": "\"Almost not at all\": The fog is thick — I can ___ see the road!",
      "answer": "hardly",
      "options": [
        "hard",
        "hardly",
        "harder",
        "very hard"
      ]
    },
    {
      "blanked": "Almost impossible to hear: The microphone was weak; I could ___ hear the speaker.",
      "answer": "hardly",
      "options": [
        "hardly",
        "hard",
        "hardly not",
        "hardest"
      ]
    },
    {
      "blanked": "Effort adverb: Athletes must train ___ every day to win an Olympic medal.",
      "answer": "hard",
      "options": [
        "hard",
        "hardly",
        "hardlily",
        "hardness"
      ]
    },
    {
      "blanked": "Negative frequency: He is very busy and ___ ever goes to the cinema.",
      "answer": "hardly",
      "options": [
        "hardly",
        "hard",
        "bare",
        "rare"
      ]
    }
  ],
  "315": [
    {
      "blanked": "\"Recently\" (+ Present Perfect): Have you visited the harbor ___?",
      "answer": "lately",
      "options": [
        "late",
        "lately",
        "later",
        "latest"
      ]
    },
    {
      "blanked": "Behind schedule: Sorry I’m ten minutes ___ — the drawbridge opened!",
      "answer": "late",
      "options": [
        "lately",
        "late",
        "latter",
        "latest"
      ]
    },
    {
      "blanked": "Behind schedule: Don't stay up ___ before an important exam tomorrow.",
      "answer": "late",
      "options": [
        "late",
        "lately",
        "latest",
        "lateness"
      ]
    },
    {
      "blanked": "Recently with present perfect: We haven't heard from our cousins ___.",
      "answer": "lately",
      "options": [
        "lately",
        "late",
        "later",
        "latest"
      ]
    },
    {
      "blanked": "Time adverb: Why did you turn up so ___ for the rehearsal?",
      "answer": "late",
      "options": [
        "late",
        "lately",
        "laten",
        "lateness"
      ]
    }
  ],
  "316": [
    {
      "blanked": "Flat adverb (never \"fastly\"): That greyhound sprints amazingly ___.",
      "answer": "fast",
      "options": [
        "fastly",
        "fast",
        "fasterly",
        "more fastly"
      ]
    },
    {
      "blanked": "No \"-ly\" needed: If we set off ___, we’ll catch calm seas.",
      "answer": "early",
      "options": [
        "earlily",
        "early",
        "earlyly",
        "more early"
      ]
    },
    {
      "blanked": "Flat adverb straight: Go ___ ahead until you reach the central traffic light.",
      "answer": "straight",
      "options": [
        "straight",
        "straightly",
        "straightened",
        "straightness"
      ]
    },
    {
      "blanked": "Flat adverb fast: She typed so ___ that nobody could follow her fingers.",
      "answer": "fast",
      "options": [
        "fast",
        "fastly",
        "fasterly",
        "fastestly"
      ]
    },
    {
      "blanked": "Flat adverb high: Eagles can soar amazingly ___ in the sky.",
      "answer": "high",
      "options": [
        "high",
        "highly",
        "highness",
        "highlily"
      ]
    }
  ],
  "317": [
    {
      "blanked": "Adjective before noun: She gave me ___ advice about packing.",
      "answer": "good",
      "options": [
        "well",
        "good",
        "goodly",
        "wellly"
      ]
    },
    {
      "blanked": "Adverb modifying verb: Both violinists play together very ___.",
      "answer": "well",
      "options": [
        "good",
        "goodly",
        "well",
        "bestly"
      ]
    },
    {
      "blanked": "Adverb modifying verb: Our team played ___ in the championship final.",
      "answer": "well",
      "options": [
        "well",
        "good",
        "goodly",
        "wellness"
      ]
    },
    {
      "blanked": "Linking verb with good: Your new blue jacket looks very ___ on you.",
      "answer": "good",
      "options": [
        "good",
        "well",
        "goodly",
        "nicely"
      ]
    },
    {
      "blanked": "Adjective for health: After three days in bed, Tim finally feels ___.",
      "answer": "well",
      "options": [
        "well",
        "goodly",
        "finely",
        "wellness"
      ]
    }
  ],
  "318": [
    {
      "blanked": "\"Wait for\" vs \"expect\": Look at those clouds — I ___ rain soon.",
      "answer": "expect",
      "options": [
        "wait",
        "expect",
        "wait for",
        "hope for"
      ]
    },
    {
      "blanked": "\"Hope\": We ___ our cousins arrive safely before nightfall.",
      "answer": "hope",
      "options": [
        "wait for",
        "hope",
        "expect to waiting",
        "look"
      ]
    },
    {
      "blanked": "Desire positive outcome: I ___ it doesn't rain during our picnic tomorrow.",
      "answer": "hope",
      "options": [
        "hope",
        "expect",
        "wait",
        "wait for"
      ]
    },
    {
      "blanked": "Anticipate arrival: The hotel managers ___ fifty new guests this evening.",
      "answer": "expect",
      "options": [
        "expect",
        "wait",
        "wait for",
        "hope to"
      ]
    },
    {
      "blanked": "Physical waiting at location: Sit here while you ___ the doctor to call your name.",
      "answer": "wait for",
      "options": [
        "wait for",
        "expect",
        "hope",
        "anticipate for"
      ]
    }
  ],
  "319": [
    {
      "blanked": "Help someone else recall: Please ___ Grandpa to take his medicine.",
      "answer": "remind",
      "options": [
        "remember",
        "remind",
        "recall",
        "memorize"
      ]
    },
    {
      "blanked": "Recall by yourself: Do you still ___ our first camping song?",
      "answer": "remember",
      "options": [
        "remind",
        "remember",
        "forget me",
        "warn"
      ]
    },
    {
      "blanked": "Help someone remember: Can you ___ me to lock the back door tonight?",
      "answer": "remind",
      "options": [
        "remind",
        "remember",
        "recall",
        "memorize"
      ]
    },
    {
      "blanked": "Resemblance (reminds of): You ___ me of your uncle when he was young.",
      "answer": "remind",
      "options": [
        "remind",
        "remember",
        "recollect",
        "memorize"
      ]
    },
    {
      "blanked": "Personal recall: I distinctly ___ putting my car keys on this table.",
      "answer": "remember",
      "options": [
        "remember",
        "remind",
        "remind of",
        "recalling"
      ]
    }
  ],
  "320": [
    {
      "blanked": "Spend foolishly: Never ___ battery power streaming blank videos.",
      "answer": "waste",
      "options": [
        "lose",
        "miss",
        "waste",
        "drop"
      ]
    },
    {
      "blanked": "Fail to catch: Run fast, or you will ___ the airport shuttle!",
      "answer": "miss",
      "options": [
        "lose",
        "waste",
        "miss",
        "fail"
      ]
    },
    {
      "blanked": "Misplace an item: Be careful not to ___ your hotel room card.",
      "answer": "lose",
      "options": [
        "lose",
        "miss",
        "waste",
        "drop off"
      ]
    },
    {
      "blanked": "Feel sadness away from: When I travel abroad, I always ___ my family.",
      "answer": "miss",
      "options": [
        "miss",
        "lose",
        "waste",
        "lack"
      ]
    },
    {
      "blanked": "Spend money pointlessly: Don't ___ your hard-earned money on lottery tickets.",
      "answer": "waste",
      "options": [
        "waste",
        "lose",
        "miss",
        "fail"
      ]
    }
  ]
};

module.exports = { TENSE_QUIZ_DEF, MICRO_RULE_QUIZ_DEF };
