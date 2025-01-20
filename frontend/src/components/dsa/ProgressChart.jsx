import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function ProgressChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: [
            data.filter(q => q.difficulty === 'Easy').length,
            data.filter(q => q.difficulty === 'Medium').length,
            data.filter(q => q.difficulty === 'Hard').length
          ],
          backgroundColor: [
            'rgba(72, 187, 120, 0.8)',
            'rgba(237, 137, 54, 0.8)',
            'rgba(245, 101, 101, 0.8)'
          ],
          borderColor: [
            'rgb(72, 187, 120)',
            'rgb(237, 137, 54)',
            'rgb(245, 101, 101)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'white'
            }
          },
          title: {
            display: true,
            text: 'Questions by Difficulty',
            color: 'white',
            font: {
              size: 16
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <canvas ref={chartRef} className="w-full h-full" />
  );
}

export default ProgressChart;