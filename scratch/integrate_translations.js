import fs from 'fs';

// Helper to replace text in file
function updateFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [target, replacement] of replacements) {
        content = content.replace(target, replacement);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully updated ${filePath}`);
    } else {
        console.log(`No changes made to ${filePath} (targets might have mismatched)`);
    }
}

// 1. Update App.tsx
const appTsx = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\App.tsx";
const appReplacements = [
    // Import useLanguage
    [
        `import React, { useState, useEffect, useRef } from 'react';`,
        `import React, { useState, useEffect, useRef } from 'react';\nimport { useLanguage } from './context/LanguageContext';`
    ],
    // Call useLanguage in App component
    [
        `export default function App() {`,
        `export default function App() {\n  const { lang, setLang, t } = useLanguage();`
    ],
    // Add Language Toggle button before Dark Mode toggle
    [
        `{/* Dark Mode Toggle */}`,
        `{/* Language Toggle */}\n          <button\n            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}\n            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 text-[10px] font-extrabold focus:outline-none no-print"\n            title={lang === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}\n            type="button"\n          >\n            <span>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>\n          </button>\n\n          {/* Dark Mode Toggle */}`
    ],
    // Translate Sidebar active/inactive text
    [
        `<span>MIS LMS Portal</span>`,
        `<span>{t('lms')}</span>`
    ],
    [
        `<span>Học vụ &amp; Giáo án</span>`,
        `<span>{t('academic')}</span>`
    ],
    [
        `<span>Vận hành &amp; Thiết bị</span>`,
        `<span>{t('logistics')}</span>`
    ],
    [
        `<span>Nhân sự &amp; Phép</span>`,
        `<span>{t('hrm')}</span>`
    ],
    [
        `<span>Đề xuất &amp; Phê duyệt</span>`,
        `<span>{t('requests')}</span>`
    ],
    // Translate Sidebar overview/categories labels
    [
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 px-3">Tổng quan</p>`,
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 px-3">{t('overview')}</p>`
    ],
    [
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 px-3">Vận hành học đường</p>`,
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 px-3">{t('schoolOps')}</p>`
    ],
    [
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Không gian làm việc</p>`,
        `<p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">{t('workspace')}</p>`
    ],
    // Translate Sidebar general links
    [
        `<span>Bảng điều khiển</span>`,
        `<span>{t('dashboard')}</span>`
    ],
    [
        `<span>Lịch công tác</span>`,
        `<span>{t('schedule')}</span>`
    ],
    [
        `<span>Báo cáo tiến độ (Bảng)</span>`,
        `<span>{t('progressReport')}</span>`
    ],
    // Translate Header Tabs
    [
        `Nhiệm vụ &amp; Chỉ đạo`,
        `{t('tasks')}`
    ],
    [
        `Đa Trí Tuệ &amp; OKRs`,
        `{t('intelligence')}`
    ],
    [
        `MIS LMS Portal`,
        `{t('lms')}`
    ],
    [
        `Học Vụ &amp; Giáo Án`,
        `{t('academic')}`
    ],
    [
        `Vận Hành &amp; Thiết Bị`,
        `{t('logistics')}`
    ],
    [
        `Nhân Sự &amp; Phép`,
        `{t('hrm')}`
    ],
    [
        `Đề Xuất &amp; Phê Duyệt`,
        `{t('requests')}`
    ]
];

updateFile(appTsx, appReplacements);

// 2. Update AcademicOperations.tsx
const academicTsx = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\AcademicOperations.tsx";
const academicReplacements = [
    [
        `import React, { useState, useEffect } from 'react';`,
        `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';`
    ],
    [
        `export default function AcademicOperations({ currentUser, users }: AcademicOperationsProps) {`,
        `export default function AcademicOperations({ currentUser, users }: AcademicOperationsProps) {\n  const { t } = useLanguage();`
    ],
    [
        `Thời Khóa Biểu &amp; Lịch Báo Giảng`,
        `{t('academicHeader')}`
    ],
    [
        `Phân hệ quản trị đào tạo hỗ trợ giáo viên theo dõi lịch báo giảng cá nhân, đồng thời nộp và thẩm định giáo án điện tử tự động qua sơ đồ phân quyền BGH / Tổ trưởng.`,
        `{t('academicDesc')}`
    ],
    [
        `Thời Khóa Biểu Giảng Dạy`,
        `{t('timetable')}`
    ],
    [
        `Duyệt Giáo Án Học Thuật`,
        `{t('lessonPlanApproval')}`
    ],
    [
        `Nộp giáo án mới`,
        `{t('submitPlan')}`
    ]
];
updateFile(academicTsx, academicReplacements);

