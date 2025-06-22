export interface Profile {
    id: string;
    username: string;
    mbti_type: string;
    age: number;
    education_level: string;
    course: string;
    target_study_hours: number;
    current_grade: string;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface UserDetail {
    profile_id?: string;
    username: string;
    mbti_type: string;
    age: number;
    education_level: string;
    course: string;
    target_study_hours: number;
    current_grade: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    email: string;
}