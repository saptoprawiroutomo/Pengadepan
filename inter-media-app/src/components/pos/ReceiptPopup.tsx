'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    if (!receiptData) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptData.transactionCode}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 11px; 
                line-height: 1.2;
                width: 58mm;
                margin: 0 auto;
                padding: 5mm;
              }
              .receipt { width: 100%; }
              .center { text-align: center; }
              .left { text-align: left; }
              .right { text-align: right; }
              .bold { font-weight: bold; }
              .line { 
                border-bottom: 1px dashed #000; 
                margin: 3px 0; 
                height: 1px;
              }
              .row { 
                display: flex; 
                justify-content: space-between; 
                margin: 1px 0;
              }
              .item-name { 
                width: 100%; 
                margin-bottom: 1px;
              }
              .item-detail { 
                display: flex; 
                justify-content: space-between;
                font-size: 10px;
              }
              .total-row { 
                font-weight: bold; 
                font-size: 12px;
                margin-top: 3px;
              }
              .footer { 
                margin-top: 5px; 
                font-size: 9px;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 2mm;
                  width: 58mm;
                }
                @page { 
                  size: 58mm auto; 
                  margin: 0; 
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="center bold" style="font-size: 12px; margin-bottom: 2px;">
                ${receiptData.storeName}
              </div>
              <div class="center" style="font-size: 9px; margin-bottom: 1px;">
                ${receiptData.storeAddress.replace(/\n/g, '<br>')}
              </div>
              <div class="center" style="font-size: 9px; margin-bottom: 3px;">
                ${receiptData.storePhone}
              </div>
              
              <div class="line"></div>
              
              <div class="row" style="font-size: 9px;">
                <span>No: ${receiptData.transactionCode}</span>
                <span>${receiptData.date}</span>
              </div>
              <div class="row" style="font-size: 9px;">
                <span>Kasir: ${receiptData.cashier}</span>
                <span>${receiptData.time}</span>
              </div>
              <div style="font-size: 9px; margin-bottom: 3px;">
                Pembeli: ${receiptData.customerName}
              </div>
              
              <div class="line"></div>
              
              ${receiptData.items.map(item => `
                <div class="item-name">${item.name}</div>
                <div class="item-detail">
                  <span>${item.qty} x Rp ${item.price.toLocaleString('id-ID')}</span>
                  <span>Rp ${item.subtotal.toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
              
              <div class="line"></div>
              
              <div class="row total-row">
                <span>TOTAL:</span>
                <span>Rp ${receiptData.total.toLocaleString('id-ID')}</span>
              </div>
              
              <div class="line"></div>
              
              <div class="center footer">
                <div style="margin: 2px 0;">Terima kasih atas kunjungan Anda!</div>
                <div style="margin: 2px 0;">Barang yang sudah dibeli</div>
                <div style="margin: 2px 0;">tidak dapat dikembalikan</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (!receiptData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Receipt
          </DialogTitle>
          <DialogDescription>
            Struk pembayaran untuk transaksi #{receiptData.transactionCode}
          </DialogDescription>
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
