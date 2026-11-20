import sys
from PIL import Image
import numpy as np

def remove_white_bg(img_path, out_path, size=(512, 512)):
    im = Image.open(img_path).convert("RGBA")
    
    # Process image to make white background transparent
    data = np.array(im, dtype=np.float32)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Calculate distance from pure white (255, 255, 255)
    # Whiteness: min(r, g, b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    
    # Smooth alpha ramp for anti-aliasing edges
    # Any pixel where min_rgb > 250 starts getting transparent, > 254 is fully transparent
    # Also calculate color saturation to protect white highlights inside the crystal
    max_rgb = np.maximum(np.maximum(r, g), b)
    diff = max_rgb - min_rgb # saturation indicator
    
    # Flood-fill or edge-aware alpha:
    # If a pixel is very close to white AND has very low saturation:
    alpha = np.ones_like(r) * 255.0
    
    # Simple clean chroma-key for white studio background:
    # A standard soft key for pure white background:
    # Pure white threshold:
    whiteness = (r + g + b) / 3.0
    
    # Create mask: where whiteness is very high and diff is very low
    bg_mask = (whiteness > 248) & (diff < 8)
    
    # To avoid cutting internal crystal highlights, let's use floodfill from corners or alpha falloff:
    # Corner sampling:
    corners = [(0, 0), (0, im.height-1), (im.width-1, 0), (im.width-1, im.height-1)]
    # Use PIL ImageOps / simple distance from 255:
    
    # Let's do flood fill from the edges to only remove the outer white background!
    from collections import deque
    h, w = im.size[1], im.size[0]
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    
    # Add borders to queue
    for x in range(w):
        if (whiteness[0, x] > 240) and (diff[0, x] < 15):
            q.append((0, x))
            visited[0, x] = True
        if (whiteness[h-1, x] > 240) and (diff[h-1, x] < 15):
            q.append((h-1, x))
            visited[h-1, x] = True
            
    for y in range(h):
        if (whiteness[y, 0] > 240) and (diff[y, 0] < 15):
            q.append((y, 0))
            visited[y, 0] = True
        if (whiteness[y, w-1] > 240) and (diff[y, w-1] < 15):
            q.append((y, w-1))
            visited[y, w-1] = True
            
    # BFS
    while q:
        cy, cx = q.popleft()
        alpha[cy, cx] = 0.0
        for ny, nx in [(cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)]:
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if whiteness[ny, nx] > 242 and diff[ny, nx] < 18:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                elif whiteness[ny, nx] > 230 and diff[ny, nx] < 22:
                    # Soft edge anti-aliasing
                    visited[ny, nx] = True
                    # Partial alpha
                    val = (whiteness[ny, nx] - 230) / 12.0
                    alpha[ny, nx] = min(255.0, max(0.0, (1.0 - val) * 255.0))

    data[:, :, 3] = alpha
    result = Image.fromarray(np.uint8(data))
    
    # Crop to non-transparent bounding box
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    # Resize preserving aspect ratio with padding
    result.thumbnail((460, 460), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    offset = ((size[0] - result.width) // 2, (size[1] - result.height) // 2)
    canvas.paste(result, offset, result)
    canvas.save(out_path, "PNG")
    print(f"Processed and saved: {out_path} ({canvas.size})")

diamond_src = r"C:\Users\user\.gemini\antigravity\brain\f0ae1c34-a81f-4fbe-b98d-c8d5cb36aa76\pro_gem_diamond_512_v2_1795172649877.jpg"
amber_src = r"C:\Users\user\.gemini\antigravity\brain\f0ae1c34-a81f-4fbe-b98d-c8d5cb36aa76\pro_gem_amber_512_v2_1795172664818.jpg"

diamond_out = r"C:\projects\my-duolingo\frontend\assets\icons\pro_gem_diamond_512.png"
amber_out = r"C:\projects\my-duolingo\frontend\assets\icons\pro_gem_amber_512.png"

remove_white_bg(diamond_src, diamond_out)
remove_white_bg(amber_src, amber_out)
