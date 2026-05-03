# ui-campaign-flow-polish-plan

## Goal
Polish the campaign management flow so the UI better supports creation, viewing, scheduling, sending, and deleting actions.

## Problems Observed
- Campaign actions may not feel clearly grouped by intent
- Status-driven behavior needs to stay obvious to the user
- Stats and recipient information may need stronger visual hierarchy
- Action feedback after schedule, send, or delete should remain clear and predictable

## Fix Strategy
1. Keep campaign status presentation consistent with the current badge mapping.
2. Make draft-only actions more visually clear in the campaign detail page.
3. Improve layout hierarchy between message preview, actions, stats, and recipients.
4. Ensure action results refresh data in a predictable way after schedule or send.
5. Keep destructive actions visually distinct from neutral actions.
6. Review labels, helper text, and section descriptions for clarity.

## Files Expected to Change
- `frontend/src/pages/campaigns.tsx`
- `frontend/src/pages/campaign-new.tsx`
- `frontend/src/pages/campaign-detail.tsx`
- optional shared UI components if needed for small presentation fixes

## Validation
- Run the frontend locally
- Verify navigation from campaign list to create and detail pages
- Verify status badges and action visibility for each campaign state
- Confirm that schedule, send, and delete flows provide clear feedback
