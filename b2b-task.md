You are working on the La Vieja Adventures MVP — a Next.js 16 / TypeScript / MongoDB / Cloudflare Pages app.

## Task: Add a B2B Tour Operator Portal

Build a full B2B portal that lets tour operators, hotels, and travel agents register, log in, browse tours, and create bookings on behalf of their clients — with a commission system.

### What to build:

#### 1. Database models (in app/lib/ or lib/)
- OperatorAccount: name, company, email, password (hashed with bcrypt), status (pending/approved/active), commissionRate (%), createdAt
- OperatorBooking: operatorId, tourId, tourName, clientName, clientEmail, clientPhone, pax, date, totalPrice, commissionAmount, status (pending/confirmed/cancelled), notes, createdAt

#### 2. Auth for operators (separate from any existing auth)
- Use JWT stored in httpOnly cookie
- Pages: /b2b/login, /b2b/register
- Middleware protecting all /b2b/* routes (except login/register)
- API routes: /api/b2b/auth/login, /api/b2b/auth/register, /api/b2b/auth/logout

#### 3. Operator Dashboard (/b2b/dashboard)
- Welcome card with operator name and commission rate
- Stats: total bookings, pending, confirmed, total commission earned
- Recent bookings table

#### 4. Tour catalog for operators (/b2b/tours)
- List all available tours with B2B pricing (show retail price + commission amount they earn)
- Click to book

#### 5. Booking flow (/b2b/tours/[tourId]/book)
- Form: client name, email, phone, number of pax, preferred date, notes
- Price summary with commission breakdown
- Submit creates OperatorBooking in MongoDB

#### 6. Bookings management (/b2b/bookings)
- Table of all their bookings with status badges
- Filter by status

#### 7. Admin endpoints (protected with a secret header)
- GET /api/admin/b2b/operators — list all operators
- PATCH /api/admin/b2b/operators/[id] — approve/update an operator

### Design guidelines:
- Match the existing design system (Tailwind CSS, same color palette as the rest of the app)
- Use lucide-react for icons (already installed)
- Mobile responsive

### Notes:
- Check existing code in app/, lib/, app/components/, app/api/ and follow the same patterns
- Check .env for the MongoDB connection string and reuse it
- Do NOT break any existing functionality
- Create a new git branch called feature/b2b-portal
- Commit all changes with message: feat: add B2B tour operator portal
- Push the branch to origin
- Create a GitHub Pull Request to main with title: "feat: B2B Tour Operator Portal" and a good description

When completely finished, run this exact command:
openclaw wake --text "Done: B2B portal built and PR created in mvp-laviejadventures"
