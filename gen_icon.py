#!/usr/bin/env python3
"""Erzeugt ein 1024x1024 App-Icon (PNG) ohne externe Abhaengigkeiten.
Motiv: abgerundetes Quadrat mit Verlauf + Donut-Diagramm (Ausgabenaufteilung)."""
import struct, zlib, math

SIZE = 1024


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))


# Farben
BG_TOP = (99, 102, 241)     # indigo
BG_BOT = (139, 92, 246)     # violett
SEGMENTS = [
    (0.40, (255, 255, 255)),   # 40% weiss
    (0.25, (52, 211, 153)),    # 25% gruen
    (0.20, (251, 191, 36)),    # 20% gelb
    (0.15, (248, 113, 113)),   # 15% rot
]

cx = cy = SIZE / 2
r_out = SIZE * 0.30
r_in = SIZE * 0.165
corner = SIZE * 0.22

# Segment-Winkelgrenzen (Start oben, im Uhrzeigersinn)
bounds = []
acc = -math.pi / 2
for frac, col in SEGMENTS:
    start = acc
    end = acc + frac * 2 * math.pi
    bounds.append((start, end, col))
    acc = end


def rounded_alpha(x, y):
    """Anti-aliasing-Alpha fuer abgerundetes Quadrat (0..255)."""
    dx = max(corner - x, x - (SIZE - corner), 0)
    dy = max(corner - y, y - (SIZE - corner), 0)
    if dx == 0 or dy == 0:
        return 255
    d = math.hypot(dx, dy)
    return int(max(0, min(255, (corner - d + 0.5) * 255)))


rows = bytearray()
for y in range(SIZE):
    rows.append(0)  # Filter-Byte pro Zeile
    for x in range(SIZE):
        t = y / (SIZE - 1)
        r, g, b = mix(BG_TOP, BG_BOT, t)
        a = rounded_alpha(x + 0.5, y + 0.5)

        dx = x + 0.5 - cx
        dy = y + 0.5 - cy
        dist = math.hypot(dx, dy)
        if r_in - 1 <= dist <= r_out + 1:
            ang = math.atan2(dy, dx)
            # in Bereich [-pi/2, 3pi/2)
            while ang < -math.pi / 2:
                ang += 2 * math.pi
            seg_col = None
            for s, e, col in bounds:
                if s <= ang < e:
                    seg_col = col
                    break
            if seg_col is None:
                seg_col = bounds[-1][2]
            # weiche Kanten am Ring
            edge = min(dist - (r_in - 1), (r_out + 1) - dist, 2) / 2
            edge = max(0.0, min(1.0, edge))
            r = int(lerp(r, seg_col[0], edge))
            g = int(lerp(g, seg_col[1], edge))
            b = int(lerp(b, seg_col[2], edge))
        rows.extend((r, g, b, a))


def chunk(tag, data):
    out = struct.pack(">I", len(data)) + tag + data
    return out + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(bytes(rows), 9))
png += chunk(b"IEND", b"")

with open("app-icon.png", "wb") as f:
    f.write(png)
print("app-icon.png geschrieben:", len(png), "bytes")
