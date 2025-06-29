// Global Variables
let apiKey = '';
let currentChat = null;
let chatHistory = [];
let isGenerating = false;
let currentRound = 0;
let maxRounds = 5;

// Characters with their prompts
const characters = [
    {
        name: 'ביבי',
        icon: '🇮🇱',
        description: 'ראש ממשלת ישראל',
        prompt: 'כעת אתה מגלם את דמותו של בנימין נתניהו, ראש ממשלת ישראל. תפקידך הוא לשאול שאלות תמציתיות, בין 5 ל-20 מילים, המשקפות את סגנונו המוכר. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך לדעתך נבטיח את ביטחון ישראל?\', \'האם זו הדרך הנכונה לטפל בכלכלה?\''
    },
    {
        name: 'טראמפ',
        icon: '🇺🇸',
        description: 'נשיא ארצות הברית לשעבר',
        prompt: 'כעת אתה מגלם את דונלד טראמפ, נשיא ארצות הברית לשעבר. תפקידך הוא לשאול שאלות נוקבות, בין 5 ל-20 מילים, המבטאות את דעותיו החזקות. שאל כאילו אתה מראיין את ג\'מיני, וודא שאתה תמיד מסיים בסימן שאלה. לדוגמה: \'האם זו העסקה הטובה ביותר אי פעם?\', \'האם הם לא מבינים מה קורה באמת?\''
    },
    {
        name: 'ביידן',
        icon: '👴',
        description: 'נשיא ארצות הברית לשעבר',
        prompt: 'כעת אתה מגלם את ג\'ו ביידן, נשיא ארצות הברית לשעבר. תפקידך הוא לשאול שאלות, בין 5 ל-20 מילים, בסגנון מעט מבולבל או מהסס, ולעיתים תוך אזכור של חוסר זיכרון. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'אה... מה כבר אמרנו על זה מקודם?\', \'אני לא זוכר בדיוק, אבל האם זה באמת מה שקרה אז?\''
    },
    {
        name: 'גננת',
        icon: '👩‍🏫',
        description: 'עסוקה עם ילדים',
        prompt: 'כעת אתה מגלם גננת עסוקה מאוד. תפקידך הוא לשאול שאלות קצרות ופשוטות, בין 5 ל-20 מילים, כאילו את מדברת לילדים קטנים. שאל כאילו את פונה לג\'מיני, וודאי שאת תמיד מסיים בסימן שאלה. לדוגמה: \'ומי אמר לנו שצריך לסדר את הצעצועים?\', \'האם אתם שומעים מה שהגננת אומרת?\''
    },
    {
        name: 'מורה',
        icon: '📚',
        description: 'בבית ספר בנות יעקב',
        prompt: 'כעת אתה מגלם מורה לתלמידות כיתה ב\' בבית ספר בנות יעקב. תפקידך הוא לשאול שאלות מחנכות ומכוונות, בין 5 ל-20 מילים, תוך שימוש בשפה עדינה ומכבדת. שאל כאילו את מדברת לג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם חשבתן מספיק לפני שעניתן?\', \'איך נוכל ללמוד מזה לפעם הבאה?\''
    },
    {
        name: 'צ\'אלמר',
        icon: '🧔',
        description: 'יהודי מבוגר ממאה שערים',
        prompt: 'כעת אתה מגלם את צ\'אלמר, יהודי מבוגר ומנוסה ממאה שערים. תפקידך הוא לשאול שאלות שנונות ומעט מצחיקות, בין 5 ל-20 מילים, עם חוכמת חיים יהודית. שאל כאילו אתה מדבר לג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'נו, באמת, מי חשב על כזה דבר?\', \'מה, כבר שכחתם איך עשינו את זה פעם?\''
    },
    {
        name: 'שף מפורסם',
        icon: '👨‍🍳',
        description: 'מומחה קולינרי',
        prompt: 'כעת אתה מגלם שף מפורסם ומוכשר. תפקידך הוא לשאול שאלות קצרות ותמציתיות, בין 5 ל-20 מילים, המשקפות את עולמו הקולינרי. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך לדעתך השילוב הזה ישפיע על הטעם?\', \'האם זה באמת המרכיב הסודי שישנה הכל?\''
    },
    {
        name: 'חוקר פרטי',
        icon: '🕵️',
        description: 'מומחה לפתרון תעלומות',
        prompt: 'כעת אתה מגלם חוקר פרטי חד וחריף. תפקידך הוא לשאול שאלות חוקרות וממוקדות, בין 5 ל-20 מילים, שיסייעו לך לפענח תעלומות. שאל כאילו אתה מראיין את ג\'מיני, וודא שאתה תמיד מסיים בסימן שאלה. לדוגמה: \'מה הראיה החסרה בתיק הזה?\', \'האם יש עוד מידע שלא נחשף?\''
    },
    {
        name: 'סוכן נדל"ן',
        icon: '🏠',
        description: 'מומחה במכירת נכסים',
        prompt: 'כעת אתה מגלם סוכן מכירות נדל"ן נלהב ומשכנע. תפקידך הוא לשאול שאלות קצרות, בין 5 ל-20 מילים, שיגרמו לצד השני לחשוב על העתיד. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם זה באמת הבית שיגשים את החלום?\', \'אתם רואים את עצמכם גרים פה בשנים הקרובות?\''
    },
    {
        name: 'מאמן כושר',
        icon: '💪',
        description: 'מלא אנרגיה ומוטיבציה',
        prompt: 'כעת אתה מגלם מאמן כושר אנרגטי ומלא מוטיבציה. תפקידך הוא לשאול שאלות ממריצות ומכוונות לפעולה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נגיע למטרה הזו בדרך הכי טובה?\', \'האם אתה מוכן לתת הכל באימון הזה?\''
    },
    {
        name: 'פרופסור',
        icon: '🎓',
        description: 'אקדמאי מחקר',
        prompt: 'כעת אתה מגלם פרופסור באוניברסיטה, אינטלקטואל וחוקר. תפקידך הוא לשאול שאלות מעמיקות ומאתגרות, בין 5 ל-20 מילים, המעוררות מחשבה. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם השערה זו עומדת במבחן המציאות?\', \'מה המשמעות הפילוסופית של התגלית הזו?\''
    },
    {
        name: 'פקיד בנק עייף',
        icon: '🏦',
        description: 'בסוף יום עבודה ארוך',
        prompt: 'כעת אתה מגלם פקיד בנק עייף במיוחד בסוף יום העבודה. תפקידך הוא לשאול שאלות קצרות וחסרות סבלנות, בין 5 ל-20 מילים, עם גניחות קלות. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'ועכשיו מה, עוד טופס?\', \'האם באמת צריך את כל זה בשביל הדבר הקטן הזה?\''
    },
    {
        name: 'קונספירטור',
        icon: '🕵️‍♂️',
        description: 'רואה קשרים בכל דבר',
        prompt: 'כעת אתה מגלם קונספירטור נלהב שרואה קשרים בכל דבר. תפקידך הוא לשאול שאלות חשדניות ודרמטיות, בין 5 ל-20 מילים, עם רמזים לכך שהאמת נמצאת שם בחוץ. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם הם לא רוצים שנדע את האמת?\', \'מי באמת מושך בחוטים מאחורי הקלעים?\''
    },
    {
        name: 'פנסיונר גנן',
        icon: '🌱',
        description: 'מבלה כל היום בגינה',
        prompt: 'כעת אתה מגלם פנסיונר נחמד שמבלה את רוב היום בגינה שלו. תפקידך הוא לשאול שאלות פשוטות ותמימות, בין 5 ל-20 מילים, עם דגש על מזג האוויר והצמחים. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם הגשם באמת יגיע היום?\', \'האם הפרחים יפרחו כבר השבוע?\''
    },
    {
        name: 'פקח חניה',
        icon: '🚗',
        description: 'קפדן ונחוש',
        prompt: 'כעת אתה מגלם פקח חניה קפדן ונחוש. תפקידך הוא לשאול שאלות קצרות וסמכותיות, בין 5 ל-20 מילים, עם דגש על ציות לחוקים. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם הרכב הזה חנה כחוק?\', \'האם קראתם את השלט לפני שחניתם כאן?\''
    },
    {
        name: 'סבתא פולנייה',
        icon: '👵',
        description: 'דאגנית ואוהבת',
        prompt: 'כעת אתה מגלם סבתא פולנייה דאגנית, שלא מפסיקה לדאוג ולשאול. תפקידך הוא לשאול שאלות קצרות, בין 5 ל-20 מילים, עם נגיעה של דאגה ורצון לדאוג לכל. שאל כאילו את מראיינת את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'אכלת כבר משהו היום, חמוד?\', \'האם את בטוחה שאת לבושה מספיק חם?\''
    },
    {
        name: 'מהנדס תוכנה',
        icon: '💻',
        description: 'ציני ועייף',
        prompt: 'כעת אתה מגלם מהנדס תוכנה ציני ועייף, שראה כבר הכל. תפקידך הוא לשאול שאלות קצרות וקצת מרירות, בין 5 ל-20 מילים, עם רמזים לחוסר אמונה בשינויים. שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם הפעם זה באמת יעבוד?\', \'כמה באגים נמצא בזה הפעם?\''
    },
    {
        name: 'ילד בן 5',
        icon: '👶',
        description: 'סקרן במיוחד',
        prompt: 'כעת אתה מגלם ילד בן 5 סקרן במיוחד, ששואל "למה?" על כל דבר. תפקידך הוא לשאול שאלות קצרות ותמימות, בין 5 ל-20 מילים, שמתחילות בדרך כלל ב"למה". שאל כאילו אתה מראיין את ג\'מיני, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'למה השמיים כחולים?\', \'למה החתול עושה מיאו?\''
    }
];

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    apiSetup: document.getElementById('apiSetup'),
    mainApp: document.getElementById('mainApp'),
    apiForm: document.getElementById('apiForm'),
    apiKey: document.getElementById('apiKey'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    chatContainer: document.getElementById('chatContainer'),
    startChatBtn: document.getElementById('startChatBtn'),
    setupModal: document.getElementById('setupModal'),
    closeSetupModal: document.getElementById('closeSetupModal'),
    characterGrid: document.getElementById('characterGrid'),
    startCustomChat: document.getElementById('startCustomChat'),
    chatMessages: document.getElementById('chatMessages'),
    chatTitle: document.getElementById('chatTitle'),
    chatStatus: document.getElementById('chatStatus'),
    roundCounter: document.getElementById('roundCounter'),
    continueBtn: document.getElementById('continueBtn'),
    stopChatBtn: document.getElementById('stopChatBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    exportBtn: document.getElementById('exportBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    chatHistory: document.getElementById('chatHistory'),
    customTopic: document.getElementById('customTopic'),
    customStyle: document.getElementById('customStyle'),
    questionInstructions: document.getElementById('questionInstructions'),
    answerInstructions: document.getElementById('answerInstructions')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        elements.loading.classList.add('hidden');
        init();
    }, 1000);
});

