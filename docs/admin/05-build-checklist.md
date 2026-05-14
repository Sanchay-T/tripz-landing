# TripZ Admin Build Checklist

## Phase 1: Foundation

- [ ] Create admin specs.
- [ ] Add Google Gen AI SDK and env docs.
- [ ] Generate fixed ticket fixtures.
- [ ] Add server-only extraction module.
- [ ] Add extraction schema tests.

## Phase 2: Admin Shell

- [ ] Add `/admin` layout with sidebar and top bar.
- [ ] Add dashboard cards, queues, and tables.
- [ ] Add `/admin/intake` ticket intake workflow.
- [ ] Add remaining module shells.

## Phase 3: Data

- [ ] Add Supabase schema migration.
- [ ] Add storage bucket plan.
- [ ] Wire uploads to storage.
- [ ] Persist extraction rows.
- [ ] Confirm reviewed extraction into customer, booking, document, and tasks.

## Phase 4: Verification

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Browser check `/`
- [ ] Browser check `/admin`
- [ ] Browser check `/admin/intake`
- [ ] Responsive check desktop, laptop, iPad, iPhone
