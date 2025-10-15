/**
 * User Registration API Route
 */

import { NextRequest } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequestBody,
  withErrorHandling,
  ApiException,
  ERROR_CODES,
  HTTP_STATUS
} from '@/lib/api-utils';
import { hashPassword, generateToken } from '@/lib/auth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Validate request body
  const { data, error } = await validateRequestBody(request, registerSchema);
  if (error) return error;

  const { email, password, name, phone } = data;

  try {
    // Check if user already exists (in real app, query database)
    // For now, we'll simulate this check
    const existingUser = null; // await getUserByEmail(email);
    
    if (existingUser) {
      throw new ApiException(
        ERROR_CODES.ALREADY_EXISTS,
        'User with this email already exists',
        HTTP_STATUS.CONFLICT
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (in real app, save to database)
    const user = {
      id: `user_${Date.now()}`,
      email,
      name,
      phone,
      role: 'customer' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      'User registered successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    throw new ApiException(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to register user',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
});
