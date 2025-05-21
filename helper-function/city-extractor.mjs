import { writeFile } from 'fs/promises';

// The dataset extracted from prisma/seed.ts
const destinationsData = [
  {
    city: "Paris",
    country: "France",
    clues: [
      "This city is home to a famous tower that sparkles every night.",
      "Known as the 'City of Love' and a hub for fashion and art.",
    ],
    funFacts: [
      "The Eiffel Tower was supposed to be dismantled after 20 years but was saved because it was useful for radio transmissions!",
      "Paris has only one stop sign in the entire city—most intersections rely on priority-to-the-right rules.",
    ],
    trivia: [
      "This city is famous for its croissants and macarons. Bon appétit!",
      "Paris was originally a Roman city called Lutetia.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/6a/99/ee/6a99ee843798375c5f7049316e8d31ed.jpg",
  },
  {
    city: "Tokyo",
    country: "Japan",
    clues: [
      "This city has the busiest pedestrian crossing in the world.",
      "You can visit an entire district dedicated to anime, manga, and gaming.",
    ],
    funFacts: [
      "Tokyo was originally a small fishing village called Edo before becoming the bustling capital it is today!",
      "More than 14 million people live in Tokyo, making it one of the most populous cities in the world.",
    ],
    trivia: [
      "The city has over 160,000 restaurants, more than any other city in the world.",
      "Tokyo's subway system is so efficient that train delays of just a few minutes come with formal apologies.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/ff/0b/41/ff0b4140b1c4375d99050b01676cf447.jpg",
  },
  {
    city: "New York",
    country: "USA",
    clues: [
      "Home to a green statue gifted by France in the 1800s.",
      "Nicknamed 'The Big Apple' and known for its Broadway theaters.",
    ],
    funFacts: [
      "The Statue of Liberty was originally a copper color before oxidizing to its iconic green patina.",
      "Times Square was once called Longacre Square before being renamed in 1904.",
    ],
    trivia: [
      "New York City has 468 subway stations, making it one of the most complex transit systems in the world.",
      "The Empire State Building has its own zip code: 10118.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/43/9c/71/439c719d3609bc7e3a64eaf51992c903.jpg",
  },
  {
    city: "Rome",
    country: "Italy",
    clues: [
      "This city was built on seven hills and has a famous arena where gladiators once fought.",
      "Visitors throw coins into a magnificent Baroque fountain to ensure they'll return someday.",
    ],
    funFacts: [
      "About €3,000 are thrown into the Trevi Fountain each day, which is collected and donated to charity.",
      "This city has more than 900 churches, despite being only 496 square miles in size.",
    ],
    trivia: [
      "The Pantheon in this city has the world's largest unreinforced concrete dome, nearly 2,000 years after it was built.",
      "The first shopping mall in the world was built here in the early 2nd century.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/81/8a/f1/818af12fe476313c6cd407561e607dd3.jpg",
  },
  {
    city: "Sydney",
    country: "Australia",
    clues: [
      "This city is known for its iconic opera house with sail-shaped shells.",
      "It hosts the world's largest natural harbor with more than 240 kilometers of shoreline.",
    ],
    funFacts: [
      "The Opera House has over one million roof tiles covering approximately 1.62 hectares.",
      "Sydney Harbour Bridge is nicknamed 'The Coathanger' due to its arch-based design.",
    ],
    trivia: [
      "The city's name comes from the British Home Secretary Thomas Townshend, Lord Sydney.",
      "Bondi Beach is one of the most famous beaches in the world and is less than 5 miles from downtown.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/32/a4/d1/32a4d1af36a5c5b5895496f19b8765d6.jpg",
  },
  {
    city: "Cairo",
    country: "Egypt",
    clues: [
      "This city sits near legendary structures that are the only remaining ancient wonder of the world.",
      "The longest river in the world runs through this ancient capital.",
    ],
    funFacts: [
      "The Great Pyramid was the tallest man-made structure for over 3,800 years.",
      "Cairo means 'The Victorious' in Arabic and is the largest city in Africa and the Middle East.",
    ],
    trivia: [
      "Despite being surrounded by desert, this city experiences occasional snow about once every 100 years.",
      "The city's traffic is so notorious that locals joke it would be faster to walk across the Sahara.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/2a/70/6a/2a706af306369050f1dc27029b978672.jpg",
  },
  {
    city: "Rio de Janeiro",
    country: "Brazil",
    clues: [
      "This city is famous for a giant statue of Christ with outstretched arms overlooking the bay.",
      "It hosts the world's largest carnival celebration every year before Lent.",
    ],
    funFacts: [
      "The Christ the Redeemer statue was struck by lightning and lost part of its thumb in 2014.",
      "Copacabana Beach stretches for 2.5 miles and is one of the most famous beaches in the world.",
    ],
    trivia: [
      "This was the first South American city to host the Summer Olympics.",
      "The name means 'January River' in Portuguese, though there is no river there—early explorers mistook the bay for a river mouth.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/03/fe/47/03fe471d1c1df0e574ded6a44952745f.jpg",
  },
  {
    city: "Barcelona",
    country: "Spain",
    clues: [
      "This city features a famous unfinished basilica that has been under construction since 1882.",
      "It's known for its distinctive modernist architecture and pedestrian-friendly boulevards.",
    ],
    funFacts: [
      "The Sagrada Familia is expected to be completed in 2026, exactly 100 years after the architect's death.",
      "This city has 9 UNESCO World Heritage Sites, most of which were designed by Antoni Gaudí.",
    ],
    trivia: [
      "The city's famous Las Ramblas street was once a sewage-filled stream.",
      "FC Barcelona's stadium, Camp Nou, is the largest stadium in Europe with a capacity of 99,354.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/5a/71/76/5a717625fd82b9d196bdd29de14a1faf.jpg",
  },
  {
    city: "Istanbul",
    country: "Turkey",
    clues: [
      "This city spans two continents and was once the capital of three great empires.",
      "It's home to a massive domed structure that was the world's largest cathedral for nearly a thousand years.",
    ],
    funFacts: [
      "The Grand Bazaar is one of the oldest and largest covered markets in the world with over 4,000 shops.",
      "It's the only city in the world that straddles two continents: Europe and Asia.",
    ],
    trivia: [
      "This city has changed its name several times throughout history: Byzantium, Constantinople, and its current name.",
      "The Bosphorus Strait that runs through the city is one of the busiest waterways in the world.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/7f/05/e3/7f05e3355c00111111545bf98fecba65.jpg",
  },
  {
    city: "Kyoto",
    country: "Japan",
    clues: [
      "This former imperial capital is known for its classical Buddhist temples and traditional wooden houses.",
      "It's famous for its cherry blossoms and was spared from bombing during World War II due to its cultural significance.",
    ],
    funFacts: [
      "This city has over 1,600 Buddhist temples and 400 Shinto shrines.",
      "It served as Japan's capital for more than 1,000 years until 1868.",
    ],
    trivia: [
      "The city's name literally means 'Capital City' in Japanese.",
      "The famous Fushimi Inari Shrine has over 10,000 vermilion torii gates that wind up the mountain.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/1c/32/1f/1c321f1ec3970e87d11317f5f78566d2.jpg",
  },
  {
    city: "Vancouver",
    country: "Canada",
    clues: [
      "This coastal city is surrounded by mountains and has one of the largest urban parks in North America.",
      "It consistently ranks as one of the world's most livable cities with a thriving film industry.",
    ],
    funFacts: [
      "Stanley Park is about 10% larger than New York's Central Park at 1,001 acres.",
      "The city is nicknamed 'Hollywood North' because it's the third-largest film production center in North America.",
    ],
    trivia: [
      "It has the smallest carbon footprint of any major city in North America.",
      "The steam-powered clock in Gastown is actually electric—the steam is just for show!",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f6/c3/21/f6c321fd4aea60a914a48514ba39e454.jpg",
  },
  {
    city: "Cape Town",
    country: "South Africa",
    clues: [
      "This city sits at the foot of a flat-topped mountain and near the meeting point of two oceans.",
      "It's home to a famous island prison where a Nobel Peace Prize winner was held for 18 years.",
    ],
    funFacts: [
      "Table Mountain has over 2,200 species of plants, more than the entire United Kingdom.",
      "It's the oldest European settlement in South Africa, founded in 1652.",
    ],
    trivia: [
      "The city has the world's smallest floral kingdom, containing over 9,000 plant species, 69% of which are found nowhere else.",
      "Robben Island, where Nelson Mandela was imprisoned, is now a UNESCO World Heritage site.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/42/ee/60/42ee6022d26cb4d0e3683207f43de9a7.jpg",
  },
  {
    city: "Venice",
    country: "Italy",
    clues: [
      "This city has no roads, only canals and pedestrian pathways connecting its 118 small islands.",
      "It's famous for its ornate masks, glass production, and annual carnival celebration.",
    ],
    funFacts: [
      "The city is slowly sinking at a rate of about 1-2mm per year.",
      "There are over 400 footbridges connecting the islands of this unique city.",
    ],
    trivia: [
      "The entire city is listed as a UNESCO World Heritage Site.",
      "Marco Polo, the famous explorer, was born here in 1254.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/23/b2/36/23b236b1c5c0ffef07601b283b266ff1.jpg",
  },
  {
    city: "Marrakech",
    country: "Morocco",
    clues: [
      "This city is known for its vibrant red buildings and massive marketplace filled with snake charmers and storytellers.",
      "It's surrounded by ancient walls and features a prominent minaret visible from miles away.",
    ],
    funFacts: [
      "The medina (old city) is a UNESCO World Heritage site with over 3,000 twisting alleyways.",
      "The vibrant red color of the buildings comes from the local clay found in the surrounding desert.",
    ],
    trivia: [
      "Jemaa el-Fnaa square transforms from a market during the day to a massive food court at night.",
      "It was founded in 1062 and served as the capital of the Almoravid Empire.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f6/b9/cf/f6b9cf7faded4443e95d3edad879deef.jpg",
  },
  {
    city: "Bangkok",
    country: "Thailand",
    clues: [
      "This city is famous for its ornate shrines, vibrant street life, and floating markets.",
      "Its full ceremonial name is the longest city name in the world at 169 characters.",
    ],
    funFacts: [
      "The full ceremonial name translates roughly to 'City of angels, great city of immortals, magnificent city of the nine gems...'",
      "It's home to more than 400 glittering Buddhist temples (wats).",
    ],
    trivia: [
      "Locals don't call it by its international name but refer to it as 'Krung Thep' (City of Angels).",
      "The city sinks about 2-3 cm every year due to the weight of its buildings and extraction of groundwater.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c8/c2/a7/c8c2a7eb7c1e272289d1fa8b867fc141.jpg",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    clues: [
      "This desert city boasts the world's tallest building and artificial islands shaped like palm trees.",
      "It transformed from a small fishing village to a global business hub in just a few decades.",
    ],
    funFacts: [
      "It has the world's only 7-star hotel, though the rating isn't officially recognized.",
      "The city has the world's largest choreographed fountain system, with water jets shooting up to 500 feet.",
    ],
    trivia: [
      "Police here drive some of the world's most expensive supercars including Lamborghinis and Bugattis.",
      "Despite being in a desert, it has one of the world's largest indoor ski resorts with real snow year-round.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/b9/93/73/b99373e187467a5bcb5b9092639731d4.jpg",
  },
  {
    city: "London",
    country: "United Kingdom",
    clues: [
      "This city has a giant clock tower often mistaken for the bell inside it.",
      "It features red double-decker buses and black cabs as iconic transport symbols.",
    ],
    funFacts: [
      "The bell inside the famous tower is named Big Ben, not the tower itself.",
      "Over 300 languages are spoken here, making it one of the most linguistically diverse cities in the world.",
    ],
    trivia: [
      "The London Underground is the oldest metro system in the world, opened in 1863.",
      "The city has hosted the Olympic Games three times: 1908, 1948, and 2012.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/db/86/a7/db86a7c9b3deaaf89daf983a94de0e38.jpg",
  },
  {
    city: "Athens",
    country: "Greece",
    clues: [
      "This city is often called the cradle of Western civilization.",
      "It's home to an ancient hilltop temple dedicated to the goddess of wisdom.",
    ],
    funFacts: [
      "The Parthenon has stood for over 2,400 years atop the Acropolis.",
      "Athens has more theatrical stages than any other city in the world.",
    ],
    trivia: [
      "The city has been continuously inhabited for over 5,000 years.",
      "Its subway construction uncovered numerous ancient artifacts now on display in stations.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/2e/47/d9/2e47d92694250c42014ee502d444d5f2.jpg",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    clues: [
      "This coastal city is famous for its pastel-colored buildings and historic trams.",
      "It's built on seven hills and known for its scenic viewpoints.",
    ],
    funFacts: [
      "Lisbon’s tram system dates back to 1873 and still uses vintage models.",
      "It’s one of the oldest cities in Western Europe, older than Rome and Paris.",
    ],
    trivia: [
      "The Vasco da Gama Bridge in Lisbon is the longest in Europe, stretching 12.3 km.",
      "Lisbon was nearly destroyed by an earthquake, tsunami, and fires in 1755.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/97/b7/25/97b725f912643f0dd055978ac89c8901.jpg",
  },
  {
    city: "Buenos Aires",
    country: "Argentina",
    clues: [
      "This city is the birthplace of tango and known for its European-style architecture.",
      "It has a famous cemetery where many notable Argentinians are buried.",
    ],
    funFacts: [
      "The city has more bookstores per person than any other city in the world.",
      "The Recoleta Cemetery is home to over 6,400 above-ground tombs.",
    ],
    trivia: [
      "The widest avenue in the world, Avenida 9 de Julio, runs through this city.",
      "The presidential palace is famously painted pink and is known as Casa Rosada.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/23/cd/b9/23cdb91f5a646893fc69360dc95630c4.jpg",
  },
  {
    city: "Prague",
    country: "Czech Republic",
    clues: [
      "This fairytale city is known for its medieval castle complex and astronomical clock.",
      "It's nicknamed the 'City of a Hundred Spires.'",
    ],
    funFacts: [
      "Prague Castle is the largest ancient castle in the world, covering 70,000 square meters.",
      "The Astronomical Clock dates back to 1410 and is still functional today.",
    ],
    trivia: [
      "The Charles Bridge is lined with 30 statues and connects the Old Town with the castle.",
      "Beer is cheaper than water in many of this city’s pubs!",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/97/d7/ac/97d7aca68b25e70c4dac12794c41d936.jpg",
  },
  {
    city: "Seoul",
    country: "South Korea",
    clues: [
      "This high-tech capital blends futuristic skyscrapers with ancient palaces.",
      "It’s famous for K-pop, street food, and a 600-year-old fortress wall.",
    ],
    funFacts: [
      "Seoul has one of the fastest internet speeds in the world.",
      "The city is home to five grand palaces from the Joseon Dynasty.",
    ],
    trivia: [
      "The name 'Seoul' means 'capital' in Korean.",
      "There's a man-made stream in the middle of the city called Cheonggyecheon.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/be/a3/2a/bea32a289d5d6212ca7f79c7388697eb.jpg",
  },
  {
    city: "San Francisco",
    country: "USA",
    clues: [
      "This city is home to a red suspension bridge often shrouded in fog.",
      "It features steep hills, cable cars, and a famous former prison island.",
    ],
    funFacts: [
      "The Golden Gate Bridge is not golden—it's painted in International Orange.",
      "Alcatraz Island once held the notorious gangster Al Capone.",
    ],
    trivia: [
      "The city experiences over 100 earthquakes a year, most too small to feel.",
      "It’s only 7x7 miles in area, making it one of the most compact large cities.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/ae/81/46/ae8146fc5a95d211b1b66c14e9b4887e.jpg",
  },
  {
    city: "Hanoi",
    country: "Vietnam",
    clues: [
      "This capital city blends centuries-old architecture with lakes and pagodas.",
      "Motorbikes dominate its chaotic and fascinating traffic scenes.",
    ],
    funFacts: [
      "Hanoi means 'City inside rivers' due to its location between the Red and Nhue Rivers.",
      "The Old Quarter still retains its street layout from the 15th century.",
    ],
    trivia: [
      "The world’s longest ceramic mosaic mural runs along one of Hanoi’s main roads.",
      "Egg coffee, a local delicacy, was invented here due to a milk shortage in the 1940s.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/82/26/b5/8226b59cb6e4ecbfc8894afb4b846d0e.jpg",
  },
  {
    city: "Edinburgh",
    country: "Scotland",
    clues: [
      "This city is home to a historic castle perched on an extinct volcano.",
      "It's famous for its annual arts festival, the largest of its kind in the world.",
    ],
    funFacts: [
      "J.K. Rowling wrote much of Harry Potter in this city’s cafés.",
      "The city’s Old and New Towns are both UNESCO World Heritage Sites.",
    ],
    trivia: [
      "The Royal Mile is actually 1.1 miles long, not exactly one mile.",
      "Arthur’s Seat is an ancient volcano located within city limits.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/3c/5a/ea/3c5aea8cb254fcd9e49e88a14c3030cc.jpg",
  },
  {
    city: "Havana",
    country: "Cuba",
    clues: [
      "This Caribbean city is known for its colorful classic cars and Spanish colonial architecture.",
      "It has a famous seaside promenade called the Malecón.",
    ],
    funFacts: [
      "Havana was founded by the Spanish in the 16th century and served as a major shipbuilding center.",
      "The city has one of the world’s most complete collections of vintage American cars.",
    ],
    trivia: [
      "Cuba’s capital is just 90 miles from the United States at its closest point.",
      "Havana’s historic center, Habana Vieja, is a UNESCO World Heritage Site.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/a1/88/28/a188288d4ec996e2e54dbcabb56cf64c.jpg",
  },
  {
    city: "Quebec City",
    country: "Canada",
    clues: [
      "This city looks like a European village with cobblestone streets and a castle-like hotel.",
      "It's the only walled city north of Mexico.",
    ],
    funFacts: [
      "Château Frontenac is the most photographed hotel in the world.",
      "French is the official language and widely spoken here.",
    ],
    trivia: [
      "Old Quebec is a UNESCO World Heritage Site.",
      "It hosts a huge winter carnival featuring ice sculptures and snow baths.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/9a/4c/2f/9a4c2f710b699b51f106e8d63741873d.jpg",
  },
  {
    city: "Petra",
    country: "Jordan",
    clues: [
      "This ancient city is carved directly into rose-red sandstone cliffs.",
      "You reach it by walking through a narrow gorge called the Siq.",
    ],
    funFacts: [
      "Petra was lost to the Western world until it was rediscovered in 1812.",
      "It was a major trading hub around 300 BCE.",
    ],
    trivia: [
      "Its most famous structure, the Treasury, appears in *Indiana Jones and the Last Crusade*.",
      "Petra means ‘rock’ in Greek.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/26/0d/72/260d72b5effea53d028370ec13ef35d7.jpg",
  },
  {
    city: "Tallinn",
    country: "Estonia",
    clues: [
      "This city’s old town looks like a fairy tale, complete with medieval towers and walls.",
      "It sits on the shores of the Baltic Sea.",
    ],
    funFacts: [
      "Tallinn is one of the most digitally advanced cities in Europe.",
      "Free public transport is available for residents.",
    ],
    trivia: [
      "Skype was invented in Tallinn.",
      "The city was first mentioned in historical records in 1154.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/07/55/87/0755872109667d1001062f26c992a159.jpg",
  },
  {
    city: "Lima",
    country: "Peru",
    clues: [
      "This capital sits on a desert coast with cliffs overlooking the Pacific Ocean.",
      "It’s known for ceviche and colonial Spanish architecture.",
    ],
    funFacts: [
      "Lima was once the richest city in the Americas during colonial times.",
      "It has a booming food scene, with several restaurants ranked among the world's best.",
    ],
    trivia: [
      "The historic center is a UNESCO World Heritage Site.",
      "Lima receives almost no rainfall due to its unique desert climate.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/50/bd/ed/50bded9df948e001ea0a4b48abf1696b.jpg",
  },
  {
    city: "Oslo",
    country: "Norway",
    clues: [
      "This city is surrounded by forests and fjords.",
      "It’s home to the Nobel Peace Prize ceremony each year.",
    ],
    funFacts: [
      "Oslo was founded over 1,000 years ago by Vikings.",
      "It’s considered one of the greenest cities in the world.",
    ],
    trivia: [
      "You can go skiing within 30 minutes from the city center.",
      "The city has an entire museum dedicated to Viking ships.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/da/2c/cc/da2ccce941569187b537875d84170475.jpg",
  },
  {
    city: "Valencia",
    country: "Spain",
    clues: [
      "This city is where paella was born.",
      "It mixes medieval buildings with futuristic architecture like the City of Arts and Sciences.",
    ],
    funFacts: [
      "Valencia hosts Las Fallas, a wild festival featuring fireworks and giant puppets burned in the streets.",
      "Its beach is just 10 minutes from the city center.",
    ],
    trivia: [
      "The Holy Grail is claimed to be kept in Valencia’s cathedral.",
      "It has over 300 days of sunshine per year.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/e2/90/68/e29068d4ac71deac5982aa310dda8aab.jpg",
  },
  {
    city: "Luang Prabang",
    country: "Laos",
    clues: [
      "This city is known for its Buddhist temples and French colonial buildings.",
      "It sits between two rivers and is surrounded by lush mountains.",
    ],
    funFacts: [
      "It’s a UNESCO World Heritage Site with over 30 temples.",
      "Monks walk the streets each morning collecting alms in a peaceful ritual.",
    ],
    trivia: [
      "It's one of the most well-preserved towns in Southeast Asia.",
      "The nearby Kuang Si Waterfalls are a top natural attraction.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/d7/b9/d2/d7b9d22aa0aa3147cbcc46815d7d0260.jpg",
  },
  {
    city: "Tbilisi",
    country: "Georgia",
    clues: [
      "This capital sits in a deep valley with colorful houses and a medieval fortress.",
      "It’s known for its sulfur baths and dramatic Caucasus views.",
    ],
    funFacts: [
      "Tbilisi has been destroyed and rebuilt more than 30 times due to its strategic location.",
      "Its name means 'warm place' due to the hot springs beneath it.",
    ],
    trivia: [
      "The city’s old town is a maze of alleyways, balconies, and eclectic architecture.",
      "Georgia claims to be the birthplace of wine, and Tbilisi is at the heart of that culture.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/55/75/42/557542e64b1dcb69628c60d0e89df5dc.jpg",
  },
  {
    city: "Ulaanbaatar",
    country: "Mongolia",
    clues: [
      "This high-altitude capital is the gateway to vast steppes and nomadic culture.",
      "It features a massive statue of Genghis Khan just outside the city.",
    ],
    funFacts: [
      "It's the coldest capital city in the world, with winters dipping to -40°C.",
      "Over half of Mongolia’s population lives in or around this city.",
    ],
    trivia: [
      "It was originally a mobile monastery that changed locations 28 times.",
      "You can find yurts (called *gers*) in the city suburbs.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/4c/99/3f/4c993f6539c33a690d58e51dfffb31df.jpg",
  },
  {
    city: "Hampi",
    country: "India",
    clues: [
      "This ancient city is scattered with giant boulders and intricate temple ruins.",
      "It was once the capital of the Vijayanagara Empire.",
    ],
    funFacts: [
      "Hampi is a UNESCO World Heritage Site.",
      "The Virupaksha Temple here is still active after over 1,000 years.",
    ],
    trivia: [
      "Hampi was described as 'the best-provided city in the world' in 15th-century travelogues.",
      "It attracts both history buffs and backpackers alike.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/90/f8/29/90f82955bcca3677f08edaeca3cc3d0e.jpg",
  },
  {
    city: "Rishikesh",
    country: "India",
    clues: [
      "Known as the Yoga Capital of the World.",
      "This city lies on the banks of the Ganges and is famous for its suspension bridge.",
    ],
    funFacts: [
      "The Beatles visited Rishikesh in 1968 to learn Transcendental Meditation.",
      "It’s a hub for white-water rafting and spiritual retreats.",
    ],
    trivia: [
      "Alcohol and non-vegetarian food are banned in the city limits.",
      "Rishikesh hosts the annual International Yoga Festival.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/df/70/10/df701037d4fb820a3e7be454f128829a.jpg",
  },
  {
    city: "Udaipur",
    country: "India",
    clues: [
      "This city is often called the ‘Venice of the East’.",
      "It’s built around a series of lakes and majestic palaces.",
    ],
    funFacts: [
      "The Lake Palace appears to float on Lake Pichola.",
      "It was a filming location for the James Bond movie *Octopussy*.",
    ],
    trivia: [
      "Udaipur was founded in 1559 by Maharana Udai Singh II.",
      "It is still home to a royal family.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/bd/00/7b/bd007b1f0e0aa52c1ad3476b60c75def.jpg",
  },
  {
    city: "Amritsar",
    country: "India",
    clues: [
      "This city is home to one of the holiest shrines in Sikhism.",
      "It's located near the India-Pakistan border.",
    ],
    funFacts: [
      "The Golden Temple serves over 100,000 free meals daily.",
      "Its foundation was laid by a Muslim saint.",
    ],
    trivia: [
      "The Jallianwala Bagh massacre took place here in 1919.",
      "It hosts the daily Wagah border ceremony with Pakistan.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/64/98/66/6498661b76255e43a12c0cc5db1d9c3e.jpg",
  },
  {
    city: "Shillong",
    country: "India",
    clues: [
      "This city is called the ‘Scotland of the East’.",
      "It’s known for rock music and rolling green hills.",
    ],
    funFacts: [
      "It’s the only hill station in the northeast with motorable roads.",
      "Shillong gets some of the highest rainfall in India.",
    ],
    trivia: [
      "Meghalaya means ‘abode of clouds’.",
      "Shillong has hosted several international music festivals.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/0c/61/13/0c6113c4e3780d2b0cfb7d6924c81889.jpg",
  },
  {
    city: "Tawang",
    country: "India",
    clues: [
      "This high-altitude town is home to India’s largest Buddhist monastery.",
      "It's near the India-China border and rich in Tibetan culture.",
    ],
    funFacts: [
      "The Tawang Monastery was founded in the 17th century.",
      "It sits at an elevation of over 10,000 feet.",
    ],
    trivia: [
      "Tawang was once a part of Tibet.",
      "It’s one of the most remote towns in Arunachal Pradesh.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/39/bd/1a/39bd1ae0896c230392ab74f18641f5a6.jpg",
  },
  {
    city: "Pondicherry",
    country: "India",
    clues: [
      "This city features colonial French architecture and serene beaches.",
      "It's known for its peaceful experimental township nearby.",
    ],
    funFacts: [
      "Pondicherry was under French rule until 1954.",
      "Auroville, an international community, is located close by.",
    ],
    trivia: [
      "The street names are still in French in many areas.",
      "The French Quarter has mustard-yellow buildings and bougainvillea-lined paths.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/e7/4f/1d/e74f1d09218d7d4b9dbb73326dc84af8.jpg",
  },
  {
    city: "Srinagar",
    country: "India",
    clues: [
      "This city is known for its scenic Dal Lake and houseboats.",
      "It’s located in the heart of the Kashmir Valley.",
    ],
    funFacts: [
      "Mughal emperors called it 'Paradise on Earth'.",
      "You can ride a shikara (boat) through floating markets.",
    ],
    trivia: [
      "Srinagar has Asia’s largest tulip garden.",
      "The city experiences all four seasons vividly, including snowfall in winter.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f2/e3/22/f2e3224e082e1f9d5a6400fbce118f07.jpg",
  },
  {
    city: "Gwalior",
    country: "India",
    clues: [
      "This city is dominated by a majestic hilltop fort.",
      "It's known for its contribution to Indian classical music.",
    ],
    funFacts: [
      "Gwalior Fort is called ‘the pearl among fortresses in India’.",
      "It houses the second-oldest record of zero as a number.",
    ],
    trivia: [
      "The Scindia family still resides in the Jai Vilas Palace here.",
      "Tansen, the legendary musician of Akbar’s court, was born here.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/38/55/dd/3855dd281d6e7ed4b102b86ef3a04ce2.jpg",
  },
  {
    city: "Kanchipuram",
    country: "India",
    clues: [
      "This ancient city is one of the seven sacred pilgrimage sites in Hinduism.",
      "It's famous for its silk sarees and towering temples.",
    ],
    funFacts: [
      "Kanchipuram is called the ‘City of a Thousand Temples’.",
      "It has been a learning center for both Hinduism and Buddhism.",
    ],
    trivia: [
      "The Ekambareswarar Temple has a mango tree over 3,500 years old.",
      "Each Kanchipuram saree can take up to 15 days to weave.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/a3/92/1a/a3921a9dd3323dfb0e30899a22c12451.jpg",
  },
  {
    city: "Madurai",
    country: "India",
    clues: [
      "This Tamil Nadu city is one of the oldest continuously inhabited cities in the world.",
      "It’s famous for a temple with colorful gopurams (towers).",
    ],
    funFacts: [
      "The Meenakshi Temple has over 33,000 sculptures.",
      "The city is known as the 'Athens of the East'.",
    ],
    trivia: [
      "It was an important cultural and trade center for the Pandya dynasty.",
      "Madurai is also famous for its jasmine flowers.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/de/06/f3/de06f3503424bafeb2ec63bd297be30d.jpg",
  },
  {
    city: "Bundi",
    country: "India",
    clues: [
      "This lesser-known Rajasthani town is famous for its stepwells and murals.",
      "It’s often overshadowed by Jaipur and Udaipur.",
    ],
    funFacts: [
      "Bundi Palace features exquisite frescoes and murals.",
      "The town has over 50 stepwells, or 'baoris'.",
    ],
    trivia: [
      "Author Rudyard Kipling was inspired by Bundi for his novel *Kim*.",
      "Bundi was once ruled by the Hada Chauhans.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c8/b1/cc/c8b1cccf722bbf08782fe1a31453b66a.jpg",
  },
  {
    city: "Cherrapunji",
    country: "India",
    clues: [
      "This place was once considered the wettest spot on Earth.",
      "It’s known for living root bridges made from rubber trees.",
    ],
    funFacts: [
      "The region gets nearly 11,000 mm of rain annually.",
      "Nearby Mawsynram now holds the 'wettest place' title.",
    ],
    trivia: [
      "Locals have been building living bridges for over 500 years.",
      "Despite heavy rain, water scarcity is a problem due to runoff.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/60/25/24/60252467ba2bad5d1c86efc783ad0ffa.jpg",
  },
  {
    city: "Jaisalmer",
    country: "India",
    clues: [
      "This desert city is nicknamed the ‘Golden City’.",
      "It’s built around a massive fort made of yellow sandstone.",
    ],
    funFacts: [
      "The Jaisalmer Fort is a living fort, with thousands still residing inside.",
      "The city is a gateway to the Thar Desert.",
    ],
    trivia: [
      "It was founded in 1156 by Rawal Jaisal.",
      "Camel safaris across sand dunes are a top attraction.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/31/26/05/3126050a050e7f2cb656bb9f3bfd2030.jpg",
  },
  {
    city: "Patna",
    country: "India",
    clues: [
      "This city on the Ganges is among the world’s oldest capital cities.",
      "It was historically known as Pataliputra.",
    ],
    funFacts: [
      "Patna was the capital of mighty empires like the Maurya and Gupta dynasties.",
      "It has one of the longest river bridges in India — the Mahatma Gandhi Setu.",
    ],
    trivia: [
      "Emperor Ashoka once ruled from here.",
      "It’s a gateway for Buddhist pilgrimages to Bodh Gaya and Nalanda.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/17/a0/b3/17a0b3ac2ea3ac375de8af959e35bbc9.jpg",
  },
  {
    city: "Kumarakom",
    country: "India",
    clues: [
      "This village is known for backwaters and bird sanctuaries.",
      "It’s located on the banks of Vembanad Lake in Kerala.",
    ],
    funFacts: [
      "Kumarakom Bird Sanctuary is home to migratory birds like Siberian cranes.",
      "Houseboat cruises here are a popular attraction.",
    ],
    trivia: [
      "The place is part of India’s largest freshwater lake system.",
      "It’s an eco-tourism hotspot promoted by Kerala Tourism.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/71/32/fd/7132fdc15b0918ade5e61d5ac58661f2.jpg",
  },
  {
    city: "Murudeshwar",
    country: "India",
    clues: [
      "This coastal town features a massive statue of Lord Shiva.",
      "It’s located in Karnataka and offers stunning beach views.",
    ],
    funFacts: [
      "The Shiva statue is the second tallest in the world.",
      "The temple gopuram has 20 floors and an elevator for tourists.",
    ],
    trivia: [
      "Murudeshwar lies on the Arabian Sea coast.",
      "The nearby Netrani Island is popular for scuba diving.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/85/de/ae/85deae744e7e7ffd56796499e86db70f.jpg",
  },
  {
    city: "Ziro",
    country: "India",
    clues: [
      "This peaceful valley is famous for its music festival and rice fields.",
      "It’s inhabited by the Apatani tribe.",
    ],
    funFacts: [
      "Ziro hosts the annual Ziro Music Festival, attracting indie artists.",
      "It’s a UNESCO tentative site for its unique tribal farming methods.",
    ],
    trivia: [
      "The Apatani people use sustainable fish-rice cultivation techniques.",
      "The valley is located in Arunachal Pradesh.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/30/d6/3e/30d63ec4fbb48da3ac207aa6b87d81e6.jpg",
  },
  {
    city: "Kargil",
    country: "India",
    clues: [
      "This mountain town was at the center of a 1999 India-Pakistan conflict.",
      "It’s part of the union territory of Ladakh.",
    ],
    funFacts: [
      "Kargil is the second largest town in Ladakh after Leh.",
      "It’s a popular stop for bikers traveling on the Srinagar-Leh highway.",
    ],
    trivia: [
      "It houses the Kargil War Memorial in Dras.",
      "Despite its past, Kargil is now known for scenic valleys and apricot orchards.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f4/22/79/f4227981add56b63af8d87c3e905df98.jpg",
  },
  {
    city: "Ranakpur",
    country: "India",
    clues: [
      "This quiet village is known for an intricately carved white marble Jain temple.",
      "It lies in a valley of the Aravalli range in Rajasthan.",
    ],
    funFacts: [
      "The Ranakpur Jain Temple has 1,444 uniquely carved marble pillars.",
      "It is dedicated to Tirthankara Adinatha.",
    ],
    trivia: [
      "The temple was built in the 15th century and took 65 years to complete.",
      "No two pillars in the temple have identical carvings.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f4/6d/a8/f46da86a13e980acf7662524de1beb20.jpg",
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    clues: [
      "Known for its concentric canal system and narrow, gabled houses.",
      "Famous for its cycling culture; there are more bikes than people.",
    ],
    funFacts: [
      "Amsterdam has over 1,200 bridges connecting its many canals.",
      "The city’s Red Light District dates back to the 14th century.",
    ],
    trivia: [
      "There are more than 800,000 bicycles in Amsterdam.",
      "The Dutch eat over 10,000 tons of herring each year—often raw with onions!",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/69/e8/ea/69e8eaa3e510566a79295bcf79a4b320.jpg",
  },
  {
    city: "Berlin",
    country: "Germany",
    clues: [
      "Home to the iconic Brandenburg Gate.",
      "Was once split in two by a famous wall until 1989.",
    ],
    funFacts: [
      "Berlin has 180 museums and more gallery spaces than any other city in the world.",
      "It’s said to have over 2,500 bridges—more than Venice.",
    ],
    trivia: [
      "The Berlin Wall ran for 155 kilometers around West Berlin.",
      "Berliners consume around 300 Curried Wurst sausages per person per year.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/2e/14/97/2e14975dbe1e4889d0f1d8d9d64339b3.jpg",
  },
  {
    city: "Moscow",
    country: "Russia",
    clues: [
      "Red Square sits at its heart, flanked by the Kremlin.",
      "Famous for its onion-domed churches painted in bright colors.",
    ],
    funFacts: [
      "Moscow’s Metro stations double as underground palaces, with chandeliers and mosaics.",
      "The city spans two continents, Europe and Asia.",
    ],
    trivia: [
      "The Bolshoi Theatre stages over 200 performances annually.",
      "Moscow has more billionaires than any other city outside the USA and China.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/99/2f/51/992f516b7a677bd096d1c7224917d3a7.jpg",
  },
  {
    city: "Mexico City",
    country: "Mexico",
    clues: [
      "Built on the ruins of the ancient Aztec capital of Tenochtitlan.",
      "Home to one of the largest metropolitan areas in the world.",
    ],
    funFacts: [
      "The city has 200 museums—more than any other city worldwide.",
      "Floating gardens called chinampas can still be seen in Xochimilco.",
    ],
    trivia: [
      "The Zócalo is one of the largest public squares in the world.",
      "Mexico City sinks about 10 cm per year due to groundwater extraction.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/3b/11/7c/3b117c189dd2872b14469aec475f2146.jpg",
  },
  {
    city: "Singapore",
    country: "Singapore",
    clues: [
      "A city-state famous for its ultra-modern skyline and Gardens by the Bay.",
      "Known as the 'Lion City' with a famous Merlion statue.",
    ],
    funFacts: [
      "Singapore’s Changi Airport has a butterfly garden and swimming pool.",
      "It has four official languages: English, Malay, Mandarin, and Tamil.",
    ],
    trivia: [
      "The island was originally known as Temasek, meaning 'Sea Town.'",
      "Chewing gum is banned except for therapeutic uses.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/d6/4d/29/d64d2949130d40d765208d90df6a73fa.jpg",
  },
  {
    city: "Hong Kong",
    country: "China",
    clues: [
      "Famous for its skyline of skyscrapers against Victoria Harbour.",
      "Home to a historic Star Ferry that’s been running since 1888.",
    ],
    funFacts: [
      "Over 260 islands make up Hong Kong’s territory.",
      "It has one of the highest per-capita incomes in the world.",
    ],
    trivia: [
      "Octopus cards were first introduced here for fare payments in 1997.",
      "More than half of the population lives in high-rise public housing.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/03/97/29/039729f75c9687214f013cf2d16093fc.jpg",
  },
  {
    city: "Zurich",
    country: "Switzerland",
    clues: [
      "Nestled on the shores of Lake Zurich and surrounded by mountains.",
      "Switzerland’s largest city and a global financial hub.",
    ],
    funFacts: [
      "Zurich’s Bahnhofstrasse is one of the most expensive shopping streets in the world.",
      "The city has over 120 museums and galleries.",
    ],
    trivia: [
      "Swiss chocolates originated here—home to the first milk chocolate bar.",
      "Zurich offers 24-hour public transport on certain lines during weekends.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/77/e2/79/77e2790406b445739dff30e5aceca14a.jpg",
  },
  {
    city: "Stockholm",
    country: "Sweden",
    clues: [
      "Built on 14 islands connected by 57 bridges.",
      "Known for its colorful waterfront buildings on Gamla Stan.",
    ],
    funFacts: [
      "Stockholm’s Vasa Museum houses a 17th-century warship that sank on its maiden voyage.",
      "It’s one of the world’s cleanest capitals, with very low air pollution.",
    ],
    trivia: [
      "Abba and Spotify both originated here.",
      "City Hall’s tower offers panoramic views after climbing 365 steps.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/12/d9/84/12d984624048c8c625885cb179cf1903.jpg",
  },
  {
    city: "Madrid",
    country: "Spain",
    clues: [
      "Home to the famous Prado Museum and the Royal Palace.",
      "Known for buzzing plazas like Puerta del Sol and Plaza Mayor.",
    ],
    funFacts: [
      "Madrid’s metro is the seventh-largest in the world by length.",
      "The city celebrates San Isidro with open-air dancing and music each May.",
    ],
    trivia: [
      "Flamenco dance originated in nearby Andalusia but is celebrated here.",
      "Madrid sits at 667 meters above sea level—the highest capital in Europe after Andorra la Vella.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/ca/48/64/ca4864ccaeb6d561b36b2e6e158f9fb6.jpg",
  },
  {
    city: "Los Angeles",
    country: "United States",
    clues: [
      "Famous for Hollywood and its entertainment industry.",
      "Home to the iconic Hollywood Sign on the hills.",
    ],
    funFacts: [
      "Los Angeles is the largest entertainment industry center outside of Mumbai.",
      "It has over 4 million residents making it the second-largest U.S. city.",
    ],
    trivia: [
      "There are more Airbnb listings in LA than hotel rooms.",
      "LA’s Griffith Observatory has appeared in over 30 films.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f0/bd/8d/f0bd8dbcf36daf7d2855f8721363abbf.jpg",
  },
  {
    city: "Mumbai",
    country: "India",
    clues: [
      "India’s financial capital and home of Bollywood.",
      "Famous for the Gateway of India monument by the sea.",
    ],
    funFacts: [
      "Over 20 million people live in the Mumbai metropolitan area.",
      "The city was formerly known as Bombay until 1995.",
    ],
    trivia: [
      "Mumbai dabbawalas deliver over 200,000 lunchboxes daily with near-perfect accuracy.",
      "Elephanta Island’s rock-cut temples lie just 10 km offshore.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/66/11/e8/6611e8a3592681395b15aee10a7acdd5.jpg",
  },
  {
    city: "Beijing",
    country: "China",
    clues: [
      "China’s capital with the Forbidden City at its center.",
      "Gateway to the Great Wall’s famous Mutianyu section.",
    ],
    funFacts: [
      "Beijing hosted both the 2008 and 2022 Olympic Games.",
      "It has over 7,000 hutongs (traditional alleys) left.",
    ],
    trivia: [
      "The city’s name means 'Northern Capital.'",
      "Peking Duck has been served for over 600 years.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/eb/c3/07/ebc3076cac758254e384af250b5fa3e2.jpg",
  },
  {
    city: "Shanghai",
    country: "China",
    clues: [
      "Known for the Bund waterfront and futuristic Pudong skyline.",
      "One of the world’s busiest container ports.",
    ],
    funFacts: [
      "Shanghai Tower is China’s tallest building and the world’s second tallest.",
      "The city has more than 18 million domestic and international visitors annually.",
    ],
    trivia: [
      "Shanghai’s metro is the world’s largest by route length.",
      "Home to the world’s first skyscraper, the 10‑story Park Hotel built in 1934.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/de/9b/1b/de9b1b0a21c498311fbd50600d748b24.jpg",
  },
  {
    city: "Johannesburg",
    country: "South Africa",
    clues: [
      "South Africa’s largest city, built on a gold reef.",
      "Gateway to the Apartheid Museum and nearby Soweto.",
    ],
    funFacts: [
      "Johannesburg is one of the world’s largest man‑made forest cities.",
      "It generates 16% of South Africa’s GDP.",
    ],
    trivia: [
      "The city sits on the world’s largest known gold deposit.",
      "Boasts over 200 art galleries and studios.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/97/c5/e1/97c5e16c3c073fba9fa4b1d25d54b2b3.jpg",
  },
  {
    city: "Montreal",
    country: "Canada",
    clues: [
      "Famous for its French heritage and cobblestone streets of Old Montreal.",
      "Hosts the world’s largest jazz festival every summer.",
    ],
    funFacts: [
      "Montreal’s underground city is over 32 km long.",
      "It has more festivals than any other city in North America.",
    ],
    trivia: [
      "The city’s name honors Mount Royal, the triple-peaked hill in its center.",
      "Home to the world’s first-ever animated film screening, in 1896.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/f2/f9/34/f2f934d53f74a905ae733ea4ac405776.jpg",
  },
  {
    city: "São Paulo",
    country: "Brazil",
    clues: [
      "Brazil’s financial hub and the largest city in the Southern Hemisphere.",
      "Famous for its Avenida Paulista and vast urban sprawl.",
    ],
    funFacts: [
      "It has more helicopters than any other city in the world.",
      "The city consumes over 125,000 loaves of bread daily.",
    ],
    trivia: [
      "São Paulo’s Ibirapuera Park was designed by Oscar Niemeyer.",
      "Hosts the world’s largest LGBTQ pride parade each June.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c2/91/5e/c2915ed2414a10b6534d1f3928ff8e93.jpg",
  },
  {
    city: "Jakarta",
    country: "Indonesia",
    clues: [
      "A sprawling metropolis on the northwest coast of Java.",
      "Home to the historic Kota Tua (Old Town) district.",
    ],
    funFacts: [
      "Jakarta is sinking at an average rate of 7.5 cm per year.",
      "It has the world’s busiest single airport terminal.",
    ],
    trivia: [
      "The city’s name comes from Sanskrit words meaning 'Complete Victory.'",
      "Home to the largest Chinatown in the world, Glodok.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/aa/f6/36/aaf63681807fe722529031afb8418f35.jpg",
  },
  {
    city: "Kuala Lumpur",
    country: "Malaysia",
    clues: [
      "Known for the Petronas Twin Towers, once the tallest in the world.",
      "A melting pot of Malay, Chinese, and Indian cultures.",
    ],
    funFacts: [
      "KL Tower’s revolving restaurant offers 360° city views.",
      "Home to an underground limestone cave temple at Batu Caves.",
    ],
    trivia: [
      "The Twin Towers’ skybridge is the highest 2‑story bridge in the world.",
      "KL’s main train station is built in a Moorish style.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/7f/4c/b2/7f4cb20041cc533d33a31e042da94c14.jpg",
  },
  {
    city: "Dublin",
    country: "Ireland",
    clues: [
      "Capital city on the River Liffey, famous for its pubs.",
      "Birthplace of literary giants like James Joyce and Oscar Wilde.",
    ],
    funFacts: [
      "Dublin’s Trinity College Library houses the ancient Book of Kells.",
      "The city has over 1,000 pubs for its population of 1.2 million.",
    ],
    trivia: [
      "The Guinness Storehouse draws over 1.7 million visitors annually.",
      "Dublin’s Georgian doors come in over 70 different colors.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c9/e6/e9/c9e6e907e3fdafaa8c30394466e3e90b.jpg",
  },
  {
    city: "Vienna",
    country: "Austria",
    clues: [
      "Renowned for its imperial palaces like Schönbrunn and the Hofburg.",
      "Once the center of the Habsburg Empire and a music capital.",
    ],
    funFacts: [
      "Vienna’s coffee house culture is UNESCO‑listed.",
      "The Vienna Philharmonic’s New Year’s Concert is broadcast worldwide.",
    ],
    trivia: [
      "Over 50% of Viennese live in municipally-owned housing.",
      "The world’s oldest zoo, Tiergarten Schönbrunn, opened in 1752.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/fc/06/75/fc0675b757d8ecd2e2a1f9e98b0c92a8.jpg",
  },
  {
    city: "Budapest",
    country: "Hungary",
    clues: [
      "Divided by the Danube into historic Buda and bustling Pest.",
      "Famous for its thermal baths like Széchenyi and Gellért.",
    ],
    funFacts: [
      "Budapest has the largest thermal water cave system in the world.",
      "The Chain Bridge was the first permanent bridge across the Danube here.",
    ],
    trivia: [
      "The city has over 80 hot springs.",
      "Gulyás (goulash) originated as a shepherd’s stew here.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/e6/42/5c/e6425cb781752f65ae04c190c25b4eda.jpg",
  },
  {
    city: "Warsaw",
    country: "Poland",
    clues: [
      "Capital city rebuilt almost entirely after WWII.",
      "Known for its resilient Old Town and Royal Castle.",
    ],
    funFacts: [
      "Warsaw’s skyline has more skyscrapers than any other Baltic city.",
      "The city hosts the world’s largest Chopin festival every October.",
    ],
    trivia: [
      "The Warsaw Mermaid is the city’s symbol, featured on its coat of arms.",
      "Pancakes called naleśniki are a popular Warsaw street food.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/6b/2a/5c/6b2a5cce1bb596549433dc89af042e3a.jpg",
  },
  {
    city: "Brussels",
    country: "Belgium",
    clues: [
      "Home to the European Union’s main institutions.",
      "Famous for its Grand Place and Manneken Pis statue.",
    ],
    funFacts: [
      "Brussels has over 800 bars and 2,000 restaurants.",
      "The Comic Strip Center celebrates Belgium’s rich comic history.",
    ],
    trivia: [
      "Waffles here are thicker and square‑patterned—called Brussels waffles.",
      "Belgium produces over 220,000 tonnes of chocolate annually.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c2/a8/85/c2a88559ecb02947bd6d9d9a5c94e6ff.jpg",
  },
  {
    city: "Nairobi",
    country: "Kenya",
    clues: [
      "Known as the 'Green City in the Sun' with a national park within city limits.",
      "Gateway to safari destinations like the Maasai Mara.",
    ],
    funFacts: [
      "Nairobi National Park is the only game reserve bordering a capital city.",
      "It’s one of the youngest capitals in Africa, founded in 1899.",
    ],
    trivia: [
      "Home to the David Sheldrick Wildlife Trust, famous for orphaned elephants.",
      "Nairobi sits at 1,795 meters above sea level.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/90/6c/29/906c295f8c01b2957b89d0b8936875ad.jpg",
  },
  {
    city: "Auckland",
    country: "New Zealand",
    clues: [
      "Built on an isthmus and surrounded by two harbours.",
      "Nicknamed the 'City of Sails' for its vibrant boating scene.",
    ],
    funFacts: [
      "Auckland has more volcanic cones than any other city in the world.",
      "It’s home to the world’s largest Polynesian population.",
    ],
    trivia: [
      "Sky Tower is the Southern Hemisphere’s tallest freestanding structure.",
      "The city’s Māori name, Tāmaki Makaurau, means 'desired by many.'",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/aa/09/86/aa098670cb27ed5d14a4d84ef5e195de.jpg",
  },
  {
    city: "Wellington",
    country: "New Zealand",
    clues: [
      "Capital city known for its windy weather and hilly terrain.",
      "Home to the national museum Te Papa Tongarewa.",
    ],
    funFacts: [
      "Wellington’s cable car climbs 412 meters from downtown to Kelburn.",
      "The city hosts world‑renowned film festivals each year.",
    ],
    trivia: [
      "Rated one of the world’s most livable cities in 2024.",
      "Wind gusts can exceed 124 km/h at the airport lookout.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/fa/a8/05/faa8056d2f87cce41680b5ae87ae6980.jpg",
  },
  {
    city: "Reykjavik",
    country: "Iceland",
    clues: [
      "Northernmost capital of a sovereign state.",
      "Known for its colorful houses and proximity to geothermal wonders.",
    ],
    funFacts: [
      "Reykjavik’s name means 'Smoky Bay' from steam rising off hot springs.",
      "It’s warmed by geothermal energy, requiring no fossil fuels for heating.",
    ],
    trivia: [
      "Population of around 140,000 makes it the world’s smallest capital by size.",
      "Home to the oldest parliament in the world, Alþingi, founded in 930 AD.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/c3/4d/9b/c34d9b8d062899aae321bd45e1595be5.jpg",
  },
  {
    city: "Helsinki",
    country: "Finland",
    clues: [
      "Located on a peninsula and surrounded by over 300 islands.",
      "Famous for its neoclassical architecture around Senate Square.",
    ],
    funFacts: [
      "Helsinki was the World Design Capital in 2012.",
      "Saunas outnumber cars here—estimates suggest over 3 million saunas.",
    ],
    trivia: [
      "The city’s public transport includes a tram line to Suomenlinna sea fortress.",
      "Local Lonkero (long drink) was created for the 1952 Olympics.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/31/fd/16/31fd16b0cb978f93d1990d480ecf3d47.jpg",
  },
  {
    city: "Quito",
    country: "Ecuador",
    clues: [
      "High-altitude capital nestled in the Andean foothills.",
      "Rich colonial center known as the best-preserved historic center in Latin America.",
    ],
    funFacts: [
      "It’s the world’s second-highest capital after La Paz, Bolivia.",
      "Quito lies almost exactly on the equator—latitude 0°.",
    ],
    trivia: [
      "The city’s historic district is a UNESCO World Heritage Site.",
      "TelefériQo cable car takes visitors up the Pichincha Volcano.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/36/8a/db/368adb0decc5c99f75f26c0f03778293.jpg",
  },
  {
    city: "Bogotá",
    country: "Colombia",
    clues: [
      "Perched high on a plateau at over 2,600 meters elevation.",
      "Capital known for its historic La Candelaria district.",
    ],
    funFacts: [
      "Home to the world’s largest collection of pre-Columbian gold in the Gold Museum.",
      "Bogotá’s public bike system, ‘Ciclovía,’ closes over 120 km of streets on Sundays.",
    ],
    trivia: [
      "Mount Monserrate offers panoramic city views at 3,152 meters.",
      "Over 20% of its residents commute by bike each week.",
    ],
    cdnImageUrl:
      "https://i.pinimg.com/736x/75/33/87/753387a6069d03c1c8b391451a9c21f4.jpg",
  },
  {
    city: "San Diego",
    country: "United States",
    clues: [
      "Known for its beautiful beaches and year-round sunshine.",
      "Home to a famous zoo perched in Balboa Park.",
    ],
    funFacts: [
      "The San Diego Zoo was one of the first to use open-air, cageless exhibits!",
      "San Diego averages 201 sunny days per year, making it one of the sunniest major U.S. cities.",
    ],
    trivia: [
      "This city hosts the annual Comic-Con International every July.",
      "San Diego is actually closer to the equator than Miami.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/38/e1/cd/38e1cd65135ae088a7a12f5a3228618a.jpg",
  },
  {
    city: "Seattle",
    country: "United States",
    clues: [
      "Famous for its iconic Space Needle overlooking the city skyline.",
      "Renowned as the birthplace of a global coffee giant.",
    ],
    funFacts: [
      "Seattle’s Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S.!",
      "The city gets an average of 152 rainy days per year.",
    ],
    trivia: [
      "The first Starbucks opened in Seattle's Pike Place Market in 1971.",
      "Seattle is nicknamed the 'Emerald City' due to its lush evergreen forests.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/08/40/01/08400178bcfdb216402b2f54875c9262.jpg",
  },
  {
    city: "Boston",
    country: "United States",
    clues: [
      "Home to the historic Freedom Trail that winds past 16 significant sites.",
      "Known for its passionate college sports culture.",
    ],
    funFacts: [
      "Boston’s MBTA, opened in 1897, is the oldest subway system in the U.S.!",
      "The Boston Globe used the first newspaper printing press in America.",
    ],
    trivia: [
      "Boston baked beans are a traditional regional dish sweetened with molasses.",
      "The USS Constitution, 'Old Ironsides,' is the world’s oldest commissioned warship afloat.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/08/5f/03/085f031ab7c52732c97ccdd105a95c1b.jpg",
  },
  {
    city: "Chicago",
    country: "United States",
    clues: [
      "Known for its towering skyline featuring the Willis Tower.",
      "Famous for a uniquely thick style of pizza.",
    ],
    funFacts: [
      "The world’s first skyscraper—the Home Insurance Building—was built here in 1885!",
      "Chicago has more miles of lakefront than any other U.S. city.",
    ],
    trivia: [
      "Deep-dish pizza was invented in Chicago in 1943.",
      "The city sits along both Lake Michigan and the Chicago River, which is dyed green every St. Patrick’s Day.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/24/e7/9d/24e79ddf2ecc9e9fab97fbf385891738.jpg",
  },
  {
    city: "Ottawa",
    country: "Canada",
    clues: [
      "Capital city of Canada, located on the banks of the Rideau Canal.",
      "Hosts a world-famous winter festival with ice sculptures.",
    ],
    funFacts: [
      "Ottawa’s Rideau Canal transforms into the world’s largest skating rink each winter!",
      "This city was chosen as Canada’s capital by Queen Victoria in 1857 to balance English and French interests.",
    ],
    trivia: [
      "Ottawa is bilingual, with both English and French as official languages.",
      "The city’s name comes from the Algonquin word 'adawé,' meaning 'to trade.'",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/3d/a2/21/3da221c61ec62bbf453966bbb82bf2b8.jpg",
  },
  {
    city: "Marseille",
    country: "France",
    clues: [
      "France’s oldest city and a bustling Mediterranean port.",
      "Famous for its fragrant soap bars made from olive oil.",
    ],
    funFacts: [
      "Marseille’s Old Port has been active since 600 BC!",
      "This city hosts an annual soap festival celebrating its traditional savons de Marseille.",
    ],
    trivia: [
      "Bouillabaisse, a well-known fish stew, originated in Marseille.",
      "The city’s iconic basilica, Notre-Dame de la Garde, sits atop a 154‑meter hill.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/70/06/9f/70069ffa89041d930c68f9f62f46753a.jpg",
  },
  {
    city: "Nice",
    country: "France",
    clues: [
      "Renowned for its palm-lined Promenade des Anglais along the Baie des Anges.",
      "Famed for colorful flower markets and pastel-painted buildings.",
    ],
    funFacts: [
      "Nice was once the winter playground of European royalty in the 19th century!",
      "The city’s Carnival, held each February, is one of the largest in the world.",
    ],
    trivia: [
      "Nice means 'pleasant' in ancient Greek (Νίκαια, Nikaia).",
      "The Musée Matisse holds one of the world’s largest collections of Henri Matisse’s works.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/e5/37/a4/e537a40ae2cc5477959668f4b9842ec8.jpg",
  },
  {
    city: "Lyon",
    country: "France",
    clues: [
      "Known as the gastronomic capital of France.",
      "Sits at the confluence of the Rhône and Saône rivers.",
    ],
    funFacts: [
      "Lyon’s traboules—hidden passageways—were once secret routes for silk merchants!",
      "The city hosts the annual Festival of Lights every December, illuminating homes with lanterns.",
    ],
    trivia: [
      "Lyon’s cuisine is celebrated in small, family-run bistros called 'bouchons.'",
      "This city has UNESCO World Heritage status for its Renaissance architecture.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/d4/17/5a/d4175a773d58f74cee83961c7870b8e9.jpg",
  },
  {
    city: "Bordeaux",
    country: "France",
    clues: [
      "World-famous for its vineyards and wine production.",
      "Features stunning 18th-century neoclassical architecture.",
    ],
    funFacts: [
      "Bordeaux produces nearly 7 million bottles of wine each day!",
      "The city’s Place de la Bourse is mirrored by a thin layer of water called the 'Miroir d’eau.'",
    ],
    trivia: [
      "Bordeaux’s wine-growing history dates back to Roman times.",
      "The Cité du Vin museum offers immersive wine exhibitions.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/1e/72/13/1e72130402322452fc63cfb5571a4af9.jpg",
  },
  {
    city: "Toulouse",
    country: "France",
    clues: [
      "Nicknamed 'La Ville Rose' for its pink terracotta buildings.",
      "Aerospace hub, home to the headquarters of Airbus.",
    ],
    funFacts: [
      "Toulouse is the fourth-largest city in France!",
      "The Canal du Midi, a UNESCO site, starts here.",
    ],
    trivia: [
      "This city has its own regional sausage called 'saucisse de Toulouse.'",
      "Toulouse’s Capitole building houses both the city hall and an opera house.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/ed/96/8a/ed968acf6d5077afdd3033d644f56902.jpg",
  },
  {
    city: "Bruges",
    country: "Belgium",
    clues: [
      "Known for its medieval brick buildings and winding canals.",
      "Home to the famous Belfry tower with panoramic city views.",
    ],
    funFacts: [
      "Bruges was one of Europe’s most important trading cities in the 13th century!",
      "The city’s name may derive from a Norse word for 'bridge.'",
    ],
    trivia: [
      "Bruges produces world-renowned Belgian chocolates.",
      "The Basilica of the Holy Blood houses a vial said to contain Christ’s blood.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/ff/47/12/ff4712d7a87db14f8f31302e09d419ae.jpg",
  },
  {
    city: "Santorini",
    country: "Greece",
    clues: [
      "Famous for its white-washed houses with blue domes.",
      "Built on the rim of a volcanic caldera.",
    ],
    funFacts: [
      "Santorini’s volcanic eruption around 1600 BC may have inspired the legend of Atlantis!",
      "The island produces a unique photosynthetic vine grape called 'Assyrtiko.'",
    ],
    trivia: [
      "The village of Oia is world-famous for its sunset views.",
      "Santorini’s beaches have distinctive red and black volcanic sand.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/ad/1d/67/ad1d671fe1b22caeb004bcc6035e323b.jpg",
  },
  {
    city: "Mykonos",
    country: "Greece",
    clues: [
      "Known for windmills lining its Little Venice waterfront.",
      "Famous for vibrant nightlife and beach parties.",
    ],
    funFacts: [
      "Mykonos was once a haven for exiled Greek aristocrats after WWII!",
      "The island celebrates a 'Rhinopoulou' ancient windmill festival each summer.",
    ],
    trivia: [
      "Mykonos has more churches per square mile than anywhere else in Greece.",
      "Legend says the island is home to the ancient god Apollo’s daughter, Rhea.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/95/40/77/95407742c781a0a700b83e6331e7700f.jpg",
  },
  {
    city: "Florence",
    country: "Italy",
    clues: [
      "Birthplace of the Renaissance and home to Michelangelo’s David.",
      "Located on the Arno River with bridges like Ponte Vecchio.",
    ],
    funFacts: [
      "Florence’s Uffizi Gallery is one of the oldest art museums in the world!",
      "The city invented the modern banking system in the 14th century.",
    ],
    trivia: [
      "Florence’s Duomo dome was engineered by Filippo Brunelleschi without scaffolding.",
      "The Vasari Corridor above the Ponte Vecchio was built so the Medici family could move safely.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/d5/20/e3/d520e3656a6d3c2f8e85060b27678cfe.jpg",
  },
  {
    city: "Milan",
    country: "Italy",
    clues: [
      "Italy’s fashion and design capital.",
      "Home to Da Vinci’s 'The Last Supper.'",
    ],
    funFacts: [
      "The Galleria Vittorio Emanuele II is one of the world’s oldest shopping malls!",
      "Milan Cathedral took nearly six centuries to complete.",
    ],
    trivia: [
      "Milan’s La Scala is one of the world’s most famous opera houses.",
      "Every year, locals perform a ritual of spinning on the bull’s testicles mosaic for good luck.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/5f/4e/f4/5f4ef45007e9cb6082dce7484e88b216.jpg",
  },
  {
    city: "Munich",
    country: "Germany",
    clues: [
      "Hosts the world-famous Oktoberfest beer festival.",
      "Known for its grand central square, Marienplatz.",
    ],
    funFacts: [
      "Munich’s Englischer Garten is larger than New York’s Central Park!",
      "BMW was founded and is headquartered here.",
    ],
    trivia: [
      "The Glockenspiel in Marienplatz chimes daily, reenacting historic events.",
      "Munich’s Frauenkirche towers are topped with distinctive onion domes.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/31/3e/5e/313e5ec69b38ba8b7264f4369ad85cbd.jpg",
  },
  {
    city: "Salzburg",
    country: "Austria",
    clues: [
      "Birthplace of composer Wolfgang Amadeus Mozart.",
      "Surrounded by the Eastern Alps with a fortress overlooking the city.",
    ],
    funFacts: [
      "Salzburg’s historic center is a UNESCO World Heritage site!",
      "The Mirabell Gardens featured prominently in 'The Sound of Music.'",
    ],
    trivia: [
      "The city’s name means 'Salt Castle' due to its salt trade history.",
      "Salzburg hosts an annual festival of classical music each summer.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/e7/0b/bf/e70bbf501c5f5b50073851894b47e1b7.jpg",
  },
  {
    city: "Copenhagen",
    country: "Denmark",
    clues: [
      "Famous for its colorful Nyhavn waterfront buildings.",
      "Known for the statue of The Little Mermaid.",
    ],
    funFacts: [
      "Denmark’s Tivoli Gardens, opened in 1843, is the world’s second-oldest amusement park!",
      "Copenhagen aims to become the world’s first carbon-neutral capital by 2025.",
    ],
    trivia: [
      "The city is built on 42 islands, connected by over 400 bridges.",
      "Bicycles outnumber cars in Copenhagen.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/4b/aa/e2/4baae2dff4f859b4d14e48513a1ee343.jpg",
  },
  {
    city: "Geneva",
    country: "Switzerland",
    clues: [
      "Hosts the European headquarters of the United Nations.",
      "Sits on the shores of a large, crescent-shaped lake.",
    ],
    funFacts: [
      "Geneva’s Jet d’Eau fountain shoots water 140 meters into the air!",
      "The city had its own Red Cross–inspired humanitarian tradition.",
    ],
    trivia: [
      "Geneva was the birthplace of the Protestant Reformation leader John Calvin.",
      "This city’s watchmakers revolutionized timekeeping in the 16th century.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/56/f5/ee/56f5ee9ddde76716628b81670bd23003.jpg",
  },
  {
    city: "Krakow",
    country: "Poland",
    clues: [
      "Known for its preserved medieval core and Jewish quarter.",
      "Home to the 14th‑century Wawel Royal Castle.",
    ],
    funFacts: [
      "Krakow was never destroyed by the Mongol invasions of the 13th century!",
      "The city’s Cloth Hall is one of Europe’s oldest shopping arcades.",
    ],
    trivia: [
      "Krakow’s salt mines at Wieliczka date back to the 13th century.",
      "Legend says a dragon once lived under Wawel Hill.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/f5/67/61/f567616a5eb31dbe1fe4f85083acd0c2.jpg",
  },
  {
    city: "Chiang Mai",
    country: "Thailand",
    clues: [
      "Northern Thai city famed for its ancient temples.",
      "Hosts the annual Yi Peng lantern festival.",
    ],
    funFacts: [
      "Chiang Mai has over 300 Buddhist temples!",
      "It was the capital of the Lanna Kingdom until the 16th century.",
    ],
    trivia: [
      "The city’s old walls and moats are still visible today.",
      "Chiang Mai is known as the 'Rose of the North.'",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/f0/8b/07/f08b071513840b1c19043b12554d8d72.jpg",
  },
  {
    city: "Kathmandu",
    country: "Nepal",
    clues: [
      "Gateway to the Himalayas and Everest Base Camp treks.",
      "Home to ancient Durbar Squares and pagoda‑style temples.",
    ],
    funFacts: [
      "Kathmandu’s name may derive from a wooden temple called Kasthamandap.",
      "It’s the only world capital with its own UNESCO World Heritage Site in the city center.",
    ],
    trivia: [
      "Swayambhunath, the Monkey Temple, sits atop a hill with panoramic views.",
      "Kathmandu Valley has been inhabited for over 2,000 years.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/c4/9a/8e/c49a8e385a0bbffb63c80507152f9c66.jpg",
  },
  {
    city: "Thimphu",
    country: "Bhutan",
    clues: [
      "One of the world’s smallest national capitals by population.",
      "Known for its giant Buddha Dordenma statue.",
    ],
    funFacts: [
      "Thimphu had no traffic lights until 2005!",
      "The city hosts the annual Thimphu Tsechu festival with masked dances.",
    ],
    trivia: [
      "Bhutan measures success by Gross National Happiness, headquartered here.",
      "Traditional dress is required in government buildings and schools.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/21/9f/98/219f98297e61acaa08782772adc71119.jpg",
  },
  {
    city: "Antalya",
    country: "Turkey",
    clues: [
      "Turkish Riviera port city with ancient Roman ruins.",
      "Gateway to the region’s famed Turquoise Coast beaches.",
    ],
    funFacts: [
      "Antalya’s old city, Kaleiçi, features narrow cobblestone streets and Ottoman-era houses!",
      "The Düden Waterfalls flow directly into the Mediterranean here.",
    ],
    trivia: [
      "Hadrian’s Gate was built in 130 AD to honor Emperor Hadrian’s visit.",
      "Antalya’s airport is one of the busiest in Turkey, especially in summer.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/f9/6e/c1/f96ec1a7d97a877fde2d3d98f57192c5.jpg",
  },
  {
    city: "Colombo",
    country: "Sri Lanka",
    clues: [
      "Commercial capital on the west coast lagoon.",
      "Blend of colonial architecture and modern skyscrapers.",
    ],
    funFacts: [
      "Colombo’s Pettah Market is a bustling open-air bazaar with narrow alleys!",
      "The city’s Dutch Hospital precinct is one of the oldest buildings, dating to the 17th century.",
    ],
    trivia: [
      "Galle Face Green, a seaside urban park, was once a landing strip for British biplanes.",
      "Colombo was named the best tourist city in Asia in 2019 by Travel + Leisure readers.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/6a/12/6b/6a126b29a3f790754aa28627694d56f2.jpg",
  },
  {
    city: "Porto",
    country: "Portugal",
    clues: [
      "Famous for its port wine cellars lining the Douro River.",
      "Known for its tiled facades and narrow, winding streets.",
    ],
    funFacts: [
      "Porto’s Livraria Lello is one of the oldest bookstores in Portugal and inspired J.K. Rowling!",
      "The Dom Luís I Bridge was designed by a student of Gustave Eiffel.",
    ],
    trivia: [
      "Porto was Europe’s Capital of Culture in 2001.",
      "The city’s São Bento station features over 20,000 hand-painted tiles.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/fc/5b/d7/fc5bd7c784cfd6c7f48dbbcd35129d71.jpg",
  },
  {
    city: "Galway",
    country: "Ireland",
    clues: [
      "West Coast city known for its traditional Irish music scene.",
      "Hosts the famed Galway International Arts Festival each summer.",
    ],
    funFacts: [
      "Galway’s streets are named after the 14 merchant families that once ruled the city!",
      "The Claddagh ring, symbolizing love and friendship, originated here.",
    ],
    trivia: [
      "Galway was the European Capital of Culture in 2020.",
      "The city’s Eyre Square was redesigned by American architect Daniel Burnham.",
    ],
    cdnImageUrl: "https://i.pinimg.com/736x/e4/9e/3d/e49e3d376cbdf5556c5280a547d2716a.jpg",
  },
];
  

// Extract only the city names
const cityNames = destinationsData.map(destination => destination.city);

// Print the city names
console.log('City names:');
console.log(cityNames);

// Check for duplicate city names
const duplicateCities = findDuplicates(cityNames);
if (duplicateCities.length > 0) {
  console.log('\nRepeating city names:');
  console.log(duplicateCities);
} else {
  console.log('\nNo repeating city names found.');
}

// Function to find duplicates in an array
function findDuplicates(array) {
  const counts = {};
  const duplicates = [];
  
  for (const item of array) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] === 2) {
      duplicates.push(item);
    }
  }
  
  return duplicates;
}

// Write city names to a file
await writeFile('city-names.json', JSON.stringify(cityNames, null, 2));

// Write duplicate city names to a separate file if any exist
if (duplicateCities.length > 0) {
  await writeFile('duplicate-cities.json', JSON.stringify(duplicateCities, null, 2));
  console.log('City names have been extracted and saved to city-names.json');
  console.log('Duplicate city names have been saved to duplicate-cities.json');
} else {
  console.log('City names have been extracted and saved to city-names.json');
} 