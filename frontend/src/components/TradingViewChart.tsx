'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingViewChartProps {
  data: CandlestickData[];
  height?: number;
  width?: number;
}

export default function TradingViewChart({ data, height = 400, width }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const candleSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);

  // Load the Lightweight Charts library from CDN
  useEffect(() => {
    if (typeof window === 'undefined' || !chartContainerRef.current) return;

    // Check if LightweightCharts is already loaded
    if (!window.LightweightCharts) {
      // Load the script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js';
      script.async = true;
      script.onload = () => {
        // Initialize chart after script loads
        initializeChart();
      };
      document.head.appendChild(script);
    } else {
      // Initialize chart if already loaded
      initializeChart();
    }

    // Cleanup function
    return () => {
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
      }
    };
  }, []);

  const initializeChart = () => {
    if (!chartContainerRef.current || !window.LightweightCharts) return;

    // Clean up any existing chart
    if (chart.current) {
      chart.current.remove();
      chart.current = null;
      candleSeries.current = null;
      volumeSeries.current = null;
    }

    // Initialize chart
    const chartOptions = {
      width: width || chartContainerRef.current.clientWidth,
      height,
      layout: {
        backgroundColor: '#1a1a1a',
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      crosshair: {
        mode: 0, // Normal mode
      },
      rightPriceScale: {
        borderColor: '#485563',
      },
      timeScale: {
        borderColor: '#485563',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    // Create the chart
    chart.current = window.LightweightCharts.createChart(chartContainerRef.current, chartOptions);

    // Add candlestick series
    candleSeries.current = chart.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    // Add volume series
    volumeSeries.current = chart.current.addHistogramSeries({
      color: '#4f46e5',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle window resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({ 
          width: width || chartContainerRef.current?.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function for chart initialization
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  // Update chart data when data changes
  useEffect(() => {
    if (!window.LightweightCharts || !chart.current || !candleSeries.current || !volumeSeries.current) return;

    // Update chart data
    const candleData = data;
    const volumeData = data.map(item => ({
      time: item.time,
      value: item.volume || 0,
      color: item.close > item.open ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
    }));

    candleSeries.current.setData(candleData);
    volumeSeries.current.setData(volumeData);

    // Fit the viewport to the data
    chart.current.timeScale().fitContent();
  }, [data]);

  // Handle window resize
  useEffect(() => {
    if (!chart.current) return;

    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({ 
          width: chartContainerRef.current?.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px` }} />;
}

// Helper function to generate mock candlestick data
export function generateCandlestickData(count = 30) {
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  const result = [];
  
  let previousValue = 100;
  
  for (let i = 0; i < count; i++) {
    const time = now - (count - i - 1) * oneDay;
    const open = previousValue;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(Math.random() * 1000) + 100;
    
    result.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
    
    previousValue = close;
  }
  
  return result;
}
