// Storage Access Layer - Universal Multi-Cloud Sync (Turso + Supabase + Cloudflare v29.0)

const DB_VERSION = "29.0";

const DEFAULT_SETTINGS = {
    roomNo: "803",
    currency: "AED",
    adminPassword: "admin",
    initialized: true,
    tursoEnabled: true,
    tursoConfig: {
        url: "https://room-803-mess-db-mess-management-system.aws-eu-west-1.turso.io",
        token: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ2MjAzMDUsImlkIjoiMDE5ZjgzYTctZGYwMS03Y2RiLWExMjEtNjZlYWZjMTYwM2QxIiwia2lkIjoidmFPTk5yY213b1FucVZQTE1nMW9WOUtSVTBpb3IwdjZxZGphRllUa3RzTSIsInJpZCI6IjBiOTMzOWFkLWZkMDgtNDlkOC1iZDdlLTk4ZTlkZGQyZDQyZCJ9.2_0CS2j9S3G8OjVv_lmlTwmAUMD_6m06_Vj7awJwK-Kb1rPcN7ObtfOdwyxJ2jrJbdGFbF0I3TaCQ5U9sW0aAA"
    },
    supabaseEnabled: true,
    supabaseConfig: {
        url: "https://axlrkczeslvnxyumvpnm.supabase.co",
        key: "sb_publishable_DYrlzJQSqLCvfUVQbqWCSQ_NAZy01dE"
    }
};

