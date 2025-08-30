import { NextResponse } from 'next/server';
import d1Client from '../../../lib/cloudflare-d1';

export async function GET() {
  try {
    console.log('🔍 Debug complet du système...');
    
    // Test de toutes les tables
    const [products, categories, farms, socialLinks, settings, pages] = await Promise.allSettled([
      d1Client.getProducts(),
      d1Client.getCategories(), 
      d1Client.getFarms(),
      d1Client.getSocialLinks(),
      d1Client.getSettings(),
      d1Client.getPages()
    ]);

    return NextResponse.json({
      success: true,
      debug: {
        timestamp: new Date().toISOString(),
        environment: {
          hasCloudflareAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
          hasCloudflareToken: !!process.env.CLOUDFLARE_API_TOKEN,
          hasDatabaseId: !!process.env.CLOUDFLARE_DATABASE_ID,
          hasR2Keys: !!(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
          hasAdminPassword: !!process.env.ADMIN_PASSWORD
        },
        database: {
          products: {
            status: products.status,
            count: products.status === 'fulfilled' ? products.value?.length || 0 : 0,
            error: products.status === 'rejected' ? products.reason?.message : null
          },
          categories: {
            status: categories.status,
            count: categories.status === 'fulfilled' ? categories.value?.length || 0 : 0,
            data: categories.status === 'fulfilled' ? categories.value : null,
            error: categories.status === 'rejected' ? categories.reason?.message : null
          },
          farms: {
            status: farms.status,
            count: farms.status === 'fulfilled' ? farms.value?.length || 0 : 0,
            data: farms.status === 'fulfilled' ? farms.value : null,
            error: farms.status === 'rejected' ? farms.reason?.message : null
          },
          socialLinks: {
            status: socialLinks.status,
            count: socialLinks.status === 'fulfilled' ? socialLinks.value?.length || 0 : 0,
            data: socialLinks.status === 'fulfilled' ? socialLinks.value : null,
            error: socialLinks.status === 'rejected' ? socialLinks.reason?.message : null
          },
          settings: {
            status: settings.status,
            data: settings.status === 'fulfilled' ? settings.value : null,
            error: settings.status === 'rejected' ? settings.reason?.message : null
          },
          pages: {
            status: pages.status,
            count: pages.status === 'fulfilled' ? pages.value?.length || 0 : 0,
            data: pages.status === 'fulfilled' ? pages.value : null,
            error: pages.status === 'rejected' ? pages.reason?.message : null
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}