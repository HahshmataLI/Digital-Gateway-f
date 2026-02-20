// export interface TransactionDetails {
//   reference?: string;
//   bankName?: string;
//   cardLastFour?: string;
//   upiId?: string;
//   chequeNumber?: string;
//   chequeDate?: Date;
// }

// export interface Payment {
//   _id: string;
//   paymentNumber: string;
//   enrollment: string | any;
//   amount: number;
//   paymentDate: Date;
//   paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
//   transactionDetails?: TransactionDetails;
//   status: 'success' | 'pending' | 'failed' | 'refunded';
//   remarks?: string;
//   receivedBy: string | any;
//   receiptNumber?: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface CreatePaymentRequest {
//   enrollment: string;
//   amount: number;
//   paymentDate?: Date;
//   paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
//   transactionDetails?: TransactionDetails;
//   status?: 'success' | 'pending' | 'failed' | 'refunded';
//   remarks?: string;
// }

// export interface PaymentFilter {
//   enrollment?: string;
//   status?: string;
//   paymentMode?: string;
//   startDate?: Date;
//   endDate?: Date;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export interface Receipts {
//   receiptNumber: string;
//   paymentNumber: string;
//   date: Date;
//   student: {
//     name: string;
//     email: string;
//     phone: string;
//     address?: string;
//   };
//   course: {
//     name: string;
//     code: string;
//   };
//   amount: number;
//   amountInWords: string;
//   paymentMode: string;
//   transactionReference?: string;
//   receivedBy: string;
//   timestamp: string;
// }
export interface TransactionDetails {
  reference?: string;
  bankName?: string;
  cardLastFour?: string;
  upiId?: string;
  chequeNumber?: string;
  chequeDate?: Date;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  enrollment: string | any;
  amount: number;
  paymentDate: Date;
  paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
  transactionDetails?: TransactionDetails;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  remarks?: string;
  receivedBy: string | any;
  receiptNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  enrollment: string;
  amount: number;
  paymentDate?: Date;
  paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
  transactionDetails?: TransactionDetails;
  status?: 'success' | 'pending' | 'failed' | 'refunded';
  remarks?: string;
}

export interface PaymentFilter {
  enrollment?: string;
  status?: string;
  paymentMode?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Receipts {
  receiptNumber: string;
  paymentNumber: string;
  date: Date;
  student: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  course: {
    name: string;
    code: string;
  };
  amount: number;
  amountInWords: string;
  paymentMode: string;
  transactionReference?: string;
  receivedBy: string;
  timestamp: string;
}

export interface PaymentSummary {
  totalAmount: number;
  totalCount: number;
  avgAmount: number;
  maxAmount: number;
  minAmount: number;
}