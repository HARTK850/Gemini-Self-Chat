// ==========================================
// Gemini Self-Chat - Main Script
// ==========================================

const API_KEY_STORAGE_KEY = 'geminiApiKey';
const CHAT_HISTORY_STORAGE_KEY = 'geminiChatHistory';
const SETTINGS_STORAGE_KEY = 'geminiSettings';

// ==========================================
// DOM Elements
// ==========================================
const elements = {
    loading: document.getElementById('loading'),
    apiSetup: document.getElementById('apiSetup'),
    apiKeyInput: document.getElementById('apiKey'),
    apiForm: document.getElementById('apiForm'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    mainApp: document.getElementById('mainApp'),
    newChatBtn: document.getElementById('newChatBtn'),
    exportBtn: document.getElementById('exportBtn'),
    podcastBtn: document.getElementById('podcastBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    chatHistoryDiv: document.getElementById('chatHistory'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    startChatBtn: document.getElementById('startChatBtn'),
    chatContainer: document.getElementById('chatContainer'),
    chatTitle: document.getElementById('chatTitle'),
    chatStatus: document.getElementById('chatStatus'),
    roundCounter: document.getElementById('roundCounter'),
    pauseBtn: document.getElementById('pauseBtn'),
    chatMessages: document.getElementById('chatMessages'),
    continueBtn: document.getElementById('continueBtn'),
    stopChatBtn: document.getElementById('stopChatBtn'),
    // Setup Modal
    setupModal: document.getElementById('setupModal'),
    closeSetupModal: document.getElementById('closeSetupModal'),
    setupTabs: document.querySelector('.setup-tabs'),
    characterTab: document.getElementById('characterTab'),
    customTab: document.getElementById('customTab'),
    advancedTab: document.getElementById('advancedTab'),
    characterGrid: document.getElementById('characterGrid'),
    customTopicInput: document.getElementById('customTopic'),
    customTopicCustomInput: document.getElementById('customTopicCustom'),
    customStyleInput: document.getElementById('customStyle'),
    questionInstructions: document.getElementById('questionInstructions'),
    answerInstructions: document.getElementById('answerInstructions'),
    startCustomChatBtn: document.getElementById('startCustomChat'),
    // Model Selection
    questionModel: document.getElementById('questionModel'),
    answerModel: document.getElementById('answerModel'),
    customQuestionModel: document.getElementById('customQuestionModel'),
    customAnswerModel: document.getElementById('customAnswerModel'),
    // Rounds Settings
    unlimitedRounds: document.getElementById('unlimitedRounds'),
    roundsLimitSection: document.getElementById('roundsLimitSection'),
    roundsCount: document.getElementById('roundsCount'),
    decreaseRounds: document.getElementById('decreaseRounds'),
    increaseRounds: document.getElementById('increaseRounds'),
    tokenEstimate: document.getElementById('tokenEstimate'),
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    newApiKeyInput: document.getElementById('newApiKey'),
    toggleNewApiKey: document.getElementById('toggleNewApiKey'),
    defaultModel: document.getElementById('defaultModel'),
    clearHistoryBtn: document.getElementById('clearHistory'),
    saveSettingsBtn: document.getElementById('saveSettings'),
    // Podcast Modal
    podcastModal: document.getElementById('podcastModal'),
    closePodcastModal: document.getElementById('closePodcastModal'),
    podcastScriptPreview: document.getElementById('podcastScriptPreview'),
    podcastScript: document.getElementById('podcastScript'),
    generateScriptBtn: document.getElementById('generateScriptBtn'),
    editScriptBtn: document.getElementById('editScriptBtn'),
    podcastStatus: document.getElementById('podcastStatus'),
    podcastProgressFill: document.getElementById('podcastProgressFill'),
    podcastStatusText: document.getElementById('podcastStatusText'),
    podcastResult: document.getElementById('podcastResult'),
    podcastPlayer: document.getElementById('podcastPlayer'),
    downloadPodcastBtn: document.getElementById('downloadPodcastBtn'),
    createPodcastBtn: document.getElementById('createPodcastBtn')
};

// ==========================================
// State Variables
// ==========================================
let currentChat = null;
let chatInterval = null;
let isPaused = false;
let appSettings = {
    defaultModel: 'gemini-2.5-flash-preview-05-20'
};

// ==========================================
// Character Definitions
// ==========================================
const characters = [
    {
        name: 'פילוסוף יווני',
        icon: '🏛️',
        description: 'הוגה דעות קדמון',
        prompt: 'אני סוקרטס, פילוסוף יווני. תפקידי לשאול שאלות סוקרטיות, בין 5 ל-20 מילים, המעוררות מחשבה עמוקה ובחינה עצמית. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם אדם יכול לדעת דבר מבלי להכירו באמת?\', \'מהי המהות האמיתית של הטוב, אם בכלל?\''
    },
    {
        name: 'סוכן FBI בדימוס',
        icon: '🕶️',
        description: 'בעל ניסיון עשיר בחקירות',
        prompt: 'אני סוכן FBI בדימוס, מומחה לחקירות פליליות. תפקידי לשאול שאלות חדות ומוכוונות ראיות, בין 5 ל-20 מילים, המנסות לחשוף את האמת. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה המניע האמיתי מאחורי הפעולה הזו, לדעתך?\', \'האם יש כאן היבט נסתר שאיננו רואים?\''
    },
    {
        name: 'קואצ\'רית לחיים',
        icon: '🌟',
        description: 'מעניקה השראה ומוטיבציה',
        prompt: 'אני קואצ\'רית לחיים, מלאה באנרגיה חיובית. תפקידי לשאול שאלות מעצימות ומכוונות לצמיחה אישית, בין 5 ל-20 מילים. שאל כאילו את מראיינת, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזו הזדמנות צומחת מהאתגר הזה?\', \'מה הצעד הבא שיקדם אותנו להגשמה?\''
    },
    {
        name: 'נהג אוטובוס תל-אביבי',
        icon: '🚌',
        description: 'עייף, ציני, אבל עם לב זהב',
        prompt: 'אני נהג אוטובוס תל-אביבי אחרי משמרת כפולה. תפקידי לשאול שאלות מציאותיות וקצת עייפות, בין 5 ל-20 מילים, על חיי היומיום. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'נו, מתי כבר יبنى פה רכבת קלה אמיתית?\', \'האם הפקק הזה אי פעם ייגמר, לדעתך?\''
    },
    {
        name: 'אמן רחוב',
        icon: '🎨',
        description: 'יוצר אמנות ספונטנית וצבעונית',
        prompt: 'אני אמן רחוב, מחפש השראה בכל פינה. תפקידי לשאול שאלות יצירתיות וחופשיות, בין 5 ל-20 מילים, המשקפות את עולם האמנות. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה צבע יכול לתאר את התחושה הזו?\', \'האם כל דבר יכול להיות אמנות?\''
    },
    {
        name: 'בלש פרטי אנגלי',
        icon: '🎩',
        description: 'מבריק וקצת אקסצנטרי',
        prompt: 'אני בלש פרטי אנגלי, בעל חשיבה אנליטית חדה. תפקידי לשאול שאלות מורכבות וחקירתיות, בין 5 ל-20 מילים, במבטא אנגלי קל. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מהן הظروف המדויקות שהובילו לאירוע?\', \'האם ישנם פרטים נוספים שלא נחשפו?\''
    },
    {
        name: 'טכנאי מחשבים מתוסכל',
        icon: '🖥️',
        description: 'רואה את הבעיות לפני שהן קורות',
        prompt: 'אני טכנאי מחשבים מתוסכל, שנתקל כבר בכל תקלה אפשרית. תפקידי לשאול שאלות ציניות ופרקטיות, בין 5 ל-20 מילים, על עולם הטכנולוגיה. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'למה זה תמיד מתקלקל ברגע הכי לא מתאים?\', \'האם מישהו באמת קורא את תנאי השימוש האלה?\''
    },
    {
        name: 'מדריך טיולים היסטורי',
        icon: '🗺️',
        description: 'אוהב לספר סיפורים מהעבר',
        prompt: 'אני מדריך טיולים היסטורי, מרותק לעבר. תפקידי לשאול שאלות מעمقות על אירועים היסטוריים ומשמעותם, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך השפיע האירוע הזה על מהלך ההיסטוריה?\', \'מה אנו יכולים ללמוד מכך לימינו?\''
    },
    {
        name: 'חובב קפה מושבע',
        icon: '☕',
        description: 'מומחה לפולי קפה וסוגי חליטות',
        prompt: 'אני חובב קפה מושבע, תמיד מחפש את הכוס המושלמת. תפקידי לשאול שאלות אנינות טעם ומתמחות בקפה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה מקור פולים יתאים לאספרסו עשיר?\', \'האם קפה קר יכול להיות אמנות אמיתית?\''
    },
    {
        name: 'עיתונאי חוקר',
        icon: '📝',
        description: 'חושף שחיתויות ומגלה אמיתות',
        prompt: 'אני עיתונאי חוקר, לא חושש לחשוף את האמת. תפקידי לשאול שאלות נוקבות וביקורתיות, בין 5 ל-20 מילים, על אירועים אקטואליים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם halkın אכן מודע לכל הפרטים?\', \'מי באמת הרוויח מהמהלך הזה?\''
    },
    {
        name: 'זקנה נרגנת עם חתולים',
        icon: '🧓',
        description: 'אוהבת להתלונן ולקטר, אבל בעצם עם נשמה טובה',
        prompt: 'אני זקנה נרגנת עם עשרה חתולים. תפקידי לשאול שאלות קצרות, בין 5 ל-20 מילים, עם הרבה קיטורים ודאגות. שאל כאילו את מראיינת, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'למה תמיד קר לי בבית, הא?\', \'איפה כל הצעירים של היום, אין להם כבוד?\''
    },
    {
        name: 'מהנדס תעופה וחלל',
        icon: '🚀',
        description: 'חולם על כוכבים וטכנולוגיה מתקדמת',
        prompt: 'אני מהנדס תעופה וחלל, מרותק ליקום. תפקידי לשאול שאלות מדויקות ומורכבות, בין 5 ל-20 מילים, על טכנולוגיה ומרחב. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נפתור את בעיית הדלק במסעות לחלל עמוק?\', \'האם נגלה חיים מחוץ לכדור הארץ בקרוב?\''
    },
    {
        name: 'אסטרונום חובב',
        icon: '🔭',
        description: 'מבלה לילות בצפייה בכוכבים',
        prompt: 'אני אסטרונום חובב, המום מיופיו של היקום. תפקידי לשאול שאלות פשוטות ומתפעלות על גרמי שמיים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם שביט מרהיב יחצה את השמיים בקרוב?\', \'איך נוצרו גלקסיות ענק כאלה?\''
    },
    {
        name: 'עובד מוזיאון היסטוריה',
        icon: '🗿',
        description: 'שומר על יצירות עתיקות',
        prompt: 'אני עובד במוזיאון להיסטוריה, מוקף בפלאי העבר. תפקידי לשאול שאלות על חפצים עתיקים ותרבויות קדומות, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה הסיפור מאחורי כלי החרס הזה?\', \'האם נמצא עוד ממצאים באתר זה?\''
    },
    {
        name: 'גיימר מקצועי',
        icon: '🎮',
        description: 'חי ונושם משחקי מחשב',
        prompt: 'אני גיימר מקצועי, תמיד בחיפוש אחרי האתגר הבא. תפקידי לשאול שאלות אסטרטגיות ותחרותיות, בין 5 ל-20 מילים, על עולם המשחקים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזו אסטרטגיה תבטיח ניצחון בסיבוב הבא?\', \'האם המודל יצליח להתמודד עם בינה מלאכותית?\''
    },
    {
        name: 'מגדל ירקות אורגני',
        icon: '🥕',
        description: 'מחובר לאדמה ולטבע',
        prompt: 'אני מגדל ירקות אורגני, ששמח לראות כל נבט. תפקידי לשאול שאלות פשוטות וקשורות לגידולים, בין 5 ל-20 מילים, עם דגש על טבע ובריאות. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם העגבניות יבשילו טוב השנה?\', \'מה הסוד לגידול ירקות טעימים כל כך?\''
    },
    {
        name: 'סטנדאפיסט בתחילת דרכו',
        icon: '🎤',
        description: 'מנסה את מזלו עם הומור',
        prompt: 'אני סטנדאפיסט בתחילת דרכי, תמיד מחפש חומרים חדשים. תפקידי לשאול שאלות מצחיקות וקצת ביזאריות, בין 5 ל-20 מילים, בניסיון לבחון תגובות. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'למה תמיד נופלים על הצד המרוח בחמאה?\', \'האם יש בדיחה על בינה מלאכותית?\''
    },
    {
        name: 'בלוגר אופנה',
        icon: '👗',
        description: 'מעודכן בטרנדים האחרונים',
        prompt: 'אני בלוגר אופנה, תמיד עם עין חדה על הטרנדים. תפקידי לשאול שאלות קלילות ועדכניות, בין 5 ל-20 מילים, על עולם האופנה. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה צבע הוא הלהיט של העונה הקרובה?\', \'האם סגנון זה עדיין אופנתי, לדעתך?\''
    },
    {
        name: 'פרמדיק שטח',
        icon: '🚑',
        description: 'רואה הכל, נשאר רגוע',
        prompt: 'אני פרמדיק שטח, רגיל ללחץ ואנדרנלין. תפקידי לשאול שאלות ישירות ופרקטיות, בין 5 ל-20 מילים, על מצבי חירום. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה הפעולה הראשונה שתעשה במקרה חירום?\', \'האם חשוב לשמור על קור רוח?\''
    },
    {
        name: 'מומחה לשיווק דיגיטלי',
        icon: '📈',
        description: 'תמיד עם עין על הטרנדים הבאים',
        prompt: 'אני מומחה לשיווק דיגיטלי, מחפש את האסטרטגיה המנצחת. תפקידי לשאול שאלות על קמפיינים, נתונים ומגמות דיגיטליות, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נמדוד את הצלחת הקמפיין הבא?\', \'האם בינה מלאכותית תשנה את שיווק התוכן?\''
    },
    {
        name: 'אופה מקצועי',
        icon: '🍞',
        description: 'יוצר קסמים עם בצק וקמח',
        prompt: 'אני אופה מקצועי, מאוהב בקמח ובצק. תפקידי לשאול שאלות על מרכיבים, טכניקות אפייה וסודות קולינריים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה הסוד לבצק שמרים רך ואוורيري?\', \'איזה קינוח ישראלי כובש את העולם?\''
    },
    {
        name: 'מדען מחשב',
        icon: '💻',
        description: 'חוקר אלגוריתמים ובינה מלאכותית',
        prompt: 'אני מדען מחשב, חוקר את גבולות הטכנולוגיה. תפקידי לשאול שאלות על קוד, אלגוריתמים, ולמידת מכונה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'כיצד בינה מלאכותית תשנה את עתיד התעסוקה?\', \'מהי הדרך היעילה ביותר למיין נתונים גדולים?\''
    },
    {
        name: 'גנן חובב',
        icon: '🌻',
        description: 'מטפח גינות באהבה רבה',
        prompt: 'אני גנן חובב, כל יום לומד משהו חדש מהצמחים. תפקידי לשאול שאלות על גינון, צמחים, ואיכות הסביבה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה פרח יפרח הכי יפה באביב?\', \'האם נצליח להציל את יערות הגשם?\''
    },
    {
        name: 'מורה להיסטוריה',
        icon: '📜',
        description: 'מעביר את סיפורי העבר לדורות הבאים',
        prompt: 'אני מורה להיסטוריה, מאמין שלומדים מהעבר. תפקידי לשאול שאלות על אירועים היסטוריים, דמויות מפתח, והשפעתם על ההווה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה היה רגע המפנה במהפכה הצרפתית?\', \'האם ההיסטוריה באמת חוזרת על עצמה?\''
    },
    {
        name: 'שף מסעדה',
        icon: '👨‍🍳',
        description: 'יוצר מנות גורמה עם תשוקה',
        prompt: 'אני שף מסעדה, כל מנה היא יצירת אמנות. תפקידי לשאול שאלות על מתכונים, טעמים, וחומרי גלם איכותיים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה תיבול ישדרג את המנה באופן מיידי?\', \'האם האוכל הטבעוני ישלוט בעולם הקולינריה?\''
    },
    {
        name: 'כוריאוגרף',
        icon: '🩰',
        description: 'מביא תנועה ורגש לבמה',
        prompt: 'אני כוריאוגרף, מחפש את התנועה המושלמת. תפקידי לשאול שאלות על ריקוד, יצירתיות, וביטוי דרך הגוף, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה רגש תרצה להביע בתנועה הזו?\', \'האם כל אחד יכול לרקוד?\''
    },
    {
        name: 'איש מכירות',
        icon: '🤝',
        description: 'משכנע כל אחד לרכוש כל דבר',
        prompt: 'אני איש מכירות, תמיד מחפש את העסקה הבאה. תפקידי לשאול שאלות על צרכים, רצונות, ודרכי שכנוע, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה באמת חשוב ללקוח הפוטנציאלי הזה?\', \'האם מחיר הוא הגורם היחיד בהחלטת קנייה?\''
    },
    {
        name: 'חוקר ימי',
        icon: '🐠',
        description: 'צולל לעומקים לחשוף סודות',
        prompt: 'אני חוקר ימי, המום מפלאי האוקיינוס. תפקידי לשאול שאלות על יצורים ימיים, מערכות אקולוגיות תת-מימיות, ושימור ימי, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזו תגלית חדשה מחכה לנו בעומק הים?\', \'האם נצליח לעצור את זיהום האוקיינוסים?\''
    },
    {
        name: 'מהנדס בניין',
        icon: '🏗️',
        description: 'בונים את העתיד, לבנה אחר לבנה',
        prompt: 'אני מהנדס בניין, בונה את המחר. תפקידי לשאול שאלות על חומרים, יציבות, ופרויקטים הנדסיים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נבטיח את עמידות המבנה לרעידות אדמה?\', \'האם הבנייה הירוקה היא עתיד התעשייה?\''
    },
    {
        name: 'יועץ פיננסי',
        icon: '💰',
        description: 'עוזר לאנשים לנהל את כספם בחוכמה',
        prompt: 'אני יועץ פיננסי, מסייע לאנשים לצמוח כלכלית. תפקידי לשאול שאלות על השקעות, חיסכון, ותכנון פנסיוני, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נבנה תיק השקעות מגוון?\', \'האם הריבית הנוכחית טובה לחיסכון?\''
    },
    {
        name: 'בלשן',
        icon: '📚',
        description: 'חוקר שפות ומשמעותן',
        prompt: 'אני בלשן, מרותק לעולם המילים. תפקידי לשאול שאלות על מקורן של מילים, מבנה שפות, והשפעת השפה על המחשבה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מהו מקור המילה "מחשב" בעברית?\', \'האם שפות נכחדות יום-יום?\''
    },
    {
        name: 'מטפל אלטרנטיבי',
        icon: '🌿',
        description: 'מאמין בכוח הריפוי הטבעי',
        prompt: 'אני מטפל אלטרנטיבי, רואה את הגוף כמערכת שלמה. תפקידי לשאול שאלות על רווחה נפשית ופיזית, תזונה, ושיטות ריפוי טבעיות, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נשימה נכונה משפיעה על הלחץ?\', \'האם צמחי מרפא יכולים להחליף תרופות?\''
    },
    {
        name: 'ארכיאולוג',
        icon: '🏺',
        description: 'חושף סודות קדומים מהאדמה',
        prompt: 'אני ארכיאולוג, מגלה את העבר החבוי. תפקידי לשאול שאלות על ממצאים ארכיאולוגיים, תרבויות קדומות, וטכניקות חפירה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזו תגלית תשנה את ההבנה שלנו על התקופה?\', \'האם נוכל לשחזר תרבויות עתיקות?\''
    },
    {
        name: 'מתכנת פרונט אנד',
        icon: '🖥️',
        description: 'יוצר את מה שאתם רואים בדפדפן',
        prompt: 'אני מתכנת פרונט אנד, מתמחה בממשקי משתמש. תפקידי לשאול שאלות על עיצוב, חווית משתמש, וטכנולוגיות ווב חדשות, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה פרימוורק יקל על פיתוח אתרים מהירים?\', \'האם עיצוב מינימליסטי הוא העתיד?\''
    },
    {
        name: 'מאמן כושר',
        icon: '💪',
        description: 'עוזר לאנשים להגיע לשיאם הפיזי',
        prompt: 'אני מאמן כושר, מחוייב לבריאות הגוף. תפקידי לשאול שאלות על אימונים, תזונה נכונה, והגשמת יעדים פיזיים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה תרגיל יעיל לבניית מסת שריר במהירות?\', \'האם תוספי תזונה חיוניים לספורטאים?\''
    },
    {
        name: 'ספרן',
        icon: '📖',
        description: 'שומר ידע ומנחה לקריאה',
        prompt: 'אני ספרן, שומר על אוצרות הידע. תפקידי לשאול שאלות על ספרים, סוגות ספרותיות, וכיצד למצוא מידע מהימן, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה רומן קלאסי כדאי לקרוא בסתיו?\', \'האם ספרי נייר ייעלמו מהעולם?\''
    },
    {
        name: 'טיילר עולמי',
        icon: '🌍',
        description: 'מחפש הרפתקאות ותרבויות חדשות',
        prompt: 'אני מטייל עולמי, כל מקום הוא סיפור. תפקידי לשאול שאלות על יעדים, חוויות מסע, וטיפים למטיילים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה יעד מפתיע תמליץ לטיול הבא?\', \'האם מסעות משנים באמת אנשים?\''
    },
    {
        name: 'מדען אקלים',
        icon: '🌡️',
        description: 'חוקר את שינויי כדור הארץ',
        prompt: 'אני מדען אקלים, מודאג מעתיד הפלנטה. תפקידי לשאול שאלות על התחממות גלובלית, אנרגיה מתחדשת, והשפעות על הסביבה, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך נפחית את פליטות הפחמן בעולם?\', \'האם נצליח לעצור את עליית מפלס הים?\''
    },
    {
        name: 'מומחה יין',
        icon: '🍷',
        description: 'מבחין בניואנסים של כל לגימה',
        prompt: 'אני מומחה יין, מעריך כל טיפה. תפקידי לשאול שאלות על זני ענבים, אזורי יין, ושילובים קולינריים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איזה יין יתאים לארוחת גורמה מפוארת?\', \'האם יין משתבח עם השנים?\''
    }
];

// ==========================================
// Utility Functions
// ==========================================

function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

function saveApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
        appSettings = { ...appSettings, ...JSON.parse(saved) };
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appSettings));
}

