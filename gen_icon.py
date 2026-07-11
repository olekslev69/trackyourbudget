#!/usr/bin/env python3
"""Erzeugt die App-Icons (PNG) ohne externe Abhaengigkeiten.
Motiv "Donut-Iris": abgerundetes Quadrat mit Verlauf + Donut-Diagramm
(Ausgabenaufteilung), dessen Zentrum Pupille und Glanzlicht traegt --
aus dem Diagramm wird ein Auge ("Sparblick" = der Blick aufs Budget).

Ausgabe:
- app-icon.png                     1024x1024  (Quelle fuer `tauri icon`)
- src/icons/icon-192.png           192x192    (PWA, purpose "any")
- src/icons/icon-512.png           512x512    (PWA, purpose "any")
- src/icons/icon-512-maskable.png  512x512    (PWA, purpose "maskable", randfuellend)
"""
import struct
import zlib
import math
import os

# Farben
BG_TOP = (99, 102, 241)     # indigo
BG_BOT = (139, 92, 246)     # violett
SEGMENTS = [
    (0.40, (255, 255, 255)),   # 40% weiss
    (0.25, (52, 211, 153)),    # 25% gruen
    (0.20, (251, 191, 36)),    # 20% gelb
    (0.15, (248, 113, 113)),   # 15% rot
]
PUPIL = (30, 27, 75)           # tiefes Indigo (Pupille)
GLINT = (255, 255, 255)        # Glanzlicht


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))


def make_png(size, maskable=False):
    """Rendert ein Icon und gibt die PNG-Bytes zurueck."""
    cx = cy = size / 2
    r_out = size * 0.30
    r_in = size * 0.165
    # Pupille fuellt das Donut-Loch; Glanzlicht sitzt oben links darin.
    r_pup = r_in
    r_gl = size * 0.046
    gl_x = cx - size * 0.054
    gl_y = cy - size * 0.058
    # Bei maskable kein abgerundetes Quadrat (randfuellend fuer die Safe-Zone)
    corner = 0 if maskable else size * 0.22

    # Segment-Winkelgrenzen (Start oben, im Uhrzeigersinn)
    bounds = []
    acc = -math.pi / 2
    for frac, col in SEGMENTS:
        bounds.append((acc, acc + frac * 2 * math.pi, col))
        acc += frac * 2 * math.pi

    def rounded_alpha(x, y):
        if corner <= 0:
            return 255
        dx = max(corner - x, x - (size - corner), 0)
        dy = max(corner - y, y - (size - corner), 0)
        if dx == 0 or dy == 0:
            return 255
        d = math.hypot(dx, dy)
        return int(max(0, min(255, (corner - d + 0.5) * 255)))

    rows = bytearray()
    for y in range(size):
        rows.append(0)  # Filter-Byte pro Zeile
        for x in range(size):
            t = y / (size - 1)
            r, g, b = mix(BG_TOP, BG_BOT, t)
            a = rounded_alpha(x + 0.5, y + 0.5)

            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = math.hypot(dx, dy)
            # Pupille (unter dem Ring gezeichnet; der Ring blendet an r_in sauber darueber)
            if dist <= r_pup + 1:
                pe = max(0.0, min(1.0, (r_pup + 0.5 - dist)))
                r = int(lerp(r, PUPIL[0], pe))
                g = int(lerp(g, PUPIL[1], pe))
                b = int(lerp(b, PUPIL[2], pe))
            if r_in - 1 <= dist <= r_out + 1:
                ang = math.atan2(dy, dx)
                while ang < -math.pi / 2:
                    ang += 2 * math.pi
                seg_col = bounds[-1][2]
                for s, e, col in bounds:
                    if s <= ang < e:
                        seg_col = col
                        break
                edge = min(dist - (r_in - 1), (r_out + 1) - dist, 2) / 2
                edge = max(0.0, min(1.0, edge))
                r = int(lerp(r, seg_col[0], edge))
                g = int(lerp(g, seg_col[1], edge))
                b = int(lerp(b, seg_col[2], edge))
            # Glanzlicht (zuoberst, nur innerhalb der Pupille sichtbar platziert)
            gdist = math.hypot(x + 0.5 - gl_x, y + 0.5 - gl_y)
            if gdist <= r_gl + 1:
                ge = max(0.0, min(1.0, (r_gl + 0.5 - gdist)))
                r = int(lerp(r, GLINT[0], ge * 0.95))
                g = int(lerp(g, GLINT[1], ge * 0.95))
                b = int(lerp(b, GLINT[2], ge * 0.95))
            rows.extend((r, g, b, a))

    def chunk(tag, data):
        out = struct.pack(">I", len(data)) + tag + data
        return out + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(rows), 9))
    png += chunk(b"IEND", b"")
    return png


def write(path, data):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    print("geschrieben:", path, len(data), "bytes")


if __name__ == "__main__":
    write("app-icon.png", make_png(1024))
    write("src/icons/icon-192.png", make_png(192))
    write("src/icons/icon-512.png", make_png(512))
    write("src/icons/icon-512-maskable.png", make_png(512, maskable=True))
