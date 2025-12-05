# AstroGuard - EMA Temporal Confidence Growth Test
# Verifies that EMA features are working correctly

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TESTING EMA TEMPORAL CONFIDENCE GROWTH                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

# Test 1: Verify new features exist
Write-Host "🔍 Test 1: Checking if new code is loaded..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
    
    $trend = $response.detections[0].confidence_trend
    $ema = $response.detections[0].ema_smoothed
    
    if (-not $trend) {
        Write-Host "❌ FAILED: confidence_trend is missing" -ForegroundColor Red
        Write-Host "   Old code is still running!" -ForegroundColor Red
        exit 1
    }
    
    if ($null -eq $ema) {
        Write-Host "❌ FAILED: ema_smoothed is missing" -ForegroundColor Red
        Write-Host "   Old code is still running!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ PASSED: New EMA features detected" -ForegroundColor Green
    Write-Host "   - confidence_trend: $trend" -ForegroundColor Cyan
    Write-Host "   - ema_smoothed: $ema" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ API request failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Monitor confidence growth over 20 detections
Write-Host "📈 Test 2: Monitoring confidence growth..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ("{0,-6} {1,-8} {2,-10} {3,-10} {4,-12}" -f "Test", "Age", "Conf", "Boost", "Trend") -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

for ($i = 1; $i -le 20; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
        
        $age = $resp.detections[0].track_age
        $conf = [math]::Round($resp.detections[0].confidence, 4)
        $boost = [math]::Round($resp.detections[0].temporal_boost, 4)
        $trend = $resp.detections[0].confidence_trend
        
        Write-Host ("{0,-6} {1,-8} {2,-10} {3,-10} {4,-12}" -f $i, $age, $conf, $boost, $trend) -ForegroundColor White
        
        Start-Sleep -Milliseconds 300
    } catch {
        Write-Host "❌ Detection $i failed" -ForegroundColor Red
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✅ Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 VERIFICATION:" -ForegroundColor Yellow
Write-Host "   ✓ Confidence should gradually increase" -ForegroundColor White
Write-Host "   ✓ Boost should grow with track age" -ForegroundColor White
Write-Host "   ✓ Trend should show 'increasing' or 'stable'" -ForegroundColor White
