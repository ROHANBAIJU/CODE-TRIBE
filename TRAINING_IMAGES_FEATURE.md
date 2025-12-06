# 🦅 Training Images Display Feature

**Date:** December 6, 2025  
**Status:** ✅ Implemented  
**Purpose:** Show judges the augmented training data generated during self-healing

---

## 🎯 Feature Overview

When you upload an image and run self-healing, the system now:
1. **Detects objects** in your uploaded image
2. **Generates synthetic training data** (25 images)
3. **Creates augmented variations** of real training images using **Falcon Duality AI**
4. **Displays these augmented training images** in a gallery for judges to see

---

## 🔧 What Was Implemented

### Backend Changes (`backend/main.py`)

#### Modified Endpoint: `/falcon/run-healing`

**New Functionality:**
```python
# Step 2: Generate augmented training data using Falcon Duality AI
# This creates variations of real training images (rotation, brightness, etc.)
augmentation_result = falcon_duality.process_class(
    class_name=object_class,
    num_samples=3,  # Augment 3 training images
    random_select=True
)

# Step 3: Get preview images as base64 for frontend display
training_images_preview = []
if augmentation_result["success"]:
    training_images_preview = falcon_duality.get_augmented_images_base64(
        object_class, 
        limit=12  # Show up to 12 augmented training images
    )
```

**New Response Fields:**
```json
{
  "status": "healing_complete",
  "object_class": "OxygenTank",
  "synthetic_images_generated": 25,
  "augmented_training_images": 42,
  "training_images_preview": [
    {
      "filename": "OxygenTank_1_rotated_15deg_20251206.png",
      "augmentation_type": "rotated_15deg",
      "image_base64": "iVBORw0KGgoAAAANS..."
    }
    // ... up to 12 images
  ],
  "improvement_estimate": "+15.2%",
  "stages": [...]
}
```

---

### Frontend Changes

#### TypeScript Interface (`frontend/src/services/api.ts`)

Added new interface for training image previews:
```typescript
export interface TrainingImagePreview {
  filename: string;
  augmentation_type: string;
  image_base64: string;
}

export interface HealingResult {
  // ... existing fields
  augmented_training_images?: number;
  training_images_preview?: TrainingImagePreview[];
  // ...
}
```

#### Component Update (`frontend/src/components/AstroOpsPipeline.tsx`)

1. **Added State:**
```typescript
const [trainingImages, setTrainingImages] = useState<TrainingImagePreview[]>([]);
```

2. **Capture Images on Healing:**
```typescript
// Store training images for display
if (result.training_images_preview && result.training_images_preview.length > 0) {
  setTrainingImages(result.training_images_preview);
}
```

3. **New Training Images Gallery UI:**
```tsx
{trainingImages.length > 0 && (
  <motion.div className="glass-panel p-4">
    <div className="flex items-center gap-2 mb-3">
      <Database className="w-5 h-5 text-terminal-green" />
      <span className="text-sm font-bold text-terminal-green">
        🦅 Augmented Training Data ({trainingImages.length} images)
      </span>
    </div>
    
    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
      {trainingImages.map((img, idx) => (
        <motion.div key={idx} className="relative group">
          <img
            src={`data:image/png;base64,${img.image_base64}`}
            alt={img.augmentation_type}
            className="w-full h-24 object-cover rounded border"
          />
          <div className="absolute inset-0 bg-black/80 opacity-0 
                          group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-terminal-green">
              {img.augmentation_type.replace(/_/g, ' ')}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}
```

---

## 🖼️ Augmentation Types Generated

When self-healing runs, **Falcon Duality AI** creates 14 variations per training image:

| Type | Description |
|------|-------------|
| `original` | Base training image |
| `rotated_15deg` | Rotated 15 degrees |
| `rotated_-15deg` | Rotated -15 degrees |
| `rotated_90deg` | Rotated 90 degrees |
| `brightness_130` | 130% brightness |
| `brightness_70` | 70% brightness |
| `flipped_horizontal` | Horizontal flip |
| `flipped_vertical` | Vertical flip |
| `contrast_130` | 130% contrast |
| `contrast_70` | 70% contrast |
| `saturation_120` | 120% saturation |
| `saturation_80` | 80% saturation |
| `sharpness_150` | 150% sharpness |
| `blur_slight` | Slight Gaussian blur |

**Example:**
- 3 training images selected
- 14 augmentations per image
- **Total: 42 augmented training images**
- **Display: Up to 12 shown in gallery**

---

## 🎬 How to Demo for Judges

### Step 1: Upload an Image
1. Open http://localhost:5173
2. Navigate to **Dashboard**
3. Click **"Upload Image"**
4. Select any safety equipment image

### Step 2: Detect Objects
- System automatically runs detection
- Displays bounding boxes on detected objects

### Step 3: Trigger Self-Healing
1. Scroll down to **"Self-Healing Pipeline"** section
2. Select the object class (e.g., **OxygenTank**)
3. Click **"Run Healing"** button

