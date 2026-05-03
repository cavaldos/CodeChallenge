# ui-loading-and-error-states-plan

## Goal
Improve UI consistency for loading, empty, and error states across the main frontend pages.

## Problems Observed
- Loading behavior may feel inconsistent between pages
- Error messages may not follow a single visual pattern
- Empty states may not guide the user clearly toward the next action
- Repeated UI patterns may be implemented separately instead of consistently

## Fix Strategy
1. Standardize loading states with the existing `Skeleton` component where data is fetched.
2. Standardize API error display with the existing `Alert`, `AlertTitle`, and `AlertDescription` components.
3. Add or improve empty states with clear titles, descriptions, and follow-up actions.
4. Keep button disabled states consistent during async actions.
5. Reuse the same card and spacing patterns across login, campaign list, create campaign, and campaign detail pages.
6. Review page copy so it stays short, clear, and consistent.

## Files Expected to Change
- `frontend/src/pages/login.tsx`
- `frontend/src/pages/campaigns.tsx`
- `frontend/src/pages/campaign-new.tsx`
- `frontend/src/pages/campaign-detail.tsx`
- shared UI components if small adjustments are needed

## Validation
- Run the frontend locally
- Test loading, error, and empty states on each page
- Verify disabled states during submit and action flows
- Confirm the UI remains visually consistent across pages
