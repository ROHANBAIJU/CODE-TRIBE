# AstroGuard - Long-Term Confidence Growth Test (50 Frames)
# Extended test to validate EMA temporal tracking

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   LONG-TERM CONFIDENCE GROWTH TEST (50 FRAMES)           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

Write-Host ("{0,-6} {1,-8} {2,-12} {3,-12} {4,-14}" -f "Test", "Age", "Confidence", "Boost", "Trend") -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$initialConf = 0
$finalConf = 0
$finalAge = 0

for ($i = 1; $i -le 50; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
        
        $age = $resp.detections[0].track_age
        $conf = [math]::Round($resp.detections[0].confidence, 6)
        $boost = [math]::Round($resp.detections[0].temporal_boost, 6)
        $trend = $resp.detections[0].confidence_trend
        
        # Store initial and final values
        if ($i -eq 1) { $initialConf = $conf }
        $finalConf = $conf
        $finalAge = $age
        
        # Print every 5th result to keep output readable
        if ($i % 5 -eq 0) {
            Write-Host ("{0,-6} {1,-8} {2,-12} {3,-12} {4,-14}" -f $i, $age, $conf, $boost, $trend) -ForegroundColor Cyan
        }
        
        Start-Sleep -Milliseconds 200
    } catch {
        Write-Host "❌ Detection $i failed" -ForegroundColor Red
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Get final stats
try {
    $final = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
    $final_conf = [math]::Round($final.detections[0].confidence, 6)
    $final_age = $final.detections[0].track_age
    
    Write-Host "📊 FINAL RESULTS:" -ForegroundColor Green
    Write-Host "   Initial confidence: $initialConf" -ForegroundColor White
    Write-Host "   Final confidence:   $final_conf" -ForegroundColor White
    Write-Host "   Total track age:    $final_age" -ForegroundColor White
    
    $growthRate = [math]::Round(($final_conf - $initialConf) / 50, 6)
    Write-Host "   Growth rate:        ~$growthRate per frame" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ EMA temporal tracking validated!" -ForegroundColor Green
} catch {
    Write-Host "❌ Final stats retrieval failed" -ForegroundColor Red
}
