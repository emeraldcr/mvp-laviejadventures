You are working on La Vieja Adventures MVP at C:\Users\aroja\Documents\GitHub\mvp-laviejadventures
(Next.js 16, TypeScript, MongoDB, Tailwind CSS).

## Task: Add time slot + package selection to the booking flow

The canyon tour booking currently lets users pick a date and number of people.
You need to add two new fields: **tour time** and **tour package**.

---

### 1. Tour Time Slots
Add a time selector with 3 options:
- 8:00 AM
- 9:00 AM
- 10:00 AM

UI: styled radio buttons or a button group (not a plain <select>).
Show as 3 clickable cards/buttons side by side.

---

### 2. Tour Packages
Add a package selector with 3 options displayed as cards:

| Package | Price CRC | Price USD | Notes |
|---|---|---|---|
| Paquete Básico | ₡15,000 | $30 | Anytime |
| Día Completo con Almuerzo | ₡20,000 | $40 | Anytime |
| Tour Privado | — | $60 | Weekdays only (Mon–Fri) |

Rules:
- Show all 3 packages as selectable cards
- If the user picks "Tour Privado" AND selects a weekend date (Sat/Sun), show an inline warning: "El tour privado solo está disponible de lunes a viernes."
- Disable/grey out the "Tour Privado" card when a weekend date is already selected (or vice versa — if "Privado" is selected, disable weekend dates in the calendar)
- The price shown in the booking summary should update dynamically based on the selected package and number of people (pax)
- PayPal order total must use the correct package price (USD)

---

### 3. Data to save
Update the reservation/booking data model and API to include:
- `tourTime`: "08:00" | "09:00" | "10:00"
- `tourPackage`: "basic" | "full-day" | "private"
- `packagePrice`: number (USD)

---

### Where to look
- Booking form component: `app/components/reservation/` (explore to find the main form)
- PayPal integration: `app/api/paypal/`
- Check how price is currently calculated and passed to PayPal

---

### Design guidelines
- Match existing Tailwind emerald/zinc color palette
- Package cards: show name, price (both CRC and USD), and a short description
- Selected state: emerald border + background tint
- Mobile responsive

---

### Delivery
- Create branch: `feature/booking-time-package`
- Commit: `feat: add time slot and package selection to booking`
- Push and open a PR to main on GitHub: emeraldcr/mvp-laviejadventures
- Title: "feat: time slots + tour packages in booking flow"
