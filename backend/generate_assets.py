import os
from pathlib import Path

BASE_DIR = Path(r"C:\Users\Lenovo Legion T5\Desktop\Backend\PRUEBA 3\petcare_project\static\images")
(BASE_DIR / "avatars").mkdir(parents=True, exist_ok=True)
(BASE_DIR / "pets").mkdir(parents=True, exist_ok=True)

# Generate beautiful SVGs for avatars and pets
tutor_avatars = {
    "tutor_default.png": ("#0d9488", "TU", "Tutor PetCare"),
    "tutor_1.png": ("#2563eb", "ST", "Sebastián Torres"),
    "tutor_2.png": ("#7c3aed", "CA", "Camila Alarcón"),
    "tutor_3.png": ("#db2777", "MR", "María Rodríguez"),
    "tutor_4.png": ("#d97706", "JV", "Juan Valenzuela"),
    "vet_default.png": ("#0f766e", "DR", "Dr. Veterinario"),
    "vet_1.png": ("#0284c7", "MA", "Dr. Marcelo Alvarado"),
    "vet_2.png": ("#059669", "PS", "Dra. Patricia Soto"),
}

for name, (color, initials, title) in tutor_avatars.items():
    svg_name = name.replace(".png", ".svg")
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="grad_{initials}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="{color}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#grad_{initials})" stroke="#ffffff" stroke-width="4"/>
      <circle cx="60" cy="46" r="22" fill="#ffffff" opacity="0.9"/>
      <path d="M 24 100 C 24 75, 40 68, 60 68 C 80 68, 96 75, 96 100 Z" fill="#ffffff" opacity="0.9"/>
      <text x="60" y="52" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="{color}" text-anchor="middle">{initials}</text>
    </svg>'''
    with open(BASE_DIR / "avatars" / svg_name, "w", encoding="utf-8") as f:
        f.write(svg_content)
    # Also save as fallback reference
    with open(BASE_DIR / "avatars" / name, "w", encoding="utf-8") as f:
        f.write(svg_content)

pets = {
    "pet_default.png": ("#0d9488", "🐾", "Mascota"),
    "pet_dog1.png": ("#3b82f6", "🐶", "Canino"),
    "pet_dog2.png": ("#1d4ed8", "🐕", "Canino"),
    "pet_cat1.png": ("#a855f7", "🐱", "Felino"),
    "pet_cat2.png": ("#7e22ce", "🐈", "Felino"),
    "pet_rabbit.png": ("#f59e0b", "🐰", "Roedor"),
    "pet_bird.png": ("#10b981", "🦜", "Ave"),
}

for name, (color, emoji, specie) in pets.items():
    svg_name = name.replace(".png", ".svg")
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="pgrad_{name[:4]}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="{color}"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="116" rx="28" fill="url(#pgrad_{name[:4]})" stroke="#e2e8f0" stroke-width="4"/>
      <circle cx="60" cy="55" r="32" fill="#ffffff" opacity="0.2"/>
      <text x="60" y="68" font-size="44" text-anchor="middle">{emoji}</text>
      <rect x="20" y="92" width="80" height="20" rx="10" fill="#ffffff" opacity="0.9"/>
      <text x="60" y="106" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="{color}" text-anchor="middle">{specie}</text>
    </svg>'''
    with open(BASE_DIR / "pets" / svg_name, "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open(BASE_DIR / "pets" / name, "w", encoding="utf-8") as f:
        f.write(svg_content)

print("Generated all vector avatar and pet illustrations successfully.")
