import { getStoryStrings } from './storyTranslations.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation } from '../../services/i18n.js?v=386.0';
import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, getUserFavorites, getWords } from '../../services/api.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';

export const MILESTONE_STORIES = {
  "0": {
    "milestone": 0,
    "titleKey": "storyTitle0",
    "translationKey": "storyFull0",
    "badgeKey": "badge0",
    "title": "Japanese Fairy Tales by Yei Theodora Ozaki",
    "author": "Yei Theodora Ozaki",
    "coverImage": "assets/images/my_lord_bag_of_rice.webp",
    "hideFullTranslation": true,
    "paragraphs": [
      "Long, long ago there lived, in Japan a brave warrior known to all as Tawara Toda, or “My Lord Bag of Rice.” His true name was Fujiwara Hidesato, and there is a very interesting story of how he came to change his name.",
      "One day he sallied forth in search of adventures, for he had the nature of a warrior and could not bear to be idle. So he buckled on his two swords, took his huge bow, much taller than himself, in his hand, and slinging his quiver on his back started out. He had not gone far when he came to the bridge of Seta-no-Karashi spanning one end of the beautiful Lake Biwa. No sooner had he set foot on the bridge than he saw lying right across his path a huge serpent-dragon. Its body was so big that it looked like the trunk of a large pine tree and it took up the whole width of the bridge. One of its huge claws rested on the parapet of one side of the bridge, while its tail lay right against the other. The monster seemed to be asleep, and as it breathed, fire and smoke came out of its nostrils.",
      "At first Hidesato could not help feeling alarmed at the sight of this horrible reptile lying in his path, for he must either turn back or walk right over its body. He was a brave man, however, and putting aside all fear went forward dauntlessly. Crunch, crunch! he stepped now on the dragon’s body, now between its coils, and without even one glance backward he went on his way.",
      "He had only gone a few steps when he heard some one calling him from behind. On turning back he was much surprised to see that the monster dragon had entirely disappeared and in its place was a strange-looking man, who was bowing most ceremoniously to the ground. His red hair streamed over his shoulders and was surmounted by a crown in the shape of a dragon’s head, and his sea-green dress was patterned with shells. Hidesato knew at once that this was no ordinary mortal and he wondered much at the strange occurrence. Where had the dragon gone in such a short space of time? Or had it transformed itself into this man, and what did the whole thing mean? While these thoughts passed through his mind he had come up to the man on the bridge and now addressed him:",
      "“Was it you that called me just now?”",
      "“Yes, it was I,” answered the man: “I have an earnest request to make to you. Do you think you can grant it to me?”",
      "“If it is in my power to do so I will,” answered Hidesato, “but first tell me who you are?”",
      "“I am the Dragon King of the Lake, and my home is in these waters just under this bridge.”",
      "“And what is it you have to ask of me!” said Hidesato.",
      "“I want you to kill my mortal enemy the centipede, who lives on the mountain beyond,” and the Dragon King pointed to a high peak on the opposite shore of the lake.",
      "“I have lived now for many years in this lake and I have a large family of children and grand-children. For some time past we have lived in terror, for a monster centipede has discovered our home, and night after night it comes and carries off one of my family. I am powerless to save them. If it goes on much longer like this, not only shall I lose all my children, but I myself must fall a victim to the monster. I am, therefore, very unhappy, and in my extremity I determined to ask the help of a human being. For many days with this intention I have waited on the bridge in the shape of the horrible serpent-dragon that you saw, in the hope that some strong brave man would come along. But all who came this way, as soon as they saw me were terrified and ran away as fast as they could. You are the first man I have found able to look at me without fear, so I knew at once that you were a man of great courage. I beg you to have pity upon me. Will you not help me and kill my enemy the centipede?”",
      "Hidesato felt very sorry for the Dragon King on hearing his story, and readily promised to do what he could to help him. The warrior asked where the centipede lived, so that he might attack the creature at once. The Dragon King replied that its home was on the mountain Mikami, but that as it came every night at a certain hour to the palace of the lake, it would be better to wait till then. So Hidesato was conducted to the palace of the Dragon King, under the bridge. Strange to say, as he followed his host downwards the waters parted to let them pass, and his clothes did not even feel damp as he passed through the flood. Never had Hidesato seen anything so beautiful as this palace built of white marble beneath the lake. He had often heard of the Sea King’s palace at the bottom of the sea, where all the servants and retainers were salt-water fishes, but here was a magnificent building in the heart of Lake Biwa. The dainty goldfishes, red carp, and silvery trout, waited upon the Dragon King and his guest.",
      "Hidesato was astonished at the feast that was spread for him. The dishes were crystallized lotus leaves and flowers, and the chopsticks were of the rarest ebony. As soon as they sat down, the sliding doors opened and ten lovely goldfish dancers came out, and behind them followed ten red-carp musicians with the koto and the samisen. Thus the hours flew by till midnight, and the beautiful music and dancing had banished all thoughts of the centipede. The Dragon King was about to pledge the warrior in a fresh cup of wine when the palace was suddenly shaken by a tramp, tramp! as if a mighty army had begun to march not far away.",
      "Hidesato and his host both rose to their feet and rushed to the balcony, and the warrior saw on the opposite mountain two great balls of glowing fire coming nearer and nearer. The Dragon King stood by the warrior’s side trembling with fear.",
      "“The centipede! The centipede! Those two balls of fire are its eyes. It is coming for its prey! Now is the time to kill it.”",
      "Hidesato looked where his host pointed, and, in the dim light of the starlit evening, behind the two balls of fire he saw the long body of an enormous centipede winding round the mountains, and the light in its hundred feet glowed like so many distant lanterns moving slowly towards the shore.",
      "Hidesato showed not the least sign of fear. He tried to calm the Dragon King.",
      "“Don’t be afraid. I shall surely kill the centipede. Just bring me my bow and arrows.”",
      "The Dragon King did as he was bid, and the warrior noticed that he had only three arrows left in his quiver. He took the bow, and fitting an arrow to the notch, took careful aim and let fly.",
      "The arrow hit the centipede right in the middle of its head, but instead of penetrating, it glanced off harmless and fell to the ground.",
      "Nothing daunted, Hidesato took another arrow, fitted it to the notch of the bow and let fly. Again the arrow hit the mark, it struck the centipede right in the middle of its head, only to glance off and fall to the ground. The centipede was invulnerable to weapons! When the Dragon King saw that even this brave warrior’s arrows were powerless to kill the centipede, he lost heart and began to tremble with fear.",
      "The warrior saw that he had now only one arrow left in his quiver, and if this one failed he could not kill the centipede. He looked across the waters. The huge reptile had wound its horrid body seven times round the mountain and would soon come down to the lake. Nearer and nearer gleamed fireballs of eyes, and the light of its hundred feet began to throw reflections in the still waters of the lake.",
      "Then suddenly the warrior remembered that he had heard that human saliva was deadly to centipedes. But this was no ordinary centipede. This was so monstrous that even to think of such a creature made one creep with horror. Hidesato determined to try his last chance. So taking his last arrow and first putting the end of it in his mouth, he fitted the notch to his bow, took careful aim once more and let fly.",
      "This time the arrow again hit the centipede right in the middle of its head, but instead of glancing off harmlessly as before, it struck home to the creature’s brain. Then with a convulsive shudder the serpentine body stopped moving, and the fiery light of its great eyes and hundred feet darkened to a dull glare like the sunset of a stormy day, and then went out in blackness. A great darkness now overspread the heavens, the thunder rolled and the lightning flashed, and the wind roared in fury, and it seemed as if the world were coming to an end. The Dragon King and his children and retainers all crouched in different parts of the palace, frightened to death, for the building was shaken to its foundation. At last the dreadful night was over. Day dawned beautiful and clear. The centipede was gone from the mountain.",
      "Then Hidesato called to the Dragon King to come out with him on the balcony, for the centipede was dead and he had nothing more to fear.",
      "Then all the inhabitants of the palace came out with joy, and Hidesato pointed to the lake. There lay the body of the dead centipede floating on the water, which was dyed red with its blood.",
      "The gratitude of the Dragon King knew no bounds. The whole family came and bowed down before the warrior, calling him their preserver and the bravest warrior in all Japan.",
      "Another feast was prepared, more sumptuous than the first. All kinds of fish, prepared in every imaginable way, raw, stewed, boiled and roasted, served on coral trays and crystal dishes, were put before him, and the wine was the best that Hidesato had ever tasted in his life. To add to the beauty of everything the sun shone brightly, the lake glittered like a liquid diamond, and the palace was a thousand times more beautiful by day than by night.",
      "His host tried to persuade the warrior to stay a few days, but Hidesato insisted on going home, saying that he had now finished what he had come to do, and must return. The Dragon King and his family were all very sorry to have him leave so soon, but since he would go they begged him to accept a few small presents (so they said) in token of their gratitude to him for delivering them forever from their horrible enemy the centipede.",
      "As the warrior stood in the porch taking leave, a train of fish was suddenly transformed into a retinue of men, all wearing ceremonial robes and dragon’s crowns on their heads to show that they were servants of the great Dragon King. The presents that they carried were as follows:",
      "First, a large bronze bell.",
      "Second, a bag of rice.",
      "Third, a roll of silk.",
      "Fourth, a cooking pot.",
      "Fifth, a bell.",
      "Hidesato did not want to accept all these presents, but as the Dragon King insisted, he could not well refuse.",
      "The Dragon King himself accompanied the warrior as far as the bridge, and then took leave of him with many bows and good wishes, leaving the procession of servants to accompany Hidesato to his house with the presents.",
      "The warrior’s household and servants had been very much concerned when they found that he did not return the night before, but they finally concluded that he had been kept by the violent storm and had taken shelter somewhere. When the servants on the watch for his return caught sight of him they called to every one that he was approaching, and the whole household turned out to meet him, wondering much what the retinue of men, bearing presents and banners, that followed him, could mean.",
      "As soon as the Dragon King’s retainers had put down the presents they vanished, and Hidesato told all that had happened to him.",
      "The presents which he had received from the grateful Dragon King were found to be of magic power. The bell only was ordinary, and as Hidesato had no use for it he presented it to the temple near by, where it was hung up, to boom out the hour of day over the surrounding neighborhood.",
      "The single bag of rice, however much was taken from it day after day for the meals of the knight and his whole family, never grew less—the supply in the bag was inexhaustible.",
      "The roll of silk, too, never grew shorter, though time after time long pieces were cut off to make the warrior a new suit of clothes to go to Court in at the New Year.",
      "The cooking pot was wonderful, too. No matter what was put into it, it cooked deliciously whatever was wanted without any firing—truly a very economical saucepan.",
      "The fame of Hidesato’s fortune spread far and wide, and as there was no need for him to spend money on rice or silk or firing, he became very rich and prosperous, and was henceforth known as My Lord Bag of Rice."
    ]
  },
  "50": {
    "milestone": 50,
    "titleKey": "storyTitle50",
    "translationKey": "storyFull50",
    "badgeKey": "badge50",
    "title": "Meeting Someone New",
    "paragraphs": [
      "— Hi, is this seat free?",
      "— Yes, go ahead.",
      "— Thanks. I'm Maya. What's your name?",
      "— I'm Leo. Nice to meet you.",
      "— Nice to meet you too. Are you new here?",
      "— Yes, I moved here last week.",
      "— Welcome! How are you finding the city?",
      "— I like it so far. People are really friendly."
    ]
  },
  "100": {
    "milestone": 100,
    "titleKey": "storyTitle100",
    "translationKey": "storyFull100",
    "badgeKey": "badge100",
    "title": "At Home",
    "paragraphs": [
      "— Have you seen my keys?",
      "— They're on the table, next to your bag.",
      "— Oh, thanks. I'm always losing them.",
      "— No problem. Are you going out?",
      "— Yes, I need to buy some milk.",
      "— Can you get some bread too?",
      "— Sure. Do we need anything else?",
      "— Just apples. We have everything else."
    ]
  },
  "150": {
    "milestone": 150,
    "titleKey": "storyTitle150",
    "translationKey": "storyFull150",
    "badgeKey": "badge150",
    "title": "At the Coffee Shop",
    "paragraphs": [
      "— Hi! What can I get for you?",
      "— Could I have a small latte, please?",
      "— Sure. Would you like it hot or iced?",
      "— Hot, please. And a cheese sandwich.",
      "— For here or to go?",
      "— To go, please. How much is that?",
      "— That's six fifty.",
      "— Here you go. Thanks!"
    ]
  },
  "200": {
    "milestone": 200,
    "titleKey": "storyTitle200",
    "translationKey": "storyFull200",
    "badgeKey": "badge200",
    "title": "At the Store",
    "paragraphs": [
      "— Excuse me, do you have this shirt in blue?",
      "— Let me check. What size do you need?",
      "— Medium, please.",
      "— Here you are. Would you like to try it on?",
      "— Yes. Where are the fitting rooms?",
      "— Over there, next to the mirror.",
      "— It fits well. How much is it?",
      "— It's twenty-five. I'll take it."
    ]
  },
  "250": {
    "milestone": 250,
    "titleKey": "storyTitle250",
    "translationKey": "storyFull250",
    "badgeKey": "badge250",
    "title": "On the Street",
    "paragraphs": [
      "— Excuse me, is there a bank near here?",
      "— Yes. Go straight and turn left at the traffic lights.",
      "— Is it far?",
      "— No, about five minutes on foot.",
      "— Is it next to the supermarket?",
      "— That's right, across from the bus stop.",
      "— Great, thanks for your help.",
      "— You're welcome. Have a nice day!"
    ]
  },
  "300": {
    "milestone": 300,
    "titleKey": "storyTitle300",
    "translationKey": "storyFull300",
    "badgeKey": "badge300",
    "title": "At the Bus Stop",
    "paragraphs": [
      "— Does this bus go downtown?",
      "— Yes, but it takes about twenty minutes.",
      "— Can I pay by card?",
      "— Of course. Just tap when you get on.",
      "— Could you tell me when we reach the museum?",
      "— Sure. It's three stops after the library.",
      "— Thanks. I'm new to this route.",
      "— No worries. I'll let you know."
    ]
  },
  "350": {
    "milestone": 350,
    "titleKey": "storyTitle350",
    "translationKey": "storyFull350",
    "badgeKey": "badge350",
    "title": "A Phone Call",
    "paragraphs": [
      "— Hi, it's Nina. Is Tom there?",
      "— One moment. I'll get him.",
      "— Hi, Nina. What's up?",
      "— Are we still meeting after work?",
      "— Yes, but I may be ten minutes late.",
      "— That's fine. I'll wait by the entrance.",
      "— Great. I'll call if anything changes.",
      "— See you soon."
    ]
  },
  "400": {
    "milestone": 400,
    "titleKey": "storyTitle400",
    "translationKey": "storyFull400",
    "badgeKey": "badge400",
    "title": "Making Plans",
    "paragraphs": [
      "— Are you free on Saturday?",
      "— I think so. What's the plan?",
      "— There's a new film at the cinema.",
      "— Sounds good. What time does it start?",
      "— At seven. Shall we meet at half past six?",
      "— Can we meet a little later? I finish work at six.",
      "— Sure. Let's meet at quarter past six.",
      "— Perfect. I'll book the tickets."
    ]
  },
  "450": {
    "milestone": 450,
    "titleKey": "storyTitle450",
    "translationKey": "storyFull450",
    "badgeKey": "badge450",
    "title": "At the Restaurant",
    "paragraphs": [
      "— Good evening. Do you have a table for two?",
      "— Yes. Do you have a reservation?",
      "— No, we don't. Is that a problem?",
      "— Not at all. Please follow me.",
      "— Could we see the menu, please?",
      "— Of course. The chicken is very popular today.",
      "— Great. I'll have that, and water, please.",
      "— Certainly. I'll be back in a moment."
    ]
  },
  "500": {
    "milestone": 500,
    "titleKey": "storyTitle500",
    "translationKey": "storyFull500",
    "badgeKey": "badge500",
    "title": "At the Supermarket",
    "paragraphs": [
      "— Excuse me, where can I find rice?",
      "— Aisle four, next to the pasta.",
      "— Thanks. Is this brand any good?",
      "— Yes, I buy it all the time.",
      "— Oh, it's on sale today.",
      "— It is. The larger bag is cheaper per kilo.",
      "— Good point. I'll take that one.",
      "— Do you need a bag?",
      "— No, thanks. I brought my own."
    ]
  },
  "550": {
    "milestone": 550,
    "titleKey": "storyTitle550",
    "translationKey": "storyFull550",
    "badgeKey": "badge550",
    "title": "At the Doctor's",
    "paragraphs": [
      "— Hello, I have an appointment at ten.",
      "— What's your name, please?",
      "— Daniel Reed.",
      "— Thank you. Please take a seat; the doctor will be with you soon.",
      "— Should I fill out this form?",
      "— Yes, just add your address and phone number.",
      "— Here you go. I've had a cough for three days.",
      "— All right. The doctor will ask you a few questions."
    ]
  },
  "600": {
    "milestone": 600,
    "titleKey": "storyTitle600",
    "translationKey": "storyFull600",
    "badgeKey": "badge600",
    "title": "At the Pharmacy",
    "paragraphs": [
      "— Hi, can you help me? I need something for a headache.",
      "— Of course. How long have you had it?",
      "— Since this morning. I don't have a fever.",
      "— Are you taking any other medicine?",
      "— No, nothing at the moment.",
      "— All right. Please read the instructions on the package.",
      "— Can I take it with food?",
      "— Check the label, and ask a doctor if you are unsure."
    ]
  },
  "650": {
    "milestone": 650,
    "titleKey": "storyTitle650",
    "translationKey": "storyFull650",
    "badgeKey": "badge650",
    "title": "At the Train Station",
    "paragraphs": [
      "— Hi, I'd like a return ticket to Brighton.",
      "— Sure. When would you like to come back?",
      "— Tomorrow evening, please.",
      "— The next train leaves at 10:15 from platform three.",
      "— Does it stop at Central Station?",
      "— Yes, and the journey takes just under an hour.",
      "— Great. Is a seat reserved for me?",
      "— Yes, seat 14A. Have a good trip!"
    ]
  },
  "700": {
    "milestone": 700,
    "titleKey": "storyTitle700",
    "translationKey": "storyFull700",
    "badgeKey": "badge700",
    "title": "At the Airport",
    "paragraphs": [
      "— Good morning. Can I see your passport, please?",
      "— Of course. Here it is.",
      "— Are you checking in any bags?",
      "— Just this suitcase. I have a backpack with me.",
      "— Please put the suitcase on the scale.",
      "— No problem. Is everything okay?",
      "— Yes. Here's your boarding pass. Your gate is 18.",
      "— When does boarding start?"
    ]
  },
  "750": {
    "milestone": 750,
    "titleKey": "storyTitle750",
    "translationKey": "storyFull750",
    "badgeKey": "badge750",
    "title": "At the Hotel",
    "paragraphs": [
      "— Hello, I have a reservation under the name Patel.",
      "— Welcome. Could I see your ID, please?",
      "— Sure. Is breakfast included?",
      "— Yes, it's served from seven to ten.",
      "— What's the Wi-Fi password?",
      "— It's on this card. Check-out is at eleven.",
      "— Could I leave my bags here after check-out?",
      "— Of course. Enjoy your stay!"
    ]
  },
  "800": {
    "milestone": 800,
    "titleKey": "storyTitle800",
    "translationKey": "storyFull800",
    "badgeKey": "badge800",
    "title": "Something Went Wrong",
    "paragraphs": [
      "— Excuse me, my room key isn't working.",
      "— Sorry about that. Which room are you in?",
      "— Room 305. The light flashes, but the door won't open.",
      "— Let me try it. You're right; the card has expired.",
      "— Could you make me a new one?",
      "— Of course. I'll activate this card for you.",
      "— Thanks. Could you check that it works?",
      "— Sure. Try it now. Have a good evening."
    ]
  },
  "850": {
    "milestone": 850,
    "titleKey": "storyTitle850",
    "translationKey": "storyFull850",
    "badgeKey": "badge850",
    "title": "Meeting a New Neighbor",
    "paragraphs": [
      "— Hi, I think we're neighbors. I moved into the flat next door.",
      "— Oh, welcome! I'm Sara.",
      "— Nice to meet you. I'm Ben.",
      "— Do you need a hand with those boxes?",
      "— That's very kind, thanks. I've got a few more in the car.",
      "— No problem. I can help you carry them upstairs.",
      "— Thanks! I'll bring the boxes in, then make some coffee.",
      "— Sounds good. Come by later if you need anything."
    ]
  },
  "900": {
    "milestone": 900,
    "titleKey": "storyTitle900",
    "translationKey": "storyFull900",
    "badgeKey": "badge900",
    "title": "At Work",
    "paragraphs": [
      "— Hi, you must be Emma. I'm Daniel, your team lead.",
      "— Nice to meet you. It's my first day.",
      "— Welcome aboard. Did you find the office easily?",
      "— Yes, thanks. Where should I sit?",
      "— At that desk near the window. Your laptop is ready.",
      "— Great. Is there anything I should read first?",
      "— I'll send you the team guide and introduce you at lunch.",
      "— Thanks. I'm looking forward to getting started."
    ]
  },
  "950": {
    "milestone": 950,
    "titleKey": "storyTitle950",
    "translationKey": "storyFull950",
    "badgeKey": "badge950",
    "title": "A Team Meeting",
    "paragraphs": [
      "— Can we start with a quick update on the report?",
      "— I've finished the first part, but I'm waiting for the sales numbers.",
      "— When do you expect them?",
      "— By tomorrow morning. I can finish the report after that.",
      "— That works. Please flag any issues early.",
      "— Sure. I also found two figures that don't match.",
      "— Let's check them together after the meeting.",
      "— Good idea. I'll share the file now."
    ]
  },
  "1000": {
    "milestone": 1000,
    "titleKey": "storyTitle1000",
    "translationKey": "storyFull1000",
    "badgeKey": "badge1000",
    "title": "Shopping Online",
    "paragraphs": [
      "— Hello, I'm calling about order 5821.",
      "— Sure. What seems to be the problem?",
      "— The shoes are too small. I'd like to return them.",
      "— Would you prefer a different size or a refund?",
      "— A larger size, please. Do I need to pay for shipping?",
      "— No, the return label is free. I'll email it to you.",
      "— Great. How long will the exchange take?",
      "— Once we receive the shoes, the new pair will be sent within two days."
    ]
  },
  "1050": {
    "milestone": 1050,
    "titleKey": "storyTitle1050",
    "translationKey": "storyFull1050",
    "badgeKey": "badge1050",
    "title": "Calling Customer Support",
    "paragraphs": [
      "— Thanks for calling support. How can I help?",
      "— My internet has been very slow since yesterday.",
      "— Have you tried restarting your router?",
      "— Yes, twice. The connection comes back, then drops again.",
      "— Are the lights on the router green or red?",
      "— One is red. Does that mean there's an outage?",
      "— There is a service issue in your area. Our team is working on it.",
      "— Thanks. Can you text me when it's fixed?"
    ]
  },
  "1100": {
    "milestone": 1100,
    "titleKey": "storyTitle1100",
    "translationKey": "storyFull1100",
    "badgeKey": "badge1100",
    "title": "A Weekend Trip",
    "paragraphs": [
      "— Are we still going hiking this weekend?",
      "— Yes, but the weather looks rainy on Saturday.",
      "— Should we move the trip to Sunday?",
      "— That works for me. The trail is usually quieter then.",
      "— Do we need to book the bus in advance?",
      "— I checked; there are still seats available.",
      "— Great. I'll pack lunch and bring extra water.",
      "— Perfect. Let's meet at the station at eight."
    ]
  },
  "1150": {
    "milestone": 1150,
    "titleKey": "storyTitle1150",
    "translationKey": "storyFull1150",
    "badgeKey": "badge1150",
    "title": "Talking About the Past",
    "paragraphs": [
      "— How was your trip to the coast?",
      "— Really good, but I missed my train on the way back.",
      "— Oh no! What happened?",
      "— I got the time wrong and arrived ten minutes late.",
      "— How did you get home?",
      "— A woman at the station showed me another route.",
      "— That was kind of her. Did you have to wait long?",
      "— No, I caught a bus twenty minutes later."
    ]
  },
  "1200": {
    "milestone": 1200,
    "titleKey": "storyTitle1200",
    "translationKey": "storyFull1200",
    "badgeKey": "badge1200",
    "title": "A Job Interview",
    "paragraphs": [
      "— Thanks for coming in. Could you tell me a little about yourself?",
      "— I work as a business analyst and help teams understand user needs.",
      "— What kind of projects have you worked on?",
      "— I've worked on reporting tools and an online booking system.",
      "— What would you say is your strongest skill?",
      "— I ask clear questions and turn complex problems into practical steps.",
      "— Can you tell me about a challenge you faced?",
      "— We had a tight deadline, so I helped the team agree on priorities."
    ]
  },
  "1250": {
    "milestone": 1250,
    "titleKey": "storyTitle1250",
    "translationKey": "storyFull1250",
    "badgeKey": "badge1250",
    "title": "Future Plans and Goals",
    "paragraphs": [
      "— You've been studying English for a while, haven't you?",
      "— Yes. I understand meetings better, but speaking still takes effort.",
      "— What would you like to improve next?",
      "— I want to explain my ideas more confidently and lead discussions.",
      "— Have you thought about how to practise?",
      "— I'll join a weekly conversation group and speak up more at work.",
      "— That sounds realistic. How will you track your progress?",
      "— I'll record a short update each month and compare it with the last one."
    ]
  },
  "1300": {
    "milestone": 1300,
    "titleKey": "storyTitle1300",
    "translationKey": "storyFull1300",
    "badgeKey": "badge1300",
    "title": "A Calm Start (Present Simple)",
    "paragraphs": [
      "— What time do you usually get up?",
      "— I usually get up at seven, but I don't rush.",
      "— Do you make breakfast at home?",
      "— Yes, I make coffee and pack lunch for work.",
      "— Does your bus stop near your building?",
      "— Yes, it comes every ten minutes.",
      "— Do you like your morning routine?",
      "— I do. It helps me start the day calmly."
    ]
  },
  "1350": {
    "milestone": 1350,
    "titleKey": "storyTitle1350",
    "translationKey": "storyFull1350",
    "badgeKey": "badge1350",
    "title": "The Meeting Room (Present Continuous)",
    "paragraphs": [
      "— Hi, are you using the meeting room right now?",
      "— No, we're just leaving. You can take it.",
      "— Thanks. I'm waiting for a video call with a client.",
      "— Is your team joining from the office?",
      "— Two people are sitting next to me, and the others are working from home.",
      "— Are you sharing the presentation?",
      "— Yes, I'm opening it now.",
      "— Great. I'll ask everyone in the hallway to keep quiet."
    ]
  },
  "1400": {
    "milestone": 1400,
    "titleKey": "storyTitle1400",
    "translationKey": "storyFull1400",
    "badgeKey": "badge1400",
    "title": "The Wrong Order (Past Simple)",
    "paragraphs": [
      "— Excuse me, I think you brought me the wrong order.",
      "— I'm sorry. What did you order?",
      "— I ordered the vegetable soup and a cheese sandwich.",
      "— Did you get the chicken salad?",
      "— Yes, but I don't eat chicken.",
      "— I'll change it right away.",
      "— Thank you. How long did it take last time?",
      "— About five minutes."
    ]
  },
  "1450": {
    "milestone": 1450,
    "titleKey": "storyTitle1450",
    "translationKey": "storyFull1450",
    "badgeKey": "badge1450",
    "title": "When the Alarm Went Off (Past Continuous + Past Simple)",
    "paragraphs": [
      "— What were you doing when the alarm went off?",
      "— I was paying at the counter.",
      "— Did everyone leave the building?",
      "— Yes, the staff opened the doors and guided us outside.",
      "— Were you feeling scared?",
      "— A little, but the manager stayed calm.",
      "— What happened after that?",
      "— The fire team checked the building and said it was safe."
    ]
  },
  "1500": {
    "milestone": 1500,
    "titleKey": "storyTitle1500",
    "translationKey": "storyFull1500",
    "badgeKey": "badge1500",
    "title": "I’ll Send It Now (Will: offers, promises and quick decisions)",
    "paragraphs": [
      "— I can't find the address for tomorrow's meeting.",
      "— Don't worry. I'll send it to you now.",
      "— Thanks. Will you also share the train details?",
      "— Of course. I'll add them to the message.",
      "— I think I'll leave a little earlier.",
      "— Good idea. I'll call a taxi if it starts raining.",
      "— That helps a lot.",
      "— No problem. I'll see you tomorrow."
    ]
  },
  "1550": {
    "milestone": 1550,
    "titleKey": "storyTitle1550",
    "translationKey": "storyFull1550",
    "badgeKey": "badge1550",
    "title": "Weekend Plans (Be Going To)",
    "paragraphs": [
      "— What are you going to do this weekend?",
      "— I'm going to visit my aunt outside the city.",
      "— Are you going to drive?",
      "— No, we're going to take the train.",
      "— What are you going to do there?",
      "— We're going to cook together and walk by the lake.",
      "— That sounds lovely. Are you going to stay overnight?",
      "— Yes, I'm going to come back on Sunday."
    ]
  },
  "1600": {
    "milestone": 1600,
    "titleKey": "storyTitle1600",
    "translationKey": "storyFull1600",
    "badgeKey": "badge1600",
    "title": "The Lost Backpack (Present Perfect)",
    "paragraphs": [
      "— Have you seen a blue backpack?",
      "— Yes, someone has left one at the front desk.",
      "— Has anyone opened it?",
      "— No, we haven't touched it.",
      "— Have you contacted the owner?",
      "— Yes, I've just sent a message.",
      "— Has the owner replied yet?",
      "— Not yet, but we've kept it in a safe place."
    ]
  },
  "1650": {
    "milestone": 1650,
    "titleKey": "storyTitle1650",
    "translationKey": "storyFull1650",
    "badgeKey": "badge1650",
    "title": "A Trip to Lisbon (Present Perfect vs Past Simple)",
    "paragraphs": [
      "— Have you ever been to Lisbon?",
      "— Yes, I have. I went there last spring.",
      "— What did you like most?",
      "— I loved the old streets, and I tried a local dessert.",
      "— Have you visited the coast too?",
      "— Yes, we took a train there on our last day.",
      "— Did you enjoy the trip?",
      "— Definitely. I've wanted to go back ever since."
    ]
  },
  "1700": {
    "milestone": 1700,
    "titleKey": "storyTitle1700",
    "translationKey": "storyFull1700",
    "badgeKey": "badge1700",
    "title": "Dinner on Friday (Present Continuous for Future Arrangements)",
    "paragraphs": [
      "— Are we still meeting Anna for dinner on Friday?",
      "— Yes, we're meeting her at seven outside the station.",
      "— Is she coming straight from work?",
      "— No, she's finishing early and taking the metro.",
      "— Are you booking a table?",
      "— I've already booked one for three.",
      "— Great. What are we doing after dinner?",
      "— We're walking along the river if the weather is good."
    ]
  },
  "1750": {
    "milestone": 1750,
    "titleKey": "storyTitle1750",
    "translationKey": "storyFull1750",
    "badgeKey": "badge1750",
    "title": "If the Train Is Late (First Conditional)",
    "paragraphs": [
      "— What will we do if the train is late?",
      "— If it arrives after nine, we'll take a taxi.",
      "— Will we miss the start of the show?",
      "— We won't if we leave the station quickly.",
      "— What if the taxi gets stuck in traffic?",
      "— If that happens, I'll call the theatre and explain.",
      "— Will they hold our tickets?",
      "— Yes, they'll keep our seats for fifteen minutes."
    ]
  },
  "1800": {
    "milestone": 1800,
    "titleKey": "storyTitle1800",
    "translationKey": "storyFull1800",
    "badgeKey": "badge1800",
    "title": "The Email I Hadn't Read (Past Perfect + Past Simple)",
    "paragraphs": [
      "— Why didn't you come to the meeting yesterday?",
      "— I hadn't seen the updated invitation, so I went to the old room.",
      "— Had you checked your email?",
      "— I had, but the new message arrived while I was on the bus.",
      "— What happened when you got there?",
      "— Everyone had already moved to another floor.",
      "— Did you join them in the end?",
      "— Yes, I found the room and joined ten minutes later."
    ]
  },
  "1850": {
    "milestone": 1850,
    "titleKey": "storyTitle1850",
    "translationKey": "storyFull1850",
    "badgeKey": "badge1850",
    "title": "This Time Tomorrow (Future Continuous + Future Perfect)",
    "paragraphs": [
      "— What will you be doing this time tomorrow?",
      "— I'll be flying to Berlin for the conference.",
      "— Will you have finished the presentation by then?",
      "— Yes, I'll have sent it to the team tonight.",
      "— Will you be staying near the venue?",
      "— Yes, I'll be staying at a hotel across the street.",
      "— How long will you have been there by Friday?",
      "— By Friday, I’ll have been there for two days. Then I’ll be heading home."
    ]
  }
};

