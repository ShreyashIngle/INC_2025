import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, Mic, StopCircle, Video } from 'lucide-react';
import { jsPDF } from 'jspdf';

function InterviewBot() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [report, setReport] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    education: '',
    skills: '',
    position: '',
    experience: '',
    projects: ''
  });
  const [showForm, setShowForm] = useState(true);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const chatContainerRef = useRef(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [webSocket]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize WebSocket for video analysis
      const ws = new WebSocket('ws://127.0.0.1:8000/api/interview/video_stream');
      setWebSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.average_confidence_score) {
          setConfidenceScore(data.average_confidence_score);
        }
      };

      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
      return null;
    }
  };

  const startInterview = async () => {
    if (!candidateInfo.name || !candidateInfo.education || !candidateInfo.skills || 
        !candidateInfo.position || !candidateInfo.experience || !candidateInfo.projects) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const stream = await startVideoStream();
      if (!stream) return;

      const response = await axios.post('http://127.0.0.1:8000/api/interview/start_interview/', candidateInfo);
      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setMessages([{ type: 'bot', content: response.data.question }]);
      setIsInterviewStarted(true);
      setShowForm(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    }
  };

  const startRecording = async () => {
    try {
      const stream = videoRef.current.srcObject;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio_file', audioBlob);
        formData.append('session_id', sessionId);

        try {
          const response = await axios.post('http://127.0.0.1:8000/api/interview/answer_question/', formData);
          
          setMessages(prev => [...prev, 
            { type: 'user', content: 'Audio response submitted' },
            { type: 'bot', content: response.data.question }
          ]);
          
          setCurrentQuestion(response.data.question);

          if (response.data.interview_done) {
            stopInterview();
          }
        } catch (error) {
          console.error('Error submitting answer:', error);
          toast.error('Failed to submit answer');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const stopInterview = async () => {
    try {
      if (webSocket) {
        webSocket.close();
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/interview/get_results/?session_id=${sessionId}`);
      setReport(response.data);
      
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      setIsInterviewStarted(false);
      toast.success('Interview completed');
    } catch (error) {
      console.error('Error stopping interview:', error);
      toast.error('Failed to stop interview');
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Interview Report', 20, 20);

    // Add candidate info
    doc.setFontSize(12);
    doc.text(`Candidate Name: ${candidateInfo.name}`, 20, 40);
    doc.text(`Position: ${candidateInfo.position}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    // Add evaluation results
    doc.setFontSize(14);
    doc.text('Evaluation Results:', 20, 80);
    
    let yPos = 90;
    Object.entries(report.evaluations).forEach(([questionNumber, evaluation]) => {
      doc.setFontSize(12);
      doc.text(`Question ${questionNumber}:`, 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Correctness Score: ${evaluation.correctness_score}/10`, 30, yPos);
      yPos += 10;
      doc.text(`Fluency Score: ${evaluation.fluency_score}/10`, 30, yPos);
      yPos += 10;
      doc.text(`Vocabulary Score: ${evaluation.vocabulary_score}/10`, 30, yPos);
      yPos += 20;
    });

    // Add confidence score
    if (confidenceScore !== null) {
      doc.text(`Overall Confidence Score: ${confidenceScore.toFixed(2)}/10`, 20, yPos);
    }

    doc.save('interview-report.pdf');
    toast.success('Report downloaded');
  };

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Interview Bot
      </motion.h1>

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Candidate Information</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Education</label>
              <input
                type="text"
                value={candidateInfo.education}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, education: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
              <input
                type="text"
                value={candidateInfo.skills}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, skills: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
              <input
                type="text"
                value={candidateInfo.position}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, position: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Experience</label>
              <input
                type="text"
                value={candidateInfo.experience}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, experience: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Projects</label>
              <textarea
                value={candidateInfo.projects}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, projects: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <button
              type="button"
              onClick={startInterview}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Start Interview
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-gray-800 rounded-xl p-6">
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full rounded-lg object-cover"
              />
            </div>

            <div className="flex justify-between items-center">
              {isInterviewStarted && (
                <>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-5 h-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopInterview}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    End Interview
                  </button>
                </>
              )}
            </div>

            {confidenceScore !== null && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Confidence Score</h3>
                <div className="w-full bg-gray-600 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(confidenceScore / 10) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-gray-300">{confidenceScore.toFixed(1)}/10</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-gray-800 rounded-xl p-6 flex flex-col">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 space-y-4"
              style={{ maxHeight: 'calc(100vh - 400px)' }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.type === 'bot'
                      ? 'bg-gray-700 text-white'
                      : 'bg-blue-600 text-white ml-auto'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            {report && (
              <div className="mt-auto">
                <h3 className="text-xl font-semibold mb-4">Interview Complete</h3>
                <button
                  onClick={downloadReport}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewBot;