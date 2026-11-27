import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(file, imports, globals = {}, exportName = 'default') {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => name in imports ? imports[name] : require(name), ...globals });
  return module.exports[exportName];
}

test('calendar only labels dates sold out after a successful availability response', () => {
  let availabilityStatus = 'loading';
  const Day = load('app/components/calendar/CalendarDay.tsx', {
    '@/lib/booking/calendar/CalendarContext': { useCalendarContext: () => ({ currentYear: 2026, currentMonth: 11, selectedDay: null, selectDay() {}, isPastDay: () => false, isToday: () => false, getSlotsForDay: () => 0, availabilityStatus }) },
    '@/lib/site/contexts/LanguageContext': { useLanguage: () => ({ lang: 'es' }) },
    '@/lib/site/translations': { translations: { es: { calendar: { statusSoldOut: 'Agotado', ariaDaySoldOut: 'Día {day}, agotado' } } } },
    '@/lib/tours/packages': { isPackageAvailableOnDate: () => true },
    '@/lib/shared/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
  });
  for (const status of ['loading', 'error']) {
    availabilityStatus = status;
    const html = renderToStaticMarkup(React.createElement(Day, { day: 20 }));
    assert.match(html, /disponibilidad sin consultar/);
    assert.doesNotMatch(html, /Agotado|agotado/);
    assert.match(html, /disabled/);
  }
  availabilityStatus = 'ready';
  assert.match(renderToStaticMarkup(React.createElement(Day, { day: 20 })), /agotado/i);
});

