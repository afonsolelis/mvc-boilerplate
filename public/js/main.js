class UserManager {
  constructor() {
    this.apiBase = '/users';
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  onDOMReady() {
    document.querySelectorAll('.fade-in').forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    });

    const usersTable = document.querySelector('#usersTable');
    if (usersTable) {
      this.loadUsers();
    }

    const refreshBtn = document.querySelector('#refreshUsers');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadUsers());
    }
  }

  async loadUsers() {
    const tableBody = document.querySelector('#usersTable tbody');
    const loadingRow = this.createLoadingRow();
    
    try {
      tableBody.innerHTML = '';
      tableBody.appendChild(loadingRow);

      const response = await fetch(this.apiBase);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const users = await response.json();
      
      tableBody.innerHTML = '';

      if (users && users.length > 0) {
        users.forEach(user => {
          const row = this.createUserRow(user);
          tableBody.appendChild(row);
        });
        
        this.animateTableRows();
      } else {
        const noDataRow = this.createNoDataRow();
        tableBody.appendChild(noDataRow);
      }

    } catch (error) {
      console.error('Error loading users:', error);
      tableBody.innerHTML = '';
      const errorRow = this.createErrorRow(error.message);
      tableBody.appendChild(errorRow);
    }
  }

  createUserRow(user) {
    const row = document.createElement('tr');
    row.className = 'user-row';
    row.innerHTML = `
      <td><code>${this.truncateId(user.id)}</code></td>
      <td><strong>${this.escapeHtml(user.name)}</strong></td>
      <td><a href="mailto:${this.escapeHtml(user.email)}" class="text-primary">${this.escapeHtml(user.email)}</a></td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="userManager.viewUser('${user.id}')">
            <i class="fas fa-eye"></i> Ver
          </button>
          <button type="button" class="btn btn-outline-warning btn-sm" onclick="userManager.editUser('${user.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="userManager.deleteUser('${user.id}')">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </td>
    `;
    return row;
  }

  createLoadingRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="4" class="loading-state">
        <div class="d-flex justify-content-center align-items-center py-3">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          Carregando usuários...
        </div>
      </td>
    `;
    return row;
  }

  createErrorRow(message) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="4" class="error-state">
        <div class="alert alert-danger mb-0" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Erro ao carregar usuários: ${this.escapeHtml(message)}
          <br>
          <button class="btn btn-sm btn-outline-danger mt-2" onclick="userManager.loadUsers()">
            <i class="fas fa-redo"></i> Tentar novamente
          </button>
        </div>
      </td>
    `;
    return row;
  }

  createNoDataRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="4" class="no-data-state">
        <div class="py-4">
          <i class="fas fa-users fa-3x text-muted mb-3"></i>
          <p class="mb-0">Nenhum usuário encontrado</p>
          <small class="text-muted">Os usuários cadastrados aparecerão aqui</small>
        </div>
      </td>
    `;
    return row;
  }

  animateTableRows() {
    const rows = document.querySelectorAll('.user-row');
    rows.forEach((row, index) => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        row.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  async viewUser(userId) {
    try {
      const response = await fetch(`${this.apiBase}/${userId}`);
      const user = await response.json();
      
      alert(`Usuário: ${user.name}\nEmail: ${user.email}\nID: ${user.id}`);
    } catch (error) {
      console.error('Error viewing user:', error);
      alert('Erro ao visualizar usuário');
    }
  }

  editUser(userId) {
    alert(`Editar usuário: ${userId}\n(Funcionalidade a ser implementada)`);
  }

  async deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Usuário excluído com sucesso!');
        this.loadUsers();
      } else {
        throw new Error('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao excluir usuário');
    }
  }

  truncateId(id) {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} position-fixed`;
  toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  toast.innerHTML = `
    ${message}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const userManager = new UserManager();