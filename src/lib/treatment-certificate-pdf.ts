import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
export interface TreatmentCertificateSnapshot {
 patientName:string; diagnosis:string; treatmentStart:string; treatmentEnd:string;
 completedSessions:number; treatmentSummary:string; totalCharges:number; amountPaid:number;
 balance:number; issuedAt:string; documentNumber:string; verificationToken:string;
}
export function treatmentVerificationUrl(token:string) {
 if(!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid verification token.");
 const origin=typeof window!=="undefined"?window.location.origin:"https://painfixphysiotherapy.com";return origin+"/verify-certificate?type=treatment&reference="+encodeURIComponent(token);
}
export async function createTreatmentCertificatePdf(s:TreatmentCertificateSnapshot,assets:{font:Uint8Array;logo?:Uint8Array}) {
 const pdf=await PDFDocument.create(); pdf.registerFontkit(fontkit);
 const font=await pdf.embedFont(assets.font,{subset:true}); const page=pdf.addPage([595.28,841.89]);
 const navy=rgb(3/255,46/255,97/255),green=rgb(0,168/255,89/255),muted=rgb(.34,.39,.45);
 const left=48,right=547;
 const draw=(v:string,x:number,y:number,size=10,color=navy)=>page.drawText(v.replace(/[\r\n\t]/g," "),{x,y,size,font,color,maxWidth:right-x});
 const date=(v:string)=>new Date(v+"T00:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
 const wrap=(v:string,max:number,size:number)=>{const out:string[]=[];let line="";for(const word of v.replace(/[\r\n\t]/g," ").trim().split(/\s+/)){const n=line?line+" "+word:word;if(font.widthOfTextAtSize(n,size)>max&&line){out.push(line);line=word;}else line=n;}if(line)out.push(line);return out;};
 page.drawRectangle({x:25,y:25,width:545,height:791,borderColor:navy,borderWidth:1.2});
 page.drawRectangle({x:25,y:807,width:545,height:9,color:green});
 if(assets.logo){const logo=await pdf.embedPng(assets.logo),d=logo.scaleToFit(56,56);page.drawImage(logo,{x:left,y:746,width:d.width,height:d.height});}
 draw("PAINFIX PHYSIOTHERAPY CLINIC",115,780,16);draw("Move Better. Recover Faster. Live Pain-Free.",115,761,8,muted);
 page.drawLine({start:{x:left,y:735},end:{x:right,y:735},thickness:1,color:green});
 draw("PHYSIOTHERAPY TREATMENT & PAYMENT CERTIFICATE",left,700,14);
 draw("Issued from the PainFix patient treatment and financial ledger",left,680,8,muted);
 const field=(label:string,value:string,y:number)=>{draw(label.toUpperCase(),left,y,7,muted);const lines=wrap(value||"Not recorded",right-left,10);lines.slice(0,3).forEach((line,i)=>draw(line,left,y-17-i*13,10));return y-25-Math.max(0,Math.min(lines.length,3)-1)*13;};
 let y=642;y=field("Patient",s.patientName,y);y=field("Diagnosis / presenting condition",s.diagnosis,y-5);
 y=field("Treatment period",date(s.treatmentStart)+" to "+date(s.treatmentEnd),y-5);
 y=field("Completed physiotherapy sessions",String(s.completedSessions),y-5);
 y=field("Treatment / services provided",s.treatmentSummary,y-5);
 const ty=Math.max(y-18,250);page.drawRectangle({x:left,y:ty-6,width:right-left,height:22,color:navy});draw("FINANCIAL SUMMARY — LEDGER TOTALS AT ISSUE DATE",left+10,ty+1,7,rgb(1,1,1));
 [["Total treatment charges",s.totalCharges],["Amount actually received",s.amountPaid],["Outstanding balance / (credit)",s.balance]].forEach(([label,amount],i)=>{const ry=ty-28-i*25;draw(String(label),left+8,ry,9,muted);draw("PKR "+Number(amount).toLocaleString("en-PK",{maximumFractionDigits:2}),365,ry,9,navy);page.drawLine({start:{x:left,y:ry-8},end:{x:right,y:ry-8},thickness:.35,color:rgb(.82,.85,.88)});});
 page.drawLine({start:{x:left,y:177},end:{x:right,y:177},thickness:.8,color:green});
 draw("Document number: "+s.documentNumber,left,160,8);draw("Issue date: "+new Date(s.issuedAt).toLocaleDateString("en-GB"),left,145,8,muted);
 draw("Issued by: Dr. Zain Ul Abideen, DPT | Clinical Physiotherapist",left,130,8,muted);
 draw("This certificate records treatment and payments documented by PainFix. It does not guarantee",left,83,7,muted);
 draw("insurance coverage or reimbursement. The receiving organization makes its own determination.",left,72,7,muted);
 const qr=await QRCode.toDataURL(treatmentVerificationUrl(s.verificationToken),{errorCorrectionLevel:"M",margin:2,width:360});
 const image=await pdf.embedPng(qr);page.drawImage(image,{x:445,y:38,width:75,height:75});draw("Scan to verify",449,28,7);
 pdf.setTitle(s.documentNumber+" | Physiotherapy Treatment & Payment Certificate");pdf.setAuthor("PainFix Physiotherapy Clinic");return pdf.save();
}
export async function downloadTreatmentCertificatePdf(s:TreatmentCertificateSnapshot) {
 const [f,l]=await Promise.all([fetch("/fonts/painfix-certificate-sans.ttf"),fetch("/painfix-logo.png")]);
 if(!f.ok)throw new Error("Certificate font could not be loaded.");
 const bytes=await createTreatmentCertificatePdf(s,{font:new Uint8Array(await f.arrayBuffer()),...(l.ok?{logo:new Uint8Array(await l.arrayBuffer())}:{})});
 const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:"application/pdf"}));const a=document.createElement("a");a.href=url;a.download=s.documentNumber+".pdf";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),60000);
}
