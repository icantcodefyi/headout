import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const destinationsData = [
  {
    city: "Paris",
    country: "France",
    clues: [
      "This city is home to a famous tower that sparkles every night.",
      "Known as the 'City of Love' and a hub for fashion and art."
    ],
    funFacts: [
      "The Eiffel Tower was supposed to be dismantled after 20 years but was saved because it was useful for radio transmissions!",
      "Paris has only one stop sign in the entire city—most intersections rely on priority-to-the-right rules."
    ],
    trivia: [
      "This city is famous for its croissants and macarons. Bon appétit!",
      "Paris was originally a Roman city called Lutetia."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "Tokyo",
    country: "Japan",
    clues: [
      "This city has the busiest pedestrian crossing in the world.",
      "You can visit an entire district dedicated to anime, manga, and gaming."
    ],
    funFacts: [
      "Tokyo was originally a small fishing village called Edo before becoming the bustling capital it is today!",
      "More than 14 million people live in Tokyo, making it one of the most populous cities in the world."
    ],
    trivia: [
      "The city has over 160,000 restaurants, more than any other city in the world.",
      "Tokyo's subway system is so efficient that train delays of just a few minutes come with formal apologies."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "New York",
    country: "USA",
    clues: [
      "Home to a green statue gifted by France in the 1800s.",
      "Nicknamed 'The Big Apple' and known for its Broadway theaters."
    ],
    funFacts: [
      "The Statue of Liberty was originally a copper color before oxidizing to its iconic green patina.",
      "Times Square was once called Longacre Square before being renamed in 1904."
    ],
    trivia: [
      "New York City has 468 subway stations, making it one of the most complex transit systems in the world.",
      "The Empire State Building has its own zip code: 10118."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "Rome",
    country: "Italy",
    clues: [
      "This city was built on seven hills and has a famous arena where gladiators once fought.",
      "Visitors throw coins into a magnificent Baroque fountain to ensure they'll return someday."
    ],
    funFacts: [
      "About €3,000 are thrown into the Trevi Fountain each day, which is collected and donated to charity.",
      "This city has more than 900 churches, despite being only 496 square miles in size."
    ],
    trivia: [
      "The Pantheon in this city has the world's largest unreinforced concrete dome, nearly 2,000 years after it was built.",
      "The first shopping mall in the world was built here in the early 2nd century."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "Sydney",
    country: "Australia",
    clues: [
      "This city is known for its iconic opera house with sail-shaped shells.",
      "It hosts the world's largest natural harbor with more than 240 kilometers of shoreline."
    ],
    funFacts: [
      "The Opera House has over one million roof tiles covering approximately 1.62 hectares.",
      "Sydney Harbour Bridge is nicknamed 'The Coathanger' due to its arch-based design."
    ],
    trivia: [
      "The city's name comes from the British Home Secretary Thomas Townshend, Lord Sydney.",
      "Bondi Beach is one of the most famous beaches in the world and is less than 5 miles from downtown."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "Cairo",
    country: "Egypt",
    clues: [
      "This city sits near legendary structures that are the only remaining ancient wonder of the world.",
      "The longest river in the world runs through this ancient capital."
    ],
    funFacts: [
      "The Great Pyramid was the tallest man-made structure for over 3,800 years.",
      "Cairo means 'The Victorious' in Arabic and is the largest city in Africa and the Middle East."
    ],
    trivia: [
      "Despite being surrounded by desert, this city experiences occasional snow about once every 100 years.",
      "The city's traffic is so notorious that locals joke it would be faster to walk across the Sahara."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    city: "Rio de Janeiro",
    country: "Brazil",
    clues: [
      "This city is famous for a giant statue of Christ with outstretched arms overlooking the bay.",
      "It hosts the world's largest carnival celebration every year before Lent."
    ],
    funFacts: [
      "The Christ the Redeemer statue was struck by lightning and lost part of its thumb in 2014.",
      "Copacabana Beach stretches for 2.5 miles and is one of the most famous beaches in the world."
    ],
    trivia: [
      "This was the first South American city to host the Summer Olympics.",
      "The name means 'January River' in Portuguese, though there is no river there—early explorers mistook the bay for a river mouth."
    ],
    cdnImageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1000&auto=format&fit=crop"
  }
];

async function main() {
  console.log(`Start seeding ...`);

  try {
    // Clear existing data
    await prisma.$transaction([
      prisma.$executeRaw`TRUNCATE TABLE "GameSession" CASCADE`,
      prisma.$executeRaw`TRUNCATE TABLE "Destination" CASCADE`
    ]);

    for (const destination of destinationsData) {
      const result = await prisma.destination.create({
        data: destination,
      });
      console.log(`Created destination with ID: ${result.id}`);
    }

    console.log(`Seeding finished.`);
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 