import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-hand-writing',
  templateUrl: './hand-writing.component.html',
  styleUrls: ['./hand-writing.component.scss']
})
export class HandWritingComponent implements OnInit {

  private dataBuffer;
  private labelBuffer;
  public imageSrc;
  constructor(private cd: ChangeDetectorRef, private san: DomSanitizer) {
  }

  ngOnInit(): void {
  }


  onFileChange(e): void {
    const vm = this;
    const reader = new FileReader();

    const [file] = e.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64str = reader.result.toString().replace('data:application/octet-stream;base64,', '');
      const binary = atob(base64str.replace(/\s/g, ''));
      const len = binary.length;
      const rem = 4 - (Math.floor(len / 4) % 4);
      const arrayLength =  Math.floor(len / 4) + rem;
      // const buffer = new ArrayBuffer(arrayLength);
      // const view = new Uint32Array(buffer);
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }
      this.dataBuffer = view;
      vm.cd.markForCheck();
    };
  }

  onFileChangeImage(e): void {
    const vm = this;
    const reader = new FileReader();

    const [file] = e.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64str = reader.result.toString().replace('data:application/octet-stream;base64,', '');
      const binary = atob(base64str.replace(/\s/g, ''));
      const len = binary.length;
      const rem = 4 - (Math.floor(len) % 4);
      // const arrayLength =  Math.floor(len) + rem;
      // const buffer = new ArrayBuffer(arrayLength);
      // const view = new Uint32Array(buffer);
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }
      this.labelBuffer = view;
      vm.cd.markForCheck();
    };
  }

  createImageFiles(): void {
    const pixelValues: any[] = [];

    for (let image = 0; image <= 59999; image++) {
      const pixels = [];

      for (let y = 0; y <= 27; y++) {
        for (let x = 0; x <= 27; x++) {
          pixels.push(this.dataBuffer[(image * 28 * 28) + (x + (y * 28)) + 16]);
        }
      }

      const imageData  = {};
      imageData[JSON.stringify(this.labelBuffer[image + 8])] = pixels;

      pixelValues.push(imageData);
    }
    // console.log('');
    // this.downloadBlob(pixelValues[0][Object.keys(pixelValues[0])[0]], Object.keys(pixelValues[0])[0], 'image/png');
    // this.showImage(pixelValues[0][Object.keys(pixelValues[0])[0]]);
    this.createCanvas(pixelValues[1][Object.keys(pixelValues[1])[0]]);
  }

  createBlob(reader: FileReader, fileName: string): FormData {
    const formData = new FormData();
    const base64str = reader.result.toString().replace('data:image/png;base64,', '');
    const binary = atob(base64str.replace(/\s/g, ''));
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    const blob = new Blob( [view], { type: 'image/png' });
    formData.append('formFile', blob, fileName);
    return formData;
  }

  downloadBlob(data, fileName, mimeType): void {
    let blob;
    let url;
    const content = new Uint8ClampedArray(data);
    blob = new Blob([content.buffer], {type: 'image/png'});
    url = window.URL.createObjectURL(blob);
    this.imageSrc = this.san.bypassSecurityTrustUrl(url);
    this.downloadURL(url, fileName);
    setTimeout(() => {
      return window.URL.revokeObjectURL(url);
    }, 1000);
  }

  downloadURL(data, fileName): void {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    // a.style = 'display: none';
    a.click();
    a.remove();
  }

  showImage(data): void {
    const array = new Uint8Array(data);
    const base64 = btoa(String.fromCharCode.apply(null, array));

    this.imageSrc = this.san.bypassSecurityTrustUrl('data:image/jpg;base64,' + base64);
  }

  createCanvas(data: any[]): void {
    const content = new Uint8ClampedArray(data);
    Float32Array.from(data).map (p => p / 255);
    // const thing = new ImageData(content, 14, 14);
    // const thing = new ImageData(content, 7);
    const can = document.getElementById('canvas');
    const ctx = (can as HTMLCanvasElement).getContext('2d');
    const imgData = ctx.getImageData(1, 1, 28, 28);
    for (let i = 0; i < content.length; i += 4) {
      // const avg = (content[i] + content[i + 1] + content[i + 2]) / 3;
      // imgData.data[i] = avg;
      // imgData.data[i + 1] = avg;
      // imgData.data[i + 2] = avg;
      imgData.data[i] = 255 - content[i];
      imgData.data[i + 1] = 255 - content[i + 1];
      imgData.data[i + 2] = 255 - content[i + 2];
      imgData.data[i + 3] = 255;
    }
    // for (let i = 0; i < data.length; i++) {
    //   imgData.data[i] = 255 - data[i];
    // }
    ctx.putImageData(imgData, 1, 1);
  }
}
