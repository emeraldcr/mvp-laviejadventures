"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  BRANCHES,
  FREE_SHIPPING_THRESHOLD,
  money,
  WHATSAPP,
  type Product,
} from "./data";
import { PartArt } from "./PartArt";

export type CartLine = { product: Product; qty: number };

type Step = "cart" | "entrega" | "pago" | "listo";

type DeliveryOption = {
  id: "retiro" | "gam" | "nacional" | "encomienda";
  label: string;
  desc: string;
  price: number;
  eta: string;
  icon: typeof Truck;
};

const DELIVERY: DeliveryOption[] = [
  {
    id: "retiro",
    label: "Retiro en sucursal",
    desc: "Listo en 2 horas dentro del horario de tienda",
    price: 0,
    eta: "Hoy",
    icon: Store,
  },
  {
    id: "gam",
    label: "Envío GAM exprés",
    desc: "Gran Área Metropolitana, 24–48 h",
    price: 2500,
    eta: "24–48 h",
    icon: Truck,
  },
  {
    id: "nacional",
    label: "Envío nacional · Correos de Costa Rica",
    desc: "Todo el país, 2–5 días hábiles",
    price: 3900,
    eta: "2–5 días",
    icon: Truck,
  },
  {
    id: "encomienda",
    label: "Encomienda de bus",
    desc: "Mismo día a cabeceras de cantón",
    price: 2000,
    eta: "Mismo día",
    icon: Truck,
  },
];

type PaymentOption = {
  id: "sinpe" | "tarjeta" | "transferencia" | "contra";
  label: string;
  desc: string;
  icon: typeof CreditCard;
};

const PAYMENT: PaymentOption[] = [
  {
    id: "sinpe",
    label: "SINPE Móvil",
    desc: "Transferí al 8888-8888 (TRAA Repuestos S.A.) y adjuntá el comprobante",
    icon: Smartphone,
  },
  {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito",
    desc: "Visa, Mastercard y AMEX · pago con 3-D Secure",
    icon: CreditCard,
  },
  {
    id: "transferencia",
    label: "Transferencia o SINPE a cuenta IBAN",
    desc: "BAC / Banco Nacional · CR00 0000 0000 0000 0000 00",
    icon: Building2,
  },
  {
    id: "contra",
    label: "Pago contra entrega",
    desc: "Efectivo o datáfono al recibir · solo retiro y GAM",
    icon: Banknote,
  },
];

const STEP_LABELS: Record<Exclude<Step, "listo">, string> = {
  cart: "Carrito",
  entrega: "Entrega",
  pago: "Pago",
};

