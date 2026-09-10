import React, { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  DollarSign,
  User,
  Phone,
  Plus,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  AlertOctagon,
  Timer,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Gift,
  Menu,
  LayoutDashboard,
  CheckSquare,
  ShoppingCart,
  Layers,
  Zap,
  ArrowRight,
  UserCheck,
  UserX,
  Send,
  RefreshCw,
  Filter,
  Sparkles,
  FileText,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Activity,
  MessageSquare,
  TrendingUp,
  PieChart,
  CalendarClock,
  Eye,
  ArrowLeft
} from "lucide-react";

const TelegramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const PrudentialLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor">
    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6zm0 28.5c-5.03 0-9.45-2.56-12.04-6.44.05-3.99 8.03-6.19 12.04-6.19 3.99 0 11.98 2.19 12.04 6.19C33.45 35.94 29.03 38.5 24 38.5z"/>
  </svg>
);

const EVALUATION_DATE = "2026-09-02";

const NOTE_ACTION_TYPES = [
  "Schedule meeting",
  "Premium reminder",
  "PO will deposit",
  "PO said already deposited",
  "PO will reinstate",
  "Already reinstated",
  "PO requested delay",
  "PO requested surrender",
  "Can not contact",
  "BDM Directive"
];

const getLapseDetails = (paidToDateStr, refDateStr = EVALUATION_DATE) => {
  const paidTo = new Date(paidToDateStr);
  const ref = new Date(refDateStr);
  const diffTime = ref.getTime() - paidTo.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const daysUntilDue = Math.abs(diffDays);
    return {
      bucket: "UP_TO_DATE",
      categoryName: "Up to Date",
      days: daysUntilDue,
      isOverdue: false,
      statusLabel: "In Force / Active",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotColor: "bg-emerald-500",
      alertPriority: "LOW",
      subLabel: daysUntilDue === 0 ? "Due today" : `Due in ${daysUntilDue}d`
    };
  } else if (diffDays <= 60) {
    return {
      bucket: "LAPSE_0_60",
      categoryName: "Lapse 0-60 days",
      days: diffDays,
      isOverdue: true,
      statusLabel: `Lapse ${diffDays}d ago`,
      badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
      dotColor: "bg-amber-500",
      alertPriority: "MEDIUM",
      subLabel: `${diffDays} days overdue`
    };
  } else if (diffDays <= 90) {
    return {
      bucket: "LAPSE_61_90",
      categoryName: "Lapse 61-90 days",
      days: diffDays,
      isOverdue: true,
      statusLabel: `Lapse ${diffDays}d ago`,
      badgeStyle: "bg-orange-50 text-orange-800 border-orange-200",
      dotColor: "bg-orange-500",
      alertPriority: "HIGH",
      subLabel: `${diffDays} days overdue`
    };
  } else {
    return {
      bucket: "LAPSE_OVER_90",
      categoryName: "Lapse >90 days",
      days: diffDays,
      isOverdue: true,
      statusLabel: `Lapse ${diffDays}d ago (>90d)`,
      badgeStyle: "bg-red-50 text-[#ED1B2D] border-red-200",
      dotColor: "bg-[#ED1B2D]",
      alertPriority: "CRITICAL",
      subLabel: `${diffDays} days overdue`
    };
  }
};

const getFollowUpWindowDetails = (followUpDateStr, refDateStr = EVALUATION_DATE) => {
  if (!followUpDateStr || followUpDateStr === "N/A") {
    return { inRange: false, diffDays: null, label: "No Follow-up Scheduled", type: "NONE" };
  }
  const followDate = new Date(followUpDateStr);
  const ref = new Date(refDateStr);
  const diffTime = followDate.getTime() - ref.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const inRange = diffDays >= -7 && diffDays <= 7;

  if (diffDays < -7) {
    return { inRange: false, diffDays, label: "Past Due (>7d ago)", type: "PAST_EXTREME" };
  } else if (diffDays < 0) {
    return { inRange: true, diffDays, label: `Overdue ${Math.abs(diffDays)}d`, type: "OVERDUE", badgeStyle: "bg-red-50 text-[#ED1B2D] border-red-200" };
  } else if (diffDays === 0) {
    return { inRange: true, diffDays: 0, label: "Due Today", type: "TODAY", badgeStyle: "bg-[#ED1B2D] text-white border-[#ED1B2D] font-bold" };
  } else if (diffDays <= 7) {
    return { inRange: true, diffDays, label: `Due in ${diffDays}d`, type: "UPCOMING", badgeStyle: "bg-blue-50 text-blue-700 border-blue-200" };
  } else {
    return { inRange: false, diffDays, label: "Scheduled (>7d)", type: "FUTURE_EXTREME" };
  }
};

