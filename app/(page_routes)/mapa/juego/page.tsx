import type { Metadata } from 'next';
import GameClient from './GameClient';

export const metadata: Metadata = {
  title: 'Fantasma de la Ciudad Esmeralda | La Vieja Adventures',
  description: 'Juego 2.5D ambientado en el Cañón del Río La Vieja, Costa Rica.',
};

export default function JuegoPage() {
  return <GameClient />;
}
