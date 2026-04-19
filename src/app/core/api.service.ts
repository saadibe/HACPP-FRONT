import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; username: string; role: string; restaurantId: number; }
export interface DashboardResponse {
  expired: number; expiringSoon: number; fridges: number; checks: number; invoices: number; users: number;
  traceabilityToday: number; traceabilityMonth: number; traceabilityYear: number; fridgeProofs: number;
  lateCleaning: number; missingFridgeReadings: number; temperatureAlerts: number;
}
export interface Fridge { id?: number; name: string; location?: string; minTemp: number; maxTemp: number; status?: string; }
export interface FridgeProof { id?: number; temperature: number; photoPath?: string; comment?: string; createdBy: string; createdAt?: string; source?: string; }
export interface CleaningZone { id?: number; name: string; description?: string; scheduledTime: string; active?: boolean; }
export interface CleaningProof { id?: number; photoPath?: string; comment?: string; createdBy: string; createdAt?: string; }
export interface CleaningAlert { id?: number; alertType: string; status: string; expectedAt: string; createdAt: string; resolvedAt?: string; cleaningZone?: any; }
export interface FridgeAlert { id?: number; alertType: string; status: string; expectedAt: string; createdAt: string; resolvedAt?: string; fridge?: any; }
export interface Invoice {
  id?: number; supplierName: string; invoiceNumber?: string; invoiceDate?: string; note?: string; filePath?: string;
  productCategory?: string; batchNumber?: string; supplierLot?: string; dlcDate?: string; deliveryReference?: string;
  storageLocation?: string; traceabilityStatus?: string; ocrRawText?: string;
}
export interface Batch { id?: number; productName: string; category?: string; preparedAt: string; dlcAt: string; storageTemp?: string; createdBy: string; qrCodePath?: string; }
export interface InvoiceOcrResponse {
  supplierName: string; invoiceNumber: string; invoiceDate: string; productCategory: string; batchNumber: string;
  supplierLot: string; dlcDate: string; deliveryReference: string; storageLocation: string; traceabilityStatus: string;
  note: string; rawText: string;
}
export interface InvoiceStats { today: number; month: number; year: number; }
export interface AlertSummary { lateCleaning: number; missingFridgeReadings: number; temperatureAlerts: number; }
declare global {
  interface Window {
    __APP_CONFIG__?: { apiBaseUrl?: string };
  }
}

const API_BASE = window.__APP_CONFIG__?.apiBaseUrl || 'http://localhost:8081/api';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE;

  login(payload: LoginRequest): Observable<LoginResponse> { return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload); }
  getDashboard(): Observable<DashboardResponse> { return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`); }

  getFridges(): Observable<Fridge[]> { return this.http.get<Fridge[]>(`${this.baseUrl}/fridges`); }
  createFridge(payload: Fridge): Observable<Fridge> { return this.http.post<Fridge>(`${this.baseUrl}/fridges`, payload); }
  disableFridge(id: number): Observable<Fridge> { return this.http.delete<Fridge>(`${this.baseUrl}/fridges/${id}`); }
  getFridgeProofs(fridgeId: number): Observable<FridgeProof[]> { return this.http.get<FridgeProof[]>(`${this.baseUrl}/fridges/${fridgeId}/proofs`); }
  createFridgeProof(fridgeId: number, formData: FormData): Observable<FridgeProof> { return this.http.post<FridgeProof>(`${this.baseUrl}/fridges/${fridgeId}/proofs`, formData); }

  getCleaningZones(): Observable<CleaningZone[]> { return this.http.get<CleaningZone[]>(`${this.baseUrl}/cleaning-zones`); }
  createCleaningZone(payload: CleaningZone): Observable<CleaningZone> { return this.http.post<CleaningZone>(`${this.baseUrl}/cleaning-zones`, payload); }
  getCleaningProofs(zoneId: number): Observable<CleaningProof[]> { return this.http.get<CleaningProof[]>(`${this.baseUrl}/cleaning-zones/${zoneId}/proofs`); }
  createCleaningProof(zoneId: number, formData: FormData): Observable<CleaningProof> { return this.http.post<CleaningProof>(`${this.baseUrl}/cleaning-zones/${zoneId}/proofs`, formData); }

  getCleaningAlerts(): Observable<CleaningAlert[]> { return this.http.get<CleaningAlert[]>(`${this.baseUrl}/alerts/cleaning`); }
  getFridgeAlerts(): Observable<FridgeAlert[]> { return this.http.get<FridgeAlert[]>(`${this.baseUrl}/alerts/fridges`); }
  getAlertSummary(): Observable<AlertSummary> { return this.http.get<AlertSummary>(`${this.baseUrl}/alerts/summary`); }

  getInvoices(filters?: {day?: string; month?: string; year?: number}): Observable<Invoice[]> {
    let params = new HttpParams();
    if (filters?.day) params = params.set('day', filters.day);
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.year) params = params.set('year', String(filters.year));
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`, { params });
  }
  getInvoiceStats(): Observable<InvoiceStats> { return this.http.get<InvoiceStats>(`${this.baseUrl}/invoices/stats`); }
  createInvoice(formData: FormData): Observable<Invoice> { return this.http.post<Invoice>(`${this.baseUrl}/invoices`, formData); }
  ocrInvoice(formData: FormData): Observable<InvoiceOcrResponse> { return this.http.post<InvoiceOcrResponse>(`${this.baseUrl}/invoices/ocr`, formData); }

  getBatches(): Observable<Batch[]> { return this.http.get<Batch[]>(`${this.baseUrl}/batches`); }
  getBatch(id: number): Observable<Batch> { return this.http.get<Batch>(`${this.baseUrl}/batches/${id}`); }
  createBatch(payload: Batch): Observable<Batch> { return this.http.post<Batch>(`${this.baseUrl}/batches`, payload); }

  publicUrl(path?: string): string {
    if (!path) return '';
    const root = this.baseUrl.replace(/\/api$/, '');
    return `${root}${path}`;
  }
  reportUrl(): string { return `${this.baseUrl}/batches/report.pdf`; }
}