const getBirthdayWindowDetails = (dobStr, refDateStr = EVALUATION_DATE) => {
  if (!dobStr) return { inRange: false, diffDays: null, label: "N/A", type: "NONE" };
  const dob = new Date(dobStr);
  const ref = new Date(refDateStr);
  const refYear = ref.getFullYear();
  let bdayThisYear = new Date(refYear, dob.getMonth(), dob.getDate());
  
  const diffTime = bdayThisYear.getTime() - new Date(refYear, ref.getMonth(), ref.getDate()).getTime();
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < -180) {
    bdayThisYear = new Date(refYear + 1, dob.getMonth(), dob.getDate());
    diffDays = Math.round((bdayThisYear.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  } else if (diffDays > 180) {
    bdayThisYear = new Date(refYear - 1, dob.getMonth(), dob.getDate());
    diffDays = Math.round((bdayThisYear.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  }

  const inRange = diffDays >= -3 && diffDays <= 3;
  let label = "";
  let badgeStyle = "";
  let type = "NONE";

  if (diffDays === 0) {
    label = "Birthday Today! 🎂";
    badgeStyle = "bg-[#ED1B2D] text-white border-[#ED1B2D] font-bold";
    type = "TODAY";
  } else if (diffDays > 0) {
    label = `In ${diffDays}d 🎉`;
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-300 font-medium";
    type = "UPCOMING";
  } else {
    label = `${Math.abs(diffDays)}d ago 🎈`;
    badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
    type = "RECENT";
  }

  const formattedMonthDay = `${dob.toLocaleString("default", { month: "short" })} ${String(dob.getDate()).padStart(2, "0")}`;
  const turningAge = refYear - dob.getFullYear();

  return {
    inRange,
    diffDays,
    label,
    badgeStyle,
    type,
    formattedMonthDay,
    turningAge,
    rawDob: dobStr
  };
};

const INITIAL_FCS = [
  { id: "69002345", name: "TRY SAMNANG", phone: "012 334 556", status: "Active", role: "Senior FC", joinDate: "2023-01-15", targetAPE: 10000 },
  { id: "69001188", name: "Dara Pich", phone: "089 778 990", status: "Active", role: "FC", joinDate: "2023-08-10", targetAPE: 8000 },
  { id: "69005522", name: "Sreymom Keo", phone: "093 221 445", status: "Active", role: "FC", joinDate: "2024-01-05", targetAPE: 7000 },
  { id: "69009944", name: "Vannak Chem", phone: "097 554 112", status: "Terminated", role: "Ex-FC", joinDate: "2022-04-01", termDate: "2024-02-15", targetAPE: 0 },
];

const INITIAL_POLICIES = [
  {
    id: "POL-001",
    policyNo: "80321977",
    clientName: "ANG THEARIT",
    mobile: "0972285258",
    type: "Existing",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2025-12-12",
    premium: 468.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1988-09-01",
    telegramLinked: true,
  },
  {
    id: "POL-002",
    policyNo: "80328682",
    clientName: "BAN VISETH",
    mobile: "0969133633",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-08-30",
    premium: 800.58,
    currentFcId: "69001188",
    currentFcName: "Dara Pich",
    dob: "1992-09-02",
    telegramLinked: true,
  },
  {
    id: "POL-003",
    policyNo: "80489481",
    clientName: "CHAN KHIM",
    mobile: "0964428000",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-03-14",
    premium: 437.98,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1985-09-04",
    telegramLinked: false,
  },
  {
    id: "POL-004",
    policyNo: "80512034",
    clientName: "HENG SOPHEA",
    mobile: "017882319",
    type: "Paid Rate",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-07-20",
    premium: 650.0,
    currentFcId: "69005522",
    currentFcName: "Sreymom Keo",
    dob: "1995-08-31",
    telegramLinked: true,
  },
  {
    id: "POL-005",
    policyNo: "80982311",
    clientName: "KONG RATANA",
    mobile: "0889912344",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-06-15",
    premium: 320.0,
    currentFcId: "69001188",
    currentFcName: "Dara Pich",
    dob: "1990-09-05",
    telegramLinked: false,
  },
  {
    id: "POL-006",
    policyNo: "80199420",
    clientName: "TEV SOVAN",
    mobile: "078556771",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-11-20",
    premium: 1250.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1983-09-03",
    telegramLinked: true,
  },
  {
    id: "POL-007",
    policyNo: "80654122",
    clientName: "CHEA VANDY",
    mobile: "012998877",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-10-15",
    premium: 920.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1991-08-30",
    telegramLinked: true,
  },
  {
    id: "POL-008",
    policyNo: "80712399",
    clientName: "CHHAY SOKUNTHEA",
    mobile: "093881122",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-08-01",
    premium: 540.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1994-09-02",
    telegramLinked: false,
  },
  {
    id: "POL-009",
    policyNo: "80823411",
    clientName: "KEO MONIKA",
    mobile: "077445566",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-12-05",
    premium: 1500.0,
    currentFcId: "69001188",
    currentFcName: "Dara Pich",
    dob: "1996-09-04",
    telegramLinked: true,
  },
  {
    id: "POL-010",
    policyNo: "80299834",
    clientName: "LY CHHENG",
    mobile: "086332211",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-05-20",
    premium: 380.5,
    currentFcId: "69001188",
    currentFcName: "Dara Pich",
    dob: "1987-11-15",
    telegramLinked: false,
  },
  {
    id: "POL-011",
    policyNo: "80556781",
    clientName: "MEAS SAMNANG",
    mobile: "098112233",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-08-15",
    premium: 720.0,
    currentFcId: "69005522",
    currentFcName: "Sreymom Keo",
    dob: "1993-09-03",
    telegramLinked: true,
  },
  {
    id: "POL-012",
    policyNo: "80678912",
    clientName: "OUK THIDA",
    mobile: "011556677",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-06-28",
    premium: 490.0,
    currentFcId: "69005522",
    currentFcName: "Sreymom Keo",
    dob: "1989-08-31",
    telegramLinked: false,
  },
  {
    id: "POL-013",
    policyNo: "80443219",
    clientName: "PHAN SOPHAT",
    mobile: "092778899",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2027-01-20",
    premium: 2100.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1980-04-12",
    telegramLinked: true,
  },
  {
    id: "POL-014",
    policyNo: "80789012",
    clientName: "RITH VIRAK",
    mobile: "081223344",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-06-20",
    premium: 610.0,
    currentFcId: "69001188",
    currentFcName: "Dara Pich",
    dob: "1997-09-01",
    telegramLinked: false,
  },
  {
    id: "POL-015",
    policyNo: "80334455",
    clientName: "SENG CHANTHA",
    mobile: "087665544",
    type: "Existing",
    transferStatus: "Active",
    previousFcName: "N/A (Original)",
    paidToDate: "2026-09-28",
    premium: 850.0,
    currentFcId: "69005522",
    currentFcName: "Sreymom Keo",
    dob: "1990-09-05",
    telegramLinked: true,
  },
  {
    id: "POL-016",
    policyNo: "80912345",
    clientName: "VANN BORITH",
    mobile: "096778811",
    type: "Paid Rate",
    transferStatus: "Transfer",
    previousFcName: "Vannak Chem (Terminated)",
    paidToDate: "2026-05-10",
    premium: 415.0,
    currentFcId: "69002345",
    currentFcName: "TRY SAMNANG",
    dob: "1986-09-02",
    telegramLinked: false,
  },
];

const INITIAL_COMMENTS = [
  {
    id: "CM-1",
    policyNo: "80321977",
    fcId: "69009944",
    fcName: "Vannak Chem",
    fcStatus: "Terminated",
    date: "2024-01-10 14:30",
    noteType: "Schedule meeting",
    content: "Customer informed they are travelling abroad until Nov 2025. Set reminder for year-end check-in.",
    nextFollowUp: "2025-11-15",
  },
  {
    id: "CM-2",
    policyNo: "80321977",
    fcId: "69002345",
    fcName: "TRY SAMNANG",
    fcStatus: "Active",
    date: "2026-09-02 09:15",
    noteType: "Schedule meeting",
    content: "Physical meeting at Brown Coffee BKK1 to finalize anniversary policy review.",
    nextFollowUp: "2026-09-03",
  },
  {
    id: "CM-3",
    policyNo: "80328682",
    fcId: "69001188",
    fcName: "Dara Pich",
    fcStatus: "Active",
    date: "2026-09-02 11:20",
    noteType: "Already reinstated",
    content: "Customer confirmed all claims received promptly.",
    nextFollowUp: "2026-09-04",
  },
  {
    id: "CM-4",
    policyNo: "80489481",
    fcId: "69009944",
    fcName: "Vannak Chem",
    fcStatus: "Terminated",
    date: "2024-02-01 16:00",
    noteType: "Premium reminder",
    content: "Initial delay reported due to harvest season. Agreed to follow up in Q3.",
    nextFollowUp: "2024-03-01",
  },
  {
    id: "CM-5",
    policyNo: "80489481",
    fcId: "69002345",
    fcName: "TRY SAMNANG",
    fcStatus: "Active",
    date: "2026-09-01 15:45",
    noteType: "PO requested delay",
    content: "Client requested payment grace extension until 15th of next month.",
    nextFollowUp: "2026-09-05",
  },
  {
    id: "CM-6",
    policyNo: "80512034",
    fcId: "69005522",
    fcName: "Sreymom Keo",
    fcStatus: "Active",
    date: "2026-09-02 10:00",
    noteType: "Premium reminder",
    content: "Sent Telegram reminder for renewal premium. Client seen message.",
    nextFollowUp: "2026-09-02",
  },
  {
    id: "CM-7",
    policyNo: "80199420",
    fcId: "69002345",
    fcName: "TRY SAMNANG",
    fcStatus: "Active",
    date: "2026-09-02 14:00",
    noteType: "Schedule meeting",
    content: "Called client regarding annual financial review for family rider addition.",
    nextFollowUp: "2026-09-02",
  },
  {
    id: "CM-8",
    policyNo: "80712399",
    fcId: "69009944",
    fcName: "Vannak Chem",
    fcStatus: "Terminated",
    date: "2024-01-20 10:30",
    noteType: "Already reinstated",
    content: "Original policy sale. Client prefers Telegram notifications.",
    nextFollowUp: "N/A",
  },
  {
    id: "CM-9",
    policyNo: "80712399",
    fcId: "69002345",
    fcName: "TRY SAMNANG",
    fcStatus: "Active",
    date: "2026-08-30 16:20",
    noteType: "PO will deposit",
    content: "Re-assigned orphan policy. Client agreed to pay before end of month.",
    nextFollowUp: "2026-09-01",
  },
  {
    id: "CM-10",
    policyNo: "80982311",
    fcId: "69001188",
    fcName: "Dara Pich",
    fcStatus: "Active",
    date: "2026-08-28 14:15",
    noteType: "Can not contact",
    content: "Phone switched off. Attempted physical address verification.",
    nextFollowUp: "2026-08-28",
  },
  {
    id: "CM-11",
    policyNo: "80654122",
    fcId: "69002345",
    fcName: "TRY SAMNANG",
    fcStatus: "Active",
    date: "2026-09-01 09:30",
    noteType: "Already reinstated",
    content: "Client payment successfully completed via ABA Pay QR.",
    nextFollowUp: "2026-09-07",
  },
];

export default function App() {
  const [activeRole, setActiveRole] = useState("FC");
  const [currentFC, setCurrentFC] = useState(INITIAL_FCS[0]);
  const [asOfDate, setAsOfDate] = useState(EVALUATION_DATE);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [fcPageTab, setFcPageTab] = useState("DASHBOARD");

  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [fcs] = useState(INITIAL_FCS);

  const [collapseImmediate, setCollapseImmediate] = useState(false);
  const [collapseRenewal, setCollapseRenewal] = useState(false);
  const [collapsePending, setCollapsePending] = useState(false);
  const [collapseSales, setCollapseSales] = useState(false);
  const [collapseLapse, setCollapseLapse] = useState(false);
  const [collapseBirthdays, setCollapseBirthdays] = useState(false);
  const [collapseFollowUps, setCollapseFollowUps] = useState(false);
  const [collapsePoliciesTable, setCollapsePoliciesTable] = useState(false);

  const [bdmActiveTab, setBdmActiveTab] = useState("RELATIVE_REPORTS");
  const [bdmReportPeriod, setBdmReportPeriod] = useState("MONTHLY");
  const [bdmClientTypeScope, setBdmClientTypeScope] = useState("ALL");
  const [bdmActionTypeFilter, setBdmActionTypeFilter] = useState("ALL");
  const [bdmCategoryFilter, setBdmCategoryFilter] = useState("ALL");
  const [bdmTelegramFilter, setBdmTelegramFilter] = useState("ALL");
  const [bdmTransferFilter, setBdmTransferFilter] = useState("ALL");
  const [bdmPolicySearch, setBdmPolicySearch] = useState("");

  const [fcReportPeriod, setFcReportPeriod] = useState("MONTHLY");
  
  const [selectedFcForAction, setSelectedFcForAction] = useState(null);
  const [actionNudgeModalOpen, setActionNudgeModalOpen] = useState(false);
  const [actionNudgeType, setActionNudgeType] = useState("Critical Lapse Alert");
  const [actionNudgeMessage, setActionNudgeMessage] = useState("");
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [policyToReassign, setPolicyToReassign] = useState(null);
  const [targetFcIdForReassign, setTargetFcIdForReassign] = useState(INITIAL_FCS[0].id);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [transferFilter, setTransferFilter] = useState("ALL");
  const [telegramFilter, setTelegramFilter] = useState("ALL");

  const [sortField, setSortField] = useState("clientName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState("Schedule meeting");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isDateInPeriod = (commentDateStr, period, refDateStr) => {
    if (!commentDateStr) return false;
    const actionDate = new Date(commentDateStr.split(" ")[0]);
    const refDate = new Date(refDateStr);

    if (period === "DAILY") {
      return commentDateStr.startsWith(refDateStr);
    } else if (period === "WEEKLY") {
      const diffTime = refDate.getTime() - actionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    } else if (period === "MONTHLY") {
      const actionMonth = commentDateStr.substring(0, 7);
      const refMonth = refDateStr.substring(0, 7);
      return actionMonth === refMonth;
    }
    return true;
  };

  const enrichedAllPolicies = useMemo(() => {
    return policies.map((p) => {
      const policyComments = comments.filter((c) => c.policyNo === p.policyNo);
      const sortedComments = [...policyComments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latestComment = sortedComments[0] || null;

      const latestNote = latestComment ? latestComment.content : "No notes logged yet";
      const latestNoteDate = latestComment ? latestComment.date.split(" ")[0] : "N/A";
      const latestNoteType = latestComment ? latestComment.noteType : "N/A";
      
      const nextFollowUpDate =
        latestComment && latestComment.nextFollowUp && latestComment.nextFollowUp !== "N/A"
          ? latestComment.nextFollowUp
          : null;

      const lapseInfo = getLapseDetails(p.paidToDate, asOfDate);
      const followUpInfo = getFollowUpWindowDetails(nextFollowUpDate, asOfDate);
      const bdayInfo = getBirthdayWindowDetails(p.dob, asOfDate);

      return {
        ...p,
        latestNote,
        latestNoteDate,
        latestNoteType,
        nextFollowUpDate,
        latestComment,
        policyComments,
        lapseInfo,
        followUpInfo,
        bdayInfo,
      };
    });
  }, [policies, comments, asOfDate]);

  const loggedInFcPolicies = useMemo(() => {
    return enrichedAllPolicies.filter((p) => p.currentFcId === currentFC.id);
  }, [enrichedAllPolicies, currentFC]);

  const fc7DayFollowUps = useMemo(() => {
    return loggedInFcPolicies
      .filter((p) => p.followUpInfo.inRange)
      .sort((a, b) => a.followUpInfo.diffDays - b.followUpInfo.diffDays);
  }, [loggedInFcPolicies]);

  const fcBirthdayAlerts = useMemo(() => {
    return loggedInFcPolicies
      .filter((p) => p.bdayInfo.inRange)
      .sort((a, b) => a.bdayInfo.diffDays - b.bdayInfo.diffDays);
  }, [loggedInFcPolicies]);

  const loggedInFcPerformanceRow = useMemo(() => {
    const fc = currentFC;
    const fcPolicies = enrichedAllPolicies.filter((p) => p.currentFcId === fc.id);
    const scopedFcPolicies = fcPolicies.filter(
      (p) => typeFilter === "ALL" || p.type === typeFilter
    );
    const totalAssignedPolicy = scopedFcPolicies.length;

    const fcActions = comments.filter((c) => {
      if (c.fcId !== fc.id) return false;
      const validTime = isDateInPeriod(c.date, fcReportPeriod, asOfDate);
      if (!validTime) return false;
      if (typeFilter !== "ALL") {
        const matchedPol = policies.find((pol) => pol.policyNo === c.policyNo);
        if (!matchedPol || matchedPol.type !== typeFilter) return false;
      }
      return true;
    });
    const totalActionDid = fcActions.length;

    const scheduledFollowUps = scopedFcPolicies.filter((p) => p.followUpInfo.inRange).length;
    const followUpActionsDone = fcActions.filter(
      (c) =>
        c.noteType === "Schedule meeting" ||
        c.noteType === "Premium reminder" ||
        c.noteType === "PO will deposit" ||
        c.noteType === "PO said already deposited" ||
        c.noteType === "PO will reinstate" ||
        c.noteType === "PO requested delay"
    ).length;
    const followUpPct = scheduledFollowUps > 0 ? Math.min(100, Math.round((followUpActionsDone / scheduledFollowUps) * 100)) : 100;

    const birthdaysInWindow = scopedFcPolicies.filter((p) => p.bdayInfo.inRange).length;
    const bdayActionsDone = fcActions.filter(
      (c) =>
        c.noteType === "Schedule meeting" ||
        c.content.toLowerCase().includes("birthday") ||
        c.content.toLowerCase().includes("wish")
    ).length;
    const birthdayPct = birthdaysInWindow > 0 ? Math.min(100, Math.round((bdayActionsDone / birthdaysInWindow) * 100)) : 100;

    const actionTypesCount = {
      "Schedule meeting": 0,
      "Premium reminder": 0,
      "PO will deposit": 0,
      "PO said already deposited": 0,
      "PO will reinstate": 0,
      "Already reinstated": 0,
      "PO requested delay": 0,
      "PO requested surrender": 0,
      "Can not contact": 0,
      "BDM Directive": 0,
    };
    fcActions.forEach((c) => {
      if (actionTypesCount[c.noteType] !== undefined) {
        actionTypesCount[c.noteType] += 1;
      } else {
        actionTypesCount[c.noteType] = (actionTypesCount[c.noteType] || 0) + 1;
      }
    });

    const upToDateCount = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "UP_TO_DATE").length;
    const lapse0_60Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_0_60").length;
    const lapse61_90Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_61_90").length;
    const lapseOver90Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_OVER_90").length;
    const totalLapseCount = lapse0_60Count + lapse61_90Count + lapseOver90Count;

    const lapseActionsDone = fcActions.filter(c => {
      const pol = scopedFcPolicies.find(p => p.policyNo === c.policyNo);
      return pol && pol.lapseInfo.isOverdue;
    }).length;

    const overallActionPct = totalAssignedPolicy > 0 ? Math.min(100, Math.round((totalActionDid / totalAssignedPolicy) * 100)) : 0;
    const lapseActionPct = totalLapseCount > 0 ? Math.min(100, Math.round((lapseActionsDone / totalLapseCount) * 100)) : 100;

    return {
      ...fc,
      totalAssignedPolicy,
      totalActionDid,
      scheduledFollowUps,
      followUpActionsDone,
      followUpPct,
      birthdaysInWindow,
      bdayActionsDone,
      birthdayPct,
      actionTypesCount,
      upToDateCount,
      lapse0_60Count,
      lapse61_90Count,
      lapseOver90Count,
      totalLapseCount,
      lapseActionsDone,
      lapseActionPct,
      overallActionPct,
      scopedFcPolicies,
    };
  }, [currentFC, enrichedAllPolicies, comments, fcReportPeriod, asOfDate, typeFilter, policies]);

  const bdmFcDiagnostics = useMemo(() => {
    return fcs.map((fc) => {
      const fcPolicies = enrichedAllPolicies.filter((p) => p.currentFcId === fc.id);
      const scopedFcPolicies = fcPolicies.filter(
        (p) => bdmClientTypeScope === "ALL" || p.type === bdmClientTypeScope
      );
      const totalCount = scopedFcPolicies.length;
      const totalAPE = scopedFcPolicies.reduce((sum, p) => sum + p.premium, 0);

      const fcActions = comments.filter((c) => {
        if (c.fcId !== fc.id) return false;
        const validTime = isDateInPeriod(c.date, bdmReportPeriod, asOfDate);
        if (!validTime) return false;
        if (bdmClientTypeScope !== "ALL") {
          const matchedPol = policies.find((pol) => pol.policyNo === c.policyNo);
          if (!matchedPol || matchedPol.type !== bdmClientTypeScope) return false;
        }
        return true;
      });

      const totalActions = fcActions.length;
      const totalScheduledFollowUps = scopedFcPolicies.filter((p) => p.followUpInfo.inRange).length;
      const followUpActions = fcActions.filter(
        (c) =>
          c.noteType === "Schedule meeting" ||
          c.noteType === "Premium reminder" ||
          c.noteType === "PO will deposit" ||
          c.noteType === "PO said already deposited" ||
          c.noteType === "PO will reinstate" ||
          c.noteType === "PO requested delay"
      ).length;
      const followUpActionCoverage = totalScheduledFollowUps > 0 
        ? Math.min(100, Math.round((followUpActions / totalScheduledFollowUps) * 100)) 
        : 100;

      const totalBirthdaysInWindow = scopedFcPolicies.filter((p) => p.bdayInfo.inRange).length;
      const bdayActions = fcActions.filter(
        (c) =>
          c.noteType === "Schedule meeting" ||
          c.content.toLowerCase().includes("birthday") ||
          c.content.toLowerCase().includes("wish")
      ).length;
      const birthdayActionCoverage = totalBirthdaysInWindow > 0 
        ? Math.min(100, Math.round((bdayActions / totalBirthdaysInWindow) * 100)) 
        : 100;

      const actionTypesCount = {
        "Schedule meeting": 0,
        "Premium reminder": 0,
        "PO will deposit": 0,
        "PO said already deposited": 0,
        "PO will reinstate": 0,
        "Already reinstated": 0,
        "PO requested delay": 0,
        "PO requested surrender": 0,
        "Can not contact": 0,
        "BDM Directive": 0,
      };
      fcActions.forEach((c) => {
        if (actionTypesCount[c.noteType] !== undefined) {
          actionTypesCount[c.noteType] += 1;
        } else {
          actionTypesCount[c.noteType] = (actionTypesCount[c.noteType] || 0) + 1;
        }
      });

      const upToDateCount = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "UP_TO_DATE").length;
      const lapse0_60Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_0_60").length;
      const lapse61_90Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_61_90").length;
      const lapseOver90Count = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_OVER_90").length;
      const totalLapseCount = lapse0_60Count + lapse61_90Count + lapseOver90Count;
      const totalOverdueAPE = scopedFcPolicies.filter(p => p.lapseInfo.isOverdue).reduce((s, p) => s + p.premium, 0);
      const criticalLapseAPE = scopedFcPolicies.filter(p => p.lapseInfo.bucket === "LAPSE_OVER_90").reduce((s, p) => s + p.premium, 0);

      const activeCount = scopedFcPolicies.filter(p => !p.lapseInfo.isOverdue).length;
      const persistencyRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;

      let riskCategory = "LOW";
      let riskLabel = "Healthy";
      let recommendedAction = "Maintain standard proactive customer touchpoints and birthday greetings.";

      if (fc.status === "Terminated") {
        riskCategory = "TERMINATED";
        riskLabel = "Terminated (Ex-FC)";
        recommendedAction = "Portfolio marked as orphan. Reassign active policies to available consultants immediately.";
      } else if (lapseOver90Count > 0 || persistencyRate < 75) {
        riskCategory = "CRITICAL";
        riskLabel = "High Lapse Risk";
        recommendedAction = `Urgent Reinstatement Drive required: ${lapseOver90Count} policies overdue >90d ($${criticalLapseAPE.toFixed(2)} APE).`;
      } else if (totalLapseCount > 0) {
        riskCategory = "MEDIUM";
        riskLabel = "Grace Period Watch";
        recommendedAction = `Follow up on ${totalLapseCount} grace period policies before 90-day lapse threshold.`;
      }

      return {
        ...fc,
        scopedFcPolicies,
        totalCount,
        totalAPE,
        totalActions,
        totalScheduledFollowUps,
        followUpActions,
        followUpActionCoverage,
        totalBirthdaysInWindow,
        bdayActions,
        birthdayActionCoverage,
        actionTypesCount,
        upToDateCount,
        lapse0_60Count,
        lapse61_90Count,
        lapseOver90Count,
        totalLapseCount,
        totalOverdueAPE,
        criticalLapseAPE,
        persistencyRate,
        riskCategory,
        riskLabel,
        recommendedAction,
      };
    });
  }, [fcs, enrichedAllPolicies, comments, bdmReportPeriod, asOfDate, bdmClientTypeScope, policies]);

  const bdmTeamTotals = useMemo(() => {
    let totalAssignedPolicies = 0;
    let totalAPE = 0;
    let lapsedPoliciesCount = 0;
    let lapsedAPE = 0;
    let totalActionsInPeriod = 0;
    let expectedRenewalAPE = 0;
    let collectedRenewalAPE = 0;

    bdmFcDiagnostics.forEach((fc) => {
      totalAssignedPolicies += fc.totalCount;
      totalAPE += fc.totalAPE;
      lapsedPoliciesCount += fc.totalLapseCount;
      lapsedAPE += fc.totalOverdueAPE;
      totalActionsInPeriod += fc.totalActions;
      expectedRenewalAPE += fc.totalAPE;
      collectedRenewalAPE += (fc.totalAPE - fc.totalOverdueAPE);
    });

    const collectedPremiumRate = expectedRenewalAPE > 0 
      ? Math.round((collectedRenewalAPE / expectedRenewalAPE) * 100) 
      : 100;

    return {
      totalAssignedPolicies,
      totalAPE,
      lapsedPoliciesCount,
      lapsedAPE,
      totalActionsInPeriod,
      expectedRenewalAPE,
      collectedRenewalAPE,
      collectedPremiumRate,
    };
  }, [bdmFcDiagnostics]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-white/60 opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-white font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-white font-bold" />
    );
  };

  const fcFilteredAndSortedPolicies = useMemo(() => {
    const filtered = loggedInFcPolicies.filter((p) => {
      const matchesSearch =
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.policyNo.includes(searchTerm) ||
        p.mobile.includes(searchTerm) ||
        p.latestNote.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "ALL" || p.type === typeFilter;
      const matchesCategory =
        categoryFilter === "ALL" || p.lapseInfo.bucket === categoryFilter;
      const matchesTransfer =
        transferFilter === "ALL" || p.transferStatus === transferFilter;
      const matchesTelegram =
        telegramFilter === "ALL" ||
        (telegramFilter === "Linked" && p.telegramLinked) ||
        (telegramFilter === "NotYet" && !p.telegramLinked);

      return matchesSearch && matchesType && matchesCategory && matchesTransfer && matchesTelegram;
    });

    return filtered.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "clientName":
          valA = a.clientName.toLowerCase();
          valB = b.clientName.toLowerCase();
          break;
        case "policyNo":
          valA = a.policyNo;
          valB = b.policyNo;
          break;
        case "paidToDate":
          valA = new Date(a.paidToDate).getTime();
          valB = new Date(b.paidToDate).getTime();
          break;
        case "premium":
          valA = a.premium;
          valB = b.premium;
          break;
        case "latestNoteDate":
          valA = a.latestNoteDate !== "N/A" ? new Date(a.latestNoteDate).getTime() : 0;
          valB = a.latestNoteDate !== "N/A" ? new Date(a.latestNoteDate).getTime() : 0;
          break;
        default:
          valA = a.clientName;
          valB = b.clientName;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [loggedInFcPolicies, searchTerm, typeFilter, categoryFilter, transferFilter, telegramFilter, sortField, sortDirection]);

  const bdmFilteredAndSortedPolicies = useMemo(() => {
    const filtered = enrichedAllPolicies.filter((p) => {
      const matchesSearch =
        p.clientName.toLowerCase().includes(bdmPolicySearch.toLowerCase()) ||
        p.policyNo.includes(bdmPolicySearch) ||
        p.mobile.includes(bdmPolicySearch) ||
        p.currentFcName.toLowerCase().includes(bdmPolicySearch.toLowerCase()) ||
        p.latestNote.toLowerCase().includes(bdmPolicySearch.toLowerCase());

      const matchesType = bdmClientTypeScope === "ALL" || p.type === bdmClientTypeScope;
      
      let matchesActionType = true;
      if (bdmActionTypeFilter !== "ALL") {
        matchesActionType = p.latestNoteType === bdmActionTypeFilter;
      }

      const matchesCategory = bdmCategoryFilter === "ALL" || p.lapseInfo.bucket === bdmCategoryFilter;
      const matchesTransfer = bdmTransferFilter === "ALL" || p.transferStatus === bdmTransferFilter;
      const matchesTelegram =
        bdmTelegramFilter === "ALL" ||
        (bdmTelegramFilter === "Linked" && p.telegramLinked) ||
        (bdmTelegramFilter === "NotYet" && !p.telegramLinked);

      return matchesSearch && matchesType && matchesActionType && matchesCategory && matchesTransfer && matchesTelegram;
    });

    return filtered.sort((a, b) => {
      let valA = a.clientName.toLowerCase();
      let valB = b.clientName.toLowerCase();
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }, [enrichedAllPolicies, bdmPolicySearch, bdmClientTypeScope, bdmActionTypeFilter, bdmCategoryFilter, bdmTransferFilter, bdmTelegramFilter]);

  const fcLapseBucketCounts = useMemo(() => {
    const counts = {
      LAPSE_0_60: 0,
      LAPSE_61_90: 0,
      LAPSE_OVER_90: 0,
      UP_TO_DATE: 0,
    };
    loggedInFcPolicies.forEach((p) => {
      counts[p.lapseInfo.bucket] = (counts[p.lapseInfo.bucket] || 0) + 1;
    });
    return counts;
  }, [loggedInFcPolicies]);

  const fcPolicyPageTotals = useMemo(() => {
    const activeList = loggedInFcPerformanceRow.scopedFcPolicies;
    const totalCases = activeList.length;
    const totalAPE = activeList.reduce((sum, p) => sum + p.premium, 0);
    const lapsedCases = activeList.filter((p) => p.lapseInfo.isOverdue).length;
    const lapsedAPE = activeList
      .filter((p) => p.lapseInfo.isOverdue)
      .reduce((sum, p) => sum + p.premium, 0);
    return { totalCases, totalAPE, lapsedCases, lapsedAPE };
  }, [loggedInFcPerformanceRow]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!selectedPolicy || !newNoteContent.trim()) return;

    const now = new Date();
    const formattedDate = now.toISOString().replace("T", " ").substring(0, 16);

    const newCommentObj = {
      id: `CM-${Date.now()}`,
      policyNo: selectedPolicy.policyNo,
      fcId: currentFC.id,
      fcName: currentFC.name,
      fcStatus: currentFC.status,
      date: formattedDate,
      noteType: newNoteType,
      content: newNoteContent.trim(),
      nextFollowUp: newFollowUpDate || "N/A",
    };

    setComments([newCommentObj, ...comments]);

    setSelectedPolicy((prev) => ({
      ...prev,
      latestNote: newNoteContent.trim(),
      latestNoteDate: formattedDate.split(" ")[0],
      latestNoteType: newNoteType,
      nextFollowUpDate: newFollowUpDate || null,
    }));

    setNewNoteContent("");
    setNewFollowUpDate("");
    setShowAddNoteModal(false);
    showToast(`Note recorded for Policy #${selectedPolicy.policyNo}!`);
  };

  const handleSendActionNudge = (e) => {
    e.preventDefault();
    if (!selectedFcForAction) return;

    const now = new Date();
    const formattedDate = now.toISOString().replace("T", " ").substring(0, 16);

    const newNudgeComment = {
      id: `CM-BDM-${Date.now()}`,
      policyNo: selectedFcForAction.samplePolicies?.[0]?.policyNo || "GENERAL",
      fcId: selectedFcForAction.id,
      fcName: selectedFcForAction.name,
      fcStatus: selectedFcForAction.status,
      date: formattedDate,
      noteType: "BDM Directive",
      content: `[BDM Directive: ${actionNudgeType}] ${actionNudgeMessage.trim() || selectedFcForAction.recommendedAction}`,
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    };

    setComments([newNudgeComment, ...comments]);
    setActionNudgeModalOpen(false);
    setActionNudgeMessage("");
    showToast(`Action Directive dispatched to ${selectedFcForAction.name}!`);
  };

  const handleExecuteReassign = () => {
    if (!policyToReassign || !targetFcIdForReassign) return;
    const targetFc = fcs.find((f) => f.id === targetFcIdForReassign);
    if (!targetFc) return;

    setPolicies((prevPolicies) =>
      prevPolicies.map((p) => {
        if (p.policyNo === policyToReassign.policyNo) {
          return {
            ...p,
            currentFcId: targetFc.id,
            currentFcName: targetFc.name,
            transferStatus: "Transfer",
            previousFcName: `${p.currentFcName} (Reassigned by BDM)`,
          };
        }
        return p;
      })
    );

    setReassignModalOpen(false);
    setPolicyToReassign(null);
    showToast(`Policy #${policyToReassign.policyNo} transferred to ${targetFc.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-800 flex font-sans selection:bg-[#ED1B2D] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <div className="w-5 h-5 rounded-full bg-[#ED1B2D] flex items-center justify-center text-white text-xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LEFT NAVIGATION RAIL */}
      <aside className={`bg-[#ED1B2D] text-white flex flex-col justify-between transition-all duration-300 z-40 shrink-0 ${sidebarCollapsed ? "w-16" : "w-20"}`}>
        <div>
          <div className="py-4 flex flex-col items-center justify-center border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white mb-1">
              <PrudentialLogo className="w-6 h-6 text-white" />
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-white/20 rounded text-white mt-1 transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-4 flex flex-col items-center gap-2 px-1">
            <button
              onClick={() => { setActiveRole("FC"); setFcPageTab("DASHBOARD"); }}
              className={`w-full py-3 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                activeRole === "FC" && fcPageTab === "DASHBOARD" ? "bg-black/20 text-white font-bold" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              title="FC Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveRole("FC"); setFcPageTab("POLICIES"); }}
              className={`w-full py-3 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                activeRole === "FC" && fcPageTab === "POLICIES" ? "bg-black/20 text-white font-bold" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              title="Assigned Policies Page"
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Policies</span>
            </button>

            <button
              onClick={() => setActiveRole("BDM")}
              className={`w-full py-3 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                activeRole === "BDM" ? "bg-black/20 text-white font-bold shadow-inner" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              title="BDM Management Matrix"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">BDM View</span>
            </button>
          </nav>
        </div>

        <div className="py-4 border-t border-white/10 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-white text-[#ED1B2D] font-bold text-xs flex items-center justify-center shadow">
            {activeRole === "FC" ? currentFC.name.charAt(0) : "B"}
          </div>
          <span className="text-[9px] font-mono mt-1 text-white/80">
            {activeRole === "FC" ? currentFC.id.slice(-4) : "BDM-01"}
          </span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-[#ED1B2D] tracking-wider uppercase">
                PRUDENTIAL
              </span>
              <span className="text-slate-300">|</span>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                {activeRole === "FC" 
                  ? (fcPageTab === "DASHBOARD" ? "Agent Renewal & Persistency Tracker" : "Assigned Policies & Portfolio Directory") 
                  : "BDM Supervised FC Performance & Engagement Matrix"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {activeRole === "FC" && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <select
                      value={currentFC.id}
                      onChange={(e) => {
                        const fc = fcs.find((f) => f.id === e.target.value);
                        if (fc) {
                          setCurrentFC(fc);
                          showToast(`Switched account to ${fc.name}`);
                        }
                      }}
                      className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer tracking-tight"
                    >
                      {fcs.filter((f) => f.status === "Active").map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 -mt-1 font-mono">ID: {currentFC.id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
          {activeRole === "FC" && (
            <div className="space-y-6">
              {fcPageTab === "DASHBOARD" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Menu className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">Immediate Action</h3>
                          </div>
                          <button
                            onClick={() => setCollapseImmediate(!collapseImmediate)}
                            className="text-white hover:text-white/80 transition-colors p-0.5"
                          >
                            {collapseImmediate ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>

                        {!collapseImmediate && (
                          <div className="divide-y divide-slate-100 text-xs">
                            {[
                              { label: "Not Taken Up", count: 0 },
                              { label: "Medical Examination", count: 0 },
                              { label: "Incomplete Application", count: 0 },
                              { label: "Conditional Acceptance Letter(CAL)", count: 1 },
                              { label: "Inquiring for suppliment information(IS)", count: 0 },
                              { label: "Customer to follow-up", count: 0 },
                              { label: "PO already reinstated", count: 0 },
                              { label: "PO said already deposited", count: 0 },
                              { label: "PO will deposit", count: 0 },
                              { label: "PO will reinstate", count: 0 },
                            ].map((item, idx) => (
                              <div key={idx} className="py-2.5 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <span className="text-slate-700 font-medium">{item.label}</span>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#ED1B2D] text-white">
                                  {item.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Menu className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">My Pending</h3>
                          </div>
                          <button
                            onClick={() => setCollapsePending(!collapsePending)}
                            className="text-white hover:text-white/80 transition-colors p-0.5"
                          >
                            {collapsePending ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>

                        {!collapsePending && (
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="border border-slate-200 rounded-md p-4 flex items-center gap-4 bg-white shadow-2xs">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFA8B6] text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8" />
                                </div>
                                <div className="text-right flex-1">
                                  <span className="text-[11px] text-slate-500 font-medium block">Total Pending Cases</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">
                                    8
                                  </span>
                                </div>
                              </div>

                              <div className="border border-slate-200 rounded-md p-4 flex items-center gap-4 bg-white shadow-2xs">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#5C7CFA] text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <DollarSign className="w-7 h-7 sm:w-8 sm:h-8" />
                                </div>
                                <div className="text-right flex-1">
                                  <span className="text-[11px] text-slate-500 font-medium block">Total Pending APE</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">
                                    $ 2,981.39
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 text-xs text-[#ED1B2D] font-sans">
                              Refresh at : Sep 5 2026 8:45PM
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Menu className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">My sale performance update</h3>
                          </div>
                          <button
                            onClick={() => setCollapseSales(!collapseSales)}
                            className="text-white hover:text-white/80 transition-colors p-0.5"
                          >
                            {collapseSales ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>

                        {!collapseSales && (
                          <div className="p-4 space-y-4">
                            <div className="border border-slate-200 rounded-md p-4 bg-white shadow-2xs">
                              <div className="mb-3">
                                <span className="inline-block bg-[#6478db] text-white text-[11px] font-semibold px-3.5 py-0.5 rounded-full shadow-2xs">
                                  Submission
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3 flex items-center justify-center">
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[5px] border-[#e9ecef] flex items-center justify-center">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#6478db] ring-2 ring-white" />
                                    <span className="text-[13px] font-bold text-slate-700 font-sans">0%</span>
                                  </div>
                                </div>
                                <div className="col-span-4 text-center border-r border-slate-200 pr-2">
                                  <span className="text-[11px] text-slate-500 font-medium block">Target Submission</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">-</span>
                                </div>
                                <div className="col-span-5 text-right pl-2">
                                  <span className="text-[11px] text-slate-500 font-medium block">Actual Submission</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">$ 8,564.97</span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-slate-200 rounded-md p-4 bg-white shadow-2xs">
                              <div className="mb-3">
                                <span className="inline-block bg-[#6478db] text-white text-[11px] font-semibold px-3.5 py-0.5 rounded-full shadow-2xs">
                                  Net Issuance
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3 flex items-center justify-center">
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[5px] border-[#e9ecef] flex items-center justify-center">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#6478db] ring-2 ring-white" />
                                    <span className="text-[13px] font-bold text-slate-700 font-sans">0%</span>
                                  </div>
                                </div>
                                <div className="col-span-4 text-center border-r border-slate-200 pr-2">
                                  <span className="text-[11px] text-slate-500 font-medium block">Target Issuance</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">-</span>
                                </div>
                                <div className="col-span-5 text-right pl-2">
                                  <span className="text-[11px] text-slate-500 font-medium block">Actual Issuance</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">$ 8,542.79</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => showToast("Showing expanded sales performance detail...")}
                                className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors shadow-2xs"
                              >
                                Show More Detail
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Menu className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                              My Renewal Premium Collection and Lapsed (Click to View)
                            </h3>
                          </div>
                          <button
                            onClick={() => setCollapseRenewal(!collapseRenewal)}
                            className="text-white hover:text-white/80 transition-colors p-0.5"
                          >
                            {collapseRenewal ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>

                        {!collapseRenewal && (
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                              onClick={() => {
                                setCategoryFilter("ALL");
                                setFcPageTab("POLICIES");
                              }}
                              className="border border-slate-200 hover:border-blue-500 cursor-pointer rounded-lg p-4 bg-white relative transition-all group shadow-2xs"
                            >
                              <span className="inline-block bg-[#5C7CFA] text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-3 group-hover:scale-105 transition-transform">
                                Renewal Collection (Click)
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-center mt-2">
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium block">#Case Due</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">
                                    {loggedInFcPolicies.length}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium block">Expected Premium</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">
                                    ${loggedInFcPolicies.reduce((s,p)=>s+p.premium,0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              onClick={() => {
                                setCategoryFilter("LAPSE_OVER_90");
                                setFcPageTab("POLICIES");
                              }}
                              className="border border-slate-200 hover:border-red-500 cursor-pointer rounded-lg p-4 bg-white relative transition-all group shadow-2xs"
                            >
                              <span className="inline-block bg-[#ED1B2D] text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-3 group-hover:scale-105 transition-transform">
                                Lapsed Policies (Click)
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-center mt-2">
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium block">#Case Lapsed</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-slate-900 mt-0.5 block whitespace-nowrap">
                                    {loggedInFcPolicies.filter(p => p.lapseInfo.isOverdue).length}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium block">Tot. Lapsed APE</span>
                                  <span style={{ fontSize: "14px" }} className="font-sans font-bold text-[#ED1B2D] mt-0.5 block whitespace-nowrap">
                                    ${loggedInFcPolicies.filter(p => p.lapseInfo.isOverdue).reduce((s,p)=>s+p.premium,0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                              Lapse Category Ageing Buckets (Click to Inspect)
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white text-[#ED1B2D] text-xs font-black flex items-center justify-center shadow-xs">
                              {loggedInFcPolicies.length}
                            </span>
                            <button
                              onClick={() => setCollapseLapse(!collapseLapse)}
                              className="text-white hover:text-white/80 transition-colors p-0.5"
                            >
                              {collapseLapse ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {!collapseLapse && (
                          <div className="p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div
                                onClick={() => {
                                  setCategoryFilter("LAPSE_0_60");
                                  setFcPageTab("POLICIES");
                                }}
                                className="cursor-pointer rounded-lg p-3.5 border transition-all bg-white hover:border-amber-500 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                    <Timer className="w-4 h-4 text-amber-600" /> Lapse 0–60 days
                                  </span>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                                    Grace Period
                                  </span>
                                </div>
                                <div className="mt-2.5 flex items-baseline justify-between">
                                  <span className="text-2xl font-bold text-slate-900 font-sans">
                                    {fcLapseBucketCounts.LAPSE_0_60}
                                  </span>
                                  <span className="text-[11px] text-blue-600 font-bold underline">View &rarr;</span>
                                </div>
                              </div>

                              <div
                                onClick={() => {
                                  setCategoryFilter("LAPSE_61_90");
                                  setFcPageTab("POLICIES");
                                }}
                                className="cursor-pointer rounded-lg p-3.5 border transition-all bg-white hover:border-orange-500 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" /> Lapse 61–90 days
                                  </span>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold text-orange-800 bg-orange-50 border border-orange-200">
                                    Overdue
                                  </span>
                                </div>
                                <div className="mt-2.5 flex items-baseline justify-between">
                                  <span className="text-2xl font-bold text-slate-900 font-sans">
                                    {fcLapseBucketCounts.LAPSE_61_90}
                                  </span>
                                  <span className="text-[11px] text-blue-600 font-bold underline">View &rarr;</span>
                                </div>
                              </div>

                              <div
                                onClick={() => {
                                  setCategoryFilter("LAPSE_OVER_90");
                                  setFcPageTab("POLICIES");
                                }}
                                className="cursor-pointer rounded-lg p-3.5 border transition-all bg-white hover:border-red-500 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#ED1B2D] flex items-center gap-1.5">
                                    <AlertOctagon className="w-4 h-4 text-[#ED1B2D]" /> Lapse &gt;90 days
                                  </span>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold text-[#ED1B2D] bg-red-50 border border-red-200">
                                    Critical Lapse
                                  </span>
                                </div>
                                <div className="mt-2.5 flex items-baseline justify-between">
                                  <span className="text-2xl font-bold text-[#ED1B2D] font-sans">
                                    {fcLapseBucketCounts.LAPSE_OVER_90}
                                  </span>
                                  <span className="text-[11px] text-blue-600 font-bold underline">View &rarr;</span>
                                </div>
                              </div>

                              <div
                                onClick={() => {
                                  setCategoryFilter("UP_TO_DATE");
                                  setFcPageTab("POLICIES");
                                }}
                                className="cursor-pointer rounded-lg p-3.5 border transition-all bg-white hover:border-emerald-500 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to Date
                                  </span>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                                    In Force
                                  </span>
                                </div>
                                <div className="mt-2.5 flex items-baseline justify-between">
                                  <span className="text-2xl font-bold text-slate-900 font-sans">
                                    {fcLapseBucketCounts.UP_TO_DATE}
                                  </span>
                                  <span className="text-[11px] text-blue-600 font-bold underline">View &rarr;</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                              Client Birthday Alerts (±3 Days Window)
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white text-[#ED1B2D] text-xs font-black flex items-center justify-center shadow-xs">
                              {fcBirthdayAlerts.length}
                            </span>
                            <button
                              onClick={() => setCollapseBirthdays(!collapseBirthdays)}
                              className="text-white hover:text-white/80 transition-colors p-0.5"
                            >
                              {collapseBirthdays ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {!collapseBirthdays && (
                          <div className="p-3">
                            {fcBirthdayAlerts.length === 0 ? (
                              <div className="py-4 text-center text-slate-400 text-xs">
                                No birthdays in this date window.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {fcBirthdayAlerts.map((pol) => (
                                  <div
                                    key={pol.id}
                                    onClick={() => setSelectedPolicy(pol)}
                                    className="p-2.5 border border-slate-200 rounded-lg hover:border-[#ED1B2D] cursor-pointer transition-all bg-slate-50/50"
                                  >
                                    <div className="flex items-start justify-between">
                                      <span className="text-xs font-bold text-slate-900 block truncate">
                                        {pol.clientName}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${pol.bdayInfo.badgeStyle}`}>
                                        {pol.bdayInfo.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                      <span>{pol.bdayInfo.formattedMonthDay}</span>
                                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <a
                                          href={`tel:${pol.mobile}`}
                                          className="p-1 hover:text-[#ED1B2D] text-slate-600 rounded"
                                        >
                                          <Phone className="w-3 h-3" />
                                        </a>
                                        {pol.telegramLinked && (
                                          <a
                                            href={`https://t.me/+855${pol.mobile.replace(/^0/, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-1.5 py-0.5 bg-[#0088cc] text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                                          >
                                            <TelegramIcon className="w-2.5 h-2.5" /> Wish
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                              Scheduled Follow-ups (-7 to +7 Days)
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white text-[#ED1B2D] text-xs font-black flex items-center justify-center shadow-xs">
                              {fc7DayFollowUps.length}
                            </span>
                            <button
                              onClick={() => setCollapseFollowUps(!collapseFollowUps)}
                              className="text-white hover:text-white/80 transition-colors p-0.5"
                            >
                              {collapseFollowUps ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {!collapseFollowUps && (
                          <div className="p-3">
                            {fc7DayFollowUps.length === 0 ? (
                              <div className="py-4 text-center text-slate-400 text-xs">
                                No scheduled follow-ups due in this timeframe.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {fc7DayFollowUps.slice(0, 6).map((pol) => (
                                  <div
                                    key={pol.id}
                                    onClick={() => setSelectedPolicy(pol)}
                                    className="p-2.5 border border-slate-200 rounded-lg hover:border-[#ED1B2D] cursor-pointer transition-all bg-slate-50/50"
                                  >
                                    <div className="flex items-start justify-between">
                                      <span className="text-xs font-bold text-slate-900 block truncate">
                                        {pol.clientName}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${pol.followUpInfo.badgeStyle}`}>
                                        {pol.followUpInfo.label}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                                      <span>#{pol.policyNo}</span>
                                      <span className="font-semibold text-slate-700">{pol.nextFollowUpDate}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {fcPageTab === "POLICIES" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-2xs gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFcPageTab("DASHBOARD")}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Type:</span>
                        {[
                          { id: "ALL", label: "All Types" },
                          { id: "Existing", label: "Existing" },
                          { id: "Paid Rate", label: "Paid Rate" },
                        ].map((scope) => (
                          <button
                            key={scope.id}
                            onClick={() => setTypeFilter(scope.id)}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              typeFilter === scope.id
                                ? "bg-[#ED1B2D] text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {scope.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { setCategoryFilter("ALL"); setTypeFilter("ALL"); setSearchTerm(""); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">Total Assigned Cases</span>
                      <span className="text-xl font-bold font-sans text-slate-900 mt-1 block">
                        {fcPolicyPageTotals.totalCases} Policies
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">Total Portfolio APE</span>
                      <span className="text-xl font-bold font-sans text-blue-700 mt-1 block">
                        ${fcPolicyPageTotals.totalAPE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">Total Lapsed Cases</span>
                      <span className="text-xl font-bold font-sans text-[#ED1B2D] mt-1 block">
                        {fcPolicyPageTotals.lapsedCases} Cases
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">Total Lapsed APE</span>
                      <span className="text-xl font-bold font-sans text-[#ED1B2D] mt-1 block">
                        ${fcPolicyPageTotals.lapsedAPE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          FC Performance & Engagement Report Matrix
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                        <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Period:</span>
                        {["DAILY", "WEEKLY", "MONTHLY", "ALL"].map((per) => (
                          <button
                            key={per}
                            onClick={() => setFcReportPeriod(per)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              fcReportPeriod === per ? "bg-[#ED1B2D] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {per}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CalendarClock className="w-4 h-4 text-blue-600" />
                          <span>1. Follow-up Report</span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                            <thead className="bg-slate-100 text-slate-700 font-bold">
                              <tr>
                                <th className="p-2">FC Name</th>
                                <th className="p-2 text-center">Total Assigned Policy</th>
                                <th className="p-2 text-center">Total Action</th>
                                <th className="p-2 text-right">% Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">{loggedInFcPerformanceRow.name}</td>
                                <td className="p-2 text-center font-mono">{loggedInFcPerformanceRow.totalAssignedPolicy}</td>
                                <td className="p-2 text-center font-bold text-blue-700">{loggedInFcPerformanceRow.followUpActionsDone}</td>
                                <td className="p-2 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {loggedInFcPerformanceRow.followUpPct}%
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Gift className="w-4 h-4 text-[#ED1B2D]" />
                          <span>2. Birthday Report</span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                            <thead className="bg-slate-100 text-slate-700 font-bold">
                              <tr>
                                <th className="p-2">FC Name</th>
                                <th className="p-2 text-center">Total Assigned Policy</th>
                                <th className="p-2 text-center">Total Action</th>
                                <th className="p-2 text-right">% Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">{loggedInFcPerformanceRow.name}</td>
                                <td className="p-2 text-center font-mono">{loggedInFcPerformanceRow.totalAssignedPolicy}</td>
                                <td className="p-2 text-center font-bold text-[#ED1B2D]">{loggedInFcPerformanceRow.bdayActionsDone}</td>
                                <td className="p-2 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#ED1B2D] border border-red-200">
                                    {loggedInFcPerformanceRow.birthdayPct}%
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50 lg:col-span-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span>3. Action Type Log (Expanded Breakdown)</span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                            <thead className="bg-slate-100 text-slate-700 font-bold">
                              <tr>
                                <th className="p-2">FC Name</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">Schedule meeting</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">Premium reminder</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">PO will deposit</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">PO already deposited</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">PO will reinstate</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">Already reinstated</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">PO requested delay</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">PO requested surrender</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">Can not contact</th>
                                <th className="p-2 text-center bg-purple-50 text-purple-900">BDM Directive</th>
                                <th className="p-2 text-right font-bold">Total Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">{loggedInFcPerformanceRow.name}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["Schedule meeting"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["Premium reminder"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["PO will deposit"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["PO said already deposited"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["PO will reinstate"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["Already reinstated"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["PO requested delay"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["PO requested surrender"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["Can not contact"]}</td>
                                <td className="p-2 text-center font-mono bg-purple-50/30">{loggedInFcPerformanceRow.actionTypesCount["BDM Directive"]}</td>
                                <td className="p-2 text-right font-bold text-purple-700">{loggedInFcPerformanceRow.totalActionDid}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50 lg:col-span-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-amber-600" />
                          <span>4. Lapse Category Report</span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                            <thead className="bg-slate-100 text-slate-700 font-bold">
                              <tr>
                                <th className="p-2">FC Name</th>
                                <th className="p-2 text-center">Total Assigned</th>
                                <th className="p-2 text-center bg-emerald-50 text-emerald-900">Up to Date (#)</th>
                                <th className="p-2 text-center bg-emerald-50 text-emerald-900">Actions on Up to Date</th>
                                <th className="p-2 text-center bg-amber-50 text-amber-900">Lapse 0–60d (#)</th>
                                <th className="p-2 text-center bg-orange-50 text-orange-900">Lapse 61–90d (#)</th>
                                <th className="p-2 text-center bg-red-50 text-[#ED1B2D]">Lapse &gt;90d (#)</th>
                                <th className="p-2 text-center font-bold">Total Overdue</th>
                                <th className="p-2 text-center font-bold text-blue-700">Actions on Overdue</th>
                                <th className="p-2 text-right">% Action Coverage</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">{loggedInFcPerformanceRow.name}</td>
                                <td className="p-2 text-center font-mono">{loggedInFcPerformanceRow.totalAssignedPolicy}</td>
                                <td className="p-2 text-center font-mono bg-emerald-50/30">{loggedInFcPerformanceRow.upToDateCount}</td>
                                <td className="p-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                                  {comments.filter(c => {
                                    if (c.fcId !== currentFC.id) return false;
                                    const validTime = isDateInPeriod(c.date, fcReportPeriod, asOfDate);
                                    if (!validTime) return false;
                                    const pol = loggedInFcPerformanceRow.scopedFcPolicies.find(p => p.policyNo === c.policyNo);
                                    return pol && pol.lapseInfo.bucket === "UP_TO_DATE";
                                  }).length}
                                </td>
                                <td className="p-2 text-center font-mono bg-amber-50/30">{loggedInFcPerformanceRow.lapse0_60Count}</td>
                                <td className="p-2 text-center font-mono bg-orange-50/30">{loggedInFcPerformanceRow.lapse61_90Count}</td>
                                <td className="p-2 text-center font-mono bg-red-50/30 text-[#ED1B2D] font-bold">{loggedInFcPerformanceRow.lapseOver90Count}</td>
                                <td className="p-2 text-center font-mono font-bold text-slate-900">{loggedInFcPerformanceRow.totalLapseCount}</td>
                                <td className="p-2 text-center font-mono font-bold text-blue-700">{loggedInFcPerformanceRow.lapseActionsDone}</td>
                                <td className="p-2 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    {loggedInFcPerformanceRow.lapseActionPct}%
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Menu className="w-4 h-4" />
                        <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                          Assigned Policies Directory ({fcFilteredAndSortedPolicies.length} Records)
                          {categoryFilter !== "ALL" && <span className="ml-2 px-2 py-0.5 bg-black/30 rounded text-[10px]">Lapse: {categoryFilter}</span>}
                          {typeFilter !== "ALL" && <span className="ml-2 px-2 py-0.5 bg-black/30 rounded text-[10px]">Type: {typeFilter}</span>}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search Client Name, Policy No, or Note..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 pl-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ED1B2D]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                        >
                          <option value="ALL">All Lapse Buckets</option>
                          <option value="UP_TO_DATE">Up to Date</option>
                          <option value="LAPSE_0_60">Lapse 0-60d</option>
                          <option value="LAPSE_61_90">Lapse 61-90d</option>
                          <option value="LAPSE_OVER_90">Lapse &gt;90d</option>
                        </select>

                        <select
                          value={telegramFilter}
                          onChange={(e) => setTelegramFilter(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                        >
                          <option value="ALL">Telegram: All</option>
                          <option value="Linked">Telegram: Linked</option>
                          <option value="NotYet">Telegram: Not Yet</option>
                        </select>

                        <select
                          value={transferFilter}
                          onChange={(e) => setTransferFilter(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                        >
                          <option value="ALL">Status: All</option>
                          <option value="Active">Active</option>
                          <option value="Transfer">Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#ED1B2D] text-white font-bold tracking-wider">
                          <tr>
                            <th onClick={() => handleSort("clientName")} className="py-2.5 px-3 cursor-pointer hover:bg-red-700 border-r border-white/20">
                              <div className="flex items-center gap-1">
                                <span>Client Name</span>
                                {renderSortIcon("clientName")}
                              </div>
                            </th>
                            <th onClick={() => handleSort("policyNo")} className="py-2.5 px-3 cursor-pointer hover:bg-red-700 border-r border-white/20">
                              <div className="flex items-center gap-1">
                                <span>Policy No</span>
                                {renderSortIcon("policyNo")}
                              </div>
                            </th>
                            <th className="py-2.5 px-2 text-center border-r border-white/20">Telegram</th>
                            <th className="py-2.5 px-3 border-r border-white/20">Status</th>
                            <th className="py-2.5 px-3 border-r border-white/20">Type</th>
                            <th onClick={() => handleSort("paidToDate")} className="py-2.5 px-3 cursor-pointer hover:bg-red-700 border-r border-white/20">
                              <div className="flex items-center gap-1">
                                <span>Paid To Date</span>
                                {renderSortIcon("paidToDate")}
                              </div>
                            </th>
                            <th className="py-2.5 px-3 border-r border-white/20">Birthday</th>
                            <th className="py-2.5 px-3 border-r border-white/20">Lapse Ageing</th>
                            <th onClick={() => handleSort("premium")} className="py-2.5 px-3 cursor-pointer hover:bg-red-700 border-r border-white/20 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span>Premium ($)</span>
                                {renderSortIcon("premium")}
                              </div>
                            </th>
                            <th className="py-2.5 px-3 border-r border-white/20">Next Target</th>
                            <th onClick={() => handleSort("latestNoteDate")} className="py-2.5 px-3 cursor-pointer hover:bg-red-700 border-r border-white/20 min-w-[200px]">
                              <div className="flex items-center gap-1">
                                <span>Latest Note</span>
                                {renderSortIcon("latestNoteDate")}
                              </div>
                            </th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {fcFilteredAndSortedPolicies.length === 0 ? (
                            <tr>
                              <td colSpan={12} className="py-8 text-center text-slate-500 font-medium">
                                No policies matching the filter criteria.
                              </td>
                            </tr>
                          ) : (
                            fcFilteredAndSortedPolicies.map((pol) => {
                              const { lapseInfo, followUpInfo, bdayInfo } = pol;
                              return (
                                <tr
                                  key={pol.id}
                                  onClick={() => setSelectedPolicy(pol)}
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <td className="py-2.5 px-3 border-r border-slate-200">
                                    <span className="font-bold text-slate-900 block">{pol.clientName}</span>
                                    <span className="text-[11px] text-slate-500 font-mono">{pol.mobile}</span>
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-800">
                                    #{pol.policyNo}
                                  </td>
                                  <td className="py-2.5 px-2 border-r border-slate-200 text-center">
                                    {pol.telegramLinked ? (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F4FB] text-[#0088cc] border border-[#BDE3F7]">
                                        <TelegramIcon className="w-2.5 h-2.5" /> Linked
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Not Yet</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      pol.transferStatus === "Transfer" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                      {pol.transferStatus}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200">
                                    <span className="text-[11px] font-medium text-slate-600">{pol.type}</span>
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-800 font-semibold">
                                    {pol.paidToDate}
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200">
                                    <span className="text-[11px] text-slate-700 font-mono block">{bdayInfo.formattedMonthDay}</span>
                                    {bdayInfo.inRange && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded border font-bold ${bdayInfo.badgeStyle}`}>
                                        {bdayInfo.label}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${lapseInfo.badgeStyle}`}>
                                      {lapseInfo.categoryName}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                                    ${pol.premium.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-[11px]">
                                    {pol.nextFollowUpDate || <span className="text-slate-400 italic">None</span>}
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-200 max-w-xs">
                                    <div className="text-[11px] text-slate-800 font-medium line-clamp-1" title={pol.latestNote}>
                                      {pol.latestNote || "No notes logged yet"}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="font-mono">{pol.latestNoteDate}</span>
                                      {pol.latestNoteType && pol.latestNoteType !== "N/A" && (
                                        <span className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[9px] font-semibold text-slate-600">
                                          {pol.latestNoteType}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPolicy(pol);
                                        setShowAddNoteModal(true);
                                      }}
                                      className="px-2 py-1 bg-[#ED1B2D] hover:bg-red-700 text-white rounded text-[11px] font-bold transition-all inline-flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" /> Note
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeRole === "BDM" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#ED1B2D] flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Supervised Consultants Performance & Engagement Audit
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Branch-wide report showing all supervised Financial Consultants with identical structure to the FC Performance Matrix.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Type:</span>
                    {[
                      { id: "ALL", label: "All Types" },
                      { id: "Existing", label: "Existing" },
                      { id: "Paid Rate", label: "Paid Rate" },
                    ].map((scope) => (
                      <button
                        key={scope.id}
                        onClick={() => setBdmClientTypeScope(scope.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          bdmClientTypeScope === scope.id
                            ? "bg-[#ED1B2D] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium block">Renewal Premium Collection</span>
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-sans text-slate-900">
                      ${bdmTeamTotals.collectedRenewalAPE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Exp: ${bdmTeamTotals.expectedRenewalAPE.toFixed(0)}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-blue-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>In-force active collection</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium block">Lapsed Policies</span>
                    <span className="p-1.5 bg-red-50 text-[#ED1B2D] rounded">
                      <AlertOctagon className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-sans text-[#ED1B2D]">
                      {bdmTeamTotals.lapsedPoliciesCount} Cases
                    </span>
                    <span className="text-xs text-[#ED1B2D] font-bold">
                      ${bdmTeamTotals.lapsedAPE.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#ED1B2D] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (bdmTeamTotals.lapsedPoliciesCount / Math.max(1, bdmTeamTotals.totalAssignedPolicies)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium block">Collected Premium Rate</span>
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-sans text-emerald-700">
                      {bdmTeamTotals.collectedPremiumRate}%
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Target: &gt;80%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${bdmTeamTotals.collectedPremiumRate}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium block">Total Branch Interactions</span>
                    <span className="p-1.5 bg-purple-50 text-purple-600 rounded">
                      <Activity className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-sans text-slate-900">
                      {bdmTeamTotals.totalActionsInPeriod} Logs
                    </span>
                    <span className="text-xs text-purple-700 font-bold">
                      Period: {bdmReportPeriod}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Scope: {bdmClientTypeScope}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Supervised FCs Performance & Engagement Report Matrix ({bdmFcDiagnostics.length} Consultants)
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                    <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Period:</span>
                    {["DAILY", "WEEKLY", "MONTHLY", "ALL"].map((per) => (
                      <button
                        key={per}
                        onClick={() => setBdmReportPeriod(per)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          bdmReportPeriod === per ? "bg-[#ED1B2D] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {per}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CalendarClock className="w-4 h-4 text-blue-600" />
                      <span>1. Follow-up Report (All Supervised FCs)</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">FC Name</th>
                            <th className="p-2 text-center">Total Assigned Policy</th>
                            <th className="p-2 text-center">Total Action</th>
                            <th className="p-2 text-right">% Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bdmFcDiagnostics.map((fc) => (
                            <tr key={`bdm-follow-${fc.id}`} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">
                                {fc.name} <span className="text-[10px] text-slate-400 font-mono">({fc.id})</span>
                              </td>
                              <td className="p-2 text-center font-mono">{fc.totalCount}</td>
                              <td className="p-2 text-center font-bold text-blue-700">{fc.followUpActions}</td>
                              <td className="p-2 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  fc.totalScheduledFollowUps === 0 ? "bg-slate-100 text-slate-600 border-slate-300" : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {fc.totalScheduledFollowUps === 0 ? "100%" : `${fc.followUpActionCoverage}%`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-[#ED1B2D]" />
                      <span>2. Birthday Report (All Supervised FCs)</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">FC Name</th>
                            <th className="p-2 text-center">Total Assigned Policy</th>
                            <th className="p-2 text-center">Total Action</th>
                            <th className="p-2 text-right">% Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bdmFcDiagnostics.map((fc) => (
                            <tr key={`bdm-bday-${fc.id}`} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">
                                {fc.name} <span className="text-[10px] text-slate-400 font-mono">({fc.id})</span>
                              </td>
                              <td className="p-2 text-center font-mono">{fc.totalCount}</td>
                              <td className="p-2 text-center font-bold text-[#ED1B2D]">{fc.bdayActions}</td>
                              <td className="p-2 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  fc.totalBirthdaysInWindow === 0 ? "bg-slate-100 text-slate-600 border-slate-300" : "bg-red-50 text-[#ED1B2D] border-red-200"
                                }`}>
                                  {fc.totalBirthdaysInWindow === 0 ? "100%" : `${fc.birthdayActionCoverage}%`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50 lg:col-span-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>3. Action Type Log (Expanded Breakdown - All FCs)</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">FC Name</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">Schedule meeting</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">Premium reminder</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">PO will deposit</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">PO already deposited</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">PO will reinstate</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">Already reinstated</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">PO requested delay</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">PO requested surrender</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">Can not contact</th>
                            <th className="p-2 text-center bg-purple-50 text-purple-900">BDM Directive</th>
                            <th className="p-2 text-right font-bold">Total Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bdmFcDiagnostics.map((fc) => (
                            <tr key={`bdm-action-${fc.id}`} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">
                                {fc.name} <span className="text-[10px] text-slate-400 font-mono">({fc.id})</span>
                              </td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["Schedule meeting"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["Premium reminder"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["PO will deposit"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["PO said already deposited"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["PO will reinstate"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["Already reinstated"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["PO requested delay"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["PO requested surrender"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["Can not contact"]}</td>
                              <td className="p-2 text-center font-mono bg-purple-50/30">{fc.actionTypesCount["BDM Directive"]}</td>
                              <td className="p-2 text-right font-bold text-purple-700">{fc.totalActions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50 lg:col-span-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>4. Lapse Category Report (All Supervised FCs)</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">FC Name</th>
                            <th className="p-2 text-center">Total Assigned</th>
                            <th className="p-2 text-center bg-emerald-50 text-emerald-900">Up to Date (#)</th>
                            <th className="p-2 text-center bg-emerald-50 text-emerald-900">Actions on Up to Date</th>
                            <th className="p-2 text-center bg-amber-50 text-amber-900">Lapse 0–60d (#)</th>
                            <th className="p-2 text-center bg-orange-50 text-orange-900">Lapse 61–90d (#)</th>
                            <th className="p-2 text-center bg-red-50 text-[#ED1B2D]">Lapse &gt;90d (#)</th>
                            <th className="p-2 text-center font-bold">Total Overdue</th>
                            <th className="p-2 text-center font-bold text-blue-700">Actions on Overdue</th>
                            <th className="p-2 text-right">Action Coverage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bdmFcDiagnostics.map((fc) => {
                            const overdueActionsCount = comments.filter(c => {
                              if (c.fcId !== fc.id) return false;
                              const validTime = isDateInPeriod(c.date, bdmReportPeriod, asOfDate);
                              if (!validTime) return false;
                              const pol = fc.scopedFcPolicies.find(p => p.policyNo === c.policyNo);
                              return pol && pol.lapseInfo.isOverdue;
                            }).length;

                            const upToDateActionsCount = comments.filter(c => {
                              if (c.fcId !== fc.id) return false;
                              const validTime = isDateInPeriod(c.date, bdmReportPeriod, asOfDate);
                              if (!validTime) return false;
                              const pol = fc.scopedFcPolicies.find(p => p.policyNo === c.policyNo);
                              return pol && pol.lapseInfo.bucket === "UP_TO_DATE";
                            }).length;

                            const lapseCoveragePct = fc.totalLapseCount > 0 
                              ? Math.min(100, Math.round((overdueActionsCount / fc.totalLapseCount) * 100)) 
                              : 100;

                            return (
                              <tr key={`bdm-lapse-${fc.id}`} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">
                                  {fc.name} <span className="text-[10px] text-slate-400 font-mono">({fc.id})</span>
                                </td>
                                <td className="p-2 text-center font-mono">{fc.totalCount}</td>
                                <td className="p-2 text-center font-mono bg-emerald-50/30">{fc.upToDateCount}</td>
                                <td className="p-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">{upToDateActionsCount}</td>
                                <td className="p-2 text-center font-mono bg-amber-50/30">{fc.lapse0_60Count}</td>
                                <td className="p-2 text-center font-mono bg-orange-50/30">{fc.lapse61_90Count}</td>
                                <td className="p-2 text-center font-mono bg-red-50/30 text-[#ED1B2D] font-bold">{fc.lapseOver90Count}</td>
                                <td className="p-2 text-center font-mono font-bold text-slate-900">{fc.totalLapseCount}</td>
                                <td className="p-2 text-center font-mono font-bold text-blue-700">{overdueActionsCount}</td>
                                <td className="p-2 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    {lapseCoveragePct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* BDM VIEW ASSIGNED POLICIES DIRECTORY WITH ALL FILTERS */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden mt-6">
                <div className="bg-[#ED1B2D] text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                      Branch-wide Assigned Policies Directory ({bdmFilteredAndSortedPolicies.length} Records)
                    </h3>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Client, Policy, Consultant..."
                      value={bdmPolicySearch}
                      onChange={(e) => setBdmPolicySearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 pl-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ED1B2D]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={bdmCategoryFilter}
                      onChange={(e) => setBdmCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                    >
                      <option value="ALL">Lapse: All Buckets</option>
                      <option value="UP_TO_DATE">Up to Date</option>
                      <option value="LAPSE_0_60">Lapse 0-60d</option>
                      <option value="LAPSE_61_90">Lapse 61-90d</option>
                      <option value="LAPSE_OVER_90">Lapse &gt;90d</option>
                    </select>

                    <select
                      value={bdmActionTypeFilter}
                      onChange={(e) => setBdmActionTypeFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                    >
                      <option value="ALL">Action Type: All</option>
                      {NOTE_ACTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <select
                      value={bdmTelegramFilter}
                      onChange={(e) => setBdmTelegramFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                    >
                      <option value="ALL">Telegram: All</option>
                      <option value="Linked">Linked</option>
                      <option value="NotYet">Not Yet</option>
                    </select>

                    <select
                      value={bdmTransferFilter}
                      onChange={(e) => setBdmTransferFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#ED1B2D]"
                    >
                      <option value="ALL">Status: All</option>
                      <option value="Active">Active</option>
                      <option value="Transfer">Transfer</option>
                    </select>

                    <button
                      onClick={() => {
                        setBdmPolicySearch("");
                        setBdmActionTypeFilter("ALL");
                        setBdmCategoryFilter("ALL");
                        setBdmTelegramFilter("ALL");
                        setBdmTransferFilter("ALL");
                        setBdmClientTypeScope("ALL");
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#ED1B2D] text-white font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-white/20">Client Name</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Policy No</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Consultant</th>
                        <th className="py-2.5 px-2 text-center border-r border-white/20">Telegram</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Status</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Paid To Date</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Lapse Ageing</th>
                        <th className="py-2.5 px-3 border-r border-white/20 text-right">Premium ($)</th>
                        <th className="py-2.5 px-3 border-r border-white/20">Latest Action Type</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Latest Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bdmFilteredAndSortedPolicies.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                            No policies matching the selected BDM filter criteria.
                          </td>
                        </tr>
                      ) : (
                        bdmFilteredAndSortedPolicies.map((pol) => {
                          const { lapseInfo } = pol;
                          return (
                            <tr
                              key={`bdm-pol-${pol.id}`}
                              onClick={() => setSelectedPolicy(pol)}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <span className="font-bold text-slate-900 block">{pol.clientName}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{pol.mobile}</span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-800">
                                #{pol.policyNo}
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <span className="font-bold text-slate-900 block">{pol.currentFcName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {pol.currentFcId}</span>
                              </td>
                              <td className="py-2.5 px-2 border-r border-slate-200 text-center">
                                {pol.telegramLinked ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F4FB] text-[#0088cc] border border-[#BDE3F7]">
                                    <TelegramIcon className="w-2.5 h-2.5" /> Linked
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Not Yet</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pol.transferStatus === "Transfer" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {pol.transferStatus}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-800 font-semibold">
                                {pol.paidToDate}
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${lapseInfo.badgeStyle}`}>
                                  {lapseInfo.categoryName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                                ${pol.premium.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-200">
                                {pol.latestNoteType && pol.latestNoteType !== "N/A" ? (
                                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                                    {pol.latestNoteType}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 max-w-xs">
                                <div className="text-[11px] text-slate-800 font-medium line-clamp-1" title={pol.latestNote}>
                                  {pol.latestNote || "No notes logged yet"}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {pol.latestNoteDate}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {actionNudgeModalOpen && selectedFcForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#ED1B2D] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Dispatch BDM Directive to {selectedFcForAction.name}</span>
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Consultant ID: {selectedFcForAction.id} • Persistency: {selectedFcForAction.persistencyRate}%
                </p>
              </div>
              <button
                onClick={() => setActionNudgeModalOpen(false)}
                className="text-white hover:text-white/80 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendActionNudge} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Intervention Category
                </label>
                <select
                  value={actionNudgeType}
                  onChange={(e) => setActionNudgeType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[#ED1B2D]"
                >
                  <option value="Urgent Reinstatement Drive">Urgent Reinstatement Drive (&gt;90d Lapse)</option>
                  <option value="Grace Period Follow-up Clearance">Grace Period Follow-up Clearance</option>
                  <option value="Telegram Digital Onboarding">Telegram Digital Linkage Drive</option>
                  <option value="Joint Client Visit Request">Joint Client Physical Visit Request</option>
                  <option value="Birthday Cross-Sell Directive">Birthday Anniversary Cross-Sell Directive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Automated Recommendation Reference:
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] leading-relaxed">
                  {selectedFcForAction.recommendedAction}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Custom Directive Remarks & Deadline
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific instructions or target resolution date for this FC..."
                  value={actionNudgeMessage}
                  onChange={(e) => setActionNudgeMessage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-[#ED1B2D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionNudgeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ED1B2D] hover:bg-red-700 text-white rounded text-xs font-bold shadow-2xs"
                >
                  Send Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#ED1B2D] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Orphan Policy Reallocation Hub</span>
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Reassign policies from inactive/terminated agents
                </p>
              </div>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="text-white hover:text-white/80 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Select Policy to Reassign
                </label>
                <select
                  value={policyToReassign?.policyNo || ""}
                  onChange={(e) => {
                    const pol = policies.find((p) => p.policyNo === e.target.value);
                    setPolicyToReassign(pol || null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-semibold text-slate-800"
                >
                  {policies
                    .filter((p) => {
                      const owner = fcs.find((f) => f.id === p.currentFcId);
                      return owner && owner.status === "Terminated";
                    })
                    .map((p) => (
                      <option key={p.policyNo} value={p.policyNo}>
                        #{p.policyNo} - {p.clientName} (${p.premium.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Assign To Active Consultant
                </label>
                <select
                  value={targetFcIdForReassign}
                  onChange={(e) => setTargetFcIdForReassign(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-semibold text-slate-800"
                >
                  {fcs
                    .filter((f) => f.status === "Active")
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.role} - ID: {f.id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded border border-purple-100 text-purple-800 text-[11px]">
                Upon reassignment, the policy status will change to <strong>Transfer</strong> and the selected FC will receive notification for immediate customer outreach.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setReassignModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteReassign}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#ED1B2D] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <span>{selectedPolicy.clientName}</span>
                  <span className="font-mono bg-white/20 text-white text-xs px-2 py-0.5 rounded">
                    #{selectedPolicy.policyNo}
                  </span>
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Assigned to: {selectedPolicy.currentFcName} ({selectedPolicy.currentFcId})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedPolicy(null);
                  setShowAddNoteModal(false);
                }}
                className="text-white hover:text-white/80 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Status</span>
                  <span className="font-bold text-slate-800">{selectedPolicy.transferStatus}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Type</span>
                  <span className="font-bold text-slate-800">{selectedPolicy.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Paid To Date</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedPolicy.paidToDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Annual Premium</span>
                  <span className="font-bold text-[#ED1B2D] font-mono">
                    ${selectedPolicy.premium.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50/50 rounded border border-red-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#ED1B2D]" />
                  <span className="font-mono font-bold text-slate-900">{selectedPolicy.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedPolicy.mobile}`}
                    className="px-3 py-1.5 bg-[#ED1B2D] text-white rounded text-xs font-bold"
                  >
                    Call Client
                  </a>
                  {selectedPolicy.telegramLinked && (
                    <a
                      href={`https://t.me/+855${selectedPolicy.mobile.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#0088cc] text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <TelegramIcon className="w-3 h-3" /> Telegram
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-900 text-xs">Note & Follow-up History</span>
                {!showAddNoteModal && (
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="px-2.5 py-1 bg-[#ED1B2D] text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Note
                  </button>
                )}
              </div>

              {showAddNoteModal && (
                <form
                  onSubmit={handleAddComment}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2.5"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Action Type</label>
                      <select
                        value={newNoteType}
                        onChange={(e) => setNewNoteType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                      >
                        {NOTE_ACTION_TYPES.filter(t => t !== "BDM Directive").map((typeOption) => (
                          <option key={typeOption} value={typeOption}>
                            {typeOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Target Follow-up Date</label>
                      <input
                        type="date"
                        value={newFollowUpDate}
                        onChange={(e) => setNewFollowUpDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Note Description</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter follow-up details or remarks..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNoteModal(false)}
                      className="px-2.5 py-1 text-slate-600 text-xs hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#ED1B2D] text-white rounded text-xs font-bold"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {comments.filter((c) => c.policyNo === selectedPolicy.policyNo).length === 0 ? (
                  <div className="text-center py-4 text-slate-400">No notes recorded yet.</div>
                ) : (
                  comments
                    .filter((c) => c.policyNo === selectedPolicy.policyNo)
                    .map((comm) => (
                      <div key={comm.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                          <span className="font-bold text-slate-800 font-sans">{comm.fcName} ({comm.fcId})</span>
                          <span>{comm.date}</span>
                        </div>
                        <p className="text-slate-800">{comm.content}</p>
                        {comm.nextFollowUp && comm.nextFollowUp !== "N/A" && (
                          <div className="text-[10px] text-[#ED1B2D] font-bold">
                            Target: {comm.nextFollowUp}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedPolicy(null);
                  setShowAddNoteModal(false);
                }}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}