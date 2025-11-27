import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { isSquareConfigured } from '@/lib/square/client';
import { searchCatalogItems } from '@/lib/square/catalog';
import { successResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      message?: string;
      responseTime?: number;
    };
    square: {
      status: 'healthy' | 'unhealthy' | 'not_configured';
      message?: string;
      responseTime?: number;
    };
  };
}

// GET /api/health
// Health check endpoint that verifies connections to Neon DB and Square API
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthCheck: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: 'unhealthy',
      },
      square: {
        status: 'not_configured',
      },
    },
  };

  // Check Neon Database connection
  try {
    const dbStartTime = Date.now();
    await sql`SELECT 1 as health_check`;
    const dbResponseTime = Date.now() - dbStartTime;
    
    healthCheck.services.database = {
      status: 'healthy',
      responseTime: dbResponseTime,
    };
  } catch (error: any) {
    healthCheck.services.database = {
      status: 'unhealthy',
      message: error.message || 'Database connection failed',
    };
    healthCheck.status = 'unhealthy';
  }

  // Check Square API connection
  if (isSquareConfigured()) {
    try {
      const squareStartTime = Date.now();
      
      // Try a simple catalog search as a health check
      // This verifies the API is accessible and credentials are valid
      // Limit to 1 item to minimize API usage
      await searchCatalogItems({ limit: 1 });
      
      const squareResponseTime = Date.now() - squareStartTime;
      
      healthCheck.services.square = {
        status: 'healthy',
        responseTime: squareResponseTime,
      };
    } catch (error: any) {
      healthCheck.services.square = {
        status: 'unhealthy',
        message: error.message || 'Square API connection failed',
      };
      // Don't mark overall as unhealthy if Square fails (it's optional)
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    }
  } else {
    healthCheck.services.square = {
      status: 'not_configured',
      message: 'Square API is not configured',
    };
    // Square not being configured is not a failure, just informational
  }

  // Determine overall status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                     healthCheck.status === 'degraded' ? 200 : 503;

  return successResponse(
    healthCheck,
    {
      status: statusCode,
      meta: {
        responseTime: Date.now() - startTime,
      },
    }
  );
}

