import shutil
import os

src = r"d:\Website\Dexsini_Hub\frontend\src\assets\DexsiniLogo_noBG\DexsiniLogo_noBG.jpg"
dst = r"d:\Website\Dexsini_Hub\frontend\src\assets\logo.jpg"

if os.path.exists(src):
    try:
        shutil.copy2(src, dst)
        print(f"Successfully copied {src} to {dst}")
    except Exception as e:
        print(f"Error copying: {e}")
else:
    print(f"Source file not found: {src}")
