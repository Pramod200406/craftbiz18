import os
import re
import urllib.request
import urllib.parse
import json
from typing import Dict, Any, Tuple

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        # Load tiny model for fast responsive inference
        _whisper_model = whisper.load_model("tiny")
    return _whisper_model

def translate_to_english(text: str) -> Tuple[str, str]:
    """
    Translates spoken or written text from Indian languages (Kannada, Hindi, Tamil, Telugu, etc.)
    into English using Google Translate GTX endpoint with smart fallbacks.
    Returns (translated_text, detected_language).
    """
    if not text or not text.strip():
        return "", "en"
        
    cleaned = text.strip()
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q={urllib.parse.quote(cleaned)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode("utf-8"))
            translated = "".join([part[0] for part in data[0] if part and part[0]]).strip()
            detected_lang = data[2] if len(data) > 2 and isinstance(data[2], str) else "auto"
            return (translated if translated else cleaned), detected_lang
    except Exception as e:
        print(f"Translation service note: {e}")
        try:
            if all(ord(c) < 128 for c in cleaned):
                return cleaned, "en"
        except Exception:
            pass
        return cleaned, "auto"

def transcribe_audio_file(audio_path: str) -> Dict[str, Any]:
    """
    Transcribes recorded audio using Whisper AI, detects language,
    and translates non-English audio to English.
    Applies FFmpeg dynamic audio normalization to boost low-gain microphone speech.
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Normalize audio with FFmpeg to 16kHz mono WAV with dynamic volume leveling
    target_path = audio_path
    normalized_wav = os.path.splitext(audio_path)[0] + "_norm.wav"
    try:
        import subprocess
        cmd = [
            "ffmpeg", "-y", "-i", audio_path,
            "-af", "dynaudnorm,volume=8dB",
            "-ar", "16000", "-ac", "1",
            normalized_wav
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(normalized_wav) and os.path.getsize(normalized_wav) > 500:
            target_path = normalized_wav
    except Exception as e:
        print(f"Audio normalization note: {e}")

    try:
        model = get_whisper_model()
        # 1. Transcribe with low temperature for maximum consistency
        result = model.transcribe(
            target_path,
            fp16=False,
            temperature=0.0,
            no_speech_threshold=0.8
        )
        transcribed_text = result.get("text", "").strip()
        detected_lang = result.get("language", "en")

        # 2. If transcription is empty, try Whisper direct translation
        if not transcribed_text:
            translate_result = model.transcribe(
                target_path,
                task="translate",
                fp16=False,
                temperature=0.2,
                no_speech_threshold=0.9
            )
            transcribed_text = translate_result.get("text", "").strip()
            detected_lang = translate_result.get("language", "en")

        # 3. Translate to English using Google GTX if regional language
        if transcribed_text:
            translated_text, detected_lang = translate_to_english(transcribed_text)
        else:
            translated_text = ""

        # Clean up temporary normalized wav
        if target_path == normalized_wav and os.path.exists(normalized_wav):
            try:
                os.remove(normalized_wav)
            except Exception:
                pass

        return {
            "text": transcribed_text,
            "translated_text": translated_text,
            "language": detected_lang,
            "confidence": 0.95 if transcribed_text else 0.0
        }
    except Exception as e:
        print(f"Whisper transcription note: {e}")
        return {
            "text": "",
            "translated_text": "",
            "language": "en",
            "confidence": 0.0
        }

def extract_product_details(transcription: str, translated_text: str = None) -> Dict[str, Any]:
    """
    Extracts structured craft entities (Product Name, Category, Material,
    Production Cost, Suggested Selling Price, Available Quantity) from
    spoken text in Kannada, Hindi, or English.
    """
    if not transcription or not transcription.strip():
        return {
            "name": "Handcrafted Heritage Artisan Product",
            "category": "Woodcraft",
            "material": "Natural Seasoned Wood & Eco-Finish",
            "production_cost": 350.0,
            "suggested_selling_price": 550.0,
            "quantity": 10,
            "confidence": 0.75,
            "original_text": "",
            "translated_text": "",
            "detected_language": "en"
        }

    # 1. Ensure English translation is available
    detected_lang = "en"
    if not translated_text:
        translated_text, detected_lang = translate_to_english(transcription)

    text_en = (translated_text or transcription).lower()
    text_orig = transcription.lower()
    combined = f"{text_en} {text_orig}"

    # 2. Comprehensive Multilingual Category & Material Matching
    category_keywords = {
        "Terracotta": [
            "terracotta", "clay", "pot", "pottery", "earthen", "baked earth", "bankura", "pitcher", "diya",
            "ಮಣ್ಣು", "ಮಡಕೆ", "ಕುಂಬಾರಿಕೆ", "ಟೆರಾಕೋಟಾ", "ಹಣತೆ",
            "टेराकोटा", "मिट्टी", "मटका", "कुम्हार", "बांकुरा", "दीया", "कुल्हड़"
        ],
        "Handloom": [
            "handloom", "saree", "sari", "khadi", "silk", "cotton", "weave", "zari", "fabric", "shawl", "dupatta", "stole",
            "ಕೈಮಗ್ಗ", "ರೇಷ್ಮೆ", "ಖಾದಿ", "ಹತ್ತಿ", "ಸೀರೆ", "ನೇಯ್ಗೆ", "ಜರಿ", "ಶಾಲು",
            "हथकरघा", "खादी", "साड़ी", "रेशम", "सिल्क", "सूती", "कपास", "जरी", "दुपट्टा", "शॉल"
        ],
        "Woodcraft": [
            "wood", "wooden", "channapatna", "sandalwood", "rosewood", "teak", "toy", "carving", "lacquer", "rocking horse",
            "ಮರ", "ಮರದ", "ಚನ್ನಪಟ್ಟಣ", "ಆಟಿಕೆ", "ಕುದುರೆ", "ಕೆತ್ತನೆ", "ಶ್ರೀಗಂಧ",
            "लकड़ी", "काष्ठ", "खिलौना", "चन्नपटना", "नक्काशी", "काठ"
        ],
        "Bamboo Crafts": [
            "bamboo", "cane", "wicker", "basket", "rattan",
            "ಬಿದಿರು", "ಬುಟ್ಟಿ", "ಬೆತ್ತ",
            "बांस", "बेंत", "टोकरी", "केन"
        ],
        "Jewellery": [
            "jewellery", "jewelry", "necklace", "earring", "bangle", "bead", "terracotta jewellery", "silver", "anklet",
            "ಆಭರಣ", "ಹಾರ", "ಓಲೆ", "ಬಳೆ", "ಮಣಿ", "ಕಾಲುಂಗುರ",
            "आभूषण", "गहने", "हार", "झुमके", "चूड़ी", "मोती", "पायल"
        ],
        "Metal Crafts": [
            "brass", "bronze", "bell metal", "dhokra", "dokra", "bidri", "copper", "metal", "idol", "diya lamp",
            "ಹಿತ್ತಾಳೆ", "ಕಂಚು", "ಬಿದ್ರಿ", "ತಾಮ್ರ", "ಲೋಹ", "ವಿಗ್ರಹ",
            "पीतल", "कांस्य", "ढोकरा", "बिदरी", "तांबा", "धातु", "मूर्ति"
        ],
        "Jute Crafts": [
            "jute", "burlap", "hessian", "jute bag", "rope craft",
            "ಸೆಣಬು", "ಸೆಣಬಿನ",
            "जूट", "पटसन", "बोरी"
        ]
    }

    # Priority order to prevent generic collisions
    priority = ["Terracotta", "Metal Crafts", "Bamboo Crafts", "Jute Crafts", "Jewellery", "Woodcraft", "Handloom"]
    detected_category = "Handloom"
    for cat in priority:
        kws = category_keywords[cat]
        if any(kw in combined for kw in kws):
            detected_category = cat
            break

    # Determine authentic material
    default_materials = {
        "Woodcraft": "Channapatna Hale Wood / Natural Lacquer",
        "Terracotta": "Natural Clay & Baked Terracotta",
        "Handloom": "Pure Handspun Khadi / Heritage Silk",
        "Bamboo Crafts": "Seasoned Eco-Bamboo & Natural Cane",
        "Jewellery": "Handcrafted Artisan Beads & Alloy",
        "Metal Crafts": "Traditional Cast Brass & Bell Metal",
        "Jute Crafts": "Golden Jute Fiber & Eco-Canvas"
    }
    detected_material = default_materials.get(detected_category, "Traditional Handcrafted Material")

    if any(k in combined for k in ["clay", "मिट्टी", "ಮಣ್ಣು", "baked"]):
        detected_material = "Natural Clay & Baked Terracotta"
    elif any(k in combined for k in ["silk", "रेशम", "ರೇಷ್ಮೆ"]):
        detected_material = "Pure Mulberry Silk & Zari"
    elif any(k in combined for k in ["cotton", "khadi", "खादी", "ಹತ್ತಿ", "सूती"]):
        detected_material = "Pure Handloom Cotton & Zari"
    elif any(k in combined for k in ["channapatna", "ಚನ್ನಪಟ್ಟಣ", "चन्नपटना", "lac"]):
        detected_material = "Channapatna Hale Wood / Natural Lacquer"
    elif any(k in combined for k in ["brass", "पीतल", "ಹಿತ್ತಾಳೆ"]):
        detected_material = "Traditional Cast Brass & Bell Metal"
    elif any(k in combined for k in ["bamboo", "बांस", "ಬಿದಿರು"]):
        detected_material = "Seasoned Eco-Bamboo & Cane"

    # 3. Numeric Extractions (Cost, Selling Price, Quantity)
    cost_m = re.search(
        r'(?:production\s*cost|manufacturing\s*cost|cost\s*price|cost|kharcha|vechcha|laagat|adike|ವೆಚ್ಚ|ಖರ್ಚು|लागत)\D*?(\d+)',
        combined
    )
    price_m = re.search(
        r'(?:selling\s*price|selling\s*rate|selling|sell\s*for|market\s*price|price|rate|dar|bele|kimat|moolya|ಬೆಲೆ|ದರ|कीमत|बिक्री)\D*?(\d+)',
        combined
    )
    qty_m1 = re.search(
        r'(\d+)\s*(?:pieces|pcs|units|nagalu|nagas|items|pieces available|units available|stock|ನಗಗಳು|ಸಂಖ್ಯೆ|पीस|पीसेस)',
        combined
    )
    qty_m2 = re.search(
        r'(?:quantity|qty|units|pieces|count|sankhya|stock|nagalu)\D*?(\d+)',
        combined
    )

    all_nums = [float(n) for n in re.findall(r'\b\d+\b', combined)]

    cost = float(cost_m.group(1)) if cost_m else (all_nums[0] if len(all_nums) > 0 else 350.0)
    price = float(price_m.group(1)) if price_m else (all_nums[1] if len(all_nums) > 1 else round(cost * 1.4))
    qty = int(qty_m1.group(1)) if qty_m1 else (int(qty_m2.group(1)) if qty_m2 else (int(all_nums[-1]) if len(all_nums) > 2 else 10))

    if price <= cost:
        selling = round(cost * 1.38)
    else:
        selling = price

    # 4. Extract Product Name in Clean Title Case
    name_source = (translated_text or transcription).strip()
    first_phrase = re.split(r'[,.\n\r;]|(?:\s+made\s+from)|(?:\s+with\s+)|(?:\s+cost\s+)|(?:\s+manufacturing\s+)', name_source, flags=re.IGNORECASE)[0].strip()
    clean_name = re.sub(r'^(this is|i have|here is|authentic|handmade|traditional|genuine)\s+', '', first_phrase, flags=re.IGNORECASE).strip()

    if len(clean_name) < 4 or len(clean_name) > 60:
        clean_name = f"Authentic Handcrafted {detected_category}"

    return {
        "name": clean_name.title(),
        "category": detected_category,
        "material": detected_material,
        "production_cost": float(cost),
        "suggested_selling_price": float(selling),
        "quantity": max(1, qty),
        "confidence": 0.95,
        "original_text": transcription,
        "translated_text": translated_text,
        "detected_language": detected_lang
    }
