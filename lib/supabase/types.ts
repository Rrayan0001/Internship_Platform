export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'student' | 'admin'
          degree: string | null
          field_of_study: string | null
          current_status: 'student' | 'professional' | null
          city: string | null
          legal_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: 'student' | 'admin'
          degree?: string | null
          field_of_study?: string | null
          current_status?: 'student' | 'professional' | null
          city?: string | null
          legal_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'student' | 'admin'
          degree?: string | null
          field_of_study?: string | null
          current_status?: 'student' | 'professional' | null
          city?: string | null
          legal_name?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          domain: string
          duration: string
          instructor_name: string
          instructor_bio: string
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          domain: string
          duration: string
          instructor_name: string
          instructor_bio: string
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          domain?: string
          duration?: string
          instructor_name?: string
          instructor_bio?: string
          thumbnail_url?: string | null
          created_at?: string
        }
      }
      course_weeks: {
        Row: {
          id: string
          course_id: string
          week_number: number
          title: string
        }
        Insert: {
          id?: string
          course_id: string
          week_number: number
          title: string
        }
        Update: {
          id?: string
          course_id?: string
          week_number?: number
          title?: string
        }
      }
      week_videos: {
        Row: {
          id: string
          week_id: string
          title: string
          storage_path: string
          duration_seconds: number | null
          order_index: number
        }
        Insert: {
          id?: string
          week_id: string
          title: string
          storage_path: string
          duration_seconds?: number | null
          order_index: number
        }
        Update: {
          id?: string
          week_id?: string
          title?: string
          storage_path?: string
          duration_seconds?: number | null
          order_index?: number
        }
      }
      week_assignments: {
        Row: {
          id: string
          week_id: string
          type: 'mcq' | 'dev_task' | 'case_study' | 'short_answer'
          prompt: string
          options: Json | null
          correct_option: number | null
          max_score: number
          release_date: string | null
          order_index: number
        }
        Insert: {
          id?: string
          week_id: string
          type: 'mcq' | 'dev_task' | 'case_study' | 'short_answer'
          prompt: string
          options?: Json | null
          correct_option?: number | null
          max_score?: number
          release_date?: string | null
          order_index: number
        }
        Update: {
          id?: string
          week_id?: string
          type?: 'mcq' | 'dev_task' | 'case_study' | 'short_answer'
          prompt?: string
          options?: Json | null
          correct_option?: number | null
          max_score?: number
          release_date?: string | null
          order_index?: number
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'pending' | 'approved' | 'rejected'
          certificate_status: 'not_eligible' | 'eligible' | 'requested' | 'issued'
          requested_at: string
          approved_at: string | null
          certificate_issued_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'pending' | 'approved' | 'rejected'
          certificate_status?: 'not_eligible' | 'eligible' | 'requested' | 'issued'
          requested_at?: string
          approved_at?: string | null
          certificate_issued_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          certificate_status?: 'not_eligible' | 'eligible' | 'requested' | 'issued'
          requested_at?: string
          approved_at?: string | null
          certificate_issued_at?: string | null
        }
      }
      video_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          enrollment_id: string
          percent_watched: number
          watched: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          enrollment_id: string
          percent_watched?: number
          watched?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          enrollment_id?: string
          percent_watched?: number
          watched?: boolean
          completed_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          enrollment_id: string
          assignment_id: string
          response: string | null
          file_url: string | null
          auto_score: number | null
          manual_score: number | null
          admin_feedback: string | null
          submitted_at: string
          graded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          enrollment_id: string
          assignment_id: string
          response?: string | null
          file_url?: string | null
          auto_score?: number | null
          manual_score?: number | null
          admin_feedback?: string | null
          submitted_at?: string
          graded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          enrollment_id?: string
          assignment_id?: string
          response?: string | null
          file_url?: string | null
          auto_score?: number | null
          manual_score?: number | null
          admin_feedback?: string | null
          submitted_at?: string
          graded_at?: string | null
        }
      }
    }
  }
}

// Convenience types
export type UserProfile = Database['public']['Tables']['users']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type CourseWeek = Database['public']['Tables']['course_weeks']['Row']
export type WeekVideo = Database['public']['Tables']['week_videos']['Row']
export type WeekAssignment = Database['public']['Tables']['week_assignments']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type VideoProgress = Database['public']['Tables']['video_progress']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
