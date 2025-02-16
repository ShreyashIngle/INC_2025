import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from "../../images/logo.png";

function Report() {
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Example report data remains the same...
  const reportData = {
    title: "Agricultural Analysis Report",
    date: new Date().toLocaleDateString(),
    sections: [
      {
        title: "Crop Recommendations",
        content: [
          {
            subtitle: "Primary Recommendation",
            text: "Based on your soil analysis and climate conditions, Wheat is recommended as your primary crop. The soil's nitrogen content and pH levels are optimal for wheat cultivation.",
            metrics: {
              soilHealth: 85,
              yieldPotential: 92,
              waterRequirement: 75
            }
          },
          {
            subtitle: "Alternative Options",
            text: "Secondary crop options include Barley and Maize, which would also thrive in your current conditions."
          }
        ],
        backgroundColor: "bg-sky-50",
        textColor: "text-sky-900",
        borderColor: "border-sky-200"
      },
      {
        title: "Soil Analysis",
        content: [
          {
            subtitle: "Current Soil Conditions",
            text: "Your soil shows excellent nutrient balance with high organic matter content. Nitrogen levels are at 45 ppm, Phosphorus at 32 ppm, and Potassium at 180 ppm.",
            metrics: {
              nitrogen: 45,
              phosphorus: 32,
              potassium: 180
            }
          }
        ],
        backgroundColor: "bg-rose-50",
        textColor: "text-rose-900",
        borderColor: "border-rose-200"
      },
      {
        title: "Action Plan",
        content: [
          {
            subtitle: "Immediate Steps",
            text: "1. Begin soil preparation by mid-March\n2. Apply recommended fertilizers\n3. Implement irrigation system upgrades",
            timeline: [
              { task: "Soil Preparation", deadline: "March 15" },
              { task: "Fertilizer Application", deadline: "March 20" },
              { task: "Irrigation Setup", deadline: "March 25" }
            ]
          }
        ],
        backgroundColor: "bg-emerald-50",
        textColor: "text-emerald-900",
        borderColor: "border-emerald-200"
      }
    ]
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const sections = Array.from(reportRef.current.children);
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Wait for images to load
        const images = section.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
          });
        }));

        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight
        });

        // Calculate dimensions while maintaining aspect ratio
        let imgWidth = pageWidth - (2 * margin);
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if the image height exceeds the page height
        if (imgHeight > pageHeight - (2 * margin)) {
          imgHeight = pageHeight - (2 * margin);
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }

        // Add new page for each section except the first
        if (i > 0) {
          pdf.addPage();
        }

        // Center the image on the page
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
      }

      pdf.save('agricultural-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const MetricBar = ({ value, label, color }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className={`text-sm font-medium ${color}`}>{label}</span>
        <span className={`text-sm font-medium ${color}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color.replace('text', 'bg')}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const TimelineItem = ({ task, deadline, color }) => (
    <div className="flex items-center mb-4">
      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${color.replace('text', 'bg')}`}></div>
      <div className="ml-4">
        <p className={`text-sm font-medium ${color}`}>{task}</p>
        <p className="text-xs text-gray-500">{deadline}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white"
        >
          Agricultural Report
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Report
            </>
          )}
        </motion.button>
      </div>

      <div ref={reportRef} className="space-y-8">
        {reportData.sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${section.backgroundColor} rounded-2xl p-8 shadow-sm border ${section.borderColor}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={logo} alt="Logo" className="w-12 h-12" />
              <div>
                <h2 className={`text-2xl font-bold ${section.textColor}`}>{section.title}</h2>
                <p className="text-gray-500 text-sm">{reportData.date}</p>
              </div>
            </div>

            {section.content.map((item, i) => (
              <div key={i} className="mb-6">
                <h3 className={`text-xl font-semibold mb-4 ${section.textColor}`}>{item.subtitle}</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{item.text}</p>

                {item.metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Object.entries(item.metrics).map(([key, value]) => (
                      <MetricBar
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={value}
                        color={section.textColor}
                      />
                    ))}
                  </div>
                )}

                {item.timeline && (
                  <div className="mt-6">
                    {item.timeline.map((timelineItem, index) => (
                      <TimelineItem
                        key={index}
                        task={timelineItem.task}
                        deadline={timelineItem.deadline}
                        color={section.textColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Report;