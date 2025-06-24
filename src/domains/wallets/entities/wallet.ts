export interface Wallet {
  id: string
  name: string
  currency: string
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateWalletDTO {
  name: string
  currency?: string
}

export interface UpdateWalletDTO {
  name?: string
  currency?: string
}

export class WalletEntity {
  constructor(private readonly wallet: Wallet) {}

  get id(): string {
    return this.wallet.id
  }

  get name(): string {
    return this.wallet.name
  }

  get balance(): number {
    return this.wallet.balance
  }

  get currency(): string {
    return this.wallet.currency
  }

  addAmount(amount: number): Wallet {
    return {
      ...this.wallet,
      balance: this.wallet.balance + amount,
      updatedAt: new Date(),
    }
  }

  subtractAmount(amount: number): Wallet {
    return {
      ...this.wallet,
      balance: this.wallet.balance - amount,
      updatedAt: new Date(),
    }
  }

  hasInsufficientFunds(amount: number): boolean {
    return this.wallet.balance < amount
  }

  toJSON(): Wallet {
    return { ...this.wallet }
  }
}
