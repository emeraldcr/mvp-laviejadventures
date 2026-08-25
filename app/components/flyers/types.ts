import type { LucideIcon } from "lucide-react";
import type { Copy } from "../rotulos/types";

/**
 * Publicación cuadrada (1080 × 1080) para Instagram. Reutiliza el mismo
 * lienzo editable de los rótulos: cada campo de texto vive en un
 * MovableGroup que se puede mover, redimensionar o eliminar.
 */

export type FlyerAccent = {
  /** Color de fondo de la insignia y del botón de llamado a la acción. */
  bg: string;
  /** Color de texto con contraste garantizado sobre `bg`. */
  text: string;
  /** Tinte translúcido usado para graduar la fotografía con el color de marca. */
  wash?: string;
};

export type Flyer = {
  id: number;
  code: string;
  /** Identidad estable del lienzo; conserva posiciones aunque cambie el orden. */
  layoutId: string;
  icon: LucideIcon;
  accent: FlyerAccent;
  kicker: string;
  title: string;
  titleEn: string;
  subtitle: string;
  cta: Copy;
  photo: string;
  /** Solo la publicación de reserva incluye el código QR de contacto. */
  showQr?: boolean;
  /** Cañón, rappel o río: exige la nota de clima/guía del contenido turístico. */
  weatherDependent?: boolean;
};
