document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatForm = document.getElementById('chat-form');
    let isWaitingForResponse = false;
    
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    // Chat functionality
    document.addEventListener('DOMContentLoaded', function() {
        const chatForm = document.getElementById('chat-form');
        const userInput = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        
        // Add initial bot message
        addBotMessage('Welcome! How can I help you today?');
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userMessage = userInput.value.trim();
            if (!userMessage) return;
            
            // Add user message to chat
            addUserMessage(userMessage);
            userInput.value = '';
            
            // Send message to server
            sendMessage(userMessage);
        });
        
        function addUserMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message user-message';
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function addBotMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message bot-message';
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function sendMessage(userMessage) {
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot-message typing';
            typingIndicator.textContent = '...';
            chatMessages.appendChild(typingIndicator);
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add bot response
                addBotMessage(data.text);
            })
            .catch(error => {
                console.error('Error:', error);
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add error message
                addBotMessage('Sorry, I encountered an error. Please try again.');
            });
        }
    });
    function sendMessage() {
        const message = userInput.value.trim();
        if (message && !isWaitingForResponse) {
            addMessage(message, true);
            userInput.value = '';
            isWaitingForResponse = true;
            addTypingIndicator();
            
            fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: message })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                removeTypingIndicator();
                isWaitingForResponse = false;
                addMessage(data.text || 'Sorry, I couldn\'t process that request.', false);
            })
            .catch(error => {
                console.error('Error:', error);
                removeTypingIndicator();
                isWaitingForResponse = false;
                addMessage('Sorry, there was an error processing your request.', false);
            });
        }
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Handle form submission if form exists
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Focus on input field when page loads
    userInput.focus();
    
    // Add some initial messages for better UX
    setTimeout(() => {
        addMessage('Hi there! I\'m your customer support assistant. How can I help you today?', false);
    }, 500);
});