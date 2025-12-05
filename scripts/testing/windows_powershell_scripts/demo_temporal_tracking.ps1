# AstroGuard - Temporal Tracking Demonstration
# Watch confidence increase as object is tracked

$IMG = "Z:\CODE-TRIBE\datasets\TESTING DATASET\images\000000000_light_unclutter.png"
$API_URL = "http://localhost:8000"

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     ASTROGUARD TEMPORAL TRACKING DEMONSTRATION               ║" -ForegroundColor Cyan
Write-Host "║     Watch confidence increase as object is tracked           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
if (-not (Test-Path $IMG)) {
    Write-Host "⚠️  Test image not found at: $IMG" -ForegroundColor Yellow
    Write-Host "   Please update the `$IMG path to a valid test image." -ForegroundColor Yellow
    exit 1
}

for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/detect/fusion" -Method Post -Form @{ file = Get-Item $IMG }
        
        Write-Host "🔄 Detection $i`:" -ForegroundColor Yellow
        
        $detection = $response.detections[0]
        $output = @{
            objects = $response.detections.Count
            primary_detection = @{
                label = $detection.label
                yolo_conf = $detection.yolo_confidence
                rnn_conf = $detection.rnn_confidence
                fused_score = $detection.score
                track_age = $detection.track_age
                temporal_boost = $detection.temporal_boost
                track_id = $detection.track_id
            }
        }
        
        Write-Host ($output | ConvertTo-Json -Depth 3) -ForegroundColor White
        
        # Show confidence progression
        $track_age = $detection.track_age
        $rnn_conf = [math]::Round($detection.rnn_confidence, 3)
        
        $barLength = [math]::Min(20, $track_age)
        $bar = "█" * $barLength
        
        Write-Host "Progress: $bar Age: $track_age | Conf: $rnn_conf" -ForegroundColor Green
        Write-Host ""
        
        Start-Sleep -Milliseconds 500
    } catch {
        Write-Host "❌ Detection $i failed: $_" -ForegroundColor Red
    }
}

Write-Host "✅ Temporal tracking demonstration complete!" -ForegroundColor Green
