'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
  transactionCode: string;
  date: string;
  time: string;
  cashier: string;
  customerName: string;
  items: ReceiptItem[];
  total: number;
  storeName: string;
  storeAddress: string;
  storePhone: string;
}

interface ReceiptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

export default function ReceiptPopup({ isOpen, onClose, receiptData }: ReceiptPopupProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receiptData?.transactionCode}</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .center { text-align: center; }
                .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
                .total { font-weight: bold; font-size: 14px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  if (!receiptData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Receipt
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="receipt font-mono text-sm">
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg">{receiptData.storeName}</h2>
            <p className="text-xs whitespace-pre-line">{receiptData.storeAddress}</p>
            <p className="text-xs">{receiptData.storePhone}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
            <div className="flex justify-between text-xs">
              <span>No: {receiptData.transactionCode}</span>
              <span>{receiptData.date} {receiptData.time}</span>
            </div>
            <div className="text-xs">Kasir: {receiptData.cashier}</div>
            <div className="text-xs">Pembeli: {receiptData.customerName}</div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
            {receiptData.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="flex justify-between">
                  <span className="flex-1">{item.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                  <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>Rp {receiptData.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="text-center mt-4 text-xs">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
