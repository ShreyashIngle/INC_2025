import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function TopicProgress({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.topic),
        datasets: [{
          label: 'Completion %',
          data: data.map(item => item.percentage),
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          borderColor: 'rgb(33, 150, 243)',
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
            text: 'Topic-wise Progress',
            color: 'white',
            font: {
              size: 16
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'white'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'white',
              callback: value => `${value}%`
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

export default TopicProgress;