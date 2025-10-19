export const roadAliases = {
  "w gate fwy": "west gate fwy",
  "w. gate fwy": "west gate fwy",
  "bolte br": "bolte bridge",
  "footscray rd": "footscray rd",
  "dynon rd": "dynon rd",
  "monash fwy": "monash fwy",
  "burnley st": "burnley st",
  "brunswick": "brunswick rd"
  // Add more aliases as you encounter them
};

export function normalizeRoad(name) {
  const lowerName = name.toLowerCase();
  return roadAliases[lowerName] || lowerName;
}

export const tolls = [
    {
        entryPoint: "tullamarine fwy",
        exits: [
            { exitPoint: "brunswick rd", price: 3.23 },
            { exitPoint: "flemington rd", price: 3.23 },
            { exitPoint: "dynon rd", price: 6.46 },
            { exitPoint: "footscray rd", price: 6.46 },
            { exitPoint: "bolte bridge", price: 10.50 },
            { exitPoint: "west gate fwy", price: 10.50 },
            { exitPoint: "w gate fwy", price: 10.50 },
            { exitPoint: "kings way", price: 10.50 },
            { exitPoint: "power st", price: 10.50 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 12.13 },
            { exitPoint: "tunnel", price: 12.13 },
            { exitPoint: "monash fwy", price: 12.13 },
            { exitPoint: "toorak rd", price: 12.13 }
        ]
    },
    {
        entryPoint: "bell st",
        exits: [
            { exitPoint: "brunswick rd", price: 3.23 },
            { exitPoint: "flemington rd", price: 3.23 },
            { exitPoint: "dynon rd", price: 6.46 },
            { exitPoint: "footscray rd", price: 6.46 },
            { exitPoint: "bolte bridge", price: 10.50 },
            { exitPoint: "west gate fwy", price: 10.50 },
            { exitPoint: "w gate fwy", price: 10.50 },
            { exitPoint: "kings way", price: 10.50 },
            { exitPoint: "power st", price: 10.50 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 12.13 },
            { exitPoint: "tunnel", price: 12.13 },
            { exitPoint: "monash fwy", price: 12.13 },
            { exitPoint: "toorak rd", price: 12.13 }
        ]
    },
    {
        entryPoint: "moreland rd",
        exits: [
            { exitPoint: "brunswick rd", price: 3.23 },
            { exitPoint: "flemington rd", price: 3.23 },
            { exitPoint: "dynon rd", price: 6.46 },
            { exitPoint: "footscray rd", price: 6.46 },
            { exitPoint: "bolte bridge", price: 10.50 },
            { exitPoint: "west gate fwy", price: 10.50 },
            { exitPoint: "w gate fwy", price: 10.50 },
            { exitPoint: "kings way", price: 10.50 },
            { exitPoint: "power st", price: 10.50 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 12.13 },
            { exitPoint: "tunnel", price: 12.13 },
            { exitPoint: "monash fwy", price: 12.13 },
            { exitPoint: "toorak rd", price: 12.13 }
        ]
    },
    {
        entryPoint: "racecourse rd",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 3.23 },
            { exitPoint: "footscray rd", price: 3.23 },
            { exitPoint: "bolte bridge", price: 7.27 },
            { exitPoint: "west gate fwy", price: 7.27 },
            { exitPoint: "kings way", price: 7.27 },
            { exitPoint: "power st", price: 7.27 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 12.13 },
            { exitPoint: "tunnel", price: 12.13 },
            { exitPoint: "monash fwy", price: 12.13 },
            { exitPoint: "toorak rd", price: 12.13 }
        ]
    },
    {
        entryPoint: "footscray rd",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 4.04 },
            { exitPoint: "west gate fwy", price: 4.04 },
            { exitPoint: "kings way", price: 4.04 },
            { exitPoint: "power st", price: 4.04 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 11.31 },
            { exitPoint: "tunnel", price: 11.31 },
            { exitPoint: "monash fwy", price: 0 },
            { exitPoint: "toorak rd", price: 0 }
        ]
    },
    {
        entryPoint: "burnley tunnel",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 7.27 },
            { exitPoint: "tunnel", price: 7.27 },
            { exitPoint: "monash fwy", price: 10.50 },
            { exitPoint: "toorak rd", price: 10.50 }
        ]
    },
    {
        entryPoint: "west gate fwy",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 7.27 },
            { exitPoint: "tunnel", price: 7.27 },
            { exitPoint: "monash fwy", price: 10.50 },
            { exitPoint: "toorak rd", price: 10.50 }
        ]
    },
    {
        entryPoint: "kings way",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 7.27 },
            { exitPoint: "tunnel", price: 7.27 },
            { exitPoint: "monash fwy", price: 10.50 },
            { exitPoint: "toorak rd", price: 10.50 }
        ]
    },
    {
        entryPoint: "exhibition st extension",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 2.02 },
            { exitPoint: "church st", price: 4.04 },
            { exitPoint: "burnley st", price: 7.27 },
            { exitPoint: "tunnel", price: 7.27 },
            { exitPoint: "monash fwy", price: 10.50 },
            { exitPoint: "toorak rd", price: 10.50 }
        ]
    },
    {
        entryPoint: "swan st",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 2.02 },
            { exitPoint: "burnley st", price: 5.25 },
            { exitPoint: "tunnel", price: 5.25 },
            { exitPoint: "monash fwy", price: 8.48 },
            { exitPoint: "toorak rd", price: 8.48 }
        ]
    },
    {
        entryPoint: "punt rd",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 3.23 },
            { exitPoint: "tunnel", price: 3.23 },
            { exitPoint: "monash fwy", price: 6.46 },
            { exitPoint: "toorak rd", price: 6.46 }
        ]
    },
    {
        entryPoint: "burnley st",
        exits: [
            { exitPoint: "brunswick rd", price: 0 },
            { exitPoint: "flemington rd", price: 0 },
            { exitPoint: "dynon rd", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "bolte bridge", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "church st", price: 0 },
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "tunnel", price: 0 },
            { exitPoint: "monash fwy", price: 3.23 },
            { exitPoint: "toorak rd", price: 3.23 }
        ]
    },
    {
        entryPoint: "monash fwy",
        exits: [
            { exitPoint: "burnley st", price: 3.23 },
            { exitPoint: "punt rd", price: 6.46 },
            { exitPoint: "swan st", price: 8.48 },
            { exitPoint: "exhibition st extension", price: 10.50 },
            { exitPoint: "domain tunnel", price: 10.50 },
            { exitPoint: "west gate fwy", price: 10.50 },
            { exitPoint: "kings way", price: 10.50 },
            { exitPoint: "power st", price: 10.50 },
            { exitPoint: "footscray rd", price: 12.13 },
            { exitPoint: "racecourse rd", price: 12.13 },
            { exitPoint: "bell st", price: 12.13 },
            { exitPoint: "moreland rd", price: 12.13 },
            { exitPoint: "tullamarine fwy", price: 12.13 }
        ]
    },
    {
        entryPoint: "toorak rd",
        exits: [
            { exitPoint: "burnley st", price: 3.23 },
            { exitPoint: "punt rd", price: 6.46 },
            { exitPoint: "swan st", price: 8.48 },
            { exitPoint: "exhibition st extension", price: 10.50 },
            { exitPoint: "domain tunnel", price: 10.50 },
            { exitPoint: "west gate fwy", price: 10.50 },
            { exitPoint: "kings way", price: 10.50 },
            { exitPoint: "power st", price: 10.50 },
            { exitPoint: "footscray rd", price: 12.13 },
            { exitPoint: "racecourse rd", price: 12.13 },
            { exitPoint: "bell st", price: 12.13 },
            { exitPoint: "moreland rd", price: 12.13 },
            { exitPoint: "tullamarine fwy", price: 12.13 }
        ]
    },
    {
        entryPoint: "gibdon st",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 3.23 },
            { exitPoint: "swan st", price: 5.25 },
            { exitPoint: "exhibition st extension", price: 7.27 },
            { exitPoint: "domain tunnel", price: 7.27 },
            { exitPoint: "west gate fwy", price: 7.27 },
            { exitPoint: "kings way", price: 7.27 },
            { exitPoint: "power st", price: 7.27 },
            { exitPoint: "footscray rd", price: 11.31 },
            { exitPoint: "racecourse rd", price: 12.13 },
            { exitPoint: "bell st", price: 12.13 },
            { exitPoint: "moreland rd", price: 12.13 },
            { exitPoint: "tullamarine fwy", price: 12.13 }
        ]
    },
    {
        entryPoint: "swan st",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 2.02 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "racecourse rd", price: 0 },
            { exitPoint: "bell st", price: 0 },
            { exitPoint: "moreland rd", price: 0 },
            { exitPoint: "tullamarine fwy", price: 0 }
        ]
    },
    {
        entryPoint: "bolte bridge",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 4.04 },
            { exitPoint: "racecourse rd", price: 7.27 },
            { exitPoint: "bell st", price: 10.50 },
            { exitPoint: "moreland rd", price: 10.50 },
            { exitPoint: "tullamarine fwy", price: 10.50 }
        ]
    },
    {
        entryPoint: "westgate fwy",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 4.04 },
            { exitPoint: "racecourse rd", price: 7.27 },
            { exitPoint: "bell st", price: 10.50 },
            { exitPoint: "moreland rd", price: 10.50 },
            { exitPoint: "tullamarine fwy", price: 10.50 }
        ]
    },
    {
        entryPoint: "kings way",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 4.04 },
            { exitPoint: "racecourse rd", price: 7.27 },
            { exitPoint: "bell st", price: 10.50 },
            { exitPoint: "moreland rd", price: 10.50 },
            { exitPoint: "tullamarine fwy", price: 10.50 }
        ]
    },
    {
        entryPoint: "dynon rd",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 4.04 },
            { exitPoint: "racecourse rd", price: 3.23 },
            { exitPoint: "bell st", price: 6.46 },
            { exitPoint: "moreland rd", price: 6.46 },
            { exitPoint: "tullamarine fwy", price: 6.46 }
        ]
    },
    {
        entryPoint: "footscray rd",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 4.04 },
            { exitPoint: "racecourse rd", price: 3.23 },
            { exitPoint: "bell st", price: 6.46 },
            { exitPoint: "moreland rd", price: 6.46 },
            { exitPoint: "tullamarine fwy", price: 6.46 }
        ]
    },
    {
        entryPoint: "brunswick rd",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "racecourse rd", price: 0 },
            { exitPoint: "bell st", price: 3.23 },
            { exitPoint: "moreland rd", price: 3.23 },
            { exitPoint: "tullamarine fwy", price: 3.23 }
        ]
    },
    {
        entryPoint: "flemington rd",
        exits: [
            { exitPoint: "burnley st", price: 0 },
            { exitPoint: "punt rd", price: 0 },
            { exitPoint: "swan st", price: 0 },
            { exitPoint: "exhibition st extension", price: 0 },
            { exitPoint: "domain tunnel", price: 0 },
            { exitPoint: "west gate fwy", price: 0 },
            { exitPoint: "kings way", price: 0 },
            { exitPoint: "power st", price: 0 },
            { exitPoint: "footscray rd", price: 0 },
            { exitPoint: "racecourse rd", price: 0 },
            { exitPoint: "bell st", price: 3.23 },
            { exitPoint: "moreland rd", price: 3.23 },
            { exitPoint: "tullamarine fwy", price: 3.23 }
        ]
    },
      {
    entryPoint: "springvale rd",
    exits: [
      { exitPoint: "ringwood bypass", price: 3.56 }
    ]
  },
  {
    entryPoint: "springvale rd",
    exits: [
      { exitPoint: "maroondah hwy", price: 3.56 }
    ]
  },
  {
    entryPoint: "maroondah hwy",
    exits: [
      { exitPoint: "canterbury rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "canterbury rd",
    exits: [
      { exitPoint: "boronia rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "boronia rd",
    exits: [
      { exitPoint: "burwood hwy", price: 3.36 }
    ]
  },
  {
    entryPoint: "burwood hwy",
    exits: [
      { exitPoint: "high street rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "high street rd",
    exits: [
      { exitPoint: "ferntree gully rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "ferntree gully rd",
    exits: [
      { exitPoint: "wellington rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "wellington rd",
    exits: [
      { exitPoint: "police rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "monash fwy",
    exits: [
      { exitPoint: "princes hwy", price: 3.36 }
    ]
  },
  {
    entryPoint: "princes hwy",
    exits: [
      { exitPoint: "cheltenham rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "dandenong bypass",
    exits: [
      { exitPoint: "greens rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "greens rd",
    exits: [
      { exitPoint: "thompson rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "thompson rd",
    exits: [
      { exitPoint: "peninsula link", price: 3.36 }
    ]
  },

  {
    entryPoint: "thompson rd",
    exits: [
      { exitPoint: "frankston fwy", price: 3.36 }
    ]
  }
];

export const eastLinkTolls = [
  {
    entryPoint: "springvale rd",
    exits: [
      { exitPoint: "ringwood bypass", price: 3.56 }
    ]
  },
  {
    entryPoint: "springvale rd",
    exits: [
      { exitPoint: "maroondah hwy", price: 3.56 }
    ]
  },
  {
    entryPoint: "maroondah hwy",
    exits: [
      { exitPoint: "canterbury rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "canterbury rd",
    exits: [
      { exitPoint: "boronia rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "boronia rd",
    exits: [
      { exitPoint: "burwood hwy", price: 3.36 }
    ]
  },
  {
    entryPoint: "burwood hwy",
    exits: [
      { exitPoint: "high street rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "high street rd",
    exits: [
      { exitPoint: "ferntree gully rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "ferntree gully rd",
    exits: [
      { exitPoint: "wellington rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "wellington rd",
    exits: [
      { exitPoint: "police rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "monash fwy",
    exits: [
      { exitPoint: "princes hwy", price: 3.36 }
    ]
  },
  {
    entryPoint: "princes hwy",
    exits: [
      { exitPoint: "cheltenham rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "dandenong bypass",
    exits: [
      { exitPoint: "greens rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "greens rd",
    exits: [
      { exitPoint: "thompson rd", price: 3.36 }
    ]
  },
  {
    entryPoint: "thompson rd",
    exits: [
      { exitPoint: "peninsula link", price: 3.36 }
    ]
  },

  {
    entryPoint: "thompson rd",
    exits: [
      { exitPoint: "frankston fwy", price: 3.36 }
    ]
  }
];

