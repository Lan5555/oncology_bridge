# Email integration contract

## Frontend routes and deployment

- `/forgot-password` posts `{ email }` to `/auth/api/forgot-password` without authentication. Known, unknown and throttled accounts share a generic acknowledgement. `emailQueued: true` does not establish account existence or delivery.
- Set the backend `PASSWORD_RESET_PATH` to `/reset-password` on this frontend's origin. That page reads `?token=...`, immediately removes it with `history.replaceState`, and keeps it only in component memory. Reloading the cleaned URL requires opening the email link again.
- `/reset-password` posts `{ token, password }` to `/auth/api/reset-password` without authentication. Passwords must match and have at least eight characters. The backend enforces expiry, token validity and single use.
- Reset responses carry `Referrer-Policy: no-referrer`, no-index directives, and a content security policy allowing local resources and API connections to `NEXT_PUBLIC_BASE_URL`. Shared external font imports are blocked on this route. Do not add analytics, external scripts, images or other third-party resources to this page. Use full document navigation to enter it so its response policy applies.
- A successful reset returns the user to sign-in through an explicit link. Refresh sessions are revoked by the backend; existing access tokens retain their normal lifetime of up to 15 minutes.

## Backend-owned events

New TypeORM account and notification inserts enqueue through `EmailEventsSubscriber`. Registration, facility joins, ordinary account creation and staff invitations receive an account/registration message reflecting account activity. Licence and membership decisions include the applicant's decision message and remaining approval requirements. Other notifications, including join requests and cold-chain alerts, receive a minimal notice to open the app; clinical details stay in the app.

Notification edits/read updates do not send again. Raw SQL inserts bypass subscribers; old rows are not backfilled. Login, refresh, logout, public research inquiries, and transfer/payment flows without notifications do not automatically send email. The frontend must not independently send duplicate email requests.

Insert handlers use the event's `EntityManager`, so email queue writes join the existing transaction. Future transactional workflows use `EmailService.enqueue(message, manager)`; without a manager it uses the default connection. Use an explicit transaction for multiple writes that must succeed together. The global `EmailModule` exports the injectable service. Business writes do not call Brevo directly.

## Password recovery and delivery

Reset links expire after 15 minutes. Requests enqueue at most once per account per minute across instances; a newer accepted request invalidates older tokens. No environment returns raw tokens. Only hashes are stored in `password_resets`. Password update, token consumption, refresh-session revocation and confirmation enqueue share one transaction.

The worker polls every five seconds, processes up to ten messages per pass and shares work using PostgreSQL `FOR UPDATE SKIP LOCKED`. Provider calls time out after ten seconds and retry up to eight attempts with exponential backoff. Expired reset messages are discarded. Recipient/content payloads are encrypted at rest and removed after success, expiry or final failure. Logs contain outbox IDs and attempt counts only.

`SENT` means Brevo accepted the message, not inbox delivery. Inspect Brevo delivery/bounce logs. The outbox UUID is the provider idempotency key; delivery remains at least once, so a crash after acceptance and before commit can cause duplicates. Terminal failures require investigation and a new business request; no public replay endpoint exists.

Monitor without exposing recipient/content data:

```sql
SELECT status, count(*), min(created_at) AS oldest
FROM email_outbox GROUP BY status;
```

No automatic purge is enabled. Operational retention may remove expired reset hashes and terminal metadata; retain pending rows until processed.

## Deployment acceptance

With a test sender configured, register an account and check the welcome email. Request recovery, follow the link, confirm the URL is cleaned and no third-party resources load, and reset the password. Verify token reuse fails, old refresh sessions fail and the security confirmation appears in Brevo. Check generic acknowledgements for unknown/throttled accounts, expired/replaced links, pending-applicant review decisions and cold-chain notices with a configured device. Automated checks mock delivery; live delivery requires the configured backend and Brevo.
