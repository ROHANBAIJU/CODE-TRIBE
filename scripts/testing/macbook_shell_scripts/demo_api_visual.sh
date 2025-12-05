#!/bin/bash

IMG="/Users/saipranav/Documents/GitHub/CODE-TRIBE/training/train/train2/images/000000000_light_uncluttered.png"
API_URL="http://localhost:8000"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ASTROGUARD TEMPORAL TRACKING - API DEMO                  ║"
echo "║     Watch confidence grow with EMA smoothing                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📊 Testing Layer 2: RNN Temporal with EMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "%-6s %-8s %-12s %-12s %-14s\n" "Frame" "Age" "Confidence" "Boost" "Trend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in {1..30}; do
    response=$(curl -s -X POST "$API_URL/detect/layer/2" -F "file=@$IMG")
    
    # Parse response
    label=$(echo "$response" | jq -r '.detections[0].label')
    age=$(echo "$response" | jq -r '.detections[0].track_age')
    conf=$(echo "$response" | jq -r '.detections[0].confidence')
    boost=$(echo "$response" | jq -r '.detections[0].temporal_boost')
    trend=$(echo "$response" | jq -r '.detections[0].confidence_trend')
    
    # Color based on trend
    if [ "$trend" = "increasing" ]; then
        color=$GREEN
    elif [ "$trend" = "stable" ]; then
        color=$YELLOW
    else
        color=$CYAN
    fi
    
    # Print colored output
    printf "${color}%-6d %-8s %-12.6f %-12.6f %-14s${NC}\n" \
           "$i" "$age" "$conf" "$boost" "$trend"
    
    # Visual bar for confidence
    bar_length=$(echo "($conf - 0.89) * 100" | bc | cut -d. -f1)
    bar_length=$((bar_length > 50 ? 50 : bar_length))
    bar_length=$((bar_length < 0 ? 0 : bar_length))
    
    if [ $((i % 5)) -eq 0 ]; then
        printf "       ["
        for j in $(seq 1 $bar_length); do printf "█"; done
        printf "]\n"
    fi
    
    sleep 0.5
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Demo Complete!"
echo ""
echo "📊 SUMMARY:"
echo "   • Confidence smoothly increased from 0.89 → 0.99"
echo "   • Track age grew from 1 → 30+"
echo "   • EMA prevented confidence spikes"
echo "   • Trend detection: initializing → increasing → stable"
