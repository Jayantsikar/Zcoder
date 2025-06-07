// ==============================================
// MAIN APPLICATION SCRIPT
// Handles all the interactive functionality
// ==============================================

// Global variables
let currentQuestionKey = '';
let testResults = [];

// Initialize Socket.IO client
const socket = io('http://localhost:4002', {
  transports: ['websocket']
});


// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('code-editor').addEventListener('input', function() {
        // Enable run button when there's code in the editor
        document.getElementById('run-button').disabled = this.value.trim() === '';
    });
    
    // Check for URL parameter to load specific question
    const urlParams = new URLSearchParams(window.location.search);
    const questionParam = urlParams.get('question');
    
    if (questionParam && getQuestion(questionParam)) {
        // Load question from URL parameter
        document.getElementById('question-select').value = questionParam;
        loadQuestion();
    } else if (getAllQuestionKeys().length > 0) {
        // Load first question by default if no parameter
        document.getElementById('question-select').value = getAllQuestionKeys()[0];
        loadQuestion();
    }

    // Load previous comments
    loadPreviousComments();
    // Set up comment button click handler
    document.getElementById('post-comment-btn').addEventListener('click', addComment);
    // Allow pressing Enter to submit comment
    document.getElementById('new-comment').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addComment();
        }
    });
});


// Generate HTML for test cases
function generateTestCasesHTML(testCases) {
    return testCases.map((testCase, index) => `
        <div class="test-case">
            <div class="test-case-title">Test Case ${index + 1}</div>
            <div class="test-case-content">
                <div class="test-case-input">
                    <div class="test-case-label">Input</div>
                    <pre class="test-case-pre">${testCase.input}</pre>
                </div>
                <div class="test-case-output">
                    <div class="test-case-label">Expected Output</div>
                    <pre class="test-case-pre">${testCase.output}</pre>
                </div>
            </div>
            ${testResults[index] ? generateTestCaseResultHTML(testResults[index]) : ''}
        </div>
    `).join('');
}

// Generate HTML for test case result
function generateTestCaseResultHTML(result) {
    const statusClass = result.passed ? 'test-case-pass' : 'test-case-fail';
    const statusText = result.passed ? 'Passed' : 'Failed';
    const icon = result.passed ? '✓' : '✗';
    
    return `
        <div class="test-case-result ${statusClass}">
            <div class="test-case-status">
                <span class="test-case-icon">${icon}</span>
                <span>${statusText}</span>
            </div>
            ${!result.passed ? `<pre class="test-case-pre">${result.actualOutput}</pre>` : ''}
        </div>
    `;
}

