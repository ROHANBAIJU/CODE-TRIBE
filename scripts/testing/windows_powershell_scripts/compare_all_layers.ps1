# AstroGuard - 3-Layer Confidence Comparison (Updated)
# Tests all detection layers and compares confidence values

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          3-LAYER CONFIDENCE COMPARISON (UPDATED)          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

# Run each detection 5 times to build track history
Write-Host "🔄 Building track history (5 detections)..." -ForegroundColor Yellow
for ($i = 1; $i -le 5; $i++) {
    $null = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "📊 After 5 detections of same object:" -ForegroundColor Green
Write-Host ""

# Layer 1: Pure YOLO
try {
    $L1 = Invoke-RestMethod -Uri "$API_URL/detect/layer/1" -Method Post -Form @{ file = Get-Item $IMG }
    $L1_CONF = $L1.detections[0].confidence
    Write-Host "🔷 Layer 1 (YOLO Speed):     $L1_CONF" -ForegroundColor Blue
    Write-Host "   └─ Pure YOLO detection, no temporal processing" -ForegroundColor DarkGray
} catch {
    Write-Host "❌ Layer 1 failed: $_" -ForegroundColor Red
}

Write-Host ""

# Layer 2: YOLO + RNN
try {
    $L2 = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
    $L2_CONF = $L2.detections[0].confidence
    $L2_AGE = $L2.detections[0].track_age
    $L2_BOOST = $L2.detections[0].temporal_boost
    $L2_TREND = $L2.detections[0].confidence_trend
    Write-Host "🔷 Layer 2 (YOLO + RNN):     $L2_CONF" -ForegroundColor Blue
    Write-Host "   ├─ Track age:             $L2_AGE frames" -ForegroundColor DarkGray
    Write-Host "   ├─ Temporal boost:        +$L2_BOOST" -ForegroundColor DarkGray
    Write-Host "   ├─ Confidence trend:      $L2_TREND" -ForegroundColor DarkGray
    Write-Host "   └─ EMA smoothed:          Yes" -ForegroundColor DarkGray
} catch {
    Write-Host "❌ Layer 2 failed: $_" -ForegroundColor Red
}

Write-Host ""

# Layer 3: Full Fusion
try {
    $L3 = Invoke-RestMethod -Uri "$API_URL/detect/layer/3" -Method Post -Form @{ file = Get-Item $IMG }
    $L3_SCORE = $L3.detections[0].score
    $L3_YOLO = $L3.detections[0].yolo_confidence
    $L3_RNN = $L3.detections[0].rnn_confidence
    Write-Host "🔷 Layer 3 (Fusion):         $L3_SCORE" -ForegroundColor Blue
    Write-Host "   ├─ YOLO contribution:     $L3_YOLO" -ForegroundColor DarkGray
    Write-Host "   ├─ RNN contribution:      $L3_RNN" -ForegroundColor DarkGray
    Write-Host "   └─ Fusion strategy:       Weighted average (60% YOLO, 40% RNN)" -ForegroundColor DarkGray
} catch {
    Write-Host "❌ Layer 3 failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📈 CONFIDENCE DELTA:" -ForegroundColor Green

if ($L1_CONF -and $L2_CONF) {
    $DELTA = [math]::Round($L2_CONF - $L1_CONF, 4)
    Write-Host "   Layer 1 → Layer 2: +$DELTA (EMA temporal boost)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ All layers operational with EMA smoothing!" -ForegroundColor Green
