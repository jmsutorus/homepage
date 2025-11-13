# Parks Category Enum Refactor

## Overview
This document outlines the refactoring of park category handling to use a centralized enum (`DBParkCategory`) across the entire parks feature.

## Changes Made

### 1. **Enum Definition** (`lib/db/enums/park-enums.ts`)
- Fixed typo: `emum` → `enum`
- Defined `DBParkCategory` enum with all valid park categories:
  - National Park
  - State Park
  - Wilderness
  - Monument
  - Recreation Area
  - City Park
  - National Seashore
  - National Forest
  - Other
- Added `PARK_CATEGORIES` constant for easy access to all values
- Added `ParkCategoryValue` type for string literals

### 2. **Database Layer** (`lib/db/parks.ts`)
- Removed duplicate enum definition
- Imported enum from `park-enums.ts`
- Updated `DBPark` interface to use `ParkCategoryValue` type
- Updated `ParkContent` interface to use `ParkCategoryValue` instead of hardcoded union type
- Updated function signatures:
  - `getParksByCategory()` now accepts `ParkCategoryValue`
  - `createPark()` requires `ParkCategoryValue` for category
  - `updatePark()` accepts `ParkCategoryValue` for category updates

### 3. **API Routes**
#### `/api/parks/route.ts`
- Imported `PARK_CATEGORIES` and `ParkCategoryValue`
- Updated category validation to use `PARK_CATEGORIES` array
- Dynamic error messages based on enum values

#### `/api/parks/[slug]/route.ts`
- Imported `PARK_CATEGORIES` and `ParkCategoryValue`
- Added category validation in PATCH endpoint
- Consistent validation with POST endpoint

### 4. **Components**
#### `park-editor.tsx`
- Imported `DBParkCategory`, `ParkCategoryValue`, and `PARK_CATEGORIES`
- Updated `ParkFrontmatter` interface to use `ParkCategoryValue`
- Changed default category to use `DBParkCategory.NationalPark`
- Refactored Select dropdown to dynamically generate options from `PARK_CATEGORIES`
- Removed hardcoded category options

#### `park-card.tsx`
- Imported `DBParkCategory` and `ParkCategoryValue`
- Updated `categoryColors` mapping to use enum as keys
- Added colors for new categories (City Park, National Seashore, National Forest)
- Updated fallback color to use `DBParkCategory.Other`

### 5. **Database Schema** (`lib/db/schema.sql`)
- Updated CHECK constraint to include all enum values:
  - Added: City Park, National Seashore, National Forest
- Ensures database-level validation matches application enum

### 6. **Migration Script** (`scripts/add-parks-table.ts`)
- Imported `PARK_CATEGORIES` from enum file
- Dynamically generates CHECK constraint from enum values
- Ensures migration stays in sync with enum definition

## Benefits

1. **Type Safety**: TypeScript enforces valid category values throughout the codebase
2. **Single Source of Truth**: Enum is defined once and imported everywhere
3. **Maintainability**: Adding new categories only requires updating the enum
4. **Consistency**: All components, APIs, and database constraints use the same values
5. **Discoverability**: IDE autocomplete helps developers use valid categories
6. **Refactoring Safety**: Changes to enum propagate through TypeScript compilation

## Usage Examples

```typescript
// Creating a park with enum
import { DBParkCategory } from '@/lib/db/enums/park-enums';

const park = createPark({
  slug: 'yosemite',
  title: 'Yosemite National Park',
  category: DBParkCategory.NationalPark,
  content: 'Beautiful park...'
});

// Validating category
import { PARK_CATEGORIES } from '@/lib/db/enums/park-enums';

if ((PARK_CATEGORIES as readonly string[]).includes(userInput)) {
  // Valid category
}

// Type-safe function parameters
import { ParkCategoryValue } from '@/lib/db/enums/park-enums';

function filterParks(category: ParkCategoryValue) {
  return getParksByCategory(category);
}
```

## Migration Notes

- Existing park entries in the database are unaffected
- The enum includes all previously valid categories
- New categories (City Park, National Seashore, National Forest) are now available
- Database CHECK constraint updated to accept all enum values

## Testing Checklist

- ✅ TypeScript compilation passes without errors
- ✅ Park editor dropdown shows all categories
- ✅ API validation accepts all enum values
- ✅ Park card colors render for all categories
- ✅ Database schema includes all categories in CHECK constraint
- ✅ Migration script generates correct SQL

## Future Considerations

- Consider adding category icons/emojis mapping
- Add category descriptions for tooltips
- Implement category-based filtering in UI
- Add analytics/statistics per category
