declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
      processedFiles?: Array<{
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
        path: string;
        url: string;
      }>;
    }
  }
}

export {};
