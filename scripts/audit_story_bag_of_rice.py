import json
import re

STORY_TEXT = """
Long, long ago there lived, in Japan a brave warrior known to all as Tawara Toda, or “My Lord Bag of Rice.” His true name was Fujiwara Hidesato, and there is a very interesting story of how he came to change his name.
One day he sallied forth in search of adventures, for he had the nature of a warrior and could not bear to be idle. So he buckled on his two swords, took his huge bow, much taller than himself, in his hand, and slinging his quiver on his back started out. He had not gone far when he came to the bridge of Seta-no-Karashi spanning one end of the beautiful Lake Biwa. No sooner had he set foot on the bridge than he saw lying right across his path a huge serpent-dragon. Its body was so big that it looked like the trunk of a large pine tree and it took up the whole width of the bridge. One of its huge claws rested on the parapet of one side of the bridge, while its tail lay right against the other. The monster seemed to be asleep, and as it breathed, fire and smoke came out of its nostrils.
At first Hidesato could not help feeling alarmed at the sight of this horrible reptile lying in his path, for he must either turn back or walk right over its body. He was a brave man, however, and putting aside all fear went forward dauntlessly. Crunch, crunch! he stepped now on the dragon’s body, now between its coils, and without even one glance backward he went on his way.
He had only gone a few steps when he heard some one calling him from behind. On turning back he was much surprised to see that the monster dragon had entirely disappeared and in its place was a strange-looking man, who was bowing most ceremoniously to the ground. His red hair streamed over his shoulders and was surmounted by a crown in the shape of a dragon’s head, and his sea-green dress was patterned with shells. Hidesato knew at once that this was no ordinary mortal and he wondered much at the strange occurrence. Where had the dragon gone in such a short space of time? Or had it transformed itself into this man, and what did the whole thing mean? While these thoughts passed through his mind he had come up to the man on the bridge and now addressed him:
“Was it you that called me just now?”
“Yes, it was I,” answered the man: “I have an earnest request to make to you. Do you think you can grant it to me?”
“If it is in my power to do so I will,” answered Hidesato, “but first tell me who you are?”
“I am the Dragon King of the Lake, and my home is in these waters just under this bridge.”
“And what is it you have to ask of me!” said Hidesato.
“I want you to kill my mortal enemy the centipede, who lives on the mountain beyond,” and the Dragon King pointed to a high peak on the opposite shore of the lake.
“I have lived now for many years in this lake and I have a large family of children and grand-children. For some time past we have lived in terror, for a monster centipede has discovered our home, and night after night it comes and carries off one of my family. I am powerless to save them. If it goes on much longer like this, not only shall I lose all my children, but I myself must fall a victim to the monster. I am, therefore, very unhappy, and in my extremity I determined to ask the help of a human being. For many days with this intention I have waited on the bridge in the shape of the horrible serpent-dragon that you saw, in the hope that some strong brave man would come along. But all who came this way, as soon as they saw me were terrified and ran away as fast as they could. You are the first man I have found able to look at me without fear, so I knew at once that you were a man of great courage. I beg you to have pity upon me. Will you not help me and kill my enemy the centipede?”
Hidesato felt very sorry for the Dragon King on hearing his story, and readily promised to do what he could to help him. The warrior asked where the centipede lived, so that he might attack the creature at once. The Dragon King replied that its home was on the mountain Mikami, but that as it came every night at a certain hour to the palace of the lake, it would be better to wait till then. So Hidesato was conducted to the palace of the Dragon King, under the bridge. Strange to say, as he followed his host downwards the waters parted to let them pass, and his clothes did not even feel damp as he passed through the flood. Never had Hidesato seen anything so beautiful as this palace built of white marble beneath the lake. He had often heard of the Sea King’s palace at the bottom of the sea, where all the servants and retainers were salt-water fishes, but here was a magnificent building in the heart of Lake Biwa. The dainty goldfishes, red carp, and silvery trout, waited upon the Dragon King and his guest.
Hidesato was astonished at the feast that was spread for him. The dishes were crystallized lotus leaves and flowers, and the chopsticks were of the rarest ebony. As soon as they sat down, the sliding doors opened and ten lovely goldfish dancers came out, and behind them followed ten red-carp musicians with the koto and the samisen. Thus the hours flew by till midnight, and the beautiful music and dancing had banished all thoughts of the centipede. The Dragon King was about to pledge the warrior in a fresh cup of wine when the palace was suddenly shaken by a tramp, tramp! as if a mighty army had begun to march not far away.
Hidesato and his host both rose to their feet and rushed to the balcony, and the warrior saw on the opposite mountain two great balls of glowing fire coming nearer and nearer. The Dragon King stood by the warrior’s side trembling with fear.
“The centipede! The centipede! Those two balls of fire are its eyes. It is coming for its prey! Now is the time to kill it.”
Hidesato looked where his host pointed, and, in the dim light of the starlit evening, behind the two balls of fire he saw the long body of an enormous centipede winding round the mountains, and the light in its hundred feet glowed like so many distant lanterns moving slowly towards the shore.
Hidesato showed not the least sign of fear. He tried to calm the Dragon King.
“Don’t be afraid. I shall surely kill the centipede. Just bring me my bow and arrows.”
The Dragon King did as he was bid, and the warrior noticed that he had only three arrows left in his quiver. He took the bow, and fitting an arrow to the notch, took careful aim and let fly.
The arrow hit the centipede right in the middle of its head, but instead of penetrating, it glanced off harmless and fell to the ground.
Nothing daunted, Hidesato took another arrow, fitted it to the notch of the bow and let fly. Again the arrow hit the mark, it struck the centipede right in the middle of its head, only to glance off and fall to the ground. The centipede was invulnerable to weapons! When the Dragon King saw that even this brave warrior’s arrows were powerless to kill the centipede, he lost heart and began to tremble with fear.
The warrior saw that he had now only one arrow left in his quiver, and if this one failed he could not kill the centipede. He looked across the waters. The huge reptile had wound its horrid body seven times round the mountain and would soon come down to the lake. Nearer and nearer gleamed fireballs of eyes, and the light of its hundred feet began to throw reflections in the still waters of the lake.
Then suddenly the warrior remembered that he had heard that human saliva was deadly to centipedes. But this was no ordinary centipede. This was so monstrous that even to think of such a creature made one creep with horror. Hidesato determined to try his last chance. So taking his last arrow and first putting the end of it in his mouth, he fitted the notch to his bow, took careful aim once more and let fly.
This time the arrow again hit the centipede right in the middle of its head, but instead of glancing off harmlessly as before, it struck home to the creature’s brain. Then with a convulsive shudder the serpentine body stopped moving, and the fiery light of its great eyes and hundred feet darkened to a dull glare like the sunset of a stormy day, and then went out in blackness. A great darkness now overspread the heavens, the thunder rolled and the lightning flashed, and the wind roared in fury, and it seemed as if the world were coming to an end. The Dragon King and his children and retainers all crouched in different parts of the palace, frightened to death, for the building was shaken to its foundation. At last the dreadful night was over. Day dawned beautiful and clear. The centipede was gone from the mountain.
Then Hidesato called to the Dragon King to come out with him on the balcony, for the centipede was dead and he had nothing more to fear.
Then all the inhabitants of the palace came out with joy, and Hidesato pointed to the lake. There lay the body of the dead centipede floating on the water, which was dyed red with its blood.
The gratitude of the Dragon King knew no bounds. The whole family came and bowed down before the warrior, calling him their preserver and the bravest warrior in all Japan.
Another feast was prepared, more sumptuous than the first. All kinds of fish, prepared in every imaginable way, raw, stewed, boiled and roasted, served on coral trays and crystal dishes, were put before him, and the wine was the best that Hidesato had ever tasted in his life. To add to the beauty of everything the sun shone brightly, the lake glittered like a liquid diamond, and the palace was a thousand times more beautiful by day than by night.
His host tried to persuade the warrior to stay a few days, but Hidesato insisted on going home, saying that he had now finished what he had come to do, and must return. The Dragon King and his family were all very sorry to have him leave so soon, but since he would go they begged him to accept a few small presents (so they said) in token of their gratitude to him for delivering them forever from their horrible enemy the centipede.
As the warrior stood in the porch taking leave, a train of fish was suddenly transformed into a retinue of men, all wearing ceremonial robes and dragon’s crowns on their heads to show that they were servants of the great Dragon King. The presents that they carried were as follows:
First, a large bronze bell.
Second, a bag of rice.
Third, a roll of silk.
Fourth, a cooking pot.
Fifth, a bell.
Hidesato did not want to accept all these presents, but as the Dragon King insisted, he could not well refuse.
The Dragon King himself accompanied the warrior as far as the bridge, and then took leave of him with many bows and good wishes, leaving the procession of servants to accompany Hidesato to his house with the presents.
The warrior’s household and servants had been very much concerned when they found that he did not return the night before, but they finally concluded that he had been kept by the violent storm and had taken shelter somewhere. When the servants on the watch for his return caught sight of him they called to every one that he was approaching, and the whole household turned out to meet him, wondering much what the retinue of men, bearing presents and banners, that followed him, could mean.
As soon as the Dragon King’s retainers had put down the presents they vanished, and Hidesato told all that had happened to him.
The presents which he had received from the grateful Dragon King were found to be of magic power. The bell only was ordinary, and as Hidesato had no use for it he presented it to the temple near by, where it was hung up, to boom out the hour of day over the surrounding neighborhood.
The single bag of rice, however much was taken from it day after day for the meals of the knight and his whole family, never grew less—the supply in the bag was inexhaustible.
The roll of silk, too, never grew shorter, though time after time long pieces were cut off to make the warrior a new suit of clothes to go to Court in at the New Year.
The cooking pot was wonderful, too. No matter what was put into it, it cooked deliciously whatever was wanted without any firing—truly a very economical saucepan.
The fame of Hidesato’s fortune spread far and wide, and as there was no need for him to spend money on rice or silk or firing, he became very rich and prosperous, and was henceforth known as My Lord Bag of Rice.
"""

