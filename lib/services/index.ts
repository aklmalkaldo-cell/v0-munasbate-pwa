// طبقة بيانات موحدة للتعامل مع Supabase
import { createClient } from "@/lib/supabase/client"

// أنواع البيانات
export interface Service {
  id: number
  category: string
  occasion: string
  title: string
  description: string
  file_url: string
  file_type: string
  has_music: boolean | null
  is_3d: boolean | null
  publisher_user_id: string
  created_at: string
  likes_count?: number
  comments_count?: number
}

export interface Post {
  id: number
  content: string
  author_user_id: string
  created_at: string
  likes_count: number
  comments_count: number
}

export interface User {
  user_id: string
  username: string
  avatar_url: string | null
  account_type: string
  followers_count: number
  following_count: number
}

// دوال الخدمات
export async function getServices(filters?: {
  category?: string
  occasion?: string
  hasMusic?: boolean
  is3D?: boolean
}) {
  const supabase = createClient()
  let query = supabase.from("services").select("*").order("created_at", { ascending: false })

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }
  if (filters?.occasion) {
    query = query.eq("occasion", filters.occasion)
  }
  if (filters?.hasMusic !== undefined) {
    query = query.eq("has_music", filters.hasMusic)
  }
  if (filters?.is3D !== undefined) {
    query = query.eq("is_3d", filters.is3D)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Service[]
}

export async function getServiceById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase.from("services").select("*").eq("id", id).single()
  if (error) throw error
  return data as Service
}

export async function publishService(serviceData: Omit<Service, "id" | "created_at">) {
  const supabase = createClient()
  const { data, error } = await supabase.from("services").insert(serviceData).select()
  if (error) throw error
  return data[0] as Service
}

export async function deleteService(id: number, userId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("services").delete().eq("id", id).eq("publisher_user_id", userId)
  if (error) throw error
  return true
}

// دوال المنشورات
export async function getPosts(userId?: string) {
  const supabase = createClient()
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("author_user_id", userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Post[]
}

export async function getPostById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()
  if (error) throw error
  return data as Post
}

export async function createPost(postData: { content: string; author_user_id: string }) {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").insert(postData).select()
  if (error) throw error
  return data[0] as Post
}

export async function deletePost(id: number, userId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("posts").delete().eq("id", id).eq("author_user_id", userId)
  if (error) throw error
  return true
}

// دوال الإعجابات
export async function toggleLike(
  type: "post" | "service",
  itemId: number,
  userId: string,
): Promise<{ liked: boolean; count: number }> {
  const supabase = createClient()
  const table = type === "post" ? "post_likes" : "service_likes"
  const itemColumn = type === "post" ? "post_id" : "service_id"

  // تحقق من وجود الإعجاب
  const { data: existingLike } = await supabase
    .from(table)
    .select("id")
    .eq(itemColumn, itemId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existingLike) {
    // إلغاء الإعجاب
    await supabase.from(table).delete().eq("id", existingLike.id)
    return { liked: false, count: -1 }
  } else {
    // إضافة إعجاب
    await supabase.from(table).insert({ [itemColumn]: itemId, user_id: userId })
    return { liked: true, count: 1 }
  }
}

export async function checkLikeStatus(type: "post" | "service", itemId: number, userId: string): Promise<boolean> {
  const supabase = createClient()
  const table = type === "post" ? "post_likes" : "service_likes"
  const itemColumn = type === "post" ? "post_id" : "service_id"

  const { data } = await supabase.from(table).select("id").eq(itemColumn, itemId).eq("user_id", userId).maybeSingle()

  return !!data
}

// دوال المحفوظات
export async function toggleSave(
  type: "post" | "service",
  itemId: number,
  userId: string,
): Promise<{ saved: boolean }> {
  const supabase = createClient()
  const table = type === "post" ? "saved_posts" : "saved_services"
  const itemColumn = type === "post" ? "post_id" : "service_id"

  const { data: existingSave } = await supabase
    .from(table)
    .select("id")
    .eq(itemColumn, itemId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existingSave) {
    await supabase.from(table).delete().eq("id", existingSave.id)
    return { saved: false }
  } else {
    await supabase.from(table).insert({ [itemColumn]: itemId, user_id: userId })
    return { saved: true }
  }
}

export async function checkSaveStatus(type: "post" | "service", itemId: number, userId: string): Promise<boolean> {
  const supabase = createClient()
  const table = type === "post" ? "saved_posts" : "saved_services"
  const itemColumn = type === "post" ? "post_id" : "service_id"

  const { data } = await supabase.from(table).select("id").eq(itemColumn, itemId).eq("user_id", userId).maybeSingle()

  return !!data
}

// دوال المتابعة
export async function toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
  const supabase = createClient()

  const { data: existingFollow } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle()

  if (existingFollow) {
    await supabase.from("follows").delete().eq("id", existingFollow.id)
    return { following: false }
  } else {
    await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId })
    return { following: true }
  }
}

export async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient()

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle()

  return !!data
}

// دوال المستخدمين
export async function getUserById(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("app_users").select("*").eq("user_id", userId).single()
  if (error) throw error
  return data as User
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const supabase = createClient()
  const { data, error } = await supabase.from("app_users").update(updates).eq("user_id", userId).select()
  if (error) throw error
  return data[0] as User
}

// دالة رفع الملفات
const MAX_FILE_SIZE_MB = 100
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export async function uploadFile(file: File, path: string): Promise<string> {
  // التحقق من حجم الملف
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`حجم الملف كبير جداً. الحد الأقصى المسموح هو ${MAX_FILE_SIZE_MB} ميجابايت`)
  }

  const supabase = createClient()

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: true, // السماح بالكتابة فوق الملفات الموجودة
  })

  if (error) {
    // رسالة خطأ واضحة
    if (error.message.includes("Payload too large") || error.message.includes("413")) {
      throw new Error(`حجم الملف كبير جداً. يرجى تقليل حجم الملف أو ضغطه.`)
    }
    throw error
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return data.publicUrl
}
