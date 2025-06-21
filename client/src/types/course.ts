export interface Course {
    id?: number;
    user?: number;
    course_code: string;
    course_name: string;
    course_description: string;
    last_updated_at?: string;
    number_of_quizzes?: number;
}

export interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'ai';
}

export interface ChatHistoryProps {
  id?: number;
  date_created: string;
  name_filter: string;
}
// fields = ['id', 'material_file_url', 'file_name', 'file_size', 'file_type', 'uploaded_at']
// read_only_fields = ['uploaded_at']

export interface Material {
    id?: number;
    material_file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_at?: string;
}