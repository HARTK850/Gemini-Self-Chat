import { GoogleGenerativeAI } from "https://esm.run/@google-generative-ai/web";

const API_KEY_STORAGE_KEY = 'geminiApiKey';
const CHAT_HISTORY_STORAGE_KEY = 'geminiChatHistory';

const elements = {
    loading: document.getElementById('loading'),
    apiSetup: document.getElementById('apiSetup'),
    apiKeyInput: document.getElementById('apiKey'),
    apiForm: document.getElementById('apiForm'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    mainApp: document.getElementById('mainApp'),
    newChatBtn: document.getElementById('newChatBtn'),
    exportBtn: document.getElementById('exportBtn'),
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
    setupModal: document.getElementById('setupModal'),
    closeSetupModal: document.getElementById('closeSetupModal'),
    setupTabs: document.querySelector('.setup-tabs'),
    characterTab: document.getElementById('characterTab'),
    customTab: document.getElementById('customTab'),
    settingsTab: document.getElementById('settingsTab'), // זה לא טאב שצריך להיות כאן, אלא בכפתור ההגדרות הכללי
    characterGrid: document.getElementById('characterGrid'),
    customTopicInput: document.getElementById('customTopic'), // השדה בטאב הדמויות
    customTopicCustomInput: document.getElementById('customTopicCustom'), // השדה בטאב המותאם אישית
    customStyleInput: document.getElementById('customStyle'),
    questionInstructions: document.getElementById('questionInstructions'),
    answerInstructions: document.getElementById('answerInstructions'),
    startCustomChatBtn: document.getElementById('startCustomChat'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    newApiKeyInput: document.getElementById('newApiKey'),
    toggleNewApiKey: document.getElementById('toggleNewApiKey'),
    clearHistoryBtn: document.getElementById('clearHistory'),
    saveSettingsBtn: document.getElementById('saveSettings')
};

let genAI;
let currentChat = null; // Stores the current chat session data
let chatInterval = null;
let isPaused = false;

// --- Character Definitions ---
// שימו לב! הוספתי כאן דוגמאות לדמויות נוספות מעבר ל-20 שכבר היו.
// כדי להוסיף 20 דמויות נוספות, תוכלו להמשיך את הרשימה באותו פורמט.
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
        prompt: 'אני נהג אוטובוס תל-אביבי אחרי משמרת כפולה. תפקידי לשאול שאלות מציאותיות וקצת עייפות, בין 5 ל-20 מילים, על חיי היומיום. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'נו, מתי כבר יבנו פה רכבת קלה אמיתית?\', \'האם הפקק הזה אי פעם ייגמר, לדעתך?\''
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
        prompt: 'אני בלש פרטי אנגלי, בעל חשיבה אנליטית חדה. תפקידי לשאול שאלות מורכבות וחקירתיות, בין 5 ל-20 מילים, במבטא אנגלי קל. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מהן הנסיבות המדויקות שהובילו לאירוע?\', \'האם ישנם פרטים נוספים שלא נחשפו?\''
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
        prompt: 'אני מדריך טיולים היסטורי, מרותק לעבר. תפקידי לשאול שאלות מעמיקות על אירועים היסטוריים ומשמעותם, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'איך השפיע האירוע הזה על מהלך ההיסטוריה?\', \'מה אנו יכולים ללמוד מכך לימינו?\''
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
        prompt: 'אני עיתונאי חוקר, לא חושש לחשוף את האמת. תפקידי לשאול שאלות נוקבות וביקורתיות, בין 5 ל-20 מילים, על אירועים אקטואליים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'האם הציבור אכן מודע לכל הפרטים?\', \'מי באמת הרוויח מהמהלך הזה?\''
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
    // --- התחלה של 20 דמויות נוספות (דוגמאות) ---
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
        prompt: 'אני אופה מקצועי, מאוהב בקמח ובצק. תפקידי לשאול שאלות על מרכיבים, טכניקות אפייה וסודות קולינריים, בין 5 ל-20 מילים. שאל כאילו אתה מראיין, ותמיד בסיום המשפט שאל עם סימן שאלה. לדוגמה: \'מה הסוד לבצק שמרים רך ואוורירי?\', \'איזה קינוח ישראלי כובש את העולם?\''
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
        name: 'מטייל עולמי',
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
    // כאן תוכל להוסיף 10 דמויות נוספות כדי להשלים ל-40 סך הכל
];

// --- Utility Functions ---

// Loads API key from local storage
function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

// Saves API key to local storage
function saveApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

// Toggles password visibility
function togglePasswordVisibility(inputElement, toggleButton) {
    const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
    inputElement.setAttribute('type', type);
    toggleButton.querySelector('i').classList.toggle('fa-eye');
    toggleButton.querySelector('i').classList.toggle('fa-eye-slash');
}

// Initialize Gemini AI
function initializeGemini(apiKey) {
    if (apiKey) {
        try {
            genAI = new GoogleGenerativeAI(apiKey);
            // Optionally, try a dummy call to verify API key
            // This is a simple verification, a more robust one would involve a real model call
            // but for initial setup, just instantiating the object is often enough.
            console.log("Gemini AI initialized successfully.");
            return true;
        } catch (error) {
            console.error("Error initializing Gemini AI:", error);
            alert("שגיאה באתחול Gemini AI. ייתכן שמפתח ה-API אינו תקין.");
            return false;
        }
    }
    return false;
}

// Display/hide sections
function showSection(sectionElement) {
    sectionElement.classList.remove('hidden');
}

function hideSection(sectionElement) {
    sectionElement.classList.add('hidden');
}

// Call Gemini API
async function callGeminiAPI(history) {
    if (!genAI) {
        throw new Error("Gemini API not initialized. Please set your API key.");
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });
        const result = await chat.sendMessageStream(''); // Send empty message to get stream response based on history
        let fullText = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            // You might want to update UI with partial text here, but for simplicity, we'll get full text first
        }
        return fullText;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More specific error handling for common API issues
        if (error.response && error.response.status === 403) {
            throw new Error("מפתח API אינו מורשה או פג תוקף. אנא בדוק אותו.");
        } else if (error.response && error.response.status === 429) {
            throw new Error("חריגה ממכסת השימוש במפתח ה-API. אנא נסה שוב מאוחר יותר.");
        }
        throw new Error(`שגיאה בתקשורת עם Gemini API: ${error.message}.`);
    }
}