function init() {
    // Check if API key exists
    apiKey = localStorage.getItem('geminiApiKey');
    
    if (apiKey) {
        showMainApp();
    } else {
        showApiSetup();
    }
    
    // Load chat history
    loadChatHistory();
    setupEventListeners();
    setupCharacterGrid();
    setupTabs();
}

function showApiSetup() {
    elements.apiSetup.classList.remove('hidden');
    elements.mainApp.classList.add('hidden');
}

function showMainApp() {
    elements.apiSetup.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    elements.welcomeScreen.classList.remove('hidden');
    elements.chatContainer.classList.add('hidden');
}

function setupEventListeners() {
    // API Form
    elements.apiForm.addEventListener('submit', handleApiSubmit);
    elements.toggleApiKey.addEventListener('click', togglePasswordVisibility);
    
    // Main App Events
    elements.startChatBtn.addEventListener('click', showSetupModal);
    elements.newChatBtn.addEventListener('click', showSetupModal);
    elements.exportBtn.addEventListener('click', exportCurrentChat);
    elements.settingsBtn.addEventListener('click', showSettingsModal);
    
    // Modal Events
    elements.closeSetupModal.addEventListener('click', hideSetupModal);
    elements.closeSettingsModal.addEventListener('click', hideSettingsModal);
    elements.startCustomChat.addEventListener('click', startCustomChat);
    
    // Chat Events
    elements.continueBtn.addEventListener('click', continueChat);
    elements.stopChatBtn.addEventListener('click', stopChat);
    elements.pauseBtn.addEventListener('click', togglePause);
    
    // Click outside modal to close
    elements.setupModal.addEventListener('click', (e) => {
        if (e.target === elements.setupModal) hideSetupModal();
    });
    
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) hideSettingsModal();
    });
}

