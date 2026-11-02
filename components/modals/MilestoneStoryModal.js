import { getStoryStrings } from './storyTranslations.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation } from '../../services/i18n.js?v=386.0';
import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, getUserFavorites, getWords } from '../../services/api.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';
import { checkAndPromptReviewFunnel } from './ReviewFunnelModal.js?v=386.0';

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
export const FUNCTION_WORDS_MAP = {
  "a": {"cs":"člen (jeden)","de":"Artikel (ein/eine)","en":"article (one/any)","es":"artículo (un/una)","fr":"article (un/une)","ru":"артикль (один, какой-то)","uk":"артикль (один, якийсь)","pl":"rodzajnik (jeden)","tr":"harf-i tarif (bir)","it":"articolo (un/uno/una)","ro":"articol (un/o)","bg":"член (един)","hu":"névelő (egy)","el":"άρθρο (ένας/μία)","da":"artikel (en/et)","lv":"artikuls (viens)","lt":"artikelis (vienas)","pt":"artigo (um/uma)","sk":"člen (jeden)","sl":"člen (en)","fi":"artikkeli (yksi)","hr":"član (jedan)","sv":"artikel (en/ett)","et":"artikkel (üks)","hi":"उपपद (एक/कोई)","bn":"আর্টিকেল (একটি/কোনো)","ar":"أداة نكرة (واحد/أي)","fa":"حرف تعریف (یک)","ur":"حرف تنکیر (ایک)","id":"kata sandang (sebuah)","vi":"mạo từ (một)","th":"คำนำหน้านาม (หนึ่ง)","ko":"관사 (어떤 하나의)","ja":"冠詞（ひとつの）","zh":"冠词（一个）","kk":"артикль (бір)"},
  "an": {"cs":"člen (jeden)","de":"Artikel (ein/eine)","en":"article (one/any)","es":"artículo (un/una)","fr":"article (un/une)","ru":"артикль (один, какой-то)","uk":"артикль (один, якийсь)","pl":"rodzajnik (jeden)","tr":"harf-i tarif (bir)","it":"articolo (un/uno/una)","ro":"articol (un/o)","bg":"член (един)","hu":"névelő (egy)","el":"άρθρο (ένας/μία)","da":"artikel (en/et)","lv":"artikuls (viens)","lt":"artikelis (vienas)","pt":"artigo (um/uma)","sk":"člen (jeden)","sl":"člen (en)","fi":"artikkeli (yksi)","hr":"član (jedan)","sv":"artikel (en/ett)","et":"artikkel (üks)","hi":"उपपद (एक/कोई)","bn":"আর্টিকেল (একটি/কোনো)","ar":"أداة نكرة (واحد/أي)","fa":"حرف تعریف (یک)","ur":"حرف تنکیر (ایک)","id":"kata sandang (sebuah)","vi":"mạo từ (một)","th":"คำนำหน้านาม (หนึ่ง)","ko":"관사 (어떤 하나의)","ja":"冠詞（ひとつの）","zh":"冠词（一个）","kk":"артикль (бір)"},
  "the": {"cs":"člen (ten/ta/to)","de":"Artikel (der/die/das)","en":"article (the)","es":"artículo (el/la/los/las)","fr":"article (le/la/les)","ru":"артикль (этот, конкретный)","uk":"артикль (цей, конкретний)","pl":"rodzajnik (ten/ta/to)","tr":"harf-i tarif (belirli)","it":"articolo (il/la/lo)","ro":"articol (hotărât)","bg":"определителен член (този)","hu":"névelő (a/az)","el":"άρθρο (ο/η/το)","da":"artikel (den/det)","lv":"noteiktais artikuls","lt":"žymimasis artikelis","pt":"artigo (o/a/os/as)","sk":"člen (ten/tá/to)","sl":"določni člen (ta)","fi":"määräävä artikkeli","hr":"član (taj/ta/to)","sv":"bestämd artikel (den/det)","et":"määrav artikkel","hi":"निश्चयवाचक उपपद (वही/खास)","bn":"নির্দিষ্ট আর্টিকেল (টি/টা)","ar":"أداة تعريف (الـ)","fa":"حرف تعریف مشخص","ur":"حرف تعریف (وہ/خاص)","id":"kata sandang penentu","vi":"mạo từ xác định","th":"คำนำหน้านามชี้เฉพาะ","ko":"정관사 (그)","ja":"定冠詞（その）","zh":"定冠词（这/那）","kk":"анықтауыш артикль"},
  "and": {"cs":"a, i","de":"und","en":"and","es":"y, e","fr":"et","ru":"и, а","uk":"і, й, та","pl":"i, oraz","tr":"ve","it":"e, ed","ro":"și","bg":"и","hu":"és, s","el":"και, κι","da":"og","lv":"un","lt":"ir","pt":"e","sk":"a, i","sl":"in","fi":"ja","hr":"i","sv":"och","et":"ja","hi":"और","bn":"এবং, ও","ar":"و","fa":"و","ur":"اور","id":"dan","vi":"và","th":"และ","ko":"그리고, 와/과","ja":"そして、と","zh":"和，与","kk":"және, мен"},
  "or": {"cs":"nebo","de":"oder","en":"or","es":"o, u","fr":"ou","ru":"или, либо","uk":"або, чи","pl":"lub, albo","tr":"veya, ya da","it":"o, oppure","ro":"sau, ori","bg":"или","hu":"vagy","el":"ή","da":"eller","lv":"vai","lt":"arba","pt":"ou","sk":"alebo","sl":"ali","fi":"tai, vai","hr":"ili","sv":"eller","et":"või","hi":"या, अथवा","bn":"বা, অথবা","ar":"أو","fa":"یا","ur":"یا","id":"atau","vi":"hoặc","th":"หรือ","ko":"또는, 혹은","ja":"または","zh":"或者，还是","kk":"немесе, әлде"},
  "at": {"cs":"u, při, v","de":"bei, an","en":"at","es":"en, junto a","fr":"à, chez","ru":"у, при, в","uk":"біля, при, в","pl":"przy, w, na","tr":"-de, -da, yanında","it":"a, presso","ro":"la, în","bg":"при, в","hu":"-nál/-nél, -ban/-ben","el":"σε, κοντά σε","da":"ved, på","lv":"pie, pie","lt":"prie, į","pt":"em, junto a","sk":"pri, v","sl":"pri, ob","fi":"luona, -ssa/-ssä","hr":"kod, pri","sv":"vid, på","et":"juures, -s/-l","hi":"पर, के पास","bn":"এ, তে, কাছে","ar":"في, عند","fa":"در, نزد","ur":"پر، کے پاس","id":"di, pada","vi":"tại, ở","th":"ที่, เมื่อ","ko":"~에, ~에서","ja":"〜で、〜に","zh":"在……，于……","kk":"жанында, -да/-де"},
  "by": {"cs":"u, vedle","de":"bei, neben","en":"by, near","es":"junto a, por","fr":"près de, par","ru":"у, около, возле","uk":"біля, поруч","pl":"obok, przy","tr":"yanında, tarafından","it":"vicino a, da","ro":"lângă, de către","bg":"до, покрай","hu":"mellett, által","el":"δίπλα σε, από","da":"ved, af","lv":"pie, gar","lt":"prie, šalia","pt":"junto a, por","sk":"pri, vedľa","sl":"ob, pri","fi":"vieressä, ohella","hr":"pored, kraj","sv":"vid, bredvid","et":"juures, mööda","hi":"के पास, द्वारा","bn":"দ্বারা, পাশে","ar":"بجانب, بواسطة","fa":"کنار, به وسیله","ur":"کے قریب، بذریعہ","id":"di dekat, oleh","vi":"gần, bởi","th":"โดย, ข้างๆ","ko":"~옆에, ~에 의해","ja":"〜のそばに、〜によって","zh":"在……旁边，通过","kk":"қасында, бойымен"},
  "for": {"cs":"pro","de":"für","en":"for","es":"para, por","fr":"pour","ru":"для, ради","uk":"для, заради","pl":"dla","tr":"için","it":"per","ro":"pentru","bg":"за","hu":"számára, -nak/-nek","el":"για","da":"for, til","lv":"priekš, dēļ","lt":"dėl, skirta","pt":"para, por","sk":"pre","sl":"za","fi":"varten","hr":"za","sv":"för","et":"jaoks","hi":"के लिए","bn":"জন্য","ar":"لأجل","fa":"برای","ur":"کے لیے","id":"untuk","vi":"cho, dành cho","th":"สำหรับ","ko":"~을 위해","ja":"〜のために","zh":"为了，给","kk":"үшін"},
  "in": {"cs":"v, do","de":"in","en":"in","es":"en","fr":"dans, en","ru":"в (часть суток, внутри)","uk":"у, в (всередині, час)","pl":"w, wewnątrz","tr":"içinde, -de","it":"in, all'interno","ro":"în","bg":"в","hu":"-ban/-ben","el":"μέσα σε","da":"i","lv":"iekšā, -ā","lt":"į, -e","pt":"em","sk":"v","sl":"v","fi":"-ssa/-ssä","hr":"u","sv":"i","et":"sees, -s","hi":"में, अंदर","bn":"মধ্যে, ভিতরে","ar":"في","fa":"در","ur":"میں","id":"di dalam","vi":"trong, ở trong","th":"ใน","ko":"~안에, ~에서","ja":"〜の中に、〜に","zh":"在……里","kk":"ішінде, -да/-де"},
  "of": {"cs":"z, od, o","de":"von","en":"of","es":"de","fr":"de","ru":"из, от, о (родительный падеж)","uk":"з, від, про (родовий відмінок)","pl":"z, od","tr":"-in, -ın, parçası","it":"di","ro":"de, din","bg":"на, от","hu":"-nak/-nek a, közül","el":"από, του/της","da":"af","lv":"no","lt":"iš","pt":"de","sk":"z, od","sl":"od, iz","fi":"-sta/-stä","hr":"od, iz","sv":"av","et":"-st","hi":"का, की, के","bn":"এর, দের","ar":"من","fa":"از","ur":"کا، کی، کے","id":"dari","vi":"của","th":"ของ","ko":"~의","ja":"〜の","zh":"……的","kk":"-ның/-нің, ішінен"},
  "on": {"cs":"na","de":"auf, an","en":"on","es":"sobre, en","fr":"sur","ru":"на (поверхности, день)","uk":"на (поверхні, день)","pl":"na","tr":"üzerinde","it":"su, sopra","ro":"pe","bg":"на, върху","hu":"-on/-en/-ön","el":"πάνω σε","da":"på","lv":"uz","lt":"ant","pt":"em, sobre","sk":"na","sl":"na","fi":"päällä","hr":"na","sv":"på","et":"peal, -l","hi":"पर, ऊपर","bn":"উপরে, তে","ar":"على","fa":"روی","ur":"پر","id":"di atas","vi":"trên","th":"บน","ko":"~위에, ~에","ja":"〜の上に、〜に","zh":"在……上","kk":"үстінде, -да/-де"},
  "to": {"cs":"k, do, na","de":"zu, nach","en":"to","es":"a, hacia","fr":"à, vers","ru":"к, в, до (направление)","uk":"до, в, на (напрямок)","pl":"do, ku","tr":"-e, -a, yönelme","it":"a, verso","ro":"la, către","bg":"към, до","hu":"-hoz/-hez/-höz, felé","el":"προς, σε","da":"til","lv":"uz, pie","lt":"į, pas","pt":"para, a","sk":"k, do","sl":"k, h, do","fi":"kohti, -lle","hr":"k, prema","sv":"till","et":"juurde, -sse","hi":"को, की ओर","bn":"প্রতি, দিকে","ar":"إلى","fa":"به, به سوی","ur":"کی طرف، کو","id":"ke, kepada","vi":"đến, tới","th":"ถึง, ไปยัง","ko":"~로, ~에게","ja":"〜へ、〜に","zh":"向，往，到","kk":"қарай, -ға/-ге"},
  "under": {"cs":"pod","de":"unter","en":"under","es":"debajo de, bajo","fr":"sous","ru":"под","uk":"під","pl":"pod","tr":"altında","it":"sotto","ro":"sub","bg":"под","hu":"alatt","el":"κάτω από","da":"under","lv":"zem","lt":"po","pt":"sob, debaixo de","sk":"pod","sl":"pod","fi":"alla, alle","hr":"pod, ispod","sv":"under","et":"all, alla","hi":"नीचे, के तहत","bn":"নিচে","ar":"تحت","fa":"زیر","ur":"کے نیچے","id":"di bawah","vi":"dưới","th":"ใต้, ภายใต้","ko":"~아래에","ja":"〜の下に","zh":"在……下面","kk":"астында"},
  "with": {"cs":"s, se","de":"mit","en":"with","es":"con","fr":"avec","ru":"с, вместе с","uk":"з, разом із","pl":"z, razem z","tr":"ile, birlikte","it":"con","ro":"cu","bg":"с, със","hu":"-val/-vel","el":"με","da":"med","lv":"ar","lt":"su","pt":"com","sk":"s, so","sl":"z, s","fi":"kanssa","hr":"s, sa","sv":"med","et":"koos","hi":"के साथ","bn":"সাথে, দিয়ে","ar":"مع","fa":"با","ur":"کے ساتھ","id":"dengan, bersama","vi":"với, cùng với","th":"กับ, ด้วย","ko":"~와 함께","ja":"〜と一緒に","zh":"与……一起，用","kk":"бірге, -мен/-бен"},
  "when": {"cs":"když","de":"wenn, als","en":"when","es":"cuando","fr":"quand, lorsque","ru":"когда","uk":"коли","pl":"kiedy, gdy","tr":"zaman, dığında","it":"quando","ro":"când","bg":"когато","hu":"amikor","el":"όταν","da":"når, da","lv":"kad","lt":"kai","pt":"quando","sk":"keď","sl":"ko, kadar","fi":"kun","hr":"kada, kad","sv":"när","et":"kui","hi":"जब","bn":"যখন","ar":"عندما","fa":"وقتی که","ur":"جب","id":"ketika, saat","vi":"khi","th":"เมื่อ","ko":"~할 때","ja":"〜の時","zh":"当……的时候","kk":"кезде, уақытта"},
  "he": {"cs":"on","de":"er","en":"he","es":"él","fr":"il","ru":"он","uk":"він","pl":"on","tr":"o (erkek)","it":"lui, egli","ro":"el","bg":"той","hu":"ő (férfi)","el":"αυτός","da":"han","lv":"viņš","lt":"jis","pt":"ele","sk":"on","sl":"on","fi":"hän (mies)","hr":"on","sv":"han","et":"tema (mees)","hi":"वह (पुरुष)","bn":"সে (পুরুষ)","ar":"هو","fa":"او (مرد)","ur":"وہ (مرد)","id":"dia (pria)","vi":"anh ấy, ông ấy","th":"เขา (ผู้ชาย)","ko":"그 (남성)","ja":"彼","zh":"他","kk":"ол (ер адам)"},
  "her": {"cs":"její, jí","de":"ihr, sie","en":"her","es":"su, de ella","fr":"son/sa/ses (à elle)","ru":"её, ей","uk":"її, їй","pl":"jej, ją","tr":"onun (kadın)","it":"suo, lei","ro":"ei, o","bg":"нейн, нея","hu":"övé, neki","el":"της, αυτήν","da":"hendes, hende","lv":"viņas, viņu","lt":"jos, jai","pt":"dela, a","sk":"jej, ju","sl":"njen, njo","fi":"hänen (nainen)","hr":"njezin, nju","sv":"hennes, henne","et":"tema (naine)","hi":"उसका (महिला)","bn":"তার (মহিলা)","ar":"لها, ها","fa":"او, مال او (زن)","ur":"اس کا (عورت)","id":"miliknya (wanita)","vi":"của cô ấy","th":"ของเธอ","ko":"그녀의, 그녀를","ja":"彼女の、彼女を","zh":"她的，她","kk":"оның (әйел адам)"},
  "himself": {"cs":"se, sám sebe","de":"sich selbst","en":"himself","es":"él mismo, se","fr":"lui-même, se","ru":"сам, себя","uk":"сам, себе","pl":"sam, siebie","tr":"kendisi, kendini","it":"se stesso, si","ro":"el însuși, se","bg":"себе си, сам","hu":"maga, önmaga","el":"ο ίδιος, τον εαυτό του","da":"sig selv","lv":"pats sevi","lt":"pats save","pt":"a si mesmo, ele mesmo","sk":"sám, seba","sl":"sam, se","fi":"itse, itsensä","hr":"sam, sebe","sv":"sig själv","et":"iseennast","hi":"स्वयं, खुद","bn":"নিজে, নিজেকে","ar":"نفسه, ذاته","fa":"خودش","ur":"خود، اپنے آپ کو","id":"dirinya sendiri","vi":"chính anh ấy","th":"ตัวเขาเอง","ko":"그 자신","ja":"彼自身","zh":"他自己","kk":"өзі, өзін"},
  "his": {"cs":"jeho","de":"sein","en":"his","es":"su, de él","fr":"son/sa/ses (à lui)","ru":"его","uk":"його","pl":"jego","tr":"onun (erkek)","it":"suo (di lui)","ro":"lui, său","bg":"негов","hu":"az ő (férfié)","el":"του","da":"hans","lv":"viņa","lt":"jo","pt":"dele, seu","sk":"jeho","sl":"njegov","fi":"hänen (mies)","hr":"njegov","sv":"hans","et":"tema","hi":"उसका (पुरुष)","bn":"তার (পুরুষ)","ar":"له, ـه","fa":"مال او (مرد)","ur":"اس کا","id":"miliknya (pria)","vi":"của anh ấy","th":"ของเขา","ko":"그의","ja":"彼の","zh":"他的","kk":"оның"},
  "i": {"cs":"já","de":"ich","en":"I","es":"yo","fr":"je, moi","ru":"я","uk":"я","pl":"ja","tr":"ben","it":"io","ro":"eu","bg":"аз","hu":"én","el":"εγώ","da":"jeg","lv":"es","lt":"aš","pt":"eu","sk":"ja","sl":"jaz","fi":"minä","hr":"ja","sv":"jag","et":"mina, ma","hi":"मैं","bn":"আমি","ar":"أنا","fa":"من","ur":"میں","id":"saya, aku","vi":"tôi","th":"ฉัน, ผม","ko":"나, 저","ja":"私","zh":"我","kk":"мен"},
  "it": {"cs":"to, ono","de":"es","en":"it","es":"ello, esto","fr":"il, elle, ce","ru":"оно, это","uk":"воно, це","pl":"to, ono","tr":"o (cansız/hayvan)","it":"esso, ciò","ro":"el, ea (obiect)","bg":"то","hu":"ez, az","el":"αυτό","da":"den, det","lv":"tas, tā","lt":"tai, jis/ji","pt":"ele, ela, isso","sk":"to, ono","sl":"to, ono","fi":"se","hr":"to, ono","sv":"den, det","et":"see","hi":"यह, वह","bn":"এটি, এটা","ar":"هو, هي (لغير العاقل)","fa":"آن","ur":"یہ، وہ","id":"itu","vi":"nó","th":"มัน","ko":"그것","ja":"それ","zh":"它","kk":"ол, бұл"},
  "itself": {"cs":"samo sebe","de":"sich selbst (Sache)","en":"itself","es":"sí mismo, en sí","fr":"lui-même, elle-même","ru":"само, себя","uk":"саме, себе","pl":"samo, siebie","tr":"kendisi (nesne)","it":"se stesso, di per sé","ro":"el însuși, în sine","bg":"самото то, себе си","hu":"maga, önmaga","el":"το ίδιο, αφ' εαυτού","da":"sig selv","lv":"pats sevi","lt":"pats savaime","pt":"a si mesmo, em si","sk":"samo seba","sl":"samo, se","fi":"itse, itsessään","hr":"samo, sebe","sv":"sig självt","et":"iseennast","hi":"स्वयं, अपने आप","bn":"নিজে, নিজেই","ar":"نفسه, ذاته (لغير العاقل)","fa":"خودش","ur":"خود، اپنے آپ میں","id":"dirinya sendiri","vi":"chính nó","th":"ตัวมันเอง","ko":"그것 자신","ja":"それ自身","zh":"它本身，它自己","kk":"өзі, өздігінен"},
  "myself": {"cs":"já sám, se","de":"mich selbst, mir","en":"myself","es":"yo mismo, me","fr":"moi-même, me","ru":"я сам, себя","uk":"я сам, себе","pl":"ja sam, siebie","tr":"kendim, kendimi","it":"me stesso, mi","ro":"eu însumi, mă","bg":"аз сам, себе си","hu":"magam, önmagam","el":"ο ίδιος, τον εαυτό μου","da":"mig selv","lv":"pats sevi","lt":"aš pats, mane","pt":"eu mesmo, me","sk":"ja sám, seba","sl":"jaz sam, se","fi":"itse, itseni","hr":"ja sam, sebe","sv":"mig själv","et":"iseennast","hi":"मैं खुद","bn":"আমি নিজে","ar":"نفسي, ذاتي","fa":"خودم","ur":"میں خود","id":"saya sendiri","vi":"chính tôi","th":"ตัวฉันเอง","ko":"나 자신","ja":"私自身","zh":"我自己","kk":"өзім"},
  "someone": {"cs":"někdo","de":"jemand","en":"someone","es":"alguien","fr":"quelqu'un","ru":"кто-то, кто-нибудь","uk":"хтось, хто-небудь","pl":"ktoś","tr":"biri, birisi","it":"qualcuno","ro":"cineva","bg":"някой","hu":"valaki","el":"κάποιος","da":"nogen","lv":"kāds","lt":"kažkas","pt":"alguém","sk":"niekto","sl":"nekdo","fi":"joku","hr":"netko","sv":"någon","et":"keegi","hi":"कोई व्यक्ति","bn":"কেউ একজন","ar":"شخص ما","fa":"کسی","ur":"کوئی","id":"seseorang","vi":"ai đó","th":"บางคน","ko":"어떤 사람, 누군가","ja":"誰か","zh":"某人，有人","kk":"біреу, әлдекім"},
  "their": {"cs":"jejich","de":"ihr, ihre","en":"their","es":"su, de ellos","fr":"leur, leurs","ru":"их","uk":"їхній, їх","pl":"ich","tr":"onların","it":"loro","ro":"lor","bg":"техен","hu":"az ő (többes szám)","el":"τους","da":"deres","lv":"viņu","lt":"jų","pt":"deles, seus","sk":"ich","sl":"njihov","fi":"heidän","hr":"njihov","sv":"deras","et":"nende","hi":"उनका","bn":"তাদের","ar":"لهم, ـهم","fa":"مال آنها","ur":"ان کا","id":"milik mereka","vi":"của họ","th":"ของพวกเขา","ko":"그들의","ja":"彼らの","zh":"他们的","kk":"олардың"},
  "they": {"cs":"oni","de":"sie (Plural)","en":"they","es":"ellos, ellas","fr":"ils, elles","ru":"они","uk":"вони","pl":"oni, one","tr":"onlar","it":"loro, essi","ro":"ei, ele","bg":"те","hu":"ők","el":"αυτοί, αυτές","da":"de","lv":"viņi, viņas","lt":"jie, jos","pt":"eles, elas","sk":"oni","sl":"oni","fi":"he, ne","hr":"oni","sv":"de","et":"nemad","hi":"वे, लोग","bn":"তারা","ar":"هم, هن","fa":"آنها","ur":"وہ لوگ","id":"mereka","vi":"họ, chúng","th":"พวกเขา","ko":"그들","ja":"彼ら","zh":"他们，它们","kk":"олар"},
  "we": {"cs":"my","de":"wir","en":"we","es":"nosotros","fr":"nous","ru":"мы","uk":"ми","pl":"my","tr":"biz","it":"noi","ro":"noi","bg":"ние","hu":"mi","el":"εμείς","da":"vi","lv":"mēs","lt":"mes","pt":"nós","sk":"my","sl":"mi","fi":"me","hr":"mi","sv":"vi","et":"meie, me","hi":"हम","bn":"আমরা","ar":"نحن","fa":"ما","ur":"ہم","id":"kami, kita","vi":"chúng tôi, chúng ta","th":"พวกเรา","ko":"우리","ja":"私たち","zh":"我们","kk":"біз"},
  "you": {"cs":"ty, vy","de":"du, Sie, ihr","en":"you","es":"tú, usted, vosotros","fr":"tu, vous","ru":"ты, вы","uk":"ти, ви","pl":"ty, wy","tr":"sen, siz","it":"tu, voi, Lei","ro":"tu, voi","bg":"ти, вие","hu":"te, ti, ön","el":"εσύ, εσείς","da":"du, I, De","lv":"tu, jūs","lt":"tu, jūs","pt":"você, vocês, tu","sk":"ty, vy","sl":"ti, vi","fi":"sinä, te","hr":"ti, vi","sv":"du, ni","et":"sina, teie","hi":"आप, तुम","bn":"তুমি, আপনি","ar":"أنت, أنتم","fa":"تو, شما","ur":"آپ، تم","id":"kamu, anda","vi":"bạn, các bạn","th":"คุณ, เธอ","ko":"너, 당신","ja":"あなた","zh":"你，您，你们","kk":"сен, сіз, сендер"},
  "yourself": {"cs":"ty sám, se","de":"du selbst, dich","en":"yourself","es":"tú mismo, te","fr":"toi-même, vous-même","ru":"ты сам, себя","uk":"ти сам, себе","pl":"ty sam, siebie","tr":"kendin, kendini","it":"te stesso, ti","ro":"tu însuți, te","bg":"ти сам, себе си","hu":"magad, önmagad","el":"ο ίδιος, τον εαυτό σου","da":"dig selv","lv":"pats sevi","lt":"tu pats, tave","pt":"você mesmo, te","sk":"ty sám, seba","sl":"ti sam, se","fi":"itse, itsesi","hr":"ti sam, sebe","sv":"dig själv","et":"sina ise, ennast","hi":"तुम खुद, अपने आप","bn":"তুমি নিজে","ar":"نفسك","fa":"خودت","ur":"تم خود","id":"dirimu sendiri","vi":"chính bạn","th":"ตัวคุณเอง","ko":"너 자신","ja":"あなた自身","zh":"你自己","kk":"өзің"},
  "are": {"cs":"jsou, jste","de":"sind, bist, seid","en":"are (to be)","es":"son, están","fr":"sont, êtes","ru":"есть, являются","uk":"є, знаходяться","pl":"są, jesteście","tr":"-dir, -lar (olmak)","it":"sono, siete","ro":"sunt, sunteți","bg":"са, сте","hu":"vannak, vagytok","el":"είναι, είστε","da":"er","lv":"ir, esat","lt":"yra, esate","pt":"são, estão","sk":"sú, ste","sl":"so, ste","fi":"ovat, olette","hr":"su, jeste","sv":"är","et":"on, olete","hi":"हैं, हो","bn":"হয়, আছ","ar":"تكون, يكونون","fa":"هستند, هستید","ur":"ہیں، ہو","id":"adalah","vi":"là, ở","th":"เป็น, อยู่, คือ","ko":"~이다, ~있다","ja":"〜である、いる","zh":"是，在","kk":"болып табылады"},
  "is": {"cs":"je","de":"ist","en":"is (to be)","es":"es, está","fr":"est","ru":"есть, является","uk":"є, знаходиться","pl":"jest","tr":"-dir (olmak)","it":"è","ro":"este, e","bg":"е","hu":"van","el":"είναι","da":"er","lv":"ir","lt":"yra","pt":"é, está","sk":"je","sl":"je","fi":"on","hr":"je","sv":"är","et":"on","hi":"है","bn":"হয়, আছে","ar":"هو, هي, يكون","fa":"است, هست","ur":"ہے","id":"adalah","vi":"là, ở","th":"เป็น, อยู่, คือ","ko":"~이다, ~있다","ja":"〜である、いる","zh":"是，在","kk":"болып табылады"},
  "was": {"cs":"byl, byla, bylo","de":"war","en":"was (to be)","es":"era, fue, estaba","fr":"était, fut","ru":"был, была, было","uk":"був, була, було","pl":"był, była, było","tr":"idi, oldu","it":"era, fu, è stato","ro":"a fost, era","bg":"беше, бил","hu":"volt","el":"ήταν","da":"var","lv":"bija","lt":"buvo","pt":"era, foi, estava","sk":"bol, bola, bolo","sl":"je bil, bila","fi":"oli","hr":"bio, bila, bilo","sv":"var","et":"oli","hi":"था, थी","bn":"ছিল","ar":"كان, كانت","fa":"بود","ur":"تھا، تھی","id":"dulu adalah","vi":"đã là, đã ở","th":"เคยเป็น, อยู่","ko":"~이었다, 있었다","ja":"〜だった、いた","zh":"曾经是，在过","kk":"болды"},
  "can't": {"cs":"nemohu, nelze","de":"kann nicht","en":"can't (cannot)","es":"no puedo","fr":"ne peux pas","ru":"не могу, нельзя","uk":"не можу, не можна","pl":"nie mogę","tr":"yapamam","it":"non posso","ro":"nu pot","bg":"не мога","hu":"nem tud","el":"δεν μπορώ","da":"kan ikke","lv":"nevaru","lt":"negaliu","pt":"não posso","sk":"nemôžem","sl":"ne morem","fi":"en voi","hr":"ne mogu","sv":"kan inte","et":"ei saa","hi":"नहीं कर सकता","bn":"পারিনা","ar":"لا أستطيع","fa":"نمی‌توانم","ur":"نہیں کر سکتا","id":"tidak bisa","vi":"không thể","th":"ไม่สามารถ","ko":"할 수 없다","ja":"〜できない","zh":"不能，无法","kk":"істей алмаймын"},
  "didn't": {"cs":"ne- (minulost)","de":"nicht (Vergangenheit)","en":"didn't (did not)","es":"no (pasado)","fr":"n'a pas","ru":"не (в прошлом)","uk":"не (в минулому)","pl":"nie (w przeszłości)","tr":"yapmadı","it":"non (passato)","ro":"nu a (trecut)","bg":"не (минало време)","hu":"nem (múlt idő)","el":"δεν (παρελθόν)","da":"gjorde ikke","lv":"ne- (pagātnē)","lt":"ne- (praeityje)","pt":"não (passado)","sk":"ne- (minulosť)","sl":"ni (preteklost)","fi":"ei (menneisyydessä)","hr":"nije (prošlost)","sv":"gjorde inte","et":"ei (minevikus)","hi":"नहीं किया","bn":"করেনি","ar":"لم يفعل","fa":"انجام نداد","ur":"نہیں کیا","id":"tidak (lampau)","vi":"đã không","th":"ไม่ได้","ko":"~하지 않았다","ja":"〜しなかった","zh":"没有（过去式否定）","kk":"істемеді"},
  "hadn't": {"cs":"neměl (minulost)","de":"hatte nicht","en":"hadn't (had not)","es":"no había","fr":"n'avait pas","ru":"не имел, не","uk":"не мав, не","pl":"nie miał (zaprzeszły)","tr":"yapmamıştı","it":"non aveva","ro":"nu avusese","bg":"нямаше","hu":"nem volt neki","el":"δεν είχε","da":"havde ikke","lv":"nebija","lt":"neturėjo","pt":"não tinha","sk":"nemal","sl":"ni imel","fi":"ei ollut","hr":"nije imao","sv":"hade inte","et":"ei olnud","hi":"नहीं था","bn":"ছিল না","ar":"لم يكن قد","fa":"نداشته بود","ur":"نہیں تھا","id":"belum sempat","vi":"đã chưa từng","th":"ไม่ได้มี","ko":"~하지 않았었다","ja":"〜していなかった","zh":"还没（过去完成否定）","kk":"болмаған еді"},
  "haven't": {"cs":"nemám, ještě ne","de":"habe nicht","en":"haven't (have not)","es":"no he, no tengo","fr":"n'ai pas","ru":"не имею, еще не","uk":"не маю, ще не","pl":"nie mam","tr":"yapmadım, yok","it":"non ho","ro":"nu am","bg":"нямам","hu":"még nem","el":"δεν έχω","da":"har ikke","lv":"nav","lt":"neturiu","pt":"não tenho","sk":"nemám","sl":"nimam","fi":"ei ole","hr":"nemam","sv":"har inte","et":"ei ole","hi":"नहीं किया है","bn":"করিনি","ar":"لم أفعل بعد","fa":"انجام نداده‌ام","ur":"نہیں کیا ہے","id":"belum, tidak punya","vi":"chưa, không có","th":"ยังไม่ได้","ko":"~하지 않았다, 없다","ja":"まだ〜していない","zh":"还没有，没有","kk":"әлі істемедім"},
  "isn't": {"cs":"není","de":"ist nicht","en":"isn't (is not)","es":"no es, no está","fr":"n'est pas","ru":"не является, не","uk":"не є, не","pl":"nie jest","tr":"değildir","it":"non è","ro":"nu este","bg":"не е","hu":"nem","el":"δεν είναι","da":"er ikke","lv":"nav","lt":"nėra","pt":"não é, não está","sk":"nie je","sl":"ni","fi":"ei ole","hr":"nije","sv":"är inte","et":"ei ole","hi":"नहीं है","bn":"নয়, নেই","ar":"ليس","fa":"نیست","ur":"نہیں ہے","id":"bukan, tidak","vi":"không phải","th":"ไม่ใช่","ko":"~이 아니다","ja":"〜ではない","zh":"不是","kk":"емес"},
  "it's": {"cs":"to je","de":"es ist","en":"it's (it is)","es":"es, está","fr":"c'est","ru":"это","uk":"це","pl":"to jest","tr":"o ...dır","it":"è, questo è","ro":"este","bg":"то е","hu":"ez","el":"είναι","da":"det er","lv":"tas ir","lt":"tai yra","pt":"é, isso é","sk":"to je","sl":"to je","fi":"se on","hr":"to je","sv":"det är","et":"see on","hi":"यह है","bn":"এটা হয়","ar":"إنه","fa":"این است","ur":"یہ ہے","id":"ini adalah","vi":"nó là","th":"มันคือ","ko":"그것은 ~이다","ja":"それは〜です","zh":"它是","kk":"бұл"},
  "let's": {"cs":"pojďme","de":"lass uns","en":"let's (let us)","es":"vamos a","fr":"allons","ru":"давайте","uk":"давайте, нумо","pl":"chodźmy, zróbmy","tr":"haydi, yapalım","it":"facciamo, andiamo","ro":"hai să","bg":"нека","hu":"gyerünk","el":"ας","da":"lad os","lv":"darīsim","lt":"padarykime","pt":"vamos","sk":"poďme","sl":"dajmo","fi":"tehdäänpä","hr":"hajdemo","sv":"låt oss","et":"teeme","hi":"चलो करें","bn":"চলুন","ar":"دعنا","fa":"بیا","ur":"آؤ کریں","id":"mari kita","vi":"chúng ta hãy","th":"พวกเรามา...กันเถอะ","ko":"~하자","ja":"〜しましょう","zh":"让我们","kk":"қанекей"},
  "she's": {"cs":"ona je","de":"sie ist","en":"she's (she is)","es":"ella es, está","fr":"elle est","ru":"она","uk":"вона","pl":"ona jest","tr":"o (kadın)","it":"lei è","ro":"ea este","bg":"тя е","hu":"ő van","el":"αυτή είναι","da":"hun er","lv":"viņa ir","lt":"ji yra","pt":"ela é, está","sk":"ona je","sl":"ona je","fi":"hän on (nainen)","hr":"ona je","sv":"hon är","et":"tema on","hi":"वह है (महिला)","bn":"সে হয় (মহিলা)","ar":"هي تكون","fa":"او هست (زن)","ur":"وہ ہے (عورت)","id":"dia adalah (wanita)","vi":"cô ấy là","th":"เธอคือ","ko":"그녀는 ~이다","ja":"彼女は〜です","zh":"她是","kk":"ол (әйел адам)"},
  "there's": {"cs":"tam je","de":"es gibt","en":"there's (there is)","es":"hay","fr":"il y a","ru":"там есть, имеется","uk":"там є, існує","pl":"tam jest, znajduje się","tr":"var, orada","it":"c'è","ro":"există, este","bg":"има","hu":"van ott","el":"υπάρχει","da":"der er","lv":"tur ir","lt":"ten yra","pt":"há, existe","sk":"tam je","sl":"tam je","fi":"siellä on","hr":"tamo je","sv":"det finns","et":"seal on","hi":"वहाँ है","bn":"সেখানে আছে","ar":"هناك","fa":"آن‌جا هست","ur":"وہاں ہے","id":"ada di sana","vi":"có ở đó","th":"มีอยู่ที่นั่น","ko":"거기에 ~가 있다","ja":"そこに〜がある","zh":"那里有","kk":"онда бар"},
  "they'll": {"cs":"oni budou","de":"sie werden","en":"they'll (they will)","es":"ellos van a","fr":"ils vont","ru":"они будут","uk":"вони будуть","pl":"oni będą","tr":"onlar yapacak","it":"loro faranno","ro":"ei vor","bg":"те ще","hu":"ők fognak","el":"αυτοί θα","da":"de vil","lv":"viņi būs","lt":"jie bus","pt":"eles vão","sk":"oni budú","sl":"oni bodo","fi":"he aikovat","hr":"oni će","sv":"de kommer att","et":"nemad teevad","hi":"वे करेंगे","bn":"তারা করবে","ar":"سوف يفعلون","fa":"آنها انجام خواهند داد","ur":"وہ کریں گے","id":"mereka akan","vi":"họ sẽ","th":"พวกเขาจะ","ko":"그들이 ~할 것이다","ja":"彼らは〜するだろう","zh":"他们将会","kk":"олар жасайды"},
  "they're": {"cs":"oni jsou","de":"sie sind","en":"they're (they are)","es":"ellos son, están","fr":"ils sont","ru":"они","uk":"вони","pl":"oni są","tr":"onlar","it":"loro sono","ro":"ei sunt","bg":"те са","hu":"ők vannak","el":"αυτοί είναι","da":"de er","lv":"viņi ir","lt":"jie yra","pt":"eles são, estão","sk":"oni sú","sl":"oni so","fi":"he ovat","hr":"oni su","sv":"de är","et":"nemad on","hi":"वे हैं","bn":"তারা হয়","ar":"هم يكونون","fa":"آنها هستند","ur":"وہ ہیں","id":"mereka adalah","vi":"họ là","th":"พวกเขาคือ","ko":"그들은 ~이다","ja":"彼らは〜です","zh":"他们是","kk":"олар"},
  "we'll": {"cs":"my budeme","de":"wir werden","en":"we'll (we will)","es":"nosotros vamos a","fr":"nous allons","ru":"мы будем, сделаем","uk":"ми будемо, зробимо","pl":"my będziemy","tr":"biz yapacağız","it":"noi faremo","ro":"noi vom","bg":"ние ще","hu":"mi fogunk","el":"εμείς θα","da":"vi vil","lv":"mēs būsim","lt":"mes būsime","pt":"nós vamos","sk":"my budeme","sl":"mi bomo","fi":"me aiomme","hr":"mi ćemo","sv":"vi ska","et":"meie teeme","hi":"हम करेंगे","bn":"আমরা করব","ar":"سوف نفعل","fa":"ما انجام خواهیم داد","ur":"ہم کریں گے","id":"kami akan","vi":"chúng tôi sẽ","th":"พวกเราจะ","ko":"우리가 ~할 것이다","ja":"私たちは〜します","zh":"我们将，我们会","kk":"біз жасаймыз"},
  "we're": {"cs":"my jsme","de":"wir sind","en":"we're (we are)","es":"nosotros somos, estamos","fr":"nous sommes","ru":"мы","uk":"ми","pl":"my jesteśmy","tr":"biziz","it":"noi siamo","ro":"noi suntem","bg":"ние сме","hu":"mi vagyunk","el":"εμείς είμαστε","da":"vi er","lv":"mēs esam","lt":"mes esame","pt":"nós somos, estamos","sk":"my sme","sl":"mi smo","fi":"me olemme","hr":"mi smo","sv":"vi är","et":"meie oleme","hi":"हम हैं","bn":"আমরা হই","ar":"نحن نكون","fa":"ما هستیم","ur":"ہم ہیں","id":"kami adalah","vi":"chúng tôi là","th":"พวกเราคือ","ko":"우리는 ~이다","ja":"私たちは〜です","zh":"我们是","kk":"біз"},
  "we've": {"cs":"my máme","de":"wir haben","en":"we've (we have)","es":"nosotros hemos, tenemos","fr":"nous avons","ru":"у нас есть, мы","uk":"у нас є, ми","pl":"mamy","tr":"yaptık","it":"noi abbiamo","ro":"noi am","bg":"ние имаме","hu":"nekünk van","el":"εμείς έχουμε","da":"vi har","lv":"mums ir","lt":"mes turime","pt":"nós temos","sk":"my máme","sl":"mi imamo","fi":"meillä on","hr":"mi imamo","sv":"vi har","et":"meil on","hi":"हमने किया है","bn":"আমরা করেছি","ar":"لقد فعلنا","fa":"ما انجام داده‌ایم","ur":"ہم نے کیا ہے","id":"kami telah","vi":"chúng tôi đã","th":"พวกเราได้","ko":"우리는 ~했다","ja":"私たちは〜しました","zh":"我们已经","kk":"бізде бар"},
  "what's": {"cs":"co je","de":"was ist","en":"what's (what is)","es":"qué es","fr":"qu'est-ce que","ru":"что такое","uk":"що таке","pl":"co to jest","tr":"ne, nedir","it":"cos'è","ro":"ce este","bg":"какво е","hu":"mi az","el":"τι είναι","da":"hvad er","lv":"kas ir","lt":"kas yra","pt":"o que é","sk":"čo je","sl":"kaj je","fi":"mitä on","hr":"što je","sv":"vad är","et":"mis on","hi":"क्या है","bn":"কী হয়","ar":"ما هو","fa":"چیست","ur":"کیا ہے","id":"apa itu","vi":"cái gì","th":"อะไรคือ","ko":"무엇인가","ja":"何ですか","zh":"什么是","kk":"не ол"},
  "you're": {"cs":"ty jsi, vy jste","de":"du bist, Sie sind","en":"you're (you are)","es":"tú eres, usted es","fr":"tu es, vous êtes","ru":"ты, вы","uk":"ти, ви","pl":"ty jesteś, wy jesteście","tr":"sensin, sizsiniz","it":"tu sei, voi siete","ro":"tu ești, voi sunteți","bg":"ти си, вие сте","hu":"te vagy, ti vagytok","el":"εσύ είσαι","da":"du er","lv":"tu esi, jūs esat","lt":"tu esi, jūs esate","pt":"você é, está","sk":"ty si, vy ste","sl":"ti si, vi ste","fi":"sinä olet","hr":"ti si, vi jeste","sv":"du är","et":"sina oled","hi":"आप हैं, तुम हो","bn":"তুমি হও","ar":"أنت تكون","fa":"تو هستی","ur":"آپ ہیں","id":"kamu adalah","vi":"bạn là","th":"คุณคือ","ko":"너는 ~이다","ja":"あなたは〜です","zh":"你是，你们是","kk":"сенсің, сізсіз"},
  "you've": {"cs":"ty máš, vy máte","de":"du hast, Sie haben","en":"you've (you have)","es":"tú has, tienes","fr":"tu as, vous avez","ru":"у тебя есть, вы","uk":"у тебе є, ви","pl":"masz","tr":"yaptın","it":"tu hai","ro":"tu ai, ați","bg":"ти имаш","hu":"neked van","el":"εσύ έχεις","da":"du har","lv":"tev ir","lt":"tu turi","pt":"você tem","sk":"ty máš","sl":"ti imaš","fi":"sinulla on","hr":"ti imaš","sv":"du har","et":"sul on","hi":"तुमने किया है","bn":"তুমি করেছ","ar":"لقد فعلت","fa":"تو انجام داده‌ای","ur":"آپ نے کیا ہے","id":"kamu telah","vi":"bạn đã","th":"คุณได้","ko":"너는 ~했다","ja":"あなたは〜しました","zh":"你已经","kk":"сенде бар"},
  "i'd": {"cs":"já bych","de":"ich würde","en":"I'd (I would / I had)","es":"yo quisiera, yo habría","fr":"j'aimerais","ru":"я бы, я","uk":"я б, я","pl":"ja bym","tr":"isterdim, yapardım","it":"io vorrei","ro":"aș vrea","bg":"аз бих","hu":"én szeretnék","el":"εγώ θα","da":"jeg ville","lv":"es vēlētos","lt":"aš norėčiau","pt":"eu gostaria","sk":"ja by som","sl":"jaz bi","fi":"haluaisin","hr":"ja bih","sv":"jag skulle","et":"ma tahaksin","hi":"मैं चाहूँगा","bn":"আমি চাইতাম","ar":"أود, كنت قد","fa":"من می‌خواستم","ur":"میں چاہوں گا","id":"saya ingin","vi":"tôi muốn","th":"ฉันอยากจะ","ko":"나는 ~하고 싶다","ja":"私は〜したい","zh":"我想，我会","kk":"мен қалар едім"},
  "i'll": {"cs":"já budu","de":"ich werde","en":"I'll (I will)","es":"yo voy a","fr":"je vais","ru":"я буду, я сделаю","uk":"я буду, я зроблю","pl":"ja będę","tr":"ben yapacağım","it":"io farò","ro":"eu voi","bg":"аз ще","hu":"én fogok","el":"εγώ θα","da":"jeg vil","lv":"es būšu","lt":"aš būsiu","pt":"eu vou","sk":"ja budem","sl":"jaz bom","fi":"minä aion","hr":"ja ću","sv":"jag ska","et":"ma teen","hi":"मैं करूँगा","bn":"আমি করব","ar":"سوف أفعل","fa":"من انجام خواهم داد","ur":"میں کروں گا","id":"saya akan","vi":"tôi sẽ","th":"ฉันจะ","ko":"내가 ~하겠다","ja":"私が〜します","zh":"我将，我会","kk":"мен істеймін"},
  "i'm": {"cs":"já jsem","de":"ich bin","en":"I'm (I am)","es":"yo soy, estoy","fr":"je suis","ru":"я","uk":"я","pl":"jestem","tr":"ben","it":"io sono","ro":"eu sunt","bg":"аз съм","hu":"én vagyok","el":"εγώ είμαι","da":"jeg er","lv":"es esmu","lt":"aš esu","pt":"eu sou, estou","sk":"ja som","sl":"jaz sem","fi":"olen","hr":"ja sam","sv":"jag är","et":"ma olen","hi":"मैं हूँ","bn":"আমি হই","ar":"أنا","fa":"من هستم","ur":"میں ہوں","id":"saya adalah","vi":"tôi là","th":"ฉันคือ","ko":"나는 ~이다","ja":"私は〜です","zh":"我是","kk":"мен"},
  "i've": {"cs":"já mám","de":"ich habe","en":"I've (I have)","es":"yo he, tengo","fr":"j'ai","ru":"у меня есть, я","uk":"у мене є, я","pl":"mam","tr":"yaptım","it":"io ho","ro":"eu am","bg":"аз имам","hu":"nekem van","el":"εγώ έχω","da":"jeg har","lv":"man ir","lt":"aš turiu","pt":"eu tenho","sk":"ja mám","sl":"jaz imam","fi":"minulla on","hr":"ja imam","sv":"jag har","et":"mul on","hi":"मैंने किया है","bn":"আমার আছে","ar":"لقد فعلت","fa":"من انجام داده‌ام","ur":"میں نے کیا ہے","id":"saya telah","vi":"tôi đã","th":"ฉันได้","ko":"나는 ~했다","ja":"私は〜しました","zh":"我已经","kk":"менде бар"},
  "anna": {"ru":"Анна (имя)","uk":"Анна (ім'я)","en":"Anna","de":"Anna","es":"Anna","fr":"Anna","pl":"Anna","tr":"Anna","it":"Anna","ro":"Anna","bg":"Анна","hu":"Anna","el":"Άννα","da":"Anna","lv":"Anna","lt":"Anna","pt":"Anna","sk":"Anna","sl":"Anna","fi":"Anna","hr":"Anna","cs":"Anna","sv":"Anna","et":"Anna","hi":"ऐना","bn":"অ্যানা","ar":"آنّا","fa":"آنا","ur":"اینا","id":"Anna","vi":"Anna","th":"แอนนา","ko":"안나","ja":"アンナ","zh":"安娜","kk":"Анна"},
  "ben": {"ru":"Бен (имя)","uk":"Бен (ім'я)","en":"Ben","de":"Ben","es":"Ben","fr":"Ben","pl":"Ben","tr":"Ben","it":"Ben","ro":"Ben","bg":"Бен","hu":"Ben","el":"Μπεν","da":"Ben","lv":"Ben","lt":"Ben","pt":"Ben","sk":"Ben","sl":"Ben","fi":"Ben","hr":"Ben","cs":"Ben","sv":"Ben","et":"Ben","hi":"बेन","bn":"বেন","ar":"بين","fa":"بن","ur":"بین","id":"Ben","vi":"Ben","th":"เบน","ko":"벤","ja":"ベン","zh":"本","kk":"Бен"},
  "berlin": {"ru":"Берлин","uk":"Берлін","en":"Berlin","de":"Berlin","es":"Berlin","fr":"Berlin","pl":"Berlin","tr":"Berlin","it":"Berlin","ro":"Berlin","bg":"Берлин","hu":"Berlin","el":"Βερολίνο","da":"Berlin","lv":"Berlin","lt":"Berlin","pt":"Berlin","sk":"Berlin","sl":"Berlin","fi":"Berlin","hr":"Berlin","cs":"Berlin","sv":"Berlin","et":"Berlin","hi":"बर्लिन","bn":"বার্লিন","ar":"برلين","fa":"برلین","ur":"برلن","id":"Berlin","vi":"Berlin","th":"เบอร์ลิน","ko":"베를린","ja":"ベルリン","zh":"柏林","kk":"Берлин"},
  "biwa": {"ru":"Бива (озеро)","uk":"Біва (озеро)","en":"Biwa","de":"Biwa","es":"Biwa","fr":"Biwa","pl":"Biwa","tr":"Biwa","it":"Biwa","ro":"Biwa","bg":"Бива (езеро)","hu":"Biwa","el":"Μπίβα (λίμνη)","da":"Biwa","lv":"Biwa","lt":"Biwa","pt":"Biwa","sk":"Biwa","sl":"Biwa","fi":"Biwa","hr":"Biwa","cs":"Biwa","sv":"Biwa","et":"Biwa","hi":"बीवा (झील)","bn":"বিওয়া (হ্রদ)","ar":"بيوا (بحيرة)","fa":"بیوا","ur":"بیوا","id":"Biwa","vi":"Biwa","th":"บิวะ (ทะเลสาบ)","ko":"비와호","ja":"琵琶湖","zh":"琵琶湖","kk":"Бива (көл)"},
  "brighton": {"ru":"Брайтон (город)","uk":"Брайтон (місто)","en":"Brighton","de":"Brighton","es":"Brighton","fr":"Brighton","pl":"Brighton","tr":"Brighton","it":"Brighton","ro":"Brighton","bg":"Брайтън","hu":"Brighton","el":"Μπράιτον","da":"Brighton","lv":"Brighton","lt":"Brighton","pt":"Brighton","sk":"Brighton","sl":"Brighton","fi":"Brighton","hr":"Brighton","cs":"Brighton","sv":"Brighton","et":"Brighton","hi":"ब्राइटन","bn":"ব্রাইটন","ar":"برايتون","fa":"برایتون","ur":"برائٹن","id":"Brighton","vi":"Brighton","th":"ไบรตัน","ko":"브라이턴","ja":"ブライトン","zh":"布莱顿","kk":"Брайтон"},
  "daniel": {"ru":"Даниэль (имя)","uk":"Даніель (ім'я)","en":"Daniel","de":"Daniel","es":"Daniel","fr":"Daniel","pl":"Daniel","tr":"Daniel","it":"Daniel","ro":"Daniel","bg":"Даниел","hu":"Daniel","el":"Ντάνιελ","da":"Daniel","lv":"Daniel","lt":"Daniel","pt":"Daniel","sk":"Daniel","sl":"Daniel","fi":"Daniel","hr":"Daniel","cs":"Daniel","sv":"Daniel","et":"Daniel","hi":"डैनियल","bn":"ড্যানিয়েল","ar":"دانيال","fa":"دانیال","ur":"ڈینیل","id":"Daniel","vi":"Daniel","th":"แดเนียล","ko":"대니얼","ja":"ダニエル","zh":"丹尼尔","kk":"Даниэль"},
  "emma": {"ru":"Эмма (имя)","uk":"Емма (ім'я)","en":"Emma","de":"Emma","es":"Emma","fr":"Emma","pl":"Emma","tr":"Emma","it":"Emma","ro":"Emma","bg":"Ема","hu":"Emma","el":"Έμμα","da":"Emma","lv":"Emma","lt":"Emma","pt":"Emma","sk":"Emma","sl":"Emma","fi":"Emma","hr":"Emma","cs":"Emma","sv":"Emma","et":"Emma","hi":"एम्मा","bn":"এমা","ar":"إيما","fa":"اما","ur":"ایما","id":"Emma","vi":"Emma","th":"เอ็มม่า","ko":"엠マ","ja":"エマ","zh":"艾玛","kk":"Эмма"},
  "fujiwara": {"ru":"Фудзивара","uk":"Фудзівара","en":"Fujiwara","de":"Fujiwara","es":"Fujiwara","fr":"Fujiwara","pl":"Fujiwara","tr":"Fujiwara","it":"Fujiwara","ro":"Fujiwara","bg":"Фудживара","hu":"Fujiwara","el":"Φουτζιβάρα","da":"Fujiwara","lv":"Fujiwara","lt":"Fujiwara","pt":"Fujiwara","sk":"Fujiwara","sl":"Fujiwara","fi":"Fujiwara","hr":"Fujiwara","cs":"Fujiwara","sv":"Fujiwara","et":"Fujiwara","hi":"फुजिवारा","bn":"ফুজিওয়ারা","ar":"فوجيوارا","fa":"فوجی‌وارا","ur":"فوجیوارا","id":"Fujiwara","vi":"Fujiwara","th":"ฟูจิวาระ","ko":"후지와라","ja":"藤原","zh":"藤原","kk":"Фудзивара"},
  "hidesato": {"ru":"Хидэсато","uk":"Хідесато","en":"Hidesato","de":"Hidesato","es":"Hidesato","fr":"Hidesato","pl":"Hidesato","tr":"Hidesato","it":"Hidesato","ro":"Hidesato","bg":"Хидесато","hu":"Hidesato","el":"Χιντεσάτο","da":"Hidesato","lv":"Hidesato","lt":"Hidesato","pt":"Hidesato","sk":"Hidesato","sl":"Hidesato","fi":"Hidesato","hr":"Hidesato","cs":"Hidesato","sv":"Hidesato","et":"Hidesato","hi":"हिदेसातो","bn":"হিদেসাতো","ar":"هيديساتو","fa":"هیده‌ساتو","ur":"ہیدیساتو","id":"Hidesato","vi":"Hidesato","th":"ฮิเดซาโตะ","ko":"히데사토","ja":"秀郷","zh":"秀乡","kk":"Хидэсато"},
  "japan": {"ru":"Япония","uk":"Японія","en":"Japan","de":"Japan","es":"Japan","fr":"Japan","pl":"Japan","tr":"Japan","it":"Japan","ro":"Japan","bg":"Япония","hu":"Japan","el":"Ιαπωνία","da":"Japan","lv":"Japan","lt":"Japan","pt":"Japan","sk":"Japan","sl":"Japan","fi":"Japan","hr":"Japan","cs":"Japan","sv":"Japan","et":"Japan","hi":"जापान","bn":"জাপান","ar":"اليابان","fa":"ژاپن","ur":"جاپان","id":"Japan","vi":"Japan","th":"ญี่ปุ่น","ko":"일본","ja":"日本","zh":"日本","kk":"Жапония"},
  "koto": {"ru":"кото (инструмент)","uk":"кото (інструмент)","en":"Koto","de":"Koto","es":"Koto","fr":"Koto","pl":"Koto","tr":"Koto","it":"Koto","ro":"Koto","bg":"кото","hu":"Koto","el":"κότο","da":"Koto","lv":"Koto","lt":"Koto","pt":"Koto","sk":"Koto","sl":"Koto","fi":"Koto","hr":"Koto","cs":"Koto","sv":"Koto","et":"Koto","hi":"कोटो (वाद्य)","bn":"কোতো (যন্ত্র)","ar":"كوتو","fa":"کوتو","ur":"کوٹو","id":"Koto","vi":"Koto","th":"โคโตะ","ko":"고토 (악기)","ja":"箏（琴）","zh":"筝（日本古筝）","kk":"кото (аспап)"},
  "leo": {"ru":"Лео (имя)","uk":"Лео (ім'я)","en":"Leo","de":"Leo","es":"Leo","fr":"Leo","pl":"Leo","tr":"Leo","it":"Leo","ro":"Leo","bg":"Лео","hu":"Leo","el":"Λέο","da":"Leo","lv":"Leo","lt":"Leo","pt":"Leo","sk":"Leo","sl":"Leo","fi":"Leo","hr":"Leo","cs":"Leo","sv":"Leo","et":"Leo","hi":"लियो","bn":"লিও","ar":"ليو","fa":"لئو","ur":"لیو","id":"Leo","vi":"Leo","th":"ลีโอ","ko":"레오","ja":"レオ","zh":"利奥","kk":"Лео"},
  "lisbon": {"ru":"Лиссабон","uk":"Лісабон","en":"Lisbon","de":"Lisbon","es":"Lisbon","fr":"Lisbon","pl":"Lisbon","tr":"Lisbon","it":"Lisbon","ro":"Lisbon","bg":"Лисабон","hu":"Lisbon","el":"Λισαβόνα","da":"Lisbon","lv":"Lisbon","lt":"Lisbon","pt":"Lisbon","sk":"Lisbon","sl":"Lisbon","fi":"Lisbon","hr":"Lisbon","cs":"Lisbon","sv":"Lisbon","et":"Lisbon","hi":"लिस्बन","bn":"লিসবন","ar":"لشبونة","fa":"لیسبون","ur":"لزبن","id":"Lisbon","vi":"Lisbon","th":"ลิสบอน","ko":"리스본","ja":"リスボン","zh":"里斯本","kk":"Лиссабон"},
  "maya": {"ru":"Майя (имя)","uk":"Майя (ім'я)","en":"Maya","de":"Maya","es":"Maya","fr":"Maya","pl":"Maya","tr":"Maya","it":"Maya","ro":"Maya","bg":"Мая","hu":"Maya","el":"Μάγια","da":"Maya","lv":"Maya","lt":"Maya","pt":"Maya","sk":"Maya","sl":"Maya","fi":"Maya","hr":"Maya","cs":"Maya","sv":"Maya","et":"Maya","hi":"माया","bn":"মায়া","ar":"مايا","fa":"مایا","ur":"مایا","id":"Maya","vi":"Maya","th":"มายา","ko":"마야","ja":"マヤ","zh":"玛雅","kk":"Майя"},
  "mikami": {"ru":"Миками (гора)","uk":"Мікамі (гора)","en":"Mikami","de":"Mikami","es":"Mikami","fr":"Mikami","pl":"Mikami","tr":"Mikami","it":"Mikami","ro":"Mikami","bg":"Миками","hu":"Mikami","el":"Μικάμι","da":"Mikami","lv":"Mikami","lt":"Mikami","pt":"Mikami","sk":"Mikami","sl":"Mikami","fi":"Mikami","hr":"Mikami","cs":"Mikami","sv":"Mikami","et":"Mikami","hi":"मिका पर्वत","bn":"মিকামি","ar":"ميكامي","fa":"میکامی","ur":"میکامی","id":"Mikami","vi":"Mikami","th":"มิคามิ","ko":"미카미산","ja":"三上山","zh":"三上山","kk":"Миками"},
  "nina": {"ru":"Нина (имя)","uk":"Ніна (ім'я)","en":"Nina","de":"Nina","es":"Nina","fr":"Nina","pl":"Nina","tr":"Nina","it":"Nina","ro":"Nina","bg":"Нина","hu":"Nina","el":"Νίνα","da":"Nina","lv":"Nina","lt":"Nina","pt":"Nina","sk":"Nina","sl":"Nina","fi":"Nina","hr":"Nina","cs":"Nina","sv":"Nina","et":"Nina","hi":"नीना","bn":"নিনা","ar":"نينا","fa":"نینا","ur":"نینا","id":"Nina","vi":"Nina","th":"นีน่า","ko":"니나","ja":"ニーナ","zh":"尼娜","kk":"Нина"},
  "patel": {"ru":"Патель (фамилия)","uk":"Патель (прізвище)","en":"Patel","de":"Patel","es":"Patel","fr":"Patel","pl":"Patel","tr":"Patel","it":"Patel","ro":"Patel","bg":"Пател","hu":"Patel","el":"Πατέλ","da":"Patel","lv":"Patel","lt":"Patel","pt":"Patel","sk":"Patel","sl":"Patel","fi":"Patel","hr":"Patel","cs":"Patel","sv":"Patel","et":"Patel","hi":"पटेल","bn":"প্যাটেল","ar":"باتيل","fa":"پاتل","ur":"پٹیل","id":"Patel","vi":"Patel","th":"พาเทล","ko":"파텔","ja":"パテル","zh":"帕特尔","kk":"Патель"},
  "samisen": {"ru":"сямисэн (инструмент)","uk":"сямісен (інструмент)","en":"Samisen","de":"Samisen","es":"Samisen","fr":"Samisen","pl":"Samisen","tr":"Samisen","it":"Samisen","ro":"Samisen","bg":"сямисен","hu":"Samisen","el":"σαμισέν","da":"Samisen","lv":"Samisen","lt":"Samisen","pt":"Samisen","sk":"Samisen","sl":"Samisen","fi":"Samisen","hr":"Samisen","cs":"Samisen","sv":"Samisen","et":"Samisen","hi":"सामिसेन","bn":"সামিসেন","ar":"شاميسين","fa":"شامیسن","ur":"سامیسن","id":"Samisen","vi":"Samisen","th":"ซามิเซ็ง","ko":"샤미센","ja":"三味線","zh":"三味线","kk":"сямисэн"},
  "sara": {"ru":"Сара (имя)","uk":"Сара (ім'я)","en":"Sara","de":"Sara","es":"Sara","fr":"Sara","pl":"Sara","tr":"Sara","it":"Sara","ro":"Sara","bg":"Сара","hu":"Sara","el":"Σάρα","da":"Sara","lv":"Sara","lt":"Sara","pt":"Sara","sk":"Sara","sl":"Sara","fi":"Sara","hr":"Sara","cs":"Sara","sv":"Sara","et":"Sara","hi":"सारा","bn":"সারা","ar":"سارة","fa":"سارا","ur":"سارہ","id":"Sara","vi":"Sara","th":"ซาร่า","ko":"사라","ja":"サラ","zh":"萨拉","kk":"Сара"},
  "seta-no-karashi": {"ru":"мост Сэта","uk":"міст Сета","en":"Seta-no-Karashi","de":"Seta-no-Karashi","es":"Seta-no-Karashi","fr":"Seta-no-Karashi","pl":"Seta-no-Karashi","tr":"Seta-no-Karashi","it":"Seta-no-Karashi","ro":"Seta-no-Karashi","bg":"мост Сета","hu":"Seta-no-Karashi","el":"Γέφυρα Σέτα","da":"Seta-no-Karashi","lv":"Seta-no-Karashi","lt":"Seta-no-Karashi","pt":"Seta-no-Karashi","sk":"Seta-no-Karashi","sl":"Seta-no-Karashi","fi":"Seta-no-Karashi","hr":"Seta-no-Karashi","cs":"Seta-no-Karashi","sv":"Seta-no-Karashi","et":"Seta-no-Karashi","hi":"सेता पुल","bn":"সেতা সেতু","ar":"جسر سيتا","fa":"پل ستا","ur":"سیتا پل","id":"Seta-no-Karashi","vi":"Seta-no-Karashi","th":"สะพานเซตะ","ko":"세타의 다리","ja":"瀬田の唐橋","zh":"濑田唐桥","kk":"Сэта көпірі"},
  "tawara": {"ru":"Тавара","uk":"Тавара","en":"Tawara","de":"Tawara","es":"Tawara","fr":"Tawara","pl":"Tawara","tr":"Tawara","it":"Tawara","ro":"Tawara","bg":"Тавара","hu":"Tawara","el":"Ταβάρα","da":"Tawara","lv":"Tawara","lt":"Tawara","pt":"Tawara","sk":"Tawara","sl":"Tawara","fi":"Tawara","hr":"Tawara","cs":"Tawara","sv":"Tawara","et":"Tawara","hi":"तावारा","bn":"তাওয়ারা","ar":"تاوارا","fa":"تاوارا","ur":"تاوارا","id":"Tawara","vi":"Tawara","th":"ทาวาระ","ko":"타와라","ja":"俵","zh":"田原","kk":"Тавара"},
  "toda": {"ru":"Тода","uk":"Тода","en":"Toda","de":"Toda","es":"Toda","fr":"Toda","pl":"Toda","tr":"Toda","it":"Toda","ro":"Toda","bg":"Тода","hu":"Toda","el":"Τόντα","da":"Toda","lv":"Toda","lt":"Toda","pt":"Toda","sk":"Toda","sl":"Toda","fi":"Toda","hr":"Toda","cs":"Toda","sv":"Toda","et":"Toda","hi":"तोदा","bn":"তোদা","ar":"تودا","fa":"تودا","ur":"توڈا","id":"Toda","vi":"Toda","th":"โทดะ","ko":"토다","ja":"藤太","zh":"藤太","kk":"Тода"},
  "tom": {"ru":"Том (имя)","uk":"Том (ім'я)","en":"Tom","de":"Tom","es":"Tom","fr":"Tom","pl":"Tom","tr":"Tom","it":"Tom","ro":"Tom","bg":"Том","hu":"Tom","el":"Τομ","da":"Tom","lv":"Tom","lt":"Tom","pt":"Tom","sk":"Tom","sl":"Tom","fi":"Tom","hr":"Tom","cs":"Tom","sv":"Tom","et":"Tom","hi":"टॉम","bn":"টম","ar":"توم","fa":"تام","ur":"ٹام","id":"Tom","vi":"Tom","th":"ทอม","ko":"톰","ja":"トム","zh":"汤姆","kk":"Том"},
  "wi-fi": {"ru":"Wi-Fi (интернет)","uk":"Wi-Fi (інтернет)","en":"Wi-Fi","de":"Wi-Fi","es":"Wi-Fi","fr":"Wi-Fi","pl":"Wi-Fi","tr":"Wi-Fi","it":"Wi-Fi","ro":"Wi-Fi","bg":"Wi-Fi","hu":"Wi-Fi","el":"Wi-Fi","da":"Wi-Fi","lv":"Wi-Fi","lt":"Wi-Fi","pt":"Wi-Fi","sk":"Wi-Fi","sl":"Wi-Fi","fi":"Wi-Fi","hr":"Wi-Fi","cs":"Wi-Fi","sv":"Wi-Fi","et":"Wi-Fi","hi":"वाई-फ़ाई","bn":"ওয়াই-ফাই","ar":"واي فاي","fa":"وای‌فای","ur":"وائی فائی","id":"Wi-Fi","vi":"Wi-Fi","th":"ไวไฟ","ko":"와이파이","ja":"Wi-Fi","zh":"无线网络（Wi-Fi）","kk":"Wi-Fi"},
  "accompanied": {"en":"accompanied","ru":"в сопровождении, сопровождал","uk":"у супроводі, разом із","de":"begleitet","es":"acompañado","fr":"accompagné","pl":"w towarzystwie","it":"accompagnato","tr":"eşlik edilen","pt":"acompanhado","ro":"însoțit","bg":"придружен","cs":"doprovázený","sk":"sprevádzaný","hu":"kísért","el":"συνοδευόμενος","sl":"v spremstvu","et":"saadetud","lt":"lydimas","da":"ledsaget","fi":"saatettu","sv":"åtföljd","hr":"u pratnji","lv":"pavadīts","hi":"साथ में, साथ दिया","ar":"مصحوب","id":"ditemani","vi":"đi cùng, kèm theo","th":"พร้อมด้วย","ko":"동행한","ja":"付き添われた","bn":"সঙ্গী","fa":"همراهی شده","zh":"陪同，陪伴","ur":"ساتھ دیا","kk":"ілесіп жүрген"},
  "against": {"en":"against","ru":"против, к, об","uk":"проти, до, об","de":"gegen","es":"contra","fr":"contre","pl":"przeciwko","it":"contro","tr":"karşı","pt":"contra","ro":"împotriva","bg":"срещу","cs":"proti","sk":"proti","hu":"ellen","el":"εναντίον","sl":"proti","et":"vastu","lt":"prieš","da":"mod","fi":"vastaan","sv":"mot","hr":"protiv","lv":"pret","hi":"के खिलाफ","ar":"ضد","id":"melawan, terhadap","vi":"chống lại, tựa vào","th":"ต่อต้าน, พิง","ko":"~에 반대하여, 맞서","ja":"〜に対して、寄りかかって","bn":"বিরুদ্ধে","fa":"علیه, در برابر","zh":"反对，紧靠","ur":"کے خلاف","kk":"қарсы"},
  "aim": {"en":"aim, target","ru":"цель, целиться","uk":"ціль, цілитися","de":"zielen, Ziel","es":"apuntar, objetivo","fr":"viser, objectif","pl":"cel, celować","it":"mirare, obiettivo","tr":"hedef, nişan almak","pt":"mirar, objetivo","ro":"țintă, a ținti","bg":"цел, целя се","cs":"cíl, mířit","sk":"cieľ, mieriť","hu":"cél, céloz","el":"στόχος, στοχεύω","sl":"cilj, meriti","et":"siht, sihtima","lt":"tikslas, taikytis","da":"sigte, mål","fi":"tähdätä, tavoite","sv":"sikta, mål","hr":"cilj, ciljati","lv":"mērķis, mērķēt","hi":"निशाना साधना, उद्देश्य","ar":"هدف, صوب","id":"membidik, tujuan","vi":"nhắm vào, mục tiêu","th":"เล็ง, เป้าหมาย","ko":"겨냥하다, 목표","ja":"狙う、目的","bn":"লক্ষ্য, নিশানা করা","fa":"هدف, نشانه گرفتن","zh":"瞄准，目标","ur":"نشانہ باندھنا، مقصد","kk":"нысана, көздеу"},
  "bid": {"en":"commanded, ordered","ru":"велел, приказал","uk":"наказав, звелів","de":"gebot, befahl","es":"ordenó, mandó","fr":"ordonna, pria","pl":"rozkazał","it":"ordinò, invitò","tr":"emretti, buyurdu","pt":"ordenou, mandou","ro":"a poruncit","bg":"заповяда","cs":"přikázal","sk":"prikázal","hu":"parancsolt","el":"διέταξε","sl":"ukazal","et":"käskis","lt":"liepė","da":"bød, befalede","fi":"käski","sv":"bjöd, befallde","hr":"naredio je","lv":"pavēlēja","hi":"आज्ञा दी","ar":"أمر","id":"memerintahkan","vi":"ra lệnh","th":"สั่ง","ko":"명령했다","ja":"命じた","bn":"আদেশ দিল","fa":"دستور داد","zh":"命令，吩咐","ur":"حکم دیا","kk":"бұйырды"},
  "bounds": {"en":"bounds, limits","ru":"границы, пределы","uk":"межі, кордони","de":"Grenzen, Schranken","es":"límites","fr":"limites","pl":"granice","it":"limiti","tr":"sınırlar","pt":"limites","ro":"limite, hotare","bg":"граници","cs":"hranice, meze","sk":"hranice, medze","hu":"határok","el":"όρια","sl":"meje","et":"piirid","lt":"ribos","da":"grænser","fi":"rajat","sv":"gränser","hr":"granice","lv":"robežas","hi":"सीमाएं","ar":"حدود","id":"batasan","vi":"ranh giới, giới hạn","th":"ขอบเขต","ko":"한계, 범위","ja":"限界、範囲","bn":"সীমানা","fa":"حدود, مرزها","zh":"限度，界限","ur":"حدود","kk":"шекаралар, шектер"},
  "brightly": {"en":"brightly","ru":"ярко, светло","uk":"яскравo, світло","de":"hell, strahlend","es":"brillantemente","fr":"brillamment","pl":"jasno, jaskrawo","it":"brillantemente","tr":"parlak bir şekilde","pt":"brilhantemente","ro":"strălucitor","bg":"ярко","cs":"jasně, zářivě","sk":"jasne, žiarivo","hu":"fényesen","el":"λαμπερά","sl":"svetlo, jasno","et":"eredalt","lt":"ryškiai","da":"klart, lysende","fi":"kirkkaasti","sv":"ljust, strålande","hr":"sjajno, jarko","lv":"spoži","hi":"चमकते हुए","ar":"بسطوع","id":"dengan terang","vi":"rực rỡ, sáng sủa","th":"อย่างสดใส","ko":"밝게","ja":"明るく","bn":"উজ্জ্বলভাবে","fa":"به روشنی, درخشان","zh":"明亮地","ur":"چمک کے ساتھ","kk":"жарқырап"},
  "caught": {"en":"caught","ru":"поймал, пойманный","uk":"спіймав, зловив","de":"fing, erwischt","es":"atrapó","fr":"attrapé","pl":"złapał","it":"ha catturato","tr":"yakaladı","pt":"apanhou, capturou","ro":"a prins","bg":"хвана","cs":"chytil","sk":"chytil","hu":"elkapott","el":"έπιασε","sl":"ujel","et":"püütud","lt":"pagavo","da":"fangede","fi":"sai kiinni","sv":"fångade","hr":"uhvatio","lv":"noķēra","hi":"पकड़ लिया","ar":"أمسك","id":"menangkap","vi":"đã bắt","th":"จับได้","ko":"잡았다","ja":"捕まえた","bn":"ধরেছিল","fa":"گرفت","zh":"抓住，捕获","ur":"پکڑا","kk":"ұстап алды"},
  "ceremoniously": {"en":"ceremoniously","ru":"церемонно, торжественно","uk":"церемонно, урочисто","de":"feierlich, zeremoniell","es":"ceremoniosamente","fr":"cérémonieusement","pl":"uroczyście","it":"cerimoniosamente","tr":"törensel olarak","pt":"cerimoniosamente","ro":"ceremonios","bg":"церемониално","cs":"slavnostně, obřadně","sk":"slávnostne","hu":"ünnepélyesen","el":"τελετουργικά","sl":"slovesno","et":"pidulikult","lt":"iškilmingai","da":"højtideligt","fi":"juhlallisesti","sv":"högtidligt","hr":"svečano","lv":"svinīgi","hi":"समारोहपूर्वक","ar":"بمراسيم, بوقار","id":"dengan khidmat","vi":"trang trọng","th":"อย่างเป็นทางการ","ko":"정중하게, 의식에 맞춰","ja":"礼儀正しく","bn":"আনুষ্ঠানিকভাবে","fa":"با تشریفات","zh":"隆重地，客套地","ur":"باقاعدہ طریقے سے","kk":"салтанатты түрде"},
  "certain": {"en":"certain, specific","ru":"определенный, некоторый","uk":"певний, деякий","de":"bestimmt, gewiss","es":"cierto, seguro","fr":"certain","pl":"pewien, określony","it":"certo, determinato","tr":"belirli, kesin","pt":"certo, determinado","ro":"anumit, sigur","bg":"определен","cs":"určitý, jistý","sk":"určitý, istý","hu":"bizonyos","el":"συγκεκριμένος, βέβαιος","sl":"določen","et":"teatud, kindel","lt":"tam tikras","da":"vis, bestemt","fi":"tietty","sv":"viss, bestämd","hr":"određen, siguran","lv":"noteikts","hi":"निश्चित, कुछ","ar":"محدد, معين","id":"tertentu","vi":"nhất định, chắc chắn","th":"แน่นอน, บาง","ko":"어떤, 특정한","ja":"ある、特定の","bn":"নির্দিষ্ট","fa":"مشخص, معین","zh":"某种，确定的","ur":"خاص، معین","kk":"белгілі бір"},
  "check-out": {"en":"check-out","ru":"выезд (из отеля), расчет","uk":"виїзд (з готелю), розрахунок","de":"Abreise, Check-out","es":"salida, check-out","fr":"départ, check-out","pl":"wymeldowanie","it":"partenza, check-out","tr":"çıkış, check-out","pt":"saída, check-out","ro":"plecare, check-out","bg":"напускане на хотел","cs":"odhlášení z hotelu","sk":"odhlásenie","hu":"kijelentkezés","el":"αναχώρηση από ξενοδοχείο","sl":"odjava iz hotela","et":"hotellist väljaregistreerimine","lt":"išsiregistravimas","da":"udtjekning","fi":"uloskirjautuminen","sv":"utcheckning","hr":"odjava iz hotela","lv":"izrakstīšanās","hi":"होटल से रवानगी","ar":"تسجيل المغادرة","id":"proses keluar hotel","vi":"trả phòng","th":"เช็คเอาท์","ko":"체크아웃, 퇴실","ja":"チェックアウト","bn":"হোটেল ত্যাগ","fa":"تصفیه حساب و خروج","zh":"结账退房","ur":"ہوٹل سے روانگی","kk":"қонақүйден шығу"},
  "creep": {"en":"creep, crawl","ru":"ползти, мурашки","uk":"повзти, мурашки","de":"kriechen, schleichen","es":"arrastrarse","fr":"ramper","pl":"czołgać się","it":"strisciare","tr":"sürünmek","pt":"arrastar-se","ro":"a se târî","bg":"пълзя","cs":"plížit se, lézt","sk":"plaziť sa","hu":"kúszik, mászik","el":"έρπω","sl":"plaziti se","et":"roomama","lt":"šliaužti","da":"krybe","fi":"ryömiä","sv":"krypa","hr":"puzati","lv":"rāpot","hi":"रेंगना","ar":"زحف","id":"merayap","vi":"bò, rón rén","th":"คลาน","ko":"기어가다, 소름 끼치다","ja":"這う、ぞっとする","bn":"হামাগুড়ি দেওয়া","fa":"خزیدن","zh":"爬行，毛骨悚然","ur":"رینگنا","kk":"өрмелеу, жорғалау"},
  "dauntlessly": {"en":"dauntlessly","ru":"бесстрашно, неустрашимо","uk":"безстрашно, неустрашимо","de":"furchtlos","es":"intrépidamente","fr":"intrépidement","pl":"nieustraszenie","it":"intrepidamente","tr":"korkusuzca","pt":"intrépida e bravamente","ro":"neînfricat","bg":"безстрашно","cs":"neohroženě","sk":"neohrozene","hu":"rettenthetetlenül","el":"ατρόμητα","sl":"neustrašno","et":"kartmatult","lt":"be baimės","da":"frygtløst","fi":"pelottomasti","sv":"oförskräckt","hr":"neustrašivo","lv":"bezbailīgi","hi":"निडर होकर","ar":"بجسارة, بلا خوف","id":"dengan gagah berani","vi":"can đảm, bất khuất","th":"อย่างไม่เกรงกลัว","ko":"용감하게, 굽히지 않고","ja":"恐れずに、勇敢に","bn":"নির্ভয়ে","fa":"بی‌باکانه","zh":"勇敢地，大无畏地","ur":"بے خوفی سے","kk":"қорықпай, ержүректікпен"},
  "deliciously": {"en":"deliciously","ru":"восхитительно, очень вкусно","uk":"чудово, дуже смачно","de":"köstlich","es":"deliciosamente","fr":"délicieusement","pl":"pysznie, wyśmienicie","it":"deliziosamente","tr":"lezzetli bir şekilde","pt":"deliciosamente","ro":"delicios","bg":"вкусно","cs":"lahodně","sk":"lahodne","hu":"ízletesen","el":"νόστιμα","sl":"okusno","et":"maitsvalt","lt":"skaniai","da":"lækkert","fi":"herkullisesti","sv":"läckert","hr":"ukusno","lv":"gardi","hi":"स्वादिष्ट रूप से","ar":"بشهية, بلذة","id":"dengan lezat","vi":"thơm ngon","th":"อย่างเอร็ดอร่อย","ko":"맛있게","ja":"とても美味しく","bn":"সুস্বাদুভাবে","fa":"به طرز لذیذی","zh":"美味地","ur":"مزیدار انداز میں","kk":"өте дәмді"},
  "everything": {"en":"everything","ru":"всё, все","uk":"все","de":"alles","es":"todo","fr":"tout","pl":"wszystko","it":"tutto","tr":"her şey","pt":"tudo","ro":"totul, tot","bg":"всичко","cs":"všechno, vše","sk":"všetko","hu":"minden","el":"όλα","sl":"vse","et":"kõik","lt":"viskas","da":"alt","fi":"kaikki","sv":"allt","hr":"sve","lv":"viss","hi":"सब कुछ","ar":"كل شيء","id":"semuanya","vi":"mọi thứ","th":"ทุกอย่าง","ko":"모든 것","ja":"すべて","bn":"সবকিছু","fa":"همه چیز","zh":"一切，每件事","ur":"سب کچھ","kk":"бәрі, барлығы"},
  "eat": {"en":"eat","ru":"есть, кушать","uk":"їсти, куштувати","de":"essen","es":"comer","fr":"manger","pl":"jeść","it":"mangiare","tr":"yemek yemek","pt":"comer","ro":"a mânca","bg":"ям","cs":"jíst","sk":"jesť","hu":"enni","el":"τρώω","sl":"jesti","et":"sööma","lt":"valgyti","da":"spise","fi":"syödä","sv":"äta","hr":"jesti","lv":"ēst","hi":"खाना","ar":"أكل","id":"makan","vi":"ăn","th":"กิน, ทาน","ko":"먹다","ja":"食べる","bn":"খাওয়া","fa":"خوردن","zh":"吃","ur":"کھانا","kk":"жеу"},
  "explain": {"en":"explain","ru":"объяснять","uk":"пояснювати","de":"erklären","es":"explicar","fr":"expliquer","pl":"wyjaśniać","it":"spiegare","tr":"açıklamak","pt":"explicar","ro":"a explica","bg":"обяснявам","cs":"vysvětlit","sk":"vysvetliť","hu":"elmagyaráz","el":"εξηγώ","sl":"razložiti","et":"selgitama","lt":"paaiškinti","da":"forklare","fi":"selittää","sv":"förklara","hr":"objasniti","lv":"paskaidrot","hi":"समझाना","ar":"شرح","id":"menjelaskan","vi":"giải thích","th":"อธิบาย","ko":"설명하다","ja":"説明する","bn":"ব্যাখ্যা করা","fa":"توضیح دادن","zh":"解释，说明","ur":"وضاحت کرنا","kk":"түсіндіру"},
  "forward": {"en":"forward, ahead","ru":"вперёд","uk":"вперед","de":"vorwärts","es":"adelante","fr":"en avant","pl":"naprzód","it":"avanti","tr":"ileri","pt":"para a frente","ro":"înainte","bg":"напред","cs":"vpřed","sk":"vpred","hu":"előre","el":"εμπρός","sl":"naprej","et":"edasi","lt":"pirmyn","da":"fremad","fi":"eteenpäin","sv":"framåt","hr":"naprijed","lv":"uz priekšu","hi":"आगे की ओर","ar":"إلى الأمام","id":"ke depan","vi":"về phía trước","th":"ไปข้างหน้า","ko":"앞으로","ja":"前へ","bn":"সামনে","fa":"به جلو","zh":"向前","ur":"آگے","kk":"алға"},
  "grand-children": {"en":"grandchildren","ru":"внуки","uk":"онуки","de":"Enkelkinder","es":"nietos","fr":"petits-enfants","pl":"wnuki","it":"nipoti","tr":"torunlar","pt":"netos","ro":"nepoți","bg":"внуци","cs":"vnoučata","sk":"vnúčatá","hu":"unokák","el":"εγγόνια","sl":"vnuki","et":"lapselapsed","lt":"anūkai","da":"børnebørn","fi":"lastenlapset","sv":"barnbarn","hr":"unuci","lv":"mazbērni","hi":"पोते-पोतियाँ","ar":"أحفاد","id":"cucu-cucu","vi":"các cháu","th":"หลานๆ","ko":"손주들","ja":"孫たち","bn":"নাতি-নাতনি","fa":"نوه‌ها","zh":"孙子孙女","ur":"پوتے پوتیاں","kk":"немерелер"},
  "harmlessly": {"en":"harmlessly","ru":"безвредно, безобидно","uk":"нешкідливо, безпечно","de":"harmlos","es":"inofensivamente","fr":"inoffensivement","pl":"nieszkodliwie","it":"innocuamente","tr":"zararsızca","pt":"inofensivamente","ro":"inofensiv","bg":"безвредно","cs":"neškodně","sk":"neškodne","hu":"ártalmatlanul","el":"αβλαβώς","sl":"nenevarno","et":"kahjutult","lt":"nekenksmingai","da":"harmløst","fi":"harmittomasti","sv":"harmlöst","hr":"bezopasno","lv":"nekaitīgi","hi":"हानिरहित तरीके से","ar":"بشكل غير ضار","id":"tanpa membahayakan","vi":"vô hại","th":"อย่างไม่เป็นอันตราย","ko":"해를 끼치지 않고","ja":"害を与えずに","bn":"ক্ষতি না করে","fa":"بی‌ضرر","zh":"无害地","ur":"بے ضرر انداز میں","kk":"зиянсыз"},
  "henceforth": {"en":"henceforth","ru":"впредь, с этого времени","uk":"відтепер, надалі","de":"fortan, von nun an","es":"de ahora en adelante","fr":"dorénavant","pl":"odtąd","it":"d'ora in poi","tr":"bundan böyle","pt":"de agora em diante","ro":"de acum înainte","bg":"отсега нататък","cs":"napříště, od nynějška","sk":"odteraz","hu":"ezentúl","el":"στο εξής","sl":"odslej","et":"edaspidi","lt":"nuo šiol","da":"fremover","fi":"tästedes","sv":"hädanefter","hr":"ubuduće","lv":"turpmāk","hi":"अब से, भविष्य में","ar":"من الآن فصاعدا","id":"mulai sekarang","vi":"kể từ nay","th":"นับแต่นี้เป็นต้นไป","ko":"이제부터는","ja":"これ以降","bn":"এখন থেকে","fa":"از این پس","zh":"从此以后","ur":"اب سے آگے","kk":"бұдан былай"},
  "hung": {"en":"hung, was hanging","ru":"висел, повесил","uk":"висів, повісив","de":"hing, hing auf","es":"colgó, colgaba","fr":"pendait, accroché","pl":"wisiał","it":"pendeva, ha appeso","tr":"asıldı, astı","pt":"pendurou, estava pendurado","ro":"atârna, a agățat","bg":"висеше","cs":"visel, pověsil","sk":"visel, zavesil","hu":"lógott, akasztott","el":"κρεμόταν","sl":"visel","et":"rippus","lt":"kabojo","da":"hang","fi":"riippui","sv":"hängde","hr":"visio je","lv":"karājās","hi":"लटका हुआ था","ar":"علق, تدلى","id":"tergantung, menggantung","vi":"treo, lơ lửng","th":"แขวนอยู่","ko":"걸려 있었다","ja":"ぶら下がっていた","bn":"ঝুলে ছিল","fa":"آویزان بود","zh":"悬挂，垂挂","ur":"لٹکا ہوا تھا","kk":"ілулі тұрды"},
  "man": {"en":"man, human","ru":"человек, мужчина","uk":"чоловік, людина","de":"Mann, Mensch","es":"hombre","fr":"homme","pl":"mężczyzna, człowiek","it":"uomo","tr":"adam, insan","pt":"homem","ro":"bărbat, om","bg":"мъж, човек","cs":"muž, člověk","sk":"muž, človek","hu":"férfi, ember","el":"άνδρας, άνθρωπος","sl":"moški, človek","et":"mees, inimene","lt":"vyras, žmogus","da":"mand","fi":"mies","sv":"man","hr":"čovjek, muškarac","lv":"vīrietis, cilvēks","hi":"आदमी, पुरुष","ar":"رجل, إنسان","id":"pria, orang","vi":"người đàn ông","th":"ผู้ชาย","ko":"남자, 사람","ja":"男、人間","bn":"মানুষ, পুরুষ","fa":"مرد, انسان","zh":"男人，人","ur":"آدمی، مرد","kk":"ер адам, кісі"},
  "oh": {"en":"oh!","ru":"о!, ой!","uk":"о!, ой!","de":"oh!, ach!","es":"¡oh!","fr":"oh !","pl":"o!, ach!","it":"oh!","tr":"ah!, ey!","pt":"ó!, oh!","ro":"o!, vai!","bg":"о!, ох!","cs":"ó!, ach!","sk":"ó!, ach!","hu":"ó!, jaj!","el":"ω!","sl":"o!, ah!","et":"oo!, oh!","lt":"o!, oi!","da":"åh!, oh!","fi":"voi!, oi!","sv":"åh!, o!","hr":"o!, oh!","lv":"ak!, ak vai!","hi":"ओह!","ar":"يا!, أوه!","id":"oh!","vi":"ôi!","th":"โอ้!","ko":"오!, 아!","ja":"ああ！、おお！","bn":"ওহ!","fa":"اوه!","zh":"哦！，哎呀！","ur":"اوہ!","kk":"о!, ой!"},
  "practise": {"en":"practise","ru":"практиковать, упражняться","uk":"практикувати, вправлятися","de":"üben, praktizieren","es":"practicar","fr":"pratiquer, s’entraîner","pl":"ćwiczyć, praktykować","it":"esercitarsi, praticare","tr":"pratik yapmak","pt":"praticar, exercitar","ro":"a practica","bg":"практикувам","cs":"procvičovat","sk":"precvičovať","hu":"gyakorol","el":"εξασκούμαι","sl":"vaditi","et":"harjutama","lt":"praktikuotis","da":"øve","fi":"harjoitella","sv":"öva","hr":"vježbati","lv":"trenēties","hi":"अभ्यास करना","ar":"ممارسة","id":"berlatih","vi":"luyện tập","th":"ฝึกฝน","ko":"연습하다","ja":"練習する","bn":"অনুশীলন করা","fa":"تمرین کردن","zh":"练习，实习","ur":"مشق کرنا","kk":"жаттығу, тәжірибе жасау"},
  "promised": {"en":"promised","ru":"обещал, обещанный","uk":"обіцяв, обіцяний","de":"versprach","es":"prometió","fr":"promis","pl":"obiecał","it":"ha promesso","tr":"söz verdi","pt":"prometeu","ro":"a promis","bg":"обеща","cs":"slíbil","sk":"sľúbil","hu":"megígérte","el":"υποσχέθηκε","sl":"obljubil","et":"lubas","lt":"pažadėjo","da":"lovede","fi":"lupasi","sv":"lovade","hr":"obećao je","lv":"apsolīja","hi":"वादा किया","ar":"وعد","id":"berjanji","vi":"đã hứa","th":"สัญญาแล้ว","ko":"약속했다","ja":"約束した","bn":"প্রতিশ্রুতি দিয়েছিল","fa":"قول داد","zh":"答应，承诺","ur":"وعدہ کیا","kk":"уәде берді"},
  "rainy": {"en":"rainy","ru":"дождливый","uk":"дощовий","de":"regnerisch","es":"lluvioso","fr":"pluvieux","pl":"deszczowy","it":"piovoso","tr":"yağmurlu","pt":"chuvoso","ro":"ploios","bg":"дъждовен","cs":"deštivý","sk":"daždivý","hu":"esős","el":"βροχερός","sl":"deževen","et":"vihmane","lt":"lietingas","da":"regnfuld","fi":"sateinen","sv":"regnig","hr":"kišovit","lv":"lietains","hi":"बरसाती","ar":"ماطر","id":"berhujan","vi":"có mưa","th":"ฝนตก","ko":"비 내리는","ja":"雨の降る","bn":"বৃষ্টিবহুল","fa":"بارانی","zh":"下雨的，多雨的","ur":"بارانی","kk":"жаңбырлы"},
  "red-carp": {"en":"red carp","ru":"красный карп","uk":"червоний короп","de":"roter Karpfen","es":"carpa roja","fr":"carpe rouge","pl":"czerwony karp","it":"carpa rossa","tr":"kırmızı sazan","pt":"carpa vermelha","ro":"crap roșu","bg":"червен шаран","cs":"červený kapr","sk":"červený kapor","hu":"vörös ponty","el":"κόκκινος κυπρίνος","sl":"rdeči krap","et":"punane karpkala","lt":"raudonasis karpis","da":"rød karpe","fi":"punainen karppi","sv":"röd karp","hr":"crveni šaran","lv":"sarkana karpa","hi":"लाल कार्प मछली","ar":"سمك الشبوط الأحمر","id":"ikan mas merah","vi":"cá chép đỏ","th":"ปลาคาร์พสีแดง","ko":"붉은 잉어","ja":"赤鯉（あかごい）","bn":"লাল কার্প মাছ","fa":"ماهی کپور قرمز","zh":"红鲤鱼","ur":"سرخ کارپ مچھلی","kk":"қызыл тұқы балық"},
  "restarting": {"en":"restarting","ru":"перезапуск, перезагрузка","uk":"перезапуск, перезавантаження","de":"Neustart","es":"reiniciando","fr":"redémarrage","pl":"ponowne uruchamianie","it":"riavvio","tr":"yeniden başlatılıyor","pt":"reiniciando","ro":"repornire","bg":"рестартиране","cs":"restartování","sk":"reštartovanie","hu":"újraindítás","el":"επανεκκίνηση","sl":"ponovni zagon","et":"taaskäivitamine","lt":"paleidimas iš naujo","da":"genstart","fi":"uudelleenkäynnistys","sv":"omstart","hr":"ponovno pokretanje","lv":"pārstartēšana","hi":"पुनरारंभ करना","ar":"إعادة التشغيل","id":"memulai ulang","vi":"khởi động lại","th":"กำลังรีสตาร์ท","ko":"다시 시작하는 중","ja":"再起動中","bn":"পুনরায় চালু হচ্ছে","fa":"راه‌اندازی مجدد","zh":"正在重新启动","ur":"دوبارہ شروع ہو رہا ہے","kk":"қайта қосу"},
  "salt-water": {"en":"salt water","ru":"соленая вода, морская вода","uk":"солона вода, морська вода","de":"Salzwasser","es":"agua salada","fr":"eau salée","pl":"słona woda","it":"acqua salata","tr":"tuzlu su","pt":"água salgada","ro":"apă sărată","bg":"солена вода","cs":"slaná voda","sk":"slaná voda","hu":"sós víz","el":"αλμυρό νερό","sl":"slana voda","et":"soolane vesi","lt":"sūrus vanduo","da":"saltvand","fi":"suolavesi","sv":"saltvatten","hr":"slana voda","lv":"sālsūdens","hi":"खारा पानी","ar":"ماء مالح","id":"air asin","vi":"nước mặn","th":"น้ำเค็ม","ko":"소금물, 바닷물","ja":"塩水、海水","bn":"লবণাক্ত জল","fa":"آب شور","zh":"盐水，海水","ur":"نمکین پانی","kk":"тұзды су"},
  "sea-green": {"en":"sea-green","ru":"цвета морской волны","uk":"кольору морської хвилі","de":"meergrün","es":"verde mar","fr":"vert d’eau","pl":"morski zielony","it":"verde acqua","tr":"deniz yeşili","pt":"verde-mar","ro":"verde marin","bg":"морско зелено","cs":"mořsky zelený","sk":"morsky zelený","hu":"tengerzöld","el":"θαλασσοπράσινο","sl":"morsko zelena","et":"mereroheline","lt":"jūros žalumo","da":"havgrøn","fi":"merenvihreä","sv":"havsgrön","hr":"morskozeleno","lv":"jūras zaļš","hi":"समुद्री हरा","ar":"أخضر بحري","id":"hijau laut","vi":"xanh nước biển","th":"สีเขียวอมฟ้า","ko":"바다빛 청록색","ja":"青緑色、海緑色","bn":"সমুদ্র-সবুজ","fa":"سبز دریایی","zh":"海绿色","ur":"سمندری سبز","kk":"теңіз жасыл түсті"},
  "serpent-dragon": {"en":"serpent-dragon","ru":"змей-дракон","uk":"змій-дракон","de":"Schlangendrache","es":"serpiente-dragón","fr":"serpent-dragon","pl":"wąż-smok","it":"serpente-drago","tr":"yılan-ejderha","pt":"serpente-dragão","ro":"șarpe-dragon","bg":"змей-дракон","cs":"hadí drak","sk":"hadí drak","hu":"kígyósárkány","el":"δράκος-φίδι","sl":"kačji zmaj","et":"madu-draakon","lt":"gyvatė-drakonas","da":"slangedrage","fi":"käärmelohikäärme","sv":"ormdrake","hr":"zmijoliki zmaj","lv":"čūska-pūķis","hi":"सांप-अजगर ड्रैगन","ar":"التنين الثعباني","id":"naga ular","vi":"rắn rồng","th":"มังกรคล้ายงู","ko":"뱀 형상의 용","ja":"大蛇の竜","bn":"সাপ-ড্রাগন","fa":"اژدهای مارگونه","zh":"蛇形恶龙","ur":"سانپ نما اژدہا","kk":"жылан тәрізді айдаһар"},
  "strange-looking": {"en":"strange-looking","ru":"странный на вид","uk":"дивний на вигляд","de":"seltsam aussehend","es":"de aspecto extraño","fr":"à l’aspect étrange","pl":"dziwnie wyglądający","it":"dall’aspetto strano","tr":"garip görünümlü","pt":"de aparência estranha","ro":"cu aspect ciudat","bg":"странно изглеждащ","cs":"zvláštně vypadající","sk":"podivne vyzerajúci","hu":"különös kinézetű","el":"παράξενος στην όψη","sl":"nenavadnega videza","et":"kummalise välimusega","lt":"keistos išvaizdos","da":"mærkeligt udseende","fi":"oudonnäköinen","sv":"märkligt utseende","hr":"čudnog izgleda","lv":"savāda izskata","hi":"अजीब दिखने वाला","ar":"غريب المظهر","id":"tampak aneh","vi":"trông kỳ lạ","th":"ดูแปลกตา","ko":"기이하게 생긴","ja":"奇妙な姿の","bn":"অদ্ভুত দেখতে","fa":"عجیب الخلقه","zh":"样貌奇特的","ur":"عجیب و غریب شکل والا","kk":"түрі оғаш"},
  "theatre": {"en":"theatre","ru":"театр","uk":"театр","de":"Theater","es":"teatro","fr":"théâtre","pl":"teatr","it":"teatro","tr":"tiyatro","pt":"teatro","ro":"teatru","bg":"театър","cs":"divadlo","sk":"divadlo","hu":"színház","el":"θέατρο","sl":"gledališče","et":"teater","lt":"teatras","da":"teater","fi":"teatteri","sv":"teater","hr":"kazalište","lv":"teātris","hi":"नाट्यशाला","ar":"مسرح","id":"teater","vi":"nhà hát","th":"โรงละคร","ko":"극장","ja":"劇場","bn":"থিয়েটার","fa":"تئاتر","zh":"剧院","ur":"تھیٹر","kk":"театр"},
  "throw": {"en":"throw","ru":"бросать, кидать","uk":"кидати, жбурляти","de":"werfen","es":"lanzar, tirar","fr":"lancer, jeter","pl":"rzucać","it":"lanciare","tr":"fırlatmak, atmak","pt":"jogar, lançar","ro":"a arunca","bg":"хвърлям","cs":"házet","sk":"hádzať","hu":"dobni","el":"ρίχνω","sl":"vreči, metati","et":"viskama","lt":"mesti","da":"kaste","fi":"heittää","sv":"kasta","hr":"baciti","lv":"mest","hi":"फेंकना","ar":"رمي","id":"melempar","vi":"ném","th":"ขว้าง, โยน","ko":"던지다","ja":"投げる","bn":"নিক্ষেপ করা","fa":"پرتاب کردن","zh":"投掷，扔","ur":"پھینکنا","kk":"лақтыру"},
  "twenty-five": {"en":"twenty-five","ru":"двадцать пять","uk":"двадцять п’ять","de":"fünfundzwanzig","es":"veinticinco","fr":"vingt-cinq","pl":"dwadzieścia pięć","it":"venticinque","tr":"yirmi beş","pt":"vinte e cinco","ro":"douăzeci și cinci","bg":"двадесет и пет","cs":"dvacet pět","sk":"dvadsaťpäť","hu":"huszonöt","el":"είκοσι πέντε","sl":"petindvajset","et":"kakskümmend viis","lt":"dvidešimt penki","da":"femogtyve","fi":"kaksikymmentäviisi","sv":"tjugofem","hr":"dvadeset i pet","lv":"divdesmit pieci","hi":"पच्चीस","ar":"خمسة وعشرون","id":"dua puluh lima","vi":"hai mươi lăm","th":"ยี่สิบห้า","ko":"스물다섯","ja":"二十五","bn":"পঁচিশ","fa":"بیست و پنج","zh":"二十五","ur":"پچیس","kk":"жиырма бес"},
  "unsure": {"en":"unsure, uncertain","ru":"неуверенный","uk":"невпевнений","de":"unsicher","es":"inseguro","fr":"incertain","pl":"niepewny","it":"insicuro, incerto","tr":"emin olmayan","pt":"inseguro","ro":"nesigur","bg":"несигурен","cs":"nejistý","sk":"neistý","hu":"bizonytalan","el":"αβέβαιος","sl":"negotov","et":"ebakindel","lt":"neužtikrintas","da":"usikker","fi":"epävarma","sv":"osäker","hr":"nesiguran","lv":"nedrošs","hi":"अनिश्चित","ar":"غير متأكد","id":"tidak yakin","vi":"không chắc chắn","th":"ไม่แน่ใจ","ko":"확신하지 못하는","ja":"不確かな","bn":"অনিশ্চিত","fa":"نامطمئن","zh":"不确定的","ur":"غیر یقینی","kk":"сенімсіз"},
  "worries": {"en":"worries","ru":"тревоги, волнения","uk":"хвилювання, тривоги","de":"Sorgen","es":"preocupaciones","fr":"inquiétudes","pl":"zmartwienia","it":"preoccupazioni","tr":"endişeler","pt":"preocupações","ro":"griji","bg":"притеснения","cs":"obavy, starosti","sk":"obavy","hu":"aggodalmak","el":"ανησυχίες","sl":"skrbi","et":"mured","lt":"rūpesčiai","da":"bekymringer","fi":"huolet","sv":"bekymmer","hr":"brige","lv":"rūpes","hi":"चिंताएं","ar":"مخاوف, قلق","id":"kekhawatiran","vi":"lo lắng","th":"ความกังวล","ko":"걱정거리들","ja":"心配事","bn":"উদ্বেগ","fa":"نگرانی‌ها","zh":"担忧，烦恼","ur":"فکریں","kk":"алаңдаушылықтар"},
  "worry": {"en":"worry","ru":"беспокоиться, волноваться","uk":"хвилюватися, непокоїтися","de":"sich sorgen","es":"preocuparse","fr":"s’inquiéter","pl":"martwić się","it":"preoccuparsi","tr":"endişelenmek","pt":"preocupar-se","ro":"a se îngrijora","bg":"безпокоя се","cs":"obávat se","sk":"obávať sa","hu":"aggódni","el":"ανησυχώ","sl":"skrbeti","et":"muretsema","lt":"jaudintis","da":"bekymre sig","fi":"huolehtia","sv":"oroa sig","hr":"brinuti se","lv":"uztraukties","hi":"चिंता करना","ar":"يقلق","id":"khawatir","vi":"lo lắng","th":"กังวล","ko":"걱정하다","ja":"心配する","bn":"চিন্তা করা","fa":"نگران بودن","zh":"担心，发愁","ur":"فکر کرنا","kk":"алаңдау"},
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



let _dictionaryCache = null;
let _wordLookupMap = null;
let _dictMapLang = null;

export function clearStoryWordCache() {
  _wordLookupMap = null;
  _dictionaryCache = null;
  _dictMapLang = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('myduo:lang_changed', () => {
    clearStoryWordCache();
  });
}

async function getOrBuildDictionary(activeLang) {
  const currentLang = activeLang || getInterfaceLanguage();
  if (_wordLookupMap && _dictMapLang === currentLang && _wordLookupMap.size > 0) {
    return _wordLookupMap;
  }
  clearStoryWordCache();
  _dictMapLang = currentLang;

  try {
    const res = await getWords(true);
    const list = Array.isArray(res) ? res : (res?.data || []);
    _dictionaryCache = list;
    _wordLookupMap = new Map();
    list.forEach(w => {
      if (w && w.word) {
        _wordLookupMap.set(String(w.word).toLowerCase().trim(), w);
      }
    });
  } catch (e) {
    _wordLookupMap = new Map();
  }
  return _wordLookupMap;
}

export function resolveWord(rawWord, dictMap, lang) {
  let clean = String(rawWord || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u02BB]/g, "'")
    .replace(/[^a-z'-]/g, '')
    .trim()
    .replace(/^['-]+|['-]+$/g, '');
  if (!clean) return null;

  const getTrans = (w) => {
    if (!w) return '';
    if (lang === 'en') {
      return (w.translations && w.translations.en) ? w.translations.en : (w.word || clean);
    }
    if (w.translations && typeof w.translations === 'object' && w.translations[lang]) {
      return w.translations[lang];
    }
    const t = getWordTranslation(w, lang);
    if (t) return t;
    if (lang === 'ru' && w.translation) return w.translation;
    return '';
  };

  // 1. Direct dictionary match
  if (dictMap.has(clean)) {
    const w = dictMap.get(clean);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getTrans(w),
      isFromDict: true,
      rawObj: w
    };
  }

  // 2. Direct function / story words map (pronouns, contractions, names, function words across all 36 locales)
  if (FUNCTION_WORDS_MAP[clean]) {
    const entry = FUNCTION_WORDS_MAP[clean];
    const trans = entry[lang] || (lang === 'ru' ? entry['ru'] : '') || (lang === 'en' ? entry['en'] : '') || '';
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
    if (resolvedBase && resolvedBase.translation) {
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
    if (resolvedAlt && resolvedAlt.translation) {
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
          translation: getTrans(w),
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
      translation: getTrans(w),
      isFromDict: true,
      rawObj: w
    };
  }

  // 7. Regular morphology: plurals & 3rd person -s/-es/-ies, -ed, -ing
  const candidates = [];
  if (clean.endsWith('ies')) candidates.push(clean.slice(0, -3) + 'y');
  if (clean.endsWith('s') && !clean.endsWith('ss')) candidates.push(clean.slice(0, -1));
  if (clean.endsWith('es')) candidates.push(clean.slice(0, -2));
  if (clean.endsWith('ing')) {
    candidates.push(clean.slice(0, -3));
    candidates.push(clean.slice(0, -3) + 'e');
  }
  if (clean.endsWith('ed')) {
    candidates.push(clean.slice(0, -2));
    candidates.push(clean.slice(0, -1));
  }

  for (const cand of candidates) {
    if (dictMap.has(cand)) {
      const w = dictMap.get(cand);
      return {
        id: w.id,
        word: clean,
        transcription: w.transcription || '',
        translation: getTrans(w),
        isFromDict: true,
        rawObj: w
      };
    }
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

  // Non-blocking async preload for 0ms instant modal display
  let dictMap = _wordLookupMap;
  const dictPromise = getOrBuildDictionary(lang).then((m) => {
    dictMap = m;
    return m;
  }).catch(() => new Map());

  let favSet = new Set();
  try {
    const favs = getUserFavorites();
    if (Array.isArray(favs)) {
      favs.forEach(f => favSet.add(String(f.id || f)));
    }
  } catch (e) {}

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

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

  let headerTitleHtml = escapeHtml(storyTitleText);
  const byMatch = storyTitleText.match(/^(.*?)\s+(by\s+.*)$/i);
  if (byMatch) {
    headerTitleHtml = `<span>${escapeHtml(byMatch[1])}</span><span style="display: block; font-size: 13.5px; font-weight: 500; opacity: 0.85; margin-top: 3px;">${escapeHtml(byMatch[2])}</span>`;
  }

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
        padding-top: calc(max(36px, env(safe-area-inset-top, 0px)) + 12px);
        padding-bottom: calc(max(48px, env(safe-area-inset-bottom, 0px)) + 16px);
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
        line-height: 1.75;
        color: #e2e8f0;
        user-select: text;
        -webkit-user-select: text;
      }
      .story-paragraph {
        margin: 0 0 16px;
        text-align: left;
        text-indent: 26px;
      }
      .story-translation-para {
        margin: 0 0 14px;
        text-align: left;
        text-indent: 26px;
      }
      .story-word-token {
        display: inline;
        padding: 0;
        margin: 0;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
        border-bottom: 1.5px dashed rgba(245, 158, 11, 0.4);
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
        <h2 class="milestone-story-title">${headerTitleHtml}</h2>
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
    tokenEl.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rawText = tokenEl.getAttribute('data-word') || tokenEl.textContent;
      const map = (dictMap && dictMap.size > 0) ? dictMap : await dictPromise;
      const resolved = resolveWord(rawText, map, lang);
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
  if (popoverAudio) popoverAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeResolvedWord) {
      speakWord(activeResolvedWord.word, activeResolvedWord.id);
    }
  });

  // Heart button in popover
  if (popoverHeart) popoverHeart.addEventListener('click', async (e) => {
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
  overlay.querySelector(".milestone-story-card")?.addEventListener('click', (e) => {
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
    if (currentMilestone >= 50) {
      try {
        checkAndPromptReviewFunnel('milestone', { milestone: currentMilestone });
      } catch (e) {}
    }
  }

  // Close X
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

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
