import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Upload,
  Archive,
  Search,
  Download,
  Eye,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
  BarChart3,
  FolderOpen,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType =
  | "Công văn"
  | "Quyết định"
  | "Kế hoạch"
  | "Quy chế"
  | "Thông báo"
  | "Biên bản";

type DocStatus = "Mới" | "Đang xử lý" | "Đã ban hành" | "Lưu trữ";

interface Document {
  id: string;
  soHieu: string;
  tieuDe: string;
  loai: DocType;
  ngayBanHanh: string;
  nguoiKy: string;
  trangThai: DocStatus;
  tags: string[];
  tomTat: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
  folderPath?: string;
  archivedAt?: string;
}

type WorkflowStep =
  | "Tờ trình"
  | "Soạn thảo"
  | "Trình ký"
  | "Ban hành"
  | "Lưu trữ";

interface WorkflowItem {
  id: string;
  documentTitle: string;
  soHieu: string;
  currentStep: WorkflowStep;
  assignee: string;
  sla: string;
  stepsCompleted: number; // 0–4
  overdue: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_STEPS: WorkflowStep[] = [
  "Tờ trình",
  "Soạn thảo",
  "Trình ký",
  "Ban hành",
  "Lưu trữ",
];

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-01",
    soHieu: "01/CV-BGH",
    tieuDe: "Công văn về kế hoạch năm học 2026-2027",
    loai: "Công văn",
    ngayBanHanh: "2026-05-10",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["kế hoạch", "năm học", "BGH"],
    tomTat:
      "Triển khai kế hoạch tổng thể cho năm học 2026-2027 bao gồm các hoạt động dạy và học.",
  },
  {
    id: "doc-02",
    soHieu: "15/QĐ-BGH",
    tieuDe: "Quyết định về tuyển dụng giáo viên năm học 2026",
    loai: "Quyết định",
    ngayBanHanh: "2026-04-22",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["tuyển dụng", "giáo viên", "nhân sự"],
    tomTat: "Quyết định tuyển dụng 12 giáo viên mới cho các bộ môn còn thiếu.",
  },
  {
    id: "doc-03",
    soHieu: "KH-STEM-Q3/2026",
    tieuDe: "Kế hoạch triển khai STEM Quarter 3 năm 2026",
    loai: "Kế hoạch",
    ngayBanHanh: "2026-06-01",
    nguoiKy: "PHT Trần Thị Bình",
    trangThai: "Đang xử lý",
    tags: ["STEM", "kế hoạch", "Q3"],
    tomTat:
      "Lộ trình triển khai giáo dục STEM trong quý 3, bao gồm đào tạo giáo viên và chuẩn bị trang thiết bị.",
  },
  {
    id: "doc-04",
    soHieu: "QC-TCM/2026",
    tieuDe: "Quy chế hoạt động tổ chuyên môn năm học 2026-2027",
    loai: "Quy chế",
    ngayBanHanh: "2026-05-15",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["quy chế", "tổ chuyên môn"],
    tomTat: "Quy định về tổ chức, hoạt động và trách nhiệm của tổ chuyên môn.",
  },
  {
    id: "doc-05",
    soHieu: "BB-BGH-T5/2026",
    tieuDe: "Biên bản họp BGH tháng 5 năm 2026",
    loai: "Biên bản",
    ngayBanHanh: "2026-05-30",
    nguoiKy: "Thư ký Lê Thị Cúc",
    trangThai: "Lưu trữ",
    tags: ["biên bản", "họp BGH", "tháng 5"],
    tomTat:
      "Ghi nhận nội dung và kết luận cuộc họp Ban Giám hiệu định kỳ tháng 5/2026.",
  },
  {
    id: "doc-06",
    soHieu: "TB-LT-HK2/2026",
    tieuDe: "Thông báo lịch thi cuối kỳ 2 năm học 2025-2026",
    loai: "Thông báo",
    ngayBanHanh: "2026-05-20",
    nguoiKy: "PHT Trần Thị Bình",
    trangThai: "Đã ban hành",
    tags: ["thi cử", "cuối kỳ", "lịch thi"],
    tomTat: "Thông báo lịch thi cuối học kỳ 2, phân công coi thi và địa điểm.",
  },
  {
    id: "doc-07",
    soHieu: "02/CV-BGH",
    tieuDe: "Công văn gửi Sở GD&ĐT về kết quả học kỳ 1",
    loai: "Công văn",
    ngayBanHanh: "2026-02-10",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Lưu trữ",
    tags: ["báo cáo", "học kỳ 1", "Sở GD&ĐT"],
    tomTat: "Báo cáo kết quả học tập học kỳ 1 gửi Sở Giáo dục và Đào tạo.",
  },
  {
    id: "doc-08",
    soHieu: "16/QĐ-BGH",
    tieuDe: "Quyết định khen thưởng học sinh xuất sắc HK1",
    loai: "Quyết định",
    ngayBanHanh: "2026-02-20",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["khen thưởng", "học sinh", "xuất sắc"],
    tomTat: "Danh sách và quyết định khen thưởng học sinh đạt thành tích xuất sắc.",
  },
  {
    id: "doc-09",
    soHieu: "KH-BD-GV/2026",
    tieuDe: "Kế hoạch bồi dưỡng giáo viên hè 2026",
    loai: "Kế hoạch",
    ngayBanHanh: "2026-06-05",
    nguoiKy: "PHT Trần Thị Bình",
    trangThai: "Mới",
    tags: ["bồi dưỡng", "giáo viên", "hè 2026"],
    tomTat:
      "Kế hoạch tổ chức các khóa bồi dưỡng chuyên môn, nghiệp vụ cho giáo viên trong hè.",
  },
  {
    id: "doc-10",
    soHieu: "TB-PHHM/2026",
    tieuDe: "Thông báo phụ huynh về hoạt động hè 2026",
    loai: "Thông báo",
    ngayBanHanh: "2026-06-03",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["phụ huynh", "hè", "thông báo"],
    tomTat: "Thông báo gửi phụ huynh về các hoạt động hè và lịch học bù.",
  },
  {
    id: "doc-11",
    soHieu: "BB-TCM-T4/2026",
    tieuDe: "Biên bản sinh hoạt tổ chuyên môn Toán tháng 4",
    loai: "Biên bản",
    ngayBanHanh: "2026-04-28",
    nguoiKy: "Tổ trưởng Phạm Minh Đức",
    trangThai: "Lưu trữ",
    tags: ["tổ toán", "sinh hoạt chuyên môn"],
    tomTat:
      "Ghi nhận nội dung sinh hoạt tổ chuyên môn Toán, trao đổi phương pháp giảng dạy.",
  },
  {
    id: "doc-12",
    soHieu: "QC-KT/2026",
    tieuDe: "Quy chế kiểm tra đánh giá học sinh năm học 2026",
    loai: "Quy chế",
    ngayBanHanh: "2026-03-01",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đã ban hành",
    tags: ["quy chế", "kiểm tra", "đánh giá"],
    tomTat:
      "Quy định hình thức, tần suất, thang điểm kiểm tra đánh giá học sinh theo chương trình GDPT 2018.",
  },
  {
    id: "doc-13",
    soHieu: "03/CV-BGH",
    tieuDe: "Công văn đề xuất cấp kinh phí mua sắm thiết bị",
    loai: "Công văn",
    ngayBanHanh: "2026-06-08",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Đang xử lý",
    tags: ["kinh phí", "thiết bị", "mua sắm"],
    tomTat:
      "Đề xuất cấp kinh phí mua sắm thiết bị dạy học STEM và hệ thống camera an ninh.",
  },
  {
    id: "doc-14",
    soHieu: "KH-ANTT/2026",
    tieuDe: "Kế hoạch an ninh trật tự trường học năm 2026",
    loai: "Kế hoạch",
    ngayBanHanh: "2026-01-15",
    nguoiKy: "PHT Lê Quang Hải",
    trangThai: "Lưu trữ",
    tags: ["an ninh", "trật tự", "an toàn trường học"],
    tomTat:
      "Kế hoạch đảm bảo an ninh, trật tự và an toàn trong môi trường học đường năm 2026.",
  },
  {
    id: "doc-15",
    soHieu: "17/QĐ-BGH",
    tieuDe: "Quyết định thành lập ban chỉ đạo chuyển đổi số",
    loai: "Quyết định",
    ngayBanHanh: "2026-06-09",
    nguoiKy: "Hiệu trưởng Nguyễn Văn An",
    trangThai: "Mới",
    tags: ["chuyển đổi số", "ban chỉ đạo", "CĐS"],
    tomTat:
      "Thành lập ban chỉ đạo thực hiện chuyển đổi số toàn diện trong nhà trường.",
  },
];

