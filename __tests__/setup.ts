import { vi, afterEach } from 'vitest';

process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-auth-secret';

// Mock database module to avoid requiring DATABASE_URL
vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextRequest: class {
    url: string;
    init?: RequestInit;
    nextUrl = { pathname: '' };
    cookies = {
      get: vi.fn(),
    };
    json = vi.fn();
    
    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.init = init;
    }
  },
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ...init,
    })),
    redirect: vi.fn(),
    next: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

const defaultParseBodyImpl = async (req: any) => {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  if (typeof req.json === 'function') {
    return req.json();
  }
  return {};
};

export const parseBodyMock = vi.fn(defaultParseBodyImpl);

vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual<Product<string, any>>('@/lib/api/middleware');
  return {
    ...actual,
    parseBody: parseBodyMock,
  };
});

afterEach(() => {
  vi.resetAllMocks();
  parseBodyMock.mockImplementation(defaultParseBodyImpl);
});