// Run the code (simulated - in a real app, this would call a compiler API)
function runCode() {
    const code = document.getElementById('code-editor').value;
    const question = getQuestion(currentQuestionKey);
    
    if (!question) {
        document.getElementById('output-content').textContent = 'Error: No question selected';
        return;
    }
    
    // Show loading spinner
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'inline-block';
    document.getElementById('run-button').disabled = true;
    
    // Simulate compilation delay
    setTimeout(() => {
        try {
            // In a real implementation, this would call an actual compiler API
            // For this demo, we'll simulate test case execution
            testResults = simulateTestCases(code, question.testCases);
            
            // Update test case displays with results
            document.getElementById('test-cases-container').innerHTML = 
                generateTestCasesHTML(question.testCases);
            
            // Show output
            const outputContent = document.getElementById('output-content');
            outputContent.textContent = 'Compilation successful. Running test cases...\n\n';
            
            testResults.forEach((result, index) => {
                outputContent.textContent += `Test Case ${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
                if (!result.passed) {
                    outputContent.textContent += `Expected: ${question.testCases[index].output}\n`;
                    outputContent.textContent += `Actual: ${result.actualOutput}\n`;
                }
                outputContent.textContent += '\n';
            });
            
            const passedCount = testResults.filter(r => r.passed).length;
            outputContent.textContent += `\n${passedCount} out of ${testResults.length} test cases passed.`;
            
        } catch (error) {
            document.getElementById('output-content').textContent = `Error: ${error.message}`;
        } finally {
            // Hide loading spinner
            spinner.style.display = 'none';
            document.getElementById('run-button').disabled = false;
        }
    }, 1500);
}

// Simulate test case execution (for demo purposes)
function simulateTestCases(code, testCases) {
    // In a real implementation, this would actually compile and run the code
    // For this demo, we'll simulate some results based on simple checks
    
    const results = [];
    
    // Check if the code contains the basic structure we expect
    const hasFunction = code.includes('void fizzBuzz') || 
                       code.includes('int factorial') || 
                       code.includes('bool isPalindrome') || 
                       code.includes('void fibonacci');
    
    if (!hasFunction) {
        // If the basic function structure is missing, all tests fail
        testCases.forEach(testCase => {
            results.push({
                passed: false,
                actualOutput: 'Function not implemented correctly'
            });
        });
        return results;
    }
    
    // Simulate test case results with some randomness for demo purposes
    testCases.forEach((testCase, index) => {
        // 80% chance of passing if the function exists
        const passed = Math.random() < 0.8;
        
        if (passed) {
            results.push({
                passed: true,
                actualOutput: testCase.output
            });
        } else {
            // For failed cases, modify the expected output slightly
            const modifiedOutput = testCase.output.split('\n').map(line => {
                if (Math.random() < 0.5) return line;
                return line + 'x'; // Add an error
            }).join('\n');
            
            results.push({
                passed: false,
                actualOutput: modifiedOutput
            });
        }
    });
    
    return results;
}

// Toggle comments overlay visibility
function toggleComments() {
    const container = document.getElementById('main-container');
    container.classList.toggle('comments-visible');
}

// Load comments for the current question
function loadComments() {
    if (!currentQuestionKey) return;
    
    const question = getQuestion(currentQuestionKey);
    const commentsContainer = document.getElementById('comments-container');
    
    if (question.comments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsContainer.innerHTML = question.comments.map(comment => `
        <div class="comment">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-date">${comment.date}</div>
        </div>
    `).join('');
}

async function addComment() {
    const commentInput = document.getElementById('new-comment');
    const commentText = commentInput.value.trim();
    if (!commentText || !currentQuestionKey) return;

    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to comment');

    try {
        // Send comment via HTTP instead of socket
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: currentQuestionKey,
                text: commentText
            })
        });

        if (!response.ok) throw new Error('Failed to post comment');
        
        const newComment = await response.json();
        addCommentToUI(newComment);
        commentInput.value = '';
        
    } catch (error) {
        console.error('Comment error:', error);
        alert('Failed to post comment');
    }
}


function addCommentToUI(comment) {
    const commentsContainer = document.getElementById('comments-container');
    
    // If container has "no comments" message, clear it first
    if (commentsContainer.innerHTML.includes('No comments yet')) {
        commentsContainer.innerHTML = '';
    }

    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <div class="comment-author">${comment.username}</div>
        <div class="comment-text">${comment.text}</div>
        <div class="comment-date">${new Date(comment.createdAt).toLocaleString()}</div>
    `;
    
    // Add to top of comments (newest first)
    commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
    
    // Scroll to show new comment if it's a newly added one (not during initial load)
    if (commentsContainer.children.length === 1) {
        commentElement.scrollIntoView({ behavior: 'smooth' });
    }
}
// Load previous comments from server
async function loadPreviousComments() {
    if (!currentQuestionKey) {
        console.log('No question selected, skipping comments load');
        return;
    }

    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '<p>Loading comments...</p>';

    try {
        const response = await fetch(`/api/comments?questionId=${currentQuestionKey}`);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const comments = await response.json();
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }
        
        // Clear loading message
        commentsContainer.innerHTML = '';
        
        // Add comments in reverse chronological order (newest first)
        comments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(comment => {
                addCommentToUI(comment);
            });
            
    } catch (error) {
        console.error('Failed to load comments:', error);
        commentsContainer.innerHTML = `<p>Error loading comments: ${error.message}</p>`;
    }
}

// Handle new comment submission
async function postComment() {
    const commentInput = document.getElementById('new-comment');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please write something before posting');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to comment');
        window.location.href = '/login.html';
        return;
    }

    try {
        // Send to server
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: currentQuestionKey,
                text: commentText
            })
        });

        if (!response.ok) throw new Error('Failed to post comment');
        
        const newComment = await response.json();
        addCommentToUI(newComment);
        commentInput.value = '';
        
    } catch (error) {
        console.error('Error posting comment:', error);
        alert(error.message);
    }
}



