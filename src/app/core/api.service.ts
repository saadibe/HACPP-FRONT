import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

declare global {
  interface Window { __APP_CONFIG__?: { apiBaseUrl?: string }; }
}
const API_BASE = window.__APP_CONFIG__?.apiBaseUrl || 'http://localhost:8080/api';

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; username: string; role: string; restaurantId: number; schemaName?: string; }

export interface ClientDto {
  id: number; // ← PAS optional
  restaurantName: string;
  schemaName: string;
  active: boolean;
  email?: string;
}

export interface CreateClientRequest {
  restaurantName: string;
  schemaName?: string;
  adminUsername: string;
  adminPassword: string;
  email?: string;
}
export interface DashboardResponse {
  expired: number; expiringSoon: number; fridges: number; checks: number; invoices: number; users: number;
  traceabilityToday: number; traceabilityMonth: number; traceabilityYear: number; fridgeProofs: number;
  lateCleaning: number; missingFridgeReadings: number; temperatureAlerts: number;
}
export interface TemperatureHistoryItem {
  id?: number;
  temperature: number;
  createdAt: string;
  createdBy?: string;
  source?: string;
}
export interface ProofPhoto { id?: number; url: string; sortOrder: number; }
export interface Fridge { id?: number; name: string; location?: string; minTemp: number; maxTemp: number; status?: string; }
export interface FridgeProof { id?: number; temperature: number; photoPath?: string; comment?: string; createdBy: string; createdAt?: string; source?: string; photos?: ProofPhoto[]; }
export interface CleaningZone { id?: number; name: string; description?: string; scheduledTime: string; active?: boolean; }
export interface CleaningProof { id?: number; photoPath?: string; comment?: string; createdBy: string; createdAt?: string; photos?: ProofPhoto[]; }
export interface CleaningAlert { id?: number; alertType: string; status: string; expectedAt: string; createdAt: string; resolvedAt?: string; cleaningZone?: any; }
export interface FridgeAlert { id?: number; alertType: string; status: string; expectedAt: string; createdAt: string; resolvedAt?: string; fridge?: any; }
export interface Invoice {
  id?: number; supplierName: string; invoiceNumber?: string; invoiceDate?: string; note?: string; filePath?: string;
  productCategory?: string; batchNumber?: string; supplierLot?: string; dlcDate?: string; deliveryReference?: string;
  storageLocation?: string; traceabilityStatus?: string; ocrRawText?: string;
}
export interface TraceabilityProof { id?: number; comment?: string; createdBy: string; createdAt?: string; photos?: ProofPhoto[]; }
export interface AdminUser { id?: number; username: string; role: string; active: boolean; }
export interface UpsertUserRequest { username: string; password?: string; role: string; active: boolean; }
export interface Batch { id?: number; productName: string; category?: string; preparedAt: string; dlcAt: string; storageTemp?: string; createdBy: string; qrCodePath?: string; }
export interface InvoiceOcrResponse {
  supplierName: string; invoiceNumber: string; invoiceDate: string; productCategory: string; batchNumber: string;
  supplierLot: string; dlcDate: string; deliveryReference: string; storageLocation: string; traceabilityStatus: string;
  note: string; totalAmount?: string; confidence?: number; confidenceLabel?: string; rawText: string;
}
export interface InvoiceStats { today: number; month: number; year: number; }
export interface AlertSummary { lateCleaning: number; missingFridgeReadings: number; temperatureAlerts: number; }
export interface ShellyDeviceDto {
  id?: number;
  deviceId: string;
  restaurantId: number;
  restaurantName?: string;
  fridgeId: number;
  fridgeName?: string;
  active: boolean;
}

export interface ShellyDeviceRequest {
  deviceId: string;
  restaurantId: number;
  fridgeId: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE;

