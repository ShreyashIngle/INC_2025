import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, UserCircle2, Target, Bot, MessageSquare, BookOpen, Briefcase } from 'lucide-react';

const features = [
  {
    title: 'Personalized Roadmaps',
    description: 'Get customized learning paths tailored to your career goals and current skill level.',
    icon: Target
  },
  {
    title: 'Profile Setup',
    description: 'Create your comprehensive profile to track progress and showcase your achievements.',
    icon: UserCircle2
  },
  {
    title: 'Skill Assessment',
    description: 'Evaluate your skills with interactive assessments and identify areas for improvement.',
    icon: Brain
  },
  {
    title: 'AI Mentor',
    description: 'Receive personalized guidance and support from our advanced AI mentoring system.',
    icon: Bot
  },
  {
    title: 'Interview Assistant',
    description: 'Practice with AI-powered mock interviews and get real-time feedback.',
    icon: MessageSquare
  },
  {
    title: 'Course Monitoring',
    description: 'Track your progress across different courses and learning materials.',
    icon: BookOpen
  },
  {
    title: 'Job Portal',
    description: 'Access curated job opportunities matching your skills and experience.',
    icon: Briefcase
  }
];

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-[#DFF2EB] to-[#B9E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-4xl font-bold text-center mb-16 text-[#4A628A]"
        >
          Platform Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <feature.icon className="w-8 h-8 text-[#2196F3] mr-3" />
                <h3 className="text-xl font-bold text-[#4A628A]">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
              
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#7AB2D3] to-[#2196F3] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;