# Load dictionary
with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    dict_raw = json.load(f)

dict_words = set()
for entry in dict_raw:
    w = entry.get('word', '').strip().lower()
    if w:
        dict_words.add(w)
        for part in re.split(r'[\s\-,/]+', w):
            if part:
                dict_words.add(part)

# Function words & pronouns
FUNCTION_WORDS = {
    'a', 'an', 'the', 'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'shall', 'may', 'might', 'must', 'would', 'could',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'though', 'although',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'yes', 'yeah', 'no', 'oh', 'ok', 'okay', 'hi', 'hello', 'bye', 'thanks', 'please',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand',
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',
    'someone', 'somebody', 'something', 'somewhere', 'everyone', 'everybody', 'everything', 'everywhere',
    'anyone', 'anybody', 'anything', 'anywhere', 'no one', 'nobody', 'nothing', 'nowhere',
    'henceforth', 'therefore', 'however', 'thus', 'till', 'forth', 'sooner', 'upon', 'towards', 'beneath', 'beyond',
}

# Proper nouns & Japanese cultural terms
PROPER_NAMES = {
    'japan', 'tawara', 'toda', 'fujiwara', 'hidesato', 'seta', 'karashi', 'seta-no-karashi',
    'biwa', 'mikami', 'koto', 'samisen', 'ozaki', 'yei', 'theodora'
}

