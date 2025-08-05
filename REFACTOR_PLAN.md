# Website Structure Refactor Plan

## Overview
Moving from monolithic pages to a modular, feature-based architecture. This refactor will start with the profile page and admin pages, while keeping other pages monolithic for now.

## Current State
- Monolithic pages with mixed business logic and UI
- Admin structure separate from main pages
- Large page files (profile-page.tsx is 788 lines)
- Inconsistent component organization

## Target Structure

```
src/
├── pages/
│   ├── HomePage.tsx                    # MONOLITHIC (for now)
│   ├── AuthPage.tsx                    # MONOLITHIC (for now)
│   ├── AuthVerifyPage.tsx              # MONOLITHIC (for now)
│   ├── ProfilePage.tsx                 # NEW MODULAR (~30 lines)
│   └── admin/
│       ├── AdminLoginPage.tsx          # MONOLITHIC (for now)
│       ├── ManagementPage.tsx          # NEW MODULAR (~40 lines)
│       ├── AnalyticsPage.tsx           # NEW MODULAR (~25 lines)
│       ├── OperationsPage.tsx          # NEW MODULAR (~20 lines)
│       └── AdvancedPage.tsx            # NEW MODULAR (~15 lines)
│
├── features/
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileInfo.tsx
│   │   │   ├── PhotoUpload.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── PoolSelection.tsx
│   │   │   └── ProfileSetup.tsx
│   │   ├── hooks/
│   │   │   ├── useProfile.ts
│   │   │   ├── usePhotoUpload.ts
│   │   │   └── usePoolManagement.ts
│   │   └── services/
│   │       ├── profileService.ts
│   │       └── uploadService.ts
│   │
│   └── admin/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AdminHeader.tsx
│       │   │   ├── AdminLayout.tsx
│       │   │   └── AdminNavigation.tsx
│       │   ├── management/
│       │   │   ├── UserTable.tsx
│       │   │   ├── UserRow.tsx
│       │   │   └── PhotoModal.tsx
│       │   ├── analytics/
│       │   │   ├── StatCard.tsx
│       │   │   └── AnalyticsChart.tsx
│       │   └── ui/
│       │       ├── LoadingState.tsx
│       │       ├── EmptyState.tsx
│       │       └── Pagination.tsx
│       ├── hooks/
│       │   ├── useUsers.ts
│       │   ├── useAnalytics.ts
│       │   └── usePagination.ts
│       └── services/
│           └── adminService.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   └── httpClient.ts
│   ├── utils/
│   │   ├── imageCompression.ts
│   │   ├── dateUtils.ts
│   │   └── validation.ts
│   └── types/
│       ├── user.ts
│       ├── image.ts
│       └── common.ts
```

## Implementation Plan

### Phase 1: Setup Foundation
1. Create new directory structure (`features/`, `shared/`)
2. Move existing admin components to `features/admin/`
3. Create `pages/admin/` directory
4. Extract shared utilities and types

### Phase 2: Profile Page Refactor
1. Break down profile-page.tsx into feature components:
   - ProfileSetup.tsx (profile completion form)
   - ProfileInfo.tsx (user info display)
   - PhotoUpload.tsx (upload functionality)
   - PhotoGallery.tsx (photo grid with pool selection)
   - PoolSelection.tsx (pool management)
2. Create profile hooks:
   - useProfile.ts (user data management)
   - usePhotoUpload.ts (upload logic)
   - usePoolManagement.ts (pool selection logic)
3. Extract profile services
4. Create slim ProfilePage.tsx that composes these parts

### Phase 3: Admin Pages Refactor
1. Move admin pages to `pages/admin/`
2. Ensure admin components use the new structure
3. Create slim admin page components
4. Update routing in app.tsx

### Phase 4: Shared Components
1. Extract common UI components
2. Create reusable hooks
3. Consolidate services

## Success Criteria
- Profile page reduced from 788 lines to ~30 lines
- Admin pages are slim and focused (~15-40 lines each)
- Clear separation of concerns
- Reusable components and hooks
- Consistent code organization
- All existing functionality preserved

## Future Phases (Not in Scope)
- Refactor HomePage/RatePage to use rating feature
- Refactor auth pages to use auth feature
- Create shared design system components

## Notes
- Maintain backward compatibility during transition
- Keep existing functionality intact
- Focus on organization and maintainability
- Follow established admin patterns for consistency