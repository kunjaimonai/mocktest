export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuestionRow = {
  id: number;
  q: string;
  options: string[];
  sign: string | null;
  answerIndex: number;
  optionTypes: boolean[] | null;
};

export interface Database {
  public: {
    Tables: {
      english_questions: {
        Row: QuestionRow;
        Insert: Partial<QuestionRow> & Pick<QuestionRow, "id" | "q" | "options" | "answerIndex">;
        Update: Partial<QuestionRow>;
      };
      malayalam_questions: {
        Row: QuestionRow;
        Insert: Partial<QuestionRow> & Pick<QuestionRow, "id" | "q" | "options" | "answerIndex">;
        Update: Partial<QuestionRow>;
      };
      tamil_questions: {
        Row: QuestionRow;
        Insert: Partial<QuestionRow> & Pick<QuestionRow, "id" | "q" | "options" | "answerIndex">;
        Update: Partial<QuestionRow>;
      };
      badge_questions: {
        Row: QuestionRow;
        Insert: Partial<QuestionRow> & Pick<QuestionRow, "id" | "q" | "options" | "answerIndex">;
        Update: Partial<QuestionRow>;
      };
      schools: {
        Row: {
          id: number;
          name: string;
          number: string;
          paymentstatus: string;
          has_badge: boolean;
          logo: string | null;
        };
        Insert: {
          id: number;
          name: string;
          number: string;
          paymentstatus?: string;
          has_badge?: boolean;
          logo?: string | null;
        };
        Update: Partial<{
          id: number;
          name: string;
          number: string;
          paymentstatus: string;
          has_badge: boolean;
          logo: string | null;
        }>;
      };
      question_sets: {
        Row: {
          id: number;
          language: string;
          mode: string;
          question_ids: number[];
          created_at: string;
        };
        Insert: {
          id?: number;
          language: string;
          mode: string;
          question_ids: number[];
          created_at?: string;
        };
        Update: Partial<{
          id: number;
          language: string;
          mode: string;
          question_ids: number[];
          created_at: string;
        }>;
      };
      sessions: {
        Row: {
          id: number;
          school_id: number;
          language: string;
          mode: string;
          set_id: number;
          answers: Json | null;
          score: number | null;
          total: number | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: number;
          school_id: number;
          language: string;
          mode: string;
          set_id: number;
          answers?: Json | null;
          score?: number | null;
          total?: number | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<{
          id: number;
          school_id: number;
          language: string;
          mode: string;
          set_id: number;
          answers: Json | null;
          score: number | null;
          total: number | null;
          started_at: string;
          completed_at: string | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_random_questions: {
        Args: { p_language: string; p_limit: number };
        Returns: QuestionRow[];
      };
      start_session: {
        Args: { p_school_id: number; p_language: string; p_mode: string };
        Returns:
          | {
              id: number;
              school_id: number;
              language: string;
              mode: string;
              set_id: number;
            }
          | {
              session_id: number;
              school_id: number;
              language: string;
              mode: string;
              set_id: number;
            }
          | Array<{
              id?: number;
              session_id?: number;
              school_id: number;
              language: string;
              mode: string;
              set_id: number;
            }>;
      };
      submit_session: {
        Args: { p_session_id: number; p_language: string; p_answers: Json };
        Returns: Json;
      };
      generate_question_sets: {
        Args: { p_sets_per_bucket: number };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
