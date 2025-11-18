export enum DBParkCategory {
  NationalPark = 'National Park',
  StatePark = 'State Park',
  Wilderness = 'Wilderness',
  Monument = 'Monument',
  RecreationArea = 'Recreation Area',
  CityPark = 'City Park',
  NationalSeashore = 'National Seashore',
  NationalForest = 'National Forest',
  Other = 'Other'
}

// Helper to get all category values as an array
export const PARK_CATEGORIES = Object.values(DBParkCategory);

// Type for park category string values
export type ParkCategoryValue = `${DBParkCategory}`;