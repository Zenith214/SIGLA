"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, Shield, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const roleOptions = ["Admin", "Interviewer", "Viewer"];
const statusOptions = ["Active", "Inactive"];

export function UsersRoles() {
  const [users, setUsers] = useState<any[]>([])
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
    role: "Viewer",
    status: "Active",
    lastLogin: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    setLoading(true)
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users")
        return res.json()
      })
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Edit
  const handleEditClick = (user: any) => {
    setEditingUser(user)
    setEditForm({ ...user })
  }
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error("Failed to update user")
      const updated = await res.json()
      setUsers(users.map(u => (u.id === updated.id ? updated : u)))
      setEditingUser(null)
      setEditForm(null)
    } catch (err: any) {
      alert(err.message)
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
    } catch (err: any) {
      alert(err.message)
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
      role: "Viewer",
      status: "Active",
      lastLogin: new Date().toISOString().slice(0, 10),
    })
  }
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }
  const handleAddSave = async () => {
    setSaving(true)
    try {
      // Ensure lastLogin is a full ISO string
      const payload = { ...addForm, lastLogin: addForm.lastLogin ? new Date(addForm.lastLogin).toISOString() : undefined };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add user")
      const created = await res.json()
      setUsers([...users, created])
      setAddingUser(false)
      setAddForm({})
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Role stats
  const roleStats = [
    { role: "Admin", count: users.filter(u => u.role === "Admin").length, color: "bg-red-100 text-red-800" },
    { role: "Interviewer", count: users.filter(u => u.role === "Interviewer").length, color: "bg-blue-100 text-blue-800" },
    { role: "Viewer", count: users.filter(u => u.role === "Viewer").length, color: "bg-gray-100 text-gray-800" },
  ]

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

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleStats.map((stat) => (
          <Card key={stat.role}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.role}s</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.role === "Admin" ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
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
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Last Login</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.role === "Admin"
                            ? "border-red-200 text-red-700"
                            : user.role === "Interviewer"
                              ? "border-blue-200 text-blue-700"
                              : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {user.status}
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
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={open => { if (!open) setEditingUser(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="firstName" value={editForm.firstName} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="lastName" value={editForm.lastName} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" value={editForm.email} readOnly disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Login</label>
                <Input name="lastLogin" type="date" value={editForm.lastLogin ? editForm.lastLogin.slice(0, 10) : ""} onChange={handleEditChange} />
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
                  {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={addForm.status} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Login</label>
                <Input name="lastLogin" type="date" value={addForm.lastLogin} onChange={handleAddChange} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddingUser(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleAddSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span>Role Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <h3 className="font-semibold text-gray-800">Viewer</h3>
                <p className="text-sm text-gray-600 mt-1">Read-only access to reports and data</p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• View reports</li>
                  <li>• Export reports</li>
                  <li>• Dashboard access</li>
                  <li>• No data modification</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
