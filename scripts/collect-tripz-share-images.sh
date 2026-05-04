#!/usr/bin/env bash
set -euo pipefail

share_root="/Users/sanchay/Downloads/tripz-whatsapp-share-images-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$share_root"

copy_images() {
  local source_dir="$1"
  local prefix="$2"

  if [[ ! -d "$source_dir" ]]; then
    return
  fi

  while IFS= read -r -d '' file; do
    local base ext name target
    base="$(basename "$file")"
    ext="${base##*.}"
    name="${base%.*}"
    target="$share_root/${prefix}-${name}.${ext}"

    if [[ -e "$target" ]]; then
      local i=2
      while [[ -e "$share_root/${prefix}-${name}-${i}.${ext}" ]]; do
        i=$((i + 1))
      done
      target="$share_root/${prefix}-${name}-${i}.${ext}"
    fi

    cp -p "$file" "$target"
  done < <(find "$source_dir" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) -print0)
}

copy_images "/Users/sanchay/Downloads/tripz-assets" "assets"
copy_images "/Users/sanchay/Downloads/tripz-locked-react/public/images" "locked"
copy_images "/Users/sanchay/Downloads/tripz-modern-site/public/images" "modern"
copy_images "/Users/sanchay/Downloads/tripz-locked-react/artifacts" "locked-artifact"
copy_images "/Users/sanchay/Downloads/tripz-modern-site/artifacts" "modern-artifact"

count="$(find "$share_root" -maxdepth 1 -type f | wc -l | tr -d ' ')"
printf '%s\n' "$share_root"
printf 'Copied %s images\n' "$count"
