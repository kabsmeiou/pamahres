import QuizCard from "./QuizCard"
import { Quiz } from "../../types/quiz";


const QuizList = ({quizzes}: {quizzes: Quiz[]}) => {
  return (
      <div className="space-y-4">
        {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} 
            quiz={quiz} />
        ))}
      </div>
  )
}

export default QuizList
