
import React, { useRef, useState } from 'react';
import { Order, ViewMode } from '../../types';
import { Button } from './ui/Button';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import { Section } from './ui/Section';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReceiptPageProps {
  order: Order | null;
  viewMode: ViewMode;
  onBack: () => void;
}

export const ReceiptPage: React.FC<ReceiptPageProps> = ({ order, viewMode, onBack }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  if (!order) return null;

  const isRetro = viewMode === 'retro';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Small delay to ensure any render updates are finished
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher resolution
        useCORS: true, // Attempt to load external images
        logging: false,
        backgroundColor: isRetro ? '#fdfbf7' : '#ffffff',
        // Fix for jagged edges in some browsers
        ignoreElements: (element) => element.classList.contains('no-print'),
        // Ensure full height is captured even if scrolled
        scrollY: -window.scrollY
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content overflows
      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`SpiralGroove_Receipt_${order.id.replace('#', '')}.pdf`);
    } catch (error) {
      alert('Could not generate PDF. Please try the Print -> Save as PDF option.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className={`animate-in fade-in duration-500 pt-8 min-h-screen ${
        isRetro ? 'bg-transparent' : 'bg-gray-100/50'
      }`}
    >
      <Section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Controls Header - Hidden when printing */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
            <button 
              onClick={onBack}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors
                 ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
              `}
            >
              <ArrowLeft size={14} strokeWidth={3} /> Back to Orders
            </button>
            
            <div className="flex gap-3">
               <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer size={16} className="mr-2" /> Print
               </Button>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
               >
                  {isGeneratingPdf ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Download size={16} className="mr-2" />
                  )}
                  {isGeneratingPdf ? 'Generating...' : 'PDF'}
               </Button>
            </div>
          </div>

          {/* Receipt Container */}
          <div className="flex justify-center pb-20">
            {/* ID used for print CSS targeting */}
            <div 
              id="printable-receipt"
              ref={receiptRef}
              className={`relative w-full max-w-md p-8 md:p-10 font-mono text-sm leading-relaxed
                ${isRetro 
                  ? 'bg-[#fdfbf7] shadow-retro border-2 border-brand-black text-brand-black' 
                  : 'bg-white shadow-xl rounded-sm text-gray-800'}
            `}>
              
              {/* Paper Texture Effect for Retro */}
              {isRetro && (
                 <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-dust.png")' }}></div>
              )}
              
              {/* Jagged Edge Top (CSS Illusion) */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/5 to-transparent opacity-10"></div>

              {/* Receipt Header */}
              <div className="text-center mb-8 pb-8 border-b-2 border-dashed border-current relative z-10">
                 <div className="mb-4">
                    <h1 className="font-display text-3xl uppercase tracking-tighter">Spiral Groove</h1>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Records</span>
                 </div>
                 <div className="space-y-1 text-xs uppercase tracking-wide opacity-80">
                    <p>215B Main Street</p>
                    <p>Milford, OH 45150</p>
                    <p>(513) 600-8018</p>
                    <p>www.spiralgroove.com</p>
                 </div>
              </div>

              {/* Order Meta */}
              <div className="flex justify-between mb-6 text-xs uppercase relative z-10">
                 <div className="space-y-1">
                    <p><span className="opacity-60">Order #:</span> {order.id.replace('#', '')}</p>
                    <p><span className="opacity-60">Date:</span> {order.date}</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p><span className="opacity-60">Time:</span> 14:32 PM</p>
                    <p><span className="opacity-60">Type:</span> Pickup</p>
                 </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4 mb-8 border-b-2 border-dashed border-current pb-8 relative z-10">
                 {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                       <div className="flex-1">
                          <p className="font-bold uppercase">{item.title}</p>
                          <p className="text-xs opacity-70 uppercase">{item.artist} ({item.format})</p>
                       </div>
                       <div className="font-bold">
                          ${item.price.toFixed(2)}
                       </div>
                    </div>
                 ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-8 relative z-10">
                 <div className="flex justify-between">
                    <span className="uppercase opacity-70">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="uppercase opacity-70">Tax (7%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold border-t-2 border-current pt-2 mt-2">
                    <span className="uppercase">Total</span>
                    <span>${order.total.toFixed(2)}</span>
                 </div>
              </div>

              {/* Payment Info */}
              <div className="mb-8 text-xs uppercase relative z-10">
                 <p className="mb-1"><span className="opacity-60">Payment Method:</span> VISA **** 4242</p>
                 <p><span className="opacity-60">Auth Code:</span> 094812</p>
              </div>

              {/* Footer / Barcode */}
              <div className="text-center space-y-6 relative z-10">
                 <div className="space-y-2">
                    <p className="font-bold uppercase text-sm">Thank You for Digging!</p>
                    <p className="text-xs opacity-70">Return Policy: Vintage Vinyl 48 hours. New Vinyl 30 days (sealed exchange; opened 50% value). Equipment sealed in box: $15 restocking fee. $5 restocking fee on all new returns.</p>
                 </div>
                 
                 {/* Fake Barcode */}
                 <div className="pt-4">
                    <div className="h-12 w-3/4 mx-auto bg-current" style={{ clipPath: 'polygon(0% 0%, 2% 0%, 2% 100%, 4% 100%, 4% 0%, 5% 0%, 5% 100%, 7% 100%, 7% 0%, 10% 0%, 10% 100%, 11% 100%, 11% 0%, 15% 0%, 15% 100%, 18% 100%, 18% 0%, 22% 0%, 22% 100%, 24% 100%, 24% 0%, 28% 0%, 28% 100%, 29% 100%, 29% 0%, 33% 0%, 33% 100%, 35% 100%, 35% 0%, 38% 0%, 38% 100%, 42% 100%, 42% 0%, 45% 0%, 45% 100%, 47% 100%, 47% 0%, 50% 0%, 50% 100%, 53% 100%, 53% 0%, 55% 0%, 55% 100%, 58% 100%, 58% 0%, 62% 0%, 62% 100%, 64% 100%, 64% 0%, 68% 0%, 68% 100%, 70% 100%, 70% 0%, 72% 0%, 72% 100%, 75% 100%, 75% 0%, 79% 0%, 79% 100%, 82% 100%, 82% 0%, 85% 0%, 85% 100%, 88% 100%, 88% 0%, 92% 0%, 92% 100%, 94% 100%, 94% 0%, 97% 0%, 97% 100%, 100% 100%, 100% 0%)'}}></div>
                    <p className="text-[10px] tracking-[0.5em] mt-1 opacity-70">{order.id.replace('#', '')}</p>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </Section>
    </div>
  );
};
