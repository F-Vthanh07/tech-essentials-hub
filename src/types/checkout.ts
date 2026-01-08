export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string;
  deliveryDate: Date | undefined;
  deliveryTime: string;
  paymentMethod: string;
  isCompanyInvoice: boolean;
  companyName: string;
  companyTaxCode: string;
  companyAddress: string;
}

export interface DeliveryTimeSlot {
  id: string;
  label: string;
  time: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}
