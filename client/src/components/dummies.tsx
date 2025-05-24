const NAME_PLACEHOLDER: string = "Kabs";

export { NAME_PLACEHOLDER };

interface Course {
    id: string;
    title: string;
    description: string;
    materialCount: number;
    quizCount: number;
    lastAccessed: string;
  }
  
const courses: Course[] = [
{
    id: '1',
    title: 'Data Structures',
    description: 'Computer Science fundamentals and implementations',
    materialCount: 3,
    quizCount: 5,
    lastAccessed: '2 days ago'
},
{
    id: '2',
    title: 'Machine Learning',
    description: 'Introduction to ML concepts and algorithms',
    materialCount: 2,
    quizCount: 3,
    lastAccessed: '5 days ago'
},
{
    id: '3',
    title: 'System Design',
    description: 'Scalable system design patterns and practices',
    materialCount: 4,
    quizCount: 6,
    lastAccessed: '1 day ago'
}
];

export { courses };

import { Quiz } from "../types/quiz";


const quizzes_sample: Quiz[] = [
    {
        id: 1,
        material_list: [1, 2, 3],
        number_of_questions: 10,
        quiz_title: 'Quiz 1',
        course: 1,
        quiz_score: 85,
        time_limit_minutes: 15
    },
    {
        id: 2,
        material_list: [4, 5, 6],
        number_of_questions: 15,
        quiz_title: 'Quiz 2',
        course: 1,
        quiz_score: 85,
        time_limit_minutes: 15
    }
];

export { quizzes_sample };
export type { Quiz };
