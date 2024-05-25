const db = require('../src/db/index');

async function clearCollection(collectionPath) {
  const snapshot = await db.collection(collectionPath).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleared collection ${collectionPath}`);
}

async function seedDatabase() {
  const cities = [
    {
      city: 'Toronto',
      temperature: '15°C',
      condition: 'Sunny',
      high: '18°C',
      low: '10°C',
    },
    {
      city: 'New York',
      temperature: '20°C',
      condition: 'Partly Cloudy',
      high: '23°C',
      low: '16°C',
    },
    {
      city: 'London',
      temperature: '10°C',
      condition: 'Rainy',
      high: '13°C',
      low: '7°C',
    },
    {
      city: 'Sydney',
      temperature: '25°C',
      condition: 'Sunny',
      high: '27°C',
      low: '22°C',
    },
    {
      city: 'Tokyo',
      temperature: '22°C',
      condition: 'Cloudy',
      high: '25°C',
      low: '18°C',
    },
    {
      city: 'Mumbai',
      temperature: '30°C',
      condition: 'Sunny',
      high: '34°C',
      low: '26°C',
    },
    {
      city: 'Shanghai',
      temperature: '19°C',
      condition: 'Rainy',
      high: '22°C',
      low: '16°C',
    },
    {
      city: 'Istanbul',
      temperature: '16°C',
      condition: 'Cloudy',
      high: '20°C',
      low: '13°C',
    },
    {
      city: 'Cairo',
      temperature: '35°C',
      condition: 'Sunny',
      high: '38°C',
      low: '22°C',
    },
    {
      city: 'Buenos Aires',
      temperature: '17°C',
      condition: 'Cloudy',
      high: '20°C',
      low: '14°C',
    },
    {
      city: 'Los Angeles',
      temperature: '28°C',
      condition: 'Sunny',
      high: '30°C',
      low: '21°C',
    },
    {
      city: 'Paris',
      temperature: '12°C',
      condition: 'Rainy',
      high: '15°C',
      low: '8°C',
    },
    {
      city: 'Berlin',
      temperature: '14°C',
      condition: 'Cloudy',
      high: '18°C',
      low: '9°C',
    },
    {
      city: 'Madrid',
      temperature: '23°C',
      condition: 'Sunny',
      high: '29°C',
      low: '16°C',
    },
    {
      city: 'Bangkok',
      temperature: '34°C',
      condition: 'Cloudy',
      high: '36°C',
      low: '28°C',
    },
    {
      city: 'Jakarta',
      temperature: '32°C',
      condition: 'Rainy',
      high: '35°C',
      low: '26°C',
    },
    {
      city: 'São Paulo',
      temperature: '19°C',
      condition: 'Rainy',
      high: '21°C',
      low: '16°C',
    },
    {
      city: 'Moscow',
      temperature: '5°C',
      condition: 'Snowy',
      high: '7°C',
      low: '-1°C',
    },
    {
      city: 'Seoul',
      temperature: '11°C',
      condition: 'Windy',
      high: '14°C',
      low: '7°C',
    },
    {
      city: 'Beijing',
      temperature: '15°C',
      condition: 'Clear',
      high: '17°C',
      low: '10°C',
    },
  ];

  try {
    await clearCollection('weather');

    for (const city of cities) {
      const cityRef = db.collection('weather').doc(city.name);

      await cityRef.set(city);
      console.log(`Seeded ${city.name} successfully.`);
    }

    console.log('All cities have been seeded.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
