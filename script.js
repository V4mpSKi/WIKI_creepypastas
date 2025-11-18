// Array para armazenar os posts (em produção, isso viria de um servidor)
let posts = [];
 
// Carregar posts salvos do localStorage
function loadPosts() {
    const savedPosts = localStorage.getItem('forumPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
        renderPosts();
    }
}
 
// Salvar posts no localStorage
function savePosts() {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
}
 
// Criar novo post
function createPost(title, content, author) {
    const post = {
        id: Date.now(),
        title: title,
        content: content,
        author: author || 'Anônimo',
        date: new Date().toLocaleString('pt-BR'),
        comments: []
    };
    
    posts.unshift(post); // Adiciona no início do array
    savePosts();
    renderPosts();
}
 
// Adicionar comentário a um post
function addComment(postId, content, author) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        const comment = {
            id: Date.now(),
            content: content,
            author: author || 'Anônimo',
            date: new Date().toLocaleString('pt-BR')
        };
        post.comments.push(comment);
        savePosts();
        renderPosts();
    }
}
 
// Renderizar todos os posts
function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="post" style="text-align: center; padding: 40px;">
                <p style="color: #990000; font-size: 1.2em;">
                    Nenhuma discussão ainda. Seja o primeiro a compartilhar uma lenda!
                </p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}
 
// Criar elemento HTML para um post
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;
    
    const commentsHTML = post.comments.map(comment => `
        <div class="comment">
            <div class="comment-author">${escapeHtml(comment.author)}</div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-date">${comment.date}</div>
        </div>
    `).join('');
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-author">Por: ${escapeHtml(post.author)}</div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-footer">
            <div class="post-date">${post.date}</div>
            <button class="show-comments-btn" onclick="toggleComments(${post.id})">
                ${post.comments.length > 0 ? `${post.comments.length} comentário(s)` : 'Comentar'}
            </button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <form class="comment-form" onsubmit="handleCommentSubmit(event, ${post.id})">
                <input type="text" placeholder="Seu nome (opcional)" class="comment-author-input">
                <textarea placeholder="Escreva seu comentário..." required class="comment-content-input"></textarea>
                <button type="submit">Enviar Comentário</button>
            </form>
            <div class="comments-list">
                ${commentsHTML}
            </div>
        </div>
    `;
    
    return postDiv;
}
 
// Alternar visibilidade dos comentários
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        const isVisible = commentsSection.style.display !== 'none';
        commentsSection.style.display = isVisible ? 'none' : 'block';
        
        // Scroll suave para a seção de comentários
        if (!isVisible) {
            setTimeout(() => {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
}
 
// Manipular envio de comentário
function handleCommentSubmit(event, postId) {
    event.preventDefault();
    const form = event.target;
    const authorInput = form.querySelector('.comment-author-input');
    const contentInput = form.querySelector('.comment-content-input');
    
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();
    
    if (content) {
        addComment(postId, content, author);
        // Limpar formulário
        authorInput.value = '';
        contentInput.value = '';
        // Manter seção de comentários aberta
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
            commentsSection.style.display = 'block';
        }
    }
}
 
// Manipular envio de novo post
function handlePostSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('#postTitle').value.trim();
    const content = form.querySelector('#postContent').value.trim();
    const author = form.querySelector('#postAuthor').value.trim();
    
    if (title && content) {
        createPost(title, content, author);
        // Limpar formulário
        form.reset();
        // Scroll para o topo para ver o novo post
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
 
// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
 
// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Carregar posts salvos
    loadPosts();
    
    // Adicionar event listener ao formulário de post
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }
    
    // Adicionar alguns posts de exemplo se não houver nenhum
    if (posts.length === 0) {
        createPost(
            'Bem-vindo ao Fórum de Lendas',
            'Este é um espaço para discutir os sites mais misteriosos e lendários da internet. Compartilhe suas experiências, teorias e histórias sobre lugares digitais que desafiam a compreensão.',
            'Ronny'
        );
    }
});
 
// Tornar funções globais para uso em onclick
window.toggleComments = toggleComments;
window.handleCommentSubmit = handleCommentSubmit;