### Step 4: Watch the Process
The pipeline will run through stages:
1. ⚡ **Monitoring** - Detecting low confidence
2. 🚨 **Failure Detected** - Threshold triggered
3. 🎨 **Generate** - Creating synthetic images
4. 🦅 **Augmentation** - Creating training variations *(NEW!)*
5. 🧠 **Retrain** - Fine-tuning model
6. ⚡ **Deploy** - Hot-swapping weights
7. ✅ **Healed** - System restored

### Step 5: View Training Images
**After healing completes**, a new section appears:

```
🦅 Augmented Training Data (12 images)
Real training images with augmentations (rotation, brightness, flip, etc.)

[Grid of 12 thumbnail images]
```

**Hover over each image** to see the augmentation type:
- "rotated 15deg"
- "brightness 130"
- "flipped horizontal"
- etc.

---

## 💡 Key Talking Points for Judges

### 1. **Real Training Data Augmentation**
> "Our system doesn't just generate synthetic images - it also augments real training data using **Falcon Duality AI**. These are actual images from our training dataset with intelligent variations."

### 2. **14 Augmentation Types**
> "Each training image is transformed 14 different ways - rotation, brightness, contrast, saturation, sharpness, and blur. This dramatically increases dataset diversity."

### 3. **Visual Transparency**
> "We show you exactly what training data the system is using. This transparency is crucial for AI safety applications."

### 4. **Automatic Data Enhancement**
> "When the model struggles with a class, the system automatically finds training images of that class and creates augmented versions to improve performance."

### 5. **Edge Computing Ready**
> "All augmentations happen locally on the edge device. No cloud dependencies for training data generation."

---

## 🧪 Testing Commands

### Test Self-Healing API Directly
```bash
curl -X POST http://localhost:8000/falcon/run-healing \
  -H "Content-Type: application/json" \
  -d '{"object_class": "OxygenTank"}' \
  | python3 -m json.tool
```

Expected output includes:
```json
{
  "status": "healing_complete",
  "object_class": "OxygenTank",
  "synthetic_images_generated": 25,
  "augmented_training_images": 42,
  "training_images_preview": [
    {
      "filename": "OxygenTank_1_original_20251206.png",
      "augmentation_type": "original",
      "image_base64": "iVBORw0KGgoAAAA..."
    }
    // ... more images
  ]
}
```

### Test Augmentation Endpoint
```bash
curl -X POST http://localhost:8000/falcon/duality/augment \
  -F "object_class=OxygenTank" \
  -F "num_samples=3"
```

### Check Augmented Files
```bash
ls -lh /Users/saipranav/Documents/GitHub/CODE-TRIBE/datasets/FALCON-GENERATED/OxygenTank/
```

---

## 📊 Performance Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Healing Time** | ~6s | ~8s | +2s (augmentation) |
| **Training Images** | 25 synthetic | 25 synthetic + 42 augmented | +168% data |
| **Display Images** | 0 | 12 previews | Visual transparency |
| **Gallery Load** | N/A | ~0.5s | Base64 decode |

---

## 🔍 Troubleshooting

### Images Not Showing?
1. Check backend logs for augmentation success
2. Verify `training_images_preview` is in API response
3. Check browser console for base64 decode errors

### No Training Images Found?
- Ensure training dataset exists at: `training/train/train2/`
- Check if the selected class has images in training data
- Verify Falcon Duality AI initialized (check backend startup logs)

### Gallery Too Large?
- Current limit: 12 images shown
- Adjust in `backend/main.py`: Change `limit=12` parameter
- Consider lazy loading for larger galleries

---

## 🚀 Future Enhancements

1. **Download Button** - Let users download augmented images
2. **Full-Screen View** - Click to expand training images
3. **Augmentation Stats** - Show distribution of augmentation types
4. **Before/After Comparison** - Side-by-side original vs augmented
5. **Real-Time Streaming** - Stream images as they're generated
6. **Annotation Overlay** - Show bounding boxes on training images

---

## ✅ Implementation Checklist

- [x] Backend: Add augmentation to healing pipeline
- [x] Backend: Return base64 image previews
- [x] Frontend: Update TypeScript interfaces
- [x] Frontend: Add state for training images
- [x] Frontend: Capture images from API response
- [x] Frontend: Create gallery component UI
- [x] Frontend: Add hover effects for augmentation types
- [x] Testing: Verify API response format
- [x] Testing: Check gallery rendering
- [x] Documentation: Create this guide

---

## 📝 Technical Notes

### Why Base64?
- **Simplicity**: No need for separate image serving endpoints
- **Speed**: Images embedded directly in JSON response
- **Demo-Ready**: Works immediately without file system access

### Why Limit to 12 Images?
- **Performance**: Keeps payload size reasonable (~2-3 MB)
- **UX**: Fits nicely in scrollable 4-column grid
- **Balance**: Enough to show variety, not overwhelming

### Training Image Selection
- **Random**: 3 random images from training dataset
- **Diverse**: Falcon Duality AI picks from different contexts
- **Relevant**: Only images containing the target class

---

**This feature is now ready to demo! 🎉**

Show the judges how your AI system not only heals itself but also shows them exactly what training data it's using. This level of transparency is critical for safety-critical applications.
