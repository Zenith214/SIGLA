import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key (for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types (will be generated after migration)
export type Database = {
  public: {
    Tables: {
      barangay: {
        Row: {
          barangay_id: number
          barangay_name: string
          seal: 'yes' | 'no'
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
          households: number | null
          population: number | null
          area: number | null
          captain: string | null
          currentStatus: string | null
          history: string | null
        }
        Insert: {
          barangay_id?: number
          barangay_name: string
          seal?: 'yes' | 'no'
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
          households?: number | null
          population?: number | null
          area?: number | null
          captain?: string | null
          currentStatus?: string | null
          history?: string | null
        }
        Update: {
          barangay_id?: number
          barangay_name?: string
          seal?: 'yes' | 'no'
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
          households?: number | null
          population?: number | null
          area?: number | null
          captain?: string | null
          currentStatus?: string | null
          history?: string | null
        }
      }
      // Add other table types as needed
    }
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('barangay')
        .select('count')
        .limit(1)
      
      if (error) throw error
      return { success: true, message: 'Connected to Supabase successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get all barangays
  async getAllBarangays() {
    const { data, error } = await supabase
      .from('barangay')
      .select('*')
      .eq('is_active', true)
      .order('barangay_name')
    
    if (error) throw error
    return data
  },

  // Update barangay seal status
  async updateBarangaySeal(barangayId: number, sealStatus: 'yes' | 'no') {
    const { data, error } = await supabaseAdmin
      .from('barangay')
      .update({ seal: sealStatus })
      .eq('barangay_id', barangayId)
      .select()
    
    if (error) throw error
    return data[0]
  }
}