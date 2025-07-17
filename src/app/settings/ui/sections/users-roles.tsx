"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react"

const users = [
  { id: 1, name: "Maria Santos", email: "maria@sigla.gov", role: "Admin", status: "Active", lastLogin: "2024-01-15" },
  {
    id: 2,
    name: "Juan Dela Cruz",
    email: "juan@sigla.gov",
    role: "Interviewer",
    status: "Active",
    lastLogin: "2024-01-14",
  },
  {
    id: 3,
    name: "Ana Rodriguez",
    email: "ana@sigla.gov",
    role: "Interviewer",
    status: "Active",
    lastLogin: "2024-01-13",
  },
  {
    id: 4,
    name: "Pedro Martinez",
    email: "pedro@sigla.gov",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-01-10",
  },
  {
    id: 5,
    name: "Carlos Mendoza",
    email: "carlos@sigla.gov",
    role: "Interviewer",
    status: "Active",
    lastLogin: "2024-01-15",
  },
]

const roleStats = [
  { role: "Admin", count: 1, color: "bg-red-100 text-red-800" },
  { role: "Interviewer", count: 3, color: "bg-blue-100 text-blue-800" },
  { role: "Viewer", count: 1, color: "bg-gray-100 text-gray-800" },
]

export function UsersRoles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600">Manage user accounts and role assignments</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
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
                  <TableCell className="font-medium">{user.name}</TableCell>
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
                  <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
