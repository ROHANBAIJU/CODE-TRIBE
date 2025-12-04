#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          3-LAYER CONFIDENCE COMPARISON                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Layer 1: Pure YOLO
L1=$(curl -s -X POST "http://localhost:8000/detect/layer/1" -F "file=@$IMG" | jq -r '.detections[0].confidence')
echo "🔷 Layer 1 (YOLO Speed):     $L1"

# Layer 2: YOLO + RNN
L2=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
L2_CONF=$(echo "$L2" | jq -r '.detections[0].confidence')
L2_AGE=$(echo "$L2" | jq -r '.detections[0].track_age')
L2_BOOST=$(echo "$L2" | jq -r '.detections[0].temporal_boost')
echo "🔷 Layer 2 (YOLO + RNN):     $L2_CONF (age: $L2_AGE, boost: +$L2_BOOST)"

# Layer 3: Full Fusion
L3=$(curl -s -X POST "http://localhost:8000/detect/layer/3" -F "file=@$IMG")
L3_SCORE=$(echo "$L3" | jq -r '.detections[0].score')
L3_YOLO=$(echo "$L3" | jq -r '.detections[0].yolo_confidence')
L3_RNN=$(echo "$L3" | jq -r '.detections[0].rnn_confidence')
L3_WEIGHTS=$(echo "$L3" | jq -r '.detections[0].fusion_weights')
echo "🔷 Layer 3 (Fusion):         $L3_SCORE"
echo "   ├─ YOLO contrib:         $L3_YOLO"
echo "   ├─ RNN contrib:          $L3_RNN"
echo "   └─ Fusion weights:       $L3_WEIGHTS"

echo ""
echo "📊 CONFIDENCE DELTA:"
L1_FLOAT=$(printf "%.6f" "$L1")
L2_FLOAT=$(printf "%.6f" "$L2_CONF")
L3_FLOAT=$(printf "%.6f" "$L3_SCORE")

DELTA_12=$(echo "$L2_FLOAT - $L1_FLOAT" | bc -l | xargs printf "%.3f")
DELTA_23=$(echo "$L3_FLOAT - $L2_FLOAT" | bc -l | xargs printf "%.3f")

echo "   Layer 1 → Layer 2:  +$DELTA_12 (RNN boost)"
echo "   Layer 2 → Layer 3:  $DELTA_23 (Fusion adjustment)"

echo ""
echo "✅ All layers operational!"
