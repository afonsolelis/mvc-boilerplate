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

    const createBtn = document.querySelector('#createUser');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreateModal());
    }

    const saveBtn = document.querySelector('#saveUser');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.createUser());
    }

    const editFromViewBtn = document.querySelector('#editFromView');
    if (editFromViewBtn) {
      editFromViewBtn.addEventListener('click', () => this.editFromView());
    }

    const updateBtn = document.querySelector('#updateUser');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => this.updateUser());
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
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const user = await response.json();
      this.showViewModal(user);
    } catch (error) {
      console.error('Error viewing user:', error);
      showToast('Erro ao carregar dados do usuário', 'danger');
    }
  }

  showViewModal(user) {
    // Populate view modal fields
    document.getElementById('viewUserId').textContent = this.truncateId(user.id);
    document.getElementById('viewUserName').textContent = user.name;
    document.getElementById('viewUserEmail').textContent = user.email;
    document.getElementById('viewUserCreated').textContent = formatDate(user.created_at);
    document.getElementById('viewUserUpdated').textContent = formatDate(user.updated_at);
    
    // Store user data for editing
    this.currentUser = user;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
    modal.show();
  }

  editFromView() {
    if (!this.currentUser) {
      showToast('Erro: dados do usuário não encontrados', 'danger');
      return;
    }
    
    // Hide view modal
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewUserModal'));
    viewModal.hide();
    
    // Show edit modal with current user data
    setTimeout(() => {
      this.showEditModal(this.currentUser);
    }, 300); // Wait for view modal to close
  }

  showEditModal(user = null) {
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    this.clearEditForm();
    
    if (user) {
      // Populate form with existing user data
      document.getElementById('editUserId').value = user.id;
      document.getElementById('editUserName').value = user.name;
      document.getElementById('editUserEmail').value = user.email;
      this.currentUser = user;
    }
    
    modal.show();
  }

  clearEditForm() {
    const form = document.getElementById('editUserForm');
    form.reset();
    form.classList.remove('was-validated');
    
    // Clear custom validation messages
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
      const feedback = input.nextElementSibling;
      if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
      }
    });
  }

  validateEditForm() {
    const nameInput = document.getElementById('editUserName');
    const emailInput = document.getElementById('editUserEmail');
    let isValid = true;

    // Validate name
    if (!nameInput.value.trim()) {
      this.showFieldError(nameInput, 'Nome é obrigatório');
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      this.showFieldError(nameInput, 'Nome deve ter pelo menos 2 caracteres');
      isValid = false;
    } else if (nameInput.value.trim().length > 100) {
      this.showFieldError(nameInput, 'Nome deve ter no máximo 100 caracteres');
      isValid = false;
    } else {
      this.showFieldSuccess(nameInput);
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      this.showFieldError(emailInput, 'Email é obrigatório');
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      this.showFieldError(emailInput, 'Email deve ter um formato válido');
      isValid = false;
    } else {
      this.showFieldSuccess(emailInput);
    }

    return isValid;
  }

  async updateUser() {
    if (!this.validateEditForm()) {
      return;
    }

    if (!this.currentUser) {
      showToast('Erro: usuário não encontrado', 'danger');
      return;
    }

    const updateBtn = document.getElementById('updateUser');
    const originalText = updateBtn.innerHTML;
    
    try {
      // Show loading state
      updateBtn.disabled = true;
      updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Salvando...';

      const name = document.getElementById('editUserName').value.trim();
      const email = document.getElementById('editUserEmail').value.trim();
      const userId = this.currentUser.id;

      const response = await fetch(`${this.apiBase}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email })
      });

      const result = await response.json();

      if (response.ok) {
        // Success
        showToast('Usuário atualizado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        this.loadUsers(); // Refresh the table
        this.currentUser = null; // Clear current user
      } else {
        // Handle server errors
        if (result.error) {
          if (result.error.includes('já existe') || result.error.includes('já está em uso')) {
            this.showFieldError(document.getElementById('editUserEmail'), 'Este email já está em uso por outro usuário');
          } else {
            showToast(`Erro: ${result.error}`, 'danger');
          }
        } else {
          showToast('Erro ao atualizar usuário', 'danger');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Erro de conexão. Tente novamente.', 'danger');
    } finally {
      // Restore button state
      updateBtn.disabled = false;
      updateBtn.innerHTML = originalText;
    }
  }

  showCreateModal() {
    const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
    this.clearForm();
    modal.show();
  }

  clearForm() {
    const form = document.getElementById('createUserForm');
    form.reset();
    form.classList.remove('was-validated');
    
    // Clear custom validation messages
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
      const feedback = input.nextElementSibling;
      if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
      }
    });
  }

  validateForm() {
    const form = document.getElementById('createUserForm');
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    let isValid = true;

    // Validate name
    if (!nameInput.value.trim()) {
      this.showFieldError(nameInput, 'Nome é obrigatório');
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      this.showFieldError(nameInput, 'Nome deve ter pelo menos 2 caracteres');
      isValid = false;
    } else if (nameInput.value.trim().length > 100) {
      this.showFieldError(nameInput, 'Nome deve ter no máximo 100 caracteres');
      isValid = false;
    } else {
      this.showFieldSuccess(nameInput);
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      this.showFieldError(emailInput, 'Email é obrigatório');
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      this.showFieldError(emailInput, 'Email deve ter um formato válido');
      isValid = false;
    } else {
      this.showFieldSuccess(emailInput);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = message;
    }
  }

  showFieldSuccess(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = '';
    }
  }

  async createUser() {
    if (!this.validateForm()) {
      return;
    }

    const saveBtn = document.getElementById('saveUser');
    const originalText = saveBtn.innerHTML;
    
    try {
      // Show loading state
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Salvando...';

      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email })
      });

      const result = await response.json();

      if (response.ok) {
        // Success
        showToast('Usuário criado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
        modal.hide();
        this.loadUsers(); // Refresh the table
      } else {
        // Handle server errors
        if (result.error) {
          if (result.error.includes('já existe') || result.error.includes('já está em uso')) {
            this.showFieldError(document.getElementById('userEmail'), 'Este email já está em uso');
          } else {
            showToast(`Erro: ${result.error}`, 'danger');
          }
        } else {
          showToast('Erro ao criar usuário', 'danger');
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Erro de conexão. Tente novamente.', 'danger');
    } finally {
      // Restore button state
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  }

  async editUser(userId) {
    try {
      const response = await fetch(`${this.apiBase}/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const user = await response.json();
      this.showEditModal(user);
    } catch (error) {
      console.error('Error loading user for edit:', error);
      showToast('Erro ao carregar dados do usuário para edição', 'danger');
    }
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