const MOCK_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-01",
    documentTitle: "Kế hoạch triển khai STEM Quarter 3 năm 2026",
    soHieu: "KH-STEM-Q3/2026",
    currentStep: "Trình ký",
    assignee: "PHT Trần Thị Bình",
    sla: "13/06/2026",
    stepsCompleted: 2,
    overdue: false,
  },
  {
    id: "wf-02",
    documentTitle: "Công văn đề xuất cấp kinh phí mua sắm thiết bị",
    soHieu: "03/CV-BGH",
    currentStep: "Soạn thảo",
    assignee: "CV Hành chính Nguyễn Thị Mai",
    sla: "11/06/2026",
    stepsCompleted: 1,
    overdue: true,
  },
  {
    id: "wf-03",
    documentTitle: "Quyết định thành lập ban chỉ đạo chuyển đổi số",
    soHieu: "17/QĐ-BGH",
    currentStep: "Tờ trình",
    assignee: "PHT Lê Quang Hải",
    sla: "15/06/2026",
    stepsCompleted: 0,
    overdue: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<DocStatus, string> = {
  Mới: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Đang xử lý":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Đã ban hành":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Lưu trữ":
    "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400",
};

const TYPE_COLORS: Record<DocType, string> = {
  "Công văn": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Quyết định": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Kế hoạch": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Quy chế": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Thông báo": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Biên bản": "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const DOCUMENT_STORAGE_KEY = "mis_document_center_documents_v1";
const DOCUMENT_FOLDERS = [
  "Học vụ / Kế hoạch năm học",
  "Học vụ / Giáo án và chuyên môn",
  "Hành chính / Công văn",
  "Hành chính / Quyết định",
  "Nhân sự / Hồ sơ giáo viên",
  "Tuyển sinh / Truyền thông",
  "Vận hành / Cơ sở vật chất",
  "Lưu trữ / Văn bản cũ",
];
const MAX_LOCAL_FILE_SIZE = 2 * 1024 * 1024;

function formatFileSize(size?: number) {
  if (!size) return "Không có tệp";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(content: BlobPart, fileName: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-white/70 text-xs font-medium">{label}</p>
        <p className="text-white text-2xl font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentCenter() {
  const [activeTab, setActiveTab] = useState<
    "documents" | "upload" | "workflow" | "archive"
  >("documents");

  // ── Tab 1 state ──
  const [filterType, setFilterType] = useState<DocType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<DocStatus | "Tất cả">(
    "Tất cả"
  );
  const [folderFilter, setFolderFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem(DOCUMENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_DOCUMENTS;
    } catch {
      return MOCK_DOCUMENTS;
    }
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  // ── Tab 2 state ──
  const [formSoHieu, setFormSoHieu] = useState("");
  const [formTieuDe, setFormTieuDe] = useState("");
  const [formLoai, setFormLoai] = useState<DocType>("Công văn");
  const [formNgay, setFormNgay] = useState("");
  const [formNguoiKy, setFormNguoiKy] = useState("");
  const [formTomTat, setFormTomTat] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formFolder, setFormFolder] = useState(DOCUMENT_FOLDERS[0]);
  const [formWorkflow, setFormWorkflow] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // ── Tab 4 state ──
  const [archiveYear, setArchiveYear] = useState<string>("Tất cả");
  const [archiveType, setArchiveType] = useState<DocType | "Tất cả">("Tất cả");

  useEffect(() => {
    try {
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(documents));
    } catch {
      setActionMessage("Không thể lưu thêm vào trình duyệt vì dung lượng lưu trữ cục bộ đã đầy.");
    }
  }, [documents]);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (doc.trangThai === "Lưu trữ") return false; // archive tab
      if (filterType !== "ALL" && doc.loai !== filterType) return false;
      if (filterStatus !== "Tất cả" && doc.trangThai !== filterStatus)
        return false;
      if (folderFilter !== "Tất cả" && (doc.folderPath || DOCUMENT_FOLDERS[0]) !== folderFilter)
        return false;
      if (
        searchQuery &&
        !doc.tieuDe.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doc.soHieu.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [documents, filterType, filterStatus, folderFilter, searchQuery]);

  const archivedDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (doc.trangThai !== "Lưu trữ") return false;
      if (archiveType !== "Tất cả" && doc.loai !== archiveType) return false;
      const year = doc.ngayBanHanh.split("-")[0];
      if (archiveYear !== "Tất cả" && year !== archiveYear) return false;
      return true;
    });
  }, [documents, archiveType, archiveYear]);

  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter(
      (d) => d.trangThai === "Mới" || d.trangThai === "Đang xử lý"
    ).length;
    const archived = documents.filter((d) => d.trangThai === "Lưu trữ").length;
    const thisWeek = documents.filter((d) => {
      const diff =
        (new Date("2026-06-10").getTime() - new Date(d.ngayBanHanh).getTime()) /
        (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
    return { total, pending, archived, thisWeek };
  }, [documents]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function showActionMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(""), 2500);
  }

  function handleView(doc: Document) {
    setSelectedDocument(doc);
  }

  function handleDownload(doc: Document) {
    if (doc.fileDataUrl && doc.fileName) {
      const link = document.createElement("a");
      link.href = doc.fileDataUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showActionMessage(`Đang tải ${doc.fileName}`);
      return;
    }

    const safeSoHieu = doc.soHieu.replace(/[\\/:*?"<>|]/g, "-");
    const fallbackContent = [
      `Số hiệu: ${doc.soHieu}`,
      `Tiêu đề: ${doc.tieuDe}`,
      `Loại: ${doc.loai}`,
      `Ngày ban hành: ${formatDate(doc.ngayBanHanh)}`,
      `Người ký: ${doc.nguoiKy}`,
      `Trạng thái: ${doc.trangThai}`,
      `Tags: ${doc.tags.join(", ") || "Không có"}`,
      "",
      "Tóm tắt:",
      doc.tomTat || "Không có nội dung tóm tắt.",
    ].join("\n");

    downloadBlob(fallbackContent, `${safeSoHieu}.txt`);
    showActionMessage(`Đã tạo file tải xuống cho ${doc.soHieu}`);
  }

  function handleFileSelect(file?: File) {
    if (!file) return;
    setFormError("");

    if (file.size > MAX_LOCAL_FILE_SIZE) {
      setUploadedFile(null);
      setFormError("Tệp vượt quá giới hạn lưu trữ cục bộ 2MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: String(reader.result),
      });
    };
    reader.onerror = () => {
      setFormError("Không thể đọc tệp đính kèm. Vui lòng thử lại.");
    };
    reader.readAsDataURL(file);
  }

  function handleArchive(id: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, trangThai: "Lưu trữ", archivedAt: new Date().toISOString() }
          : d
      )
    );
    showActionMessage("Văn bản đã được chuyển sang kho lưu trữ.");
  }

  function handleRestore(id: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, trangThai: "Đã ban hành", archivedAt: undefined } : d
      )
    );
    showActionMessage("Văn bản đã được khôi phục khỏi kho lưu trữ.");
  }

  function handleSubmitUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!formSoHieu || !formTieuDe || !formNgay) return;
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      soHieu: formSoHieu,
      tieuDe: formTieuDe,
      loai: formLoai,
      ngayBanHanh: formNgay,
      nguoiKy: formNguoiKy || "Chưa xác định",
      trangThai: formWorkflow ? "Đang xử lý" : "Mới",
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tomTat: formTomTat,
      fileName: uploadedFile?.name,
      fileType: uploadedFile?.type,
      fileSize: uploadedFile?.size,
      fileDataUrl: uploadedFile?.dataUrl,
      folderPath: formFolder,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setFormSuccess(true);
    setActionMessage("Văn bản mới đã được lưu vào kho cục bộ.");
    setFormSoHieu("");
    setFormTieuDe("");
    setFormLoai("Công văn");
    setFormNgay("");
    setFormNguoiKy("");
    setFormTomTat("");
    setFormTags("");
    setFormFolder(DOCUMENT_FOLDERS[0]);
    setFormWorkflow(false);
    setUploadedFile(null);
    setFormError("");
    setTimeout(() => setFormSuccess(false), 3000);
  }

  const docTypes: DocType[] = [
    "Công văn",
    "Quyết định",
    "Kế hoạch",
    "Quy chế",
    "Thông báo",
    "Biên bản",
  ];
  const docStatuses: DocStatus[] = [
    "Mới",
    "Đang xử lý",
    "Đã ban hành",
    "Lưu trữ",
  ];

  const tabs = [
    { id: "documents", label: "Văn bản", icon: FileText },
    { id: "upload", label: "Tạo mới", icon: Plus },
    { id: "workflow", label: "Quy trình", icon: BarChart3 },
    { id: "archive", label: "Lưu trữ", icon: Archive },
  ] as const;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/30">
              MODULE 05
            </span>
            <span className="text-white/50 text-sm">•</span>
            <span className="text-white/60 text-sm">MIS SMART PORTAL 2.0</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-display mb-1 flex items-center gap-3">
                <FolderOpen size={32} className="text-indigo-300" />
                Hệ thống quản lý văn bản
              </h1>
              <p className="text-indigo-200 text-sm max-w-xl">
                Quản lý toàn bộ vòng đời văn bản: soạn thảo, phê duyệt, ban
                hành và lưu trữ theo quy trình chuẩn ISO.
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Tổng văn bản"
              value={stats.total}
              icon={FileText}
              color="bg-indigo-600"
            />
            <StatCard
              label="Chờ xử lý"
              value={stats.pending}
              icon={Clock}
              color="bg-amber-500"
            />
            <StatCard
              label="Đã lưu trữ"
              value={stats.archived}
              icon={Archive}
              color="bg-slate-500"
            />
            <StatCard
              label="Tuần này"
              value={stats.thisWeek}
              icon={CheckCircle2}
              color="bg-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-7xl mx-auto px-6">
        {actionMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircle2 size={16} />
            {actionMessage}
          </div>
        )}

        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mt-0 bg-white dark:bg-slate-900 px-2 sticky top-0 z-10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {/* ══════════ TAB 1 – DOCUMENTS ══════════ */}
          {activeTab === "documents" && (
            <div>
              {/* Filter bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm số hiệu, tiêu đề..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Type filter */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <Filter size={14} className="text-slate-400 mr-1" />
                    {(["ALL", ...docTypes] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filterType === t
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {t === "ALL" ? "Tất cả" : t}
                      </button>
                    ))}
                  </div>

                  {/* Status filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as DocStatus | "Tất cả")
                    }
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Tất cả</option>
                    {docStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={folderFilter}
                    onChange={(e) => setFolderFilter(e.target.value)}
                    className="min-w-[220px] text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Tất cả</option>
                    {DOCUMENT_FOLDERS.map((folder) => (
                      <option key={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document list */}
              {filteredDocs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                  <FileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Không tìm thấy văn bản nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                              {doc.soHieu}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[doc.loai]}`}
                            >
                              {doc.loai}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[doc.trangThai]}`}
                            >
                              {doc.trangThai}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mb-1">
                            {doc.tieuDe}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                            {doc.tomTat}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(doc.ngayBanHanh)}
                            </span>
                            <span className="flex min-w-0 items-center gap-1">
                              <FolderOpen size={12} />
                              <span className="truncate">{doc.folderPath || DOCUMENT_FOLDERS[0]}</span>
                            </span>
                            <span>{doc.nguoiKy}</span>
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              <Tag size={11} className="text-slate-400" />
                              {doc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleView(doc)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                          >
                            <Eye size={13} />
                            Xem
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                            <Download size={13} />
                            Tải
                          </button>
                          <button
                            onClick={() => handleArchive(doc.id)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Archive size={13} />
                            Lưu trữ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB 2 – UPLOAD ══════════ */}
          {activeTab === "upload" && (
            <div className="max-w-2xl mx-auto">
              {formSuccess && (
                <div className="mb-4 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle2 size={16} />
                  Văn bản đã được tạo thành công!
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
                  <Plus size={18} className="text-indigo-500" />
                  Tạo văn bản mới
                </h2>

                <form onSubmit={handleSubmitUpload} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Số hiệu văn bản <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        value={formSoHieu}
                        onChange={(e) => setFormSoHieu(e.target.value)}
                        placeholder="VD: 01/CV-BGH"
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Ngày ban hành <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        value={formNgay}
                        onChange={(e) => setFormNgay(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tiêu đề <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      value={formTieuDe}
                      onChange={(e) => setFormTieuDe(e.target.value)}
                      placeholder="Nhập tiêu đề văn bản..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Loại văn bản
                      </label>
                      <select
                        value={formLoai}
                        onChange={(e) => setFormLoai(e.target.value as DocType)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {docTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Người ký
                      </label>
                      <input
                        value={formNguoiKy}
                        onChange={(e) => setFormNguoiKy(e.target.value)}
                        placeholder="Tên người ký..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Thư mục lưu trữ
                    </label>
                    <select
                      value={formFolder}
                      onChange={(e) => setFormFolder(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {DOCUMENT_FOLDERS.map((folder) => (
                        <option key={folder}>{folder}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Nội dung tóm tắt
                    </label>
                    <textarea
                      value={formTomTat}
                      onChange={(e) => setFormTomTat(e.target.value)}
                      rows={3}
                      placeholder="Mô tả ngắn nội dung văn bản..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tags (phân cách bởi dấu phẩy)
                    </label>
                    <div className="relative">
                      <Tag
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="kế hoạch, năm học, BGH..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* File upload area */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tệp đính kèm
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        handleFileSelect(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                        dragOver
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      }`}
                    >
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={18} />
                          <span className="text-sm font-medium">
                            {uploadedFile.name}
                            <span className="text-xs text-slate-400">
                              ({formatFileSize(uploadedFile.size)})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setFormError("");
                            }}
                            className="ml-2 text-slate-400 hover:text-rose-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload
                            size={28}
                            className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                          />
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Kéo thả tệp vào đây hoặc{" "}
                            <label className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                              chọn tệp
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handleFileSelect(file);
                                }}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PDF, DOCX, XLSX tối đa 2MB để lưu cục bộ
                          </p>
                        </div>
                      )}
                    </div>
                    {formError && (
                      <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {formError}
                      </p>
                    )}
                  </div>

                  {/* Workflow checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formWorkflow}
                      onChange={(e) => setFormWorkflow(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Gắn vào quy trình phê duyệt (workflow)
                    </span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={15} />
                      Tạo văn bản
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSoHieu("");
                        setFormTieuDe("");
                        setFormNgay("");
                        setFormNguoiKy("");
                        setFormTomTat("");
                        setFormTags("");
                        setFormFolder(DOCUMENT_FOLDERS[0]);
                        setUploadedFile(null);
                      }}
                      className="px-5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm rounded-xl transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════ TAB 3 – WORKFLOW ══════════ */}
          {activeTab === "workflow" && (
            <div>
              {/* Pipeline header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 mb-5">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-500" />
                  Quy trình chuẩn ISO
                </h2>
                <div className="flex items-center gap-0 overflow-x-auto">
                  {ALL_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center min-w-[110px]">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-center whitespace-nowrap">
                          {step}
                        </span>
                      </div>
                      {i < ALL_STEPS.length - 1 && (
                        <ChevronRight
                          size={18}
                          className="text-slate-300 dark:text-slate-700 flex-shrink-0 -mx-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow items */}
              <div className="space-y-4">
                {MOCK_WORKFLOWS.map((wf) => (
                  <div
                    key={wf.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                            {wf.soHieu}
                          </span>
                          {wf.overdue && (
                            <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                              <AlertTriangle size={11} />
                              Quá hạn
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {wf.documentTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>Phụ trách: {wf.assignee}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            SLA: {wf.sla}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                          Bước hiện tại
                        </p>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                          {wf.currentStep}
                        </span>
                      </div>
                    </div>

                    {/* Step progress */}
                    <div className="flex items-center gap-0">
                      {ALL_STEPS.map((step, i) => {
                        const done = i < wf.stepsCompleted;
                        const active = i === wf.stepsCompleted;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                  done
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : active
                                    ? wf.overdue
                                      ? "bg-rose-100 border-rose-500 text-rose-600 dark:bg-rose-900/30"
                                      : "bg-indigo-100 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30"
                                    : "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                                }`}
                              >
                                {done ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              <span
                                className={`text-xs mt-1 text-center whitespace-nowrap ${
                                  done
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : active
                                    ? wf.overdue
                                      ? "text-rose-600 dark:text-rose-400 font-semibold"
                                      : "text-indigo-600 dark:text-indigo-400 font-semibold"
                                    : "text-slate-400 dark:text-slate-600"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                            {i < ALL_STEPS.length - 1 && (
                              <div
                                className={`h-0.5 flex-1 mx-1 rounded ${
                                  i < wf.stepsCompleted
                                    ? "bg-emerald-400"
                                    : "bg-slate-200 dark:bg-slate-800"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 4 – ARCHIVE ══════════ */}
          {activeTab === "archive" && (
            <div>
              {/* Archive filters */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Archive
                    size={15}
                    className="text-slate-400"
                  />
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                      Năm:
                    </label>
                    <select
                      value={archiveYear}
                      onChange={(e) => setArchiveYear(e.target.value)}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Tất cả</option>
                      <option>2026</option>
                      <option>2025</option>
                      <option>2024</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                      Loại:
                    </label>
                    <select
                      value={archiveType}
                      onChange={(e) =>
                        setArchiveType(e.target.value as DocType | "Tất cả")
                      }
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Tất cả</option>
                      {docTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    {archivedDocs.length} văn bản lưu trữ
                  </span>
                </div>
              </div>

              {archivedDocs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                  <Archive size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Không có văn bản lưu trữ nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {doc.soHieu}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[doc.loai]}`}
                            >
                              {doc.loai}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Lưu trữ
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate mb-1">
                            {doc.tieuDe}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {formatDate(doc.ngayBanHanh)}
                            </span>
                            <span className="flex min-w-0 items-center gap-1">
                              <FolderOpen size={11} />
                              <span className="truncate">{doc.folderPath || DOCUMENT_FOLDERS[0]}</span>
                            </span>
                            <span>{doc.nguoiKy}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleView(doc)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                          >
                            <Eye size={13} />
                            Xem
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Download size={13} />
                            Tải
                          </button>
                          <button
                            onClick={() => handleRestore(doc.id)}
                            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                            <RotateCcw size={13} />
                            Khôi phục
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedDocument(null)}
            aria-hidden="true"
          />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {selectedDocument.soHieu}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[selectedDocument.loai]}`}>
                    {selectedDocument.loai}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedDocument.trangThai]}`}>
                    {selectedDocument.trangThai}
                  </span>
                </div>
                <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                  {selectedDocument.tieuDe}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Ban hành {formatDate(selectedDocument.ngayBanHanh)} · Người ký: {selectedDocument.nguoiKy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                  Tóm tắt nội dung
                </h3>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedDocument.tomTat || "Chưa có tóm tắt nội dung."}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-400">Tệp đính kèm</span>
                  <strong className="mt-1 block truncate text-slate-800 dark:text-slate-100">
                    {selectedDocument.fileName || "Chưa có file gốc"}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-400">Dung lượng</span>
                  <strong className="mt-1 block text-slate-800 dark:text-slate-100">
                    {formatFileSize(selectedDocument.fileSize)}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-400">Thư mục</span>
                  <strong className="mt-1 block truncate text-slate-800 dark:text-slate-100">
                    {selectedDocument.folderPath || DOCUMENT_FOLDERS[0]}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-400">Lưu trữ</span>
                  <strong className="mt-1 block text-slate-800 dark:text-slate-100">
                    {selectedDocument.archivedAt ? "Đã lưu trữ" : "Đang hoạt động"}
                  </strong>
                </div>
              </div>

              {selectedDocument.fileDataUrl ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedDocument.fileType?.startsWith("image/") ? (
                    <img
                      src={selectedDocument.fileDataUrl}
                      alt={selectedDocument.fileName || selectedDocument.tieuDe}
                      className="max-h-[420px] w-full object-contain bg-slate-100 dark:bg-slate-950"
                    />
                  ) : selectedDocument.fileType === "application/pdf" || selectedDocument.fileType?.startsWith("text/") ? (
                    <iframe
                      src={selectedDocument.fileDataUrl}
                      title={selectedDocument.tieuDe}
                      className="h-[420px] w-full bg-white"
                    />
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      Trình duyệt không hỗ trợ xem trực tiếp loại tệp này. Vui lòng tải xuống để mở bằng phần mềm phù hợp.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Văn bản mẫu chưa có file gốc. Nút tải xuống sẽ xuất file thông tin dạng TXT.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
              {selectedDocument.trangThai !== "Lưu trữ" && (
                <button
                  type="button"
                  onClick={() => {
                    handleArchive(selectedDocument.id);
                    setSelectedDocument((prev) =>
                      prev ? { ...prev, trangThai: "Lưu trữ", archivedAt: new Date().toISOString() } : prev
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Archive size={14} />
                  Lưu trữ
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDownload(selectedDocument)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Download size={14} />
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

