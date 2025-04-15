document.addEventListener('DOMContentLoaded', () => {
    const gitHubForm = document.getElementById('gitHubForm');
    const usernameInput = document.getElementById('usernameInput');
    const repoInput = document.getElementById('repoInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const reposList = document.getElementById('reposList');
    const commitsList = document.getElementById('commitsList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorAlert = document.getElementById('errorAlert');
    const emptyState = document.getElementById('emptyState');
    const repoInfo = document.getElementById('repoInfo');

    gitHubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const repo = repoInput.value.trim();
        
        if (!username) return;
        
        // Reset UI
        clearResults();
        showLoading();
        
        try {
            if (repo) {
                // Buscar informações do repositório e commits
                await fetchRepoAndCommits(username, repo);
            } else {
                // Buscar apenas repositórios do usuário (funcionalidade original)
                await fetchUserRepos(username);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    });

    // Função original para buscar repositórios (como no seu código inicial)
    async function fetchUserRepos(username) {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        
        if (!response.ok) {
            throw new Error('Usuário não encontrado');
        }
        
        const data = await response.json();
        
        if (data.message === "Not Found") {
            showNoUserError(username);
            return;
        }
        
        if (data.length === 0) {
            showMessage('Nenhum repositório público encontrado');
            return;
        }
        
        displayRepos(data);
    }

    // Nova função para buscar commits de um repositório específico
    async function fetchRepoAndCommits(username, repo) {
        // Primeiro busca info do repositório
        const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        
        if (!repoResponse.ok) {
            throw new Error('Repositório não encontrado');
        }
        
        const repoData = await repoResponse.json();
        displayRepoInfo(repoData);
        
        // Depois busca os commits
        const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/commits`);
        
        if (!commitsResponse.ok) {
            throw new Error('Erro ao buscar commits');
        }
        
        const commitsData = await commitsResponse.json();
        
        if (commitsData.length === 0) {
            showMessage('Nenhum commit encontrado neste repositório');
            return;
        }
        
        displayCommits(commitsData);
    }

    // Função original para exibir repositórios (como no seu código inicial)
    function displayRepos(repos) {
        reposList.innerHTML = '';
        
        repos.forEach(repo => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `
                <p><strong>Repo:</strong> ${repo.name}</p>
                <p><strong>Description:</strong> ${repo.description || 'Sem descrição'}</p>
                <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                ${repoInput ? `<button class="btn btn-sm btn-primary mt-2 show-commits" 
                    data-user="${usernameInput.value}" 
                    data-repo="${repo.name}">
                    Ver Commits
                </button>` : ''}
            `;
            reposList.appendChild(li);
        });
        
        reposList.classList.remove('d-none');
        emptyState.classList.add('d-none');
        
        // Adiciona event listeners aos botões de commits
        document.querySelectorAll('.show-commits').forEach(button => {
            button.addEventListener('click', (e) => {
                const user = e.target.getAttribute('data-user');
                const repo = e.target.getAttribute('data-repo');
                usernameInput.value = user;
                repoInput.value = repo;
                gitHubForm.dispatchEvent(new Event('submit'));
            });
        });
    }

    // Funções auxiliares
    function clearResults() {
        reposList.innerHTML = '';
        commitsList.innerHTML = '';
        errorAlert.classList.add('d-none');
        repoInfo.classList.add('d-none');
    }

    function showLoading() {
        loadingIndicator.classList.remove('d-none');
        emptyState.classList.add('d-none');
    }

    function hideLoading() {
        loadingIndicator.classList.add('d-none');
    }

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        emptyState.classList.remove('d-none');
    }

    function showNoUserError(username) {
        const ul = document.getElementById('reposList');
        ul.innerHTML = '';
        
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `<p><strong>No account exists with username:</strong> ${username}</p>`;
        ul.appendChild(li);
        
        ul.classList.remove('d-none');
        emptyState.classList.add('d-none');
    }

    function showMessage(message) {
        commitsList.innerHTML = `
            <div class="list-group-item">
                <p>${message}</p>
            </div>
        `;
        commitsList.classList.remove('d-none');
    }

    function displayRepoInfo(repo) {
        // Implementação da exibição das informações do repositório
        // (igual à versão anterior que eu te enviei)
    }

    function displayCommits(commits) {
        // Implementação da exibição dos commits
        // (igual à versão anterior que eu te enviei)
    }
});