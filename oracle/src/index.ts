import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import './types/node';

dotenv.config();

const app = express();
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || '';
const PORT_API_URL = process.env.PORT_API_URL || 'https://api.portperformance.com/data';

// Port Oracle ABI (simplified)
const ORACLE_ABI = [
  'function updatePortData(string memory portCode, uint256 performanceIndex) external',
  'function getPortData(string memory portCode) external view returns (uint256, uint256, bool)',
  'function getActivePortsCount() external view returns (uint256)',
  'function getActivePort(uint256 index) external view returns (string)',
];

// Port performance data mapping
const PORT_CODES = [
  'SINGAPORE',
  'DUBAI', 
  'ROTTERDAM',
  'SHANGHAI',
  'LOS_ANGELES'
];

class OracleService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private oracleContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.oracleContract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, this.wallet);
  }

  // Mock port performance API call
  private async fetchPortPerformanceData(): Promise<Record<string, number>> {
    try {
      // In a real implementation, this would call an actual API
      // For now, we'll generate mock data based on realistic port metrics
      const performanceData: Record<string, number> = {};

      for (const portCode of PORT_CODES) {
        // Generate realistic performance index (0-10000, representing 0-100%)
        // Base performance around 50-80% with some variation
        const basePerformance = this.getBasePerformance(portCode);
        const variation = (Math.random() - 0.5) * 1000; // ±5% variation
        const performance = Math.max(1000, Math.min(9500, basePerformance + variation));
        
        performanceData[portCode] = Math.floor(performance);
      }

      console.log('Fetched port performance data:', performanceData);
      return performanceData;
    } catch (error) {
      console.error('Error fetching port performance data:', error);
      throw error;
    }
  }

  private getBasePerformance(portCode: string): number {
    // Base performance indices for different ports (in basis points, 0-10000)
    const basePerformances: Record<string, number> = {
      'SINGAPORE': 7500,    // 75% - High performance hub
      'DUBAI': 7000,        // 70% - Major Middle East hub
      'ROTTERDAM': 6800,    // 68% - Major European hub
      'SHANGHAI': 7200,     // 72% - Largest container port
      'LOS_ANGELES': 6500,  // 65% - Major US West Coast port
    };
    
    return basePerformances[portCode] || 5000; // Default to 50%
  }

  // Update oracle contract with new performance data
  private async updateOracleData(performanceData: Record<string, number>): Promise<void> {
    try {
      console.log('Updating oracle contract with new data...');

      for (const [portCode, performanceIndex] of Object.entries(performanceData)) {
        try {
          console.log(`Updating ${portCode} with performance index: ${performanceIndex}`);
          
          const tx = await this.oracleContract.updatePortData(portCode, performanceIndex);
          await tx.wait();
          
          console.log(`✅ Updated ${portCode} successfully. Tx: ${tx.hash}`);
        } catch (error) {
          console.error(`❌ Failed to update ${portCode}:`, error);
        }
      }

      console.log('Oracle update cycle completed');
    } catch (error) {
      console.error('Error updating oracle data:', error);
      throw error;
    }
  }

  // Main update cycle
  public async runUpdateCycle(): Promise<void> {
    try {
      console.log(`🔄 Starting oracle update cycle at ${new Date().toISOString()}`);
      
      const performanceData = await this.fetchPortPerformanceData();
      await this.updateOracleData(performanceData);
      
      console.log('✅ Oracle update cycle completed successfully');
    } catch (error) {
      console.error('❌ Oracle update cycle failed:', error);
    }
  }

  // Get current oracle data for API endpoint
  public async getCurrentOracleData(): Promise<Record<string, any>> {
    try {
      const data: Record<string, any> = {};

      for (const portCode of PORT_CODES) {
        try {
          const [performanceIndex, lastUpdated, isActive] = await this.oracleContract.getPortData(portCode);
          
          data[portCode] = {
            performanceIndex: Number(performanceIndex),
            performance: (Number(performanceIndex) / 100).toFixed(1) + '%',
            lastUpdated: new Date(Number(lastUpdated) * 1000).toISOString(),
            isActive: isActive,
          };
        } catch (error) {
          console.error(`Error getting data for ${portCode}:`, error);
          data[portCode] = {
            performanceIndex: 0,
            performance: '0.0%',
            lastUpdated: new Date().toISOString(),
            isActive: false,
          };
        }
      }

      return data;
    } catch (error) {
      console.error('Error getting current oracle data:', error);
      throw error;
    }
  }
}

// Initialize oracle service
const oracleService = new OracleService();

// API Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/oracle/data', async (req: Request, res: Response) => {
  try {
    const data = await oracleService.getCurrentOracleData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch oracle data' });
  }
});

app.post('/oracle/update', async (req: Request, res: Response) => {
  try {
    await oracleService.runUpdateCycle();
    res.json({ success: true, message: 'Oracle updated successfully' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: 'Failed to update oracle' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Oracle service running on port ${PORT}`);
  console.log(`📊 Monitoring ${PORT_CODES.length} ports: ${PORT_CODES.join(', ')}`);
  
  // Run initial update
  oracleService.runUpdateCycle();
  
  // Schedule updates every 10 minutes
  setInterval(() => {
    oracleService.runUpdateCycle();
  }, 10 * 60 * 1000);
});

export default app;