test('calendar keeps the requested group size when the selected date has fewer spots', async () => {
  const slots = []; let cursor = 0; const effects = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useContext: () => null,
    useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useMemo(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { value: fn(), deps }; return slots[i].value; },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'lib/booking/calendar/CalendarContext.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  const imports = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    '@/lib/site/contexts/LanguageContext': { useLanguage: () => ({ lang: 'es' }) },
    '@/lib/shared/dates/costa-rica-time': { getCostaRicaDateParts: () => ({ year: 2026, month: 12, day: 1 }), getMinBookableDateInCostaRica: () => ({ year: 2026, month: 12, day: 2 }), toDateKey: (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` },
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => imports[name], AbortController: globalThis.AbortController, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, fetch: async () => ({ ok: true, json: async () => ({ availability: { 20: 2 } }) }) });
  const render = () => { cursor = 0; const result = module.exports.CalendarProvider({ selectedTourSlug: 'tour', initialTickets: 6, children: null }); effects.splice(0).forEach(fn => fn()); return result.props.value; };
  render();
  for (let i = 0; i < 8; i++) await Promise.resolve();
  let state = render();
  assert.equal(state.availabilityStatus, 'ready');
  state.selectDay(20);
  state = render();
  assert.equal(state.selectedDay, 20);
  assert.equal(state.tickets, 6);
  assert.equal(state.getSlotsForDay(20), 2);
});

test('entering a group larger than remaining capacity preserves the requested number', () => {
  let tickets = 0;
  const useInteractions = load('app/components/reservation/hooks/useReservationInteractions.ts', {
    react: { useCallback: fn => fn },
    '@/lib/analytics/client': { trackAnalyticsEvent() {} },
    '../constants/reservationWizard': { RESERVATION_STEP_LABELS: { 1: 'schedule' } },
  }, {}, 'useReservationInteractions');
  const actions = useInteractions({ getBookingSnapshot: () => ({}), setTickets: value => { tickets = value; }, slots: 20, setHasConfirmedTickets() {} });
  actions.onTicketsChange('25');
  assert.equal(tickets, 25);
});

test('phone validation counts the country code in the server limit', () => {
  const validate = load('app/hooks/useReservationForm.ts', {
    '@/lib/booking/core/constants': { EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, PHONE_NUMBER_REGEX: /^[\d\s().-]{6,20}$/ },
  }, {}, 'isValidReservationPhone');
  assert.equal(validate('+506', '123456789012'), true);
  assert.equal(validate('+506', '1234567890123'), false);
  assert.equal(validate('+1', '12345'), false);
  assert.equal(validate('+506', '8888 8888'), true);
});

test('a single unavailable package cannot be selected', () => {
  const Picker = load('app/components/reservation/PackagePicker.tsx', {
    'lucide-react': { Check: () => null },
    '@/lib/booking/packages/pricing': { getPackageDisplayName: () => 'Paquete' },
    '@/lib/booking/packages/copy': { getPackageIncludes: () => [] },
  });
  const html = renderToStaticMarkup(React.createElement(Picker, { packages: [{ id: 'package', price: 40 }], selectedPackageId: 'package', lang: 'es', onSelect() {}, isPackageDisabled: () => true }));
  assert.match(html, /disabled/);
  assert.match(html, /No disponible esta fecha/);
});

test('checkout requires explicit acceptance before a changed total can be paid', () => {
  let total = 113; let enabled;
  const Checkout = load('app/components/reservation/InlinePayPalCheckout.tsx', {
    '@/lib/site/translations': { translations: { es: { payment: { error: 'Error', loadingPaymentInfo: 'Cargando' } } } },
    './hooks/useCheckoutQuote': { useCheckoutQuote: () => ({ total, synced: true, syncing: false, error: null, subtotal: 100, ivaRatePercent: 13, packagePrice: 50, addonsPrice: 0, addonsPricePerPerson: 0, addonsBreakdown: [], transportQuote: null }) },
    './hooks/usePayPalCheckout': { usePayPalCheckout: options => { enabled = options.enabled; return { paypalRef() {}, isPaypalLoading: false }; } },
    '@/lib/site/config': { BUSINESS_WHATSAPP_URL: 'https://wa.me/50662332535' },
    '@/lib/analytics/client': { trackAnalyticsEvent: async () => {} },
  });
  const props = { lang: 'es', onBack() {}, orderDetails: { total: 100, tickets: 2, tourName: 'Tour', date: '2026-12-20' } };
  const changed = renderToStaticMarkup(React.createElement(Checkout, props));
  assert.equal(enabled, false);
  assert.match(changed, /Acepto el nuevo total/);
  assert.match(changed, /\$100\.00/);
  assert.match(changed, /\$113\.00/);
  total = 100;
  const unchanged = renderToStaticMarkup(React.createElement(Checkout, props));
  assert.equal(enabled, true);
  assert.doesNotMatch(unchanged, /Acepto el nuevo total/);
  assert.match(unchanged, /Consultar disponibilidad y pago por WhatsApp/);
  assert.match(unchanged, /no guarda ni confirma la reserva/);
});

test('resumed checkout requires review before enabling payment', () => {
  let enabled;
  const Checkout = load('app/components/reservation/PaymentCheckoutContent.tsx', {
    'lucide-react': Object.fromEntries(['Building2', 'CalendarDays', 'Clock3', 'CreditCard', 'Mail', 'MessageCircle', 'Phone', 'ShieldCheck', 'Ticket', 'UserRound'].map(name => [name, () => null])),
    '@/lib/site/contexts/LanguageContext': { useLanguage: () => ({ lang: 'es' }) },
    '@/lib/site/translations': { translations: { es: { payment: { packages: {}, timeLabels: {}, loadingPaymentInfo: 'Cargando' } } } },
    '@/app/components/reservation/LocalPaymentOptions': { __esModule: true, default: () => React.createElement('p', null, 'Local payment actions') },
    '@/app/components/reservation/hooks/useCheckoutQuote': { useCheckoutQuote: () => ({ total: 113, synced: true, syncing: false, error: null, subtotal: 100, ivaRatePercent: 13, packagePrice: 50, addonsPrice: 0, addonsPricePerPerson: 0, addonsBreakdown: [], transportQuote: null }) },
    '@/lib/booking/addons/catalog': { ADDON_DATA: [] },
    '@/lib/booking/checkout/use-pending-booking': { usePendingBooking: () => ({ savePendingBooking() {} }) },
    '@/app/components/reservation/hooks/usePayPalCheckout': { usePayPalCheckout: options => { enabled = options.enabled; return { paypalRef() {}, isPaypalLoading: false }; } },
    '@/app/components/reservation/checkoutUtils': { buildBookingAnalyticsMetadata: () => ({}), buildCheckoutKey: value => String(value.total) },
    '@/app/components/reservation/SafetyBookingNotice': { __esModule: true, default: () => null },
    'next/link': { __esModule: true, default: ({ children }) => React.createElement('span', null, children) },
    '@/lib/site/i18n': { localizeHref: value => value },
    '@/lib/tours/policy': { BOOKING_ASSURANCE_ES: 'Sujeto a confirmación', BOOKING_ASSURANCE_EN: 'Subject to confirmation' },
  });
  const html = renderToStaticMarkup(React.createElement(Checkout, { orderDetails: { bookingAttemptId: 'attempt', name: 'Test', email: 'a@example.com', phone: '+50688888888', tickets: 2, total: 100, date: '2026-12-20', tourTime: '08:00', tourPackage: 'Package', tourName: 'Tour' }, onSuccess() {} }));
  assert.equal(enabled, false);
  assert.match(html, /Revisé los detalles y acepto el total de \$113\.00/);
  assert.match(html, /Total anterior: \$100\.00/);
  assert.doesNotMatch(html, /Local payment actions/);
});

test('WhatsApp checkout provides a direct link after saving and a fallback after failure', () => {
  const LocalOptions = load('app/components/reservation/LocalPaymentOptions.tsx', {
    'lucide-react': Object.fromEntries(['Building2', 'CheckCircle2', 'Copy', 'MessageCircle', 'Smartphone'].map(name => [name, () => null])),
    '@/lib/analytics/client': { trackAnalyticsEvent: async () => {} },
    '@/lib/booking/checkout/messages': { buildReservationWhatsAppHref: (_order, _lang, options) => `https://wa.me/50662332535?text=${encodeURIComponent(options.referenceCode || 'consulta')}` },
  });
  const props = { method: 'whatsapp', orderDetails: { total: 100 }, lang: 'es', packageLabel: 'Paquete', timeLabel: '08:00', analyticsMetadata: {}, reservationId: null, isSaving: false, savePendingBooking() {} };
  const before = renderToStaticMarkup(React.createElement(LocalOptions, { ...props, referenceCode: null, saveError: null }));
  assert.match(before, /Guardar solicitud/);
  assert.doesNotMatch(before, /Abrir WhatsApp y enviar mensaje/);
  const saved = renderToStaticMarkup(React.createElement(LocalOptions, { ...props, referenceCode: 'LVA-123', saveError: null }));
  assert.match(saved, /href="https:\/\/wa\.me\/50662332535\?text=LVA-123"/);
  assert.match(saved, /Abrir WhatsApp y enviar mensaje/);
  const failed = renderToStaticMarkup(React.createElement(LocalOptions, { ...props, referenceCode: null, saveError: 'Error' }));
  assert.match(failed, /La solicitud no se guardó/);
  assert.match(failed, /href="https:\/\/wa\.me\/50662332535\?text=consulta"/);
});