// Comprehensive grammatical words, pronouns, contractions, and story vocabulary across all 36 locales
const FUNCTION_WORDS_MAP = {
  'a': { 'cs': 'člen (jeden/nějaký)', 'de': 'Artikel (ein/eine)', 'en': 'article (one/any)', 'es': 'artículo (un/una)', 'fr': 'article (un/une)', 'ru': 'артикль (один, какой-то)', 'uk': 'артикль (один, якийсь)' },
  'accompanied': { 'de': 'begleitet', 'en': 'accompanied', 'es': 'acompañado', 'fr': 'accompagné', 'it': 'accompagnato', 'ja': '付き添われた', 'ko': '동행한', 'pl': 'w towarzystwie', 'ru': 'в сопровождении, сопровождал', 'tr': 'eşlik edilen', 'uk': 'у супроводі', 'zh': '陪同，陪伴' },
  'against': { 'de': 'gegen', 'en': 'against', 'es': 'contra', 'fr': 'contre', 'it': 'contro', 'ja': '〜に対して、寄りかかって', 'ko': '~에 반대하여, 맞서', 'pl': 'przeciwko', 'ru': 'против, к, об', 'tr': 'karşı', 'uk': 'проти, до, об', 'zh': '反对，紧靠' },
  'aim': { 'de': 'zielen, Ziel', 'en': 'aim', 'es': 'apuntar, objetivo', 'fr': 'viser, objectif', 'it': 'mirare, obiettivo', 'ja': '狙う、目的', 'ko': '겨냥하다, 목표', 'pl': 'cel, celować', 'ru': 'цель, целиться', 'tr': 'hedef, nişan almak', 'uk': 'ціль, цілитися', 'zh': '瞄准，目标' },
  'an': { 'cs': 'člen (jeden)', 'de': 'Artikel (ein/eine)', 'en': 'article (one)', 'es': 'artículo (un/una)', 'fr': 'article (un/une)', 'ru': 'артикль (один)', 'uk': 'артикль (один)' },
  'and': { 'cs': 'a, i', 'de': 'und', 'en': 'and', 'es': 'y, e', 'fr': 'et', 'ru': 'и, а', 'uk': 'і, й, та' },
  'anna': { 'de': 'Anna', 'en': 'Anna (name)', 'es': 'Anna', 'fr': 'Anna', 'it': 'Anna', 'ja': 'アンナ', 'ko': '안나', 'pl': 'Anna', 'ru': 'Анна (имя)', 'tr': 'Anna', 'uk': 'Анна', 'zh': '安娜（人名）' },
  'are': { 'cs': 'jsou (být)', 'de': 'sind (sein)', 'en': 'are (to be)', 'es': 'son, están (ser/estar)', 'fr': 'sont (être)', 'ru': 'есть, находятся (быть)', 'uk': 'є, знаходяться (бути)' },
  'at': { 'cs': 'u, při, v', 'de': 'bei, an', 'en': 'at', 'es': 'en, junto a', 'fr': 'à, chez', 'ru': 'у, при, в', 'uk': 'біля, при, в' },
  'ben': { 'de': 'Ben', 'en': 'Ben (name)', 'es': 'Ben', 'fr': 'Ben', 'it': 'Ben', 'ja': 'ベン', 'ko': '벤', 'pl': 'Ben', 'ru': 'Бен (имя)', 'tr': 'Ben', 'uk': 'Бен', 'zh': '本（人名）' },
  'berlin': { 'de': 'Berlin', 'en': 'Berlin', 'es': 'Berlín', 'fr': 'Berlin', 'it': 'Berlino', 'ja': 'ベルリン', 'ko': '베를린', 'pl': 'Berlin', 'ru': 'Берлин', 'tr': 'Berlin', 'uk': 'Берлін', 'zh': '柏林' },
  'bid': { 'de': 'gebot', 'en': 'bid', 'es': 'ordenó', 'fr': 'ordonna', 'it': 'ha ordinato', 'ja': '命じた', 'ko': '명령했다', 'pl': 'rozkazał', 'ru': 'велел, велеть, приказал', 'tr': 'emretti', 'uk': 'наказав', 'zh': '命令，吩咐' },
  'biwa': { 'de': 'Biwa-See', 'en': 'Biwa (lake)', 'es': 'Biwa (lago)', 'fr': 'Biwa (lac)', 'it': 'Biwa (lago)', 'ja': '琵琶湖（びわこ）', 'ko': '비와호', 'pl': 'Biwa (jezioro)', 'ru': 'Бива (озеро)', 'tr': 'Biwa (göl)', 'uk': 'Біва (озеро)', 'zh': '琵琶湖' },
  'bounds': { 'de': 'Grenzen', 'en': 'bounds', 'es': 'límites', 'fr': 'limites', 'it': 'limiti', 'ja': '限界、範囲', 'ko': '한계, 범위', 'pl': 'granice', 'ru': 'границы, пределы', 'tr': 'sınırlar', 'uk': 'межі', 'zh': '限度，界限' },
  'brightly': { 'de': 'hell, strahlend', 'en': 'brightly', 'es': 'brillantemente', 'fr': 'brillamment', 'it': 'brillantemente', 'ja': '明るく', 'ko': '밝게', 'pl': 'jasno, jaskrawo', 'ru': 'ярко, светло', 'tr': 'parlak bir şekilde', 'uk': 'яскравo', 'zh': '明亮地' },
  'brighton': { 'de': 'Brighton', 'en': 'Brighton', 'es': 'Brighton', 'fr': 'Brighton', 'it': 'Brighton', 'ja': 'ブライトン', 'ko': '브라이턴', 'pl': 'Brighton', 'ru': 'Брайтон (город)', 'tr': 'Brighton', 'uk': 'Брайтон (місто)', 'zh': '布莱顿' },
  'by': { 'cs': 'u, vedle', 'de': 'bei, neben', 'en': 'by, near', 'es': 'junto a, por', 'fr': 'près de, par', 'ru': 'у, около, возле', 'uk': 'біля, поруч' },
  'can\'t': { 'de': 'kann nicht', 'en': 'can\'t (cannot)', 'es': 'no puedo', 'fr': 'ne peux pas', 'it': 'non posso', 'ja': '〜できない', 'ko': '할 수 없다', 'pl': 'nie mogę', 'ru': 'не могу, нельзя', 'tr': 'yapamam', 'uk': 'не можу, не можна', 'zh': '不能，无法' },
  'caught': { 'de': 'fing', 'en': 'caught', 'es': 'atrapó', 'fr': 'attrapé', 'it': 'ha catturato', 'ja': '捕まえた', 'ko': '잡았다', 'pl': 'złapał', 'ru': 'поймал, пойманный', 'tr': 'yakaladı', 'uk': 'спіймав', 'zh': '抓住，捕获' },
  'ceremoniously': { 'de': 'feierlich', 'en': 'ceremoniously', 'es': 'ceremoniosamente', 'fr': 'cérémonieusement', 'it': 'cerimoniosamente', 'ja': '礼儀正しく', 'ko': '정중하게, 의식에 맞춰', 'pl': 'uroczyście', 'ru': 'церемонно, торжественно', 'tr': 'törensel olarak', 'uk': 'церемонно', 'zh': '隆重地，客套地' },
  'certain': { 'de': 'bestimmt, gewiss', 'en': 'certain', 'es': 'cierto, seguro', 'fr': 'certain', 'it': 'certo', 'ja': 'ある、特定の', 'ko': '어떤, 특정한', 'pl': 'pewien, określony', 'ru': 'определенный, некоторый', 'tr': 'belirli, kesin', 'uk': 'певний', 'zh': '某种，确定的' },
  'check-out': { 'de': 'Abreise, Check-out', 'en': 'check-out', 'es': 'salida, check-out', 'fr': 'départ, check-out', 'it': 'partenza, check-out', 'ja': 'チェックアウト', 'ko': '체크아웃, 퇴실', 'pl': 'wymeldowanie', 'ru': 'выезд (из отеля), расчет', 'tr': 'çıkış, check-out', 'uk': 'виїзд (з готелю)', 'zh': '结账退房' },
  'creep': { 'de': 'kriechen', 'en': 'creep', 'es': 'arrastrarse', 'fr': 'ramper', 'it': 'strisciare', 'ja': '這う、ぞっとする', 'ko': '기어가다, 소름 끼치다', 'pl': 'czołgać się', 'ru': 'ползти, мурашки', 'tr': 'sürünmek', 'uk': 'повзти, мурашки', 'zh': '爬行，毛骨悚然' },
  'daniel': { 'de': 'Daniel', 'en': 'Daniel (name)', 'es': 'Daniel', 'fr': 'Daniel', 'it': 'Daniel', 'ja': 'ダニエル', 'ko': '대니얼', 'pl': 'Daniel', 'ru': 'Даниэль (имя)', 'tr': 'Daniel', 'uk': 'Даніель', 'zh': '丹尼尔（人名）' },
  'dauntlessly': { 'de': 'furchtlos', 'en': 'dauntlessly', 'es': 'intrépidamente', 'fr': 'intrépidement', 'it': 'intépidamente', 'ja': '恐れずに、勇敢に', 'ko': '용감하게, 굽히지 않고', 'pl': 'nieustraszenie', 'ru': 'бесстрашно, неустрашимо', 'tr': 'korkusuzca', 'uk': 'безстрашно', 'zh': '勇敢地，大无畏地' },
  'deliciously': { 'de': 'köstlich', 'en': 'deliciously', 'es': 'deliciosamente', 'fr': 'délicieusement', 'it': 'deliziosamente', 'ja': 'とても美味しく', 'ko': '맛있게', 'pl': 'pysznie, wyśmienicie', 'ru': 'восхитительно, очень вкусно', 'tr': 'lezzetli bir şekilde', 'uk': 'чудово, дуже смачно', 'zh': '美味地' },
  'didn\'t': { 'de': 'nicht (Vergangenheit)', 'en': 'didn\'t (did not)', 'es': 'no (pasado)', 'fr': 'n\'a pas', 'it': 'non (passato)', 'ja': '〜しなかった', 'ko': '~하지 않았다', 'pl': 'nie (w przeszłości)', 'ru': 'не (в прошлом времени)', 'tr': 'yapmadı', 'uk': 'не (в минулому)', 'zh': '没有（过去式否定）' },
  'eat': { 'de': 'essen', 'en': 'eat', 'es': 'comer', 'fr': 'manger', 'it': 'mangiare', 'ja': '食べる', 'ko': '먹다', 'pl': 'jeść', 'ru': 'есть, кушать', 'tr': 'yemek yemek', 'uk': 'їсти', 'zh': '吃' },
  'emma': { 'de': 'Emma', 'en': 'Emma (name)', 'es': 'Emma', 'fr': 'Emma', 'it': 'Emma', 'ja': 'エマ', 'ko': '엠마', 'pl': 'Emma', 'ru': 'Эмма (имя)', 'tr': 'Emma', 'uk': 'Емма', 'zh': '艾玛（人名）' },
  'everything': { 'de': 'alles', 'en': 'everything', 'es': 'todo', 'fr': 'tout', 'it': 'tutto', 'ja': 'すべて', 'ko': '모든 것', 'pl': 'wszystko', 'ru': 'всё', 'tr': 'her şey', 'uk': 'все', 'zh': '一切，每件事' },
  'explain': { 'de': 'erklären', 'en': 'explain', 'es': 'explicar', 'fr': 'expliquer', 'it': 'spiegare', 'ja': '説明する', 'ko': '설명하다', 'pl': 'wyjaśniać', 'ru': 'объяснять', 'tr': 'açıklamak', 'uk': 'пояснювати', 'zh': '解释，说明' },
  'for': { 'cs': 'pro', 'de': 'für', 'en': 'for', 'es': 'para, por', 'fr': 'pour', 'ru': 'для, ради', 'uk': 'для, заради' },
  'forward': { 'de': 'vorwärts', 'en': 'forward', 'es': 'adelante', 'fr': 'en avant', 'it': 'avanti', 'ja': '前へ', 'ko': '앞으로', 'pl': 'naprzód', 'ru': 'вперёд', 'tr': 'ileri', 'uk': 'вперед', 'zh': '向前' },
  'fujiwara': { 'de': 'Fujiwara', 'en': 'Fujiwara', 'es': 'Fujiwara', 'fr': 'Fujiwara', 'it': 'Fujiwara', 'ja': '藤原（ふじわら）', 'ko': '후지와라', 'pl': 'Fujiwara', 'ru': 'Фудзивара (род самурая)', 'tr': 'Fujiwara', 'uk': 'Фудзівара', 'zh': '藤原氏' },
  'grand-children': { 'de': 'Enkelkinder', 'en': 'grand-children', 'es': 'nietos', 'fr': 'petits-enfants', 'it': 'nipoti', 'ja': '孫たち', 'ko': '손주들', 'pl': 'wnuki', 'ru': 'внуки', 'tr': 'torunlar', 'uk': 'онуки', 'zh': '孙子孙女' },
  'hadn\'t': { 'de': 'hatte nicht', 'en': 'hadn\'t (had not)', 'es': 'no había', 'fr': 'n\'avait pas', 'it': 'non aveva', 'ja': '〜していなかった', 'ko': '~하지 않았었다', 'pl': 'nie miał (zaprzeszły)', 'ru': 'не имел, не (предпрошедшее)', 'tr': 'yapmamıştı', 'uk': 'не мав', 'zh': '还没（过去完成否定）' },
  'harmlessly': { 'de': 'harmlos', 'en': 'harmlessly', 'es': 'inofensivamente', 'fr': 'inoffensivement', 'it': 'innocuamente', 'ja': '害を与えずに', 'ko': '해를 끼치지 않고', 'pl': 'nieszkodliwie', 'ru': 'безвредно, безобидно', 'tr': 'zararsızca', 'uk': 'нешкідливо', 'zh': '无害地' },
  'haven\'t': { 'de': 'habe nicht', 'en': 'haven\'t (have not)', 'es': 'no he, no tengo', 'fr': 'n\'ai pas', 'it': 'non ho', 'ja': 'まだ〜していない', 'ko': '~하지 않았다, 없다', 'pl': 'nie mam', 'ru': 'не имею, не', 'tr': 'yapmadım, yok', 'uk': 'не маю', 'zh': '还没有，没有' },
  'he': { 'de': 'er', 'en': 'he', 'es': 'él', 'fr': 'il', 'it': 'lui', 'ja': '彼', 'ko': '그', 'pl': 'on', 'ru': 'он', 'tr': 'o', 'uk': 'він', 'zh': '他' },
  'henceforth': { 'de': 'fortan', 'en': 'henceforth', 'es': 'de ahora en adelante', 'fr': 'dorénavant', 'it': 'd\'ora in poi', 'ja': 'これ以降', 'ko': '이제부터는', 'pl': 'odtąd', 'ru': 'впредь, с этого времени', 'tr': 'bundan böyle', 'uk': 'відтепер', 'zh': '从此以后' },
  'her': { 'cs': 'její', 'de': 'ihr', 'en': 'her', 'es': 'su, de ella', 'fr': 'son/sa/ses (à elle)', 'ru': 'её', 'uk': 'її' },
  'hidesato': { 'de': 'Hidesato', 'en': 'Hidesato', 'es': 'Hidesato', 'fr': 'Hidesato', 'it': 'Hidesato', 'ja': '秀郷（ひでさと）', 'ko': '히데사토', 'pl': 'Hidesato', 'ru': 'Хидэсато (имя самурая)', 'tr': 'Hidesato', 'uk': 'Хідесато', 'zh': '秀乡' },
  'himself': { 'de': 'sich selbst', 'en': 'himself', 'es': 'él mismo', 'fr': 'lui-même', 'it': 'se stesso', 'ja': '彼自身', 'ko': '그 자신', 'pl': 'sam, siebie', 'ru': 'сам, себя', 'tr': 'kendisi', 'uk': 'сам, себе', 'zh': '他自己' },
  'his': { 'cs': 'jeho', 'de': 'sein', 'en': 'his', 'es': 'su, de él', 'fr': 'son/sa/ses (à lui)', 'ru': 'его', 'uk': 'його' },
  'hung': { 'de': 'hing', 'en': 'hung', 'es': 'colgó', 'fr': 'suspendu', 'it': 'ha appeso', 'ja': '掛けた、ぶら下がった', 'ko': '걸었다', 'pl': 'wisiał, powiesił', 'ru': 'висел, повесил', 'tr': 'astı', 'uk': 'висів, повісив', 'zh': '悬挂，挂着' },
  'i': { 'de': 'ich', 'en': 'I', 'es': 'yo', 'fr': 'je', 'it': 'io', 'ja': '私', 'ko': '나, 저', 'pl': 'ja', 'ru': 'я', 'tr': 'ben', 'uk': 'я', 'zh': '我' },
  'i\'d': { 'de': 'ich würde', 'en': 'I\'d (I would/had)', 'es': 'yo querría/había', 'fr': 'je voudrais', 'it': 'vorrei', 'ja': '私は〜したい', 'ko': '나는 ~하겠다', 'pl': 'ja bym', 'ru': 'я бы, я имел', 'tr': 'isterdim', 'uk': 'я б, я мав', 'zh': '我想要，我曾' },
  'i\'ll': { 'de': 'ich werde', 'en': 'I\'ll (I will)', 'es': 'yo voy a', 'fr': 'je vais', 'it': 'io farò', 'ja': '私は〜します', 'ko': '나는 ~할 것이다', 'pl': 'ja będę', 'ru': 'я буду', 'tr': 'ben yapacağım', 'uk': 'я буду', 'zh': '我将会' },
  'i\'m': { 'de': 'ich bin', 'en': 'I\'m (I am)', 'es': 'yo soy/estoy', 'fr': 'je suis', 'it': 'io sono', 'ja': '私は〜です', 'ko': '나는 ~이다', 'pl': 'jestem', 'ru': 'я (есть)', 'tr': 'ben', 'uk': 'я (є)', 'zh': '我是' },
  'i\'ve': { 'de': 'ich habe', 'en': 'I\'ve (I have)', 'es': 'he, tengo', 'fr': 'j\'ai', 'it': 'ho', 'ja': '私は〜した', 'ko': '나는 ~했다, 가지고 있다', 'pl': 'mam', 'ru': 'у меня есть, я', 'tr': 'sahibim', 'uk': 'у мене є, я', 'zh': '我有，我已经' },
  'in': { 'cs': 'v, ve', 'de': 'in', 'en': 'in, inside', 'es': 'en, dentro de', 'fr': 'dans, en', 'ru': 'в, внутри', 'uk': 'в, у, всередині' },
  'is': { 'cs': 'je (být)', 'de': 'ist (sein)', 'en': 'is (to be)', 'es': 'es, está (ser/estar)', 'fr': 'est (être)', 'ru': 'есть, является (быть)', 'uk': 'є, знаходиться (бути)' },
  'isn\'t': { 'de': 'ist nicht', 'en': 'isn\'t (is not)', 'es': 'no es, no está', 'fr': 'n\'est pas', 'it': 'non è', 'ja': '〜ではない', 'ko': '~이 아니다', 'pl': 'nie jest', 'ru': 'не является, нет', 'tr': 'değil', 'uk': 'не є', 'zh': '不是' },
  'it': { 'cs': 'to, ono', 'de': 'es', 'en': 'it', 'es': 'eso, ello', 'fr': 'il/elle, cela', 'ru': 'оно, это', 'uk': 'воно, це' },
  'it\'s': { 'de': 'es ist', 'en': 'it\'s (it is)', 'es': 'es, está', 'fr': 'c\'est', 'it': 'è', 'ja': 'それは〜です', 'ko': '그것은 ~이다', 'pl': 'to jest', 'ru': 'это, оно', 'tr': 'bu, o', 'uk': 'це', 'zh': '这是，它是' },
  'itself': { 'de': 'sich selbst', 'en': 'itself', 'es': 'sí mismo', 'fr': 'lui-même', 'it': 'se stesso', 'ja': 'それ自体', 'ko': '그것 자체', 'pl': 'samo, siebie', 'ru': 'само, себя', 'tr': 'kendisi', 'uk': 'саме, себе', 'zh': '它本身' },
  'japan': { 'de': 'Japan', 'en': 'Japan', 'es': 'Japón', 'fr': 'Japon', 'it': 'Giappone', 'ja': '日本', 'ko': '일본', 'pl': 'Japonia', 'ru': 'Япония', 'tr': 'Japonya', 'uk': 'Японія', 'zh': '日本' },
  'koto': { 'de': 'Koto (Harfe)', 'en': 'koto (harp)', 'es': 'koto (arpa)', 'fr': 'koto (instrument)', 'it': 'koto', 'ja': '箏（こと）', 'ko': '고토 (악기)', 'pl': 'koto (instrument)', 'ru': 'кото (японский инструмент)', 'tr': 'koto', 'uk': 'кото (інструмент)', 'zh': '古筝（日本筝）' },
  'leo': { 'de': 'Leo', 'en': 'Leo (name)', 'es': 'Leo', 'fr': 'Leo', 'it': 'Leo', 'ja': 'レオ', 'ko': '레오', 'pl': 'Leo', 'ru': 'Лео (имя)', 'tr': 'Leo', 'uk': 'Лео', 'zh': '里奥（人名）' },
  'let\'s': { 'de': 'lass uns', 'en': 'let\'s (let us)', 'es': 'vamos a', 'fr': 'allons-y', 'it': 'facciamo', 'ja': '〜しましょう', 'ko': '~하자', 'pl': 'chodźmy, zróbmy', 'ru': 'давайте, давай', 'tr': 'hadi, yapalım', 'uk': 'давайте', 'zh': '让我们，咱们' },
  'lisbon': { 'de': 'Lissabon', 'en': 'Lisbon', 'es': 'Lisboa', 'fr': 'Lisbonne', 'it': 'Lisbona', 'ja': 'リスボン', 'ko': '리스본', 'pl': 'Lizbona', 'ru': 'Лиссабон', 'tr': 'Lizbon', 'uk': 'Лісабон', 'zh': '里斯本' },
  'man': { 'de': 'Mann, Mensch', 'en': 'man', 'es': 'hombre', 'fr': 'homme', 'it': 'uomo', 'ja': '男、人間', 'ko': '남자, 사람', 'pl': 'mężczyzna, człowiek', 'ru': 'человек, мужчина', 'tr': 'adam, insan', 'uk': 'людина, чоловік', 'zh': '男人，人类' },
  'maya': { 'de': 'Maya', 'en': 'Maya (name)', 'es': 'Maya', 'fr': 'Maya', 'it': 'Maya', 'ja': 'マヤ', 'ko': '마야', 'pl': 'Maja', 'ru': 'Майя (имя)', 'tr': 'Maya', 'uk': 'Майя', 'zh': '玛雅（人名）' },
  'mikami': { 'de': 'Berg Mikami', 'en': 'Mikami (mountain)', 'es': 'Mikami (montaña)', 'fr': 'Mont Mikami', 'it': 'Monte Mikami', 'ja': '三上山（みかみやま）', 'ko': '미카미산', 'pl': 'Mikami (góra)', 'ru': 'Миками (гора)', 'tr': 'Mikami (dağ)', 'uk': 'Мікамі (гора)', 'zh': '三上山' },
  'myself': { 'de': 'mich selbst', 'en': 'myself', 'es': 'yo mismo', 'fr': 'moi-même', 'it': 'me stesso', 'ja': '自分自身', 'ko': '나 자신', 'pl': 'sam, siebie', 'ru': 'сам, себя', 'tr': 'kendim', 'uk': 'сам, себе', 'zh': '我自己' },
  'nina': { 'de': 'Nina', 'en': 'Nina (name)', 'es': 'Nina', 'fr': 'Nina', 'it': 'Nina', 'ja': 'ニーナ', 'ko': '니나', 'pl': 'Nina', 'ru': 'Нина (имя)', 'tr': 'Nina', 'uk': 'Ніна', 'zh': '妮娜（人名）' },
  'of': { 'cs': 'z, ze, o', 'de': 'von', 'en': 'of', 'es': 'de', 'fr': 'de', 'ru': 'из, о, (родительный падеж)', 'uk': 'з, про, (родовий відмінок)' },
  'oh': { 'de': 'oh!', 'en': 'oh', 'es': '¡oh!, ¡ah!', 'fr': 'oh !', 'it': 'oh!', 'ja': 'ああ！', 'ko': '오!, 아!', 'pl': 'o!, och!', 'ru': 'о!, ой!', 'tr': 'oh!, ah!', 'uk': 'о!, ой!', 'zh': '哦！哎呀！' },
  'on': { 'cs': 'na', 'de': 'auf, an', 'en': 'on, upon', 'es': 'sobre, en', 'fr': 'sur', 'ru': 'на, по', 'uk': 'на' },
  'or': { 'de': 'oder', 'en': 'or', 'es': 'o', 'fr': 'ou', 'it': 'o, oppure', 'ja': 'または', 'ko': '또는', 'pl': 'lub, albo', 'ru': 'или, либо', 'tr': 'veya, ya da', 'uk': 'або, чи', 'zh': '或者' },
  'patel': { 'de': 'Patel', 'en': 'Patel (surname)', 'es': 'Patel', 'fr': 'Patel', 'it': 'Patel', 'ja': 'パテル', 'ko': '파텔', 'pl': 'Patel', 'ru': 'Патель (фамилия)', 'tr': 'Patel', 'uk': 'Патель', 'zh': '帕特尔（姓氏）' },
  'practise': { 'de': 'üben', 'en': 'practise', 'es': 'practicar', 'fr': 'pratiquer', 'it': 'esercitarsi', 'ja': '練習する', 'ko': '연습하다', 'pl': 'ćwiczyć', 'ru': 'практиковать, упражняться', 'tr': 'pratik yapmak', 'uk': 'практикувати', 'zh': '练习，实习' },
  'promised': { 'de': 'versprach', 'en': 'promised', 'es': 'prometió', 'fr': 'promis', 'it': 'ha promesso', 'ja': '約束した', 'ko': '약속했다', 'pl': 'obiecał', 'ru': 'обещал, обещанный', 'tr': 'söz verdi', 'uk': 'обіцяв', 'zh': '答应，许诺' },
  'rainy': { 'de': 'regnerisch', 'en': 'rainy', 'es': 'lluvioso', 'fr': 'pluvieux', 'it': 'piovoso', 'ja': '雨降りの', 'ko': '비가 오는', 'pl': 'deszczowy', 'ru': 'дождливый', 'tr': 'yağmurlu', 'uk': 'дощовий', 'zh': '下雨的，多雨的' },
  'red-carp': { 'de': 'roter Karpfen', 'en': 'red carp', 'es': 'carpa roja', 'fr': 'carpe rouge', 'it': 'carpa rossa', 'ja': '赤鯉（あかごい）', 'ko': '붉은 잉어', 'pl': 'czerwony karp', 'ru': 'красный карп', 'tr': 'kızıl sazan', 'uk': 'червоний короп', 'zh': '红鲤鱼' },
  'restarting': { 'de': 'Neustart', 'en': 'restarting', 'es': 'reiniciando', 'fr': 'redémarrage', 'it': 'riavvio', 'ja': '再起動中', 'ko': '다시 시작하는 중', 'pl': 'restartowanie', 'ru': 'перезапуск, перезагрузка', 'tr': 'yeniden başlatma', 'uk': 'перезапуск', 'zh': '重新启动' },
  'salt-water': { 'de': 'Salzwasser-', 'en': 'salt water', 'es': 'de agua salada', 'fr': 'd\'eau salée', 'it': 'di acqua salata', 'ja': '海水、塩水', 'ko': '바닷물, 염수', 'pl': 'słonowodny', 'ru': 'морской, солоноводный', 'tr': 'tuzlu su', 'uk': 'морський', 'zh': '咸水，海洋的' },
  'samisen': { 'de': 'Schamisen', 'en': 'shamisen (lute)', 'es': 'shamisen', 'fr': 'shamisen', 'it': 'shamisen', 'ja': '三味線（しゃみせん）', 'ko': '샤미센 (악기)', 'pl': 'shamisen', 'ru': 'сямисэн (японская лютня)', 'tr': 'şamisen', 'uk': 'сямісен', 'zh': '三味线' },
  'sara': { 'de': 'Sara', 'en': 'Sara (name)', 'es': 'Sara', 'fr': 'Sara', 'it': 'Sara', 'ja': 'サラ', 'ko': '사라', 'pl': 'Sara', 'ru': 'Сара (имя)', 'tr': 'Sara', 'uk': 'Сара', 'zh': '萨拉（人名）' },
  'sea-green': { 'de': 'meergrün', 'en': 'sea green', 'es': 'verde mar', 'fr': 'vert d\'eau', 'it': 'verde mare', 'ja': 'シーグリーン（海緑色）', 'ko': '바다 녹색', 'pl': 'morski (kolor)', 'ru': 'морской волны (цвет)', 'tr': 'deniz yeşili', 'uk': 'кольору морської хвилі', 'zh': '海绿色' },
  'serpent-dragon': { 'de': 'Schlangendrache', 'en': 'serpent dragon', 'es': 'serpiente dragón', 'fr': 'serpent-dragon', 'it': 'serpente drago', 'ja': '大蛇の竜', 'ko': '뱀 용', 'pl': 'wąż-smok', 'ru': 'змей-дракон', 'tr': 'yılan ejderha', 'uk': 'змій-дракон', 'zh': '巨蛇神龙' },
  'seta-no-karashi': { 'de': 'Seta-no-Karashi-Brücke', 'en': 'Seta-no-Karashi (bridge)', 'es': 'Seta-no-Karashi (puente)', 'fr': 'Seta-no-Karashi (pont)', 'it': 'Seta-no-Karashi (ponte)', 'ja': '瀬田の唐橋', 'ko': '세타노카라하시 (다리)', 'pl': 'Seta-no-Karashi (most)', 'ru': 'Сета-но-Караси (мост)', 'tr': 'Seta-no-Karashi (köprü)', 'uk': 'Сета-но-Карасі (міст)', 'zh': '势多唐桥' },
  'she\'s': { 'de': 'sie ist', 'en': 'she\'s (she is)', 'es': 'ella es/está', 'fr': 'elle est', 'it': 'lei è', 'ja': '彼女は〜です', 'ko': '그녀는 ~이다', 'pl': 'ona jest', 'ru': 'она (есть)', 'tr': 'o (kadın)', 'uk': 'вона (є)', 'zh': '她是' },
  'someone': { 'de': 'jemand', 'en': 'someone', 'es': 'alguien', 'fr': 'quelqu\'un', 'it': 'qualcuno', 'ja': '誰か', 'ko': '누군가', 'pl': 'ktoś', 'ru': 'кто-то, кое-кто', 'tr': 'biri, birisi', 'uk': 'хтось', 'zh': '某人，有人' },
  'strange-looking': { 'de': 'seltsam aussehend', 'en': 'strange looking', 'es': 'de aspecto extraño', 'fr': 'à l\'allure étrange', 'it': 'dall\'aspetto strano', 'ja': '奇妙な見た目の', 'ko': '이상하게 생긴', 'pl': 'dziwnie wyglądający', 'ru': 'странного вида, необычный', 'tr': 'garip görünümlü', 'uk': 'дивовижного вигляду', 'zh': '样貌奇特的' },
  'tawara': { 'de': 'Tawara', 'en': 'Tawara', 'es': 'Tawara', 'fr': 'Tawara', 'it': 'Tawara', 'ja': '俵（たわら）', 'ko': '타와라', 'pl': 'Tawara', 'ru': 'Тавара (прозвище: мешок)', 'tr': 'Tawara', 'uk': 'Тавара (мішок)', 'zh': '俵（米袋）' },
  'the': { 'cs': 'určitý člen (ten/ta/to)', 'de': 'der/die/das', 'en': 'definite article (this/that)', 'es': 'el/la/los/las', 'fr': 'le/la/les', 'ru': 'определенный артикль (этот)', 'uk': 'визначений артикль (цей)' },
  'theatre': { 'de': 'Theater', 'en': 'theatre', 'es': 'teatro', 'fr': 'théâtre', 'it': 'teatro', 'ja': '劇場', 'ko': '극장', 'pl': 'teatr', 'ru': 'театр', 'tr': 'tiyatro', 'uk': 'театр', 'zh': '剧场，戏院' },
  'their': { 'cs': 'jejich', 'de': 'ihr', 'en': 'their', 'es': 'su, sus (de ellos)', 'fr': 'leur/leurs', 'ru': 'их', 'uk': 'їхній, їх' },
  'there\'s': { 'de': 'es gibt', 'en': 'there\'s (there is)', 'es': 'hay', 'fr': 'il y a', 'it': 'c\'è', 'ja': '〜がある', 'ko': '~이 있다', 'pl': 'jest, znajduje się', 'ru': 'там есть, имеется', 'tr': 'var, bulunur', 'uk': 'там є, є', 'zh': '有，存在' },
  'they': { 'cs': 'oni', 'de': 'sie', 'en': 'they', 'es': 'ellos/ellas', 'fr': 'ils/elles', 'ru': 'они', 'uk': 'вони' },
  'they\'ll': { 'de': 'sie werden', 'en': 'they\'ll (they will)', 'es': 'ellos van a', 'fr': 'ils vont', 'it': 'loro faranno', 'ja': '彼らは〜するでしょう', 'ko': '그들은 ~할 것이다', 'pl': 'oni będą', 'ru': 'они будут', 'tr': 'onlar yapacak', 'uk': 'вони будуть', 'zh': '他们将会' },
  'they\'re': { 'de': 'sie sind', 'en': 'they\'re (they are)', 'es': 'ellos son/están', 'fr': 'ils sont', 'it': 'loro sono', 'ja': '彼らは〜です', 'ko': '그들은 ~이다', 'pl': 'oni są', 'ru': 'они (являются)', 'tr': 'onlar', 'uk': 'вони (є)', 'zh': '他们是' },
  'throw': { 'de': 'werfen', 'en': 'throw', 'es': 'lanzar, tirar', 'fr': 'jeter, lancer', 'it': 'lanciare', 'ja': '投げる', 'ko': '던지다', 'pl': 'rzucać', 'ru': 'бросать, кидать', 'tr': 'atmak, fırlatmak', 'uk': 'кидати', 'zh': '扔，抛' },
  'to': { 'cs': 'k, do, směrem k', 'de': 'zu, nach', 'en': 'towards, to', 'es': 'a, hacia', 'fr': 'à, vers', 'ru': 'к, в, по направлению к', 'uk': 'до, в, назустріч' },
  'toda': { 'de': 'Toda', 'en': 'Toda', 'es': 'Toda', 'fr': 'Toda', 'it': 'Toda', 'ja': '藤太（とうた）', 'ko': '토다', 'pl': 'Toda', 'ru': 'Тода (имя воина)', 'tr': 'Toda', 'uk': 'Тода (ім’я)', 'zh': '藤太' },
  'tom': { 'de': 'Tom', 'en': 'Tom (name)', 'es': 'Tom', 'fr': 'Tom', 'it': 'Tom', 'ja': 'トム', 'ko': '톰', 'pl': 'Tom', 'ru': 'Том (имя)', 'tr': 'Tom', 'uk': 'Том', 'zh': '汤姆（人名）' },
  'twenty-five': { 'de': 'fünfundzwanzig (25)', 'en': 'twenty-five', 'es': 'veinticinco (25)', 'fr': 'vingt-cinq (25)', 'it': 'venticinque (25)', 'ja': '二十五 (25)', 'ko': '스물다섯 (25)', 'pl': 'dwadzieścia pięć (25)', 'ru': 'двадцать пять (25)', 'tr': 'yirmi beş (25)', 'uk': 'двадцять п\'ять (25)', 'zh': '二十五 (25)' },
  'under': { 'cs': 'pod', 'de': 'unter', 'en': 'under', 'es': 'debajo de, bajo', 'fr': 'sous', 'ru': 'под', 'uk': 'під' },
  'unsure': { 'de': 'unsicher', 'en': 'unsure', 'es': 'inseguro', 'fr': 'incertain', 'it': 'insicuro', 'ja': '不確かな', 'ko': '확신하지 못하는', 'pl': 'niepewny', 'ru': 'неуверенный', 'tr': 'emin olmayan', 'uk': 'невпевнений', 'zh': '不确定的' },
  'was': { 'cs': 'byl/byla/bylo (být)', 'de': 'war (sein)', 'en': 'was (to be)', 'es': 'era, fue, estaba (ser/estar)', 'fr': 'était (être)', 'ru': 'был, была, было (быть)', 'uk': 'був, була, було (бути)' },
  'we': { 'de': 'wir', 'en': 'we', 'es': 'nosotros', 'fr': 'nous', 'it': 'noi', 'ja': '私たち', 'ko': '우리', 'pl': 'my', 'ru': 'мы', 'tr': 'biz', 'uk': 'ми', 'zh': '我们' },
  'we\'ll': { 'de': 'wir werden', 'en': 'we\'ll (we will)', 'es': 'nosotros vamos a', 'fr': 'nous allons', 'it': 'noi faremo', 'ja': '私たちは〜するでしょう', 'ko': '우리는 ~할 것이다', 'pl': 'my będziemy', 'ru': 'мы будем', 'tr': 'biz yapacağız', 'uk': 'ми будемо', 'zh': '我们将会' },
  'we\'re': { 'de': 'wir sind', 'en': 'we\'re (we are)', 'es': 'nosotros somos/estamos', 'fr': 'nous sommes', 'it': 'noi siamo', 'ja': '私たちは〜です', 'ko': '우리는 ~이다', 'pl': 'my jesteśmy', 'ru': 'мы (являемся)', 'tr': 'biziz', 'uk': 'ми (є)', 'zh': '我们是' },
  'we\'ve': { 'de': 'wir haben', 'en': 'we\'ve (we have)', 'es': 'hemos, tenemos', 'fr': 'nous avons', 'it': 'abbiamo', 'ja': '私たちは〜した', 'ko': '우리는 ~했다, 가지고 있다', 'pl': 'mamy', 'ru': 'у нас есть, мы', 'tr': 'biz sahibiz', 'uk': 'у нас є, ми', 'zh': '我们已经，我们有' },
  'what\'s': { 'de': 'was ist', 'en': 'what\'s (what is)', 'es': 'qué es', 'fr': 'qu\'est-ce que', 'it': 'cos\'è', 'ja': '何ですか', 'ko': '무엇인가', 'pl': 'co to jest', 'ru': 'что такое, в чём', 'tr': 'nedir, ne', 'uk': 'що таке', 'zh': '什么是，怎么了' },
  'when': { 'de': 'wann, wenn', 'en': 'when', 'es': 'cuándo, cuando', 'fr': 'quand', 'it': 'quando', 'ja': 'いつ、〜の時', 'ko': '언제, ~할 때', 'pl': 'kiedy, gdy', 'ru': 'когда', 'tr': 'ne zaman, -dığı zaman', 'uk': 'коли', 'zh': '当……时候，何时' },
  'wi-fi': { 'de': 'WLAN', 'en': 'Wi-Fi', 'es': 'wifi', 'fr': 'wi-fi', 'it': 'wi-fi', 'ja': 'Wi-Fi（ワイファイ）', 'ko': '와이파이 (Wi-Fi)', 'pl': 'wi-fi', 'ru': 'вай-фай (беспроводной интернет)', 'tr': 'wi-fi', 'uk': 'вай-фай', 'zh': '无线网络 (Wi-Fi)' },
  'with': { 'cs': 's, se', 'de': 'mit', 'en': 'with', 'es': 'con', 'fr': 'avec', 'ru': 'с, вместе с', 'uk': 'з, разом з' },
  'worries': { 'de': 'Sorgen', 'en': 'worries', 'es': 'preocupaciones', 'fr': 'soucis', 'it': 'preoccupazioni', 'ja': '心配事', 'ko': '걱정거리', 'pl': 'zmartwienia', 'ru': 'заботы, беспокоится', 'tr': 'endişeler', 'uk': 'турботи, хвилюється', 'zh': '烦恼，担心' },
  'worry': { 'de': 'sich sorgen', 'en': 'worry', 'es': 'preocuparse', 'fr': 's\'inquiéter', 'it': 'preoccuparsi', 'ja': '心配する', 'ko': '걱정하다', 'pl': 'martwić się', 'ru': 'беспокоиться, волноваться', 'tr': 'endişelenmek', 'uk': 'хвилюватися', 'zh': '担心' },
  'you': { 'de': 'du, Sie', 'en': 'you', 'es': 'tú, usted', 'fr': 'tu, vous', 'it': 'tu, voi', 'ja': 'あなた', 'ko': '당신, 너', 'pl': 'ty, wy', 'ru': 'ты, вы', 'tr': 'sen, siz', 'uk': 'ти, ви', 'zh': '你，您' },
  'you\'re': { 'de': 'du bist, Sie sind', 'en': 'you\'re (you are)', 'es': 'tú eres, usted es', 'fr': 'tu es, vous êtes', 'it': 'tu sei, voi siete', 'ja': 'あなたは〜です', 'ko': '당신은 ~이다', 'pl': 'jesteś, jesteście', 'ru': 'ты (являешься), вы', 'tr': 'sensin, sizsiniz', 'uk': 'ти (є), ви', 'zh': '你是，您是' },
  'you\'ve': { 'de': 'du hast, Sie haben', 'en': 'you\'ve (you have)', 'es': 'has, tienes', 'fr': 'tu as, vous avez', 'it': 'hai, avete', 'ja': 'あなたは〜した', 'ko': '당신은 ~했다, 가지고 있다', 'pl': 'masz, macie', 'ru': 'у тебя есть, вы', 'tr': 'sen sahipsin', 'uk': 'у тебе є, ви', 'zh': '你已经，你有' },
  'yourself': { 'de': 'du selbst', 'en': 'yourself', 'es': 'tú mismo', 'fr': 'toi-même', 'it': 'te stesso', 'ja': 'あなた自身', 'ko': '당신 자신', 'pl': 'sam, siebie', 'ru': 'сам, себя', 'tr': 'kendin', 'uk': 'сам, себе', 'zh': '你自己' },
};


