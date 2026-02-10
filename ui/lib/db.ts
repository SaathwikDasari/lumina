import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://postgres:Saathwik%40123@10.33.107.95:5432/luminadb",
});

export const query = (text: string, params?: any[]) => pool.query(text, params);