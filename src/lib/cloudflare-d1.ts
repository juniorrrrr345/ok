// Cloudflare D1 Database Client
// Remplace MongoDB/Mongoose

interface CloudflareD1Config {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

class CloudflareD1Client {
  private config: CloudflareD1Config;
  private baseUrl: string;

  constructor(config: CloudflareD1Config) {
    this.config = config;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}`;
  }

  async query(sql: string, params: any[] = []) {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sql: sql,
          params: params || []
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('D1 API Error:', errorText);
        throw new Error(`D1 Query failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('D1 Query failed:', data.errors);
        throw new Error(`D1 Query failed: ${JSON.stringify(data.errors)}`);
      }
      
      return data.result?.[0] || { results: [], success: true, meta: {} };
    } catch (error) {
      console.error('D1 Query Error:', error);
      // Retourner des données par défaut en cas d'erreur
      return { results: [], success: false, error: error.message };
    }
  }

  async execute(sql: string, params: any[] = []) {
    return this.query(sql, params);
  }

  // Méthodes utilitaires pour les opérations CRUD
  async findOne(table: string, where: Record<string, any> = {}) {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    
    const sql = `SELECT * FROM ${table} ${whereClause} LIMIT 1`;
    const params = Object.values(where);
    
    const result = await this.query(sql, params);
    return result.results?.[0] || null;
  }

  async findMany(table: string, where: Record<string, any> = {}, orderBy?: string) {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    
    const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';
    
    const sql = `SELECT * FROM ${table} ${whereClause} ${orderClause}`;
    const params = Object.values(where);
    
    const result = await this.query(sql, params);
    return result.results || [];
  }

  async create(table: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const result = await this.query(sql, values);
    
    if (result.success) {
      // Retourner l'enregistrement créé
      return this.findOne(table, { id: result.meta?.last_row_id });
    }
    
    throw new Error('Failed to create record');
  }

  async update(table: string, id: number, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const result = await this.query(sql, [...values, id]);
    
    if (result.success) {
      return this.findOne(table, { id });
    }
    
    throw new Error('Failed to update record');
  }

  async delete(table: string, id: number) {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await this.query(sql, [id]);
    return result.success;
  }

  // Méthodes spécifiques pour les modèles de la boutique
  async getSettings() {
    return this.findOne('settings', { id: 1 });
  }

  async updateSettings(data: Record<string, any>) {
    const settings = await this.getSettings();
    if (settings) {
      return this.update('settings', 1, data);
    } else {
      return this.create('settings', { id: 1, ...data });
    }
  }

  async getProducts(filters: { category_id?: number; farm_id?: number; is_available?: boolean } = {}) {
    const where: Record<string, any> = {};
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.farm_id) where.farm_id = filters.farm_id;
    if (filters.is_available !== undefined) where.is_available = filters.is_available;
    
    return this.findMany('products', where, 'created_at DESC');
  }

  async getCategories() {
    return this.findMany('categories', {}, 'name ASC');
  }

  async getFarms() {
    return this.findMany('farms', {}, 'name ASC');
  }

  async getPages() {
    return this.findMany('pages', { is_active: true }, 'created_at DESC');
  }

  async getSocialLinks() {
    return this.findMany('social_links', { is_active: true }, 'sort_order ASC');
  }
}

// Instance globale
const d1Client = new CloudflareD1Client({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '7979421604bd07b3bd34d3ed96222512',
  databaseId: process.env.CLOUDFLARE_DATABASE_ID || '854d0539-5e04-4e2a-a4fd-b0cfa98c7598',
  apiToken: process.env.CLOUDFLARE_API_TOKEN || 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW',
});

export default d1Client;
export { CloudflareD1Client };
export type { CloudflareD1Config };