const images = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1582407947092-d46fc4268e5c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop",
];

const locations = [
  "Miami, FL", "New York, NY", "San Diego, CA", "Austin, TX", "San Francisco, CA",
  "Seattle, WA", "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Nashville, TN",
  "Phoenix, AZ", "Portland, OR", "Dallas, TX", "Atlanta, GA", "Boston, MA",
  "Las Vegas, NV", "Tampa, FL", "Charlotte, NC", "Minneapolis, MN", "Orlando, FL",
  "Scottsdale, AZ", "Raleigh, NC", "Salt Lake City, UT", "San Antonio, TX", "Houston, TX",
];

const types = ["Residential", "Commercial", "Retail", "Mixed-Use", "Industrial"];
const statuses = ["funding", "funded", "completed"];

const adjectives = ["Luxury", "Premium", "Grand", "Elite", "Modern", "Urban", "Skyline", "Harbor", "Parkside", "Riverside", "Sunset", "Oceanview", "Metro", "Downtown", "Uptown", "Heritage", "Pinnacle", "Vista", "Summit", "Horizon"];
const nouns = ["Apartments", "Tower", "Plaza", "Residences", "Complex", "Center", "Estates", "Lofts", "Suites", "Village", "Gardens", "Heights", "Square", "Terrace", "Point"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function generateSeedProperties() {
  const properties = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 50; i++) {
    let name: string;
    do {
      name = `${adjectives[rand(0, adjectives.length - 1)]} ${nouns[rand(0, nouns.length - 1)]}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const target = rand(5, 100) * 100000;
    const status = statuses[rand(0, 2)];
    const raised = status === "funded" || status === "completed" ? target : rand(1, 9) * Math.floor(target / 10);

    properties.push({
      title: name,
      location: locations[rand(0, locations.length - 1)],
      image_url: images[rand(0, images.length - 1)],
      target_amount: target,
      raised_amount: raised,
      roi: randFloat(6, 18),
      investors_count: rand(10, 500),
      status,
      property_type: types[rand(0, types.length - 1)],
      min_investment: [100, 250, 500, 750, 1000, 2000, 5000][rand(0, 6)],
      description: `A premier ${types[rand(0, types.length - 1)].toLowerCase()} investment opportunity in ${locations[rand(0, locations.length - 1)]}. This property offers strong rental yields, modern amenities, and excellent growth potential in a high-demand market.`,
    });
  }
  return properties;
}