const IRREGULAR_VERBS_MAP = {
  'am': 'be', 'is': 'be', 'are': 'be', 'was': 'be', 'were': 'be', 'been': 'be',
  'has': 'have', 'had': 'have', 'having': 'have',
  'does': 'do', 'did': 'do', 'doing': 'do', 'done': 'do',
  'goes': 'go', 'went': 'go', 'gone': 'go', 'going': 'go',
  'said': 'say', 'says': 'say', 'saying': 'say',
  'gave': 'give', 'given': 'give', 'gives': 'give', 'giving': 'give',
  'came': 'come', 'comes': 'come', 'coming': 'come',
  'drank': 'drink', 'drunk': 'drink', 'drinks': 'drink', 'drinking': 'drink',
  'saw': 'see', 'seen': 'see', 'sees': 'see', 'seeing': 'see',
  'became': 'become', 'becomes': 'become', 'becoming': 'become',
  'began': 'begin', 'begun': 'begin', 'begins': 'begin', 'beginning': 'begin',
  'brought': 'bring', 'brings': 'bring', 'bringing': 'bring',
  'built': 'build', 'builds': 'build', 'building': 'build',
  'caught': 'catch', 'catches': 'catch', 'catching': 'catch',
  'fell': 'fall', 'fallen': 'fall', 'falls': 'fall', 'falling': 'fall',
  'felt': 'feel', 'feels': 'feel', 'feeling': 'feel',
  'flew': 'fly', 'flown': 'fly', 'flies': 'fly', 'flying': 'fly',
  'found': 'find', 'finds': 'find', 'finding': 'find',
  'got': 'get', 'gotten': 'get', 'gets': 'get', 'getting': 'get',
  'grew': 'grow', 'grown': 'grow', 'grows': 'grow', 'growing': 'grow',
  'heard': 'hear', 'hears': 'hear', 'hearing': 'hear',
  'hung': 'hang', 'hangs': 'hang', 'hanging': 'hang',
  'kept': 'keep', 'keeps': 'keep', 'keeping': 'keep',
  'knew': 'know', 'known': 'know', 'knows': 'know', 'knowing': 'know',
  'made': 'make', 'makes': 'make', 'making': 'make',
  'ran': 'run', 'runs': 'run', 'running': 'run',
  'sat': 'sit', 'sits': 'sit', 'sitting': 'sit',
  'shone': 'shine', 'shines': 'shine', 'shining': 'shine',
  'shaken': 'shake', 'shook': 'shake', 'shakes': 'shake',
  'stood': 'stand', 'stands': 'stand', 'standing': 'stand',
  'struck': 'strike', 'strikes': 'strike', 'striking': 'strike',
  'stuck': 'stick', 'sticks': 'stick', 'sticking': 'stick',
  'took': 'take', 'taken': 'take', 'takes': 'take', 'taking': 'take',
  'told': 'tell', 'tells': 'tell', 'telling': 'tell',
  'sent': 'send', 'sends': 'send', 'sending': 'send',
  'slept': 'sleep', 'sleeps': 'sleep', 'sleeping': 'sleep',
  'thought': 'think', 'thinks': 'think', 'thinking': 'think',
  'won': 'win', 'wins': 'win', 'winning': 'win',
  'wrote': 'write', 'written': 'write', 'writes': 'write',
  'lost': 'lose', 'loses': 'lose', 'losing': 'lose',
  'left': 'leave', 'leaves': 'leave', 'leaving': 'leave',
  'met': 'meet', 'meets': 'meet', 'meeting': 'meet',
  'paid': 'pay', 'pays': 'pay', 'paying': 'pay',
  'read': 'read', 'reads': 'read', 'reading': 'read',
  'sold': 'sell', 'sells': 'sell', 'selling': 'sell',
  'spent': 'spend', 'spends': 'spend', 'spending': 'spend',
  'understood': 'understand', 'understands': 'understand',
  'held': 'hold', 'holds': 'hold', 'holding': 'hold',
  'men': 'man men', 'children': 'child',
  'lying': 'lie', 'eat': 'eat',
  'fitting': 'fit', 'fitted': 'fit',
  'putting': 'put', 'stepped': 'step', 'stopped': 'stop',
  'begged': 'beg', 'replied': 'reply', 'carried': 'carry', 'tried': 'try',
  'worries': 'worry', 'worry': 'worry', 'promised': 'promise',
  'terrified': 'terrify', 'sallied': 'sally', 'spanning': 'span',
  'shipping': 'ship', 'restarting': 'restart',
};

