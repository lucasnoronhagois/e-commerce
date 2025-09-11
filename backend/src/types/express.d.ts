declare global {
  namespace Express {
    interface Request {
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