export function CheckoutDrawer({
  open,
  onClose,
  lines,
  onQty,
  onRemove,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [step, setStep] = useState<Step>("cart");
  const [deliveryId, setDeliveryId] = useState<DeliveryOption["id"] | null>(null);
  const [paymentId, setPaymentId] = useState<PaymentOption["id"] | null>(null);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [addr, setAddr] = useState({
    nombre: "",
    telefono: "",
    provincia: "",
    canton: "",
    direccion: "",
  });
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [done, setDone] = useState<null | {
    orderId: string;
    total: number;
    delivery: DeliveryOption;
    payment: PaymentOption;
  }>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.qty, 0),
    [lines],
  );
  const delivery = DELIVERY.find((d) => d.id === deliveryId) ?? null;
  const shippingFree =
    !!delivery &&
    (delivery.id === "retiro" ||
      (delivery.id === "nacional" && subtotal >= FREE_SHIPPING_THRESHOLD));
  const shipping = !delivery ? 0 : shippingFree ? 0 : delivery.price;
  const total = subtotal + shipping;
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // reinicia el flujo cada vez que se abre
  useEffect(() => {
    if (open) {
      setStep("cart");
      setDone(null);
    }
  }, [open]);

  // "contra entrega" deja de ser válido si cambian a un envío que no lo admite
  useEffect(() => {
    if (paymentId === "contra" && !(deliveryId === "retiro" || deliveryId === "gam")) {
      setPaymentId(null);
    }
  }, [deliveryId, paymentId]);

  // bloqueo de scroll + Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const needsAddress = delivery && delivery.id !== "retiro";
  const entregaReady =
    !!delivery &&
    (delivery.id === "retiro"
      ? !!branch
      : !!(addr.nombre && addr.telefono && addr.provincia && addr.canton && addr.direccion));
  const pagoReady =
    !!paymentId &&
    (paymentId !== "tarjeta" ||
      (card.num.replace(/\s/g, "").length >= 15 && card.exp.length >= 4 && card.cvc.length >= 3)) &&
    (paymentId !== "contra" || (deliveryId === "retiro" || deliveryId === "gam"));

  function confirm() {
    if (!delivery || !paymentId) return;
    const payment = PAYMENT.find((p) => p.id === paymentId)!;
    const orderId = `TRAA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const text = encodeURIComponent(
      [
        `Pedido ${orderId} — TRAA Repuestos (demo)`,
        "",
        ...lines.map((l) => `• ${l.qty}× ${l.product.name} [${l.product.id}] — ${money(l.product.price * l.qty)}`),
        "",
        `Subtotal: ${money(subtotal)}`,
        `Entrega: ${delivery.label}${shippingFree ? " (gratis)" : ` — ${money(shipping)}`}`,
        delivery.id === "retiro"
          ? `Sucursal: ${branch}`
          : `Envío a: ${addr.nombre}, ${addr.direccion}, ${addr.canton}, ${addr.provincia} — tel ${addr.telefono}`,
        `Pago: ${payment.label}`,
        `TOTAL: ${money(total)}`,
      ].join("\n"),
    );
    setDone({ orderId, total, delivery, payment });
    setStep("listo");
    onClear();
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <button className="tr-overlay" aria-label="Cerrar" onClick={onClose} />
      <div
        ref={drawerRef}
        className="tr-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito y pago"
      >
        <div className="tr-drawer-head">
          {step !== "cart" && step !== "listo" && (
            <button
              className="tr-x"
              onClick={() => setStep(step === "pago" ? "entrega" : "cart")}
              aria-label="Volver"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h2>{step === "listo" ? "Pedido confirmado" : "Tu pedido"}</h2>
          <button className="tr-x" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {step !== "listo" && (
          <div className="tr-steps" aria-hidden="true">
            {(["cart", "entrega", "pago"] as const).map((s, i) => {
              const order = ["cart", "entrega", "pago"];
              const cur = order.indexOf(step);
              return (
                <span
                  key={s}
                  className={s === step ? "is-active" : i < cur ? "is-done" : undefined}
                >
                  {i + 1}. {STEP_LABELS[s]}
                  {i < 2 ? "  ·" : ""}
                </span>
              );
            })}
          </div>
        )}

        <div className="tr-drawer-body">
          {/* ---------- PASO CARRITO ---------- */}
          {step === "cart" &&
            (lines.length === 0 ? (
              <div className="tr-empty-cart">
                <ShoppingCart size={30} />
                <p>Tu carrito está vacío.</p>
                <p className="tr-hint">
                  Agregá repuestos del catálogo y volvé para pagar y programar el envío.
                </p>
              </div>
            ) : (
              lines.map((l) => (
                <div className="tr-cline" key={l.product.id}>
                  <div className="tr-cline-img">
                    <PartArt category={l.product.category} />
                  </div>
                  <div>
                    <h4>{l.product.name}</h4>
                    <div className="tr-cline-brand">
                      {l.product.brand} · {l.product.id}
                    </div>
                    <div className="tr-qty">
                      <button onClick={() => onQty(l.product.id, -1)} aria-label="Menos">
                        <Minus size={13} />
                      </button>
                      <span>{l.qty}</span>
                      <button onClick={() => onQty(l.product.id, 1)} aria-label="Más">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span className="tr-cline-price">{money(l.product.price * l.qty)}</span>
                    <button
                      className="tr-del"
                      onClick={() => onRemove(l.product.id)}
                      aria-label={`Quitar ${l.product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            ))}

          {/* ---------- PASO ENTREGA ---------- */}
          {step === "entrega" && (
            <>
              <div className="tr-section-label">¿Cómo lo recibís?</div>
              {DELIVERY.map((d) => {
                const Icon = d.icon;
                const free = d.id === "retiro" || (d.id === "nacional" && subtotal >= FREE_SHIPPING_THRESHOLD);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`tr-opt${deliveryId === d.id ? " is-active" : ""}`}
                    onClick={() => setDeliveryId(d.id)}
                  >
                    <Icon className="tr-opt-ico" size={18} />
                    <span className="tr-opt-main">
                      <span className="tr-opt-t">{d.label}</span>
                      <span className="tr-opt-d">
                        {d.desc} · llega {d.eta}
                      </span>
                    </span>
                    <span className={`tr-opt-price${free ? " is-free" : ""}`}>
                      {free ? "Gratis" : money(d.price)}
                    </span>
                  </button>
                );
              })}

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="tr-hint">
                  Te faltan {money(FREE_SHIPPING_THRESHOLD - subtotal)} para envío nacional gratis.
                </p>
              )}

              {delivery?.id === "retiro" && (
                <label className="tr-field">
                  <span>Sucursal para retiro</span>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {needsAddress && (
                <>
                  <label className="tr-field">
                    <span>Nombre de quien recibe</span>
                    <input
                      value={addr.nombre}
                      onChange={(e) => setAddr({ ...addr, nombre: e.target.value })}
                      placeholder="Nombre y apellidos"
                    />
                  </label>
                  <div className="tr-grid2">
                    <label className="tr-field">
                      <span>Teléfono</span>
                      <input
                        value={addr.telefono}
                        onChange={(e) => setAddr({ ...addr, telefono: e.target.value })}
                        placeholder="8888-8888"
                        inputMode="tel"
                      />
                    </label>
                    <label className="tr-field">
                      <span>Provincia</span>
                      <input
                        value={addr.provincia}
                        onChange={(e) => setAddr({ ...addr, provincia: e.target.value })}
                        placeholder="San José"
                      />
                    </label>
                  </div>
                  <label className="tr-field">
                    <span>Cantón / distrito</span>
                    <input
                      value={addr.canton}
                      onChange={(e) => setAddr({ ...addr, canton: e.target.value })}
                      placeholder="Desamparados, San Rafael"
                    />
                  </label>
                  <label className="tr-field">
                    <span>Dirección exacta</span>
                    <input
                      value={addr.direccion}
                      onChange={(e) => setAddr({ ...addr, direccion: e.target.value })}
                      placeholder="200 m sur del super, casa portón negro"
                    />
                  </label>
                </>
              )}
            </>
          )}

          {/* ---------- PASO PAGO ---------- */}
          {step === "pago" && (
            <>
              <div className="tr-section-label">Método de pago</div>
              {PAYMENT.map((p) => {
                const Icon = p.icon;
                const blocked = p.id === "contra" && !(deliveryId === "retiro" || deliveryId === "gam");
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={blocked}
                    className={`tr-opt${paymentId === p.id ? " is-active" : ""}`}
                    style={blocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                    onClick={() => !blocked && setPaymentId(p.id)}
                  >
                    <Icon className="tr-opt-ico" size={18} />
                    <span className="tr-opt-main">
                      <span className="tr-opt-t">{p.label}</span>
                      <span className="tr-opt-d">
                        {blocked ? "Disponible solo con retiro o envío GAM" : p.desc}
                      </span>
                    </span>
                  </button>
                );
              })}

              {paymentId === "tarjeta" && (
                <>
                  <label className="tr-field">
                    <span>Número de tarjeta</span>
                    <input
                      value={card.num}
                      onChange={(e) => setCard({ ...card, num: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                    />
                  </label>
                  <div className="tr-grid2">
                    <label className="tr-field">
                      <span>Vence (MM/AA)</span>
                      <input
                        value={card.exp}
                        onChange={(e) => setCard({ ...card, exp: e.target.value })}
                        placeholder="09/28"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="tr-field">
                      <span>CVC</span>
                      <input
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                        placeholder="123"
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                  <p className="tr-hint">
                    Demostración: no se envía a ninguna pasarela ni se realiza ningún cobro.
                  </p>
                </>
              )}

              {paymentId === "sinpe" && (
                <p className="tr-hint">
                  Al confirmar te pasamos el detalle por WhatsApp. Hacé el SINPE Móvil al
                  <b> 8888-8888</b> por {money(total)} y respondé con la foto del comprobante;
                  despachamos apenas se acredita.
                </p>
              )}
              {paymentId === "transferencia" && (
                <p className="tr-hint">
                  Cuenta IBAN <b>CR00 0000 0000 0000 0000 00</b> — BAC / Banco Nacional, a
                  nombre de TRAA Repuestos S.A. Enviá el comprobante por WhatsApp al confirmar.
                </p>
              )}
            </>
          )}

          {/* ---------- PASO LISTO ---------- */}
          {step === "listo" && done && (
            <div className="tr-success">
              <div className="tr-check">
                <CheckCircle2 size={30} />
              </div>
              <h3>¡Gracias por tu compra!</h3>
              <div className="tr-order-id">{done.orderId}</div>
              <dl>
                <dt>Total</dt>
                <dd>{money(done.total)}</dd>
                <dt>Entrega</dt>
                <dd>
                  {done.delivery.label} · {done.delivery.eta}
                </dd>
                <dt>Pago</dt>
                <dd>{done.payment.label}</dd>
              </dl>
              <p className="tr-hint" style={{ marginTop: 16 }}>
                Te abrimos WhatsApp con el resumen para enviar el comprobante. Esto es una
                demostración: no se procesó ningún cobro real.
              </p>
            </div>
          )}
        </div>

        {/* ---------- PIE ---------- */}
        <div className="tr-drawer-foot">
          {step === "cart" && lines.length > 0 && (
            <>
              <div className="tr-summary" style={{ marginBottom: 12 }}>
                <div className="tr-row">
                  <span>Subtotal ({itemCount} art.)</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="tr-row">
                  <span>Envío</span>
                  <span>Se calcula en el siguiente paso</span>
                </div>
              </div>
              <button className="tr-btn tr-btn--primary tr-btn--block" onClick={() => setStep("entrega")}>
                Continuar a entrega
              </button>
            </>
          )}

          {step === "entrega" && (
            <>
              <div className="tr-summary" style={{ marginBottom: 12 }}>
                <div className="tr-row">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className={`tr-row${shippingFree ? " is-free" : ""}`}>
                  <span>Envío {delivery ? `· ${delivery.label.split(" · ")[0]}` : ""}</span>
                  <span>{!delivery ? "—" : shippingFree ? "Gratis" : money(shipping)}</span>
                </div>
                <div className="tr-total">
                  <span>Total</span>
                  <b>{money(total)}</b>
                </div>
              </div>
              <button
                className="tr-btn tr-btn--primary tr-btn--block"
                disabled={!entregaReady}
                onClick={() => setStep("pago")}
              >
                Continuar a pago
              </button>
            </>
          )}

          {step === "pago" && (
            <>
              <div className="tr-summary" style={{ marginBottom: 12 }}>
                <div className="tr-row">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className={`tr-row${shippingFree ? " is-free" : ""}`}>
                  <span>Envío</span>
                  <span>{shippingFree ? "Gratis" : money(shipping)}</span>
                </div>
                <div className="tr-row">
                  <span>IVA</span>
                  <span>Incluido</span>
                </div>
                <div className="tr-total">
                  <span>Total a pagar</span>
                  <b>{money(total)}</b>
                </div>
              </div>
              <button
                className="tr-btn tr-btn--primary tr-btn--block"
                disabled={!pagoReady}
                onClick={confirm}
              >
                <Package size={16} /> Confirmar pedido · {money(total)}
              </button>
              <p className="tr-hint" style={{ marginTop: 10, textAlign: "center" }}>
                Demo — no se realiza ningún cobro real.
              </p>
            </>
          )}

          {step === "listo" && (
            <button className="tr-btn tr-btn--ghost tr-btn--block" onClick={onClose}>
              Seguir comprando
            </button>
          )}
        </div>
      </div>
    </>
  );
}