const SPELLING_VARIANTS_MAP = {
  'practise': 'practice',
  'theatre': 'theater',
};



function resolveWord(rawWord, dictMap, lang) {
  let clean = String(rawWord || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u02BB]/g, "'")
    .replace(/[^a-z'-]/g, '')
    .trim()
    .replace(/^['-]+|['-]+$/g, '');
  if (!clean) return null;

  // 1. Direct dictionary match
  if (dictMap.has(clean)) {
    const w = dictMap.get(clean);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getWordTranslation(w, lang) || w.translation || '',
      isFromDict: true,
      rawObj: w
    };
  }

  // 2. Direct function / story words map (pronouns, contractions, names, function words across all 36 locales)
  if (FUNCTION_WORDS_MAP[clean]) {
    const entry = FUNCTION_WORDS_MAP[clean];
    const trans = entry[lang] || entry['en'] || entry['ru'] || clean;
    return {
      id: null,
      word: clean,
      transcription: '',
      translation: trans,
      isFromDict: false,
      rawObj: null
    };
  }

  // 3. Possessive 's (e.g. dragon's -> dragon)
  if (clean.endsWith("'s")) {
    const base = clean.slice(0, -2);
    const resolvedBase = resolveWord(base, dictMap, lang);
    if (resolvedBase && resolvedBase.translation && resolvedBase.translation !== base) {
      return {
        ...resolvedBase,
        word: clean
      };
    }
  }

  // 4. UK / US spelling variants
  if (SPELLING_VARIANTS_MAP[clean]) {
    const alt = SPELLING_VARIANTS_MAP[clean];
    const resolvedAlt = resolveWord(alt, dictMap, lang);
    if (resolvedAlt && resolvedAlt.translation && resolvedAlt.translation !== alt) {
      return {
        ...resolvedAlt,
        word: clean
      };
    }
  }

  // 5. Comparatives (-er) & Superlatives (-est)
  if (clean.endsWith('est') || clean.endsWith('er')) {
    const candidates = clean.endsWith('est')
      ? [clean.slice(0, -3), clean.slice(0, -2), clean.slice(0, -4) + 'y', clean.slice(0, -4)]
      : [clean.slice(0, -2), clean.slice(0, -1), clean.slice(0, -3) + 'y', clean.slice(0, -3)];
    for (const cand of candidates) {
      if (dictMap.has(cand)) {
        const w = dictMap.get(cand);
        return {
          id: w.id,
          word: clean,
          transcription: w.transcription || '',
          translation: getWordTranslation(w, lang) || w.translation || '',
          isFromDict: true,
          rawObj: w
        };
      }
    }
  }

  // 6. Irregular verbs & inflections
  if (IRREGULAR_VERBS_MAP[clean] && dictMap.has(IRREGULAR_VERBS_MAP[clean])) {
    const w = dictMap.get(IRREGULAR_VERBS_MAP[clean]);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getWordTranslation(w, lang) || w.translation || '',
      isFromDict: true,
      rawObj: w
    };
  }

  // 7. Regular morphology: plurals & 3rd person -s/-es/-ies, -ed, -ing
  let baseCandidate = null;
  if (clean.endsWith('ies') && dictMap.has(clean.slice(0, -3) + 'y')) baseCandidate = clean.slice(0, -3) + 'y';
  else if (clean.endsWith('es') && dictMap.has(clean.slice(0, -2))) baseCandidate = clean.slice(0, -2);
  else if (clean.endsWith('s') && !clean.endsWith('ss') && dictMap.has(clean.slice(0, -1))) baseCandidate = clean.slice(0, -1);
  else if (clean.endsWith('ing') && dictMap.has(clean.slice(0, -3))) baseCandidate = clean.slice(0, -3);
  else if (clean.endsWith('ing') && dictMap.has(clean.slice(0, -3) + 'e')) baseCandidate = clean.slice(0, -3) + 'e';
  else if (clean.endsWith('ed') && dictMap.has(clean.slice(0, -2))) baseCandidate = clean.slice(0, -2);
  else if (clean.endsWith('ed') && dictMap.has(clean.slice(0, -1))) baseCandidate = clean.slice(0, -1);

  if (baseCandidate && dictMap.has(baseCandidate)) {
    const w = dictMap.get(baseCandidate);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getWordTranslation(w, lang) || w.translation || '',
      isFromDict: true,
      rawObj: w
    };
  }

  // 8. Fallback
  return {
    id: null,
    word: clean,
    transcription: '',
    translation: '',
    isFromDict: false,
    rawObj: null
  };
}


