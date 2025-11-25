import numpy as np
from ensemble_boxes import weighted_boxes_fusion

def apply_wbf(predictions_list, weights, iou_thr=0.5, skip_box_thr=0.1):
    """
    Layer 3: The Arbiter.
    Fuses predictions from multiple YOLO models into a single, high-confidence output.
    """
    boxes_list = []
    scores_list = []
    labels_list = []

    # Loop through each model's prediction
    for pred in predictions_list:
        # YOLOv8/v11 output: normalized xyxyn
        b = pred.boxes.xyxyn.cpu().numpy().tolist()
        s = pred.boxes.conf.cpu().numpy().tolist()
        l = pred.boxes.cls.cpu().numpy().tolist()
        
        boxes_list.append(b)
        scores_list.append(s)
        labels_list.append(l)

    # The Magic: Weighted Box Fusion
    boxes, scores, labels = weighted_boxes_fusion(
        boxes_list,
        scores_list,
        labels_list,
        weights=weights,
        iou_thr=iou_thr,
        skip_box_thr=skip_box_thr
    )

    return boxes, scores, labels