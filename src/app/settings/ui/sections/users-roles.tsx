"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, Shield, AlertTriangle, Search, ChevronDown, ChevronUp, User, Mail, Phone, Briefcase, Building2, Calendar, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const roleOptions = ["admin", "fs", "interviewer", "officer", "viewer"];
const statusOptions = ["active", "inactive"];

export function UsersRoles() {
  const [users, setUsers] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)
  const [addingUser, setAddingUser] = useState(false)
  const [addForm, setAddForm] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "officer",
    status: "active",
    barangayDesignation: null,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [rolePermissionsVisible, setRolePermissionsVisible] = useState(false)
  const [viewingUser, setViewingUser] = useState<any | null>(null)
  const { toast } = useToast()

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    setLoading(true)
    // Fetch users and barangays
    Promise.all([
      fetch("/api/users").then(res => res.ok ? res.json() : Promise.reject("Failed to fetch users")),
      fetch("/api/barangays").then(res => res.ok ? res.json() : Promise.reject("Failed to fetch barangays"))
    ])
      .then(([usersData, barangaysData]) => {
        console.log("Barangays API Response:", barangaysData)
        setUsers(usersData.users || usersData)
        // Handle different API response formats
        // New format: { success: true, data: [...] }
        // Old format: { barangays: [...] } or [...]
        const barangaysList = barangaysData.data || barangaysData.barangays || barangaysData
        console.log("Extracted barangays list:", barangaysList)
        console.log("Is array?", Array.isArray(barangaysList))
        setBarangays(Array.isArray(barangaysList) ? barangaysList : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching data:", err)
        setError(err.message || err)
        setLoading(false)
      })
  }, [])

  // Edit
  const handleEditClick = async (user: any) => {
    // Set initial form data immediately to prevent null errors
    setEditForm({ 
      ...user,
      role: user.role?.toLowerCase() || 'officer',
      barangayDesignation: user.barangayDesignation || ""
    })
    setEditingUser(user)
  }
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = async () => {
    setSaving(true)
    try {
      // Update user with all edited fields
      const res = await fetch(`/api/users/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          role: editForm.role,
          status: editForm.status,
          barangayDesignation: editForm.barangayDesignation
        }),
      })
      if (!res.ok) throw new Error("Failed to update user")
      const updated = await res.json()
      
      setUsers(users.map(u => (u.id === updated.user.id ? updated.user : u)))
      setEditingUser(null)
      setEditForm(null)
      toast({
        title: "User Updated Successfully!",
        description: `${editForm.firstName} ${editForm.lastName}'s information has been updated.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the user.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDeleteClick = (user: any) => setDeletingUser(user)
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return
    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingUser.id }),
      })
      if (!res.ok) throw new Error("Failed to delete user")
      setUsers(users.filter(u => u.id !== deletingUser.id))
      setDeletingUser(null)
      toast({
        title: "User Deleted",
        description: `${deletingUser.firstName} ${deletingUser.lastName} has been removed from the system.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the user.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Add
  const handleAddClick = () => {
    setAddingUser(true)
    setAddForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "officer",
      status: "Active",
      barangayDesignation: null,
    })
  }
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }
  const handleAddSave = async () => {
    setSaving(true)
    try {
      // Don't include lastLogin when creating a new user - it will be set on first login
      const payload = { 
        ...addForm, 
        barangayDesignation: addForm.barangayDesignation || null
      };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add user")
      const response = await res.json()
      
      setUsers([response.user, ...users])
      setAddingUser(false)
      setAddForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "officer",
        status: "active",
        barangayDesignation: null,
      })
      toast({
        title: "User Added Successfully!",
        description: `${addForm.firstName} ${addForm.lastName} has been added to the system.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Add User Failed",
        description: err.message || "An unexpected error occurred while adding the user.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Role stats (case-insensitive, includes developer in admin count)
  const roleStats = [
    { 
      role: "admin", 
      count: users.filter(u => {
        const role = u.role?.toLowerCase();
        return role === "admin" || role === "developer";
      }).length, 
      color: "bg-red-100 text-red-800" 
    },
    { role: "fs", count: users.filter(u => u.role?.toLowerCase() === "fs").length, color: "bg-purple-100 text-purple-800" },
    { role: "interviewer", count: users.filter(u => u.role?.toLowerCase() === "interviewer").length, color: "bg-blue-100 text-blue-800" },
    { role: "officer", count: users.filter(u => u.role?.toLowerCase() === "officer").length, color: "bg-gray-100 text-gray-800" },
    { role: "viewer", count: users.filter(u => u.role?.toLowerCase() === "viewer").length, color: "bg-green-100 text-green-800" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 mb-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-8 text-center text-gray-500">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600">Manage user accounts and role assignments</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Role Permissions - Collapsible */}
      <Card>
        <CardHeader className="pb-2">
          <Button
            variant="ghost"
            onClick={() => setRolePermissionsVisible(!rolePermissionsVisible)}
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Role Permissions</span>
            </CardTitle>
            {rolePermissionsVisible ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </Button>
        </CardHeader>
        {rolePermissionsVisible && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-semibold text-red-800">Admin</h3>
                  <p className="text-sm text-red-600 mt-1">Full system access and user management</p>
                  <ul className="text-xs text-red-600 mt-2 space-y-1">
                    <li>• Manage all settings</li>
                    <li>• Create/delete users</li>
                    <li>• Export data</li>
                    <li>• System backup</li>
                  </ul>
                </div>
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="font-semibold text-purple-800">Supervisor</h3>
                  <p className="text-sm text-purple-600 mt-1">Manage field operations and monitor interviewers</p>
                  <ul className="text-xs text-purple-600 mt-2 space-y-1">
                    <li>• Allocate spots and assignments</li>
                    <li>• Monitor fieldwork progress</li>
                    <li>• Manage interviewer assignments</li>
                    <li>• View performance metrics</li>
                  </ul>
                </div>
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-blue-800">Interviewer</h3>
                  <p className="text-sm text-blue-600 mt-1">Conduct surveys and view assigned data</p>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1">
                    <li>• Conduct interviews</li>
                    <li>• View assigned barangays</li>
                    <li>• Submit responses</li>
                    <li>• Basic reporting</li>
                  </ul>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Officer</h3>
                  <p className="text-sm text-gray-600 mt-1">LGU official with governance responsibilities</p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• View reports</li>
                    <li>• Create and manage CPAPs</li>
                    <li>• Dashboard access</li>
                    <li>• Track action plan progress</li>
                  </ul>
                </div>
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800">Viewer</h3>
                  <p className="text-sm text-green-600 mt-1">Read-only access to dashboards and data</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• View dashboards (Map & Analytics)</li>
                    <li>• View CPAP submissions</li>
                    <li>• Access backup settings</li>
                    <li>• No write operations</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {roleStats.map((stat) => (
          <Card key={stat.role}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{stat.role === "fs" ? "Supervisors" : `${stat.role}s`}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.role === "admin" ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        
        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name, email, role, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="font-medium">Barangay</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Last Login</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && searchTerm ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No users found</p>
                      <p className="text-gray-500 mb-4">No users match your search criteria "{searchTerm}"</p>
                      <Button 
                        onClick={() => setSearchTerm("")} 
                        variant="outline"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Clear Search
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell 
                      className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                      onClick={() => setViewingUser(user)}
                    >
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.role === "admin"
                            ? "border-red-200 text-red-700"
                            : user.role === "fs"
                              ? "border-purple-200 text-purple-700"
                              : user.role === "interviewer"
                                ? "border-blue-200 text-blue-700"
                                : user.role === "viewer"
                                  ? "border-green-200 text-green-700"
                                  : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {user.role === "fs" ? "Supervisor" : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.role?.toLowerCase() === 'officer' && user.barangayDesignation ? (
                        barangays.find(b => (b.id || b.barangay_id) === user.barangayDesignation)?.name || 
                        barangays.find(b => (b.id || b.barangay_id) === user.barangayDesignation)?.barangay_name || 
                        '-'
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.lastLogin ? user.lastLogin.slice(0, 10) : ""}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditClick(user)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDeleteClick(user)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingUser && editForm && (
        <Dialog open={!!editingUser} onOpenChange={open => { if (!open) { setEditingUser(null); setEditForm(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="firstName" value={editForm?.firstName || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="lastName" value={editForm?.lastName || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" value={editForm?.email || ""} readOnly disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={editForm?.role || "officer"} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role === 'fs' ? 'Supervisor' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {editForm.role === 'officer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Barangay Designation</label>
                    <select name="barangayDesignation" value={editForm.barangayDesignation || ""} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                      <option value="">No Designation</option>
                      {Array.isArray(barangays) && barangays.map(barangay => (
                        <option key={barangay.id || barangay.barangay_id} value={barangay.id || barangay.barangay_id}>
                          {barangay.name || barangay.barangay_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Officer's designated barangay (optional)</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={editForm?.status || "active"} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <Dialog open={!!deletingUser} onOpenChange={open => { if (!open) setDeletingUser(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Warning:</span>
            </div>
            <div className="mt-2 text-red-600">
              Are you sure you want to delete <b>{deletingUser.firstName} {deletingUser.lastName}</b>?<br />
              <span className="font-semibold">This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white">{saving ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Modal */}
      {addingUser && (
        <Dialog open={addingUser} onOpenChange={open => { if (!open) setAddingUser(false) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="firstName" value={addForm.firstName} onChange={handleAddChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="lastName" value={addForm.lastName} onChange={handleAddChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" value={addForm.email} onChange={handleAddChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input name="password" type="password" value={addForm.password} onChange={handleAddChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={addForm.role} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  {roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role === 'fs' ? 'Supervisor' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {addForm.role === 'officer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Barangay Designation</label>
                    <select name="barangayDesignation" value={addForm.barangayDesignation || ""} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                      <option value="">No Designation</option>
                      {Array.isArray(barangays) && barangays.map(barangay => (
                        <option key={barangay.id || barangay.barangay_id} value={barangay.id || barangay.barangay_id}>
                          {barangay.name || barangay.barangay_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Officer's designated barangay (optional)</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={addForm.status} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddingUser(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleAddSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Profile Modal */}
      {viewingUser && (
        <Dialog open={!!viewingUser} onOpenChange={open => { if (!open) setViewingUser(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {viewingUser.firstName?.[0]}{viewingUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{viewingUser.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`text-sm ${
                        viewingUser.role === "admin"
                          ? "border-red-200 text-red-700 bg-red-50"
                          : viewingUser.role === "fs"
                            ? "border-purple-200 text-purple-700 bg-purple-50"
                            : viewingUser.role === "interviewer"
                              ? "border-blue-200 text-blue-700 bg-blue-50"
                              : viewingUser.role === "viewer"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-gray-200 text-gray-700 bg-gray-50"
                      }`}
                    >
                      {viewingUser.role === "fs" ? "Supervisor" : viewingUser.role?.charAt(0).toUpperCase() + viewingUser.role?.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={viewingUser.status === "active" ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {viewingUser.status || "active"}
                    </Badge>
                  </div>
                </div>

                {viewingUser.role?.toLowerCase() === 'officer' && viewingUser.barangayDesignation && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Barangay Designation</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {barangays.find(b => (b.id || b.barangay_id) === viewingUser.barangayDesignation)?.name || 
                       barangays.find(b => (b.id || b.barangay_id) === viewingUser.barangayDesignation)?.barangay_name || 
                       'Not assigned'}
                    </p>
                  </div>
                )}

                {viewingUser.organization && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Organization</label>
                    <p className="mt-1 text-gray-900">{viewingUser.organization}</p>
                  </div>
                )}

                {viewingUser.jobTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Job Title</label>
                    <p className="mt-1 text-gray-900">{viewingUser.jobTitle}</p>
                  </div>
                )}

                {viewingUser.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{viewingUser.phone}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="mt-1 text-gray-900">
                    {viewingUser.lastLogin 
                      ? new Date(viewingUser.lastLogin).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Account Created</label>
                  <p className="mt-1 text-gray-900">
                    {viewingUser.createdAt 
                      ? new Date(viewingUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewingUser(null);
                  handleEditClick(viewingUser);
                }}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* View Profile Modal */}
      {viewingUser && (
        <Dialog open={!!viewingUser} onOpenChange={open => { if (!open) setViewingUser(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                  {viewingUser.profilePicture ? (
                    <img 
                      src={viewingUser.profilePicture} 
                      alt={`${viewingUser.firstName} ${viewingUser.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {viewingUser.firstName?.[0]}{viewingUser.lastName?.[0]}
                    </div>
                  )}
                  {/* Barangay Logo Badge for Officers */}
                  {viewingUser.role?.toLowerCase() === 'officer' && viewingUser.barangayDesignation && (
                    (() => {
                      const barangay = barangays.find(b => (b.id || b.barangay_id) === viewingUser.barangayDesignation);
                      const logoUrl = barangay?.logo_url;
                      return logoUrl ? (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src={logoUrl} 
                            alt="Barangay Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null;
                    })()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${
                      viewingUser.role === "admin"
                        ? "border-red-200 text-red-700 bg-red-50"
                        : viewingUser.role === "fs"
                          ? "border-purple-200 text-purple-700 bg-purple-50"
                          : viewingUser.role === "interviewer"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : viewingUser.role === "viewer"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                    }`}
                  >
                    {viewingUser.role === "fs" ? "Field Supervisor" : viewingUser.role?.charAt(0).toUpperCase() + viewingUser.role?.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{viewingUser.email}</p>
                    </div>
                  </div>
                  {viewingUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{viewingUser.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Professional Information</h4>
                <div className="space-y-3">
                  {viewingUser.jobTitle && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Job Title</p>
                        <p className="text-gray-900">{viewingUser.jobTitle}</p>
                      </div>
                    </div>
                  )}
                  {viewingUser.organization && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Organization</p>
                        <p className="text-gray-900">{viewingUser.organization}</p>
                      </div>
                    </div>
                  )}
                  {viewingUser.role?.toLowerCase() === 'officer' && viewingUser.barangayDesignation && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Barangay Designation</p>
                        <p className="text-gray-900">
                          {barangays.find(b => (b.id || b.barangay_id) === viewingUser.barangayDesignation)?.name || 
                           barangays.find(b => (b.id || b.barangay_id) === viewingUser.barangayDesignation)?.barangay_name || 
                           'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant={viewingUser.status === "active" ? "default" : "secondary"}>
                        {viewingUser.status || "active"}
                      </Badge>
                    </div>
                  </div>
                  {viewingUser.createdAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-gray-900">{new Date(viewingUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                  {viewingUser.lastLogin && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="text-gray-900">{new Date(viewingUser.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
              <Button onClick={() => {
                setViewingUser(null);
                handleEditClick(viewingUser);
              }}>
                Edit Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}
