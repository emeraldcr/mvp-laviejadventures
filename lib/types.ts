export type ContactInfo = {
whatsapp: string;
email: string;
youtube: string;
facebook: string;
twitter: string;
instagram: string;
};


export type TourInfo = {
name: string;
duration: string;
price: string;
inclusions: string[];
exclusions: string[];
cancellationPolicy?: string;
location: string;   
operator: string;
details: string;
restrictions: string;
contact: ContactInfo;
};

export interface PayPalCapture {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  payments?: {
    captures?: PayPalCapture[];
  };
}

export interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: PayPalPurchaseUnit[];
}


export type AvailabilityMap = Record<number, number>;