export interface WalletTransfer {
  id: string
  fromWalletId: string
  toWalletId: string
  amount: number
  description: string
  executedAt: Date
  createdAt: Date
}

export interface CreateWalletTransferDTO {
  fromWalletId: string
  toWalletId: string
  amount: number
  description: string
}

export class WalletTransferEntity {
  constructor(private readonly transfer: WalletTransfer) {}

  get id(): string {
    return this.transfer.id
  }

  get fromWalletId(): string {
    return this.transfer.fromWalletId
  }

  get toWalletId(): string {
    return this.transfer.toWalletId
  }

  get amount(): number {
    return this.transfer.amount
  }

  get description(): string {
    return this.transfer.description
  }

  get executedAt(): Date {
    return this.transfer.executedAt
  }

  isValidTransfer(): boolean {
    return this.fromWalletId !== this.toWalletId && this.amount > 0
  }

  toJSON(): WalletTransfer {
    return { ...this.transfer }
  }
}
