document.addEventListener('DOMContentLoaded', () => {
    const gitHubForm = document.getElementById('gitHubForm');
    const usernameInput = document.getElementById('usernameInput');
    const repoInput = document.getElementById('repoInput');
    const reposList = document.getElementById('reposList');
    const commitsList = document.getElementById('commitsList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorAlert = document.getElementById('errorAlert');
    const emptyState = document.getElementById('emptyState');
    const repoInfo = document.getElementById('repoInfo');
    const repoOwnerAvatar = document.getElementById('repoOwnerAvatar');
    const repoFullName = document.getElementById('repoFullName');
    const repoDescription = document.getElementById('repoDescription');
    const repoStars = document.getElementById('repoStars');
    const repoForks = document.getElementById('repoForks');
    const repoLanguage = document.getElementById('repoLanguage');

    gitHubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const repo = repoInput.value.trim();
        
        if (!username) return;
        
        // Reset UI
        reposList.innerHTML = '';
        commitsList.innerHTML = '';
        errorAlert.classList.add('d-none');
        emptyState.classList.add('d-none');
        loadingIndicator.classList.remove('d-none');
        repoInfo.classList.add('d-none');
        reposList.classList.add('d-none');
        commitsList.classList.add('d-none');
        
        try {
            if (repo) {
                // Buscar informações do repositório e commits
                await fetchRepoAndCommits(username, repo);
            } else {
                // Buscar apenas repositórios do usuário
                await fetchUserRepos(username);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            loadingIndicator.classList.add('d-none');
        }
    });

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
        commitsList.classList.remove('d-none');
    }

    async function fetchUserRepos(username) {
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        
        if (!reposResponse.ok) {
            throw new Error('Usuário não encontrado');
        }
        
        const reposData = await reposResponse.json();
        
        if (reposData.length === 0) {
            showMessage('Nenhum repositório público encontrado');
            return;
        }
        
        displayRepos(reposData);
        reposList.classList.remove('d-none');
    }

    function displayRepoInfo(repo) {
        repoOwnerAvatar.src = repo.owner.avatar_url;
        repoFullName.textContent = `${repo.owner.login} / ${repo.name}`;
        repoDescription.textContent = repo.description || 'Sem descrição';
        repoStars.textContent = `⭐ ${repo.stargazers_count}`;
        repoForks.textContent = `⑂ ${repo.forks_count}`;
        repoLanguage.textContent = repo.language || 'N/A';
        
        if (repo.language) {
            repoLanguage.style.backgroundColor = getLanguageColor(repo.language);
        }
        
        repoInfo.classList.remove('d-none');
    }

    function displayRepos(repos) {
        reposList.innerHTML = '';
        
        repos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'list-group-item p-3 mb-2 card-github';
            
            repoCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${repo.name}</h5>
                        <p class="mb-1 small text-muted">${repo.description || 'Sem descrição'}</p>
                    </div>
                    <div class="d-flex">
                        <span class="badge bg-secondary me-2">⭐ ${repo.stargazers_count}</span>
                        <span class="badge bg-secondary">⑂ ${repo.forks_count}</span>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted">${repo.language || ''}</small>
                    <a href="?user=${usernameInput.value}&repo=${repo.name}" class="btn btn-sm btn-github">
                        Ver commits
                    </a>
                </div>
            `;
            
            reposList.appendChild(repoCard);
        });
    }

    function displayCommits(commits) {
        commitsList.innerHTML = '';
        
        commits.forEach(commit => {
            const commitCard = document.createElement('div');
            commitCard.className = 'commit-card list-group-item p-3 mb-2 card-github';
            
            const commitDate = new Date(commit.commit.author.date).toLocaleString();
            
            commitCard.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <img src="${commit.author ? commit.author.avatar_url : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" 
                         alt="Author avatar" 
                         width="30" 
                         height="30" 
                         class="rounded-circle me-2">
                    <strong>${commit.commit.author.name}</strong>
                    <span class="text-muted ms-2 small">${commitDate}</span>
                </div>
                <p class="commit-message mb-1">${commit.commit.message.split('\n')[0]}</p>
                <small class="text-muted">${commit.sha.substring(0, 7)}</small>
                <a href="${commit.html_url}" target="_blank" class="stretched-link"></a>
            `;
            
            commitsList.appendChild(commitCard);
        });
    }

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        repoInfo.classList.add('d-none');
        reposList.classList.add('d-none');
        commitsList.classList.add('d-none');
        emptyState.classList.remove('d-none');
    }

    function showMessage(message) {
        commitsList.innerHTML = `
            <div class="text-center py-4">
                <p>${message}</p>
            </div>
        `;
        commitsList.classList.remove('d-none');
    }

    function getLanguageColor(language) {
        // Cores mantidas conforme anterior
    }

    // Verifica parâmetros na URL para preencher automaticamente
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const user = urlParams.get('user');
        const repo = urlParams.get('repo');
        
        if (user) {
            usernameInput.value = user;
            if (repo) {
                repoInput.value = repo;
                gitHubForm.dispatchEvent(new Event('submit'));
            }
        }
    }

    // Executa ao carregar a página
    checkUrlParams();
});