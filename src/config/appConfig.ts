import { IConfig } from './interfaces/config.type';
export default (): IConfig => {
  return {
    db: {
      type: 'postgres' as const,
      host: process.env.DB_HOST || '',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      logger: 'advanced-console',
    },
    redis: {
      url: process.env.REDIS_URL!,
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
    },
    jwt: {
      secret: process.env.JWT_SECRET || '',
    },
    mail: {
      password: process.env.EMAIL_PASSWORD || '',
      email: process.env.EMAIL_ADDRESS || '',
    },
    elasticSearch: {
      timeout: 3000,
      node: process.env.ELASTICSEARCH_NODE!,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME!,
        password: process.env.ELASTICSEARCH_PASSWORD!,
      },
    },
    cloudinary: {
      name: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!,
    },
  };
};
