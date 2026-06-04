"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Ban, CheckCircle, Loader2 } from "lucide-react";
import { suspendUser, reactivateUser } from "@/services/admin/actions";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  joined: string;
  status: string;
}

interface UsersTableProps {
  users: AdminUser[];
  currentUserId?: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleSuspend(id: string) {
    if (id === currentUserId) {
      alert("You cannot suspend yourself.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to suspend this user?");
    if (!confirm) return;

    try {
      setProcessingId(id);
      await suspendUser(id);
    } catch (error: any) {
      console.error("Failed to suspend user:", error);
      alert(error.message || "Failed to suspend user. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReactivate(id: string) {
    try {
      setProcessingId(id);
      await reactivateUser(id);
    } catch (error: any) {
      console.error("Failed to reactivate user:", error);
      alert(error.message || "Failed to reactivate user. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Details</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDistanceToNow(new Date(user.joined), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === "active" ? "default" : "destructive"}
                  className={user.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {user.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 disabled:pointer-events-none disabled:opacity-50" disabled={processingId === user.id}>
                    <span className="sr-only">Open menu</span>
                    {processingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.status === "active" ? (
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleSuspend(user.id)}
                        disabled={user.id === currentUserId}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        className="text-emerald-500 focus:text-emerald-500 cursor-pointer"
                        onClick={() => handleReactivate(user.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Reactivate User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users found matching the criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
