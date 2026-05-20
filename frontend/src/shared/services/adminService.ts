import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8000/api';

export const adminService = {
  async getUsers() {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/users/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createUser(userData: any) {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
  },

  async updateUser(id: number, userData: any) {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/users/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(id: number) {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/users/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return true;
  },

  async getRoles() {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/roles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },

  async updateRole(id: number, roleData: any) {
    const token = Cookies.get('token');
    const response = await fetch(`${API_URL}/admin/roles/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
  }
};
