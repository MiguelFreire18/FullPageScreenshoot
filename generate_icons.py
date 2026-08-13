import os
import struct
import zlib
import math

def create_camera_png(size, filename):
    # Genera el icono de cámara con el color de acento #ccff00 (R:204, G:255, B:0)
    width = size
    height = size
    raw_data = bytearray()

    center_x = width / 2.0
    center_y = height / 2.0
    
    body_margin_x = size * 0.10
    body_margin_top = size * 0.28
    body_margin_bottom = size * 0.12
    corner_radius = size * 0.14
    
    bump_left = size * 0.32
    bump_right = size * 0.52
    bump_top = size * 0.16
    bump_radius = size * 0.08
    
    flash_cx = size * 0.72
    flash_cy = size * 0.40
    flash_radius = size * 0.08
    
    lens_cx = center_x
    lens_cy = size * 0.58
    lens_r_outer = size * 0.26
    lens_r_inner = size * 0.19
    lens_r_center = size * 0.10
    lens_glare_cx = lens_cx - size * 0.07
    lens_glare_cy = lens_cy - size * 0.07
    lens_glare_r = size * 0.05

    def distance(x1, y1, x2, y2):
        return math.sqrt((x1 - x2)**2 + (y1 - y2)**2)

    def in_rounded_rect(px, py, x1, y1, x2, y2, r):
        if px < x1 or px > x2 or py < y1 or py > y2:
            dx = max(x1 - px, 0, px - x2)
            dy = max(y1 - py, 0, py - y2)
            return -math.sqrt(dx*dx + dy*dy)
        
        cx = x1 + r if px < x1 + r else (x2 - r if px > x2 - r else px)
        cy = y1 + r if py < y1 + r else (y2 - r if py > y2 - r else py)
        if (px < x1 + r or px > x2 - r) and (py < y1 + r or py > y2 - r):
            return r - distance(px, py, cx, cy)
        return 1.0

    for y in range(height):
        raw_data.append(0)
        for x in range(width):
            px = x + 0.5
            py = y + 0.5

            r, g, b, a = 0, 0, 0, 0

            # Fondo circular oscuro con borde brillante #ccff00
            bg_dist = (size * 0.48) - distance(px, py, center_x, center_y)
            if bg_dist > -0.5:
                alpha = max(0.0, min(1.0, bg_dist + 0.5))
                # Fondo oscuro elegante
                r, g, b = 15, 23, 42
                # Borde perimetral #ccff00
                if bg_dist < size * 0.08:
                    r, g, b = 204, 255, 0
                a = int(255 * alpha)

            # Cuerpo de la cámara
            body_dist = in_rounded_rect(px, py, body_margin_x, body_margin_top, width - body_margin_x, height - body_margin_bottom, corner_radius)
            bump_dist = in_rounded_rect(px, py, bump_left, bump_top, bump_right, body_margin_top + size*0.05, bump_radius)
            camera_dist = max(body_dist, bump_dist)
            
            if camera_dist > -0.5:
                cam_alpha = max(0.0, min(1.0, camera_dist + 0.5))
                
                # Gradiente metálico grafito
                gt = (py - bump_top) / (height - body_margin_bottom - bump_top)
                cr = int(225 * (1 - gt * 0.35))
                cg = int(230 * (1 - gt * 0.35))
                cb = int(240 * (1 - gt * 0.35))
                
                # Banda inferior oscura
                if py > height * 0.68 and body_dist > 0:
                    cr, cg, cb = 30, 41, 59

                # Lente
                d_lens = distance(px, py, lens_cx, lens_cy)
                if d_lens <= lens_r_outer + 0.5:
                    if d_lens > lens_r_inner:
                        # Anillo exterior con toque de color #ccff00
                        cr, cg, cb = 204, 255, 0
                    elif d_lens > lens_r_center:
                        # Anillo oscuro
                        cr, cg, cb = 15, 23, 42
                    else:
                        # Centro de cristal profundo
                        cr, cg, cb = 30, 41, 59
                        
                    # Reflejo del lente
                    d_glare = distance(px, py, lens_glare_cx, lens_glare_cy)
                    if d_glare <= lens_glare_r:
                        glare_factor = max(0.0, 1.0 - (d_glare / lens_glare_r))
                        cr = int(cr + (255 - cr) * glare_factor * 0.95)
                        cg = int(cg + (255 - cg) * glare_factor * 0.95)
                        cb = int(cb + (255 - cb) * glare_factor * 0.95)

                # Flash indicador #ccff00
                d_flash = distance(px, py, flash_cx, flash_cy)
                if d_flash <= flash_radius:
                    cr, cg, cb = 204, 255, 0

                out_a = cam_alpha + (a / 255.0) * (1.0 - cam_alpha)
                if out_a > 0:
                    r = int((cr * cam_alpha + r * (a / 255.0) * (1.0 - cam_alpha)) / out_a)
                    g = int((cg * cam_alpha + g * (a / 255.0) * (1.0 - cam_alpha)) / out_a)
                    b = int((cb * cam_alpha + b * (a / 255.0) * (1.0 - cam_alpha)) / out_a)
                    a = int(out_a * 255)

            raw_data.extend([min(255, max(0, r)), min(255, max(0, g)), min(255, max(0, b)), min(255, max(0, a))])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(header + ihdr + idat + iend)

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(base_dir, 'icons')
    create_camera_png(16, os.path.join(icons_dir, 'icon16.png'))
    create_camera_png(48, os.path.join(icons_dir, 'icon48.png'))
    create_camera_png(128, os.path.join(icons_dir, 'icon128.png'))
    print("Icons regenerated with #ccff00 styling!")
