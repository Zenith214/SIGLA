/**
 * Example API Endpoint Implementation using CPAPValidationService
 * 
 * This file demonstrates how to use the CPAPValidationService in API endpoints
 * to validate CPAP operations and enforce business rules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';

/**
 * Example: Submit CPAP Endpoint
 * POST /api/cpap/[id]/submit
 */
export async function submitCPAPExample(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cpapId = parseInt(params.id);
    
    // Get user info from session (pseudo-code)
    const userRole = 'Officer'; // From session
    const userBarangayId = 123; // From session
    
    // Fetch CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate user permission
    const permissionResult = CPAPValidationService.validateUserPermission(
      userRole,
      userBarangayId,
      cpap,
      'submit'
    );
    
    if (!permissionResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: permissionResult.errors[0] 
        },
        { status: 403 }
      );
    }
    
    // Validate for submission
    const validationResult = CPAPValidationService.validateForSubmission(cpap);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.errors 
        },
        { status: 400 }
      );
    }
    
    // Submit CPAP
    await CPAPService.submitCPAP(cpapId);
    
    return NextResponse.json({ 
      success: true,
      message: 'CPAP submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting CPAP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit CPAP' 
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Approve CPAP Endpoint
 * POST /api/cpap/[id]/approve
 */
export async function approveCPAPExample(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cpapId = parseInt(params.id);
    const body = await req.json();
    const { comments } = body;
    
    // Get user info from session
    const userRole = 'Admin'; // From session
    
    // Verify user is Admin
    if (userRole.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only Admin users can approve CPAPs' 
        },
        { status: 403 }
      );
    }
    
    // Fetch CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate for approval
    const validationResult = CPAPValidationService.validateForApproval(cpap);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.errors 
        },
        { status: 400 }
      );
    }
    
    // Approve CPAP
    await CPAPService.approveCPAP(cpapId, comments);
    
    return NextResponse.json({ 
      success: true,
      message: 'CPAP approved successfully'
    });
  } catch (error) {
    console.error('Error approving CPAP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to approve CPAP' 
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Request Revision Endpoint
 * POST /api/cpap/[id]/request-revision
 */
export async function requestRevisionExample(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cpapId = parseInt(params.id);
    const body = await req.json();
    const { comments } = body;
    
    // Get user info from session
    const userRole = 'Admin'; // From session
    
    // Verify user is Admin
    if (userRole.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only Admin users can request revisions' 
        },
        { status: 403 }
      );
    }
    
    // Fetch CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate for revision request
    const validationResult = CPAPValidationService.validateForRevisionRequest(cpap, comments);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.errors 
        },
        { status: 400 }
      );
    }
    
    // Request revision
    await CPAPService.requestRevision(cpapId, comments);
    
    return NextResponse.json({ 
      success: true,
      message: 'Revision requested successfully'
    });
  } catch (error) {
    console.error('Error requesting revision:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to request revision' 
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Update CPAP Items Endpoint
 * PUT /api/cpap/[id]
 */
export async function updateCPAPItemsExample(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cpapId = parseInt(params.id);
    const body = await req.json();
    const { items, deleted_item_ids } = body;
    
    // Get user info from session
    const userRole = 'Officer'; // From session
    const userBarangayId = 123; // From session
    
    // Fetch CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate user permission
    const permissionResult = CPAPValidationService.validateUserPermission(
      userRole,
      userBarangayId,
      cpap,
      'edit'
    );
    
    if (!permissionResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: permissionResult.errors[0] 
        },
        { status: 403 }
      );
    }
    
    // Validate CPAP can be edited
    const editValidation = CPAPValidationService.validateForEdit(cpap);
    
    if (!editValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errors: editValidation.errors 
        },
        { status: 400 }
      );
    }
    
    // Validate each item
    const itemErrors: string[] = [];
    items.forEach((item: any, index: number) => {
      const itemValidation = CPAPValidationService.validateItem(item);
      if (!itemValidation.valid) {
        itemErrors.push(`Item ${index + 1}: ${itemValidation.errors.join(', ')}`);
      }
    });
    
    if (itemErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          errors: itemErrors 
        },
        { status: 400 }
      );
    }
    
    // Update CPAP items
    const updatedCPAP = await CPAPService.updateCPAPItems(
      cpapId,
      items,
      deleted_item_ids
    );
    
    return NextResponse.json({ 
      success: true,
      cpap: updatedCPAP
    });
  } catch (error) {
    console.error('Error updating CPAP items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update CPAP items' 
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Update Progress Endpoint
 * PUT /api/cpap/[id]/progress
 */
export async function updateProgressExample(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cpapId = parseInt(params.id);
    const body = await req.json();
    const { items } = body;
    
    // Get user info from session
    const userRole = 'Officer'; // From session
    const userBarangayId = 123; // From session
    
    // Fetch CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate user permission
    const permissionResult = CPAPValidationService.validateUserPermission(
      userRole,
      userBarangayId,
      cpap,
      'update_progress'
    );
    
    if (!permissionResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: permissionResult.errors[0] 
        },
        { status: 403 }
      );
    }
    
    // Validate progress update
    const validationResult = CPAPValidationService.validateProgressUpdate(cpap, items);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.errors 
        },
        { status: 400 }
      );
    }
    
    // Update progress
    const updatedCPAP = await CPAPService.updateProgress(cpapId, items);
    
    return NextResponse.json({ 
      success: true,
      cpap: updatedCPAP
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update progress' 
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Status Transition Validation
 * This demonstrates how to validate status transitions before updating
 */
export function validateStatusTransitionExample(
  currentStatus: string,
  newStatus: string
): boolean {
  const isValid = CPAPValidationService.validateStatusTransition(
    currentStatus as any,
    newStatus as any
  );
  
  if (!isValid) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }
  
  return true;
}
