'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Save, Sliders, Users, Bus, Utensils, ShieldCheck, Plus, MapPin, Route, Clock, FileText, AlertTriangle, Settings, CarFront, CheckCircle2 } from 'lucide-react';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cấu Hình Dịch Vụ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tham số, phân quyền và quy trình phê duyệt của khối Dịch vụ Học đường.
          </p>
        </div>
        <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Save className="mr-2 h-4 w-4" />
          Lưu cấu hình
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div 
            onClick={() => setActiveTab('general')}
            className={`p-3 font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'general' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <Sliders className="h-4 w-4" /> Cấu hình chung
          </div>
          <div 
            onClick={() => setActiveTab('permissions')}
            className={`p-3 font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'permissions' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <Users className="h-4 w-4" /> Phân quyền Nhân sự
          </div>
          <div 
            onClick={() => setActiveTab('approval')}
            className={`p-3 font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'approval' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <ShieldCheck className="h-4 w-4" /> Quy trình Phê duyệt
          </div>
          <div 
            onClick={() => setActiveTab('meals')}
            className={`p-3 font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'meals' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <Utensils className="h-4 w-4" /> Tham số Bếp ăn
          </div>
          <div 
            onClick={() => setActiveTab('transport')}
            className={`p-3 font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'transport' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <Bus className="h-4 w-4" /> Tham số Xe đưa đón
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Thời gian chốt dịch vụ hằng ngày</CardTitle>
                  <CardDescription>Quy định mốc thời gian hệ thống tự động khóa đăng ký/hủy dịch vụ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="meal-cutoff">Giờ chốt Suất ăn (Báo hủy/Đăng ký thêm)</Label>
                      <Input id="meal-cutoff" type="time" defaultValue="08:00" />
                      <p className="text-xs text-slate-500">Sau thời gian này, bếp sẽ bắt đầu chuẩn bị thực phẩm.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport-cutoff">Giờ chốt Xe đưa đón (Chiều về)</Label>
                      <Input id="transport-cutoff" type="time" defaultValue="14:30" />
                      <p className="text-xs text-slate-500">Phụ huynh báo đón sớm phải trước giờ này.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quy định Ticket Phản ánh</CardTitle>
                  <CardDescription>SLA (Thời gian cam kết xử lý) cho các ticket hỗ trợ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sla-urgent">Mức độ: Khẩn cấp (Giờ)</Label>
                      <Input id="sla-urgent" type="number" defaultValue="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sla-high">Mức độ: Cao (Giờ)</Label>
                      <Input id="sla-high" type="number" defaultValue="8" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sla-normal">Mức độ: Bình thường (Giờ)</Label>
                      <Input id="sla-normal" type="number" defaultValue="24" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cảnh báo & Tự động</CardTitle>
                  <CardDescription>Thiết lập tự động hóa trong quản lý dịch vụ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Auto-assign Ticket Y tế</Label>
                      <p className="text-sm text-slate-500">Tự động phân công ticket loại Y tế cho Trưởng phòng Y tế trực ca.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <Label className="text-base font-medium">Cảnh báo tồn kho Đồng phục</Label>
                      <p className="text-sm text-slate-500">Gửi thông báo khi số lượng size bất kỳ dưới 20 chiếc.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <Label className="text-base font-medium">Báo cáo Dịch vụ tự động</Label>
                      <p className="text-sm text-slate-500">Gửi báo cáo tổng hợp chi phí và CSAT cho Giám đốc Điều hành vào Thứ 6 hàng tuần.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'permissions' && (
            <Card>
              <CardHeader>
                <CardTitle>Phân quyền Nhân sự</CardTitle>
                <CardDescription>Cấu hình quyền hạn cho các nhân sự thuộc khối dịch vụ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg text-center text-slate-500">
                  <p>Tính năng đang được phát triển. Vui lòng quay lại sau.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'approval' && (
            <Card>
              <CardHeader>
                <CardTitle>Quy trình Phê duyệt</CardTitle>
                <CardDescription>Thiết lập luồng duyệt cho các dịch vụ và đề xuất</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg text-center text-slate-500">
                  <p>Hệ thống luồng duyệt đang được tích hợp. Vui lòng quay lại sau.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'meals' && (
            <Card>
              <CardHeader>
                <CardTitle>Tham số Bếp ăn</CardTitle>
                <CardDescription>Quản lý định mức, giá suất ăn và thiết lập thực đơn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg text-center text-slate-500">
                  <p>Tính năng quản lý bếp ăn đang được nâng cấp.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Tham số Xe đưa đón</h3>
                  <p className="text-sm text-slate-500">Quản lý trung tâm điều hành dịch vụ xe bus học đường.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                    <Settings className="w-4 h-4 mr-2" />
                    Cấu hình phí
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo tuyến mới
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="routes" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="routes">Tuyến & Điểm đón</TabsTrigger>
                  <TabsTrigger value="vehicles">Xe & Nhân sự</TabsTrigger>
                  <TabsTrigger value="students">Học sinh đăng ký</TabsTrigger>
                  <TabsTrigger value="fees">Phí dịch vụ</TabsTrigger>
                  <TabsTrigger value="schedule">Lịch & An toàn</TabsTrigger>
                </TabsList>
                
                <TabsContent value="routes" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Danh sách Tuyến xe hoạt động</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                              <TableHead>Mã Tuyến</TableHead>
                              <TableHead>Tên Tuyến</TableHead>
                              <TableHead>Chiều đi/về</TableHead>
                              <TableHead>Số điểm đón</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">BUS-01</TableCell>
                              <TableCell>KĐT Ecopark - Trường</TableCell>
                              <TableCell>Cả 2 chiều</TableCell>
                              <TableCell>5 điểm</TableCell>
                              <TableCell><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20">Hoạt động</Badge></TableCell>
                              <TableCell className="text-right"><Button variant="ghost" size="sm">Chi tiết</Button></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">BUS-02</TableCell>
                              <TableCell>Times City - Trường</TableCell>
                              <TableCell>Cả 2 chiều</TableCell>
                              <TableCell>3 điểm</TableCell>
                              <TableCell><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20">Hoạt động</Badge></TableCell>
                              <TableCell className="text-right"><Button variant="ghost" size="sm">Chi tiết</Button></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">BUS-03</TableCell>
                              <TableCell>Royal City - Trường</TableCell>
                              <TableCell>Chỉ chiều về</TableCell>
                              <TableCell>4 điểm</TableCell>
                              <TableCell><Badge variant="outline" className="text-amber-600 border-amber-200">Tạm dừng</Badge></TableCell>
                              <TableCell className="text-right"><Button variant="ghost" size="sm">Chi tiết</Button></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vehicles" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quản lý Đội xe & Nhân sự</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                              <CarFront className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">29 Xe đưa đón</h4>
                              <p className="text-sm text-slate-500">100% đạt chuẩn kiểm định</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full text-sm">Quản lý Xe</Button>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">32 Tài xế & Phụ xe</h4>
                              <p className="text-sm text-slate-500">Đã gán 29/32 nhân sự vào tuyến</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full text-sm">Phân công Nhân sự</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="students" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Học sinh Đăng ký Dịch vụ</CardTitle>
                      <CardDescription>Thống kê số lượng học sinh sử dụng dịch vụ xe đưa đón</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                              <TableHead>Cơ sở</TableHead>
                              <TableHead>Học sinh đăng ký</TableHead>
                              <TableHead>Tuyến chờ duyệt</TableHead>
                              <TableHead className="text-right">Tỷ lệ lấp đầy</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Cơ sở Chính</TableCell>
                              <TableCell>452</TableCell>
                              <TableCell><Badge variant="secondary">12 chờ</Badge></TableCell>
                              <TableCell className="text-right">85%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Cơ sở Tiểu học</TableCell>
                              <TableCell>310</TableCell>
                              <TableCell><Badge variant="secondary">5 chờ</Badge></TableCell>
                              <TableCell className="text-right">92%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fees" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mb-4" />
                        <h4 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có cấu hình biểu phí</h4>
                        <p className="text-slate-500 mt-2 max-w-md">Hãy thiết lập biểu phí theo km hoặc theo khu vực để hệ thống tự động tính toán chi phí cho học sinh.</p>
                        <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Thiết lập Biểu phí</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          Lịch vận hành chung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-400">Giờ xe xuất phát (Sáng)</span>
                            <span className="font-medium">06:30</span>
                          </li>
                          <li className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-400">Giờ xe rời trường (Chiều)</span>
                            <span className="font-medium">16:45</span>
                          </li>
                          <li className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Lịch chạy ngoại khóa (Thứ 7)</span>
                            <Badge variant="outline">Tùy chọn</Badge>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Quy tắc An toàn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-slate-900 dark:text-slate-100">Bắt buộc điểm danh App</p>
                              <p className="text-slate-500">Phụ xe phải scan QR hoặc điểm danh qua App khi học sinh lên/xuống.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-slate-900 dark:text-slate-100">Gửi SMS tự động</p>
                              <p className="text-slate-500">Gửi tin nhắn cho PH trước 15p khi xe đến điểm đón.</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
