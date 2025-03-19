import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import regex as re
from pydantic import BaseModel
from utils.tts import text_to_speech
from utils.speechtotext import transcribe

load_dotenv(".env")
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction="""
    Role: You are an AI Interview Bot conducting technical and HR interviews for Computer Science and IT candidates.
    Interview Guidelines:
    -Ask both technical and HR questions, following up based on the candidate's responses.
    -Allow candidates to answer freely; if they struggle, guide them without giving direct answers.
    -Keep the conversation on-topic with smooth transitions between questions.
    -For technical terms, provide IPA pronunciation next to the word (e.g. what is [Django](/ˈdʒæŋɡoʊ/) used for?).
    -Ensure responses are clear and easy to pronounce for text-to-speech compatibility.
    """
)
class CandidateInfo(BaseModel):
    name: str
    education: str
    skills: str
    position: str
    experience: str
    projects: str


class InterviewBot:
    def __init__(self, candidate_info: CandidateInfo):
        self.chat = model.start_chat()
        self.candidate_info = candidate_info
        self.evaluations = {}
        self.qno = 0
        self.current_question = ""
        self.interview_done = False

    def generate_prompt(self):
        return f"""
        Conduct an interview for the following candidate:
        - **Name**: {self.candidate_info.name}
        - **Education**: {self.candidate_info.education}
        - **Skills**: {self.candidate_info.skills}
        - **Experience**: {self.candidate_info.experience} 
        - **Projects**: {self.candidate_info.projects}
        - **Position**: {self.candidate_info.position}
        Give each question as JSON with:
        - "question"
        - "difficulty_level"
        - "interview_done"
        Start with a technical question.
        """

    def response_formater(self, response):
        try:
            response_formatted = json.loads(response.text[response.text.find('```') + 7:response.text.rfind('```')])
            if not isinstance(response_formatted, dict):
                raise ValueError("Response is not in valid JSON format.")
            return response_formatted
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing LLM response: {e}")
            return {"error": "Invalid JSON response from LLM"}

    def remove_pronunciations(self, text):
        try:
            return re.sub(r"\[(.*?)\]\(\/.*?\/\)", r"\1", text)
        except Exception as e:
            print(f"Error removing pronunciations: {e}")
            return text

    def start_interview(self):
        try:
            prompt = self.generate_prompt()
            response = self.chat.send_message(prompt)
            response_formatted = self.response_formater(response)

            if "question" not in response_formatted:
                return {"error": "Missing question in LLM response"}

            self.current_question = response_formatted['question']
            file = text_to_speech(self.current_question)
            print(self.current_question)

            self.current_question = self.remove_pronunciations(self.current_question)
            self.qno += 1

            return {"question": self.current_question, "difficulty_level": response_formatted['difficulty_level'],"audio_file": file}
        except Exception as e:
            print(f"Error starting interview: {e}")
            return {"error": "Failed to start interview"}

    def evaluate_answer_with_llm(self, question, answer, transcript=None):
        try:
            if transcript:
                formatted_text = " ".join([word[0] for word in transcript])
                pause_data = [
                    f"Pause of {round(transcript[i+1][1] - transcript[i][2], 2)} sec after '{transcript[i][0]}'"
                    for i in range(len(transcript)-1)
                    if transcript[i+1][1] - transcript[i][2] > 1.5
                ]
                pause_summary = "\n".join(pause_data) if pause_data else "No significant pauses detected."
            else:
                formatted_text = answer  # Directly use the answer as text input
                pause_summary = "Transcript not provided."

            evaluation_prompt = f"""
            Evaluate the following response:
            
            **Question:** {question}
            **Answer:** {answer}
            
            **Fluency Analysis:**
            Transcript: {formatted_text}
            Pauses: {pause_summary}
            
            **Vocabulary Analysis:**
            - Assess lexical diversity and technical term usage.
            - Identify any excessive repetition.
            
            **Determine the difficulty level of the question (Easy, Medium, Hard) and assign the correctness score accordingly:**
            - Easy: Max score of 5
            - Medium: Max score of 7
            - Hard: Max score of 10
            
            Provide the response in JSON format with keys:
            - "difficulty_level"
            - "correctness_score"
            - "correctness_feedback"
            - "fluency_score"
            - "fluency_feedback"
            - "vocabulary_score"
            - "vocabulary_feedback"
            """

            response = model.generate_content(evaluation_prompt)
            print(response.text.strip())
            
            match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
            return json.loads(match.group(1)) if match else json.loads(response.text)
        
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing evaluation response: {e}")
            return {"error": "Invalid evaluation response from LLM"}
        except Exception as e:
            print(f"Error in evaluating answer: {e}")
            return {"error": "Failed to evaluate answer"}

    def answerandquestion(self, audio_file, text):
        try:
            if audio_file:
                transcript = transcribe(audio_file)
                ans = " ".join([word[0] for word in transcript])
                evaluation = self.evaluate_answer_with_llm(self.current_question, ans, transcript)
            else:
                ans = text

            
            self.evaluations[self.qno] = evaluation

            response = self.chat.send_message(ans)
            response_formatted = self.response_formater(response)
            file =text_to_speech(response_formatted['question'])
            self.current_question = self.remove_pronunciations(response_formatted['question'])

            if "interview_done" not in response_formatted:
                return {"error": "Missing interview_done flag in response"}

            if response_formatted['interview_done']:
                self.interview_done = True
            self.qno += 1
            return {"question": self.current_question, "difficulty_level": response_formatted['difficulty_level'],"audio_file": file,"interview_done": response_formatted['interview_done']}
        except Exception as e:
            print(f"Error in processing answer and question: {e}")
            return {"error": "Failed to process answer"}
    def exit_interview(self):
        if (self.interview_done):
            return {"interview_done": True,"evaluations": self.evaluations}
        else:
            return {"interview_done": False,"evaluations": {}}
    