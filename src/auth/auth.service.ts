import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import HashUtils from '../utils/hash.utils';
import { AccessRefreshPair, JwtData } from './auth.interface';
export interface TemporalHash {
  timestamp: Date;
  hash: string;
  original: string;
  address: string;
}

@Injectable()
export class AuthService {
  private temporalHashes: Map<string, TemporalHash> = new Map();
  private refreshTokenByAddress: Map<string, string> = new Map();

  private readonly authSecretKey: string;

  constructor(private jwt: JwtService) {
    this.authSecretKey = process.env.AUTH_SECRET_KEY;
  }

  createTemporalHash(id: string, address: string): string {
    const original = uuid();
    const hash = crypto.createHash('sha256').update(original).digest('base64');

    this.temporalHashes.set(id, {
      timestamp: new Date(),
      original,
      hash,
      address,
    });

    return hash;
  }

  async getVerifiedAddress(
    signature: string,
    clientId: string,
  ): Promise<string> {
    const hashData = this.temporalHashes.get(clientId);

    if (!hashData) {
      throw new BadRequestException('NO_TEMPORAL_HASH');
    }

    this.temporalHashes.delete(clientId);

    const confirmedAddres = HashUtils.getAddressFromHash(
      signature,
      hashData.hash,
    );

    if (hashData.address.toLowerCase() !== confirmedAddres) {
      throw new Error('Invalid Address');
    }

    return confirmedAddres;
  }

  getAccessToken(address: string): string {
    const jwtData: JwtData = { address };

    return this.jwt.sign(jwtData, {
      secret: this.authSecretKey,
      expiresIn: '10m',
    });
  }

  getRefeshToken(address: string): string {
    const jwtData: JwtData = { address };

    const refreshToken = this.jwt.sign(jwtData, {
      secret: this.authSecretKey,
      expiresIn: '6h',
    });

    this.refreshTokenByAddress.set(address, refreshToken);

    return refreshToken;
  }

  decodeToken(token): JwtData {
    return this.jwt.decode(token) as JwtData;
  }

  refreshSession(refreshToken: string): AccessRefreshPair {
    let jwtData: JwtData;

    try {
      jwtData = this.jwt.decode(refreshToken) as JwtData;
    } catch (error) {
      throw new BadRequestException('INVALID_TOKEN_EXPIRED');
    }

    const currentRefreshForAddress = this.refreshTokenByAddress.get(
      jwtData.address,
    );

    if (currentRefreshForAddress !== refreshToken) {
      throw new BadRequestException('INVALID_TOKEN_EXPIRED');
    }

    return {
      accessToken: this.getAccessToken(jwtData.address),
      refreshToken: this.getRefeshToken(jwtData.address),
    };
  }

  logout(address: string, refreshToken: string) {
    if (refreshToken !== this.refreshTokenByAddress.get(address)) {
      throw new BadRequestException('INVALID_REFRESH_TOKEN');
    }

    this.refreshTokenByAddress.delete(address);
  }
}
