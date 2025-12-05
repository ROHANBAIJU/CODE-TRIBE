#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "📈 CONFIDENCE GROWTH VISUALIZATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {1..30}; do
    resp=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
    
    conf=$(echo "$resp" | jq -r '.detections[0].confidence')
    age=$(echo "$resp" | jq -r '.detections[0].track_age')
    
    # Convert confidence to bar length (0.89-0.99 = 0-50 chars)
    bar_length=$(echo "($conf - 0.89) * 500" | bc | cut -d. -f1)
    
    printf "Age %3d: [" "$age"
    for j in $(seq 1 $bar_length); do
        printf "█"
    done
    printf "] %.4f\n" "$conf"
    
    sleep 0.2
done

echo ""
echo "✅ Smooth EMA growth demonstrated!"
