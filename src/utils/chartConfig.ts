/**
 * Optimized Chart.js configuration for analytics
 * Provides consistent, performant chart settings across the application
 */

import { ChartOptions } from 'chart.js'

/**
 * Base chart options with optimized animations
 */
export const baseChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 750, // Reduced from default 1000ms
    easing: 'easeInOutQuart',
  },
  transitions: {
    active: {
      animation: {
        duration: 300
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      padding: 12,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            // Format numbers with commas
            label += new Intl.NumberFormat('en-US').format(context.parsed.y)
            // Add % for satisfaction metrics
            if (context.dataset.label?.includes('Satisfaction') || 
                context.dataset.label?.includes('%')) {
              label += '%'
            }
          }
          return label
        }
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
}

/**
 * Dual-axis chart options (for charts with count + percentage)
 */
export const dualAxisChartOptions: Partial<ChartOptions<'bar'>> = {
  ...baseChartOptions,
  scales: {
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Respondents',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      ticks: {
        precision: 0,
        font: {
          size: 11
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    y1: {
      type: 'linear' as const,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Satisfaction %',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      min: 0,
      max: 100,
      ticks: {
        callback: function(value: any) {
          return value + '%'
        },
        font: {
          size: 11
        }
      },
      grid: {
        drawOnChartArea: false
      }
    },
    x: {
      ticks: {
        font: {
          size: 11
        }
      },
      grid: {
        display: false
      }
    }
  }
}

/**
 * Line chart options for trends
 */
export const lineChartOptions: Partial<ChartOptions<'line'>> = {
  ...baseChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Satisfaction %',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      ticks: {
        callback: function(value: any) {
          return value + '%'
        },
        font: {
          size: 11
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Survey Cycle',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      ticks: {
        font: {
          size: 11
        }
      },
      grid: {
        display: false
      }
    }
  },
  elements: {
    line: {
      tension: 0.4, // Smooth curves
      borderWidth: 3
    },
    point: {
      radius: 5,
      hoverRadius: 7,
      hitRadius: 10
    }
  }
}

/**
 * Bar chart options
 */
export const barChartOptions: Partial<ChartOptions<'bar'>> = {
  ...baseChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Average Satisfaction %',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      max: 100,
      ticks: {
        callback: function(value: any) {
          return value + '%'
        },
        font: {
          size: 11
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 11
        },
        maxRotation: 45,
        minRotation: 0
      },
      grid: {
        display: false
      }
    }
  }
}

/**
 * Pie chart options
 */
export const pieChartOptions: Partial<ChartOptions<'pie'>> = {
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 750,
    easing: 'easeInOutQuart',
  },
  plugins: {
    legend: {
      display: true,
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        },
        generateLabels: function(chart: any) {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, i: number) => {
              const value = data.datasets[0].data[i]
              const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}

/**
 * Color palettes for consistent styling
 */
export const colorPalettes = {
  primary: [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(168, 85, 247, 0.8)',   // Purple
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(14, 165, 233, 0.8)',   // Sky
  ],
  satisfaction: {
    excellent: 'rgba(34, 197, 94, 0.8)',   // Green (80-100%)
    good: 'rgba(234, 179, 8, 0.8)',        // Yellow (60-79%)
    fair: 'rgba(249, 115, 22, 0.8)',       // Orange (40-59%)
    poor: 'rgba(239, 68, 68, 0.8)',        // Red (0-39%)
  },
  gradient: {
    blue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%)',
    green: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)',
    purple: 'linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
  }
}

/**
 * Get color based on satisfaction level
 */
export function getSatisfactionColor(satisfaction: number): string {
  if (satisfaction >= 80) return colorPalettes.satisfaction.excellent
  if (satisfaction >= 60) return colorPalettes.satisfaction.good
  if (satisfaction >= 40) return colorPalettes.satisfaction.fair
  return colorPalettes.satisfaction.poor
}

/**
 * Accessibility: Ensure charts have proper ARIA labels
 */
export function getChartAriaLabel(chartType: string, dataDescription: string): string {
  return `${chartType} chart showing ${dataDescription}`
}
