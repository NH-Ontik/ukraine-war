#!/bin/bash
# Download Ukraine War images from Wikimedia Commons
# NOTE: Filenames here match the actual files used by the site
OUT="$(dirname "$0")"
cd "$OUT" || exit 1

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

download() {
    local url="$1"
    local name="$2"
    sleep 1.5
    if curl -s -L -A "$UA" --connect-timeout 15 --max-time 60 -o "$name" "$url" 2>/dev/null && [ -s "$name" ]; then
        local type
        type=$(file -b "$name" | cut -d, -f1)
        local size
        size=$(du -h "$name" | cut -f1)
        if echo "$type" | grep -qi "html"; then
            echo "FAIL (HTML): $name"
            rm -f "$name"
            return 1
        fi
        echo "OK: $name ($size, $type)"
        return 0
    else
        echo "FAIL: $name"
        rm -f "$name"
        return 1
    fi
}

echo "=== Downloading Ukraine War Images ==="
echo ""

# MAPS
download "https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Ukraine_with_cities.png" "01_ukraine_map_cities.png"
download "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Kyiv_Offensive.png" "02_battle_of_kyiv_map.svg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Russian_invasion_of_Ukraine.svg" "03_invasion_overview_map.svg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Ukraine,_with_Russian-occupied_regions_highlighted.svg" "03_occupied_territories.svg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Ukraine,_with_Russian-occupied_regions_highlighted.svg" "05_russian_occupied_territories_map.svg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Destruction_of_Russian_tanks_by_Ukrainian_troops_in_Mariupol_(2).jpg" "05_russian_tanks_mariupol_4.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Russian_invasion_of_Ukraine_005.jpg" "06_russian_bombardment_kharkiv.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Luhansk_power_station_after_bombing.jpg" "07_luhansk_power_plant.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Bucha_main_street_after_Russian_invasion_of_Ukraine_2.jpg" "08_bucha_main_street.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Battle_of_Kherson_(2022).png" "08_kherson_battle_map.png"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Russian_ship_near_Sevastopol.jpg" "09_russian_ship.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/UA_M-46_gun_01.jpg" "09_ukrainian_artillery.jpg"

# HERO / KEY FIGURES
download "https://commons.wikimedia.org/wiki/Special:FilePath/Volodymyr_Zelensky_2022_official_portrait.jpg" "10_zelenskyy_bucha_crop.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Civilian_evacuation_across_Irpin_River_2022-03-08_1.jpg" "19_civilian_evacuation_irpin.jpg"
download "https://commons.wikimedia.org/wiki/Special:FilePath/Volodymyr_Zelensky_2022_official_portrait.jpg" "22_zelenskyy_official.jpg"

# COMBAT / DESTRUCTION
download "https://commons.wikimedia.org/wiki/Special:FilePath/Russo-Ukrainian_War,_MT-LB_with_Z.jpg" "04_russian_mtlb_z_mark.jpg"

echo ""
echo "=== Download complete ==="
ls -lhS *.png *.jpg *.svg 2>/dev/null | awk '{print $5, $NF}'
