// This script creates a fallback deletion approach using the main /api/assignments route
// if the /api/assignments/[id] route is having issues

const fs = require('fs');

const fallbackDeletionCode = `
  // Delete Assignment (Fallback approach using main route)
  const handleDeleteClick = (assignment: any) => setDeletingAssignment(assignment)
  const handleDeleteConfirm = async () => {
    if (!deletingAssignment) return
    setSaving(true)
    
    try {
      console.log(\`Attempting to delete assignment \${deletingAssignment.assignment_id}\`)
      
      // Try the [id] route first
      let res = await fetch(\`/api/assignments/\${deletingAssignment.assignment_id}\`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      // If [id] route fails, fallback to main route
      if (!res.ok && res.status === 404) {
        console.log('Dynamic route failed, trying main route...')
        res = await fetch("/api/assignments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignment_id: deletingAssignment.assignment_id }),
        })
      }

      console.log(\`Delete response status: \${res.status}\`)

      if (!res.ok) {
        let errorMessage = \`Failed to delete assignment (HTTP \${res.status})\`
        
        const responseText = await res.text()
        console.log(\`Error response text: "\${responseText}"\`)
        
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (jsonError) {
            errorMessage = responseText || errorMessage
          }
        }
        throw new Error(errorMessage)
      }

      // Handle successful response
      const responseText = await res.text()
      console.log(\`Success response text: "\${responseText}"\`)
      
      if (responseText) {
        try {
          const result = JSON.parse(responseText)
          console.log('Delete result:', result)
        } catch (jsonError) {
          console.warn('Delete response was not JSON, but status was OK:', responseText)
        }
      }
      
      // Update UI
      setAssignments(assignments.filter(a => a.assignment_id !== deletingAssignment.assignment_id))
      setDeletingAssignment(null)
      alert("Assignment deleted successfully!")
      
    } catch (err: any) {
      console.error('Delete assignment error:', err)
      alert(err.message || "Failed to delete assignment")
    } finally {
      setSaving(false)
    }
  }
`;

console.log('📝 Fallback Deletion Code Generated');
console.log('\nIf the current deletion fix doesn\'t work, you can replace the handleDeleteConfirm function with this fallback approach:');
console.log('\n' + '='.repeat(80));
console.log(fallbackDeletionCode);
console.log('='.repeat(80));

console.log('\n🔧 This fallback approach:');
console.log('   1. First tries the /api/assignments/[id] route');
console.log('   2. If that fails with 404, falls back to /api/assignments with body');
console.log('   3. Provides detailed logging for debugging');
console.log('   4. Handles both JSON and non-JSON responses');
console.log('   5. Updates UI regardless of response format if status is OK');