function togglePasswordVisibility(inputElement, toggleButton) {
    const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
    inputElement.setAttribute('type', type);
    toggleButton.querySelector('i').classList.toggle('fa-eye');
    toggleButton.querySelector('i').classList.toggle('fa-eye-slash');
}

function showSection(sectionElement) {
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }
}

function hideSection(sectionElement) {
    if (sectionElement) {
        sectionElement.classList.add('hidden');
    }
}

function updateTokenEstimate(rounds) {
    const minTokens = rounds * 500;
    const maxTokens = rounds * 1000;
    elements.tokenEstimate.textContent = `הערכת טוקנים: ~${minTokens.toLocaleString()} - ${maxTokens.toLocaleString()}`;
}

// ==========================================
// API Functions
// ==========================================

async function testApiKey(apiKey) {
    // בדיקה פשוטה של מפתח ה-API על ידי שליחת בקשה קטנה
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    
    try {
        const response = await fetch(url);
        if (response.ok) {
            return { success: true };
        } else {
            const data = await response.json();
            return { success: false, error: data.error?.message || 'מפתח API לא תקין' };
        }
    } catch (error) {
        return { success: false, error: 'שגיאת רשת: ' + error.message };
    }
}

async function callGeminiAPI(prompt, model, conversationHistory = []) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('מפתח API לא הוגדר');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    const contents = [];
    
    // הוספת היסטוריית השיחה
    conversationHistory.forEach(msg => {
        contents.push({
            role: msg.type === 'question' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    });
    
    // הוספת הפרומפט הנוכחי
    contents.push({
        role: 'user',
        parts: [{ text: prompt }]
    });

    const body = {
        contents: contents,
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.9
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'שגיאה בתקשורת עם ה-API');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error('לא התקבלה תשובה מה-API');
        }
        
        return text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==========================================
// Chat Functions
// ==========================================

function addMessageToChat(type, sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');
    headerDiv.innerHTML = `<strong>${sender}</strong>`;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // שימוש ב-marked אם זמין, אחרת טקסט רגיל
    if (typeof window.marked !== 'undefined') {
        contentDiv.innerHTML = window.marked.parse(content);
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function generateQuestion() {
    const config = currentChat.config;
    let prompt = '';
    
    let topicForPrompt = config.topic;
    if (!topicForPrompt && config.type === 'character') {
        topicForPrompt = `נושא כללי שמתאים ל${config.character.name} (${config.character.description})`;
    } else if (!topicForPrompt) {
        topicForPrompt = 'נושא כללי';
    }

    if (config.type === 'character') {
        const characterIntro = `אני ${config.character.name} (${config.character.description}).`;
        prompt = `${characterIntro} שאל/י שאלה אחת בלבד, בין 5 ל-20 מילים, המשקפת את סגנונך, על הנושא: "${topicForPrompt}". הסבר/י בקצרה איך השאלה מתקשרת לנושא, ותמיד בסיום המשפט שאל/י עם סימן שאלה. אל תכלול/י את המילה "ג'מיני" בשאלה. ודא/י שהשאלה הנוכחית שונה לחלוטין משאלות קודמות. ${config.questionInstructions || ''}`;
    } else {
        prompt = `שאל/י שאלה אחת בלבד, בין 5 ל-20 מילים, על הנושא: "${topicForPrompt}" בסגנון "${config.style || 'שיחה כללית'}". הסבר/י בקצרה איך השאלה מתקשרת לנושא, ותמיד להסתיים בסימן שאלה. אל תכלול/י את המילה "ג'מיני" בשאלה. השאלה צריכה להיות ייחודית ולא לחזור על שאלות קודמות. ${config.questionInstructions || ''}`;
    }

    const model = config.questionModel || appSettings.defaultModel;
    const rawResponse = await callGeminiAPI(prompt, model, currentChat.messages);
    
    let question = rawResponse.trim();
    
    // ניקוי התשובה
    const explanationStartRegex = /(?:שאלה זו|השאלה הזו|זו שאלה|שאלתי את זה|זה קשור לנושא|זה חשוב כי|זה נוגע ל|זה מראה ש|כפי שציינתי)/;
    const explanationMatch = question.match(explanationStartRegex);
    if (explanationMatch) {
        question = question.substring(0, explanationMatch.index).trim();
    }
    
    if (!question.endsWith('?') && !question.endsWith('.') && !question.endsWith('!')) {
        question += '?';
    }
    
    question = question.replace(/^["']|["']$/g, '');
    
    return question;
}

async function generateAnswer(question) {
    const config = currentChat.config;
    let answerPrompt = `אתה ג'מיני. ענה/י על השאלה הבאה מנקודת מבט אובייקטיבית, מפורטת ועניינית. הקפד/י להתייחס לשאלה הספציפית שנשאלה, ולא לשאול שאלות בחזרה. התשובה צריכה להיות בין 10 ל-50 מילים. התייחס/י ל"נושא השיחה" של הצ'אט, שהוא "${config.topic}". השאלה שנשאלה: "${question}"`;
    
    if (config.answerInstructions) {
        answerPrompt += ` ${config.answerInstructions}`;
    }

    const model = config.answerModel || appSettings.defaultModel;
    return await callGeminiAPI(answerPrompt, model, currentChat.messages);
}

async function runChatRound() {
    if (isPaused) {
        return;
    }
    
    // בדיקה האם הגענו למקסימום סיבובים (אם לא במצב ללא הגבלה)
    if (!currentChat.unlimitedRounds && currentChat.currentRound >= currentChat.maxRounds) {
        stopChat();
        return;
    }

    elements.chatStatus.textContent = 'הדמות חושבת...';
    elements.chatStatus.style.color = '#FFA500';
    elements.pauseBtn.disabled = true;
    elements.stopChatBtn.disabled = true;

    try {
        const questionText = await generateQuestion();
        addMessageToChat('question', currentChat.config.character ? currentChat.config.character.name : 'שואל', questionText);
        currentChat.messages.push({ type: 'question', content: questionText });
        saveChatHistory();

        elements.chatStatus.textContent = 'ג\'מיני עונה...';
        elements.chatStatus.style.color = '#3B82F6';

        const answerText = await generateAnswer(questionText);
        addMessageToChat('answer', 'ג\'מיני', answerText);
        currentChat.messages.push({ type: 'answer', content: answerText });
        saveChatHistory();

        currentChat.currentRound++;
        
        // עדכון תצוגת מונה הסיבובים
        if (currentChat.unlimitedRounds) {
            elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound} (ללא הגבלה)`;
        } else {
            elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound}/${currentChat.maxRounds}`;
        }
        
        elements.chatStatus.textContent = 'מוכן';
        elements.chatStatus.style.color = '#28a745';
        elements.pauseBtn.disabled = false;
        elements.stopChatBtn.disabled = false;

        // בדיקה האם להציג כפתור המשך (רק אם יש הגבלת סיבובים)
        if (!currentChat.unlimitedRounds && currentChat.currentRound >= currentChat.maxRounds) {
            elements.continueBtn.classList.remove('hidden');
            elements.chatStatus.textContent = 'צ\'אט הסתיים. לחץ להמשך או התחל חדש.';
            elements.chatStatus.style.color = '#6c757d';
        }

    } catch (error) {
        console.error("Error in chat round:", error);
        addMessageToChat('error', 'מערכת', `אירעה שגיאה: ${error.message}. אנא בדוק את מפתח ה-API שלך או נסה שוב.`);
        stopChat();
    } finally {
        elements.pauseBtn.disabled = false;
        elements.stopChatBtn.disabled = false;
    }
}

function startChat(config) {
    if (chatInterval) clearInterval(chatInterval);

    currentChat = {
        id: Date.now(),
        title: config.type === 'character' ? config.character.name : config.topic,
        config: config,
        messages: [],
        currentRound: 0,
        maxRounds: config.maxRounds || 5,
        unlimitedRounds: config.unlimitedRounds || false,
        timestamp: new Date().toISOString()
    };

    elements.chatMessages.innerHTML = '';
    elements.chatTitle.textContent = currentChat.title;
    
    if (currentChat.unlimitedRounds) {
        elements.roundCounter.textContent = `סיבוב 0 (ללא הגבלה)`;
    } else {
        elements.roundCounter.textContent = `סיבוב 0/${currentChat.maxRounds}`;
    }
    
    elements.chatStatus.textContent = 'מוכן';
    elements.chatStatus.style.color = '#28a745';
    elements.continueBtn.classList.add('hidden');
    elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    isPaused = false;

    hideSection(elements.welcomeScreen);
    showSection(elements.chatContainer);

    saveChatHistory();
    renderChatHistory();

    runChatRound();
    chatInterval = setInterval(runChatRound, 7000);
}

function continueChat() {
    currentChat.maxRounds += 5;
    elements.continueBtn.classList.add('hidden');
    elements.chatStatus.textContent = 'מוכן';
    elements.chatStatus.style.color = '#28a745';
    elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    isPaused = false;
    chatInterval = setInterval(runChatRound, 7000);
    saveChatHistory();
}

function togglePauseChat() {
    if (isPaused) {
        chatInterval = setInterval(runChatRound, 7000);
        elements.chatStatus.textContent = 'מוכן';
        elements.chatStatus.style.color = '#28a745';
        elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    } else {
        clearInterval(chatInterval);
        elements.chatStatus.textContent = 'מושהה';
        elements.chatStatus.style.color = '#FFC107';
        elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    }
    isPaused = !isPaused;
}

function stopChat() {
    if (chatInterval) clearInterval(chatInterval);
    isPaused = true;
    elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    elements.chatStatus.textContent = 'צ\'אט הסתיים. התחל חדש.';
    elements.chatStatus.style.color = '#DC3545';
    if (!currentChat.unlimitedRounds) {
        elements.continueBtn.classList.remove('hidden');
    }
}

// ==========================================
// Chat History Functions
// ==========================================

function getChatHistory() {
    const history = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
}

function saveChatHistory() {
    if (currentChat) {
        const history = getChatHistory();
        const existingIndex = history.findIndex(chat => chat.id === currentChat.id);
        if (existingIndex > -1) {
            history[existingIndex] = currentChat;
        } else {
            history.unshift(currentChat);
        }
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
}

function renderChatHistory() {
    elements.chatHistoryDiv.innerHTML = '';
    const history = getChatHistory();
    history.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-history-item');
        if (currentChat && chat.id === currentChat.id) {
            chatItem.classList.add('active');
        }
        chatItem.dataset.chatId = chat.id;

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('chat-history-title');
        titleDiv.textContent = chat.title;

        const dateDiv = document.createElement('div');
        dateDiv.classList.add('chat-history-date');
        dateDiv.textContent = new Date(chat.timestamp).toLocaleString('he-IL');

        chatItem.appendChild(titleDiv);
        chatItem.appendChild(dateDiv);
        elements.chatHistoryDiv.appendChild(chatItem);

        chatItem.addEventListener('click', () => loadChat(chat.id));
    });
}

function loadChat(chatId) {
    if (chatInterval) clearInterval(chatInterval);
    isPaused = true;
    elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');

    const history = getChatHistory();
    const chatToLoad = history.find(chat => chat.id === chatId);

    if (chatToLoad) {
        currentChat = chatToLoad;
        elements.chatMessages.innerHTML = '';
        currentChat.messages.forEach(msg => {
            const senderName = msg.type === 'question' ? (currentChat.config.character ? currentChat.config.character.name : 'שואל') : 'ג\'מיני';
            addMessageToChat(msg.type, senderName, msg.content);
        });

        elements.chatTitle.textContent = currentChat.title;
        
        if (currentChat.unlimitedRounds) {
            elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound} (ללא הגבלה)`;
        } else {
            elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound}/${currentChat.maxRounds}`;
        }
        
        elements.chatStatus.textContent = 'מושהה (טען היסטוריה)';
        elements.chatStatus.style.color = '#FFC107';
        elements.continueBtn.classList.remove('hidden');
        elements.pauseBtn.disabled = false;

        hideSection(elements.welcomeScreen);
        showSection(elements.chatContainer);
        renderChatHistory();
    }
}

function clearAllHistory() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית הצ\'אטים? פעולה זו בלתי הפיכה.')) {
        localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
        elements.chatHistoryDiv.innerHTML = '';
        currentChat = null;
        if (chatInterval) clearInterval(chatInterval);
        isPaused = false;
        hideSection(elements.chatContainer);
        showSection(elements.welcomeScreen);
        alert('היסטוריית הצ\'אטים נמחקה בהצלחה.');
    }
}

