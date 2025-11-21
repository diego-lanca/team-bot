export interface Contract {
  id: string;
  event: 'myeduzz.contract_created' | 'myeduzz.contract_updated';
  data: ContractData;
  sentDate: string;
}

export interface ContractData {
  producer: ContractProducer;
  products: ContractProduct[];
  contract: ContractDetails;
  customer: ContractCustomer;
  financialResponsible: ContractFinancialResponsible;
  reason: string;
}

export interface ContractProducer {
  id: string;
  name: string;
  email: string;
}

export interface ContractProduct {
  id: string;
  name: string;
  deliveries: Array<'file' | 'external' | 'nutror' | 'alpaclass'>;
  plan: {
    id: string | null;
    name: string | null;
  };
  price: ContractPrice;
  membershipFee: ContractPrice;
}

export interface ContractPrice {
  currency: 'BRL' | string;
  value: number;
}

export interface ContractDetails {
  id: string;
  payment: ContractPayment;
  status:
    | 'upToDate'
    | 'awaitingPayment'
    | 'late'
    | 'canceled'
    | 'defaulter'
    | 'suspended'
    | 'trial'
    | 'finished'
    | 'free';
  trialDays: number;
  createdAt: string;
  updatedAt: string;
  contentAccess: {
    removeOnContractEnd: boolean;
    removeOnLatePayment: boolean;
  };
  isUnlimitedInstallments: boolean;
  recurrence: ContractRecurrence;
}

export interface ContractPayment {
  method: 'creditCard' | 'pix' | 'boleto' | 'paypal' | string;
  totalOfInstallments: number;
}

export interface ContractRecurrence {
  startsAt: string;
  nextDue: string;
  currentDue: string;
  lastDue: string;
  finishesAt: string;
  frequency: {
    type: 'month' | 'year' | 'week' | string;
    value: number;
  };
  charges: {
    total: number;
    current: number;
  };
  isFinite: boolean;
  price: ContractPrice;
}

export interface ContractCustomer {
  name: string;
  email: string;
  phone: ContractPhone;
}

export interface ContractFinancialResponsible {
  name: string;
  email: string;
  phone: ContractPhone;
}

export interface ContractPhone {
  countryCode: string;
  areaCode: string;
  number: string;
}