  login(payload: LoginRequest): Observable<LoginResponse> { return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload); }
  getDashboard(): Observable<DashboardResponse> { return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`); }

  getClients(): Observable<ClientDto[]> {
    return this.http.get<ClientDto[]>(`${this.baseUrl}/clients`);
  }

  createClient(payload: CreateClientRequest): Observable<ClientDto> {
    return this.http.post<ClientDto>(`${this.baseUrl}/clients`, payload);
  }
updateClientEmail(id: number, email: string) {
  return this.http.patch<ClientDto>(`${this.baseUrl}/clients/${id}/email`, { email });
}

  getFridges(): Observable<Fridge[]> { return this.http.get<Fridge[]>(`${this.baseUrl}/fridges`); }
  createFridge(payload: Fridge): Observable<Fridge> { return this.http.post<Fridge>(`${this.baseUrl}/fridges`, payload); }
  updateFridge(id: number, payload: Fridge): Observable<Fridge> { return this.http.put<Fridge>(`${this.baseUrl}/fridges/${id}`, payload); }
  disableFridge(id: number): Observable<Fridge> { return this.http.delete<Fridge>(`${this.baseUrl}/fridges/${id}`); }
  getFridgeProofs(fridgeId: number): Observable<FridgeProof[]> { return this.http.get<FridgeProof[]>(`${this.baseUrl}/fridges/${fridgeId}/proofs`); }
  createFridgeProof(fridgeId: number, formData: FormData): Observable<FridgeProof> { return this.http.post<FridgeProof>(`${this.baseUrl}/fridges/${fridgeId}/proofs`, formData); }

  getCleaningZones(): Observable<CleaningZone[]> { return this.http.get<CleaningZone[]>(`${this.baseUrl}/cleaning-zones`); }
  createCleaningZone(payload: CleaningZone): Observable<CleaningZone> { return this.http.post<CleaningZone>(`${this.baseUrl}/cleaning-zones`, payload); }
  updateCleaningZone(id: number, payload: CleaningZone): Observable<CleaningZone> { return this.http.put<CleaningZone>(`${this.baseUrl}/cleaning-zones/${id}`, payload); }
  deleteCleaningZone(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/cleaning-zones/${id}`); }
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
  updateInvoice(id: number, formData: FormData): Observable<Invoice> { return this.http.put<Invoice>(`${this.baseUrl}/invoices/${id}`, formData); }
  deleteInvoice(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`); }
  ocrInvoice(formData: FormData): Observable<InvoiceOcrResponse> { return this.http.post<InvoiceOcrResponse>(`${this.baseUrl}/invoices/ocr`, formData); }

  getTraceabilityProofs(invoiceId: number): Observable<TraceabilityProof[]> { return this.http.get<TraceabilityProof[]>(`${this.baseUrl}/invoices/${invoiceId}/proofs`); }
  createTraceabilityProof(invoiceId: number, formData: FormData): Observable<TraceabilityProof> { return this.http.post<TraceabilityProof>(`${this.baseUrl}/invoices/${invoiceId}/proofs`, formData); }
  deleteTraceabilityProof(proofId: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/invoices/proofs/${proofId}`); }
  deleteTraceabilityPhoto(photoId: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/invoices/proof-photos/${photoId}`); }

  getUsers(): Observable<AdminUser[]> { return this.http.get<AdminUser[]>(`${this.baseUrl}/users`); }
  createUser(payload: UpsertUserRequest): Observable<AdminUser> { return this.http.post<AdminUser>(`${this.baseUrl}/users`, payload); }
  updateUser(id: number, payload: UpsertUserRequest): Observable<AdminUser> { return this.http.put<AdminUser>(`${this.baseUrl}/users/${id}`, payload); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/users/${id}`); }

  deleteProofPhoto(photoId: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/proof-photos/${photoId}`); }
  reorderFridgeProofPhotos(proofId: number, ids: number[]): Observable<void> { return this.http.put<void>(`${this.baseUrl}/proof-photos/fridge-proofs/${proofId}/reorder`, ids); }
  reorderCleaningProofPhotos(proofId: number, ids: number[]): Observable<void> { return this.http.put<void>(`${this.baseUrl}/proof-photos/cleaning-proofs/${proofId}/reorder`, ids); }

  getBatches(): Observable<Batch[]> { return this.http.get<Batch[]>(`${this.baseUrl}/batches`); }
  getBatch(id: number): Observable<Batch> { return this.http.get<Batch>(`${this.baseUrl}/batches/${id}`); }
  createBatch(payload: Batch): Observable<Batch> { return this.http.post<Batch>(`${this.baseUrl}/batches`, payload); }

  publicUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const root = this.baseUrl.replace(/\/api$/, '');
    return `${root}${path}`;
  }

  hygieneReportUrl(filters?: {day?: string; month?: string; year?: number}): string {
    let url = `${this.baseUrl}/reports/hygiene.pdf`;
    const params = new URLSearchParams();
    if (filters?.day) params.set('day', filters.day);
    if (filters?.month) params.set('month', filters.month);
    if (filters?.year) params.set('year', String(filters.year));
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

sendHygieneReportByEmail(filters?: { day?: string; month?: string; year?: number }) {
  let params: any = {};

  if (filters?.day) params.day = filters.day;
  if (filters?.month) params.month = filters.month;
  if (filters?.year) params.year = filters.year;

  return this.http.get<{ message: string }>(
    `${this.baseUrl}/reports/hygiene.pdf`,
    { params }
  );
}

  reportUrl(): string { return `${this.baseUrl}/batches/report.pdf`; }

  getShellyDevices(restaurantId: number) {
    return this.http.get<ShellyDeviceDto[]>(
      `${this.baseUrl}/admin/shelly-devices`,
      { params: { restaurantId } }
    );
  }

  createShellyDevice(payload: ShellyDeviceRequest) {
    return this.http.post<ShellyDeviceDto>(
      `${this.baseUrl}/admin/shelly-devices`,
      payload
    );
  }

getFridgeTemperatureHistory(fridgeId: number) {
  return this.http.get<TemperatureHistoryItem[]>(
    `${this.baseUrl}/fridges/${fridgeId}/temperature-history`
  );
}

  updateShellyDevice(id: number, payload: ShellyDeviceRequest) {
    return this.http.put<ShellyDeviceDto>(
      `${this.baseUrl}/admin/shelly-devices/${id}`,
      payload
    );
  }

  deleteShellyDevice(id: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/shelly-devices/${id}`
    );
  }
getDetectedShellyDevices(restaurantId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/admin/shelly-devices/detected`,
    {
      params: {
        restaurantId: restaurantId
      }
    }
  );
}
}