import sys
from datetime import datetime
from io import BytesIO

import requests
from inky.auto import auto
from PIL import Image

API_URL = "https://tekpi-eink.vercel.app/api/next-image"
LOG_FILE = "/home/pi/display_error.log"
TIMEOUT = 45

try:
    inky_display = auto()
    response = requests.get(API_URL, timeout=TIMEOUT)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content))
    inky_display.set_image(img)
    inky_display.show()
except Exception as e:
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(f"{datetime.now().isoformat()} {e}\n")
    sys.exit(1)
