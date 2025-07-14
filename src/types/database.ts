export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number;
          gender: string;
          medical_history: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age: number;
          gender: string;
          medical_history?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age?: number;
          gender?: string;
          medical_history?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          ingredients: string[];
          meal_time: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          ingredients: string[];
          meal_time: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          ingredients?: string[];
          meal_time?: string;
          date?: string;
          created_at?: string;
        };
      };
      symptoms: {
        Row: {
          id: string;
          user_id: string;
          symptom_type: string;
          severity: number;
          description: string;
          date: string;
          time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptom_type: string;
          severity: number;
          description?: string;
          date: string;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symptom_type?: string;
          severity?: number;
          description?: string;
          date?: string;
          time?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Meal = Database['public']['Tables']['meals']['Row'];
export type Symptom = Database['public']['Tables']['symptoms']['Row'];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertMeal = Database['public']['Tables']['meals']['Insert'];
export type InsertSymptom = Database['public']['Tables']['symptoms']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateMeal = Database['public']['Tables']['meals']['Update'];
export type UpdateSymptom = Database['public']['Tables']['symptoms']['Update'];
