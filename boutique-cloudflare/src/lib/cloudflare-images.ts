// Remplace cloudinary.ts pour utiliser Cloudflare Images et R2

interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
}

class CloudflareImages {
  private accountId: string;
  private apiToken: string;
  private r2Url?: string;

  constructor() {
    this.accountId = process.env.CF_ACCOUNT_ID || '';
    this.apiToken = process.env.CF_IMAGES_TOKEN || '';
    this.r2Url = process.env.R2_PUBLIC_URL || '';
  }

  // Upload vers Cloudflare Images
  async uploadToCloudflareImages(file: File | Blob): Promise<string> {
    if (!this.accountId || !this.apiToken) {
      throw new Error('Cloudflare Images credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || 'Upload failed');
      }

      // Retourner l'URL de l'image
      return data.result.variants[0]; // URL publique de l'image
    } catch (error) {
      console.error('Cloudflare Images upload error:', error);
      throw error;
    }
  }

  // Upload vers R2 (alternative gratuite)
  async uploadToR2(file: File | Blob, fileName: string): Promise<string> {
    // Cette fonction doit être appelée depuis un Worker Cloudflare
    // qui a accès au binding R2
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    
    // L'upload vers R2 se fait via le Worker API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', uniqueFileName);

    try {
      const response = await fetch('/api/upload-r2', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload to R2 failed');
      }

      return data.url;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw error;
    }
  }

  // Fonction principale d'upload (choisit automatiquement entre Images et R2)
  async upload(file: File | Blob, options?: UploadOptions): Promise<{ secure_url: string }> {
    try {
      let url: string;

      // Essayer d'abord Cloudflare Images si configuré
      if (this.accountId && this.apiToken) {
        url = await this.uploadToCloudflareImages(file);
      } else {
        // Sinon utiliser R2
        const fileName = options?.public_id || 'image';
        url = await this.uploadToR2(file, fileName);
      }

      return { secure_url: url };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Supprimer une image de Cloudflare Images
  async destroy(publicId: string): Promise<boolean> {
    if (!this.accountId || !this.apiToken) {
      console.warn('Cloudflare Images credentials not configured');
      return false;
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${publicId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  // Générer une URL transformée (pour Cloudflare Images)
  getTransformedUrl(imageId: string, options: { width?: number; height?: number; quality?: number }): string {
    if (!this.accountId) {
      return imageId; // Retourner l'URL originale si pas configuré
    }

    const variant = [];
    if (options.width) variant.push(`w=${options.width}`);
    if (options.height) variant.push(`h=${options.height}`);
    if (options.quality) variant.push(`q=${options.quality}`);

    const variantString = variant.length > 0 ? `/${variant.join(',')}` : '';
    
    return `https://imagedelivery.net/${this.accountId}/${imageId}${variantString}`;
  }
}

// Export singleton
const cloudflareImages = new CloudflareImages();

export default cloudflareImages;
export { CloudflareImages };