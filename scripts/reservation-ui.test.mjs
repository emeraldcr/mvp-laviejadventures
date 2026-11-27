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
function load(file, imports) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => name in imports ? imports[name] : require(name) });
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
