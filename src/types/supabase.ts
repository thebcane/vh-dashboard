export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string
          email: string
          passwordHash: string | null
          role: string
          createdAt: string
          updatedAt: string
          googleDriveAccessToken: string | null
          googleDriveRefreshToken: string | null
          googleDriveTokenExpiry: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          passwordHash?: string | null
          role?: string
          createdAt?: string
          updatedAt?: string
          googleDriveAccessToken?: string | null
          googleDriveRefreshToken?: string | null
          googleDriveTokenExpiry?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          passwordHash?: string | null
          role?: string
          createdAt?: string
          updatedAt?: string
          googleDriveAccessToken?: string | null
          googleDriveRefreshToken?: string | null
          googleDriveTokenExpiry?: string | null
        }
      }
      Project: {
        Row: {
          id: string
          name: string
          description: string
          type: string
          status: string
          startDate: string
          endDate: string | null
          ownerId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          type: string
          status?: string
          startDate: string
          endDate?: string | null
          ownerId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          type?: string
          status?: string
          startDate?: string
          endDate?: string | null
          ownerId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      ProjectMember: {
        Row: {
          id: string
          userId: string
          projectId: string
          role: string
          createdAt: string
        }
        Insert: {
          id?: string
          userId: string
          projectId: string
          role?: string
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string
          projectId?: string
          role?: string
          createdAt?: string
        }
      }
      Task: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          dueDate: string | null
          projectId: string
          assigneeId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          priority?: string
          dueDate?: string | null
          projectId: string
          assigneeId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          dueDate?: string | null
          projectId?: string
          assigneeId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Expense: {
        Row: {
          id: string
          title: string
          description: string
          amount: number
          date: string
          category: string
          invoiceNumber: string | null
          paid: boolean
          userId: string
          projectId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          amount: number
          date: string
          category: string
          invoiceNumber?: string | null
          paid?: boolean
          userId: string
          projectId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          amount?: number
          date?: string
          category?: string
          invoiceNumber?: string | null
          paid?: boolean
          userId?: string
          projectId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      FileUpload: {
        Row: {
          id: string
          name: string
          type: string
          size: number
          url: string
          googleDriveId: string | null
          uploaderId: string
          projectId: string | null
          storagePath: string | null
          storageBucket: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          size: number
          url: string
          googleDriveId?: string | null
          uploaderId: string
          projectId?: string | null
          storagePath?: string | null
          storageBucket?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          size?: number
          url?: string
          googleDriveId?: string | null
          uploaderId?: string
          projectId?: string | null
          storagePath?: string | null
          storageBucket?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Note: {
        Row: {
          id: string
          title: string
          content: string
          isPublic: boolean
          authorId: string
          projectId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          isPublic?: boolean
          authorId: string
          projectId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          isPublic?: boolean
          authorId?: string
          projectId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Message: {
        Row: {
          id: string
          content: string
          read: boolean
          senderId: string
          recipientId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          content: string
          read?: boolean
          senderId: string
          recipientId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          content?: string
          read?: boolean
          senderId?: string
          recipientId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Comment: {
        Row: {
          id: string
          content: string
          authorId: string
          projectId: string | null
          taskId: string | null
          fileId: string | null
          noteId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          content: string
          authorId: string
          projectId?: string | null
          taskId?: string | null
          fileId?: string | null
          noteId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          content?: string
          authorId?: string
          projectId?: string | null
          taskId?: string | null
          fileId?: string | null
          noteId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Module: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          enabled: boolean
          icon: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          enabled?: boolean
          icon: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          enabled?: boolean
          icon?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}