// Add message to chat display
function addMessageToChat(type, sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');
    headerDiv.innerHTML = `<strong>${sender}</strong>`;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = marked.parse(content); // Use marked.js for Markdown rendering

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight; // Scroll to bottom
}

// --- Chat Logic ---

// Generates a question from the selected character/custom style
async function generateQuestion() {
    const config = currentChat.config;
    let prompt = '';
    let characterIntro = '';
    
    // Determine the topic for the prompt
    let topicForPrompt = config.topic;
    if (!topicForPrompt && config.type === 'character') {
        // Fallback for character if no specific topic was entered, use character description as a general topic idea
        topicForPrompt = `נושא כללי שמתאים ל${config.character.name} (${config.character.description})`;
    } else if (!topicForPrompt) {
        // Fallback for custom if no topic was entered (should be caught by validation)
        topicForPrompt = 'נושא כללי';
    }


    if (config.type === 'character') {
        characterIntro = `אני ${config.character.name} (${config.character.description}).`;
        // הפרומפט לדמות: הציג את עצמך, שאל שאלה בין 5 ל-20 מילים על הנושא הנבחר, הסבר בקצרה למה השאלה רלוונטית לנושא.
        prompt = `${characterIntro} שאל/י שאלה אחת בלבד, בין 5 ל-20 מילים, המשקפת את סגנונך, על הנושא: "${topicForPrompt}". הסבר/י בקצרה איך השאלה מתקשרת לנושא, ותמיד בסיום המשפט שאל/י עם סימן שאלה. אל תכלול/י את המילה "ג'מיני" בשאלה. ודא/י שהשאלה הנוכחית שונה לחלוטין משאלות קודמות שעלולות להופיע בהיסטוריה. ${config.questionInstructions}`;
    } else { // Custom chat
        // הפרומפט למצב מותאם אישית: שאל שאלה על הנושא והסגנון, הסבר למה השאלה רלוונטית.
        prompt = `שאל/י שאלה אחת בלבד, בין 5 ל-20 מילים, על הנושא: "${topicForPrompt}" בסגנון "${config.style}". הסבר/י בקצרה איך השאלה מתקשרת לנושא, ותמיד להסתיים בסימן שאלה. אל תכלול/י את המילה "ג'מיני" בשאלה. השאלה צריכה להיות ייחודית ולא לחזור על שאלות קודמות. ${config.questionInstructions}`;
    }

    const conversationHistory = [];
    // Add previous messages to history for context
    if (currentChat && currentChat.messages.length > 0) {
        currentChat.messages.forEach(msg => {
            conversationHistory.push({
                role: msg.type === 'question' ? 'user' : 'model', // 'user' is the character/you asking, 'model' is Gemini
                parts: [{ text: msg.content }]
            });
        });
    }

    conversationHistory.push({
        role: "user",
        parts: [{ text: prompt }]
    });

    const rawResponse = await callGeminiAPI(conversationHistory);
    
    // Attempt to parse the actual question from the response.
    // This is a heuristic and might need fine-tuning depending on Gemini's output.
    let question = rawResponse.trim();

    // Look for common phrases indicating the start of the explanation or character intro
    // And try to extract only the question part.
    const explanationStartRegex = /(?:שאלה זו|השאלה הזו|זו שאלה|שאלתי את זה|זה קשור לנושא|זה חשוב כי|זה נוגע ל|זה מראה ש|כפי שציינתי)/;
    const introEndRegex = /(?:\.|\?|\!) *$/; // Finds the end of a sentence for intro
    
    // Remove character intro if it's there
    if (config.type === 'character' && question.startsWith(characterIntro)) {
        question = question.substring(characterIntro.length).trim();
    }

    // Try to find an explanation part and remove it
    const explanationMatch = question.match(explanationStartRegex);
    if (explanationMatch) {
        question = question.substring(0, explanationMatch.index).trim();
    }

    // Ensure it ends with a question mark if it's a question, or at least a punctuation
    if (!question.endsWith('?') && !question.endsWith('.') && !question.endsWith('!')) {
        question += '?';
    }

    // Remove any leading/trailing quotes if Gemini adds them
    question = question.replace(/^["']|["']$/g, '');

    return question;
}


// Generates an answer from Gemini
async function generateAnswer(question) {
    const config = currentChat.config;
    // Base prompt for the answer, ensuring it responds to the specific question and topic.
    let answerPrompt = `אתה ג'מיני. ענה/י על השאלה הבאה מנקודת מבט אובייקטיבית, מפורטת ועניינית. הקפד/י להתייחס לשאלה הספציפית שנשאלה, ולא לשאול שאלות בחזרה. התשובה צריכה להיות בין 10 ל-50 מילים. התייחס/י ל"נושא השיחה" של הצ'אט, שהוא "${config.topic}". השאלה שנשאלה: "${question}"`;
    
    // Add specific answer instructions if provided
    if (config.answerInstructions) {
        answerPrompt += ` ${config.answerInstructions}`;
    }

    const conversationHistory = [];
    // Add previous messages to history for context (this time, the question is from the user role for Gemini to answer)
    if (currentChat && currentChat.messages.length > 0) {
        currentChat.messages.forEach(msg => {
            conversationHistory.push({
                role: msg.type === 'question' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });
    }

    // Add the current question as the last user turn
    conversationHistory.push({
        role: "user",
        parts: [{ text: answerPrompt }] // The full prompt to Gemini to generate the answer
    });

    return await callGeminiAPI(conversationHistory);
}


// Main chat flow
async function runChatRound() {
    if (isPaused) { // If paused, don't run
        return;
    }
    
    if (currentChat.currentRound >= currentChat.maxRounds) {
        stopChat();
        return;
    }

    elements.chatStatus.textContent = 'הדמות חושבת...';
    elements.chatStatus.style.color = '#FFA500'; // Orange for thinking
    elements.pauseBtn.disabled = true; // Disable pause during generation
    elements.stopChatBtn.disabled = true; // Disable stop during generation

    try {
        const questionText = await generateQuestion();
        addMessageToChat('question', currentChat.config.character ? currentChat.config.character.name : 'אתה', questionText);
        currentChat.messages.push({ type: 'question', content: questionText });
        saveChatHistory();

        elements.chatStatus.textContent = 'ג\'מיני עונה...';
        elements.chatStatus.style.color = '#3B82F6'; // Blue for answering

        const answerText = await generateAnswer(questionText);
        addMessageToChat('answer', 'ג\'מיני', answerText);
        currentChat.messages.push({ type: 'answer', content: answerText });
        saveChatHistory();

        currentChat.currentRound++;
        elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound}/${currentChat.maxRounds}`;
        
        elements.chatStatus.textContent = 'מוכן';
        elements.chatStatus.style.color = '#28a745'; // Green for ready
        elements.pauseBtn.disabled = false;
        elements.stopChatBtn.disabled = false;

        if (currentChat.currentRound >= currentChat.maxRounds) {
            elements.continueBtn.classList.remove('hidden');
            elements.chatStatus.textContent = 'צ\'אט הסתיים. לחץ להמשך או התחל חדש.';
            elements.chatStatus.style.color = '#6c757d'; // Grey for finished
        }

    } catch (error) {
        console.error("Error in chat round:", error);
        addMessageToChat('error', 'מערכת', `אירעה שגיאה: ${error.message}. אנא בדוק את מפתח ה-API שלך או נסה שוב.`);
        stopChat(); // Stop chat on error
    } finally {
        // Ensure buttons are re-enabled even if an error occurs
        elements.pauseBtn.disabled = false;
        elements.stopChatBtn.disabled = false;
    }
}

// Starts a new chat session
function startChat(config) {
    if (chatInterval) clearInterval(chatInterval); // Clear any existing interval

    currentChat = {
        id: Date.now(),
        title: config.type === 'character' ? config.character.name : config.topic,
        config: config,
        messages: [],
        currentRound: 0,
        maxRounds: 5,
        timestamp: new Date().toISOString()
    };

    elements.chatMessages.innerHTML = ''; // Clear previous messages
    elements.chatTitle.textContent = currentChat.title;
    elements.roundCounter.textContent = `סיבוב 0/5`;
    elements.chatStatus.textContent = 'מוכן';
    elements.chatStatus.style.color = '#28a745';
    elements.continueBtn.classList.add('hidden');
    elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    isPaused = false;

    hideSection(elements.welcomeScreen);
    showSection(elements.chatContainer);

    // Save initial chat state to history (before first messages)
    saveChatHistory();
    renderChatHistory(); // Update sidebar

    // Start the first round immediately, then set interval
    runChatRound(); // Run the first round without waiting for the interval
    chatInterval = setInterval(runChatRound, 7000); // Subsequent rounds every 7 seconds
}

// Continues the current chat for more rounds
function continueChat() {
    currentChat.maxRounds += 5;
    elements.continueBtn.classList.add('hidden');
    elements.chatStatus.textContent = 'מוכן';
    elements.chatStatus.style.color = '#28a745';
    elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    isPaused = false;
    chatInterval = setInterval(runChatRound, 7000);
    saveChatHistory(); // Save the updated maxRounds
}

// Pauses/resumes the chat
function togglePauseChat() {
    if (isPaused) {
        chatInterval = setInterval(runChatRound, 7000);
        elements.chatStatus.textContent = 'מוכן';
        elements.chatStatus.style.color = '#28a745';
        elements.pauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
    } else {
        clearInterval(chatInterval);
        elements.chatStatus.textContent = 'מושהה';
        elements.chatStatus.style.color = '#FFC107'; // Yellow for paused
        elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    }
    isPaused = !isPaused;
}

// Stops the current chat
function stopChat() {
    if (chatInterval) clearInterval(chatInterval);
    isPaused = true;
    elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    elements.chatStatus.textContent = 'צ\'אט הסתיים. התחל חדש.';
    elements.chatStatus.style.color = '#DC3545'; // Red for stopped
    elements.continueBtn.classList.remove('hidden');
    // We keep the current chat loaded but allow starting a new one
}

// --- Chat History Management ---

function getChatHistory() {
    const history = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
}

function saveChatHistory() {
    if (currentChat) {
        const history = getChatHistory();
        const existingIndex = history.findIndex(chat => chat.id === currentChat.id);
        if (existingIndex > -1) {
            history[existingIndex] = currentChat; // Update existing
        } else {
            history.unshift(currentChat); // Add new to top
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
    if (chatInterval) clearInterval(chatInterval); // Stop current running chat
    isPaused = true; // Always start loaded chat as paused
    elements.pauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');

    const history = getChatHistory();
    const chatToLoad = history.find(chat => chat.id === chatId);

    if (chatToLoad) {
        currentChat = chatToLoad;
        elements.chatMessages.innerHTML = '';
        currentChat.messages.forEach(msg => {
            const senderName = msg.type === 'question' ? (currentChat.config.character ? currentChat.config.character.name : 'אתה') : 'ג\'מיני';
            addMessageToChat(msg.type, senderName, msg.content);
        });

        elements.chatTitle.textContent = currentChat.title;
        elements.roundCounter.textContent = `סיבוב ${currentChat.currentRound}/${currentChat.maxRounds}`;
        elements.chatStatus.textContent = 'מושהה (טען היסטוריה)';
        elements.chatStatus.style.color = '#FFC107'; // Yellow for paused
        elements.continueBtn.classList.remove('hidden'); // Allow continuing
        elements.pauseBtn.disabled = false; // Enable pause button

        hideSection(elements.welcomeScreen);
        showSection(elements.chatContainer);
        renderChatHistory(); // Update active state in sidebar
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

// --- Export Chat ---
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
        const senderName = msg.type === 'question' ? (currentChat.config.character ? currentChat.config.character.name : 'אתה') : 'ג\'מיני';
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


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    const storedApiKey = getApiKey();
    if (initializeGemini(storedApiKey)) {
        hideSection(elements.loading);
        hideSection(elements.apiSetup);
        showSection(elements.mainApp);
        renderChatHistory();
    } else {
        // If initializeGemini failed (e.g., API key problem), show setup
        hideSection(elements.loading);
        showSection(elements.apiSetup);
    }

    // API Key Setup events
    elements.apiForm.addEventListener('submit', async (e) => { // Added async here
        e.preventDefault();
        const apiKey = elements.apiKeyInput.value.trim();
        if (apiKey) {
            if (initializeGemini(apiKey)) {
                saveApiKey(apiKey); // Save only if initialization succeeded
                hideSection(elements.apiSetup);
                showSection(elements.mainApp);
                renderChatHistory();
            } else {
                // Error message already shown by initializeGemini
            }
        } else {
            alert('אנא הכנס מפתח API.');
        }
    });

    elements.toggleApiKey.addEventListener('click', () => {
        togglePasswordVisibility(elements.apiKeyInput, elements.toggleApiKey);
    });

    // Main App buttons
    elements.newChatBtn.addEventListener('click', () => {
        showSection(elements.setupModal);
        // Reset setup modal fields and select first tab
        elements.customTopicInput.value = '';
        elements.customTopicCustomInput.value = '';
        elements.customStyleInput.value = '';
        elements.questionInstructions.value = '';
        elements.answerInstructions.value = '';
        
        // Ensure character tab is active by default and custom is not
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        elements.setupTabs.querySelector('[data-tab="character"]').classList.add('active');
        elements.characterTab.classList.add('active');
        
        // Deselect any previously selected character
        document.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    });

    elements.exportBtn.addEventListener('click', exportChat);
    elements.settingsBtn.addEventListener('click', () => {
        elements.newApiKeyInput.value = getApiKey() || ''; // Load current key into settings field
        showSection(elements.settingsModal);
    });

    // Chat control buttons
    elements.startChatBtn.addEventListener('click', () => {
        elements.newChatBtn.click(); // Simulate click on new chat button to open setup modal
    });
    elements.continueBtn.addEventListener('click', continueChat);
    elements.pauseBtn.addEventListener('click', togglePauseChat);
    elements.stopChatBtn.addEventListener('click', stopChat);

    // Setup Modal events
    elements.closeSetupModal.addEventListener('click', () => hideSection(elements.setupModal));

    elements.setupTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab + 'Tab').classList.add('active');
        }
    });

    // Populate character grid
    elements.characterGrid.innerHTML = ''; // Clear existing to prevent duplicates on re-load
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

    elements.startCustomChatBtn.addEventListener('click', () => {
        const selectedCharacterCard = document.querySelector('.character-card.selected');
        let chatConfig = {};
        let topic = '';

        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'characterTab') {
            if (!selectedCharacterCard) {
                alert('אנא בחר דמות כדי להתחיל צ\'אט.');
                return;
            }
            topic = elements.customTopicInput.value.trim(); // Get topic from character tab's topic input
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
                questionInstructions: elements.questionInstructions.value.trim(),
                answerInstructions: elements.answerInstructions.value.trim()
            };
        } else if (activeTab.id === 'customTab') {
            topic = elements.customTopicCustomInput.value.trim(); // Get topic from custom tab's topic input
            const style = elements.customStyleInput.value.trim();
            if (!topic) {
                alert('אנא הכנס נושא שיחה עבור הצ\'אט המותאם אישית.');
                return;
            }
            chatConfig = {
                type: 'custom',
                topic: topic,
                style: style || 'שיחה כללית ופתוחה',
                questionInstructions: elements.questionInstructions.value.trim(),
                answerInstructions: elements.answerInstructions.value.trim()
            };
        } else { // Settings tab or no selection - this case should not happen if tabs are managed correctly
            alert('אנא בחר דמות או הגדר צ\'אט מותאם אישית כדי להתחיל.');
            return;
        }
        
        startChat(chatConfig);
        hideSection(elements.setupModal);
    });

    // Settings Modal events
    elements.closeSettingsModal.addEventListener('click', () => hideSection(elements.settingsModal));
    elements.toggleNewApiKey.addEventListener('click', () => {
        togglePasswordVisibility(elements.newApiKeyInput, elements.toggleNewApiKey);
    });
    elements.saveSettingsBtn.addEventListener('click', () => {
        const newKey = elements.newApiKeyInput.value.trim();
        if (newKey) {
            // Re-initialize Gemini with the new key to verify it
            if (initializeGemini(newKey)) {
                saveApiKey(newKey);
                alert('מפתח ה-API עודכן בהצלחה!');
            }
        } else {
            // If the user cleared the key, remove it from local storage
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            genAI = null; // Clear the Gemini instance
            alert('מפתח ה-API נמחק. האפליקציה תחזור למסך ההגדרה בעת ריענון.');
        }
        hideSection(elements.settingsModal);
    });
    elements.clearHistoryBtn.addEventListener('click', clearAllHistory);
});
