// fields = ['id', 'material_list', 'number_of_questions', 'quiz_title']
//     read_only_fields = ['course']
export interface Quiz {
    id?: number;
    material_list?: number[];
    number_of_questions?: number;
    course?: number;
    quiz_score?: number;
    time_limit_minutes?: number;
    quiz_title: string;
    last_taken?: string;
}

export interface QuestionOption {
    id?: number;       // optional because new options may not have an id yet
    text: string;
}
  
export interface Question {
    id?: number;        // optional for newly created questions
    question: string;
    question_type: 'MCQ' | 'TF' | string;
    quiz: number;       // quiz id
    correct_answer: string;
    options: QuestionOption[];
}

// Quiz result to be received
export interface QuizResult {
    score: number;
    results: {
        question_id: number;
        correct_answer: string;
        is_correct: boolean;
    }[];
}


export interface QuizItemDetails {
    question_id: number;
    correct_answer: string;
    is_correct: boolean;
}