// Bookmark management functions
async function toggleBookmark() {
    if (!currentQuestionKey) return;
    
    const question = getQuestion(currentQuestionKey);
    const isCurrentlyBookmarked = await checkBookmarkStatus();
    
    try {
        if (isCurrentlyBookmarked) {
            await removeBookmark();
        } else {
            await addBookmark();
        }
        updateBookmarkButton();
    } catch (error) {
        console.error('Full error:', error);
        console.log('Response status:', error.response?.status);
        console.log('Response data:', error.response?.data);
        alert(`Failed: ${error.response?.data?.error || error.message}`);
    }
}

async function checkBookmarkStatus() {
    if (!currentQuestionKey) return false;
    
    try {
        const response = await fetch(`/api/bookmarks/${currentQuestionKey}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        return data.isBookmarked;
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
    }
}

async function addBookmark() {
    const question = getQuestion(currentQuestionKey);
        if (!question) throw new Error('Question not found');
        
        const token = localStorage.getItem('token');
        console.log('Token:', token); 
        if (!token) {
            alert('Please log in to bookmark questions');
            window.location.href = '/login.html'; // Redirect to login
            return;
        }
        console.log('Sending bookmark data:', {
            questionId: currentQuestionKey,
            title: question.title,
            difficulty: question.difficulty,
            tags: question.tags
        });
    try {
        

        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: currentQuestionKey,
                title: question.title,
                difficulty: question.difficulty || 'Medium',
                tags: question.tags || []
            })
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json(); // Try to parse JSON
            } catch (e) {
                // If response isn't JSON, use status text
                errorData = { error: response.statusText };
            }
            console.error('Bookmark error:', {
                status: response.status,
                errorData
            });
            throw new Error(errorData.error || 'Failed to add bookmark');
        }

        return await response.json();
    } catch (error) {
        console.error('Full error details:', error);
        throw error; // Re-throw to be caught by the calling function
    }
    
}

async function removeBookmark() {
    const response = await fetch(`/api/bookmarks/${currentQuestionKey}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to remove bookmark');
    }
}

function updateBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) return;
    
    checkBookmarkStatus().then(isBookmarked => {
        if (isBookmarked) {
            bookmarkBtn.innerHTML = '★';
            bookmarkBtn.style.color = '#fbbf24';
            bookmarkBtn.title = 'Remove bookmark';
        } else {
            bookmarkBtn.innerHTML = '☆';
            bookmarkBtn.style.color = '#6b7280';
            bookmarkBtn.title = 'Add bookmark';
        }
    });
}


function loadQuestion() {
    const select = document.getElementById('question-select');
    const questionKey = select.value;
    
    if (!questionKey) {
        // No question selected
        document.getElementById('question-content').innerHTML = `
            <h2>Welcome to ZCoder</h2>
            <p>Please select a question from the dropdown above to get started.</p>
        `;
        document.getElementById('code-editor').value = '';
        document.getElementById('run-button').disabled = true;
        currentQuestionKey = '';
        return;
    }
    
    currentQuestionKey = questionKey;
    const question = getQuestion(questionKey);
    
    // Update URL without reloading the page
    history.pushState(null, null, `?question=${questionKey}`);
    
    // Update question content panel
    document.getElementById('question-content').innerHTML = `
        <h2>${question.title}</h2>
        <div class="question-description">
            ${question.description}
            ${question.example}
        </div>
        <h3>Test Cases</h3>
        <div id="test-cases-container">
            ${generateTestCasesHTML(question.testCases)}
        </div>
    `;
    
    // Update code editor with starter code
    document.getElementById('code-editor').value = question.starterCode;
    document.getElementById('run-button').disabled = false;
    
    // Clear previous output and test results
    document.getElementById('output-content').textContent = '';
    testResults = [];
    
    // Load comments
    loadPreviousComments();
    updateBookmarkButton();

    // Join this question's room
    socket.emit('join-question', currentQuestionKey);
    
    // Listen for new comments
    socket.on('comment-added', (comment) => {
        if (comment.questionId === currentQuestionKey) {
        addCommentToUI(comment);
        }
    });
}