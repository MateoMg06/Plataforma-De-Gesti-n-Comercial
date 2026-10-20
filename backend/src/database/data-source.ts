import 'dotenv/config';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config.js';

// Usado por los scripts migration:* del package.json.
export default new DataSource(databaseConfig());
