import dotenv from 'dotenv';
dotenv.config();

class Config {
  constructor() {
    this.PORT = process.env.PORT || 8000;
    this.DATABASE_HOST = process.env.DATABASE_HOST || '';
    this.DATABASE_USER = process.env.DATABASE_USER || '';
    this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';
    this.DATABASE_NAME = process.env.DATABASE_NAME || '';
    this.DATABASE_PORT = process.env.DATABASE_PORT || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
  }
}

export default new Config();