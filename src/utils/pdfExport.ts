import jsPDF from 'jspdf';
import { EligibilityResult, VisaApplicationData } from '../types';

export const exportResultToPDF = (
  formData: VisaApplicationData,
  result: EligibilityResult
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UK Visa Eligibility Assessment', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, yPos, { align: 'center' });
  
  // Personal Info Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Applicant Information', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${formData.personalInfo.givenName} ${formData.personalInfo.familyName}`, 15, yPos);
  
  yPos += 6;
  doc.text(`Nationality: ${formData.personalInfo.nationality}`, 15, yPos);
  
  yPos += 6;
  doc.text(`Purpose of Visit: ${formData.travelDetails.purpose}`, 15, yPos);
  
  yPos += 6;
  doc.text(`Duration: ${formData.travelDetails.durationDays} days`, 15, yPos);

  // Assessment Result
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Result', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(12);
  
  // Risk Level with color
  const riskColor = result.riskLevel === 'Low' ? [34, 197, 94] : 
                    result.riskLevel === 'Medium' ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`Risk Level: ${result.riskLevel}`, 15, yPos);
  
  yPos += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Score: ${result.score}/100`, 15, yPos);

  // Summary
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(result.summary, pageWidth - 30);
  doc.text(summaryLines, 15, yPos);
  yPos += summaryLines.length * 6;

  // Strengths
  if (result.strengths.length > 0) {
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Strengths', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    result.strengths.forEach((strength, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${strength}`, pageWidth - 30);
      doc.text(lines, 15, yPos);
      yPos += lines.length * 6;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Weaknesses
  if (result.weaknesses.length > 0) {
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Areas of Concern', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    result.weaknesses.forEach((weakness, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const lines = doc.splitTextToSize(`${index + 1}. ${weakness}`, pageWidth - 30);
      doc.text(lines, 15, yPos);
      yPos += lines.length * 6;
    });
  }

  // Recommendations
  if (result.recommendations.length > 0) {
    yPos += 10;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('Recommendations', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    result.recommendations.forEach((rec, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 30);
      doc.text(lines, 15, yPos);
      yPos += lines.length * 6;
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'This is a simulation tool and does not guarantee visa approval. Please consult official UK Home Office guidance.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const fileName = `UK_Visa_Assessment_${formData.personalInfo.familyName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
