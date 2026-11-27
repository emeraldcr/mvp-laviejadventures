# PayPal checkout trace

Each PayPal order has a server-side context keyed by `orderId`; the paid reservation uses the same key and stores `captureId`. The dashboard counts current order states by order creation date, independently of browser analytics. Existing contexts without a state count as created.

1. **Created/open:** PayPal returns an order and its booking context is saved. A closed tab or lost connection remains open: it is not proof of cancellation or failure.
2. **Cancelled:** PayPal's explicit cancellation callback reports the order using its signed browser ownership cookie. The checkout and its details remain available for another attempt. A missing callback or failed network request cannot be recorded reliably.
3. **Returned:** an approved order reaches the server capture endpoint; transient lookup, validation, or network problems remain retryable and are not classified as definite payment failures.
4. **Payment failed:** a definitive non-recoverable PayPal capture rejection is recorded by order ID. A declined instrument that PayPal can restart remains retryable.
5. **Captured:** the capture ID is recorded as `captured_unconfirmed` before saving the reservation. Once persisted, the state becomes `confirmed`. Retry reconciles an already captured order without a second charge. The dashboard flags captured orders needing reconciliation.

Checkout details remain in session storage and, when draft saving succeeds, in the seven-day server draft reached by the resume link placed in the URL. If browser storage and draft saving both fail, recovery after a full page exit is not guaranteed. A successful confirmation clears local checkout details. This flow uses PayPal SDK callbacks; no live PayPal sandbox or browser test was performed here.
