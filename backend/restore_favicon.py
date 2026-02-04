import shutil
import os

# Source is the known persistent location of the logo
src = r"d:\Website\Dexsini_Hub\frontend\src\assets\DexsiniLogo_noBG\DexsiniLogo_noBG.jpg"
# Destination is the public folder for the favicon
dst_dir = r"d:\Website\Dexsini_Hub\frontend\public"
dst = os.path.join(dst_dir, "favicon.jpg")

if not os.path.exists(dst_dir):
    print(f"Creating directory: {dst_dir}")
    os.makedirs(dst_dir)

if os.path.exists(src):
    try:
        shutil.copy2(src, dst)
        print(f"Successfully copied {src} to {dst}")
    except Exception as e:
        print(f"Error copying: {e}")
else:
    print(f"Source file not found: {src}")
