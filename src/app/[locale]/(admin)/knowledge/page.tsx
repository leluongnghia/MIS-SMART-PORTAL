import KnowledgeManagement from '../../../../components/KnowledgeManagement';

export const metadata = {
  title: 'Kho Tri Thức & Văn Bản | MIS Smart Portal',
  description: 'Quản lý tài liệu, biểu mẫu, quy trình SOP và tri thức.',
};

export default function KnowledgePage() {
  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <KnowledgeManagement />
    </div>
  );
}
