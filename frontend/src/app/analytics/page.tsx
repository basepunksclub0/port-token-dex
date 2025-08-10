'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function Analytics() {
  const [provider, setProvider] = useState<any>(null);
  const [portOracle, setPortOracle] = useState<any>(null);
  
  // Token information
  const [tokens] = useState<any[]>([
    { name: 'Singapore Port Token', symbol: 'SPT', address: '', portName: 'Singapore' },
    { name: 'Rotterdam Port Token', symbol: 'RPT', address: '', portName: 'Rotterdam' }
  ]);
  
  // Analytics data
  const [tokenPrices, setTokenPrices] = useState<any[]>([]);
  const [poolData, setPoolData] = useState<any[]>([]);
  
  // Contract addresses (to be filled after deployment)
  const portOracleAddress = 'YOUR_PORT_ORACLE_CONTRACT_ADDRESS';
  const portDEXAddress = 'YOUR_PORT_DEX_CONTRACT_ADDRESS';
  
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(provider);
        
        // Initialize contracts here after addresses are set
      }
    };
    
    init();
  }, []);
  
  // Mock data for charts
  const priceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Singapore Port Token Price',
        data: [950, 980, 1020, 990, 1050, 1080, 1020, 1000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Rotterdam Port Token Price',
        data: [1100, 1150, 1180, 1200, 1170, 1130, 1190, 1200],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const volumeChartData = {
    labels: ['Singapore', 'Rotterdam', 'Shanghai', 'Los Angeles', 'Hamburg'],
    datasets: [
      {
        label: 'Trading Volume (ETH)',
        data: [120, 150, 200, 90, 110],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-indigo-800">Port Token DEX - Analytics</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Connect Wallet
          </button>
        </header>
        
        <main>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Market Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Token Prices Over Time</h3>
                <Line 
                  data={priceChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Port Token Price Trends',
                      },
                    },
                  }} 
                />
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Trading Volume by Port</h3>
                <Bar 
                  data={volumeChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Port Trading Volumes',
                      },
                    },
                  }} 
                />
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Port Performance Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liquidity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Singapore</td>
                      <td className="px-6 py-4 whitespace-nowrap">SPT</td>
                      <td className="px-6 py-4 whitespace-nowrap">1000</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">+2.5%</td>
                      <td className="px-6 py-4 whitespace-nowrap">120 ETH</td>
                      <td className="px-6 py-4 whitespace-nowrap">500 ETH</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Rotterdam</td>
                      <td className="px-6 py-4 whitespace-nowrap">RPT</td>
                      <td className="px-6 py-4 whitespace-nowrap">1200</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600">-1.2%</td>
                      <td className="px-6 py-4 whitespace-nowrap">150 ETH</td>
                      <td className="px-6 py-4 whitespace-nowrap">750 ETH</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
