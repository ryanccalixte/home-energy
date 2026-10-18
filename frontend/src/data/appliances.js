// COCO-SSD class names that correspond to energy-using appliances.
// Wattage ranges match the table in main.py; `watts` and `hoursPerDay` are
// typical values used for the rough daily estimate (users can edit hours).
export const APPLIANCES = {
  tv: { name: 'Television', range: '25–500 W', watts: 100, hoursPerDay: 4 },
  laptop: { name: 'Laptop computer', range: '35–150 W', watts: 60, hoursPerDay: 6 },
  microwave: { name: 'Microwave oven', range: '750–1,500 W', watts: 1100, hoursPerDay: 0.25 },
  oven: { name: 'Electric range/oven', range: '2,000–5,000 W', watts: 3000, hoursPerDay: 0.75 },
  toaster: { name: 'Toaster', range: '750–1,500 W', watts: 1100, hoursPerDay: 0.1 },
  // A fridge is plugged in 24/7, but its compressor only runs part of the time.
  refrigerator: { name: 'Refrigerator', range: '500–1,000 W', watts: 700, hoursPerDay: 2.5 },
  'hair drier': { name: 'Hair dryer', range: '750–2,000 W', watts: 1500, hoursPerDay: 0.15 },
  'cell phone': { name: 'Smart phone charger', range: '5–25 W', watts: 10, hoursPerDay: 3 },
}

// Rough U.S. average residential electricity price, in $/kWh.
export const DEFAULT_RATE = 0.17
