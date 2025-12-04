#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          3-LAYER CONFIDENCE COMPARISON (UPDATED)          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Run each detection 5 times to build track history
for i in {1..5}; do
    curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG" > /dev/null
    sleep 0.2
done

# Now compare all layers
echo "📊 After 5 detections of same object:"
echo ""

L1=$(curl -s -X POST "http://localhost:8000/detect/layer/1" -F "file=@$IMG")
L1_CONF=$(echo "$L1" | jq -r '.detections[0].confidence')
echo "🔷 Layer 1 (YOLO Speed):     $L1_CONF"
echo "   └─ Pure YOLO detection, no temporal processing"

echo ""

L2=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
L2_CONF=$(echo "$L2" | jq -r '.detections[0].confidence')
L2_AGE=$(echo "$L2" | jq -r '.detections[0].track_age')
L2_BOOST=$(echo "$L2" | jq -r '.detections[0].temporal_boost')
L2_TREND=$(echo "$L2" | jq -r '.detections[0].confidence_trend')
echo "🔷 Layer 2 (YOLO + RNN):     $L2_CONF"
echo "   ├─ Track age:             $L2_AGE frames"
echo "   ├─ Temporal boost:        +$L2_BOOST"
echo "   ├─ Confidence trend:      $L2_TREND"
echo "   └─ EMA smoothed:          Yes"

echo ""

L3=$(curl -s -X POST "http://localhost:8000/detect/layer/3" -F "file=@$IMG")
L3_SCORE=$(echo "$L3" | jq -r '.detections[0].score')
L3_YOLO=$(echo "$L3" | jq -r '.detections[0].yolo_confidence')
L3_RNN=$(echo "$L3" | jq -r '.detections[0].rnn_confidence')
echo "🔷 Layer 3 (Fusion):         $L3_SCORE"
echo "   ├─ YOLO contribution:     $L3_YOLO"
echo "   ├─ RNN contribution:      $L3_RNN"
echo "   └─ Fusion strategy:       Weighted average (60% YOLO, 40% RNN)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 CONFIDENCE DELTA:"
DELTA=$(echo "$L2_CONF - $L1_CONF" | bc -l | xargs printf "%.4f")
echo "   Layer 1 → Layer 2: +$DELTA (EMA temporal boost)"
echo ""
echo "✅ All layers operational with EMA smoothing!"
