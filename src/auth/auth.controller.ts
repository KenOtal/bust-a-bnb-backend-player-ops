import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { User } from 'src/decorators/user.decorator';
import { Profile } from 'src/funds-manager/funds-manager.interfaces';
import { FundsManagerService } from 'src/funds-manager/funds-manager.service';
import {
  AccessRefreshPair,
  JwtData,
  RefreshRequestBody,
  Signature,
  User as UserType,
  VerifyResponse,
} from './auth.interface';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fundsService: FundsManagerService,
    private readonly adminService: AdminService,
  ) {}
  @Post('/:socketId/challenge')
  async getChallengeString(
    @Param('socketId') socketId: string,
    @Body() { address }: JwtData,
  ): Promise<string> {
    const isAllowListEnabled = process.env.ALLOW_LIST_ENABLED === 'true';

    if (isAllowListEnabled) {
      await this.adminService.verifyIfAddressIsAllowed(address.toLowerCase());
    }

    const hash = this.authService.createTemporalHash(socketId, address);

    return hash;
  }

  @Post('/:socketId/verify')
  async vefiryWallet(
    @Param('socketId') socketId: string,
    @Body() body: Signature,
  ): Promise<VerifyResponse> {
    const verifiedAddress = await this.authService.getVerifiedAddress(
      body.signature,
      socketId,
    );

    const isAllowListEnabled = process.env.ALLOW_LIST_ENABLED === 'true';

    if (isAllowListEnabled) {
      await this.adminService.verifyIfAddressIsAllowed(
        verifiedAddress.toLowerCase(),
      );
    }

    const accessToken = this.authService.getAccessToken(verifiedAddress);
    const refreshToken = this.authService.getRefeshToken(verifiedAddress);

    const { data: currentBalance } = await this.fundsService.connect(
      verifiedAddress,
    );

    return {
      ...currentBalance,
      accessToken,
      refreshToken,
    };
  }

  @Post('/refresh')
  async refreshSession(
    @Body() payload: RefreshRequestBody,
  ): Promise<AccessRefreshPair> {
    const { accessToken, refreshToken } = this.authService.refreshSession(
      payload.refreshToken,
    );

    const jwtData = this.authService.decodeToken(refreshToken);

    await this.adminService.verifyIfAddressIsAllowed(
      jwtData.address.toLowerCase(),
    );

    return { accessToken, refreshToken };
  }

  @Post('/logout')
  logout(@User() user: UserType, @Body() payload: RefreshRequestBody): void {
    this.authService.logout(user.address, payload.refreshToken);
  }

  @Get('/me')
  async getProfile(@User() user: UserType): Promise<Profile> {
    const { data } = await this.fundsService.connect(user.address);

    return {
      ...data,
      address: user.address,
    };
  }
}