const DEFAULT_MEMBERS = [
    { "id": "m1784553643872", "name": "Mohd Shareef k", "email": "mohammedshareefk009@gmail.com", "phone": "+919567260289", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784553711255", "name": "Mithun PV", "email": "", "phone": "+971545756790", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784553756783", "name": "Mohd Fayis", "email": "", "phone": "+971545153203", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784553791327", "name": "Murshid", "email": "", "phone": "+971545028712", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784553828110", "name": "Basheer", "email": "", "phone": "+919567783414", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784553938365", "name": "Nihal", "email": "", "phone": "+917994059903", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784554513865", "name": "Shareef T", "email": "", "phone": "+971555510207", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784554572288", "name": "Rishal", "email": "", "phone": "+919747467747", "status": "active", "joinedDate": "2026-07-15" },
    { "id": "m1784554625111", "name": "Uvais", "email": "", "phone": "+971567289280", "status": "active", "joinedDate": "2026-07-15" },
    { "id": "m1784554656807", "name": "Ibrahim", "email": "", "phone": "+971567502759", "status": "active", "joinedDate": "2026-07-15" },
    { "id": "m1784554686791", "name": "Arshav", "email": "", "phone": "+971558619294", "status": "active", "joinedDate": "2026-07-15" },
    { "id": "m1784554722807", "name": "Nizam", "email": "", "phone": "+919659868453", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784554751606", "name": "Vimal", "email": "", "phone": "+919567070408", "status": "active", "joinedDate": "2026-07-13" },
    { "id": "m1784554781446", "name": "Jithin", "email": "", "phone": "+918943594501", "status": "inactive", "joinedDate": "2026-07-13" },
    { "id": "m1784554851526", "name": "Fayas", "email": "", "phone": "+971555907036", "status": "active", "joinedDate": "2026-07-13" }
];

const DEFAULT_BILLS = [
    { "id": "b1784555418921", "date": "2026-07-13", "notes": "", "title": "Shoukath", "amount": 350, "category": "Food", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784555485208", "date": "2026-07-16", "notes": "", "title": "water", "amount": 40, "category": "Others", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554722807", "m1784554851526"] },
    { "id": "b1784555785470", "date": "2026-07-13", "notes": "", "title": "Mill", "amount": 684, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784555823445", "date": "2026-07-13", "notes": "", "title": "Gas", "amount": 135, "category": "Utilities", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784555985228", "date": "2026-07-13", "notes": "", "title": "Fridge Repaire", "amount": 185, "category": "Others", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554751606", "m1784554851526"] },
    { "id": "b1784556061252", "date": "2026-07-13", "notes": "", "title": "Cleaning Iteams", "amount": 60, "category": "Others", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554722807", "m1784554751606", "m1784554851526"] },
    { "id": "b1784556089539", "date": "2026-07-13", "notes": "", "title": "Mixi", "amount": 250, "category": "Others", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554751606", "m1784554851526"] },
    { "id": "b1784556152970", "date": "2026-07-13", "notes": "", "title": "Mark & Save", "amount": 235, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784556181226", "date": "2026-07-14", "notes": "", "title": "Freshcart", "amount": 18.5, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784556207082", "date": "2026-07-14", "notes": "", "title": "chiken", "amount": 131, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784556268489", "date": "2026-07-15", "notes": "", "title": "Groceries ( 4 Egg)", "amount": 3, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784556307226", "date": "2026-07-18", "notes": "", "title": "Freshcart", "amount": 88, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] },
    { "id": "b1784556348658", "date": "2026-07-19", "notes": "", "title": "Mark & Save", "amount": 390, "category": "Groceries", "invoiceName": "", "applicableMembers": ["m1784553643872", "m1784553711255", "m1784553756783", "m1784553791327", "m1784553828110", "m1784553938365", "m1784554513865", "m1784554572288", "m1784554625111", "m1784554656807", "m1784554686791", "m1784554851526"] }
];

const DEFAULT_PAYMENTS = {
    "2026-07": {
        "m1784553643872": { "paid": false, "amount": 0, "payDate": "" },
        "m1784553711255": { "paid": false, "amount": 0, "payDate": "" },
        "m1784553756783": { "paid": false, "amount": 0, "payDate": "" },
        "m1784553791327": { "paid": false, "amount": 0, "payDate": "" },
        "m1784553828110": { "paid": false, "amount": 0, "payDate": "" },
        "m1784553938365": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554513865": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554572288": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554625111": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554656807": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554686791": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554722807": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554751606": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554781446": { "paid": false, "amount": 0, "payDate": "" },
        "m1784554851526": { "paid": false, "amount": 0, "payDate": "" }
    }
};

const DEFAULT_ATTENDANCE = {
    "2026-07-13": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": false, "dinner": false }, "m1784554625111": { "lunch": false, "dinner": false }, "m1784554656807": { "lunch": false, "dinner": false }, "m1784554686791": { "lunch": false, "dinner": false }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-14": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": false, "dinner": false }, "m1784554625111": { "lunch": false, "dinner": false }, "m1784554656807": { "lunch": false, "dinner": false }, "m1784554686791": { "lunch": false, "dinner": false }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-15": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-16": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-17": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-18": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": true, "dinner": true } },
    "2026-07-19": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": false, "dinner": false } },
    "2026-07-20": { "m1784553643872": { "lunch": true, "dinner": true }, "m1784553711255": { "lunch": true, "dinner": true }, "m1784553756783": { "lunch": true, "dinner": true }, "m1784553791327": { "lunch": true, "dinner": true }, "m1784553828110": { "lunch": true, "dinner": true }, "m1784553938365": { "lunch": true, "dinner": true }, "m1784554513865": { "lunch": true, "dinner": true }, "m1784554572288": { "lunch": true, "dinner": true }, "m1784554625111": { "lunch": true, "dinner": true }, "m1784554656807": { "lunch": true, "dinner": true }, "m1784554686791": { "lunch": true, "dinner": true }, "m1784554722807": { "lunch": false, "dinner": false }, "m1784554751606": { "lunch": false, "dinner": false }, "m1784554851526": { "lunch": false, "dinner": false } }
};

const DEFAULT_MENU = {
    "Friday": { "lunch": "Ghee Rice + Chicken Curry", "dinner": "Fish Curry" },
    "Monday": { "lunch": "Meals + Fish Fry + Veg Curry", "dinner": "Puttu + Kadala Curry" },
    "Sunday": { "lunch": "Biriyani + Salad", "dinner": "Veg or No Veg" },
    "Tuesday": { "lunch": "Meals + Fish Curry + Upperi", "dinner": "Dosha + Greenpes Curry" },
    "Saturday": { "lunch": "Meals + Fish Fry + Veg Curry", "dinner": "Chiken Fry +Kuboos" },
    "Thursday": { "lunch": "Meals + Fish Curry + Upperi", "dinner": "Roti + Aloo Keema" },
    "Wednesday": { "lunch": "Meals + Fish Fry + Veg Curry", "dinner": "Biriyani + Salad" }
};

const DEFAULT_RULES = [
    "Monthly expenses are compiled and split on the 10th of each month (mess period runs 10th of month to 9th of next month).",
    "Please notify the admin for any guest meals 3 hours in advance.",
    "Receipt invoices for all items are uploaded under the Bills tab."
];

// Turso HTTP Client
const tursoClient = {
    async query(url, token, sql, args = []) {
        if (!url || !token) return null;
        const cleanUrl = url.replace(/\/$/, "").replace(/^libsql:\/\//, "https://");
        const endpoint = `${cleanUrl}/v2/pipeline`;

        const reqArgs = args.map(a => {
            if (typeof a === "number") return { type: "integer", value: String(a) };
            if (typeof a === "boolean") return { type: "integer", value: a ? "1" : "0" };
            return { type: "text", value: String(a) };
        });

        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                requests: [
                    { type: "execute", stmt: { sql, args: reqArgs } },
                    { type: "close" }
                ]
            })
        });

        if (!res.ok) {
            throw new Error(`Turso Error: ${res.statusText}`);
        }
        return await res.json();
    }
};

