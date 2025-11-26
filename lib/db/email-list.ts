import { sql } from '@/lib/db';
import { ApiError } from '@/lib/api/errors';

// Email list entry structure
export interface EmailListEntry {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  source?: string;
}

// Save or update an email in the database
// Handles both camelCase (Prisma style) and snake_case column names
// Also handles different ID column types (auto-increment vs UUID)
export async function upsertEmail(entry: EmailListEntry): Promise<void> {
  const { firstName, lastName, email, source = 'website' } = entry;

  // Try camelCase first (what Prisma generates by default)
  try {
    await sql`
      INSERT INTO email_list ("firstName", "lastName", email, source, "createdAt", "updatedAt")
      VALUES (${firstName || null}, ${lastName || null}, ${email}, ${source}, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        "firstName" = COALESCE(EXCLUDED."firstName", email_list."firstName"),
        "lastName" = COALESCE(EXCLUDED."lastName", email_list."lastName"),
        "updatedAt" = NOW()
    `;
    return;
  } catch (camelCaseError: any) {
    // If camelCase fails, try snake_case (raw SQL style)
    if (
      camelCaseError.code === '42703' ||
      camelCaseError.message?.includes('does not exist') ||
      camelCaseError.message?.includes('column')
    ) {
      try {
        await sql`
          INSERT INTO email_list (first_name, last_name, email, source, created_at, updated_at)
          VALUES (${firstName || null}, ${lastName || null}, ${email}, ${source}, NOW(), NOW())
          ON CONFLICT (email) 
          DO UPDATE SET 
            first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
            last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
            updated_at = NOW()
        `;
        return;
      } catch (snakeCaseError: any) {
        // If the id column needs a value, try generating a UUID
        if (snakeCaseError.code === '23502' && snakeCaseError.column === 'id') {
          try {
            await sql`
              INSERT INTO email_list (id, first_name, last_name, email, source, created_at, updated_at)
              VALUES (gen_random_uuid(), ${firstName || null}, ${lastName || null}, ${email}, ${source}, NOW(), NOW())
              ON CONFLICT (email) 
              DO UPDATE SET 
                first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
                last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
                updated_at = NOW()
            `;
            return;
          } catch (uuidError: any) {
            throw new ApiError(
              `Failed to save email: ${uuidError.message}`,
              500,
              'DATABASE_ERROR',
              { cause: uuidError }
            );
          }
        }
        throw new ApiError(
          `Failed to save email: ${snakeCaseError.message}`,
          500,
          'DATABASE_ERROR',
          { cause: snakeCaseError }
        );
      }
    }
    
    // If camelCase had an id error, try with UUID generation
    if (camelCaseError.code === '23502' && camelCaseError.column === 'id') {
      try {
        await sql`
          INSERT INTO email_list (id, "firstName", "lastName", email, source, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${firstName || null}, ${lastName || null}, ${email}, ${source}, NOW(), NOW())
          ON CONFLICT (email) 
          DO UPDATE SET 
            "firstName" = COALESCE(EXCLUDED."firstName", email_list."firstName"),
            "lastName" = COALESCE(EXCLUDED."lastName", email_list."lastName"),
            "updatedAt" = NOW()
        `;
        return;
      } catch (uuidError: any) {
        throw new ApiError(
          `Failed to save email: ${uuidError.message}`,
          500,
          'DATABASE_ERROR',
          { cause: uuidError }
        );
      }
    }

    // If all else fails, throw the original error
    throw new ApiError(
      `Failed to save email: ${camelCaseError.message}`,
      500,
      'DATABASE_ERROR',
      { cause: camelCaseError }
    );
  }
}