function setupCharacterGrid() {
    elements.characterGrid.innerHTML = '';
    
    characters.forEach((character, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterIndex = index;
        
        card.innerHTML = `
            <div class="character-icon">${character.icon}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-desc">${character.description}</div>
        `;
        
        card.addEventListener('click', () => selectCharacter(index));
        elements.characterGrid.appendChild(card);
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

function handleApiSubmit(e) {
    e.preventDefault();
    const key = elements.apiKey.value.trim();
    
    if (key) {
        // Save API key
        localStorage.setItem('geminiApiKey', key);
        apiKey = key;
        showMainApp();
    }
}

function togglePasswordVisibility() {
    const input = elements.apiKey;
    const icon = elements.toggleApiKey.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function showSetupModal() {
    elements.setupModal.classList.remove('hidden');
}

function hideSetupModal() {
    elements.setupModal.classList.add('hidden');
}

function showSettingsModal() {
    elements.settingsModal.classList.remove('hidden');
}

function hideSettingsModal() {
    elements.settingsModal.classList.add('hidden');
}

function selectCharacter(index) {
    // Remove previous selection
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new character
    const card = document.querySelector(`[data-character-index="${index}"]`);
    card.classList.add('selected');
}

function startCustomChat() {
    const selectedCard = document.querySelector('.character-card.selected');
    let chatConfig = {};
    
    if (selectedCard) {
        // Character-based chat
        const characterIndex = parseInt(selectedCard.dataset.characterIndex);
        const character = characters[characterIndex];
        
        chatConfig = {
            type: 'character',
            character: character,
            questionInstructions: elements.questionInstructions.value || character.prompt,
            answerInstructions: elements.answerInstructions.value || 'ענה על השאלה בצורה מפורטת ועניינית.'
        };
    } else {
        // Custom chat
        const topic = elements.customTopic.value.trim();
        const style = elements.customStyle.value.trim();
        
        if (!topic) {
            alert('אנא הכנס נושא לשיחה');
            return;
        }
        
        chatConfig = {
            type: 'custom',
            topic: topic,
            style: style || 'שיחה כללית',
            questionInstructions: elements.questionInstructions.value || `שאל שאלה על ${topic} בסגנון ${style}`,
            answerInstructions: elements.answerInstructions.value || 'ענה על השאלה בצורה מפורטת ועניינית.'
        };
    }
    
    startChat(chatConfig);
    hideSetupModal();
}

function startChat(config) {
    currentChat = {
        id: Date.now(),
        config: config,
        messages: [],
        startTime: new Date(),
        isActive: true
    };
    
    currentRound = 0;
    maxRounds = 5;
    isGenerating = false;
    
    // Update UI
    elements.welcomeScreen.classList.add('hidden');
    elements.chatContainer.classList.remove('hidden');
    elements.chatMessages.innerHTML = '';
    elements.continueBtn.classList.add('hidden');
    
    // Set chat title
    const title = config.type === 'character' ? 
        `צ'אט עם ${config.character.name}` : 
        `צ'אט על ${config.topic}`;
    elements.chatTitle.textContent = title;
    
    // Start conversation
    generateNextRound();
}

async function generateNextRound() {
    if (currentRound >= maxRounds || !currentChat || !currentChat.isActive) {
        if (currentRound >= maxRounds) {
            elements.continueBtn.classList.remove('hidden');
        }
        updateChatStatus('הושלם');
        return;
    }
    
    currentRound++;
    updateRoundCounter();
    updateChatStatus('מייצר שאלה...');
    
    try {
        // Generate question
        const question = await generateQuestion();
        if (!question) return;
        
        addMessage(question, 'question');
        updateChatStatus('מייצר תשובה...');
        
        // Generate answer
        const answer = await generateAnswer(question);
        if (!answer) return;
        
        addMessage(answer, 'answer');
        
        // Continue to next round after delay
        if (currentChat.isActive) {
            setTimeout(() => {
                generateNextRound();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error generating conversation:', error);
        updateChatStatus('שגיאה בייצור השיחה');
        alert('שגיאה בחיבור לג\'מיני. אנא בדוק את מפתח ה-API. פרטים נוספים בקונסול.');
    }
}

async function generateQuestion() {
    const config = currentChat.config;
    let prompt = '';
    
    if (config.type === 'character') {
        // --- שינוי כאן: הנחיה ממוקדת יותר לשאלה בודדת מהדמות ---
        prompt = `כעת אתה מגלם את דמותו של ${config.character.name} (${config.character.description}). עליך לשאול שאלה אחת בלבד, בין 5 ל-20 מילים, המשקפת את סגנון הדמות. אל תפנה את השאלה ישירות ל"ג\'מיני" או אל תכלול את המילה "ג\'מיני" בשאלה. השאלה צריכה להישאל כאילו אתה מראיין את הצד השני (אתה, המודל), ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה, אם אתה ביבי, שאל: 'איך לדעתי נבטיח את ביטחון ישראל?' או 'האם זו הדרך הנכונה לטפל בכלכלה לדעתי?'. השאלה צריכה להיות ייחודית ולא לחזור על שאלות קודמות.`;
        // --- סוף שינוי ---
    } else {
        // --- שינוי כאן: הנחיה ממוקדת יותר לשאלה בודדת מותאמת אישית ---
        prompt = `שאל שאלה אחת בלבד, בין 5 ל-20 מילים, על ${config.topic} בסגנון ${config.style}. אל תפנה את השאלה ישירות ל"ג\'מיני" או אל תכלול את המילה "ג\'מיני" בשאלה. השאלה צריכה להיות ייחודית ולא לחזור על שאלות קודמות, ותמיד להסתיים בסימן שאלה.`;
        // --- סוף שינוי ---
    }
    
    // הוספת היסטוריית השיחה לפרומפט כדי למנוע חזרה על שאלות (חשוב!)
    if (currentChat && currentChat.messages.length > 0) {
        const previousQuestions = currentChat.messages
            .filter(msg => msg.type === 'question')
            .map(msg => msg.content);
        if (previousQuestions.length > 0) {
            prompt += ` שאלות קודמות: ${previousQuestions.join('; ')}. ודא שהשאלה הנוכחית שונה לחלוטין מהן.`;
        }
    }

    return await callGeminiAPI(prompt);
}

async function generateAnswer(question) {
    const config = currentChat.config;
    // --- שינוי כאן: הוספת הקונטקסט של הדמות לתשובה כדי לשפר רלוונטיות ---
    let fullPrompt = `אתה ג\'מיני. ענה על השאלה הבאה מנקודת מבט אובייקטיבית, מפורטת ועניינית. הקפד להתייחס לשאלה הספציפית שנשאלה, ולא לשאול שאלות בחזרה. השאלה שנשאלה: "${question}"`;
    if (config.type === 'character') {
        fullPrompt = `אתה ג\'מיני. הדמות המראיינת היא ${config.character.name} (${config.character.description}). ענה על השאלה הבאה מנקודת מבט אובייקטיבית, מפורטת ועניינית. הקפד להתייחס לשאלה הספציפית שנשאלה על ידי הדמות, ולא לשאול שאלות בחזרה. השאלה שנשאלה: "${question}"`;
    }
    // --- סוף שינוי ---
    return await callGeminiAPI(fullPrompt);
}

async function callGeminiAPI(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, { // שינוי ל-gemini-1.5-flash
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            safetySettings: [ // הוספת הגדרות בטיחות
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                },
            ]
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error ? errorData.error.message : 'Unknown error'}`);
    }
    
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected response from Gemini API: Missing content.');
    }
    return data.candidates[0].content.parts[0].text;
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const headerText = type === 'question' ? 'שאלה' : 'תשובה';
    const icon = type === 'question' ? '❓' : '💬';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span>${icon}</span>
            <span>${headerText}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    // Save to current chat
    if (currentChat) {
        currentChat.messages.push({
            type: type,
            content: content,
            timestamp: new Date()
        });
        
        // Save to localStorage
        saveChatHistory();
    }
}

function updateRoundCounter() {
    elements.roundCounter.textContent = `סיבוב ${currentRound}/${maxRounds}`;
}

function updateChatStatus(status) {
    elements.chatStatus.textContent = status;
}

function continueChat() {
    currentRound = 0; // לאפס את הסבב כדי להתחיל מחזור חדש של 5 שאלות
    maxRounds = 5;
    elements.continueBtn.classList.add('hidden');
    updateChatStatus('ממשיך...');
    
    setTimeout(() => {
        generateNextRound();
    }, 1000);
}

function stopChat() {
    if (currentChat) {
        currentChat.isActive = false;
        updateChatStatus('נעצר');
    }
}

function togglePause() {
    if (currentChat) {
        currentChat.isActive = !currentChat.isActive;
        const icon = elements.pauseBtn.querySelector('i');
        
        if (currentChat.isActive) {
            icon.className = 'fas fa-pause';
            updateChatStatus('פעיל');
            generateNextRound();
        } else {
            icon.className = 'fas fa-play';
            updateChatStatus('מושעה');
        }
    }
}

function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        updateChatHistoryUI();
    }
}

function saveChatHistory() {
    if (currentChat) {
        // Update existing chat or add new one
        const existingIndex = chatHistory.findIndex(chat => chat.id === currentChat.id);
        
        if (existingIndex >= 0) {
            chatHistory[existingIndex] = { ...currentChat };
        } else {
            chatHistory.unshift({ ...currentChat });
        }
        
        // Keep only last 20 chats
        chatHistory = chatHistory.slice(0, 20);
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        updateChatHistoryUI();
    }
}

function updateChatHistoryUI() {
    elements.chatHistory.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        if (currentChat && chat.id === currentChat.id) {
            item.classList.add('active');
        }
        
        const title = chat.config.type === 'character' ? 
            `צ'אט עם ${chat.config.character.name}` : 
            `צ'אט על ${chat.config.topic}`;
            
        const date = new Date(chat.startTime).toLocaleDateString('he-IL');
        
        item.innerHTML = `
            <div class="chat-history-title">${title}</div>
            <div class="chat-history-date">${date}</div>
        `;
        
        item.addEventListener('click', () => loadChat(chat));
        elements.chatHistory.appendChild(item);
    });
}

function loadChat(chat) {
    currentChat = { ...chat };
    
    // Update UI
    elements.welcomeScreen.classList.add('hidden');
    elements.chatContainer.classList.remove('hidden');
    elements.chatMessages.innerHTML = '';
    
    const title = chat.config.type === 'character' ? 
        `צ'אט עם ${chat.config.character.name}` : 
        `צ'אט על ${chat.config.topic}`;
    elements.chatTitle.textContent = title;
    
    // Load messages
    chat.messages.forEach(message => {
        addMessageToUI(message.content, message.type);
    });
    
    // Update status
    updateChatStatus(chat.isActive ? 'טוען...' : 'הושלם');
    currentRound = Math.floor(chat.messages.length / 2);
    updateRoundCounter();
    
    updateChatHistoryUI();
}

function addMessageToUI(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const headerText = type === 'question' ? 'שאלה' : 'תשובה';
    const icon = type === 'question' ? '❓' : '💬';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span>${icon}</span>
            <span>${headerText}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function exportCurrentChat() {
    if (!currentChat || !currentChat.messages.length) {
        alert('אין צ\'אט פעיל לייצוא');
        return;
    }
    
    const title = currentChat.config.type === 'character' ? 
        `צ'אט עם ${currentChat.config.character.name}` : 
        `צ'אט על ${currentChat.config.topic}`;
        
    let exportText = `${title}\n`;
    exportText += `תאריך: ${new Date(currentChat.startTime).toLocaleString('he-IL')}\n`;
    exportText += `${'='.repeat(50)}\n\n`;
    
    currentChat.messages.forEach((message, index) => {
        const type = message.type === 'question' ? 'שאלה' : 'תשובה';
        exportText += `${type} ${Math.floor(index / 2) + 1}:\n`;
        exportText += `${message.content}\n\n`;
    });
    
    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Settings functions
document.getElementById('saveSettings').addEventListener('click', () => {
    const newApiKey = document.getElementById('newApiKey').value.trim();
    
    if (newApiKey) {
        localStorage.setItem('geminiApiKey', newApiKey);
        apiKey = newApiKey;
        alert('מפתח API עודכן בהצלחה');
    }
    
    hideSettingsModal();
});

document.getElementById('clearHistory').addEventListener('click', () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
        localStorage.removeItem('chatHistory');
        chatHistory = [];
        updateChatHistoryUI();
        alert('ההיסטוריה נמחקה');
    }
});

document.getElementById('toggleNewApiKey').addEventListener('click', () => {
    const input = document.getElementById('newApiKey');
    const icon = document.getElementById('toggleNewApiKey').querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
});
