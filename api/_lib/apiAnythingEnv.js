/**
 * api-anything writes sessions/pace under API_ANYTHING_HOME.
 * Vercel’s function FS is read-only except /tmp — pin home there before importing api-anything.
 */
import { tmpdir } from 'os'
import { join } from 'path'

if (!process.env.API_ANYTHING_HOME) {
  process.env.API_ANYTHING_HOME = join(tmpdir(), 'api-anything-spiral-groove')
}
