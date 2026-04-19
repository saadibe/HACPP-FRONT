import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-picker">
      <label class="picker-btn">
        📷 {{ cameraLabel }}
        <input
          type="file"
          [accept]="cameraAccept"
          capture="environment"
          (change)="onFileSelected($event)"
          hidden
        />
      </label>

      <label class="picker-btn secondary">
        📁 {{ fileLabel }}
        <input
          type="file"
          [accept]="accept"
          (change)="onFileSelected($event)"
          hidden
        />
      </label>

      <div *ngIf="fileName" class="file-name">
        Fichier : {{ fileName }}
      </div>
    </div>
  `,
  styles: [`
    .file-picker { display:flex; flex-direction:column; gap:10px; }
    .picker-btn {
      display:inline-block; padding:12px 14px; border-radius:12px;
      background:#0f4c81; color:white; text-align:center; cursor:pointer; font-weight:600;
    }
    .picker-btn.secondary { background:#e5e7eb; color:#111827; }
    .file-name { font-size:14px; color:#374151; }
  `]
})
export class FilePickerComponent {
  @Input() accept = 'image/*';
  @Input() cameraAccept = 'image/*';
  @Input() cameraLabel = 'Prendre une photo';
  @Input() fileLabel = 'Importer un fichier';
  @Output() fileSelected = new EventEmitter<File>();

  fileName = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileName = file.name;
    this.fileSelected.emit(file);
  }
}
