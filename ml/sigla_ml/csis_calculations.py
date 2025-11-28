#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSIS Calculation Module

Implements the official CSIS (Citizen Satisfaction Index System) calculation methodology
including the Dynamic Cut-Off Rule and Action Grid Quadrant classification.

Based on the DILG CSIS Manual for Philippine Local Government Units.
"""

import math
from typing import Dict, Tuple, Optional, List
import logging

logger = logging.getLogger(__name__)


def calculate_margin_of_error(sample_size: int) -> float:
    """
    Calculate Margin of Error (MoE) using the CSIS formula.
    
    Formula: MoE = 0.98 / sqrt(n)
    where n is the sample size
    
    Args:
        sample_size: Number of respondents (n)
        
    Returns:
        Margin of Error as a decimal (e.g., 0.155 for 15.5%)
    """
    if sample_size <= 0:
        return 0.0
    
    return 0.98 / math.sqrt(sample_size)


def calculate_dynamic_cutoff(moe: float) -> float:
    """
    Calculate the dynamic cut-off threshold using the CSIS formula.
    
    Formula: Cut-off = 0.50 + MoE
    
    Args:
        moe: Margin of Error as a decimal
        
    Returns:
        Cut-off threshold as a decimal (e.g., 0.655 for 65.5%)
    """
    return 0.50 + moe


def classify_score(score: float, moe: float) -> str:
    """
    Classify a score as "High" or "Low" using the Dynamic Cut-Off Rule.
    
    Steps:
    1. Calculate Cut-off = 0.50 + MoE
    2. If score >= cut-off, rating is "High"
    3. If score < cut-off, rating is "Low"
    
    Args:
        score: Percentage score as a decimal (e.g., 0.75 for 75%)
        moe: Margin of Error as a decimal
        
    Returns:
        "High" or "Low"
    """
    cutoff = calculate_dynamic_cutoff(moe)
    return "High" if score >= cutoff else "Low"


def determine_action_grid_quadrant(
    satisfaction_score: float,
    satisfaction_moe: float,
    need_for_action_score: float,
    need_for_action_moe: float
) -> Tuple[str, str, Dict]:
    """
    Determine the Action Grid Quadrant using the official CSIS methodology.
    
    Quadrants:
    - "Opportunities for Improvement" (Highest Priority): Low Satisfaction + High Need for Action
    - "Continued Emphasis" (High Importance): High Satisfaction + High Need for Action
    - "Exceeded Expectations" (Key Strength): High Satisfaction + Low Need for Action
    - "Secondary Priority" (Lowest Priority): Low Satisfaction + Low Need for Action
    
    Args:
        satisfaction_score: Satisfaction percentage as decimal (0-1)
        satisfaction_moe: Margin of Error for satisfaction
        need_for_action_score: Need for Action percentage as decimal (0-1)
        need_for_action_moe: Margin of Error for need for action
        
    Returns:
        Tuple of (quadrant_name, priority_level, details_dict)
    """
    # Classify satisfaction and need for action
    satisfaction_rating = classify_score(satisfaction_score, satisfaction_moe)
    need_for_action_rating = classify_score(need_for_action_score, need_for_action_moe)
    
    # Calculate cut-offs for reference
    satisfaction_cutoff = calculate_dynamic_cutoff(satisfaction_moe)
    need_for_action_cutoff = calculate_dynamic_cutoff(need_for_action_moe)
    
    # Determine quadrant based on the classification matrix
    if satisfaction_rating == "Low" and need_for_action_rating == "High":
        quadrant = "Opportunities for Improvement"
        priority = "Highest Priority"
    elif satisfaction_rating == "High" and need_for_action_rating == "High":
        quadrant = "Continued Emphasis"
        priority = "High Importance"
    elif satisfaction_rating == "High" and need_for_action_rating == "Low":
        quadrant = "Exceeded Expectations"
        priority = "Key Strength"
    else:  # Low satisfaction and Low need for action
        quadrant = "Secondary Priority"
        priority = "Lowest Priority"
    
    details = {
        "satisfaction_score": satisfaction_score,
        "satisfaction_moe": satisfaction_moe,
        "satisfaction_cutoff": satisfaction_cutoff,
        "satisfaction_rating": satisfaction_rating,
        "need_for_action_score": need_for_action_score,
        "need_for_action_moe": need_for_action_moe,
        "need_for_action_cutoff": need_for_action_cutoff,
        "need_for_action_rating": need_for_action_rating,
        "quadrant": quadrant,
        "priority": priority
    }
    
    return quadrant, priority, details


def calculate_service_metrics_with_moe(
    satisfaction_count: int,
    satisfaction_total: int,
    need_for_action_count: int,
    need_for_action_total: int
) -> Dict:
    """
    Calculate service metrics including scores, MoE, and Action Grid classification.
    
    Args:
        satisfaction_count: Number of satisfied respondents
        satisfaction_total: Total respondents who answered satisfaction questions
        need_for_action_count: Number who indicated need for action
        need_for_action_total: Total respondents who answered need for action questions
        
    Returns:
        Dictionary with complete metrics and classification
    """
    # Calculate satisfaction score
    if satisfaction_total > 0:
        satisfaction_score = satisfaction_count / satisfaction_total
        satisfaction_moe = calculate_margin_of_error(satisfaction_total)
    else:
        satisfaction_score = 0.0
        satisfaction_moe = 0.0
    
    # Calculate need for action score
    if need_for_action_total > 0:
        need_for_action_score = need_for_action_count / need_for_action_total
        need_for_action_moe = calculate_margin_of_error(need_for_action_total)
    else:
        need_for_action_score = 0.0
        need_for_action_moe = 0.0
    
    # Determine Action Grid Quadrant
    if satisfaction_total > 0 and need_for_action_total > 0:
        quadrant, priority, details = determine_action_grid_quadrant(
            satisfaction_score,
            satisfaction_moe,
            need_for_action_score,
            need_for_action_moe
        )
    else:
        quadrant = "Insufficient Data"
        priority = "N/A"
        details = {
            "satisfaction_score": satisfaction_score,
            "satisfaction_moe": satisfaction_moe,
            "need_for_action_score": need_for_action_score,
            "need_for_action_moe": need_for_action_moe,
            "quadrant": quadrant,
            "priority": priority
        }
    
    return {
        "satisfaction": {
            "count": satisfaction_count,
            "total": satisfaction_total,
            "score": satisfaction_score,
            "percentage": round(satisfaction_score * 100, 1),
            "moe": satisfaction_moe,
            "cutoff": calculate_dynamic_cutoff(satisfaction_moe),
            "rating": classify_score(satisfaction_score, satisfaction_moe) if satisfaction_total > 0 else "N/A"
        },
        "need_for_action": {
            "count": need_for_action_count,
            "total": need_for_action_total,
            "score": need_for_action_score,
            "percentage": round(need_for_action_score * 100, 1),
            "moe": need_for_action_moe,
            "cutoff": calculate_dynamic_cutoff(need_for_action_moe),
            "rating": classify_score(need_for_action_score, need_for_action_moe) if need_for_action_total > 0 else "N/A"
        },
        "action_grid": {
            "quadrant": quadrant,
            "priority": priority,
            "details": details
        }
    }


def generate_executive_summary_data(service_metrics: Dict[str, Dict]) -> Dict:
    """
    Generate structured data for executive summary based on Action Grid classifications.
    
    Args:
        service_metrics: Dictionary of service names to their metrics
        
    Returns:
        Dictionary with categorized services for executive summary
    """
    exceeded_expectations = []
    continued_emphasis = []
    opportunities_for_improvement = []
    secondary_priority = []
    
    for service_name, metrics in service_metrics.items():
        quadrant = metrics.get("action_grid", {}).get("quadrant", "Insufficient Data")
        
        service_summary = {
            "service": service_name,
            "satisfaction_percentage": metrics["satisfaction"]["percentage"],
            "need_for_action_percentage": metrics["need_for_action"]["percentage"],
            "quadrant": quadrant,
            "priority": metrics["action_grid"]["priority"]
        }
        
        if quadrant == "Exceeded Expectations":
            exceeded_expectations.append(service_summary)
        elif quadrant == "Continued Emphasis":
            continued_emphasis.append(service_summary)
        elif quadrant == "Opportunities for Improvement":
            opportunities_for_improvement.append(service_summary)
        elif quadrant == "Secondary Priority":
            secondary_priority.append(service_summary)
    
    return {
        "key_strengths": exceeded_expectations,
        "high_importance": continued_emphasis,
        "critical_priorities": opportunities_for_improvement,
        "secondary_priorities": secondary_priority,
        "summary": {
            "total_services": len(service_metrics),
            "strengths_count": len(exceeded_expectations),
            "critical_count": len(opportunities_for_improvement),
            "high_importance_count": len(continued_emphasis),
            "secondary_count": len(secondary_priority)
        }
    }


# Example usage and testing
if __name__ == "__main__":
    # Example: Service with 40 respondents
    sample_size = 40
    moe = calculate_margin_of_error(sample_size)
    print(f"Sample size: {sample_size}")
    print(f"Margin of Error: {moe:.3f} ({moe*100:.1f}%)")
    print(f"Dynamic Cut-off: {calculate_dynamic_cutoff(moe):.3f}")
    print()
    
    # Example: Free Basic Medicine Program
    satisfaction_score = 0.75  # 75%
    need_for_action_score = 0.375  # 37.5%
    
    quadrant, priority, details = determine_action_grid_quadrant(
        satisfaction_score, moe,
        need_for_action_score, moe
    )
    
    print("Free Basic Medicine Program:")
    print(f"  Satisfaction: {satisfaction_score*100}% (Rating: {details['satisfaction_rating']})")
    print(f"  Need for Action: {need_for_action_score*100}% (Rating: {details['need_for_action_rating']})")
    print(f"  Quadrant: {quadrant}")
    print(f"  Priority: {priority}")
    print()
    
    # Example: Road and Bridge Maintenance (110 respondents)
    sample_size_2 = 110
    moe_2 = calculate_margin_of_error(sample_size_2)
    satisfaction_score_2 = 0.45  # 45%
    need_for_action_score_2 = 0.85  # 85%
    
    quadrant_2, priority_2, details_2 = determine_action_grid_quadrant(
        satisfaction_score_2, moe_2,
        need_for_action_score_2, moe_2
    )
    
    print("Road and Bridge Maintenance:")
    print(f"  Sample size: {sample_size_2}, MoE: {moe_2:.3f}")
    print(f"  Satisfaction: {satisfaction_score_2*100}% (Rating: {details_2['satisfaction_rating']})")
    print(f"  Need for Action: {need_for_action_score_2*100}% (Rating: {details_2['need_for_action_rating']})")
    print(f"  Quadrant: {quadrant_2}")
    print(f"  Priority: {priority_2}")
