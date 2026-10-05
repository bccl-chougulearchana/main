import { Component, OnInit } from '@angular/core';
import { GovernanceCodeService } from '../../services/governance-code/governance-code.service';
import { CommonService } from '../../core/services/common.service';
import { CommonModule } from '@angular/common';
import { UiDirectivesModule } from 'toi-libraries';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { ViewChild, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuizAnswer {
  questionId: number;
  answers: number[];
}
type PolicyCode = 'GP' | 'WBP' | 'PIT' | 'CBP' | 'COE' | 'BCE' | 'POSH';

@Component({
  selector: 'app-governance-code-quiz',
  standalone: true,
  imports: [CommonModule, UiDirectivesModule],
  templateUrl: './governance-code-quiz.component.html',
  styleUrls: ['./governance-code-quiz.component.scss']
})
export class GovernanceCodeQuizComponent implements OnInit {
  @ViewChild('certificateTemplate') certificateRef!: ElementRef;
  startPage = true;
  instructionPage = false;
  quizPage = false;
  scorePage = false;

  showConfirmModal = false;
  showVideoModal = false;

  submitTimeOut: boolean = false;
  submitDone: boolean = false;
  autoSubmitTime: any;
  quizStartTime: any;

  quizList: any[] = [];
  visitedPages = new Set<number>();
  currentPage = 1;

  min = 30;
  seconds = 0;
  timerRef: any;
  timeLeftInfo = false;

  answers = new Map<number, number[]>();

  empDetail: any;
  employeeDetailList: any=[];
  errorMsg = '';
  errorMsgBool = false;
  sucessEmptyList = false;

  scoreValue!: number;
  finalScore!: number;
  reappearDate!: string;
  submittedOn!: string;
  employeeName!: string;

  videoSrc = '';

  constructor(
    private dialog: CommonDialogService,
    private loader: LoaderService,
    private api: GovernanceCodeService,
    private common: CommonService,

  ) { }

  ngOnInit(): void {
    this.empDetail = this.common.getEmpDetails();
    this.checkScore();
    this.visitedPages.add(1);

  }

  checkScore(): void {
    this.loader.show();
    this.api.getCheckSCore().subscribe({
      next: (res: any) => {
        this.loader.hide();
        const r = res[0];
        if (r.status === 'error') {
          this.errorMsg = r.message;
          this.errorMsgBool = true;
          this.sucessEmptyList = false;
          return;
        }
        if (!r.data?.length) {
          this.sucessEmptyList = true;
          this.errorMsgBool = false;
          return;
        }
        this.scoreValue = r.data[0][3];
        this.finalScore = this.scoreValue;
        this.reappearDate = r.data[0][0];
        if(this.finalScore == 100)
        {
          this.submittedOn = res[0].data[0][2];
        }
        else
        {
          this.submittedOn = res[0].data[0][0];
        }
        this.employeeName = r.Name;
        this.sucessEmptyList = false;
        this.errorMsgBool = false;
      },
      error: (err) => {
        this.loader.hide();
        this.errorMsg = 'Unable to fetch score.';
        this.errorMsgBool = true;
      }
    })
  }


  openConfirmPolicy(): void {
    this.showConfirmModal = true;
  }

  confirmPolicy(): void {
    this.showConfirmModal = false;
    this.startPage = false;
    this.instructionPage = true;
  }
  goToPage(page: number): void {
    if (page < 1 || page > this.quizList.length) return;

    this.currentPage = page;
    this.visitedPages.add(page);
  }

  isChecked(qId: number, index: number): boolean {
    return this.answers.get(qId)?.includes(index + 1) ?? false;
  }

  toggleAnswer(qId: number, index: number, checked: boolean): void {
    const list = this.answers.get(qId) ?? [];
    const val = index + 1;

    if (checked && !list.includes(val)) list.push(val);
    if (!checked) list.splice(list.indexOf(val), 1);

    list.length ? this.answers.set(qId, list) : this.answers.delete(qId);
  }


  startQuiz(): void {
    this.min = 30;
    this.seconds = 0;

    clearInterval(this.timerRef);

    this.submitDone = false;
    this.submitTimeOut = false;
    this.timeLeftInfo = false;
    this.answers.clear();

    const startTime = new Date();
    this.quizStartTime = startTime.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).toUpperCase();

    localStorage.removeItem('quizData');

    this.startPage = false;
    this.instructionPage = false;
    this.quizPage = true;
    this.currentPage = 1;

    this.api.getQuizListData().subscribe(res => {

      const r = res[0];

      if (r.status === 'success' && r.data?.length > 0) {
        this.quizList = r.data;
        this.startTimer();
      }
      else {
        this.errorMsg = r.message;
        this.errorMsgBool = true;

        this.quizPage = false;
        this.startPage = false;
        this.instructionPage = false;
      }

    }, () => {
      this.errorMsg = 'Unable to load quiz. Please try again.';
      this.errorMsgBool = true;
      this.quizPage = false;
    });

  }


  startTimer(): void {
    this.timerRef = setInterval(() => {
      if (this.seconds === 0) {
        if (this.min === 0) {

          clearInterval(this.timerRef);

          if (!this.submitDone) {

            const autoTime = new Date();
            this.autoSubmitTime = autoTime.toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }).toUpperCase();

            this.submitTimeOut = true;

            this.submitQuiz(true);
          }

          return;
        }

        this.min--;
        this.seconds = 59;

      } else {
        this.seconds--;
      }

      if (this.min === 0 && this.seconds <= 30) {
        this.timeLeftInfo = true;
      }

    }, 1000);
  }

  back(): void {
    this.startPage = true;
    this.quizPage = false;
    this.errorMsgBool = false;
  }

  submitQuiz(auto: boolean): void {

    if (this.submitDone) {
      return;
    }

    if (!this.quizList || this.quizList.length === 0) {
      this.dialog.alert('Quiz data not available.');
      return;
    }

    const now = new Date();
    const manualSubmitTime = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).toUpperCase();

    const finalSubmitTime = auto
      ? (this.autoSubmitTime || manualSubmitTime)
      : manualSubmitTime;

    const answeredCount = this.answers.size;

    const unanswered = this.quizList
      .map((q, i) => ({ qId: q[0], index: i }))
      .filter(q => !this.answers.has(q.qId))
      .map(q => q.index + 1);

    if (answeredCount === 0 && !auto) {
      this.dialog.alert('Kindly answer all the question(s).');
      return;
    }

    if (unanswered.length > 0 && !auto) {
      this.dialog.alert(`Please answer question no(s) ${unanswered.join(', ')}`);
      return;
    }

    if (this.timerRef) {
      clearInterval(this.timerRef);
    }

    this.submitDone = true;
    this.submitTimeOut = auto; // optional if you still use it

    const payload: string[] = [];

    this.answers.forEach((answerList, questionID) => {
      let formatted = questionID.toString();
      answerList.forEach(ans => {
        formatted += `#${ans}`;
      });
      payload.push(formatted);
    });

    this.api.submitScoreData(payload, this.quizStartTime, finalSubmitTime)
      .subscribe({
        next: (res: any) => {

          const data = res?.[0]?.data;

          this.finalScore = data?.finalScore;
          this.employeeName = data?.Name;
          this.submittedOn = data?.submittedOn;
          this.reappearDate = data?.reAppearDate;

          this.quizPage = false;
          this.scorePage = true;
        },
        error: () => {
          this.submitDone = false;
          this.dialog.alert('Something went wrong while submitting.');
        }
      });
  }


  openPolicy(code: PolicyCode): void {
    this.common.getConfigData().subscribe(cfg => {
      const policyMap: Record<PolicyCode, string> = {
        GP: cfg.GiftPolicy,
        WBP: cfg.WhistleBlowerPolicy,
        PIT: cfg.ENILCodePIT,
        CBP: cfg.COEBP,
        COE: cfg.COE,
        BCE: cfg.BCOE,
        POSH: cfg.POSHPolicy
      };

      window.open(policyMap[code], '_blank');
    });
  }


  openGCodeVideoIframe(): void {
    this.common.getConfigData().subscribe(res => {
      this.videoSrc = res.GuidetoGovernanceQuiz;
      this.showVideoModal = true;
    });
  }

  closeVideo(): void {
    this.showVideoModal = false;
    this.videoSrc = '';
  }

  downloadPdf(): void {

  if (!this.certificateRef) {
    this.dialog.alert('Certificate template not available.');
    return;
  }

  const element = this.certificateRef.nativeElement.querySelector('#iframe');

  html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    pdf.save('Governance Code - Quiz Certificate.pdf');

  }).catch(() => {
    this.dialog.alert('Certificate Failed To Download');
  });
}

}
