import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './QuizGame.css';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// --- NEW: A set of fallback questions in case the API fails ---
const fallbackQuestions = [
    {
      "question": "Which of the following is a primary greenhouse gas?",
      "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
      "correctAnswer": "Carbon Dioxide"
    },
    {
      "question": "What is the main cause of coral bleaching?",
      "options": ["Overfishing", "Warmer water temperatures", "Ocean noise", "Plastic pollution"],
      "correctAnswer": "Warmer water temperatures"
    },
    {
      "question": "Which of these is a renewable energy source?",
      "options": ["Natural Gas", "Coal", "Solar Power", "Uranium"],
      "correctAnswer": "Solar Power"
    },
    {
      "question": "The three R's of waste management are Reduce, Reuse, and...?",
      "options": ["Recycle", "Rebuild", "Restore", "Remove"],
      "correctAnswer": "Recycle"
    },
    {
      "question": "What percentage of the Earth's water is freshwater?",
      "options": ["About 50%", "About 25%", "About 10%", "About 3%"],
      "correctAnswer": "About 3%"
    }
];

export default function QuizGame() {
    const { currentUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [gameState, setGameState] = useState('start');
    const [loading, setLoading] = useState(false);

    const fetchQuizQuestions = async () => {
        setLoading(true);
        const prompt = `
            Generate 5 unique, multiple-choice questions about environmental science, climate change, or biodiversity.
            Provide the output in a valid JSON array format only, with no other text, markdown, or explanations. Each object in the array should have:
            - "question": A string for the question text.
            - "options": An array of 4 strings for the possible answers.
            - "correctAnswer": A string that exactly matches one of the options.
        `;

        try {
            if (!API_KEY) {
                throw new Error("OpenAI API key is not configured.");
            }

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": 'Bearer ${API_KEY}',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "user", "content": prompt }
                    ],
                    "response_format": { "type": "json_object" }
                })
            });

            if (!response.ok) {
                // If the API request fails, we'll use our fallback questions
                throw new Error('API request failed with status ${response.status}');
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0]?.message?.content) {
                throw new Error("Invalid response from OpenAI API.");
            }

            const parsedQuestions = JSON.parse(data.choices[0].message.content);
            const questionsArray = Array.isArray(parsedQuestions) ? parsedQuestions : Object.values(parsedQuestions)[0];
            
            setQuestions(questionsArray);
            setGameState('playing');
        } catch (error) {
            console.error("Error fetching quiz questions, using fallback:", error);
            // --- USE FALLBACK QUESTIONS ON ERROR ---
            setQuestions(fallbackQuestions);
            setGameState('playing');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 5);
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            if (currentUser && score > 0) {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, { points: increment(score) });
            }
            setGameState('finished');
        }
    };
    
    const handlePlayAgain = () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setGameState('start');
    };

    const renderQuizContent = () => {
        if (gameState === 'playing' && questions.length > 0) {
            const currentQuestion = questions[currentQuestionIndex];
            return (
                <div className="quiz-question-container">
                    <h3>Question {currentQuestionIndex + 1} / {questions.length}</h3>
                    <p className="quiz-question-text">{currentQuestion.question}</p>
                    <div className="quiz-options">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isSelected = option === selectedAnswer;
                            let buttonClass = 'quiz-option-button';
                            if (isAnswered) {
                                if (isCorrect) buttonClass += ' correct';
                                else if (isSelected) buttonClass += ' incorrect';
                            }
                            return (
                                <button key={index} onClick={() => handleAnswerSelect(option)} className={buttonClass} disabled={isAnswered}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    {isAnswered && (
                        <button onClick={handleNextQuestion} className="quiz-next-button">
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        </button>
                    )}
                </div>
            );
        }
        if (gameState === 'finished') {
            return (
                <div className="quiz-results">
                    <h3>Quiz Complete!</h3>
                    <p>You scored {score} points!</p>
                    <button onClick={handlePlayAgain} className="quiz-start-button">Play Again</button>
                </div>
            );
        }
        return (
            <div className="quiz-start">
                <h3>Test Your Knowledge!</h3>
                <p>Answer 5 questions and earn points for each correct answer.</p>
                <button onClick={fetchQuizQuestions} disabled={loading} className="quiz-start-button">
                    {loading ? 'Loading...' : 'Play Quiz Game'}
                </button>
            </div>
        );
    };

    return (
        <div className="gamification-container">
            <h2>Gamification Zone</h2>
            <div className="quiz-game-card">
                {renderQuizContent()}
            </div>
        </div>
    );
}