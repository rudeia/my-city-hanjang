import {jsPDF} from 'jspdf';

/** Preserve the complete brand board on one page without cropping its layout. */
export function canvasPDF(canvas:HTMLCanvasElement):Blob {
  const scale=Math.min(595.28/canvas.width,14400/canvas.height);
  const width=canvas.width*scale,height=canvas.height*scale;
  const pdf=new jsPDF({unit:'pt',format:[width,height],orientation:width>height?'landscape':'portrait',compress:true});
  pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,width,height);
  return pdf.output('blob');
}

import type {BoardDocument} from './svg-text';

/** Render each already-paginated report sheet independently to avoid canvas size limits. */
export async function reportPDF(pages:BoardDocument[]):Promise<Blob>{
  const pdf=new jsPDF({unit:'pt',format:'a4',orientation:'portrait',compress:true});
  await document.fonts.ready;
  for(let i=0;i<pages.length;i++){
    const page=pages[i],url=URL.createObjectURL(new Blob([page.svg],{type:'image/svg+xml;charset=utf-8'}));
    try{
      const image=new Image();
      await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('보고서 PDF 페이지를 그리지 못했습니다.'));image.src=url;});
      const canvas=document.createElement('canvas');canvas.width=page.width;canvas.height=Math.ceil(page.height);
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('PDF 저장을 시작하지 못했습니다.');
      ctx.fillStyle='#fffefd';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,page.width,page.height);
      if(i)pdf.addPage('a4','portrait');
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,pdf.internal.pageSize.getWidth(),pdf.internal.pageSize.getHeight());
      canvas.width=0;canvas.height=0;
    }finally{URL.revokeObjectURL(url);}
  }
  return pdf.output('blob');
}
