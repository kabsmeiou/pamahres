import { Star, Check, Zap, Book } from 'react-feather';

type feature = {
    title: string;
    description: string;
    icon: React.ElementType;
}

export const features: feature[] = [
    {
        title: "AI-Powered Learning",
        description: "Harness the power of AI to enhance your learning experience with personalized study plans and intelligent tutoring.",
        icon: Star,
    },
    {
        title: "Interactive Quizzes",
        description: "Test your knowledge with engaging quizzes that adapt to your learning pace and style.",
        icon: Check,
    },
    {
        title: "Course Management",
        description: "Easily create and manage courses with a user-friendly interface designed for both students and educators.",
        icon: Book
    },
    {
        title: "Faster Quiz Creation",
        description: "Quickly generate quizzes from your course materials with just a few clicks.",
        icon: Zap,
    },
]