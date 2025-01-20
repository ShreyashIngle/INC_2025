import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function SolvingStreak({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Process data to show last 30 days
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const solvedCounts = last30Days.map(date => {
      return data.filter(q => 
        new Date(q.solvedAt).toISOString().split('T')[0] === date
      ).length;
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last30Days.map(date => new Date(date).toLocaleDateString()),
        datasets: [{
          label: 'Problems Solved',
          data: solvedCounts,
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
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
            text: 'Solving Streak',
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
              color: 'white'
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

export default SolvingStreak;