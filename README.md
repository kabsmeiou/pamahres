# PAMAHRES


# To do list
## BACKEND
### CORE
- [x] Allow ai to get context of the pdf by extracting the content
- [x] Config text extraction from pdf
- [x] Chunk the materials into pieces and generate quizzes from different parts of the uploaded PDF
- [x] Configure AI chat function
- [x] Add authentication

### FIX
- [x] Validate prompt and openai response to ensure correct format (getting occasional response errors from ai)
- [x] Fix caching inefficiency(middleware.py)

### OTHERS
- [x] Add time logger for queries (debugging and optimization purposes)
- [x] Additional tests for user
- [x] Settle for a database (maybe use supabase buckets for files)
- [x] Finalize models

## FRONTEND
### FIX
- [x] display markdown instead of string
- [x] Fix quiz form not resetting after a fresh post req(create quiz)
- [x] Fix quiz connection
- [x] Edit quiz(?)
- [x] Fix cors preflight taking too long!!
### FEATURES
- [x] Setup logout confirmation
- [ ] Add user profile edit page
- [ ] Implement user profile forms
- [ ] Fix user profile page
- [x] Setup upload components
### OTHERS
- [ ] Redesign UI (change color scheme, quiz page layout)
- [ ] Optimize states
- [x] Setup supabase client
- [x] Refactor materials
- [x] Refactor logic in frontend

### EXTRAS(Future updates/not priority)
- [ ] Add optional AI review after quiz submit for each question 
- [ ] Generate flash cards from the quizzes attached to the quiz cards
- [ ] Statistics and insights per quiz/profile
- [ ] Custom quizzes (user input)
  - [ ] Adding options to questions
  - [ ] Adding questions to quizzes