export function showStoryToast(message) {
  const existing = document.querySelector('.story-milestone-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'story-milestone-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

/**
 * Show the Milestone Story Reader modal
 * @param {number} milestone - 100 to 800
 */
export async function showMilestoneStoryModal(milestone = 0) {
  const existing = document.querySelector('#milestone-story-modal-overlay');
  if (existing) existing.remove();

  const currentMilestone = Number.isFinite(Number(milestone)) ? Number(milestone) : 0;
  const storyData = MILESTONE_STORIES[currentMilestone] || MILESTONE_STORIES[0];
  const story = storyData;

  const lang = getInterfaceLanguage();
  const strings = getStoryStrings(lang);
  const dictMap = await getOrBuildDictionary();

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Load user favorites set for heart states
  let favSet = new Set();
  try {
    const favs = await getUserFavorites();
    if (Array.isArray(favs)) {
      favs.forEach(f => favSet.add(String(f.id || f)));
    }
  } catch (e) {}

  const clickedWords = new Set();
  const overlay = document.createElement('div');
  overlay.id = 'milestone-story-modal-overlay';
  overlay.className = 'milestone-story-modal-overlay';

  // Build story HTML tokens
  const paragraphsHtml = storyData.paragraphs.map((p, pIdx) => {
    const normalizedP = p.replace(/[\u2018\u2019\u02BC\u02BB]/g, "'");
    const tokens = normalizedP.match(/[a-zA-Z'-]+|[^a-zA-Z'-]+/g) || [normalizedP];
    const tokensHtml = tokens.map((token, tIdx) => {
      const isWord = /[a-zA-Z]/.test(token);
      if (!isWord) {
        return `<span class="story-punct">${token}</span>`;
      }
      return `<span class="story-word-token" data-word="${token}" data-pidx="${pIdx}" data-tidx="${tIdx}">${token}</span>`;
    }).join('');
    return `<p class="story-paragraph">${tokensHtml}</p>`;
  }).join('');

  // Full translation HTML
  const translatedParas = strings[storyData.translationKey] || [];
  const translationParagraphsHtml = Array.isArray(translatedParas)
    ? translatedParas.map(tp => `<p class="story-translation-para">${tp}</p>`).join('')
    : `<p class="story-translation-para">${translatedParas}</p>`;
  const translationParagraphs = Array.isArray(translatedParas)
    ? translatedParas
    : (translatedParas ? [translatedParas] : []);

  const badgeText = strings[storyData.badgeKey] || strings.badge || `🏆 ${currentMilestone} слов`;
  const storyTitleText = strings[storyData.titleKey] || storyData.title;
  const storyTitle = storyTitleText;

  overlay.innerHTML = `
    <style>
      .milestone-story-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 15, 29, 0.85);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        padding: 16px;
        box-sizing: border-box;
        animation: storyOverlayFadeIn 0.25s ease-out;
      }
      @keyframes storyOverlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes storyCardSlideUp {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .milestone-story-card {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(251, 191, 36, 0.3);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15);
        border-radius: 24px;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: storyCardSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        box-sizing: border-box;
      }
      .milestone-story-header {
        padding: 18px 20px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .milestone-story-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fcd34d;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: 9999px;
        margin-bottom: 4px;
      }
      .milestone-story-title {
        font-size: 17px;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.25;
        margin: 0;
      }
      .milestone-story-close {
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #94a3b8;
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .milestone-story-close:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #f8fafc;
      }
      .milestone-story-body {
        padding: 16px 20px;
        overflow-y: auto;
        flex: 1;
        position: relative;
        -webkit-overflow-scrolling: touch;
      }
      .story-title-banner {
        font-size: 16px;
        font-weight: 800;
        color: #fbbf24;
        margin-bottom: 14px;
        text-align: center;
        font-family: inherit;
        letter-spacing: -0.2px;
      }
      .story-text-container {
        font-size: 16px;
        line-height: 1.85;
        color: #e2e8f0;
        user-select: text;
        -webkit-user-select: text;
      }
      .story-paragraph {
        margin: 0 0 14px;
        text-align: left;
      }
      .story-word-token {
        display: inline-block;
        padding: 1px 3px;
        margin: 0 1px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
        border-bottom: 1.5px dashed rgba(245, 158, 11, 0.35);
      }
      .story-word-token:hover {
        background: rgba(245, 158, 11, 0.2);
        color: #fef08a;
      }
      .story-word-token.active-token {
        background: #f59e0b !important;
        color: #0f172a !important;
        font-weight: 700;
        border-bottom-color: transparent;
      }
      .story-word-token.clicked-token {
        background: rgba(245, 158, 11, 0.25);
        color: #fde68a;
        border-bottom: 1.5px solid #f59e0b;
      }

      /* Floating Popover Tooltip positioned directly above the word */
      .story-floating-popover {
        position: absolute;
        z-index: 1000;
        display: none;
        background: #0f172a;
        border: 1.5px solid #f59e0b;
        border-radius: 14px;
        padding: 10px 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.75), 0 0 15px rgba(245, 158, 11, 0.25);
        min-width: 170px;
        max-width: 290px;
        box-sizing: border-box;
        pointer-events: auto;
        animation: storyPopoverFade 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes storyPopoverFade {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .story-popover-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }
      .story-popover-word {
        font-size: 16.5px;
        font-weight: 800;
        color: #f8fafc;
      }
      .story-popover-transcription {
        font-size: 12.5px;
        color: #94a3b8;
        margin-left: 6px;
        font-family: monospace;
      }
      .story-popover-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .popover-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #94a3b8;
        font-size: 14px;
        transition: all 0.15s ease;
      }
      .popover-btn:hover {
        background: rgba(255, 255, 255, 0.18);
        color: #f8fafc;
      }
      .popover-btn.is-favorited {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.15);
      }
      .story-popover-translation {
        font-size: 14px;
        color: #38bdf8;
        font-weight: 600;
        line-height: 1.35;
      }
      .story-popover-arrow {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #0f172a;
        border-right: 1.5px solid #f59e0b;
        border-bottom: 1.5px solid #f59e0b;
        transform: rotate(45deg);
        bottom: -6px;
        left: 50%;
        margin-left: -5px;
      }
      .story-floating-popover.place-below .story-popover-arrow {
        top: -6px;
        bottom: auto;
        border-right: none;
        border-bottom: none;
        border-left: 1.5px solid #f59e0b;
        border-top: 1.5px solid #f59e0b;
      }

      /* Full translation block */
      .story-full-translation-card {
        margin-top: 18px;
        padding: 14px 16px;
        background: rgba(56, 189, 248, 0.08);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-left: 4px solid #38bdf8;
        border-radius: 14px;
        animation: storyTranslationFade 0.2s ease-out;
      }
      @keyframes storyTranslationFade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .story-full-translation-header {
        font-size: 13px;
        font-weight: 700;
        color: #7dd3fc;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
      }
      .story-translation-para {
        font-size: 14.5px;
        line-height: 1.6;
        color: #cbd5e1;
        margin: 0 0 10px;
      }
      .story-translation-para:last-child {
        margin-bottom: 0;
      }

      /* Footer */
      .milestone-story-footer {
        padding: 14px 20px 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(15, 23, 42, 0.7);
      }
      .story-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        padding: 13px 20px;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .story-btn-primary:active {
        transform: scale(0.98);
      }
      .story-btn-translation {
        background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%) !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        padding: 13px 20px !important;
        min-height: 48px !important;
        border-radius: 16px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease !important;
        width: 100% !important;
      }
      .story-btn-translation:hover:not(:disabled) {
        filter: brightness(1.05) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45) !important;
      }
      .story-btn-translation:active:not(:disabled) {
        transform: translateY(1.5px) !important;
        box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25) !important;
      }

      .story-milestone-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #10b981;
        border-radius: 12px;
        padding: 10px 18px;
        font-size: 13.5px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 100001;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
      .story-milestone-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    </style>

    <div class="milestone-story-card" role="dialog" aria-modal="true">
      <div class="milestone-story-header">
        <h2 class="milestone-story-title">📖 ${storyTitleText}</h2>
        <button class="milestone-story-close" id="story-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="milestone-story-body" id="story-modal-body">

        <!-- Floating Popover over the tapped word -->
        <div class="story-floating-popover" id="story-popover">
          <div class="story-popover-top">
            <div style="display: flex; align-items: baseline;">
              <span class="story-popover-word" id="popover-word-text"></span>
              <span class="story-popover-transcription" id="popover-transcription-text"></span>
            </div>
            <div class="story-popover-actions">
              <button class="popover-btn" id="popover-audio-btn" title="Speak" aria-label="Audio">🔊</button>
              <button class="popover-btn" id="popover-heart-btn" title="Add to favorites" aria-label="Favorite">
                <svg id="popover-heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="story-popover-translation" id="popover-translation-text"></div>
          <div class="story-popover-arrow" id="popover-arrow"></div>
        </div>

        ${story.coverImage ? `
          <div class="story-cover-wrapper" style="margin-bottom: 20px; text-align: center;">
            <img src="${story.coverImage}" alt="${escapeHtml(storyTitle)}" class="story-cover-image" style="width: auto; max-width: 100%; max-height: 270px; object-fit: contain; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); display: inline-block; margin: 0 auto;" />
          </div>
        ` : ''}
        <div class="story-text-container" id="story-tokens-wrapper">
          ${paragraphsHtml}
        </div>

        <!-- Full translation block toggled by button -->
        <div class="story-full-translation-card" id="story-full-translation" style="display: none;">
          <div class="story-full-translation-header">🌐 ${strings.translationTitle || 'Полный перевод'}</div>
          ${translationParagraphsHtml}
        </div>
      </div>

      ${!story.hideFullTranslation && translationParagraphs.length > 0 ? `
      <div class="milestone-story-footer">
        <button class="story-btn-translation btn-orange" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">${strings.btnShowTranslation}</span>
        </button>
      </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Element handles
  const closeBtn = overlay.querySelector('#story-close-btn');
    const toggleTranslationBtn = overlay.querySelector('#story-toggle-translation-btn');
  const translationBtnLabel = overlay.querySelector('#story-translation-btn-label');
  const translationBlock = overlay.querySelector('#story-full-translation');
  const storyBody = overlay.querySelector('#story-modal-body');
  const popover = overlay.querySelector('#story-popover');
  const popoverWord = overlay.querySelector('#popover-word-text');
  const popoverTrans = overlay.querySelector('#popover-transcription-text');
  const popoverMeaning = overlay.querySelector('#popover-translation-text');
  const popoverAudio = overlay.querySelector('#popover-audio-btn');
  const popoverHeart = overlay.querySelector('#popover-heart-btn');
  const popoverHeartIcon = overlay.querySelector('#popover-heart-icon');

  let activeTokenEl = null;
  let activeResolvedWord = null;
  let isTranslationShown = false;
  let isTranslationUnlocked = false;

  function updateHeartVisual(isFav) {
    if (isFav) {
      popoverHeart.classList.add('is-favorited');
      popoverHeartIcon.setAttribute('fill', '#ef4444');
      popoverHeartIcon.setAttribute('stroke', '#ef4444');
    } else {
      popoverHeart.classList.remove('is-favorited');
      popoverHeartIcon.setAttribute('fill', 'none');
      popoverHeartIcon.setAttribute('stroke', '#94a3b8');
    }
  }

  function positionPopoverAboveToken(tokenEl) {
    const bodyRect = storyBody.getBoundingClientRect();
    const tokenRect = tokenEl.getBoundingClientRect();

    popover.style.display = 'block';
    popover.classList.remove('place-below');

    const popWidth = popover.offsetWidth || 200;
    const popHeight = popover.offsetHeight || 65;

    // Token coordinates relative to storyBody taking scroll into account
    const tokenTop = tokenRect.top - bodyRect.top + storyBody.scrollTop;
    const tokenLeft = tokenRect.left - bodyRect.left;
    const tokenCenter = tokenLeft + (tokenRect.width / 2);

    let leftPos = tokenCenter - (popWidth / 2);
    const minLeft = 10;
    const maxLeft = bodyRect.width - popWidth - 10;
    leftPos = Math.max(minLeft, Math.min(maxLeft, leftPos));

    let topPos = tokenTop - popHeight - 8;
    let placeBelow = false;

    // If near the top, show below the word
    if (topPos < storyBody.scrollTop + 4) {
      topPos = tokenTop + tokenRect.height + 8;
      placeBelow = true;
    }

    if (placeBelow) {
      popover.classList.add('place-below');
    }

    popover.style.top = `${topPos}px`;
    popover.style.left = `${leftPos}px`;

    // Position arrow directly over the token center
    const arrowEl = popover.querySelector('#popover-arrow');
    if (arrowEl) {
      const arrowLeft = Math.max(14, Math.min(popWidth - 14, tokenCenter - leftPos));
      arrowEl.style.left = `${arrowLeft}px`;
    }
  }

  // Token click binding: clicking toggles highlight
  overlay.querySelectorAll('.story-word-token').forEach(tokenEl => {
    tokenEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const rawText = tokenEl.getAttribute('data-word') || tokenEl.textContent;
      const resolved = resolveWord(rawText, dictMap, lang);
      if (!resolved) return;

      // Toggle clicked highlight state
      if (tokenEl.classList.contains('clicked-token')) {
        tokenEl.classList.remove('clicked-token');
        clickedWords.delete(resolved.word);
      } else {
        tokenEl.classList.add('clicked-token');
        clickedWords.add(resolved.word);
      }

      // Active token state
      if (activeTokenEl) activeTokenEl.classList.remove('active-token');
      tokenEl.classList.add('active-token');
      activeTokenEl = tokenEl;
      activeResolvedWord = resolved;

      // Update Popover content
      popoverWord.textContent = resolved.word;
      popoverTrans.textContent = resolved.transcription ? `/${resolved.transcription.replace(/^\/|\/$/g, '')}/` : '';
      popoverMeaning.textContent = resolved.translation || resolved.word;

      // Favorite button: check actual user favorites
      if (resolved.id) {
        popoverHeart.style.display = 'flex';
        const isFav = favSet.has(String(resolved.id));
        updateHeartVisual(isFav);
      } else {
        // Grammatical function words without dictionary IDs
        popoverHeart.style.display = 'none';
      }

      // Position popover floating over the word
      positionPopoverAboveToken(tokenEl);

      // Speak word audio
      speakWord(resolved.word, resolved.id);
    });
  });

  // Audio button in popover
  popoverAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeResolvedWord) {
      speakWord(activeResolvedWord.word, activeResolvedWord.id);
    }
  });

  // Heart button in popover
  popoverHeart.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!activeResolvedWord || !activeResolvedWord.id) return;
    const wId = String(activeResolvedWord.id);
    const wasFav = favSet.has(wId);
    const newFav = !wasFav;
    try {
      await toggleFavoriteApi(wId, newFav);
      if (newFav) {
        favSet.add(wId);
        updateHeartVisual(true);
        showStoryToast(strings.favAdded);
      } else {
        favSet.delete(wId);
        updateHeartVisual(false);
        showStoryToast(strings.favRemoved);
      }
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  });

  // Full translation toggle button with Rewarded Video Ad trigger
  if (toggleTranslationBtn) toggleTranslationBtn.addEventListener('click', async () => {
    if (!isTranslationUnlocked) {
      toggleTranslationBtn.disabled = true;
      toggleTranslationBtn.style.opacity = '0.7';
      try {
        const adResult = await AdService.showStoryTranslationRewardedAd(storyTitleText);
        if (adResult && (adResult.success || adResult.rewardEarned)) {
          isTranslationUnlocked = true;
        } else {
          showStoryToast('📺 Посмотрите видео до конца, чтобы открыть перевод');
          toggleTranslationBtn.disabled = false;
          toggleTranslationBtn.style.opacity = '1';
          return;
        }
      } catch (adErr) {
        console.warn('Ad playback fallback:', adErr);
        isTranslationUnlocked = true;
      } finally {
        toggleTranslationBtn.disabled = false;
        toggleTranslationBtn.style.opacity = '1';
      }
    }

    isTranslationShown = !isTranslationShown;
    if (isTranslationShown) {
      translationBlock.style.display = 'block';
      translationBtnLabel.textContent = strings.btnHideTranslation;
      // Scroll to translation smoothly
      setTimeout(() => {
        translationBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else {
      translationBlock.style.display = 'none';
      translationBtnLabel.textContent = strings.btnShowTranslation;
    }
  });

  // Click outside word popover to dismiss it
  overlay.querySelector('.milestone-story-card').addEventListener('click', (e) => {
    if (!e.target.closest('.story-word-token') && !e.target.closest('#story-popover')) {
      popover.style.display = 'none';
      if (activeTokenEl) {
        activeTokenEl.classList.remove('active-token');
        activeTokenEl = null;
      }
    }
  });

  function closeModal() {
    overlay.remove();
  }

  // Close X
  closeBtn.addEventListener('click', closeModal);

  // Click background overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Mark story as viewed & completed on modal open
  localStorage.setItem(`myduo_milestone_story_${currentMilestone}_shown`, 'true');
  localStorage.setItem(`myduo_milestone_story_${currentMilestone}_completed`, 'true');

  // Android hardware Back Button handler
  const handleAndroidBack = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', handleAndroidBack);
    }
  };
  window.addEventListener('keydown', handleAndroidBack);
}
