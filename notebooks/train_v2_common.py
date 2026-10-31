"""
MediPath AI Model 2.0 Training Entry Point
Directs to genuine multi-label training pipeline in train_v2_multilabel.py
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from train_v2_multilabel import (
    NORMALIZATION_MAP,
    EXCLUDE_TERMS,
    TAXONOMY_MAP,
    CANONICAL_CLASSES,
    is_excluded,
    normalize_label,
    normalize_text,
    main
)

if __name__ == '__main__':
    main()
