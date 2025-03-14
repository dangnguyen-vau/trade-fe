import React, { useState, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BOT_COLORS, COLORS, getBackgroundColor, getHoverColor } from '../constants/colors';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

function ProfitChart({ botsData, onBotHover, type = 'daily', weeklyData, fourWeekData, twelveMonthData, selectedMonthData, onMonthSelect, selectedDayData, setSelectedDayData, selectedWeekData, setSelectedWeekData }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  // Update selectedDayData when weeklyData or selectedDayIndex changes
  React.useEffect(() => {
    if (selectedDayIndex !== null) {
      setSelectedDayData(weeklyData[selectedDayIndex]);
    }
  }, [weeklyData, selectedDayIndex, setSelectedDayData]);

  const getDailyChartData = useCallback(() => {
    if (selectedDayData) {
      // Show detailed bot performance for selected day
      return {
        labels: selectedDayData.bots.map(bot => bot.name),
        datasets: [{
          data: selectedDayData.bots.map(bot => bot.performance),
          backgroundColor: selectedDayData.bots.map((_, index) => getBackgroundColor(BOT_COLORS[index % BOT_COLORS.length])),
          borderColor: selectedDayData.bots.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: selectedDayData.bots.map((_, index) => getHoverColor(BOT_COLORS[index % BOT_COLORS.length])),
          hoverBorderColor: selectedDayData.bots.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          hoverBorderWidth: 2
        }]
      };
    } else {
      // Show 7-day total profit chart
      return {
        labels: weeklyData.map(day => new Date(day.date).toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        })).reverse(),
        datasets: [{
          data: weeklyData.map(day => {
            const totalProfit = day.bots.reduce((sum, bot) => sum + bot.performance, 0);
            return parseFloat(totalProfit.toFixed(1));
          }).reverse(),
          backgroundColor: weeklyData.map(day => {
            const totalProfit = day.bots.reduce((sum, bot) => sum + bot.performance, 0);
            return getBackgroundColor(totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger);
          }).reverse(),
          borderColor: weeklyData.map(day => {
            const totalProfit = day.bots.reduce((sum, bot) => sum + bot.performance, 0);
            return totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger;
          }).reverse(),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: weeklyData.map(day => {
            const totalProfit = day.bots.reduce((sum, bot) => sum + bot.performance, 0);
            return getHoverColor(totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger);
          }).reverse(),
          hoverBorderColor: weeklyData.map(day => {
            const totalProfit = day.bots.reduce((sum, bot) => sum + bot.performance, 0);
            return totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger;
          }).reverse(),
          hoverBorderWidth: 2,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? COLORS.status.success : COLORS.status.danger;
            },
            font: {
              weight: '600',
              size: 12,
              family: "'Inter', sans-serif"
            },
            formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
          }
        }]
      };
    }
  }, [selectedDayData, weeklyData]);

  const getWeeklyChartData = useCallback(() => {
    if (selectedWeekData) {
      // Show detailed bot performance for selected week
      return {
        labels: selectedWeekData.botPerformances.map(bot => bot.name),
        datasets: [{
          data: selectedWeekData.botPerformances.map(bot => bot.performance),
          backgroundColor: selectedWeekData.botPerformances.map((_, index) => getBackgroundColor(BOT_COLORS[index % BOT_COLORS.length])),
          borderColor: selectedWeekData.botPerformances.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: selectedWeekData.botPerformances.map((_, index) => getHoverColor(BOT_COLORS[index % BOT_COLORS.length])),
          hoverBorderColor: selectedWeekData.botPerformances.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          hoverBorderWidth: 2,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? COLORS.status.success : COLORS.status.danger;
            },
            font: {
              weight: '600',
              size: 12,
              family: "'Inter', sans-serif"
            },
            formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
          }
        }]
      };
    } else {
      // Show 4-week total profit chart
      return {
        labels: fourWeekData.map(week => 
          `Week ${week.weekIndex + 1}\n${new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(week.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        ).reverse(),
        datasets: [{
          data: fourWeekData.map(week => week.totalProfit).reverse(),
          backgroundColor: fourWeekData.map(week => getBackgroundColor(week.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger)).reverse(),
          borderColor: fourWeekData.map(week => week.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger).reverse(),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: fourWeekData.map(week => getHoverColor(week.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger)).reverse(),
          hoverBorderColor: fourWeekData.map(week => week.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger).reverse(),
          hoverBorderWidth: 2,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? COLORS.status.success : COLORS.status.danger;
            },
            font: {
              weight: '600',
              size: 12,
              family: "'Inter', sans-serif"
            },
            formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
          }
        }]
      };
    }
  }, [selectedWeekData, fourWeekData]);

  const getMonthlyChartData = useCallback(() => {
    if (selectedMonthData) {
      // Show detailed bot performance for selected month
      return {
        labels: selectedMonthData.botPerformances.map(bot => bot.name),
        datasets: [{
          data: selectedMonthData.botPerformances.map(bot => bot.performance),
          backgroundColor: selectedMonthData.botPerformances.map((_, index) => getBackgroundColor(BOT_COLORS[index % BOT_COLORS.length])),
          borderColor: selectedMonthData.botPerformances.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: selectedMonthData.botPerformances.map((_, index) => getHoverColor(BOT_COLORS[index % BOT_COLORS.length])),
          hoverBorderColor: selectedMonthData.botPerformances.map((_, index) => BOT_COLORS[index % BOT_COLORS.length]),
          hoverBorderWidth: 2,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? COLORS.status.success : COLORS.status.danger;
            },
            font: {
              weight: '600',
              size: 12,
              family: "'Inter', sans-serif"
            },
            formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
          }
        }]
      };
    } else {
      // Show 12-month overview
      return {
        labels: twelveMonthData.map(month => month.monthLabel).reverse(),
        datasets: [{
          data: twelveMonthData.map(month => month.totalProfit).reverse(),
          backgroundColor: twelveMonthData.map(month => 
            getBackgroundColor(month.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger)
          ).reverse(),
          borderColor: twelveMonthData.map(month => 
            month.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger
          ).reverse(),
          borderWidth: 2,
          borderRadius: {
            topLeft: 4,
            topRight: 4
          },
          hoverBackgroundColor: twelveMonthData.map(month => 
            getHoverColor(month.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger)
          ).reverse(),
          hoverBorderColor: twelveMonthData.map(month => 
            month.totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger
          ).reverse(),
          hoverBorderWidth: 2,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? COLORS.status.success : COLORS.status.danger;
            },
            font: {
              weight: '600',
              size: 12,
              family: "'Inter', sans-serif"
            },
            formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
          }
        }]
      };
    }
  }, [selectedMonthData, twelveMonthData]);

  const handleChartClick = useCallback((event, elements) => {
    if (type === 'daily') {
      if (!selectedDayData && elements && elements.length > 0) {
        // When clicking on a day in 7-day view
        const dayIndex = weeklyData.length - 1 - elements[0].index;
        setSelectedDayIndex(dayIndex);
      } else if (selectedDayData && elements && elements.length > 0) {
        // When clicking on a bot in detailed view
        const botName = selectedDayData.bots[elements[0].index].name;
        onBotHover(botName);
        
        const botCard = document.getElementById(`bot-${type}-${botName}`);
        if (botCard) {
          botCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        // When clicking outside bars, reset to 7-day view
        setSelectedDayIndex(null);
        setSelectedDayData(null);
        onBotHover(null);
      }
    } else if (type === 'weekly') {
      if (!selectedWeekData && elements && elements.length > 0) {
        // When clicking on a week in 4-week view
        const weekIndex = fourWeekData.length - 1 - elements[0].index;
        setSelectedWeekData(fourWeekData[weekIndex]);
      } else if (selectedWeekData && elements && elements.length > 0) {
        // When clicking on a bot in weekly detail view
        const botName = selectedWeekData.botPerformances[elements[0].index].name;
        onBotHover(botName);
        
        const botCard = document.getElementById(`bot-${type}-${botName}`);
        if (botCard) {
          botCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        // When clicking outside bars, reset to 4-week view
        setSelectedWeekData(null);
        onBotHover(null);
      }
    } else if (type === 'monthly') {
      if (!selectedMonthData && elements && elements.length > 0) {
        // When clicking on a month in 12-month view
        const monthIndex = twelveMonthData.length - 1 - elements[0].index;
        onMonthSelect(twelveMonthData[monthIndex]);
      } else if (selectedMonthData && elements && elements.length > 0) {
        // When clicking on a bot in monthly detail view
        const botName = selectedMonthData.botPerformances[elements[0].index].name;
        onBotHover(botName);
        
        const botCard = document.getElementById(`bot-${type}-${botName}`);
        if (botCard) {
          botCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        // When clicking outside bars in detail view
        onBotHover(null);
      }
    }
  }, [type, selectedDayData, selectedWeekData, selectedMonthData, weeklyData, fourWeekData, twelveMonthData, onBotHover, setSelectedDayData, setSelectedDayIndex, setSelectedWeekData, onMonthSelect]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false,
        external: function(context) {
          let tooltipEl = document.getElementById('chartjs-tooltip');
          
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.background = COLORS.card;
            tooltipEl.style.backdropFilter = 'blur(10px)';
            tooltipEl.style.borderRadius = '6px';
            tooltipEl.style.padding = '8px 12px';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transition = 'all .1s ease';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.transform = 'translate(-50%, 0)';
            tooltipEl.style.border = `1px solid ${COLORS.border}`;
            document.body.appendChild(tooltipEl);
          }

          if (context.tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          const dataPoint = context.tooltip.dataPoints[0];
          
          // Overview tooltips (7-day, 4-week, 12-month)
          if ((type === 'daily' && !selectedDayData) || 
              (type === 'weekly' && !selectedWeekData) || 
              (type === 'monthly' && !selectedMonthData)) {
            let title = '';
            let value = dataPoint.raw;

            if (type === 'daily') {
              const dayData = weeklyData?.[weeklyData.length - 1 - dataPoint.dataIndex];
              title = dayData ? new Date(dayData.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Daily overview';
            } else if (type === 'weekly') {
              const weekData = fourWeekData?.[fourWeekData.length - 1 - dataPoint.dataIndex];
              title = weekData ? `Week ${weekData.weekIndex + 1}` : 'Weekly overview';
            } else if (type === 'monthly') {
              const monthData = twelveMonthData?.[twelveMonthData.length - 1 - dataPoint.dataIndex];
              title = monthData ? monthData.monthLabel : 'Monthly overview';
            }

            tooltipEl.innerHTML = `
              <div style="font-family: Inter, sans-serif; min-width: 150px;">
                <div style="color: ${COLORS.text.primary}; font-size: 12px; margin-bottom: 4px;">
                  ${title}
                </div>
                <div style="color: ${value >= 0 ? COLORS.status.success : COLORS.status.danger}; font-size: 16px; font-weight: 600;">
                  ${value > 0 ? '+' : ''}${value}%
                </div>
                <div style="color: ${COLORS.text.secondary}; font-size: 12px; margin-top: 4px;">
                  Click to view details
                </div>
              </div>
            `;
          } else {
            // Detail view tooltips (bot performance)
            let bot;
            if (type === 'daily' && selectedDayData) {
              bot = selectedDayData.bots?.[dataPoint.dataIndex];
            } else if (type === 'weekly' && selectedWeekData) {
              bot = selectedWeekData.botPerformances?.[dataPoint.dataIndex];
            } else if (type === 'monthly' && selectedMonthData) {
              bot = selectedMonthData.botPerformances?.[dataPoint.dataIndex];
            }

            if (bot) {
          const botColor = BOT_COLORS[dataPoint.dataIndex % BOT_COLORS.length];
              const winRate = bot.winRate || 'N/A';
              const balance = typeof bot.balance === 'number' ? bot.balance.toLocaleString() : 'N/A';
              const netProfit = typeof bot.netProfit === 'number' ? Math.abs(bot.netProfit).toLocaleString() : 'N/A';
              const profitSign = typeof bot.netProfit === 'number' && bot.netProfit >= 0 ? '+' : '-';
          
          tooltipEl.innerHTML = `
            <div style="font-family: Inter, sans-serif; min-width: 150px;">
              <div style="color: ${botColor}; font-size: 12px; margin-bottom: 4px;">
                ${bot.name}
              </div>
              <div style="color: ${dataPoint.raw >= 0 ? COLORS.status.success : COLORS.status.danger}; font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                ${dataPoint.raw > 0 ? '+' : ''}${dataPoint.raw}%
              </div>
              <div style="color: ${COLORS.text.primary}; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: ${COLORS.text.secondary};">Win Rate</span>
                      <span>${winRate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: ${COLORS.text.secondary};">Balance</span>
                      <span>$${balance}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: ${COLORS.text.secondary};">Net Profit</span>
                      <span style="color: ${typeof bot.netProfit === 'number' && bot.netProfit >= 0 ? COLORS.status.success : COLORS.status.danger}">
                        ${profitSign}$${netProfit}
                  </span>
                </div>
              </div>
            </div>
          `;
            }
          }

          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.opacity = 1;
          tooltipEl.style.left = position.left + window.pageXOffset + context.tooltip.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + context.tooltip.caretY + 'px';
        }
      },
      datalabels: {
        display: (context) => {
          if (type === 'daily') {
            return !selectedDayData; // Show labels only in 7-day view
          }
          return false;
        }
      }
    },
    onClick: handleChartClick,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: (context) => {
            if (type === 'daily' && !selectedDayData) {
              return COLORS.text.secondary;
            }
            const index = context.index;
            return BOT_COLORS[index % BOT_COLORS.length] + 'CC';
          },
          maxRotation: 45,
          minRotation: 45
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: COLORS.border,
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: COLORS.text.secondary,
          callback: function(value) {
            return value > 0 ? `+${value}%` : `${value}%`;
          },
          padding: 10
        },
        border: {
          display: false
        }
      }
    },
    barPercentage: 0.6,
    categoryPercentage: 0.8,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  }), [handleChartClick]);

  const data = useMemo(() => {
    if (type === 'daily') return getDailyChartData();
    if (type === 'weekly') return getWeeklyChartData();
    return getMonthlyChartData();
  }, [type, getDailyChartData, getWeeklyChartData, getMonthlyChartData]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {type === 'daily' && (
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        fontSize: '12px',
        color: COLORS.text.secondary + '99',
        textAlign: 'right',
        fontStyle: 'italic',
        background: 'rgba(0,0,0,0.4)',
        padding: '4px 12px',
        borderRadius: '12px',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${COLORS.border}`,
        textShadow: '0 0 10px rgba(255,255,255,0.2)',
          zIndex: 1,
          cursor: selectedDayData ? 'pointer' : 'default'
        }} onClick={() => {
          setSelectedDayIndex(null);
          setSelectedDayData(null);
        }}>
          {selectedDayData ? 'Click anywhere to return to 7-day view' : 'Click on a day to view details'}
      </div>
      )}
      {type === 'weekly' && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: COLORS.text.secondary + '99',
          textAlign: 'right',
          fontStyle: 'italic',
          background: 'rgba(0,0,0,0.4)',
          padding: '4px 12px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${COLORS.border}`,
          textShadow: '0 0 10px rgba(255,255,255,0.2)',
          zIndex: 1,
          cursor: selectedWeekData ? 'pointer' : 'default'
        }} onClick={() => selectedWeekData && setSelectedWeekData(null)}>
          {selectedWeekData ? 'Click anywhere to return to 4-week view' : 'Click on a week to view details'}
        </div>
      )}
      {type === 'monthly' && !selectedMonthData && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: COLORS.text.secondary + '99',
          textAlign: 'right',
          fontStyle: 'italic',
          background: 'rgba(0,0,0,0.4)',
          padding: '4px 12px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${COLORS.border}`,
          textShadow: '0 0 10px rgba(255,255,255,0.2)',
          zIndex: 1
        }}>
          Click on a month to view details
        </div>
      )}
      {type === 'monthly' && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: COLORS.text.secondary + '99',
          textAlign: 'right',
          fontStyle: 'italic',
          background: 'rgba(0,0,0,0.4)',
          padding: '4px 12px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${COLORS.border}`,
          textShadow: '0 0 10px rgba(255,255,255,0.2)',
          zIndex: 1,
          cursor: selectedMonthData ? 'pointer' : 'default'
        }} onClick={() => selectedMonthData && onMonthSelect(null)}>
          {selectedMonthData ? 'Click anywhere to return to 12-month view' : 'Click on a month to view details'}
        </div>
      )}
      <Bar options={options} data={data} />
    </div>
  );
}

export default ProfitChart; 