// 3. Update SchoolLogistics.tsx
const logisticsTsx = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\SchoolLogistics.tsx";
const logisticsReplacements = [
    [
        `import React, { useState, useEffect } from 'react';`,
        `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';`
    ],
    [
        `export default function SchoolLogistics({ currentUser }: SchoolLogisticsProps) {`,
        `export default function SchoolLogistics({ currentUser }: SchoolLogisticsProps) {\n  const { t } = useLanguage();`
    ],
    [
        `Vận Hành &amp; Thiết Bị Học Đường`,
        `{t('logisticsHeader')}`
    ],
    [
        `Phân hệ hậu cần hỗ trợ giáo viên đăng ký lịch sử dụng phòng máy, Lab STEM/AI phục vụ thực nghiệm giảng dạy, và gửi báo cáo sự cố cơ sở vật chất trực tiếp tới tổ Hành chính Vận hành.`,
        `{t('logisticsDesc')}`
    ],
    [
        `Đặt Lịch Phòng Chức Năng`,
        `{t('roomBooking')}`
    ],
    [
        `Báo Hỏng Thiết Bị &amp; Bảo Trì`,
        `{t('maintenance')}`
    ]
];
updateFile(logisticsTsx, logisticsReplacements);

// 4. Update HrmCenter.tsx
const hrmTsx = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\HrmCenter.tsx";
const hrmReplacements = [
    [
        `import React, { useState, useEffect } from 'react';`,
        `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';`
    ],
    [
        `export default function HrmCenter({ currentUser, users, onUpdateUsers }: HrmCenterProps) {`,
        `export default function HrmCenter({ currentUser, users, onUpdateUsers }: HrmCenterProps) {\n  const { t } = useLanguage();`
    ],
    [
        `Cổng Nhân Sự &amp; Phép Giáo Viên`,
        `{t('hrmHeader')}`
    ],
    [
        `Quản lý nghỉ giảng dạy trực tuyến, tự động đề xuất phân công dạy thay dựa trên đối chiếu Thời khóa biểu chuyên môn và số hóa hồ sơ chứng chỉ giáo viên.`,
        `{t('hrmDesc')}`
    ],
    [
        `Đề xuất dạy thế tự động`,
        `{t('substituteTeacher')}`
    ],
    [
        `Đăng ký nghỉ phép`,
        `{t('leaveRequest')}`
    ],
    [
        `Hồ Sơ Năng Lực &amp; Bằng Cấp`,
        `{t('certifications')}`
    ]
];
updateFile(hrmTsx, hrmReplacements);

// 5. Update SchoolRequests.tsx
const requestsTsx = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\SchoolRequests.tsx";
const requestsReplacements = [
    [
        `import React, { useState, useEffect } from 'react';`,
        `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';`
    ],
    [
        `export default function SchoolRequests({ currentUser }: SchoolRequestsProps) {`,
        `export default function SchoolRequests({ currentUser }: SchoolRequestsProps) {\n  const { t } = useLanguage();`
    ],
    [
        `Cổng Đề Xuất &amp; Phê Duyệt Học Đường`,
        `{t('requestsHeader')}`
    ],
    [
        `Giải quyết nhanh chóng các đề xuất hành chính, tài chính văn phòng phẩm, sự kiện ngoại khóa và cơ sở vật chất. Số hóa quy trình duyệt văn bản nhanh giữa Giáo viên và Ban Giám hiệu / Kế toán.`,
        `{t('requestsDesc')}`
    ]
];
updateFile(requestsTsx, requestsReplacements);

console.log("All localization updates applied!");
