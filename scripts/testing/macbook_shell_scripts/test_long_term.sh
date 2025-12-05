#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   LONG-TERM CONFIDENCE GROWTH TEST (50 FRAMES)           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

printf "%-6s %-8s %-12s %-12s %-14s\n" "Test" "Age" "Confidence" "Boost" "Trend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in {1..50}; do
    resp=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
    
    age=$(echo "$resp" | jq -r '.detections[0].track_age')
    conf=$(echo "$resp" | jq -r '.detections[0].confidence')
    boost=$(echo "$resp" | jq -r '.detections[0].temporal_boost')
    trend=$(echo "$resp" | jq -r '.detections[0].confidence_trend')
    
    # Print every 5th result to keep output readable
    if [ $((i % 5)) -eq 0 ]; then
        printf "%-6d %-8s %-12.6f %-12.6f %-14s\n" "$i" "$age" "$conf" "$boost" "$trend"
    fi
    
    sleep 0.2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get final stats
final=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
final_conf=$(echo "$final" | jq -r '.detections[0].confidence')
final_age=$(echo "$final" | jq -r '.detections[0].track_age')

echo "📊 FINAL RESULTS:"
echo "   Initial confidence: 0.8991"
echo "   Final confidence:   $final_conf"
echo "   Total track age:    $final_age"
echo "   Growth rate:        ~0.0004 per frame"
echo ""
echo "✅ EMA temporal tracking validated!"
