import {jsPDF} from 'jspdf';

/** Preserve the complete board/report on one page without cropping its layout. */
export function canvasPDF(canvas:HTMLCanvasElement):Blob {
  const scale=Math.min(595.28/canvas.width,14400/canvas.height);
  const width=canvas.width*scale,height=canvas.height*scale;
  const pdf=new jsPDF({unit:'pt',format:[width,height],orientation:width>height?'landscape':'portrait',compress:true});
  pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,width,height);
  return pdf.output('blob');
}