# Irregular verbs map (past / participle -> infinitive)
IRREGULAR_VERBS = {
    'bore': 'bear', 'borne': 'bear', 'born': 'bear',
    'buckled': 'buckle',
    'flung': 'fling', 'slung': 'sling', 'slinging': 'sling',
    'parted': 'part',
    'laid': 'lay', 'lain': 'lie', 'lying': 'lie',
    'flew': 'fly', 'flown': 'fly',
    'shook': 'shake', 'shaken': 'shake',
    'rose': 'rise', 'risen': 'rise',
    'bid': 'bid', 'bidden': 'bid',
    'struck': 'strike', 'stricken': 'strike',
    'wound': 'wind', 'winding': 'wind',
    'shone': 'shine',
    'hung': 'hang',
    'grew': 'grow', 'grown': 'grow',
    'sallied': 'sally',
    'crept': 'creep',
    'began': 'begin', 'begun': 'begin',
    'went': 'go', 'gone': 'go',
    'came': 'come',
    'took': 'take', 'taken': 'take',
    'saw': 'see', 'seen': 'see',
    'felt': 'feel',
    'heard': 'hear',
    'knew': 'know', 'known': 'know',
    'thought': 'think',
    'found': 'find',
    'spread': 'spread',
    'hit': 'hit',
    'fell': 'fall', 'fallen': 'fall',
    'lost': 'lose',
    'caught': 'catch',
    'told': 'tell',
    'stood': 'stand',
    'sat': 'sit',
    'met': 'meet',
    'kept': 'keep',
    'cut': 'cut',
    'read': 'read',
    'led': 'lead',
    'spoke': 'speak', 'spoken': 'speak',
    'drew': 'draw', 'drawn': 'draw',
    'slept': 'sleep',
    'swam': 'swim', 'swum': 'swim',
    'ate': 'eat', 'eaten': 'eat',
}

