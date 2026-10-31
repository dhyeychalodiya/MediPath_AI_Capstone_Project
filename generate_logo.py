import os
from PIL import Image, ImageDraw

def create_exact_activity_logo():
    # Super-sampled canvas for anti-aliasing
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # 1. Background Squircle (Rounded Rectangle)
    margin = 54
    box = [margin, margin, size - margin, size - margin]
    radius = 260

    # 135-degree diagonal gradient
    # Top-Left: #0284c7 (2, 132, 199)
    # Mid: #0ea5e9 (14, 165, 233)
    # Bottom-Right: #06b6d4 (6, 182, 212)
    grad_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad_img)

    for y in range(size):
        for x in range(size):
            # Diagonal gradient factor along 135 degrees (x + y)
            t = (x + y) / (2.0 * size)
            if t < 0.5:
                sub_t = t / 0.5
                r = int(2 * (1 - sub_t) + 14 * sub_t)
                g = int(132 * (1 - sub_t) + 165 * sub_t)
                b = int(199 * (1 - sub_t) + 233 * sub_t)
            else:
                sub_t = (t - 0.5) / 0.5
                r = int(14 * (1 - sub_t) + 6 * sub_t)
                g = int(165 * (1 - sub_t) + 182 * sub_t)
                b = int(233 * (1 - sub_t) + 212 * sub_t)
            grad_draw.point((x, y), fill=(r, g, b, 255))

    # Mask for rounded rectangle
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(box, radius=radius, fill=255)

    # Squircle with gradient
    squircle = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    squircle.paste(grad_img, (0, 0), mask)

    # 2. Activity / Pulse Line matching Lucide Activity exactly
    pulse_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pulse_layer)

    # Points on 1024x1024 canvas
    pts = [
        (200, 512),
        (320, 512),
        (416, 256),
        (608, 768),
        (704, 512),
        (824, 512)
    ]

    width = 90  # Bold, clean stroke width

    # Draw segments with round joints and caps
    for i in range(len(pts) - 1):
        p_draw.line([pts[i], pts[i+1]], fill=(255, 255, 255, 255), width=width)
        # Round joint
        p_draw.ellipse([pts[i][0] - width//2, pts[i][1] - width//2,
                        pts[i][0] + width//2, pts[i][1] + width//2], fill=(255, 255, 255, 255))
    # Round end cap
    p_draw.ellipse([pts[-1][0] - width//2, pts[-1][1] - width//2,
                    pts[-1][0] + width//2, pts[-1][1] + width//2], fill=(255, 255, 255, 255))

    squircle.paste(pulse_layer, (0, 0), pulse_layer)

    # High quality downsampling to 512x512
    final_img = squircle.resize((512, 512), Image.Resampling.LANCZOS)
    return final_img

if __name__ == '__main__':
    logo = create_exact_activity_logo()
    
    web_public = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\frontend\healthpath-ai-main\public"
    desktop_assets = r"d:\MediPath_AI_Capstone\desktop-app\assets"
    
    # Save PNGs
    logo.save(os.path.join(web_public, "logo.png"), "PNG")
    logo.save(os.path.join(desktop_assets, "icon.png"), "PNG")
    
    # Save multi-resolution ICOs
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    logo.save(os.path.join(web_public, "favicon.ico"), format="ICO", sizes=ico_sizes)
    logo.save(os.path.join(desktop_assets, "icon.ico"), format="ICO", sizes=ico_sizes)
    
    # Also save clean SVG vector
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect x="27" y="27" width="458" height="458" rx="130" fill="url(#bgGrad)" />
  <path d="M 100 256 L 160 256 L 208 128 L 304 384 L 352 256 L 412 256" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="45" 
        stroke-linecap="round" 
        stroke-linejoin="round" />
</svg>'''
    with open(os.path.join(web_public, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open(os.path.join(desktop_assets, "icon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_content)

    print("Successfully generated exact Activity pulse logo across web and desktop!")
