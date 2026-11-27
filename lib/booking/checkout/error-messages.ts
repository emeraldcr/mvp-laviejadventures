const messages: Record<string, { es: string; en: string }> = {
  capacity: { es: "Ya no hay cupos suficientes para este grupo en la fecha elegida. Cambie la fecha o consulte al equipo.", en: "There are no longer enough spots for this group on that date. Change the date or contact the team." },
  invalid_tickets: { es: "Revise la cantidad de personas o consulte al equipo para un grupo grande.", en: "Check the number of guests or contact the team about a large group." },
  invalid_contact: { es: "Revise el nombre, correo y teléfono del viajero antes de continuar.", en: "Check the traveler's name, email and phone before continuing." },
  invalid_time: { es: "El horario elegido ya no está disponible. Vuelva a elegir un horario o consulte al equipo.", en: "The selected time is no longer available. Choose another time or contact the team." },
  invalid_date: { es: "No pudimos validar la fecha. Elija otra fecha o consulte al equipo.", en: "We couldn't validate the date. Choose another date or contact the team." },
  package_unavailable: { es: "El paquete elegido ya no está disponible. Elija otro o consulte al equipo.", en: "The selected package is no longer available. Choose another or contact the team." },
  package_schedule: { es: "El paquete elegido no opera en esta fecha. Cambie la fecha o el paquete.", en: "The selected package does not operate on this date. Change the date or package." },
  addon_config: { es: "Revise los datos de los servicios extra o consulte al equipo.", en: "Check the add-on details or contact the team." },
  addon_pricing: { es: "No pudimos validar el precio de los servicios extra. Intente de nuevo o consulte al equipo.", en: "We couldn't validate the add-on price. Try again or contact the team." },
  total_mismatch: { es: "El total cambió antes del pago. Vuelva a revisar la reserva.", en: "The total changed before payment. Please review the booking again." },
  booking_context_missing: { es: "No pudimos verificar la reserva antes de cobrar. Intente de nuevo o consulte al equipo.", en: "We couldn't verify the booking before charging. Try again or contact the team." },
  capture_validation_unavailable: { es: "No pudimos verificar la reserva antes de cobrar. Intente de nuevo o consulte al equipo.", en: "We couldn't verify the booking before charging. Try again or contact the team." },
  pending_details_changed: { es: "Esta solicitud ya tiene una referencia con datos distintos. Consulte al equipo antes de pagar o crear otra solicitud.", en: "This request already has a reference with different details. Contact the team before paying or creating another request." },
};

export function checkoutErrorMessage(code: unknown, lang: string): string {
  const language = lang === "es" ? "es" : "en";
  return (typeof code === "string" ? messages[code]?.[language] : null) ?? (language === "es" ? "No pudimos validar la reserva. Intente de nuevo o consulte al equipo." : "We couldn't validate the booking. Try again or contact the team.");
}
