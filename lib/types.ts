export type AccountType = "user" | "agent"

export interface User {
  id: string
  user_id: string // 7 أرقام
  display_name: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  account_type: AccountType
  is_private: boolean
  email?: string
  phone?: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  author?: User
}

export interface Service {
  id: string
  title: string
  description: string
  category: "zaffat" | "sheilat" | "invitations" | "greetings"
  occasion_type: string
  has_music?: boolean // للزفات والشيلات
  is_3d?: boolean // للدعوات والتهنئات
  file_url: string
  thumbnail_url?: string
  agent_id: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "like" | "comment" | "follow" | "message"
  from_user_id: string
  post_id?: string
  is_read: boolean
  created_at: string
  from_user?: User
}
