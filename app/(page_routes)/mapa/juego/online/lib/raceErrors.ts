export const getRaceError = (error?: string) => {
  if (error === 'room_not_found') return 'Sala no encontrada';
  if (error === 'already_started') return 'La carrera ya empezo';
  if (error === 'room_full') return 'Sala llena (max 8)';
  if (error === 'need_more_players') return 'Necesitas al menos 2 jugadores';
  return error ?? 'Error';
};
