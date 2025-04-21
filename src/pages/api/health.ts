import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
};

/**
 * Health check endpoint for monitoring services
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  });
}
