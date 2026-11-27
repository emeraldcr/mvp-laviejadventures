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
function load(file, imports, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => name in imports ? imports[name] : require(name), ...globals });
  return module.exports.default;
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
