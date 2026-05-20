import Cookies from 'js-cookie';

export class HttpReportRepository {
  private apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reports/`;

  private getHeaders() {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer \${token}`,
    };
  }

  async getStatusStats() {
    const response = await fetch(`${this.apiUrl}orders-by-status/`, { headers: this.getHeaders() });
    return response.json();
  }

  async getRepairTime() {
    const response = await fetch(`${this.apiUrl}average-repair-time/`, { headers: this.getHeaders() });
    return response.json();
  }

  async getTopFailures() {
    const response = await fetch(`${this.apiUrl}top-failing-equipment/`, { headers: this.getHeaders() });
    return response.json();
  }

  async getEngineerPerformance() {
    const response = await fetch(`${this.apiUrl}engineer-performance/`, { headers: this.getHeaders() });
    return response.json();
  }
}