test('booking does not substitute a default tour while the requested tour is missing', () => {
  const Booking = load('app/components/sections/BookingSection.tsx', {
    '@/lib/booking/packages/pricing': { getTourPackageOptions: () => [], resolveInitialPackage: () => null },
    './UpcomingDepartures': { __esModule: true, default: () => React.createElement('p', null, 'Departures') },
    'lucide-react': { CalendarDays: () => null },
    '@/lib/site/contexts/LanguageContext': { useLanguage: () => ({ lang: 'es' }) },
    '@/lib/booking/calendar/CalendarContext': { useCalendarContext: () => ({ selectedDay: 20, availability: { 20: 5 }, availabilityStatus: 'ready' }) },
    '@/app/components/sections/CalendarSection': { __esModule: true, default: () => null },
    '@/app/components/sections/ReservationSection': { __esModule: true, default: () => React.createElement('p', null, 'Reservation form') },
    'next/link': { __esModule: true, default: ({ children }) => React.createElement('span', null, children) },
    '@/lib/site/i18n': { localizeHref: value => value },
    '@/lib/site/config': { BUSINESS_WHATSAPP_URL: 'https://wa.me/50662332535' },
  });
  const props = { selectedTourSlug: 'requested-tour', tour: null, tours: [], ivaRatePercent: 13, retryCatalog() {} };
  const missing = renderToStaticMarkup(React.createElement(Booking, { ...props, catalogStatus: 'ready' }));
  assert.match(missing, /No encontramos el tour solicitado/);
  assert.doesNotMatch(missing, /Reservation form|Departures/);
  const loading = renderToStaticMarkup(React.createElement(Booking, { ...props, catalogStatus: 'loading' }));
  assert.match(loading, /Cargando su experiencia/);
  assert.doesNotMatch(loading, /Reservation form|Departures/);
});

test('upcoming departures distinguishes a lookup failure from no matching dates', () => {
  let result = { key: 'tour:2026-12-02:0', days: [], failed: true };
  let stateIndex = 0;
  const Upcoming = load('app/components/sections/UpcomingDepartures.tsx', {
    react: { useState: () => [stateIndex++ % 2 === 0 ? result : 0, () => {}], useMemo: fn => fn(), useEffect() {} },
    '@/lib/booking/calendar/CalendarContext': { useCalendarContext: () => ({ tickets: 4, setSelectedDate() {} }) },
    '@/lib/booking/packages/pricing': { getTourPackageOptions: () => [], resolveInitialPackage: () => null },
    '@/lib/shared/dates/costa-rica-time': { getMinBookableIsoDateInCostaRica: () => '2026-12-02' },
    '@/lib/tours/packages': { isPackageAvailableOnDate: () => true },
    '@/lib/site/config': { BUSINESS_WHATSAPP_URL: 'https://wa.me/50662332535' },
  });
  const props = { tour: { slug: 'tour', titleEs: 'Tour', titleEn: 'Tour' }, lang: 'es', onChoosePackage() {} };
  const failed = renderToStaticMarkup(React.createElement(Upcoming, props));
  assert.match(failed, /No pudimos consultar las próximas salidas/);
  assert.match(failed, /Reintentar/);
  result = { ...result, failed: false };
  const empty = renderToStaticMarkup(React.createElement(Upcoming, props));
  assert.match(empty, /No encontramos fechas para 4 personas/);
  assert.match(empty, /Consultar por WhatsApp/);
});
