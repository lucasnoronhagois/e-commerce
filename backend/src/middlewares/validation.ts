import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

export const validate = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      return next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.errors.map(err => ({ message: err }));
        return res.status(400).json({ errors });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

export const validateParams = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.params, { abortEarly: false });
      return next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.errors.map(err => ({ message: err }));
        return res.status(400).json({ errors });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};
