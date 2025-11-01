
'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type ArchiveQRCodeProps = {
  url: string;
};

export default function ArchiveQRCode({ url }: ArchiveQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'veritas-vault-archive.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Archive</CardTitle>
        <CardDescription>
          Scan this QR code on any device to instantly access this archived page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div 
          ref={qrRef} 
          className="p-4 bg-white rounded-lg" // Add padding and a background
        >
          <QRCodeCanvas
            value={url}
            size={180}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardFooter>
    </Card>
  );
}
