'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';

interface QrCodeDisplayProps {
  url: string;
}

export default function QrCodeDisplay({ url }: QrCodeDisplayProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    url
  )}&bgcolor=212121&color=FFFFFF&qzone=1`;

  return (
    <Card className="w-full max-w-md mx-auto animate-in fade-in duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Link Your Mobile Device</CardTitle>
        <CardDescription>
          Scan this QR code with your phone's camera to begin the session.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        {url ? (
          <img
            src={qrCodeUrl}
            alt="QR Code"
            width={250}
            height={250}
            className="rounded-lg shadow-lg border-4 border-accent"
            data-ai-hint="qr code"
          />
        ) : (
          <Skeleton className="h-[250px] w-[250px] rounded-lg" />
        )}
      </CardContent>
    </Card>
  );
}
