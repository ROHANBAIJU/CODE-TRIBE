#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TESTING EMA TEMPORAL CONFIDENCE GROWTH                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Verify new features exist
echo "🔍 Test 1: Checking if new code is loaded..."
response=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")

trend=$(echo "$response" | jq -r '.detections[0].confidence_trend')
ema=$(echo "$response" | jq -r '.detections[0].ema_smoothed')

if [ "$trend" = "null" ] || [ -z "$trend" ]; then
    echo "❌ FAILED: confidence_trend is missing"
    echo "   Old code is still running!"
    exit 1
fi

if [ "$ema" = "null" ] || [ -z "$ema" ]; then
    echo "❌ FAILED: ema_smoothed is missing"
    echo "   Old code is still running!"
    exit 1
fi

echo "✅ PASSED: New EMA features detected"
echo "   - confidence_trend: $trend"
echo "   - ema_smoothed: $ema"
echo ""

# Test 2: Monitor confidence growth over 20 detections
echo "📈 Test 2: Monitoring confidence growth..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "%-6s %-8s %-10s %-10s %-12s\n" "Test" "Age" "Conf" "Boost" "Trend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in {1..20}; do
    resp=$(curl -s -X POST "http://localhost:8000/detect/layer/2" -F "file=@$IMG")
    
    age=$(echo "$resp" | jq -r '.detections[0].track_age')
    conf=$(echo "$resp" | jq -r '.detections[0].confidence')
    boost=$(echo "$resp" | jq -r '.detections[0].temporal_boost')
    trend=$(echo "$resp" | jq -r '.detections[0].confidence_trend')
    
    printf "%-6d %-8s %-10.4f %-10.4f %-12s\n" "$i" "$age" "$conf" "$boost" "$trend"
    
    sleep 0.3
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Test Complete!"
echo ""
echo "📊 VERIFICATION:"
echo "   ✓ Confidence should gradually increase"
echo "   ✓ Boost should grow with track age"
echo "   ✓ Trend should show 'increasing' or 'stable'"
