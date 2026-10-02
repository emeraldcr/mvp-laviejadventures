from pathlib import Path
from math import atan2, cos, sin, pi

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "xtreme-trainer-os-diagramas.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = landscape(A4)

BG = HexColor("#FFFFFF")
PANEL = HexColor("#F7F9FA")
PANEL_2 = HexColor("#EDF2F5")
TEXT = HexColor("#172129")
MUTED = HexColor("#53636F")
LINE = HexColor("#BCC8CF")
CYAN = HexColor("#007F9D")
LIME = HexColor("#668000")
ORANGE = HexColor("#B65A00")
RED = HexColor("#A72D39")

FONT_REG = "SegoeUI"
FONT_BOLD = "SegoeUI-Bold"
FONT_LIGHT = "SegoeUI-Light"

pdfmetrics.registerFont(TTFont(FONT_REG, r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BOLD, r"C:\Windows\Fonts\segoeuib.ttf"))
pdfmetrics.registerFont(TTFont(FONT_LIGHT, r"C:\Windows\Fonts\segoeuil.ttf"))


def wrap(text, font, size, width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(c, text, x, y, width, size=10, color=TEXT, font=FONT_REG,
              leading=None, align="left", max_lines=None):
    leading = leading or size * 1.28
    lines = wrap(text, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    for index, line in enumerate(lines):
        yy = y - index * leading
        c.setFont(font, size)
        c.setFillColor(color)
        if align == "center":
            c.drawCentredString(x + width / 2, yy, line)
        elif align == "right":
            c.drawRightString(x + width, yy, line)
        else:
            c.drawString(x, yy, line)
    return y - len(lines) * leading


def pill(c, text, x, y, color=CYAN):
    c.setFont(FONT_BOLD, 7.5)
    width = pdfmetrics.stringWidth(text, FONT_BOLD, 7.5) + 18
    c.setFillColor(color)
    c.roundRect(x, y - 6, width, 17, 8.5, fill=1, stroke=0)
    c.setFillColor(BG)
    c.drawCentredString(x + width / 2, y, text)
    return width


def page_header(c, number, title, subtitle):
    c.setFillColor(BG)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    pill(c, f"DIAGRAMA {number} DE 4", 34, PAGE_H - 34, CYAN)
    c.setFont(FONT_BOLD, 22)
    c.setFillColor(TEXT)
    c.drawString(34, PAGE_H - 77, title)
    draw_text(c, subtitle, 34, PAGE_H - 98, PAGE_W - 68, 10, MUTED, FONT_REG)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.line(34, PAGE_H - 118, PAGE_W - 34, PAGE_H - 118)


def footer(c, page, note="Estado actual del programa - septiembre de 2026"):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(34, 31, PAGE_W - 34, 31)
    c.setFillColor(MUTED)
    c.setFont(FONT_REG, 7.5)
    c.drawString(34, 17, note)
    c.drawRightString(PAGE_W - 34, 17, f"Xtreme Trainer OS  |  {page}/4")


def node(c, x, y, w, h, title, body="", accent=CYAN, number=None, center=False,
         fill=PANEL, dashed=False):
    c.setFillColor(fill)
    c.setStrokeColor(accent)
    c.setLineWidth(1.6)
    if dashed:
        c.setDash(4, 3)
    c.roundRect(x, y, w, h, 10, fill=1, stroke=1)
    c.setDash()
    tx = x + 14
    tw = w - 28
    if number is not None:
        c.setFillColor(accent)
        c.circle(x + 18, y + h - 18, 10, fill=1, stroke=0)
        c.setFont(FONT_BOLD, 8)
        c.setFillColor(BG)
        c.drawCentredString(x + 18, y + h - 21, str(number))
        tx = x + 34
        tw = w - 48
    title_y = y + h - 22
    draw_text(c, title, tx, title_y, tw, 10.5, TEXT, FONT_BOLD,
              align="center" if center else "left", max_lines=2)
    if body:
        draw_text(c, body, x + 14, y + h - 48, w - 28, 8.5, MUTED, FONT_REG,
                  align="center" if center else "left", max_lines=3)


def arrow(c, x1, y1, x2, y2, color=CYAN, width=1.5, dashed=False, label=None,
          label_dx=0, label_dy=5):
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(width)
    if dashed:
        c.setDash(5, 4)
    c.line(x1, y1, x2, y2)
    c.setDash()
    angle = atan2(y2 - y1, x2 - x1)
    size = 6
    p1 = (x2, y2)
    p2 = (x2 - size * cos(angle - pi / 6), y2 - size * sin(angle - pi / 6))
    p3 = (x2 - size * cos(angle + pi / 6), y2 - size * sin(angle + pi / 6))
    path = c.beginPath()
    path.moveTo(*p1)
    path.lineTo(*p2)
    path.lineTo(*p3)
    path.close()
    c.drawPath(path, fill=1, stroke=0)
    if label:
        mx = (x1 + x2) / 2 + label_dx
        my = (y1 + y2) / 2 + label_dy
        c.setFont(FONT_BOLD, 7.5)
        c.setFillColor(color)
        c.drawCentredString(mx, my, label)


def actor(c, x, y, label, color=CYAN):
    c.setStrokeColor(color)
    c.setLineWidth(2)
    c.circle(x, y + 34, 9, fill=0, stroke=1)
    c.line(x, y + 25, x, y - 4)
    c.line(x - 15, y + 14, x + 15, y + 14)
    c.line(x, y - 4, x - 13, y - 24)
    c.line(x, y - 4, x + 13, y - 24)
    draw_text(c, label, x - 45, y - 39, 90, 9, TEXT, FONT_BOLD, align="center", max_lines=2)


def ellipse_case(c, x, y, w, h, title, color=CYAN):
    c.setFillColor(PANEL)
    c.setStrokeColor(color)
    c.setLineWidth(1.4)
    c.ellipse(x, y, x + w, y + h, fill=1, stroke=1)
    lines = wrap(title, FONT_BOLD, 9, w - 24)
    start_y = y + h / 2 + (len(lines) - 1) * 5 - 3
    for i, line in enumerate(lines):
        c.setFont(FONT_BOLD, 9)
        c.setFillColor(TEXT)
        c.drawCentredString(x + w / 2, start_y - i * 11, line)


def activity_page(c):
    page_header(c, 1, "Diagrama de actividad", "El recorrido completo: la entrenadora prepara, la persona entrena y el resultado regresa.")

    lane_y = [388, 257, 126]
    lane_labels = [("ENTRENADORA", CYAN), ("CUADERNO DIGITAL", LIME), ("PERSONA SOCIA", ORANGE)]
    for y, (label, color) in zip(lane_y, lane_labels):
        c.setFillColor(PANEL_2)
        c.roundRect(34, y, 102, 98, 8, fill=1, stroke=0)
        c.setFillColor(color)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(85, y + 51, label)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.7)
        c.line(148, y + 49, PAGE_W - 34, y + 49)

    xs = [164, 326, 488, 650]
    node(c, xs[0], 402, 140, 70, "Entra con código", "Acceso solo para entrenadora.", CYAN, 1)
    node(c, xs[1], 402, 140, 70, "Escoge a la persona", "Ve meta, prioridad e historial.", CYAN, 2)
    node(c, xs[2], 402, 140, 70, "Prepara la rutina", "Días, máquinas, series, peso y tiempo.", CYAN, 3)
    node(c, xs[3], 402, 140, 70, "Guarda el plan", "También queda una huella de auditoría.", CYAN, 4)
    for a, b in zip(xs, xs[1:]):
        arrow(c, a + 140, 437, b, 437, CYAN)

    node(c, 244, 272, 170, 70, "Plan personal guardado", "La información queda en el mismo registro de la persona.", LIME, 5, center=True)
    node(c, 463, 272, 170, 70, "Aviso en el teléfono", "Member OS muestra la nueva rutina.", LIME, 6, center=True)
    arrow(c, 720, 402, 720, 357, LIME)
    arrow(c, 720, 357, 633, 307, LIME)
    arrow(c, 463, 307, 414, 307, LIME)

    node(c, 650, 140, 140, 70, "Ve su rutina", "Puede abrir la guía de cada máquina.", ORANGE, 7)
    node(c, 488, 140, 140, 70, "Hace el ejercicio", "Sigue las indicaciones del plan.", ORANGE, 8)
    node(c, 326, 140, 140, 70, "Anota lo realizado", "Series, repeticiones, peso o tiempo.", ORANGE, 9)
    node(c, 164, 140, 140, 70, "Finaliza y guarda", "El progreso vuelve al cuaderno digital.", ORANGE, 10)
    for a, b in zip(reversed(xs[1:]), reversed(xs[:-1])):
        arrow(c, a, 175, b + 140, 175, ORANGE)

    arrow(c, 234, 210, 280, 272, LIME)
    arrow(c, 329, 342, 350, 402, CYAN, label="La entrenadora lo revisa", label_dx=58, label_dy=-4)

    c.setFillColor(ORANGE)
    c.roundRect(488, 91, 302, 27, 7, fill=1, stroke=0)
    c.setFont(FONT_BOLD, 8)
    c.setFillColor(BG)
    c.drawCentredString(639, 100, "El QR abre la guía; aún no registra automáticamente el ejercicio.")
    footer(c, 1)
    c.showPage()


def use_case_page(c):
    page_header(c, 2, "Diagrama de casos de uso", "Quién usa el programa y para qué lo usa, explicado sin lenguaje técnico.")

    boundary_x, boundary_y, boundary_w, boundary_h = 185, 75, 472, 380
    c.setFillColor(PANEL_2)
    c.setStrokeColor(LINE)
    c.setLineWidth(1.2)
    c.roundRect(boundary_x, boundary_y, boundary_w, boundary_h, 14, fill=1, stroke=1)
    pill(c, "XTREME TRAINER OS + MEMBER OS", boundary_x + 16, boundary_y + boundary_h - 24, LIME)

    actor(c, 88, 335, "Entrenadora", CYAN)
    actor(c, 754, 335, "Persona socia", ORANGE)
    actor(c, 754, 145, "Máquina física / QR", LIME)

    cases = {
        "members": (215, 340, 180, 62, "Buscar persona y ver prioridades", CYAN),
        "plan": (215, 250, 180, 62, "Crear o ajustar la rutina", CYAN),
        "classes": (215, 160, 180, 62, "Gestionar clases y asistentes", CYAN),
        "results": (215, 90, 180, 52, "Revisar progreso y medidas", CYAN),
        "receive": (447, 340, 180, 62, "Recibir el plan personal", ORANGE),
        "perform": (447, 250, 180, 62, "Registrar lo que hizo", ORANGE),
        "guide": (447, 160, 180, 62, "Ver fotos, video e instrucciones", LIME),
        "save": (447, 90, 180, 52, "Guardar y retomar el avance", ORANGE),
    }
    for x, y, w, h, text, color in cases.values():
        ellipse_case(c, x, y, w, h, text, color)

    for target in ("members", "plan", "classes", "results"):
        x, y, w, h, *_ = cases[target]
        c.setStrokeColor(CYAN)
        c.setLineWidth(1)
        c.line(118, 349, x, y + h / 2)

    for target in ("receive", "perform", "guide", "save"):
        x, y, w, h, *_ = cases[target]
        c.setStrokeColor(ORANGE if target != "guide" else LIME)
        c.setLineWidth(1)
        c.line(724, 349, x + w, y + h / 2)

    x, y, w, h, *_ = cases["guide"]
    c.setStrokeColor(LIME)
    c.setDash(5, 4)
    c.line(724, 159, x + w, y + h / 2)
    c.setDash()

    arrow(c, 395, 281, 447, 281, LIME, label="plan compartido", label_dy=7)
    arrow(c, 447, 276, 395, 116, LIME, label="resultado", label_dx=-8, label_dy=8)

    c.setFillColor(PANEL)
    c.roundRect(34, 71, 125, 72, 8, fill=1, stroke=0)
    draw_text(c, "Idea clave", 48, 124, 97, 9, LIME, FONT_BOLD)
    draw_text(c, "El sistema conecta personas, planes y guías; no sustituye la supervisión segura.", 48, 106, 97, 8, MUTED, FONT_REG, max_lines=4)
    footer(c, 2)
    c.showPage()


def requirement_column(c, x, y, w, h, title, color, items):
    c.setFillColor(PANEL)
    c.setStrokeColor(color)
    c.setLineWidth(1.4)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=1)
    c.setFillColor(color)
    c.roundRect(x, y + h - 45, w, 45, 12, fill=1, stroke=0)
    c.rect(x, y + h - 45, w, 13, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont(FONT_BOLD, 11)
    c.drawCentredString(x + w / 2, y + h - 28, title)
    item_y = y + h - 68
    for index, item in enumerate(items, 1):
        c.setFillColor(color)
        c.circle(x + 18, item_y + 2, 7, fill=1, stroke=0)
        c.setFillColor(BG)
        c.setFont(FONT_BOLD, 6.5)
        c.drawCentredString(x + 18, item_y, str(index))
        item_y = draw_text(c, item, x + 32, item_y + 6, w - 46, 8.5, TEXT, FONT_REG, max_lines=3) - 10


def requirements_page(c):
    page_header(c, 3, "Diagrama de requisitos", "Lo que el programa debe hacer y las reglas que protegen a las personas y sus datos.")

    node(c, 255, 422, 332, 64, "Objetivo central", "Guiar entrenamientos personales y devolver resultados claros a la entrenadora.", LIME, center=True)

    col_y, col_h, col_w = 113, 275, 236
    xs = [34, 303, 572]
    centers = [x + col_w / 2 for x in xs]
    for center, color in zip(centers, (CYAN, ORANGE, LIME)):
        arrow(c, 421, 422, center, col_y + col_h, color)

    requirement_column(c, xs[0], col_y, col_w, col_h, "PARA LA ENTRENADORA", CYAN, [
        "Entrar con una sesión de entrenadora protegida.",
        "Buscar personas y detectar quién necesita atención.",
        "Crear planes con días, máquinas, series, peso y tiempo.",
        "Gestionar clases y revisar asistentes.",
        "Ver entrenamientos, progreso y mediciones recientes.",
    ])
    requirement_column(c, xs[1], col_y, col_w, col_h, "PARA LA PERSONA SOCIA", ORANGE, [
        "Recibir el plan asignado en Member OS.",
        "Ver la guía de la máquina con fotos o video disponible.",
        "Registrar series, repeticiones, peso, tiempo y notas.",
        "Guardar, retomar, terminar o cancelar una sesión.",
        "Ver su avance sin perder registros anteriores.",
    ])
    requirement_column(c, xs[2], col_y, col_w, col_h, "DATOS Y SEGURIDAD", LIME, [
        "Guardar el plan y los resultados en el registro correcto.",
        "No reemplazar un plan mientras existe un entreno activo.",
        "Registrar quién guardó el plan mediante auditoría.",
        "Identificar cada equipo físico con un assetId estable.",
        "Bloquear equipos fuera de servicio al consultarlos.",
    ])

    c.setFillColor(ORANGE)
    c.roundRect(34, 65, PAGE_W - 68, 29, 7, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont(FONT_BOLD, 8.5)
    c.drawCentredString(PAGE_W / 2, 75, "PENDIENTE: integrar el escaneo del QR directamente dentro del entrenamiento activo.")
    footer(c, 3)
    c.showPage()


def sequence_message(c, n, y, x1, x2, title, detail="", color=CYAN, dashed=False):
    arrow(c, x1, y, x2, y, color, 1.2, dashed)
    direction = 1 if x2 > x1 else -1
    label_x = min(x1, x2) + 7
    label_w = abs(x2 - x1) - 14
    c.setFillColor(color)
    c.circle(label_x + (7 if direction > 0 else label_w - 7), y + 11, 7, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont(FONT_BOLD, 6.5)
    c.drawCentredString(label_x + (7 if direction > 0 else label_w - 7), y + 9, str(n))
    draw_text(c, title, label_x + 18 if direction > 0 else label_x, y + 14, label_w - 18, 7.8, TEXT, FONT_BOLD, max_lines=1)
    if detail:
        draw_text(c, detail, label_x + 18 if direction > 0 else label_x, y - 10, label_w - 18, 6.8, MUTED, FONT_REG, max_lines=1)


def events_page(c):
    page_header(c, 4, "Diagrama de eventos", "Qué mensaje viaja entre cada parte del programa desde que se crea el plan hasta que vuelve el resultado.")

    lane_x = [72, 230, 398, 566, 750]
    lane_names = ["Entrenadora", "Trainer OS", "Cuaderno digital", "Member OS", "Máquina / QR"]
    lane_colors = [CYAN, CYAN, LIME, ORANGE, LIME]
    for x, name, color in zip(lane_x, lane_names, lane_colors):
        c.setFillColor(PANEL_2)
        c.setStrokeColor(color)
        c.setLineWidth(1.2)
        c.roundRect(x - 55, 431, 110, 42, 9, fill=1, stroke=1)
        draw_text(c, name, x - 48, 455, 96, 8.5, TEXT, FONT_BOLD, align="center", max_lines=2)
        c.setStrokeColor(LINE)
        c.setDash(3, 4)
        c.line(x, 431, x, 66)
        c.setDash()

    sequence_message(c, 1, 404, lane_x[0], lane_x[1], "Iniciar sesión", "Código de entrenadora", CYAN)
    sequence_message(c, 2, 370, lane_x[1], lane_x[2], "Solicitar personas y clases", "Lista, prioridades e historial", CYAN)
    sequence_message(c, 3, 336, lane_x[2], lane_x[1], "Devolver información", "Incluye progreso y mediciones", LIME)
    sequence_message(c, 4, 302, lane_x[0], lane_x[1], "Guardar plan personal", "Máquinas, series, peso y tiempo", CYAN)
    sequence_message(c, 5, 268, lane_x[1], lane_x[2], "Validar, guardar y auditar", "No reemplaza un entreno activo", LIME)
    sequence_message(c, 6, 234, lane_x[2], lane_x[3], "Enviar aviso de nueva rutina", "La persona recibe la asignación", ORANGE)
    sequence_message(c, 7, 200, lane_x[3], lane_x[4], "Abrir guía de máquina", "Fotos, video e instrucciones", LIME)
    sequence_message(c, 8, 166, lane_x[3], lane_x[2], "Guardar ejercicio realizado", "Repeticiones, peso, tiempo y notas", ORANGE)
    sequence_message(c, 9, 132, lane_x[2], lane_x[3], "Confirmar avance", "Puede continuar o retomar después", LIME)
    sequence_message(c, 10, 98, lane_x[2], lane_x[1], "Devolver resultado actualizado", "La entrenadora ve el nuevo resultado", CYAN)

    c.setStrokeColor(ORANGE)
    c.setDash(5, 4)
    c.setLineWidth(1.2)
    c.line(lane_x[4], 78, lane_x[3], 78)
    c.setDash()
    c.setFillColor(ORANGE)
    c.setFont(FONT_BOLD, 7)
    c.drawCentredString((lane_x[3] + lane_x[4]) / 2, 84, "Pendiente: QR -> ejercicio activo automático")

    footer(c, 4, "Flecha sólida: conexión actual  |  Flecha punteada: integración pendiente")
    c.showPage()


def build():
    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("Xtreme Trainer OS - Diagramas del sistema")
    c.setAuthor("Xtreme Gym")
    c.setSubject("Actividad, casos de uso, requisitos y eventos")
    activity_page(c)
    use_case_page(c)
    requirements_page(c)
    events_page(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
