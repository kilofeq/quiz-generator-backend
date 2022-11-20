import express from 'express'
import * as dotenv from 'dotenv'
import { font } from './Fonts/Lato';
import { jsPDF } from "jspdf";
const router = express.Router();
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

dotenv.config()

interface QuizBody {
  questions: {
    question: string,
    answer: string
  }[]
}

let pdf = new jsPDF({
  orientation: "portrait",
  format: "a4",
});

pdf.addFileToVFS("Lato.ttf", font);
pdf.addFont("Lato.ttf", "Lato", "normal");
pdf.setFont("Lato");

pdf.setLanguage('pl');

router.use('', async (req, res) => {
  let exportedDocument;
  let withAnswers = (req.query.withAnswers === "true");
  if(req.query.fileFormat === "pdf") {
    exportedDocument = exportPdf(req.body, withAnswers);

    resetPdf();

    return res.status(200)
      .set({ 'content-type': 'application/pdf' })
      .send(exportedDocument);
  }
  else if(req.query.fileFormat === "docx") {
    exportedDocument = await exportDocx(req.body, withAnswers);
    console.log(exportedDocument);

    return res.status(200)
      .set({ 'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'content-length': exportedDocument.length })
      .end(exportedDocument);
  } else {
    return res.sendStatus(400);
  }
})

async function exportDocx(body: QuizBody, withAnswers: boolean) {
  const docx = new Document({
    sections: [
      {
        properties: {},
        children: createContent(body, withAnswers),
      },
    ],
  });
  const result = await Packer.toBuffer(docx).then((string) => {
    return string;
  });

  function createContent(body: QuizBody, withAnswers: boolean): Paragraph[] {
    const result = [];
    for (let i = 0; i<body.questions?.length; i++){
      result.push(addQuestion(body.questions?.[i]?.question));
      if (withAnswers) {
        result.push(addAnswer(body.questions?.[i]?.answer));
      } else {
        result.push(addInput());
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
          text: "odp: " + content,
        }),
      ],
    });
  }
  function addInput() {
    return new Paragraph({
      children: [
        new TextRun({
          text: "odp: ..................................................................",
        }),
      ],
    });
  }
  return result;
}

function exportPdf(body: QuizBody, withAnswers: boolean) {
  let currentY = 15;
  for (let i = 0; i<body.questions?.length; i++){
    addQuestion(body.questions?.[i]?.question);
    if (withAnswers) {
      addAnswer(body.questions?.[i]?.answer);
    } else {
      addInput();
    }
    nextQuestion();
  }

  function nextLine() {
    currentY = currentY + 15;
  }

  function addInput() {
    pdf.text(`odp: ..................................................................`, 10, currentY);
    nextLine();
  }

  function addQuestion(content: string) {
    pdf.setFontSize(20);
    pdf.text(content, 10, currentY);
    pdf.setFontSize(15);
    nextLine();
  }

  function addAnswer(content: string) {
    pdf.text(`odp: ${content}`, 10, currentY);
    nextLine();
  }

  function nextQuestion() {
    if (currentY > pdf.internal.pageSize.height - 40) {
      pdf.addPage();
      currentY = 15;
    } else {
      currentY = currentY + 10;
    }
  }
  console.log(pdf.internal.pageSize.height);
  console.log(withAnswers);
  return pdf.output();
}

function resetPdf() {
  pdf = new jsPDF({
    orientation: "portrait",
    format: "a4",
  });

  pdf.addFileToVFS("Lato.ttf", font);
  pdf.addFont("Lato.ttf", "Lato", "normal");
  pdf.setFont("Lato");

  pdf.setLanguage('pl');
}

export default router
