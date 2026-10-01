// import { Directive, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

// @Directive({
//     selector: '[autoAdaptiveGradient]',
//     standalone: true
// })
// export class AutoAdaptiveGradientDirective implements AfterViewInit {

//     @Input('autoAdaptiveGradient') mediaSrc!: string;

//     private canvas!: HTMLCanvasElement;
//     private ctx!: CanvasRenderingContext2D | null;

//     constructor(private el: ElementRef, private renderer: Renderer2) { }

//     ngAfterViewInit(): void {
//         this.init();
//     }

//     private init() {
//         this.canvas = document.createElement('canvas');
//         this.ctx = this.canvas.getContext('2d');

//         // Detect type
//         if (this.isVideo(this.mediaSrc)) {
//             this.handleVideo();
//         } else {
//             this.handleImage();
//         }
//     }

//     private isVideo(src: string): boolean {
//         return /\.(mp4|webm|mov|mkv|m4v|3gp)$/i.test(src);
//     }

//     private handleVideo() {
//         const vid: HTMLVideoElement = this.el.nativeElement.querySelector('video');

//         if (!vid) return;

//         vid.crossOrigin = 'anonymous'; // CORS-safe attempt

//         vid.addEventListener('loadeddata', () => {
//             this.extractVideoColor(vid);
//         });

//         vid.addEventListener('timeupdate', () => {
//             this.extractVideoColor(vid);
//         });
//     }

//     private extractVideoColor(video: HTMLVideoElement) {
//         if (!this.ctx) return;

//         try {
//             this.canvas.width = 32;
//             this.canvas.height = 32;

//             this.ctx.drawImage(video, 0, 0, 32, 32);
//             const data = this.ctx.getImageData(0, 0, 32, 32).data;

//             const [r, g, b] = this.getAverageRGB(data);
//             this.applyGradient(r, g, b);
//         } catch (err) {
//             // CORS fallback — safe approximate background
//             this.applyFallback();
//         }
//     }

//     private handleImage() {
//         const img = new Image();
//         img.crossOrigin = 'anonymous';
//         img.src = this.mediaSrc;

//         img.onload = () => {
//             try {
//                 this.canvas.width = img.width;
//                 this.canvas.height = img.height;
//                 this.ctx?.drawImage(img, 0, 0);
//                 const data = this.ctx?.getImageData(0, 0, img.width, img.height).data;
//                 if (data) {
//                     const [r, g, b] = this.getAverageRGB(data);
//                     this.applyGradient(r, g, b);
//                 }
//             } catch (err) {
//                 this.applyFallback();
//             }
//         };

//         img.onerror = () => this.applyFallback();
//     }

//     private getAverageRGB(data: Uint8ClampedArray) {
//         let r = 0, g = 0, b = 0;
//         const count = data.length / 4;

//         for (let i = 0; i < data.length; i += 4) {
//             r += data[i];
//             g += data[i + 1];
//             b += data[i + 2];
//         }

//         return [
//             Math.round(r / count),
//             Math.round(g / count),
//             Math.round(b / count)
//         ];
//     }

//     private applyGradient(r: number, g: number, b: number) {
//         const bg = `linear-gradient(135deg, rgba(${r},${g},${b},0.65), rgba(${r - 40},${g - 40},${b - 40},0.65))`;
//         this.renderer.setStyle(this.el.nativeElement, 'transition', 'background 0.6s ease');
//         this.renderer.setStyle(this.el.nativeElement, 'background', bg);
//     }

//     private applyFallback() {
//         console.warn('CORS blocked — using safe fallback color.');
//         const bg = `linear-gradient(135deg, #444, #222)`;
//         this.renderer.setStyle(this.el.nativeElement, 'background', bg);
//     }
// }



// --------------------------- use blur EventCounts. ---------------------------


// import { Directive, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

// @Directive({
//     selector: '[autoAdaptiveGradient]',
//     standalone: true
// })
// export class AutoAdaptiveGradientDirective implements AfterViewInit {

//     @Input('autoAdaptiveGradient') mediaSrc!: string;

//     private canvas!: HTMLCanvasElement;
//     private ctx!: CanvasRenderingContext2D | null;

//     constructor(private el: ElementRef, private renderer: Renderer2) { }

//     ngAfterViewInit(): void {
//         this.init();
//     }

//     private init() {
//         this.canvas = document.createElement('canvas');
//         this.ctx = this.canvas.getContext('2d');

//         if (this.isVideo(this.mediaSrc)) {
//             this.handleVideo();
//         } else {
//             this.handleImage();
//         }

//         this.applyGlassEffect();
//     }

