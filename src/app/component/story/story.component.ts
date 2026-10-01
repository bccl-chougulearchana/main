import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { UiDirectivesModule } from '../../../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { AppSettings } from '../../core/modals/appsettings';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonService } from '../../core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TextSpecialDirective } from '../../shared/shared-directives/text-special.directive';
import { FileuploadDirective } from "../../shared/shared-directives/fileupload.directive";
// import { UniversalVideoComponent } from '../../shared/shared-components/universal-video/universal-video.component';
@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, UiDirectivesModule, ReactiveFormsModule, TextSpecialDirective, FileuploadDirective],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss'
})
export class StoryComponent implements OnInit {
  storyForm: FormGroup;
  category!: string;
  allStories: any[] = [];
  postedStories: any[] = [];
  myStories: any[] = [];
  url: any;
  isAdmin = false;
  isvideo = false;
  role = '';
  sliceCount: number = 65;
  activeTab: string = 'Upload'; // default
  likedUser: any[] = [];
  likeshowPopup = false;
  allowedRatios: number[] = [
    16 / 9,  // widescreen
    1 / 1,   // square
    4 / 3    // classic photo
  ];
  tolerance = 0.05;       // 5% margin allowed
  selectedFiles: { [key: string]: File } = {};
  removeFiles: { [key: string]: File } = {};
  mediaOptions = [
    { label: 'Image', id: 'Image' },
    { label: 'Video', id: 'Video' }
  ];
  imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  // videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm', '.3gp', '.mpeg', '.mpg', '.m4v', '.ts', '.ogv'];
  videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
  title = '';
  // Combined (for when user hasn’t selected anything yet)
  allExtensions = [...this.imageExtensions, ...this.videoExtensions];
  AppSettings = AppSettings;
  constructor(private router: Router, private fb: FormBuilder, private api: SharedApiService, private route: ActivatedRoute, private loader: LoaderService, private dialog: CommonDialogService, private common: CommonService, private sanitizer: DomSanitizer) {
    this.storyForm = this.fb.group({
      mediaType: ['Image'],
      headline: ['', [Validators.maxLength(250)]],
      storyDescription: ['', [Validators.maxLength(1000)]],
      link: ['', [Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)]],
      externalLink: ['', [Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)]],
      attachment1: [null, Validators.required],
    })

    setTimeout(() => {
      this.storyForm.get('mediaType')?.setValue('Image');
    });
  }
  ngOnInit(): void {
    this.isAdmin = this.common.getIsAdmin();
    const state = history.state;
    const cat = history.state?.cat;
    this.role = history.state?.role;
    if (this.role == 'admin' && this.isAdmin == true) {
      this.activeTab = 'Publish Content';
    } else { this.activeTab = 'Upload'; }
    if (cat == 'corp') {
      this.category = 'corporateconnect';
      this.title = 'Corporate Connect';
      this.url = AppSettings.CCCONTENTURL
    } else if (cat == 'emp') {
      this.category = 'employeeconnect';
      this.title = 'Employee Connect';
      this.url = AppSettings.ECCONTENTURL
    } else if (cat == 'lead') {
      this.category = 'leaderconnect';
      this.title = 'Leader Connect';
      this.url = AppSettings.LCCONTENTURL
    } else {
      this.category = 'NA';
    }
    this.storyForm.get('mediaType')?.setValue('Image');
    this.fetchAllStories();
    this.updateSliceCount();

    // update on resize also
    window.addEventListener('resize', () => {
      this.updateSliceCount();
    });
  }

  updateSliceCount() {
    const width = window.innerWidth;
    if (width < 480) {
      this.sliceCount = 10;        // mobile
    } else if (width < 768) {
      this.sliceCount = 32;        // small tablet
    } else if (width < 1024) {
      this.sliceCount = 56;        // tablet
    } else {
      this.sliceCount = 62;        // desktop
    }
  }
  onTabChange(tab: string) {
    if (tab === 'Upload') {
      if (!this.isvideo) {
        setTimeout(() => {
          this.storyForm.get('mediaType')?.setValue('Image');
        });
      }
    }
    if (tab === 'Posted Content') { /* … */ }
    if (tab === 'My Submission') { /* … */ }
    if (tab === 'Publish Content') {
      if (!this.isvideo) {
        setTimeout(() => {
          this.storyForm.get('mediaType')?.setValue('Image');
        });
      }
    }
  }

  onMediaTypeChange(event: any) {
    // console.log(this.allExtensions);
    const selectedType = event.target.value;
    this.isvideo = selectedType === 'Video';
    this.storyForm.get('mediaType')?.markAsTouched();
    this.storyForm.get('attachment1')?.reset();
    this.storyForm.get('attachment1')?.clearValidators();
    this.storyForm.get('externalLink')?.reset();
    this.storyForm.get('externalLink')?.setValidators([]);
    this.onRemove('attachment1');
    if (this.isvideo){
      if(this.category !== 'employeeconnect'){
        this.storyForm.get('externalLink')?.setValidators([
        Validators.maxLength(1000),
        Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)
      ]);
      this.storyForm.get('externalLink')?.markAsTouched();
      }else{
        this.storyForm.get('attachment1')?.setValidators([Validators.required]);
      }
    }
    if(!this.isvideo){
      this.storyForm.get('attachment1')?.setValidators([Validators.required]);
    }
    // if (this.isvideo && this.category !== 'employeeconnect') {

    //   this.storyForm.get('externalLink')?.setValidators([
    //     Validators.maxLength(1000),
    //     Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)
    //   ]);

    //   // ✅ Mark as touched to show error immediately
    //   this.storyForm.get('externalLink')?.markAsTouched();

    // }
    // else {
    //   this.storyForm.get('externalLink')?.reset();
    //   this.storyForm.get('externalLink')?.setValidators([]);
    //   this.storyForm.get('attachment1')?.setValidators([Validators.required]);
    // }

    this.storyForm.get('attachment1')?.updateValueAndValidity();
    this.storyForm.get('externalLink')?.updateValueAndValidity();
  }

  // fetchAllStories() {
  //   this.loader.show();
  //   Promise.resolve().then(() => {
  //     this.api.getMyStories(this.category, 'all').subscribe({
  //       next: (res: any) => {
  //         // console.log('resall', res);
  //         this.loader.hide();

  //         // ✅ 1. Store all stories
  //         this.allStories = res[this.category] || [];

  //         // ✅ 2. Filter posted stories (status P or X)
  //         this.postedStories = this.allStories.filter((story: any) =>
  //           story?.status === 'P' || story?.status === 'X'
  //         );

  //         // ✅ 3. Filter my submissions (createdBy email before @ matches user)
  //         const userEmail = localStorage.getItem('emailId') || '';
  //         const userPrefix = userEmail.split('@')[0];

  //         this.myStories = this.allStories.filter((story: any) => {
  //           const createdPrefix = story?.createdBy?.split('@')[0];
  //           return createdPrefix === userPrefix;
  //         });
  //       },

  //       error: (err: any) => {
  //         this.allStories = [];
  //         this.postedStories = [];
  //         this.myStories = [];
  //         this.loader.hide();
  //         console.error('Failed to load data:', err);
  //       }
  //     });

  //   });
  // }
  fetchAllStories() {
    this.loader.show();
    Promise.resolve().then(() => {
      this.api.getMyStories(this.category, 'all').subscribe({
        next: (res: any) => {
          this.loader.hide();

          // 1️⃣ Store all stories
          this.allStories = res[this.category] || [];

          // 🔥 Reusable priority map
          const priority: any = { L: 1, P: 2, X: 3 };

          // 2️⃣ postedStories → only P then X
          this.postedStories = this.allStories
            .filter((story: any) => story?.status === 'P' || story?.status === 'X')
            .sort((a: any, b: any) => priority[a.status] - priority[b.status]);

          // 3️⃣ myStories → match createdBy prefix
          const userEmail = localStorage.getItem('emailId') || '';
          const userPrefix = userEmail.split('@')[0];

          this.myStories = this.allStories
            .filter((story: any) => {
              const createdPrefix = story?.createdBy?.split('@')[0];
              return createdPrefix === userPrefix;
            })
            .sort((a: any, b: any) => priority[a.status] - priority[b.status]);

          // 4️⃣ allStories → sort A → P → X
          this.allStories = [...this.allStories].sort(
            (a: any, b: any) => priority[a.status] - priority[b.status]
          );
        },

        error: (err: any) => {
          this.allStories = [];
          this.postedStories = [];
          this.myStories = [];
          this.loader.hide();
          console.error('Failed to load data:', err);
        }
      });
    });
  }

  handleStoryAction(story: any) {
    this.loader.show();

    let newStatus = '';
    let actionMessage = '';

    if (story.status === 'L') {
      newStatus = 'P';
      actionMessage = 'Content published successfully.';
    } else if (story.status === 'P') {
      newStatus = 'X';
      actionMessage = 'Content archived successfully.';
    } else if (story.status === 'X') {
      newStatus = 'P';
      actionMessage = 'Content republished successfully.';
    }

    this.api.updateContentStatus(story.category, story.fileName, newStatus, story.id)
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          if (res?.status === 'success') {

            // ✅ Update UI instantly
            // story.status = newStatus;
            // story.actionSuccess = res.message;   // ✅ shows message

            // ✅ Popup confirmation
            this.dialog.alert(res.message, 'CONFIRMATION').then(() => {
              story.status = newStatus;
              story.actionSuccess = actionMessage;

              const index = this.allStories.findIndex((s: any) => s.id === story.id);
              if (index !== -1) {
                this.allStories[index].status = newStatus;
                this.allStories[index].actionSuccess = actionMessage;
              }
              const index2 = this.myStories.findIndex((s: any) => s.id === story.id);
              if (index2 !== -1) {
                this.myStories[index2].status = newStatus;
                this.myStories[index2].actionSuccess = actionMessage;
              }
              const index3 = this.postedStories.findIndex((s: any) => s.id === story.id);
              if (index3 !== -1) {
                this.postedStories[index3].status = newStatus;
                this.postedStories[index3].actionSuccess = actionMessage;
              }
              this.postedStories = [...this.postedStories];
              this.myStories = [...this.myStories];
              this.allStories = [...this.allStories];

            });

          } else {
            this.dialog.alert(res.message);
          }
        },
        error: (err) => {
          this.loader.hide();
          this.dialog.alert(err.message);
          console.error('Submission failed:', err);
        }
      });
  }

  openLink(obj?: any) {
    // console.log(obj);
    if (obj.link !== 'NA' && obj.type === 'Image') {
      window.open(obj.link, '_blank');
    }
  }

  isVideo(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  selectedImage: string | null = null;

  openImage(story: any) {
    if (!story.fileName.endsWith('.mp4')) {
      this.selectedImage = this.url + story.folder + '/' + story.fileName;
    }
  }

  closeImage() {
    this.selectedImage = null;
  }



  onSubmit() {
    this.loader.show();
    if (this.storyForm.invalid) {
      this.storyForm.markAllAsTouched();
      const requiredFields = ['mediaType', 'headline'];
      // For images, require attachment

      if (this.category == 'employeeconnect' || this.category !== 'employeeconnect' && !this.isvideo) requiredFields.push('attachment1');

      // // Debug log values
      // requiredFields.forEach(f => {
      //   console.log(f, '=>', this.storyForm.get(f)?.value);
      // });

      // // Handle custom error "uploadFailed"
      requiredFields.forEach(key => {
        const control = this.storyForm.get(key);
        if (control && control.enabled) {
          if (!control.value && control.errors?.['uploadFailed'] !== true) {
            control.setErrors({ ...(control.errors || {}), uploadFailed: true });
            control.markAsTouched();
          } else if (control.value && control.hasError('uploadFailed')) {
            // remove uploadFailed error if value exists
            const { uploadFailed, ...rest } = control.errors || {};
            control.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      });
      // For video, require at least one of file or link
      if (this.isvideo) {
        if (this.category !== 'employeeconnect') {
          const hasFile = !!this.selectedFiles['attachment1'];
          const hasLink = !!this.storyForm.get('externalLink')?.value?.trim();

          if ((!hasFile && !hasLink) && (hasFile && hasLink)) {
            this.loader.hide();
            this.dialog.alert('Please upload a file or provide an external link.', 'ALERT');
            const element = document.querySelector(`[formControlName="externalLink"]`) as HTMLElement;
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
          }
        }

      }

      // Now handle any other validation errors
      const firstInvalidControl = Object.keys(this.storyForm.controls).find(key => {
        const control = this.storyForm.get(key);
        return control && control.invalid && control.enabled;
      });
      this.loader.hide();
      let msg = '';
      if (firstInvalidControl === 'externalLink' || firstInvalidControl === 'link') {
        msg = 'Please fill valid link.'
      } else {
        msg = 'Please fill all required fields.'
      }

      this.dialog.alert(msg, 'ALERT')
        .then(() => {
          if (firstInvalidControl) {
            const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`) as HTMLElement;
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      return;
    }


    if (this.storyForm.valid) {
      const payload = this.storyForm.getRawValue();
      const formData = new FormData();
      const hasFile = !!this.selectedFiles['attachment1'];
      const hasLink = !!this.storyForm.get('externalLink')?.value?.trim();

      if (hasFile && hasLink || !hasFile && !hasLink) {
        this.loader.hide();
        this.dialog.alert('Please upload either a file or provide an external link.', 'ALERT').then(() => {
          const element = document.querySelector(
            `[formControlName="externalLink"]`
          ) as HTMLElement;

          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        return;
      }

      formData.append('category', this.category);
      formData.append('header', payload.headline);
      formData.append('link', payload.link || "NA");
      formData.append('description', payload.storyDescription || 'NA');
      formData.append('type', payload.mediaType);
      formData.append('externalLink', payload.externalLink || "");
      formData.append('file', this.selectedFiles['attachment1']);


      Promise.resolve().then(() => {
        this.api.submitStoryForm(formData).subscribe({
          next: (res: any) => {
            this.loader.hide()
            if (res[0].status === 'success') {
              this.dialog.alert(res[0].message, 'CONFIRMATION').then(() => {
                this.onReset();
                this.fetchAllStories();
                this.activeTab = 'My Submission';
              });
            } else if (res?.status !== 'success') {
              if (res[0].message) {
                this.dialog.alert(res[0].message);
              } else {
                this.dialog.alert("Failed to upload the content");
              }

            }

          },
          error: (err) => {
            this.loader.hide()
            this.dialog.alert(err[0].message);
            console.error('Submission failed:', err);
          }
        });
      });
    }

  }



  async onFileChange(event: { file: File | null }, controlName: string) {

    const { file } = event;
    this.selectedFiles = {};
    const control = this.storyForm.get(controlName);
    control?.setErrors(null);
    if (!control) return;

    if (!file) {
      control.setValue(null);
      control.setErrors({ required: true, uploadFailed: true });
      delete this.selectedFiles[controlName];
      return;
    }

    this.selectedFiles = { [controlName]: file };

    // if (file) {
    //   const isValid = await this.checkMediaRatio(file);

    //   if (!isValid) {
    //     this.storyForm.get(controlName)?.reset();
    //     this.removeFiles[controlName] = file.name;

    //     const ratiosText = this.allowedRatios.map(r => {
    //       const [w, h] = [Math.round(r * 100), 100];
    //       return `${w}:${h}`;
    //     }).join(' or ');

    //     alert(`Invalid aspect ratio. Please upload in ${ratiosText} ratio.`);
    //     return;
    //   }

    //   // this.selectedFiles[controlName] = file;
    // }
    if (file) {
      control.setErrors(null);
      control.markAsTouched();
      this.removeFiles[controlName] = file
    } else {
      control.setErrors({ required: true, uploadFailed: true });
      control.setValue(null);
      control.updateValueAndValidity();
      delete this.selectedFiles[controlName];
    }

  }

  checkMediaRatio(file: File): Promise<boolean> {

    return new Promise((resolve) => {
      const validateRatio = (width: number, height: number) => {
        const ratio = width / height;
        // ✅ check against all allowed ratios
        return this.allowedRatios.some(allowed =>
          Math.abs(ratio - allowed) <= this.tolerance
        );
      };

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve(validateRatio(img.width, img.height));
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      }
      else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          resolve(validateRatio(video.videoWidth, video.videoHeight));
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => resolve(false);
        video.src = URL.createObjectURL(file);
      }
      else {
        resolve(false);
      }
    });
  }

  onRemove(controlName: any) {

    const file = this.removeFiles[controlName];
    const control = this.storyForm.get(controlName);
    // console.log(file);
    if (!file) {
      console.warn('No file name found for control:', controlName);
      return;
    }
    if (file) {
      control?.setValue(null);
      control?.setErrors({ required: true, uploadFailed: true });
      delete this.selectedFiles[controlName];
      delete this.removeFiles[controlName];
    }
  }

  onFileDownload(event: { fileName: string; controlName: string }) {
    const { fileName, controlName } = event;
    // File stored from onFileChange()
    const file = this.selectedFiles[controlName];

    if (!file) {
      console.warn('File not found to download');
      return;
    }

    // Convert File → Blob URL
    const url = URL.createObjectURL(file);

    // Create temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name || fileName;   // use real file name
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup Blob URL
    URL.revokeObjectURL(url);
  }


  get allowedExtensions(): string[] {

    const mediaType = this.storyForm.get('mediaType')?.value;
    if (mediaType === 'Image') {
      this.isvideo = false;
      return this.imageExtensions;
    } else if (mediaType === 'Video') {
      this.isvideo = true;
      return this.videoExtensions;
    } else {
      this.isvideo = false;
      return this.allExtensions;
    }
  }

  // get allowedExtensions(): string[] {
  //   const mediaType = this.storyForm.get('mediaType')?.value;

  //   if (mediaType === 'Image') {
  //     this.isvideo = false;
  //     return this.imageExtensions; // filter only images
  //   }
  //   else if (mediaType === 'Video') {
  //     this.isvideo = true;
  //     return []; // ← allow ALL files (no filter)
  //   }
  //   else {
  //     this.isvideo = false;
  //     return this.allExtensions;
  //   }
  // }


  empconnect(id: any, stories: any, cat: any, tab: any) {
    const story = stories?.find((story: any) => story.id === id);
    this.role = this.isAdmin ? 'admin' : 'default'
    this.router.navigate(['/portal/contentPreview'], {
      state: { storyList: stories, id: id, cat: cat, tab: tab, role: this.role }
    });

        this.api.postVisit(story.id, story.category, story.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });
  }

  isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  getLikes(post:any) {
    this.api.getLikeBy(post.id,  "getLikes", post.category, post.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          this.likedUser = res.likedUsers;
          this.likesPopupOpen();
        }
      },
      error: (err) => {
        console.error('Failed to load data:', err);
      }
    });
  }
  updateLikes(story: any) {
    let action = story.self ? 'unlike' : 'like';
    this.api.getLikeBy(story.id, action, story.category, story.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          story.self = !story.self;
          story.totalLikes = res.totalLikes
        }
      },
      error: (err) => {
        console.error('Failed to load data:', err);
      }
    });
  }

  likesPopupOpen() {
    this.likeshowPopup = true;
  }

  likesPopupClose() {
    this.likeshowPopup = false;
  }


  onReset(): void {
    this.storyForm.reset();
    this.storyForm.get('mediaType')?.setValue('Image');
    this.isvideo = false;
    this.selectedFiles = {};
    this.removeFiles = {};
  }

}