const db = {
    supabaseClient: null,
    supabaseChannel: null,
    isSupabaseSyncing: false,
    isTursoSyncing: false,
    isInitialized: false,
    isConnecting: false,
    sdkLoadingPromise: null,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        const currentVersion = localStorage.getItem("mess_version");
        if (currentVersion !== DB_VERSION) {
            localStorage.setItem("mess_settings", JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem("mess_members", JSON.stringify(DEFAULT_MEMBERS));
            localStorage.setItem("mess_bills", JSON.stringify(DEFAULT_BILLS));
            localStorage.setItem("mess_payments", JSON.stringify(DEFAULT_PAYMENTS));
            localStorage.setItem("mess_attendance", JSON.stringify(DEFAULT_ATTENDANCE));
            localStorage.setItem("mess_menu", JSON.stringify(DEFAULT_MENU));
            localStorage.setItem("mess_rules", JSON.stringify(DEFAULT_RULES));
            localStorage.setItem("mess_version", DB_VERSION);
        }

        if (!localStorage.getItem("mess_initialized")) {
            localStorage.setItem("mess_settings", JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem("mess_members", JSON.stringify(DEFAULT_MEMBERS));
            localStorage.setItem("mess_bills", JSON.stringify(DEFAULT_BILLS));
            localStorage.setItem("mess_payments", JSON.stringify(DEFAULT_PAYMENTS));
            localStorage.setItem("mess_menu", JSON.stringify(DEFAULT_MENU));
            localStorage.setItem("mess_attendance", JSON.stringify(DEFAULT_ATTENDANCE));
            localStorage.setItem("mess_rules", JSON.stringify(DEFAULT_RULES));
            localStorage.setItem("mess_initialized", "true");
        }

        const settings = JSON.parse(localStorage.getItem("mess_settings") || "{}");
        
        if (settings.tursoConfig && settings.tursoConfig.url && settings.tursoConfig.token) {
            this.connectTurso(settings.tursoConfig.url, settings.tursoConfig.token);
        }

        if (settings.supabaseConfig) {
            this.connectSupabase(settings.supabaseConfig.url, settings.supabaseConfig.key);
        }
    },

    getMonthRange(monthStr) {
        const parts = (monthStr || "").split("-");
        const year = parseInt(parts[0]) || 2026;
        const month = parseInt(parts[1]) || 7;

        let nextYear = year;
        let nextMonth = month + 1;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
        }

        const startDateStr = `${year}-${String(month).padStart(2, '0')}-10`;
        const endDateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-09`;

        const startObj = new Date(year, month - 1, 10);
        const endObj = new Date(nextYear, nextMonth - 1, 9);

        const dates = [];
        let cur = new Date(startObj);
        while (cur <= endObj) {
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const d = String(cur.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
            cur.setDate(cur.getDate() + 1);
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const startMonthName = monthNames[month - 1];
        const endMonthName = monthNames[nextMonth - 1];
        const fullStartName = fullMonthNames[month - 1];
        
        const label = `${fullStartName} ${year} (10 ${startMonthName} - 09 ${endMonthName})`;
        const shortLabel = `10 ${startMonthName} - 09 ${endMonthName}`;

        return {
            startDate: startDateStr,
            endDate: endDateStr,
            dates,
            label,
            shortLabel,
            startMonthName,
            endMonthName,
            year,
            month
        };
    },

    getMessMonthFromDate(dateStr) {
        if (!dateStr || dateStr.length < 10) return "";
        const parts = dateStr.substring(0, 10).split("-");
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        if (day < 10) {
            month -= 1;
            if (month === 0) {
                month = 12;
                year -= 1;
            }
        }
        return `${year}-${String(month).padStart(2, '0')}`;
    },

    getSelectedMonth() {
        const saved = localStorage.getItem("mess_selected_month");
        if (saved && /^\d{4}-\d{2}$/.test(saved)) {
            return saved;
        }
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return this.getMessMonthFromDate(dateStr);
    },

    setSelectedMonth(monthStr) {
        if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
            localStorage.setItem("mess_selected_month", monthStr);
            document.dispatchEvent(new CustomEvent("month-changed", { detail: { month: monthStr } }));
        }
    },

    getClosedMonths() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_closed_months") || "{}");
        return res;
    },

    async setMonthClosed(monthStr, isClosed = true) {
        const closedMonths = this.getClosedMonths();
        if (isClosed) {
            closedMonths[monthStr] = {
                closed: true,
                closedAt: new Date().toISOString(),
                closedBy: sessionStorage.getItem("current_admin_user") || "Admin"
            };
        } else {
            delete closedMonths[monthStr];
        }
        localStorage.setItem("mess_closed_months", JSON.stringify(closedMonths));
        await this.syncAll();
        document.dispatchEvent(new CustomEvent("db-updated"));
    },

    isMonthClosed(monthStr) {
        const month = monthStr || this.getSelectedMonth();
        const closedMonths = this.getClosedMonths();
        if (closedMonths[month] && closedMonths[month].closed) {
            return true;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const range = this.getMonthRange(month);
        return range.endDate < todayStr;
    },

    async connectTurso(url, token) {
        try {
            await tursoClient.query(url, token, "CREATE TABLE IF NOT EXISTS mess_store (id INTEGER PRIMARY KEY, data TEXT)");
            const res = await tursoClient.query(url, token, "SELECT data FROM mess_store WHERE id = 803");
            
            if (res && res.results && res.results[0] && res.results[0].response && res.results[0].response.result) {
                const rows = res.results[0].response.result.rows;
                if (rows && rows.length > 0 && rows[0][0]) {
                    const cloudData = JSON.parse(rows[0][0].value);
                    if (cloudData.settings) localStorage.setItem("mess_settings", JSON.stringify(cloudData.settings));
                    if (cloudData.members) localStorage.setItem("mess_members", JSON.stringify(cloudData.members));
                    if (cloudData.bills) localStorage.setItem("mess_bills", JSON.stringify(cloudData.bills));
                    if (cloudData.payments) localStorage.setItem("mess_payments", JSON.stringify(cloudData.payments));
                    if (cloudData.menu) localStorage.setItem("mess_menu", JSON.stringify(cloudData.menu));
                    if (cloudData.attendance) localStorage.setItem("mess_attendance", JSON.stringify(cloudData.attendance));
                    if (cloudData.rules) localStorage.setItem("mess_rules", JSON.stringify(cloudData.rules));
                    localStorage.setItem("mess_closed_months", JSON.stringify(cloudData.closedMonths || {}));
                    document.dispatchEvent(new CustomEvent("db-updated"));
                } else {
                    await this.syncToTurso();
                }
            }
            this.isTursoSyncing = true;
            return true;
        } catch (err) {
            console.warn("Turso connection notice:", err);
            this.isTursoSyncing = false;
            return false;
        }
    },

    async syncToTurso() {
        const settings = this.getSettings();
        if (settings.tursoConfig && settings.tursoConfig.url && settings.tursoConfig.token) {
            try {
                const exportObj = this.exportData();
                const jsonStr = JSON.stringify(exportObj);
                await tursoClient.query(
                    settings.tursoConfig.url,
                    settings.tursoConfig.token,
                    "INSERT INTO mess_store (id, data) VALUES (803, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
                    [jsonStr]
                );
            } catch (err) {
                console.warn("Turso sync push notice:", err);
            }
        }
    },

    async loadSupabaseSDK() {
        if (window.supabase) return Promise.resolve();
        if (this.sdkLoadingPromise) return this.sdkLoadingPromise;

        this.sdkLoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return this.sdkLoadingPromise;
    },

    async connectSupabase(url, key) {
        if (this.supabaseClient || this.isConnecting) return true;
        this.isConnecting = true;

        try {
            await this.loadSupabaseSDK();
            const cleanUrl = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
            
            this.supabaseClient = window.supabase.createClient(cleanUrl, key);
            this.isSupabaseSyncing = true;

            const { data, error } = await this.supabaseClient
                .from('mess_store')
                .select('data')
                .eq('id', 803)
                .maybeSingle();

            if (error) {
                console.warn("Supabase Info:", error.message);
            } else if (data && data.data) {
                const cloudVersion = localStorage.getItem("mess_version");
                if (cloudVersion === DB_VERSION) {
                    const cloudData = data.data;
                    if (cloudData.settings) localStorage.setItem("mess_settings", JSON.stringify(cloudData.settings));
                    if (cloudData.members) localStorage.setItem("mess_members", JSON.stringify(cloudData.members));
                    if (cloudData.bills) localStorage.setItem("mess_bills", JSON.stringify(cloudData.bills));
                    if (cloudData.payments) localStorage.setItem("mess_payments", JSON.stringify(cloudData.payments));
                    if (cloudData.menu) localStorage.setItem("mess_menu", JSON.stringify(cloudData.menu));
                    if (cloudData.attendance) localStorage.setItem("mess_attendance", JSON.stringify(cloudData.attendance));
                    if (cloudData.rules) localStorage.setItem("mess_rules", JSON.stringify(cloudData.rules));
                    localStorage.setItem("mess_closed_months", JSON.stringify(cloudData.closedMonths || {}));
                } else {
                    await this.syncToSupabase();
                }
                document.dispatchEvent(new CustomEvent("db-updated"));
            } else {
                await this.syncToSupabase();
            }

            this.supabaseChannel = this.supabaseClient
                .channel('public:mess_store')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'mess_store' },
                    (payload) => {
                        if (payload.new && payload.new.data) {
                            const cloudData = payload.new.data;
                            if (cloudData.settings) localStorage.setItem("mess_settings", JSON.stringify(cloudData.settings));
                            if (cloudData.members) localStorage.setItem("mess_members", JSON.stringify(cloudData.members));
                            if (cloudData.bills) localStorage.setItem("mess_bills", JSON.stringify(cloudData.bills));
                            if (cloudData.payments) localStorage.setItem("mess_payments", JSON.stringify(cloudData.payments));
                            if (cloudData.menu) localStorage.setItem("mess_menu", JSON.stringify(cloudData.menu));
                            if (cloudData.attendance) localStorage.setItem("mess_attendance", JSON.stringify(cloudData.attendance));
                            if (cloudData.rules) localStorage.setItem("mess_rules", JSON.stringify(cloudData.rules));
                            localStorage.setItem("mess_closed_months", JSON.stringify(cloudData.closedMonths || {}));

                            document.dispatchEvent(new CustomEvent("db-updated"));
                        }
                    }
                )
                .subscribe();

            this.isConnecting = false;
            return true;
        } catch (error) {
            console.warn("Supabase connect notice:", error);
            this.isSupabaseSyncing = false;
            this.isConnecting = false;
            return false;
        }
    },

    async syncToSupabase() {
        if (this.isSupabaseSyncing && this.supabaseClient) {
            try {
                const exportObj = this.exportData();
                await this.supabaseClient
                    .from('mess_store')
                    .upsert({ id: 803, data: exportObj });
            } catch (err) {
                console.warn("Supabase push notice:", err);
            }
        }
    },

    async syncAll() {
        await this.syncToTurso();
        await this.syncToSupabase();
    },

    getSettings() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_settings"));
        return res || DEFAULT_SETTINGS;
    },

    saveSettings(settings) {
        localStorage.setItem("mess_settings", JSON.stringify(settings));
        this.syncAll();
    },

    getMembers() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_members"));
        return (Array.isArray(res) && res.length > 0) ? res : DEFAULT_MEMBERS;
    },

    saveMembers(members) {
        localStorage.setItem("mess_members", JSON.stringify(members));
        this.syncAll();
    },

    getBills() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_bills"));
        return (Array.isArray(res) && res.length > 0) ? res : DEFAULT_BILLS;
    },

    saveBills(bills) {
        localStorage.setItem("mess_bills", JSON.stringify(bills));
        this.syncAll();
    },

    getPayments() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_payments"));
        return res || DEFAULT_PAYMENTS;
    },

    savePayments(payments) {
        localStorage.setItem("mess_payments", JSON.stringify(payments));
        this.syncAll();
    },

    getMenu() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_menu"));
        return (res && Object.keys(res).length > 0) ? res : DEFAULT_MENU;
    },

    saveMenu(menu) {
        localStorage.setItem("mess_menu", JSON.stringify(menu));
        this.syncAll();
    },

    getAttendance() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_attendance"));
        return res || DEFAULT_ATTENDANCE;
    },

    saveAttendance(attendance) {
        localStorage.setItem("mess_attendance", JSON.stringify(attendance));
        this.syncAll();
    },

    getRules() {
        this.init();
        const res = JSON.parse(localStorage.getItem("mess_rules"));
        return (Array.isArray(res) && res.length > 0) ? res : DEFAULT_RULES;
    },

    saveRules(rules) {
        localStorage.setItem("mess_rules", JSON.stringify(rules));
        this.syncAll();
    },

    reset() {
        localStorage.removeItem("mess_settings");
        localStorage.removeItem("mess_members");
        localStorage.removeItem("mess_bills");
        localStorage.removeItem("mess_payments");
        localStorage.removeItem("mess_menu");
        localStorage.removeItem("mess_attendance");
        localStorage.removeItem("mess_rules");
        localStorage.removeItem("mess_closed_months");
        localStorage.removeItem("mess_initialized");
        localStorage.removeItem("mess_version");
        localStorage.removeItem("mess_selected_month");
        this.isInitialized = false;
        this.init();
    },

    importData(data) {
        if (data.settings) {
            localStorage.setItem("mess_settings", JSON.stringify(data.settings));
            localStorage.setItem("mess_members", JSON.stringify(data.members || DEFAULT_MEMBERS));
            localStorage.setItem("mess_bills", JSON.stringify(data.bills || DEFAULT_BILLS));
            localStorage.setItem("mess_payments", JSON.stringify(data.payments || {}));
            localStorage.setItem("mess_menu", JSON.stringify(data.menu || DEFAULT_MENU));
            localStorage.setItem("mess_attendance", JSON.stringify(data.attendance || {}));
            localStorage.setItem("mess_rules", JSON.stringify(data.rules || DEFAULT_RULES));
            localStorage.setItem("mess_closed_months", JSON.stringify(data.closedMonths || {}));
            localStorage.setItem("mess_initialized", "true");
            localStorage.setItem("mess_version", DB_VERSION);
            
            this.syncAll();
            return true;
        }
        return false;
    },

    exportData() {
        this.init();
        return {
            settings: this.getSettings(),
            members: this.getMembers(),
            bills: this.getBills(),
            payments: this.getPayments(),
            menu: this.getMenu(),
            attendance: this.getAttendance(),
            rules: this.getRules(),
            closedMonths: this.getClosedMonths()
        };
    },

    getPreviousMonthStr(monthStr) {
        const parts = monthStr.split("-");
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]) - 1;
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        return `${year}-${String(month).padStart(2, '0')}`;
    },

    getStats(targetMonth) {
        const month = targetMonth || this.getSelectedMonth();
        const monthRange = this.getMonthRange(month);
        const members = this.getMembers().filter(m => m.status === "active");
        const activeMemberIds = members.map(m => m.id);
        
        const allBills = this.getBills();
        const bills = allBills.filter(b => {
            if (!b || !b.date) return false;
            return b.date >= monthRange.startDate && b.date <= monthRange.endDate;
        });

        const payments = this.getPayments()[month] || {};
        const attendance = this.getAttendance();

        const totalMembers = members.length;
        const totalExpenses = bills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

        let totalMealsEatenInMonth = 0;
        const memberMealsMap = {};

        monthRange.dates.forEach(dateStr => {
            const dailyLogs = attendance[dateStr];

            members.forEach(m => {
                if (!memberMealsMap[m.id]) memberMealsMap[m.id] = 0;
                
                let lunch = true;
                let dinner = true;

                if (dailyLogs && dailyLogs[m.id] !== undefined) {
                    lunch = dailyLogs[m.id].lunch !== false;
                    dinner = dailyLogs[m.id].dinner !== false;
                }

                const mealsToday = (lunch ? 1 : 0) + (dinner ? 1 : 0);
                memberMealsMap[m.id] += mealsToday;
                totalMealsEatenInMonth += mealsToday;
            });
        });

        const memberShares = {};
        members.forEach(m => {
            memberShares[m.id] = {
                mealsEaten: memberMealsMap[m.id] || 0,
                foodShare: 0,
                fixedShare: 0,
                grossShareAmount: 0,
                advancePaid: 0,
                netShareAmount: 0,
                applicableBillCount: 0
            };
        });

        let totalFoodExpenses = 0;

        bills.forEach(bill => {
            const billAmount = parseFloat(bill.amount || 0);
            const category = (bill.category || "").toLowerCase();

            let targeted = Array.isArray(bill.applicableMembers) && bill.applicableMembers.length > 0
                ? bill.applicableMembers.filter(id => activeMemberIds.includes(id))
                : activeMemberIds;

            if (targeted.length === 0) targeted = activeMemberIds;

            const isFoodBill = ["food", "groceries", "supermarket", "cooking", "fresh meat"].includes(category);

            if (isFoodBill) {
                totalFoodExpenses += billAmount;
                let targetedMealsCount = 0;
                targeted.forEach(id => {
                    targetedMealsCount += (memberMealsMap[id] || 0);
                });

                const billCostPerMeal = targetedMealsCount > 0 ? (billAmount / targetedMealsCount) : 0;

                targeted.forEach(memberId => {
                    if (memberShares[memberId]) {
                        const mMeals = memberMealsMap[memberId] || 0;
                        memberShares[memberId].foodShare += (mMeals * billCostPerMeal);
                        memberShares[memberId].applicableBillCount++;
                    }
                });
            } else {
                const splitPerPerson = targeted.length > 0 ? (billAmount / targeted.length) : 0;

                targeted.forEach(memberId => {
                    if (memberShares[memberId]) {
                        memberShares[memberId].fixedShare += splitPerPerson;
                        memberShares[memberId].applicableBillCount++;
                    }
                });
            }
        });

        const overallCostPerMeal = totalMealsEatenInMonth > 0 ? (totalFoodExpenses / totalMealsEatenInMonth) : 0;

        let paidMembers = 0;
        let pendingMembers = 0;
        let amountCollected = 0;

        members.forEach(m => {
            const s = memberShares[m.id];
            s.foodShare = Math.round(s.foodShare * 100) / 100;
            s.fixedShare = Math.round(s.fixedShare * 100) / 100;
            s.grossShareAmount = Math.round((s.foodShare + s.fixedShare) * 100) / 100;

            const payInfo = payments[m.id] || {};
            const advancePaid = parseFloat(payInfo.advance || 0);
            s.advancePaid = advancePaid;

            s.netShareAmount = Math.max(0, Math.round((s.grossShareAmount - advancePaid) * 100) / 100);

            if (payInfo.paid) {
                paidMembers++;
                amountCollected += parseFloat(payInfo.amount || s.netShareAmount);
            } else {
                pendingMembers++;
            }
        });

        const balance = Math.max(0, Math.round((totalExpenses - amountCollected) * 100) / 100);

        const prevMonthStr = this.getPreviousMonthStr(month);
        const prevRange = this.getMonthRange(prevMonthStr);
        const prevBills = allBills.filter(b => b && b.date && b.date >= prevRange.startDate && b.date <= prevRange.endDate);
        const prevExpenses = prevBills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
        const prevPayments = this.getPayments()[prevMonthStr] || {};
        let prevCollected = 0;
        Object.keys(prevPayments).forEach(id => {
            if (prevPayments[id] && prevPayments[id].paid) {
                prevCollected += parseFloat(prevPayments[id].amount || 0);
            }
        });
        const prevClosingBalance = Math.max(0, Math.round((prevExpenses - prevCollected) * 100) / 100);

        const closedMap = this.getClosedMonths();
        const closedInfo = closedMap[month] || null;
        const todayStr = new Date().toISOString().split('T')[0];
        const isClosed = !!(closedInfo && closedInfo.closed) || (monthRange.endDate < todayStr);

        return {
            month,
            monthRange,
            isClosed,
            closedInfo,
            prevMonthStr,
            prevClosingBalance,
            totalMembers,
            totalExpenses,
            totalMealsEatenInMonth,
            costPerMeal: Math.round(overallCostPerMeal * 1000) / 1000,
            paidMembers,
            pendingMembers,
            amountCollected,
            balance,
            bills,
            members,
            payments,
            memberShares
        };
    },

    downloadCSVReport(targetMonth) {
        const month = targetMonth || this.getSelectedMonth();
        const stats = this.getStats(month);
        const settings = this.getSettings();
        const currency = settings.currency || "AED";
        const range = this.getMonthRange(month);
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        csvContent += `Room ${settings.roomNo} Mess Account Statement - ${range.label}\n\n`;
        
        csvContent += `Summary Statistics\n`;
        csvContent += `Billing Period,${range.label}\n`;
        csvContent += `Closing Status,${stats.isClosed ? 'Closed & Finalized' : 'Active Cycle'}\n`;
        csvContent += `Total Active Roommates,${stats.totalMembers}\n`;
        csvContent += `Total Compiled Expenses (${currency}),${stats.totalExpenses}\n`;
        csvContent += `Total Meals Consumed,${stats.totalMealsEatenInMonth}\n`;
        csvContent += `Calculated Cost Per Meal (${currency}),${stats.costPerMeal}\n`;
        csvContent += `Amount Collected (${currency}),${stats.amountCollected}\n`;
        csvContent += `Remaining Dues Balance (${currency}),${stats.balance}\n\n`;

        csvContent += `Roommates Pro-Rata Payments Ledger\n`;
        csvContent += `Member Name,Phone,Meals Consumed,Gross Share (${currency}),Advance Credit (${currency}),Net Owed (${currency}),Status,Amount Paid (${currency}),Pay Date\n`;
        
        stats.members.forEach(member => {
            const payInfo = stats.payments[member.id] || {};
            const isPaid = payInfo.paid;
            const share = stats.memberShares[member.id] || { mealsEaten: 0, grossShareAmount: 0, advancePaid: 0, netShareAmount: 0 };
            const amountPaid = isPaid ? (payInfo.amount || share.netShareAmount) : 0;
            const payDate = payInfo.payDate || "";
            
            csvContent += `"${member.name}","${member.phone}",${share.mealsEaten},${share.grossShareAmount},${share.advancePaid},${share.netShareAmount},"${isPaid ? 'Paid' : 'Pending'}",${amountPaid},"${payDate}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mess_report_room_${settings.roomNo}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

db.init();
window.db = db;
