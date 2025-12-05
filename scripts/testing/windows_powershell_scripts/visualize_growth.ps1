# AstroGuard - Confidence Growth Visualization
# Visual bar chart showing EMA confidence growth

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "📈 CONFIDENCE GROWTH VISUALIZATION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

for ($i = 1; $i -le 30; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "$API_URL/detect/layer/2" -Method Post -Form @{ file = Get-Item $IMG }
        
        $conf = $resp.detections[0].confidence
        $age = $resp.detections[0].track_age
        
        # Convert confidence to bar length (0.89-0.99 = 0-50 chars)
        $barLength = [math]::Max(0, [math]::Min(50, [int](($conf - 0.89) * 500)))
        $bar = "█" * $barLength
        
        $confFormatted = "{0:N4}" -f $conf
        
        # Color gradient based on confidence
        $color = if ($conf -lt 0.92) { "Yellow" }
                 elseif ($conf -lt 0.95) { "Cyan" }
                 else { "Green" }
        
        Write-Host ("Age {0,3}: [{1,-50}] {2}" -f $age, $bar, $confFormatted) -ForegroundColor $color
        
        Start-Sleep -Milliseconds 200
    } catch {
        Write-Host "❌ Detection $i failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Smooth EMA growth demonstrated!" -ForegroundColor Green
