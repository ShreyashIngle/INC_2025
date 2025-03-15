import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Book, CheckCircle, AlertCircle, XCircle } from "lucide-react";

function McqGenerator() {
  const [formData, setFormData] = useState({
    subject: "",
    difficulty: "",
    topic: "NA",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const subjects = ["OS", "CN", "DBMS", "OOPS"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/mcq/generate_mcq",
        formData
      );
      if (response.data && response.data.question) {
        setQuestions(response.data.question);
        setIsDialogOpen(true); // Open dialog after generating questions
        toast.success("Questions generated successfully");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const clearSelection = (questionId) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = { ...prev };
      delete updatedAnswers[questionId];
      return updatedAnswers;
    });
  };

  const checkAnswers = () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setIsDialogOpen(false); // Close dialog on reset
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-white text-center"
      >
        MCQ Generator
      </motion.h1>

      {/* Generate Questions Form */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Generate Questions
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Subject
            </label>
            <select
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            >
              <option value="">Select Difficulty</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition-colors"
            } text-white`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Book className="w-5 h-5" />
                Generate Questions
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Generated Questions Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 mt-10 ">
            <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-6 w-full max-w-5xl max-h-[76vh] overflow-y-auto"
            >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Generated Questions
            </h2>
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                {index + 1}. {question.question_text}
              </h3>
              {selectedAnswers[question.id] && (
                <button
              onClick={() => clearSelection(question.id)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
                >
              <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {question.options.map((option) => (
                <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                selectedAnswers[question.id] === option.key
                  ? "bg-blue-600"
                  : "bg-gray-600/50 hover:bg-gray-600"
              } ${
                showResults
                  ? option.key === question.correct_answer
                ? "border-2 border-green-600"
                : selectedAnswers[question.id] === option.key
                ? "border-2 border-red-500"
                : ""
                  : ""
              }`}
                >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.key}
                checked={selectedAnswers[question.id] === option.key}
                onChange={() =>
                  handleAnswerSelect(question.id, option.key)
                }
                disabled={showResults}
                className="hidden"
              />
              <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 text-white">
                {option.key}
              </span>
              <span className="text-white">{option.text}</span>
              {showResults &&
                option.key === question.correct_answer && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
              {showResults &&
                selectedAnswers[question.id] === option.key &&
                option.key !== question.correct_answer && (
                  <AlertCircle className="w-5 h-5 text-red-500 ml-auto" />
                )}
                </label>
              ))}
            </div>
            {showResults && (
              <div className="mt-4 p-4 bg-gray-600/50 rounded-lg">
                <p className="font-medium text-blue-400">Explanation:</p>
                <p className="text-gray-300">{question.explanation}</p>
              </div>
            )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={checkAnswers}
                disabled={
                  Object.keys(selectedAnswers).length !== questions.length
                }
                className={`px-6 py-3 rounded-lg font-semibold ${
                  Object.keys(selectedAnswers).length !== questions.length
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                } text-white`}
              >
                Submit
              </button>
            </div>

            {/* Score Display */}
            {showResults && (
              <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                <p className="text-xl font-semibold text-white">
                  Score: {calculateScore()} / {questions.length}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default McqGenerator;
