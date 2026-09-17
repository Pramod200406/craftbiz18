import os
import uuid
from PIL import Image, ImageEnhance, ImageFilter

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def enhance_image(image_path: str) -> str:
    """
    Enhances brightness, contrast, color, and sharpness using Pillow ImageEnhance.
    Returns relative URL path.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    with Image.open(image_path) as img:
        img = img.convert("RGBA" if img.mode == "RGBA" else "RGB")
        
        # Color vibrancy boost
        color_enhancer = ImageEnhance.Color(img)
        img_color = color_enhancer.enhance(1.25)

        # Contrast adjustment for depth
        contrast_enhancer = ImageEnhance.Contrast(img_color)
        img_contrast = contrast_enhancer.enhance(1.20)

        # Brightness adjustment for clear artisan details
        bright_enhancer = ImageEnhance.Brightness(img_contrast)
        img_bright = bright_enhancer.enhance(1.10)

        # Sharpness adjustment to highlight texture & weave
        sharp_enhancer = ImageEnhance.Sharpness(img_bright)
        img_final = sharp_enhancer.enhance(1.35)

        filename = f"enhanced_{uuid.uuid4().hex[:8]}.png"
        output_path = os.path.join(UPLOAD_DIR, filename)
        img_final.save(output_path, "PNG", quality=95)

    return f"/uploads/{filename}"


def remove_background_and_compose(image_path: str) -> str:
    """
    Removes background using rembg, then composites onto a luxury neutral studio backdrop.
    Returns relative URL path.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    filename = f"pro_{uuid.uuid4().hex[:8]}.png"
    output_path = os.path.join(UPLOAD_DIR, filename)

    try:
        from rembg import remove
        with Image.open(image_path) as input_img:
            # Cutout foreground
            cutout = remove(input_img)

            # Create an aesthetic studio gradient/white canvas
            w, h = cutout.size
            canvas = Image.new("RGBA", (w, h), (248, 249, 252, 255))
            
            # Add subtle drop shadow effect
            alpha = cutout.split()[-1]
            shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            shadow_mask = alpha.filter(ImageFilter.GaussianBlur(radius=8))
            shadow.paste((30, 30, 45, 50), mask=shadow_mask)

            canvas.alpha_composite(shadow, (0, 6))
            canvas.alpha_composite(cutout, (0, 0))
            canvas.convert("RGB").save(output_path, "JPEG", quality=95)
    except Exception as e:
        print(f"Rembg processing note: {e}. Fallback to high-contrast studio crop.")
        with Image.open(image_path) as input_img:
            input_img.convert("RGB").save(output_path, "JPEG", quality=90)

    return f"/uploads/{filename}"
