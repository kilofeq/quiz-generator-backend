import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { font } from './Fonts/Lato';
import { jsPDF } from "jspdf";
const router = express.Router()
dotenv.config()

interface QuizBody {
  questions: {
    question: string,
    answers: string[]
  }[]
}


const doc = new jsPDF({
  orientation: "portrait",
  format: "a4",
})

doc.addFileToVFS("Lato.ttf", font);
doc.addFont("Lato.ttf", "Lato", "normal");
doc.setFont("Lato");

doc.setLanguage('pl');

router.use('', async (req, res) => {
  let exportedDocument;
  if(req.query.fileFormat === "pdf") {
    exportedDocument = exportPdf(req.body);

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=dupa.pdf; charset=utf-8');
    // res.setHeader('Content-Length', exportedDocument.byteLength)
    res.type('arraybuffer');

    return res.status(200)
      .set({ 'content-type': 'application/pdf; charset=font' })
      .send(exportedDocument);
  }
  else if(req.query.fileFormat === "docx") {
    
  }

})

function exportDoc(body: QuizBody) {

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
    doc.setFontSize(25);
    doc.text(content, 10, currentY);
    doc.setFontSize(15);
    nextLine();
  }

  function addAnswer(content: string) {
    doc.text(`- ${content}`, 10, currentY);
    nextLine();
  }

  function nextQuestion() {
    if (currentY > doc.internal.pageSize.height - 50) {
      doc.addPage();
      currentY = 15;
    } else {
      currentY = currentY + 15;
    }
  }
  console.log(doc.internal.pageSize.height);
  return doc.output();
}


export default router