//     private applyGlassEffect() {
//         this.renderer.setStyle(this.el.nativeElement, 'backdrop-filter', 'blur(14px)');
//         this.renderer.setStyle(this.el.nativeElement, '-webkit-backdrop-filter', 'blur(14px)');
//         // this.renderer.setStyle(this.el.nativeElement, 'border-radius', '14px');
//         this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(255,255,255,0.08)');
//     }

//     private isVideo(src: string): boolean {
//         return /\.(mp4|webm|mov|mkv|m4v|3gp)$/i.test(src);
//     }

//     private handleVideo() {
//         const vid: HTMLVideoElement = this.el.nativeElement.querySelector('video');

//         if (!vid) return;

//         vid.crossOrigin = 'anonymous';

//         vid.addEventListener('loadeddata', () => this.extractColorsFromVideo(vid));
//         vid.addEventListener('timeupdate', () => this.extractColorsFromVideo(vid));
//     }

//     private extractColorsFromVideo(video: HTMLVideoElement) {
//         if (!this.ctx) return;

//         try {
//             this.canvas.width = 64;
//             this.canvas.height = 64;

//             this.ctx.drawImage(video, 0, 0, 64, 64);
//             const data = this.ctx.getImageData(0, 0, 64, 64).data;

//             const colors = this.getQuadrantColors(data, 64, 64);
//             this.applyMultiGradient(colors);

//         } catch (err) {
//             this.applyFallback();
//         }
//     }

//     private handleImage() {
//         const img = new Image();
//         img.crossOrigin = 'anonymous';
//         img.src = this.mediaSrc;

//         img.onload = () => {
//             try {
//                 this.canvas.width = img.width;
//                 this.canvas.height = img.height;
//                 this.ctx?.drawImage(img, 0, 0);

//                 const data = this.ctx?.getImageData(0, 0, img.width, img.height).data;
//                 if (data) {
//                     const colors = this.getQuadrantColors(data, img.width, img.height);
//                     this.applyMultiGradient(colors);
//                 }
//             } catch {
//                 this.applyFallback();
//             }
//         };

//         img.onerror = () => this.applyFallback();
//     }

//     // Extract 4 dominant colors from 4 corners
//     private getQuadrantColors(data: Uint8ClampedArray, width: number, height: number) {
//         const getPixel = (x: number, y: number) => {
//             const idx = (y * width + x) * 4;
//             return [
//                 data[idx],
//                 data[idx + 1],
//                 data[idx + 2]
//             ];
//         };

//         return [
//             getPixel(5, 5),                           // top left
//             getPixel(width - 5, 5),                   // top right
//             getPixel(5, height - 5),                  // bottom left
//             getPixel(width - 5, height - 5)           // bottom right
//         ];
//     }

//     private applyMultiGradient(colors: number[][]) {
//         const stops = colors.map(([r, g, b], i) =>
//             `rgba(${r},${g},${b},0.55) ${(i * 25)}%`
//         ).join(',');

//         const gradient = `linear-gradient(135deg, ${stops})`;

//         this.renderer.setStyle(this.el.nativeElement, 'transition', 'background 0.6s ease');
//         this.renderer.setStyle(this.el.nativeElement, 'background', gradient);
//     }

//     private applyFallback() {
//         const bg = `linear-gradient(135deg, #555, #333, #111)`;
//         this.renderer.setStyle(this.el.nativeElement, 'background', bg);
//     }
// }


// ---------------------------------------------------------------------- 


import { Directive, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[autoAdaptiveGradient]',
    standalone: true
})
export class AutoAdaptiveGradientDirective implements AfterViewInit {

    @Input('autoAdaptiveGradient') mediaSrc!: string;

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D | null;

    private lastColors: number[][] | null = null; // For smoothing

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngAfterViewInit(): void {
        this.init();
    }

    private init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        if (this.isVideo(this.mediaSrc)) {
            this.handleVideo();
        } else {
            this.handleImage();
        }

