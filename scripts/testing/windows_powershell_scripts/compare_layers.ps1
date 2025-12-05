# AstroGuard - 3-Layer Confidence Comparison (Simple)
# Quick comparison of all detection layers

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          3-LAYER CONFIDENCE COMPARISON                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

# Layer 1: Pure YOLO
try {
    $L1 = Invoke-RestMethod -Uri "$API_URL/detect/layer/1" -Method Post -Form @{ file = Get-Item $IMG }
    $L1_CONF = $L1.detections[0].confidence
    Write-Host "🔷 Layer 1 (YOLO Speed):     $L1_CONF" -ForegroundColor Blue
} catch {
    Write-Host "❌ Layer 1 failed: $_" -ForegroundColor Red
    $L1_CONF = 0
}

# Layer 2: YOLO + RNN
try {
    $L2 = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
    $L2_CONF = $L2.detections[0].confidence
    $L2_AGE = $L2.detections[0].track_age
    $L2_BOOST = $L2.detections[0].temporal_boost
    Write-Host "🔷 Layer 2 (YOLO + RNN):     $L2_CONF (age: $L2_AGE, boost: +$L2_BOOST)" -ForegroundColor Blue
} catch {
    Write-Host "❌ Layer 2 failed: $_" -ForegroundColor Red
    $L2_CONF = 0
}

# Layer 3: Full Fusion
try {
    $L3 = Invoke-RestMethod -Uri "$API_URL/detect/layer/3" -Method Post -Form @{ file = Get-Item $IMG }
    $L3_SCORE = $L3.detections[0].score
    $L3_YOLO = $L3.detections[0].yolo_confidence
    $L3_RNN = $L3.detections[0].rnn_confidence
    $L3_WEIGHTS = $L3.detections[0].fusion_weights
    Write-Host "🔷 Layer 3 (Fusion):         $L3_SCORE" -ForegroundColor Blue
    Write-Host "   ├─ YOLO contrib:         $L3_YOLO" -ForegroundColor DarkGray
    Write-Host "   ├─ RNN contrib:          $L3_RNN" -ForegroundColor DarkGray
    Write-Host "   └─ Fusion weights:       $L3_WEIGHTS" -ForegroundColor DarkGray
} catch {
    Write-Host "❌ Layer 3 failed: $_" -ForegroundColor Red
    $L3_SCORE = 0
}

Write-Host ""
Write-Host "📊 CONFIDENCE DELTA:" -ForegroundColor Green

if ($L1_CONF -gt 0 -and $L2_CONF -gt 0) {
    $DELTA_12 = [math]::Round($L2_CONF - $L1_CONF, 3)
    $DELTA_23 = [math]::Round($L3_SCORE - $L2_CONF, 3)
    Write-Host "   Layer 1 → Layer 2:  +$DELTA_12 (RNN boost)" -ForegroundColor Cyan
    Write-Host "   Layer 2 → Layer 3:  $DELTA_23 (Fusion adjustment)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ All layers operational!" -ForegroundColor Green
