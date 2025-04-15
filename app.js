document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const gitHubForm = document.getElementById('gitHubForm');
    const usernameInput = document.getElementById('usernameInput');
    const repoInput = document.getElementById('repoInput');
    const reposList = document.getElementById('reposList');
    const commitsList = document.getElementById('commitsList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorAlert = document.getElementById('errorAlert');
    const emptyState = document.getElementById('emptyState');

    if (!gitHubForm || !usernameInput || !repoInput || !reposList || !commitsList || !loadingIndicator || !resultsContainer || !emptyState) {
        console.error('Erro: Algum elemento importante não foi encontrado no DOM');
        return;
    }

    function showLoading(show = true) {
        loadingIndicator.classList.toggle('d-none', !show);
    }

    function showError(message) {
        errorAlert.classList.remove('d-none');
        errorAlert.textContent = message;
    }

    function hideError() {
        errorAlert.classList.add('d-none');
        errorAlert.textContent = '';
    }

    function toggleVisibility({ repos = false, commits = false, empty = false }) {
        reposList.classList.toggle('d-none', !repos);
        commitsList.classList.toggle('d-none', !commits);
        emptyState.classList.toggle('d-none', !empty);
    }

    gitHubForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const repo = repoInput.value.trim();

        if (!username) {
            alert('Por favor, insira um nome de usuário');
            return;
        }

        // Limpa e oculta tudo
        hideError();
        reposList.innerHTML = '';
        commitsList.innerHTML = '';
        toggleVisibility({ repos: false, commits: false, empty: false });
        showLoading(true);

        if (repo) {
            fetchCommits(username, repo);
        } else {
            fetchRepos(username);
        }
    });

    function fetchRepos(username) {
        fetch(`https://api.github.com/users/${username}/repos`)
            .then(handleResponse)
            .then(data => {
                if (data.length === 0) {
                    reposList.innerHTML = '<li class="list-group-item">Nenhum repositório encontrado</li>';
                    toggleVisibility({ repos: true });
                    return;
                }

                data.forEach(repo => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.innerHTML = `
                        <h5>${repo.name}</h5>
                        <p>${repo.description || 'Sem descrição'}</p>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-sm btn-outline-primary me-2">Ver no GitHub</a>
                        <button class="btn btn-sm btn-outline-secondary show-commits" data-repo="${repo.name}">Ver Commits</button>
                    `;
                    reposList.appendChild(li);
                });

                document.querySelectorAll('.show-commits').forEach(button => {
                    button.addEventListener('click', function() {
                        const repoName = this.getAttribute('data-repo');
                        repoInput.value = repoName;
                        fetchCommits(username, repoName);
                    });
                });

                toggleVisibility({ repos: true });
            })
            .catch(error => {
                showError(error.message);
                toggleVisibility({ empty: true });
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function fetchCommits(username, repo) {
        fetch(`https://api.github.com/repos/${username}/${repo}/commits`)
            .then(handleResponse)
            .then(data => {
                if (data.length === 0) {
                    commitsList.innerHTML = '<li class="list-group-item">Nenhum commit encontrado</li>';
                    toggleVisibility({ commits: true });
                    return;
                }

                commitsList.innerHTML = '';
                data.forEach(commit => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.innerHTML = `
                        <div class="d-flex align-items-center">
                            <img src="${commit.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" 
                                 alt="Avatar" 
                                 width="40" 
                                 height="40" 
                                 class="rounded-circle me-3">
                            <div>
                                <strong>${commit.commit.author.name}</strong>
                                <p class="mb-1">${commit.commit.message.split('\n')[0]}</p>
                                <small class="text-muted">${new Date(commit.commit.author.date).toLocaleString()}</small>
                                <small class="d-block mt-1">Hash: ${commit.sha.substring(0,7)}</small>
                            </div>
                        </div>
                        <a href="${commit.html_url}" target="_blank" class="stretched-link"></a>
                    `;
                    commitsList.appendChild(li);
                });

                toggleVisibility({ commits: true });
            })
            .catch(error => {
                showError(error.message);
                toggleVisibility({ empty: true });
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleResponse(response) {
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'Usuário ou repositório não encontrado' : 'Erro na requisição');
        }
        return response.json();
    }
});