// ==========================================
// Export Functions
// ==========================================

function exportChat() {
    if (!currentChat || currentChat.messages.length === 0) {
        alert('אין צ\'אט פעיל לייצוא.');
        return;
    }

    let exportText = `שם הצ'אט: ${currentChat.title}\n`;
    exportText += `תאריך: ${new Date(currentChat.timestamp).toLocaleString('he-IL')}\n\n`;
    exportText += `נושא: ${currentChat.config.topic || 'לא צוין'}\n`;
    if (currentChat.config.type === 'character') {
        exportText += `דמות: ${currentChat.config.character.name} (${currentChat.config.character.description})\n`;
    } else {
        exportText += `סגנון: ${currentChat.config.style || 'לא צוין'}\n`;
    }
    exportText += `----------------------------------------\n\n`;

    currentChat.messages.forEach(msg => {
        const senderName = msg.type === 'question' ? (currentChat.config.character ? currentChat.config.character.name : 'שואל') : 'ג\'מיני';
        exportText += `${senderName}:\n${msg.content}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentChat.title.replace(/[^a-zA-Z0-9א-ת]/g, '_')}_chat.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// ==========================================
// Podcast Functions
// ==========================================

function generatePodcastScript() {
    if (!currentChat || currentChat.messages.length === 0) {
        alert('אין שיחה ליצור ממנה פודקאסט.');
        return;
    }

    // קביעת שמות הדוברים לפי ההגדרות
    const speakerConfig = document.querySelector('.speaker-card.selected')?.dataset.config || 'male_female';
    let speaker1, speaker2;
    
    switch (speakerConfig) {
        case 'two_males':
            speaker1 = 'speaker1';
            speaker2 = 'speaker2';
            break;
        case 'two_females':
            speaker1 = 'speaker1';
            speaker2 = 'speaker2';
            break;
        case 'male_female':
        default:
            speaker1 = 'man';
            speaker2 = 'girl';
            break;
    }

    // יצירת הנחיות לדוברים באנגלית
    let directive = `The speakers are having an engaging conversation. ${speaker1} asks questions with curiosity and interest, while ${speaker2} answers thoughtfully and informatively. Both speakers should sound natural and conversational with appropriate pauses and intonation.\n\n`;

    // המרת ההודעות לפורמט פודקאסט
    currentChat.messages.forEach(msg => {
        const speaker = msg.type === 'question' ? speaker1 : speaker2;
        directive += `${speaker}: ${msg.content}\n`;
    });

    elements.podcastScriptPreview.textContent = directive;
    elements.podcastScript.value = directive;
    elements.createPodcastBtn.disabled = false;
    
    return directive;
}

async function createPodcast() {
    const script = elements.podcastScript.value || elements.podcastScriptPreview.textContent;
    
    if (!script || script.includes('התסריט יווצר אוטומטית')) {
        alert('יש ליצור תסריט קודם.');
        return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
        alert('מפתח API לא הוגדר.');
        return;
    }

    // הצגת סטטוס
    showSection(elements.podcastStatus);
    hideSection(elements.podcastResult);
    elements.createPodcastBtn.disabled = true;
    elements.podcastProgressFill.style.width = '10%';
    elements.podcastStatusText.textContent = 'מכין את התסריט...';

    // קביעת הגדרות הדוברים
    const speakerConfig = document.querySelector('.speaker-card.selected')?.dataset.config || 'male_female';
    let speechConfig;
    
    switch (speakerConfig) {
        case 'two_males':
            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: "speaker1", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sadaltager" } } },
                        { speaker: "speaker2", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Pulcherrima" } } }
                    ]
                }
            };
            break;
        case 'two_females':
            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: "speaker1", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
                        { speaker: "speaker2", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
                    ]
                }
            };
            break;
        case 'male_female':
        default:
            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: "man", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sadaltager" } } },
                        { speaker: "girl", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
                    ]
                }
            };
            break;
    }

    const model = 'gemini-2.5-flash-preview-tts';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
        contents: [{ parts: [{ text: script }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: speechConfig
        }
    };

    try {
        elements.podcastProgressFill.style.width = '30%';
        elements.podcastStatusText.textContent = 'שולח בקשה ל-Gemini TTS...';

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        elements.podcastProgressFill.style.width = '60%';
        elements.podcastStatusText.textContent = 'מעבד את התשובה...';

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'שגיאה בתקשורת עם ה-API');
        }

        const data = await response.json();
        const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!audioPart) {
            throw new Error('ה-API לא החזיר קובץ שמע. ייתכן שהתסריט אינו תקין.');
        }

        elements.podcastProgressFill.style.width = '80%';
        elements.podcastStatusText.textContent = 'יוצר קובץ שמע...';

        // יצירת קובץ WAV
        const b64 = audioPart.inlineData.data;
        const pcmBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const wavBlob = createWavBlob(pcmBytes);
        const audioUrl = URL.createObjectURL(wavBlob);

        elements.podcastProgressFill.style.width = '100%';
        elements.podcastStatusText.textContent = 'הפודקאסט מוכן!';

        // הצגת התוצאה
        elements.podcastPlayer.src = audioUrl;
        
        const filename = `${(currentChat?.title || 'podcast').replace(/[^a-zA-Z0-9א-ת]/g, '_')}_podcast.wav`;
        elements.downloadPodcastBtn.href = audioUrl;
        elements.downloadPodcastBtn.setAttribute('download', filename);

        setTimeout(() => {
            hideSection(elements.podcastStatus);
            showSection(elements.podcastResult);
        }, 1000);

    } catch (error) {
        console.error('Podcast creation error:', error);
        elements.podcastStatusText.textContent = `שגיאה: ${error.message}`;
        elements.podcastProgressFill.style.background = '#E74C3C';
    } finally {
        elements.createPodcastBtn.disabled = false;
    }
}

function createWavBlob(pcmData) {
    const numChannels = 1;
    const sampleRate = 24000;
    const bitsPerSample = 16;
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Helper function
    const setString = (offset, str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    setString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    setString(8, 'WAVE');
    setString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    setString(36, 'data');
    view.setUint32(40, dataSize, true);
    new Uint8Array(buffer, 44).set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
}

// ==========================================
// Event Listeners and Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    
    const storedApiKey = getApiKey();
    
    if (storedApiKey) {
        // בדיקת תקינות המפתח
        const testResult = await testApiKey(storedApiKey);
        if (testResult.success) {
            hideSection(elements.loading);
            hideSection(elements.apiSetup);
            showSection(elements.mainApp);
            renderChatHistory();
            
            // עדכון ברירת מחדל של מודל בהגדרות
            if (elements.defaultModel) {
                elements.defaultModel.value = appSettings.defaultModel;
            }
        } else {
            hideSection(elements.loading);
            showSection(elements.apiSetup);
        }
    } else {
        hideSection(elements.loading);
        showSection(elements.apiSetup);
    }

    // ==========================================
    // API Key Setup Events
    // ==========================================
    
    elements.apiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const apiKey = elements.apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('אנא הכנס מפתח API.');
            return;
        }
        
        // הצגת טעינה
        const submitBtn = elements.apiForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> בודק...';
        submitBtn.disabled = true;
        
        const testResult = await testApiKey(apiKey);
        
        if (testResult.success) {
            saveApiKey(apiKey);
            hideSection(elements.apiSetup);
            showSection(elements.mainApp);
            renderChatHistory();
        } else {
            alert(`מפתח ה-API אינו תקין: ${testResult.error}`);
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });

    elements.toggleApiKey.addEventListener('click', () => {
        togglePasswordVisibility(elements.apiKeyInput, elements.toggleApiKey);
    });

    // ==========================================
    // Main App Button Events
    // ==========================================
    
    elements.newChatBtn.addEventListener('click', () => {
        showSection(elements.setupModal);
        
        // איפוס שדות
        elements.customTopicInput.value = '';
        if (elements.customTopicCustomInput) elements.customTopicCustomInput.value = '';
        elements.customStyleInput.value = '';
        elements.questionInstructions.value = '';
        elements.answerInstructions.value = '';
        
        // הגדרת ברירות מחדל
        elements.questionModel.value = appSettings.defaultModel;
        elements.answerModel.value = appSettings.defaultModel;
        elements.roundsCount.value = 5;
        elements.unlimitedRounds.checked = false;
        showSection(elements.roundsLimitSection);
        updateTokenEstimate(5);
        
        // איפוס לשונית
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        elements.setupTabs.querySelector('[data-tab="character"]').classList.add('active');
        elements.characterTab.classList.add('active');
        
        // איפוס בחירת דמות
        document.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    });

    elements.exportBtn.addEventListener('click', exportChat);
    
    elements.podcastBtn.addEventListener('click', () => {
        if (!currentChat || currentChat.messages.length === 0) {
            alert('אין שיחה פעילה. התחל שיחה קודם כדי ליצור פודקאסט.');
            return;
        }
        
        // איפוס מודאל הפודקאסט
        elements.podcastScriptPreview.innerHTML = '<p class="script-placeholder">התסריט יווצר אוטומטית מהשיחה...</p>';
        elements.podcastScript.value = '';
        hideSection(elements.podcastScript);
        showSection(elements.podcastScriptPreview);
        hideSection(elements.podcastStatus);
        hideSection(elements.podcastResult);
        elements.createPodcastBtn.disabled = true;
        elements.podcastProgressFill.style.width = '0%';
        elements.podcastProgressFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        
        showSection(elements.podcastModal);
    });

    elements.settingsBtn.addEventListener('click', () => {
        elements.newApiKeyInput.value = getApiKey() || '';
        elements.defaultModel.value = appSettings.defaultModel;
        showSection(elements.settingsModal);
    });

    // ==========================================
    // Chat Control Button Events
    // ==========================================
    
    elements.startChatBtn.addEventListener('click', () => {
        elements.newChatBtn.click();
    });
    
    elements.continueBtn.addEventListener('click', continueChat);
    elements.pauseBtn.addEventListener('click', togglePauseChat);
    elements.stopChatBtn.addEventListener('click', stopChat);

    // ==========================================
    // Setup Modal Events
    // ==========================================
    
    elements.closeSetupModal.addEventListener('click', () => hideSection(elements.setupModal));

    elements.setupTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab + 'Tab').classList.add('active');
        }
    });

    // יצירת רשת הדמויות
    elements.characterGrid.innerHTML = '';
    characters.forEach((char, index) => {
        const charCard = document.createElement('div');
        charCard.classList.add('character-card');
        charCard.dataset.characterIndex = index;
        charCard.innerHTML = `
            <div class="character-icon">${char.icon}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-desc">${char.description}</div>
        `;
        charCard.addEventListener('click', () => {
            document.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
            charCard.classList.add('selected');
        });
        elements.characterGrid.appendChild(charCard);
    });

    // בחירת מודלים מותאמים אישית
    elements.questionModel.addEventListener('change', () => {
        if (elements.questionModel.value === 'custom-question') {
            elements.customQuestionModel.classList.remove('hidden');
        } else {
            elements.customQuestionModel.classList.add('hidden');
        }
    });

    elements.answerModel.addEventListener('change', () => {
        if (elements.answerModel.value === 'custom-answer') {
            elements.customAnswerModel.classList.remove('hidden');
        } else {
            elements.customAnswerModel.classList.add('hidden');
        }
    });

    // הגדרות סיבובים
    elements.unlimitedRounds.addEventListener('change', () => {
        if (elements.unlimitedRounds.checked) {
            hideSection(elements.roundsLimitSection);
        } else {
            showSection(elements.roundsLimitSection);
        }
    });

    elements.decreaseRounds.addEventListener('click', () => {
        const current = parseInt(elements.roundsCount.value) || 5;
        if (current > 1) {
            elements.roundsCount.value = current - 1;
            updateTokenEstimate(current - 1);
        }
    });

    elements.increaseRounds.addEventListener('click', () => {
        const current = parseInt(elements.roundsCount.value) || 5;
        if (current < 100) {
            elements.roundsCount.value = current + 1;
            updateTokenEstimate(current + 1);
        }
    });

    elements.roundsCount.addEventListener('change', () => {
        let value = parseInt(elements.roundsCount.value) || 5;
        if (value < 1) value = 1;
        if (value > 100) value = 100;
        elements.roundsCount.value = value;
        updateTokenEstimate(value);
    });

    // התחלת צ'אט
    elements.startCustomChatBtn.addEventListener('click', () => {
        const selectedCharacterCard = document.querySelector('.character-card.selected');
        let chatConfig = {};
        let topic = '';

        const activeTab = document.querySelector('.tab-content.active');
        
        // קבלת הגדרות מתקדמות
        let questionModel = elements.questionModel.value;
        if (questionModel === 'custom-question') {
            questionModel = elements.customQuestionModel.value.trim() || appSettings.defaultModel;
        }
        
        let answerModel = elements.answerModel.value;
        if (answerModel === 'custom-answer') {
            answerModel = elements.customAnswerModel.value.trim() || appSettings.defaultModel;
        }
        
        const unlimitedRounds = elements.unlimitedRounds.checked;
        const maxRounds = parseInt(elements.roundsCount.value) || 5;

        if (activeTab.id === 'characterTab') {
            if (!selectedCharacterCard) {
                alert('אנא בחר דמות כדי להתחיל צ\'אט.');
                return;
            }
            topic = elements.customTopicInput.value.trim();
            if (!topic) {
                alert('אנא הכנס נושא שיחה עבור הדמות שבחרת.');
                return;
            }
            const characterIndex = parseInt(selectedCharacterCard.dataset.characterIndex);
            const character = characters[characterIndex];
            chatConfig = {
                type: 'character',
                character: character,
                topic: topic,
                questionModel: questionModel,
                answerModel: answerModel,
                maxRounds: maxRounds,
                unlimitedRounds: unlimitedRounds,
                questionInstructions: elements.questionInstructions.value.trim(),
                answerInstructions: elements.answerInstructions.value.trim()
            };
        } else if (activeTab.id === 'customTab') {
            topic = elements.customTopicCustomInput ? elements.customTopicCustomInput.value.trim() : '';
            const style = elements.customStyleInput.value.trim();
            if (!topic) {
                alert('אנא הכנס נושא שיחה עבור הצ\'אט המותאם אישית.');
                return;
            }
            chatConfig = {
                type: 'custom',
                topic: topic,
                style: style || 'שיחה כללית ופתוחה',
                questionModel: questionModel,
                answerModel: answerModel,
                maxRounds: maxRounds,
                unlimitedRounds: unlimitedRounds,
                questionInstructions: elements.questionInstructions.value.trim(),
                answerInstructions: elements.answerInstructions.value.trim()
            };
        } else {
            // לשונית הגדרות מתקדמות - נחזור לבחור דמות או מותאם אישית
            alert('אנא בחר דמות או הגדר צ\'אט מותאם אישית כדי להתחיל.');
            return;
        }
        
        startChat(chatConfig);
        hideSection(elements.setupModal);
    });

    // ==========================================
    // Settings Modal Events
    // ==========================================
    
    elements.closeSettingsModal.addEventListener('click', () => hideSection(elements.settingsModal));
    
    elements.toggleNewApiKey.addEventListener('click', () => {
        togglePasswordVisibility(elements.newApiKeyInput, elements.toggleNewApiKey);
    });
    
    elements.saveSettingsBtn.addEventListener('click', async () => {
        const newKey = elements.newApiKeyInput.value.trim();
        
        if (newKey) {
            const testResult = await testApiKey(newKey);
            if (testResult.success) {
                saveApiKey(newKey);
                alert('מפתח ה-API עודכן בהצלחה!');
            } else {
                alert(`מפתח ה-API אינו תקין: ${testResult.error}`);
                return;
            }
        }
        
        // שמירת מודל ברירת מחדל
        appSettings.defaultModel = elements.defaultModel.value;
        saveSettings();
        
        hideSection(elements.settingsModal);
    });
    
    elements.clearHistoryBtn.addEventListener('click', clearAllHistory);

    // ==========================================
    // Podcast Modal Events
    // ==========================================
    
    elements.closePodcastModal.addEventListener('click', () => hideSection(elements.podcastModal));
    
    // בחירת תצורת דוברים
    document.querySelectorAll('.speaker-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.speaker-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // עדכון התסריט אם כבר נוצר
            if (elements.podcastScript.value) {
                generatePodcastScript();
            }
        });
    });
    
    elements.generateScriptBtn.addEventListener('click', generatePodcastScript);
    
    elements.editScriptBtn.addEventListener('click', () => {
        if (elements.podcastScript.classList.contains('hidden')) {
            elements.podcastScript.value = elements.podcastScriptPreview.textContent;
            hideSection(elements.podcastScriptPreview);
            showSection(elements.podcastScript);
            elements.editScriptBtn.innerHTML = '<i class="fas fa-check"></i> סיים עריכה';
        } else {
            elements.podcastScriptPreview.textContent = elements.podcastScript.value;
            hideSection(elements.podcastScript);
            showSection(elements.podcastScriptPreview);
            elements.editScriptBtn.innerHTML = '<i class="fas fa-edit"></i> ערוך תסריט';
        }
    });
    
    elements.createPodcastBtn.addEventListener('click', createPodcast);
});

// Declare marked variable to avoid undeclared variable error
window.marked = window.marked || { parse: (text) => text };
