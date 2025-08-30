// Cloudflare R2 Storage Client
// Remplace Cloudinary pour l'upload d'images

interface CloudflareR2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

class CloudflareR2Client {
  private config: CloudflareR2Config;

  constructor(config: CloudflareR2Config) {
    this.config = config;
  }

  // Générer une URL signée pour l'upload
  async getSignedUploadUrl(key: string, contentType: string) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets/${this.config.bucketName}/objects/${key}`;
    
    // Pour simplifier, on utilise l'API REST de Cloudflare
    return {
      uploadUrl: url,
      publicUrl: `${this.config.publicUrl || `https://${this.config.bucketName}.r2.cloudflarestorage.com`}/${key}`
    };
  }

  // Upload direct via l'API Cloudflare
  async uploadFile(file: File | Buffer, key: string, contentType?: string): Promise<string> {
    try {
      const formData = new FormData();
      
      if (file instanceof File) {
        formData.append('file', file);
      } else {
        // Pour Buffer, créer un Blob
        const blob = new Blob([file], { type: contentType || 'image/jpeg' });
        formData.append('file', blob, key);
      }

      // Upload via API REST (nécessite configuration côté Cloudflare)
      const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets/${this.config.bucketName}/objects/${key}`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: file instanceof File ? file : file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Retourner l'URL publique
      const publicUrl = `${this.config.publicUrl || `https://${this.config.bucketName}.r2.cloudflarestorage.com`}/${key}`;
      return publicUrl;

    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw error;
    }
  }

  // Upload d'image avec redimensionnement (optionnel)
  async uploadImage(file: File | Buffer, folder: string = 'images'): Promise<string> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file instanceof File 
      ? file.name.split('.').pop() || 'jpg'
      : 'jpg';
    
    const key = `${folder}/${timestamp}-${randomId}.${extension}`;
    
    return this.uploadFile(file, key, file instanceof File ? file.type : 'image/jpeg');
  }

  // Supprimer un fichier
  async deleteFile(key: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets/${this.config.bucketName}/objects/${key}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('R2 Delete Error:', error);
      return false;
    }
  }

  // Lister les fichiers
  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets/${this.config.bucketName}/objects`);
      if (prefix) {
        url.searchParams.set('prefix', prefix);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result?.objects?.map((obj: any) => obj.key) || [];
    } catch (error) {
      console.error('R2 List Error:', error);
      return [];
    }
  }

  // Obtenir l'URL publique d'un fichier
  getPublicUrl(key: string): string {
    return `${this.config.publicUrl || `https://${this.config.bucketName}.r2.cloudflarestorage.com`}/${key}`;
  }
}

// Instance globale
const r2Client = new CloudflareR2Client({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '7979421604bd07b3bd34d3ed96222512',
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'boutique-images',
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
});

export default r2Client;
export { CloudflareR2Client };
export type { CloudflareR2Config };