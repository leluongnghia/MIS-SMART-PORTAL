/**
 * Xuất dữ liệu mảng thành file CSV có UTF-8 BOM để Microsoft Excel không bị lỗi font tiếng Việt.
 */
export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Thêm BOM (Byte Order Mark) để Excel nhận dạng đúng bảng mã UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
