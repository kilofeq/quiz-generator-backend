import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { font } from './Fonts/Lato';
import { jsPDF } from "jspdf";
const router = express.Router();
import { BorderStyle, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

dotenv.config()

interface QuizBody {
  questions: {
    question: string,
    answers: string[]
  }[]
}

const pdf = new jsPDF({
  orientation: "portrait",
  format: "a4",
});

pdf.addFileToVFS("Lato.ttf", font);
pdf.addFont("Lato.ttf", "Lato", "normal");
pdf.setFont("Lato");

pdf.setLanguage('pl');

router.use('', async (req, res) => {
  let exportedDocument;
  if(req.query.fileFormat === "pdf") {
    exportedDocument = exportPdf(req.body);

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=dupa.pdf; charset=utf-8');
    // res.setHeader('Content-Length', exportedDocument.byteLength)

    return res.status(200)
      .set({ 'content-type': 'application/pdf' })
      .send(exportedDocument);
  }
  else if(req.query.fileFormat === "docx") {
    exportedDocument = await exportDocx(req.body);
    console.log(exportedDocument);

    return res.status(200)
      .set({ 'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'content-length': exportedDocument.length })
      .end(exportedDocument);
  }

})

async function exportDocx(body: QuizBody) {
  const docx = new Document({
    sections: [
      {
        properties: {},
        children: createContent(body),
      },
    ],
  });
  const result = await Packer.toBuffer(docx).then((string) => {
    return string;
  });

  function createContent(body: QuizBody): Paragraph[] {
    const result = [];
    for (let i = 0; i<body.questions?.length; i++){
      result.push(addQuestion(body.questions?.[i]?.question));
      for(let j = 0; j<body.questions?.[i]?.answers?.length; j++) {
        result.push(addAnswer(body.questions?.[i]?.answers[j]));
      }
      result.push(addBreak());
    }
    return result;
  }

  function addBreak(): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          break: 1,
        }),
      ],
    });
  }

  function addQuestion(content: string): Paragraph {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: {
        after: 200,
      },
      children: [
        new TextRun({
          text: content,
        }),
      ],
    });
  }
  function addAnswer(content: string) {
    return new Paragraph({
      children: [
        new TextRun({
          text: "▢ " + content,
        }),
      ],
    });
  }
  return result;
}

function exportPdf(body: QuizBody) {
  let currentY = 15;
  for (let i = 0; i<body.questions?.length; i++){
    addQuestion(body.questions?.[i]?.question);
    for(let j = 0; j<body.questions?.[i]?.answers?.length; j++) {
      addAnswer(body.questions?.[i]?.answers[j]);
    }
    nextQuestion();
  }

  function nextLine() {
    currentY = currentY + 10;
  }

  function addQuestion(content: string) {
    pdf.setFontSize(25);
    pdf.text(content, 10, currentY);
    pdf.setFontSize(15);
    nextLine();
  }

  function addAnswer(content: string) {
    pdf.text(`- ${content}`, 10, currentY);
    nextLine();
  }

  function nextQuestion() {
    if (currentY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      currentY = 15;
    } else {
      currentY = currentY + 15;
    }
  }
  console.log(pdf.internal.pageSize.height);
  return pdf.output();
}


export default router
