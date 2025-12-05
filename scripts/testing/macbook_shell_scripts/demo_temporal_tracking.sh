#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ASTROGUARD TEMPORAL TRACKING DEMONSTRATION               ║"
echo "║     Watch confidence increase as object is tracked           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

for i in {1..10}; do
  response=$(curl -s -X POST "http://localhost:8000/detect/fusion" -F "file=@$IMG")
  
  echo "🔄 Detection $i:"
  echo "$response" | jq '{
    objects: .detections | length,
    primary_detection: .detections[0] | {
      label,
      yolo_conf: .yolo_confidence,
      rnn_conf: .rnn_confidence,
      fused_score: .score,
      track_age,
      temporal_boost,
      track_id
    }
  }'
  
  # Show confidence progression
  track_age=$(echo "$response" | jq -r '.detections[0].track_age')
  rnn_conf=$(echo "$response" | jq -r '.detections[0].rnn_confidence')
  
  printf "Progress: "
  for ((j=1; j<=$track_age && j<=20; j++)); do
    printf "█"
  done
  printf " Age: %2d | Conf: %.3f\n" "$track_age" "$rnn_conf"
  echo ""
  
  sleep 0.5
done

echo "✅ Temporal tracking demonstration complete!"