        this.applyGlassEffect();
    }

    private applyGlassEffect() {
        this.renderer.setStyle(this.el.nativeElement, 'backdrop-filter', 'blur(14px)');
        this.renderer.setStyle(this.el.nativeElement, '-webkit-backdrop-filter', 'blur(14px)');
        this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(255,255,255,0.08)');
    }

    private isDarkOrLight(colors: number[][]): boolean {
        let score = 0;

        colors.forEach(([r, g, b]) => {
            const brightness = (r + g + b) / 3;

            if (brightness < 60 || brightness > 200) score++;
        });

        // If 3 out of 4 corners are dark/light → return true
        return score >= 3;
    }

    private getMiddleColors(data: Uint8ClampedArray, width: number, height: number) {
        const midX = Math.floor(width / 2);
        const midY = Math.floor(height / 2);

        const getPixel = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            return [data[idx], data[idx + 1], data[idx + 2]];
        };

        return [
            getPixel(midX - 30, midY - 30),
            getPixel(midX + 30, midY - 30),
            getPixel(midX - 30, midY + 30),
            getPixel(midX + 30, midY + 30)
        ];
    }

    private isVideo(src: string): boolean {
        return /\.(mp4|webm|mov|mkv|m4v|3gp)$/i.test(src);
    }

    private handleVideo() {
        const vid: HTMLVideoElement = this.el.nativeElement.querySelector('video');
        if (!vid) return;

        vid.crossOrigin = 'anonymous';

        // Update every 200ms (not every frame)
        setInterval(() => {
            if (!vid.paused && !vid.ended) {
                this.extractColorsFromVideo(vid);
            }
        }, 200);
    }

    private extractColorsFromVideo(video: HTMLVideoElement) {
        if (!this.ctx) return;

        try {
            this.canvas.width = 64;
            this.canvas.height = 64;

            this.ctx.drawImage(video, 0, 0, 64, 64);
            const data = this.ctx.getImageData(0, 0, 64, 64).data;

            const colors = this.getQuadrantColors(data, 64, 64);

            // SMOOTH the colors
            const smoothColors = this.smoothTransition(colors);

            this.applyMultiGradient(smoothColors);

        } catch (err) {
            this.applyFallback();
        }
    }

    // private handleImage() {
    //     const img = new Image();
    //     img.crossOrigin = 'anonymous';
    //     img.src = this.mediaSrc;

    //     img.onload = () => {
    //         try {
    //             this.canvas.width = img.width;
    //             this.canvas.height = img.height;

    //             this.ctx?.drawImage(img, 0, 0);

    //             const data = this.ctx?.getImageData(0, 0, img.width, img.height).data;
    //             if (data) {
    //                 const colors = this.getQuadrantColors(data, img.width, img.height);
    //                 const smoothColors = this.smoothTransition(colors);
    //                 this.applyMultiGradient(smoothColors);
    //             }
    //         } catch {
    //             this.applyFallback();
    //         }
    //     };

    //     img.onerror = () => this.applyFallback();
    // }


    private handleImage() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.mediaSrc;

        img.onload = () => {
            try {
                this.canvas.width = img.width;
                this.canvas.height = img.height;

                this.ctx?.drawImage(img, 0, 0);

                const data = this.ctx?.getImageData(0, 0, img.width, img.height).data;
                if (!data) return this.applyFallback();

                // Step 1: get corner colors
                const cornerColors = this.getQuadrantColors(data, img.width, img.height);

                let finalColors = cornerColors;

                // Step 2: if corners are too dark or light → use middle colors
                if (this.isDarkOrLight(cornerColors)) {
                    finalColors = this.getMiddleColors(data, img.width, img.height);
                }

                // Step 3: smooth + apply gradient
                const smoothColors = this.smoothTransition(finalColors);
                this.applyMultiGradient(smoothColors);

            } catch {
                this.applyFallback();
            }
        };

        img.onerror = () => this.applyFallback();
    }

    // Extract 4 dominant colors from 4 corners
    private getQuadrantColors(data: Uint8ClampedArray, width: number, height: number) {
        const getPixel = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            return [data[idx], data[idx + 1], data[idx + 2]];
        };

        return [
            getPixel(5, 5),
            getPixel(width - 5, 5),
            getPixel(5, height - 5),
            getPixel(width - 5, height - 5)
        ];
    }

    // Smooth color blending (lerp)
    private smoothTransition(newColors: number[][]): number[][] {
        if (!this.lastColors) {
            this.lastColors = newColors;
            return newColors;
        }

        const smooth = newColors.map((clr, i) => {
            const prev = this.lastColors![i];
            return [
                prev[0] + (clr[0] - prev[0]) * 0.15, // 15% towards new color
                prev[1] + (clr[1] - prev[1]) * 0.15,
                prev[2] + (clr[2] - prev[2]) * 0.15
            ];
        });

        this.lastColors = smooth;
        return smooth;
    }

    private applyMultiGradient(colors: number[][]) {
        const stops = colors.map(([r, g, b], i) =>
            `rgba(${r},${g},${b},0.55) ${(i * 25)}%`
        ).join(',');

        const gradient = `linear-gradient(135deg, ${stops})`;

        this.renderer.setStyle(this.el.nativeElement, 'transition', 'background 1.2s ease');
        this.renderer.setStyle(this.el.nativeElement, 'background', gradient);
    }

    private applyFallback() {
        const bg = `linear-gradient(135deg, #555, #333, #111)`;
        this.renderer.setStyle(this.el.nativeElement, 'background', bg);
    }
}
