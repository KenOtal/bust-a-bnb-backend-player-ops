import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AllowListDocument } from './schema/allowList.schema';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/allow-list/:address')
  saveAllowedAddress(
    @Param('address') address: string,
  ): Promise<AllowListDocument> {
    return this.adminService.createAllowAddress(address.toLowerCase());
  }

  @Delete('/allow-list/:address')
  deleteAllowedAddress(
    @Param('address') address: string,
  ): Promise<AllowListDocument> {
    return this.adminService.deleteAllowAddress(address.toLowerCase());
  }

  @Get('/allow-list')
  getAllowList(): Promise<AllowListDocument[]> {
    return this.adminService.getAllowAddressList();
  }
}
