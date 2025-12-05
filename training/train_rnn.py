"""
AstroGuard Layer 2 Training: Multi-Task RNN (Temporal Reasoning)
Goal: Track objects, recognize activities, detect anomalies
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torch.optim as optim
from pathlib import Path
import sys
from tqdm import tqdm
import numpy as np

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))
from backend.core.rnn_temporal import MultiTaskTemporalRNN


class TemporalSequenceDataset(Dataset):
    """Dataset for temporal sequences"""
    def __init__(self, data_path: str):
        # Load with weights_only=False since we have numpy arrays
        self.data = torch.load(data_path, weights_only=False)
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        features = torch.FloatTensor(item['features'])  # (16, 2048)
        activity_label = torch.LongTensor([item['activity_label']])[0]
        anomaly_label = torch.FloatTensor([item['anomaly_label']])
        
        return features, activity_label, anomaly_label


def train_epoch(model, dataloader, optimizer, device):
    """Train for one epoch"""
    model.train()
    
    total_loss = 0
    activity_correct = 0
    activity_total = 0
    
    # Loss functions
    activity_criterion = nn.CrossEntropyLoss()
    anomaly_criterion = nn.BCELoss()
    
    pbar = tqdm(dataloader, desc="Training")
    
    for features, activity_labels, anomaly_labels in pbar:
        features = features.to(device)
        activity_labels = activity_labels.to(device)
        anomaly_labels = anomaly_labels.to(device)
        
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(features)
        
        # Compute losses
        activity_loss = activity_criterion(outputs['activity_logits'], activity_labels)
        anomaly_loss = anomaly_criterion(outputs['anomaly_scores'], anomaly_labels.squeeze())
        
        # Total loss (weighted sum)
        loss = activity_loss + 0.5 * anomaly_loss
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        # Metrics
        total_loss += loss.item()
        _, predicted = outputs['activity_logits'].max(1)
        activity_total += activity_labels.size(0)
        activity_correct += predicted.eq(activity_labels).sum().item()
        
        pbar.set_postfix({
            'loss': f'{loss.item():.4f}',
            'acc': f'{100.*activity_correct/activity_total:.2f}%'
        })
    
    return total_loss / len(dataloader), 100. * activity_correct / activity_total


def validate(model, dataloader, device):
    """Validate model"""
    model.eval()
    
    total_loss = 0
    activity_correct = 0
    activity_total = 0
    
    activity_criterion = nn.CrossEntropyLoss()
    anomaly_criterion = nn.BCELoss()
    
    with torch.no_grad():
        for features, activity_labels, anomaly_labels in dataloader:
            features = features.to(device)
            activity_labels = activity_labels.to(device)
            anomaly_labels = anomaly_labels.to(device)
            
            outputs = model(features)
            
            activity_loss = activity_criterion(outputs['activity_logits'], activity_labels)
            anomaly_loss = anomaly_criterion(outputs['anomaly_scores'], anomaly_labels.squeeze())
            
            loss = activity_loss + 0.5 * anomaly_loss
            total_loss += loss.item()
            
            _, predicted = outputs['activity_logits'].max(1)
            activity_total += activity_labels.size(0)
            activity_correct += predicted.eq(activity_labels).sum().item()
    
    return total_loss / len(dataloader), 100. * activity_correct / activity_total


def main():
    print("=" * 60)
    print("🧠 AstroGuard Layer 2: RNN Training (Temporal Reasoning)")
    print("=" * 60)
    
    # Paths
    this_dir = Path(__file__).parent
    dataset_dir = this_dir / "rnn_dataset"
    
    if not dataset_dir.exists():
        print(f"\n❌ ERROR: Dataset not found at {dataset_dir}")
        print("   Run prepare_rnn_dataset.py first!")
        exit(1)
    
    # Device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\n🖥️  Device: {device}")
    
    # Load datasets
    print("\n📂 Loading datasets...")
    try:
        train_dataset = TemporalSequenceDataset(dataset_dir / 'train_sequences.pt')
        val_dataset = TemporalSequenceDataset(dataset_dir / 'val_sequences.pt')
    except Exception as e:
        print(f"\n❌ ERROR loading datasets: {e}")
        print("   The dataset files may be corrupted.")
        print("   Try re-running prepare_rnn_dataset.py")
        exit(1)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)  # num_workers=0 for Mac
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)
    
    print(f"  ├─ Train sequences: {len(train_dataset)}")
    print(f"  └─ Val sequences: {len(val_dataset)}")
    
    # Initialize model
    print("\n🔧 Initializing Multi-Task RNN...")
    model = MultiTaskTemporalRNN().to(device)
    
    # Optimizer
    optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=5)
    
    # Training loop
    print("\n" + "=" * 60)
    print("🎯 STARTING TRAINING")
    print("=" * 60 + "\n")
    
    best_val_acc = 0
    output_path = this_dir.parent / "backend" / "models"
    output_path.mkdir(exist_ok=True)
    
    for epoch in range(50):
        print(f"\nEpoch {epoch+1}/50")
        print("-" * 60)
        
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, device)
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")
        
        scheduler.step(val_loss)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), output_path / 'rnn_temporal.pt')
            print(f"✅ Best model saved! (Val Acc: {val_acc:.2f}%)")
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETED!")
    print(f"📊 Best Val Accuracy: {best_val_acc:.2f}%")
    print(f"💾 Model saved to: {output_path / 'rnn_temporal.pt'}")
    print("=" * 60)


if __name__ == '__main__':
    from multiprocessing import freeze_support
    freeze_support()
    main()