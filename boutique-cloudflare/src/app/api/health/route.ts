import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'FULL OPTION IDF API is running',
    timestamp: new Date().toISOString()
  })
}