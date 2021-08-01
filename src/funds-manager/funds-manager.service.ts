import { Injectable } from '@nestjs/common';
import {
  ConnectResponse,
  CurrentBalance,
  NewOperationRequest,
} from './funds-manager.interfaces';
import Axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { BetsService } from '../bets/bets.service';
import { WithdrawalRequestBody } from 'src/hooks/hooks.interfaces';

@Injectable()
export class FundsManagerService {
  foundsManagerUrl: string;
  private readonly apiClient: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly betsService: BetsService,
  ) {
    const baseURL: string = this.configService.get<string>('FUNDS_MANAGER_URL');

    if (!baseURL) {
      throw 'MISSING_FUNDS_MANAGER_URL';
    }

    this.apiClient = Axios.create({
      baseURL,
    });
  }

  connect(addressId: string) {
    return this.apiClient.post<ConnectResponse>(
      `/balances/${addressId}/connect`,
    );
  }

  async dispatchEvent(addressId: string, body: NewOperationRequest) {
    const { data } = await this.apiClient.post<CurrentBalance>(
      `/balances/${addressId}/operations`,
      body,
    );

    return data;
  }

  async withdrawalRequest(
    addressId: string,
    withdrawalRequestBody: WithdrawalRequestBody,
  ) {
    const { data } = await this.apiClient.post<CurrentBalance>(
      `/balances/${addressId}/withdrawal`,
      withdrawalRequestBody,
    );

    return data;
  }
}
