import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "../api/users.api"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangePassword } from "../hooks"
import { UsersTable } from "../components/users-table"
import { UserFormDialog } from "../components/user-form-dialog"
import { DeleteUserDialog } from "../components/delete-user-dialog"
import { ChangePasswordDialog } from "../components/change-password-dialog"
import { UsersFilters } from "../components/users-filters"
import { UserCreateInput, UserUpdateInput, PasswordChangeInput } from "../schemas"

export function UsersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null)

  const { data: usersData, isLoading } = useUsers({
    skip: page * pageSize,
    limit: pageSize,
  })

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const changePasswordMutation = useChangePassword()

  const users = usersData?.users || []
  const totalItems = usersData?.total || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleCreateUser = async (data: UserCreateInput | UserUpdateInput) => {
    await createUserMutation.mutateAsync(data as UserCreateInput)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateUser = async (data: UserCreateInput | UserUpdateInput) => {
    if (!editingUser) return
    await updateUserMutation.mutateAsync({ id: editingUser.id, data: data as UserUpdateInput })
    setEditingUser(null)
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    await deleteUserMutation.mutateAsync(deletingUser.id)
    setDeletingUser(null)
  }

  const handleChangePassword = async (data: PasswordChangeInput) => {
    if (!changingPasswordUser) return
    await changePasswordMutation.mutateAsync({
      id: changingPasswordUser.id,
      data,
    })
    setChangingPasswordUser(null)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 border-b bg-muted/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">{t('users.management')}</CardTitle>
              <CardDescription className="text-[11px] sm:text-sm">
                {t('users.description')}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="w-full sm:w-auto">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('users.addUser')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-4 pb-3 sm:px-4 sm:pt-5 sm:pb-4 md:px-6 md:pt-6 md:pb-5">
          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            pagination={{
              pageIndex: page,
              pageSize,
              totalPages,
              totalItems,
              onPageChange: setPage,
            }}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
            onChangePassword={setChangingPasswordUser}
            onSearch={setSearchQuery}
            toolbar={
              <UsersFilters
                statusFilter={statusFilter}
                roleFilter={roleFilter}
                onStatusChange={setStatusFilter}
                onRoleChange={setRoleFilter}
              />
            }
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSubmit={handleUpdateUser}
        user={editingUser}
        isLoading={updateUserMutation.isPending}
      />

      <DeleteUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        user={deletingUser}
        isLoading={deleteUserMutation.isPending}
      />

      <ChangePasswordDialog
        open={!!changingPasswordUser}
        onOpenChange={(open) => !open && setChangingPasswordUser(null)}
        onSubmit={handleChangePassword}
        user={changingPasswordUser}
        isLoading={changePasswordMutation.isPending}
      />
    </div>
  )
}