def get_possible_lemmas(w):
    lemmas = {w}
    if w in IRREGULAR_VERBS:
        lemmas.add(IRREGULAR_VERBS[w])

    if w.endswith("'s") or w.endswith("’s"):
        lemmas.add(w[:-2])

    # s-endings
    if w.endswith('ies') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('es') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
    if w.endswith('s') and not w.endswith('ss') and len(w) > 3:
        lemmas.add(w[:-1])

    # ed-endings
    if w.endswith('ied') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('ed') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
        if len(w) > 5 and w[-3] == w[-4]:
            lemmas.add(w[:-3])

    # ing-endings
    if w.endswith('ing') and len(w) > 4:
        lemmas.add(w[:-3])
        lemmas.add(w[:-3] + 'e')
        if len(w) > 5 and w[-4] == w[-5]:
            lemmas.add(w[:-4])

    # ly-endings
    if w.endswith('ily') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('ly') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])

    # er/est
    if w.endswith('ier') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('er') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
    if w.endswith('iest') and len(w) > 5:
        lemmas.add(w[:-4] + 'y')
    if w.endswith('est') and len(w) > 4:
        lemmas.add(w[:-3])
        lemmas.add(w[:-2])

    # un/re prefixes
    if w.startswith('un') and len(w) > 4:
        lemmas.add(w[2:])
    if w.startswith('re') and len(w) > 4:
        lemmas.add(w[2:])

    return lemmas

def is_word_in_dict(w):
    w = w.lower()
    if w in dict_words or w in FUNCTION_WORDS or w in PROPER_NAMES:
        return True, w
    for l in get_possible_lemmas(w):
        if l in dict_words or l in FUNCTION_WORDS or l in PROPER_NAMES:
            return True, l
    return False, None

# Clean text
normalized_text = STORY_TEXT.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
# Strip punctuation
cleaned_tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", normalized_text)

missing_words = {}
for token in cleaned_tokens:
    raw = token.lower().strip("'")
    if not raw or len(raw) <= 1 and raw not in ('a', 'i'):
        continue
    # Skip proper names
    if raw in PROPER_NAMES:
        continue
    found, lemma = is_word_in_dict(raw)
    if not found:
        if raw not in missing_words:
            missing_words[raw] = 1
        else:
            missing_words[raw] += 1

print(f"Total tokens analyzed: {len(cleaned_tokens)}")
print(f"Unique candidate missing words: {len(missing_words)}")

# Group missing words by suggested base lemma
lemmatized_missing = {}
for word, count in missing_words.items():
    lemmas = get_possible_lemmas(word)
    # Pick the most canonical base lemma (shortest or direct)
    sorted_lemmas = sorted(list(lemmas), key=lambda x: (len(x), x))
    base = sorted_lemmas[0]
    if base not in lemmatized_missing:
        lemmatized_missing[base] = {'forms': [word], 'count': count}
    else:
        lemmatized_missing[base]['forms'].append(word)
        lemmatized_missing[base]['count'] += count

print("\n--- DETAILED MISSING WORDS & LEMMAS ---")
for base, info in sorted(lemmatized_missing.items()):
    forms_str = ", ".join(set(info['forms']))
    print(f"Lemma: {base:16} | Forms in text: {forms_str:25} | Occurrences: {info['count']}")
